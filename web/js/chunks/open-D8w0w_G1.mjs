import { a as ty, P as Zd, b as ny, t as iy, i as sy, T as tl, d as oy, s as gl, f as ry, p as ly, c as ay, e as uy, g as cy, h as hy, j as fy, k as dy, l as mh, m as py, n as gy, I as Qd, o as ml, q as my, r as vy, u as yy, v as by, w as xy, x as wy, R as ky, y as Sy, S as Cy, z as My, N as Ay, A as Ty, B as nl, C as vh, D as $y, E as yh, F as Dy, G as Oy, H as Ly, J as xn, K as Ey, L as By, M as bh, O as Iy, Q as Ry, U as Ta, V as xh, W as wh, X as Py, Y as _y, Z as kh, _ as Sh, $ as $a, a0 as Ny, a1 as Vy, a2 as Ch, a3 as Hy, a4 as Mh } from "./main-DFAqzDW8.mjs";
import { a as Fy, r as zy, n as Wy, e as Da, b as Ky, s as Uy, p as jy } from "./notationExport-DkCMgjck.mjs";
import { lineKey as vl, parseSpans as ep, sameSpans as il, clipOfLines as Ah, partAt as Gy, editRange as Mr, placedLines as Th, settle as qy, withBlockSpans as Yy, parseLineKey as Xy, remapSpans as Jy, followSpans as Zy, partOf as Qy } from "./lyricPlacement-rAf-x_fn.mjs";
import { notesLabel as e0, trackRows as t0, parseGuide as n0, sameGuide as $o, remapGuide as i0, guideNotes as s0 } from "./tracks-DxmZeggM.mjs";
// @__NO_SIDE_EFFECTS__
function gc(n) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const t of n.split(",")) e[t] = 1;
  return (t) => t in e;
}
const lt = {}, bs = [], ks = () => {
}, tp = () => !1, Ul = (n) => n.charCodeAt(0) === 111 && n.charCodeAt(1) === 110 && // uppercase letter
(n.charCodeAt(2) > 122 || n.charCodeAt(2) < 97), jl = (n) => n.startsWith("onUpdate:"), On = Object.assign, np = (n, e) => {
  const t = n.indexOf(e);
  t > -1 && n.splice(t, 1);
}, o0 = Object.prototype.hasOwnProperty, dt = (n, e) => o0.call(n, e), He = Array.isArray, Yi = (n) => gr(n) === "[object Map]", Ti = (n) => gr(n) === "[object Set]", $h = (n) => gr(n) === "[object Date]", ht = (n) => typeof n == "function", It = (n) => typeof n == "string", Fn = (n) => typeof n == "symbol", Ct = (n) => n !== null && typeof n == "object", ip = (n) => (Ct(n) || ht(n)) && ht(n.then) && ht(n.catch), sp = Object.prototype.toString, gr = (n) => sp.call(n), r0 = (n) => gr(n).slice(8, -1), op = (n) => gr(n) === "[object Object]", mc = (n) => It(n) && n !== "NaN" && n[0] !== "-" && "" + parseInt(n, 10) === n, Po = /* @__PURE__ */ gc(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Gl = (n) => {
  const e = /* @__PURE__ */ Object.create(null);
  return ((t) => e[t] || (e[t] = n(t)));
}, l0 = /-\w/g, Mn = Gl(
  (n) => n.replace(l0, (e) => e.slice(1).toUpperCase())
), a0 = /\B([A-Z])/g, Li = Gl(
  (n) => n.replace(a0, "-$1").toLowerCase()
), rp = Gl((n) => n.charAt(0).toUpperCase() + n.slice(1)), Oa = Gl(
  (n) => n ? `on${rp(n)}` : ""
), Ut = (n, e) => !Object.is(n, e), sl = (n, ...e) => {
  for (let t = 0; t < n.length; t++)
    n[t](...e);
}, lp = (n, e, t, i = !1) => {
  Object.defineProperty(n, e, {
    configurable: !0,
    enumerable: !1,
    writable: i,
    value: t
  });
}, ql = (n) => {
  const e = parseFloat(n);
  return isNaN(e) ? n : e;
};
let Dh;
const Yl = () => Dh || (Dh = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Si(n) {
  if (He(n)) {
    const e = {};
    for (let t = 0; t < n.length; t++) {
      const i = n[t], s = It(i) ? f0(i) : Si(i);
      if (s)
        for (const o in s)
          e[o] = s[o];
    }
    return e;
  } else if (It(n) || Ct(n))
    return n;
}
const u0 = /;(?![^(]*\))/g, c0 = /:([^]+)/, h0 = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function f0(n) {
  const e = {};
  return n.replace(h0, (t) => t.startsWith("/*") ? "" : t).split(u0).forEach((t) => {
    if (t) {
      const i = t.split(c0);
      i.length > 1 && (e[i[0].trim()] = i[1].trim());
    }
  }), e;
}
function Xe(n) {
  let e = "";
  if (It(n))
    e = n;
  else if (He(n))
    for (let t = 0; t < n.length; t++) {
      const i = Xe(n[t]);
      i && (e += i + " ");
    }
  else if (Ct(n))
    for (const t in n)
      n[t] && (e += t + " ");
  return e.trim();
}
const d0 = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", p0 = /* @__PURE__ */ gc(d0);
function ap(n) {
  return !!n || n === "";
}
function g0(n, e, t) {
  if (n.length !== e.length) return !1;
  let i = !0;
  for (let s = 0; i && s < n.length; s++)
    i = $i(n[s], e[s], t);
  return i;
}
function Oh(n, e, t) {
  if (n.size !== e.size) return !1;
  const i = Array.from(e), s = new Uint8Array(i.length);
  for (const o of n) {
    let r = -1;
    for (let l = 0; l < i.length; l++)
      if (!s[l] && $i(o, i[l], t)) {
        r = l;
        break;
      }
    if (r < 0) return !1;
    s[r] = 1;
  }
  return !0;
}
function m0(n, e, t) {
  let i = Yi(n), s = Yi(e);
  if (i || s || (i = Ti(n), s = Ti(e), i || s))
    return i && s ? Oh(n, e, t) : !1;
  const o = Object.keys(n).length, r = Object.keys(e).length;
  if (o !== r)
    return !1;
  for (const l in n) {
    const a = n.hasOwnProperty(l), u = e.hasOwnProperty(l);
    if (a && !u || !a && u || !$i(n[l], e[l], t))
      return !1;
  }
  return String(n) === String(e);
}
function Lh(n, e, t, i) {
  t || (t = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
  const [s, o] = t;
  if (s.has(n) || o.has(e))
    return s.get(n) === e && o.get(e) === n;
  s.set(n, e), o.set(e, n);
  const r = i(n, e, t);
  return s.delete(n), o.delete(e), r;
}
function $i(n, e, t) {
  if (n === e) return !0;
  let i = $h(n), s = $h(e);
  return i || s ? i && s ? n.getTime() === e.getTime() : !1 : (i = Fn(n), s = Fn(e), i || s ? n === e : (i = He(n), s = He(e), i || s ? i && s ? Lh(n, e, t, g0) : !1 : (i = Ct(n), s = Ct(e), i || s ? !i || !s ? !1 : Lh(n, e, t, m0) : String(n) === String(e))));
}
function vc(n, e) {
  return n.findIndex((t) => $i(t, e));
}
const up = (n) => !!(n && n.__v_isRef === !0), F = (n) => It(n) ? n : n == null ? "" : He(n) || Ct(n) && (n.toString === sp || !ht(n.toString)) ? up(n) ? F(n.value) : JSON.stringify(n, cp, 2) : String(n), cp = (n, e) => up(e) ? cp(n, e.value) : Yi(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (t, [i, s], o) => (t[La(i, o) + " =>"] = s, t),
    {}
  )
} : Ti(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((t) => La(t))
} : Fn(e) ? La(e) : Ct(e) && !He(e) && !op(e) ? String(e) : e, La = (n, e = "") => {
  var t;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Fn(n) ? `Symbol(${(t = n.description) != null ? t : e})` : n
  );
};
let Wt;
class v0 {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e = !1) {
    this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && Wt && (Wt.active ? (this.parent = Wt, this.index = (Wt.scopes || (Wt.scopes = [])).push(
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
      const t = Wt;
      try {
        return Wt = this, e();
      } finally {
        Wt = t;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = Wt, Wt = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (Wt === this)
        Wt = this.prevScope;
      else {
        let e = Wt;
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
function y0() {
  return Wt;
}
let vt;
const Ea = /* @__PURE__ */ new WeakSet();
class hp {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Wt && (Wt.active ? Wt.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ea.has(this) && (Ea.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || dp(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Eh(this), pp(this);
    const e = vt, t = Hn;
    vt = this, Hn = !0;
    try {
      return this.fn();
    } finally {
      gp(this), vt = e, Hn = t, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        xc(e);
      this.deps = this.depsTail = void 0, Eh(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ea.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    du(this) && this.run();
  }
  get dirty() {
    return du(this);
  }
}
let fp = 0, _o, No;
function dp(n, e = !1) {
  if (n.flags |= 8, e) {
    n.next = No, No = n;
    return;
  }
  n.next = _o, _o = n;
}
function yc() {
  fp++;
}
function bc() {
  if (--fp > 0)
    return;
  if (No) {
    let e = No;
    for (No = void 0; e; ) {
      const t = e.next;
      e.next = void 0, e.flags &= -9, e = t;
    }
  }
  let n;
  for (; _o; ) {
    let e = _o;
    for (_o = void 0; e; ) {
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
function pp(n) {
  for (let e = n.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function gp(n) {
  let e, t = n.depsTail, i = t;
  for (; i; ) {
    const s = i.prevDep;
    i.version === -1 ? (i === t && (t = s), xc(i), b0(i)) : e = i, i.dep.activeLink = i.prevActiveLink, i.prevActiveLink = void 0, i = s;
  }
  n.deps = e, n.depsTail = t;
}
function du(n) {
  for (let e = n.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (mp(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!n._dirty;
}
function mp(n) {
  if (n.flags & 4 && !(n.flags & 16) || (n.flags &= -17, n.globalVersion === Yo) || (n.globalVersion = Yo, !n.isSSR && n.flags & 128 && (!n.deps && !n._dirty || !du(n))))
    return;
  n.flags |= 2;
  const e = n.dep, t = vt, i = Hn;
  vt = n, Hn = !0;
  try {
    pp(n);
    const s = n.fn(n._value);
    (e.version === 0 || Ut(s, n._value)) && (n.flags |= 128, n._value = s, e.version++);
  } catch (s) {
    throw e.version++, s;
  } finally {
    vt = t, Hn = i, gp(n), n.flags &= -3;
  }
}
function xc(n, e = !1) {
  const { dep: t, prevSub: i, nextSub: s } = n;
  if (i && (i.nextSub = s, n.prevSub = void 0), s && (s.prevSub = i, n.nextSub = void 0), t.subs === n && (t.subs = i, !i && t.computed)) {
    t.computed.flags &= -5;
    for (let o = t.computed.deps; o; o = o.nextDep)
      xc(o, !0);
  }
  !e && !--t.sc && t.map && t.map.delete(t.key);
}
function b0(n) {
  const { prevDep: e, nextDep: t } = n;
  e && (e.nextDep = t, n.prevDep = void 0), t && (t.prevDep = e, n.nextDep = void 0);
}
let Hn = !0;
const vp = [];
function Ji() {
  vp.push(Hn), Hn = !1;
}
function Zi() {
  const n = vp.pop();
  Hn = n === void 0 ? !0 : n;
}
function Eh(n) {
  const { cleanup: e } = n;
  if (n.cleanup = void 0, e) {
    const t = vt;
    vt = void 0;
    try {
      e();
    } finally {
      vt = t;
    }
  }
}
let Yo = 0;
class x0 {
  constructor(e, t) {
    this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Xl {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!vt || !Hn || vt === this.computed)
      return;
    let t = this.activeLink;
    if (t === void 0 || t.sub !== vt)
      t = this.activeLink = new x0(vt, this), vt.deps ? (t.prevDep = vt.depsTail, vt.depsTail.nextDep = t, vt.depsTail = t) : vt.deps = vt.depsTail = t, yp(t);
    else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
      const i = t.nextDep;
      i.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = i), t.prevDep = vt.depsTail, t.nextDep = void 0, vt.depsTail.nextDep = t, vt.depsTail = t, vt.deps === t && (vt.deps = i);
    }
    return t;
  }
  trigger(e) {
    this.version++, Yo++, this.notify(e);
  }
  notify(e) {
    yc();
    try {
      for (let t = this.subs; t; t = t.prevSub)
        t.sub.notify() && t.sub.dep.notify();
    } finally {
      bc();
    }
  }
}
function yp(n) {
  if (n.dep.sc++, n.sub.flags & 4) {
    const e = n.dep.computed;
    if (e && !n.dep.subs) {
      e.flags |= 20;
      for (let i = e.deps; i; i = i.nextDep)
        yp(i);
    }
    const t = n.dep.subs;
    t !== n && (n.prevSub = t, t && (t.nextSub = n)), n.dep.subs = n;
  }
}
const pu = /* @__PURE__ */ new WeakMap(), Ss = /* @__PURE__ */ Symbol(
  ""
), gu = /* @__PURE__ */ Symbol(
  ""
), Xo = /* @__PURE__ */ Symbol(
  ""
);
function Yt(n, e, t) {
  if (Hn && vt) {
    let i = pu.get(n);
    i || pu.set(n, i = /* @__PURE__ */ new Map());
    let s = i.get(t);
    s || (i.set(t, s = new Xl()), s.map = i, s.key = t), s.track();
  }
}
function yi(n, e, t, i, s, o) {
  const r = pu.get(n);
  if (!r) {
    Yo++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (yc(), e === "clear")
    r.forEach(l);
  else {
    const a = He(n), u = a && mc(t);
    if (a && t === "length") {
      const c = Number(i);
      r.forEach((h, f) => {
        (f === "length" || f === Xo || !Fn(f) && f >= c) && l(h);
      });
    } else
      switch ((t !== void 0 || r.has(void 0)) && l(r.get(t)), u && l(r.get(Xo)), e) {
        case "add":
          a ? u && l(r.get("length")) : (l(r.get(Ss)), Yi(n) && l(r.get(gu)));
          break;
        case "delete":
          a || (l(r.get(Ss)), Yi(n) && l(r.get(gu)));
          break;
        case "set":
          Yi(n) && l(r.get(Ss));
          break;
      }
  }
  bc();
}
function Ps(n) {
  const e = /* @__PURE__ */ rt(n);
  return e === n || (Yt(e, "iterate", Xo), /* @__PURE__ */ An(n)) ? e : /* @__PURE__ */ ai(n) ? /* @__PURE__ */ Xi(n) ? e.map((t) => Qi($n(t))) : e.map(Qi) : e.map($n);
}
function Jl(n) {
  return Yt(n = /* @__PURE__ */ rt(n), "iterate", Xo), n;
}
function ti(n, e) {
  return /* @__PURE__ */ ai(n) ? Qi(/* @__PURE__ */ Xi(n) ? $n(e) : e) : $n(e);
}
const w0 = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ba(this, Symbol.iterator, (n) => ti(this, n));
  },
  concat(...n) {
    return Ps(this).concat(
      ...n.map((e) => He(e) ? Ps(e) : e)
    );
  },
  entries() {
    return Ba(this, "entries", (n) => (n[1] = ti(this, n[1]), n));
  },
  every(n, e) {
    return gi(this, "every", n, e, void 0, arguments);
  },
  filter(n, e) {
    return gi(
      this,
      "filter",
      n,
      e,
      (t) => t.map((i) => ti(this, i)),
      arguments
    );
  },
  find(n, e) {
    return gi(
      this,
      "find",
      n,
      e,
      (t) => ti(this, t),
      arguments
    );
  },
  findIndex(n, e) {
    return gi(this, "findIndex", n, e, void 0, arguments);
  },
  findLast(n, e) {
    return gi(
      this,
      "findLast",
      n,
      e,
      (t) => ti(this, t),
      arguments
    );
  },
  findLastIndex(n, e) {
    return gi(this, "findLastIndex", n, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(n, e) {
    return gi(this, "forEach", n, e, void 0, arguments);
  },
  includes(...n) {
    return Ia(this, "includes", n);
  },
  indexOf(...n) {
    return Ia(this, "indexOf", n);
  },
  join(n) {
    return Ps(this).join(n);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...n) {
    return Ia(this, "lastIndexOf", n);
  },
  map(n, e) {
    return gi(this, "map", n, e, void 0, arguments);
  },
  pop() {
    return xo(this, "pop");
  },
  push(...n) {
    return xo(this, "push", n);
  },
  reduce(n, ...e) {
    return Bh(this, "reduce", n, e);
  },
  reduceRight(n, ...e) {
    return Bh(this, "reduceRight", n, e);
  },
  shift() {
    return xo(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(n, e) {
    return gi(this, "some", n, e, void 0, arguments);
  },
  splice(...n) {
    return xo(this, "splice", n);
  },
  toReversed() {
    return Ps(this).toReversed();
  },
  toSorted(n) {
    return Ps(this).toSorted(n);
  },
  toSpliced(...n) {
    return Ps(this).toSpliced(...n);
  },
  unshift(...n) {
    return xo(this, "unshift", n);
  },
  values() {
    return Ba(this, "values", (n) => ti(this, n));
  }
};
function Ba(n, e, t) {
  const i = Jl(n), s = i[e]();
  return i !== n && !/* @__PURE__ */ An(n) && (s._next = s.next, s.next = () => {
    const o = s._next();
    return o.done || (o.value = t(o.value)), o;
  }), s;
}
const k0 = Array.prototype;
function gi(n, e, t, i, s, o) {
  const r = Jl(n), l = r !== n && !/* @__PURE__ */ An(n), a = r[e];
  if (a !== k0[e]) {
    const h = a.apply(n, o);
    return l ? $n(h) : h;
  }
  let u = t;
  r !== n && (l ? u = function(h, f) {
    return t.call(this, ti(n, h), f, n);
  } : t.length > 2 && (u = function(h, f) {
    return t.call(this, h, f, n);
  }));
  const c = a.call(r, u, i);
  return l && s ? s(c) : c;
}
function Bh(n, e, t, i) {
  const s = Jl(n), o = s !== n && !/* @__PURE__ */ An(n);
  let r = t, l = !1;
  s !== n && (o ? (l = i.length === 0, r = function(u, c, h) {
    return l && (l = !1, u = ti(n, u)), t.call(this, u, ti(n, c), h, n);
  }) : t.length > 3 && (r = function(u, c, h) {
    return t.call(this, u, c, h, n);
  }));
  const a = s[e](r, ...i);
  return l ? ti(n, a) : a;
}
function Ia(n, e, t) {
  const i = /* @__PURE__ */ rt(n);
  Yt(i, "iterate", Xo);
  const s = i[e](...t);
  return (s === -1 || s === !1) && /* @__PURE__ */ Sc(t[0]) ? (t[0] = /* @__PURE__ */ rt(t[0]), i[e](...t)) : s;
}
function xo(n, e, t = []) {
  Ji(), yc();
  const i = (/* @__PURE__ */ rt(n))[e].apply(n, t);
  return bc(), Zi(), i;
}
const S0 = /* @__PURE__ */ gc("__proto__,__v_isRef,__isVue"), bp = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((n) => n !== "arguments" && n !== "caller").map((n) => Symbol[n]).filter(Fn)
);
function C0(n) {
  Fn(n) || (n = String(n));
  const e = /* @__PURE__ */ rt(this);
  return Yt(e, "has", n), e.hasOwnProperty(n);
}
class xp {
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
      return i === (s ? o ? I0 : Cp : o ? Sp : kp).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(i) ? e : void 0;
    const r = He(e);
    if (!s) {
      let a;
      if (r && (a = w0[t]))
        return a;
      if (t === "hasOwnProperty")
        return C0;
    }
    const l = Reflect.get(
      e,
      t,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ sn(e) ? e : i
    );
    if ((Fn(t) ? bp.has(t) : S0(t)) || (s || Yt(e, "get", t), o))
      return l;
    if (/* @__PURE__ */ sn(l)) {
      const a = r && mc(t) ? l : l.value;
      return s && Ct(a) ? /* @__PURE__ */ vu(a) : a;
    }
    return Ct(l) ? s ? /* @__PURE__ */ vu(l) : /* @__PURE__ */ xs(l) : l;
  }
}
class wp extends xp {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, t, i, s) {
    let o = e[t];
    const r = He(e) && mc(t);
    if (!this._isShallow) {
      const u = /* @__PURE__ */ ai(o);
      if (!/* @__PURE__ */ An(i) && !/* @__PURE__ */ ai(i) && (o = /* @__PURE__ */ rt(o), i = /* @__PURE__ */ rt(i)), !r && /* @__PURE__ */ sn(o) && !/* @__PURE__ */ sn(i))
        return u || (o.value = i), !0;
    }
    const l = r ? Number(t) < e.length : dt(e, t), a = Reflect.set(
      e,
      t,
      i,
      /* @__PURE__ */ sn(e) ? e : s
    );
    return e === /* @__PURE__ */ rt(s) && a && (l ? Ut(i, o) && yi(e, "set", t, i) : yi(e, "add", t, i)), a;
  }
  deleteProperty(e, t) {
    const i = dt(e, t);
    e[t];
    const s = Reflect.deleteProperty(e, t);
    return s && i && yi(e, "delete", t, void 0), s;
  }
  has(e, t) {
    const i = Reflect.has(e, t);
    return (!Fn(t) || !bp.has(t)) && Yt(e, "has", t), i;
  }
  ownKeys(e) {
    return Yt(
      e,
      "iterate",
      He(e) ? "length" : Ss
    ), Reflect.ownKeys(e);
  }
}
class M0 extends xp {
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
const A0 = /* @__PURE__ */ new wp(), T0 = /* @__PURE__ */ new M0(), $0 = /* @__PURE__ */ new wp(!0);
const mu = (n) => n, Ar = (n) => Reflect.getPrototypeOf(n);
function D0(n, e, t) {
  return function(...i) {
    const s = this.__v_raw, o = /* @__PURE__ */ rt(s), r = Yi(o), l = n === "entries" || n === Symbol.iterator && r, a = n === "keys" && r, u = s[n](...i), c = t ? mu : e ? Qi : $n;
    return !e && Yt(
      o,
      "iterate",
      a ? gu : Ss
    ), On(
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
function Tr(n) {
  return function(...e) {
    return n === "delete" ? !1 : n === "clear" ? void 0 : this;
  };
}
function O0(n, e) {
  const t = {
    get(s) {
      const o = this.__v_raw, r = /* @__PURE__ */ rt(o), l = /* @__PURE__ */ rt(s);
      n || (Ut(s, l) && Yt(r, "get", s), Yt(r, "get", l));
      const { has: a } = Ar(r), u = e ? mu : n ? Qi : $n;
      if (a.call(r, s))
        return u(o.get(s));
      if (a.call(r, l))
        return u(o.get(l));
      o !== r && o.get(s);
    },
    get size() {
      const s = this.__v_raw;
      return !n && Yt(/* @__PURE__ */ rt(s), "iterate", Ss), s.size;
    },
    has(s) {
      const o = this.__v_raw, r = /* @__PURE__ */ rt(o), l = /* @__PURE__ */ rt(s);
      return n || (Ut(s, l) && Yt(r, "has", s), Yt(r, "has", l)), s === l ? o.has(s) : o.has(s) || o.has(l);
    },
    forEach(s, o) {
      const r = this, l = r.__v_raw, a = /* @__PURE__ */ rt(l), u = e ? mu : n ? Qi : $n;
      return !n && Yt(a, "iterate", Ss), l.forEach((c, h) => s.call(o, u(c), u(h), r));
    }
  };
  return On(
    t,
    n ? {
      add: Tr("add"),
      set: Tr("set"),
      delete: Tr("delete"),
      clear: Tr("clear")
    } : {
      add(s) {
        const o = /* @__PURE__ */ rt(this), r = Ar(o), l = /* @__PURE__ */ rt(s), a = !e && !/* @__PURE__ */ An(s) && !/* @__PURE__ */ ai(s) ? l : s;
        return r.has.call(o, a) || Ut(s, a) && r.has.call(o, s) || Ut(l, a) && r.has.call(o, l) || (o.add(a), yi(o, "add", a, a)), this;
      },
      set(s, o) {
        !e && !/* @__PURE__ */ An(o) && !/* @__PURE__ */ ai(o) && (o = /* @__PURE__ */ rt(o));
        const r = /* @__PURE__ */ rt(this), { has: l, get: a } = Ar(r);
        let u = l.call(r, s);
        u || (s = /* @__PURE__ */ rt(s), u = l.call(r, s));
        const c = a.call(r, s);
        return r.set(s, o), u ? Ut(o, c) && yi(r, "set", s, o) : yi(r, "add", s, o), this;
      },
      delete(s) {
        const o = /* @__PURE__ */ rt(this), { has: r, get: l } = Ar(o);
        let a = r.call(o, s);
        a || (s = /* @__PURE__ */ rt(s), a = r.call(o, s)), l && l.call(o, s);
        const u = o.delete(s);
        return a && yi(o, "delete", s, void 0), u;
      },
      clear() {
        const s = /* @__PURE__ */ rt(this), o = s.size !== 0, r = s.clear();
        return o && yi(
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
    t[s] = D0(s, n, e);
  }), t;
}
function wc(n, e) {
  const t = O0(n, e);
  return (i, s, o) => s === "__v_isReactive" ? !n : s === "__v_isReadonly" ? n : s === "__v_raw" ? i : Reflect.get(
    dt(t, s) && s in i ? t : i,
    s,
    o
  );
}
const L0 = {
  get: /* @__PURE__ */ wc(!1, !1)
}, E0 = {
  get: /* @__PURE__ */ wc(!1, !0)
}, B0 = {
  get: /* @__PURE__ */ wc(!0, !1)
};
const kp = /* @__PURE__ */ new WeakMap(), Sp = /* @__PURE__ */ new WeakMap(), Cp = /* @__PURE__ */ new WeakMap(), I0 = /* @__PURE__ */ new WeakMap();
function R0(n) {
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
function xs(n) {
  return /* @__PURE__ */ ai(n) ? n : kc(
    n,
    !1,
    A0,
    L0,
    kp
  );
}
// @__NO_SIDE_EFFECTS__
function P0(n) {
  return kc(
    n,
    !1,
    $0,
    E0,
    Sp
  );
}
// @__NO_SIDE_EFFECTS__
function vu(n) {
  return kc(
    n,
    !0,
    T0,
    B0,
    Cp
  );
}
function kc(n, e, t, i, s) {
  if (!Ct(n) || n.__v_raw && !(e && n.__v_isReactive) || n.__v_skip || !Object.isExtensible(n))
    return n;
  const o = s.get(n);
  if (o)
    return o;
  const r = R0(r0(n));
  if (r === 0)
    return n;
  const l = new Proxy(
    n,
    r === 2 ? i : t
  );
  return s.set(n, l), l;
}
// @__NO_SIDE_EFFECTS__
function Xi(n) {
  return /* @__PURE__ */ ai(n) ? /* @__PURE__ */ Xi(n.__v_raw) : !!(n && n.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function ai(n) {
  return !!(n && n.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function An(n) {
  return !!(n && n.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Sc(n) {
  return n ? !!n.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function rt(n) {
  const e = n && n.__v_raw;
  return e ? /* @__PURE__ */ rt(e) : n;
}
function _0(n) {
  return !dt(n, "__v_skip") && Object.isExtensible(n) && lp(n, "__v_skip", !0), n;
}
const $n = (n) => Ct(n) ? /* @__PURE__ */ xs(n) : n, Qi = (n) => Ct(n) ? /* @__PURE__ */ vu(n) : n;
// @__NO_SIDE_EFFECTS__
function sn(n) {
  return n ? n.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function G(n) {
  return Mp(n, !1);
}
// @__NO_SIDE_EFFECTS__
function Us(n) {
  return Mp(n, !0);
}
function Mp(n, e) {
  return /* @__PURE__ */ sn(n) ? n : new N0(n, e);
}
class N0 {
  constructor(e, t) {
    this.dep = new Xl(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ rt(e), this._value = t ? e : $n(e), this.__v_isShallow = t;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const t = this._rawValue, i = this.__v_isShallow || /* @__PURE__ */ An(e) || /* @__PURE__ */ ai(e);
    e = i ? e : /* @__PURE__ */ rt(e), Ut(e, t) && (this._rawValue = e, this._value = i ? e : $n(e), this.dep.trigger());
  }
}
function V(n) {
  return /* @__PURE__ */ sn(n) ? n.value : n;
}
const V0 = {
  get: (n, e, t) => e === "__v_raw" ? n : V(Reflect.get(n, e, t)),
  set: (n, e, t, i) => {
    const s = n[e];
    return /* @__PURE__ */ sn(s) && !/* @__PURE__ */ sn(t) ? (s.value = t, !0) : Reflect.set(n, e, t, i);
  }
};
function Ap(n) {
  return /* @__PURE__ */ Xi(n) ? n : new Proxy(n, V0);
}
class H0 {
  constructor(e) {
    this.__v_isRef = !0, this._value = void 0;
    const t = this.dep = new Xl(), { get: i, set: s } = e(t.track.bind(t), t.trigger.bind(t));
    this._get = i, this._set = s;
  }
  get value() {
    return this._value = this._get();
  }
  set value(e) {
    this._set(e);
  }
}
function F0(n) {
  return new H0(n);
}
class z0 {
  constructor(e, t, i) {
    this.fn = e, this.setter = t, this._value = void 0, this.dep = new Xl(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Yo - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = i;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    vt !== this)
      return dp(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return mp(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
// @__NO_SIDE_EFFECTS__
function W0(n, e, t = !1) {
  let i, s;
  return ht(n) ? i = n : (i = n.get, s = n.set), new z0(i, s, t);
}
const $r = {}, yl = /* @__PURE__ */ new WeakMap();
let ps;
function K0(n, e = !1, t = ps) {
  if (t) {
    let i = yl.get(t);
    i || yl.set(t, i = []), i.push(n);
  }
}
function U0(n, e, t = lt) {
  const { immediate: i, deep: s, once: o, scheduler: r, augmentJob: l, call: a } = t, u = (E) => s ? E : /* @__PURE__ */ An(E) || s === !1 || s === 0 ? bi(E, 1) : bi(E);
  let c, h, f, d, g = !1, v = !1;
  if (/* @__PURE__ */ sn(n) ? (h = () => n.value, g = /* @__PURE__ */ An(n)) : /* @__PURE__ */ Xi(n) ? (h = () => u(n), g = !0) : He(n) ? (v = !0, g = n.some((E) => /* @__PURE__ */ Xi(E) || /* @__PURE__ */ An(E)), h = () => n.map((E) => {
    if (/* @__PURE__ */ sn(E))
      return E.value;
    if (/* @__PURE__ */ Xi(E))
      return u(E);
    if (ht(E))
      return a ? a(E, 2) : E();
  })) : ht(n) ? e ? h = a ? () => a(n, 2) : n : h = () => {
    if (f) {
      Ji();
      try {
        f();
      } finally {
        Zi();
      }
    }
    const E = ps;
    ps = c;
    try {
      return a ? a(n, 3, [d]) : n(d);
    } finally {
      ps = E;
    }
  } : h = ks, e && s) {
    const E = h, R = s === !0 ? 1 / 0 : s;
    h = () => bi(E(), R);
  }
  const m = y0(), x = () => {
    c.stop(), m && m.active && np(m.effects, c);
  };
  if (o && e) {
    const E = e;
    e = (...R) => {
      const z = E(...R);
      return x(), z;
    };
  }
  let O = v ? new Array(n.length).fill($r) : $r;
  const L = (E) => {
    if (!(!(c.flags & 1) || !c.dirty && !E))
      if (e) {
        const R = c.run();
        if (E || s || g || (v ? R.some((z, P) => Ut(z, O[P])) : Ut(R, O))) {
          f && f();
          const z = ps;
          ps = c;
          try {
            const P = [
              R,
              // pass undefined as the old value when it's changed for the first time
              O === $r ? void 0 : v && O[0] === $r ? [] : O,
              d
            ];
            O = R, a ? a(e, 3, P) : (
              // @ts-expect-error
              e(...P)
            );
          } finally {
            ps = z;
          }
        }
      } else
        c.run();
  };
  return l && l(L), c = new hp(h), c.scheduler = r ? () => r(L, !1) : L, d = (E) => K0(E, !1, c), f = c.onStop = () => {
    const E = yl.get(c);
    if (E) {
      if (a)
        a(E, 4);
      else
        for (const R of E) R();
      yl.delete(c);
    }
  }, e ? i ? L(!0) : O = c.run() : r ? r(L.bind(null, !0), !0) : c.run(), x.pause = c.pause.bind(c), x.resume = c.resume.bind(c), x.stop = x, x;
}
function bi(n, e = 1 / 0, t) {
  if (e <= 0 || !Ct(n) || n.__v_skip || (t = t || /* @__PURE__ */ new Map(), (t.get(n) || 0) >= e))
    return n;
  if (t.set(n, e), e--, /* @__PURE__ */ sn(n))
    bi(n.value, e, t);
  else if (He(n))
    for (let i = 0; i < n.length; i++)
      bi(n[i], e, t);
  else if (Ti(n) || Yi(n))
    n.forEach((i) => {
      bi(i, e, t);
    });
  else if (op(n)) {
    for (const i in n)
      bi(n[i], e, t);
    for (const i of Object.getOwnPropertySymbols(n))
      Object.prototype.propertyIsEnumerable.call(n, i) && bi(n[i], e, t);
  }
  return n;
}
function mr(n, e, t, i) {
  try {
    return i ? n(...i) : n();
  } catch (s) {
    Zl(s, e, t);
  }
}
function ui(n, e, t, i) {
  if (ht(n)) {
    const s = mr(n, e, t, i);
    return s && ip(s) && s.catch((o) => {
      Zl(o, e, t);
    }), s;
  }
  if (He(n)) {
    const s = [];
    for (let o = 0; o < n.length; o++)
      s.push(ui(n[o], e, t, i));
    return s;
  }
}
function Zl(n, e, t, i = !0) {
  const s = e ? e.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: r } = e && e.appContext.config || lt;
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
      Ji(), mr(o, null, 10, [
        n,
        a,
        u
      ]), Zi();
      return;
    }
  }
  j0(n, t, s, i, r);
}
function j0(n, e, t, i = !0, s = !1) {
  if (s)
    throw n;
  console.error(n);
}
const nn = [];
let Qn = -1;
const js = [];
let Vi = null, Ns = 0;
const Tp = /* @__PURE__ */ Promise.resolve();
let bl = null;
function In(n) {
  const e = bl || Tp;
  return n ? e.then(this ? n.bind(this) : n) : e;
}
function G0(n) {
  let e = Qn + 1, t = nn.length;
  for (; e < t; ) {
    const i = e + t >>> 1, s = nn[i], o = Jo(s);
    o < n || o === n && s.flags & 2 ? e = i + 1 : t = i;
  }
  return e;
}
function Cc(n) {
  if (!(n.flags & 1)) {
    const e = Jo(n), t = nn[nn.length - 1];
    !t || // fast path when the job id is larger than the tail
    !(n.flags & 2) && e >= Jo(t) ? nn.push(n) : nn.splice(G0(e), 0, n), n.flags |= 1, $p();
  }
}
function $p() {
  bl || (bl = Tp.then(Op));
}
function q0(n) {
  if (!He(n))
    Vi && n.id === -1 ? Vi.splice(Ns + 1, 0, n) : n.flags & 1 || (js.push(n), n.flags |= 1);
  else
    for (let e = 0; e < n.length; e++)
      js.push(n[e]);
  $p();
}
function Ih(n, e, t = Qn + 1) {
  for (; t < nn.length; t++) {
    const i = nn[t];
    if (i && i.flags & 2) {
      if (n && i.id !== n.uid)
        continue;
      nn.splice(t, 1), t--, i.flags & 4 && (i.flags &= -2), i(), i.flags & 4 || (i.flags &= -2);
    }
  }
}
function Dp(n) {
  if (js.length) {
    const e = [...new Set(js)].sort(
      (t, i) => Jo(t) - Jo(i)
    );
    if (js.length = 0, Vi) {
      for (let t = 0; t < e.length; t++)
        Vi.push(e[t]);
      return;
    }
    for (Vi = e, Ns = 0; Ns < Vi.length; Ns++) {
      const t = Vi[Ns];
      t.flags & 4 && (t.flags &= -2), t.flags & 8 || t(), t.flags &= -2;
    }
    Vi = null, Ns = 0;
  }
}
const Jo = (n) => n.id == null ? n.flags & 2 ? -1 : 1 / 0 : n.id;
function Op(n) {
  try {
    for (Qn = 0; Qn < nn.length; Qn++) {
      const e = nn[Qn];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), mr(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; Qn < nn.length; Qn++) {
      const e = nn[Qn];
      e && (e.flags &= -2);
    }
    Qn = -1, nn.length = 0, Dp(), bl = null, (nn.length || js.length) && Op();
  }
}
let Xt = null, Lp = null;
function xl(n) {
  const e = Xt;
  return Xt = n, Lp = n && n.type.__scopeId || null, e;
}
function Ep(n, e = Xt, t) {
  if (!e || n._n)
    return n;
  const i = (...s) => {
    i._d && zh(-1);
    const o = xl(e), r = Ci.length;
    let l;
    try {
      l = n(...s);
    } finally {
      for (let a = Ci.length; a > r; a--) $c();
      xl(o), i._d && zh(1);
    }
    return l;
  };
  return i._n = !0, i._c = !0, i._d = !0, i;
}
function Ue(n, e) {
  if (Xt === null)
    return n;
  const t = na(Xt), i = n.dirs || (n.dirs = []);
  for (let s = 0; s < e.length; s++) {
    let [o, r, l, a = lt] = e[s];
    o && (ht(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && bi(r), i.push({
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
function hs(n, e, t, i) {
  const s = n.dirs, o = e && e.dirs;
  for (let r = 0; r < s.length; r++) {
    const l = s[r];
    o && (l.oldValue = o[r].value);
    let a = l.dir[i];
    a && (Ji(), ui(a, t, 8, [
      n.el,
      l,
      n,
      e
    ]), Zi());
  }
}
function Y0(n, e, t = !1) {
  const i = eg();
  if (i || qs) {
    let s = qs ? qs._context.provides : i ? i.parent == null || i.ce ? i.vnode.appContext && i.vnode.appContext.provides : i.parent.provides : void 0;
    if (s && n in s)
      return s[n];
    if (arguments.length > 1)
      return t && ht(e) ? e.call(i && i.proxy) : e;
  }
}
const X0 = /* @__PURE__ */ Symbol.for("v-scx"), J0 = () => Y0(X0);
function Z0(n, e) {
  return Bp(
    n,
    null,
    { flush: "sync" }
  );
}
function Ye(n, e, t) {
  return Bp(n, e, t);
}
function Bp(n, e, t = lt) {
  const { immediate: i, deep: s, flush: o, once: r } = t, l = On({}, t), a = e && i || !e && o !== "post";
  let u;
  if (er) {
    if (o === "sync") {
      const d = J0();
      u = d.__watcherHandles || (d.__watcherHandles = []);
    } else if (!a) {
      const d = () => {
      };
      return d.stop = ks, d.resume = ks, d.pause = ks, d;
    }
  }
  const c = es;
  l.call = (d, g, v) => ui(d, c, g, v);
  let h = !1;
  o === "post" ? l.scheduler = (d) => {
    un(d, c && c.suspense);
  } : o !== "sync" && (h = !0, l.scheduler = (d, g) => {
    g ? d() : Cc(d);
  }), l.augmentJob = (d) => {
    e && (d.flags |= 4), h && (d.flags |= 2, c && (d.id = c.uid, d.i = c));
  };
  const f = U0(n, e, l);
  return er && (u ? u.push(f) : a && f()), f;
}
const Q0 = /* @__PURE__ */ Symbol("_vte"), Ql = (n) => n.__isTeleport, Ra = /* @__PURE__ */ Symbol("_leaveCb");
function eb(n) {
  let e = n[0];
  if (n.length > 1) {
    for (const t of n)
      if (t.type !== ci) {
        e = t;
        break;
      }
  }
  return e;
}
function Ip(n) {
  if (!Rp(n))
    return Ql(n.type) && n.children ? eb(n.children) : n;
  if (n.component)
    return n.component.subTree;
  const { shapeFlag: e, children: t } = n;
  if (t) {
    if (e & 16)
      return t[0];
    if (e & 32 && ht(t.default))
      return t.default();
  }
}
function Mc(n, e) {
  if (n.shapeFlag & 6 && n.component) {
    n.transition = e;
    const t = n.component.subTree;
    Mc(
      Ql(t.type) && Ip(t) || t,
      e
    );
  } else n.shapeFlag & 128 ? (n.ssContent.transition = e.clone(n.ssContent), n.ssFallback.transition = e.clone(n.ssFallback)) : n.transition = e;
}
// @__NO_SIDE_EFFECTS__
function Qt(n, e) {
  return ht(n) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    On({ name: n.name }, e, { setup: n })
  ) : n;
}
function tb(n) {
  n.ids = [n.ids[0] + n.ids[2]++ + "-", 0, 0];
}
function Rh(n, e) {
  let t;
  return !!((t = Object.getOwnPropertyDescriptor(n, e)) && !t.configurable);
}
const wl = /* @__PURE__ */ new WeakMap();
function Vo(n, e, t, i, s = !1) {
  if (He(n)) {
    n.forEach(
      (v, m) => Vo(
        v,
        e && (He(e) ? e[m] : e),
        t,
        i,
        s
      )
    );
    return;
  }
  if (Gs(i) && !s) {
    i.shapeFlag & 512 && i.type.__asyncResolved && i.component.subTree.component && Vo(n, e, t, i.component.subTree);
    return;
  }
  const o = i.shapeFlag & 4 ? na(i.component) : i.el, r = s ? null : o, { i: l, r: a } = n, u = e && e.r, c = l.refs === lt ? l.refs = {} : l.refs, h = l.setupState, f = /* @__PURE__ */ rt(h), d = h === lt ? tp : (v) => Rh(c, v) ? !1 : dt(f, v), g = (v, m) => !(m && Rh(c, m));
  if (u != null && u !== a) {
    if (Ph(e), It(u))
      c[u] = null, d(u) && (h[u] = null);
    else if (/* @__PURE__ */ sn(u)) {
      const v = e;
      g(u, v.k) && (u.value = null), v.k && (c[v.k] = null);
    }
  }
  if (ht(a))
    mr(a, l, 12, [r, c]);
  else {
    const v = It(a), m = /* @__PURE__ */ sn(a);
    if (v || m) {
      const x = () => {
        if (n.f) {
          const O = v ? d(a) ? h[a] : c[a] : g() || !n.k ? a.value : c[n.k];
          if (s)
            He(O) && np(O, o);
          else if (He(O))
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
          x(), wl.delete(n);
        };
        O.id = -1, wl.set(n, O), un(O, t);
      } else
        Ph(n), x();
    }
  }
}
function Ph(n) {
  const e = wl.get(n);
  e && (e.flags |= 8, wl.delete(n));
}
Yl().requestIdleCallback;
Yl().cancelIdleCallback;
const Gs = (n) => !!n.type.__asyncLoader, Rp = (n) => n.type.__isKeepAlive;
function nb(n, e, t = es, i = !1) {
  if (t) {
    const s = t[n] || (t[n] = []), o = e.__weh || (e.__weh = (...r) => {
      Ji();
      const l = Oc(t), a = ui(e, t, n, r);
      return l(), Zi(), a;
    });
    return i ? s.unshift(o) : s.push(o), o;
  }
}
const Pp = (n) => (e, t = es) => {
  (!er || n === "sp") && nb(n, (...i) => e(...i), t);
}, vr = Pp("m"), Di = Pp(
  "bum"
), ib = /* @__PURE__ */ Symbol.for("v-ndc");
function Ie(n, e, t, i) {
  let s;
  const o = t, r = He(n);
  if (r || It(n)) {
    const l = r && /* @__PURE__ */ Xi(n);
    let a = !1, u = !1;
    l && (a = !/* @__PURE__ */ An(n), u = /* @__PURE__ */ ai(n), n = Jl(n)), s = new Array(n.length);
    for (let c = 0, h = n.length; c < h; c++)
      s[c] = e(
        a ? u ? Qi($n(n[c])) : $n(n[c]) : n[c],
        c,
        void 0,
        o
      );
  } else if (typeof n == "number") {
    s = new Array(n);
    for (let l = 0; l < n; l++)
      s[l] = e(l + 1, l, void 0, o);
  } else if (Ct(n))
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
function sb(n, e, t, i, s, o) {
  if (t == null && (t = {}), Xt.ce || Xt.parent && Gs(Xt.parent) && Xt.parent.ce) {
    const u = t, c = Object.keys(u).length > 0;
    return u.name = e, w(), wn(
      ve,
      null,
      [Vt("slot", u, i)],
      c ? -2 : 64
    );
  }
  let r = n[e];
  r && r._c && (r._d = !1);
  const l = Ci.length;
  w();
  let a;
  try {
    const u = r && _p(r(t)), c = t.key || o || // slot content array of a dynamic conditional slot may have a branch
    // key attached in the `createSlots` helper, respect that
    u && u.key;
    a = wn(
      ve,
      {
        key: (c && !Fn(c) ? c : `_${e}`) + // #7256 force differentiate fallback content from actual content
        (!u && i ? "_fb" : "")
      },
      u || (i ? i() : []),
      u && n._ === 1 ? 64 : -2
    );
  } catch (u) {
    for (let c = Ci.length; c > l; c--) $c();
    throw u;
  } finally {
    r && r._c && (r._d = !0);
  }
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), a;
}
function _p(n) {
  return n.some((e) => Dc(e) ? !(e.type === ci || e.type === ve && !_p(e.children)) : !0) ? n : null;
}
const yu = (n) => n ? tg(n) ? na(n) : yu(n.parent) : null, Ho = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ On(/* @__PURE__ */ Object.create(null), {
    $: (n) => n,
    $el: (n) => n.vnode.el,
    $data: (n) => n.data,
    $props: (n) => n.props,
    $attrs: (n) => n.attrs,
    $slots: (n) => n.slots,
    $refs: (n) => n.refs,
    $parent: (n) => yu(n.parent),
    $root: (n) => yu(n.root),
    $host: (n) => n.ce,
    $emit: (n) => n.emit,
    $options: (n) => n.type,
    $forceUpdate: (n) => n.f || (n.f = () => {
      Cc(n.update);
    }),
    $nextTick: (n) => n.n || (n.n = In.bind(n.proxy)),
    $watch: (n) => ks
  })
), Pa = (n, e) => n !== lt && !n.__isScriptSetup && dt(n, e), ob = {
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
        if (Pa(i, e))
          return r[e] = 1, i[e];
        if (dt(o, e))
          return r[e] = 3, o[e];
        if (t !== lt && dt(t, e))
          return r[e] = 4, t[e];
        r[e] = 0;
      }
    }
    const u = Ho[e];
    let c, h;
    if (u)
      return e === "$attrs" && Yt(n.attrs, "get", ""), u(n);
    if (
      // css module (injected by vue-loader)
      (c = l.__cssModules) && (c = c[e])
    )
      return c;
    if (t !== lt && dt(t, e))
      return r[e] = 4, t[e];
    if (
      // global properties
      h = a.config.globalProperties, dt(h, e)
    )
      return h[e];
  },
  set({ _: n }, e, t) {
    const { data: i, setupState: s, ctx: o } = n;
    return Pa(s, e) ? (s[e] = t, !0) : dt(n.props, e) || e[0] === "$" && e.slice(1) in n ? !1 : (o[e] = t, !0);
  },
  has({
    _: { data: n, setupState: e, accessCache: t, ctx: i, appContext: s, props: o, type: r }
  }, l) {
    let a;
    return !!(t[l] || Pa(e, l) || dt(o, l) || dt(i, l) || dt(Ho, l) || dt(s.config.globalProperties, l) || (a = r.__cssModules) && a[l]);
  },
  defineProperty(n, e, t) {
    return t.get != null ? n._.accessCache[e] = 0 : dt(t, "value") && this.set(n, e, t.value, null), Reflect.defineProperty(n, e, t);
  }
};
function _h(n) {
  return He(n) ? n.reduce(
    (e, t) => (e[t] = null, e),
    {}
  ) : n;
}
function Dn(n, e) {
  return !n || !e ? n || e : He(n) && He(e) ? n.concat(e) : On({}, _h(n), _h(e));
}
function Np() {
  return {
    app: null,
    config: {
      isNativeTag: tp,
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
let rb = 0;
function lb(n, e) {
  return function(i, s = null) {
    ht(i) || (i = On({}, i)), s != null && !Ct(s) && (s = null);
    const o = Np(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const u = o.app = {
      _uid: rb++,
      _component: i,
      _props: s,
      _container: null,
      _context: o,
      _instance: null,
      version: Rb,
      get config() {
        return o.config;
      },
      set config(c) {
      },
      use(c, ...h) {
        return r.has(c) || (c && ht(c.install) ? (r.add(c), c.install(u, ...h)) : ht(c) && (r.add(c), c(u, ...h))), u;
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
          return d.appContext = o, f === !0 ? f = "svg" : f === !1 && (f = void 0), n(d, c, f), a = !0, u._container = c, c.__vue_app__ = u, na(d.component);
        }
      },
      onUnmount(c) {
        l.push(c);
      },
      unmount() {
        a && (ui(
          l,
          u._instance,
          16
        ), n(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, h) {
        return o.provides[c] = h, u;
      },
      runWithContext(c) {
        const h = qs;
        qs = u;
        try {
          return c();
        } finally {
          qs = h;
        }
      }
    };
    return u;
  };
}
let qs = null;
function Bt(n, e, t = lt) {
  const i = eg(), s = Mn(e), o = Li(e), r = Vp(n, s), l = F0((a, u) => {
    let c, h = lt, f;
    return Z0(() => {
      const d = n[s];
      Ut(c, d) && (c = d, u());
    }), {
      get() {
        return a(), t.get ? t.get(c) : c;
      },
      set(d) {
        const g = t.set ? t.set(d) : d;
        if (!Ut(g, c) && !(h !== lt && Ut(d, h)))
          return;
        const v = i.vnode.props, m = !!(v && // check if parent has passed v-model
        (e in v || s in v || o in v) && (`onUpdate:${e}` in v || `onUpdate:${s}` in v || `onUpdate:${o}` in v));
        m || (c = d, u()), i.emit(`update:${e}`, g), Ut(d, h) && (Ut(d, g) && !Ut(g, f) || // #13524: browsers differ in when they flush microtasks between
        // event listeners. If a v-model listener emits an intermediate value
        // and a following listener restores the model to its previous prop
        // value before parent updates are flushed, the parent render can be
        // deduped as having no prop change. Force a local update so DOM state
        // such as an input's value is synchronized back to the current model.
        m && h !== lt && !Ut(g, c)) && u(), h = d, f = g;
      }
    };
  });
  return l[Symbol.iterator] = () => {
    let a = 0;
    return {
      next() {
        return a < 2 ? { value: a++ ? r || lt : l, done: !1 } : { done: !0 };
      }
    };
  }, l;
}
const Vp = (n, e) => e === "modelValue" || e === "model-value" ? n.modelModifiers : n[`${e}Modifiers`] || n[`${Mn(e)}Modifiers`] || n[`${Li(e)}Modifiers`];
function ab(n, e, ...t) {
  if (n.isUnmounted) return;
  const i = n.vnode.props || lt;
  let s = t;
  const o = e.startsWith("update:"), r = o && Vp(i, e.slice(7));
  r && (r.trim && (s = t.map((c) => It(c) ? c.trim() : c)), r.number && (s = s.map(ql)));
  let l, a = i[l = Oa(e)] || // also try camelCase event handler (#2249)
  i[l = Oa(Mn(e))];
  !a && o && (a = i[l = Oa(Li(e))]), a && ui(
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
    n.emitted[l] = !0, ui(
      u,
      n,
      6,
      s
    );
  }
}
function ub(n, e, t = !1) {
  const i = e.emitsCache, s = i.get(n);
  if (s !== void 0)
    return s;
  const o = n.emits;
  let r = {};
  return o ? (He(o) ? o.forEach((l) => r[l] = null) : On(r, o), Ct(n) && i.set(n, r), r) : (Ct(n) && i.set(n, null), null);
}
function ea(n, e) {
  return !n || !Ul(e) ? !1 : (e = e.slice(2), e = e === "Once" ? e : e.replace(/Once$/, ""), dt(n, e[0].toLowerCase() + e.slice(1)) || dt(n, Li(e)) || dt(n, e));
}
function Nh(n) {
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
  } = n, m = xl(n);
  let x, O;
  try {
    if (t.shapeFlag & 4) {
      const E = s || i, R = E;
      x = ni(
        u.call(
          R,
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
      x = ni(
        E.length > 1 ? E(
          h,
          { attrs: l, slots: r, emit: a }
        ) : E(
          h,
          null
        )
      ), O = e.props ? l : cb(l);
    }
  } catch (E) {
    Ci.length = 0, Zl(E, n, 1), x = Vt(ci);
  }
  let L = x;
  if (O && v !== !1) {
    const E = Object.keys(O), { shapeFlag: R } = L;
    E.length && R & 7 && (o && E.some(jl) && (O = hb(
      O,
      o
    )), L = to(L, O, !1, !0));
  }
  if (t.dirs && (L = to(L, null, !1, !0), L.dirs = L.dirs ? L.dirs.concat(t.dirs) : t.dirs), t.transition) {
    const E = Ql(L.type) && Ip(L) || L;
    Mc(E, t.transition);
  }
  return x = L, xl(m), x;
}
const cb = (n) => {
  let e;
  for (const t in n)
    (t === "class" || t === "style" || Ul(t)) && ((e || (e = {}))[t] = n[t]);
  return e;
}, hb = (n, e) => {
  const t = {};
  for (const i in n)
    (!jl(i) || !(i.slice(9) in e)) && (t[i] = n[i]);
  return t;
};
function fb(n, e, t) {
  const { props: i, children: s, component: o } = n, { props: r, children: l, patchFlag: a } = e, u = o.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (t && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return i ? Vh(i, r, u) : !!r;
    if (a & 8) {
      const c = e.dynamicProps;
      for (let h = 0; h < c.length; h++) {
        const f = c[h];
        if (Hp(r, i, f) && !ea(u, f))
          return !0;
      }
    }
  } else
    return (s || l) && (!l || !l.$stable) ? !0 : i === r ? !1 : i ? r ? Vh(i, r, u) : !0 : !!r;
  return !1;
}
function Vh(n, e, t) {
  const i = Object.keys(e);
  if (i.length !== Object.keys(n).length)
    return !0;
  for (let s = 0; s < i.length; s++) {
    const o = i[s];
    if (Hp(e, n, o) && !ea(t, o))
      return !0;
  }
  return !1;
}
function Hp(n, e, t) {
  const i = n[t], s = e[t];
  return t === "style" && Ct(i) && Ct(s) ? !$i(i, s) : i !== s;
}
function db({ vnode: n, parent: e, suspense: t }, i) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === n && (s.suspense.vnode.el = s.el = i, n = s), s === n)
      (n = e.vnode).el = i, e = e.parent;
    else
      break;
  }
  t && t.activeBranch === n && (t.vnode.el = i);
}
const Fp = {}, zp = () => Object.create(Fp), Wp = (n) => Object.getPrototypeOf(n) === Fp;
function pb(n, e, t, i = !1) {
  const s = {}, o = zp();
  n.propsDefaults = /* @__PURE__ */ Object.create(null), Kp(n, e, s, o);
  for (const r in n.propsOptions[0])
    r in s || (s[r] = void 0);
  t ? n.props = i ? s : /* @__PURE__ */ P0(s) : n.type.props ? n.props = s : n.props = o, n.attrs = o;
}
function gb(n, e, t, i) {
  const {
    props: s,
    attrs: o,
    vnode: { patchFlag: r }
  } = n, l = /* @__PURE__ */ rt(s), [a] = n.propsOptions;
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
        if (ea(n.emitsOptions, f))
          continue;
        const d = e[f];
        if (a)
          if (dt(o, f))
            d !== o[f] && (o[f] = d, u = !0);
          else {
            const g = Mn(f);
            s[g] = bu(
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
    Kp(n, e, s, o) && (u = !0);
    let c;
    for (const h in l)
      (!e || // for camelCase
      !dt(e, h) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Li(h)) === h || !dt(e, c))) && (a ? t && // for camelCase
      (t[h] !== void 0 || // for kebab-case
      t[c] !== void 0) && (s[h] = bu(
        a,
        l,
        h,
        void 0,
        n,
        !0
      )) : delete s[h]);
    if (o !== l)
      for (const h in o)
        (!e || !dt(e, h)) && (delete o[h], u = !0);
  }
  u && yi(n.attrs, "set", "");
}
function Kp(n, e, t, i) {
  const [s, o] = n.propsOptions;
  let r = !1, l;
  if (e)
    for (let a in e) {
      if (Po(a))
        continue;
      const u = e[a];
      let c;
      s && dt(s, c = Mn(a)) ? !o || !o.includes(c) ? t[c] = u : (l || (l = {}))[c] = u : ea(n.emitsOptions, a) || (!(a in i) || u !== i[a]) && (i[a] = u, r = !0);
    }
  if (o) {
    const a = /* @__PURE__ */ rt(t), u = l || lt;
    for (let c = 0; c < o.length; c++) {
      const h = o[c];
      t[h] = bu(
        s,
        a,
        h,
        u[h],
        n,
        !dt(u, h)
      );
    }
  }
  return r;
}
function bu(n, e, t, i, s, o) {
  const r = n[t];
  if (r != null) {
    const l = dt(r, "default");
    if (l && i === void 0) {
      const a = r.default;
      if (r.type !== Function && !r.skipFactory && ht(a)) {
        const { propsDefaults: u } = s;
        if (t in u)
          i = u[t];
        else {
          const c = Oc(s);
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
    ] && (i === "" || i === Li(t)) && (i = !0));
  }
  return i;
}
function mb(n, e, t = !1) {
  const i = e.propsCache, s = i.get(n);
  if (s)
    return s;
  const o = n.props, r = {}, l = [];
  if (!o)
    return Ct(n) && i.set(n, bs), bs;
  if (He(o))
    for (let u = 0; u < o.length; u++) {
      const c = Mn(o[u]);
      Hh(c) && (r[c] = lt);
    }
  else if (o)
    for (const u in o) {
      const c = Mn(u);
      if (Hh(c)) {
        const h = o[u], f = r[c] = He(h) || ht(h) ? { type: h } : On({}, h), d = f.type;
        let g = !1, v = !0;
        if (He(d))
          for (let m = 0; m < d.length; ++m) {
            const x = d[m], O = ht(x) && x.name;
            if (O === "Boolean") {
              g = !0;
              break;
            } else O === "String" && (v = !1);
          }
        else
          g = ht(d) && d.name === "Boolean";
        f[
          0
          /* shouldCast */
        ] = g, f[
          1
          /* shouldCastTrue */
        ] = v, (g || dt(f, "default")) && l.push(c);
      }
    }
  const a = [r, l];
  return Ct(n) && i.set(n, a), a;
}
function Hh(n) {
  return n[0] !== "$" && !Po(n);
}
const Ac = (n) => n === "_" || n === "_ctx" || n === "$stable", Tc = (n) => He(n) ? n.map(ni) : [ni(n)], vb = (n, e, t) => {
  if (e._n)
    return e;
  const i = Ep((...s) => Tc(e(...s)), t);
  return i._c = !1, i;
}, Up = (n, e, t) => {
  const i = n._ctx;
  for (const s in n) {
    if (Ac(s)) continue;
    const o = n[s];
    if (ht(o))
      e[s] = vb(s, o, i);
    else if (o != null) {
      const r = Tc(o);
      e[s] = () => r;
    }
  }
}, jp = (n, e) => {
  const t = Tc(e);
  n.slots.default = () => t;
}, Gp = (n, e, t) => {
  for (const i in e)
    (t || !Ac(i)) && (n[i] = e[i]);
}, yb = (n, e, t) => {
  const i = n.slots = zp();
  if (n.vnode.shapeFlag & 32) {
    const s = e._;
    s ? (Gp(i, e, t), t && lp(i, "_", s, !0)) : Up(e, i);
  } else e && jp(n, e);
}, bb = (n, e, t) => {
  const { vnode: i, slots: s } = n;
  let o = !0, r = lt;
  if (i.shapeFlag & 32) {
    const l = e._;
    l ? t && l === 1 ? o = !1 : Gp(s, e, t) : (o = !e.$stable, Up(e, s)), r = e;
  } else e && (jp(n, e), r = { default: 1 });
  if (o)
    for (const l in s)
      !Ac(l) && r[l] == null && delete s[l];
}, un = Cb;
function xb(n) {
  return wb(n);
}
function wb(n, e) {
  const t = Yl();
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
    setScopeId: d = ks,
    insertStaticContent: g
  } = n, v = (S, b, $, I = null, _ = null, H = null, he = void 0, ie = null, oe = !!b.dynamicChildren) => {
    if (S === b)
      return;
    S && !wo(S, b) && (I = Z(S), X(S, _, H, !0), S = null), b.patchFlag === -2 && (oe = !1, b.dynamicChildren = null), b.dynamicChildren && S && S.dynamicChildren && S.dynamicChildren.hasOnce && (b.dynamicChildren === bs && (b.dynamicChildren = []), b.dynamicChildren.hasOnce = !0);
    const { type: J, ref: Ce, shapeFlag: fe } = b;
    switch (J) {
      case ta:
        m(S, b, $, I);
        break;
      case ci:
        x(S, b, $, I);
        break;
      case Na:
        S == null && O(b, $, I, he);
        break;
      case ve:
        D(
          S,
          b,
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
        fe & 1 ? R(
          S,
          b,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        ) : fe & 6 ? U(
          S,
          b,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe
        ) : (fe & 64 || fe & 128) && J.process(
          S,
          b,
          $,
          I,
          _,
          H,
          he,
          ie,
          oe,
          ut
        );
    }
    Ce != null && _ ? Vo(Ce, S && S.ref, H, b || S, !b) : Ce == null && S && S.ref != null && Vo(S.ref, null, H, S, !0);
  }, m = (S, b, $, I) => {
    if (S == null)
      i(
        b.el = l(b.children),
        $,
        I
      );
    else {
      const _ = b.el = S.el;
      b.children !== S.children && u(_, b.children);
    }
  }, x = (S, b, $, I) => {
    S == null ? i(
      b.el = a(b.children || ""),
      $,
      I
    ) : b.el = S.el;
  }, O = (S, b, $, I) => {
    [S.el, S.anchor] = g(
      S.children,
      b,
      $,
      I,
      S.el,
      S.anchor
    );
  }, L = ({ el: S, anchor: b }, $, I) => {
    let _;
    for (; S && S !== b; )
      _ = f(S), i(S, $, I), S = _;
    i(b, $, I);
  }, E = ({ el: S, anchor: b }) => {
    let $;
    for (; S && S !== b; )
      $ = f(S), s(S), S = $;
    s(b);
  }, R = (S, b, $, I, _, H, he, ie, oe) => {
    if (b.type === "svg" ? he = "svg" : b.type === "math" && (he = "mathml"), S == null)
      z(
        b,
        $,
        I,
        _,
        H,
        he,
        ie,
        oe
      );
    else {
      const J = S.el && S.el._isVueCE ? S.el : null;
      try {
        J && J._beginPatch(), K(
          S,
          b,
          _,
          H,
          he,
          ie,
          oe
        );
      } finally {
        J && J._endPatch();
      }
    }
  }, z = (S, b, $, I, _, H, he, ie) => {
    let oe, J;
    const { props: Ce, shapeFlag: fe, transition: Se, dirs: Me } = S;
    if (oe = S.el = r(
      S.type,
      H,
      Ce && Ce.is,
      Ce
    ), fe & 8 ? c(oe, S.children) : fe & 16 && q(
      S.children,
      oe,
      null,
      I,
      _,
      _a(S, H),
      he,
      ie
    ), Me && hs(S, null, I, "created"), P(oe, S, S.scopeId, he, I), Ce) {
      for (const je in Ce)
        je !== "value" && !Po(je) && o(oe, je, null, Ce[je], H, I);
      "value" in Ce && o(oe, "value", null, Ce.value, H), (J = Ce.onVnodeBeforeMount) && jn(J, I, S);
    }
    Me && hs(S, null, I, "beforeMount");
    const Ke = kb(_, Se);
    Ke && Se.beforeEnter(oe), i(oe, b, $), ((J = Ce && Ce.onVnodeMounted) || Ke || Me) && un(() => {
      J && jn(J, I, S), Ke && Se.enter(oe), Me && hs(S, null, I, "mounted");
    }, _);
  }, P = (S, b, $, I, _) => {
    if ($ && d(S, $), I)
      for (let H = 0; H < I.length; H++)
        d(S, I[H]);
    if (_) {
      let H = _.subTree;
      if (b === H || Jp(H.type) && (H.ssContent === b || H.ssFallback === b)) {
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
  }, q = (S, b, $, I, _, H, he, ie, oe = 0) => {
    for (let J = oe; J < S.length; J++) {
      const Ce = S[J] = ie ? vi(S[J]) : ni(S[J]);
      v(
        null,
        Ce,
        b,
        $,
        I,
        _,
        H,
        he,
        ie
      );
    }
  }, K = (S, b, $, I, _, H, he) => {
    const ie = b.el = S.el;
    let { patchFlag: oe, dynamicChildren: J, dirs: Ce } = b;
    oe |= S.patchFlag & 16;
    const fe = S.props || lt, Se = b.props || lt;
    let Me;
    if ($ && fs($, !1), (Me = Se.onVnodeBeforeUpdate) && jn(Me, $, b, S), Ce && hs(b, S, $, "beforeUpdate"), $ && fs($, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    J && (!S.dynamicChildren || S.dynamicChildren.length !== J.length) && (oe = 0, he = !1, J = null), (fe.innerHTML && Se.innerHTML == null || fe.textContent && Se.textContent == null) && c(ie, ""), J ? le(
      S.dynamicChildren,
      J,
      ie,
      $,
      I,
      _a(b, _),
      H
    ) : he || ze(
      S,
      b,
      ie,
      null,
      $,
      I,
      _a(b, _),
      H,
      !1
    ), oe > 0) {
      if (oe & 16)
        j(ie, fe, Se, $, _);
      else if (oe & 2 && fe.class !== Se.class && o(ie, "class", null, Se.class, _), oe & 4 && o(ie, "style", fe.style, Se.style, _), oe & 8) {
        const Ke = b.dynamicProps;
        for (let je = 0; je < Ke.length; je++) {
          const We = Ke[je], tt = fe[We], mt = Se[We];
          (mt !== tt || We === "value") && o(ie, We, tt, mt, _, $);
        }
      }
      oe & 1 && S.children !== b.children && c(ie, b.children);
    } else !he && J == null && j(ie, fe, Se, $, _);
    ((Me = Se.onVnodeUpdated) || Ce) && un(() => {
      Me && jn(Me, $, b, S), Ce && hs(b, S, $, "updated");
    }, I);
  }, le = (S, b, $, I, _, H, he) => {
    for (let ie = 0; ie < b.length; ie++) {
      const oe = S[ie], J = b[ie], Ce = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oe.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oe.type === ve || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !wo(oe, J) || // - In the case of a component, it could contain anything.
        oe.shapeFlag & 198) ? h(oe.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          $
        )
      );
      v(
        oe,
        J,
        Ce,
        null,
        I,
        _,
        H,
        he,
        !0
      );
    }
  }, j = (S, b, $, I, _) => {
    if (b !== $) {
      if (b !== lt)
        for (const H in b)
          !Po(H) && !(H in $) && o(
            S,
            H,
            b[H],
            null,
            _,
            I
          );
      for (const H in $) {
        if (Po(H)) continue;
        const he = $[H], ie = b[H];
        he !== ie && H !== "value" && o(S, H, ie, he, _, I);
      }
      "value" in $ && o(S, "value", b.value, $.value, _);
    }
  }, D = (S, b, $, I, _, H, he, ie, oe) => {
    const J = b.el = S ? S.el : l(""), Ce = b.anchor = S ? S.anchor : l("");
    let { patchFlag: fe, dynamicChildren: Se, slotScopeIds: Me } = b;
    Me && (ie = ie ? ie.concat(Me) : Me), S == null ? (i(J, $, I), i(Ce, $, I), q(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      b.children || [],
      $,
      Ce,
      _,
      H,
      he,
      ie,
      oe
    )) : fe > 0 && fe & 64 && Se && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    S.dynamicChildren && S.dynamicChildren.length === Se.length ? (le(
      S.dynamicChildren,
      Se,
      $,
      _,
      H,
      he,
      ie
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (b.key != null || _ && b === _.subTree) && qp(
      S,
      b,
      !0
      /* shallow */
    )) : ze(
      S,
      b,
      $,
      Ce,
      _,
      H,
      he,
      ie,
      oe
    );
  }, U = (S, b, $, I, _, H, he, ie, oe) => {
    b.slotScopeIds = ie, S == null ? b.shapeFlag & 512 ? _.ctx.activate(
      b,
      $,
      I,
      he,
      oe
    ) : ke(
      b,
      $,
      I,
      _,
      H,
      he,
      oe
    ) : Te(S, b, oe);
  }, ke = (S, b, $, I, _, H, he) => {
    const ie = S.component = Db(
      S,
      I,
      _
    );
    if (Rp(S) && (ie.ctx.renderer = ut), Ob(ie, !1, he), ie.asyncDep) {
      if (_ && _.registerDep(ie, ue, he), !S.el) {
        const oe = ie.subTree = Vt(ci);
        x(null, oe, b, $), S.placeholder = oe.el;
      }
    } else
      ue(
        ie,
        S,
        b,
        $,
        _,
        H,
        he
      );
  }, Te = (S, b, $) => {
    const I = b.component = S.component;
    if (fb(S, b, $))
      if (I.asyncDep && !I.asyncResolved) {
        b.el = S.el, pe(I, b, $);
        return;
      } else
        I.next = b, I.update();
    else
      b.el = S.el, I.vnode = b;
  }, ue = (S, b, $, I, _, H, he) => {
    const ie = () => {
      if (S.isMounted) {
        let { next: fe, bu: Se, u: Me, parent: Ke, vnode: je } = S;
        {
          const it = Yp(S);
          if (it) {
            fe && (fe.el = je.el, pe(S, fe, he)), it.asyncDep.then(() => {
              un(() => {
                S.isUnmounted || J();
              }, _);
            });
            return;
          }
        }
        let We = fe, tt;
        fs(S, !1), fe ? (fe.el = je.el, pe(S, fe, he)) : fe = je, Se && sl(Se), (tt = fe.props && fe.props.onVnodeBeforeUpdate) && jn(tt, Ke, fe, je), fs(S, !0);
        const mt = Nh(S), Rt = S.subTree;
        S.subTree = mt, v(
          Rt,
          mt,
          // parent may have changed if it's in a teleport
          h(Rt.el),
          // anchor may have changed if it's in a fragment
          Z(Rt),
          S,
          _,
          H
        ), fe.el = mt.el, We === null && db(S, mt.el), Me && un(Me, _), (tt = fe.props && fe.props.onVnodeUpdated) && un(
          () => jn(tt, Ke, fe, je),
          _
        );
      } else {
        let fe;
        const { el: Se, props: Me } = b, { bm: Ke, m: je, parent: We, root: tt, type: mt } = S, Rt = Gs(b);
        fs(S, !1), Ke && sl(Ke), !Rt && (fe = Me && Me.onVnodeBeforeMount) && jn(fe, We, b), fs(S, !0);
        {
          tt.ce && tt.ce._hasShadowRoot() && tt.ce._injectChildStyle(
            mt,
            S.parent ? S.parent.type : void 0
          );
          const it = S.subTree = Nh(S);
          v(
            null,
            it,
            $,
            I,
            S,
            _,
            H
          ), b.el = it.el;
        }
        if (je && un(je, _), !Rt && (fe = Me && Me.onVnodeMounted)) {
          const it = b;
          un(
            () => jn(fe, We, it),
            _
          );
        }
        (b.shapeFlag & 256 || We && Gs(We.vnode) && We.vnode.shapeFlag & 256) && S.a && un(S.a, _), S.isMounted = !0, b = $ = I = null;
      }
    };
    S.scope.on();
    const oe = S.effect = new hp(ie);
    S.scope.off();
    const J = S.update = oe.run.bind(oe), Ce = S.job = oe.runIfDirty.bind(oe);
    Ce.i = S, Ce.id = S.uid, oe.scheduler = () => Cc(Ce), fs(S, !0), J();
  }, pe = (S, b, $) => {
    b.component = S;
    const I = S.vnode.props;
    S.vnode = b, S.next = null, gb(S, b.props, I, $), bb(S, b.children, $), Ji(), Ih(S), Zi();
  }, ze = (S, b, $, I, _, H, he, ie, oe = !1) => {
    const J = S && S.children, Ce = S ? S.shapeFlag : 0, fe = b.children, { patchFlag: Se, shapeFlag: Me } = b;
    if (Se > 0) {
      if (Se & 128) {
        Pe(
          J,
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
      } else if (Se & 256) {
        Be(
          J,
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
    Me & 8 ? (Ce & 16 && se(J, _, H), fe !== J && c($, fe)) : Ce & 16 ? Me & 16 ? Pe(
      J,
      fe,
      $,
      I,
      _,
      H,
      he,
      ie,
      oe
    ) : se(J, _, H, !0) : (Ce & 8 && c($, ""), Me & 16 && q(
      fe,
      $,
      I,
      _,
      H,
      he,
      ie,
      oe
    ));
  }, Be = (S, b, $, I, _, H, he, ie, oe) => {
    S = S || bs, b = b || bs;
    const J = S.length, Ce = b.length, fe = Math.min(J, Ce);
    let Se;
    for (Se = 0; Se < fe; Se++) {
      const Me = b[Se] = oe ? vi(b[Se]) : ni(b[Se]);
      v(
        S[Se],
        Me,
        $,
        null,
        _,
        H,
        he,
        ie,
        oe
      );
    }
    J > Ce ? se(
      S,
      _,
      H,
      !0,
      !1,
      fe
    ) : q(
      b,
      $,
      I,
      _,
      H,
      he,
      ie,
      oe,
      fe
    );
  }, Pe = (S, b, $, I, _, H, he, ie, oe) => {
    let J = 0;
    const Ce = b.length;
    let fe = S.length - 1, Se = Ce - 1;
    for (; J <= fe && J <= Se; ) {
      const Me = S[J], Ke = b[J] = oe ? vi(b[J]) : ni(b[J]);
      if (wo(Me, Ke))
        v(
          Me,
          Ke,
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
      J++;
    }
    for (; J <= fe && J <= Se; ) {
      const Me = S[fe], Ke = b[Se] = oe ? vi(b[Se]) : ni(b[Se]);
      if (wo(Me, Ke))
        v(
          Me,
          Ke,
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
      fe--, Se--;
    }
    if (J > fe) {
      if (J <= Se) {
        const Me = Se + 1, Ke = Me < Ce ? b[Me].el : I;
        for (; J <= Se; )
          v(
            null,
            b[J] = oe ? vi(b[J]) : ni(b[J]),
            $,
            Ke,
            _,
            H,
            he,
            ie,
            oe
          ), J++;
      }
    } else if (J > Se)
      for (; J <= fe; )
        X(S[J], _, H, !0), J++;
    else {
      const Me = J, Ke = J, je = /* @__PURE__ */ new Map();
      for (J = Ke; J <= Se; J++) {
        const At = b[J] = oe ? vi(b[J]) : ni(b[J]);
        At.key != null && je.set(At.key, J);
      }
      let We, tt = 0;
      const mt = Se - Ke + 1;
      let Rt = !1, it = 0;
      const pn = new Array(mt);
      for (J = 0; J < mt; J++) pn[J] = 0;
      for (J = Me; J <= fe; J++) {
        const At = S[J];
        if (tt >= mt) {
          X(At, _, H, !0);
          continue;
        }
        let Ht;
        if (At.key != null)
          Ht = je.get(At.key);
        else
          for (We = Ke; We <= Se; We++)
            if (pn[We - Ke] === 0 && wo(At, b[We])) {
              Ht = We;
              break;
            }
        Ht === void 0 ? X(At, _, H, !0) : (pn[Ht - Ke] = J + 1, Ht >= it ? it = Ht : Rt = !0, v(
          At,
          b[Ht],
          $,
          null,
          _,
          H,
          he,
          ie,
          oe
        ), tt++);
      }
      const En = Rt ? Sb(pn) : bs;
      for (We = En.length - 1, J = mt - 1; J >= 0; J--) {
        const At = Ke + J, Ht = b[At], fi = b[At + 1], Tt = At + 1 < Ce ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          fi.el || Xp(fi)
        ) : I;
        pn[J] === 0 ? v(
          null,
          Ht,
          $,
          Tt,
          _,
          H,
          he,
          ie,
          oe
        ) : Rt && (We < 0 || J !== En[We] ? Ee(Ht, $, Tt, 2) : We--);
      }
    }
  }, Ee = (S, b, $, I, _ = null) => {
    const { el: H, type: he, transition: ie, children: oe, shapeFlag: J } = S;
    if (J & 6) {
      Ee(S.component.subTree, b, $, I);
      return;
    }
    if (J & 128) {
      S.suspense.move(b, $, I);
      return;
    }
    if (J & 64) {
      he.move(S, b, $, ut);
      return;
    }
    if (he === ve) {
      i(H, b, $);
      for (let fe = 0; fe < oe.length; fe++)
        Ee(oe[fe], b, $, I);
      i(S.anchor, b, $);
      return;
    }
    if (he === Na) {
      L(S, b, $);
      return;
    }
    if (I !== 2 && J & 1 && ie)
      if (I === 0)
        ie.persisted && !H[Ra] ? i(H, b, $) : (ie.beforeEnter(H), i(H, b, $), un(() => ie.enter(H), _));
      else {
        const { leave: fe, delayLeave: Se, afterLeave: Me } = ie, Ke = () => {
          S.ctx.isUnmounted ? s(H) : i(H, b, $);
        }, je = () => {
          const We = H._isLeaving || !!H[Ra];
          H._isLeaving && H[Ra](
            !0
            /* cancelled */
          ), ie.persisted && !We ? Ke() : fe(H, () => {
            Ke(), Me && Me();
          });
        };
        Se ? Se(H, Ke, je) : je();
      }
    else
      i(H, b, $);
  }, X = (S, b, $, I = !1, _ = !1) => {
    const {
      type: H,
      props: he,
      ref: ie,
      children: oe,
      dynamicChildren: J,
      shapeFlag: Ce,
      patchFlag: fe,
      dirs: Se,
      cacheIndex: Me,
      memo: Ke
    } = S;
    if ((fe === -2 || J && J.hasOnce) && (_ = !1), ie != null && (Ji(), Vo(ie, null, $, S, !0), Zi()), Me != null && (!S.ctx || S.ctx === b) && (b.renderCache[Me] = void 0), Ce & 256) {
      b.ctx.deactivate(S);
      return;
    }
    const je = Ce & 1 && Se, We = !Gs(S);
    let tt;
    if (We && (tt = he && he.onVnodeBeforeUnmount) && jn(tt, b, S), Ce & 6)
      Re(S.component, $, I);
    else {
      if (Ce & 128) {
        S.suspense.unmount($, I);
        return;
      }
      je && hs(S, null, b, "beforeUnmount"), Ce & 64 ? S.type.remove(
        S,
        b,
        $,
        ut,
        I
      ) : J && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !J.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (H !== ve || fe > 0 && fe & 64) ? se(
        J,
        b,
        $,
        !1,
        !0
      ) : (H === ve && fe & 384 || !_ && Ce & 16) && se(oe, b, $), I && at(S);
    }
    const mt = Ke != null && Me == null;
    (We && (tt = he && he.onVnodeUnmounted) || je || mt) && un(() => {
      tt && jn(tt, b, S), je && hs(S, null, b, "unmounted"), mt && (S.el = null);
    }, $);
  }, at = (S) => {
    const { type: b, el: $, anchor: I, transition: _ } = S;
    if (b === ve) {
      be($, I);
      return;
    }
    if (b === Na) {
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
  }, be = (S, b) => {
    let $;
    for (; S !== b; )
      $ = f(S), s(S), S = $;
    s(b);
  }, Re = (S, b, $) => {
    const { bum: I, scope: _, job: H, subTree: he, um: ie, m: oe, a: J } = S;
    Fh(oe), Fh(J), I && sl(I), _.stop(), H ? (H.flags |= 8, X(he, S, b, $)) : S.vnode.el && he && (he.transition = S.vnode.transition, X(he, S, b, $)), ie && un(ie, b), un(() => {
      S.isUnmounted = !0;
    }, b);
  }, se = (S, b, $, I = !1, _ = !1, H = 0) => {
    for (let he = H; he < S.length; he++)
      X(S[he], b, $, I, _);
  }, Z = (S) => {
    if (S.shapeFlag & 6)
      return Z(S.component.subTree);
    if (S.shapeFlag & 128)
      return S.suspense.next();
    const b = f(S.anchor || S.el), $ = b && b[Q0];
    return $ ? f($) : b;
  };
  let te = !1;
  const Ze = (S, b, $) => {
    let I;
    S == null ? b._vnode && (X(b._vnode, null, null, !0), I = b._vnode.component) : v(
      b._vnode || null,
      S,
      b,
      null,
      null,
      null,
      $
    ), b._vnode = S, te || (te = !0, Ih(I), Dp(), te = !1);
  }, ut = {
    p: v,
    um: X,
    m: Ee,
    r: at,
    mt: ke,
    mc: q,
    pc: ze,
    pbc: le,
    n: Z,
    o: n
  };
  return {
    render: Ze,
    hydrate: void 0,
    createApp: lb(Ze)
  };
}
function _a({ type: n, props: e }, t) {
  return t === "svg" && n === "foreignObject" || t === "mathml" && n === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : t;
}
function fs({ effect: n, job: e }, t) {
  t ? (n.flags |= 32, e.flags |= 4) : (n.flags &= -33, e.flags &= -5);
}
function kb(n, e) {
  return (!n || n && !n.pendingBranch) && e && !e.persisted;
}
function qp(n, e, t = !1) {
  const i = n.children, s = e.children;
  if (He(i) && He(s))
    for (let o = 0; o < i.length; o++) {
      const r = i[o];
      let l = s[o];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = s[o] = vi(s[o]), l.el = r.el), !t && l.patchFlag !== -2 && qp(r, l)), l.type === ta && (l.patchFlag === -1 && (l = s[o] = vi(l)), l.el = r.el), l.type === ci && !l.el && (l.el = r.el);
    }
}
function Sb(n) {
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
function Yp(n) {
  const e = n.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : Yp(e);
}
function Fh(n) {
  if (n)
    for (let e = 0; e < n.length; e++)
      n[e].flags |= 8;
}
function Xp(n) {
  if (n.placeholder)
    return n.placeholder;
  const e = n.component;
  return e ? Xp(e.subTree) : null;
}
const Jp = (n) => n.__isSuspense;
function Cb(n, e) {
  e && e.pendingBranch ? He(n) ? e.effects.push(...n) : e.effects.push(n) : q0(n);
}
const ve = /* @__PURE__ */ Symbol.for("v-fgt"), ta = /* @__PURE__ */ Symbol.for("v-txt"), ci = /* @__PURE__ */ Symbol.for("v-cmt"), Na = /* @__PURE__ */ Symbol.for("v-stc"), Ci = [];
let mn = null;
function w(n = !1) {
  Ci.push(mn = n ? null : []);
}
function $c() {
  Ci.pop(), mn = Ci[Ci.length - 1] || null;
}
let Zo = 1;
function zh(n, e = !1) {
  Zo += n, n < 0 && mn && e && (mn.hasOnce = !0);
}
function Zp(n) {
  return n.dynamicChildren = Zo > 0 ? mn || bs : null, $c(), Zo > 0 && mn && mn.push(n), n;
}
function A(n, e, t, i, s, o) {
  return Zp(
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
function wn(n, e, t, i, s) {
  return Zp(
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
function Dc(n) {
  return n ? n.__v_isVNode === !0 : !1;
}
function wo(n, e) {
  return n.type === e.type && n.key === e.key;
}
const Qp = ({ key: n }) => n ?? null, ol = ({
  ref: n,
  ref_key: e,
  ref_for: t
}) => (typeof n == "number" && (n = "" + n), n != null ? It(n) || /* @__PURE__ */ sn(n) || ht(n) ? { i: Xt, r: n, k: e, f: !!t } : n : null);
function p(n, e = null, t = null, i = 0, s = null, o = n === ve ? 0 : 1, r = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: n,
    props: e,
    key: e && Qp(e),
    ref: e && ol(e),
    scopeId: Lp,
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
  return l ? (kl(a, t), o & 128 && n.normalize(a)) : t && (a.shapeFlag |= It(t) ? 8 : 16), Zo > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  mn && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && mn.push(a), a;
}
const Vt = Mb;
function Mb(n, e = null, t = null, i = 0, s = null, o = !1) {
  if ((!n || n === ib) && (n = ci), Dc(n)) {
    const l = to(
      n,
      e,
      !0
      /* mergeRef: true */
    );
    return t && kl(l, t), Zo > 0 && !o && mn && (l.shapeFlag & 6 ? mn[mn.indexOf(n)] = l : mn.push(l)), l.patchFlag = -2, l;
  }
  if (Ib(n) && (n = n.__vccOpts), e) {
    e = Ab(e);
    let { class: l, style: a } = e;
    l && !It(l) && (e.class = Xe(l)), Ct(a) && (/* @__PURE__ */ Sc(a) && !He(a) && (a = On({}, a)), e.style = Si(a));
  }
  const r = It(n) ? 1 : Jp(n) ? 128 : Ql(n) ? 64 : Ct(n) ? 4 : ht(n) ? 2 : 0;
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
function Ab(n) {
  return n ? /* @__PURE__ */ Sc(n) || Wp(n) ? On({}, n) : n : null;
}
function to(n, e, t = !1, i = !1) {
  const { props: s, ref: o, patchFlag: r, children: l, transition: a } = n, u = e ? Do(s || {}, e) : s, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: n.type,
    props: u,
    key: u && Qp(u),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      t && o ? He(o) ? o.concat(ol(e)) : [o, ol(e)] : ol(e)
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
    patchFlag: e && n.type !== ve ? r === -1 ? 16 : r | 16 : r,
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
    ssContent: n.ssContent && to(n.ssContent),
    ssFallback: n.ssFallback && to(n.ssFallback),
    placeholder: n.placeholder,
    el: n.el,
    anchor: n.anchor,
    ctx: n.ctx,
    ce: n.ce,
    cacheIndex: n.cacheIndex
  };
  return a && i && Mc(
    c,
    a.clone(c)
  ), c;
}
function ye(n = " ", e = 0) {
  return Vt(ta, null, n, e);
}
function Q(n = "", e = !1) {
  return e ? (w(), wn(ci, null, n)) : Vt(ci, null, n);
}
function ni(n) {
  return n == null || typeof n == "boolean" ? Vt(ci) : He(n) ? Vt(
    ve,
    null,
    // #3666, avoid reference pollution when reusing vnode
    n.slice()
  ) : Dc(n) ? vi(n) : Vt(ta, null, String(n));
}
function vi(n) {
  return n.el === null && n.patchFlag !== -1 || n.memo ? n : to(n);
}
function kl(n, e) {
  let t = 0;
  const { shapeFlag: i } = n;
  if (e == null)
    e = null;
  else if (He(e))
    t = 16;
  else if (typeof e == "object")
    if (i & 65) {
      const s = e.default;
      s && (s._c && (s._d = !1), kl(n, s()), s._c && (s._d = !0));
      return;
    } else {
      t = 32;
      const s = e._;
      !s && !Wp(e) ? e._ctx = Xt : s === 3 && Xt && (Xt.slots._ === 1 ? e._ = 1 : (e._ = 2, n.patchFlag |= 1024));
    }
  else if (ht(e)) {
    if (i & 65) {
      kl(n, { default: e });
      return;
    }
    e = { default: e, _ctx: Xt }, t = 32;
  } else
    e = String(e), i & 64 ? (t = 16, e = [ye(e)]) : t = 8;
  n.children = e, n.shapeFlag |= t;
}
function Do(...n) {
  const e = {};
  for (let t = 0; t < n.length; t++) {
    const i = n[t];
    for (const s in i)
      if (s === "class")
        e.class !== i.class && (e.class = Xe([e.class, i.class]));
      else if (s === "style")
        e.style = Si([e.style, i.style]);
      else if (Ul(s)) {
        const o = e[s], r = i[s];
        r && o !== r && !(He(o) && o.includes(r)) ? e[s] = o ? [].concat(o, r) : r : r == null && o == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !jl(s) && (e[s] = r);
      } else s !== "" && (e[s] = i[s]);
  }
  return e;
}
function jn(n, e, t, i = null) {
  ui(n, e, 7, [
    t,
    i
  ]);
}
const Tb = Np();
let $b = 0;
function Db(n, e, t) {
  const i = n.type, s = (e ? e.appContext : n.appContext) || Tb, o = {
    uid: $b++,
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
    scope: new v0(
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
    propsOptions: mb(i, s),
    emitsOptions: ub(i, s),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: lt,
    // inheritAttrs
    inheritAttrs: i.inheritAttrs,
    // state
    ctx: lt,
    data: lt,
    props: lt,
    attrs: lt,
    slots: lt,
    refs: lt,
    setupState: lt,
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
  return o.ctx = { _: o }, o.root = e ? e.root : o, o.emit = ab.bind(null, o), n.ce && n.ce(o), o;
}
let es = null;
const eg = () => es || Xt;
let Sl, Qo;
{
  const n = Yl(), e = (t, i) => {
    let s;
    return (s = n[t]) || (s = n[t] = []), s.push(i), (o) => {
      s.length > 1 ? s.forEach((r) => r(o)) : s[0](o);
    };
  };
  Sl = e(
    "__VUE_INSTANCE_SETTERS__",
    (t) => es = t
  ), Qo = e(
    "__VUE_SSR_SETTERS__",
    (t) => er = t
  );
}
const Oc = (n) => {
  const e = es;
  return Sl(n), n.scope.on(), () => {
    n.scope.off(), Sl(e);
  };
}, Wh = () => {
  es && es.scope.off(), Sl(null);
};
function tg(n) {
  return n.vnode.shapeFlag & 4;
}
let er = !1;
function Ob(n, e = !1, t = !1) {
  e && Qo(e);
  const { props: i, children: s } = n.vnode, o = tg(n);
  pb(n, i, o, e), yb(n, s, t || e);
  const r = o ? Lb(n, e) : void 0;
  return e && Qo(!1), r;
}
function Lb(n, e) {
  const t = n.type;
  n.accessCache = /* @__PURE__ */ Object.create(null), n.proxy = new Proxy(n.ctx, ob);
  const { setup: i } = t;
  if (i) {
    Ji();
    const s = n.setupContext = i.length > 1 ? Bb(n) : null, o = Oc(n), r = mr(
      i,
      n,
      0,
      [
        n.props,
        s
      ]
    ), l = ip(r);
    if (Zi(), o(), (l || n.sp) && !Gs(n) && tb(n), l) {
      if (r.then(Wh, Wh), e)
        return r.then((a) => {
          Qo(!0);
          try {
            Kh(n, a, e);
          } finally {
            Qo(!1);
          }
        }).catch((a) => {
          Zl(a, n, 0);
        });
      n.asyncDep = r;
    } else
      Kh(n, r);
  } else
    ng(n);
}
function Kh(n, e, t) {
  ht(e) ? n.type.__ssrInlineRender ? n.ssrRender = e : n.render = e : Ct(e) && (n.setupState = Ap(e)), ng(n);
}
function ng(n, e, t) {
  const i = n.type;
  n.render || (n.render = i.render || ks);
}
const Eb = {
  get(n, e) {
    return Yt(n, "get", ""), n[e];
  }
};
function Bb(n) {
  const e = (t) => {
    n.exposed = t || {};
  };
  return {
    attrs: new Proxy(n.attrs, Eb),
    slots: n.slots,
    emit: n.emit,
    expose: e
  };
}
function na(n) {
  return n.exposed ? n.exposeProxy || (n.exposeProxy = new Proxy(Ap(_0(n.exposed)), {
    get(e, t) {
      if (t in e)
        return e[t];
      if (t in Ho)
        return Ho[t](n);
    },
    has(e, t) {
      return t in e || t in Ho;
    }
  })) : n.proxy;
}
function Ib(n) {
  return ht(n) && "__vccOpts" in n;
}
const N = (n, e) => /* @__PURE__ */ W0(n, e, er), Rb = "3.5.43";
let xu;
const Uh = typeof window < "u" && window.trustedTypes;
if (Uh)
  try {
    xu = /* @__PURE__ */ Uh.createPolicy("vue", {
      createHTML: (n) => n
    });
  } catch {
  }
const ig = xu ? (n) => xu.createHTML(n) : (n) => n, Pb = "http://www.w3.org/2000/svg", _b = "http://www.w3.org/1998/Math/MathML", mi = typeof document < "u" ? document : null, jh = mi && /* @__PURE__ */ mi.createElement("template"), Nb = {
  insert: (n, e, t) => {
    e.insertBefore(n, t || null);
  },
  remove: (n) => {
    const e = n.parentNode;
    e && e.removeChild(n);
  },
  createElement: (n, e, t, i) => {
    const s = e === "svg" ? mi.createElementNS(Pb, n) : e === "mathml" ? mi.createElementNS(_b, n) : t ? mi.createElement(n, { is: t }) : mi.createElement(n);
    return n === "select" && i && i.multiple != null && s.setAttribute("multiple", i.multiple), s;
  },
  createText: (n) => mi.createTextNode(n),
  createComment: (n) => mi.createComment(n),
  setText: (n, e) => {
    n.nodeValue = e;
  },
  setElementText: (n, e) => {
    n.textContent = e;
  },
  parentNode: (n) => n.parentNode,
  nextSibling: (n) => n.nextSibling,
  querySelector: (n) => mi.querySelector(n),
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
      jh.innerHTML = ig(
        i === "svg" ? `<svg>${n}</svg>` : i === "mathml" ? `<math>${n}</math>` : n
      );
      const l = jh.content;
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
}, Vb = /* @__PURE__ */ Symbol("_vtc");
function Hb(n, e, t) {
  const i = n[Vb];
  i && (e = (e ? [e, ...i] : [...i]).join(" ")), e == null ? n.removeAttribute("class") : t ? n.setAttribute("class", e) : n.className = e;
}
const Gh = /* @__PURE__ */ Symbol("_vod"), Fb = /* @__PURE__ */ Symbol("_vsh"), zb = /* @__PURE__ */ Symbol(""), Wb = /(?:^|;)\s*display\s*:/;
function Kb(n, e, t) {
  const i = n.style, s = It(t);
  let o = !1;
  if (t && !s) {
    if (e)
      if (It(e))
        for (const r of e.split(";")) {
          const l = r.slice(0, r.indexOf(":")).trim();
          t[l] == null && Oo(i, l, "");
        }
      else
        for (const r in e)
          t[r] == null && Oo(i, r, "");
    for (const r in t) {
      r === "display" && (o = !0);
      const l = t[r];
      l != null ? jb(
        n,
        r,
        !It(e) && e ? e[r] : void 0,
        l
      ) || Oo(i, r, l) : Oo(i, r, "");
    }
  } else if (s) {
    if (e !== t) {
      const r = i[zb];
      r && (t += ";" + r), i.cssText = t, o = Wb.test(t);
    }
  } else e && n.removeAttribute("style");
  Gh in n && (n[Gh] = o ? i.display : "", n[Fb] && (i.display = "none"));
}
const Dr = /\s*!important$/;
function Oo(n, e, t) {
  if (He(t))
    t.forEach((i) => Oo(n, e, i));
  else if (t == null && (t = ""), e.startsWith("--"))
    Dr.test(t) ? n.setProperty(e, t.replace(Dr, ""), "important") : n.setProperty(e, t);
  else {
    const i = Ub(n, e);
    Dr.test(t) ? n.setProperty(
      Li(i),
      t.replace(Dr, ""),
      "important"
    ) : n[i] = t;
  }
}
const qh = ["Webkit", "Moz", "ms"], Va = {};
function Ub(n, e) {
  const t = Va[e];
  if (t)
    return t;
  let i = Mn(e);
  if (i !== "filter" && i in n)
    return Va[e] = i;
  i = rp(i);
  for (let s = 0; s < qh.length; s++) {
    const o = qh[s] + i;
    if (o in n)
      return Va[e] = o;
  }
  return e;
}
function jb(n, e, t, i) {
  return n.tagName === "TEXTAREA" && (e === "width" || e === "height") && It(i) && t === i;
}
const Yh = "http://www.w3.org/1999/xlink";
function Xh(n, e, t, i, s, o = p0(e)) {
  i && e.startsWith("xlink:") ? t == null ? n.removeAttributeNS(Yh, e.slice(6, e.length)) : n.setAttributeNS(Yh, e, t) : t == null || o && !ap(t) ? n.removeAttribute(e) : n.setAttribute(
    e,
    o ? "" : Fn(t) ? String(t) : t
  );
}
function Jh(n, e, t, i, s) {
  if (e === "innerHTML" || e === "textContent") {
    t != null && (n[e] = e === "innerHTML" ? ig(t) : t);
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
    l === "boolean" ? t = ap(t) : t == null && l === "string" ? (t = "", r = !0) : l === "number" && (t = 0, r = !0);
  }
  try {
    n[e] = t;
  } catch {
  }
  r && n.removeAttribute(s || e);
}
function Wi(n, e, t, i) {
  n.addEventListener(e, t, i);
}
function Gb(n, e, t, i) {
  n.removeEventListener(e, t, i);
}
const Zh = /* @__PURE__ */ Symbol("_vei");
function qb(n, e, t, i, s = null) {
  const o = n[Zh] || (n[Zh] = {}), r = o[e];
  if (i && r)
    r.value = i;
  else {
    const [l, a] = Jb(e);
    if (i) {
      const u = o[e] = e1(
        i,
        s
      );
      Wi(n, l, u, a);
    } else r && (Gb(n, l, r, a), o[e] = void 0);
  }
}
const Yb = /(Once|Passive|Capture)$/, Xb = /^on:?(?:Once|Passive|Capture)$/;
function Jb(n) {
  let e, t;
  for (; (t = n.match(Yb)) && !Xb.test(n); )
    e || (e = {}), n = n.slice(0, n.length - t[1].length), e[t[1].toLowerCase()] = !0;
  return [n[2] === ":" ? n.slice(3) : Li(n.slice(2)), e];
}
let Ha = 0;
const Zb = /* @__PURE__ */ Promise.resolve(), Qb = () => Ha || (Zb.then(() => Ha = 0), Ha = Date.now());
function e1(n, e) {
  const t = (i) => {
    if (!i._vts)
      i._vts = Date.now();
    else if (i._vts <= t.attached)
      return;
    const s = t.value;
    if (He(s)) {
      const o = i.stopImmediatePropagation;
      i.stopImmediatePropagation = () => {
        o.call(i), i._stopped = !0;
      };
      const r = s.slice(), l = [i];
      for (let a = 0; a < r.length && !i._stopped; a++) {
        const u = r[a];
        u && ui(
          u,
          e,
          5,
          l
        );
      }
    } else
      ui(
        s,
        e,
        5,
        [i]
      );
  };
  return t.value = n, t.attached = Qb(), t;
}
const Qh = (n) => n.charCodeAt(0) === 111 && n.charCodeAt(1) === 110 && // lowercase letter
n.charCodeAt(2) > 96 && n.charCodeAt(2) < 123, t1 = (n, e, t, i, s, o) => {
  const r = s === "svg";
  e === "class" ? Hb(n, i, r) : e === "style" ? Kb(n, t, i) : Ul(e) ? jl(e) || qb(n, e, t, i, o) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : n1(n, e, i, r)) ? (Jh(n, e, i), !n.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && Xh(n, e, i, r, o, e !== "value")) : /* #11081 force set props for possible async custom element */ n._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (i1(n, e) || // @ts-expect-error _def is private
  n._def.__asyncLoader && (/[A-Z]/.test(e) || !It(i))) ? Jh(n, Mn(e), i, o, e) : (e === "true-value" ? n._trueValue = i : e === "false-value" && (n._falseValue = i), Xh(n, e, i, r));
};
function n1(n, e, t, i) {
  if (i)
    return !!(e === "innerHTML" || e === "textContent" || e in n && Qh(e) && ht(t));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && n.tagName === "IFRAME" || e === "form" || e === "list" && n.tagName === "INPUT" || e === "type" && n.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const s = n.tagName;
    if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE")
      return !1;
  }
  return Qh(e) && It(t) ? !1 : e in n;
}
function i1(n, e) {
  const t = (
    // @ts-expect-error _def is private
    n._def.props
  );
  if (!t)
    return !1;
  const i = Mn(e);
  return Array.isArray(t) ? t.some((s) => Mn(s) === i) : Object.keys(t).some((s) => Mn(s) === i);
}
const no = (n) => {
  const e = n.props["onUpdate:modelValue"] || !1;
  return He(e) ? (t) => sl(e, t) : e;
};
function s1(n) {
  n.target.composing = !0;
}
function ef(n) {
  const e = n.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const ri = /* @__PURE__ */ Symbol("_assign"), Or = /* @__PURE__ */ Symbol("_initialValue");
function Fa(n, e, t) {
  return e && (n = n.trim()), t && (n = ql(n)), n;
}
const Nt = {
  created(n, { modifiers: { lazy: e, trim: t, number: i } }, s) {
    n.parentNode && (n.type === "text" ? n[Or] = n.defaultValue.replace(/[\r\n]/g, "") : n.type === "textarea" && (n[Or] = n.defaultValue.replace(/\r\n?/g, `
`))), n[ri] = no(s);
    const o = i || s.props && s.props.type === "number";
    Wi(n, e ? "change" : "input", (r) => {
      r.target.composing || n[ri](Fa(n.value, t, o));
    }), (t || o) && Wi(n, "change", () => {
      n.value = Fa(n.value, t, o);
    }), e || (Wi(n, "compositionstart", s1), Wi(n, "compositionend", ef), Wi(n, "change", ef));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(n, { value: e, modifiers: { trim: t, number: i } }) {
    const s = e ?? "", o = n[Or];
    delete n[Or], o !== void 0 && (n.type === "text" || n.type === "textarea") && n.value !== o ? n[ri](Fa(n.value, t, i)) : n.value = s;
  },
  beforeUpdate(n, { value: e, oldValue: t, modifiers: { lazy: i, trim: s, number: o } }, r) {
    if (n[ri] = no(r), n.composing) return;
    const l = (o || n.type === "number") && !/^0\d/.test(n.value) ? ql(n.value) : n.value, a = e ?? "";
    if (l === a)
      return;
    const u = n.getRootNode();
    (u instanceof Document || u instanceof ShadowRoot) && u.activeElement === n && n.type !== "range" && (i && e === t || s && n.value.trim() === a) || (n.value = a);
  }
}, cn = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(n, e, t) {
    n[ri] = no(t), Wi(n, "change", () => {
      const i = n._modelValue, s = tr(n), o = n.checked, r = n[ri];
      if (He(i)) {
        const l = vc(i, s), a = l !== -1;
        if (o && !a)
          r(i.concat(s));
        else if (!o && a) {
          const u = [...i];
          u.splice(l, 1), r(u);
        }
      } else if (Ti(i)) {
        const l = new Set(i);
        o ? l.add(s) : l.delete(s), r(l);
      } else
        r(sg(n, o));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: tf,
  beforeUpdate(n, e, t) {
    n[ri] = no(t), tf(n, e, t);
  }
};
function tf(n, { value: e, oldValue: t }, i) {
  n._modelValue = e;
  let s;
  if (He(e))
    s = vc(e, i.props.value) > -1;
  else if (Ti(e))
    s = e.has(i.props.value);
  else {
    if (e === t) return;
    s = $i(e, sg(n, !0));
  }
  n.checked !== s && (n.checked = s);
}
const ts = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(n, { value: e, modifiers: { number: t } }, i) {
    n._modelValue = e, Wi(n, "change", () => {
      const s = Array.prototype.filter.call(n.options, (a) => a.selected).map(
        (a) => t ? ql(tr(a)) : tr(a)
      ), o = n.multiple, r = o ? Ti(n._modelValue) ? new Set(s) : s : s[0], l = n._pendingValue = [
        o,
        o ? He(r) ? s.slice() : s : r
      ];
      try {
        n[ri](r);
      } finally {
        In(() => {
          n._pendingValue === l && (n._pendingValue = void 0);
        });
      }
    }), n[ri] = no(i);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(n, { value: e }) {
    nf(n, e);
  },
  beforeUpdate(n, { value: e }, t) {
    n._modelValue = e, n[ri] = no(t);
  },
  updated(n, { value: e }) {
    const t = n._pendingValue;
    n._pendingValue = void 0, (!t || t[0] !== n.multiple || !o1(e, t[1], t[0])) && nf(n, e);
  }
};
function o1(n, e, t) {
  if (!t || He(n)) return $i(n, e);
  if (Ti(n)) {
    if (n.size !== e.length) return !1;
    for (const i of e)
      if (!n.has(i)) return !1;
    return !0;
  }
  return !1;
}
function nf(n, e) {
  const t = n.multiple, i = He(e);
  if (!(t && !i && !Ti(e))) {
    for (let s = 0, o = n.options.length; s < o; s++) {
      const r = n.options[s], l = tr(r);
      if (t)
        if (i) {
          const a = typeof l;
          a === "string" || a === "number" ? r.selected = e.some((u) => String(u) === String(l)) : r.selected = vc(e, l) > -1;
        } else
          r.selected = e.has(l);
      else if ($i(tr(r), e)) {
        n.selectedIndex !== s && (n.selectedIndex = s);
        return;
      }
    }
    !t && n.selectedIndex !== -1 && (n.selectedIndex = -1);
  }
}
function tr(n) {
  return "_value" in n ? n._value : n.value;
}
function sg(n, e) {
  const t = e ? "_trueValue" : "_falseValue";
  return t in n ? n[t] : e;
}
const r1 = ["ctrl", "shift", "alt", "meta"], l1 = {
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
  exact: (n, e) => r1.some((t) => n[`${t}Key`] && !e.includes(t))
}, ct = (n, e) => {
  if (!n) return n;
  const t = n._withMods || (n._withMods = {}), i = e.join(".");
  return t[i] || (t[i] = ((s, ...o) => {
    for (let r = 0; r < e.length; r++) {
      const l = l1[e[r]];
      if (l && l(s, e)) return;
    }
    return n(s, ...o);
  }));
}, a1 = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, $t = (n, e) => {
  const t = n._withKeys || (n._withKeys = {}), i = e.join(".");
  return t[i] || (t[i] = ((s) => {
    if (!("key" in s))
      return;
    const o = Li(s.key);
    if (e.some(
      (r) => r === o || a1[r] === o
    ))
      return n(s);
  }));
}, u1 = /* @__PURE__ */ On({ patchProp: t1 }, Nb);
let sf;
function c1() {
  return sf || (sf = xb(u1));
}
const h1 = ((...n) => {
  const e = c1().createApp(...n), { mount: t } = e;
  return e.mount = (i) => {
    const s = d1(i);
    if (!s) return;
    const o = e._component;
    !ht(o) && !o.render && !o.template && (o.template = s.innerHTML), s.nodeType === 1 && (s.textContent = "");
    const r = t(s, !1, f1(s));
    return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), r;
  }, e;
});
function f1(n) {
  if (n instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && n instanceof MathMLElement)
    return "mathml";
}
function d1(n) {
  return It(n) ? document.querySelector(n) : n;
}
const p1 = '.plenio-overlay{position:fixed;inset:0;z-index:3000;background:#0000008c;display:flex;align-items:center;justify-content:center;font:13px/1.45 var(--font-family, sans-serif)}.plenio-overlay .plenio-dialog{position:relative;width:min(1280px,96vw);height:min(900px,94vh);max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);--plenio-dialog-h: min(900px, 94vh);display:flex;flex-direction:column;background:var(--comfy-menu-bg, #222);color:var(--fg-color, #ddd);border:1px solid var(--border-color, #444);border-radius:10px;box-shadow:0 12px 40px #0000007f}.plenio-overlay .resize-handle{position:absolute;right:2px;bottom:2px;width:16px;height:16px;cursor:nwse-resize;border-bottom-right-radius:8px;background:linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 0 0 / 8px 8px,linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 4px 4px / 8px 8px;touch-action:none}.plenio-overlay .plenio-dialog.maximized{border-radius:6px}.plenio-overlay .splitter{flex:none;background:transparent;touch-action:none}.plenio-overlay .splitter.horizontal{height:10px;margin:-3px 0;cursor:ns-resize;border-radius:5px}.plenio-overlay .splitter.vertical{width:10px;margin:0 -3px;cursor:ew-resize;border-radius:5px}.plenio-overlay .splitter:hover,.plenio-overlay .splitter:focus-visible{background:#4c9aff59;outline:none}.plenio-overlay .score-views>.splitter.horizontal{grid-row:1;align-self:end;height:10px;margin-bottom:-9px;z-index:2}.plenio-overlay .score-main>.splitter.vertical{grid-column:1;justify-self:end;align-self:stretch;width:10px;margin-right:-10px;z-index:2}.plenio-overlay header,.plenio-overlay footer,.plenio-overlay .doc-head{display:flex;align-items:center;gap:8px}.plenio-overlay header{padding:12px 16px;border-bottom:1px solid var(--border-color, #444)}.plenio-overlay header h2{margin:0;font-size:16px}.plenio-overlay .status{color:var(--descrip-text, #999)}.plenio-overlay .status.bad,.plenio-overlay .error{color:#e0685e}.plenio-overlay .spacer{flex:1}.plenio-overlay .body{overflow:auto;padding:8px 16px;flex:1;min-height:0}.plenio-overlay .hint{margin:8px 16px 0;color:var(--descrip-text, #999)}.plenio-overlay .doc{margin:10px 0 14px}.plenio-overlay .doc h3{margin:0;font-size:13px}.plenio-overlay .badge{font-size:11px;padding:1px 7px;border-radius:9px;background:var(--comfy-input-bg, #333);color:var(--descrip-text, #aaa)}.plenio-overlay .badge[data-state=edited],.plenio-overlay .badge[data-state="edited (merged)"]{background:#2f5f8a;color:#fff}.plenio-overlay .badge[data-state=manual]{background:#7a5a1e;color:#fff}.plenio-overlay .badge[data-state=conflict]{background:#8a2f2f;color:#fff}.plenio-overlay textarea,.plenio-overlay pre{box-sizing:border-box;width:100%;margin-top:6px;padding:8px;border-radius:6px;border:1px solid var(--border-color, #444);background:var(--comfy-input-bg, #1b1b1b);color:var(--input-text, #ddd);font:inherit;resize:vertical}.plenio-overlay pre{white-space:pre-wrap;max-height:220px;overflow:auto}.plenio-overlay .mono,.plenio-overlay pre{font-family:var(--code-font, ui-monospace, monospace);font-size:12px}.plenio-overlay .conflict{margin-top:6px;padding:8px;border-radius:6px;background:#8a2f2f40}.plenio-overlay .findings{padding:4px 16px;max-height:22vh;overflow:auto;border-top:1px solid var(--border-color, #444)}.plenio-overlay .findings ul{margin:6px 0;padding-left:18px}.plenio-overlay .arrangement{margin:6px 0}.plenio-overlay .arrangement p{margin:4px 0}.plenio-overlay .arrangement[data-status=fallback] strong{color:#d8a31a}.plenio-overlay .arrangement summary{cursor:pointer}.plenio-overlay .arrangement .experimental{display:inline-block;margin:0 4px;padding:0 6px;border:1px solid #d8a31a;border-radius:8px;color:#d8a31a;font-size:.85em;line-height:1.5}.plenio-overlay .arrangement .idea,.plenio-overlay .arrangement .kept{color:var(--descrip-text, #999)}.plenio-overlay li[data-severity=error] strong{color:#e0685e}.plenio-overlay li[data-severity=warning] strong{color:#d8a31a}.plenio-overlay li[data-severity=info],.plenio-overlay .where{color:var(--descrip-text, #999)}.plenio-overlay .arrangement .where{margin:0 6px}.plenio-overlay footer{padding:10px 16px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .facts{color:var(--descrip-text, #999)}.plenio-overlay button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);cursor:pointer}.plenio-overlay button:disabled{opacity:.45;cursor:default}.plenio-overlay button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button.icon{margin-left:auto;font-size:18px;line-height:1;padding:2px 8px}.plenio-overlay .asr{margin:4px 0;font-size:12px;color:var(--descrip-text, #aaa);display:flex;flex-wrap:wrap;gap:8px}.plenio-overlay .asr mark{background:#e6b43c4d;color:inherit;border-radius:3px;padding:0 3px;margin-right:3px}.plenio-overlay .diff{font-family:var(--plenio-mono, ui-monospace, monospace);font-size:12px;line-height:1.5;white-space:normal}.plenio-overlay .diff ins{background:#50aa5a4d;text-decoration:none}.plenio-overlay .diff del{background:#c846464d}.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .sections th,.plenio-overlay .sections td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .tabs{display:flex;gap:4px;margin-left:12px;flex:1}.plenio-overlay .tabs button{border-radius:6px 6px 0 0;border-bottom-color:transparent}.plenio-overlay .tabs button.active{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button:focus-visible,.plenio-overlay input:focus-visible,.plenio-overlay select:focus-visible,.plenio-overlay textarea:focus-visible,.plenio-overlay .notation-wrap:focus-visible{outline:2px solid #4c9aff;outline-offset:1px}.plenio-overlay .confirm{margin:8px 16px 0;padding:8px 10px;border:1px solid #c79a3a;border-radius:6px;display:flex;gap:8px;align-items:center}.plenio-overlay .link{border:none;background:none;padding:0 2px;color:#6fa8dc;text-decoration:underline;cursor:pointer}.plenio-overlay .facts.ok{color:#6fbf73}.plenio-overlay .facts.bad,.plenio-overlay .bad{color:#e0685e}.plenio-overlay .score-tab{display:flex;flex-direction:column;gap:6px}.plenio-overlay .palette,.plenio-overlay .view-tools,.plenio-overlay .transport{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.plenio-overlay .score-tab>.transport{padding:4px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #2a2a2a)}.plenio-overlay .score-tab>.transport>button:first-child{min-width:78px;font-weight:600}.plenio-overlay .palette .group{display:flex;align-items:center;gap:3px;padding-right:10px;border-right:1px solid var(--border-color, #444)}.plenio-overlay .palette .group:last-child{border-right:none}.plenio-overlay .palette .whole summary{cursor:pointer}.plenio-overlay .whole-tools{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.plenio-overlay input.chord{width:110px}.plenio-overlay input.tempo{width:60px}.plenio-overlay input,.plenio-overlay select{background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);border:1px solid var(--border-color, #555);border-radius:5px;padding:2px 5px}.plenio-overlay input[type=checkbox],.plenio-overlay input[type=range]{padding:0}.plenio-overlay .score-main{display:grid;grid-template-columns:var(--plenio-side-w, 230px) minmax(0,1fr);gap:10px;height:max(380px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 330px))}.plenio-overlay .score-main>.side{grid-area:1 / 1}.plenio-overlay .score-main>.splitter.vertical{grid-area:1 / 1;justify-self:end}.plenio-overlay .score-main>.score-views{grid-area:1 / 2}.plenio-overlay .score-main>.inspector{grid-area:1 / 3}.plenio-overlay .score-main.with-roll{height:max(260px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 620px))}.plenio-overlay .score-views{display:grid;grid-template-rows:minmax(0,3fr) minmax(0,2fr);gap:8px;min-width:0;min-height:0}.plenio-overlay .score-views.split{grid-template-rows:minmax(0,var(--plenio-notation-fr, 3fr)) minmax(0,var(--plenio-text-fr, 2fr))}.plenio-overlay .score-main[data-text=hidden] .score-views{grid-template-rows:minmax(0,1fr)}.plenio-overlay .score-main.with-inspector{grid-template-columns:var(--plenio-side-w, 210px) minmax(0,1fr) 250px}.plenio-overlay .score-main .side{display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}.plenio-overlay .fit-panel summary{cursor:pointer;color:var(--descrip-text, #aaa)}.plenio-overlay .lyrics-follow{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;font-size:12px}.plenio-overlay .lyrics-follow label{display:flex;gap:6px;align-items:center}.plenio-overlay .lyrics-follow .hint{margin:4px 0 0;color:var(--descrip-text, #999)}.plenio-overlay .lyrics-follow .hint.changed{color:#e8c46a}.plenio-overlay .view-tools .layouts{display:inline-flex;gap:2px}.plenio-overlay .view-tools .layouts button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector{overflow:auto;min-height:0;padding:6px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);display:flex;flex-direction:column;gap:10px}.plenio-overlay .inspector .panel{display:flex;flex-direction:column;gap:5px}.plenio-overlay .inspector .panel+.panel{border-top:1px solid var(--border-color, #444);padding-top:8px}.plenio-overlay .inspector h4{margin:0;font-size:13px}.plenio-overlay .inspector h4 .facts{font-weight:400;margin-left:4px}.plenio-overlay .inspector .field{display:flex;flex-wrap:wrap;align-items:center;gap:3px 5px}.plenio-overlay .inspector .field .name{width:44px;color:var(--descrip-text, #aaa)}.plenio-overlay .inspector button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector input.number{width:56px}.plenio-overlay .inspector input.pitch,.plenio-overlay .inspector input.meter{width:58px}.plenio-overlay .inspector input.chord{width:110px}.plenio-overlay .notation-wrap{position:relative;overflow:auto;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);color:var(--input-text, #e6e6e6);min-height:0}.plenio-overlay .notation-wrap.stale .notation{opacity:.45}.plenio-overlay .stale-note{position:sticky;top:0;margin:0;padding:4px 8px;background:#5a2626;color:#fff;z-index:1}.plenio-overlay .roll{display:flex;flex-direction:column;gap:4px;outline:none}.plenio-overlay .roll:focus-visible .roll-scroll{border-color:#4c9aff}.plenio-overlay .roll-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px}.plenio-overlay .roll-tools .group{display:flex;align-items:center;gap:3px}.plenio-overlay .roll-tools button.active.vocal{background:#2d5d9f;color:#fff}.plenio-overlay .roll-tools button.active.ins{background:#a0612a;color:#fff}.plenio-overlay .roll-tools button.mode{display:inline-flex;align-items:center;gap:4px}.plenio-overlay .roll-tools button.mode .icon{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}.plenio-overlay .roll-tools button.mode.active{background:#4a4f58;color:#fff;box-shadow:inset 0 0 0 1px #9ecbff}.plenio-overlay .roll-tools .hint{color:var(--descrip-text, #999);font-size:11px}.plenio-overlay .roll-scroll{position:relative;overflow:auto;overscroll-behavior:contain;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);user-select:none}.plenio-overlay .roll.stale .roll-svg{opacity:.45}.plenio-overlay .roll-svg{display:block;touch-action:none}.plenio-overlay .roll.mode-draw:not(.readonly,.stale) .roll-svg{cursor:crosshair}.plenio-overlay .roll-svg .roll-top,.plenio-overlay .roll-svg .keys{cursor:default}.plenio-overlay .roll-svg .band{fill:#9ecbff1f;stroke:#9ecbff;stroke-dasharray:4 3;pointer-events:none}.plenio-overlay .roll-svg .ruler{fill:transparent;cursor:pointer}.plenio-overlay .roll-svg .ruler:hover{fill:#ffffff0d}.plenio-overlay .roll-svg line.locator,.plenio-overlay .roll-svg .locator-mark line{stroke:#f4f6fa;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .locator-mark path{fill:#f4f6fa}.plenio-overlay .roll-svg line.playhead{stroke:#57d68d;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .row{fill:#ffffff06}.plenio-overlay .roll-svg .row.black{fill:#00000038}.plenio-overlay .roll-svg .row.c{fill:#ffffff0f}.plenio-overlay .roll-svg .lane{fill:#ffffff0a}.plenio-overlay .roll-svg line.bar{stroke:#ffffff59}.plenio-overlay .roll-svg line.beat{stroke:#ffffff1a}.plenio-overlay .roll-svg text{font-size:10px;fill:var(--descrip-text, #aaa);pointer-events:none}.plenio-overlay .roll-svg .section-label{fill:#9ecbff;font-style:italic}.plenio-overlay .roll-svg .note{cursor:grab;stroke:#00000080}.plenio-overlay .roll-svg .note.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .note.ins{fill:#f0a35e}.plenio-overlay .roll-svg .note.selected{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .note.playing{fill:#ffd84c}.plenio-overlay .roll-svg .note.dragged,.plenio-overlay .roll-svg .chord.dragged{opacity:.3}.plenio-overlay .roll-svg .ghost{fill-opacity:.55;stroke:#fff;stroke-dasharray:3 2;pointer-events:none}.plenio-overlay .roll-svg .ghost.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .ghost.ins{fill:#f0a35e}.plenio-overlay .roll-svg .chord rect{fill:#9ecbff2e;stroke:#9ecbff80;cursor:grab}.plenio-overlay .roll-svg .chord text{fill:var(--input-text, #e6e6e6);font-size:11px}.plenio-overlay .roll-svg .chord.selected rect{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .chord.ghost rect{stroke-dasharray:3 2}.plenio-overlay .roll-svg .keys-bg{fill:var(--comfy-menu-bg, #252525)}.plenio-overlay .roll-svg .top-bg{fill:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .roll.readonly .roll-svg .note,.plenio-overlay .roll.stale .roll-svg .note{cursor:default}.plenio-overlay .roll-scroll .chord-edit{position:absolute;width:80px;height:20px;font-size:11px}.plenio-overlay .roll-svg .lyrics-lane{fill:#4c9aff0f}.plenio-overlay .roll-svg .lyric-line rect{fill:#4c9aff29;stroke:#4c9aff73}.plenio-overlay .roll-svg .lyric-line.unsung rect{fill:transparent;stroke-dasharray:3 2}.plenio-overlay .roll-svg .lyric-line text{fill:var(--input-text, #e6e6e6);font-size:11px;font-style:italic}.plenio-overlay .roll-svg .lyric-line{cursor:grab}.plenio-overlay .roll-svg .lyric-line.selected rect{fill:#4c9aff6b;stroke:#4c9aff;stroke-width:1.5}.plenio-overlay .roll-svg .lyric-line.dragged rect{stroke-dasharray:4 2}.plenio-overlay .roll-svg .lyric-line rect.edge{fill:#4c9aff8c;stroke:none;cursor:ew-resize}.plenio-overlay .roll-svg .source-lane{fill:#96be9612;cursor:pointer}.plenio-overlay .roll-svg .source-wave{stroke:#8cc88cbf;stroke-width:1.2;fill:none;pointer-events:none}.plenio-overlay .roll-svg .source-missing{fill:#e0685e14;stroke:#e0685e59;stroke-dasharray:3 3}.plenio-overlay .roll-svg .source-label{fill:#a0d2a0e6;font-size:9px;pointer-events:none}.plenio-overlay .transport .hear{display:inline-flex;align-items:center;gap:2px}.plenio-overlay .transport .hear button.active{background:#2f6fd0;color:#fff}.plenio-overlay .transport .hear .level input{width:70px;vertical-align:middle}.plenio-overlay .roll-svg text.note-name{fill:#0a121ed9;font-size:8px;font-weight:600;pointer-events:none}.plenio-overlay .roll-svg text.syllable{fill:#9ecbff;font-size:9px;pointer-events:none}.plenio-overlay .roll-scroll .lyric-edit{position:absolute;width:280px;height:20px;font-size:11px}.plenio-overlay .roll-note{margin:0;color:var(--descrip-text, #999)}.plenio-overlay .gate{margin:4px 0;padding:4px 8px;border-left:3px solid #e0685e;background:#e0685e1f}.plenio-overlay .gate button{margin-left:8px}.plenio-overlay .notation svg .plenio-selected,.plenio-overlay .notation svg .plenio-selected path{fill:#4c9aff!important}.plenio-overlay .notation svg .plenio-playing,.plenio-overlay .notation svg .plenio-playing path{fill:#6fbf73!important}.plenio-overlay .notation svg .abcjs-note,.plenio-overlay .notation svg .abcjs-rest{cursor:pointer}.plenio-overlay .notation svg .abcjs-lyric{fill:#9ecbff}.plenio-overlay .abc-editor{min-height:0;overflow:hidden}.plenio-overlay .abc-editor .cm-editor{height:100%}.plenio-overlay .navigator{display:flex;flex-direction:column;gap:8px;flex:none}.plenio-overlay .navigator ol.sections{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.plenio-overlay .navigator li{padding:4px 6px;border-radius:6px;border:1px solid var(--border-color, #444)}.plenio-overlay .navigator li.current{border-color:#2f6fb0}.plenio-overlay .navigator:focus-visible{outline:1px solid #4c9aff}.plenio-overlay .navigator li.picked{background:#4c9aff2e;border-color:#4c9aff}.plenio-overlay .navigator li[draggable=true]{cursor:grab}.plenio-overlay .navigator li.drop-before{box-shadow:0 -3px #ffc440}.plenio-overlay .navigator li.drop-after{box-shadow:0 3px #ffc440}.plenio-overlay .navigator .section-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding:2px 0 4px}.plenio-overlay .navigator .section-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .section-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .section-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .navigator .section-head{display:flex;flex-direction:column;cursor:pointer}.plenio-overlay .navigator .section-tools{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.plenio-overlay .navigator .section-tools button,.plenio-overlay .navigator .split button{font-size:11px;padding:1px 6px}.plenio-overlay .navigator input.rename{width:100%}.plenio-overlay .navigator .split input{width:90px}.plenio-overlay .bar-strip{display:flex;flex-wrap:wrap;gap:2px}.plenio-overlay .bar-strip .bar{min-width:26px;font-size:10px;padding:1px 2px;border-radius:3px}.plenio-overlay .bar-strip .bar.alt{background:#2c3440}.plenio-overlay .bar-strip .bar.selected{background:#2f6fb0;color:#fff}.plenio-overlay .bar-strip .bar.picked{background:#4c9aff59;outline:1px solid #4c9aff}.plenio-overlay .bar-strip .bar[draggable=true]{cursor:grab}.plenio-overlay .bar-strip .bar.drop-before{box-shadow:-3px 0 #ffc440}.plenio-overlay .bar-strip .bar.drop-after{box-shadow:3px 0 #ffc440}.plenio-overlay .navigator .bar-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding-top:6px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .navigator .bar-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .bar-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .bar-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .bar-strip .bar.error{border-color:#e0685e;color:#e0685e}.plenio-overlay .status{display:flex;flex-wrap:wrap;gap:10px;margin:0}.plenio-overlay .status .change{color:#6fbf73}.plenio-overlay .diagnostics{margin:0;padding-left:18px}.plenio-overlay .lyrics-fit table,.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .lyrics-fit th,.plenio-overlay .lyrics-fit td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .lyrics-fit tr.mismatch td{color:#e0685e}.plenio-overlay .lyrics-fit h4{margin:8px 0 4px;font-size:12px}.plenio-overlay .midi-dialog{width:min(720px,92vw);height:auto;max-height:min(700px,92vh)}.plenio-overlay .midi-dialog .body h3{margin:14px 0 4px;font-size:13px}.plenio-overlay .midi-dialog .tracks{border-collapse:collapse;width:100%}.plenio-overlay .midi-dialog .tracks th,.plenio-overlay .midi-dialog .tracks td{text-align:left;padding:3px 12px 3px 0;border-bottom:1px solid var(--border-color, #3a3a3a)}.plenio-overlay .midi-dialog .tracks .number{display:inline-block;min-width:18px;color:var(--descrip-text, #999)}.plenio-overlay .midi-dialog .controls{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;margin:10px 0 0}.plenio-overlay .midi-dialog .report{margin:4px 0;padding-left:18px;color:var(--descrip-text, #bbb)}.plenio-overlay .midi-tools{display:inline-flex;gap:4px}.plenio-overlay .hidden-file{display:none}.plenio-overlay .track-panel{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;background:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .track-panel h4{margin:0 0 4px;font-size:13px}.plenio-overlay .track-panel ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}.plenio-overlay .track-panel li{display:grid;grid-template-columns:8px minmax(0,1fr) auto auto;grid-template-areas:"dot name count play" "dot destination destination clear" "dot sound sound sound";align-items:center;column-gap:6px;row-gap:1px;font-size:12px}.plenio-overlay .track-panel .dot{grid-area:dot;width:8px;height:8px;border-radius:50%}.plenio-overlay .track-panel .track-name{grid-area:name;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-overlay .track-panel .count{grid-area:count}.plenio-overlay .track-panel .play{grid-area:play;display:flex;align-items:center}.plenio-overlay .track-panel .play input{margin:0}.plenio-overlay .track-panel button.link{grid-area:clear}.plenio-overlay .track-panel .destination{grid-area:destination}.plenio-overlay .track-panel .destination,.plenio-overlay .track-panel .count{color:var(--descrip-text, #999);font-size:11px;white-space:nowrap}.plenio-overlay .track-panel select.sound{grid-area:sound;min-width:0;font-size:11px;padding:1px 2px}.plenio-overlay .track-panel .destination.unsent{color:#d8a31a}.plenio-overlay .track-panel li.guide{border-top:1px dashed var(--border-color, #444);padding-top:3px}.plenio-overlay .track-panel .hint{margin:6px 0 0;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .keys-help{position:relative}.plenio-overlay .keys-panel{position:absolute;z-index:30;top:26px;left:0;width:560px;max-height:60vh;overflow:auto;padding:8px 12px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .keys-panel .close{float:right}.plenio-overlay .keys-panel h5{margin:6px 0 2px}.plenio-overlay .keys-panel table{border-collapse:collapse;width:100%;font-size:12px}.plenio-overlay .keys-panel th{width:210px;text-align:left;white-space:nowrap;padding:1px 10px 1px 0;color:var(--input-text, #ddd);font-weight:600}.plenio-overlay .keys-panel td{color:var(--descrip-text, #aaa)}.plenio-overlay .transport .align{position:relative}.plenio-overlay .transport .align>button.active{border-color:#d6a14a;color:#f0c27a}.plenio-overlay .transport .align-panel{position:absolute;z-index:30;bottom:30px;left:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;width:460px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .align-panel .facts{flex-basis:100%;margin-bottom:4px}.plenio-overlay .roll-svg .sung-pitch{fill:none;stroke:#ff5fa2;stroke-width:1.6;stroke-linejoin:round;opacity:.85;pointer-events:none}.plenio-overlay .roll-tools label.unavailable{opacity:.55}.plenio-overlay .transport .record{display:inline-flex;align-items:center;gap:3px;position:relative}.plenio-overlay .transport .record .rec{color:#ff6b6b;font-weight:600}.plenio-overlay .transport .record .rec.on{background:#c62828;color:#fff;border-color:#ff6b6b}.plenio-overlay .transport .record .rec.counting{animation:plenio-blink .5s steps(2,start) infinite}@keyframes plenio-blink{to{opacity:.35}}.plenio-overlay .transport .record .step.on{background:#6a4fb3;color:#fff}.plenio-overlay .transport .midi-light{display:inline-block;width:8px;height:8px;border-radius:50%;background:#555}.plenio-overlay .transport .midi-light.ready{background:#2e7d32}.plenio-overlay .transport .midi-light.active{background:#7cfc00;box-shadow:0 0 6px #7cfc00}.plenio-overlay .transport .midi-settings{position:relative}.plenio-overlay .transport .midi-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:320px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .midi-panel .close{justify-self:end}.plenio-overlay .transport .midi-panel strong{margin-top:4px}.plenio-overlay .notation-export{position:relative;display:inline-flex}.plenio-overlay .notation-export .export-panel{position:absolute;z-index:30;top:calc(100% + 4px);left:0;display:grid;gap:6px;width:260px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .notation-export .export-panel .close{justify-self:end}.plenio-overlay .notation-export .formats{display:flex;gap:6px;flex-wrap:wrap}.plenio-overlay .transport .sounds-settings{position:relative}.plenio-overlay .transport .sounds-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:340px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .transport .sounds-panel .close{justify-self:end}.plenio-overlay .transport .sounds-panel strong{margin-top:4px}.plenio-overlay .transport .sounds-panel .row{display:flex;align-items:center;gap:6px}.plenio-overlay .transport .sounds-panel .row select,.plenio-overlay .transport .sounds-panel .row input{flex:1;min-width:0}.plenio-overlay .transport .sounds-panel .track{width:74px;flex:none}.plenio-overlay .roll-svg .rec-note{fill:#e53935d9;stroke:#ffcdd2;stroke-width:1;pointer-events:none}', g1 = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro"];
function m1(n, e) {
  const t = `[${e}]`, i = n.replace(/\s+$/, "");
  return i ? i.split(`
`).some((s) => s.trim() === t) ? n : `${i}

${t}
` : `${t}
`;
}
const nr = `
`;
function of(n) {
  const e = [];
  return n.replace(/\r\n?/g, `
`).split(`
`).forEach((t, i) => {
    i > 0 && e.push(nr), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function v1(n, e) {
  const t = of(n), i = of(e), s = t.length + 1, o = i.length + 1, r = new Array(s * o).fill(0);
  for (let h = t.length - 1; h >= 0; h--)
    for (let f = i.length - 1; f >= 0; f--)
      r[h * o + f] = t[h] === i[f] ? r[(h + 1) * o + f + 1] + 1 : Math.max(r[(h + 1) * o + f], r[h * o + f + 1]);
  const l = [], a = (h, f) => {
    const d = l[l.length - 1];
    d && d.op === h && f !== nr && !d.text.endsWith(nr) ? d.text += ` ${f}` : l.push({ op: h, text: f });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < i.length; )
    u < t.length && c < i.length && t[u] === i[c] ? (a("same", t[u]), u++, c++) : c < i.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", i[c++]) : a("removed", t[u++]);
  return l;
}
function y1(n) {
  return n.filter((e) => e.op !== "same" && e.text !== nr).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const b1 = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, x1 = {
  key: 0,
  class: "error"
}, w1 = { key: 1 }, k1 = {
  key: 0,
  class: "bad"
}, og = /* @__PURE__ */ Qt({
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
        const u = await ty(e.fetcher, {
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
    Ye(
      () => [e.lyrics, e.abc],
      () => {
        clearTimeout(s), s = setTimeout(() => {
          r();
        }, 350);
      },
      { immediate: !0 }
    ), Di(() => clearTimeout(s));
    const l = N(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", h = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: h };
      })
    );
    return (a, u) => n.abc ? (w(), A("section", b1, [
      u[1] || (u[1] = p("h4", null, "Lyrics and the score's sections", -1)),
      i.value ? (w(), A("p", x1, F(i.value), 1)) : l.value.length ? (w(), A("table", w1, [
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
          (w(!0), A(ve, null, Ie(l.value, (c, h) => (w(), A("tr", {
            key: h,
            class: Xe({ mismatch: c.mismatch })
          }, [
            p("td", null, "[" + F(c.tag) + "]", 1),
            p("td", null, [
              ye(F(c.score_section ?? "—"), 1),
              c.mismatch ? (w(), A("span", k1, " ≠")) : Q("", !0)
            ]),
            p("td", null, F(c.lines), 1),
            p("td", null, F(c.syllables), 1),
            p("td", null, F(c.vocal_notes ?? "—"), 1),
            p("td", {
              class: Xe({ bad: c.fit && c.fit !== "fits" })
            }, F(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : Q("", !0),
      u[2] || (u[2] = p("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : Q("", !0);
  }
});
function S1(n) {
  const e = new Set((n.elements ?? []).map((i) => i.id)), t = n.model?.tracks;
  if (t) for (const i of [...t.vocal, ...t.ins, ...t.chords]) e.add(i.id);
  return e;
}
function C1(n, e) {
  const t = n?.model?.tracks, i = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = i.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
const rf = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function wu(n, e) {
  const t = rf.indexOf(n);
  return t < 0 ? null : rf[t + e] ?? null;
}
function M1(n, e, t) {
  const i = n.elements ?? [], s = i.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of i) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function A1(n, e) {
  const t = n.elements ?? [];
  return t.find((i) => i.source[0] <= e && e < i.source[1]) ?? t.find((i) => i.source[1] === e) ?? null;
}
function Cs(n, e) {
  return !n || !e ? null : (n.elements ?? []).find((t) => t.id === e) ?? null;
}
function T1(n, e, t) {
  const i = Cs(n, e);
  if (!i) return null;
  const s = (n.elements ?? []).filter((r) => r.voice === i.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function $1(n, e) {
  const t = Cs(n, e);
  if (!t) return null;
  const i = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (n.elements ?? []).find(
    (s) => s.voice === i && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function D1(n, e, t = "Vocal") {
  return (n.elements ?? []).find((i) => i.bar === e && i.voice === t) ?? null;
}
function ku(n, e) {
  const t = n.sections.findIndex((i) => i.start_bar <= e && e < i.start_bar + i.bars);
  return t < 0 ? 0 : t;
}
const O1 = {
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
function L1(n, e = "1/16") {
  if (!n) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), i = O1[n.units * t] ?? `${n.units} units`, s = n.kind === "note" ? `${n.name}${n.tie_out ? " (tied)" : ""}` : "rest", o = n.chord ? `, chord ${n.chord}` : "";
  return `${n.voice} bar ${n.bar}: ${s}, ${n.kind === "bar_rest" ? "whole bar" : i}${o}`;
}
function rl(n) {
  const e = Math.max(0, n), t = Math.floor(e / 60), i = Math.floor(e - t * 60);
  return `${t}:${String(i).padStart(2, "0")}`;
}
let Su = [], rg = [];
(() => {
  let n = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < n.length; e++)
    (e % 2 ? rg : Su).push(t = t + n[e]);
})();
function E1(n) {
  if (n < 768) return !1;
  for (let e = 0, t = Su.length; ; ) {
    let i = e + t >> 1;
    if (n < Su[i]) t = i;
    else if (n >= rg[i]) e = i + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function lf(n) {
  return n >= 127462 && n <= 127487;
}
const af = 8205;
function B1(n, e, t = !0, i = !0) {
  return (t ? lg : I1)(n, e, i);
}
function lg(n, e, t) {
  if (e == n.length) return e;
  e && ag(n.charCodeAt(e)) && ug(n.charCodeAt(e - 1)) && e--;
  let i = za(n, e);
  for (e += uf(i); e < n.length; ) {
    let s = za(n, e);
    if (i == af || s == af || t && E1(s))
      e += uf(s), i = s;
    else if (lf(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && lf(za(n, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function I1(n, e, t) {
  for (; e > 1; ) {
    let i = lg(n, e - 2, t);
    if (i < e) return i;
    e--;
  }
  return 0;
}
function za(n, e) {
  let t = n.charCodeAt(e);
  if (!ug(t) || e + 1 == n.length) return t;
  let i = n.charCodeAt(e + 1);
  return ag(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function ag(n) {
  return n >= 56320 && n < 57344;
}
function ug(n) {
  return n >= 55296 && n < 56320;
}
function uf(n) {
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
    [e, t] = io(this, e, t);
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
    ), ii.from(s, this.length - (t - e) + i.length);
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
    [e, t] = io(this, e, t);
    let i = [];
    return this.decompose(e, t, i, 0), ii.from(i, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), s = new Fo(this), o = new Fo(e);
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
    return new Fo(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new cg(this, e, t);
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
    return new hg(i);
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
    return e.length == 1 && !e[0] ? nt.empty : e.length <= 32 ? new Dt(e) : ii.from(Dt.split(e, []));
  }
}
class Dt extends nt {
  constructor(e, t = R1(e)) {
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
        return new P1(s, l, i, r);
      s = l + 1, i++;
    }
  }
  decompose(e, t, i, s) {
    let o = e <= 0 && t >= this.length ? this : new Dt(cf(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = i.pop(), l = ll(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        i.push(new Dt(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        i.push(new Dt(l.slice(0, a)), new Dt(l.slice(a)));
      }
    } else
      i.push(o);
  }
  replace(e, t, i) {
    if (!(i instanceof Dt))
      return super.replace(e, t, i);
    [e, t] = io(this, e, t);
    let s = ll(this.text, ll(i.text, cf(this.text, 0, e)), t), o = this.length + i.length - (t - e);
    return s.length <= 32 ? new Dt(s, o) : ii.from(Dt.split(s, []), o);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = io(this, e, t);
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
      i.push(o), s += o.length + 1, i.length == 32 && (t.push(new Dt(i, s)), i = [], s = -1);
    return s > -1 && t.push(new Dt(i, s)), t;
  }
}
class ii extends nt {
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
    if ([e, t] = io(this, e, t), i.lines < this.lines)
      for (let s = 0, o = 0; s < this.children.length; s++) {
        let r = this.children[s], l = o + r.length;
        if (e >= o && t <= l) {
          let a = r.replace(e - o, t - o, i), u = this.lines - r.lines + a.lines;
          if (a.lines < u >> 4 && a.lines > u >> 6) {
            let c = this.children.slice();
            return c[s] = a, new ii(c, this.length - (t - e) + i.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = io(this, e, t);
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
    if (!(e instanceof ii))
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
      return new Dt(d, t);
    }
    let s = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function h(d) {
      let g;
      if (d.lines > o && d instanceof ii)
        for (let v of d.children)
          h(v);
      else d.lines > r && (a > r || !a) ? (f(), l.push(d)) : d instanceof Dt && a && (g = c[c.length - 1]) instanceof Dt && d.lines + g.lines <= 32 ? (a += d.lines, u += d.length + 1, c[c.length - 1] = new Dt(g.text.concat(d.text), g.length + 1 + d.length)) : (a + d.lines > s && f(), a += d.lines, u += d.length + 1, c.push(d));
    }
    function f() {
      a != 0 && (l.push(c.length == 1 ? c[0] : ii.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let d of e)
      h(d);
    return f(), l.length == 1 ? l[0] : new ii(l, t);
  }
}
nt.empty = /* @__PURE__ */ new Dt([""], 0);
function R1(n) {
  let e = -1;
  for (let t of n)
    e += t.length + 1;
  return e;
}
function ll(n, e, t = 0, i = 1e9) {
  for (let s = 0, o = 0, r = !0; o < n.length && s <= i; o++) {
    let l = n[o], a = s + l.length;
    a >= t && (a > i && (l = l.slice(0, i - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function cf(n, e, t) {
  return ll(n, [""], e, t);
}
class Fo {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof Dt ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, s = this.nodes[i], o = this.offsets[i], r = o >> 1, l = s instanceof Dt ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof Dt) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof Dt ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class cg {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new Fo(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
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
class hg {
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
}, Fo.prototype[Symbol.iterator] = cg.prototype[Symbol.iterator] = hg.prototype[Symbol.iterator] = function() {
  return this;
});
class P1 {
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
function io(n, e, t) {
  return e = Math.max(0, Math.min(n.length, e)), [e, Math.max(e, Math.min(n.length, t))];
}
function Jt(n, e, t = !0, i = !0) {
  return B1(n, e, t, i);
}
function _1(n) {
  return n >= 56320 && n < 57344;
}
function N1(n) {
  return n >= 55296 && n < 56320;
}
function V1(n, e) {
  let t = n.charCodeAt(e);
  if (!N1(t) || e + 1 == n.length)
    return t;
  let i = n.charCodeAt(e + 1);
  return _1(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function H1(n) {
  return n < 65536 ? 1 : 2;
}
const Cu = /\r\n?|\n/;
var hn = /* @__PURE__ */ (function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
})(hn || (hn = {}));
class Mi {
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
    Mu(this, e, t);
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
    return new Mi(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : fg(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Au(this, e, t);
  }
  mapPos(e, t = -1, i = hn.Simple) {
    let s = 0, o = 0;
    for (let r = 0; r < this.sections.length; ) {
      let l = this.sections[r++], a = this.sections[r++], u = s + l;
      if (a < 0) {
        if (u > e)
          return o + (e - s);
        o += l;
      } else {
        if (i != hn.Simple && u >= e && (i == hn.TrackDel && s < e && u > e || i == hn.TrackBefore && s < e || i == hn.TrackAfter && u > e))
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
    return new Mi(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Mi(e);
  }
}
class Ft extends Mi {
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
    return Mu(this, (t, i, s, o, r) => e = e.replace(s, s + (i - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return Au(this, e, t, !0);
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
    return new Ft(t, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : fg(this, e, !0);
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
    return e.empty ? this : Au(this, e, t, !0);
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
    Mu(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Mi.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], i = [], s = [], o = new ir(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        qt(s, c, -1);
        let h = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        qt(t, c, h), h > 0 && Gi(i, t, o.text), o.forward(c), l += c;
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
      changes: new Ft(t, i),
      filtered: Mi.create(s)
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
      let h = new Ft(s, o);
      l = l ? l.compose(h.map(l)) : h, s = [], o = [], r = 0;
    }
    function u(c) {
      if (Array.isArray(c))
        for (let h of c)
          u(h);
      else if (c instanceof Ft) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: h, to: f = h, insert: d } = c;
        if (h > f || h < 0 || f > t)
          throw new RangeError(`Invalid change range ${h} to ${f} (in doc of length ${t})`);
        let g = d ? typeof d == "string" ? nt.of(d.split(i || Cu)) : d : nt.empty, v = g.length;
        if (h == f && v == 0)
          return;
        h < r && a(), h > r && qt(s, h - r, -1), qt(s, f - h, v), Gi(o, s, g), r = f;
      }
    }
    return u(e), a(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new Ft(e ? [e, -1] : [], []);
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
    return new Ft(t, i);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new Ft(e, t);
  }
}
function qt(n, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = n.length - 2;
  s >= 0 && t <= 0 && t == n[s + 1] ? n[s] += e : s >= 0 && e == 0 && n[s] == 0 ? n[s + 1] += t : i ? (n[s] += e, n[s + 1] += t) : n.push(e, t);
}
function Gi(n, e, t) {
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
function Mu(n, e, t) {
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
function Au(n, e, t, i = !1) {
  let s = [], o = i ? [] : null, r = new ir(n), l = new ir(e);
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
        r.ins >= 0 && a < r.i && r.len <= c && (qt(s, 0, r.ins), o && Gi(o, s, r.text), a = r.i), r.forward(c), u -= c;
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
      qt(s, u, a < r.i ? r.ins : 0), o && a < r.i && Gi(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? Ft.createSet(s, o) : Mi.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function fg(n, e, t = !1) {
  let i = [], s = t ? [] : null, o = new ir(n), r = new ir(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? Ft.createSet(i, s) : Mi.create(i);
    if (o.ins == 0)
      qt(i, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      qt(i, 0, r.ins, l), s && Gi(s, i, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = i.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          qt(i, a, c, l), s && c && Gi(s, i, r.text);
        } else r.ins == -1 ? (qt(i, o.off ? 0 : o.len, a, l), s && Gi(s, i, o.textBit(a))) : (qt(i, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && Gi(s, i, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || i.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class ir {
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
class Ki {
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
    return this.empty ? i = s = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), i == this.from && s == this.to ? this : new Ki(i, s, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, i = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return ne.range(e, t, void 0, void 0, i);
    let s = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return ne.range(this.anchor, s, void 0, void 0, i);
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
    return ne.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, i, s) {
    return new Ki(e, t, i, s);
  }
}
class ne {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : ne.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
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
    return this.ranges.length == 1 ? this : new ne([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return ne.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, ne.create(i, this.mainIndex);
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
    return new ne(e.ranges.map((t) => Ki.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new ne([ne.range(e, t)], 0);
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
        return ne.normalized(e.slice(), t);
      i = o.to;
    }
    return new ne(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, i, s) {
    return Ki.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)), s);
  }
  /**
  Create a selection range.
  */
  static range(e, t, i, s, o) {
    let r = s == null ? 7 : Math.min(6, s);
    return !o && e != t && (o = t < e ? 1 : -1), o && (r |= o < 0 ? 8 : 16), t < e ? Ki.create(t, e, r | 32, i) : Ki.create(e, t, r, i);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return Ki.create(e, t, 64, void 0);
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
        s <= t && t--, e.splice(--s, 2, o.anchor > o.head ? ne.range(a, l) : ne.range(l, a));
      }
    }
    return new ne(e, t);
  }
}
function dg(n, e) {
  for (let t of n.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let Lc = 0;
class we {
  constructor(e, t, i, s, o) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = s, this.id = Lc++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new we(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : Ec), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new al([], this, 0, e);
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
    return new al(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new al(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function Ec(n, e) {
  return n == e || n.length == e.length && n.every((t, i) => t === e[i]);
}
class al {
  constructor(e, t, i, s) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = s, this.id = Lc++;
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
        if (a && f.docChanged || u && (f.docChanged || f.selection) || Tu(h, c)) {
          let d = i(h);
          if (l ? !hf(d, h.values[r], s) : !s(d, h.values[r]))
            return h.values[r] = d, 1;
        }
        return 0;
      },
      reconfigure: (h, f) => {
        let d, g = f.config.address[o];
        if (g != null) {
          let v = Ml(f, g);
          if (this.dependencies.every((m) => m instanceof we ? f.facet(m) === h.facet(m) : m instanceof Wn ? f.field(m, !1) == h.field(m, !1) : !0) || (l ? hf(d = i(h), v, s) : s(d = i(h), v)))
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
function hf(n, e, t) {
  if (n.length != e.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!t(n[i], e[i]))
      return !1;
  return !0;
}
function Tu(n, e) {
  let t = !1;
  for (let i of e)
    zo(n, i) & 1 && (t = !0);
  return t;
}
function F1(n, e, t) {
  let i = t.map((a) => n[a.id]), s = t.map((a) => a.type), o = i.filter((a) => !(a & 1)), r = n[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < i.length; c++) {
      let h = Ml(a, i[c]);
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
        zo(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!Tu(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = Tu(a, i), h = u.config.facets[e.id], f = u.facet(e);
      if (h && !c && Ec(t, h))
        return a.values[r] = f, 0;
      let d = l(a);
      return e.compare(d, f) ? (a.values[r] = f, 0) : (a.values[r] = d, 1);
    }
  };
}
const Lr = /* @__PURE__ */ we.define({ static: !0 });
class Wn {
  constructor(e, t, i, s, o) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new Wn(Lc++, e.create, e.update, e.compare || ((i, s) => i === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Lr).find((i) => i.field == this);
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
        let o = i.facet(Lr), r = s.facet(Lr), l;
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
    return [this, Lr.of({ field: this, create: e })];
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
const vs = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function ko(n) {
  return (e) => new pg(e, n);
}
const ia = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ ko(vs.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ ko(vs.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ ko(vs.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ ko(vs.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ ko(vs.lowest)
};
class pg {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class sa {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new $u(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return sa.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class $u {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Cl {
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
    for (let f of z1(e, t, r))
      f instanceof Wn ? s.push(f) : (o[f.facet.id] || (o[f.facet.id] = [])).push(f);
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
        if (l[g.id] = a.length << 1 | 1, Ec(v, d))
          a.push(i.facet(g));
        else {
          let m = g.combine(d.map((x) => x.value));
          a.push(i && g.compare(m, i.facet(g)) ? i.facet(g) : m);
        }
      else {
        for (let m of d)
          m.type == 0 ? (l[m.id] = a.length << 1 | 1, a.push(m.value)) : (l[m.id] = u.length << 1, u.push((x) => m.dynamicSlot(x)));
        l[g.id] = u.length << 1, u.push((m) => F1(m, g, d));
      }
    }
    let h = u.map((f) => f(l));
    return new Cl(e, r, h, l, a, o);
  }
}
function z1(n, e, t) {
  let i = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = i[a].indexOf(r);
      u > -1 && i[a].splice(u, 1), r instanceof $u && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof $u) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof pg)
      o(r.inner, r.prec);
    else if (r instanceof Wn)
      i[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof al)
      i[l].push(r), r.facet.extensions && o(r.facet.extensions, vs.default);
    else {
      let u = r.extension;
      if (!u)
        throw new Error(`Unrecognized extension value in extension set (${r}).`);
      if (u == r)
        throw new Error(`Unrecognized extension value in extension set (${r}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      o(u, l);
    }
  }
  return o(n, vs.default), i.reduce((r, l) => r.concat(l));
}
function zo(n, e) {
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
function Ml(n, e) {
  return e & 1 ? n.config.staticValues[e >> 1] : n.values[e >> 1];
}
const gg = /* @__PURE__ */ we.define(), Du = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e),
  static: !0
}), mg = /* @__PURE__ */ we.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), vg = /* @__PURE__ */ we.define(), yg = /* @__PURE__ */ we.define(), bg = /* @__PURE__ */ we.define(), xg = /* @__PURE__ */ we.define({
  combine: (n) => n.length ? n[0] : !1
});
class go {
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
    return new W1();
  }
}
class W1 {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new go(this, e);
  }
}
class K1 {
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
    return new bt(this, e);
  }
}
class bt {
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
    return t === void 0 ? void 0 : t == this.value ? this : new bt(this.type, t);
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
    return new K1(e.map || ((t) => t));
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
bt.reconfigure = /* @__PURE__ */ bt.define();
bt.appendConfig = /* @__PURE__ */ bt.define();
class Zt {
  constructor(e, t, i, s, o, r) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, i && dg(i, t.newLength), o.some((l) => l.type == Zt.time) || (this.annotations = o.concat(Zt.time.of(Date.now())));
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
Zt.time = /* @__PURE__ */ go.define();
Zt.userEvent = /* @__PURE__ */ go.define();
Zt.addToHistory = /* @__PURE__ */ go.define();
Zt.remote = /* @__PURE__ */ go.define();
function U1(n, e) {
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
function wg(n, e, t) {
  var i;
  let s, o, r;
  return t ? (s = e.changes, o = Ft.empty(e.changes.length), r = n.changes.compose(e.changes)) : (s = e.changes.map(n.changes), o = n.changes.mapDesc(e.changes, !0), r = n.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(s),
    effects: bt.mapEffects(n.effects, s).concat(bt.mapEffects(e.effects, o)),
    annotations: n.annotations.length ? n.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: n.scrollIntoView || e.scrollIntoView
  };
}
function Ou(n, e, t) {
  let i = e.selection, s = Ys(e.annotations);
  return e.userEvent && (s = s.concat(Zt.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof Ft ? e.changes : Ft.of(e.changes || [], t, n.facet(mg)),
    selection: i && (i instanceof ne ? i : ne.single(i.anchor, i.head)),
    effects: Ys(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function kg(n, e, t) {
  let i = Ou(n, e.length ? e[0] : {}, n.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    i = wg(i, Ou(n, e[o], r ? i.changes.newLength : n.doc.length), r);
  }
  let s = Zt.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return G1(t ? j1(s) : s);
}
function j1(n) {
  let e = n.startState, t = !0;
  for (let s of e.facet(vg)) {
    let o = s(n);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : U1(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = n.changes.invertedDesc, s = Ft.empty(e.doc.length);
    else {
      let r = n.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    n = Zt.create(e, s, n.selection && n.selection.map(o), bt.mapEffects(n.effects, o), n.annotations, n.scrollIntoView);
  }
  let i = e.facet(yg);
  for (let s = i.length - 1; s >= 0; s--) {
    let o = i[s](n);
    o instanceof Zt ? n = o : Array.isArray(o) && o.length == 1 && o[0] instanceof Zt ? n = o[0] : n = kg(e, Ys(o), !1);
  }
  return n;
}
function G1(n) {
  let e = n.startState, t = e.facet(bg), i = n;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](n);
    o && Object.keys(o).length && (i = wg(i, Ou(e, o, n.changes.newLength), !0));
  }
  return i == n ? n : Zt.create(e, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const q1 = [];
function Ys(n) {
  return n == null ? q1 : Array.isArray(n) ? n : [n];
}
var ki = /* @__PURE__ */ (function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
})(ki || (ki = {}));
const Y1 = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Lu;
try {
  Lu = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function X1(n) {
  if (Lu)
    return Lu.test(n);
  for (let e = 0; e < n.length; e++) {
    let t = n[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || Y1.test(t)))
      return !0;
  }
  return !1;
}
function J1(n) {
  return (e) => {
    if (!/\S/.test(e))
      return ki.Space;
    if (X1(e))
      return ki.Word;
    for (let t = 0; t < n.length; t++)
      if (e.indexOf(n[t]) > -1)
        return ki.Word;
    return ki.Other;
  };
}
class ot {
  constructor(e, t, i, s, o, r) {
    this.config = e, this.doc = t, this.selection = i, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      zo(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return zo(this, i), Ml(this, i);
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
    return kg(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: s } = t;
    for (let l of e.effects)
      l.is(sa.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(bt.reconfigure) ? (t = null, i = l.value) : l.is(bt.appendConfig) && (t = null, i = Ys(i).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Cl.resolve(i, s, this), o = new ot(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(Du) ? e.newSelection : e.newSelection.asSingle();
    new ot(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: ne.cursor(t.from + e.length, -1)
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
    let t = this.selection, i = e(t.ranges[0]), s = this.changes(i.changes), o = [i.range], r = Ys(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let f = 0; f < l; f++)
        o[f] = o[f].map(c);
      let h = s.mapDesc(u, !0);
      o.push(a.range.map(h)), s = s.compose(c), r = bt.mapEffects(r, c).concat(bt.mapEffects(Ys(a.effects), h));
    }
    return {
      changes: s,
      selection: ne.create(o, t.mainIndex),
      effects: r
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof Ft ? e : Ft.of(e, this.doc.length, this.facet(ot.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return nt.of(e.split(this.facet(ot.lineSeparator) || Cu));
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
    return t == null ? e.default : (zo(this, t), Ml(this, t));
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
        s instanceof Wn && this.config.address[s.id] != null && (t[i] = s.spec.toJSON(this.field(e[i]), this));
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
    return ot.create({
      doc: e.doc,
      selection: ne.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = Cl.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof nt ? e.doc : nt.of((e.doc || "").split(t.staticFacet(ot.lineSeparator) || Cu)), s = e.selection ? e.selection instanceof ne ? e.selection : ne.single(e.selection.anchor, e.selection.head) : ne.single(0);
    return dg(s, i.length), t.staticFacet(Du) || (s = s.asSingle()), new ot(t, i, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(ot.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(ot.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(xg);
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
    for (let i of this.facet(ot.phrases))
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
    for (let o of this.facet(gg))
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
    return J1(t.length ? t[0] : "");
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
      if (o(t.slice(a, r)) != ki.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = Jt(t, l);
      if (o(t.slice(l, a)) != ki.Word)
        break;
      l = a;
    }
    return r == l ? null : ne.range(r + i, l + i);
  }
}
ot.allowMultipleSelections = Du;
ot.tabSize = /* @__PURE__ */ we.define({
  combine: (n) => n.length ? n[0] : 4
});
ot.lineSeparator = mg;
ot.readOnly = xg;
ot.phrases = /* @__PURE__ */ we.define({
  compare(n, e) {
    let t = Object.keys(n), i = Object.keys(e);
    return t.length == i.length && t.every((s) => n[s] == e[s]);
  }
});
ot.languageData = gg;
ot.changeFilter = vg;
ot.transactionFilter = yg;
ot.transactionExtender = bg;
sa.reconfigure = /* @__PURE__ */ bt.define();
function oa(n, e, t = {}) {
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
class $s {
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
    return Eu.create(e, t, this);
  }
}
$s.prototype.startSide = $s.prototype.endSide = 0;
$s.prototype.point = !1;
$s.prototype.mapMode = hn.TrackDel;
function Bc(n, e) {
  return n == e || n.constructor == e.constructor && n.eq(e);
}
let Eu = class Sg {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new Sg(e, t, i);
  }
};
function Bu(n, e) {
  return n.from - e.from || n.value.startSide - e.value.startSide;
}
class Ic {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = s;
  }
  get length() {
    return Vs(this.to);
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
        let x = t.mapPos(d, f.startSide, f.mapMode);
        if (x == null || (v = m = x, f.startSide != f.endSide && (m = t.mapPos(d, f.endSide), m < v)))
          continue;
      } else if (v = t.mapPos(d, f.startSide), m = t.mapPos(g, f.endSide), v > m || v == m && f.startSide > 0 && f.endSide <= 0)
        continue;
      if (!((m - v || f.endSide - f.startSide) < 0))
        if (u < 0 && (u = v), f.point && (c = Math.max(c, m - v)), (v - i || f.startSide - s) >= 0)
          r.push(f), l.push(v - u), a.push(m - u), i = m, s = f.endSide;
        else {
          if (v == m)
            for (let x = r.length; x > 0; x--) {
              if ((v - (a[x - 1] + u) || f.startSide - r[x - 1].endSide) >= 0) {
                r.splice(x, 0, f), l.splice(x, 0, v - u), a.splice(x, 0, m - u);
                continue e;
              }
              if ((v - (l[x - 1] + u) || f.endSide - r[x - 1].startSide) > 0)
                break;
            }
          o(v, m, f);
        }
    }
    return { mapped: r.length ? new Ic(l, a, r, c) : null, pos: u };
  }
}
class Je {
  constructor(e, t, i, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = s;
  }
  /**
  @internal
  */
  static create(e, t, i, s) {
    return new Je(e, t, i, s);
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
    if (i && (t = t.slice().sort(Bu)), this.isEmpty)
      return t.length ? Je.of(t) : this;
    let l = new Cg(this, null, -1).goto(0), a = 0, u = [], c = new Ms();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let h = t[a++];
        c.addInner(h.from, h.to, h.value, !1) || u.push(h);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(Eu.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Je.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], s = -1, o, r = (a, u, c) => {
      o || (o = new Ms()), o.addRange(a, u, c, !1);
    };
    for (let a = 0; a < this.chunk.length; a++) {
      let u = this.chunkPos[a], c = this.chunk[a], h = e.touchesRange(u, u + c.length);
      if (h === !1)
        s = Math.max(s, c.maxPoint), t.push(c), i.push(e.mapPos(u));
      else if (h === !0) {
        let [f, d] = t.length ? [Vs(i) + Vs(t).length, Vs(Vs(t).value).endSide] : [-1, -1], { mapped: g, pos: v } = c.map(u, e, f, d, r);
        g && (s = Math.max(s, g.maxPoint), t.push(g), i.push(v));
      }
    }
    let l = this.nextLayer.map(e);
    return o && (l = o.finishInner(l)), t.length == 0 ? l : new Je(i, t, l || Je.empty, s);
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
    return sr.from([this]).goto(e);
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
    return sr.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, i, s, o = -1) {
    let r = e.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= o), l = t.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= o), a = ff(r, l, i), u = new So(r, a, o), c = new So(l, a, o);
    i.iterGaps((h, f, d) => df(u, h, c, f, d, s)), i.empty && i.length == 0 && df(u, 0, c, 0, 0, s);
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
    let l = ff(o, r), a = new So(o, l, 0).goto(i), u = new So(r, l, 0).goto(i);
    for (; ; ) {
      if (a.to != u.to || !Iu(a.active, u.active) || a.point && (!u.point || !Bc(a.point, u.point)))
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
    let r = new So(e, null, o).goto(t), l = t, a = r.openStart;
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
    let i = new Ms();
    for (let s of e instanceof Eu ? [e] : t ? Z1(e) : e)
      i.add(s.from, s.to, s.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Je.empty;
    let t = Vs(e);
    for (let i = e.length - 2; i >= 0; i--)
      for (let s = e[i]; s != Je.empty; s = s.nextLayer)
        t = new Je(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Je.empty = /* @__PURE__ */ new Je([], [], null, -1);
function Vs(n) {
  return n[n.length - 1];
}
function Z1(n) {
  if (n.length > 1)
    for (let e = n[0], t = 1; t < n.length; t++) {
      let i = n[t];
      if (Bu(e, i) > 0)
        return n.slice().sort(Bu);
      e = i;
    }
  return n;
}
Je.empty.nextLayer = Je.empty;
class Ms {
  finishChunk(e) {
    this.chunks.push(new Ic(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
    this.addInner(e, t, i, s) || (this.nextLayer || (this.nextLayer = new Ms())).addRange(e, t, i, s);
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
    return this.finishInner(Je.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = Je.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function ff(n, e, t) {
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
class Cg {
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
class sr {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= i && s.push(new Cg(r, t, i, o));
    return s.length == 1 ? s[0] : new sr(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      Wa(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      Wa(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Wa(this.heap, 0);
    }
  }
}
function Wa(n, e) {
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
class So {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = sr.from(e, t, i);
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
    Er(this.active, e), Er(this.activeTo, e), Er(this.activeRank, e), this.minActive = pf(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    Br(this.active, t, i), Br(this.activeTo, t, s), Br(this.activeRank, t, o), e && Br(e, t, this.cursor.from), this.minActive = pf(this.active, this.activeTo);
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
        this.removeActive(s), i && Er(i, s);
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
function df(n, e, t, i, s, o) {
  n.goto(e), t.goto(i);
  let r = i + s, l = i, a = i - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let h = n.to + a - t.to, f = h || n.endSide - t.endSide, d = f < 0 ? n.to + a : t.to, g = Math.min(d, r);
    if (n.point || t.point ? (n.point && t.point && Bc(n.point, t.point) && Iu(n.activeForPoint(n.to), t.activeForPoint(t.to)) || o.comparePoint(l, g, n.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), g > l && !Iu(n.active, t.active) && o.compareRange(l, g, n.active, t.active), u && g < r && (h || n.openEnd(d) != t.openEnd(d)) && (c = !0)), d > r)
      break;
    l = d, f <= 0 && n.next(), f >= 0 && t.next();
  }
}
function Iu(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (n[t] != e[t] && !Bc(n[t], e[t]))
      return !1;
  return !0;
}
function Er(n, e) {
  for (let t = e, i = n.length - 1; t < i; t++)
    n[t] = n[t + 1];
  n.pop();
}
function Br(n, e, t) {
  for (let i = n.length - 1; i >= e; i--)
    n[i + 1] = n[i];
  n[e] = t;
}
function pf(n, e) {
  let t = -1, i = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - i || n[s].endSide - n[t].endSide) < 0 && (t = s, i = e[s]);
  return t;
}
function ra(n, e, t = n.length) {
  let i = 0;
  for (let s = 0; s < t && s < n.length; )
    n.charCodeAt(s) == 9 ? (i += e - i % e, s++) : (i++, s = Jt(n, s));
  return i;
}
function Q1(n, e, t, i) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == n.length)
      break;
    o += n.charCodeAt(s) == 9 ? t - o % t : 1, s = Jt(n, s);
  }
  return n.length;
}
const Ru = "ͼ", gf = typeof Symbol > "u" ? "__" + Ru : Symbol.for(Ru), Pu = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), mf = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class ns {
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
    let e = mf[gf] || 1;
    return mf[gf] = e + 1, Ru + e.toString(36);
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
    let s = e[Pu], o = i && i.nonce;
    s ? o && s.setNonce(o) : s = new ex(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let vf = /* @__PURE__ */ new Map();
class ex {
  constructor(e, t) {
    let i = e.ownerDocument || e, s = i.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = vf.get(i);
      if (o) return e[Pu] = o;
      this.sheet = new s.CSSStyleSheet(), vf.set(i, this);
    } else
      this.styleTag = i.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Pu] = this;
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
var is = {
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
}, or = {
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
}, tx = typeof navigator < "u" && /Mac/.test(navigator.platform), nx = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var jt = 0; jt < 10; jt++) is[48 + jt] = is[96 + jt] = String(jt);
for (var jt = 1; jt <= 24; jt++) is[jt + 111] = "F" + jt;
for (var jt = 65; jt <= 90; jt++)
  is[jt] = String.fromCharCode(jt + 32), or[jt] = String.fromCharCode(jt);
for (var Ka in is) or.hasOwnProperty(Ka) || (or[Ka] = is[Ka]);
function ix(n) {
  var e = tx && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || nx && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? or : is)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function si() {
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
  for (; e < arguments.length; e++) Mg(n, arguments[e]);
  return n;
}
function Mg(n, e) {
  if (typeof e == "string")
    n.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    n.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) Mg(n, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let tn = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, _u = typeof document < "u" ? document : { documentElement: { style: {} } };
const Nu = /* @__PURE__ */ /Edge\/(\d+)/.exec(tn.userAgent), Ag = /* @__PURE__ */ /MSIE \d/.test(tn.userAgent), Vu = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(tn.userAgent), la = !!(Ag || Vu || Nu), yf = !la && /* @__PURE__ */ /gecko\/(\d+)/i.test(tn.userAgent), Ua = !la && /* @__PURE__ */ /Chrome\/(\d+)/.exec(tn.userAgent), bf = "webkitFontSmoothing" in _u.documentElement.style, Hu = !la && /* @__PURE__ */ /Apple Computer/.test(tn.vendor), xf = Hu && (/* @__PURE__ */ /Mobile\/\w+/.test(tn.userAgent) || tn.maxTouchPoints > 2);
var ge = {
  mac: xf || /* @__PURE__ */ /Mac/.test(tn.platform),
  windows: /* @__PURE__ */ /Win/.test(tn.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(tn.platform),
  ie: la,
  ie_version: Ag ? _u.documentMode || 6 : Vu ? +Vu[1] : Nu ? +Nu[1] : 0,
  gecko: yf,
  gecko_version: yf ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(tn.userAgent) || [0, 0])[1] : 0,
  chrome: !!Ua,
  chrome_version: Ua ? +Ua[1] : 0,
  ios: xf,
  android: /* @__PURE__ */ /Android\b/.test(tn.userAgent),
  webkit: bf,
  webkit_version: bf ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(tn.userAgent) || [0, 0])[1] : 0,
  safari: Hu,
  safari_version: Hu ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(tn.userAgent) || [0, 0])[1] : 0,
  tabSize: _u.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function Rc(n, e) {
  for (let t in n)
    t == "class" && e.class ? e.class += " " + n.class : t == "style" && e.style ? e.style += ";" + n.style : e[t] = n[t];
  return e;
}
const Al = /* @__PURE__ */ Object.create(null);
function Pc(n, e, t) {
  if (n == e)
    return !0;
  n || (n = Al), e || (e = Al);
  let i = Object.keys(n), s = Object.keys(e);
  if (i.length - 0 != s.length - 0)
    return !1;
  for (let o of i)
    if (o != t && (s.indexOf(o) == -1 || n[o] !== e[o]))
      return !1;
  return !0;
}
function sx(n, e) {
  for (let t = n.attributes.length - 1; t >= 0; t--) {
    let i = n.attributes[t].name;
    e[i] == null && n.removeAttribute(i);
  }
  for (let t in e) {
    let i = e[t];
    t == "style" ? n.style.cssText = i : n.getAttribute(t) != i && n.setAttribute(t, i);
  }
}
function wf(n, e, t) {
  let i = !1;
  if (e)
    for (let s in e)
      t && s in t || (i = !0, s == "style" ? n.style.cssText = "" : n.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (i = !0, s == "style" ? n.style.cssText = t[s] : n.setAttribute(s, t[s]));
  return i;
}
function ox(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < n.attributes.length; t++) {
    let i = n.attributes[t];
    e[i.name] = i.value;
  }
  return e;
}
class yr {
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
var Gt = /* @__PURE__ */ (function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
})(Gt || (Gt = {}));
class wt extends $s {
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
    return new br(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), i = !!e.block;
    return t += i && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Ds(e, t, t, i, e.widget || null, !1);
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
      let { start: o, end: r } = Tg(e, t);
      i = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Ds(e, i, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new xr(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return Je.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
wt.none = Je.empty;
class br extends wt {
  constructor(e) {
    let { start: t, end: i } = Tg(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? Rc(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Al;
  }
  eq(e) {
    return this == e || e instanceof br && this.tagName == e.tagName && Pc(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
br.prototype.point = !1;
class xr extends wt {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof xr && this.spec.class == e.spec.class && Pc(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
xr.prototype.mapMode = hn.TrackBefore;
xr.prototype.point = !0;
class Ds extends wt {
  constructor(e, t, i, s, o, r) {
    super(t, i, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? hn.TrackBefore : hn.TrackAfter : hn.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? Gt.WidgetRange : this.startSide <= 0 ? Gt.WidgetBefore : Gt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Ds && rx(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Ds.prototype.point = !0;
function Tg(n, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = n;
  return t == null && (t = n.inclusive), i == null && (i = n.inclusive), { start: t ?? e, end: i ?? e };
}
function rx(n, e) {
  return n == e || !!(n && e && n.compare(e));
}
function Xs(n, e, t, i = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + i >= n ? t[s] = Math.max(t[s], e) : t.push(n, e);
}
class rr extends $s {
  constructor(e, t, i) {
    super(), this.tagName = e, this.attributes = t, this.rank = i;
  }
  eq(e) {
    return e == this || e instanceof rr && this.tagName == e.tagName && Pc(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new rr(e.tagName, e.attributes || Al, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Je.of(e, t);
  }
}
rr.prototype.startSide = rr.prototype.endSide = -1;
function lr(n) {
  let e;
  return n.nodeType == 11 ? e = n.getSelection ? n : n.ownerDocument : e = n, e.getSelection();
}
function Fu(n, e) {
  return e ? n == e || n.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Wo(n, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Fu(n, e.anchorNode);
  } catch {
    return !1;
  }
}
function ul(n) {
  return n.nodeType == 3 ? ar(n, 0, n.nodeValue.length).getClientRects() : n.nodeType == 1 ? n.getClientRects() : [];
}
function Ko(n, e, t, i) {
  return t ? kf(n, e, t, i, -1) || kf(n, e, t, i, 1) : !1;
}
function ss(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}
function Tl(n) {
  return n.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
function kf(n, e, t, i, s) {
  for (; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (s < 0 ? 0 : Oi(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let o = n.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = ss(n) + (s < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      if (n = n.childNodes[e + (s < 0 ? -1 : 0)], n.nodeType == 1 && n.contentEditable == "false")
        return !1;
      e = s < 0 ? Oi(n) : 0;
    } else
      return !1;
  }
}
function Oi(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function $l(n, e) {
  let { left: t, right: i } = n;
  if (t == i)
    return n;
  let s = e ? t : i;
  return { left: s, right: s, top: n.top, bottom: n.bottom };
}
function lx(n) {
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
function $g(n, e) {
  let t = e.width / n.offsetWidth, i = e.height / n.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - n.offsetWidth) < 1) && (t = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(e.height - n.offsetHeight) < 1) && (i = 1), { scaleX: t, scaleY: i };
}
function ax(n, e, t, i, s, o, r, l) {
  let a = n.ownerDocument, u = a.defaultView || window;
  for (let c = n, h = !1; c && !h; )
    if (c.nodeType == 1) {
      let f, d = c == a.body, g = 1, v = 1;
      if (d)
        f = lx(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (h = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let O = c.getBoundingClientRect();
        ({ scaleX: g, scaleY: v } = $g(c, O)), f = {
          left: O.left,
          right: O.left + c.clientWidth * g,
          top: O.top,
          bottom: O.top + c.clientHeight * v
        };
      }
      let m = 0, x = 0;
      if (s == "nearest")
        e.top < f.top + r ? (x = e.top - (f.top + r), t > 0 && e.bottom > f.bottom + x && (x = e.bottom - f.bottom + r)) : e.bottom > f.bottom - r && (x = e.bottom - f.bottom + r, t < 0 && e.top - x < f.top && (x = e.top - (f.top + r)));
      else {
        let O = e.bottom - e.top, L = f.bottom - f.top;
        x = (s == "center" && O <= L ? e.top + O / 2 - L / 2 : s == "start" || s == "center" && t < 0 ? e.top - r : e.bottom - L + r) - f.top;
      }
      if (i == "nearest" ? e.left < f.left + o ? (m = e.left - (f.left + o), t > 0 && e.right > f.right + m && (m = e.right - f.right + o)) : e.right > f.right - o && (m = e.right - f.right + o, t < 0 && e.left < f.left + m && (m = e.left - (f.left + o))) : m = (i == "center" ? e.left + (e.right - e.left) / 2 - (f.right - f.left) / 2 : i == "start" == l ? e.left - o : e.right - (f.right - f.left) + o) - f.left, m || x)
        if (d)
          u.scrollBy(m, x);
        else {
          let O = 0, L = 0;
          if (x) {
            let E = c.scrollTop;
            c.scrollTop += x / v, L = (c.scrollTop - E) * v;
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
          }, O && Math.abs(O - m) < 1 && (i = "nearest"), L && Math.abs(L - x) < 1 && (s = "nearest");
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
function Dg(n, e = !0) {
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
class ux {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: i } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Oi(t) : 0), i, Math.min(e.focusOffset, i ? Oi(i) : 0));
  }
  set(e, t, i, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = s;
  }
}
function Og(n) {
  let e = [];
  for (let t = n; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function Lg(n, e = !0) {
  for (let { node: t, left: i, top: s } of n)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != i && (t.scrollLeft = i);
}
let gs = null;
ge.safari && ge.safari_version >= 26 && (gs = !1);
function Eg(n) {
  if (n.setActive)
    return n.setActive();
  if (gs)
    return n.focus(gs);
  let e = Og(n);
  n.focus(gs == null ? {
    get preventScroll() {
      return gs = { preventScroll: !0 }, !0;
    }
  } : void 0), gs || (gs = !1, Lg(e));
}
let Sf;
function ar(n, e, t = e) {
  let i = Sf || (Sf = document.createRange());
  return i.setEnd(n, t), i.setStart(n, e), i;
}
function Js(n, e, t, i) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  i && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = i);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, n.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, n.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function cx(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function hx(n, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (i = Math.min(i, Oi(t)); ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[i - 1];
      s.contentEditable == "false" ? i-- : (t = s, i = Oi(t));
    } else {
      if (t == n)
        return !0;
      i = ss(t), t = t.parentNode;
    }
}
function Bg(n) {
  return n instanceof Window ? n.pageYOffset > Math.max(0, n.document.documentElement.scrollHeight - n.innerHeight - 4) : n.scrollTop > Math.max(1, n.scrollHeight - n.clientHeight - 4);
}
function Ig(n, e) {
  for (let t = n, i = e; ; ) {
    if (t.nodeType == 3 && i > 0)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i - 1], i = Oi(t);
    } else if (t.parentNode && !Tl(t))
      i = ss(t), t = t.parentNode;
    else
      return null;
  }
}
function Rg(n, e) {
  for (let t = n, i = e; ; ) {
    if (t.nodeType == 3 && i < t.nodeValue.length)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i], i = 0;
    } else if (t.parentNode && !Tl(t))
      i = ss(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Pn {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new Pn(e.parentNode, ss(e), t);
  }
  static after(e, t) {
    return new Pn(e.parentNode, ss(e) + 1, t);
  }
}
var xt = /* @__PURE__ */ (function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
})(xt || (xt = {}));
const Os = xt.LTR, _c = xt.RTL;
function Pg(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    e.push(1 << +n[t]);
  return e;
}
const fx = /* @__PURE__ */ Pg("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), dx = /* @__PURE__ */ Pg("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), zu = /* @__PURE__ */ Object.create(null), Gn = [];
for (let n of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ n.charCodeAt(0), t = /* @__PURE__ */ n.charCodeAt(1);
  zu[e] = t, zu[t] = -e;
}
function _g(n) {
  return n <= 247 ? fx[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? dx[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8204 ? 256 : 64336 <= n && n <= 65023 ? 4 : 1;
}
const px = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class li {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? _c : Os;
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
function Ng(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++) {
    let i = n[t], s = e[t];
    if (i.from != s.from || i.to != s.to || i.direction != s.direction || !Ng(i.inner, s.inner))
      return !1;
  }
  return !0;
}
const pt = [];
function gx(n, e, t, i, s) {
  for (let o = 0; o <= i.length; o++) {
    let r = o ? i[o - 1].to : e, l = o < i.length ? i[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, h = a; u < l; u++) {
      let f = _g(n.charCodeAt(u));
      f == 512 ? f = c : f == 8 && h == 4 && (f = 16), pt[u] = f == 4 ? 2 : f, f & 7 && (h = f), c = f;
    }
    for (let u = r, c = a, h = a; u < l; u++) {
      let f = pt[u];
      if (f == 128)
        u < l - 1 && c == pt[u + 1] && c & 24 ? f = pt[u] = c : pt[u] = 256;
      else if (f == 64) {
        let d = u + 1;
        for (; d < l && pt[d] == 64; )
          d++;
        let g = u && c == 8 || d < t && pt[d] == 8 ? h == 1 ? 1 : 8 : 256;
        for (let v = u; v < d; v++)
          pt[v] = g;
        u = d - 1;
      } else f == 8 && h == 1 && (pt[u] = 1);
      c = f, f & 7 && (h = f);
    }
  }
}
function mx(n, e, t, i, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= i.length; r++) {
    let u = r ? i[r - 1].to : e, c = r < i.length ? i[r].from : t;
    for (let h = u, f, d, g; h < c; h++)
      if (d = zu[f = n.charCodeAt(h)])
        if (d < 0) {
          for (let v = l - 3; v >= 0; v -= 3)
            if (Gn[v + 1] == -d) {
              let m = Gn[v + 2], x = m & 2 ? s : m & 4 ? m & 1 ? o : s : 0;
              x && (pt[h] = pt[Gn[v]] = x), l = v;
              break;
            }
        } else {
          if (Gn.length == 189)
            break;
          Gn[l++] = h, Gn[l++] = f, Gn[l++] = a;
        }
      else if ((g = pt[h]) == 2 || g == 1) {
        let v = g == s;
        a = v ? 0 : 1;
        for (let m = l - 3; m >= 0; m -= 3) {
          let x = Gn[m + 2];
          if (x & 2)
            break;
          if (v)
            Gn[m + 2] |= 2;
          else {
            if (x & 4)
              break;
            Gn[m + 2] |= 4;
          }
        }
      }
  }
}
function vx(n, e, t, i) {
  for (let s = 0, o = i; s <= t.length; s++) {
    let r = s ? t[s - 1].to : n, l = s < t.length ? t[s].from : e;
    for (let a = r; a < l; ) {
      let u = pt[a];
      if (u == 256) {
        let c = a + 1;
        for (; ; )
          if (c == l) {
            if (s == t.length)
              break;
            c = t[s++].to, l = s < t.length ? t[s].from : e;
          } else if (pt[c] == 256)
            c++;
          else
            break;
        let h = o == 1, f = (c < e ? pt[c] : i) == 1, d = h == f ? h ? 1 : 2 : i;
        for (let g = c, v = s, m = v ? t[v - 1].to : n; g > a; )
          g == m && (g = t[--v].from, m = v ? t[v - 1].to : n), pt[--g] = d;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function Wu(n, e, t, i, s, o, r) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, h = !1;
      if (u == o.length || a < o[u].from) {
        let v = pt[a];
        v != l && (c = !1, h = v == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, g = a;
      e: for (; ; )
        if (u < o.length && g == o[u].from) {
          if (h)
            break e;
          let v = o[u];
          if (!c)
            for (let m = v.to, x = u + 1; ; ) {
              if (m == t)
                break e;
              if (x < o.length && o[x].from == m)
                m = o[x++].to;
              else {
                if (pt[m] == l)
                  break e;
                break;
              }
            }
          if (u++, f)
            f.push(v);
          else {
            v.from > a && r.push(new li(a, v.from, d));
            let m = v.direction == Os != !(d % 2);
            Ku(n, m ? i + 1 : i, s, v.inner, v.from, v.to, r), a = v.to;
          }
          g = v.to;
        } else {
          if (g == t || (c ? pt[g] != l : pt[g] == l))
            break;
          g++;
        }
      f ? Wu(n, a, g, i + 1, s, f, r) : a < g && r.push(new li(a, g, d)), a = g;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, h = !1;
      if (!u || a > o[u - 1].to) {
        let v = pt[a - 1];
        v != l && (c = !1, h = v == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, g = a;
      e: for (; ; )
        if (u && g == o[u - 1].to) {
          if (h)
            break e;
          let v = o[--u];
          if (!c)
            for (let m = v.from, x = u; ; ) {
              if (m == e)
                break e;
              if (x && o[x - 1].to == m)
                m = o[--x].from;
              else {
                if (pt[m - 1] == l)
                  break e;
                break;
              }
            }
          if (f)
            f.push(v);
          else {
            v.to < a && r.push(new li(v.to, a, d));
            let m = v.direction == Os != !(d % 2);
            Ku(n, m ? i + 1 : i, s, v.inner, v.from, v.to, r), a = v.from;
          }
          g = v.from;
        } else {
          if (g == e || (c ? pt[g - 1] != l : pt[g - 1] == l))
            break;
          g--;
        }
      f ? Wu(n, g, a, i + 1, s, f, r) : g < a && r.push(new li(g, a, d)), a = g;
    }
}
function Ku(n, e, t, i, s, o, r) {
  let l = e % 2 ? 2 : 1;
  gx(n, s, o, i, l), mx(n, s, o, i, l), vx(s, o, i, l), Wu(n, s, o, e, t, i, r);
}
function yx(n, e, t) {
  if (!n)
    return [new li(0, 0, e == _c ? 1 : 0)];
  if (e == Os && !t.length && !px.test(n))
    return Vg(n.length);
  if (t.length)
    for (; n.length > pt.length; )
      pt[pt.length] = 256;
  let i = [], s = e == Os ? 0 : 1;
  return Ku(n, s, s, t, 0, n.length, i), i;
}
function Vg(n) {
  return [new li(0, n, 0)];
}
let Hg = "";
function bx(n, e, t, i, s) {
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
    l = li.find(e, r, (o = i.bidiLevel) !== null && o !== void 0 ? o : -1, i.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let f = l += s ? 1 : -1;
    if (f < 0 || f >= e.length)
      return null;
    a = e[l = f], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = Jt(n.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), Hg = n.text.slice(Math.min(r, c), Math.max(r, c));
  let h = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!h)
      return s ? ne.cursor(n.to, 1) : ne.cursor(n.from, -1);
    if (h.level + (s ? 0 : 1) < a.level)
      return ne.cursor(h.side(!s, t) + n.from, h.forward(s, t) ? 1 : -1, h.level);
  }
  return ne.cursor(c + n.from, a.forward(s, t) ? -1 : 1, a.level);
}
function xx(n, e, t) {
  for (let i = e; i < t; i++) {
    let s = _g(n.charCodeAt(i));
    if (s == 1)
      return Os;
    if (s == 2 || s == 4)
      return _c;
  }
  return Os;
}
const Fg = /* @__PURE__ */ we.define(), zg = /* @__PURE__ */ we.define(), Wg = /* @__PURE__ */ we.define(), Kg = /* @__PURE__ */ we.define(), Uu = /* @__PURE__ */ we.define(), Ug = /* @__PURE__ */ we.define(), jg = /* @__PURE__ */ we.define(), Nc = /* @__PURE__ */ we.define(), Vc = /* @__PURE__ */ we.define(), Gg = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e)
}), qg = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e)
}), Yg = /* @__PURE__ */ we.define();
class Zs {
  constructor(e, t, i, s, o, r = !1) {
    this.range = e, this.y = t, this.x = i, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new Zs(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new Zs(ne.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Ir = /* @__PURE__ */ bt.define({ map: (n, e) => n.map(e) }), Xg = /* @__PURE__ */ bt.define();
function _n(n, e, t) {
  let i = n.facet(Kg);
  i.length ? i[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const xi = /* @__PURE__ */ we.define({ combine: (n) => n.length ? n[0] : !0 });
let wx = 0;
const Fs = /* @__PURE__ */ we.define({
  combine(n) {
    return n.filter((e, t) => {
      for (let i = 0; i < t; i++)
        if (n[i].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class vn {
  constructor(e, t, i, s, o) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(Fs.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(Fs.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: i, eventObservers: s, provide: o, decorations: r } = t || {};
    return new vn(wx++, e, i, s, (l) => {
      let a = [];
      return r && a.push(aa.of((u) => {
        let c = u.plugin(l);
        return c ? r(c) : wt.none;
      })), o && a.push(o(l)), a;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return vn.define((i, s) => new e(i, s), t);
  }
}
class ja {
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
            if (_n(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
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
        _n(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        _n(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Jg = /* @__PURE__ */ we.define(), Hc = /* @__PURE__ */ we.define(), aa = /* @__PURE__ */ we.define(), Zg = /* @__PURE__ */ we.define(), Fc = /* @__PURE__ */ we.define(), wr = /* @__PURE__ */ we.define(), Qg = /* @__PURE__ */ we.define();
function Cf(n, e) {
  let t = n.state.facet(Qg);
  if (!t.length)
    return t;
  let i = t.map((o) => o instanceof Function ? o(n) : o), s = [];
  return Je.spans(i, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, h = s;
      for (let f = l.length - 1; f >= 0; f--, a--) {
        let d = l[f].spec.bidiIsolate, g;
        if (d == null && (d = xx(e.text, u, c)), a > 0 && h.length && (g = h[h.length - 1]).to == u && g.direction == d)
          g.to = c, h = g.inner;
        else {
          let v = { from: u, to: c, direction: d, inner: [] };
          h.push(v), h = v.inner;
        }
      }
    }
  }), s;
}
const em = /* @__PURE__ */ we.define();
function zc(n) {
  let e = 0, t = 0, i = 0, s = 0;
  for (let o of n.state.facet(em)) {
    let r = o(n);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (i = Math.max(i, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: i, bottom: s };
}
const Lo = /* @__PURE__ */ we.define();
class Cn {
  constructor(e, t, i, s) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = s;
  }
  join(e) {
    return new Cn(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
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
      i.push(new Cn(c, f, u, h));
    }
    return i;
  }
}
class Dl {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = Ft.empty(this.startState.doc.length);
    for (let o of i)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new Cn(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new Dl(e, t, i);
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
const kx = [];
class Mt {
  constructor(e, t, i = 0) {
    this.dom = e, this.length = t, this.flags = i, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return kx;
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
      t && sx(this.dom, t);
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
    let i = ss(this.dom), s = this.length ? e > 0 : t > 0;
    return new Pn(this.parent.dom, i + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof ca)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class ua extends Mt {
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
          s = Mf(s);
      else
        t.insertBefore(l.dom, s);
      i = l.dom;
    }
    for (s = i ? i.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = Mf(s);
    this.length = r;
  }
}
function Mf(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class ca extends ua {
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
      let t = Mt.get(e);
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
        if (r instanceof Ai)
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
class Ai extends ua {
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
    let i = new Ai(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class so extends ua {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, i) {
    let s = new so(t || document.createElement("div"), e);
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
        v >= h && (g.isComposite() ? a(g, h - d) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || i && Cx(r, g))) && (v > h || g.flags & 32 && t <= 1) ? (r = g, l = h - d) : (d < h || g.flags & 16 && !g.isHidden && t >= -1) && (s = g, o = h - d)), d = v;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, i) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, i) : Sx(this);
  }
  domIn(e, t) {
    let i = this.resolveInline(e, t);
    if (i) {
      let { tile: s, offset: o } = i;
      if (this.dom.contains(s.dom))
        return s.isText() ? new Pn(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = i.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new Pn(a.dom, 0);
        a == i.tile && (l = !0);
      }
    }
    return new Pn(this.dom, 0);
  }
}
function Sx(n) {
  let e = n.dom.lastChild;
  if (!e)
    return n.dom.getBoundingClientRect();
  let t = ul(e);
  return t[t.length - 1] || null;
}
function Cx(n, e) {
  let t = n.coordsIn(0, 1), i = e.coordsIn(0, 1);
  return t && i && i.top < t.bottom;
}
class fn extends ua {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let i = new fn(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class ws extends Mt {
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
    let a = ar(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return ge.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), i == null ? u : $l(u, (l ? l > 0 : t < 0) == i);
  }
  static of(e, t) {
    let i = new ws(t || document.createTextNode(e), e);
    return t || (i.flags |= 2), i;
  }
}
class Ls extends Mt {
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
      return $l(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return $l(r, !l);
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
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new Ls(o, i, e, s);
  }
}
class Ol extends Mt {
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
    return i == null ? s : $l(s, t > 0 == i);
  }
}
class Mx {
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
class Ax {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.wrapper = i, this.rank = s;
  }
}
class Tx {
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
      let a = r.children[r.children.length - 1] = new ws(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || ws.of(e, (o = this.cache.find(ws)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let i = this.curLine;
    i.dom != t.line.dom && (i.setDOM(this.cache.reused.has(t.line) ? Ga(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = i;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof fn && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(Ga(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && Mt.get(a.dom) && (c = Ga(a.dom));
        let h = fn.of(a.mark, c);
        s.append(h), s = h;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = Mt.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let r = new ws(e.text, e.text.nodeValue);
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
    e || (e = tm);
    let s = so.start(e, t || ((i = this.cache.find(so)) === null || i === void 0 ? void 0 : i.dom), !!t);
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
      if (t > 0 && (l = s.lastChild) && l instanceof fn && l.mark.eq(r))
        s = l, t--;
      else {
        let a = fn.of(r, (i = this.cache.find(fn, (u) => u.mark.eq(r))) === null || i === void 0 ? void 0 : i.dom);
        s.append(a), s = a, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Af(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(ge.ios && Af(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        qa,
        0,
        32
        /* TileFlag.After */
      ) || new Ls(
        qa.toDOM(),
        0,
        qa,
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
        let t = e.rank * 102 + e.value.rank, i = new Ax(e.from, e.to, e.value, t), s = this.wrappers.length;
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
      if (i.from < this.pos && s instanceof Ai && s.wrapper.eq(i.wrapper))
        t = s;
      else {
        let o = Ai.of(i.wrapper, (e = this.cache.find(Ai, (r) => r.wrapper.eq(i.wrapper))) === null || e === void 0 ? void 0 : e.dom);
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
      Ol,
      void 0,
      1
      /* Reused.Full */
    );
    return i && (i.flags = t), i || new Ol(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class $x {
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
const Ll = [Ls, so, ws, fn, Ol, Ai, ca];
for (let n = 0; n < Ll.length; n++)
  Ll[n].bucket = n;
class Dx {
  constructor(e) {
    this.view = e, this.buckets = Ll.map(() => []), this.index = Ll.map(() => 0), this.reused = /* @__PURE__ */ new Map();
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
          ), new Ls(l.dom, t, e, l.flags & -498 | i));
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
class Ox {
  constructor(e, t, i, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new Dx(e), this.text = new $x(e.state.doc), this.builder = new Tx(this.cache, new ca(e, e.contentDOM), Je.iter(i)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Mx(t), this.reuseWalker = {
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
    let s = Bx(this.old), o = this.openMarks;
    this.old.advance(e, i ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? Ls.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
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
        else if (r instanceof Ol)
          this.cache.add(r);
        else if (r instanceof fn)
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
        r.isLine() ? this.builder.addLineStart(r.attrs, this.cache.maybeReuse(r)) : (this.cache.add(r), r instanceof fn && s.unshift(r.mark)), this.openWidget = !1;
      },
      leave: (r) => {
        r.isLine() ? s.length && (s.length = o = 0) : r instanceof fn && (s.shift(), o = Math.min(o, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let i = null, s = this.builder, o = -1, r = Je.spans(this.decorations, e, t, {
      point: (l, a, u, c, h, f) => {
        if (u instanceof Ds) {
          if (this.disallowBlockEffectsFor[f]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, h > c.length)
            s.continueWidget(a - l);
          else {
            let d = u.widget || (u.block ? oo.block : oo.inline), g = Lx(u), v = this.cache.findWidget(d, a - l, g) || Ls.of(d, this.view, a - l, g);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(i), s.addBlockWidget(v)) : (s.ensureLine(i), s.addInlineWidget(v, c, h));
          }
          i = null;
        } else
          i = Ex(i, u);
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
      let o = Mt.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof fn ? t.push(o) : o?.isLine() ? i = o : o instanceof Ai || (s.nodeName == "DIV" && !i ? i = new so(s, tm) : i || t.push(fn.of(new br({ tagName: s.nodeName.toLowerCase(), attributes: ox(s) }), s)));
    }
    return i ? { line: i, marks: t } : null;
  }
}
function Af(n, e) {
  let t = (i) => {
    for (let s of i.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(n);
}
function Lx(n) {
  let e = n.isReplace ? (n.startSide < 0 ? 64 : 0) | (n.endSide > 0 ? 128 : 0) : n.startSide > 0 ? 32 : 16;
  return n.block && (e |= 256), e;
}
const tm = { class: "cm-line" };
function Ex(n, e) {
  let t = e.spec.attributes, i = e.spec.class;
  return !t && !i || (n || (n = { class: "cm-line" }), t && Rc(t, n), i && (n.class += " " + i)), n;
}
function Bx(n) {
  let e = [];
  for (let t = n.parents.length; t > 1; t--) {
    let i = t == n.parents.length ? n.tile : n.parents[t].tile;
    i instanceof fn && e.push(i.mark);
  }
  return e;
}
function Ga(n) {
  let e = Mt.get(n);
  return e && e.setDOM(n.cloneNode()), n;
}
class oo extends yr {
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
oo.inline = /* @__PURE__ */ new oo("span");
oo.block = /* @__PURE__ */ new oo("div");
const qa = /* @__PURE__ */ new class extends yr {
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
class Tf {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = wt.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new ca(e, e.contentDOM), this.updateInner([new Cn(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let i = e.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: c, toA: h }) => h < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !zx(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? Rx(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: h } = this.hasComposition;
      i = new Cn(c, h, e.changes.mapPos(c, -1), e.changes.mapPos(h, 1)).addToSet(i.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (ge.ie || ge.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Nx(r, this.decorations, e.changes);
    a.length && (i = Cn.extendWithRanges(i, a));
    let u = Hx(l, this.blockWrappers, e.changes);
    return u.length && (i = Cn.extendWithRanges(i, u)), o && !i.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (i = o.range.addToSet(i.slice())), this.tile.flags & 2 && i.length == 0 ? !1 : (this.updateInner(i, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: i } = this.view;
    i.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new Ox(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && Mt.get(t.text) && l.cache.reused.set(
          Mt.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), ju(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = ge.chrome || ge.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || i.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof Ya && s.push(o.dom);
    i.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(Xg) && (this.editContextFormatting = i.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: i } = this.tile, s = this.view.root.activeElement, o = s == i, r = !o && !(this.view.state.facet(xi) || i.tabIndex > -1) && Wo(i, this.view.observer.selectionRange) && !(s && i.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), ge.gecko && a.empty && !this.hasComposition && Ix(u)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(f, u.node.childNodes[u.offset] || null)), u = c = new Pn(f, 0), l = !0;
    }
    let h = this.view.observer.selectionRange;
    (l || !h.focusNode || (!Ko(u.node, u.offset, h.anchorNode, h.anchorOffset) || !Ko(c.node, c.offset, h.focusNode, h.focusOffset)) && !this.suppressWidgetCursorChange(h, a)) && (this.view.observer.ignore(() => {
      ge.android && ge.chrome && i.contains(h.focusNode) && Fx(h.focusNode, i) && (i.blur(), i.focus({ preventScroll: !0 }));
      let f = lr(this.view.root);
      if (f) if (a.empty) {
        if (ge.gecko) {
          let d = Px(u.node, u.offset);
          if (d && d != 3) {
            let g = (d == 1 ? Ig : Rg)(u.node, u.offset);
            g && (u = new Pn(g.node, g.offset));
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
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new Pn(h.anchorNode, h.anchorOffset), this.impreciseHead = c.precise ? null : new Pn(h.focusNode, h.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Ko(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, i = lr(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
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
        let r = Oi(e) == 0 ? 0 : t == 0 ? -1 : 1;
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
      for (; o && !Mt.get(o); )
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
    return s.isWidget() ? s.widget instanceof Ya ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, i);
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
        let a = ar(o.dom, r, l).getClientRects();
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
    let t = [], { from: i, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == xt.LTR, u = 0, c = (h, f, d) => {
      for (let g = 0; g < h.children.length && !(f > s); g++) {
        let v = h.children[g], m = f + v.length, x = v.dom.getBoundingClientRect(), { height: O } = x;
        if (d && !g && (u += x.top - d.top), v instanceof Ai)
          m > i && c(v, f, x);
        else if (f >= i && (u > 0 && t.push(-u), t.push(O + u), u = 0, r)) {
          let L = v.dom.lastChild, E = L ? ul(L) : [];
          if (E.length) {
            let R = E[E.length - 1], z = a ? R.right - x.left : x.right - R.left;
            z > l && (l = z, this.minWidth = o, this.minWidthFrom = f, this.minWidthTo = m);
          }
        }
        d && g == h.children.length - 1 && (u += d.bottom - x.bottom), f = m + v.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? xt.RTL : xt.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((r) => {
      if (r.isLine() && r.children.length && r.length <= 20) {
        let l = 0, a;
        for (let u of r.children) {
          if (!u.isText() || /[^ -~]/.test(u.text))
            return;
          let c = ul(u.dom);
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
      let r = ul(t.firstChild)[0];
      i = t.getBoundingClientRect().height, s = r && r.width ? r.width / 27 : 7, o = r && r.height ? r.height : i, t.remove();
    }), { lineHeight: i, charWidth: s, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, s = 0; ; s++) {
      let o = s == t.viewports.length ? null : t.viewports[s], r = o ? o.from - 1 : this.view.state.doc.length;
      if (r > i) {
        let l = (t.lineBlockAt(r).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
        e.push(wt.replace({
          widget: new Ya(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, r));
      }
      if (!o)
        break;
      i = o.to + 1;
    }
    return wt.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(aa).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), i = !1, s = this.view.state.facet(Fc).map((o, r) => {
      let l = typeof o == "function";
      return l && (i = !0), l ? o(this.view) : o;
    });
    for (s.length && (this.dynamicDecorationMap[e++] = i, t.push(Je.join(s))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Zg).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(Yg))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        _n(this.view.state, c, "scroll handler");
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
    let o = zc(this.view), r = {
      left: i.left - o.left,
      top: i.top - o.top,
      right: i.right + o.right,
      bottom: i.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (ax(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == xt.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (i.top > window.visualViewport.offsetTop + window.visualViewport.height || i.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Og(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), Lg(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (i) => i.isWidget() || i.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    ju(this.tile);
  }
}
function ju(n, e) {
  let t = e?.get(n);
  if (t != 1) {
    t == null && n.destroy();
    for (let i of n.children)
      ju(i, e);
  }
}
function Ix(n) {
  return n.node.nodeType == 1 && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
function nm(n, e) {
  let t = n.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let i = Ig(t.focusNode, t.focusOffset), s = Rg(t.focusNode, t.focusOffset), o = i || s;
  if (s && i && s.node != i.node) {
    let l = Mt.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (n.docView.lastCompositionAfterCursor) {
      let a = Mt.get(i.node);
      !a || a.isText() && a.text != i.node.nodeValue || (o = s);
    }
  }
  if (n.docView.lastCompositionAfterCursor = o != i, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function Rx(n, e, t) {
  let i = nm(n, t);
  if (!i)
    return null;
  let { node: s, from: o, to: r } = i, l = s.nodeValue;
  if (/[\n\r]/.test(l) || n.state.doc.sliceString(i.from, i.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Cn(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Px(n, e) {
  return n.nodeType != 1 ? 0 : (e && n.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < n.childNodes.length && n.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let _x = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Xs(e, t, this.changes);
  }
  comparePoint(e, t) {
    Xs(e, t, this.changes);
  }
  boundChange(e) {
    Xs(e, e, this.changes);
  }
};
function Nx(n, e, t) {
  let i = new _x();
  return Je.compare(n, e, t, i), i.changes;
}
class Vx {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Xs(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    Xs(e, e, this.changes);
  }
}
function Hx(n, e, t) {
  let i = new Vx();
  return Je.compare(n, e, t, i), i.changes;
}
function Fx(n, e) {
  for (let t = n; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function zx(n, e) {
  let t = !1;
  return e && n.iterChangedRanges((i, s) => {
    i < e.to && s > e.from && (t = !0);
  }), t;
}
class Ya extends yr {
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
function Wx(n, e, t = 1) {
  let i = n.charCategorizer(e), s = n.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return ne.cursor(e);
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
  return ne.undirectionalRange(r + s.from, l + s.from);
}
function Kx(n, e, t, i, s) {
  let o = Math.round((i - e.left) * n.defaultCharacterWidth);
  if (n.lineWrapping && t.height > n.defaultLineHeight * 1.5) {
    let l = n.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (n.defaultLineHeight - l) * 0.5) / l);
    o += a * n.viewState.heightOracle.lineLength;
  }
  let r = n.state.sliceDoc(t.from, t.to);
  return t.from + Q1(r, o, n.state.tabSize);
}
function Gu(n, e, t) {
  let i = n.lineBlockAt(e);
  if (Array.isArray(i.type)) {
    let s;
    for (let o of i.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!s || o.type == Gt.Text && (s.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (s = o);
      }
    }
    return s || i;
  }
  return i;
}
function Ux(n, e, t, i) {
  let s = Gu(n, e.head, e.assoc || -1), o = !i || s.type != Gt.Text || !(n.lineWrapping || s.widgetLineBreaks) ? null : n.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = n.dom.getBoundingClientRect(), l = n.textDirectionAt(s.from), a = n.posAtCoords({
      x: t == (l == xt.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return ne.cursor(a, t ? -1 : 1);
  }
  return ne.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function $f(n, e, t, i) {
  let s = n.state.doc.lineAt(e.head), o = n.bidiSpans(s), r = n.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = bx(s, o, r, l, t), c = Hg;
    if (!u) {
      if (s.number == (t ? n.state.doc.lines : 1))
        return l;
      c = `
`, s = n.state.doc.line(s.number + (t ? 1 : -1)), o = n.bidiSpans(s), u = t ? ne.cursor(s.from, -1) : ne.cursor(s.to, 1);
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
function jx(n, e, t) {
  let i = n.state.charCategorizer(e), s = i(t);
  return (o) => {
    let r = i(o);
    return s == ki.Space && (s = r), s == r;
  };
}
function Gx(n, e, t, i) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? n.state.doc.length : 0))
    return ne.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = n.contentDOM.getBoundingClientRect(), u = n.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = n.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let g = n.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, n.defaultCharacterWidth * (s - g.from))), l = (o < 0 ? g.top : g.bottom) + c;
  }
  let h = a.left + r, f = n.viewState.heightOracle.textHeight >> 1, d = i ?? f;
  for (let g = 0; ; g += f) {
    let v = l + (d + g) * o, m = qu(n, { x: h, y: v }, !1, o);
    if (t ? v > a.bottom : v < a.top)
      return ne.cursor(m.pos, m.assoc);
    let x = n.coordsAtPos(m.pos, m.assoc), O = x ? (x.top + x.bottom) / 2 : 0;
    if (!x || (t ? O > l : O < l))
      return ne.cursor(m.pos, m.assoc, void 0, r);
  }
}
function Uo(n, e, t) {
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
function im(n, e) {
  let t = null;
  for (let i = 0; i < e.ranges.length; i++) {
    let s = e.ranges[i], o = null;
    if (s.empty) {
      let r = Uo(n, s.from, 0);
      r != s.from && (o = ne.cursor(r, -1));
    } else {
      let r = Uo(n, s.from, -1), l = Uo(n, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = ne.undirectionalRange(s.from, s.to) : o = ne.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[i] = o);
  }
  return t ? ne.create(t, e.mainIndex) : e;
}
function Xa(n, e, t) {
  let i = Uo(n.state.facet(wr).map((s) => s(n)), t.from, e.head > t.from ? -1 : 1);
  return i == t.from ? t : ne.cursor(i, i < t.from ? 1 : -1);
}
class oi {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function qu(n, e, t, i) {
  let s = n.contentDOM.getBoundingClientRect(), o = s.top + n.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new oi(0, 1);
    if (a > n.viewState.docHeight)
      return new oi(n.state.doc.length, -1);
    if (u = n.elementAtHeight(a), i == null)
      break;
    if (u.type == Gt.Text) {
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
    if (u.type == Gt.Text) {
      let h = Kx(n, s, u, r, l);
      return new oi(h, h == u.from ? 1 : -1);
    }
  }
  if (u.type != Gt.Text)
    return a < (u.top + u.bottom) / 2 ? new oi(u.from, 1) : new oi(u.to, -1);
  let c = n.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = n.docView.lineAt(u.from, -2)), new qx(n, r, l, n.textDirectionAt(u.from)).scanTile(c, u.from);
}
class qx {
  constructor(e, t, i, s) {
    this.view = e, this.x = t, this.y = i, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: i, spans: s } = this.bidiSpansAt(e);
    return s[li.find(s, e - i.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: i, spans: s } = this.bidiSpansAt(e);
    return s[li.find(s, e - i.from, -1, t)].dir;
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
      let m = t(v), x = 0;
      if (m)
        for (let O = 0; O < m.length; O++) {
          let L = m[O];
          if (!(L.width == 0 && m.length > 1))
            if (L.bottom < this.y)
              (!a || a.bottom < L.bottom) && (a = L), x = 1;
            else if (L.top > this.y)
              (!u || u.top > L.top) && (u = L), x = -1;
            else {
              let E = L.left > this.x ? this.x - L.left : L.right < this.x ? this.x - L.right : 0, R = Math.abs(E);
              R < h && (c = v, h = R, f = L), E && (x = E < 0 == (this.baseDir == xt.LTR) ? -1 : 1);
            }
        }
      x == -1 && (!l || this.baseDirAt(e[v], 1)) ? o = v : x == 1 && (!l || this.baseDirAt(e[v + 1], -1)) && (s = v + 1);
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
    let d = (l ? this.dirAt(e[c], 1) : this.baseDir) == xt.LTR;
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
      return ar(e.dom, r, l).getClientRects();
    });
    return s.after ? new oi(i[s.i + 1], -1) : new oi(i[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new oi(t, 1);
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
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : ar(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = i[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new oi(i[s.i + 1], -1) : new oi(r, 1);
  }
}
const Hs = "￿";
class Yx {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(ot.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Hs;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(i, s);
      let o = this.text.length;
      this.readNode(s);
      let r = Mt.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && i != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = Mt.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : Tl(s)) || Tl(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !Jx(l, t) && this.lineBreak(), s = l;
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
    let t = Mt.get(e), i = t && t.overrideDOMText;
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
      (e.nodeType == 3 ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + (Xx(e, i.node, i.offset) ? t : 0));
  }
}
function Xx(n, e, t) {
  for (; ; ) {
    if (!e || t < Oi(e))
      return !1;
    if (e == n)
      return !0;
    t = ss(e) + 1, e = e.parentNode;
  }
}
function Jx(n, e) {
  let t;
  for (; !(n == e || !n); n = n.nextSibling) {
    let i = Mt.get(n);
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
class Df {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Zx {
  constructor(e, t, i, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = sm(e.docView.tile, t, i, 0))) {
      let a = o || r ? [] : ew(e), u = new Yx(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = tw(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Fu(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Fu(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), h = e.viewport;
      if ((ge.ios || ge.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (h.from > 0 || h.to < e.state.doc.length)) {
        let f = Math.min(u, c), d = Math.max(u, c), g = h.from - f, v = h.to - d;
        (g == 0 || g == 1 || f == 0) && (v == 0 || v == -1 || d == e.state.doc.length) && (u = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(ne.range(c, u));
      else if (e.lineWrapping && c == u && !(l.main.empty && l.main.head == u) && e.inputState.lastTouchTime > Date.now() - 100) {
        let f = e.coordsAtPos(u, -1), d = 0;
        f && (d = e.inputState.lastTouchY <= f.bottom ? -1 : 1), this.newSel = ne.create([ne.cursor(u, d)]);
      } else
        this.newSel = ne.single(c, u);
    }
  }
}
function sm(n, e, t, i) {
  if (n.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = i, c = i; a < n.children.length; a++) {
      let h = n.children[a], f = u + h.length;
      if (u < e && f > t)
        return sm(h, e, t, u);
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
function om(n, e) {
  let t, { newSel: i } = e, { state: s } = n, o = s.selection.main, r = n.inputState.lastKeyTime > Date.now() - 100 ? n.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || ge.android && e.text.length < a - l) && (u = o.to, c = "end");
    let h = s.doc.sliceString(l, a, Hs), f, d;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || h != e.text) && h.slice(0, o.from - l) == e.text.slice(0, o.from - l) && h.slice(o.to - l) == e.text.slice(f = e.text.length - (h.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: nt.of(e.text.slice(o.from - l, f).split(Hs))
    } : (d = rm(h, e.text, u - l, c)) && (ge.chrome && r == 13 && d.toB == d.from + 2 && e.text.slice(d.from, d.toB) == Hs + Hs && d.toB--, t = {
      from: l + d.from,
      to: l + d.toA,
      insert: nt.of(e.text.slice(d.from, d.toB).split(Hs))
    });
  } else i && (!n.hasFocus && s.facet(xi) || El(i, o)) && (i = null);
  if (!t && !i)
    return !1;
  if ((ge.mac || ge.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && n.contentDOM.getAttribute("autocorrect") == "off" ? (i && t.insert.length == 2 && (i = ne.single(i.main.anchor - 1, i.main.head - 1)), t = { from: t.from, to: t.to, insert: nt.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && n.docView.lineHasWidget(o.to) && n.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(n.inputState.insertingText)
  } : ge.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && n.lineWrapping && (i && (i = ne.single(i.main.anchor - 1, i.main.head - 1)), t = { from: o.from, to: o.to, insert: nt.of([" "]) }), t)
    return Wc(n, t, i, r);
  if (i && !El(i, o)) {
    let l = !1, a = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (l = !0), a = n.inputState.lastSelectionOrigin, a == "select.pointer" && (i = im(s.facet(wr).map((u) => u(n)), i))), n.dispatch({ selection: i, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function Wc(n, e, t, i = -1) {
  if (ge.ios && n.inputState.flushIOSKey(e))
    return !0;
  let s = n.state.selection.main;
  if (ge.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && n.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && Js(n.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || i == 8 && e.insert.length < e.to - e.from && e.to > s.head) && Js(n.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && Js(n.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  n.inputState.composing >= 0 && n.inputState.composing++;
  let r, l = () => r || (r = Qx(n, e, t));
  return n.state.facet(Ug).some((a) => a(n, e.from, e.to, o, l)) || n.dispatch(l()), !0;
}
function Qx(n, e, t) {
  let i, s = n.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = Uo(s.facet(wr).map((h) => h(n)), u, a);
    e.from == c && (r = c);
  }
  if (r > -1)
    i = {
      changes: e,
      selection: ne.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= o.from && e.to <= o.to && e.to - e.from >= (o.to - o.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && n.inputState.composing < 0) {
    let a = o.from < e.from ? s.sliceDoc(o.from, e.from) : "", u = o.to > e.to ? s.sliceDoc(e.to, o.to) : "";
    i = s.replaceSelection(n.state.toText(a + e.insert.sliceString(0, void 0, n.state.lineBreak) + u));
  } else {
    let a = s.changes(e), u = t && t.main.to <= a.newLength ? t.main : void 0;
    if (s.selection.ranges.length > 1 && (n.inputState.composing >= 0 || n.inputState.compositionPendingChange) && e.to <= o.to + 10 && e.to >= o.to - 10) {
      let c = n.state.sliceDoc(e.from, e.to), h, f = t && nm(n, t.main.head);
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
        let x = s.changes({ from: m, to: v, insert: e.insert }), O = g.to - o.to;
        return {
          changes: x,
          range: u ? ne.range(Math.max(0, u.anchor + O), Math.max(0, u.head + O)) : g.map(x)
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
function rm(n, e, t, i) {
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
function ew(n) {
  let e = [];
  if (n.root.activeElement != n.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: o } = n.observer.selectionRange;
  return t && (e.push(new Df(t, i)), (s != t || o != i) && e.push(new Df(s, o))), e;
}
function tw(n, e) {
  if (n.length == 0)
    return null;
  let t = n[0].pos, i = n.length == 2 ? n[1].pos : t;
  return t < 0 || i < 0 ? null : t == i ? ne.create([ne.cursor(i + e, -1)]) : ne.single(t + e, i + e);
}
function El(n, e) {
  return e.head == n.main.head && e.anchor == n.main.anchor;
}
class nw {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, ge.safari && e.contentDOM.addEventListener("input", () => null), ge.gecko && yw(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !hw(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
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
    let t = sw(e), i = this.handlers, s = this.view.contentDOM;
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
    if (this.tabFocusMode > 0 && e.keyCode != 27 && am.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), ge.android && ge.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (ge.ios && !e.synthetic && !e.altKey && !e.metaKey && (lm.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || ow.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && ge.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && iw(this.view.win) && (t.shiftKey = !1);
      let i = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == i && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, Js(this.view.contentDOM, t.key, t.keyCode, t.mods));
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
function iw(n) {
  return n.visualViewport ? n.visualViewport.height * n.visualViewport.scale / n.document.documentElement.clientHeight < 0.85 : !1;
}
function Of(n, e) {
  return (t, i) => {
    try {
      return e.call(n, i, t);
    } catch (s) {
      _n(t.state, s);
    }
  };
}
function sw(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    return e[i] || (e[i] = { observers: [], handlers: [] });
  }
  for (let i of n) {
    let s = i.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Of(i.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push(Of(i.value, a));
      }
  }
  for (let i in zn)
    t(i).handlers.push(zn[i]);
  for (let i in rn)
    t(i).observers.push(rn[i]);
  return e;
}
const lm = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], ow = "dthko", am = [16, 17, 18, 20, 91, 92, 224, 225], Rr = 6;
function Pr(n) {
  return Math.max(0, n) * 0.7 + 8;
}
function rw(n, e) {
  return Math.max(Math.abs(n.clientX - e.clientX), Math.abs(n.clientY - e.clientY));
}
class lw {
  constructor(e, t, i, s) {
    this.view = e, this.startEvent = t, this.style = i, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Dg(e.contentDOM), this.atoms = e.state.facet(wr).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(ot.allowMultipleSelections) && aw(e, t), this.dragging = cw(e, t) && hm(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && rw(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, i = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = zc(this.view);
    e.clientX - a.left <= s + Rr ? t = -Pr(s - e.clientX) : e.clientX + a.right >= r - Rr && (t = Pr(e.clientX - r)), e.clientY - a.top <= o + Rr ? i = -Pr(o - e.clientY) : e.clientY + a.bottom >= l - Rr && (i = Pr(e.clientY - l)), this.setScrollSpeed(t, i);
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
    let { view: t } = this, i = im(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !i.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function aw(n, e) {
  let t = n.state.facet(Fg);
  return t.length ? t[0](e) : ge.mac ? e.metaKey : e.ctrlKey;
}
function uw(n, e) {
  let t = n.state.facet(zg);
  return t.length ? t[0](e) : ge.mac ? !e.altKey : !e.ctrlKey;
}
function cw(n, e) {
  let { main: t } = n.state.selection;
  if (t.empty)
    return !1;
  let i = lr(n.root);
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
function hw(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != n.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = Mt.get(t)) && i.isWidget() && !i.isHidden && i.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const zn = /* @__PURE__ */ Object.create(null), rn = /* @__PURE__ */ Object.create(null), um = ge.ie && ge.ie_version < 15 || ge.ios && ge.webkit_version < 604;
function fw(n) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    n.focus(), t.remove(), cm(n, t.value);
  }, 50);
}
function ha(n, e, t) {
  for (let i of n.facet(e))
    t = i(t, n);
  return t;
}
function cm(n, e) {
  e = ha(n.state, Nc, e);
  let { state: t } = n, i, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (Yu != null && t.selection.ranges.every((a) => a.empty) && Yu == o.toString()) {
    let a = -1;
    i = t.changeByRange((u) => {
      let c = t.doc.lineAt(u.from);
      if (c.from == a)
        return { range: u };
      a = c.from;
      let h = t.toText((r ? o.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: h },
        range: ne.cursor(u.from + h.length, -1)
      };
    });
  } else r ? i = t.changeByRange((a) => {
    let u = o.line(s++);
    return {
      changes: { from: a.from, to: a.to, insert: u.text },
      range: ne.cursor(a.from + u.length, -1)
    };
  }) : i = t.replaceSelection(o);
  n.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
rn.scroll = (n) => {
  let e = n.inputState;
  e.lastScrollTop = n.scrollDOM.scrollTop, e.lastScrollLeft = n.scrollDOM.scrollLeft, ge.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
rn.wheel = rn.mousewheel = (n) => {
  n.inputState.lastWheelEvent = Date.now();
};
zn.keydown = (n, e) => (n.inputState.setSelectionOrigin("select"), e.keyCode == 27 && n.inputState.tabFocusMode != 0 && (n.inputState.tabFocusMode = Date.now() + 2e3), !1);
rn.touchstart = (n, e) => {
  let t = n.inputState, i = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), i && (t.lastTouchX = i.clientX, t.lastTouchY = i.clientY), t.setSelectionOrigin("select.pointer");
};
rn.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
rn.touchend = (n, e) => {
  n.inputState.touchActive = !1;
};
zn.mousedown = (n, e) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let i of n.state.facet(Wg))
    if (t = i(n, e), t)
      break;
  if (!t && e.button == 0 && (t = pw(n, e)), t) {
    let i = !n.hasFocus;
    n.inputState.startMouseSelection(new lw(n, e, t, i)), i && n.observer.ignore(() => {
      Eg(n.contentDOM);
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
function Lf(n, e, t, i) {
  if (i == 1)
    return ne.cursor(e, t);
  if (i == 2)
    return Wx(n.state, e, t);
  {
    let s = n.docView.lineAt(e, t), o = n.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < n.state.doc.length && l == o.to && l++, ne.undirectionalRange(r, l);
  }
}
const dw = ge.ie && ge.ie_version <= 11;
let Ef = null, Bf = 0, If = 0;
function hm(n) {
  if (!dw)
    return n.detail;
  let e = Ef, t = If;
  return Ef = n, If = Date.now(), Bf = !e || t > Date.now() - 400 && Math.abs(e.clientX - n.clientX) < 2 && Math.abs(e.clientY - n.clientY) < 2 ? (Bf + 1) % 3 : 1;
}
function pw(n, e) {
  let t = n.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), i = hm(e), s = n.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = n.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = Lf(n, a.pos, a.assoc, i);
      if (t.pos != a.pos && !r) {
        let h = Lf(n, t.pos, t.assoc, i), f = Math.min(h.from, c.from), d = Math.max(h.to, c.to);
        c = f < c.from ? ne.range(f, d, c.assoc) : ne.range(d, f, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && i == 1 && s.ranges.length > 1 && (u = gw(s, a.pos)) ? u : l ? s.addRange(c) : ne.create([c]);
    }
  };
}
function gw(n, e) {
  for (let t = 0; t < n.ranges.length; t++) {
    let { from: i, to: s } = n.ranges[t];
    if (i <= e && s >= e)
      return ne.create(n.ranges.slice(0, t).concat(n.ranges.slice(t + 1)), n.mainIndex == t ? 0 : n.mainIndex - (n.mainIndex > t ? 1 : 0));
  }
  return null;
}
zn.dragstart = (n, e) => {
  let { selection: { main: t } } = n.state;
  if (e.target.draggable) {
    let s = n.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = ne.undirectionalRange(o, r));
    }
  }
  let { inputState: i } = n;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", ha(n.state, Vc, n.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
zn.dragend = (n) => (n.inputState.draggedContent = null, !1);
function Rf(n, e, t, i) {
  if (t = ha(n.state, Nc, t), !t)
    return;
  let s = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = n.inputState, r = i && o && uw(n, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = n.state.changes(r ? [r, l] : l);
  n.focus(), n.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), n.inputState.draggedContent = null;
}
zn.drop = (n, e) => {
  if (!e.dataTransfer)
    return !1;
  if (n.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let i = Array(t.length), s = 0, o = () => {
      ++s == t.length && Rf(n, e, i.filter((r) => r != null).join(n.state.lineBreak), !1);
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
      return Rf(n, e, i, !0), !0;
  }
  return !1;
};
zn.paste = (n, e) => {
  if (n.state.readOnly)
    return !0;
  n.observer.flush();
  let t = um ? null : e.clipboardData;
  return t ? (cm(n, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (fw(n), !1);
};
function mw(n, e) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function vw(n) {
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
  return { text: ha(n, Vc, e.join(n.lineBreak)), ranges: t, linewise: i };
}
let Yu = null;
zn.copy = zn.cut = (n, e) => {
  if (!Wo(n.contentDOM, n.observer.selectionRange))
    return !1;
  let { text: t, ranges: i, linewise: s } = vw(n.state);
  if (!t && !s)
    return !1;
  Yu = s ? t : null, e.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = um ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (mw(n, t), !1);
};
const fm = /* @__PURE__ */ go.define();
function dm(n, e) {
  let t = [];
  for (let i of n.facet(jg)) {
    let s = i(n, e);
    s && t.push(s);
  }
  return t.length ? n.update({ effects: t, annotations: fm.of(!0) }) : null;
}
function pm(n) {
  setTimeout(() => {
    let e = n.hasFocus;
    if (e != n.inputState.notifiedFocused) {
      let t = dm(n.state, e);
      t ? n.dispatch(t) : n.update([]);
    }
  }, 10);
}
rn.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), pm(n);
};
rn.blur = (n) => {
  n.observer.clearSelectionRange(), pm(n);
};
rn.compositionstart = rn.compositionupdate = (n) => {
  if (!n.observer.editContext && (n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0)) {
    let { main: e } = n.state.selection;
    !e.empty && n.lineBlockAt(e.from).from != n.lineBlockAt(e.to).from && n.dispatch({
      changes: n.state.selection.ranges.filter((t) => !t.empty).map((t) => ({ from: t.from, to: t.to })),
      userEvent: "input"
    }), n.inputState.composing = 0;
  }
};
rn.compositionend = (n) => {
  n.observer.editContext || (n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionPendingKey = !0, n.inputState.compositionPendingChange = n.observer.pendingRecords().length > 0, n.inputState.compositionFirstChange = null, ge.chrome && ge.android ? n.observer.flushSoon() : n.inputState.compositionPendingChange ? Promise.resolve().then(() => n.observer.flush()) : setTimeout(() => {
    n.inputState.composing < 0 && n.docView.hasComposition && n.update([]);
  }, 50));
};
rn.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
zn.beforeinput = (n, e) => {
  var t, i;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (n.inputState.insertingText = e.data, n.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && n.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = n.posAtDOM(l.startContainer, l.startOffset), u = n.posAtDOM(l.endContainer, l.endOffset);
      return Wc(n, { from: a, to: u, insert: n.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (ge.chrome && ge.android && (s = lm.find((o) => o.inputType == e.inputType)) && (n.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
  return ge.ios && e.inputType == "deleteContentForward" && n.observer.flushSoon(), ge.safari && e.inputType == "insertText" && n.inputState.composing >= 0 && setTimeout(() => rn.compositionend(n, e), 20), !1;
};
const Pf = /* @__PURE__ */ new Set();
function yw(n) {
  Pf.has(n) || (Pf.add(n), n.addEventListener("copy", () => {
  }), n.addEventListener("cut", () => {
  }));
}
const _f = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let ro = !1;
function Nf() {
  ro = !1;
}
class bw {
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
    return _f.indexOf(e) > -1 != this.lineWrapping;
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
    let l = _f.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
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
class xw {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class Rn {
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
    return typeof this._content == "number" ? Gt.Text : Array.isArray(this._content) ? this._content : this._content.type;
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
    return this._content instanceof Ds ? this._content.widget : null;
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
    return new Rn(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var yt = /* @__PURE__ */ (function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
})(yt || (yt = {}));
const cl = 1e-3;
class on {
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
    this.height != e && (Math.abs(this.height - e) > cl && (ro = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, i) {
    return on.of(i);
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
      let { fromA: a, toA: u, fromB: c, toB: h } = s[l], f = o.lineAt(a, yt.ByPosNoHeight, i.setDoc(t), 0, 0), d = f.to >= u ? f : o.lineAt(u, yt.ByPosNoHeight, i, 0, 0);
      for (h += d.to - u, u = d.to; l > 0 && f.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < f.from && (f = o.lineAt(a, yt.ByPosNoHeight, i, 0, 0));
      c += f.from - a, a = f.from;
      let g = Kc.build(i.setDoc(r), e, c, h);
      o = Bl(o, o.replace(a, u, g));
    }
    return o.updateHeight(i, 0);
  }
  static empty() {
    return new gn(0, 0, 0);
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
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, i++), new kw(on.of(e.slice(0, t)), r, on.of(e.slice(i)));
  }
}
function Bl(n, e) {
  return n == e ? n : (n.constructor != e.constructor && (ro = !0), e);
}
on.prototype.size = 1;
const ww = /* @__PURE__ */ wt.replace({});
class gm extends on {
  constructor(e, t, i) {
    super(e, t), this.deco = i, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new Rn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, i, s) {
    return this.spaceAbove && e < i + this.spaceAbove ? new Rn(s, 0, i, this.spaceAbove, ww) : this.mainBlock(i, s);
  }
  lineAt(e, t, i, s, o) {
    let r = this.mainBlock(s, o);
    return this.spaceAbove ? this.blockAt(0, i, s, o).join(r) : r;
  }
  forEachLine(e, t, i, s, o, r) {
    e <= o + this.length && t >= o && r(this.lineAt(0, yt.ByPos, i, s, o));
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
class gn extends gm {
  constructor(e, t, i) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = i;
  }
  mainBlock(e, t) {
    return new Rn(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, i) {
    let s = i[0];
    return i.length == 1 && (s instanceof gn || s instanceof Kt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof Kt ? s = new gn(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : on.of(i);
  }
  updateHeight(e, t = 0, i = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (i || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class Kt extends on {
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
      return new Rn(c.from, c.length, f, h, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - i) / l))), { from: c, length: h } = t.doc.line(o + u);
      return new Rn(c, h, i + l * u, l, 0);
    }
  }
  lineAt(e, t, i, s, o) {
    if (t == yt.ByHeight)
      return this.blockAt(e, i, s, o);
    if (t == yt.ByPosNoHeight) {
      let { from: d, to: g } = i.doc.lineAt(e);
      return new Rn(d, g - d, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(i, o), u = i.doc.lineAt(e), c = l + u.length * a, h = u.number - r, f = s + l * h + a * (u.from - o - h);
    return new Rn(u.from, u.length, Math.max(s, Math.min(f, s + this.height - c)), c, 0);
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
      r(new Rn(f.from, f.length, h, d, 0)), h += d, c = f.to + 1;
    }
  }
  replace(e, t, i) {
    let s = this.length - t;
    if (s > 0) {
      let o = i[i.length - 1];
      o instanceof Kt ? i[i.length - 1] = new Kt(o.length + s) : i.push(null, new Kt(s - 1));
    }
    if (e > 0) {
      let o = i[0];
      o instanceof Kt ? i[0] = new Kt(e + o.length) : i.unshift(new Kt(e - 1), null);
    }
    return on.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new Kt(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new Kt(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, s) {
    let o = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let r = [], l = Math.max(t, s.from), a = -1;
      for (s.from > t && r.push(new Kt(s.from - t - 1).updateHeight(e, t)); l <= o && s.more; ) {
        let c = e.doc.lineAt(l).length;
        r.length && r.push(null);
        let h = s.heights[s.index++], f = 0;
        h < 0 && (f = -h, h = s.heights[s.index++]), a == -1 ? a = h : Math.abs(h - a) >= cl && (a = -2);
        let d = new gn(c, h, f);
        d.outdated = !1, r.push(d), l += c + 1;
      }
      l <= o && r.push(null, new Kt(o - l).updateHeight(e, l));
      let u = on.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= cl || Math.abs(a - this.heightMetrics(e, t).perLine) >= cl) && (ro = !0), Bl(this, u);
    } else (i || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class kw extends on {
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
    let r = s + this.left.height, l = o + this.left.length + this.break, a = t == yt.ByHeight ? e < r : e < l, u = a ? this.left.lineAt(e, t, i, s, o) : this.right.lineAt(e, t, i, r, l);
    if (this.break || (a ? u.to < l : u.from > l))
      return u;
    let c = t == yt.ByPosNoHeight ? yt.ByPosNoHeight : yt.ByPos;
    return a ? u.join(this.right.lineAt(l, c, i, r, l)) : this.left.lineAt(l, c, i, s, o).join(u);
  }
  forEachLine(e, t, i, s, o, r) {
    let l = s + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, i, s, o, r), t >= a && this.right.forEachLine(e, t, i, l, a, r);
    else {
      let u = this.lineAt(a, yt.ByPos, i, s, o);
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
    if (e > 0 && Vf(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), Vf(o, l);
    }
    return on.of(o);
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
    return e.size > 2 * t.size || t.size > 2 * e.size ? on.of(this.break ? [e, null, t] : [e, t]) : (this.left = Bl(this.left, e), this.right = Bl(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, i, s) : o.updateHeight(e, t, i), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, i, s) : r.updateHeight(e, l, i), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function Vf(n, e) {
  let t, i;
  n[e] == null && (t = n[e - 1]) instanceof Kt && (i = n[e + 1]) instanceof Kt && n.splice(e - 1, 3, new Kt(t.length + 1 + i.length));
}
const Sw = 5;
class Kc {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof gn ? s.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new gn(i - this.pos, -1, 0)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let s = i.widget ? i.widget.estimatedHeight : 0, o = i.widget ? i.widget.lineBreaks : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      i.block ? this.addBlock(new gm(r, s, i)) : (r || o || s >= Sw) && this.addLineDeco(s, o, r);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new gn(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new Kt(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof gn)
      return e;
    let t = new gn(0, -1, 0);
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
    this.lineStart > -1 && !(t instanceof gn) && !this.isCovered ? this.nodes.push(new gn(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let s of this.nodes)
      s instanceof gn && s.updateHeight(this.oracle, i), i += s ? s.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, i, s) {
    let o = new Kc(i, e);
    return Je.spans(t, i, s, o, 0), o.finish(i);
  }
}
function Cw(n, e, t) {
  let i = new Mw();
  return Je.compare(n, e, t, i, 0), i.changes;
}
class Mw {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, s) {
    (e < t || i && i.heightRelevant || s && s.heightRelevant) && Xs(e, t, this.changes, 5);
  }
}
function Aw(n, e) {
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
function Tw(n) {
  let e = n.getBoundingClientRect(), t = n.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function $w(n, e) {
  let t = n.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Ja {
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
    return wt.replace({
      widget: new Dw(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Dw extends yr {
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
class Hf {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = Ff, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = xt.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let i = t.facet(Hc).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new bw(i), this.stateDeco = zf(t), this.heightMap = on.empty().applyChanges(this.stateDeco, nt.empty, this.heightOracle.setDoc(t.doc), [new Cn(0, 0, 0, t.doc.length)]);
    for (let s = 0; s < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); s++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = wt.set(this.lineGaps.map((s) => s.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let s = i ? t.head : t.anchor;
      if (!e.some(({ from: o, to: r }) => s >= o && s <= r)) {
        let { from: o, to: r } = this.lineBlockAt(s);
        e.push(new _r(o, r));
      }
    }
    return this.viewports = e.sort((i, s) => i.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? Ff : new Uc(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Eo(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = zf(this.state);
    let s = e.changedRanges, o = Cn.extendWithRanges(s, Cw(i, this.stateDeco, e ? e.changes : Ft.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Nf(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || ro) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(qg) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, i = window.getComputedStyle(t), s = this.heightOracle, o = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? xt.RTL : xt.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: R, scaleY: z } = $g(t, l);
      (R > 5e-3 && Math.abs(this.scaleX - R) > 5e-3 || z > 5e-3 && Math.abs(this.scaleY - z) > 5e-3) && (this.scaleX = R, this.scaleY = z, u |= 16, r = a = !0);
    }
    let h = (parseInt(i.paddingTop) || 0) * this.scaleY, f = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != h || this.paddingBottom != f) && (this.paddingTop = h, this.paddingBottom = f, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let d = Dg(this.view.contentDOM, !1).y;
    d != this.scrollParent && (this.scrollParent = d, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let g = this.getScrollOffset();
    this.scrollOffset != g && (this.scrollAnchorHeight = -1, this.scrollOffset = g), this.scrolledToBottom = Bg(this.scrollParent || e.win);
    let v = (this.printing ? $w : Aw)(t, this.paddingTop), m = v.top - this.pixelViewport.top, x = v.bottom - this.pixelViewport.bottom;
    this.pixelViewport = v;
    let O = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (O != this.inView && (this.inView = O, O && (a = !0)), !this.inView && !this.scrollTarget && !Tw(e.dom))
      return 0;
    let L = l.width;
    if ((this.contentDOMWidth != L || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let R = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(R) && (r = !0), r || s.lineWrapping && Math.abs(L - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: z, charWidth: P, textHeight: q } = e.docView.measureTextSize();
        r = z > 0 && s.refresh(o, z, P, q, Math.max(5, L / P), R), r && (e.docView.minWidth = 0, u |= 16);
      }
      m > 0 && x > 0 ? c = Math.max(m, x) : m < 0 && x < 0 && (c = Math.min(m, x)), Nf();
      for (let z of this.viewports) {
        let P = z.from == this.viewport.from ? R : e.docView.measureVisibleLineHeights(z);
        this.heightMap = (r ? on.empty().applyChanges(this.stateDeco, nt.empty, this.heightOracle, [new Cn(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new xw(z.from, P));
      }
      ro && (u |= 2);
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
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new _r(s.lineAt(r - i * 1e3, yt.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - i) * 1e3, yt.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), h = s.lineAt(u, yt.ByPos, o, 0, 0), f;
        t.y == "center" ? f = (h.top + h.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? f = h.top : f = h.bottom - c, a = new _r(s.lineAt(f - 1e3 / 2, yt.ByHeight, o, 0, 0).from, s.lineAt(f + c + 1e3 / 2, yt.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new _r(this.heightMap.lineAt(i, yt.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, yt.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, yt.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, yt.ByPos, this.heightOracle, 0, 0), { visibleTop: r, visibleBottom: l } = this;
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
      t.touchesRange(s.from, s.to) || i.push(new Ja(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
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
    if (this.defaultTextDirection != xt.LTR && !i)
      return [];
    let l = [], a = (c, h, f, d) => {
      if (h - c < o)
        return;
      let g = this.state.selection.main, v = [g.from];
      g.empty || v.push(g.to);
      for (let x of v)
        if (x > c && x < h) {
          a(c, x - 10, f, d), a(x + 10, h, f, d);
          return;
        }
      let m = Lw(e, (x) => x.from >= f.from && x.to <= f.to && Math.abs(x.from - c) < o && Math.abs(x.to - h) < o && !v.some((O) => x.from < O && x.to > O));
      if (!m) {
        if (h < f.to && t && i && t.visibleRanges.some((L) => L.from <= h && L.to >= h)) {
          let L = t.moveToLineBoundary(ne.cursor(h), !1, !0).head;
          L > c && (h = L);
        }
        let x = this.gapSize(f, c, h, d), O = i || x < 2e6 ? x : 2e6;
        m = new Ja(c, h, x, O);
      }
      l.push(m);
    }, u = (c) => {
      if (c.length < r || c.type != Gt.Text)
        return;
      let h = Ow(c.from, c.to, this.stateDeco);
      if (h.total < r)
        return;
      let f = this.scrollTarget ? this.scrollTarget.range.head : null, d, g;
      if (i) {
        let v = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, m, x;
        if (f != null) {
          let O = Vr(h, f), L = ((this.visibleBottom - this.visibleTop) / 2 + v) / c.height;
          m = O - L, x = O + L;
        } else
          m = (this.visibleTop - c.top - v) / c.height, x = (this.visibleBottom - c.top + v) / c.height;
        d = Nr(h, m), g = Nr(h, x);
      } else {
        let v = h.total * this.heightOracle.charWidth, m = s * this.heightOracle.charWidth, x = 0;
        if (v > 2e6)
          for (let z of e)
            z.from >= c.from && z.from < c.to && z.size != z.displaySize && z.from * this.heightOracle.charWidth + x < this.pixelViewport.left && (x = z.size - z.displaySize);
        let O = this.pixelViewport.left + x, L = this.pixelViewport.right + x, E, R;
        if (f != null) {
          let z = Vr(h, f), P = ((L - O) / 2 + m) / v;
          E = z - P, R = z + P;
        } else
          E = (O - m) / v, R = (L + m) / v;
        d = Nr(h, E), g = Nr(h, R);
      }
      d > c.from && a(c.from, d, c, h), g < c.to && a(g, c.to, c, h);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, i, s) {
    let o = Vr(s, i) - Vr(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    Ja.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = wt.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let i = [];
    Je.spans(t, this.viewport.from, this.viewport.to, {
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
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Eo(this.heightMap.lineAt(e, yt.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Eo(this.heightMap.lineAt(this.scaler.fromDOM(e), yt.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Eo(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class _r {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Ow(n, e, t) {
  let i = [], s = n, o = 0;
  return Je.spans(t, n, e, {
    span() {
    },
    point(r, l) {
      r > s && (i.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (i.push({ from: s, to: e }), o += e - s), { total: o, ranges: i };
}
function Nr({ total: n, ranges: e }, t) {
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
function Vr(n, e) {
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
function Lw(n, e) {
  for (let t of n)
    if (e(t))
      return t;
}
const Ff = {
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
function zf(n) {
  let e = n.facet(aa).filter((i) => typeof i != "function"), t = n.facet(Fc).filter((i) => typeof i != "function");
  return t.length && e.push(Je.join(t)), e;
}
class Uc {
  constructor(e, t, i) {
    let s = 0, o = 0, r = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let u = t.lineAt(l, yt.ByPos, e, 0, 0).top, c = t.lineAt(a, yt.ByPos, e, 0, 0).bottom;
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
    return e instanceof Uc ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to) : !1;
  }
}
function Eo(n, e) {
  if (e.scale == 1)
    return n;
  let t = e.toDOM(n.top), i = e.toDOM(n.bottom);
  return new Rn(n.from, n.length, t, i - t, Array.isArray(n._content) ? n._content.map((s) => Eo(s, e)) : n._content);
}
const Hr = /* @__PURE__ */ we.define({ combine: (n) => n.join(" ") }), Xu = /* @__PURE__ */ we.define({ combine: (n) => n.indexOf(!0) > -1 }), Ju = /* @__PURE__ */ ns.newName(), mm = /* @__PURE__ */ ns.newName(), vm = /* @__PURE__ */ ns.newName(), ym = { "&light": "." + mm, "&dark": "." + vm };
function Zu(n, e, t) {
  return new ns(e, {
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
const Ew = /* @__PURE__ */ Zu("." + Ju, {
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
}, ym), Bw = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, Za = ge.ie && ge.ie_version <= 11;
class Iw {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new ux(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let i of t)
        this.queue.push(i);
      (ge.ie && ge.ie_version <= 11 || ge.ios && e.composing) && t.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && ge.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(ge.chrome && ge.chrome_version < 126) && (this.editContext = new Pw(e), e.state.facet(xi) && (e.contentDOM.editContext = this.editContext.editContext)), Za && (this.onCharData = (t) => {
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
    if (i.state.facet(xi) ? i.root.activeElement != this.dom : !Wo(this.dom, s))
      return;
    let o = s.anchorNode && i.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (ge.ie && ge.ie_version <= 11 || ge.android && ge.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && Ko(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = lr(e.root);
    if (!t)
      return !1;
    let i = ge.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Rw(this.view, t) || t;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let s = Wo(this.dom, i);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && hx(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), s && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, Bw), Za && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), Za && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && Js(this.dom, o.key, o.keyCode));
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
    let { from: e, to: t, typeOver: i } = this.processRecords(), s = this.selectionChanged && Wo(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new Zx(this.view, e, t, i);
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
    let i = this.view.state, s = om(this.view, t);
    return this.view.state == i && (t.domChanged || t.newSel && !El(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let i = Wf(t, e.previousSibling || e.target.previousSibling, -1), s = Wf(t, e.nextSibling || e.target.nextSibling, 1);
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
    this.editContext && (this.editContext.update(e), e.startState.facet(xi) != e.state.facet(xi) && (e.view.contentDOM.editContext = e.state.facet(xi) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function Wf(n, e, t) {
  for (; e; ) {
    let i = Mt.get(e);
    if (i && i.parent == n)
      return i;
    let s = e.parentNode;
    e = s != n.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Kf(n, e) {
  let t = e.startContainer, i = e.startOffset, s = e.endContainer, o = e.endOffset, r = n.docView.domAtPos(n.state.selection.main.anchor, 1);
  return Ko(r.node, r.offset, s, o) && ([t, i, s, o] = [s, o, t, i]), { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: o };
}
function Rw(n, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(n.root)[0];
    if (s)
      return Kf(n, s);
  }
  let t = null;
  function i(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return n.contentDOM.addEventListener("beforeinput", i, !0), n.dom.ownerDocument.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", i, !0), t ? Kf(n, t) : null;
}
class Pw {
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
      let c = rm(e.state.sliceDoc(l, a), i.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let f = ne.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd));
        El(f, s) || e.dispatch({ selection: f, userEvent: "select" });
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
        Wc(e, h, ne.single(this.toEditorPos(i.selectionStart, f), this.toEditorPos(i.selectionEnd, f)));
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
            s.push(wt.mark({ attributes: { style: c } }).range(a, u));
          }
        }
      }
      e.dispatch({ effects: Xg.of(wt.set(s)) });
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
      let s = lr(i.root);
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
class $e {
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
    this.dispatchTransactions = e.dispatchTransactions || i && ((s) => s.forEach((o) => i(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || cx(e.parent) || document, this.viewState = new Hf(this, e.state || ot.create(e)), e.scrollTo && e.scrollTo.is(Ir) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(Fs).map((s) => new ja(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Iw(this), this.inputState = new nw(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Tf(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
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
    e.some((f) => f.annotation(fm)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = dm(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(ot.phrases) != this.state.facet(ot.phrases))
      return this.setState(o);
    s = Dl.create(this, o, e), s.flags |= l;
    let h = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let f of e) {
        if (h && (h = h.map(f.changes)), f.scrollIntoView) {
          let { main: d } = f.state.selection, { x: g, y: v } = this.state.facet($e.cursorScrollMargin);
          h = new Zs(d.empty ? d : ne.cursor(d.head, d.head > d.anchor ? -1 : 1), "nearest", "nearest", v, g);
        }
        for (let d of f.effects)
          d.is(Ir) && (h = d.value.clip(this.state));
      }
      this.viewState.update(s, h), this.bidiCache = Il.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(Lo) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((f) => f.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(Hr) != s.state.facet(Hr) && (this.viewState.mustMeasureContent = !0), (t || i || h || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let f of this.state.facet(Uu))
        try {
          f(s);
        } catch (d) {
          _n(this.state, d, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !om(this, c) && u.force && Js(this.contentDOM, u.key, u.keyCode);
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
      this.viewState = new Hf(this, e), this.plugins = e.facet(Fs).map((i) => new ja(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new Tf(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(Fs), i = e.state.facet(Fs);
    if (t != i) {
      let s = [];
      for (let o of i) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new ja(o));
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
          _n(this.state, i, "doc view update listener");
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
          if (Bg(i || this.win))
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
            return _n(this.state, v), Uf;
          }
        }), f = Dl.create(this, this.state, []), d = !1;
        f.flags |= u, t ? t.flags |= u : t = f, this.updateState = 2, f.empty || (this.updatePlugins(f), this.inputState.update(f), this.updateAttrs(), d = this.docView.update(f), d && this.docViewUpdate());
        for (let g = 0; g < c.length; g++)
          if (h[g] != Uf)
            try {
              let v = c[g];
              v.write && v.write(h[g], this);
            } catch (v) {
              _n(this.state, v);
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
      for (let a of this.state.facet(Uu))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return Ju + " " + (this.state.facet(Xu) ? vm : mm) + " " + this.state.facet(Hr);
  }
  updateAttrs() {
    let e = jf(this, Jg, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(xi) ? "true" : "false",
      class: "cm-content",
      style: `${ge.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), jf(this, Hc, t);
    let i = this.observer.ignore(() => {
      let s = wf(this.contentDOM, this.contentAttrs, t), o = wf(this.dom, this.editorAttrs, e);
      return s || o;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let s of i.effects)
        if (s.is($e.announce)) {
          t && (this.announceDOM.textContent = "", this.win.clearTimeout(this.clearAnnouncement), this.clearAnnouncement = this.win.setTimeout(() => {
            this.announceDOM.textContent = " ";
          }, 200), t = !1);
          let o = this.announceDOM.appendChild(document.createElement("div"));
          o.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(Lo);
    let e = this.state.facet($e.cspNonce);
    ns.mount(this.root, this.styleModules.concat(Ew).reverse(), e ? { nonce: e } : void 0);
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
    return Xa(this, e, $f(this, e, t, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return Xa(this, e, $f(this, e, t, (i) => jx(this, e.head, i)));
  }
  /**
  **\[DEPRECATED]** Get the cursor position visually at the start
  or end of a line.
  */
  visualLineSide(e, t) {
    return t ? ne.cursor(e.to, 1) : ne.cursor(e.from, -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, i = !0) {
    return Ux(this, e, t, i);
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
    return Xa(this, e, Gx(this, e, t, i));
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
    let i = qu(this, e, t);
    return i && i.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), qu(this, e, t);
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
    let i = this.state.doc.lineAt(e), s = this.bidiSpans(i), o = s[li.find(s, e - i.from, -1, t)];
    return i.length && (e == i.from && t < 0 || e == i.to && t > 0) && o.dir != this.textDirectionAt(i.from) && (e == i.to ? (e = i.from + o.from, t = 1) : (e = i.from + o.to, t = -1)), this.docView.coordsAt(e, t, o.dir == xt.RTL);
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
    return !this.state.facet(Gg) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > _w)
      return Vg(e.length);
    let t = this.textDirectionAt(e.from), i;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || Ng(o.isolates, i = Cf(this, e))))
        return o.order;
    i || (i = Cf(this, e));
    let s = yx(e.text, t, i);
    return this.bidiCache.push(new Il(e.from, e.to, t, i, !0, s)), s;
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
      Eg(this.contentDOM), this.docView.updateSelection();
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
    return Ir.of(new Zs(typeof e == "number" ? ne.cursor(e) : e, (i = t.y) !== null && i !== void 0 ? i : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    return Ir.of(new Zs(ne.cursor(i.from), "start", "start", i.top - e, t, !0));
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
    return vn.define(() => ({}), { eventHandlers: e });
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
    return vn.define(() => ({}), { eventObservers: e });
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
    let i = ns.newName(), s = [Hr.of(i), Lo.of(Zu(`.${i}`, e))];
    return t && t.dark && s.push(Xu.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return ia.lowest(Lo.of(Zu("." + Ju, e, ym)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), s = i && Mt.get(i) || Mt.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
$e.styleModule = Lo;
$e.inputHandler = Ug;
$e.clipboardInputFilter = Nc;
$e.clipboardOutputFilter = Vc;
$e.scrollHandler = Yg;
$e.focusChangeEffect = jg;
$e.perLineTextDirection = Gg;
$e.exceptionSink = Kg;
$e.updateListener = Uu;
$e.editable = xi;
$e.mouseSelectionStyle = Wg;
$e.dragMovesSelection = zg;
$e.clickAddsSelectionRange = Fg;
$e.decorations = aa;
$e.blockWrappers = Zg;
$e.outerDecorations = Fc;
$e.atomicRanges = wr;
$e.bidiIsolatedRanges = Qg;
$e.cursorScrollMargin = /* @__PURE__ */ we.define({
  combine: (n) => {
    let e = 5, t = 5;
    for (let i of n)
      typeof i == "number" ? e = t = i : { x: e, y: t } = i;
    return { x: e, y: t };
  }
});
$e.scrollMargins = em;
$e.darkTheme = Xu;
$e.cspNonce = /* @__PURE__ */ we.define({ combine: (n) => n.length ? n[0] : "" });
$e.contentAttributes = Hc;
$e.editorAttributes = Jg;
$e.lineWrapping = /* @__PURE__ */ $e.contentAttributes.of({ class: "cm-lineWrapping" });
$e.announce = /* @__PURE__ */ bt.define();
const _w = 4096, Uf = {};
class Il {
  constructor(e, t, i, s, o, r) {
    this.from = e, this.to = t, this.dir = i, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let i = [], s = e.length ? e[e.length - 1].dir : xt.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && i.push(new Il(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return i;
  }
}
function jf(n, e, t) {
  for (let i = n.state.facet(e), s = i.length - 1; s >= 0; s--) {
    let o = i[s], r = typeof o == "function" ? o(n) : o;
    r && Rc(r, t);
  }
  return t;
}
const Nw = ge.mac ? "mac" : ge.windows ? "win" : ge.linux ? "linux" : "key";
function Vw(n, e) {
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
function Fr(n, e, t) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t !== !1 && e.shiftKey && (n = "Shift-" + n), n;
}
const Hw = /* @__PURE__ */ ia.default(/* @__PURE__ */ $e.domEventHandlers({
  keydown(n, e) {
    return Kw(Fw(e.state), n, e, "editor");
  }
})), bm = /* @__PURE__ */ we.define({ enables: Hw }), Gf = /* @__PURE__ */ new WeakMap();
function Fw(n) {
  let e = n.facet(bm), t = Gf.get(e);
  return t || Gf.set(e, t = Ww(e.reduce((i, s) => i.concat(s), []))), t;
}
let Ui = null;
const zw = 4e3;
function Ww(n, e = Nw) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = i[r];
    if (a == null)
      i[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var h, f;
    let d = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), g = l.split(/ (?!$)/).map((x) => Vw(x, e));
    for (let x = 1; x < g.length; x++) {
      let O = g.slice(0, x).join(" ");
      s(O, !0), d[O] || (d[O] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(L) => {
          let E = Ui = { view: L, prefix: O, scope: r };
          return setTimeout(() => {
            Ui == E && (Ui = null);
          }, zw), !0;
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
          c[f].run.push((d) => h(d, Qu));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let Qu = null;
function Kw(n, e, t, i) {
  Qu = e;
  let s = ix(e), o = V1(s, 0), r = H1(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  Ui && Ui.view == t && Ui.scope == i && (l = Ui.prefix + " ", am.indexOf(e.keyCode) < 0 && (u = !0, Ui = null));
  let h = /* @__PURE__ */ new Set(), f = (m) => {
    if (m) {
      for (let x of m.run)
        if (!h.has(x) && (h.add(x), x(t)))
          return m.stopPropagation && (c = !0), !0;
      m.preventDefault && (m.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, d = n[i], g, v;
  return d && (f(d[l + Fr(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(ge.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(ge.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (g = is[e.keyCode]) && g != s ? (f(d[l + Fr(g, e, !0)]) || e.shiftKey && (v = or[e.keyCode]) != s && v != g && f(d[l + Fr(v, e, !1)])) && (a = !0) : r && e.shiftKey && f(d[l + Fr(s, e, !0)]) && (a = !0), !a && f(d._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), Qu = null, a;
}
class As {
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
      let o = xm(e);
      return [new As(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Uw(e, t, i);
  }
}
function xm(n) {
  let e = n.scrollDOM.getBoundingClientRect();
  return { left: (n.textDirection == xt.LTR ? e.left : e.right - n.scrollDOM.clientWidth * n.scaleX) - n.scrollDOM.scrollLeft * n.scaleX, top: e.top - n.scrollDOM.scrollTop * n.scaleY };
}
function qf(n, e, t, i) {
  let s = n.coordsAtPos(e, t * 2);
  if (!s)
    return i;
  let o = n.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = n.posAtCoords({ x: o.left + 1, y: r }), a = n.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? i : { from: Math.max(i.from, Math.min(l, a)), to: Math.min(i.to, Math.max(l, a)) };
}
function Uw(n, e, t) {
  if (t.to <= n.viewport.from || t.from >= n.viewport.to)
    return [];
  let i = Math.max(t.from, n.viewport.from), s = Math.min(t.to, n.viewport.to), o = n.textDirection == xt.LTR, r = n.contentDOM, l = r.getBoundingClientRect(), a = xm(n), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), h = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), f = l.right - (c ? parseInt(c.paddingRight) : 0), d = Gu(n, i, 1), g = Gu(n, s, -1), v = d.type == Gt.Text ? d : null, m = g.type == Gt.Text ? g : null;
  if (v && (n.lineWrapping || d.widgetLineBreaks) && (v = qf(n, i, 1, v)), m && (n.lineWrapping || g.widgetLineBreaks) && (m = qf(n, s, -1, m)), v && m && v.from == m.from && v.to == m.to)
    return O(L(t.from, t.to, v));
  {
    let R = v ? L(t.from, null, v) : E(d, !1), z = m ? L(null, t.to, m) : E(g, !0), P = [];
    return (v || d).to < (m || g).from - (v && m ? 1 : 0) || d.widgetLineBreaks > 1 && R.bottom + n.defaultLineHeight / 2 < z.top ? P.push(x(h, R.bottom, f, z.top)) : R.bottom < z.top && n.elementAtHeight((R.bottom + z.top) / 2).type == Gt.Text && (R.bottom = z.top = (R.bottom + z.top) / 2), O(R).concat(P).concat(O(z));
  }
  function x(R, z, P, q) {
    return new As(e, R - a.left, z - a.top, Math.max(0, P - R), q - z);
  }
  function O({ top: R, bottom: z, horizontal: P }) {
    let q = [];
    for (let K = 0; K < P.length; K += 2)
      q.push(x(P[K], R, P[K + 1], z));
    return q;
  }
  function L(R, z, P) {
    let q = 1e9, K = -1e9, le = [];
    function j(ke, Te, ue, pe, ze) {
      let Be = n.coordsAtPos(ke, ke == P.to ? -2 : 2), Pe = n.coordsAtPos(ue, ue == P.from ? 2 : -2);
      !Be || !Pe || (q = Math.min(Be.top, Pe.top, q), K = Math.max(Be.bottom, Pe.bottom, K), ze == xt.LTR ? le.push(o && Te ? h : Be.left, o && pe ? f : Pe.right) : le.push(!o && pe ? h : Pe.left, !o && Te ? f : Be.right));
    }
    let D = R ?? P.from, U = z ?? P.to;
    for (let ke of n.visibleRanges)
      if (ke.to > D && ke.from < U)
        for (let Te = Math.max(ke.from, D), ue = Math.min(ke.to, U); ; ) {
          let pe = n.state.doc.lineAt(Te);
          for (let ze of n.bidiSpans(pe)) {
            let Be = ze.from + pe.from, Pe = ze.to + pe.from;
            if (Be >= ue)
              break;
            Pe > Te && j(Math.max(Be, Te), R == null && Be <= D, Math.min(Pe, ue), z == null && Pe >= U, ze.dir);
          }
          if (Te = pe.to + 1, Te >= ue)
            break;
        }
    return le.length == 0 && j(D, R == null, U, z == null, n.textDirection), { top: q, bottom: K, horizontal: le };
  }
  function E(R, z) {
    let P = l.top + (z ? R.top : R.bottom);
    return { top: P, bottom: P, horizontal: [] };
  }
}
function jw(n, e) {
  return n.constructor == e.constructor && n.eq(e);
}
class Gw {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(hl) != e.state.facet(hl) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, i = e.facet(hl);
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
    if (e.length != this.drawn.length || e.some((t, i) => !jw(t, this.drawn[i]))) {
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
const hl = /* @__PURE__ */ we.define();
function wm(n) {
  return [
    vn.define((e) => new Gw(e, n)),
    hl.of(n)
  ];
}
const lo = /* @__PURE__ */ we.define({
  combine(n) {
    return oa(n, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function qw(n = {}) {
  return [
    lo.of(n),
    Yw,
    Xw,
    Zw,
    qg.of(!0)
  ];
}
function km(n) {
  return n.startState.facet(lo) != n.state.facet(lo);
}
const Yw = /* @__PURE__ */ wm({
  above: !0,
  markers(n) {
    let { state: e } = n, t = e.facet(lo), i = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && ge.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : ne.cursor(s.head, s.assoc);
        for (let a of As.forRange(n, r, l))
          i.push(a);
      }
    }
    return i;
  },
  update(n, e) {
    n.transactions.some((i) => i.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = km(n);
    return t && Yf(n.state, e), n.docChanged || n.selectionSet || t;
  },
  mount(n, e) {
    Yf(e.state, n);
  },
  class: "cm-cursorLayer"
});
function Yf(n, e) {
  e.style.animationDuration = n.facet(lo).cursorBlinkRate + "ms";
}
const Xw = /* @__PURE__ */ wm({
  above: !1,
  markers(n) {
    let e = [], { main: t, ranges: i } = n.state.selection;
    for (let s of i)
      if (!s.empty)
        for (let o of As.forRange(n, "cm-selectionBackground", s))
          e.push(o);
    if (ge.ios && !t.empty && n.state.facet(lo).iosSelectionHandles) {
      for (let s of As.forRange(n, "cm-selectionHandle cm-selectionHandle-start", ne.cursor(t.from, 1)))
        e.push(s);
      for (let s of As.forRange(n, "cm-selectionHandle cm-selectionHandle-end", ne.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(n, e) {
    return n.docChanged || n.selectionSet || n.viewportChanged || km(n);
  },
  class: "cm-selectionLayer"
}), Jw = ge.gecko && ge.gecko_version == 153 ? "#ffffff01" : "transparent", Zw = /* @__PURE__ */ ia.highest(/* @__PURE__ */ $e.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${Jw} !important` },
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
function Qw() {
  return tk;
}
const ek = /* @__PURE__ */ wt.line({ class: "cm-activeLine" }), tk = /* @__PURE__ */ vn.fromClass(class {
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
      s.from > e && (t.push(ek.range(s.from)), e = s.from);
    }
    return wt.set(t);
  }
}, {
  decorations: (n) => n.decorations
}), zr = "-10000px";
class Sm {
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
function nk(n) {
  let e = n.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const Qa = /* @__PURE__ */ we.define({
  combine: (n) => {
    var e, t, i;
    return {
      position: ge.ios ? "absolute" : ((e = n.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = n.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((i = n.find((s) => s.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || nk
    };
  }
}), Xf = /* @__PURE__ */ new WeakMap(), Cm = /* @__PURE__ */ vn.fromClass(class {
  constructor(n) {
    this.view = n, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = n.state.facet(Qa);
    this.position = e.position, this.parent = e.parent, this.classes = n.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new Sm(n, jc, (t, i) => this.createTooltip(t, i), (t) => {
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
    let t = e || n.geometryChanged, i = n.state.facet(Qa);
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
    return t.dom.style.position = this.position, t.dom.style.top = zr, t.dom.style.left = "0px", this.container.insertBefore(t.dom, i), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
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
    let i = this.view.scrollDOM.getBoundingClientRect(), s = zc(this.view);
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
      space: this.view.state.facet(Qa).tooltipSpace(this.view),
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
        c.style.top = zr;
        continue;
      }
      let d = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, g = d ? 7 : 0, v = f.right - f.left, m = (e = Xf.get(u)) !== null && e !== void 0 ? e : f.bottom - f.top, x = u.offset || sk, O = this.view.textDirection == xt.LTR, L = f.width > i.right - i.left ? O ? i.left : i.right - f.width : O ? Math.max(i.left, Math.min(h.left - (d ? 14 : 0) + x.x, i.right - v)) : Math.min(Math.max(i.left, h.left - v + (d ? 14 : 0) - x.x), i.right - v), E = this.above[l];
      !a.strictSide && (E ? h.top - m - g - x.y < i.top : h.bottom + m + g + x.y > i.bottom) && E == i.bottom - h.bottom > h.top - i.top && (E = this.above[l] = !E);
      let R = (E ? h.top - i.top : i.bottom - h.bottom) - g;
      if (R < m && u.resize !== !1) {
        if (R < this.view.defaultLineHeight) {
          c.style.top = zr;
          continue;
        }
        Xf.set(u, m), c.style.height = (m = R) / o + "px";
      } else c.style.height && (c.style.height = "");
      let z = E ? h.top - m - g - x.y : h.bottom + g + x.y, P = L + v;
      if (u.overlap !== !0)
        for (let q of r)
          q.left < P && q.right > L && q.top < z + m && q.bottom > z && (z = E ? q.top - m - 2 - g : q.bottom + g + 2);
      if (this.position == "absolute" ? (c.style.top = (z - n.parent.top) / o + "px", Jf(c, (L - n.parent.left) / s)) : (c.style.top = z / o + "px", Jf(c, L / s)), d) {
        let q = h.left + (O ? x.x : -x.x) - (L + 14 - 7);
        d.style.left = q / s + "px";
      }
      u.overlap !== !0 && r.push({ left: L, top: z, right: P, bottom: z + m }), c.classList.toggle("cm-tooltip-above", E), c.classList.toggle("cm-tooltip-below", !E), u.positioned && u.positioned(n.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let n of this.manager.tooltipViews)
        n.dom.style.top = zr;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function Jf(n, e) {
  let t = parseInt(n.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (n.style.left = e + "px");
}
const ik = /* @__PURE__ */ $e.baseTheme({
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
}), sk = { x: 0, y: 0 }, jc = /* @__PURE__ */ we.define({
  enables: [Cm, ik]
}), Rl = /* @__PURE__ */ we.define({
  combine: (n) => n.reduce((e, t) => e.concat(t), [])
});
class fa {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new fa(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new Sm(e, Rl, (t, i) => this.createHostedView(t, i), (t) => t.dom.remove());
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
const ok = /* @__PURE__ */ jc.compute([Rl], (n) => {
  let e = n.facet(Rl);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var i;
      return (i = t.end) !== null && i !== void 0 ? i : t.pos;
    })),
    create: fa.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), rk = /* @__PURE__ */ we.define();
class lk {
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
      let l = e.bidiSpans(e.state.doc.lineAt(s)).find((u) => u.from <= s && u.to >= s), a = l && l.dir == xt.RTL ? -1 : 1;
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
      }, (a) => _n(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(Cm), t = e ? e.manager.tooltips.findIndex((i) => i.create == fa.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, i;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !ak(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (i = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && i !== void 0 ? i : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !uk(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
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
const Wr = 4;
function ak(n, e) {
  let { left: t, right: i, top: s, bottom: o } = n.getBoundingClientRect(), r;
  if (r = n.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - Wr && e.clientX <= i + Wr && e.clientY >= s - Wr && e.clientY <= o + Wr;
}
function uk(n, e, t, i, s, o) {
  let r = n.scrollDOM.getBoundingClientRect(), l = n.documentTop + n.documentPadding.top + n.contentHeight;
  if (r.left > i || r.right < i || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = n.posAtCoords({ x: i, y: s }, !1);
  return a >= e && a <= t;
}
function ck(n, e = {}) {
  let t = bt.define(), i = /* @__PURE__ */ new WeakMap(), s = Wn.define({
    create() {
      return [];
    },
    update(r, l) {
      let a = i.get(r);
      if (r.length && (e.hideOnChange && (l.docChanged || l.selection) ? r = [] : a && a(l) ? r = [] : e.hideOn && (r = r.filter((u) => !e.hideOn(l, u)))), l.docChanged && r.length) {
        let u = [];
        for (let c of r) {
          let h = l.changes.mapPos(c.pos, -1, hn.TrackDel);
          if (h != null) {
            let f = Object.assign(/* @__PURE__ */ Object.create(null), c);
            f.pos = h, f.end != null && (f.end = l.changes.mapPos(f.end)), u.push(f);
          }
        }
        r = u;
      }
      for (let u of l.effects)
        u.is(t) && (r = u.value, a = void 0), (u.is(hk) && !u.value || u.value == s) && (r = []);
      return r.length && a && i.set(r, a), r;
    },
    provide: (r) => Rl.from(r)
  });
  const o = vn.define((r) => new lk(
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
      rk.of(o),
      ok
    ]
  };
}
const hk = /* @__PURE__ */ bt.define(), Zf = /* @__PURE__ */ we.define({
  combine(n) {
    let e, t;
    for (let i of n)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), fk = /* @__PURE__ */ vn.fromClass(class {
  constructor(n) {
    this.input = n.state.facet(ec), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(n));
    let e = n.state.facet(Zf);
    this.top = new Kr(n, !0, e.topContainer), this.bottom = new Kr(n, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(n) {
    let e = n.state.facet(Zf);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Kr(n.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Kr(n.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = n.state.facet(ec);
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
  provide: (n) => $e.scrollMargins.of((e) => {
    let t = e.plugin(n);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Kr {
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
          e = Qf(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Qf(e);
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
function Qf(n) {
  let e = n.nextSibling;
  return n.remove(), e;
}
const ec = /* @__PURE__ */ we.define({
  enables: fk
});
class os extends $s {
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
os.prototype.elementClass = "";
os.prototype.toDOM = void 0;
os.prototype.mapMode = hn.TrackBefore;
os.prototype.startSide = os.prototype.endSide = -1;
os.prototype.point = !0;
const eu = /* @__PURE__ */ we.define(), dk = /* @__PURE__ */ we.define(), pk = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => Je.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {},
  side: "before"
}, jo = /* @__PURE__ */ we.define();
function gk(n) {
  return [Mm(), jo.of({ ...pk, ...n })];
}
const ed = /* @__PURE__ */ we.define({
  combine: (n) => n.some((e) => e)
});
function Mm(n) {
  return [
    mk
  ];
}
const mk = /* @__PURE__ */ vn.fromClass(class {
  constructor(n) {
    this.view = n, this.domAfter = null, this.prevViewport = n.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = n.state.facet(jo).map((e) => new nd(n, e)), this.fixed = !n.state.facet(ed);
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
    this.view.state.facet(ed) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = n.view.viewport;
  }
  syncGutters(n) {
    let e = this.dom.nextSibling;
    n && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Je.iter(this.view.state.facet(eu), this.view.viewport.from), i = [], s = this.gutters.map((o) => new vk(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == Gt.Text && r) {
            tc(t, i, l.from);
            for (let a of s)
              a.line(this.view, l, i);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == Gt.Text) {
        tc(t, i, o.from);
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
    let e = n.startState.facet(jo), t = n.state.facet(jo), i = n.docChanged || n.heightChanged || n.viewportChanged || !Je.eq(n.startState.facet(eu), n.state.facet(eu), n.view.viewport.from, n.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(n) && (i = !0);
    else {
      i = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new nd(this.view, o)) : (this.gutters[r].update(n), s.push(this.gutters[r]));
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
  provide: (n) => $e.scrollMargins.of((e) => {
    let t = e.plugin(n);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let i = t.dom.offsetWidth * e.scaleX, s = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == xt.LTR ? { left: i, right: s } : { right: i, left: s };
  })
});
function td(n) {
  return Array.isArray(n) ? n : [n];
}
function tc(n, e, t) {
  for (; n.value && n.from <= t; )
    n.from == t && e.push(n.value), n.next();
}
class vk {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.i = 0, this.cursor = Je.iter(e.markers, t.from);
  }
  addElement(e, t, i) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new Am(e, r, o, i);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, i);
    this.height = t.bottom, this.i++;
  }
  line(e, t, i) {
    let s = [];
    tc(this.cursor, s, t.from), i.length && (s = s.concat(i));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let i = this.gutter.config.widgetMarker(e, t.widget, t), s = i ? [i] : null;
    for (let o of e.state.facet(dk)) {
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
class nd {
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
    this.markers = td(t.markers(e)), t.initialSpacer && (this.spacer = new Am(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = td(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let i = e.view.viewport;
    return !Je.eq(this.markers, t, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Am {
  constructor(e, t, i, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, s);
  }
  update(e, t, i, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), yk(this.markers, s) || this.setMarkers(e, s);
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
function yk(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].compare(e[t]))
      return !1;
  return !0;
}
const bk = /* @__PURE__ */ we.define(), xk = /* @__PURE__ */ we.define(), zs = /* @__PURE__ */ we.define({
  combine(n) {
    return oa(n, { formatNumber: String, domEventHandlers: {} }, {
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
class tu extends os {
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
function nu(n, e) {
  return n.state.facet(zs).formatNumber(e, n.state);
}
const wk = /* @__PURE__ */ jo.compute([zs], (n) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(bk);
  },
  lineMarker(e, t, i) {
    return i.some((s) => s.toDOM) ? null : new tu(nu(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, i) => {
    for (let s of e.state.facet(xk)) {
      let o = s(e, t, i);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(zs) != e.state.facet(zs),
  initialSpacer(e) {
    return new tu(nu(e, id(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = nu(t.view, id(t.view.state.doc.lines));
    return i == e.number ? e : new tu(i);
  },
  domEventHandlers: n.facet(zs).domEventHandlers,
  side: "before"
}));
function kk(n = {}) {
  return [
    zs.of(n),
    Mm(),
    wk
  ];
}
function id(n) {
  let e = 9;
  for (; e < n; )
    e = e * 10 + 9;
  return e;
}
const Sk = 1024;
let Ck = 0;
class iu {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class et {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = Ck++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
    return typeof e != "function" && (e = dn.match(e)), (t) => {
      let i = e(t);
      return i === void 0 ? null : [this, i];
    };
  }
}
et.closedBy = new et({ deserialize: (n) => n.split(" ") });
et.openedBy = new et({ deserialize: (n) => n.split(" ") });
et.group = new et({ deserialize: (n) => n.split(" ") });
et.isolate = new et({ deserialize: (n) => {
  if (n && n != "rtl" && n != "ltr" && n != "auto")
    throw new RangeError("Invalid value for isolate: " + n);
  return n || "auto";
} });
et.contextHash = new et({ perNode: !0 });
et.lookAhead = new et({ perNode: !0 });
et.mounted = new et({ perNode: !0 });
class Go {
  constructor(e, t, i, s = !1) {
    this.tree = e, this.overlay = t, this.parser = i, this.bracketed = s;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[et.mounted.id];
  }
}
const Mk = /* @__PURE__ */ Object.create(null);
class dn {
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
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Mk, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new dn(e.name || "", t, e.id, i);
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
      let t = this.prop(et.group);
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
      for (let s = i.prop(et.group), o = -1; o < (s ? s.length : 0); o++) {
        let r = t[o < 0 ? i.name : s[o]];
        if (r)
          return r;
      }
    };
  }
}
dn.none = new dn(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class Gc {
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
      t.push(s ? new dn(i.name, s, i.id, i.flags) : i);
    }
    return new Gc(t);
  }
}
const Ur = /* @__PURE__ */ new WeakMap(), sd = /* @__PURE__ */ new WeakMap();
var Ot;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays", n[n.EnterBracketed = 16] = "EnterBracketed";
})(Ot || (Ot = {}));
class St {
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
    let e = Go.get(this);
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
    return new ic(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, i = 0) {
    let s = Ur.get(this) || this.topNode, o = new ic(s);
    return o.moveTo(e, t), Ur.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new Tn(this, 0, 0, null);
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
    let i = ur(Ur.get(this) || this.topNode, e, t, !1);
    return Ur.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let i = ur(sd.get(this) || this.topNode, e, t, !0);
    return sd.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return $k(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: i, from: s = 0, to: o = this.length } = e, r = e.mode || 0, l = (r & Ot.IncludeAnonymous) > 0;
    for (let a = this.cursor(r | Ot.IncludeAnonymous); ; ) {
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
    return this.children.length <= 8 ? this : Xc(dn.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, s) => new St(this.type, t, i, s, this.propValues), e.makeTree || ((t, i, s) => new St(dn.none, t, i, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Dk(e);
  }
}
St.empty = new St(dn.none, [], [], 0);
class qc {
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
    return new qc(this.buffer, this.index);
  }
}
class rs {
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
    return dn.none;
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
    for (let a = e; a != t && !(Tm(o, s, r[a + 1], r[a + 2]) && (l = a, i > 0)); a = r[a + 3])
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
    return new rs(o, r, this.set);
  }
}
function Tm(n, e, t, i) {
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
function ur(n, e, t, i) {
  for (var s; n.from == n.to || (t < 1 ? n.from >= e : n.from > e) || (t > -1 ? n.to <= e : n.to < e); ) {
    let r = !i && n instanceof Tn && n.index < 0 ? null : n.parent;
    if (!r)
      return n;
    n = r;
  }
  let o = i ? 0 : Ot.IgnoreOverlays;
  if (i)
    for (let r = n, l = r.parent; l; r = l, l = r.parent)
      r instanceof Tn && r.index < 0 && ((s = l.enter(e, t, o)) === null || s === void 0 ? void 0 : s.from) != r.from && (n = l);
  for (; ; ) {
    let r = n.enter(e, t, o);
    if (!r)
      return n;
    n = r;
  }
}
class $m {
  cursor(e = 0) {
    return new ic(this, e);
  }
  getChild(e, t = null, i = null) {
    let s = od(this, e, t, i);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return od(this, e, t, i);
  }
  resolve(e, t = 0) {
    return ur(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return ur(this, e, t, !0);
  }
  matchContext(e) {
    return nc(this.parent, e);
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
class Tn extends $m {
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
        if (!(!(o & Ot.EnterBracketed && c instanceof St && (f = Go.get(c)) && !f.overlay && f.bracketed && i >= h && i <= h + c.length) && !Tm(s, i, h, h + c.length))) {
          if (c instanceof rs) {
            if (o & Ot.ExcludeBuffers)
              continue;
            let d = c.findChild(0, c.buffer.length, t, i - h, s);
            if (d > -1)
              return new qi(new Ak(r, c, e, h), null, d);
          } else if (o & Ot.IncludeAnonymous || !c.type.isAnonymous || Yc(c)) {
            let d;
            if (!(o & Ot.IgnoreMounts) && (d = Go.get(c)) && !d.overlay)
              return new Tn(d.tree, h, e, r);
            let g = new Tn(c, h, e, r);
            return o & Ot.IncludeAnonymous || !g.type.isAnonymous ? g : g.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, s, o);
          }
        }
      }
      if (o & Ot.IncludeAnonymous || !r.type.isAnonymous || (r.index >= 0 ? e = r.index + t : e = t < 0 ? -1 : r._parent._tree.children.length, r = r._parent, !r))
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
    if (!(i & Ot.IgnoreOverlays) && (s = Go.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = i & Ot.EnterBracketed && s.bracketed;
      for (let { from: l, to: a } of s.overlay)
        if ((t > 0 || r ? l <= o : l < o) && (t < 0 || r ? a >= o : a > o))
          return new Tn(s.tree, s.overlay[0].from + this.from, -1, this);
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
function od(n, e, t, i) {
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
function nc(n, e, t = e.length - 1) {
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
class Ak {
  constructor(e, t, i, s) {
    this.parent = e, this.buffer = t, this.index = i, this.start = s;
  }
}
class qi extends $m {
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
    return o < 0 ? null : new qi(this.context, this, o);
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
    if (i & Ot.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, o = s.findChild(this.index + 4, s.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return o < 0 ? null : new qi(this.context, this, o);
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
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new qi(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new qi(this.context, this._parent, e.findChild(
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
    return new St(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function Dm(n) {
  if (!n.length)
    return null;
  let e = 0, t = n[0];
  for (let o = 1; o < n.length; o++) {
    let r = n[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let i = t instanceof Tn && t.index < 0 ? null : t.parent, s = n.slice();
  return i ? s[e] = i : s.splice(e, 1), new Tk(s, t);
}
class Tk {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return Dm(this.heads);
  }
}
function $k(n, e, t) {
  let i = n.resolveInner(e, t), s = null;
  for (let o = i instanceof Tn ? i : i.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [i])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Go.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new Tn(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [i])).push(ur(l, e, t, !1));
      }
    }
  return s ? Dm(s) : i;
}
class ic {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~Ot.EnterBracketed, e instanceof Tn)
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
    return e ? e instanceof Tn ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
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
    return this.buffer ? i & Ot.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & Ot.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & Ot.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
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
          if (this.mode & Ot.IncludeAnonymous || l instanceof rs || !l.type.isAnonymous || Yc(l))
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
      t = new qi(this.buffer, t, this.stack[s]);
    return this.bufferNode = new qi(this.buffer, t, this.index);
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
      return nc(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return nc(this._tree, e, s);
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
function Yc(n) {
  return n.children.some((e) => e instanceof rs || !e.type.isAnonymous || Yc(e));
}
function Dk(n) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: s = Sk, reused: o = [], minRepeatType: r = i.types.length } = n, l = Array.isArray(t) ? new qc(t, t.length) : t, a = i.types, u = 0, c = 0;
  function h(R, z, P, q, K, le) {
    let { id: j, start: D, end: U, size: ke } = l, Te = c, ue = u;
    if (ke < 0)
      if (l.next(), ke == -1) {
        let Ee = o[j];
        P.push(Ee), q.push(D - R);
        return;
      } else if (ke == -3) {
        u = j;
        return;
      } else if (ke == -4) {
        c = j;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ke}`);
    let pe = a[j], ze, Be, Pe = D - R;
    if (U - D <= s && (Be = m(l.pos - z, K))) {
      let Ee = new Uint16Array(Be.size - Be.skip), X = l.pos - Be.size, at = Ee.length;
      for (; l.pos > X; )
        at = x(Be.start, Ee, at);
      ze = new rs(Ee, U - Be.start, i), Pe = Be.start - R;
    } else {
      let Ee = l.pos - ke;
      l.next();
      let X = [], at = [], be = j >= r ? j : -1, Re = 0, se = U;
      for (; l.pos > Ee; )
        be >= 0 && l.id == be && l.size >= 0 ? (l.end <= se - s && (g(X, at, D, Re, l.end, se, be, Te, ue), Re = X.length, se = l.end), l.next()) : le > 2500 ? f(D, Ee, X, at) : h(D, Ee, X, at, be, le + 1);
      if (be >= 0 && Re > 0 && Re < X.length && g(X, at, D, Re, D, se, be, Te, ue), X.reverse(), at.reverse(), be > -1 && Re > 0) {
        let Z = d(pe, ue);
        ze = Xc(pe, X, at, 0, X.length, 0, U - D, Z, Z);
      } else
        ze = v(pe, X, at, U - D, Te - U, ue);
    }
    P.push(ze), q.push(Pe);
  }
  function f(R, z, P, q) {
    let K = [], le = 0, j = -1;
    for (; l.pos > z; ) {
      let { id: D, start: U, end: ke, size: Te } = l;
      if (Te > 4)
        l.next();
      else {
        if (j > -1 && U < j)
          break;
        j < 0 && (j = ke - s), K.push(D, U, ke), le++, l.next();
      }
    }
    if (le) {
      let D = new Uint16Array(le * 4), U = K[K.length - 2];
      for (let ke = K.length - 3, Te = 0; ke >= 0; ke -= 3)
        D[Te++] = K[ke], D[Te++] = K[ke + 1] - U, D[Te++] = K[ke + 2] - U, D[Te++] = Te;
      P.push(new rs(D, K[2] - U, i)), q.push(U - R);
    }
  }
  function d(R, z) {
    return (P, q, K) => {
      let le = 0, j = P.length - 1, D, U;
      if (j >= 0 && (D = P[j]) instanceof St) {
        if (!j && D.type == R && D.length == K)
          return D;
        (U = D.prop(et.lookAhead)) && (le = q[j] + D.length + U);
      }
      return v(R, P, q, K, le, z);
    };
  }
  function g(R, z, P, q, K, le, j, D, U) {
    let ke = [], Te = [];
    for (; R.length > q; )
      ke.push(R.pop()), Te.push(z.pop() + P - K);
    R.push(v(i.types[j], ke, Te, le - K, D - le, U)), z.push(K - P);
  }
  function v(R, z, P, q, K, le, j) {
    if (le) {
      let D = [et.contextHash, le];
      j = j ? [D].concat(j) : [D];
    }
    if (K > 25) {
      let D = [et.lookAhead, K];
      j = j ? [D].concat(j) : [D];
    }
    return new St(R, z, P, q, j);
  }
  function m(R, z) {
    let P = l.fork(), q = 0, K = 0, le = 0, j = P.end - s, D = { size: 0, start: 0, skip: 0 };
    e: for (let U = P.pos - R; P.pos > U; ) {
      let ke = P.size;
      if (P.id == z && ke >= 0) {
        D.size = q, D.start = K, D.skip = le, le += 4, q += 4, P.next();
        continue;
      }
      let Te = P.pos - ke;
      if (ke < 0 || Te < U || P.start < j)
        break;
      let ue = P.id >= r ? 4 : 0, pe = P.start;
      for (P.next(); P.pos > Te; ) {
        if (P.size < 0)
          if (P.size == -3 || P.size == -4)
            ue += 4;
          else
            break e;
        else P.id >= r && (ue += 4);
        P.next();
      }
      K = pe, q += ke, le += ue;
    }
    return (z < 0 || q == R) && (D.size = q, D.start = K, D.skip = le), D.size > 4 ? D : void 0;
  }
  function x(R, z, P) {
    let { id: q, start: K, end: le, size: j } = l;
    if (l.next(), j >= 0 && q < r) {
      let D = P;
      if (j > 4) {
        let U = l.pos - (j - 4);
        for (; l.pos > U; )
          P = x(R, z, P);
      }
      z[--P] = D, z[--P] = le - R, z[--P] = K - R, z[--P] = q;
    } else j == -3 ? u = q : j == -4 && (c = q);
    return P;
  }
  let O = [], L = [];
  for (; l.pos > 0; )
    h(n.start || 0, n.bufferStart || 0, O, L, -1, 0);
  let E = (e = n.length) !== null && e !== void 0 ? e : O.length ? L[0] + O[0].length : 0;
  return new St(a[n.topID], O.reverse(), L.reverse(), E);
}
const rd = /* @__PURE__ */ new WeakMap();
function fl(n, e) {
  if (!n.isAnonymous || e instanceof rs || e.type != n)
    return 1;
  let t = rd.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != n || !(i instanceof St)) {
        t = 1;
        break;
      }
      t += fl(n, i);
    }
    rd.set(e, t);
  }
  return t;
}
function Xc(n, e, t, i, s, o, r, l, a) {
  let u = 0;
  for (let g = i; g < s; g++)
    u += fl(n, e[g]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), h = [], f = [];
  function d(g, v, m, x, O) {
    for (let L = m; L < x; ) {
      let E = L, R = v[L], z = fl(n, g[L]);
      for (L++; L < x; L++) {
        let P = fl(n, g[L]);
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
        let P = v[L - 1] + g[L - 1].length - R;
        h.push(Xc(n, g, v, E, L, R, P, null, a));
      }
      f.push(R + O - o);
    }
  }
  return d(e, t, i, s, 0), (l || a)(h, f, r);
}
class Ts {
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
    let s = [new Ts(0, e.length, e, 0, !1, i)];
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
            f = d >= g ? null : new Ts(d, g, f.tree, f.offset + u, l > 0, !!c);
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
class Om {
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
    return typeof e == "string" && (e = new Ok(e)), i = i ? i.length ? i.map((s) => new iu(s.from, s.to)) : [new iu(0, 0)] : [new iu(0, e.length)], this.createParse(e, t || [], i);
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
class Ok {
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
new et({ perNode: !0 });
let Lk = 0;
class Sn {
  /**
  @internal
  */
  constructor(e, t, i, s) {
    this.name = e, this.set = t, this.base = i, this.modified = s, this.id = Lk++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let i = typeof e == "string" ? e : "?";
    if (e instanceof Sn && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let s = new Sn(i, [], null, []);
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
    let t = new Pl(e);
    return (i) => i.modified.indexOf(t) > -1 ? i : Pl.get(i.base || i, i.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let Ek = 0;
class Pl {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Ek++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && Bk(t, l.modified));
    if (i)
      return i;
    let s = [], o = new Sn(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = Ik(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(Pl.get(l, a));
    return o;
  }
}
function Bk(n, e) {
  return n.length == e.length && n.every((t, i) => t == e[i]);
}
function Ik(n) {
  let e = [[]];
  for (let t = 0; t < n.length; t++)
    for (let i = 0, s = e.length; i < s; i++)
      e.push(e[i].concat(n[t]));
  return e.sort((t, i) => i.length - t.length);
}
function Rk(n) {
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
        let c = new cr(i, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return Lm.add(e);
}
const Lm = new et({
  combine(n, e) {
    let t, i, s;
    for (; n || e; ) {
      if (!n || e && n.depth < e.depth ? (s = e, e = e.next) : (s = n, n = n.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new cr(s.tags, s.mode, s.context);
      t ? t.next = o : i = o, t = o;
    }
    return i;
  }
});
class cr {
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
cr.empty = new cr([], 2, null);
function Em(n, e) {
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
function Pk(n, e) {
  let t = null;
  for (let i of n) {
    let s = i.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function _k(n, e, t, i = 0, s = n.length) {
  let o = new Nk(i, Array.isArray(e) ? e : [e], t);
  o.highlightRange(n.cursor(), i, s, "", o.highlighters), o.flush(s);
}
class Nk {
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
    let u = s, c = Vk(e) || cr.empty, h = Pk(o, c.tags);
    if (h && (u && (u += " "), u += h, c.mode == 1 && (s += (s ? " " : "") + h)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let f = e.tree && e.tree.prop(et.mounted);
    if (f && f.overlay) {
      let d = e.node.enter(f.overlay[0].from + l, 1), g = this.highlighters.filter((m) => !m.scope || m.scope(f.tree.type)), v = e.firstChild();
      for (let m = 0, x = l; ; m++) {
        let O = m < f.overlay.length ? f.overlay[m] : null, L = O ? O.from + l : a, E = Math.max(t, x), R = Math.min(i, L);
        if (E < R && v)
          for (; e.from < R && (this.highlightRange(e, E, R, s, o), this.startSpan(Math.min(R, e.to), u), !(e.to >= L || !e.nextSibling())); )
            ;
        if (!O || L > i)
          break;
        x = O.to + l, x > t && (this.highlightRange(d.cursor(), Math.max(t, O.from + l), Math.min(i, x), "", g), this.startSpan(Math.min(i, x), u));
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
function Vk(n) {
  let e = n.type.prop(Lm);
  for (; e && e.context && !n.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const de = Sn.define, jr = de(), Hi = de(), ld = de(Hi), ad = de(Hi), Fi = de(), Gr = de(Fi), su = de(Fi), Jn = de(), ds = de(Jn), qn = de(), Yn = de(), sc = de(), Co = de(sc), qr = de(), Ne = {
  /**
  A comment.
  */
  comment: jr,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: de(jr),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: de(jr),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: de(jr),
  /**
  Any kind of identifier.
  */
  name: Hi,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: de(Hi),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: ld,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: de(ld),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: ad,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: de(ad),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: de(Hi),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: de(Hi),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: de(Hi),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: de(Hi),
  /**
  A literal value.
  */
  literal: Fi,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: Gr,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: de(Gr),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: de(Gr),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: de(Gr),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: su,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: de(su),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: de(su),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: de(Fi),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: de(Fi),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: de(Fi),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: de(Fi),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: de(Fi),
  /**
  A language keyword.
  */
  keyword: qn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: de(qn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: de(qn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: de(qn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: de(qn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: de(qn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: de(qn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: de(qn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: de(qn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: de(qn),
  /**
  An operator.
  */
  operator: Yn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: de(Yn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: de(Yn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: de(Yn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: de(Yn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: de(Yn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: de(Yn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: de(Yn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: de(Yn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: de(Yn),
  /**
  Program or markup punctuation.
  */
  punctuation: sc,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: de(sc),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Co,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: de(Co),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: de(Co),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: de(Co),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: de(Co),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Jn,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: ds,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: de(ds),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: de(ds),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: de(ds),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: de(ds),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: de(ds),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: de(ds),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: de(Jn),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: de(Jn),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: de(Jn),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: de(Jn),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: de(Jn),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: de(Jn),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: de(Jn),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: de(Jn),
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
  meta: qr,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: de(qr),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: de(qr),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: de(qr),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Sn.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Sn.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Sn.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Sn.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Sn.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Sn.defineModifier("special")
};
for (let n in Ne) {
  let e = Ne[n];
  e instanceof Sn && (e.name = n);
}
Em([
  { tag: Ne.link, class: "tok-link" },
  { tag: Ne.heading, class: "tok-heading" },
  { tag: Ne.emphasis, class: "tok-emphasis" },
  { tag: Ne.strong, class: "tok-strong" },
  { tag: Ne.keyword, class: "tok-keyword" },
  { tag: Ne.atom, class: "tok-atom" },
  { tag: Ne.bool, class: "tok-bool" },
  { tag: Ne.url, class: "tok-url" },
  { tag: Ne.labelName, class: "tok-labelName" },
  { tag: Ne.inserted, class: "tok-inserted" },
  { tag: Ne.deleted, class: "tok-deleted" },
  { tag: Ne.literal, class: "tok-literal" },
  { tag: Ne.string, class: "tok-string" },
  { tag: Ne.number, class: "tok-number" },
  { tag: [Ne.regexp, Ne.escape, Ne.special(Ne.string)], class: "tok-string2" },
  { tag: Ne.variableName, class: "tok-variableName" },
  { tag: Ne.local(Ne.variableName), class: "tok-variableName tok-local" },
  { tag: Ne.definition(Ne.variableName), class: "tok-variableName tok-definition" },
  { tag: Ne.special(Ne.variableName), class: "tok-variableName2" },
  { tag: Ne.definition(Ne.propertyName), class: "tok-propertyName tok-definition" },
  { tag: Ne.typeName, class: "tok-typeName" },
  { tag: Ne.namespace, class: "tok-namespace" },
  { tag: Ne.className, class: "tok-className" },
  { tag: Ne.macroName, class: "tok-macroName" },
  { tag: Ne.propertyName, class: "tok-propertyName" },
  { tag: Ne.operator, class: "tok-operator" },
  { tag: Ne.comment, class: "tok-comment" },
  { tag: Ne.meta, class: "tok-meta" },
  { tag: Ne.invalid, class: "tok-invalid" },
  { tag: Ne.punctuation, class: "tok-punctuation" }
]);
var ou;
const Ws = /* @__PURE__ */ new et();
function Hk(n) {
  return we.define({
    combine: n ? (e) => e.concat(n) : void 0
  });
}
const Fk = /* @__PURE__ */ new et();
class Nn {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, i = [], s = "") {
    this.data = e, this.name = s, ot.prototype.hasOwnProperty("tree") || Object.defineProperty(ot.prototype, "tree", { get() {
      return hi(this);
    } }), this.parser = t, this.extension = [
      co.of(this),
      ot.languageData.of((o, r, l) => {
        let a = ud(o, r, l), u = a.type.prop(Ws);
        if (!u)
          return [];
        let c = o.facet(u), h = a.type.prop(Fk);
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
    return ud(e, t, i).type.prop(Ws) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(co);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], s = (o, r) => {
      if (o.prop(Ws) == this.data) {
        i.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(et.mounted);
      if (l) {
        if (l.tree.prop(Ws) == this.data) {
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
        u instanceof St && s(u, o.positions[a] + r);
      }
    };
    return s(hi(e), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
Nn.setState = /* @__PURE__ */ bt.define();
function ud(n, e, t) {
  let i = n.facet(co), s = hi(n).topNode;
  if (!i || i.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, Ot.ExcludeBuffers | Ot.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function hi(n) {
  let e = n.field(Nn.state, !1);
  return e ? e.tree : St.empty;
}
class zk {
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
let Mo = null;
class ao {
  constructor(e, t, i = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new ao(e, t, [], St.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new zk(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != St.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let s = Date.now() + e;
        e = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped(Ts.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
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
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Ts.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Mo;
    Mo = this;
    try {
      return e();
    } finally {
      Mo = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = cd(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: i, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, h, f) => a.push({ fromA: u, toA: c, fromB: h, toB: f })), i = Ts.applyChanges(i, a), s = St.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), h = e.mapPos(u.to, -1);
          c < h && l.push({ from: c, to: h });
        }
      }
    }
    return new ao(this.parser, t, i, s, o, r, l, this.scheduleOn);
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
      s < e.to && o > e.from && (this.fragments = cd(this.fragments, s, o), this.skipped.splice(i--, 1));
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
    return new class extends Om {
      createParse(t, i, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = Mo;
            if (a) {
              for (let u of s)
                a.tempSkipped.push(u);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = r, new St(dn.none, [], [], r - o);
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
    return Mo;
  }
}
function cd(n, e, t) {
  return Ts.applyChanges(n, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class uo {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new uo(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = ao.create(e.facet(co).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new uo(i);
  }
}
Nn.state = /* @__PURE__ */ Wn.define({
  create: uo.init,
  update(n, e) {
    for (let t of e.effects)
      if (t.is(Nn.setState))
        return t.value;
    return e.startState.facet(co) != e.state.facet(co) ? uo.init(e.state) : n.apply(e);
  }
});
let Bm = (n) => {
  let e = setTimeout(
    () => n(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Bm = (n) => {
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
const ru = typeof navigator < "u" && (!((ou = navigator.scheduling) === null || ou === void 0) && ou.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Wk = /* @__PURE__ */ vn.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(Nn.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(Nn.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Bm(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: s } } = this.view, o = i.field(Nn.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !ru ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && i.doc.length > s + 1e3, a = o.context.work(() => ru && ru() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: Nn.setState.of(new uo(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => _n(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), co = /* @__PURE__ */ we.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: (n) => [
    Nn.state,
    Wk,
    $e.contentAttributes.compute([n], (e) => {
      let t = e.facet(n);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), Kk = /* @__PURE__ */ we.define(), Jc = /* @__PURE__ */ we.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    let e = n[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return e;
  }
});
function Es(n) {
  let e = n.facet(Jc);
  return e.charCodeAt(0) == 9 ? n.tabSize * e.length : e.length;
}
function _l(n, e) {
  let t = "", i = n.tabSize, s = n.facet(Jc)[0];
  if (s == "	") {
    for (; e >= i; )
      t += "	", e -= i;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function Im(n, e) {
  n instanceof ot && (n = new da(n));
  for (let i of n.state.facet(Kk)) {
    let s = i(n, e);
    if (s !== void 0)
      return s;
  }
  let t = hi(n.state);
  return t.length >= e ? Uk(n, t, e) : null;
}
class da {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Es(e);
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
    return ra(e, this.state.tabSize, t);
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
const Rm = /* @__PURE__ */ new et();
function Uk(n, e, t) {
  let i = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != i.node) {
    let o = [];
    for (let r = s; r && !(r.from < i.node.from || r.to > i.node.to || r.from == i.node.from && r.type == i.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      i = { node: o[r], next: i };
  }
  return Pm(i, n, t);
}
function Pm(n, e, t) {
  for (let i = n; i; i = i.next) {
    let s = Gk(i.node);
    if (s)
      return s(Zc.create(e, t, i));
  }
  return 0;
}
function jk(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function Gk(n) {
  let e = n.type.prop(Rm);
  if (e)
    return e;
  let t = n.firstChild, i;
  if (t && (i = t.type.prop(et.closedBy))) {
    let s = n.lastChild, o = s && i.indexOf(s.name) > -1;
    return (r) => Jk(r, !0, 1, void 0, o && !jk(r) ? s.from : void 0);
  }
  return n.parent == null ? qk : null;
}
function qk() {
  return 0;
}
class Zc extends da {
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
    return new Zc(e, t, i);
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
      if (Yk(i, e))
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
    return Pm(this.context.next, this.base, this.pos);
  }
}
function Yk(n, e) {
  for (let t = e; t; t = t.parent)
    if (n == t)
      return !0;
  return !1;
}
function Xk(n) {
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
function Jk(n, e, t, i, s) {
  let o = n.textAfter, r = o.match(/^\s*/)[0].length, l = i && o.slice(r, r + i.length) == i || s == n.pos + r, a = Xk(n);
  return a ? l ? n.column(a.from) : n.column(a.to) : n.baseIndent + (l ? 0 : n.unit * t);
}
class pa {
  constructor(e, t) {
    this.specs = e;
    let i;
    function s(l) {
      let a = ns.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof Nn ? (l) => l.prop(Ws) == r.data : r ? (l) => l == r : void 0, this.style = Em(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: o
    }).style, this.module = i ? new ns(i) : null, this.themeType = t.themeType;
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
    return new pa(e, t || {});
  }
}
const oc = /* @__PURE__ */ we.define(), Zk = /* @__PURE__ */ we.define({
  combine(n) {
    return n.length ? [n[0]] : null;
  }
});
function lu(n) {
  let e = n.facet(oc);
  return e.length ? e : n.facet(Zk);
}
function Qk(n, e) {
  let t = [tS], i;
  return n instanceof pa && (n.module && t.push($e.styleModule.of(n.module)), i = n.themeType), i ? t.push(oc.computeN([$e.darkTheme], (s) => s.facet($e.darkTheme) == (i == "dark") ? [n] : [])) : t.push(oc.of(n)), t;
}
class eS {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = hi(e.state), this.decorations = this.buildDeco(e, lu(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = hi(e.state), i = lu(e.state), s = i != lu(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, i), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return wt.none;
    let i = new Ms();
    for (let { from: s, to: o } of e.visibleRanges)
      _k(this.tree, t, (r, l, a) => {
        i.add(r, l, this.markCache[a] || (this.markCache[a] = wt.mark({ class: a })));
      }, s, o);
    return i.finish();
  }
}
const tS = /* @__PURE__ */ ia.high(/* @__PURE__ */ vn.fromClass(eS, {
  decorations: (n) => n.decorations
})), nS = 1e4, iS = "()[]{}", sS = /* @__PURE__ */ new et();
function rc(n, e, t) {
  let i = n.prop(e < 0 ? et.openedBy : et.closedBy);
  if (i)
    return i;
  if (n.name.length == 1) {
    let s = t.indexOf(n.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function lc(n) {
  let e = n.type.prop(sS);
  return e ? e(n.node) : n;
}
function Ks(n, e, t, i = {}) {
  let s = i.maxScanDistance || nS, o = i.brackets || iS, r = hi(n), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = rc(a.type, t, o);
    if (u && a.from < a.to) {
      let c = lc(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return oS(n, e, t, a, c, u, o);
    }
  }
  return rS(n, e, t, r, l.type, s, o);
}
function oS(n, e, t, i, s, o, r) {
  let l = i.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(i.from) : c.childAfter(i.to)))
    do
      if (t < 0 ? c.to <= i.from : c.from >= i.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let h = lc(c);
          return { start: a, end: h ? { from: h.from, to: h.to } : void 0, matched: !0 };
        } else if (rc(c.type, t, r))
          u++;
        else if (rc(c.type, -t, r)) {
          if (u == 0) {
            let h = lc(c);
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
function rS(n, e, t, i, s, o, r) {
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
      let x = r.indexOf(d[v]);
      if (!(x < 0 || i.resolveInner(g + v, 1).type != s))
        if (x % 2 == 0 == t > 0)
          h++;
        else {
          if (h == 1)
            return { start: u, end: { from: g + v, to: g + v + 1 }, matched: x >> 1 == a >> 1 };
          h--;
        }
    }
    t > 0 && (f += d.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function hd(n, e, t, i = 0, s = 0) {
  e == null && (e = n.search(/[^\s\u00a0]/), e == -1 && (e = n.length));
  let o = s;
  for (let r = i; r < e; r++)
    n.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class _m {
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = hd(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : hd(this.string, null, this.tabSize);
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
function lS(n) {
  return {
    name: n.name || "",
    token: n.token,
    blankLine: n.blankLine || (() => {
    }),
    startState: n.startState || (() => !0),
    copyState: n.copyState || aS,
    indent: n.indent || (() => null),
    languageData: n.languageData || {},
    tokenTable: n.tokenTable || th,
    mergeTokens: n.mergeTokens !== !1
  };
}
function aS(n) {
  if (typeof n != "object")
    return n;
  let e = {};
  for (let t in n) {
    let i = n[t];
    e[t] = i instanceof Array ? i.slice() : i;
  }
  return e;
}
const fd = /* @__PURE__ */ new WeakMap();
class Qc extends Nn {
  constructor(e) {
    let t = Hk(e.languageData), i = lS(e), s, o = new class extends Om {
      createParse(r, l, a) {
        return new cS(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = dS(t, this), s = this, this.streamParser = i, this.stateAfter = new et({ perNode: !0 }), this.tokenTable = e.tokenTable ? new Fm(i.tokenTable) : fS;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new Qc(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: i } = e.options;
    i && (t = fd.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = eh(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = i ? i(a.from) : -1, h = new _m(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; h.pos < u - a.from; )
          Vm(this.streamParser.token, h, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return i && t == null && fd.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function eh(n, e, t, i, s) {
  let o = t >= i && t + e.length <= s && e.prop(n.stateAfter);
  if (o)
    return { state: n.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof St && a < s && eh(n, l, a, i, s);
    if (u)
      return u;
  }
  return null;
}
function Nm(n, e, t, i, s) {
  if (s && t <= 0 && i >= e.length)
    return e;
  !s && t == 0 && e.type == n.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < i && l instanceof St) {
      if (!(a = Nm(n, l, t - r, i - r, s)))
        break;
      return s ? new St(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function uS(n, e, t, i, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && eh(n, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= i && (u = Nm(n, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: n.streamParser.startState(s ? Es(s) : 4), tree: St.empty };
}
class cS {
  constructor(e, t, i, s) {
    this.lang = e, this.input = t, this.fragments = i, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = ao.get(), r = s[0].from, { state: l, tree: a } = uS(e, i, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Es(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = ao.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), i = Math.min(
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
    let { line: t, end: i } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new _m(t, e ? e.state.tabSize : 4, e ? Es(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = Vm(o.token, r, this.state);
        if (l && (s = this.emitToken(this.lang.tokenTable.resolve(l), this.parsedPos + r.start, this.parsedPos + r.pos, s)), r.start > 1e4)
          break;
      }
    this.parsedPos = i, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = St.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: hS,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new St(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new St(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function Vm(n, e, t) {
  e.start = e.pos;
  for (let i = 0; i < 10; i++) {
    let s = n(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const th = /* @__PURE__ */ Object.create(null), hr = [dn.none], hS = /* @__PURE__ */ new Gc(hr), dd = [], pd = /* @__PURE__ */ Object.create(null), Hm = /* @__PURE__ */ Object.create(null);
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
  Hm[n] = /* @__PURE__ */ zm(th, e);
class Fm {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), Hm);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = zm(this.extra, e)) : 0;
  }
}
const fS = /* @__PURE__ */ new Fm(th);
function au(n, e) {
  dd.indexOf(n) > -1 || (dd.push(n), console.warn(e));
}
function zm(n, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = n[u] || Ne[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : au(u, `Modifier ${u} used at start of tag`) : a.length ? au(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : au(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let i = e.replace(/ /g, "_"), s = i + " " + t.map((l) => l.id), o = pd[s];
  if (o)
    return o.id;
  let r = pd[s] = dn.define({
    id: hr.length,
    name: i,
    props: [Rk({ [i]: t })]
  });
  return hr.push(r), r.id;
}
function dS(n, e) {
  let t = dn.define({ id: hr.length, name: "Document", props: [
    Ws.add(() => n),
    Rm.add(() => (i) => e.getIndent(i))
  ], top: !0 });
  return hr.push(t), t;
}
xt.RTL, xt.LTR;
const pS = (n) => {
  let { state: e } = n, t = e.doc.lineAt(e.selection.main.from), i = ih(n.state, t.from);
  return i.line ? gS(n) : i.block ? vS(n) : !1;
};
function nh(n, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let s = n(e, t);
    return s ? (i(t.update(s)), !0) : !1;
  };
}
const gS = /* @__PURE__ */ nh(
  xS,
  0
  /* CommentOption.Toggle */
), mS = /* @__PURE__ */ nh(
  Wm,
  0
  /* CommentOption.Toggle */
), vS = /* @__PURE__ */ nh(
  (n, e) => Wm(n, e, bS(e)),
  0
  /* CommentOption.Toggle */
);
function ih(n, e) {
  let t = n.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const Ao = 50;
function yS(n, { open: e, close: t }, i, s) {
  let o = n.sliceDoc(i - Ao, i), r = n.sliceDoc(s, s + Ao), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, h;
  s - i <= 2 * Ao ? c = h = n.sliceDoc(i, s) : (c = n.sliceDoc(i, i + Ao), h = n.sliceDoc(s - Ao, s));
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
function bS(n) {
  let e = [];
  for (let t of n.selection.ranges) {
    let i = n.doc.lineAt(t.from), s = t.to <= i.to ? i : n.doc.lineAt(t.to);
    s.from > i.from && s.from == t.to && (s = t.to == i.to + 1 ? i : n.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > i.from ? e[o].to = s.to : e.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: s.to });
  }
  return e;
}
function Wm(n, e, t = e.selection.ranges) {
  let i = t.map((o) => ih(e, o.from).block);
  if (!i.every((o) => o))
    return null;
  let s = t.map((o, r) => yS(e, i[r], o.from, o.to));
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
function xS(n, e, t = e.selection.ranges) {
  let i = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = i.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let h = e.doc.lineAt(c);
      if (u == null && (u = ih(e, h.from).line, !u))
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
function mo(n, e) {
  return ne.create(n.ranges.map(e), n.mainIndex);
}
function Kn(n, e) {
  return n.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Un({ state: n, dispatch: e }, t) {
  let i = mo(n.selection, t);
  return i.eq(n.selection, !0) ? !1 : (e(Kn(n, i)), !0);
}
function ga(n, e) {
  return ne.cursor(e ? n.to : n.from);
}
function Km(n, e) {
  return Un(n, (t) => t.empty ? n.moveByChar(t, e) : ga(t, e));
}
function en(n) {
  return n.textDirectionAt(n.state.selection.main.head) == xt.LTR;
}
const Um = (n) => Km(n, !en(n)), jm = (n) => Km(n, en(n));
function Gm(n, e) {
  return Un(n, (t) => t.empty ? n.moveByGroup(t, e) : ga(t, e));
}
const wS = (n) => Gm(n, !en(n)), kS = (n) => Gm(n, en(n));
function SS(n, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(e.from, e.to))) || e.firstChild;
}
function ma(n, e, t) {
  let i = hi(n).resolveInner(e.head), s = t ? et.closedBy : et.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? i.childAfter(a) : i.childBefore(a);
    if (!u)
      break;
    SS(n, u, s) ? i = u : a = t ? u.to : u.from;
  }
  let o = i.type.prop(s), r, l;
  return o && (r = t ? Ks(n, i.from, 1) : Ks(n, i.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? i.to : i.from, ne.cursor(l, t ? -1 : 1);
}
const CS = (n) => Un(n, (e) => ma(n.state, e, !en(n))), MS = (n) => Un(n, (e) => ma(n.state, e, en(n)));
function qm(n, e) {
  return Un(n, (t) => {
    if (!t.empty)
      return ga(t, e);
    let i = n.moveVertically(t, e);
    return i.head != t.head ? i : n.moveToLineBoundary(t, e);
  });
}
const Ym = (n) => qm(n, !1), Xm = (n) => qm(n, !0);
function Jm(n) {
  let e = n.scrollDOM.clientHeight < n.scrollDOM.scrollHeight - 2, t = 0, i = 0, s;
  if (e) {
    for (let o of n.state.facet($e.scrollMargins)) {
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
function Zm(n, e) {
  let t = Jm(n), { state: i } = n, s = mo(i.selection, (r) => r.empty ? n.moveVertically(r, e, t.height) : ga(r, e));
  if (s.eq(i.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = n.coordsAtPos(i.selection.main.head), l = n.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = $e.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return n.dispatch(Kn(i, s), { effects: o }), !0;
}
const gd = (n) => Zm(n, !1), ac = (n) => Zm(n, !0);
function ls(n, e, t) {
  let i = n.lineBlockAt(e.head), s = n.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? i.to : i.from) && (s = n.moveToLineBoundary(e, t, !1)), !t && s.head == i.from && i.length) {
    let o = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    o && e.head != i.from + o && (s = ne.cursor(i.from + o));
  }
  return s;
}
const AS = (n) => Un(n, (e) => ls(n, e, !0)), TS = (n) => Un(n, (e) => ls(n, e, !1)), $S = (n) => Un(n, (e) => ls(n, e, !en(n))), DS = (n) => Un(n, (e) => ls(n, e, en(n))), OS = (n) => Un(n, (e) => n.moveToLineBoundary(e, !1, !1)), LS = (n) => Un(n, (e) => n.moveToLineBoundary(e, !0, !1));
function ES(n, e, t) {
  let i = !1, s = mo(n.selection, (o) => {
    let r = Ks(n, o.head, -1) || Ks(n, o.head, 1) || o.head > 0 && Ks(n, o.head - 1, 1) || o.head < n.doc.length && Ks(n, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    i = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return ne.cursor(l);
  });
  return i ? (e(Kn(n, s)), !0) : !1;
}
const BS = ({ state: n, dispatch: e }) => ES(n, e);
function Ln(n, e, t) {
  let i = mo(n.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = ne.range(s.head, s.anchor));
    let o = t(s);
    return ne.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return i.eq(n.state.selection) ? !1 : (n.dispatch(Kn(n.state, i)), !0);
}
function Qm(n, e) {
  return Ln(n, e, (t) => n.moveByChar(t, e));
}
const ev = (n) => Qm(n, !en(n)), tv = (n) => Qm(n, en(n));
function nv(n, e) {
  return Ln(n, e, (t) => n.moveByGroup(t, e));
}
const IS = (n) => nv(n, !en(n)), RS = (n) => nv(n, en(n)), PS = (n) => {
  let e = !en(n);
  return Ln(n, e, (t) => ma(n.state, t, e));
}, _S = (n) => {
  let e = en(n);
  return Ln(n, e, (t) => ma(n.state, t, e));
};
function iv(n, e) {
  return Ln(n, e, (t) => n.moveVertically(t, e));
}
const sv = (n) => iv(n, !1), ov = (n) => iv(n, !0);
function rv(n, e) {
  return Ln(n, e, (t) => n.moveVertically(t, e, Jm(n).height));
}
const md = (n) => rv(n, !1), vd = (n) => rv(n, !0), NS = (n) => Ln(n, !0, (e) => ls(n, e, !0)), VS = (n) => Ln(n, !1, (e) => ls(n, e, !1)), HS = (n) => {
  let e = !en(n);
  return Ln(n, e, (t) => ls(n, t, e));
}, FS = (n) => {
  let e = en(n);
  return Ln(n, e, (t) => ls(n, t, e));
}, zS = (n) => Ln(n, !1, (e) => ne.cursor(n.lineBlockAt(e.head).from)), WS = (n) => Ln(n, !0, (e) => ne.cursor(n.lineBlockAt(e.head).to)), yd = ({ state: n, dispatch: e }) => (e(Kn(n, { anchor: 0 })), !0), bd = ({ state: n, dispatch: e }) => (e(Kn(n, { anchor: n.doc.length })), !0), xd = ({ state: n, dispatch: e }) => (e(Kn(n, { anchor: n.selection.main.anchor, head: 0 })), !0), wd = ({ state: n, dispatch: e }) => (e(Kn(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), KS = ({ state: n, dispatch: e }) => (e(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), US = ({ state: n, dispatch: e }) => {
  let t = va(n).map(({ from: i, to: s }) => ne.undirectionalRange(i, Math.min(s + 1, n.doc.length)));
  return e(n.update({ selection: ne.create(t), userEvent: "select" })), !0;
}, jS = ({ state: n, dispatch: e }) => {
  let t = mo(n.selection, (i) => {
    let s = hi(n), o = s.resolveStack(i.from, 1);
    if (i.empty) {
      let r = s.resolveStack(i.from, -1);
      r.node.from >= o.node.from && r.node.to <= o.node.to && (o = r);
    }
    for (let r = o; r; r = r.next) {
      let { node: l } = r;
      if ((l.from < i.from && l.to >= i.to || l.to > i.to && l.from <= i.from) && r.next)
        return ne.undirectionalRange(l.from, l.to);
    }
    return i;
  });
  return t.eq(n.selection) ? !1 : (e(Kn(n, t)), !0);
};
function lv(n, e) {
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
  return s.length == i.ranges.length ? !1 : (n.dispatch(Kn(t, ne.create(s, s.length - 1))), !0);
}
const GS = (n) => lv(n, !1), qS = (n) => lv(n, !0), YS = ({ state: n, dispatch: e }) => {
  let t = n.selection, i = null;
  return t.ranges.length > 1 ? i = ne.create([t.main]) : t.main.empty || (i = ne.create([ne.cursor(t.main.head)])), i ? (e(Kn(n, i)), !0) : !1;
};
function kr(n, e) {
  if (n.state.readOnly)
    return !1;
  let t = "delete.selection", { state: i } = n, s = i.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = Yr(n, a, !1)) : a > r && (t = "delete.forward", a = Yr(n, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = Yr(n, r, !1), l = Yr(n, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: ne.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (n.dispatch(i.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? $e.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function Yr(n, e, t) {
  if (n instanceof $e)
    for (let i of n.state.facet($e.atomicRanges).map((s) => s(n)))
      i.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const av = (n, e, t) => kr(n, (i) => {
  let s = i.from, { state: o } = n, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = ra(l, o.tabSize), c = u % Es(o) || Es(o);
    for (let h = 0; h < c && l[l.length - 1 - h] == " "; h++)
      s--;
    a = s;
  } else
    a = Jt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = Jt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), uc = (n) => av(n, !1, !0), uv = (n) => av(n, !0, !1), cv = (n, e) => kr(n, (t) => {
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
}), hv = (n) => cv(n, !1), XS = (n) => cv(n, !0), JS = (n) => kr(n, (e) => {
  let t = n.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), ZS = (n) => kr(n, (e) => {
  let t = n.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), QS = (n) => kr(n, (e) => {
  let t = n.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), eC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: nt.of(["", ""]) },
    range: ne.cursor(i.from)
  }));
  return e(n.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, tC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let s = i.from, o = n.doc.lineAt(s), r = s == o.from ? s - 1 : Jt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : Jt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: n.doc.slice(s, l).append(n.doc.slice(r, s)) },
      range: ne.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(n.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function va(n) {
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
function fv(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [], s = [];
  for (let o of va(n)) {
    if (t ? o.to == n.doc.length : o.from == 0)
      continue;
    let r = n.doc.lineAt(t ? o.to + 1 : o.from - 1), l = r.length + 1;
    if (t) {
      i.push({ from: o.to, to: r.to }, { from: o.from, insert: r.text + n.lineBreak });
      for (let a of o.ranges)
        s.push(ne.range(Math.min(n.doc.length, a.anchor + l), Math.min(n.doc.length, a.head + l)));
    } else {
      i.push({ from: r.from, to: o.from }, { from: o.to, insert: n.lineBreak + r.text });
      for (let a of o.ranges)
        s.push(ne.range(a.anchor - l, a.head - l));
    }
  }
  return i.length ? (e(n.update({
    changes: i,
    scrollIntoView: !0,
    selection: ne.create(s, n.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const nC = ({ state: n, dispatch: e }) => fv(n, e, !1), iC = ({ state: n, dispatch: e }) => fv(n, e, !0);
function dv(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let o of va(n))
    t ? i.push({ from: o.from, insert: n.doc.slice(o.from, o.to) + n.lineBreak }) : i.push({ from: o.to, insert: n.lineBreak + n.doc.slice(o.from, o.to) });
  let s = n.changes(i);
  return e(n.update({
    changes: s,
    selection: n.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const sC = ({ state: n, dispatch: e }) => dv(n, e, !1), oC = ({ state: n, dispatch: e }) => dv(n, e, !0), rC = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: e } = n, t = e.changes(va(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), i = mo(e.selection, (s) => {
    let o;
    if (n.lineWrapping) {
      let r = n.lineBlockAt(s.head), l = n.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + n.documentTop - l.bottom + n.defaultLineHeight / 2);
    }
    return n.moveVertically(s, !0, o);
  }).map(t);
  return n.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function lC(n, e) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = hi(n).resolveInner(e), i = t.childBefore(e), s = t.childAfter(e), o;
  return i && s && i.to <= e && s.from >= e && (o = i.type.prop(et.closedBy)) && o.indexOf(s.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(s.from).from && !/\S/.test(n.sliceDoc(i.to, s.from)) ? { from: i.to, to: s.from } : null;
}
const kd = /* @__PURE__ */ pv(!1), aC = /* @__PURE__ */ pv(!0);
function pv(n) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !n && o == r && lC(e, o);
      n && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new da(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = Im(u, o);
      for (c == null && (c = ra(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let h = ["", _l(e, c)];
      return a && h.push(_l(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: nt.of(h) },
        range: ne.cursor(o + 1 + h[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function sh(n, e) {
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
      range: ne.range(o.mapPos(i.anchor, 1), o.mapPos(i.head, 1))
    };
  });
}
const uC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new da(n, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = sh(n, (o, r, l) => {
    let a = Im(i, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = _l(n, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(n.update(s, { userEvent: "indent" })), !0;
}, cC = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(sh(n, (t, i) => {
  i.push({ from: t.from, insert: n.facet(Jc) });
}), { userEvent: "input.indent" })), !0), hC = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(sh(n, (t, i) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = ra(s, n.tabSize), r = 0, l = _l(n, Math.max(0, o - Es(n)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  i.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), fC = (n) => (n.setTabFocusMode(), !0), dC = [
  { key: "Ctrl-b", run: Um, shift: ev, preventDefault: !0 },
  { key: "Ctrl-f", run: jm, shift: tv },
  { key: "Ctrl-p", run: Ym, shift: sv },
  { key: "Ctrl-n", run: Xm, shift: ov },
  { key: "Ctrl-a", run: OS, shift: zS },
  { key: "Ctrl-e", run: LS, shift: WS },
  { key: "Ctrl-d", run: uv },
  { key: "Ctrl-h", run: uc },
  { key: "Ctrl-k", run: JS },
  { key: "Ctrl-Alt-h", run: hv },
  { key: "Ctrl-o", run: eC },
  { key: "Ctrl-t", run: tC },
  { key: "Ctrl-v", run: ac }
], pC = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Um, shift: ev, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: wS, shift: IS, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: $S, shift: HS, preventDefault: !0 },
  { key: "ArrowRight", run: jm, shift: tv, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: kS, shift: RS, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: DS, shift: FS, preventDefault: !0 },
  { key: "ArrowUp", run: Ym, shift: sv, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: yd, shift: xd },
  { mac: "Ctrl-ArrowUp", run: gd, shift: md },
  { key: "ArrowDown", run: Xm, shift: ov, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: bd, shift: wd },
  { mac: "Ctrl-ArrowDown", run: ac, shift: vd },
  { key: "PageUp", run: gd, shift: md },
  { key: "PageDown", run: ac, shift: vd },
  { key: "Home", run: TS, shift: VS, preventDefault: !0 },
  { key: "Mod-Home", run: yd, shift: xd },
  { key: "End", run: AS, shift: NS, preventDefault: !0 },
  { key: "Mod-End", run: bd, shift: wd },
  { key: "Enter", run: kd, shift: kd },
  { key: "Mod-a", run: KS },
  { key: "Backspace", run: uc, shift: uc, preventDefault: !0 },
  { key: "Delete", run: uv, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: hv, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: XS, preventDefault: !0 },
  { mac: "Mod-Backspace", run: ZS, preventDefault: !0 },
  { mac: "Mod-Delete", run: QS, preventDefault: !0 }
].concat(/* @__PURE__ */ dC.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), gC = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: CS, shift: PS },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: MS, shift: _S },
  { key: "Alt-ArrowUp", run: nC },
  { key: "Shift-Alt-ArrowUp", run: sC },
  { key: "Alt-ArrowDown", run: iC },
  { key: "Shift-Alt-ArrowDown", run: oC },
  { key: "Mod-Alt-ArrowUp", run: GS },
  { key: "Mod-Alt-ArrowDown", run: qS },
  { key: "Escape", run: YS },
  { key: "Mod-Enter", run: aC },
  { key: "Alt-l", mac: "Ctrl-l", run: US },
  { key: "Mod-i", run: jS, preventDefault: !0 },
  { key: "Mod-[", run: hC },
  { key: "Mod-]", run: cC },
  { key: "Mod-Alt-\\", run: uC },
  { key: "Shift-Mod-k", run: rC },
  { key: "Shift-Mod-\\", run: BS },
  { key: "Mod-/", run: pS },
  { key: "Alt-A", mac: "Ctrl-A", run: mS },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: fC }
].concat(pC);
class Sd {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.diagnostic = i;
  }
}
class ys {
  constructor(e, t, i) {
    this.diagnostics = e, this.panel = t, this.selected = i;
  }
  static init(e, t, i) {
    let s = i.facet(fr).markerFilter;
    s && (e = s(e, i));
    let o = e.slice().sort((d, g) => d.from - g.from || d.to - g.to), r = new Ms(), l = [], a = 0, u = i.doc.iter(), c = 0, h = i.doc.length;
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
      let x = !1;
      if (l.some((L) => L.from == v && (L.to == m || m == h)) && (x = v == m, !x && m - v < 10)) {
        let L = v - (c + u.value.length);
        L > 0 && (u.next(L), c = v);
        for (let E = v; ; ) {
          if (E >= m) {
            x = !0;
            break;
          }
          if (!u.lineBreak && c + u.value.length > E)
            break;
          E = c + u.value.length, c += u.value.length, u.next();
        }
      }
      let O = wv(l);
      if (x)
        r.add(v, v, wt.widget({
          widget: new bC(O),
          diagnostics: l.slice()
        }));
      else {
        let L = l.reduce((E, R) => R.markClass ? E + " " + R.markClass : E, "");
        r.add(v, m, wt.mark({
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
    return new ys(f, t, ho(f));
  }
}
function ho(n, e = null, t = 0) {
  let i = null;
  return n.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!i)
        i = new Sd(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(i.diagnostic) < 0)
          return !1;
        i = new Sd(i.from, o, i.diagnostic);
      }
  }), i;
}
function gv(n, e) {
  let t = e.pos, i = e.end || t, s = n.state.facet(fr).hideOn(n, t, i);
  if (s != null)
    return s;
  let o = n.startState.doc.lineAt(e.pos);
  return !!(n.effects.some((r) => r.is(ya)) || n.changes.touchesRange(o.from, Math.max(o.to, i)));
}
function mC(n, e) {
  return n.field(Vn, !1) ? e : e.concat(bt.appendConfig.of($C));
}
function uu(n, e) {
  return {
    effects: mC(n, [ya.of(e)])
  };
}
const ya = /* @__PURE__ */ bt.define(), mv = /* @__PURE__ */ bt.define(), vv = /* @__PURE__ */ bt.define(), Vn = /* @__PURE__ */ Wn.define({
  create() {
    return new ys(wt.none, null, null);
  },
  update(n, e) {
    if (e.docChanged && n.diagnostics.size) {
      let t = n.diagnostics.map(e.changes), i = null, s = n.panel;
      if (n.selected) {
        let o = e.changes.mapPos(n.selected.from, 1);
        i = ho(t, n.selected.diagnostic, o) || ho(t, null, o);
      }
      !t.size && s && e.state.facet(fr).autoPanel && (s = null), n = new ys(t, s, i);
    }
    for (let t of e.effects)
      if (t.is(ya)) {
        let i = e.state.facet(fr).autoPanel ? t.value.length ? Nl.open : null : n.panel;
        n = ys.init(t.value, i, e.state);
      } else t.is(mv) ? n = new ys(n.diagnostics, t.value ? Nl.open : null, n.selected) : t.is(vv) && (n = new ys(n.diagnostics, n.panel, t.value));
    return n;
  },
  provide: (n) => [
    ec.from(n, (e) => e.panel),
    $e.decorations.from(n, (e) => e.diagnostics)
  ]
}), vC = /* @__PURE__ */ wt.mark({ class: "cm-lintRange cm-lintRange-active" });
function yC(n, e, t) {
  let { diagnostics: i } = n.state.field(Vn), s, o = -1, r = -1;
  i.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = n.state.facet(fr).tooltipFilter;
  return s && l && (s = l(s, n.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: yv(n, s) };
    }
  } : null;
}
function yv(n, e) {
  return si("ul", { class: "cm-tooltip-lint" }, e.map((t) => xv(n, t, !1)));
}
const Cd = (n) => {
  let e = n.state.field(Vn, !1);
  return !e || !e.panel ? !1 : (n.dispatch({ effects: mv.of(!1) }), !0);
}, fr = /* @__PURE__ */ we.define({
  combine(n) {
    return {
      sources: n.map((e) => e.source).filter((e) => e != null),
      ...oa(n.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: Md,
        tooltipFilter: Md,
        needsRefresh: (e, t) => e ? t ? (i) => e(i) || t(i) : e : t,
        hideOn: (e, t) => e ? t ? (i, s, o) => e(i, s, o) || t(i, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function Md(n, e) {
  return n ? e ? (t, i) => e(n(t, i), i) : n : e;
}
function bv(n) {
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
function xv(n, e, t) {
  var i;
  let s = t ? bv(e.actions) : [];
  return si("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, si("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(n) : e.message), (i = e.actions) === null || i === void 0 ? void 0 : i.map((o, r) => {
    let l = !1, a = (d) => {
      if (d.preventDefault(), l)
        return;
      l = !0;
      let g = ho(n.state.field(Vn).diagnostics, e);
      g && o.apply(n, g.from, g.to);
    }, { name: u } = o, c = s[r] ? u.indexOf(s[r]) : -1, h = c < 0 ? u : [
      u.slice(0, c),
      si("u", u.slice(c, c + 1)),
      u.slice(c + 1)
    ], f = o.markClass ? " " + o.markClass : "";
    return si("button", {
      type: "button",
      class: "cm-diagnosticAction" + f,
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${u}${c < 0 ? "" : ` (access key "${s[r]})"`}.`
    }, h);
  }), e.source && si("div", { class: "cm-diagnosticSource" }, e.source));
}
class bC extends yr {
  constructor(e) {
    super(), this.sev = e;
  }
  eq(e) {
    return e.sev == this.sev;
  }
  toDOM() {
    return si("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
}
class Ad {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = xv(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class Nl {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          Cd(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = bv(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = ho(this.view.state.field(Vn).diagnostics, o);
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
    this.list = si("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: i
    }), this.dom = si("div", { class: "cm-panel-lint" }, this.list, si("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => Cd(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(Vn).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(Vn), i = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
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
        h < 0 ? (f = new Ad(this.view, c), this.items.splice(i, 0, f), s = !0) : (f = this.items[h], h > i && (this.items.splice(i, h - i), s = !0)), t && f.diagnostic == t.diagnostic ? f.dom.hasAttribute("aria-selected") || (f.dom.setAttribute("aria-selected", "true"), o = f) : f.dom.hasAttribute("aria-selected") && f.dom.removeAttribute("aria-selected"), i++;
      }
    }); i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Ad(this.view, {
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
    let t = this.view.state.field(Vn), i = ho(t.diagnostics, this.items[e].diagnostic);
    i && this.view.dispatch({
      selection: { anchor: i.from, head: i.to },
      scrollIntoView: !0,
      effects: vv.of(i)
    });
  }
  static open(e) {
    return new Nl(e);
  }
}
function dl(n, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(n)}</svg>')`;
}
function Xr(n) {
  return dl(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${n}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const xC = /* @__PURE__ */ $e.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ Xr("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ Xr("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ Xr("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ Xr("#66d") },
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
function wC(n) {
  return n == "error" ? 4 : n == "warning" ? 3 : n == "info" ? 2 : 1;
}
function wv(n) {
  let e = "hint", t = 1;
  for (let i of n) {
    let s = wC(i.severity);
    s > t && (t = s, e = i.severity);
  }
  return e;
}
class kv extends os {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = wv(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let i = this.diagnostics, s = e.state.facet(ba).tooltipFilter;
    return s && (i = s(i, e.state)), i.length && (t.onmouseover = () => SC(e, t, i)), t;
  }
}
function kC(n, e) {
  let t = (i) => {
    let s = e.getBoundingClientRect();
    if (!(i.clientX > s.left - 10 && i.clientX < s.right + 10 && i.clientY > s.top - 10 && i.clientY < s.bottom + 10)) {
      for (let o = i.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), n.state.field(Sv) && n.dispatch({ effects: oh.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function SC(n, e, t) {
  function i() {
    let r = n.elementAtHeight(e.getBoundingClientRect().top + 5 - n.documentTop);
    n.coordsAtPos(r.from) && n.dispatch({ effects: oh.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: yv(n, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, kC(n, e);
  }
  let { hoverTime: s } = n.state.facet(ba), o = setTimeout(i, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(i, s);
  };
}
function CC(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = n.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let i = [];
  for (let s in t)
    i.push(new kv(t[s]).range(+s));
  return Je.of(i, !0);
}
const MC = /* @__PURE__ */ gk({
  class: "cm-gutter-lint",
  markers: (n) => n.state.field(cc),
  widgetMarker: (n, e, t) => {
    let i = [];
    return n.state.field(cc).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && i.push(...r.diagnostics);
    }), i.length ? new kv(i) : null;
  }
}), cc = /* @__PURE__ */ Wn.define({
  create() {
    return Je.empty;
  },
  update(n, e) {
    n = n.map(e.changes);
    let t = e.state.facet(ba).markerFilter;
    for (let i of e.effects)
      if (i.is(ya)) {
        let s = i.value;
        t && (s = t(s || [], e.state)), n = CC(e.state.doc, s.slice(0));
      }
    return n;
  }
}), oh = /* @__PURE__ */ bt.define(), Sv = /* @__PURE__ */ Wn.define({
  create() {
    return null;
  },
  update(n, e) {
    return n && e.docChanged && (n = gv(e, n) ? null : { ...n, pos: e.changes.mapPos(n.pos) }), e.effects.reduce((t, i) => i.is(oh) ? i.value : t, n);
  },
  provide: (n) => jc.from(n)
}), AC = /* @__PURE__ */ $e.baseTheme({
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
    content: /* @__PURE__ */ dl('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ dl('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ dl('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), TC = /* @__PURE__ */ ck(yC, { hideOn: gv }), $C = [
  Vn,
  /* @__PURE__ */ $e.decorations.compute([Vn], (n) => {
    let { selected: e, panel: t } = n.field(Vn);
    return !e || !t || e.from == e.to ? wt.none : wt.set([
      vC.range(e.from, e.to)
    ]);
  }),
  TC,
  xC
], ba = /* @__PURE__ */ we.define({
  combine(n) {
    return oa(n, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function DC(n = {}) {
  return [ba.of(n), cc, MC, AC, Sv];
}
const Td = /* @__PURE__ */ Qt({
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
    const l = Qc.define({
      token(f) {
        return f.sol() && f.match(/^%.*/) ? "comment" : f.sol() && f.match(/^[A-Za-z]:.*/) ? "meta" : f.match(/^"[^"\n]*"/) ? "string" : f.match(/^\[K:[^\]\n]*\]/) ? "meta" : f.eat("|") ? "punctuation" : f.match(/^[zZ][0-9]*/) ? "atom" : f.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (f.next(), null);
      },
      startState: () => null
    }), a = pa.define([
      { tag: Ne.comment, color: "var(--plenio-abc-comment, #8fa3b0)", fontStyle: "italic" },
      { tag: Ne.meta, color: "var(--plenio-abc-meta, #6fa8dc)" },
      { tag: Ne.string, color: "var(--plenio-abc-chord, #d6a15a)" },
      { tag: Ne.atom, color: "var(--plenio-abc-rest, #9a9a9a)" },
      { tag: Ne.punctuation, color: "var(--plenio-abc-bar, #c0c0c0)", fontWeight: "bold" }
    ]), u = $e.theme({
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
    vr(() => {
      s.value && (o = new $e({
        parent: s.value,
        state: ot.create({
          doc: t.text,
          extensions: [
            kk(),
            qw(),
            Qw(),
            bm.of(gC),
            l,
            Qk(a),
            DC(),
            u,
            $e.lineWrapping,
            ot.readOnly.of(!!t.readonly),
            $e.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            $e.updateListener.of((f) => {
              f.docChanged && !r && i("change", f.state.doc.toString()), f.selectionSet && !r && f.transactions.some((d) => d.isUserEvent("select")) && i("cursor", f.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(uu(o.state, c(o.state))));
    }), Di(() => o?.destroy()), Ye(
      () => t.text,
      (f) => {
        if (!o || o.state.doc.toString() === f) return;
        r = !0;
        const d = Math.min(o.state.selection.main.head, f.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: f }, selection: { anchor: d } }), r = !1, o.dispatch(uu(o.state, c(o.state)));
      }
    ), Ye(
      () => t.diagnostics,
      () => {
        o && o.dispatch(uu(o.state, c(o.state)));
      }
    ), Ye(
      () => t.reveal,
      (f) => {
        if (!o || !f) return;
        const d = o.state.doc.length, [g, v] = [Math.min(f[0], d), Math.min(f[1], d)], m = o.state.selection.main;
        m.from === g && m.to === v || (r = !0, o.dispatch({ selection: ne.single(g, v) }), r = !1, h(o, g));
      }
    );
    function h(f, d) {
      const g = f.scrollDOM, v = f.lineBlockAt(d);
      (v.top < g.scrollTop || v.bottom > g.scrollTop + g.clientHeight) && (g.scrollTop = Math.max(0, v.top - g.clientHeight / 3));
    }
    return (f, d) => (w(), A("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), ei = 18, ms = 24, wi = ei + ms, Bo = 22, Io = 34, kn = 36, OC = 6, $d = 3, LC = 12, Cv = 6, Mv = 28, EC = 21, BC = 108;
function rh(n) {
  return [
    ...n.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...n.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function xa(n) {
  const e = Number(n.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function IC(n, e) {
  return e === "auto" ? Math.max(1, n.grid.snap) : Math.max(1, Math.round(xa(n) / e));
}
function RC(n, e = 4, t = 24) {
  let i = n.length ? Math.min(...n.map((o) => o.pitch)) - e : 60, s = n.length ? Math.max(...n.map((o) => o.pitch)) + e : 79;
  if (s - i + 1 < t) {
    const o = t - (s - i + 1);
    i -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return i < 0 && ([i, s] = [0, Math.min(127, s - i)]), s > 127 && ([i, s] = [Math.max(0, i - (s - 127)), 127]), [i, s];
}
function PC(n) {
  const e = n.map((s) => s.pitch), t = Math.max(0, Math.min(EC, ...e.map((s) => s - 2))), i = Math.min(127, Math.max(BC, ...e.map((s) => s + 2)));
  return [t, i];
}
function _C(n, e) {
  const t = wi + (e.lyrics ? Bo : 0), i = t + (e.source ? Io : 0), s = rh(n), [o, r] = PC(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(n.grid.units_per_quarter, 1e-9), u = Math.max(Cv, Math.min(Mv, Math.round(e.rowHeight ?? LC))), c = IC(n, e.snap), h = Math.max(1, Math.round(n.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: RC(s),
    total: n.total,
    snap: c,
    drawLength: Math.max(c, Math.round(h / c) * c),
    width: kn + n.total * a + 40,
    height: i + l * u,
    top: i,
    sourceTop: e.source ? t : null
  };
}
const st = (n, e) => kn + n * e.pxPerUnit, Zn = (n, e) => (n - kn) / e.pxPerUnit, fo = (n, e) => e.top + (e.high - n) * e.rowHeight;
function Av(n, e, t, i) {
  const s = (fo(i, n) + fo(t, n) + n.rowHeight) / 2, o = Math.max(0, e - n.top), r = s - n.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, n.height - e), r)));
}
function Dd(n, e, t, i) {
  const s = fo(i, n);
  return s >= e + n.top && s + n.rowHeight <= e + t ? null : Av(n, t, i, i);
}
function Vl(n, e) {
  const t = e.high - Math.floor((n - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const hc = (n, e) => Math.floor(n / e) * e, Jr = (n, e) => Math.round(n / e) * e;
function ji(n, e) {
  return {
    x: st(n.onset, e),
    y: fo(n.pitch, e) + 0.5,
    width: Math.max(2, n.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function Hl(n, e, t) {
  const i = n.name.length * 7 + 10, s = e ? (e.onset - n.onset) * t.pxPerUnit - 2 : i;
  return Math.max(12, Math.min(i, s));
}
const NC = (n) => [1, 3, 6, 8, 10].includes((n % 12 + 12) % 12);
function VC(n) {
  return `C${Math.floor(n / 12) - 1}`;
}
function HC(n) {
  const e = [];
  for (const t of n.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const i = Number(t.meter.split("/")[0]) || 1, s = t.length / i;
    for (let o = 1; o < i; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function Od(n, e, t, i, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, Zn(n, s))), u = e - r;
  if (u < ei) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= wi && u < s.top) return { area: "lyrics", unit: a };
  if (u < wi) {
    for (let f = i.length - 1; f >= 0; f--) {
      const d = i[f], g = st(d.onset, s);
      if (n >= g && n <= g + Hl(d, i[f + 1], s)) return { area: "chord", chord: d };
    }
    return { area: "lane", unit: a };
  }
  if (n - l < kn) return { area: "keys", pitch: Vl(e, s) };
  const c = t.filter((f) => {
    const d = ji(f, s);
    return n >= d.x && n <= d.x + d.width && e >= d.y - 0.5 && e <= d.y + d.height + 0.5;
  }), h = c.find((f) => f.track === o) ?? c[0];
  if (h) {
    const f = ji(h, s), d = n >= f.x + f.width - Math.min(OC, f.width / 3) ? "end" : "body";
    return { area: "note", note: h, edge: d };
  }
  return { area: "grid", unit: a, pitch: Vl(e, s) };
}
function Tv(n, e, t) {
  return n.y0 < (n.from?.scrollTop ?? t) + e || n.y1 < t + e;
}
function $v(n, e, t = 0, i = 0) {
  const s = n.from?.scrollTop ?? t, o = n.from?.scrollLeft ?? i, r = (f, d) => Math.max(d + kn, Math.min(e.width, f)), l = (f, d) => Math.max(d + e.top, Math.min(e.height, f)), a = [r(n.x0, o), r(n.x1, i)], u = [l(n.y0, s), l(n.y1, t)], c = Math.min(...a), h = Math.min(...u);
  return { x: c, y: h, width: Math.max(...a) - c, height: Math.max(...u) - h };
}
function FC(n, e = 0, t = wi) {
  return Tv(n, t, e);
}
function zC(n, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : n.filter((i) => {
    const s = ji(i, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function WC(n, e, t, i = 0, s = 0) {
  if (!Tv(e, t.top, i)) return [];
  const o = $v(e, t, i, s);
  return o.width <= 0 ? [] : n.filter((r, l) => {
    const a = st(r.onset, t);
    return a < o.x + o.width && a + Hl(r, n[l + 1], t) > o.x;
  });
}
function KC(n, e, t, i) {
  return { kind: "move", notes: n, anchor: e, fromUnit: t, fromPitch: i, delta: 0, semitones: 0 };
}
function UC(n, e = [], t = 1 / 0) {
  const i = e.filter((o) => o.track === n.track && o.onset > n.onset).map((o) => o.onset), s = Math.min(t, ...i);
  return { kind: "resize", note: n, end: n.onset + n.duration, overwrite: !1, limit: s };
}
function jC(n, e, t, i) {
  const s = Math.max(0, Math.min(hc(e, i.snap), i.total - 1));
  return { kind: "draw", track: n, start: s, end: Math.min(i.total, s + i.snap), pitch: t };
}
function GC(n, e = n.onset) {
  return { kind: "chord", chord: n, fromUnit: e, to: n.onset };
}
const Ro = (n, e, t) => Math.max(e, Math.min(t, n));
function qC(n, e, t, i, s) {
  switch (n.kind) {
    case "move": {
      const o = n.anchor.onset + (e - n.fromUnit), r = Math.min(...n.notes.map((f) => f.onset)), l = Math.max(...n.notes.map((f) => f.onset + f.duration)), a = Ro(Jr(o, i.snap) - n.anchor.onset, -r, i.total - l), u = Math.min(...n.notes.map((f) => f.pitch)), c = Math.max(...n.notes.map((f) => f.pitch)), h = Ro(t - n.fromPitch, -u, 127 - c);
      return { ...n, delta: a, semitones: h, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(i.snap, i.total - n.note.onset), r = s.alt ? i.total : Math.max(n.note.onset + n.note.duration, Math.min(i.total, n.limit)), l = Ro(Jr(e, i.snap), n.note.onset + Math.max(1, o), r);
      return { ...n, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= n.start ? n.start + i.snap : Math.max(n.start + i.snap, Jr(e, i.snap));
      return { ...n, end: Math.min(i.total, o) };
    }
    case "chord":
      return { ...n, to: Ro(Jr(n.chord.onset + e - n.fromUnit, i.snap), 0, i.total - 1) };
  }
}
function YC(n, e) {
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
function XC(n) {
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
function JC(n) {
  return n ? n.kind === "move" ? n.copy ? /* @__PURE__ */ new Set() : new Set(n.notes.map((e) => e.id)) : n.kind === "resize" ? /* @__PURE__ */ new Set([n.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function ZC(n, e, t, i, s, o) {
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
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((f) => f.onset)), c = Math.max(...t.map((f) => f.onset + f.duration)), h = Ro(l * a, -u, s.total - c);
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
const QC = /^(vocal|ins):\d+$/;
function po(n, e) {
  const t = n?.model?.tracks, i = /* @__PURE__ */ new Set();
  if (!t) return i;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (QC.test(o)) i.add(o);
    else {
      const r = s.get(o);
      r && i.add(r);
    }
  return i;
}
function dr(n) {
  return new Set(n.filter((e) => e.startsWith("chord:")));
}
function Zr(n, e = []) {
  return [...n.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const Dv = [
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
], e2 = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Ov(n, e) {
  let t = null;
  for (const i of n.measures) i.onset <= e && (t = i);
  return t;
}
function Lv(n, e, t) {
  const i = n?.model;
  if (!i) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = po(n, e), o = dr(e), r = rh(i).filter((h) => s.has(h.id)), l = i.tracks.chords.filter((h) => o.has(h.id)), a = r.length === 1 ? i.tracks.chords.find((h) => h.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Ov(i, u) : t ? i.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function t2(n, e) {
  const t = Ov(n, e) ?? n.measures[0], i = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(i / o) + 1, l = i - (r - 1) * o, a = xa(n), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: i, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function n2(n, e, t) {
  const i = n.measures[e - 1];
  return !i || !Number.isInteger(t) || t < 0 || t >= i.length ? null : i.onset + t;
}
const i2 = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, s2 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function fc(n) {
  return `${s2[n % 12]}${Math.floor(n / 12) - 1}`;
}
function o2(n) {
  const e = n.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const i = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + i2[t[1].toUpperCase()] + i;
  return s >= 0 && s <= 127 ? s : null;
}
function r2(n) {
  const e = xa(n), t = [];
  for (const i of [32, 16, 8, 4, 2, 1]) {
    e % i === 0 && t.push({ label: `1/${i}`, units: e / i });
    const s = e / i * 1.5;
    i >= 2 && i <= 16 && Number.isInteger(s) && t.push({ label: `1/${i}.`, units: s });
  }
  return t.sort((i, s) => i.units - s.units);
}
function l2(n, e) {
  return !n.length || n.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: n.map((t) => t.id), midi: e };
}
function Ni(n, e, t = []) {
  return !n.length && !t.length || n.some((i) => i.pitch + e < 0 || i.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...n.map((i) => i.id), ...t.map((i) => i.id)], semitones: e };
}
function Ld(n, e) {
  return !n.length || n.every((t) => t.track === e) ? null : { op: "move_notes", ids: n.map((t) => t.id), track: e };
}
function a2(n, e, t) {
  return t === null || t === e.onset || t + e.duration > n.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function u2(n, e, t, i) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > n.total ? null : { op: "resize_note", id: e.id, duration: t, mode: i };
}
function c2(n, e, t) {
  const i = e.trim();
  return i ? t?.name === i ? null : { op: "put_chord", onset: n, name: i } : t ? { op: "delete_chord", onset: n } : null;
}
function h2(n, e) {
  return e === null || e === n.onset ? null : { op: "move_chord", onset: n.onset, to: e };
}
function Ed(n, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? n.n : n.n + 1, count: t };
}
function f2(n, e = 1) {
  return { op: "duplicate_measures", bar: n.n, count: e };
}
function d2(n, e, t = 1) {
  return n.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Bd(n, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === n.meter ? null : { op: "change_meter", bar: n.n, count: 1, meter: t };
}
function Ev(n, e) {
  return n.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function p2(n, e) {
  return !Dv.includes(e) || e === n.key ? null : { op: "put_key", onset: n.onset, key: e };
}
function g2(n, e) {
  const t = Ev(n, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function m2(n, e) {
  return n === "text" ? "text" : n === "daw" ? "daw" : n === "review" ? "review" : e;
}
const v2 = {
  class: "inspector",
  "aria-label": "Inspector"
}, y2 = {
  key: 0,
  class: "facts"
}, b2 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, x2 = {
  key: 0,
  class: "facts"
}, w2 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, k2 = ["disabled"], S2 = ["disabled"], C2 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, M2 = ["disabled"], A2 = ["disabled"], T2 = ["disabled", "onKeydown"], $2 = ["disabled"], D2 = ["disabled"], O2 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, L2 = ["disabled", "onKeydown"], E2 = ["disabled", "aria-label", "onKeydown"], B2 = { class: "facts" }, I2 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, R2 = ["disabled", "aria-label"], P2 = ["disabled"], _2 = ["value"], N2 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, V2 = ["disabled"], H2 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, F2 = ["disabled", "onKeydown"], z2 = { class: "field" }, W2 = ["disabled"], K2 = ["disabled"], U2 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, j2 = {
  key: 0,
  class: "facts"
}, G2 = { class: "field" }, q2 = ["disabled", "onKeydown"], Y2 = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, X2 = ["disabled"], J2 = ["disabled"], Z2 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, Q2 = ["disabled", "onKeydown"], eM = ["disabled", "onKeydown"], tM = { class: "field" }, nM = ["disabled"], iM = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, sM = { class: "facts" }, oM = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, rM = ["disabled"], lM = ["disabled"], aM = { class: "field" }, uM = ["disabled"], cM = ["aria-label"], hM = { class: "facts" }, fM = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, dM = ["disabled"], pM = ["disabled"], gM = ["disabled"], mM = ["disabled"], vM = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, yM = ["disabled"], bM = { id: "plenio-meters" }, xM = ["value"], wM = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, kM = ["disabled"], SM = ["value"], CM = ["disabled"], MM = {
  key: 4,
  class: "facts"
}, AM = {
  key: 5,
  class: "error"
}, TM = /* @__PURE__ */ Qt({
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
    const e = n, t = N(() => e.view?.model ?? null), i = N(() => Lv(e.view, e.selection, e.fallbackBar)), s = N(() => i.value.notes.length === 1 ? i.value.notes[0] : null), o = N(() => i.value.chords.length === 1 && !i.value.notes.length ? i.value.chords[0] : null), r = N(() => i.value.measure), l = N(() => !e.readonly && !e.stale && !e.busy), a = N(() => t.value ? r2(t.value) : []), u = N(() => t.value && r.value ? Ev(t.value, r.value) : null), c = N(() => {
      const j = s.value?.onset ?? o.value?.onset;
      return t.value && j !== void 0 ? t2(t.value, j) : null;
    }), h = N(() => {
      const j = new Set(i.value.notes.map((D) => D.track));
      return j.size === 1 ? [...j][0] : j.size ? "mixed" : null;
    }), f = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(1), g = /* @__PURE__ */ G(0), v = /* @__PURE__ */ G(1), m = /* @__PURE__ */ G(!1), x = /* @__PURE__ */ G(""), O = /* @__PURE__ */ G("4/4"), L = /* @__PURE__ */ G("C");
    Ye(
      [s, o, r, () => i.value.chordAtNote],
      () => {
        const j = s.value;
        f.value = j ? fc(j.pitch) : "", v.value = j?.duration ?? 1, d.value = c.value?.bar ?? 1, g.value = c.value?.offset ?? 0, x.value = (j ? i.value.chordAtNote?.name : o.value?.name) ?? "", O.value = r.value?.meter ?? "4/4", L.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const E = /* @__PURE__ */ G(null);
    async function R(j) {
      !j || !l.value || (E.value = null, await e.operate(j));
    }
    function z() {
      const j = o2(f.value);
      if (j === null) {
        E.value = `"${f.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, f.value = s.value ? fc(s.value.pitch) : "";
        return;
      }
      R(l2(i.value.notes, j));
    }
    function P() {
      const j = t.value;
      if (!j) return;
      const D = n2(j, Number(d.value), Number(g.value));
      if (D === null) {
        E.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? R(a2(j, s.value, D)) : o.value && R(h2(o.value, D));
    }
    function q(j = Number(v.value)) {
      const D = t.value;
      !D || !s.value || R(u2(D, s.value, j, m.value ? "overwrite" : e.resizeMode));
    }
    function K() {
      const j = s.value?.onset ?? o.value?.onset;
      j !== void 0 && R(c2(j, x.value, s.value ? i.value.chordAtNote : o.value));
    }
    function le(j) {
      const D = [...i.value.notes.map((U) => U.id), ...i.value.chords.map((U) => U.id)];
      D.length && R({ op: j ? "delete_close_gap" : "delete", ids: D });
    }
    return (j, D) => (w(), A("aside", v2, [
      t.value ? (w(), A(ve, { key: 1 }, [
        i.value.notes.length ? (w(), A("section", b2, [
          p("h4", null, [
            ye(F(s.value ? `${h.value === "vocal" ? "Vocal" : "Ins"} note` : `${i.value.notes.length} notes`) + " ", 1),
            c.value ? (w(), A("span", x2, F(c.value.text), 1)) : Q("", !0)
          ]),
          p("div", w2, [
            D[36] || (D[36] = p("span", { class: "name" }, "voice", -1)),
            p("button", {
              class: Xe({ active: h.value === "vocal" }),
              disabled: !l.value,
              onClick: D[0] || (D[0] = (U) => R(V(Ld)(i.value.notes, "vocal")))
            }, "Vocal", 10, k2),
            p("button", {
              class: Xe({ active: h.value === "ins" }),
              disabled: !l.value,
              onClick: D[1] || (D[1] = (U) => R(V(Ld)(i.value.notes, "ins")))
            }, "Ins", 10, S2)
          ]),
          p("div", C2, [
            D[37] || (D[37] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: D[2] || (D[2] = (U) => R(V(Ni)(i.value.notes, -12, i.value.chords)))
            }, "−8va", 8, M2),
            p("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: D[3] || (D[3] = (U) => R(V(Ni)(i.value.notes, -1, i.value.chords)))
            }, "−1", 8, A2),
            s.value ? Ue((w(), A("input", {
              key: 0,
              "onUpdate:modelValue": D[4] || (D[4] = (U) => f.value = U),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: $t(ct(z, ["prevent"]), ["enter"]),
              onChange: z
            }, null, 40, T2)), [
              [Nt, f.value]
            ]) : Q("", !0),
            p("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: D[5] || (D[5] = (U) => R(V(Ni)(i.value.notes, 1, i.value.chords)))
            }, "+1", 8, $2),
            p("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: D[6] || (D[6] = (U) => R(V(Ni)(i.value.notes, 12, i.value.chords)))
            }, "+8va", 8, D2)
          ]),
          s.value ? (w(), A(ve, { key: 0 }, [
            p("div", O2, [
              D[38] || (D[38] = p("span", { class: "name" }, "start", -1)),
              D[39] || (D[39] = ye(" bar ", -1)),
              Ue(p("input", {
                "onUpdate:modelValue": D[7] || (D[7] = (U) => d.value = U),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: $t(ct(P, ["prevent"]), ["enter"]),
                onChange: P
              }, null, 40, L2), [
                [
                  Nt,
                  d.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              D[40] || (D[40] = ye(" + ", -1)),
              Ue(p("input", {
                "onUpdate:modelValue": D[8] || (D[8] = (U) => g.value = U),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: $t(ct(P, ["prevent"]), ["enter"]),
                onChange: P
              }, null, 40, E2), [
                [
                  Nt,
                  g.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              p("span", B2, "× " + F(t.value.unit), 1)
            ]),
            p("div", I2, [
              D[42] || (D[42] = p("span", { class: "name" }, "length", -1)),
              Ue(p("input", {
                "onUpdate:modelValue": D[9] || (D[9] = (U) => v.value = U),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: D[10] || (D[10] = $t(ct((U) => q(), ["prevent"]), ["enter"])),
                onChange: D[11] || (D[11] = (U) => q())
              }, null, 40, R2), [
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
                onChange: D[12] || (D[12] = (U) => q(Number(U.target.value)))
              }, [
                D[41] || (D[41] = p("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (w(!0), A(ve, null, Ie(a.value, (U) => (w(), A("option", {
                  key: U.label,
                  value: U.units
                }, F(U.label), 9, _2))), 128))
              ], 40, P2)
            ]),
            p("label", N2, [
              Ue(p("input", {
                "onUpdate:modelValue": D[13] || (D[13] = (U) => m.value = U),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, V2), [
                [cn, m.value]
              ]),
              D[43] || (D[43] = ye(" longer: over the next note ", -1))
            ]),
            p("div", H2, [
              D[44] || (D[44] = p("span", { class: "name" }, "chord", -1)),
              Ue(p("input", {
                "onUpdate:modelValue": D[14] || (D[14] = (U) => x.value = U),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: $t(ct(K, ["prevent"]), ["enter"]),
                onChange: K
              }, null, 40, F2), [
                [Nt, x.value]
              ])
            ])
          ], 64)) : Q("", !0),
          p("div", z2, [
            p("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: D[15] || (D[15] = (U) => le(!1))
            }, "→ rest", 8, W2),
            p("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: D[16] || (D[16] = (U) => le(!0))
            }, "close gap", 8, K2)
          ])
        ])) : o.value ? (w(), A("section", U2, [
          p("h4", null, [
            D[45] || (D[45] = ye(" Chord symbol ", -1)),
            c.value ? (w(), A("span", j2, F(c.value.text), 1)) : Q("", !0)
          ]),
          p("div", G2, [
            D[46] || (D[46] = p("span", { class: "name" }, "name", -1)),
            Ue(p("input", {
              "onUpdate:modelValue": D[17] || (D[17] = (U) => x.value = U),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: $t(ct(K, ["prevent"]), ["enter"]),
              onChange: K
            }, null, 40, q2), [
              [Nt, x.value]
            ])
          ]),
          p("div", Y2, [
            D[47] || (D[47] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: D[18] || (D[18] = (U) => R(V(Ni)([], -1, i.value.chords)))
            }, "−1", 8, X2),
            p("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: D[19] || (D[19] = (U) => R(V(Ni)([], 1, i.value.chords)))
            }, "+1", 8, J2)
          ]),
          p("div", Z2, [
            D[48] || (D[48] = p("span", { class: "name" }, "start", -1)),
            D[49] || (D[49] = ye(" bar ", -1)),
            Ue(p("input", {
              "onUpdate:modelValue": D[20] || (D[20] = (U) => d.value = U),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: $t(ct(P, ["prevent"]), ["enter"]),
              onChange: P
            }, null, 40, Q2), [
              [
                Nt,
                d.value,
                void 0,
                { number: !0 }
              ]
            ]),
            D[50] || (D[50] = ye(" + ", -1)),
            Ue(p("input", {
              "onUpdate:modelValue": D[21] || (D[21] = (U) => g.value = U),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: $t(ct(P, ["prevent"]), ["enter"]),
              onChange: P
            }, null, 40, eM), [
              [
                Nt,
                g.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          p("div", tM, [
            p("button", {
              disabled: !l.value,
              onClick: D[22] || (D[22] = (U) => le(!1))
            }, "remove", 8, nM)
          ])
        ])) : i.value.chords.length > 1 ? (w(), A("section", iM, [
          p("h4", null, [
            ye(F(i.value.chords.length) + " chord symbols ", 1),
            p("span", sM, F(i.value.chords.map((U) => U.name).join(" ")), 1)
          ]),
          p("div", oM, [
            D[51] || (D[51] = p("span", { class: "name" }, "pitch", -1)),
            p("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: D[23] || (D[23] = (U) => R(V(Ni)([], -1, i.value.chords)))
            }, "−1", 8, rM),
            p("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: D[24] || (D[24] = (U) => R(V(Ni)([], 1, i.value.chords)))
            }, "+1", 8, lM)
          ]),
          p("div", aM, [
            p("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: D[25] || (D[25] = (U) => le(!1))
            }, "remove", 8, uM)
          ])
        ])) : Q("", !0),
        r.value ? (w(), A("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          p("h4", null, [
            ye(" Bar " + F(r.value.n) + " ", 1),
            p("span", hM, F(r.value.meter) + " · " + F(r.value.key), 1)
          ]),
          p("div", fM, [
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: D[26] || (D[26] = (U) => R(V(Ed)(r.value, "before")))
            }, "+ before", 8, dM),
            p("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: D[27] || (D[27] = (U) => R(V(Ed)(r.value, "after")))
            }, "+ after", 8, pM),
            p("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: D[28] || (D[28] = (U) => R(V(f2)(r.value)))
            }, "duplicate", 8, gM),
            p("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: D[29] || (D[29] = (U) => R(V(d2)(t.value, r.value)))
            }, "delete", 8, mM)
          ]),
          p("div", vM, [
            D[52] || (D[52] = p("span", { class: "name" }, "meter", -1)),
            Ue(p("input", {
              "onUpdate:modelValue": D[30] || (D[30] = (U) => O.value = U),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: D[31] || (D[31] = $t(ct((U) => R(V(Bd)(r.value, O.value)), ["prevent"]), ["enter"])),
              onChange: D[32] || (D[32] = (U) => R(V(Bd)(r.value, O.value)))
            }, null, 40, yM), [
              [Nt, O.value]
            ]),
            p("datalist", bM, [
              (w(!0), A(ve, null, Ie(V(e2), (U) => (w(), A("option", {
                key: U,
                value: U
              }, null, 8, xM))), 128))
            ])
          ]),
          p("div", wM, [
            D[53] || (D[53] = p("span", { class: "name" }, "key", -1)),
            Ue(p("select", {
              "onUpdate:modelValue": D[33] || (D[33] = (U) => L.value = U),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: D[34] || (D[34] = (U) => R(V(p2)(r.value, L.value)))
            }, [
              (w(!0), A(ve, null, Ie(V(Dv), (U) => (w(), A("option", {
                key: U,
                value: U
              }, F(U), 9, SM))), 128))
            ], 40, kM), [
              [ts, L.value]
            ]),
            u.value ? (w(), A("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: D[35] || (D[35] = (U) => R(V(g2)(t.value, r.value)))
            }, "remove change", 8, CM)) : Q("", !0)
          ])
        ], 8, cM)) : Q("", !0),
        !i.value.notes.length && !o.value && !r.value ? (w(), A("p", MM, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : Q("", !0),
        E.value ? (w(), A("p", AM, F(E.value), 1)) : Q("", !0)
      ], 64)) : (w(), A("p", y2, F(n.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), $M = { class: "keys-help" }, DM = ["aria-expanded"], OM = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, LM = /* @__PURE__ */ Qt({
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
    return (i, s) => (w(), A("span", $M, [
      p("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, DM),
      e.value ? (w(), A("div", OM, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (w(), A(ve, null, Ie(t, (o) => p("section", {
          key: o.title
        }, [
          p("h5", null, F(o.title), 1),
          p("table", null, [
            (w(!0), A(ve, null, Ie(o.rows, ([r, l]) => (w(), A("tr", { key: r }, [
              p("th", null, F(r), 1),
              p("td", null, F(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : Q("", !0)
    ]));
  }
}), EM = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], dc = [4, 8, 16, 32, 64];
function BM(n) {
  return n.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function IM(n) {
  const e = {};
  for (const t of n) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function RM(n) {
  const e = n?.model?.unit ?? n?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), i = Number.isFinite(t) && t > 0 ? t : 16, s = dc.filter((o) => o <= i);
  return s.length ? s[s.length - 1] : dc[0];
}
function PM(n) {
  let e = "";
  for (let t = 0; t < n.length; t += 8192)
    e += String.fromCharCode(...n.subarray(t, t + 8192));
  return btoa(e);
}
function _M(n) {
  const e = atob(n), t = new Uint8Array(e.length);
  for (let i = 0; i < e.length; i++) t[i] = e.charCodeAt(i);
  return t;
}
function Qs(n, e, t = "audio/midi") {
  const i = new ArrayBuffer(e.length);
  new Uint8Array(i).set(e);
  const s = URL.createObjectURL(new Blob([i], { type: t })), o = document.createElement("a");
  o.href = s, o.download = n, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function NM(n) {
  const e = n.name.trim() || "unnamed";
  return n.notes === 1 ? `${e} · 1 note` : `${e} · ${n.notes} notes`;
}
function VM(n, e, t, { current: i = 0, keep: s = !0 } = {}) {
  const o = [...n];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && i) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${i} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Id(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
class HM {
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
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Id(t) && Id(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
function eo(n) {
  return n instanceof Zd ? `${n.message}${n.hint ? ` — ${n.hint}` : ""}` : String(n instanceof Error ? n.message : n);
}
function FM(n) {
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
function zM(n, e) {
  const t = /* @__PURE__ */ Us(null), i = /* @__PURE__ */ Us(null), s = /* @__PURE__ */ G(null), o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(!1), l = /* @__PURE__ */ G(null), a = /* @__PURE__ */ G(null), u = /* @__PURE__ */ G([]), c = /* @__PURE__ */ G([]), h = new HM(n.text), f = /* @__PURE__ */ G(0);
  let d = "", g = 0, v, m = !1;
  const x = N(() => t.value && t.value.sha256 && !o.value ? t.value : null), O = N(() => Cs(i.value, c.value[0])), L = N(() => (f.value, h.canUndo)), E = N(() => (f.value, h.canRedo)), R = N(() => (f.value, h.undoLabel)), z = N(() => (f.value, h.redoLabel)), P = N(
    () => FM({
      text: n.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), q = N(
    () => s.value !== null && s.value !== n.text && !!t.value && !t.value.ok
  );
  function K(be, Re) {
    if (t.value = be, a.value = null, be.ok) {
      i.value = be, s.value = Re;
      const se = S1(be);
      c.value = c.value.filter((Z) => se.has(Z));
    }
  }
  async function le() {
    const be = n.text, Re = ++g;
    if (d = be, !be.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const se = await ny(e.fetcher, be, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (Re !== g || d !== be || n.text !== be) return;
      K(se, be), l.value = null;
    } catch (se) {
      n.text === be && (l.value = eo(se), a.value = l.value);
    } finally {
      n.text === be && (o.value = !1);
    }
  }
  function j(be = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(v), v = setTimeout(() => {
      le();
    }, be);
  }
  function D(be, Re, se, Z) {
    be !== n.text && (m = !0, n.text = be, m = !1, h.record(be, Re, { group: se, extra: Z }), f.value++, e.onEdit?.());
  }
  function U(be) {
    D(be, "typing", "typing"), j();
  }
  function ke(be, Re, se = null, Z) {
    return be === n.text ? !1 : (h.seal(), Z && h.annotate(Z.before), D(be, Re, void 0, Z?.after), h.seal(), clearTimeout(v), d = be, o.value = !1, u.value = [], se && se.ok && (se.lyrics || !e.lyrics?.()) ? (K(se, be), l.value = null) : j(0), !0);
  }
  async function Te(be) {
    const Re = n.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++g;
      const se = await iy(e.fetcher, Re, be, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (n.text !== Re)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const Z = e.onTransform?.(se, be);
      return h.seal(), Z && h.annotate(Z.before), D(se.abc, se.changes[0] ?? be.op, void 0, Z?.after), h.seal(), clearTimeout(v), o.value = !1, d = se.abc, K(se.analysis, se.abc), u.value = [...se.changes, ...se.warnings.map((te) => `warning: ${te}`)], se.select.length && (c.value = C1(se.analysis, se.select)), !0;
    } catch (se) {
      return l.value = eo(se), !1;
    } finally {
      r.value = !1;
    }
  }
  function ue(be) {
    be && (m = !0, n.text = be.text, m = !1, be.extra !== void 0 && e.onRestore?.(be.extra), f.value++, e.onEdit?.(), u.value = [], j(0));
  }
  const pe = () => ue(h.undo()), ze = () => ue(h.redo());
  function Be() {
    const be = s.value;
    return be === null || be === n.text || !i.value ? !1 : (h.seal(), D(be, "revert to the last valid score"), h.seal(), clearTimeout(v), d = be, o.value = !1, t.value = i.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function Pe(be) {
    c.value = be;
  }
  function Ee(be, Re, se) {
    h.seal(), h.annotate(Re), h.record(n.text, be, { extra: se, side: !0 }), h.seal(), f.value++;
  }
  function X() {
    r.value ? setTimeout(X, 60) : n.text.trim() && !o.value && le();
  }
  Ye(
    () => n.text,
    (be) => {
      m || (h.seal(), h.record(be, "document replaced"), h.seal(), f.value++, j(0));
    },
    { flush: "sync" }
  );
  function at() {
    clearTimeout(v);
  }
  return j(0), /* @__PURE__ */ xs({
    view: t,
    lastValid: i,
    lastValidText: s,
    current: x,
    pending: o,
    busy: r,
    error: l,
    notes: u,
    selection: c,
    primary: O,
    canUndo: L,
    canRedo: E,
    undoLabel: R,
    redoLabel: z,
    commitBlock: P,
    canRevert: q,
    typed: U,
    replaceText: ke,
    operate: Te,
    undo: pe,
    redo: ze,
    revertToLastValid: Be,
    select: Pe,
    analyze: le,
    refreshLyrics: X,
    recordSide: Ee,
    dispose: at
  });
}
const WM = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, KM = { class: "facts" }, UM = { class: "body" }, jM = {
  key: 0,
  class: "hint"
}, GM = {
  key: 1,
  class: "error",
  role: "alert"
}, qM = { class: "tracks" }, YM = { class: "number" }, XM = ["onUpdate:modelValue", "aria-label"], JM = ["value", "title"], ZM = {
  key: 0,
  class: "hint"
}, QM = { class: "controls" }, eA = { title: "Foreign timing is quantised to this note value" }, tA = ["value"], nA = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, iA = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, sA = { class: "report" }, oA = { key: 0 }, rA = ["disabled"], lA = /* @__PURE__ */ Qt({
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
    const t = n, i = e, s = /* @__PURE__ */ G(!1), o = /* @__PURE__ */ G(null), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(RM(t.view)), u = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(t.keepsGuide), h = N(() => l.value.filter((x) => x.notes > 0)), f = N(() => l.value.filter((x) => x.notes === 0)), d = N(
      () => r.value ? VM(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let g = 0;
    async function v(x) {
      const O = ++g;
      s.value = !0, o.value = null;
      try {
        const L = await sy(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: x ? IM(l.value) : void 0
        });
        if (O !== g) return;
        r.value = L, x || (l.value = BM(L.tracks));
      } catch (L) {
        O === g && (o.value = eo(L));
      } finally {
        O === g && (s.value = !1);
      }
    }
    function m() {
      v(!0);
    }
    return vr(() => {
      v(!1);
    }), (x, O) => (w(), A("div", {
      class: "plenio-overlay",
      onMousedown: O[9] || (O[9] = ct((L) => i("close"), ["self"]))
    }, [
      p("div", WM, [
        p("header", null, [
          O[10] || (O[10] = p("h2", null, "Import MIDI", -1)),
          p("span", KM, F(n.filename), 1),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: O[0] || (O[0] = (L) => i("close"))
          }, "×")
        ]),
        p("div", UM, [
          s.value ? (w(), A("p", jM, "Reading the file…")) : Q("", !0),
          o.value ? (w(), A("p", GM, F(o.value), 1)) : Q("", !0),
          r.value && !o.value ? (w(), A(ve, { key: 2 }, [
            p("table", qM, [
              O[11] || (O[11] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Track"),
                  p("th", null, "Role")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), A(ve, null, Ie(h.value, (L) => (w(), A("tr", {
                  key: L.index
                }, [
                  p("td", null, [
                    p("span", YM, F(L.number), 1),
                    ye(" " + F(V(NM)(L)), 1)
                  ]),
                  p("td", null, [
                    Ue(p("select", {
                      "onUpdate:modelValue": (E) => L.role = E,
                      "aria-label": `Role of track ${L.number}`,
                      onChange: O[1] || (O[1] = (E) => m())
                    }, [
                      (w(!0), A(ve, null, Ie(V(EM), (E) => (w(), A("option", {
                        key: E.value,
                        value: E.value,
                        title: E.title
                      }, F(E.label), 9, JM))), 128))
                    ], 40, XM), [
                      [ts, L.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            f.value.length ? (w(), A("p", ZM, " Empty track(s) not shown: " + F(f.value.map((L) => L.number).join(", ")) + ". ", 1)) : Q("", !0),
            p("p", QM, [
              p("label", eA, [
                O[12] || (O[12] = ye(" grid ", -1)),
                Ue(p("select", {
                  "onUpdate:modelValue": O[2] || (O[2] = (L) => a.value = L),
                  "aria-label": "Import grid",
                  onChange: O[3] || (O[3] = (L) => m())
                }, [
                  (w(!0), A(ve, null, Ie(V(dc), (L) => (w(), A("option", {
                    key: L,
                    value: L
                  }, "1/" + F(L), 9, tA))), 128))
                ], 544), [
                  [
                    ts,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              p("label", nA, [
                Ue(p("input", {
                  "onUpdate:modelValue": O[4] || (O[4] = (L) => u.value = L),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: O[5] || (O[5] = (L) => m())
                }, null, 544), [
                  [cn, u.value]
                ]),
                O[13] || (O[13] = ye(" read chords from the notes ", -1))
              ]),
              n.keepsGuide && r.value.guide.length ? (w(), A("label", iA, [
                Ue(p("input", {
                  "onUpdate:modelValue": O[6] || (O[6] = (L) => c.value = L),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [cn, c.value]
                ]),
                O[14] || (O[14] = ye(" keep the Guide notes ", -1))
              ])) : Q("", !0)
            ]),
            O[15] || (O[15] = p("h3", null, "What the import did", -1)),
            p("ul", sA, [
              (w(!0), A(ve, null, Ie(d.value, (L, E) => (w(), A("li", { key: E }, F(L), 1))), 128)),
              d.value.length ? Q("", !0) : (w(), A("li", oA, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : Q("", !0)
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
          }, " Insert ", 8, rA)
        ])
      ])
    ], 32));
  }
}), aA = {
  key: 0,
  class: "stale-note",
  role: "status"
}, uA = {
  key: 1,
  class: "error"
}, cA = /* @__PURE__ */ Qt({
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
      for (const R of E)
        for (const z of R.staff ?? [])
          for (const P of z.voices ?? [])
            for (const q of P)
              q.el_type === "note" && typeof q.endChar == "number" && q.abselem?.elemset && L.set(q.endChar, q.abselem.elemset);
      return L;
    }
    function d(O) {
      const L = Cs(i.view, O);
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
        const R = Fy.renderAbc(O, L, {
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
            const q = M1(i.view, P.startChar, P.endChar);
            q && s("select", q.id, u);
          }
        });
        l = f(R[0]), a = { "plenio-selected": [], "plenio-playing": [] }, g("plenio-selected", i.selection), g("plenio-playing", i.playing), r.value = null;
      } catch (E) {
        r.value = `The notation could not be drawn: ${E instanceof Error ? E.message : String(E)}`;
      }
    }
    function m(O) {
      const [L] = d(O), E = o.value?.parentElement;
      if (!L || !E) return;
      const R = E.getBoundingClientRect(), z = L.getBoundingClientRect();
      z.top < R.top ? E.scrollTop += z.top - R.top - 8 : z.bottom > R.bottom && (E.scrollTop += z.bottom - R.bottom + 8), z.left < R.left ? E.scrollLeft += z.left - R.left - 8 : z.right > R.right && (E.scrollLeft += z.right - R.right + 8);
    }
    e({ reveal: m }), Ye(() => [i.view?.display_abc, i.zoom], () => In(v)), Ye(
      () => i.selection,
      (O) => {
        g("plenio-selected", O), O[0] && m(O[0]);
      }
    ), Ye(
      () => i.playing,
      (O) => {
        g("plenio-playing", O), O[0] && m(O[0]);
      }
    ), vr(() => {
      v(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - h) > 40 && v();
      }), o.value && c.observe(o.value);
    }), Di(() => c?.disconnect());
    function x(O) {
      u = O.shiftKey || O.ctrlKey || O.metaKey;
    }
    return (O, L) => (w(), A("div", {
      class: Xe(["notation-wrap", { stale: n.stale }])
    }, [
      n.stale ? (w(), A("p", aA, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : Q("", !0),
      r.value ? (w(), A("p", uA, F(r.value), 1)) : Q("", !0),
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
function qo(n, e) {
  let t = 1;
  for (const i of n.measures) {
    if (i.onset > e) break;
    t = i.n;
  }
  return t;
}
function Rd(n, e) {
  return n.measures[Math.max(0, Math.min(n.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Pd(n, e, t) {
  const i = e > 0 ? Math.round(n / e) * e : Math.round(n);
  return Math.max(0, Math.min(t, i));
}
function lh(n, e) {
  const t = n.model;
  if (!t) return 0;
  const i = qo(t, e), s = t.measures[i - 1], o = n.bars[i - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function ah(n, e) {
  const t = n.model;
  if (!t || !n.bars.length || !t.measures.length) return null;
  let i = 0;
  for (let l = 0; l < n.bars.length && !(n.bars[l].start_s > e + tl); l++)
    i = l;
  const s = n.bars[i], o = t.measures[Math.min(i, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function Bv(n, e) {
  const t = qo(n, e), i = n.measures[t - 1];
  if (!i) return "1.1.1";
  const s = Number(i.meter.split("/")[0]) || 1, o = i.length / s, r = Math.max(0, e - i.onset), l = Math.min(s - 1, Math.floor(r / o)), a = n.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const hA = 0.25, fA = 30, cu = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, hu = 6e-3;
class dA {
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
  sounds = oy();
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
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), fA), this.tick();
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
    for (; this.next < this.events.length && this.events[this.next].at < t + hA; )
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
        u = gl(t, o, this.sounds[e.part], e.midi, i, { level: cu[e.part] });
      } catch {
        try {
          u = gl(t, o, "plain", e.midi, i, { level: cu[e.part] });
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
    r.type = "square", r.frequency.value = ry(e.midi);
    const l = t.createGain(), a = cu.click;
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
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + hu), o.gain.setValueAtTime(1, Math.max(r + hu, l - hu)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class pA {
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
        s.resume(), this.off(e), this.tones.set(e, gl(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
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
let _d = null;
function pc(n, e = 0.35, t = "soft") {
  const i = window.AudioContext ?? window.webkitAudioContext;
  if (i)
    try {
      _d ??= new i();
      const s = _d;
      s.resume();
      const o = s.currentTime + 0.01;
      gl(s, s.destination, t, n, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
const gA = 200, _s = /* @__PURE__ */ new Map(), mA = 2;
function vA(n, e) {
  if (n.numberOfChannels === 1) return n;
  const t = new e(1, 1, n.sampleRate).createBuffer(1, n.length, n.sampleRate), i = t.getChannelData(0);
  for (let s = 0; s < n.numberOfChannels; s++) {
    const o = n.getChannelData(s);
    for (let r = 0; r < o.length; r++) i[r] += o[r] / n.numberOfChannels;
  }
  return t;
}
function yA(n, e, t = gA) {
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
function bA(n, e = xA) {
  let t = _s.get(n);
  if (!t) {
    for (t = (async () => {
      const i = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!i) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(n), o = await new i(1, 1, 48e3).decodeAudioData(s), r = vA(o, i);
      return { buffer: r, envelope: yA(r.getChannelData(0), r.sampleRate) };
    })(), _s.set(n, t); _s.size > mA; ) _s.delete(_s.keys().next().value);
    t.catch(() => _s.delete(n));
  }
  return t;
}
async function xA(n) {
  const e = await fetch(n);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function wA(n, e, t, i) {
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
function kA(n) {
  return !n || "problem" in n || !Array.isArray(n.midi) || !(n.rate > 0) ? null : { rate: n.rate, start: n.start ?? 0, midi: n.midi };
}
function SA(n, e) {
  const t = Math.round((e - n.start) * n.rate);
  return t >= 0 && t < n.midi.length ? n.midi[t] : null;
}
function CA(n, e, t) {
  let i = 0;
  for (let r = 0; r < n.measures.length; r++) n.measures[r].onset <= t && (i = r);
  const s = n.measures[i], o = e?.[i];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function MA(n, e, t) {
  const i = [];
  for (const s of n.tracks.vocal) {
    const o = CA(n, e, s.onset + s.duration / 2), r = o === null ? null : SA(t, o);
    r !== null && i.push(s.pitch - r);
  }
  return i.length < 6 ? 0 : (i.sort((s, o) => s - o), 12 * Math.round(i[Math.floor(i.length / 2)] / 12));
}
function AA(n, e, t, i, s, o = 0) {
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
      const m = v >= 0 && v < t.midi.length ? t.midi[v] : null, x = t.start + v * u;
      (m === null || a !== null && Math.abs(x - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = x, m !== null && l.push([h.onset + (x - f[0]) / (f[1] - f[0]) * h.length, m + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const TA = ["aria-label"], $A = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, DA = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, OA = ["aria-pressed"], LA = ["aria-pressed"], EA = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, BA = ["aria-pressed"], IA = ["aria-pressed"], RA = { title: "Grid for drawing, moving and resizing" }, PA = { value: "auto" }, _A = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, NA = ["disabled"], VA = ["disabled"], HA = ["disabled", "title"], FA = ["disabled", "title"], zA = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, WA = ["disabled", "title"], KA = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, UA = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, jA = ["title"], GA = ["disabled"], qA = { title: "The roll pages along with the playback line" }, YA = { class: "hint" }, XA = {
  key: 0,
  class: "roll-note"
}, JA = ["width", "height"], ZA = ["y", "width", "height"], QA = ["x1", "x2", "y1", "y2"], eT = ["x", "y"], tT = ["x", "y"], nT = ["d"], iT = ["x1", "x2", "y1", "y2"], sT = ["x1", "x2", "y1", "y2"], oT = ["transform"], rT = ["y", "width", "height"], lT = ["y"], aT = ["transform"], uT = ["width", "height"], cT = ["x", "width", "height"], hT = ["y", "width", "height"], fT = ["y", "width", "height"], dT = ["x", "y", "width", "height"], pT = ["d"], gT = ["x", "y"], mT = ["y", "width", "height"], vT = ["x", "y", "width", "height"], yT = ["x", "y", "height"], bT = ["x", "y"], xT = ["x1", "x2", "y2"], wT = ["x"], kT = ["x"], ST = ["x", "y", "width", "height"], CT = ["x", "y"], MT = {
  key: 2,
  class: "chord ghost"
}, AT = ["x", "y", "width", "height"], TT = ["x", "y"], $T = ["x", "y", "width", "height"], DT = ["x1", "x2", "y2"], OT = ["transform"], LT = ["y2"], ET = ["onKeydown"], BT = ["onKeydown"], To = 5, Nd = 6.2, IT = 26, RT = /* @__PURE__ */ Qt({
  __name: "PianoRoll",
  props: /* @__PURE__ */ Dn({
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
  emits: /* @__PURE__ */ Dn(["select", "locate", "clipboard", "lyricEdit", "lyricPlace", "lyricDelete"], ["update:lyricSelection", "update:zoom", "update:audition", "update:rowHeight", "update:follow", "update:sungVisible", "update:waveVisible", "update:track"]),
  setup(n, { expose: e, emit: t }) {
    const i = n, s = t, o = Bt(n, "lyricSelection"), r = Bt(n, "zoom"), l = Bt(n, "audition"), a = Bt(n, "rowHeight"), u = Bt(n, "follow"), c = Bt(n, "sungVisible"), h = Bt(n, "waveVisible"), f = N(() => !!i.source && h.value), d = /* @__PURE__ */ G(null), g = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), x = Bt(n, "track"), O = /* @__PURE__ */ G("draw"), L = /* @__PURE__ */ G("auto"), E = /* @__PURE__ */ G(null), R = /* @__PURE__ */ G(null), z = /* @__PURE__ */ G(!1), P = /* @__PURE__ */ G(0), q = /* @__PURE__ */ G(0), K = /* @__PURE__ */ G(0), le = /* @__PURE__ */ G(0);
    let j = !1;
    const D = /* @__PURE__ */ G(null), U = /* @__PURE__ */ G(null), ke = /* @__PURE__ */ G(null);
    let Te = !1;
    const ue = /* @__PURE__ */ G(null);
    let pe = null, ze = null;
    const Be = N(() => i.view?.model ?? null), Pe = N(() => Be.value ? rh(Be.value) : []), Ee = N(() => Be.value?.tracks.chords ?? []), X = N(
      () => Be.value ? _C(Be.value, {
        pxPerQuarter: r.value,
        snap: L.value,
        lyrics: !!i.lyrics,
        source: f.value,
        rowHeight: a.value
      }) : null
    ), at = /* @__PURE__ */ G(null);
    function be(k) {
      l.value && pc(k, 0.35, i.sound);
    }
    const Re = N(() => !i.readonly && !i.stale && !i.busy && !z.value), se = N(() => po(i.view, i.selection)), Z = N(() => dr(i.selection)), te = N(() => po(i.view, i.playing)), Ze = N(() => JC(E.value)), ut = N(() => XC(E.value)), gt = N(() => {
      const k = X.value, T = R.value;
      if (!k || !T) return null;
      const M = $v(T, k, q.value, P.value), ee = new Set(T.keep);
      for (const Le of zC(Pe.value, M, k)) ee.add(Le.id);
      const Y = new Set(T.keepChords);
      for (const Le of WC(Ee.value, T, k, q.value, P.value)) Y.add(Le.id);
      const me = FC(T, q.value);
      return { rect: M, ids: ee, chords: Y, lane: me };
    }), S = N(
      () => O.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), b = N(
      () => i.lyrics && i.lyricsEditable ? " · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V" : ""
    ), $ = N(() => Be.value && i.locator !== null ? Bv(Be.value, i.locator) : "");
    function I(k, T, M) {
      const ee = ue.value;
      return !ee || !ee.delta ? [T, M] : ee.kind === "move" && ee.keys.includes(k) ? [T + ee.delta, M + ee.delta] : ee.key !== k ? [T, M] : ee.kind === "start" ? [Math.min(T + ee.delta, M - 1), M] : ee.kind === "end" ? [T, Math.max(M + ee.delta, T + 1)] : [T, M];
    }
    function _(k) {
      const T = ue.value;
      return T?.delta ? T.kind === "move" ? T.keys.includes(k) : T.key === k : !1;
    }
    const H = N(() => {
      const k = X.value, T = i.lyrics;
      if (!k || !T) return [];
      const M = T.parts.flatMap(
        (Y) => Y.lines.filter((me) => me.text).map((me) => {
          const Le = vl(me.block, me.line), [Qe, Oe] = I(Le, me.start, me.end);
          return { ...me, start: Qe, end: Oe, key: Le };
        })
      ).sort((Y, me) => Y.start - me.start || Y.line - me.line), ee = new Set(o.value);
      return M.map((Y, me) => {
        const Le = st(Y.start, k), Qe = M.slice(me + 1).find((zt) => zt.start > Y.start), Oe = Qe ? st(Qe.start, k) - Le - 2 : 640, Fe = Math.max(16, st(Y.end, k) - Le), ft = Math.max(1, Math.floor((Math.max(Fe, Math.min(Oe, Y.text.length * Nd + 8)) - 8) / Nd)), _t = Y.text.length > ft ? `${Y.text.slice(0, Math.max(1, ft - 1))}…` : Y.text;
        return { ...Y, x: Le, width: Fe, shown: _t, selected: ee.has(Y.key), dragged: _(Y.key) };
      }).filter((Y) => tt(Y.start, Math.max(Y.end, Y.start + 64)));
    });
    function he(k) {
      const T = H.value.filter((Y) => k >= Y.x - To && k <= Y.x + Y.width + To), M = T.find((Y) => k >= Y.x && k <= Y.x + Y.width) ?? T[0];
      if (!M) return null;
      const ee = k >= M.x + M.width - To ? "end" : k <= M.x + To && M.width > 3 * To ? "start" : "move";
      return { key: M.key, start: M.start, end: M.end, part: ee };
    }
    function ie(k) {
      const T = [];
      for (const M of i.lyrics?.parts.flatMap((ee) => ee.lines.map((Y) => ({ ...Y, key: vl(Y.block, Y.line) }))) ?? []) {
        if (!(k.kind === "move" ? k.keys.includes(M.key) : M.key === k.key)) continue;
        const Y = Math.max(M.end, M.start + 1);
        let me = [M.start, Y];
        k.kind === "move" ? me = [M.start + k.delta, Y + k.delta] : k.kind === "start" ? me = [Math.min(M.start + k.delta, Y - 1), Y] : me = [M.start, Math.max(Y + k.delta, M.start + 1)], T.push({ key: M.key, start: Math.max(0, me[0]), end: Math.max(1, me[1]) });
      }
      return T;
    }
    const oe = N(() => {
      const k = /* @__PURE__ */ new Map();
      for (const T of i.lyrics?.parts ?? [])
        for (const M of T.lines) for (const ee of M.syllables) k.set(ee.onset, ee.end_of_word ? ee.text : `${ee.text}-`);
      return k;
    }), J = N(() => {
      const k = X.value;
      return k ? mt.value.map((T) => ({ n: T, rect: ji(T, k) })).filter(({ rect: T }) => T.width >= IT).map(({ n: T, rect: M }) => ({ key: T.id, x: M.x + 2, y: M.y + M.height - 2.5, text: fc(T.pitch) })) : [];
    }), Ce = N(() => {
      const k = X.value;
      return !k || !oe.value.size ? [] : mt.value.filter((T) => T.track === "vocal" && oe.value.has(T.onset)).map((T) => {
        const M = ji(T, k);
        return { key: T.id, x: M.x + 1, y: M.y - 2, text: oe.value.get(T.onset) };
      });
    });
    function fe(k) {
      const M = i.lyrics?.parts.find((Oe) => k >= Oe.start && k < Oe.end);
      if (!M) return null;
      const ee = M.lines.length ? Math.max(...M.lines.map((Oe) => Oe.line)) + 1 : 0, Y = M.lines.find((Oe) => Oe.text && k >= Oe.start && k < Math.max(Oe.end, Oe.start + 1)), me = (Oe) => ({
        block: M.block,
        line: Oe.line,
        text: Oe.text,
        original: Oe.text,
        start: Oe.start
      });
      if (Y) return me(Y);
      const Le = M.phrases.find(([Oe, Fe]) => k >= Oe && k < Fe);
      if (Le && !M.lines.some((Oe) => Oe.syllables.length && Oe.start < Le[1] && Oe.end > Le[0]))
        return me({ line: ee, text: "", start: Le[0] });
      const Qe = [...M.lines].reverse().find((Oe) => Oe.text && Oe.start <= k);
      return me(Qe ?? { line: ee, text: "", start: M.start });
    }
    function Se(k) {
      const T = fe(k);
      T && (Te = !1, ke.value = T, In(() => {
        U.value?.focus(), U.value?.select();
      }));
    }
    function Me() {
      const k = ke.value;
      if (ke.value = null, !k || Te) {
        Te = !1;
        return;
      }
      d.value?.focus({ preventScroll: !0 }), k.text.trim() !== k.original.trim() && s("lyricEdit", { block: k.block, line: k.line, text: k.text.trim(), at: k.start });
    }
    function Ke() {
      Te = !0, ke.value = null, d.value?.focus({ preventScroll: !0 });
    }
    const je = N(() => Be.value ? `1/${Math.round(xa(Be.value) / (X.value?.snap ?? 1))}` : ""), We = N(() => {
      const k = X.value;
      if (!k) return [0, 0];
      const T = K.value || 1e5;
      return [Zn(P.value - 200, k), Zn(P.value + T + 200, k)];
    }), tt = (k, T) => T >= We.value[0] && k <= We.value[1], mt = N(() => Pe.value.filter((k) => tt(k.onset, k.onset + k.duration))), Rt = N(
      () => Ee.value.map((k, T) => ({ chord: k, next: Ee.value[T + 1] })).filter(({ chord: k }) => tt(k.onset, k.onset + 64))
    ), it = N(() => Be.value ? HC(Be.value).filter((k) => tt(k.unit, k.unit)) : []), pn = N(() => {
      const k = X.value;
      return k ? Array.from({ length: k.high - k.low + 1 }, (T, M) => k.high - M) : [];
    }), En = N(() => {
      const k = Be.value;
      return k ? k.sections.filter((T) => !T.implicit).map((T) => ({ label: T.label, unit: k.measures[T.first_bar - 1]?.onset ?? 0 })).filter((T) => tt(T.unit, T.unit + 64)) : [];
    });
    function At(k) {
      const T = v.value?.getBoundingClientRect();
      return [k.clientX - (T?.left ?? 0), k.clientY - (T?.top ?? 0)];
    }
    function Ht(k) {
      return {
        note: !0,
        [k.track]: !0,
        selected: (gt.value?.ids ?? se.value).has(k.id),
        playing: te.value.has(k.id),
        dragged: Ze.value.has(k.id)
      };
    }
    function fi(k) {
      const T = k.track === "vocal" ? "Vocal" : "Ins";
      let M = 1;
      for (const ee of Be.value?.measures ?? []) ee.onset <= k.onset && (M = ee.n);
      return `${T} bar ${M}: ${k.name}, ${k.duration} units`;
    }
    function Tt(k) {
      s("select", k);
    }
    function Ei(k) {
      const T = X.value;
      if (!T || k.button !== 0) return;
      d.value?.focus({ preventScroll: !0 });
      const [M, ee] = At(k), Y = Od(M, ee, Pe.value, Ee.value, T, x.value, q.value, P.value);
      if (Y.area === "keys") {
        l.value && pc(Y.pitch, 0.35, i.sound);
        return;
      }
      if (Y.area === "header" || Y.area === "source") {
        s("locate", Pd(Y.unit, T.snap, T.total)), pe = { x: M, y: ee, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, ln(k);
        return;
      }
      const me = k.shiftKey || k.ctrlKey || k.metaKey;
      if (Y.area === "lyrics") {
        const Fe = he(M);
        if (!Fe) {
          me || (o.value = []);
          return;
        }
        i.selection.length && Tt([]);
        const ft = o.value, _t = ft.includes(Fe.key), zt = me ? _t ? ft.filter((Pi) => Pi !== Fe.key) : [...ft, Fe.key] : _t ? ft : [Fe.key];
        if (zt !== ft && (o.value = zt), i.lyricsEditable && (zt.includes(Fe.key) || Fe.part !== "move")) {
          const Pi = Fe.part === "move" ? [...zt] : [Fe.key];
          pe = { x: M, y: ee, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Fe.part, key: Fe.key, keys: Pi, origin: Zn(M, T), delta: 0 } }, ln(k);
        }
        return;
      }
      o.value.length && !me && (o.value = []);
      let Le = null, Qe = !1, Oe = null;
      if (Y.area === "note") {
        const Fe = se.value.has(Y.note.id);
        let ft;
        if (me) {
          const _t = new Set(se.value);
          Fe ? _t.delete(Y.note.id) : _t.add(Y.note.id), ft = Pe.value.filter((zt) => _t.has(zt.id)), Tt(Zr(ft, Ee.value.filter((zt) => Z.value.has(zt.id))));
        } else Fe ? ft = Pe.value.filter((_t) => se.value.has(_t.id)) : (ft = [Y.note], Tt(Zr(ft)));
        Re.value && ft.some((_t) => _t.id === Y.note.id) && (Le = Y.edge === "end" && ft.length === 1 ? UC(Y.note, Pe.value, T.total) : KC(ft, Y.note, Zn(M, T), Vl(ee, T))), be(Y.note.pitch);
      } else if (Y.area === "chord") {
        if (me) {
          const Fe = new Set(Z.value);
          Fe.has(Y.chord.id) ? Fe.delete(Y.chord.id) : Fe.add(Y.chord.id), Tt([...i.selection.filter((ft) => !ft.startsWith("chord:")), ...Fe]);
        } else Z.value.has(Y.chord.id) || Tt([Y.chord.id]);
        Re.value && (Le = GC(Y.chord, Zn(M, T)));
      } else if ((Y.area === "grid" || Y.area === "lane") && (O.value === "select" || k.shiftKey))
        Oe = me ? { notes: [...se.value], chords: Ee.value.filter((Fe) => Z.value.has(Fe.id)) } : { notes: [], chords: [] }, Qe = !me;
      else if (Y.area === "grid") {
        const Fe = !i.selection.length && !o.value.length;
        Re.value && !me && (Le = jC(x.value, Y.unit, Y.pitch, T), be(Y.pitch)), Qe = !me, pe = { x: M, y: ee, start: Le, started: !1, clear: Qe, keep: Oe, insert: Re.value && !me && Fe }, ln(k);
        return;
      } else
        Qe = !me;
      pe = { x: M, y: ee, start: Le, started: !1, clear: Qe, keep: Oe, from: { scrollTop: q.value, scrollLeft: P.value } }, ln(k);
    }
    function ln(k) {
      try {
        v.value?.setPointerCapture?.(k.pointerId);
      } catch {
      }
    }
    function Bi(k) {
      const T = g.value, M = X.value;
      if (!T || !M) return;
      const ee = T.getBoundingClientRect();
      if (!ee.height) return;
      const Y = M.rowHeight;
      if (k.clientY < ee.top + M.top + 12) T.scrollTop = Math.max(0, T.scrollTop - Y);
      else if (k.clientY > ee.bottom - 16) T.scrollTop = T.scrollTop + Y;
      else return;
      an();
    }
    function as(k) {
      const T = X.value;
      if (!pe || !pe.start && !pe.keep && !pe.ruler && !pe.lyric || !T) return;
      const [M, ee] = At(k);
      if (pe.ruler) {
        s("locate", Pd(Zn(M, T), T.snap, T.total));
        return;
      }
      if (pe.lyric) {
        if (!pe.started && Math.abs(M - pe.x) < $d) return;
        pe.started = !0;
        const Y = Math.round((Zn(M, T) - pe.lyric.origin) / T.snap) * T.snap;
        ue.value = { ...pe.lyric, delta: Y };
        return;
      }
      if (pe.started && Bi(k), !(!pe.started && Math.hypot(M - pe.x, ee - pe.y) < $d)) {
        if (pe.started = !0, pe.keep)
          R.value = {
            x0: pe.x,
            y0: pe.y,
            x1: M,
            y1: ee,
            from: pe.from,
            keep: pe.keep.notes,
            keepChords: pe.keep.chords.map((Y) => Y.id)
          };
        else if (pe.start) {
          const Y = E.value, me = qC(pe.start, Zn(M, T), Vl(ee, T), T, { alt: k.altKey });
          me.kind === "move" && me.semitones !== (Y?.kind === "move" ? Y.semitones : 0) && be(me.anchor.pitch + me.semitones), E.value = me;
        }
      }
    }
    async function yn(k) {
      z.value = !0;
      try {
        await i.operate(k);
      } finally {
        z.value = !1, E.value = null;
      }
    }
    function Ii() {
      const k = pe;
      if (pe = null, !k || k.ruler) return;
      if (k.lyric) {
        const ee = ue.value;
        ue.value = null, k.started && ee?.delta && s("lyricPlace", ie(ee));
        return;
      }
      if (!k.started) {
        if (E.value = null, k.insert && k.start?.kind === "draw" && X.value) {
          const ee = X.value, Y = Math.min(at.value ?? ee.drawLength, ee.total - k.start.start);
          yn({ op: "insert_note", track: k.start.track, onset: k.start.start, duration: Y, pitch: k.start.pitch });
          return;
        }
        k.clear && Tt([]);
        return;
      }
      if (k.keep) {
        const ee = gt.value?.ids ?? /* @__PURE__ */ new Set(), Y = gt.value?.chords ?? new Set(k.keep.chords.map((me) => me.id));
        R.value = null, Tt(Zr(Pe.value.filter((me) => ee.has(me.id)), Ee.value.filter((me) => Y.has(me.id))));
        return;
      }
      const T = E.value, M = T ? YC(T, i.resizeMode) : null;
      if (!M) {
        E.value = null;
        return;
      }
      T?.kind === "draw" ? at.value = T.end - T.start : T?.kind === "resize" && (at.value = T.end - T.note.onset), yn(M);
    }
    function Ge() {
      pe = null, E.value = null, R.value = null, ue.value = null;
    }
    function di(k) {
      const T = X.value;
      if (!T) return;
      const [M, ee] = At(k), Y = Od(M, ee, Pe.value, Ee.value, T, x.value, q.value, P.value);
      if (Y.area === "lyrics") {
        i.lyricsEditable && Se(Y.unit);
        return;
      }
      if (Re.value) {
        if (Y.area === "grid") {
          if (O.value !== "draw") return;
          const me = Math.min(hc(Y.unit, T.snap), T.total - 1), Le = Math.min(T.drawLength, T.total - me);
          yn({ op: "insert_note", track: x.value, onset: me, duration: Le, pitch: Y.pitch });
        } else if (Y.area === "lane" || Y.area === "chord") {
          const me = Y.area === "chord" ? Y.chord : null, Le = Y.area === "chord" ? Y.chord.onset : Math.min(hc(Y.unit, T.snap), T.total - 1);
          D.value = { onset: Le, name: me?.name ?? "", original: me?.name ?? null }, In(() => {
            m.value?.focus(), m.value?.select();
          });
        }
      }
    }
    function vo() {
      const k = D.value;
      if (D.value = null, d.value?.focus({ preventScroll: !0 }), !k) return;
      const T = k.name.trim();
      if (T !== (k.original ?? "")) {
        if (!T) {
          k.original !== null && yn({ op: "delete_chord", onset: k.onset });
          return;
        }
        yn({ op: "put_chord", onset: k.onset, name: T });
      }
    }
    function Ri() {
      D.value = null, d.value?.focus({ preventScroll: !0 });
    }
    function Bs(k) {
      if (k.target?.closest("input, select, textarea")) return;
      const M = X.value;
      if (!M) return;
      if (o.value.length && !k.ctrlKey && !k.metaKey) {
        const Qe = k.key === "ArrowLeft" ? -M.snap : k.key === "ArrowRight" ? M.snap : 0;
        if (k.key === "Delete" || k.key === "Backspace" || Qe || k.key === "Escape") {
          if (k.preventDefault(), k.stopPropagation(), k.key === "Escape") o.value = [];
          else if (i.lyricsEditable) Qe ? s("lyricPlace", ie({ kind: "move", key: "", keys: [...o.value], delta: Qe })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (k.key === "Escape") {
        if (pe || E.value || R.value) Ge();
        else if (i.selection.length) Tt([]);
        else return;
        k.preventDefault(), k.stopPropagation();
        return;
      }
      const ee = k.key.toLowerCase();
      if ((ee === "g" || ee === "h") && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), k.shiftKey ? De(ee === "h" ? 2 : -2) : re(ee === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (ee === "q" && !k.ctrlKey && !k.metaKey && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), Pt(k.shiftKey);
        return;
      }
      if (k.key.toLowerCase() === "a" && (k.ctrlKey || k.metaKey) && !k.altKey) {
        k.preventDefault(), k.stopPropagation(), Tt(Zr(Pe.value, Ee.value));
        return;
      }
      const Y = Pe.value.filter((Qe) => se.value.has(Qe.id)), me = Ee.value.filter((Qe) => Z.value.has(Qe.id)), Le = ZC(
        k.key,
        { shift: k.shiftKey, alt: k.altKey },
        Y,
        me,
        M,
        i.resizeMode
      );
      Le !== void 0 && (k.preventDefault(), k.stopPropagation(), Le && Re.value && yn(Le));
    }
    function an() {
      P.value = g.value?.scrollLeft ?? 0, q.value = g.value?.scrollTop ?? 0, K.value = g.value?.clientWidth ?? 0, le.value = g.value?.clientHeight ?? 0;
    }
    function Bn() {
      const k = X.value, T = g.value;
      j || !k || !T || !T.clientHeight || (j = !0, T.scrollTop = Av(k, T.clientHeight, k.focus[0], k.focus[1]), an());
    }
    function W(k, T = !0) {
      const M = X.value, ee = g.value, Y = Pe.value.find((Qe) => k.has(Qe.id));
      if (!M || !ee || !Y || !ee.clientWidth) return;
      const me = st(Y.onset, M);
      T && (me < ee.scrollLeft + kn || me > ee.scrollLeft + ee.clientWidth - 40) && (ee.scrollLeft = Math.max(0, me - ee.clientWidth / 3));
      const Le = ee.clientHeight ? Dd(M, ee.scrollTop, ee.clientHeight, Y.pitch) : null;
      Le !== null && (ee.scrollTop = Le), an();
    }
    function re(k, T) {
      const M = g.value, ee = X.value, Y = Math.max(12, Math.min(240, Math.round(r.value * k)));
      if (Y === r.value) return;
      if (!M || !ee) {
        r.value = Y;
        return;
      }
      const me = M.getBoundingClientRect(), Le = i.locator !== null ? st(i.locator, ee) - M.scrollLeft : null, Qe = T !== void 0 ? T - me.left : Le !== null && Le >= kn && Le <= M.clientWidth ? Le : M.clientWidth / 2, Oe = Zn(M.scrollLeft + Qe, ee);
      r.value = Y, In(() => {
        const Fe = X.value;
        Fe && (M.scrollLeft = Math.max(0, st(Oe, Fe) - Qe), an());
      });
    }
    function ce(k) {
      const T = k.deltaY || k.deltaX;
      if (k.altKey || (k.ctrlKey || k.metaKey) && k.shiftKey) {
        k.preventDefault(), De(T < 0 ? 1 : -1, k.clientY);
        return;
      }
      !k.ctrlKey && !k.metaKey || (k.preventDefault(), re(T < 0 ? 1.15 : 1 / 1.15, k.clientX));
    }
    function De(k, T) {
      const M = g.value, ee = X.value, Y = Math.max(Cv, Math.min(Mv, a.value + k));
      if (Y === a.value) return;
      if (!M || !ee) {
        a.value = Y;
        return;
      }
      const me = M.getBoundingClientRect(), Le = T !== void 0 ? T - me.top : M.clientHeight / 2, Qe = ee.high - (M.scrollTop + Le - ee.top) / ee.rowHeight;
      a.value = Y, In(() => {
        const Oe = X.value;
        Oe && (M.scrollTop = Math.max(0, Oe.top + (Oe.high - Qe) * Oe.rowHeight - Le), an());
      });
    }
    function Pt(k) {
      const T = X.value;
      if (!T || !Re.value) return;
      const M = se.value.size ? Pe.value.filter((ee) => se.value.has(ee.id)) : Pe.value;
      M.length && yn({ op: "quantize", ids: M.map((ee) => ee.id), grid: T.snap, lengths: k });
    }
    const bn = N(() => {
      const k = i.source?.envelope;
      if (!k) return 1;
      let T = 0;
      for (let M = 0; M < k.max.length; M++) T = Math.max(T, k.max[M], -k.min[M]);
      return T || 1;
    }), yo = N(() => {
      const k = X.value, T = Be.value, M = i.sung;
      if (!k || !T || !M?.curve || !c.value) return [];
      const [ee, Y] = We.value;
      let me = 0, Le = T.measures.length - 1;
      T.measures.forEach((Oe, Fe) => {
        Oe.onset + Oe.length < ee && (me = Fe + 1), Oe.onset <= Y && (Le = Fe);
      });
      const Qe = (Oe) => k.top + (k.high - Oe) * k.rowHeight + k.rowHeight / 2;
      return AA(T, M.bars, M.curve, me, Le, M.offset).map((Oe, Fe) => ({
        key: `c${me}-${Fe}`,
        d: Oe.map(([ft, _t], zt) => `${zt ? "L" : "M"}${st(ft, k).toFixed(1)} ${Qe(_t).toFixed(1)}`).join("")
      }));
    }), Sr = N(() => {
      const k = i.sung?.offset ?? 0;
      if (!k) return "sung";
      const T = Math.abs(k / 12);
      return `sung ${k > 0 ? "+" : "−"}${T > 1 ? T : ""}8va`;
    }), Cr = N(() => {
      const k = i.sung;
      if (!k) return "";
      if (k.problem) return `No sung pitch: ${k.problem}`;
      const T = k.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${T ? ` - drawn ${Math.abs(T / 12)} octave${Math.abs(T) > 12 ? "s" : ""} ${T > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), wa = N(() => {
      const k = X.value, T = Be.value, M = i.source;
      if (!k || !T || !M || k.sourceTop === null) return [];
      const ee = k.sourceTop + Io / 2, Y = (Io / 2 - 3) / bn.value, me = [];
      return T.measures.forEach((Le, Qe) => {
        if (!tt(Le.onset, Le.onset + Le.length)) return;
        const Oe = st(Le.onset, k), Fe = Le.length * k.pxPerUnit, ft = M.bars?.[Qe];
        if (!ft) {
          me.push({ key: `w${Qe}`, d: "", missing: !0, x: Oe, width: Fe });
          return;
        }
        const _t = Math.max(1, Math.floor(Fe / 2)), zt = [];
        wA(M.envelope, ft[0], ft[1], _t).forEach(([Pi, pi], Lt) => {
          const _i = (Oe + (Lt + 0.5) * (Fe / _t)).toFixed(1);
          zt.push(`M${_i} ${(ee - pi * Y - 0.5).toFixed(1)}V${(ee - Pi * Y + 0.5).toFixed(1)}`);
        }), me.push({ key: `w${Qe}`, d: zt.join(""), missing: !1, x: Oe, width: Fe });
      }), me;
    });
    function us(k) {
      const T = X.value, M = g.value;
      if (k === null || !T || !M || !M.clientWidth) return;
      const ee = st(k, T);
      ee >= M.scrollLeft + kn && ee <= M.scrollLeft + M.clientWidth - 24 || (M.scrollLeft = Math.max(0, ee - kn - 24), an());
    }
    return Ye(se, (k) => W(k)), Ye(te, (k) => {
      i.recorded && i.playhead !== null || (u.value || i.playhead === null) && W(k, i.playhead === null);
    }), Ye(
      () => i.playhead,
      (k) => {
        u.value && us(k);
      }
    ), Ye(() => i.locator, us), Ye(
      () => i.recorded?.notes.at(-1)?.pitch,
      (k) => {
        const T = X.value, M = g.value;
        if (k === void 0 || !T || !M?.clientHeight) return;
        const ee = Dd(T, M.scrollTop, M.clientHeight, k);
        ee !== null && (M.scrollTop = ee, an());
      }
    ), Ye(
      () => !!Be.value,
      (k) => {
        k ? In(Bn) : j = !1;
      }
    ), vr(() => {
      an(), Bn(), g.value && typeof ResizeObserver < "u" && (ze = new ResizeObserver(() => {
        an(), Bn();
      }), ze.observe(g.value));
    }), Di(() => ze?.disconnect()), e({ zoomBy: re, zoomRows: De }), (k, T) => (w(), A("div", {
      ref_key: "root",
      ref: d,
      class: Xe(["roll", { stale: n.stale, readonly: n.readonly, [`mode-${O.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": O.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: Bs
    }, [
      p("div", $A, [
        p("span", DA, [
          p("button", {
            class: Xe(["mode draw", { active: O.value === "draw" }]),
            "aria-pressed": O.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: T[0] || (T[0] = (M) => O.value = "draw")
          }, [...T[20] || (T[20] = [
            p("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              p("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            ye(" Draw ", -1)
          ])], 10, OA),
          p("button", {
            class: Xe(["mode select", { active: O.value === "select" }]),
            "aria-pressed": O.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: T[1] || (T[1] = (M) => O.value = "select")
          }, [...T[21] || (T[21] = [
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
          ])], 10, LA)
        ]),
        p("span", EA, [
          T[22] || (T[22] = ye(" draw into ", -1)),
          p("button", {
            class: Xe([{ active: x.value === "vocal" }, "vocal"]),
            "aria-pressed": x.value === "vocal",
            onClick: T[2] || (T[2] = (M) => x.value = "vocal")
          }, " Vocal ", 10, BA),
          p("button", {
            class: Xe([{ active: x.value === "ins" }, "ins"]),
            "aria-pressed": x.value === "ins",
            onClick: T[3] || (T[3] = (M) => x.value = "ins")
          }, " Ins ", 10, IA)
        ]),
        p("label", RA, [
          T[27] || (T[27] = ye(" snap ", -1)),
          Ue(p("select", {
            "onUpdate:modelValue": T[4] || (T[4] = (M) => L.value = M),
            "aria-label": "Snap"
          }, [
            p("option", PA, "auto (" + F(L.value === "auto" ? je.value : "score") + ")", 1),
            T[23] || (T[23] = p("option", { value: 4 }, "1/4", -1)),
            T[24] || (T[24] = p("option", { value: 8 }, "1/8", -1)),
            T[25] || (T[25] = p("option", { value: 16 }, "1/16", -1)),
            T[26] || (T[26] = p("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [ts, L.value]
          ])
        ]),
        p("span", _A, [
          p("button", {
            disabled: !n.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: T[5] || (T[5] = (M) => s("clipboard", "copy"))
          }, " Copy ", 8, NA),
          p("button", {
            disabled: !n.selection.length || !Re.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: T[6] || (T[6] = (M) => s("clipboard", "cut"))
          }, " Cut ", 8, VA),
          p("button", {
            disabled: !n.clip || !Re.value || n.locator === null,
            title: n.clip ? `Paste ${n.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: T[7] || (T[7] = (M) => s("clipboard", "paste"))
          }, " Paste ", 8, HA),
          p("button", {
            disabled: !n.clip || !Re.value || n.locator === null,
            title: n.clip ? `Insert ${n.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: T[8] || (T[8] = (M) => s("clipboard", "insert"))
          }, " Insert ", 8, FA)
        ]),
        p("label", zA, [
          Ue(p("input", {
            "onUpdate:modelValue": T[9] || (T[9] = (M) => l.value = M),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [cn, l.value]
          ]),
          T[28] || (T[28] = ye(" hear ", -1))
        ]),
        p("button", {
          disabled: !Re.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${je.value}); Shift+Q: their lengths too`,
          onClick: T[10] || (T[10] = (M) => Pt(!1))
        }, " Q ", 8, WA),
        p("span", KA, [
          p("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: T[11] || (T[11] = (M) => re(1 / 1.25))
          }, "−"),
          p("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: T[12] || (T[12] = (M) => re(1.25))
          }, "+"),
          p("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: T[13] || (T[13] = (M) => De(-2))
          }, "↕−"),
          p("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: T[14] || (T[14] = (M) => De(2))
          }, "↕+")
        ]),
        n.source ? (w(), A("label", UA, [
          Ue(p("input", {
            "onUpdate:modelValue": T[15] || (T[15] = (M) => h.value = M),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [cn, h.value]
          ]),
          T[29] || (T[29] = ye(" wave ", -1))
        ])) : Q("", !0),
        n.sung ? (w(), A("label", {
          key: 1,
          title: Cr.value,
          class: Xe({ unavailable: !!n.sung.problem })
        }, [
          Ue(p("input", {
            "onUpdate:modelValue": T[16] || (T[16] = (M) => c.value = M),
            type: "checkbox",
            disabled: !!n.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, GA), [
            [cn, c.value]
          ]),
          ye(" " + F(Sr.value), 1)
        ], 10, jA)) : Q("", !0),
        p("label", qA, [
          Ue(p("input", {
            "onUpdate:modelValue": T[17] || (T[17] = (M) => u.value = M),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [cn, u.value]
          ]),
          T[30] || (T[30] = ye(" follow ", -1))
        ]),
        p("span", YA, F(S.value) + F(b.value), 1)
      ]),
      !Be.value && n.view?.model_error ? (w(), A("p", XA, F(n.view.model_error.message), 1)) : Be.value && X.value ? (w(), A("div", {
        key: 1,
        ref_key: "scroller",
        ref: g,
        class: "roll-scroll",
        style: Si({ height: `${Math.min(n.height, X.value.height + 16)}px` }),
        onScroll: an,
        onWheel: ce
      }, [
        (w(), A("svg", {
          ref_key: "svg",
          ref: v,
          class: "roll-svg",
          width: X.value.width,
          height: X.value.height,
          onPointerdown: Ei,
          onPointermove: as,
          onPointerup: Ii,
          onPointercancel: Ge,
          onDblclick: di
        }, [
          (w(!0), A(ve, null, Ie(pn.value, (M) => (w(), A("rect", {
            key: "row" + M,
            class: Xe(["row", { black: V(NC)(M), c: M % 12 === 0 }]),
            x: 0,
            y: V(fo)(M, X.value),
            width: X.value.width,
            height: X.value.rowHeight
          }, null, 10, ZA))), 128)),
          (w(!0), A(ve, null, Ie(it.value, (M) => (w(), A("line", {
            key: "l" + M.unit,
            class: Xe(M.kind),
            x1: V(st)(M.unit, X.value),
            x2: V(st)(M.unit, X.value),
            y1: X.value.top,
            y2: X.value.height
          }, null, 10, QA))), 128)),
          (w(!0), A(ve, null, Ie(mt.value, (M) => (w(), A("rect", Do({
            key: M.id,
            class: Ht(M)
          }, { ref_for: !0 }, V(ji)(M, X.value), { rx: "2" }), [
            p("title", null, F(fi(M)), 1)
          ], 16))), 128)),
          (w(!0), A(ve, null, Ie(J.value, (M) => (w(), A("text", {
            key: "p" + M.key,
            class: "note-name",
            x: M.x,
            y: M.y
          }, F(M.text), 9, eT))), 128)),
          (w(!0), A(ve, null, Ie(Ce.value, (M) => (w(), A("text", {
            key: "y" + M.key,
            class: "syllable",
            x: M.x,
            y: M.y
          }, F(M.text), 9, tT))), 128)),
          (w(!0), A(ve, null, Ie(yo.value, (M) => (w(), A("path", {
            key: M.key,
            class: "sung-pitch",
            d: M.d
          }, null, 8, nT))), 128)),
          n.recorded ? (w(!0), A(ve, { key: 0 }, Ie(n.recorded.notes, (M, ee) => (w(), A("rect", Do({
            key: "rec" + ee,
            class: "rec-note"
          }, { ref_for: !0 }, V(ji)({ onset: M.onset, duration: Math.max(M.duration, 0.5), pitch: M.pitch }, X.value), { rx: "2" }), null, 16))), 128)) : Q("", !0),
          (w(!0), A(ve, null, Ie(ut.value, (M, ee) => (w(), A("rect", Do({
            key: "ghost" + ee,
            class: ["ghost", M.track]
          }, { ref_for: !0 }, V(ji)(M, X.value), { rx: "2" }), null, 16))), 128)),
          gt.value && gt.value.rect.height > 0 ? (w(), A("rect", Do({
            key: 1,
            class: "band"
          }, gt.value.rect), null, 16)) : Q("", !0),
          n.locator !== null ? (w(), A("line", {
            key: 2,
            class: "locator",
            x1: V(st)(n.locator, X.value),
            x2: V(st)(n.locator, X.value),
            y1: X.value.top,
            y2: X.value.height
          }, null, 8, iT)) : Q("", !0),
          n.playhead !== null ? (w(), A("line", {
            key: 3,
            class: "playhead",
            x1: V(st)(n.playhead, X.value),
            x2: V(st)(n.playhead, X.value),
            y1: X.value.top,
            y2: X.value.height
          }, null, 8, sT)) : Q("", !0),
          p("g", {
            class: "keys",
            transform: `translate(${P.value} 0)`
          }, [
            p("rect", {
              class: "keys-bg",
              x: 0,
              y: X.value.top,
              width: V(kn) - 2,
              height: X.value.height - X.value.top
            }, [...T[31] || (T[31] = [
              p("title", null, "Click a key to hear its pitch", -1)
            ])], 8, rT),
            (w(!0), A(ve, null, Ie(pn.value.filter((M) => M % 12 === 0), (M) => (w(), A("text", {
              key: "k" + M,
              class: "key-label",
              x: 4,
              y: V(fo)(M, X.value) + X.value.rowHeight - 2
            }, F(V(VC)(M)), 9, lT))), 128))
          ], 8, oT),
          p("g", {
            class: "roll-top",
            transform: `translate(0 ${q.value})`
          }, [
            p("rect", {
              class: "top-bg",
              x: 0,
              y: 0,
              width: X.value.width,
              height: X.value.top
            }, null, 8, uT),
            p("rect", {
              class: "ruler",
              x: V(kn),
              y: 0,
              width: X.value.width - V(kn),
              height: V(ei)
            }, [...T[32] || (T[32] = [
              p("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, cT),
            p("rect", {
              class: "lane",
              x: 0,
              y: V(ei),
              width: X.value.width,
              height: V(ms)
            }, null, 8, hT),
            n.source && X.value.sourceTop !== null ? (w(), A(ve, { key: 0 }, [
              p("rect", {
                class: "source-lane",
                x: 0,
                y: X.value.sourceTop,
                width: X.value.width,
                height: V(Io)
              }, [...T[33] || (T[33] = [
                p("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, fT),
              (w(!0), A(ve, null, Ie(wa.value, (M) => (w(), A(ve, {
                key: M.key
              }, [
                M.missing ? (w(), A("rect", {
                  key: 0,
                  class: "source-missing",
                  x: M.x,
                  y: X.value.sourceTop + 2,
                  width: M.width,
                  height: V(Io) - 4
                }, [...T[34] || (T[34] = [
                  p("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, dT)) : (w(), A("path", {
                  key: 1,
                  class: "source-wave",
                  d: M.d
                }, null, 8, pT))
              ], 64))), 128)),
              p("text", {
                class: "source-label",
                x: P.value + 3,
                y: X.value.sourceTop + 11
              }, "source", 8, gT)
            ], 64)) : Q("", !0),
            n.lyrics ? (w(), A(ve, { key: 1 }, [
              p("rect", {
                class: "lyrics-lane",
                x: 0,
                y: V(wi),
                width: X.value.width,
                height: V(Bo)
              }, null, 8, mT),
              (w(!0), A(ve, null, Ie(H.value, (M) => (w(), A("g", {
                key: M.key,
                class: Xe(["lyric-line", { unsung: !M.syllables.length, selected: M.selected, dragged: M.dragged }])
              }, [
                p("rect", {
                  x: M.x,
                  y: V(wi) + 3,
                  width: M.width,
                  height: V(Bo) - 6,
                  rx: "3"
                }, null, 8, vT),
                n.lyricsEditable ? (w(), A("rect", {
                  key: 0,
                  class: "edge",
                  x: M.x + M.width - 3,
                  y: V(wi) + 5,
                  width: 3,
                  height: V(Bo) - 10
                }, null, 8, yT)) : Q("", !0),
                p("text", {
                  x: M.x + 4,
                  y: V(wi) + V(Bo) / 2 + 4
                }, F(M.shown), 9, bT),
                p("title", null, F(M.text) + F(n.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : Q("", !0),
            (w(!0), A(ve, null, Ie(it.value.filter((M) => M.kind === "bar"), (M) => (w(), A("line", {
              key: "t" + M.unit,
              class: "bar",
              x1: V(st)(M.unit, X.value),
              x2: V(st)(M.unit, X.value),
              y1: 0,
              y2: X.value.top
            }, null, 8, xT))), 128)),
            (w(!0), A(ve, null, Ie(it.value.filter((M) => M.bar), (M) => (w(), A("text", {
              key: "n" + M.unit,
              class: "bar-number",
              x: V(st)(M.unit, X.value) + 3,
              y: 12
            }, F(M.bar), 9, wT))), 128)),
            (w(!0), A(ve, null, Ie(En.value, (M) => (w(), A("text", {
              key: "s" + M.unit,
              class: "section-label",
              x: V(st)(M.unit, X.value) + 22,
              y: 12
            }, F(M.label), 9, kT))), 128)),
            (w(!0), A(ve, null, Ie(Rt.value, ({ chord: M, next: ee }) => (w(), A("g", {
              key: M.id,
              class: Xe(["chord", {
                selected: (gt.value?.chords ?? Z.value).has(M.id),
                dragged: E.value?.kind === "chord" && E.value.chord.id === M.id
              }])
            }, [
              p("rect", {
                x: V(st)(M.onset, X.value),
                y: V(ei) + 3,
                width: V(Hl)(M, ee, X.value),
                height: V(ms) - 6,
                rx: "3"
              }, null, 8, ST),
              p("text", {
                x: V(st)(M.onset, X.value) + 4,
                y: V(ei) + V(ms) / 2 + 4
              }, F(M.name), 9, CT),
              p("title", null, "chord " + F(M.name) + " - drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            E.value?.kind === "chord" ? (w(), A("g", MT, [
              p("rect", {
                x: V(st)(E.value.to, X.value),
                y: V(ei) + 3,
                width: V(Hl)(E.value.chord, void 0, X.value),
                height: V(ms) - 6,
                rx: "3"
              }, null, 8, AT),
              p("text", {
                x: V(st)(E.value.to, X.value) + 4,
                y: V(ei) + V(ms) / 2 + 4
              }, F(E.value.chord.name), 9, TT)
            ])) : Q("", !0),
            gt.value?.lane && gt.value.rect.width > 0 ? (w(), A("rect", {
              key: 3,
              class: "band",
              x: gt.value.rect.x,
              y: V(ei),
              width: gt.value.rect.width,
              height: V(ms)
            }, null, 8, $T)) : Q("", !0),
            n.playhead !== null ? (w(), A("line", {
              key: 4,
              class: "playhead",
              x1: V(st)(n.playhead, X.value),
              x2: V(st)(n.playhead, X.value),
              y1: 0,
              y2: X.value.top
            }, null, 8, DT)) : Q("", !0),
            n.locator !== null ? (w(), A("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${V(st)(n.locator, X.value)} 0)`
            }, [
              p("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: X.value.top
              }, null, 8, LT),
              T[35] || (T[35] = p("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              p("title", null, "Cursor at " + F($.value) + " - click or drag in the ruler to move it", 1)
            ], 8, OT)) : Q("", !0)
          ], 8, aT)
        ], 40, JA)),
        D.value ? Ue((w(), A("input", {
          key: 0,
          ref_key: "chordInput",
          ref: m,
          "onUpdate:modelValue": T[18] || (T[18] = (M) => D.value.name = M),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: Si({ left: `${V(st)(D.value.onset, X.value)}px`, top: `${V(ei) + 1 + q.value}px` }),
          onKeydown: [
            $t(ct(vo, ["prevent"]), ["enter"]),
            $t(ct(Ri, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Ri
        }, null, 44, ET)), [
          [Nt, D.value.name]
        ]) : Q("", !0),
        ke.value ? Ue((w(), A("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: U,
          "onUpdate:modelValue": T[19] || (T[19] = (M) => ke.value.text = M),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: Si({ left: `${V(st)(ke.value.start, X.value)}px`, top: `${V(wi) + 1 + q.value}px` }),
          onKeydown: [
            $t(ct(Me, ["prevent"]), ["enter"]),
            $t(ct(Ke, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Me
        }, null, 44, BT)), [
          [Nt, ke.value.text]
        ]) : Q("", !0)
      ], 36)) : Q("", !0)
    ], 42, TA));
  }
}), Fl = (n) => [...new Set(n)].sort((e, t) => e - t);
function Vd(n, e, t, i) {
  if (t.range && i !== null) {
    const [s, o] = i <= e ? [i, e] : [e, i], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? Fl([...n, ...r]) : r;
  }
  return t.toggle ? n.includes(e) ? n.filter((s) => s !== e) : Fl([...n, e]) : [e];
}
function Hd(n, e) {
  const t = new Set(e), i = Array.from({ length: n }, (s, o) => o).filter((s) => !t.has(s));
  return !i.length || i.length === n ? null : { order: i.map((s) => s + 1), selection: [] };
}
function Fd(n, e) {
  const t = Fl(e).filter((o) => o >= 0 && o < n);
  if (!t.length) return null;
  const i = t[t.length - 1];
  return { order: [
    ...Array.from({ length: i + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: n - i - 1 }, (o, r) => i + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => i + 1 + r) };
}
function zd(n, e, t) {
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
function Wd(n, e, t, i) {
  const s = Fl(e).filter((a) => a >= 0 && a < n);
  if (!s.length || t < 0 || t > n) return null;
  const o = i ? Array.from({ length: n }, (a, u) => u) : Array.from({ length: n }, (a, u) => u).filter((a) => !s.includes(a)), r = i ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !i && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const zi = /* @__PURE__ */ G(null);
function zl(n) {
  return n.id.startsWith("ins:") ? "ins" : "vocal";
}
function PT(n, e, t = null) {
  const i = [...new Set(e)].sort((u, c) => u - c).filter((u) => n.sections[u]), s = i.map((u) => n.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const h = n.measures[c.first_bar - 1], f = n.measures[c.first_bar - 1 + c.bars - 1], d = h.onset, g = f.onset + f.length;
    for (const m of [...n.tracks.vocal, ...n.tracks.ins]) {
      if (m.onset >= g || m.onset + m.duration <= d) continue;
      const x = Math.max(m.onset, d);
      o.push({ track: zl(m), onset: x - d + a, duration: Math.min(m.onset + m.duration, g) - x, pitch: m.pitch });
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
function _T(n) {
  const e = [...new Set(n)].sort((i, s) => i - s), t = [];
  for (let i = 0; i < e.length; ) {
    let s = i;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > i ? `${e[i]}-${e[s]}` : `${e[i]}`), i = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function NT(n, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => n.measures[r]);
  if (!t.length) return null;
  const i = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = n.measures[r], u = l + a;
    for (const c of [...n.tracks.vocal, ...n.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const h = Math.max(c.onset, l);
      i.push({ track: zl(c), onset: h - l + o, duration: Math.min(c.onset + c.duration, u) - h, pitch: c.pitch });
    }
    for (const c of n.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: n.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: i, chords: s, sections: [], label: _T(t.map((r) => r + 1)) };
}
function Kd(n, e, t) {
  if (!e.length && !t.length) return null;
  const i = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => zl(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: n.unit,
    span: s - i,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: zl(l), onset: l.onset - i, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - i, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function Ud(n) {
  const e = /^1\/(\d+)$/.exec(n.trim());
  return e ? Number(e[1]) : NaN;
}
function VT(n, e) {
  const t = Ud(e) / Ud(n.unit);
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
function HT(n, e) {
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
function jd(n, e, t, i) {
  const s = VT(n, e.unit);
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
const FT = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, zT = { class: "hint" }, WT = ["disabled"], KT = ["disabled"], UT = ["disabled"], jT = ["disabled"], GT = ["disabled"], qT = ["draggable", "aria-selected", "onDragstart", "onDragover"], YT = ["onClick"], XT = ["title"], JT = { key: 0 }, ZT = ["onKeydown", "onBlur"], QT = { class: "facts" }, e$ = {
  key: 0,
  class: "section-tools"
}, t$ = ["onClick"], n$ = ["onClick"], i$ = ["onClick"], s$ = ["onClick"], o$ = {
  key: 1,
  class: "split"
}, r$ = ["disabled"], l$ = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, a$ = { class: "hint" }, u$ = ["disabled"], c$ = ["disabled"], h$ = ["disabled"], f$ = ["disabled"], d$ = ["disabled"], p$ = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], g$ = /* @__PURE__ */ Qt({
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
    const v = /* @__PURE__ */ G("sections"), m = /* @__PURE__ */ G(!1), x = /* @__PURE__ */ G(null), O = N(() => t.view?.sections ?? []), L = N(() => t.view?.bars ?? []), E = N(() => t.view && t.bar ? ku(t.view, t.bar) : -1), R = N(() => new Set(t.errorBars)), z = N(() => !t.readonly && !!t.view?.model && O.value.length > 0);
    Ye(O, (b) => {
      l.value = (u ?? l.value).filter(($) => $ < b.length), u = null;
    }), Ye(L, (b) => {
      f.value = (g ?? f.value).filter(($) => $ < b.length), g = null;
    });
    function P(b, $) {
      s.value = b, o.value = $;
    }
    function q(b) {
      const $ = o.value.trim();
      s.value = null, $ && $ !== O.value[b]?.label && i("operate", { op: "rename_section", section: b + 1, label: $ });
    }
    function K(b, $) {
      const I = O.value[b];
      I && i("operate", { op: "move_section_boundary", section: b + 1, start_bar: I.start_bar + $ });
    }
    function le(b) {
      const $ = t.sourceStarts?.[b - 1];
      return typeof $ == "number" ? rl($) : null;
    }
    function j(b, $) {
      v.value = "sections";
      const I = $.ctrlKey || $.metaKey;
      l.value = Vd(l.value, b, { toggle: I, range: $.shiftKey }, a.value), $.shiftKey || (a.value = b);
      const _ = O.value[b];
      _ && !I && !$.shiftKey && i("goto", _.start_bar);
    }
    function D(b) {
      !b || !z.value || (u = b.selection, i("operate", { op: "arrange_sections", order: b.order }));
    }
    const U = () => D(Fd(O.value.length, l.value)), ke = () => D(Hd(O.value.length, l.value)), Te = (b) => D(zd(O.value.length, l.value, b));
    function ue() {
      const b = t.view?.model;
      if (!b || !l.value.length) return;
      const $ = PT(b, l.value, t.sectionLyrics ?? null);
      $ && (zi.value = $, i("notice", `copied ${$.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function pe(b, $) {
      v.value = "bars";
      const I = $.ctrlKey || $.metaKey;
      f.value = Vd(f.value, b, { toggle: I, range: $.shiftKey }, d.value), $.shiftKey || (d.value = b);
      const _ = L.value[b];
      _ && !I && !$.shiftKey && i("goto", _.index);
    }
    function ze(b) {
      !b || !z.value || (g = b.selection, i("operate", { op: "arrange_measures", order: b.order.map(($) => $ - 1) }));
    }
    const Be = () => ze(Fd(L.value.length, f.value)), Pe = () => ze(Hd(L.value.length, f.value)), Ee = (b) => ze(zd(L.value.length, f.value, b));
    function X() {
      const b = t.view?.model;
      if (!b || !f.value.length) return;
      const $ = NT(b, f.value);
      $ && (zi.value = $, i("notice", `copied ${$.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function at(b) {
      const $ = b.ctrlKey || b.metaKey, I = b.key.toLowerCase();
      if (b.key === "Delete" || b.key === "Backspace") Pe();
      else if ($ && I === "d") Be();
      else if ($ && I === "c") X();
      else if ($ && I === "x" && f.value.length < L.value.length)
        X(), Pe();
      else if ($ && (b.key === "ArrowLeft" || b.key === "ArrowUp")) Ee(-1);
      else if ($ && (b.key === "ArrowRight" || b.key === "ArrowDown")) Ee(1);
      else if ($ && I === "a") f.value = L.value.map((_, H) => H);
      else if (b.key === "Escape" && f.value.length) f.value = [];
      else return !1;
      return !0;
    }
    function be(b, $) {
      z.value && (v.value = "bars", f.value.includes(b) || (f.value = [b]), m.value = !0, $.dataTransfer?.setData("text/plain", "plenio-bars"), $.dataTransfer && ($.dataTransfer.effectAllowed = "copyMove"));
    }
    function Re(b, $) {
      if (!m.value) return;
      $.preventDefault();
      const I = $.currentTarget.getBoundingClientRect();
      x.value = $.clientX < I.left + I.width / 2 ? b : b + 1, $.dataTransfer && ($.dataTransfer.dropEffect = $.altKey || $.ctrlKey ? "copy" : "move");
    }
    function se(b) {
      !m.value || x.value === null || (b.preventDefault(), ze(Wd(L.value.length, f.value, x.value, b.altKey || b.ctrlKey)), Z());
    }
    function Z() {
      m.value = !1, x.value = null;
    }
    function te(b) {
      if (!z.value || b.target?.closest("input, textarea, select")) return;
      if (v.value === "bars") {
        at(b) && (b.preventDefault(), b.stopPropagation());
        return;
      }
      const $ = b.ctrlKey || b.metaKey, I = b.key.toLowerCase();
      let _ = !0;
      b.key === "Delete" || b.key === "Backspace" ? ke() : $ && I === "d" ? U() : $ && I === "c" ? ue() : $ && I === "x" && l.value.length < O.value.length ? (ue(), ke()) : $ && b.key === "ArrowUp" ? Te(-1) : $ && b.key === "ArrowDown" ? Te(1) : $ && I === "a" ? l.value = O.value.map((H, he) => he) : b.key === "Escape" && l.value.length ? l.value = [] : _ = !1, _ && (b.preventDefault(), b.stopPropagation());
    }
    function Ze(b, $) {
      z.value && (l.value.includes(b) || (l.value = [b]), c.value = !0, $.dataTransfer?.setData("text/plain", "plenio-sections"), $.dataTransfer && ($.dataTransfer.effectAllowed = "copyMove"));
    }
    function ut(b, $) {
      if (!c.value) return;
      $.preventDefault();
      const I = $.currentTarget.getBoundingClientRect();
      h.value = $.clientY < I.top + I.height / 2 ? b : b + 1, $.dataTransfer && ($.dataTransfer.dropEffect = $.altKey || $.ctrlKey ? "copy" : "move");
    }
    function gt(b) {
      !c.value || h.value === null || (b.preventDefault(), D(Wd(O.value.length, l.value, h.value, b.altKey || b.ctrlKey)), S());
    }
    function S() {
      c.value = !1, h.value = null;
    }
    return (b, $) => (w(), A("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: te
    }, [
      z.value ? (w(), A("div", FT, [
        p("span", zT, F(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        p("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: U
        }, " Duplicate ", 8, WT),
        p("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: ue
        }, " Copy ", 8, KT),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: $[0] || ($[0] = (I) => Te(-1))
        }, "↑", 8, UT),
        p("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: $[1] || ($[1] = (I) => Te(1))
        }, "↓", 8, jT),
        p("button", {
          disabled: !l.value.length || l.value.length >= O.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: ke
        }, " Delete ", 8, GT)
      ])) : Q("", !0),
      p("ol", {
        class: "sections",
        onDragleave: $[5] || ($[5] = ct((I) => h.value = null, ["self"]))
      }, [
        (w(!0), A(ve, null, Ie(O.value, (I, _) => (w(), A("li", {
          key: _,
          class: Xe({
            current: _ === E.value,
            picked: l.value.includes(_),
            "drop-before": h.value === _,
            "drop-after": h.value === _ + 1 && _ === O.value.length - 1
          }),
          draggable: z.value,
          "aria-selected": l.value.includes(_),
          onDragstart: (H) => Ze(_, H),
          onDragover: (H) => ut(_, H),
          onDrop: gt,
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
              s.value !== _ ? (w(), A("strong", JT, F(I.label), 1)) : Q("", !0)
            ], 8, XT),
            s.value === _ ? Ue((w(), A("input", {
              key: 0,
              "onUpdate:modelValue": $[2] || ($[2] = (H) => o.value = H),
              class: "rename",
              "aria-label": "Section name",
              onClick: $[3] || ($[3] = ct(() => {
              }, ["stop"])),
              onKeydown: [
                $t(ct((H) => q(_), ["prevent"]), ["enter"]),
                $[4] || ($[4] = $t(ct((H) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (H) => q(_)
            }, null, 40, ZT)), [
              [Nt, o.value]
            ]) : Q("", !0),
            p("span", QT, [
              ye(" bars " + F(I.start_bar) + "-" + F(I.start_bar + I.bars - 1) + " · " + F(V(rl)(I.start_s)) + " ", 1),
              le(I.start_bar) ? (w(), A(ve, { key: 0 }, [
                ye(" · source " + F(le(I.start_bar)), 1)
              ], 64)) : Q("", !0)
            ])
          ], 8, YT),
          n.readonly ? Q("", !0) : (w(), A("div", e$, [
            p("button", {
              title: "Rename this section",
              onClick: (H) => P(_, I.label)
            }, "Rename", 8, t$),
            _ > 0 ? (w(), A(ve, { key: 0 }, [
              p("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (H) => K(_, -1)
              }, "◀ bar", 8, n$),
              p("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (H) => K(_, 1)
              }, "bar ▶", 8, i$),
              p("button", {
                title: "Join this section to the one before",
                onClick: (H) => i("operate", { op: "merge_section", section: _ + 1 })
              }, " Join ↑ ", 8, s$)
            ], 64)) : Q("", !0)
          ]))
        ], 42, qT))), 128))
      ], 32),
      !n.readonly && n.bar ? (w(), A("div", o$, [
        p("label", null, [
          ye(" New section at bar " + F(n.bar) + ": ", 1),
          Ue(p("input", {
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
        }, " Split ", 8, r$)
      ])) : Q("", !0),
      z.value ? (w(), A("div", l$, [
        p("span", a$, F(f.value.length ? `${f.value.length} bar${f.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        p("button", {
          disabled: !f.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: Be
        }, " Duplicate ", 8, u$),
        p("button", {
          disabled: !f.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: X
        }, " Copy ", 8, c$),
        p("button", {
          disabled: !f.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: $[8] || ($[8] = (I) => Ee(-1))
        }, "←", 8, h$),
        p("button", {
          disabled: !f.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: $[9] || ($[9] = (I) => Ee(1))
        }, "→", 8, f$),
        p("button", {
          disabled: !f.value.length || f.value.length >= L.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: Pe
        }, " Delete ", 8, d$)
      ])) : Q("", !0),
      p("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: $[10] || ($[10] = ct((I) => x.value = null, ["self"]))
      }, [
        (w(!0), A(ve, null, Ie(L.value, (I, _) => (w(), A("button", {
          key: I.index,
          role: "listitem",
          class: Xe(["bar", {
            selected: I.index === n.bar,
            picked: f.value.includes(_),
            error: R.value.has(I.index),
            alt: n.view ? V(ku)(n.view, I.index) % 2 === 1 : !1,
            "drop-before": x.value === _,
            "drop-after": x.value === _ + 1 && _ === L.value.length - 1
          }]),
          draggable: z.value,
          "aria-selected": f.value.includes(_),
          title: `Bar ${I.index} · ${V(rl)(I.start_s)} · ${I.chords.join(" ") || "no chord"}${z.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (H) => pe(_, H),
          onDragstart: (H) => be(_, H),
          onDragover: (H) => Re(_, H),
          onDrop: se,
          onDragend: Z
        }, F(I.index), 43, p$))), 128))
      ], 32)
    ], 32));
  }
}), m$ = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, v$ = {
  class: "group",
  "aria-label": "History"
}, y$ = ["disabled", "title"], b$ = ["disabled", "title"], x$ = {
  class: "group",
  "aria-label": "Pitch"
}, w$ = ["disabled"], k$ = ["disabled"], S$ = ["disabled"], C$ = ["disabled"], M$ = {
  class: "group",
  "aria-label": "Length"
}, A$ = ["disabled"], T$ = ["disabled"], $$ = ["disabled"], D$ = ["disabled"], O$ = {
  class: "group",
  "aria-label": "Chord"
}, L$ = ["disabled"], E$ = ["disabled"], B$ = ["disabled"], I$ = { class: "group whole" }, R$ = { class: "whole-tools" }, P$ = ["disabled"], _$ = ["disabled"], N$ = ["disabled"], V$ = ["disabled"], H$ = ["disabled"], F$ = ["disabled"], z$ = /* @__PURE__ */ Qt({
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
    const t = n, i = e, s = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(null), r = N(() => t.selection.filter((v) => t.view?.elements?.find((m) => m.id === v)?.kind === "note")), l = N(() => [...dr(t.selection)]), a = N(() => r.value.length > 0 || l.value.length > 0), u = N(() => t.primary?.kind === "note"), c = N(() => t.primary !== null && t.primary.kind !== "note"), h = N(() => {
      const v = t.primary;
      return !v || !t.view ? null : t.view.chords?.find((m) => m.bar === v.bar && Math.abs(m.start_s - v.start_s) < 1e-6) ?? null;
    }), f = N(() => t.primary && u.value ? wu(t.primary.units, 1) : null), d = N(() => t.primary && u.value ? wu(t.primary.units, -1) : null);
    Ye(
      () => t.view?.header?.tempo_bpm,
      (v) => {
        o.value = v ?? null;
      },
      { immediate: !0 }
    ), Ye(h, (v) => {
      s.value = v?.name ?? "";
    });
    function g(v) {
      l.value.length ? i("operate", { op: "set_note_pitch", ids: [...po(t.view, t.selection), ...l.value], semitones: v }) : r.value.length && i("operate", { op: "shift_pitch", ids: r.value, semitones: v });
    }
    return (v, m) => (w(), A("div", m$, [
      p("div", v$, [
        p("button", {
          disabled: !n.canUndo || n.busy,
          title: `Undo${n.undoLabel ? ": " + n.undoLabel : ""} (Ctrl+Z)`,
          onClick: m[0] || (m[0] = (x) => i("undo"))
        }, "↶", 8, y$),
        p("button", {
          disabled: !n.canRedo || n.busy,
          title: `Redo${n.redoLabel ? ": " + n.redoLabel : ""} (Ctrl+Y)`,
          onClick: m[1] || (m[1] = (x) => i("redo"))
        }, "↷", 8, b$)
      ]),
      p("div", x$, [
        p("button", {
          disabled: !a.value || n.busy,
          title: "Octave down (Shift+↓)",
          onClick: m[2] || (m[2] = (x) => g(-12))
        }, "−8va", 8, w$),
        p("button", {
          disabled: !a.value || n.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: m[3] || (m[3] = (x) => g(-1))
        }, "−1", 8, k$),
        p("button", {
          disabled: !a.value || n.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: m[4] || (m[4] = (x) => g(1))
        }, "+1", 8, S$),
        p("button", {
          disabled: !a.value || n.busy,
          title: "Octave up (Shift+↑)",
          onClick: m[5] || (m[5] = (x) => g(12))
        }, "+8va", 8, C$)
      ]),
      p("div", M$, [
        p("button", {
          disabled: !d.value || n.busy,
          title: "Shorter; a rest fills the time ([)",
          onClick: m[6] || (m[6] = (x) => n.primary && d.value && i("operate", { op: "set_duration", id: n.primary.id, units: d.value }))
        }, " shorter ", 8, A$),
        p("button", {
          disabled: !f.value || n.busy,
          title: "Longer, into the rest after the note (])",
          onClick: m[7] || (m[7] = (x) => n.primary && f.value && i("operate", { op: "set_duration", id: n.primary.id, units: f.value }))
        }, " longer ", 8, T$),
        p("button", {
          disabled: !r.value.length || n.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: m[8] || (m[8] = (x) => i("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, $$),
        p("button", {
          disabled: !c.value || n.busy,
          title: "Turn the rest into a note (N)",
          onClick: m[9] || (m[9] = (x) => n.primary && i("operate", { op: "rest_to_note", id: n.primary.id }))
        }, " note ", 8, D$)
      ]),
      p("div", O$, [
        Ue(p("input", {
          "onUpdate:modelValue": m[10] || (m[10] = (x) => s.value = x),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !n.primary || n.busy,
          onKeydown: m[11] || (m[11] = $t(ct((x) => n.primary && s.value.trim() && i("operate", { op: "set_chord", id: n.primary.id, name: s.value }), ["prevent"]), ["enter"]))
        }, null, 40, L$), [
          [Nt, s.value]
        ]),
        p("button", {
          disabled: !n.primary || !s.value.trim() || n.busy,
          title: "Set the chord symbol at the selected note or rest",
          onClick: m[12] || (m[12] = (x) => n.primary && i("operate", { op: "set_chord", id: n.primary.id, name: s.value }))
        }, " set ", 8, E$),
        p("button", {
          disabled: !h.value || n.busy,
          title: "Remove the chord symbol at the selection",
          onClick: m[13] || (m[13] = (x) => h.value && i("operate", { op: "remove_chord", chord: h.value.id }))
        }, " remove ", 8, B$)
      ]),
      p("details", I$, [
        m[22] || (m[22] = p("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        p("div", R$, [
          p("button", {
            disabled: n.busy,
            title: "Transpose everything a semitone down",
            onClick: m[14] || (m[14] = (x) => i("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, P$),
          p("button", {
            disabled: n.busy,
            title: "Transpose everything a semitone up",
            onClick: m[15] || (m[15] = (x) => i("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, _$),
          p("label", null, [
            m[21] || (m[21] = ye(" tempo ", -1)),
            Ue(p("input", {
              "onUpdate:modelValue": m[16] || (m[16] = (x) => o.value = x),
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
            onClick: m[17] || (m[17] = (x) => o.value && i("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, N$),
          p("button", {
            disabled: n.busy || !n.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: m[18] || (m[18] = (x) => i("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, V$),
          p("button", {
            disabled: n.busy,
            title: "Let the instrument play the vocal melody",
            onClick: m[19] || (m[19] = (x) => i("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, H$),
          p("button", {
            disabled: n.busy,
            title: "Replace every Vocal note by rests",
            onClick: m[20] || (m[20] = (x) => i("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, F$)
        ])
      ])
    ]));
  }
}), W$ = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, K$ = ["disabled", "title"], U$ = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, j$ = ["aria-checked", "disabled", "title", "onClick"], G$ = ["disabled"], q$ = ["title"], Y$ = ["disabled"], X$ = { class: "align" }, J$ = ["aria-expanded", "title"], Z$ = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, Q$ = ["title"], eD = ["title"], tD = ["disabled"], nD = {
  key: 0,
  class: "facts"
}, iD = ["title"], sD = { title: "A click on every beat (takes effect at the next start)" }, oD = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, rD = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, lD = ["checked"], aD = { title: "Practice speed; the score's tempo is not changed" }, uD = { class: "facts" }, cD = {
  key: 1,
  class: "error"
}, hD = /* @__PURE__ */ Qt({
  __name: "ScoreTransport",
  props: /* @__PURE__ */ Dn({
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
  emits: /* @__PURE__ */ Dn(["cursor", "time", "stopped"], ["update:voices", "update:speed", "update:metronome", "update:hear", "update:sourceLevel", "update:sourceShift"]),
  setup(n, { expose: e, emit: t }) {
    const i = n, s = Bt(n, "voices"), o = Bt(n, "speed"), r = Bt(n, "metronome"), l = Bt(n, "hear"), a = Bt(n, "sourceLevel"), u = Bt(n, "sourceShift"), c = /* @__PURE__ */ G(!1);
    function h(se) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + se) * 1e3) / 1e3));
    }
    const f = N(() => {
      const se = Math.round(u.value * 1e3);
      return se ? `${Math.abs(se)} ms ${se > 0 ? "later" : "earlier"}` : "in place";
    }), d = t, g = new dA(), v = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1);
    let x = 0, O = null;
    const L = /* @__PURE__ */ G(!1), E = /* @__PURE__ */ G(0), R = /* @__PURE__ */ G(null);
    let z = null;
    const P = N(() => i.bar ?? 1), q = N(() => i.from ?? i.view?.bars[P.value - 1]?.start_s ?? 0), K = N(() => i.position ? `the cursor (${i.position})` : `bar ${P.value}`), le = N(() => !!i.view?.notes), j = N(() => !!i.reference && !!i.source && o.value === 1), D = N(() => i.reference ? i.sourceProblem ? i.sourceProblem : i.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function U() {
      const se = j.value ? l.value : "notes";
      return { tones: se === "source" ? 0 : 1, source: se === "notes" ? 0 : a.value };
    }
    function ke(se) {
      const Z = i.view?.bars ?? [];
      let te = 1;
      for (const Ze of Z) Ze.start_s <= se + tl && (te = Ze.index);
      return te;
    }
    function Te(se) {
      if (i.loopRange) return [i.loopRange.from, i.loopRange.to];
      const Z = i.view;
      if (!Z) return null;
      const te = Z.sections[ku(Z, ke(se))];
      return te ? [te.start_s, te.end_s] : null;
    }
    function ue(se = q.value, Z = null) {
      const te = i.view;
      if (!te) return;
      Pe(), O = Z;
      const Ze = L.value && !Z ? Te(se) : null, ut = Ze && (se < Ze[0] - tl || se >= Ze[1] - tl) ? Ze[0] : se, gt = j.value, S = gt ? ly(te, i.timelineBars) : null, b = { ...s.value };
      Z?.mute && (b[Z.mute] = !1), z = {
        from: ut,
        to: Ze ? Ze[1] : null,
        voices: b,
        speed: o.value,
        metronome: r.value,
        guide: i.guide ?? [],
        clock: S
      };
      const $ = z;
      x = Z ? ze(te, ut, Z.countIn, S) : 0;
      const I = ay(te, $).map((H) => ({ ...H, at: H.at + x }));
      x && I.unshift(...Be(te, ut, Z?.countIn ?? 0, x));
      const _ = gt && S && i.source ? uy(S, ut, $.to).map((H) => ({ ...H, at: H.at + x })) : [];
      try {
        g.play(I, {
          source: _.length && i.source ? { buffer: i.source.buffer, segments: _ } : null,
          levels: U(),
          length: x + fy(te, $),
          sounds: i.sounds,
          onTick: (H) => {
            m.value = H < x, !(H < x) && (E.value = cy($, H - x), d("cursor", hy(te, E.value, $.voices)), d("time", E.value));
          },
          onEnd: () => {
            L.value && v.value && !Z ? ue(Ze?.[0] ?? $.from) : Ee();
          }
        }), v.value = !0, m.value = x > 0, R.value = null;
      } catch (H) {
        R.value = H instanceof Error ? H.message : String(H);
      }
    }
    function pe(se, Z, te) {
      const Ze = se.bars[ke(Z) - 1], ut = Number(Ze?.meter.split("/")[0]) || 4;
      return { beat: (te?.[ke(Z) - 1]?.realDur ?? Ze?.duration_s ?? 2) / ut / mh(o.value), beats: ut };
    }
    function ze(se, Z, te, Ze) {
      if (te <= 0) return 0;
      const { beat: ut, beats: gt } = pe(se, Z, Ze);
      return te * gt * ut;
    }
    function Be(se, Z, te, Ze) {
      const { beat: ut, beats: gt } = pe(se, Z, z?.clock ?? null);
      return dy(se.bars[ke(Z) - 1] ?? null, gt, Z, te, Ze, ut);
    }
    function Pe() {
      g.stop(), v.value = !1, m.value = !1, O = null;
    }
    function Ee() {
      const se = v.value;
      Pe(), d("cursor", []), d("time", null), se && d("stopped");
    }
    function X(se, Z) {
      return ue(se, Z), v.value;
    }
    function at(se) {
      const Z = z;
      if (!Z || !v.value) return null;
      const te = g.elapsedAt(se) - x, Ze = Z.clock?.length ? Z.clock : null, ut = te * mh(Z.speed);
      return Ze ? py(Ze, gy(Ze, Z.from) + ut) : Z.from + ut;
    }
    function be() {
      v.value ? Ee() : ue();
    }
    function Re() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Ye(
      () => i.sounds,
      (se) => {
        se && g.setSounds(se);
      },
      { deep: !0 }
    ), Ye([l, a], () => {
      v.value && g.setLevels(U());
    }), Ye(
      () => i.from,
      (se, Z) => {
        v.value && !O && se !== null && se !== void 0 && se !== Z && ue(se);
      }
    ), e({ toggle: be, stop: Ee, swap: Re, playing: v, record: X, scoreSecondAt: at, countingIn: m }), Di(() => g.close()), (se, Z) => (w(), A("div", W$, [
      p("button", {
        disabled: !le.value,
        title: v.value ? "Stop (Space)" : `Play from ${K.value} (Space)`,
        onClick: be
      }, F(v.value ? "■ stop" : "▶ play"), 9, K$),
      sb(se.$slots, "record", {
        playing: v.value,
        countingIn: m.value
      }),
      n.reference ? (w(), A("span", U$, [
        (w(), A(ve, null, Ie(["both", "notes", "source"], (te) => p("button", {
          key: te,
          role: "radio",
          "aria-checked": l.value === te,
          class: Xe({ active: l.value === te }),
          disabled: !j.value && te !== "notes",
          title: D.value ?? {
            both: "The notes and the source recording together, bar by bar where the transcription puts them",
            notes: "The notes alone (A)",
            source: "The source recording alone (B)"
          }[te],
          onClick: (Ze) => l.value = te
        }, F(te), 11, j$)), 64)),
        p("button", {
          disabled: !j.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: Re
        }, "A/B", 8, G$),
        p("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          Z[14] || (Z[14] = ye(" source ", -1)),
          Ue(p("input", {
            "onUpdate:modelValue": Z[0] || (Z[0] = (te) => a.value = te),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !j.value,
            "aria-label": "Source level"
          }, null, 8, Y$), [
            [
              Nt,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, q$),
        p("span", X$, [
          p("button", {
            class: Xe({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${f.value})`,
            onClick: Z[1] || (Z[1] = (te) => c.value = !c.value)
          }, " ⇆ align" + F(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, J$),
          c.value ? (w(), A("span", Z$, [
            Z[15] || (Z[15] = p("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            p("button", {
              title: `One beat earlier (${Math.round((n.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: Z[2] || (Z[2] = (te) => h(-(n.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, Q$),
            p("button", {
              title: "10 ms earlier",
              onClick: Z[3] || (Z[3] = (te) => h(-0.01))
            }, "◀ 10 ms"),
            p("strong", null, F(f.value), 1),
            p("button", {
              title: "10 ms later",
              onClick: Z[4] || (Z[4] = (te) => h(0.01))
            }, "10 ms ▶"),
            p("button", {
              title: `One beat later (${Math.round((n.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: Z[5] || (Z[5] = (te) => h(n.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, eD),
            p("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: Z[6] || (Z[6] = (te) => u.value = 0)
            }, "reset", 8, tD)
          ])) : Q("", !0)
        ]),
        D.value ? (w(), A("span", nD, F(D.value), 1)) : Q("", !0)
      ])) : Q("", !0),
      p("label", {
        title: n.loopRange ? `Play to the end of the selection (${n.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        Ue(p("input", {
          "onUpdate:modelValue": Z[7] || (Z[7] = (te) => L.value = te),
          type: "checkbox"
        }, null, 512), [
          [cn, L.value]
        ]),
        ye(" loop " + F(n.loopRange ? n.loopRange.label : "section"), 1)
      ], 8, iD),
      p("label", sD, [
        Ue(p("input", {
          "onUpdate:modelValue": Z[8] || (Z[8] = (te) => r.value = te),
          type: "checkbox"
        }, null, 512), [
          [cn, r.value]
        ]),
        Z[16] || (Z[16] = ye(" metronome", -1))
      ]),
      p("span", oD, [
        p("label", null, [
          Ue(p("input", {
            "onUpdate:modelValue": Z[9] || (Z[9] = (te) => s.value.Vocal = te),
            type: "checkbox"
          }, null, 512), [
            [cn, s.value.Vocal]
          ]),
          Z[17] || (Z[17] = ye(" Vocal", -1))
        ]),
        p("label", null, [
          Ue(p("input", {
            "onUpdate:modelValue": Z[10] || (Z[10] = (te) => s.value.Ins = te),
            type: "checkbox"
          }, null, 512), [
            [cn, s.value.Ins]
          ]),
          Z[18] || (Z[18] = ye(" Ins", -1))
        ]),
        p("label", null, [
          Ue(p("input", {
            "onUpdate:modelValue": Z[11] || (Z[11] = (te) => s.value.chords = te),
            type: "checkbox"
          }, null, 512), [
            [cn, s.value.chords]
          ]),
          Z[19] || (Z[19] = ye(" chords", -1))
        ]),
        n.guide?.length ? (w(), A("label", rD, [
          p("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: Z[12] || (Z[12] = (te) => s.value = { ...s.value, guide: te.target.checked })
          }, null, 40, lD),
          Z[20] || (Z[20] = ye(" Guide ", -1))
        ])) : Q("", !0)
      ]),
      p("label", aD, [
        Z[22] || (Z[22] = ye(" speed ", -1)),
        Ue(p("select", {
          "onUpdate:modelValue": Z[13] || (Z[13] = (te) => o.value = te),
          "aria-label": "Playback speed"
        }, [...Z[21] || (Z[21] = [
          p("option", { value: 0.5 }, "50 %", -1),
          p("option", { value: 0.75 }, "75 %", -1),
          p("option", { value: 1 }, "100 %", -1),
          p("option", { value: 1.25 }, "125 %", -1)
        ])], 512), [
          [
            ts,
            o.value,
            void 0,
            { number: !0 }
          ]
        ])
      ]),
      p("span", uD, F(v.value ? `▶ ${V(rl)(E.value)}` : `${n.position ? `cursor ${n.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      R.value ? (w(), A("span", cD, F(R.value), 1)) : Q("", !0)
    ]));
  }
}), fD = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, dD = { class: "track-name" }, pD = { class: "count" }, gD = ["value", "aria-label", "title", "onChange"], mD = ["value", "title"], vD = ["title"], yD = ["checked", "aria-label", "onChange"], bD = {
  key: 0,
  class: "hint"
}, xD = {
  key: 1,
  class: "hint"
}, wD = /* @__PURE__ */ Qt({
  __name: "TrackPanel",
  props: /* @__PURE__ */ Dn({
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
  emits: /* @__PURE__ */ Dn(["clearGuide"], ["update:voices", "update:sounds"]),
  setup(n, { emit: e }) {
    const t = n, i = Bt(n, "voices"), s = Bt(n, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(h, f) {
      const d = o[h];
      s.value && d && (s.value = { ...s.value, [d]: f });
    }
    const l = e, a = N(
      () => t0(t.view, t.guideCount).filter((h) => t.keepsGuide || h.voice !== "guide")
    );
    function u(h) {
      return h === "guide" ? i.value.guide !== !1 : i.value[h] !== !1;
    }
    function c(h, f) {
      h === "guide" ? i.value = { ...i.value, guide: f } : i.value = { ...i.value, [h]: f };
    }
    return (h, f) => (w(), A("div", fD, [
      f[2] || (f[2] = p("h4", null, "Tracks", -1)),
      p("ul", null, [
        (w(!0), A(ve, null, Ie(a.value, (d) => (w(), A("li", {
          key: d.voice,
          class: Xe({ guide: d.voice === "guide", active: d.voice === "guide" && n.guideActive })
        }, [
          p("span", {
            class: "dot",
            style: Si({ background: d.color }),
            "aria-hidden": "true"
          }, null, 4),
          p("span", dD, F(d.name), 1),
          p("span", {
            class: Xe(["destination", { unsent: !d.sent }])
          }, F(d.destination), 3),
          p("span", pD, F(V(e0)(d.notes)), 1),
          s.value && o[d.voice] ? (w(), A("select", {
            key: 0,
            class: "sound",
            value: s.value[o[d.voice]],
            "aria-label": `Sound of the ${d.name} track`,
            title: `The ${d.name} track’s sound in the playback`,
            onChange: (g) => r(d.voice, g.target.value)
          }, [
            (w(!0), A(ve, null, Ie(V(Qd), (g) => (w(), A("option", {
              key: g,
              value: g,
              title: V(ml)[g].hint
            }, F(V(ml)[g].label), 9, mD))), 128))
          ], 40, gD)) : Q("", !0),
          p("label", {
            class: "play",
            title: `Play the ${d.name} track`
          }, [
            p("input", {
              type: "checkbox",
              checked: u(d.voice),
              "aria-label": `Play the ${d.name} track`,
              onChange: (g) => c(d.voice, g.target.checked)
            }, null, 40, yD)
          ], 8, vD),
          d.voice === "guide" && d.notes > 0 && !n.readonly ? (w(), A("button", {
            key: 1,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: f[0] || (f[0] = (g) => l("clearGuide"))
          }, " clear ")) : Q("", !0)
        ], 2))), 128))
      ]),
      n.keepsGuide ? (w(), A("p", bD, [...f[1] || (f[1] = [
        ye(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        p("strong", null, "never sent to YuE2", -1),
        ye(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (w(), A("p", xD, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
}), kD = /^\[([^[\]\n]{1,40})\]$/;
function pr(n) {
  const e = [], t = [];
  let i = null;
  for (const s of n.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = kD.exec(o);
    r ? (i = { tag: r[1].trim(), lines: [] }, t.push(i)) : o && (i ? i.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function Wl(n) {
  return n.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function uh(n, e) {
  return e && Wl(e.tag) === Wl(n) ? e.tag : n.replace(/(^|[\s-])(\p{L})/gu, (t, i, s) => i + s.toUpperCase());
}
function Kl(n) {
  return n.sections.map((e) => n.measures[e.first_bar - 1]?.onset ?? 0);
}
function Qr(n, e) {
  if (!n?.trim() || !e) return null;
  const t = pr(n), i = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== i.length || i.some((o, r) => Wl(o.label) !== Wl(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function SD(n, e) {
  const t = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return e.sections.forEach((i, s) => {
    if (i.implicit) return;
    const o = n.blocks[s] ?? null;
    t.push([`[${uh(i.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function Iv(n, e) {
  return e?.length ? e : [[0, n.total, 0]];
}
function Rv(n, e, t) {
  const i = Iv(n, t), s = Kl(n), o = (u) => {
    let c = -1;
    return s.forEach((h, f) => {
      h <= u && (c = f);
    }), c;
  }, r = (u) => {
    for (const [c, h, f] of i)
      if (u >= f && u < f + h - c) return c + u - f;
    return null;
  }, l = [], a = [];
  return Kl(e).forEach((u, c) => {
    const h = r(u), f = h === null ? -1 : o(h);
    a.push(f), l.push(f >= 0 && h !== null && (h === s[f] || a[c - 1] !== f) ? f : -1);
  }), l;
}
function CD(n, e, t, i, s = () => null) {
  const o = Iv(e, i), r = Kl(e), l = Kl(t), a = (d) => {
    for (const [g, v, m] of o)
      if (d >= m && d < m + v - g) return g + d - m;
    return null;
  }, u = (d) => d ? { tag: d.tag, lines: [...d.lines] } : null, c = Rv(e, t, i), h = new Set(c.filter((d) => d >= 0)), f = l.map((d, g) => a(d) === null ? s(d) : c[g] >= 0 ? u(n.blocks[c[g]] ?? null) : null);
  return r.forEach((d, g) => {
    const v = n.blocks[g]?.lines;
    if (!(h.has(g) || !v?.length))
      for (const [m, x, O] of o) {
        if (d < m || d >= x) continue;
        const L = O + d - m;
        let E = -1;
        l.forEach((z, P) => {
          z <= L && (E = P);
        });
        const R = E >= 0 && l[E] !== L ? f[E] : null;
        R && (f[E] = { tag: R.tag, lines: [...R.lines, ...v] });
      }
  }), { preamble: n.preamble, blocks: f };
}
function Pv(n, e, t) {
  const i = [...n], s = t.trim();
  return e >= i.length ? s && i.push(s) : s ? i[e] = s : i.splice(e, 1), i;
}
function MD(n, e, t, i) {
  const s = pr(n);
  if (!s.blocks[e]) return n;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: Pv(a.lines, t, i) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function AD(n, e, t, i, s) {
  const o = e.sections[t]?.label ?? "", r = n.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: uh(o, null), lines: [] };
    return { tag: u.tag, lines: Pv(u.lines, i, s) };
  });
  return { preamble: n.preamble, blocks: r };
}
function TD(n, e, t) {
  const i = pr(n);
  if (!i.blocks[e]) return n;
  const s = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return i.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function $D(n, e, t, i) {
  const s = e.sections[t]?.label ?? "", o = n.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: uh(s, null) }).tag, lines: [...i] } : r
  );
  return { preamble: n.preamble, blocks: o };
}
const DD = 2, OD = 0.5, LD = 32;
function Gd(n, e, t, i) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= i) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, i) - l}.${o.pitch}`);
  }
  return `${n}:${s.join(",")}`;
}
function ED(n) {
  return n.measures.map((e) => [
    Gd(e.meter, n.tracks.vocal, e.onset, e.onset + e.length),
    Gd(e.meter, n.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function BD(n, e) {
  let t = 0;
  for (let i = 0; i < 2; i++) n[i] === e[i] && (t += n[i].endsWith(":") ? OD : DD);
  return t;
}
function ID(n, e) {
  const t = n.map((l) => e.map((a) => BD(l, a))), i = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < LD && l + u < n.length && a + u < e.length && !(i[l + u] <= 0 || t[l + u][a + u] !== i[l + u]); )
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
function RD(n, e) {
  if (e?.bars?.length)
    return !n || !e.bar_prints?.length ? n ? n.measures.map((t, i) => e.bars[i] ?? null) : e.bars : ID(ED(n), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const PD = "0.5.0";
function _D(n) {
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
function qd(n, e) {
  return {
    ...n,
    ...e,
    sounds: { ...n.sounds, ...e.sounds ?? {} },
    record: { ...n.record, ...e.record ?? {} }
  };
}
function ch(n) {
  if (typeof n != "object" || n === null) return {};
  const e = n, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const i = e.sounds;
    Object.values(i).some(vy) && (t.sounds = yy(i));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = by(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), xy(e.notationSize) && (t.notationSize = e.notationSize), t;
}
const Xn = (n, e, t, i) => ({ Vocal: n, Ins: e, chord: t, guide: i }), el = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: Xn("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: Xn("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: Xn("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: Xn("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: Xn("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: Xn("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: Xn("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: Xn("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: Xn("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...my(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: Xn("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], ND = "plenio/score-editor-presets.json", VD = "plenio.score_presets/1", _v = "plenio.score-editor.presets";
function Nv(n) {
  const e = typeof n == "object" && n !== null ? n : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), i = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), i.push({ name: r, builtIn: !1, settings: ch(o.settings) }));
  }
  return i;
}
function Vv(n) {
  return JSON.stringify({ schema: VD, presets: n.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function HD() {
  try {
    return Nv(JSON.parse(window.localStorage.getItem(_v) ?? "{}"));
  } catch {
    return [];
  }
}
function FD(n) {
  try {
    return window.localStorage.setItem(_v, Vv(n)), !0;
  } catch {
    return !1;
  }
}
const Hv = `/userdata/${encodeURIComponent(ND)}`;
async function zD(n) {
  if (n)
    try {
      const e = await n.fetchApi(Hv, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: Nv(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: HD(), where: "browser" };
}
async function Yd(n, e) {
  const t = e.filter((i) => !i.builtIn);
  if (n)
    try {
      if ((await n.fetchApi(`${Hv}?overwrite=true`, { method: "POST", body: Vv(t) })).ok) return "comfyui";
    } catch {
    }
  return FD(t) ? "browser" : "failed";
}
function WD(n, e) {
  return [...n.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, i) => t.name.localeCompare(i.name));
}
const pl = "plenio.score_project/1", Fv = ".plenio.json";
function KD(n, e = /* @__PURE__ */ new Date()) {
  return {
    schema: pl,
    app: `Plenio Music Production System ${PD}`,
    saved: e.toISOString(),
    title: (n.title ?? "").trim(),
    score: n.score,
    guide: (n.guide ?? []).map(([t, i, s]) => [t, i, s]),
    lyrics: n.lyrics?.trim() ? n.lyrics : null,
    lyric_spans: n.lyrics?.trim() ? ep(n.lyricSpans ?? []) : [],
    settings: n.settings ? ch(n.settings) : {}
  };
}
function UD(n) {
  return `${Array.from((n ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${Fv}`;
}
function jD(n) {
  let e;
  try {
    e = JSON.parse(n);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== pl ? `This file is not a Plenio score project (${pl}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: pl,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: n0(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: ep(t.lyric_spans),
    settings: ch(t.settings)
  };
}
const GD = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, qD = ["disabled", "title"], YD = ["disabled", "title"], XD = ["title"], JD = { class: "midi-settings" }, ZD = ["aria-expanded"], QD = ["onKeydown"], eO = { class: "facts" }, tO = { key: 0 }, nO = ["value"], iO = ["value"], sO = ["value"], oO = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, rO = ["checked"], lO = ["value"], aO = { title: "Where the take's starts and ends go" }, uO = ["value"], cO = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, hO = ["value"], fO = { title: "Silence the old notes of the recorded voice while recording" }, dO = ["checked"], pO = ["value"], gO = /* @__PURE__ */ Qt({
  __name: "RecordControls",
  props: /* @__PURE__ */ Dn({
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
  emits: /* @__PURE__ */ Dn(["record", "stop", "step", "rest", "enable"], ["update:settings"]),
  setup(n, { emit: e }) {
    const t = n, i = Bt(n, "settings"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(null);
    function l() {
      o.value = !1, In(() => r.value?.focus());
    }
    const a = /* @__PURE__ */ G(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    Di(() => clearInterval(u));
    const c = N(() => {
      const v = t.hub.selected.value;
      if (v === "all") return null;
      const m = t.hub.devices.value.find((x) => x.id === v);
      return m?.connected ? null : m?.name ?? "the chosen keyboard";
    }), h = N(() => a.value - t.hub.activity.value < 250), f = N(() => {
      const v = t.hub;
      if (v.status.value === "ready") {
        const m = v.devices.value.filter((x) => x.connected);
        return m.length ? c.value ? `${c.value} is unplugged - listening to every keyboard until it is back` : `${m.length} keyboard${m.length > 1 ? "s" : ""} connected` : "no MIDI keyboard connected - plug one in";
      }
      return v.status.value === "asking" ? "asking for MIDI access…" : v.status.value === "off" ? 'MIDI is off until you press rec, step or "use MIDI"' : v.problem.value ?? "MIDI is not available";
    }), d = N(
      () => t.disabled ?? (t.recording ? "Stop and keep the take (Space); Esc throws it away" : `Record from the cursor into ${t.target} with a MIDI keyboard (Shift+R)${i.value.countIn ? `, after ${i.value.countIn} bar${i.value.countIn > 1 ? "s" : ""} of count-in` : ""}`)
    );
    function g(v, m) {
      i.value = { ...i.value, [v]: m };
    }
    return (v, m) => (w(), A("span", GD, [
      p("button", {
        class: Xe(["rec", { on: n.recording, counting: n.countingIn }]),
        disabled: !!n.disabled && !n.recording,
        title: d.value,
        onClick: m[0] || (m[0] = (x) => n.recording ? s("stop") : s("record"))
      }, " ● " + F(n.recording && n.countingIn ? "count-in" : "rec"), 11, qD),
      p("button", {
        class: Xe(["step", { on: n.step }]),
        disabled: !!n.disabled || n.recording,
        title: n.disabled ?? (n.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${n.target}: every key writes a note of the step length at the cursor`),
        onClick: m[1] || (m[1] = (x) => s("step"))
      }, " step ", 10, YD),
      n.step ? (w(), A("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: m[2] || (m[2] = (x) => s("rest"))
      }, "rest ▶")) : Q("", !0),
      p("span", {
        class: Xe(["midi-light", { active: h.value, ready: n.hub.status.value === "ready" }]),
        title: f.value,
        "aria-hidden": "true"
      }, null, 10, XD),
      p("span", JD, [
        p("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: m[3] || (m[3] = (x) => o.value ? l() : o.value = !0)
        }, "🎹", 8, ZD),
        o.value ? (w(), A("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: $t(ct(l, ["stop", "prevent"]), ["esc"])
        }, [
          p("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          m[24] || (m[24] = p("strong", null, "MIDI keyboard", -1)),
          p("span", eO, F(f.value), 1),
          n.hub.status.value === "ready" ? (w(), A("label", tO, [
            m[13] || (m[13] = ye(" keyboard ", -1)),
            p("select", {
              value: n.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: m[4] || (m[4] = (x) => n.hub.selected.value = x.target.value)
            }, [
              m[12] || (m[12] = p("option", { value: "all" }, "all keyboards", -1)),
              (w(!0), A(ve, null, Ie(n.hub.devices.value.filter((x) => x.connected), (x) => (w(), A("option", {
                key: x.id,
                value: x.id
              }, F(x.name), 9, iO))), 128)),
              c.value ? (w(), A("option", {
                key: 0,
                value: n.hub.selected.value,
                disabled: ""
              }, F(c.value) + " (unplugged)", 9, sO)) : Q("", !0)
            ], 40, nO)
          ])) : n.hub.status.value !== "asking" ? (w(), A("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: m[5] || (m[5] = (x) => s("enable"))
          }, "use MIDI")) : Q("", !0),
          p("label", oO, [
            p("input", {
              checked: i.value.thru,
              type: "checkbox",
              onChange: m[6] || (m[6] = (x) => g("thru", x.target.checked))
            }, null, 40, rO),
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
              onChange: m[7] || (m[7] = (x) => g("countIn", Number(x.target.value)))
            }, [...m[15] || (m[15] = [
              p("option", { value: 0 }, "none", -1),
              p("option", { value: 1 }, "1 bar", -1),
              p("option", { value: 2 }, "2 bars", -1)
            ])], 40, lO)
          ]),
          p("label", aO, [
            m[18] || (m[18] = ye(" quantize ", -1)),
            p("select", {
              value: i.value.quantize,
              "aria-label": "Quantize the take",
              onChange: m[8] || (m[8] = (x) => g("quantize", Number(x.target.value)))
            }, [...m[17] || (m[17] = [
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1),
              p("option", { value: 32 }, "1/32", -1),
              p("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, uO)
          ]),
          p("label", cO, [
            m[20] || (m[20] = ye(" mode ", -1)),
            p("select", {
              value: i.value.mode,
              "aria-label": "Replace or merge",
              onChange: m[9] || (m[9] = (x) => g("mode", x.target.value))
            }, [...m[19] || (m[19] = [
              p("option", { value: "replace" }, "replace", -1),
              p("option", { value: "merge" }, "merge", -1)
            ])], 40, hO)
          ]),
          p("label", fO, [
            p("input", {
              checked: i.value.mute,
              type: "checkbox",
              onChange: m[10] || (m[10] = (x) => g("mute", x.target.checked))
            }, null, 40, dO),
            m[21] || (m[21] = ye(" mute its old notes ", -1))
          ]),
          m[26] || (m[26] = p("strong", null, "Step input", -1)),
          p("label", null, [
            m[23] || (m[23] = ye(" step ", -1)),
            p("select", {
              value: i.value.stepLength,
              "aria-label": "Step length",
              onChange: m[11] || (m[11] = (x) => g("stepLength", Number(x.target.value)))
            }, [...m[22] || (m[22] = [
              p("option", { value: 1 }, "1/1", -1),
              p("option", { value: 2 }, "1/2", -1),
              p("option", { value: 4 }, "1/4", -1),
              p("option", { value: 8 }, "1/8", -1),
              p("option", { value: 16 }, "1/16", -1)
            ])], 40, pO)
          ])
        ], 40, QD)) : Q("", !0)
      ])
    ]));
  }
}), mO = { class: "notation-export" }, vO = ["disabled", "aria-expanded", "title"], yO = ["onKeydown"], bO = { title: "The paper of the PDF and the print" }, xO = { title: "How large the music is drawn: standard about 3 bars a line (4 pages for a song of 3-4 minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes)" }, wO = { class: "formats" }, kO = ["disabled"], SO = ["disabled"], CO = ["disabled"], MO = ["disabled"], AO = { class: "facts" }, TO = /* @__PURE__ */ Qt({
  __name: "NotationExport",
  props: /* @__PURE__ */ Dn({
    abc: {},
    title: {},
    blocked: {}
  }, {
    paper: { required: !0 },
    paperModifiers: {},
    size: { required: !0 },
    sizeModifiers: {}
  }),
  emits: /* @__PURE__ */ Dn(["done", "failed"], ["update:paper", "update:size"]),
  setup(n, { emit: e }) {
    const t = n, i = Bt(n, "paper"), s = Bt(n, "size"), o = e, r = /* @__PURE__ */ G(!1), l = /* @__PURE__ */ G(!1), a = /* @__PURE__ */ G(null);
    function u() {
      r.value = !1, In(() => a.value?.focus());
    }
    async function c(h) {
      if (!t.abc || l.value) return;
      l.value = !0, await new Promise((d) => setTimeout(d, 20));
      let f = null;
      try {
        f = zy(t.abc, t.title, i.value, s.value);
        const { lines: d } = f;
        if (!d.length) throw new Error("the score has no music to draw");
        const g = i.value === "a4" ? "A4" : "Letter";
        if (h === "pdf") {
          const v = await Wy(d, i.value, t.title);
          Qs(Da(t.title, "pdf"), v, "application/pdf"), o("done", `exported the notation as PDF (${g})`);
        } else h === "png" ? (Qs(Da(t.title, "png"), await Ky(d), "image/png"), o("done", "exported the notation as PNG")) : h === "svg" ? (Qs(Da(t.title, "svg"), new TextEncoder().encode(Uy(d)), "image/svg+xml"), o("done", "exported the notation as SVG")) : (jy(d, i.value, t.title), o("done", `printing the notation (${g}) - the browser’s dialog also saves a vector PDF`));
        u();
      } catch (d) {
        o("failed", `The notation could not be exported: ${d instanceof Error ? d.message : String(d)}`);
      } finally {
        f?.dispose(), l.value = !1;
      }
    }
    return (h, f) => (w(), A("span", mO, [
      p("button", {
        ref_key: "toggle",
        ref: a,
        disabled: !n.abc,
        "aria-expanded": r.value,
        title: n.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: f[0] || (f[0] = (d) => r.value ? u() : r.value = !0)
      }, " Export notation… ", 8, vO),
      r.value ? (w(), A("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: $t(ct(u, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: u
        }, "×"),
        p("label", bO, [
          f[8] || (f[8] = ye(" paper ", -1)),
          Ue(p("select", {
            "onUpdate:modelValue": f[1] || (f[1] = (d) => i.value = d),
            "aria-label": "Paper"
          }, [...f[7] || (f[7] = [
            p("option", { value: "a4" }, "A4", -1),
            p("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [ts, i.value]
          ])
        ]),
        p("label", xO, [
          f[10] || (f[10] = ye(" size ", -1)),
          Ue(p("select", {
            "onUpdate:modelValue": f[2] || (f[2] = (d) => s.value = d),
            "aria-label": "Notation size"
          }, [...f[9] || (f[9] = [
            p("option", { value: "large" }, "large", -1),
            p("option", { value: "standard" }, "standard", -1),
            p("option", { value: "smaller" }, "smaller", -1),
            p("option", { value: "compact" }, "compact", -1)
          ])], 512), [
            [ts, s.value]
          ])
        ]),
        p("span", wO, [
          p("button", {
            disabled: l.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: f[3] || (f[3] = (d) => c("pdf"))
          }, "PDF", 8, kO),
          p("button", {
            disabled: l.value,
            title: "The whole score as one picture",
            onClick: f[4] || (f[4] = (d) => c("png"))
          }, "PNG", 8, SO),
          p("button", {
            disabled: l.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: f[5] || (f[5] = (d) => c("svg"))
          }, "SVG", 8, CO),
          p("button", {
            disabled: l.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: f[6] || (f[6] = (d) => c("print"))
          }, "Print…", 8, MO)
        ]),
        p("span", AO, F(l.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, yO)) : Q("", !0)
    ]));
  }
}), $O = { class: "sounds-settings" }, DO = ["aria-expanded"], OO = ["onKeydown"], LO = { class: "row" }, EO = { label: "Built in" }, BO = ["value", "title"], IO = {
  key: 0,
  label: "Yours"
}, RO = ["value"], PO = ["disabled"], _O = {
  key: 0,
  class: "facts"
}, NO = { class: "row" }, VO = ["onKeydown"], HO = ["disabled"], FO = {
  key: 1,
  class: "facts",
  role: "status"
}, zO = {
  key: 2,
  class: "facts"
}, WO = { class: "track" }, KO = ["value", "aria-label", "onChange"], UO = ["value", "title"], jO = ["title", "aria-label", "onClick"], GO = /* @__PURE__ */ Qt({
  __name: "SoundsPanel",
  props: /* @__PURE__ */ Dn({
    fetcher: {},
    settings: {},
    keepsGuide: { type: Boolean }
  }, {
    sounds: { required: !0 },
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ Dn(["apply"], ["update:sounds"]),
  setup(n, { emit: e }) {
    const t = n, i = Bt(n, "sounds"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(null), u = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(""), h = /* @__PURE__ */ G(!1), f = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(null), g = N(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([P]) => P !== "guide" || t.keepsGuide)
    ), v = N(() => l.value.find((P) => P.name === c.value) ?? null);
    async function m() {
      if (o.value = !0, u.value) return;
      const P = await zD(t.fetcher);
      l.value = P.presets, a.value = P.where, u.value = !0;
    }
    function x() {
      o.value = !1, h.value = !1, In(() => r.value?.focus());
    }
    function O() {
      const P = [...el, ...l.value].find((q) => q.name === c.value);
      P && (s("apply", P.settings, P.name), d.value = `“${P.name}” is set.`);
    }
    async function L() {
      const P = f.value.trim().slice(0, 60);
      if (!P) return;
      if (el.some((le) => le.name.toLowerCase() === P.toLowerCase())) {
        d.value = `“${P}” is a built-in preset - choose another name.`;
        return;
      }
      const q = WD(l.value, { name: P, builtIn: !1, settings: structuredClone(t.settings) }), K = await Yd(t.fetcher, q);
      if (K === "failed") {
        d.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = q, a.value = K, c.value = P, h.value = !1, f.value = "", d.value = K === "comfyui" ? `Saved “${P}” in ComfyUI’s user data.` : `Saved “${P}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function E() {
      const P = v.value;
      if (!P) return;
      const q = l.value.filter((le) => le !== P);
      if (await Yd(t.fetcher, q) === "failed") {
        d.value = "The preset could not be deleted.";
        return;
      }
      l.value = q, c.value = "", d.value = `Deleted “${P.name}”.`;
    }
    function R(P, q) {
      i.value = { ...i.value, [P]: q };
    }
    function z(P) {
      const q = i.value[P], K = P === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : P === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [le, j, D] of K) setTimeout(() => pc(le, D, q), j * 1e3);
    }
    return (P, q) => (w(), A("span", $O, [
      p("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: q[0] || (q[0] = (K) => o.value ? x() : m())
      }, "♫ sounds", 8, DO),
      o.value ? (w(), A("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: $t(ct(x, ["stop", "prevent"]), ["esc"])
      }, [
        p("button", {
          class: "close",
          "aria-label": "Close",
          onClick: x
        }, "×"),
        q[6] || (q[6] = p("strong", null, "Preset", -1)),
        p("span", LO, [
          Ue(p("select", {
            "onUpdate:modelValue": q[1] || (q[1] = (K) => c.value = K),
            "aria-label": "Preset"
          }, [
            q[5] || (q[5] = p("option", { value: "" }, "- choose a preset -", -1)),
            p("optgroup", EO, [
              (w(!0), A(ve, null, Ie(V(el), (K) => (w(), A("option", {
                key: K.name,
                value: K.name,
                title: K.note
              }, F(K.name), 9, BO))), 128))
            ]),
            l.value.length ? (w(), A("optgroup", IO, [
              (w(!0), A(ve, null, Ie(l.value, (K) => (w(), A("option", {
                key: "own-" + K.name,
                value: K.name
              }, F(K.name), 9, RO))), 128))
            ])) : Q("", !0)
          ], 512), [
            [ts, c.value]
          ]),
          p("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: O
          }, "use", 8, PO),
          v.value ? (w(), A("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: E
          }, "delete")) : Q("", !0)
        ]),
        c.value ? (w(), A("span", _O, F([...V(el), ...l.value].find((K) => K.name === c.value)?.note ?? "Your preset"), 1)) : Q("", !0),
        p("span", NO, [
          h.value ? (w(), A(ve, { key: 0 }, [
            Ue(p("input", {
              "onUpdate:modelValue": q[2] || (q[2] = (K) => f.value = K),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                $t(ct(L, ["prevent"]), ["enter"]),
                q[3] || (q[3] = $t(ct((K) => h.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, VO), [
              [Nt, f.value]
            ]),
            p("button", {
              disabled: !f.value.trim(),
              onClick: L
            }, "save", 8, HO)
          ], 64)) : (w(), A("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: q[4] || (q[4] = (K) => h.value = !0)
          }, " save current as preset… "))
        ]),
        d.value ? (w(), A("span", FO, F(d.value), 1)) : a.value === "browser" ? (w(), A("span", zO, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : Q("", !0),
        q[7] || (q[7] = p("strong", null, "Sounds", -1)),
        (w(!0), A(ve, null, Ie(g.value, ([K, le]) => (w(), A("label", {
          key: K,
          class: "row"
        }, [
          p("span", WO, F(le), 1),
          p("select", {
            value: i.value[K],
            "aria-label": `Sound of the ${le} track`,
            onChange: (j) => R(K, j.target.value)
          }, [
            (w(!0), A(ve, null, Ie(V(Qd), (j) => (w(), A("option", {
              key: j,
              value: j,
              title: V(ml)[j].hint
            }, F(V(ml)[j].label), 9, UO))), 128))
          ], 40, KO),
          p("button", {
            title: `Hear the ${le} track’s sound`,
            "aria-label": `Hear the ${le} sound`,
            onClick: ct((j) => z(K), ["prevent"])
          }, "▶", 8, jO)
        ]))), 128)),
        q[8] || (q[8] = p("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, OO)) : Q("", !0)
    ]));
  }
});
function qO(n) {
  return n.length >= 3 && (n[0] & 240) === 176 && (n[1] === 120 || n[1] === 123);
}
function YO(n, e, t) {
  if (n.length < 3) return null;
  const i = n[0] & 240, s = n[0] & 15, o = n[1] & 127, r = n[2] & 127;
  return i === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : i === 128 || i === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function XO(n, e) {
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
class JO {
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
    if (qO(t.data)) {
      this.letGo(e, i);
      return;
    }
    const s = YO(t.data, i, e);
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
    this.status.value = e, this.problem.value = XO(e, t);
  }
}
let Xd = null;
function ZO() {
  return Xd ??= new JO(), Xd;
}
const QO = 0.035;
class e4 {
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
function t4(n, e) {
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
      const x = Math.round((v.start - t) / l) * l + t;
      x > d && (g = Math.min(g, x));
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
function n4(n, e, t, i, s) {
  return {
    op: "place_notes",
    track: n,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(i), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function fu(n, e) {
  if (!e) return 1;
  const t = Number(n.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const i4 = 40;
function s4(n) {
  const e = /* @__PURE__ */ G(!1), t = /* @__PURE__ */ G(!1), i = /* @__PURE__ */ Us(null), s = /* @__PURE__ */ G(0), o = new pA();
  let r = !1, l = null, a = null;
  const u = /* @__PURE__ */ G(0), c = N(() => {
    const K = i.value;
    return !K || !e.value ? [] : (u.value, K.played(s.value).filter((le) => le.end !== null && le.end > le.start).map((le) => ({ onset: le.start, duration: le.end - le.start, pitch: le.pitch })));
  });
  function h() {
    l ??= n.hub.subscribe(L);
  }
  async function f() {
    const K = await n.hub.enable();
    return n.problem(K ? null : n.hub.problem.value), K && h(), K;
  }
  function d(K) {
    const le = n.view();
    return le ? ah(le, Math.max(0, K)) : null;
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
    const le = n.settings(), j = n.track(), D = Math.min(n.locator.value, K.model.total - 1), U = n.transport();
    if (!U) return;
    if (i.value = new e4(D, j), r = !1, e.value = !0, s.value = D, !U.record(lh(K, D), {
      countIn: le.countIn,
      mute: le.mute ? j === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, i.value = null, n.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    n.notify(`recording into ${j === "vocal" ? "Vocal" : "Ins"} from bar ${r4(K, D)} - Space or ■ stop keeps it, Esc throws it away`);
  }
  function v() {
    n.transport()?.stop();
  }
  function m() {
    e.value && (r = !0, n.transport()?.stop());
  }
  function x(K) {
    if (!e.value || K === null) return;
    const le = d(K);
    le !== null && (s.value = le);
  }
  async function O() {
    if (!e.value) return;
    const K = i.value, le = n.view();
    e.value = !1, i.value = null, o.allOff();
    const j = le?.model;
    if (!K || !j) return;
    if (r) {
      n.notify("recording thrown away");
      return;
    }
    const D = Math.max(s.value, K.start), U = j.measures.find((ze) => ze.onset <= K.start && K.start < ze.onset + ze.length) ?? j.measures[0], ke = le.bars[(U?.n ?? 1) - 1], Te = U && ke?.duration_s ? U.length / ke.duration_s : 8, ue = Number(U?.meter.split("/")[0]) || 4, pe = t4(K.finish(D), {
      start: K.start,
      stop: D,
      total: j.total,
      grid: fu(j.unit, n.settings().quantize),
      chordUnits: QO * Te,
      pickup: (U?.length ?? 16) / ue / 2
    });
    if (!pe.length) {
      n.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await n.operate(n4(K.track, pe, K.start, D, n.settings().mode));
  }
  function L(K) {
    if (n.settings().thru && (n.sound && (o.sound = n.sound()), K.kind === "on" ? o.on(K.note, K.velocity) : o.off(K.note)), e.value && i.value) {
      const j = n.transport()?.scoreSecondAt(K.time) ?? null, D = n.view();
      if (j === null || !D) return;
      const U = o4(D, i.value.start, j);
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
      R();
    }, i4) };
  }
  async function R() {
    const K = a?.pitches ?? [];
    a = null;
    const j = n.view()?.model;
    if (!j || !K.length || n.readonly()) return;
    const D = fu(j.unit, n.settings().stepLength), U = n.locator.value;
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
    K && (n.locator.value = Math.min(K.total, n.locator.value + fu(K.unit, n.settings().stepLength)));
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
  function q() {
    l?.(), l = null, a && clearTimeout(a.timer), o.close();
  }
  return { recording: e, step: t, live: c, start: g, stop: v, cancel: m, onTime: x, onStopped: O, toggleStep: P, rest: z, ready: f, dispose: q };
}
function o4(n, e, t) {
  const i = n.model;
  if (!i) return null;
  const s = lh(n, e);
  if (t >= s) return ah(n, t);
  const o = i.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? i.measures[0], r = n.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function r4(n, e) {
  let t = 1;
  for (const i of n.model?.measures ?? []) i.onset <= e && (t = i.n);
  return t;
}
const l4 = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, a4 = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, u4 = ["aria-checked"], c4 = ["aria-checked"], h4 = ["aria-checked"], f4 = { title: "The piano roll and chord lane above the notation" }, d4 = { title: "Show the ABC text under the notation" }, p4 = { title: "Zoom of the notation" }, g4 = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, m4 = ["disabled", "title"], v4 = ["disabled", "title"], y4 = ["disabled"], b4 = ["disabled", "title"], x4 = ["disabled", "title"], w4 = ["accept"], k4 = {
  key: 1,
  class: "facts"
}, S4 = {
  key: 2,
  class: "facts ok"
}, C4 = {
  key: 3,
  class: "facts bad"
}, M4 = {
  key: 4,
  class: "badge"
}, A4 = {
  key: 1,
  class: "gate",
  role: "status"
}, T4 = {
  key: 2,
  class: "gate",
  role: "status"
}, $4 = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], D4 = ["data-layout", "data-text"], O4 = { class: "side" }, L4 = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, E4 = {
  key: 0,
  class: "hint"
}, B4 = {
  key: 0,
  class: "hint changed"
}, I4 = {
  key: 1,
  class: "hint"
}, R4 = {
  key: 2,
  class: "fit-panel"
}, P4 = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], _4 = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], N4 = {
  class: "status",
  "aria-live": "polite"
}, V4 = {
  key: 5,
  class: "error",
  role: "alert"
}, H4 = {
  key: 6,
  class: "error",
  role: "alert"
}, F4 = {
  key: 7,
  class: "error",
  role: "alert"
}, z4 = {
  key: 9,
  class: "diagnostics"
}, W4 = ["data-severity"], K4 = ["title", "onClick"], U4 = {
  key: 1,
  class: "where"
}, Jd = /* @__PURE__ */ Qt({
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
    const o = /* @__PURE__ */ Us(null), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G(null);
    function a(y) {
      const C = y.op === "paste" && y.mode === "insert" && Array.isArray(y.sections) ? y.sections : [], B = typeof y.at == "number" ? y.at : 0, ae = zi.value;
      return (xe) => {
        let Ae = -1;
        C.forEach((Ve, _e) => {
          Ve.onset <= xe - B && (Ae = _e);
        });
        const qe = Ae >= 0 ? ae?.sections[Ae]?.lyrics : null;
        return qe ? { tag: qe.tag, lines: [...qe.lines] } : null;
      };
    }
    const u = zM(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => i("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => J(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (y) => {
        s(y) && (Array.isArray(y.guide) && t.guide !== void 0 && !$o(y.guide, t.guide) && i("guideChange", [...y.guide]), "lyrics" in y && (o.value = y.lyrics ?? null), "looseLyrics" in y && (r.value = y.looseLyrics ?? null), Array.isArray(y.spans) && Ce(y.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (y, C) => {
        const B = {}, ae = {}, xe = t.guide;
        if (xe?.length && y.time_map?.length) {
          const kt = i0(xe, y.time_map);
          $o(kt, xe) || (i("guideChange", kt), B.guide = [...xe], ae.guide = kt);
        }
        const Ae = J(), qe = o.value, Ve = ue.value?.model, _e = y.analysis.model;
        let Et = Ae.length && y.time_map?.length ? Jy(Ae, y.time_map) : Ae;
        if (Et.length && qe && Ve && _e) {
          const kt = (Rs) => Rs.sections.flatMap((bo, Aa) => bo.implicit ? [] : [Aa]), cs = _e.sections.map((Rs) => _e.measures[Rs.first_bar - 1]?.onset ?? 0);
          Et = Zy(Et, Rv(Ve, _e, y.time_map), kt(Ve), kt(_e), cs);
        }
        if (il(Et, Ae) || (Ce(Et), B.spans = [...Ae], ae.spans = Et), qe && Ve && _e) {
          const kt = CD(qe, Ve, _e, y.time_map, a(C));
          o.value = kt, B.lyrics = qe, ae.lyrics = kt;
        }
        return Object.keys(ae).length ? { before: B, after: ae } : void 0;
      }
    });
    Ye(
      () => [t.doc.text, u.commitBlock],
      ([y, C]) => {
        t.readonly || i("gate", y, C);
      },
      { immediate: !0 }
    );
    const c = /* @__PURE__ */ G(wy()), h = /* @__PURE__ */ G(m2(t.layoutDefault, c.value.layout));
    function f(y) {
      h.value = y, c.value = { ...c.value, layout: y };
    }
    const d = /* @__PURE__ */ G([]), g = /* @__PURE__ */ G(0), v = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), x = /* @__PURE__ */ G(null), O = /* @__PURE__ */ G(null), L = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G("vocal"), R = N({
      get: () => c.value.sounds,
      set: (y) => c.value = { ...c.value, sounds: y }
    }), z = N(() => _D(c.value));
    function P(y, C) {
      c.value = qd(c.value, y), u.notes = [`${C}: ${q(y)}`];
    }
    function q(y) {
      const C = [];
      return y.sounds && C.push("sounds"), y.metronome !== void 0 && C.push(`metronome ${y.metronome ? "on" : "off"}`), y.hear && C.push(`hear ${y.hear}`), (y.wave !== void 0 || y.sung !== void 0) && C.push("the source view"), y.record && C.push("recording"), y.paper && C.push(`paper ${y.paper === "a4" ? "A4" : "Letter"}`), y.notationSize && C.push(`notation ${y.notationSize}`), C.length ? `${C.join(", ")} set` : "nothing to set";
    }
    const K = N(() => c.value.sounds[E.value === "vocal" ? "Vocal" : "Ins"]);
    Ye(c, (y) => Ly(y), { deep: !0 });
    const le = ZO();
    le.selected.value = c.value.midiInput, Ye(le.selected, (y) => c.value = { ...c.value, midiInput: y });
    const j = N({
      get: () => c.value.record,
      set: (y) => c.value = { ...c.value, record: y }
    }), D = s4({
      hub: le,
      transport: () => x.value,
      view: () => ue.value,
      locator: g,
      track: () => E.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: yo,
      notify: (y) => u.notes = [y],
      problem: (y) => U.value = y,
      sound: () => K.value
    }), U = /* @__PURE__ */ G(null), ke = N(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : te.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function Te(y) {
      const C = y.target;
      L.value?.contains(C) || Ma(C) || y.ctrlKey || y.metaKey || y.altKey || y.key !== " " && y.key !== "Escape" || (y.preventDefault(), y.stopPropagation(), y.key === " " ? D.stop() : D.cancel());
    }
    Ye(D.recording, (y) => {
      y ? window.addEventListener("keydown", Te, !0) : window.removeEventListener("keydown", Te, !0);
    }), Di(() => {
      window.removeEventListener("keydown", Te, !0), D.cancel(), D.dispose();
    }), Di(() => u.dispose());
    const ue = N(() => u.lastValid), pe = N(() => !!u.view && !u.view.ok), ze = N(() => u.view?.diagnostics ?? []), Be = N(
      () => ze.value.filter((y) => y.severity === "error" && y.bar).map((y) => y.bar)
    ), Pe = N(
      () => Lv(ue.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), Ee = N(() => h.value !== "text"), X = N(() => h.value === "daw"), at = N(() => t.guide ?? []), be = N(() => s0(t.guide, ue.value?.model)), Re = N(() => X.value ? c.value.voices.guide ?? !0 : !1), se = N(() => Re.value ? be.value : []), Z = N(() => Ee.value && c.value.roll && !!(ue.value?.model || ue.value?.model_error)), te = N(() => ue.value?.model ?? null), Ze = N(() => te.value ? qo(te.value, g.value) : Pe.value), ut = N(() => ue.value && te.value ? lh(ue.value, g.value) : null), gt = N(() => te.value ? Bv(te.value, g.value) : "");
    Ye(
      () => te.value?.total,
      (y) => {
        y !== void 0 && g.value > y && (g.value = y);
      }
    );
    let S = null, b = null, $ = !1;
    Ye(
      () => [t.lyricsTarget, t.lyrics, te.value],
      ([y, C, B]) => {
        if (!y || !C?.trim()) {
          o.value = null, r.value = null, S = null, $ = !1;
          return;
        }
        const ae = C === S || C === b;
        if (S = C, ae && ($ || !B)) {
          if (o.value && B && o.value.blocks.length !== B.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && B) {
            const Ae = Qr(r.value, B);
            Ae && (o.value = Ae, r.value = null);
          }
          return;
        }
        const xe = !$ && t.lyricsPending || C;
        o.value = B ? Qr(xe, B) : null, r.value = o.value ? null : xe, $ = !!B;
      },
      { immediate: !0 }
    ), Ye(
      [o, r, te],
      () => {
        const y = o.value, C = te.value;
        y ? C && y.blocks.length === C.sections.length && (l.value = SD(y, C)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Ye(
      l,
      (y, C) => {
        b = y, i("lyricsChange", y), C !== void 0 && y !== C && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const I = N(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), _ = N(
      () => !!l.value && !t.lyricsTarget?.own && xn(l.value) !== xn(t.lyrics ?? "")
    ), H = N(() => l.value ? pr(l.value).blocks.map((y) => y.tag).join(" · ") : ""), he = N(() => l.value ?? t.lyrics ?? null);
    function ie() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...J()] };
    }
    const oe = /* @__PURE__ */ Us(null);
    function J() {
      return oe.value ?? t.lyricSpans ?? [];
    }
    function Ce(y) {
      il(y, J()) || (oe.value = y, i("lyricSpansChange", y), u.refreshLyrics());
    }
    Ye(
      () => t.lyricSpans,
      (y) => {
        y && oe.value && il(y, oe.value) || (oe.value = null, u.refreshLyrics());
      }
    );
    const fe = /* @__PURE__ */ G([]);
    Ye(
      () => u.selection,
      (y) => {
        y.length && (fe.value = []);
      }
    );
    function Se(y) {
      const C = ue.value?.lyrics;
      return !!C && !!Qy(C, y)?.lines.some((B) => B.pinned);
    }
    function Me(y) {
      const C = te.value;
      if (!C) return -1;
      let B = -1;
      return C.sections.findIndex((ae) => !ae.implicit && ++B === y);
    }
    function Ke(y) {
      if (o.value) {
        const B = Me(y);
        return B < 0 ? null : [...o.value.blocks[B]?.lines ?? []];
      }
      if (r.value === null) return null;
      const C = pr(r.value).blocks[y];
      return C ? [...C.lines] : null;
    }
    function je() {
      return Math.max(1, Math.round(te.value?.grid.units_per_quarter ?? 1));
    }
    function We(y, C, B) {
      const ae = te.value, xe = ue.value?.lyrics;
      if (!ae || !xe || !I.value) return [];
      const Ae = ie(), qe = [], Ve = /* @__PURE__ */ new Map();
      for (const _e of [...new Set(y)].sort((Et, kt) => Et - kt)) {
        const Et = Ke(_e);
        if (Et === null) continue;
        const kt = Mr(xe, _e, ae.total), cs = qy(C(_e, Th(xe, _e, Et, kt, je())), kt), Rs = cs.map((bo) => bo.text);
        if (o.value) o.value = $D(o.value, ae, Me(_e), Rs);
        else if (r.value !== null) r.value = TD(r.value, _e, Rs);
        else continue;
        cs.forEach((bo, Aa) => {
          bo.id.startsWith("*") && qe.push(vl(_e, Aa));
        }), Ve.set(_e, cs);
      }
      return Ve.size ? (Ce(Yy(J(), xe, Ve)), u.recordSide(B, Ae, ie()), qe) : [];
    }
    function tt(y) {
      const C = /* @__PURE__ */ new Map();
      for (const B of y) {
        const ae = Xy(B);
        ae && (C.has(ae.block) || C.set(ae.block, /* @__PURE__ */ new Set()), C.get(ae.block)?.add(ae.line));
      }
      return C;
    }
    function mt(y) {
      const C = new Map(y.map((ae) => [ae.key, ae])), B = y.length;
      fe.value = We(
        [...tt(y.map((ae) => ae.key)).keys()],
        (ae, xe) => xe.map((Ae, qe) => {
          const Ve = C.get(vl(ae, qe));
          return Ve ? { ...Ae, id: `*${Ae.id}`, start: Ve.start, end: Ve.end } : Ae;
        }),
        `lyrics: ${B === 1 ? "line" : `${B} lines`} placed`
      );
    }
    function Rt(y) {
      const C = tt(y);
      C.size && (We(
        [...C.keys()],
        (B, ae) => ae.filter((xe, Ae) => !C.get(B)?.has(Ae)),
        `lyrics: ${y.length === 1 ? "line" : `${y.length} lines`} deleted`
      ), fe.value = []);
    }
    function it() {
      const y = te.value, C = ue.value?.lyrics;
      if (!y || !C) return [];
      const B = [];
      for (const [ae, xe] of tt(fe.value)) {
        const Ae = Ke(ae);
        Ae && Th(C, ae, Ae, Mr(C, ae, y.total), je()).forEach((qe, Ve) => {
          xe.has(Ve) && B.push(qe);
        });
      }
      return B;
    }
    function pn() {
      const y = te.value ? HT(te.value.unit, Ah(it())) : null;
      return y ? (zi.value = y, u.error = null, u.notes = [`copied ${y.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function En(y, C, B) {
      const ae = te.value, xe = ue.value?.lyrics;
      if (!ae || !xe) return;
      const Ae = Gy(xe, C);
      if (!Ae || Ke(Ae.block) === null) {
        u.error = "The cursor is where no lyrics block is sung: set it where the lyrics lane shows lines.";
        return;
      }
      const [, qe] = Mr(xe, Ae.block, ae.total), Ve = y.filter((_e) => C + _e.offset < qe);
      Ve.length && (fe.value = We(
        [Ae.block],
        (_e, Et) => [
          ...Et,
          ...Ve.map((kt, cs) => ({
            id: `*new${cs}`,
            text: kt.text,
            start: C + kt.offset,
            end: Math.min(C + kt.offset + kt.length, qe)
          }))
        ],
        B
      ), u.error = null, Ve.length < y.length && (u.notes = [`${y.length - Ve.length} line(s) did not fit before the next block's first line`]));
    }
    function At(y) {
      const C = zi.value;
      if ((y === "paste" || y === "insert") && C?.lyricLines?.length)
        return I.value ? te.value && C.unit !== te.value.unit ? (u.error = `The lines were copied with L:${C.unit} and do not fit this score's L:${te.value.unit}.`, !0) : (En(C.lyricLines, g.value, `lyrics: ${C.label} pasted`), !0) : !0;
      if (!fe.value.length) return !1;
      if (y === "copy") pn();
      else if (y === "cut")
        pn() && Rt(fe.value);
      else if (y === "duplicate") {
        const B = it();
        if (B.length) {
          const ae = Math.max(...B.map((xe) => xe.end));
          En(Ah(B), ae, `lyrics: ${B.length === 1 ? "line" : `${B.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function Ht(y) {
      const C = te.value, B = ue.value?.lyrics;
      if (C && B && Se(y.block)) {
        const xe = je();
        We(
          [y.block],
          (Ae, qe) => {
            if (y.line < qe.length)
              return y.text ? qe.map((_e, Et) => Et === y.line ? { ..._e, text: y.text } : _e) : qe.filter((_e, Et) => Et !== y.line);
            const Ve = y.at ?? qe[qe.length - 1]?.end ?? Mr(B, y.block, C.total)[0];
            return y.text ? [...qe, { id: "*typed", text: y.text, start: Ve, end: Ve + xe }] : qe;
          },
          `lyrics: ${y.text || "line removed"}`
        );
        return;
      }
      const ae = ie();
      if (o.value && C) o.value = AD(o.value, C, Me(y.block), y.line, y.text);
      else if (r.value !== null) r.value = MD(r.value, y.block, y.line, y.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${y.text || "line removed"}`, ae, ie());
    }
    function fi() {
      const y = t.lyrics, C = te.value;
      if (!y) return;
      const B = ie();
      o.value = C ? Qr(y, C) : null, r.value = o.value ? null : y, t.readonly || u.recordSide("lyrics reverted", B, ie());
    }
    Ye(te, (y) => {
      if (!Sa || !y || r.value === null) return;
      Sa = !1;
      const C = Qr(r.value, y);
      C && (o.value = C, r.value = null);
    }), Ye(Pe, (y) => {
      !Z.value && y && te.value && (g.value = Rd(te.value, y));
    });
    const Tt = N({
      get: () => c.value.metronome,
      set: (y) => c.value = { ...c.value, metronome: y }
    }), Ei = N(() => t.payload?.reference_audio ? Ey(t.fetcher, t.payload.reference_audio) : null), ln = /* @__PURE__ */ Us(null), Bi = /* @__PURE__ */ G(null);
    Ye(
      Ei,
      (y) => {
        ln.value = null, Bi.value = null, y && bA(y).then(
          (C) => {
            Ei.value === y && (ln.value = C);
          },
          (C) => {
            Ei.value === y && (Bi.value = `the source recording could not be read: ${C instanceof Error ? C.message : String(C)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const as = N({
      get: () => c.value.hear,
      set: (y) => c.value = { ...c.value, hear: y }
    }), yn = N({
      get: () => c.value.sourceLevel,
      set: (y) => c.value = { ...c.value, sourceLevel: y }
    }), Ii = N(() => {
      const y = ue.value, C = y?.model;
      if (!y || !C) return null;
      const B = us(), ae = [...B.notes.map((_e) => [_e.onset, _e.onset + _e.duration]), ...B.chords.map((_e) => [_e.onset, _e.onset + 1])];
      if (!ae.length) return null;
      const xe = qo(C, Math.min(...ae.map(([_e]) => _e))), Ae = qo(C, Math.max(...ae.map(([, _e]) => _e)) - 1), qe = y.bars[xe - 1], Ve = y.bars[Ae - 1];
      return !qe || !Ve ? null : { from: qe.start_s, to: Ve.start_s + Ve.duration_s, label: xe === Ae ? `bar ${xe}` : `bars ${xe}-${Ae}` };
    }), Ge = N(() => {
      const y = RD(ue.value?.model, t.payload?.timeline), C = t.sourceShift ?? 0;
      return !y || !C ? y : y.map((B) => B ? [B[0] - C, B[1] - C, B[2]] : null);
    }), di = N(() => {
      const y = Ge.value?.[(Ze.value ?? 1) - 1] ?? Ge.value?.find((B) => B);
      if (!y) return 0.5;
      const C = Number(y[2].split("/")[0]) || 4;
      return (y[1] - y[0]) / C;
    }), vo = N(() => {
      const y = t.payload?.sung_pitch;
      if (!y) return null;
      const C = kA(y), B = te.value;
      return !C || !B ? { problem: "problem" in y ? y.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: C, offset: MA(B, Ge.value, C), bars: Ge.value };
    }), Ri = N({
      get: () => t.sourceShift ?? 0,
      set: (y) => i("sourceShiftChange", Math.round(y * 1e3) / 1e3)
    }), Bs = N(() => Ge.value?.map((y) => y?.[0] ?? null) ?? null), an = N(() => ue.value?.header?.unit ?? "1/16"), Bn = N({
      get: () => c.value.voices,
      set: (y) => c.value = { ...c.value, voices: y }
    }), W = N({
      get: () => c.value.speed,
      set: (y) => c.value = { ...c.value, speed: y }
    });
    function re(y, C = !1, B = "notation") {
      const ae = C ? u.selection.includes(y) ? u.selection.filter((Ae) => Ae !== y) : [...u.selection, y] : [y];
      u.select(ae);
      const xe = Cs(ue.value, ae[0]);
      m.value = B !== "text" && xe ? [xe.source[0], xe.source[1]] : m.value;
    }
    function ce(y) {
      if (!ue.value || pe.value) return;
      const C = A1(ue.value, y);
      C && re(C.id, !1, "text");
    }
    function De(y) {
      if (!ue.value) return;
      ue.value.model && (g.value = Rd(ue.value.model, y));
      const C = D1(ue.value, y);
      C && re(C.id, !1, "keys");
    }
    function Pt() {
      return D.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function bn(y) {
      t.readonly || Pt() || await u.operate(y);
    }
    function yo(y) {
      return t.readonly || Pt() ? Promise.resolve(!1) : u.operate(y);
    }
    function Sr() {
      Pt() || u.undo();
    }
    function Cr() {
      Pt() || u.redo();
    }
    function wa(y) {
      u.select(y);
      const C = Cs(ue.value, y[0]);
      C && (m.value = [C.source[0], C.source[1]]);
    }
    function us() {
      const y = te.value;
      if (!y) return { notes: [], chords: [] };
      const C = po(ue.value, u.selection), B = dr(u.selection);
      return {
        notes: [...y.tracks.vocal, ...y.tracks.ins].filter((ae) => C.has(ae.id)),
        chords: y.tracks.chords.filter((ae) => B.has(ae.id))
      };
    }
    function k() {
      const y = te.value, C = us(), B = y ? Kd(y, C.notes, C.chords) : null;
      return B ? (zi.value = B, u.error = null, u.notes = [`copied ${B.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function T(y) {
      if (At(y)) return;
      const C = te.value;
      if (y === "copy") {
        k();
        return;
      }
      if (t.readonly || !C) return;
      if (y === "cut") {
        const xe = us();
        if (!k()) return;
        await bn({ op: "delete", ids: [...xe.notes.map((Ae) => Ae.id), ...xe.chords.map((Ae) => Ae.id)] });
        return;
      }
      if (y === "duplicate") {
        const xe = us(), Ae = Kd(C, xe.notes, xe.chords);
        if (!Ae) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const qe = Math.min(...xe.notes.map((_e) => _e.onset), ...xe.chords.map((_e) => _e.onset)), Ve = jd(Ae, C, qe + Ae.span, "overwrite");
        typeof Ve == "string" ? u.error = "There is no room after the selection to duplicate it." : await bn(Ve);
        return;
      }
      const B = zi.value;
      if (!B) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const ae = jd(B, C, g.value, y === "insert" ? "insert" : "overwrite");
      typeof ae == "string" ? u.error = ae : await bn(ae);
    }
    function M(y) {
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
    function ee(y) {
      v.value = y === null || !ue.value ? null : ah(ue.value, y), D.onTime(y);
    }
    function Y() {
      t.readonly || !t.guide?.length || i("guideChange", []);
    }
    const me = N({
      get: () => c.value.rollZoom,
      set: (y) => c.value = { ...c.value, rollZoom: y }
    }), Le = N(() => ({
      "--plenio-side-w": `${c.value.sideWidth}px`,
      "--plenio-notation-fr": `${c.value.notationShare}fr`,
      "--plenio-text-fr": `${Math.round((1 - c.value.notationShare) * 1e3) / 1e3}fr`
    }));
    function Qe(y) {
      y.preventDefault();
      const C = c.value.rollHeight;
      nl(y, ({ dy: B }) => c.value = { ...c.value, rollHeight: vh(C, B) });
    }
    function Oe(y) {
      const C = y.key === "ArrowUp" ? -16 : y.key === "ArrowDown" ? 16 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, rollHeight: vh(c.value.rollHeight, C) });
    }
    function Fe(y) {
      y.preventDefault();
      const C = c.value.notationShare, ae = y.currentTarget.parentElement?.clientHeight ?? 0;
      nl(y, ({ dy: xe }) => c.value = { ...c.value, notationShare: By(C, xe, ae) });
    }
    function ft(y) {
      const C = y.key === "ArrowDown" ? 0.03 : y.key === "ArrowUp" ? -0.03 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, notationShare: $y(c.value.notationShare + C) });
    }
    function _t(y) {
      y.preventDefault();
      const C = c.value.sideWidth;
      nl(y, ({ dx: B }) => c.value = { ...c.value, sideWidth: yh(C, B) });
    }
    function zt(y) {
      const C = y.key === "ArrowLeft" ? -16 : y.key === "ArrowRight" ? 16 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, sideWidth: yh(c.value.sideWidth, C) });
    }
    const Pi = /* @__PURE__ */ G(null), pi = /* @__PURE__ */ G(null), Lt = /* @__PURE__ */ G(null), _i = /* @__PURE__ */ G(!1), ka = N(() => t.guide !== void 0), hh = N(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && ue.value?.display_abc ? null : "There is no score to export yet."), fh = N({
      get: () => c.value.paper,
      set: (y) => c.value = { ...c.value, paper: y }
    }), dh = N({
      get: () => c.value.notationSize,
      set: (y) => c.value = { ...c.value, notationSize: y }
    });
    function zv(y) {
      Lt.value = null, u.notes = [y];
    }
    const Is = N(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function Wv() {
      const y = Is.value;
      if (y) {
        Lt.value = y;
        return;
      }
      _i.value = !0, Lt.value = null;
      try {
        const C = await Dy(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        Qs(C.filename, _M(C.data));
      } catch (C) {
        Lt.value = eo(C);
      } finally {
        _i.value = !1;
      }
    }
    async function Kv() {
      const y = Is.value;
      if (y) {
        Lt.value = y;
        return;
      }
      _i.value = !0, Lt.value = null;
      try {
        const C = await Oy(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: J()
        });
        Qs(C.filename, new TextEncoder().encode(C.data), C.type);
      } catch (C) {
        Lt.value = eo(C);
      } finally {
        _i.value = !1;
      }
    }
    const ph = /* @__PURE__ */ G(null);
    function Uv() {
      const y = KD({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: J(),
        settings: z.value
      });
      Qs(UD(t.title), new TextEncoder().encode(`${JSON.stringify(y, null, 1)}
`), "application/json"), Lt.value = null, u.notes = [`saved the project: score${y.guide.length ? `, ${gh(y.guide.length)}` : ""}${y.lyrics ? ", lyrics" : ""}, settings`];
    }
    function jv() {
      Lt.value = null, ph.value?.click();
    }
    async function Gv(y) {
      const C = y.target, B = C.files?.[0];
      if (C.value = "", !B) return;
      const ae = jD(await B.text());
      typeof ae == "string" ? Lt.value = ae : qv(ae, B.name);
    }
    const gh = (y) => y === 1 ? "1 Guide note" : `${y} Guide notes`;
    let Sa = !1;
    function qv(y, C) {
      if (Pt()) return;
      if (t.readonly) {
        Lt.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const B = ["score"], ae = [], xe = ie(), Ae = {}, qe = t.guide;
      qe !== void 0 ? (xe.guide = [...qe], Ae.guide = [...y.guide], y.guide.length && B.push(gh(y.guide.length))) : y.guide.length && ae.push("the Guide notes (only the DAW sheet keeps a Guide track)"), y.lyrics && I.value ? (o.value = null, r.value = y.lyrics, Sa = !0, B.push("lyrics"), Ce(y.lyric_spans)) : y.lyrics && ae.push("the lyrics (this sheet cannot change them here)"), Object.assign(Ae, ie()), Object.keys(y.settings).length && (c.value = qd(c.value, y.settings), B.push("settings"));
      const Ve = `open project (${C})`;
      u.replaceText(y.score, Ve, null, { before: xe, after: Ae }) || u.recordSide(Ve, xe, Ae), Ae.guide && qe !== void 0 && !$o(Ae.guide, qe) && i("guideChange", Ae.guide), Lt.value = null, u.notes = [
        `opened ${C}: ${B.join(", ")}${y.title ? ` ("${y.title}")` : ""}`,
        ...ae.map((_e) => `not opened: ${_e}`)
      ];
    }
    function Yv() {
      Lt.value = null, Pi.value?.click();
    }
    async function Xv(y) {
      const C = y.target, B = C.files?.[0];
      if (C.value = "", !!B)
        try {
          pi.value = { data: PM(new Uint8Array(await B.arrayBuffer())), filename: B.name };
        } catch (ae) {
          Lt.value = eo(ae);
        }
    }
    function Jv(y, C) {
      if (t.readonly || Pt()) return;
      const B = pi.value?.filename ?? "file", ae = t.guide, xe = ae === void 0 ? void 0 : C ? [...y.guide] : [], Ae = ae === void 0 || xe === void 0 ? void 0 : { before: { guide: [...ae] }, after: { guide: xe } };
      u.replaceText(y.abc, `import MIDI (${B})`, y.analysis, Ae), xe !== void 0 && ae !== void 0 && !$o(xe, ae) && i("guideChange", xe), pi.value = null, Lt.value = null;
    }
    function Ca(y) {
      const C = y;
      return C ? !!C.closest("input, textarea, select, .cm-editor") : !1;
    }
    const Zv = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Ma(y) {
      const C = y;
      if (!C) return !1;
      if (C.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const B = C.closest("input");
      return !!B && !Zv.has(B.type);
    }
    function Qv(y) {
      y.key === " " && !Ma(y.target) && y.preventDefault();
    }
    function ey(y) {
      const C = y.ctrlKey || y.metaKey;
      if (C && !t.readonly && (y.key === "z" || y.key === "Z" || y.key === "y")) {
        if (Ca(y.target) && !y.target.closest(".cm-editor")) return;
        y.preventDefault(), y.key === "y" || y.key.toLowerCase() === "z" && y.shiftKey ? Cr() : Sr();
        return;
      }
      const B = C && !Ca(y.target) ? M(y) : null;
      if (B) {
        y.preventDefault(), y.stopPropagation(), T(B);
        return;
      }
      if (y.key === " " && !C && !Ma(y.target)) {
        y.preventDefault(), x.value?.toggle();
        return;
      }
      if (Ca(y.target) || C) return;
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
      const ae = ue.value, xe = u.primary, Ae = y.key.toLowerCase();
      if ((Ae === "g" || Ae === "h") && !y.altKey && O.value) {
        y.preventDefault(), y.shiftKey ? O.value.zoomRows(Ae === "h" ? 2 : -2) : O.value.zoomBy(Ae === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((y.key === "Home" || y.key === "End") && te.value) {
        y.preventDefault(), g.value = y.key === "Home" ? 0 : te.value.total;
        return;
      }
      if (!ae || !xe) return;
      (() => {
        switch (y.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const Ve = T1(ae, xe.id, y.key === "ArrowRight" ? 1 : -1);
            return Ve && re(Ve.id, y.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (y.altKey) {
              const kt = $1(ae, xe.id);
              return kt && re(kt.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const Ve = u.selection.filter((kt) => Cs(ae, kt)?.kind === "note"), _e = [...dr(u.selection)], Et = (y.shiftKey ? 12 : 1) * (y.key === "ArrowUp" ? 1 : -1);
            return _e.length ? bn({ op: "set_note_pitch", ids: [...po(ae, u.selection), ..._e], semitones: Et }) : Ve.length && bn({ op: "shift_pitch", ids: Ve, semitones: Et }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || xe.kind !== "note") return !1;
            const Ve = wu(xe.units, y.key === "]" ? 1 : -1);
            return Ve && bn({ op: "set_duration", id: xe.id, units: Ve }), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (xe.kind === "note" && bn({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (xe.kind !== "note" && bn({ op: "rest_to_note", id: xe.id }), !0);
          default:
            return !1;
        }
      })() && (y.preventDefault(), y.stopPropagation());
    }
    return (y, C) => (w(), A("div", {
      ref_key: "tabRoot",
      ref: L,
      class: "score-tab",
      onKeydown: ey,
      onKeyup: Qv
    }, [
      n.readonly ? Q("", !0) : (w(), wn(z$, {
        key: 0,
        view: ue.value,
        selection: V(u).selection,
        primary: V(u).primary,
        busy: V(u).busy,
        "can-undo": V(u).canUndo,
        "can-redo": V(u).canRedo,
        "undo-label": V(u).undoLabel,
        "redo-label": V(u).redoLabel,
        onOperate: bn,
        onUndo: Sr,
        onRedo: Cr
      }, null, 8, ["view", "selection", "primary", "busy", "can-undo", "can-redo", "undo-label", "redo-label"])),
      p("div", l4, [
        p("span", a4, [
          p("button", {
            role: "radio",
            "aria-checked": h.value === "review",
            class: Xe({ active: h.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: C[0] || (C[0] = (B) => f("review"))
          }, " Review ", 10, u4),
          p("button", {
            role: "radio",
            "aria-checked": X.value,
            class: Xe({ active: X.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: C[1] || (C[1] = (B) => f("daw"))
          }, " DAW ", 10, c4),
          p("button", {
            role: "radio",
            "aria-checked": h.value === "text",
            class: Xe({ active: h.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: C[2] || (C[2] = (B) => f("text"))
          }, " Text ", 10, h4)
        ]),
        Ee.value ? (w(), A(ve, { key: 0 }, [
          p("label", f4, [
            Ue(p("input", {
              "onUpdate:modelValue": C[3] || (C[3] = (B) => c.value.roll = B),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [cn, c.value.roll]
            ]),
            C[34] || (C[34] = ye(" piano roll ", -1))
          ]),
          p("label", d4, [
            Ue(p("input", {
              "onUpdate:modelValue": C[4] || (C[4] = (B) => c.value.advanced = B),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [cn, c.value.advanced]
            ]),
            C[35] || (C[35] = ye(" ABC text (advanced) ", -1))
          ])
        ], 64)) : Q("", !0),
        p("label", p4, [
          C[36] || (C[36] = ye(" zoom ", -1)),
          Ue(p("input", {
            "onUpdate:modelValue": C[5] || (C[5] = (B) => c.value.zoom = B),
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
        Vt(LM),
        p("span", g4, [
          p("button", {
            disabled: _i.value || !!Is.value,
            title: Is.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: Wv
          }, " Export MIDI ", 8, m4),
          p("button", {
            disabled: _i.value || !!Is.value,
            title: Is.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: Kv
          }, " Export MusicXML ", 8, v4),
          Vt(TO, {
            paper: fh.value,
            "onUpdate:paper": C[6] || (C[6] = (B) => fh.value = B),
            size: dh.value,
            "onUpdate:size": C[7] || (C[7] = (B) => dh.value = B),
            abc: hh.value ? null : ue.value?.display_abc ?? null,
            title: n.title ?? "",
            blocked: hh.value,
            onDone: zv,
            onFailed: C[8] || (C[8] = (B) => Lt.value = B)
          }, null, 8, ["paper", "size", "abc", "title", "blocked"]),
          p("button", {
            disabled: !n.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: Uv
          }, " Save project ", 8, y4),
          p("button", {
            disabled: n.readonly,
            title: n.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: Yv
          }, " Import MIDI… ", 8, b4),
          p("button", {
            disabled: n.readonly,
            title: n.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: jv
          }, " Open project… ", 8, x4),
          p("input", {
            ref_key: "midiFile",
            ref: Pi,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: Xv
          }, null, 544),
          p("input", {
            ref_key: "projectFile",
            ref: ph,
            class: "hidden-file",
            type: "file",
            accept: `${V(Fv)},.json,application/json`,
            "aria-label": "Project file",
            onChange: Gv
          }, null, 40, w4)
        ]),
        V(u).pending ? (w(), A("span", k4, "checking…")) : V(u).view?.ok ? (w(), A("span", S4, "✓ valid")) : pe.value ? (w(), A("span", C4, "✖ " + F(ze.value.length) + " error(s)", 1)) : Q("", !0),
        n.readonly ? (w(), A("span", M4, "read-only: owned by the other sheet")) : Q("", !0)
      ]),
      pe.value && !n.readonly ? (w(), A("p", A4, [
        C[37] || (C[37] = ye(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        V(u).canRevert ? (w(), A("button", {
          key: 0,
          onClick: C[9] || (C[9] = (B) => V(u).revertToLastValid())
        }, "Revert to last valid")) : Q("", !0),
        Ee.value && !c.value.advanced ? (w(), A("button", {
          key: 1,
          onClick: C[10] || (C[10] = (B) => c.value.advanced = !0)
        }, "Show the ABC text")) : Q("", !0)
      ])) : V(u).view?.ok && V(u).view.model_error && !n.readonly ? (w(), A("p", T4, " This score is valid for YuE2 but outside the editor's supported subset (" + F(V(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : Q("", !0),
      Z.value ? (w(), wn(RT, {
        key: 3,
        ref_key: "pianoRoll",
        ref: O,
        zoom: me.value,
        "onUpdate:zoom": C[11] || (C[11] = (B) => me.value = B),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": C[12] || (C[12] = (B) => c.value.rowHeight = B),
        follow: c.value.follow,
        "onUpdate:follow": C[13] || (C[13] = (B) => c.value.follow = B),
        track: E.value,
        "onUpdate:track": C[14] || (C[14] = (B) => E.value = B),
        recorded: V(D).recording.value ? { track: E.value, notes: V(D).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": C[15] || (C[15] = (B) => c.value.sung = B),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": C[16] || (C[16] = (B) => c.value.wave = B),
        sound: K.value,
        sung: vo.value,
        height: c.value.rollHeight,
        view: ue.value,
        selection: V(u).selection,
        playing: d.value,
        operate: yo,
        readonly: n.readonly,
        stale: pe.value,
        busy: V(u).busy,
        locator: te.value ? g.value : null,
        playhead: v.value,
        clip: V(zi)?.label ?? null,
        lyrics: ue.value?.lyrics ?? null,
        "lyrics-editable": I.value,
        source: ln.value ? { envelope: ln.value.envelope, bars: Ge.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": C[17] || (C[17] = (B) => c.value.audition = B),
        "resize-mode": "rests",
        onSelect: wa,
        onLocate: C[18] || (C[18] = (B) => g.value = B),
        onClipboard: T,
        "lyric-selection": fe.value,
        "onUpdate:lyricSelection": C[19] || (C[19] = (B) => fe.value = B),
        onLyricEdit: Ht,
        onLyricPlace: mt,
        onLyricDelete: Rt
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : Q("", !0),
      Z.value && ue.value?.model ? (w(), A("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": V(Sy),
        "aria-valuemax": V(ky),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: Qe,
        onKeydown: Oe
      }, null, 40, $4)) : Q("", !0),
      Vt(hD, {
        ref_key: "transport",
        ref: x,
        voices: Bn.value,
        "onUpdate:voices": C[22] || (C[22] = (B) => Bn.value = B),
        speed: W.value,
        "onUpdate:speed": C[23] || (C[23] = (B) => W.value = B),
        sounds: c.value.sounds,
        metronome: Tt.value,
        "onUpdate:metronome": C[24] || (C[24] = (B) => Tt.value = B),
        view: ue.value,
        bar: Ze.value,
        from: ut.value,
        position: gt.value,
        reference: Ei.value,
        hear: as.value,
        "onUpdate:hear": C[25] || (C[25] = (B) => as.value = B),
        "source-level": yn.value,
        "onUpdate:sourceLevel": C[26] || (C[26] = (B) => yn.value = B),
        "source-shift": Ri.value,
        "onUpdate:sourceShift": C[27] || (C[27] = (B) => Ri.value = B),
        "source-beat": di.value,
        "timeline-bars": Ge.value,
        guide: se.value,
        source: ln.value,
        "source-problem": Bi.value,
        "loop-range": Ii.value,
        onCursor: C[28] || (C[28] = (B) => d.value = B),
        onTime: ee,
        onStopped: V(D).onStopped
      }, {
        record: Ep(({ countingIn: B }) => [
          Vt(gO, {
            settings: j.value,
            "onUpdate:settings": C[20] || (C[20] = (ae) => j.value = ae),
            hub: V(le),
            recording: V(D).recording.value,
            "counting-in": B,
            step: V(D).step.value,
            target: E.value === "vocal" ? "Vocal" : "Ins",
            disabled: ke.value,
            onRecord: V(D).start,
            onStop: V(D).stop,
            onStep: V(D).toggleStep,
            onRest: V(D).rest,
            onEnable: V(D).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          Vt(GO, {
            sounds: R.value,
            "onUpdate:sounds": C[21] || (C[21] = (ae) => R.value = ae),
            fetcher: n.fetcher,
            settings: z.value,
            "keeps-guide": ka.value,
            onApply: P
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      p("div", {
        class: Xe(["score-main", { "with-roll": Z.value && !!ue.value?.model, "with-inspector": Ee.value }]),
        "data-layout": h.value,
        "data-text": Ee.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: Si(Le.value)
      }, [
        p("div", O4, [
          X.value ? (w(), wn(wD, {
            key: 0,
            voices: Bn.value,
            "onUpdate:voices": C[29] || (C[29] = (B) => Bn.value = B),
            view: ue.value,
            "guide-count": at.value.length,
            sounds: R.value,
            "onUpdate:sounds": C[30] || (C[30] = (B) => R.value = B),
            "keeps-guide": ka.value,
            readonly: n.readonly,
            onClearGuide: Y
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : Q("", !0),
          Vt(g$, {
            view: ue.value,
            bar: Pe.value,
            "error-bars": Be.value,
            "source-starts": Bs.value,
            readonly: n.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: De,
            onOperate: bn,
            onNotice: C[31] || (C[31] = (B) => V(u).notes = [B])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          n.lyricsTarget && l.value !== null ? (w(), A("div", L4, [
            C[38] || (C[38] = p("strong", null, "Lyrics", -1)),
            n.lyricsTarget.blocked ? (w(), A("p", E4, F(n.lyricsTarget.blocked), 1)) : (w(), A(ve, { key: 1 }, [
              _.value ? (w(), A("p", B4, [
                ye(" Apply writes the changed lyrics into " + F(n.lyricsTarget.title) + ": " + F(H.value) + ". That sheet then asks for approval again. ", 1),
                n.lyricsTarget.replans ? (w(), A(ve, { key: 0 }, [
                  ye(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : Q("", !0)
              ])) : (w(), A("p", I4, [
                ye(F(n.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${n.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !n.readonly ? (w(), A(ve, { key: 0 }, [
                  ye("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : Q("", !0)
              ])),
              _.value ? (w(), A("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: fi
              }, " Revert the lyrics ")) : Q("", !0)
            ], 64))
          ])) : Q("", !0),
          Ee.value && he.value ? (w(), A("details", R4, [
            C[39] || (C[39] = p("summary", null, "Lyrics fit", -1)),
            Vt(og, {
              lyrics: he.value,
              abc: n.doc.text,
              fetcher: n.fetcher,
              engine: n.payload?.engine ?? null,
              instrumental: n.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])
          ])) : Q("", !0)
        ]),
        p("div", {
          class: "splitter vertical",
          role: "separator",
          tabindex: "0",
          "aria-label": "Resize the side column",
          "aria-valuenow": c.value.sideWidth,
          "aria-valuemin": V(My),
          "aria-valuemax": V(Cy),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: _t,
          onKeydown: zt
        }, null, 40, P4),
        p("div", {
          class: Xe(["score-views", { split: Ee.value && c.value.advanced }])
        }, [
          Ee.value ? Q("", !0) : (w(), wn(Td, {
            key: 0,
            text: n.doc.text,
            diagnostics: ze.value,
            reveal: m.value,
            readonly: n.readonly,
            onChange: V(u).typed,
            onCursor: ce
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          Vt(cA, {
            view: ue.value,
            stale: pe.value,
            selection: V(u).selection,
            playing: d.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: C[32] || (C[32] = (B, ae) => re(B, ae))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          Ee.value && c.value.advanced ? (w(), A("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": V(Ty),
            "aria-valuemax": V(Ay),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: Fe,
            onKeydown: ft
          }, null, 40, _4)) : Q("", !0),
          Ee.value && c.value.advanced ? (w(), wn(Td, {
            key: 2,
            text: n.doc.text,
            diagnostics: ze.value,
            reveal: m.value,
            readonly: n.readonly,
            onChange: V(u).typed,
            onCursor: ce
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : Q("", !0)
        ], 2),
        Ee.value ? (w(), wn(TM, {
          key: 0,
          view: ue.value,
          selection: V(u).selection,
          operate: yo,
          "fallback-bar": V(u).primary?.bar ?? null,
          readonly: n.readonly,
          stale: pe.value,
          busy: V(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : Q("", !0)
      ], 14, D4),
      p("p", N4, [
        p("span", null, F(V(u).selection.length > 1 ? `${V(u).selection.length} selected · ` : "") + F(V(L1)(V(u).primary, an.value)), 1),
        (w(!0), A(ve, null, Ie(V(u).notes, (B, ae) => (w(), A("span", {
          key: ae,
          class: "change"
        }, F(B), 1))), 128))
      ]),
      V(u).error ? (w(), A("p", V4, F(V(u).error), 1)) : Q("", !0),
      Lt.value ? (w(), A("p", H4, F(Lt.value), 1)) : Q("", !0),
      U.value ? (w(), A("p", F4, F(U.value), 1)) : Q("", !0),
      pi.value ? (w(), wn(lA, {
        key: 8,
        fetcher: n.fetcher,
        data: pi.value.data,
        filename: pi.value.filename,
        view: ue.value,
        "keeps-guide": ka.value,
        "current-guide": at.value.length,
        onClose: C[33] || (C[33] = (B) => pi.value = null),
        onInsert: Jv
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : Q("", !0),
      ze.value.length ? (w(), A("ul", z4, [
        (w(!0), A(ve, null, Ie(ze.value, (B, ae) => (w(), A("li", {
          key: ae,
          "data-severity": B.severity
        }, [
          p("strong", null, F(B.severity), 1),
          B.bar ? (w(), A("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${B.bar}`,
            onClick: (xe) => De(B.bar)
          }, "bar " + F(B.bar), 9, K4)) : B.line ? (w(), A("span", U4, "line " + F(B.line), 1)) : Q("", !0),
          ye(" " + F(B.message), 1)
        ], 8, W4))), 128))
      ])) : Q("", !0)
    ], 544));
  }
}), j4 = ["aria-label"], G4 = ["title"], q4 = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, Y4 = ["aria-selected", "onClick"], X4 = ["title", "aria-label", "aria-pressed"], J4 = {
  key: 0,
  class: "hint"
}, Z4 = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, Q4 = ["disabled", "title"], eL = {
  class: "body",
  role: "tabpanel"
}, tL = { class: "doc-head" }, nL = ["data-state"], iL = ["disabled", "onClick"], sL = ["disabled", "onClick"], oL = ["onClick"], rL = {
  key: 0,
  class: "conflict"
}, lL = ["onClick"], aL = ["onClick"], uL = ["onClick"], cL = ["onUpdate:modelValue", "rows", "aria-label", "onInput"], hL = {
  key: 3,
  class: "tag-helpers"
}, fL = ["title", "onClick"], dL = {
  key: 0,
  class: "facts"
}, pL = {
  key: 4,
  class: "asr"
}, gL = { key: 0 }, mL = { key: 1 }, vL = { key: 5 }, yL = {
  key: 0,
  class: "diff"
}, bL = { key: 0 }, xL = { key: 1 }, wL = { key: 2 }, kL = { key: 3 }, SL = {
  key: 0,
  class: "doc context wide"
}, CL = { class: "doc-head" }, ML = ["title"], AL = {
  key: 1,
  class: "badge"
}, TL = {
  key: 0,
  class: "hint score-owner"
}, $L = {
  key: 1,
  class: "hint"
}, DL = {
  key: 1,
  class: "doc sections"
}, OL = {
  key: 0,
  class: "doc context"
}, LL = { class: "doc-head" }, EL = {
  class: "findings",
  "aria-label": "Validation"
}, BL = ["data-status"], IL = { key: 0 }, RL = ["title"], PL = { key: 1 }, _L = ["title"], NL = { class: "idea" }, VL = {
  key: 0,
  class: "idea"
}, HL = {
  key: 1,
  class: "idea"
}, FL = { class: "where" }, zL = {
  key: 0,
  class: "kept"
}, WL = {
  key: 1,
  class: "error"
}, KL = {
  key: 2,
  class: "error"
}, UL = {
  key: 3,
  class: "error"
}, jL = {
  key: 4,
  class: "error"
}, GL = ["data-severity"], qL = { class: "where" }, YL = {
  key: 0,
  class: "facts"
}, XL = ["disabled"], JL = ["disabled", "title"], ZL = ["disabled", "title"], QL = ["aria-valuenow", "title"], eE = /* @__PURE__ */ Qt({
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = N(() => t.payload?.style_label === "caption"), u = N(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (W) => W === "style" && a.value ? "Caption" : o[W], h = (W) => W === "style" && a.value ? 14 : l[W], f = /* @__PURE__ */ xs(bh(t.state, t.payload, t.owned)), d = /* @__PURE__ */ G(t.payload), g = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1), x = /* @__PURE__ */ G(null), O = N(() => {
      const W = f.find((ce) => ce.kind === "score"), re = x.value;
      return W && re?.reason && re.text === W.text ? re.reason : null;
    }), L = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G(0);
    let R;
    const z = N(() => t.payload?.context?.score ?? null), P = /* @__PURE__ */ xs({ kind: "score", text: z.value ?? "", intent: "keep" }), q = N(
      () => !f.some((W) => W.kind === "score") && !!z.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), K = /* @__PURE__ */ G(null), le = N(() => {
      const W = K.value;
      return q.value && W?.reason && W.text === P.text ? W.reason : null;
    }), j = N(
      () => q.value && z.value && xn(P.text) !== xn(z.value) ? P.text : null
    );
    function D() {
      if (!j.value) return;
      const W = f.find((re) => re.kind === "lyrics");
      W && W.intent !== "auto" && (W.intent = "manual");
    }
    const U = N(() => {
      const W = new Set(f.map((re) => s[re.kind]));
      for (const re of Object.keys(t.payload?.context ?? {}))
        re in s && W.add(s[re]);
      return ["score", "lyrics", "style", "details"].filter((re) => W.has(re));
    }), ke = f[0] ? s[f[0].kind] : "lyrics", Te = /* @__PURE__ */ G(ke), ue = (W) => t.payload?.docs[W] ?? null, pe = (W) => ue(W)?.upstream ?? null, ze = (W) => ue(W)?.status === "conflict", Be = (W) => f.filter((re) => s[re.kind] === W), Pe = N(() => f.find((W) => W.kind === "score") ?? null), Ee = N(() => Pe.value?.text ?? z.value ?? null), X = N(
      () => f.find((W) => W.kind === "lyrics")?.text ?? t.payload?.context?.lyrics ?? null
    ), at = N(
      () => f.find((W) => W.kind === "title")?.text ?? t.payload?.context?.title ?? null
    ), be = N(() => Ny(t.payload?.timeline)), Re = N(() => {
      const W = t.asrNote ?? L.value;
      return W && W.draft_sha256 === ue("lyrics")?.upstream_sha256 ? W : null;
    }), se = (W) => v1(pe(W.kind) ?? "", W.text);
    function Z(W) {
      if (W.intent === "auto") return "auto";
      if (W.intent === "manual") return "manual";
      if (W.intent === "rebase") return "edited (merged)";
      if (ze(W.kind)) return "conflict";
      const re = t.state.docs[W.kind]?.state ?? "auto", ce = xn(pe(W.kind) ?? "");
      return re === "auto" && xn(W.text) !== ce ? ce || !t.payload ? "edited" : "manual" : re;
    }
    function te(W) {
      W.intent = "auto", W.text = pe(W.kind) ?? "";
    }
    function Ze(W) {
      W.intent = "manual";
    }
    function ut(W, re) {
      W.text = m1(W.text, re), b(W);
    }
    function gt(W) {
      W.intent = "manual";
    }
    function S(W) {
      W.intent = "rebase";
    }
    function b(W) {
      W.intent === "auto" && (W.intent = "keep");
    }
    function $() {
      bh(t.state, t.payload, t.owned).forEach((re, ce) => Object.assign(f[ce], re)), H.value = [...t.guide ?? []], ie.value = [...t.lyricSpans ?? []], J.value = t.sourceShift ?? 0, P.text = z.value ?? "", E.value++;
    }
    const I = N(
      () => f.filter((W) => ze(W.kind) && W.intent === "keep").map((W) => W.kind)
    ), _ = N(() => Vy(t.state, t.payload, f)), H = /* @__PURE__ */ G([...t.guide ?? []]);
    function he(W) {
      H.value = W;
    }
    const ie = /* @__PURE__ */ G([...t.lyricSpans ?? []]);
    function oe(W) {
      ie.value = W;
    }
    const J = /* @__PURE__ */ G(t.sourceShift ?? 0);
    function Ce(W) {
      J.value = W;
    }
    function fe() {
      return { lyricSpans: ie.value, sourceShift: J.value };
    }
    const Se = /* @__PURE__ */ G(null), Me = N(() => f.find((W) => W.kind === "lyrics") ?? null), Ke = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, je = N(() => Me.value ? Ke : t.lyricsTarget ?? null), We = N(() => {
      const W = t.payload?.context?.lyrics, re = Se.value;
      return Me.value || !je.value || je.value.blocked || !re || !W ? null : xn(re) !== xn(W) ? re : null;
    });
    function tt(W) {
      const re = Me.value;
      re ? W !== null && xn(W) !== xn(re.text) && (re.text = W, b(re)) : Se.value = W;
    }
    function mt() {
      if (!We.value || !je.value?.replans) return;
      const W = f.find((re) => re.kind === "score");
      W && W.intent === "keep" && (W.intent = "manual");
    }
    const Rt = N(
      () => Ch(_.value) !== Ch(t.state) || !$o(H.value, t.guide ?? []) || !il(ie.value, t.lyricSpans ?? []) || J.value !== (t.sourceShift ?? 0) || We.value !== null || j.value !== null
    ), it = N(() => {
      const W = t.payload?.arrangement;
      return W && W.status !== "skipped" ? W : null;
    }), pn = N(() => Hy(it.value?.notes ?? [])), En = N(() => (d.value?.findings ?? []).filter((W) => W.severity !== "info")), At = N(() => (d.value?.findings ?? []).filter((W) => W.severity === "info")), Ht = N(() => En.value.some((W) => W.severity === "error")), fi = N(
      () => !v.value && !Ht.value && !I.value.length && !O.value && !le.value && !!d.value?.fingerprint
    ), Tt = N(
      () => I.value.length ? "Resolve the conflicts first." : O.value ?? le.value
    ), Ei = N(() => I.value.length ? "⇄ conflict" : Ht.value ? "✖ errors" : En.value.length ? "⚠ warnings" : d.value?.waiting && !Rt.value ? "⏸ waiting for approval" : d.value ? "✓ valid" : "not run yet");
    async function ln() {
      if (t.payload) {
        v.value = !0, g.value = null;
        try {
          d.value = await Py(t.fetcher, {
            sheet_state: _.value,
            upstream: _y(t.payload),
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
          g.value = W instanceof Zd ? `${W.message}${W.hint ? ` — ${W.hint}` : ""}` : String(W);
        } finally {
          v.value = !1;
        }
      }
    }
    Ye(
      () => [...f.map((W) => W.text + W.intent), j.value ?? ""].join("\0"),
      () => {
        clearTimeout(R), R = setTimeout(ln, 300);
      }
    );
    function Bi(W) {
      return j.value ? { text: j.value, approved: W } : null;
    }
    function as() {
      Tt.value || (mt(), D(), i(
        "apply",
        kh(_.value, t.state.review?.approved_fingerprint ?? null),
        H.value,
        We.value,
        Bi(!1),
        !1,
        fe()
      ));
    }
    async function yn() {
      mt(), D(), await ln(), fi.value && i(
        "apply",
        kh(_.value, d.value?.fingerprint ?? null),
        H.value,
        We.value,
        Bi(!0),
        !0,
        fe()
      );
    }
    function Ii() {
      Rt.value ? m.value = !0 : i("close");
    }
    const Ge = /* @__PURE__ */ xs(Iy()), di = /* @__PURE__ */ xs({ width: window.innerWidth, height: window.innerHeight }), vo = N(() => {
      const W = Ge.maximized ? di.height - 2 * Mh : Ge.height;
      return Ge.maximized ? {
        width: `${di.width - 2 * Mh}px`,
        height: `${W}px`,
        "--plenio-dialog-h": `${W}px`
      } : { width: `${Ge.width}px`, height: `${Ge.height}px`, "--plenio-dialog-h": `${W}px` };
    });
    function Ri() {
      di.width = window.innerWidth, di.height = window.innerHeight;
      const W = Sh({ width: Ge.width, height: Ge.height }, di);
      (W.width !== Ge.width || W.height !== Ge.height) && (Ge.width = W.width, Ge.height = W.height, $a(Ge));
    }
    function Bs() {
      Ge.maximized = !Ge.maximized, $a(Ge);
    }
    function an(W) {
      W.preventDefault(), W.stopPropagation();
      const re = { width: Ge.width, height: Ge.height };
      nl(
        W,
        ({ dx: ce, dy: De }) => {
          const Pt = Sh(
            { width: re.width + ce, height: re.height + De },
            { width: window.innerWidth, height: window.innerHeight }
          );
          Ge.width = Pt.width, Ge.height = Pt.height;
        },
        () => $a(Ge)
      );
    }
    function Bn(W) {
      W.key === "Escape" && !W.defaultPrevented && (W.preventDefault(), m.value ? m.value = !1 : Ii());
    }
    return vr(() => {
      window.addEventListener("keydown", Bn), window.addEventListener("resize", Ri), t.payload && ln();
      const W = ue("lyrics")?.upstream_sha256;
      !t.asrNote && W && Ry(t.fetcher, W).then((re) => L.value = re).catch(() => {
      });
    }), Di(() => {
      window.removeEventListener("keydown", Bn), window.removeEventListener("resize", Ri), clearTimeout(R);
    }), (W, re) => (w(), A("div", {
      class: "plenio-overlay",
      onMousedown: ct(Ii, ["self"])
    }, [
      p("div", {
        class: Xe(["plenio-dialog", { maximized: Ge.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": n.title,
        style: Si(vo.value)
      }, [
        p("header", {
          onDblclick: ct(Bs, ["self"])
        }, [
          p("h2", null, F(n.title), 1),
          p("span", {
            class: Xe(["status", { bad: Ht.value || I.value.length }]),
            title: d.value?.status ?? ""
          }, F(Ei.value), 11, G4),
          p("div", q4, [
            (w(!0), A(ve, null, Ie(U.value, (ce) => (w(), A("button", {
              key: ce,
              role: "tab",
              "aria-selected": Te.value === ce,
              class: Xe({ active: Te.value === ce }),
              onClick: (De) => Te.value = ce
            }, F(c(ce)), 11, Y4))), 128))
          ]),
          p("button", {
            class: "icon",
            title: Ge.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": Ge.maximized ? "Restore" : "Maximize",
            "aria-pressed": Ge.maximized,
            onClick: Bs
          }, F(Ge.maximized ? "❐" : "⛶"), 9, X4),
          p("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: Ii
          }, "×")
        ], 32),
        n.payload ? Q("", !0) : (w(), A("p", J4, [...re[4] || (re[4] = [
          ye(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          p("em", null, "Make manual", -1),
          ye(". ", -1)
        ])])),
        m.value ? (w(), A("div", Z4, [
          re[5] || (re[5] = ye(" You have changes that are not applied yet. ", -1)),
          p("button", {
            class: "primary",
            disabled: !!Tt.value,
            title: Tt.value ?? "Save your documents into the node",
            onClick: as
          }, " Apply ", 8, Q4),
          p("button", {
            onClick: re[0] || (re[0] = (ce) => i("close"))
          }, "Discard"),
          p("button", {
            onClick: re[1] || (re[1] = (ce) => m.value = !1)
          }, "Keep editing")
        ])) : Q("", !0),
        p("div", eL, [
          (w(!0), A(ve, null, Ie(Be(Te.value), (ce) => (w(), A("section", {
            key: ce.kind + E.value,
            class: Xe(["doc", { wide: ce.kind === "score" }])
          }, [
            p("div", tL, [
              p("h3", null, F(u.value[ce.kind]), 1),
              p("span", {
                class: "badge",
                "data-state": Z(ce)
              }, F(Z(ce)), 9, nL),
              re[6] || (re[6] = p("span", { class: "spacer" }, null, -1)),
              p("button", {
                disabled: pe(ce.kind) === null,
                title: "Discard your edit and use the draft",
                onClick: (De) => te(ce)
              }, " Use draft ", 8, iL),
              ce.kind === "lyrics" ? (w(), A("button", {
                key: 0,
                disabled: ce.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (De) => Ze(ce)
              }, " Use my own lyrics ", 8, sL)) : (w(), A("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (De) => Ze(ce)
              }, " Make manual ", 8, oL))
            ]),
            ze(ce.kind) && ce.intent === "keep" ? (w(), A("div", rL, [
              ye(" The draft changed after you edited this document (" + F(ue(ce.kind)?.reason) + "). ", 1),
              p("button", {
                onClick: (De) => gt(ce)
              }, "Keep my edit (manual)", 8, lL),
              p("button", {
                onClick: (De) => te(ce)
              }, "Use the new draft", 8, aL),
              p("button", {
                onClick: (De) => S(ce)
              }, "Merge by hand", 8, uL)
            ])) : Q("", !0),
            ce.kind === "score" ? (w(), wn(Jd, {
              key: 1,
              doc: ce,
              fetcher: n.fetcher,
              payload: n.payload,
              readonly: !1,
              "layout-default": n.layout ?? null,
              lyrics: X.value,
              title: at.value,
              guide: H.value,
              "lyric-spans": ie.value,
              "source-shift": J.value,
              "lyrics-target": je.value,
              "lyrics-pending": Me.value ? null : Se.value,
              onEdited: (De) => b(ce),
              onGuideChange: he,
              onLyricSpansChange: oe,
              onSourceShiftChange: Ce,
              onLyricsChange: tt,
              onGate: re[2] || (re[2] = (De, Pt) => x.value = { text: De, reason: Pt })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : Ue((w(), A("textarea", {
              key: 2,
              "onUpdate:modelValue": (De) => ce.text = De,
              rows: h(ce.kind),
              spellcheck: "false",
              "aria-label": u.value[ce.kind],
              onInput: (De) => b(ce)
            }, null, 40, cL)), [
              [Nt, ce.text]
            ]),
            ce.kind === "lyrics" ? (w(), A("p", hL, [
              re[7] || (re[7] = p("span", null, "Section tags (the model sings section by section):", -1)),
              (w(!0), A(ve, null, Ie(V(g1), (De) => (w(), A("button", {
                key: De,
                title: `Add [${De}]`,
                onClick: (Pt) => ut(ce, De)
              }, " [" + F(De) + "] ", 9, fL))), 128)),
              ce.intent === "manual" ? (w(), A("span", dL, "the writer is not consulted - these are your lyrics")) : Q("", !0)
            ])) : Q("", !0),
            ce.kind === "lyrics" && Re.value ? (w(), A("p", pL, [
              p("span", null, "Transcribed (" + F(Re.value.language) + ").", 1),
              Re.value.low_confidence.length ? (w(), A("span", gL, [
                re[8] || (re[8] = ye(" Check these unsure words: ", -1)),
                (w(!0), A(ve, null, Ie(Re.value.low_confidence, (De, Pt) => (w(), A("mark", {
                  key: "low-" + Pt
                }, F(De), 1))), 128))
              ])) : Q("", !0),
              Re.value.left_out.length ? (w(), A("span", mL, [
                re[9] || (re[9] = ye("Left out as not sung: ", -1)),
                p("s", null, F(Re.value.left_out.join(" ")), 1)
              ])) : Q("", !0)
            ])) : Q("", !0),
            pe(ce.kind) !== null && V(xn)(pe(ce.kind) ?? "") !== V(xn)(ce.text) ? (w(), A("details", vL, [
              p("summary", null, "Changes against the draft (" + F(V(y1)(se(ce))) + " words)", 1),
              ce.kind !== "score" ? (w(), A("p", yL, [
                (w(!0), A(ve, null, Ie(se(ce), (De, Pt) => (w(), A(ve, { key: Pt }, [
                  De.text === V(nr) ? (w(), A("br", bL)) : De.op === "added" ? (w(), A("ins", xL, F(De.text + " "), 1)) : De.op === "removed" ? (w(), A("del", wL, F(De.text + " "), 1)) : (w(), A("span", kL, F(De.text + " "), 1))
                ], 64))), 128))
              ])) : Q("", !0),
              p("pre", null, F(pe(ce.kind)), 1)
            ])) : Q("", !0),
            ce.kind === "lyrics" ? (w(), wn(og, {
              key: 6,
              lyrics: ce.text,
              abc: Ee.value,
              fetcher: n.fetcher,
              engine: n.payload?.engine ?? null,
              instrumental: n.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : Q("", !0)
          ], 2))), 128)),
          Te.value === "score" && !Pe.value && z.value ? (w(), A("section", SL, [
            p("div", CL, [
              re[10] || (re[10] = p("h3", null, "Score (ABC)", -1)),
              q.value ? (w(), A("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${n.scoreTarget?.title}`
              }, " from " + F(n.scoreTarget?.title) + F(j.value ? " · changed" : ""), 9, ML)) : (w(), A("span", AL, "from the other sheet (read-only)"))
            ]),
            q.value ? (w(), A("p", TL, [
              re[11] || (re[11] = ye(" Changes to the score go into ", -1)),
              p("strong", null, F(n.scoreTarget?.title), 1),
              re[12] || (re[12] = ye(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              re[13] || (re[13] = p("strong", null, "Approve", -1)),
              re[14] || (re[14] = ye(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : n.scoreTarget?.blocked ? (w(), A("p", $L, F(n.scoreTarget.blocked), 1)) : Q("", !0),
            Vt(Jd, {
              doc: P,
              fetcher: n.fetcher,
              payload: n.payload,
              readonly: !q.value,
              "layout-default": n.layout ?? null,
              lyrics: X.value,
              "lyrics-target": Me.value ? je.value : null,
              "lyric-spans": ie.value,
              "source-shift": J.value,
              onLyricSpansChange: oe,
              onSourceShiftChange: Ce,
              onLyricsChange: tt,
              onGate: re[3] || (re[3] = (ce, De) => K.value = { text: ce, reason: De })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : Q("", !0),
          Te.value === "lyrics" && be.value.length ? (w(), A("section", DL, [
            re[16] || (re[16] = p("div", { class: "doc-head" }, [
              p("h3", null, "Sections of the source"),
              p("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            p("table", null, [
              re[15] || (re[15] = p("thead", null, [
                p("tr", null, [
                  p("th", null, "Section"),
                  p("th", null, "Bars"),
                  p("th", null, "From"),
                  p("th", null, "To")
                ])
              ], -1)),
              p("tbody", null, [
                (w(!0), A(ve, null, Ie(be.value, (ce, De) => (w(), A("tr", { key: De }, [
                  p("td", null, F(ce.label), 1),
                  p("td", null, F(ce.bars), 1),
                  p("td", null, F(ce.start), 1),
                  p("td", null, F(ce.end), 1)
                ]))), 128))
              ])
            ])
          ])) : Q("", !0),
          (w(!0), A(ve, null, Ie(n.payload?.context ?? {}, (ce, De) => (w(), A(ve, {
            key: "context-" + De
          }, [
            De !== "score" && s[De] === Te.value ? (w(), A("section", OL, [
              p("div", LL, [
                p("h3", null, F(u.value[De] ?? De), 1),
                re[17] || (re[17] = p("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              p("pre", null, F(ce), 1)
            ])) : Q("", !0)
          ], 64))), 128))
        ]),
        p("section", EL, [
          it.value ? (w(), A("div", {
            key: 0,
            class: "arrangement",
            "data-status": it.value.status
          }, [
            it.value.status === "fallback" ? (w(), A("p", IL, [
              re[18] || (re[18] = p("strong", null, "Arrangement not applied", -1)),
              p("span", {
                class: "experimental",
                title: V(Ta)
              }, "experimental", 8, RL),
              ye(" - " + F(V(xh)(it.value)) + ": " + F(it.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (w(), A("details", PL, [
              p("summary", null, [
                re[19] || (re[19] = p("strong", null, "Arrangement", -1)),
                p("span", {
                  class: "experimental",
                  title: V(Ta)
                }, "experimental", 8, _L),
                ye(" " + F(V(xh)(it.value)) + ": " + F(it.value.summary), 1)
              ]),
              p("p", NL, F(V(Ta)), 1),
              V(wh)(it.value) ? (w(), A("p", VL, F(V(wh)(it.value)), 1)) : Q("", !0),
              it.value.idea ? (w(), A("p", HL, F(it.value.idea), 1)) : Q("", !0),
              p("ul", null, [
                (w(!0), A(ve, null, Ie(it.value.sections ?? [], (ce) => (w(), A("li", {
                  key: ce.index
                }, [
                  p("strong", null, F(ce.index) + " " + F(ce.label), 1),
                  p("span", FL, "bars " + F(ce.bars), 1),
                  ye(" " + F(ce.applied.length ? ce.applied.join("; ") : "unchanged") + " ", 1),
                  ce.kept.length ? (w(), A("span", zL, " - kept: " + F(ce.kept.join("; ")), 1)) : Q("", !0)
                ]))), 128)),
                (w(!0), A(ve, null, Ie(pn.value, (ce, De) => (w(), A("li", {
                  key: "note" + De,
                  "data-severity": "info"
                }, F(ce), 1))), 128))
              ])
            ]))
          ], 8, BL)) : Q("", !0),
          g.value ? (w(), A("p", WL, F(g.value), 1)) : Q("", !0),
          I.value.length ? (w(), A("p", KL, " Resolve the conflict in: " + F(I.value.join(", ")) + ". ", 1)) : Q("", !0),
          O.value ? (w(), A("p", UL, "Score: " + F(O.value), 1)) : le.value ? (w(), A("p", jL, "Score: " + F(le.value), 1)) : Q("", !0),
          p("ul", null, [
            (w(!0), A(ve, null, Ie(En.value, (ce, De) => (w(), A("li", {
              key: De,
              "data-severity": ce.severity
            }, [
              p("strong", null, F(ce.severity), 1),
              re[20] || (re[20] = ye()),
              p("span", qL, F(ce.where), 1),
              ye(" " + F(ce.message), 1)
            ], 8, GL))), 128)),
            (w(!0), A(ve, null, Ie(At.value, (ce, De) => (w(), A("li", {
              key: "i" + De,
              "data-severity": "info"
            }, F(ce.message), 1))), 128))
          ])
        ]),
        p("footer", null, [
          n.owned.includes("score") && d.value ? (w(), A("span", YL, " render: " + F(d.value.planning_mode) + ", ceiling " + F(Math.round(d.value.score_seconds)) + " s ", 1)) : Q("", !0),
          re[21] || (re[21] = p("span", { class: "spacer" }, null, -1)),
          p("button", {
            disabled: !Rt.value,
            title: "Discard every change made in this editor",
            onClick: $
          }, "Revert", 8, XL),
          p("button", { onClick: Ii }, "Close"),
          p("button", {
            class: "primary",
            disabled: !!Tt.value,
            title: Tt.value ?? "Save your documents into the node",
            onClick: as
          }, " Apply ", 8, JL),
          n.review === "stop for review" ? (w(), A("button", {
            key: 1,
            class: "primary",
            disabled: !fi.value,
            title: O.value ?? "Release exactly these documents for the next run",
            onClick: yn
          }, " Approve ", 8, ZL)) : Q("", !0)
        ]),
        Ge.maximized ? Q("", !0) : (w(), A("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": Ge.width,
          title: `Resize (${Ge.width} × ${Ge.height})`,
          onPointerdown: an
        }, null, 40, QL))
      ], 14, j4)
    ], 32));
  }
});
function tE() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const n = document.createElement("style");
  n.id = "plenio-dialog-styles", n.textContent = p1, document.head.append(n);
}
function aE(n) {
  tE();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    i.unmount(), e.remove();
  }, i = h1(eE, {
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
  aE as openSheetDialog
};
