import { a as Ly, P as wp, b as Ey, t as Iy, i as By, l as Cl, p as xp, e as Ry, c as Py, s as cl, d as Ph, f as _y, g as Ir, h as _h, j as Ny, w as Vy, k as Hy, r as Fy, n as xn, v as zy, m as Nh, o as Wy, A as Ra, q as Vh, u as Ky, x as Uy, y as Hh, z as jy, B as Gy, C as Fh, D as qy } from "./main-CElittRO.mjs";
import { a as Yy, r as Xy, n as Jy, e as Pa, b as Zy, s as Qy, p as e0 } from "./notationExport-CNhQ8iYZ.mjs";
import { notesLabel as t0, trackRows as n0, parseGuide as i0, sameGuide as Lo, remapGuide as s0, guideNotes as o0 } from "./tracks-DxmZeggM.mjs";
// @__NO_SIDE_EFFECTS__
function Tc(n) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const t of n.split(",")) e[t] = 1;
  return (t) => t in e;
}
const ut = {}, bs = [], ks = () => {
}, kp = () => !1, Ql = (n) => n.charCodeAt(0) === 111 && n.charCodeAt(1) === 110 && // uppercase letter
(n.charCodeAt(2) > 122 || n.charCodeAt(2) < 97), ea = (n) => n.startsWith("onUpdate:"), Ln = Object.assign, Sp = (n, e) => {
  const t = n.indexOf(e);
  t > -1 && n.splice(t, 1);
}, r0 = Object.prototype.hasOwnProperty, gt = (n, e) => r0.call(n, e), Ve = Array.isArray, qi = (n) => wr(n) === "[object Map]", Di = (n) => wr(n) === "[object Set]", zh = (n) => wr(n) === "[object Date]", dt = (n) => typeof n == "function", Rt = (n) => typeof n == "string", Wn = (n) => typeof n == "symbol", $t = (n) => n !== null && typeof n == "object", Cp = (n) => ($t(n) || dt(n)) && dt(n.then) && dt(n.catch), Mp = Object.prototype.toString, wr = (n) => Mp.call(n), l0 = (n) => wr(n).slice(8, -1), Ap = (n) => wr(n) === "[object Object]", $c = (n) => Rt(n) && n !== "NaN" && n[0] !== "-" && "" + parseInt(n, 10) === n, Ho = /* @__PURE__ */ Tc(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), ta = (n) => {
  const e = /* @__PURE__ */ Object.create(null);
  return ((t) => e[t] || (e[t] = n(t)));
}, a0 = /-\w/g, An = ta(
  (n) => n.replace(a0, (e) => e.slice(1).toUpperCase())
), u0 = /\B([A-Z])/g, Ii = ta(
  (n) => n.replace(u0, "-$1").toLowerCase()
), Tp = ta((n) => n.charAt(0).toUpperCase() + n.slice(1)), _a = ta(
  (n) => n ? `on${Tp(n)}` : ""
), Ut = (n, e) => !Object.is(n, e), hl = (n, ...e) => {
  for (let t = 0; t < n.length; t++)
    n[t](...e);
}, $p = (n, e, t, i = !1) => {
  Object.defineProperty(n, e, {
    configurable: !0,
    enumerable: !1,
    writable: i,
    value: t
  });
}, na = (n) => {
  const e = parseFloat(n);
  return isNaN(e) ? n : e;
};
let Wh;
const ia = () => Wh || (Wh = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Mi(n) {
  if (Ve(n)) {
    const e = {};
    for (let t = 0; t < n.length; t++) {
      const i = n[t], s = Rt(i) ? d0(i) : Mi(i);
      if (s)
        for (const o in s)
          e[o] = s[o];
    }
    return e;
  } else if (Rt(n) || $t(n))
    return n;
}
const c0 = /;(?![^(]*\))/g, h0 = /:([^]+)/, f0 = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function d0(n) {
  const e = {};
  return n.replace(f0, (t) => t.startsWith("/*") ? "" : t).split(c0).forEach((t) => {
    if (t) {
      const i = t.split(h0);
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
  else if ($t(n))
    for (const t in n)
      n[t] && (e += t + " ");
  return e.trim();
}
const p0 = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", g0 = /* @__PURE__ */ Tc(p0);
function Dp(n) {
  return !!n || n === "";
}
function m0(n, e, t) {
  if (n.length !== e.length) return !1;
  let i = !0;
  for (let s = 0; i && s < n.length; s++)
    i = Oi(n[s], e[s], t);
  return i;
}
function Kh(n, e, t) {
  if (n.size !== e.size) return !1;
  const i = Array.from(e), s = new Uint8Array(i.length);
  for (const o of n) {
    let r = -1;
    for (let l = 0; l < i.length; l++)
      if (!s[l] && Oi(o, i[l], t)) {
        r = l;
        break;
      }
    if (r < 0) return !1;
    s[r] = 1;
  }
  return !0;
}
function v0(n, e, t) {
  let i = qi(n), s = qi(e);
  if (i || s || (i = Di(n), s = Di(e), i || s))
    return i && s ? Kh(n, e, t) : !1;
  const o = Object.keys(n).length, r = Object.keys(e).length;
  if (o !== r)
    return !1;
  for (const l in n) {
    const a = n.hasOwnProperty(l), u = e.hasOwnProperty(l);
    if (a && !u || !a && u || !Oi(n[l], e[l], t))
      return !1;
  }
  return String(n) === String(e);
}
function Uh(n, e, t, i) {
  t || (t = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
  const [s, o] = t;
  if (s.has(n) || o.has(e))
    return s.get(n) === e && o.get(e) === n;
  s.set(n, e), o.set(e, n);
  const r = i(n, e, t);
  return s.delete(n), o.delete(e), r;
}
function Oi(n, e, t) {
  if (n === e) return !0;
  let i = zh(n), s = zh(e);
  return i || s ? i && s ? n.getTime() === e.getTime() : !1 : (i = Wn(n), s = Wn(e), i || s ? n === e : (i = Ve(n), s = Ve(e), i || s ? i && s ? Uh(n, e, t, m0) : !1 : (i = $t(n), s = $t(e), i || s ? !i || !s ? !1 : Uh(n, e, t, v0) : String(n) === String(e))));
}
function Dc(n, e) {
  return n.findIndex((t) => Oi(t, e));
}
const Op = (n) => !!(n && n.__v_isRef === !0), F = (n) => Rt(n) ? n : n == null ? "" : Ve(n) || $t(n) && (n.toString === Mp || !dt(n.toString)) ? Op(n) ? F(n.value) : JSON.stringify(n, Lp, 2) : String(n), Lp = (n, e) => Op(e) ? Lp(n, e.value) : qi(e) ? {
  [`Map(${e.size})`]: [...e.entries()].reduce(
    (t, [i, s], o) => (t[Na(i, o) + " =>"] = s, t),
    {}
  )
} : Di(e) ? {
  [`Set(${e.size})`]: [...e.values()].map((t) => Na(t))
} : Wn(e) ? Na(e) : $t(e) && !Ve(e) && !Ap(e) ? String(e) : e, Na = (n, e = "") => {
  var t;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Wn(n) ? `Symbol(${(t = n.description) != null ? t : e})` : n
  );
};
let Wt;
class y0 {
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
function b0() {
  return Wt;
}
let xt;
const Va = /* @__PURE__ */ new WeakSet();
class Ep {
  constructor(e) {
    this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Wt && (Wt.active ? Wt.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Va.has(this) && (Va.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Bp(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, jh(this), Rp(this);
    const e = xt, t = zn;
    xt = this, zn = !0;
    try {
      return this.fn();
    } finally {
      Pp(this), xt = e, zn = t, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let e = this.deps; e; e = e.nextDep)
        Ec(e);
      this.deps = this.depsTail = void 0, jh(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Va.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Su(this) && this.run();
  }
  get dirty() {
    return Su(this);
  }
}
let Ip = 0, Fo, zo;
function Bp(n, e = !1) {
  if (n.flags |= 8, e) {
    n.next = zo, zo = n;
    return;
  }
  n.next = Fo, Fo = n;
}
function Oc() {
  Ip++;
}
function Lc() {
  if (--Ip > 0)
    return;
  if (zo) {
    let e = zo;
    for (zo = void 0; e; ) {
      const t = e.next;
      e.next = void 0, e.flags &= -9, e = t;
    }
  }
  let n;
  for (; Fo; ) {
    let e = Fo;
    for (Fo = void 0; e; ) {
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
function Rp(n) {
  for (let e = n.deps; e; e = e.nextDep)
    e.version = -1, e.prevActiveLink = e.dep.activeLink, e.dep.activeLink = e;
}
function Pp(n) {
  let e, t = n.depsTail, i = t;
  for (; i; ) {
    const s = i.prevDep;
    i.version === -1 ? (i === t && (t = s), Ec(i), w0(i)) : e = i, i.dep.activeLink = i.prevActiveLink, i.prevActiveLink = void 0, i = s;
  }
  n.deps = e, n.depsTail = t;
}
function Su(n) {
  for (let e = n.deps; e; e = e.nextDep)
    if (e.dep.version !== e.version || e.dep.computed && (_p(e.dep.computed) || e.dep.version !== e.version))
      return !0;
  return !!n._dirty;
}
function _p(n) {
  if (n.flags & 4 && !(n.flags & 16) || (n.flags &= -17, n.globalVersion === Qo) || (n.globalVersion = Qo, !n.isSSR && n.flags & 128 && (!n.deps && !n._dirty || !Su(n))))
    return;
  n.flags |= 2;
  const e = n.dep, t = xt, i = zn;
  xt = n, zn = !0;
  try {
    Rp(n);
    const s = n.fn(n._value);
    (e.version === 0 || Ut(s, n._value)) && (n.flags |= 128, n._value = s, e.version++);
  } catch (s) {
    throw e.version++, s;
  } finally {
    xt = t, zn = i, Pp(n), n.flags &= -3;
  }
}
function Ec(n, e = !1) {
  const { dep: t, prevSub: i, nextSub: s } = n;
  if (i && (i.nextSub = s, n.prevSub = void 0), s && (s.prevSub = i, n.nextSub = void 0), t.subs === n && (t.subs = i, !i && t.computed)) {
    t.computed.flags &= -5;
    for (let o = t.computed.deps; o; o = o.nextDep)
      Ec(o, !0);
  }
  !e && !--t.sc && t.map && t.map.delete(t.key);
}
function w0(n) {
  const { prevDep: e, nextDep: t } = n;
  e && (e.nextDep = t, n.prevDep = void 0), t && (t.prevDep = e, n.nextDep = void 0);
}
let zn = !0;
const Np = [];
function Xi() {
  Np.push(zn), zn = !1;
}
function Ji() {
  const n = Np.pop();
  zn = n === void 0 ? !0 : n;
}
function jh(n) {
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
let Qo = 0;
class x0 {
  constructor(e, t) {
    this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class sa {
  // TODO isolatedDeclarations "__v_skip"
  constructor(e) {
    this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(e) {
    if (!xt || !zn || xt === this.computed)
      return;
    let t = this.activeLink;
    if (t === void 0 || t.sub !== xt)
      t = this.activeLink = new x0(xt, this), xt.deps ? (t.prevDep = xt.depsTail, xt.depsTail.nextDep = t, xt.depsTail = t) : xt.deps = xt.depsTail = t, Vp(t);
    else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
      const i = t.nextDep;
      i.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = i), t.prevDep = xt.depsTail, t.nextDep = void 0, xt.depsTail.nextDep = t, xt.depsTail = t, xt.deps === t && (xt.deps = i);
    }
    return t;
  }
  trigger(e) {
    this.version++, Qo++, this.notify(e);
  }
  notify(e) {
    Oc();
    try {
      for (let t = this.subs; t; t = t.prevSub)
        t.sub.notify() && t.sub.dep.notify();
    } finally {
      Lc();
    }
  }
}
function Vp(n) {
  if (n.dep.sc++, n.sub.flags & 4) {
    const e = n.dep.computed;
    if (e && !n.dep.subs) {
      e.flags |= 20;
      for (let i = e.deps; i; i = i.nextDep)
        Vp(i);
    }
    const t = n.dep.subs;
    t !== n && (n.prevSub = t, t && (t.nextSub = n)), n.dep.subs = n;
  }
}
const Cu = /* @__PURE__ */ new WeakMap(), Ss = /* @__PURE__ */ Symbol(
  ""
), Mu = /* @__PURE__ */ Symbol(
  ""
), er = /* @__PURE__ */ Symbol(
  ""
);
function Jt(n, e, t) {
  if (zn && xt) {
    let i = Cu.get(n);
    i || Cu.set(n, i = /* @__PURE__ */ new Map());
    let s = i.get(t);
    s || (i.set(t, s = new sa()), s.map = i, s.key = t), s.track();
  }
}
function wi(n, e, t, i, s, o) {
  const r = Cu.get(n);
  if (!r) {
    Qo++;
    return;
  }
  const l = (a) => {
    a && a.trigger();
  };
  if (Oc(), e === "clear")
    r.forEach(l);
  else {
    const a = Ve(n), u = a && $c(t);
    if (a && t === "length") {
      const c = Number(i);
      r.forEach((h, f) => {
        (f === "length" || f === er || !Wn(f) && f >= c) && l(h);
      });
    } else
      switch ((t !== void 0 || r.has(void 0)) && l(r.get(t)), u && l(r.get(er)), e) {
        case "add":
          a ? u && l(r.get("length")) : (l(r.get(Ss)), qi(n) && l(r.get(Mu)));
          break;
        case "delete":
          a || (l(r.get(Ss)), qi(n) && l(r.get(Mu)));
          break;
        case "set":
          qi(n) && l(r.get(Ss));
          break;
      }
  }
  Lc();
}
function _s(n) {
  const e = /* @__PURE__ */ lt(n);
  return e === n || (Jt(e, "iterate", er), /* @__PURE__ */ Tn(n)) ? e : /* @__PURE__ */ fi(n) ? /* @__PURE__ */ Yi(n) ? e.map((t) => Zi(Dn(t))) : e.map(Zi) : e.map(Dn);
}
function oa(n) {
  return Jt(n = /* @__PURE__ */ lt(n), "iterate", er), n;
}
function oi(n, e) {
  return /* @__PURE__ */ fi(n) ? Zi(/* @__PURE__ */ Yi(n) ? Dn(e) : e) : Dn(e);
}
const k0 = {
  __proto__: null,
  [Symbol.iterator]() {
    return Ha(this, Symbol.iterator, (n) => oi(this, n));
  },
  concat(...n) {
    return _s(this).concat(
      ...n.map((e) => Ve(e) ? _s(e) : e)
    );
  },
  entries() {
    return Ha(this, "entries", (n) => (n[1] = oi(this, n[1]), n));
  },
  every(n, e) {
    return vi(this, "every", n, e, void 0, arguments);
  },
  filter(n, e) {
    return vi(
      this,
      "filter",
      n,
      e,
      (t) => t.map((i) => oi(this, i)),
      arguments
    );
  },
  find(n, e) {
    return vi(
      this,
      "find",
      n,
      e,
      (t) => oi(this, t),
      arguments
    );
  },
  findIndex(n, e) {
    return vi(this, "findIndex", n, e, void 0, arguments);
  },
  findLast(n, e) {
    return vi(
      this,
      "findLast",
      n,
      e,
      (t) => oi(this, t),
      arguments
    );
  },
  findLastIndex(n, e) {
    return vi(this, "findLastIndex", n, e, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(n, e) {
    return vi(this, "forEach", n, e, void 0, arguments);
  },
  includes(...n) {
    return Fa(this, "includes", n);
  },
  indexOf(...n) {
    return Fa(this, "indexOf", n);
  },
  join(n) {
    return _s(this).join(n);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...n) {
    return Fa(this, "lastIndexOf", n);
  },
  map(n, e) {
    return vi(this, "map", n, e, void 0, arguments);
  },
  pop() {
    return ko(this, "pop");
  },
  push(...n) {
    return ko(this, "push", n);
  },
  reduce(n, ...e) {
    return Gh(this, "reduce", n, e);
  },
  reduceRight(n, ...e) {
    return Gh(this, "reduceRight", n, e);
  },
  shift() {
    return ko(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(n, e) {
    return vi(this, "some", n, e, void 0, arguments);
  },
  splice(...n) {
    return ko(this, "splice", n);
  },
  toReversed() {
    return _s(this).toReversed();
  },
  toSorted(n) {
    return _s(this).toSorted(n);
  },
  toSpliced(...n) {
    return _s(this).toSpliced(...n);
  },
  unshift(...n) {
    return ko(this, "unshift", n);
  },
  values() {
    return Ha(this, "values", (n) => oi(this, n));
  }
};
function Ha(n, e, t) {
  const i = oa(n), s = i[e]();
  return i !== n && !/* @__PURE__ */ Tn(n) && (s._next = s.next, s.next = () => {
    const o = s._next();
    return o.done || (o.value = t(o.value)), o;
  }), s;
}
const S0 = Array.prototype;
function vi(n, e, t, i, s, o) {
  const r = oa(n), l = r !== n && !/* @__PURE__ */ Tn(n), a = r[e];
  if (a !== S0[e]) {
    const h = a.apply(n, o);
    return l ? Dn(h) : h;
  }
  let u = t;
  r !== n && (l ? u = function(h, f) {
    return t.call(this, oi(n, h), f, n);
  } : t.length > 2 && (u = function(h, f) {
    return t.call(this, h, f, n);
  }));
  const c = a.call(r, u, i);
  return l && s ? s(c) : c;
}
function Gh(n, e, t, i) {
  const s = oa(n), o = s !== n && !/* @__PURE__ */ Tn(n);
  let r = t, l = !1;
  s !== n && (o ? (l = i.length === 0, r = function(u, c, h) {
    return l && (l = !1, u = oi(n, u)), t.call(this, u, oi(n, c), h, n);
  }) : t.length > 3 && (r = function(u, c, h) {
    return t.call(this, u, c, h, n);
  }));
  const a = s[e](r, ...i);
  return l ? oi(n, a) : a;
}
function Fa(n, e, t) {
  const i = /* @__PURE__ */ lt(n);
  Jt(i, "iterate", er);
  const s = i[e](...t);
  return (s === -1 || s === !1) && /* @__PURE__ */ Rc(t[0]) ? (t[0] = /* @__PURE__ */ lt(t[0]), i[e](...t)) : s;
}
function ko(n, e, t = []) {
  Xi(), Oc();
  const i = (/* @__PURE__ */ lt(n))[e].apply(n, t);
  return Lc(), Ji(), i;
}
const C0 = /* @__PURE__ */ Tc("__proto__,__v_isRef,__isVue"), Hp = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((n) => n !== "arguments" && n !== "caller").map((n) => Symbol[n]).filter(Wn)
);
function M0(n) {
  Wn(n) || (n = String(n));
  const e = /* @__PURE__ */ lt(this);
  return Jt(e, "has", n), e.hasOwnProperty(n);
}
class Fp {
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
      return i === (s ? o ? R0 : Up : o ? Kp : Wp).get(e) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(e) === Object.getPrototypeOf(i) ? e : void 0;
    const r = Ve(e);
    if (!s) {
      let a;
      if (r && (a = k0[t]))
        return a;
      if (t === "hasOwnProperty")
        return M0;
    }
    const l = Reflect.get(
      e,
      t,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ ln(e) ? e : i
    );
    if ((Wn(t) ? Hp.has(t) : C0(t)) || (s || Jt(e, "get", t), o))
      return l;
    if (/* @__PURE__ */ ln(l)) {
      const a = r && $c(t) ? l : l.value;
      return s && $t(a) ? /* @__PURE__ */ Tu(a) : a;
    }
    return $t(l) ? s ? /* @__PURE__ */ Tu(l) : /* @__PURE__ */ ws(l) : l;
  }
}
class zp extends Fp {
  constructor(e = !1) {
    super(!1, e);
  }
  set(e, t, i, s) {
    let o = e[t];
    const r = Ve(e) && $c(t);
    if (!this._isShallow) {
      const u = /* @__PURE__ */ fi(o);
      if (!/* @__PURE__ */ Tn(i) && !/* @__PURE__ */ fi(i) && (o = /* @__PURE__ */ lt(o), i = /* @__PURE__ */ lt(i)), !r && /* @__PURE__ */ ln(o) && !/* @__PURE__ */ ln(i))
        return u || (o.value = i), !0;
    }
    const l = r ? Number(t) < e.length : gt(e, t), a = Reflect.set(
      e,
      t,
      i,
      /* @__PURE__ */ ln(e) ? e : s
    );
    return e === /* @__PURE__ */ lt(s) && a && (l ? Ut(i, o) && wi(e, "set", t, i) : wi(e, "add", t, i)), a;
  }
  deleteProperty(e, t) {
    const i = gt(e, t);
    e[t];
    const s = Reflect.deleteProperty(e, t);
    return s && i && wi(e, "delete", t, void 0), s;
  }
  has(e, t) {
    const i = Reflect.has(e, t);
    return (!Wn(t) || !Hp.has(t)) && Jt(e, "has", t), i;
  }
  ownKeys(e) {
    return Jt(
      e,
      "iterate",
      Ve(e) ? "length" : Ss
    ), Reflect.ownKeys(e);
  }
}
class A0 extends Fp {
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
const T0 = /* @__PURE__ */ new zp(), $0 = /* @__PURE__ */ new A0(), D0 = /* @__PURE__ */ new zp(!0);
const Au = (n) => n, Br = (n) => Reflect.getPrototypeOf(n);
function O0(n, e, t) {
  return function(...i) {
    const s = this.__v_raw, o = /* @__PURE__ */ lt(s), r = qi(o), l = n === "entries" || n === Symbol.iterator && r, a = n === "keys" && r, u = s[n](...i), c = t ? Au : e ? Zi : Dn;
    return !e && Jt(
      o,
      "iterate",
      a ? Mu : Ss
    ), Ln(
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
function Rr(n) {
  return function(...e) {
    return n === "delete" ? !1 : n === "clear" ? void 0 : this;
  };
}
function L0(n, e) {
  const t = {
    get(s) {
      const o = this.__v_raw, r = /* @__PURE__ */ lt(o), l = /* @__PURE__ */ lt(s);
      n || (Ut(s, l) && Jt(r, "get", s), Jt(r, "get", l));
      const { has: a } = Br(r), u = e ? Au : n ? Zi : Dn;
      if (a.call(r, s))
        return u(o.get(s));
      if (a.call(r, l))
        return u(o.get(l));
      o !== r && o.get(s);
    },
    get size() {
      const s = this.__v_raw;
      return !n && Jt(/* @__PURE__ */ lt(s), "iterate", Ss), s.size;
    },
    has(s) {
      const o = this.__v_raw, r = /* @__PURE__ */ lt(o), l = /* @__PURE__ */ lt(s);
      return n || (Ut(s, l) && Jt(r, "has", s), Jt(r, "has", l)), s === l ? o.has(s) : o.has(s) || o.has(l);
    },
    forEach(s, o) {
      const r = this, l = r.__v_raw, a = /* @__PURE__ */ lt(l), u = e ? Au : n ? Zi : Dn;
      return !n && Jt(a, "iterate", Ss), l.forEach((c, h) => s.call(o, u(c), u(h), r));
    }
  };
  return Ln(
    t,
    n ? {
      add: Rr("add"),
      set: Rr("set"),
      delete: Rr("delete"),
      clear: Rr("clear")
    } : {
      add(s) {
        const o = /* @__PURE__ */ lt(this), r = Br(o), l = /* @__PURE__ */ lt(s), a = !e && !/* @__PURE__ */ Tn(s) && !/* @__PURE__ */ fi(s) ? l : s;
        return r.has.call(o, a) || Ut(s, a) && r.has.call(o, s) || Ut(l, a) && r.has.call(o, l) || (o.add(a), wi(o, "add", a, a)), this;
      },
      set(s, o) {
        !e && !/* @__PURE__ */ Tn(o) && !/* @__PURE__ */ fi(o) && (o = /* @__PURE__ */ lt(o));
        const r = /* @__PURE__ */ lt(this), { has: l, get: a } = Br(r);
        let u = l.call(r, s);
        u || (s = /* @__PURE__ */ lt(s), u = l.call(r, s));
        const c = a.call(r, s);
        return r.set(s, o), u ? Ut(o, c) && wi(r, "set", s, o) : wi(r, "add", s, o), this;
      },
      delete(s) {
        const o = /* @__PURE__ */ lt(this), { has: r, get: l } = Br(o);
        let a = r.call(o, s);
        a || (s = /* @__PURE__ */ lt(s), a = r.call(o, s)), l && l.call(o, s);
        const u = o.delete(s);
        return a && wi(o, "delete", s, void 0), u;
      },
      clear() {
        const s = /* @__PURE__ */ lt(this), o = s.size !== 0, r = s.clear();
        return o && wi(
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
    t[s] = O0(s, n, e);
  }), t;
}
function Ic(n, e) {
  const t = L0(n, e);
  return (i, s, o) => s === "__v_isReactive" ? !n : s === "__v_isReadonly" ? n : s === "__v_raw" ? i : Reflect.get(
    gt(t, s) && s in i ? t : i,
    s,
    o
  );
}
const E0 = {
  get: /* @__PURE__ */ Ic(!1, !1)
}, I0 = {
  get: /* @__PURE__ */ Ic(!1, !0)
}, B0 = {
  get: /* @__PURE__ */ Ic(!0, !1)
};
const Wp = /* @__PURE__ */ new WeakMap(), Kp = /* @__PURE__ */ new WeakMap(), Up = /* @__PURE__ */ new WeakMap(), R0 = /* @__PURE__ */ new WeakMap();
function P0(n) {
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
function ws(n) {
  return /* @__PURE__ */ fi(n) ? n : Bc(
    n,
    !1,
    T0,
    E0,
    Wp
  );
}
// @__NO_SIDE_EFFECTS__
function _0(n) {
  return Bc(
    n,
    !1,
    D0,
    I0,
    Kp
  );
}
// @__NO_SIDE_EFFECTS__
function Tu(n) {
  return Bc(
    n,
    !0,
    $0,
    B0,
    Up
  );
}
function Bc(n, e, t, i, s) {
  if (!$t(n) || n.__v_raw && !(e && n.__v_isReactive) || n.__v_skip || !Object.isExtensible(n))
    return n;
  const o = s.get(n);
  if (o)
    return o;
  const r = P0(l0(n));
  if (r === 0)
    return n;
  const l = new Proxy(
    n,
    r === 2 ? i : t
  );
  return s.set(n, l), l;
}
// @__NO_SIDE_EFFECTS__
function Yi(n) {
  return /* @__PURE__ */ fi(n) ? /* @__PURE__ */ Yi(n.__v_raw) : !!(n && n.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function fi(n) {
  return !!(n && n.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Tn(n) {
  return !!(n && n.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Rc(n) {
  return n ? !!n.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function lt(n) {
  const e = n && n.__v_raw;
  return e ? /* @__PURE__ */ lt(e) : n;
}
function N0(n) {
  return !gt(n, "__v_skip") && Object.isExtensible(n) && $p(n, "__v_skip", !0), n;
}
const Dn = (n) => $t(n) ? /* @__PURE__ */ ws(n) : n, Zi = (n) => $t(n) ? /* @__PURE__ */ Tu(n) : n;
// @__NO_SIDE_EFFECTS__
function ln(n) {
  return n ? n.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function G(n) {
  return jp(n, !1);
}
// @__NO_SIDE_EFFECTS__
function js(n) {
  return jp(n, !0);
}
function jp(n, e) {
  return /* @__PURE__ */ ln(n) ? n : new V0(n, e);
}
class V0 {
  constructor(e, t) {
    this.dep = new sa(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ lt(e), this._value = t ? e : Dn(e), this.__v_isShallow = t;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(e) {
    const t = this._rawValue, i = this.__v_isShallow || /* @__PURE__ */ Tn(e) || /* @__PURE__ */ fi(e);
    e = i ? e : /* @__PURE__ */ lt(e), Ut(e, t) && (this._rawValue = e, this._value = i ? e : Dn(e), this.dep.trigger());
  }
}
function H(n) {
  return /* @__PURE__ */ ln(n) ? n.value : n;
}
const H0 = {
  get: (n, e, t) => e === "__v_raw" ? n : H(Reflect.get(n, e, t)),
  set: (n, e, t, i) => {
    const s = n[e];
    return /* @__PURE__ */ ln(s) && !/* @__PURE__ */ ln(t) ? (s.value = t, !0) : Reflect.set(n, e, t, i);
  }
};
function Gp(n) {
  return /* @__PURE__ */ Yi(n) ? n : new Proxy(n, H0);
}
class F0 {
  constructor(e) {
    this.__v_isRef = !0, this._value = void 0;
    const t = this.dep = new sa(), { get: i, set: s } = e(t.track.bind(t), t.trigger.bind(t));
    this._get = i, this._set = s;
  }
  get value() {
    return this._value = this._get();
  }
  set value(e) {
    this._set(e);
  }
}
function z0(n) {
  return new F0(n);
}
class W0 {
  constructor(e, t, i) {
    this.fn = e, this.setter = t, this._value = void 0, this.dep = new sa(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Qo - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = i;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    xt !== this)
      return Bp(this, !0), !0;
  }
  get value() {
    const e = this.dep.track();
    return _p(this), e && (e.version = this.dep.version), this._value;
  }
  set value(e) {
    this.setter && this.setter(e);
  }
}
// @__NO_SIDE_EFFECTS__
function K0(n, e, t = !1) {
  let i, s;
  return dt(n) ? i = n : (i = n.get, s = n.set), new W0(i, s, t);
}
const Pr = {}, Ml = /* @__PURE__ */ new WeakMap();
let ps;
function U0(n, e = !1, t = ps) {
  if (t) {
    let i = Ml.get(t);
    i || Ml.set(t, i = []), i.push(n);
  }
}
function j0(n, e, t = ut) {
  const { immediate: i, deep: s, once: o, scheduler: r, augmentJob: l, call: a } = t, u = (E) => s ? E : /* @__PURE__ */ Tn(E) || s === !1 || s === 0 ? xi(E, 1) : xi(E);
  let c, h, f, d, p = !1, v = !1;
  if (/* @__PURE__ */ ln(n) ? (h = () => n.value, p = /* @__PURE__ */ Tn(n)) : /* @__PURE__ */ Yi(n) ? (h = () => u(n), p = !0) : Ve(n) ? (v = !0, p = n.some((E) => /* @__PURE__ */ Yi(E) || /* @__PURE__ */ Tn(E)), h = () => n.map((E) => {
    if (/* @__PURE__ */ ln(E))
      return E.value;
    if (/* @__PURE__ */ Yi(E))
      return u(E);
    if (dt(E))
      return a ? a(E, 2) : E();
  })) : dt(n) ? e ? h = a ? () => a(n, 2) : n : h = () => {
    if (f) {
      Xi();
      try {
        f();
      } finally {
        Ji();
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
    const E = h, I = s === !0 ? 1 / 0 : s;
    h = () => xi(E(), I);
  }
  const m = b0(), b = () => {
    c.stop(), m && m.active && Sp(m.effects, c);
  };
  if (o && e) {
    const E = e;
    e = (...I) => {
      const z = E(...I);
      return b(), z;
    };
  }
  let O = v ? new Array(n.length).fill(Pr) : Pr;
  const L = (E) => {
    if (!(!(c.flags & 1) || !c.dirty && !E))
      if (e) {
        const I = c.run();
        if (E || s || p || (v ? I.some((z, R) => Ut(z, O[R])) : Ut(I, O))) {
          f && f();
          const z = ps;
          ps = c;
          try {
            const R = [
              I,
              // pass undefined as the old value when it's changed for the first time
              O === Pr ? void 0 : v && O[0] === Pr ? [] : O,
              d
            ];
            O = I, a ? a(e, 3, R) : (
              // @ts-expect-error
              e(...R)
            );
          } finally {
            ps = z;
          }
        }
      } else
        c.run();
  };
  return l && l(L), c = new Ep(h), c.scheduler = r ? () => r(L, !1) : L, d = (E) => U0(E, !1, c), f = c.onStop = () => {
    const E = Ml.get(c);
    if (E) {
      if (a)
        a(E, 4);
      else
        for (const I of E) I();
      Ml.delete(c);
    }
  }, e ? i ? L(!0) : O = c.run() : r ? r(L.bind(null, !0), !0) : c.run(), b.pause = c.pause.bind(c), b.resume = c.resume.bind(c), b.stop = b, b;
}
function xi(n, e = 1 / 0, t) {
  if (e <= 0 || !$t(n) || n.__v_skip || (t = t || /* @__PURE__ */ new Map(), (t.get(n) || 0) >= e))
    return n;
  if (t.set(n, e), e--, /* @__PURE__ */ ln(n))
    xi(n.value, e, t);
  else if (Ve(n))
    for (let i = 0; i < n.length; i++)
      xi(n[i], e, t);
  else if (Di(n) || qi(n))
    n.forEach((i) => {
      xi(i, e, t);
    });
  else if (Ap(n)) {
    for (const i in n)
      xi(n[i], e, t);
    for (const i of Object.getOwnPropertySymbols(n))
      Object.prototype.propertyIsEnumerable.call(n, i) && xi(n[i], e, t);
  }
  return n;
}
function xr(n, e, t, i) {
  try {
    return i ? n(...i) : n();
  } catch (s) {
    ra(s, e, t);
  }
}
function di(n, e, t, i) {
  if (dt(n)) {
    const s = xr(n, e, t, i);
    return s && Cp(s) && s.catch((o) => {
      ra(o, e, t);
    }), s;
  }
  if (Ve(n)) {
    const s = [];
    for (let o = 0; o < n.length; o++)
      s.push(di(n[o], e, t, i));
    return s;
  }
}
function ra(n, e, t, i = !0) {
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
      Xi(), xr(o, null, 10, [
        n,
        a,
        u
      ]), Ji();
      return;
    }
  }
  G0(n, t, s, i, r);
}
function G0(n, e, t, i = !0, s = !1) {
  if (s)
    throw n;
  console.error(n);
}
const rn = [];
let ii = -1;
const Gs = [];
let Ni = null, Vs = 0;
const qp = /* @__PURE__ */ Promise.resolve();
let Al = null;
function Pn(n) {
  const e = Al || qp;
  return n ? e.then(this ? n.bind(this) : n) : e;
}
function q0(n) {
  let e = ii + 1, t = rn.length;
  for (; e < t; ) {
    const i = e + t >>> 1, s = rn[i], o = tr(s);
    o < n || o === n && s.flags & 2 ? e = i + 1 : t = i;
  }
  return e;
}
function Pc(n) {
  if (!(n.flags & 1)) {
    const e = tr(n), t = rn[rn.length - 1];
    !t || // fast path when the job id is larger than the tail
    !(n.flags & 2) && e >= tr(t) ? rn.push(n) : rn.splice(q0(e), 0, n), n.flags |= 1, Yp();
  }
}
function Yp() {
  Al || (Al = qp.then(Jp));
}
function Y0(n) {
  if (!Ve(n))
    Ni && n.id === -1 ? Ni.splice(Vs + 1, 0, n) : n.flags & 1 || (Gs.push(n), n.flags |= 1);
  else
    for (let e = 0; e < n.length; e++)
      Gs.push(n[e]);
  Yp();
}
function qh(n, e, t = ii + 1) {
  for (; t < rn.length; t++) {
    const i = rn[t];
    if (i && i.flags & 2) {
      if (n && i.id !== n.uid)
        continue;
      rn.splice(t, 1), t--, i.flags & 4 && (i.flags &= -2), i(), i.flags & 4 || (i.flags &= -2);
    }
  }
}
function Xp(n) {
  if (Gs.length) {
    const e = [...new Set(Gs)].sort(
      (t, i) => tr(t) - tr(i)
    );
    if (Gs.length = 0, Ni) {
      for (let t = 0; t < e.length; t++)
        Ni.push(e[t]);
      return;
    }
    for (Ni = e, Vs = 0; Vs < Ni.length; Vs++) {
      const t = Ni[Vs];
      t.flags & 4 && (t.flags &= -2), t.flags & 8 || t(), t.flags &= -2;
    }
    Ni = null, Vs = 0;
  }
}
const tr = (n) => n.id == null ? n.flags & 2 ? -1 : 1 / 0 : n.id;
function Jp(n) {
  try {
    for (ii = 0; ii < rn.length; ii++) {
      const e = rn[ii];
      e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), xr(
        e,
        e.i,
        e.i ? 15 : 14
      ), e.flags & 4 || (e.flags &= -2));
    }
  } finally {
    for (; ii < rn.length; ii++) {
      const e = rn[ii];
      e && (e.flags &= -2);
    }
    ii = -1, rn.length = 0, Xp(), Al = null, (rn.length || Gs.length) && Jp();
  }
}
let Zt = null, Zp = null;
function Tl(n) {
  const e = Zt;
  return Zt = n, Zp = n && n.type.__scopeId || null, e;
}
function Qp(n, e = Zt, t) {
  if (!e || n._n)
    return n;
  const i = (...s) => {
    i._d && nf(-1);
    const o = Tl(e), r = Ai.length;
    let l;
    try {
      l = n(...s);
    } finally {
      for (let a = Ai.length; a > r; a--) Hc();
      Tl(o), i._d && nf(1);
    }
    return l;
  };
  return i._n = !0, i._c = !0, i._d = !0, i;
}
function We(n, e) {
  if (Zt === null)
    return n;
  const t = ca(Zt), i = n.dirs || (n.dirs = []);
  for (let s = 0; s < e.length; s++) {
    let [o, r, l, a = ut] = e[s];
    o && (dt(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && xi(r), i.push({
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
    a && (Xi(), di(a, t, 8, [
      n.el,
      l,
      n,
      e
    ]), Ji());
  }
}
function X0(n, e, t = !1) {
  const i = xg();
  if (i || Ys) {
    let s = Ys ? Ys._context.provides : i ? i.parent == null || i.ce ? i.vnode.appContext && i.vnode.appContext.provides : i.parent.provides : void 0;
    if (s && n in s)
      return s[n];
    if (arguments.length > 1)
      return t && dt(e) ? e.call(i && i.proxy) : e;
  }
}
const J0 = /* @__PURE__ */ Symbol.for("v-scx"), Z0 = () => X0(J0);
function Q0(n, e) {
  return eg(
    n,
    null,
    { flush: "sync" }
  );
}
function Ge(n, e, t) {
  return eg(n, e, t);
}
function eg(n, e, t = ut) {
  const { immediate: i, deep: s, flush: o, once: r } = t, l = Ln({}, t), a = e && i || !e && o !== "post";
  let u;
  if (sr) {
    if (o === "sync") {
      const d = Z0();
      u = d.__watcherHandles || (d.__watcherHandles = []);
    } else if (!a) {
      const d = () => {
      };
      return d.stop = ks, d.resume = ks, d.pause = ks, d;
    }
  }
  const c = Qi;
  l.call = (d, p, v) => di(d, c, p, v);
  let h = !1;
  o === "post" ? l.scheduler = (d) => {
    cn(d, c && c.suspense);
  } : o !== "sync" && (h = !0, l.scheduler = (d, p) => {
    p ? d() : Pc(d);
  }), l.augmentJob = (d) => {
    e && (d.flags |= 4), h && (d.flags |= 2, c && (d.id = c.uid, d.i = c));
  };
  const f = j0(n, e, l);
  return sr && (u ? u.push(f) : a && f()), f;
}
const eb = /* @__PURE__ */ Symbol("_vte"), la = (n) => n.__isTeleport, za = /* @__PURE__ */ Symbol("_leaveCb");
function tb(n) {
  let e = n[0];
  if (n.length > 1) {
    for (const t of n)
      if (t.type !== pi) {
        e = t;
        break;
      }
  }
  return e;
}
function tg(n) {
  if (!ng(n))
    return la(n.type) && n.children ? tb(n.children) : n;
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
function _c(n, e) {
  if (n.shapeFlag & 6 && n.component) {
    n.transition = e;
    const t = n.component.subTree;
    _c(
      la(t.type) && tg(t) || t,
      e
    );
  } else n.shapeFlag & 128 ? (n.ssContent.transition = e.clone(n.ssContent), n.ssFallback.transition = e.clone(n.ssFallback)) : n.transition = e;
}
// @__NO_SIDE_EFFECTS__
function tn(n, e) {
  return dt(n) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Ln({ name: n.name }, e, { setup: n })
  ) : n;
}
function nb(n) {
  n.ids = [n.ids[0] + n.ids[2]++ + "-", 0, 0];
}
function Yh(n, e) {
  let t;
  return !!((t = Object.getOwnPropertyDescriptor(n, e)) && !t.configurable);
}
const $l = /* @__PURE__ */ new WeakMap();
function Wo(n, e, t, i, s = !1) {
  if (Ve(n)) {
    n.forEach(
      (v, m) => Wo(
        v,
        e && (Ve(e) ? e[m] : e),
        t,
        i,
        s
      )
    );
    return;
  }
  if (qs(i) && !s) {
    i.shapeFlag & 512 && i.type.__asyncResolved && i.component.subTree.component && Wo(n, e, t, i.component.subTree);
    return;
  }
  const o = i.shapeFlag & 4 ? ca(i.component) : i.el, r = s ? null : o, { i: l, r: a } = n, u = e && e.r, c = l.refs === ut ? l.refs = {} : l.refs, h = l.setupState, f = /* @__PURE__ */ lt(h), d = h === ut ? kp : (v) => Yh(c, v) ? !1 : gt(f, v), p = (v, m) => !(m && Yh(c, m));
  if (u != null && u !== a) {
    if (Xh(e), Rt(u))
      c[u] = null, d(u) && (h[u] = null);
    else if (/* @__PURE__ */ ln(u)) {
      const v = e;
      p(u, v.k) && (u.value = null), v.k && (c[v.k] = null);
    }
  }
  if (dt(a))
    xr(a, l, 12, [r, c]);
  else {
    const v = Rt(a), m = /* @__PURE__ */ ln(a);
    if (v || m) {
      const b = () => {
        if (n.f) {
          const O = v ? d(a) ? h[a] : c[a] : p() || !n.k ? a.value : c[n.k];
          if (s)
            Ve(O) && Sp(O, o);
          else if (Ve(O))
            O.includes(o) || O.push(o);
          else if (v)
            c[a] = [o], d(a) && (h[a] = c[a]);
          else {
            const L = [o];
            p(a, n.k) && (a.value = L), n.k && (c[n.k] = L);
          }
        } else v ? (c[a] = r, d(a) && (h[a] = r)) : m && (p(a, n.k) && (a.value = r), n.k && (c[n.k] = r));
      };
      if (r) {
        const O = () => {
          b(), $l.delete(n);
        };
        O.id = -1, $l.set(n, O), cn(O, t);
      } else
        Xh(n), b();
    }
  }
}
function Xh(n) {
  const e = $l.get(n);
  e && (e.flags |= 8, $l.delete(n));
}
ia().requestIdleCallback;
ia().cancelIdleCallback;
const qs = (n) => !!n.type.__asyncLoader, ng = (n) => n.type.__isKeepAlive;
function ib(n, e, t = Qi, i = !1) {
  if (t) {
    const s = t[n] || (t[n] = []), o = e.__weh || (e.__weh = (...r) => {
      Xi();
      const l = zc(t), a = di(e, t, n, r);
      return l(), Ji(), a;
    });
    return i ? s.unshift(o) : s.push(o), o;
  }
}
const ig = (n) => (e, t = Qi) => {
  (!sr || n === "sp") && ib(n, (...i) => e(...i), t);
}, kr = ig("m"), Li = ig(
  "bum"
), sb = /* @__PURE__ */ Symbol.for("v-ndc");
function Ie(n, e, t, i) {
  let s;
  const o = t, r = Ve(n);
  if (r || Rt(n)) {
    const l = r && /* @__PURE__ */ Yi(n);
    let a = !1, u = !1;
    l && (a = !/* @__PURE__ */ Tn(n), u = /* @__PURE__ */ fi(n), n = oa(n)), s = new Array(n.length);
    for (let c = 0, h = n.length; c < h; c++)
      s[c] = e(
        a ? u ? Zi(Dn(n[c])) : Dn(n[c]) : n[c],
        c,
        void 0,
        o
      );
  } else if (typeof n == "number") {
    s = new Array(n);
    for (let l = 0; l < n; l++)
      s[l] = e(l + 1, l, void 0, o);
  } else if ($t(n))
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
function ob(n, e, t, i, s, o) {
  if (t == null && (t = {}), Zt.ce || Zt.parent && qs(Zt.parent) && Zt.parent.ce) {
    const u = t, c = Object.keys(u).length > 0;
    return u.name = e, k(), kn(
      me,
      null,
      [Ht("slot", u, i)],
      c ? -2 : 64
    );
  }
  let r = n[e];
  r && r._c && (r._d = !1);
  const l = Ai.length;
  k();
  let a;
  try {
    const u = r && sg(r(t)), c = t.key || o || // slot content array of a dynamic conditional slot may have a branch
    // key attached in the `createSlots` helper, respect that
    u && u.key;
    a = kn(
      me,
      {
        key: (c && !Wn(c) ? c : `_${e}`) + // #7256 force differentiate fallback content from actual content
        (!u && i ? "_fb" : "")
      },
      u || (i ? i() : []),
      u && n._ === 1 ? 64 : -2
    );
  } catch (u) {
    for (let c = Ai.length; c > l; c--) Hc();
    throw u;
  } finally {
    r && r._c && (r._d = !0);
  }
  return a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), a;
}
function sg(n) {
  return n.some((e) => Fc(e) ? !(e.type === pi || e.type === me && !sg(e.children)) : !0) ? n : null;
}
const $u = (n) => n ? kg(n) ? ca(n) : $u(n.parent) : null, Ko = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Ln(/* @__PURE__ */ Object.create(null), {
    $: (n) => n,
    $el: (n) => n.vnode.el,
    $data: (n) => n.data,
    $props: (n) => n.props,
    $attrs: (n) => n.attrs,
    $slots: (n) => n.slots,
    $refs: (n) => n.refs,
    $parent: (n) => $u(n.parent),
    $root: (n) => $u(n.root),
    $host: (n) => n.ce,
    $emit: (n) => n.emit,
    $options: (n) => n.type,
    $forceUpdate: (n) => n.f || (n.f = () => {
      Pc(n.update);
    }),
    $nextTick: (n) => n.n || (n.n = Pn.bind(n.proxy)),
    $watch: (n) => ks
  })
), Wa = (n, e) => n !== ut && !n.__isScriptSetup && gt(n, e), rb = {
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
        if (Wa(i, e))
          return r[e] = 1, i[e];
        if (gt(o, e))
          return r[e] = 3, o[e];
        if (t !== ut && gt(t, e))
          return r[e] = 4, t[e];
        r[e] = 0;
      }
    }
    const u = Ko[e];
    let c, h;
    if (u)
      return e === "$attrs" && Jt(n.attrs, "get", ""), u(n);
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
    return Wa(s, e) ? (s[e] = t, !0) : gt(n.props, e) || e[0] === "$" && e.slice(1) in n ? !1 : (o[e] = t, !0);
  },
  has({
    _: { data: n, setupState: e, accessCache: t, ctx: i, appContext: s, props: o, type: r }
  }, l) {
    let a;
    return !!(t[l] || Wa(e, l) || gt(o, l) || gt(i, l) || gt(Ko, l) || gt(s.config.globalProperties, l) || (a = r.__cssModules) && a[l]);
  },
  defineProperty(n, e, t) {
    return t.get != null ? n._.accessCache[e] = 0 : gt(t, "value") && this.set(n, e, t.value, null), Reflect.defineProperty(n, e, t);
  }
};
function Jh(n) {
  return Ve(n) ? n.reduce(
    (e, t) => (e[t] = null, e),
    {}
  ) : n;
}
function On(n, e) {
  return !n || !e ? n || e : Ve(n) && Ve(e) ? n.concat(e) : Ln({}, Jh(n), Jh(e));
}
function og() {
  return {
    app: null,
    config: {
      isNativeTag: kp,
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
let lb = 0;
function ab(n, e) {
  return function(i, s = null) {
    dt(i) || (i = Ln({}, i)), s != null && !$t(s) && (s = null);
    const o = og(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let a = !1;
    const u = o.app = {
      _uid: lb++,
      _component: i,
      _props: s,
      _container: null,
      _context: o,
      _instance: null,
      version: Pb,
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
          const d = u._ceVNode || Ht(i, s);
          return d.appContext = o, f === !0 ? f = "svg" : f === !1 && (f = void 0), n(d, c, f), a = !0, u._container = c, c.__vue_app__ = u, ca(d.component);
        }
      },
      onUnmount(c) {
        l.push(c);
      },
      unmount() {
        a && (di(
          l,
          u._instance,
          16
        ), n(null, u._container), delete u._container.__vue_app__);
      },
      provide(c, h) {
        return o.provides[c] = h, u;
      },
      runWithContext(c) {
        const h = Ys;
        Ys = u;
        try {
          return c();
        } finally {
          Ys = h;
        }
      }
    };
    return u;
  };
}
let Ys = null;
function Vt(n, e, t = ut) {
  const i = xg(), s = An(e), o = Ii(e), r = rg(n, s), l = z0((a, u) => {
    let c, h = ut, f;
    return Q0(() => {
      const d = n[s];
      Ut(c, d) && (c = d, u());
    }), {
      get() {
        return a(), t.get ? t.get(c) : c;
      },
      set(d) {
        const p = t.set ? t.set(d) : d;
        if (!Ut(p, c) && !(h !== ut && Ut(d, h)))
          return;
        const v = i.vnode.props, m = !!(v && // check if parent has passed v-model
        (e in v || s in v || o in v) && (`onUpdate:${e}` in v || `onUpdate:${s}` in v || `onUpdate:${o}` in v));
        m || (c = d, u()), i.emit(`update:${e}`, p), Ut(d, h) && (Ut(d, p) && !Ut(p, f) || // #13524: browsers differ in when they flush microtasks between
        // event listeners. If a v-model listener emits an intermediate value
        // and a following listener restores the model to its previous prop
        // value before parent updates are flushed, the parent render can be
        // deduped as having no prop change. Force a local update so DOM state
        // such as an input's value is synchronized back to the current model.
        m && h !== ut && !Ut(p, c)) && u(), h = d, f = p;
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
const rg = (n, e) => e === "modelValue" || e === "model-value" ? n.modelModifiers : n[`${e}Modifiers`] || n[`${An(e)}Modifiers`] || n[`${Ii(e)}Modifiers`];
function ub(n, e, ...t) {
  if (n.isUnmounted) return;
  const i = n.vnode.props || ut;
  let s = t;
  const o = e.startsWith("update:"), r = o && rg(i, e.slice(7));
  r && (r.trim && (s = t.map((c) => Rt(c) ? c.trim() : c)), r.number && (s = s.map(na)));
  let l, a = i[l = _a(e)] || // also try camelCase event handler (#2249)
  i[l = _a(An(e))];
  !a && o && (a = i[l = _a(Ii(e))]), a && di(
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
    n.emitted[l] = !0, di(
      u,
      n,
      6,
      s
    );
  }
}
function cb(n, e, t = !1) {
  const i = e.emitsCache, s = i.get(n);
  if (s !== void 0)
    return s;
  const o = n.emits;
  let r = {};
  return o ? (Ve(o) ? o.forEach((l) => r[l] = null) : Ln(r, o), $t(n) && i.set(n, r), r) : ($t(n) && i.set(n, null), null);
}
function aa(n, e) {
  return !n || !Ql(e) ? !1 : (e = e.slice(2), e = e === "Once" ? e : e.replace(/Once$/, ""), gt(n, e[0].toLowerCase() + e.slice(1)) || gt(n, Ii(e)) || gt(n, e));
}
function Zh(n) {
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
    ctx: p,
    inheritAttrs: v
  } = n, m = Tl(n);
  let b, O;
  try {
    if (t.shapeFlag & 4) {
      const E = s || i, I = E;
      b = ri(
        u.call(
          I,
          E,
          c,
          h,
          d,
          f,
          p
        )
      ), O = l;
    } else {
      const E = e;
      b = ri(
        E.length > 1 ? E(
          h,
          { attrs: l, slots: r, emit: a }
        ) : E(
          h,
          null
        )
      ), O = e.props ? l : hb(l);
    }
  } catch (E) {
    Ai.length = 0, ra(E, n, 1), b = Ht(pi);
  }
  let L = b;
  if (O && v !== !1) {
    const E = Object.keys(O), { shapeFlag: I } = L;
    E.length && I & 7 && (o && E.some(ea) && (O = fb(
      O,
      o
    )), L = no(L, O, !1, !0));
  }
  if (t.dirs && (L = no(L, null, !1, !0), L.dirs = L.dirs ? L.dirs.concat(t.dirs) : t.dirs), t.transition) {
    const E = la(L.type) && tg(L) || L;
    _c(E, t.transition);
  }
  return b = L, Tl(m), b;
}
const hb = (n) => {
  let e;
  for (const t in n)
    (t === "class" || t === "style" || Ql(t)) && ((e || (e = {}))[t] = n[t]);
  return e;
}, fb = (n, e) => {
  const t = {};
  for (const i in n)
    (!ea(i) || !(i.slice(9) in e)) && (t[i] = n[i]);
  return t;
};
function db(n, e, t) {
  const { props: i, children: s, component: o } = n, { props: r, children: l, patchFlag: a } = e, u = o.emitsOptions;
  if (e.dirs || e.transition)
    return !0;
  if (t && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return i ? Qh(i, r, u) : !!r;
    if (a & 8) {
      const c = e.dynamicProps;
      for (let h = 0; h < c.length; h++) {
        const f = c[h];
        if (lg(r, i, f) && !aa(u, f))
          return !0;
      }
    }
  } else
    return (s || l) && (!l || !l.$stable) ? !0 : i === r ? !1 : i ? r ? Qh(i, r, u) : !0 : !!r;
  return !1;
}
function Qh(n, e, t) {
  const i = Object.keys(e);
  if (i.length !== Object.keys(n).length)
    return !0;
  for (let s = 0; s < i.length; s++) {
    const o = i[s];
    if (lg(e, n, o) && !aa(t, o))
      return !0;
  }
  return !1;
}
function lg(n, e, t) {
  const i = n[t], s = e[t];
  return t === "style" && $t(i) && $t(s) ? !Oi(i, s) : i !== s;
}
function pb({ vnode: n, parent: e, suspense: t }, i) {
  for (; e; ) {
    const s = e.subTree;
    if (s.suspense && s.suspense.activeBranch === n && (s.suspense.vnode.el = s.el = i, n = s), s === n)
      (n = e.vnode).el = i, e = e.parent;
    else
      break;
  }
  t && t.activeBranch === n && (t.vnode.el = i);
}
const ag = {}, ug = () => Object.create(ag), cg = (n) => Object.getPrototypeOf(n) === ag;
function gb(n, e, t, i = !1) {
  const s = {}, o = ug();
  n.propsDefaults = /* @__PURE__ */ Object.create(null), hg(n, e, s, o);
  for (const r in n.propsOptions[0])
    r in s || (s[r] = void 0);
  t ? n.props = i ? s : /* @__PURE__ */ _0(s) : n.type.props ? n.props = s : n.props = o, n.attrs = o;
}
function mb(n, e, t, i) {
  const {
    props: s,
    attrs: o,
    vnode: { patchFlag: r }
  } = n, l = /* @__PURE__ */ lt(s), [a] = n.propsOptions;
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
        if (aa(n.emitsOptions, f))
          continue;
        const d = e[f];
        if (a)
          if (gt(o, f))
            d !== o[f] && (o[f] = d, u = !0);
          else {
            const p = An(f);
            s[p] = Du(
              a,
              l,
              p,
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
    hg(n, e, s, o) && (u = !0);
    let c;
    for (const h in l)
      (!e || // for camelCase
      !gt(e, h) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((c = Ii(h)) === h || !gt(e, c))) && (a ? t && // for camelCase
      (t[h] !== void 0 || // for kebab-case
      t[c] !== void 0) && (s[h] = Du(
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
  u && wi(n.attrs, "set", "");
}
function hg(n, e, t, i) {
  const [s, o] = n.propsOptions;
  let r = !1, l;
  if (e)
    for (let a in e) {
      if (Ho(a))
        continue;
      const u = e[a];
      let c;
      s && gt(s, c = An(a)) ? !o || !o.includes(c) ? t[c] = u : (l || (l = {}))[c] = u : aa(n.emitsOptions, a) || (!(a in i) || u !== i[a]) && (i[a] = u, r = !0);
    }
  if (o) {
    const a = /* @__PURE__ */ lt(t), u = l || ut;
    for (let c = 0; c < o.length; c++) {
      const h = o[c];
      t[h] = Du(
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
function Du(n, e, t, i, s, o) {
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
          const c = zc(s);
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
    ] && (i === "" || i === Ii(t)) && (i = !0));
  }
  return i;
}
function vb(n, e, t = !1) {
  const i = e.propsCache, s = i.get(n);
  if (s)
    return s;
  const o = n.props, r = {}, l = [];
  if (!o)
    return $t(n) && i.set(n, bs), bs;
  if (Ve(o))
    for (let u = 0; u < o.length; u++) {
      const c = An(o[u]);
      ef(c) && (r[c] = ut);
    }
  else if (o)
    for (const u in o) {
      const c = An(u);
      if (ef(c)) {
        const h = o[u], f = r[c] = Ve(h) || dt(h) ? { type: h } : Ln({}, h), d = f.type;
        let p = !1, v = !0;
        if (Ve(d))
          for (let m = 0; m < d.length; ++m) {
            const b = d[m], O = dt(b) && b.name;
            if (O === "Boolean") {
              p = !0;
              break;
            } else O === "String" && (v = !1);
          }
        else
          p = dt(d) && d.name === "Boolean";
        f[
          0
          /* shouldCast */
        ] = p, f[
          1
          /* shouldCastTrue */
        ] = v, (p || gt(f, "default")) && l.push(c);
      }
    }
  const a = [r, l];
  return $t(n) && i.set(n, a), a;
}
function ef(n) {
  return n[0] !== "$" && !Ho(n);
}
const Nc = (n) => n === "_" || n === "_ctx" || n === "$stable", Vc = (n) => Ve(n) ? n.map(ri) : [ri(n)], yb = (n, e, t) => {
  if (e._n)
    return e;
  const i = Qp((...s) => Vc(e(...s)), t);
  return i._c = !1, i;
}, fg = (n, e, t) => {
  const i = n._ctx;
  for (const s in n) {
    if (Nc(s)) continue;
    const o = n[s];
    if (dt(o))
      e[s] = yb(s, o, i);
    else if (o != null) {
      const r = Vc(o);
      e[s] = () => r;
    }
  }
}, dg = (n, e) => {
  const t = Vc(e);
  n.slots.default = () => t;
}, pg = (n, e, t) => {
  for (const i in e)
    (t || !Nc(i)) && (n[i] = e[i]);
}, bb = (n, e, t) => {
  const i = n.slots = ug();
  if (n.vnode.shapeFlag & 32) {
    const s = e._;
    s ? (pg(i, e, t), t && $p(i, "_", s, !0)) : fg(e, i);
  } else e && dg(n, e);
}, wb = (n, e, t) => {
  const { vnode: i, slots: s } = n;
  let o = !0, r = ut;
  if (i.shapeFlag & 32) {
    const l = e._;
    l ? t && l === 1 ? o = !1 : pg(s, e, t) : (o = !e.$stable, fg(e, s)), r = e;
  } else e && (dg(n, e), r = { default: 1 });
  if (o)
    for (const l in s)
      !Nc(l) && r[l] == null && delete s[l];
}, cn = Mb;
function xb(n) {
  return kb(n);
}
function kb(n, e) {
  const t = ia();
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
    insertStaticContent: p
  } = n, v = (S, w, $, B = null, _ = null, V = null, he = void 0, ie = null, oe = !!w.dynamicChildren) => {
    if (S === w)
      return;
    S && !So(S, w) && (B = Z(S), J(S, _, V, !0), S = null), w.patchFlag === -2 && (oe = !1, w.dynamicChildren = null), w.dynamicChildren && S && S.dynamicChildren && S.dynamicChildren.hasOnce && (w.dynamicChildren === bs && (w.dynamicChildren = []), w.dynamicChildren.hasOnce = !0);
    const { type: X, ref: Ae, shapeFlag: fe } = w;
    switch (X) {
      case ua:
        m(S, w, $, B);
        break;
      case pi:
        b(S, w, $, B);
        break;
      case Ua:
        S == null && O(w, $, B, he);
        break;
      case me:
        D(
          S,
          w,
          $,
          B,
          _,
          V,
          he,
          ie,
          oe
        );
        break;
      default:
        fe & 1 ? I(
          S,
          w,
          $,
          B,
          _,
          V,
          he,
          ie,
          oe
        ) : fe & 6 ? U(
          S,
          w,
          $,
          B,
          _,
          V,
          he,
          ie,
          oe
        ) : (fe & 64 || fe & 128) && X.process(
          S,
          w,
          $,
          B,
          _,
          V,
          he,
          ie,
          oe,
          ht
        );
    }
    Ae != null && _ ? Wo(Ae, S && S.ref, V, w || S, !w) : Ae == null && S && S.ref != null && Wo(S.ref, null, V, S, !0);
  }, m = (S, w, $, B) => {
    if (S == null)
      i(
        w.el = l(w.children),
        $,
        B
      );
    else {
      const _ = w.el = S.el;
      w.children !== S.children && u(_, w.children);
    }
  }, b = (S, w, $, B) => {
    S == null ? i(
      w.el = a(w.children || ""),
      $,
      B
    ) : w.el = S.el;
  }, O = (S, w, $, B) => {
    [S.el, S.anchor] = p(
      S.children,
      w,
      $,
      B,
      S.el,
      S.anchor
    );
  }, L = ({ el: S, anchor: w }, $, B) => {
    let _;
    for (; S && S !== w; )
      _ = f(S), i(S, $, B), S = _;
    i(w, $, B);
  }, E = ({ el: S, anchor: w }) => {
    let $;
    for (; S && S !== w; )
      $ = f(S), s(S), S = $;
    s(w);
  }, I = (S, w, $, B, _, V, he, ie, oe) => {
    if (w.type === "svg" ? he = "svg" : w.type === "math" && (he = "mathml"), S == null)
      z(
        w,
        $,
        B,
        _,
        V,
        he,
        ie,
        oe
      );
    else {
      const X = S.el && S.el._isVueCE ? S.el : null;
      try {
        X && X._beginPatch(), K(
          S,
          w,
          _,
          V,
          he,
          ie,
          oe
        );
      } finally {
        X && X._endPatch();
      }
    }
  }, z = (S, w, $, B, _, V, he, ie) => {
    let oe, X;
    const { props: Ae, shapeFlag: fe, transition: Ce, dirs: Te } = S;
    if (oe = S.el = r(
      S.type,
      V,
      Ae && Ae.is,
      Ae
    ), fe & 8 ? c(oe, S.children) : fe & 16 && Y(
      S.children,
      oe,
      null,
      B,
      _,
      Ka(S, V),
      he,
      ie
    ), Te && hs(S, null, B, "created"), R(oe, S, S.scopeId, he, B), Ae) {
      for (const ze in Ae)
        ze !== "value" && !Ho(ze) && o(oe, ze, null, Ae[ze], V, B);
      "value" in Ae && o(oe, "value", null, Ae.value, V), (X = Ae.onVnodeBeforeMount) && Xn(X, B, S);
    }
    Te && hs(S, null, B, "beforeMount");
    const Fe = Sb(_, Ce);
    Fe && Ce.beforeEnter(oe), i(oe, w, $), ((X = Ae && Ae.onVnodeMounted) || Fe || Te) && cn(() => {
      X && Xn(X, B, S), Fe && Ce.enter(oe), Te && hs(S, null, B, "mounted");
    }, _);
  }, R = (S, w, $, B, _) => {
    if ($ && d(S, $), B)
      for (let V = 0; V < B.length; V++)
        d(S, B[V]);
    if (_) {
      let V = _.subTree;
      if (w === V || yg(V.type) && (V.ssContent === w || V.ssFallback === w)) {
        const he = _.vnode;
        R(
          S,
          he,
          he.scopeId,
          he.slotScopeIds,
          _.parent
        );
      }
    }
  }, Y = (S, w, $, B, _, V, he, ie, oe = 0) => {
    for (let X = oe; X < S.length; X++) {
      const Ae = S[X] = ie ? bi(S[X]) : ri(S[X]);
      v(
        null,
        Ae,
        w,
        $,
        B,
        _,
        V,
        he,
        ie
      );
    }
  }, K = (S, w, $, B, _, V, he) => {
    const ie = w.el = S.el;
    let { patchFlag: oe, dynamicChildren: X, dirs: Ae } = w;
    oe |= S.patchFlag & 16;
    const fe = S.props || ut, Ce = w.props || ut;
    let Te;
    if ($ && fs($, !1), (Te = Ce.onVnodeBeforeUpdate) && Xn(Te, $, w, S), Ae && hs(w, S, $, "beforeUpdate"), $ && fs($, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    X && (!S.dynamicChildren || S.dynamicChildren.length !== X.length) && (oe = 0, he = !1, X = null), (fe.innerHTML && Ce.innerHTML == null || fe.textContent && Ce.textContent == null) && c(ie, ""), X ? re(
      S.dynamicChildren,
      X,
      ie,
      $,
      B,
      Ka(w, _),
      V
    ) : he || He(
      S,
      w,
      ie,
      null,
      $,
      B,
      Ka(w, _),
      V,
      !1
    ), oe > 0) {
      if (oe & 16)
        j(ie, fe, Ce, $, _);
      else if (oe & 2 && fe.class !== Ce.class && o(ie, "class", null, Ce.class, _), oe & 4 && o(ie, "style", fe.style, Ce.style, _), oe & 8) {
        const Fe = w.dynamicProps;
        for (let ze = 0; ze < Fe.length; ze++) {
          const Ke = Fe[ze], et = fe[Ke], pt = Ce[Ke];
          (pt !== et || Ke === "value") && o(ie, Ke, et, pt, _, $);
        }
      }
      oe & 1 && S.children !== w.children && c(ie, w.children);
    } else !he && X == null && j(ie, fe, Ce, $, _);
    ((Te = Ce.onVnodeUpdated) || Ae) && cn(() => {
      Te && Xn(Te, $, w, S), Ae && hs(w, S, $, "updated");
    }, B);
  }, re = (S, w, $, B, _, V, he) => {
    for (let ie = 0; ie < w.length; ie++) {
      const oe = S[ie], X = w[ie], Ae = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oe.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oe.type === me || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !So(oe, X) || // - In the case of a component, it could contain anything.
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
        B,
        _,
        V,
        he,
        !0
      );
    }
  }, j = (S, w, $, B, _) => {
    if (w !== $) {
      if (w !== ut)
        for (const V in w)
          !Ho(V) && !(V in $) && o(
            S,
            V,
            w[V],
            null,
            _,
            B
          );
      for (const V in $) {
        if (Ho(V)) continue;
        const he = $[V], ie = w[V];
        he !== ie && V !== "value" && o(S, V, ie, he, _, B);
      }
      "value" in $ && o(S, "value", w.value, $.value, _);
    }
  }, D = (S, w, $, B, _, V, he, ie, oe) => {
    const X = w.el = S ? S.el : l(""), Ae = w.anchor = S ? S.anchor : l("");
    let { patchFlag: fe, dynamicChildren: Ce, slotScopeIds: Te } = w;
    Te && (ie = ie ? ie.concat(Te) : Te), S == null ? (i(X, $, B), i(Ae, $, B), Y(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      w.children || [],
      $,
      Ae,
      _,
      V,
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
      V,
      he,
      ie
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (w.key != null || _ && w === _.subTree) && gg(
      S,
      w,
      !0
      /* shallow */
    )) : He(
      S,
      w,
      $,
      Ae,
      _,
      V,
      he,
      ie,
      oe
    );
  }, U = (S, w, $, B, _, V, he, ie, oe) => {
    w.slotScopeIds = ie, S == null ? w.shapeFlag & 512 ? _.ctx.activate(
      w,
      $,
      B,
      he,
      oe
    ) : ke(
      w,
      $,
      B,
      _,
      V,
      he,
      oe
    ) : $e(S, w, oe);
  }, ke = (S, w, $, B, _, V, he) => {
    const ie = S.component = Ob(
      S,
      B,
      _
    );
    if (ng(S) && (ie.ctx.renderer = ht), Lb(ie, !1, he), ie.asyncDep) {
      if (_ && _.registerDep(ie, ce, he), !S.el) {
        const oe = ie.subTree = Ht(pi);
        b(null, oe, w, $), S.placeholder = oe.el;
      }
    } else
      ce(
        ie,
        S,
        w,
        $,
        _,
        V,
        he
      );
  }, $e = (S, w, $) => {
    const B = w.component = S.component;
    if (db(S, w, $))
      if (B.asyncDep && !B.asyncResolved) {
        w.el = S.el, pe(B, w, $);
        return;
      } else
        B.next = w, B.update();
    else
      w.el = S.el, B.vnode = w;
  }, ce = (S, w, $, B, _, V, he) => {
    const ie = () => {
      if (S.isMounted) {
        let { next: fe, bu: Ce, u: Te, parent: Fe, vnode: ze } = S;
        {
          const at = mg(S);
          if (at) {
            fe && (fe.el = ze.el, pe(S, fe, he)), at.asyncDep.then(() => {
              cn(() => {
                S.isUnmounted || X();
              }, _);
            });
            return;
          }
        }
        let Ke = fe, et;
        fs(S, !1), fe ? (fe.el = ze.el, pe(S, fe, he)) : fe = ze, Ce && hl(Ce), (et = fe.props && fe.props.onVnodeBeforeUpdate) && Xn(et, Fe, fe, ze), fs(S, !0);
        const pt = Zh(S), Pt = S.subTree;
        S.subTree = pt, v(
          Pt,
          pt,
          // parent may have changed if it's in a teleport
          h(Pt.el),
          // anchor may have changed if it's in a fragment
          Z(Pt),
          S,
          _,
          V
        ), fe.el = pt.el, Ke === null && pb(S, pt.el), Te && cn(Te, _), (et = fe.props && fe.props.onVnodeUpdated) && cn(
          () => Xn(et, Fe, fe, ze),
          _
        );
      } else {
        let fe;
        const { el: Ce, props: Te } = w, { bm: Fe, m: ze, parent: Ke, root: et, type: pt } = S, Pt = qs(w);
        fs(S, !1), Fe && hl(Fe), !Pt && (fe = Te && Te.onVnodeBeforeMount) && Xn(fe, Ke, w), fs(S, !0);
        {
          et.ce && et.ce._hasShadowRoot() && et.ce._injectChildStyle(
            pt,
            S.parent ? S.parent.type : void 0
          );
          const at = S.subTree = Zh(S);
          v(
            null,
            at,
            $,
            B,
            S,
            _,
            V
          ), w.el = at.el;
        }
        if (ze && cn(ze, _), !Pt && (fe = Te && Te.onVnodeMounted)) {
          const at = w;
          cn(
            () => Xn(fe, Ke, at),
            _
          );
        }
        (w.shapeFlag & 256 || Ke && qs(Ke.vnode) && Ke.vnode.shapeFlag & 256) && S.a && cn(S.a, _), S.isMounted = !0, w = $ = B = null;
      }
    };
    S.scope.on();
    const oe = S.effect = new Ep(ie);
    S.scope.off();
    const X = S.update = oe.run.bind(oe), Ae = S.job = oe.runIfDirty.bind(oe);
    Ae.i = S, Ae.id = S.uid, oe.scheduler = () => Pc(Ae), fs(S, !0), X();
  }, pe = (S, w, $) => {
    w.component = S;
    const B = S.vnode.props;
    S.vnode = w, S.next = null, mb(S, w.props, B, $), wb(S, w.children, $), Xi(), qh(S), Ji();
  }, He = (S, w, $, B, _, V, he, ie, oe = !1) => {
    const X = S && S.children, Ae = S ? S.shapeFlag : 0, fe = w.children, { patchFlag: Ce, shapeFlag: Te } = w;
    if (Ce > 0) {
      if (Ce & 128) {
        Re(
          X,
          fe,
          $,
          B,
          _,
          V,
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
          B,
          _,
          V,
          he,
          ie,
          oe
        );
        return;
      }
    }
    Te & 8 ? (Ae & 16 && se(X, _, V), fe !== X && c($, fe)) : Ae & 16 ? Te & 16 ? Re(
      X,
      fe,
      $,
      B,
      _,
      V,
      he,
      ie,
      oe
    ) : se(X, _, V, !0) : (Ae & 8 && c($, ""), Te & 16 && Y(
      fe,
      $,
      B,
      _,
      V,
      he,
      ie,
      oe
    ));
  }, Oe = (S, w, $, B, _, V, he, ie, oe) => {
    S = S || bs, w = w || bs;
    const X = S.length, Ae = w.length, fe = Math.min(X, Ae);
    let Ce;
    for (Ce = 0; Ce < fe; Ce++) {
      const Te = w[Ce] = oe ? bi(w[Ce]) : ri(w[Ce]);
      v(
        S[Ce],
        Te,
        $,
        null,
        _,
        V,
        he,
        ie,
        oe
      );
    }
    X > Ae ? se(
      S,
      _,
      V,
      !0,
      !1,
      fe
    ) : Y(
      w,
      $,
      B,
      _,
      V,
      he,
      ie,
      oe,
      fe
    );
  }, Re = (S, w, $, B, _, V, he, ie, oe) => {
    let X = 0;
    const Ae = w.length;
    let fe = S.length - 1, Ce = Ae - 1;
    for (; X <= fe && X <= Ce; ) {
      const Te = S[X], Fe = w[X] = oe ? bi(w[X]) : ri(w[X]);
      if (So(Te, Fe))
        v(
          Te,
          Fe,
          $,
          null,
          _,
          V,
          he,
          ie,
          oe
        );
      else
        break;
      X++;
    }
    for (; X <= fe && X <= Ce; ) {
      const Te = S[fe], Fe = w[Ce] = oe ? bi(w[Ce]) : ri(w[Ce]);
      if (So(Te, Fe))
        v(
          Te,
          Fe,
          $,
          null,
          _,
          V,
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
        const Te = Ce + 1, Fe = Te < Ae ? w[Te].el : B;
        for (; X <= Ce; )
          v(
            null,
            w[X] = oe ? bi(w[X]) : ri(w[X]),
            $,
            Fe,
            _,
            V,
            he,
            ie,
            oe
          ), X++;
      }
    } else if (X > Ce)
      for (; X <= fe; )
        J(S[X], _, V, !0), X++;
    else {
      const Te = X, Fe = X, ze = /* @__PURE__ */ new Map();
      for (X = Fe; X <= Ce; X++) {
        const Lt = w[X] = oe ? bi(w[X]) : ri(w[X]);
        Lt.key != null && ze.set(Lt.key, X);
      }
      let Ke, et = 0;
      const pt = Ce - Fe + 1;
      let Pt = !1, at = 0;
      const yn = new Array(pt);
      for (X = 0; X < pt; X++) yn[X] = 0;
      for (X = Te; X <= fe; X++) {
        const Lt = S[X];
        if (et >= pt) {
          J(Lt, _, V, !0);
          continue;
        }
        let _t;
        if (Lt.key != null)
          _t = ze.get(Lt.key);
        else
          for (Ke = Fe; Ke <= Ce; Ke++)
            if (yn[Ke - Fe] === 0 && So(Lt, w[Ke])) {
              _t = Ke;
              break;
            }
        _t === void 0 ? J(Lt, _, V, !0) : (yn[_t - Fe] = X + 1, _t >= at ? at = _t : Pt = !0, v(
          Lt,
          w[_t],
          $,
          null,
          _,
          V,
          he,
          ie,
          oe
        ), et++);
      }
      const qn = Pt ? Cb(yn) : bs;
      for (Ke = qn.length - 1, X = pt - 1; X >= 0; X--) {
        const Lt = Fe + X, _t = w[Lt], bn = w[Lt + 1], At = Lt + 1 < Ae ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          bn.el || vg(bn)
        ) : B;
        yn[X] === 0 ? v(
          null,
          _t,
          $,
          At,
          _,
          V,
          he,
          ie,
          oe
        ) : Pt && (Ke < 0 || X !== qn[Ke] ? Le(_t, $, At, 2) : Ke--);
      }
    }
  }, Le = (S, w, $, B, _ = null) => {
    const { el: V, type: he, transition: ie, children: oe, shapeFlag: X } = S;
    if (X & 6) {
      Le(S.component.subTree, w, $, B);
      return;
    }
    if (X & 128) {
      S.suspense.move(w, $, B);
      return;
    }
    if (X & 64) {
      he.move(S, w, $, ht);
      return;
    }
    if (he === me) {
      i(V, w, $);
      for (let fe = 0; fe < oe.length; fe++)
        Le(oe[fe], w, $, B);
      i(S.anchor, w, $);
      return;
    }
    if (he === Ua) {
      L(S, w, $);
      return;
    }
    if (B !== 2 && X & 1 && ie)
      if (B === 0)
        ie.persisted && !V[za] ? i(V, w, $) : (ie.beforeEnter(V), i(V, w, $), cn(() => ie.enter(V), _));
      else {
        const { leave: fe, delayLeave: Ce, afterLeave: Te } = ie, Fe = () => {
          S.ctx.isUnmounted ? s(V) : i(V, w, $);
        }, ze = () => {
          const Ke = V._isLeaving || !!V[za];
          V._isLeaving && V[za](
            !0
            /* cancelled */
          ), ie.persisted && !Ke ? Fe() : fe(V, () => {
            Fe(), Te && Te();
          });
        };
        Ce ? Ce(V, Fe, ze) : ze();
      }
    else
      i(V, w, $);
  }, J = (S, w, $, B = !1, _ = !1) => {
    const {
      type: V,
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
    if ((fe === -2 || X && X.hasOnce) && (_ = !1), ie != null && (Xi(), Wo(ie, null, $, S, !0), Ji()), Te != null && (!S.ctx || S.ctx === w) && (w.renderCache[Te] = void 0), Ae & 256) {
      w.ctx.deactivate(S);
      return;
    }
    const ze = Ae & 1 && Ce, Ke = !qs(S);
    let et;
    if (Ke && (et = he && he.onVnodeBeforeUnmount) && Xn(et, w, S), Ae & 6)
      Be(S.component, $, B);
    else {
      if (Ae & 128) {
        S.suspense.unmount($, B);
        return;
      }
      ze && hs(S, null, w, "beforeUnmount"), Ae & 64 ? S.type.remove(
        S,
        w,
        $,
        ht,
        B
      ) : X && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !X.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (V !== me || fe > 0 && fe & 64) ? se(
        X,
        w,
        $,
        !1,
        !0
      ) : (V === me && fe & 384 || !_ && Ae & 16) && se(oe, w, $), B && ct(S);
    }
    const pt = Fe != null && Te == null;
    (Ke && (et = he && he.onVnodeUnmounted) || ze || pt) && cn(() => {
      et && Xn(et, w, S), ze && hs(S, null, w, "unmounted"), pt && (S.el = null);
    }, $);
  }, ct = (S) => {
    const { type: w, el: $, anchor: B, transition: _ } = S;
    if (w === me) {
      ye($, B);
      return;
    }
    if (w === Ua) {
      E(S), _ && !_.persisted && _.afterLeave && _.afterLeave();
      return;
    }
    const V = () => {
      s($), _ && !_.persisted && _.afterLeave && _.afterLeave();
    };
    if (S.shapeFlag & 1 && _ && !_.persisted) {
      const { leave: he, delayLeave: ie } = _, oe = () => he($, V);
      ie ? ie(S.el, V, oe) : oe();
    } else
      V();
  }, ye = (S, w) => {
    let $;
    for (; S !== w; )
      $ = f(S), s(S), S = $;
    s(w);
  }, Be = (S, w, $) => {
    const { bum: B, scope: _, job: V, subTree: he, um: ie, m: oe, a: X } = S;
    tf(oe), tf(X), B && hl(B), _.stop(), V ? (V.flags |= 8, J(he, S, w, $)) : S.vnode.el && he && (he.transition = S.vnode.transition, J(he, S, w, $)), ie && cn(ie, w), cn(() => {
      S.isUnmounted = !0;
    }, w);
  }, se = (S, w, $, B = !1, _ = !1, V = 0) => {
    for (let he = V; he < S.length; he++)
      J(S[he], w, $, B, _);
  }, Z = (S) => {
    if (S.shapeFlag & 6)
      return Z(S.component.subTree);
    if (S.shapeFlag & 128)
      return S.suspense.next();
    const w = f(S.anchor || S.el), $ = w && w[eb];
    return $ ? f($) : w;
  };
  let ne = !1;
  const Xe = (S, w, $) => {
    let B;
    S == null ? w._vnode && (J(w._vnode, null, null, !0), B = w._vnode.component) : v(
      w._vnode || null,
      S,
      w,
      null,
      null,
      null,
      $
    ), w._vnode = S, ne || (ne = !0, qh(B), Xp(), ne = !1);
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
    createApp: ab(Xe)
  };
}
function Ka({ type: n, props: e }, t) {
  return t === "svg" && n === "foreignObject" || t === "mathml" && n === "annotation-xml" && e && e.encoding && e.encoding.includes("html") ? void 0 : t;
}
function fs({ effect: n, job: e }, t) {
  t ? (n.flags |= 32, e.flags |= 4) : (n.flags &= -33, e.flags &= -5);
}
function Sb(n, e) {
  return (!n || n && !n.pendingBranch) && e && !e.persisted;
}
function gg(n, e, t = !1) {
  const i = n.children, s = e.children;
  if (Ve(i) && Ve(s))
    for (let o = 0; o < i.length; o++) {
      const r = i[o];
      let l = s[o];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = s[o] = bi(s[o]), l.el = r.el), !t && l.patchFlag !== -2 && gg(r, l)), l.type === ua && (l.patchFlag === -1 && (l = s[o] = bi(l)), l.el = r.el), l.type === pi && !l.el && (l.el = r.el);
    }
}
function Cb(n) {
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
function mg(n) {
  const e = n.subTree.component;
  if (e)
    return e.asyncDep && !e.asyncResolved ? e : mg(e);
}
function tf(n) {
  if (n)
    for (let e = 0; e < n.length; e++)
      n[e].flags |= 8;
}
function vg(n) {
  if (n.placeholder)
    return n.placeholder;
  const e = n.component;
  return e ? vg(e.subTree) : null;
}
const yg = (n) => n.__isSuspense;
function Mb(n, e) {
  e && e.pendingBranch ? Ve(n) ? e.effects.push(...n) : e.effects.push(n) : Y0(n);
}
const me = /* @__PURE__ */ Symbol.for("v-fgt"), ua = /* @__PURE__ */ Symbol.for("v-txt"), pi = /* @__PURE__ */ Symbol.for("v-cmt"), Ua = /* @__PURE__ */ Symbol.for("v-stc"), Ai = [];
let mn = null;
function k(n = !1) {
  Ai.push(mn = n ? null : []);
}
function Hc() {
  Ai.pop(), mn = Ai[Ai.length - 1] || null;
}
let nr = 1;
function nf(n, e = !1) {
  nr += n, n < 0 && mn && e && (mn.hasOnce = !0);
}
function bg(n) {
  return n.dynamicChildren = nr > 0 ? mn || bs : null, Hc(), nr > 0 && mn && mn.push(n), n;
}
function M(n, e, t, i, s, o) {
  return bg(
    g(
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
function kn(n, e, t, i, s) {
  return bg(
    Ht(
      n,
      e,
      t,
      i,
      s,
      !0
    )
  );
}
function Fc(n) {
  return n ? n.__v_isVNode === !0 : !1;
}
function So(n, e) {
  return n.type === e.type && n.key === e.key;
}
const wg = ({ key: n }) => n ?? null, fl = ({
  ref: n,
  ref_key: e,
  ref_for: t
}) => (typeof n == "number" && (n = "" + n), n != null ? Rt(n) || /* @__PURE__ */ ln(n) || dt(n) ? { i: Zt, r: n, k: e, f: !!t } : n : null);
function g(n, e = null, t = null, i = 0, s = null, o = n === me ? 0 : 1, r = !1, l = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: n,
    props: e,
    key: e && wg(e),
    ref: e && fl(e),
    scopeId: Zp,
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
    ctx: Zt
  };
  return l ? (Dl(a, t), o & 128 && n.normalize(a)) : t && (a.shapeFlag |= Rt(t) ? 8 : 16), nr > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  mn && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && mn.push(a), a;
}
const Ht = Ab;
function Ab(n, e = null, t = null, i = 0, s = null, o = !1) {
  if ((!n || n === sb) && (n = pi), Fc(n)) {
    const l = no(
      n,
      e,
      !0
      /* mergeRef: true */
    );
    return t && Dl(l, t), nr > 0 && !o && mn && (l.shapeFlag & 6 ? mn[mn.indexOf(n)] = l : mn.push(l)), l.patchFlag = -2, l;
  }
  if (Rb(n) && (n = n.__vccOpts), e) {
    e = Tb(e);
    let { class: l, style: a } = e;
    l && !Rt(l) && (e.class = qe(l)), $t(a) && (/* @__PURE__ */ Rc(a) && !Ve(a) && (a = Ln({}, a)), e.style = Mi(a));
  }
  const r = Rt(n) ? 1 : yg(n) ? 128 : la(n) ? 64 : $t(n) ? 4 : dt(n) ? 2 : 0;
  return g(
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
function Tb(n) {
  return n ? /* @__PURE__ */ Rc(n) || cg(n) ? Ln({}, n) : n : null;
}
function no(n, e, t = !1, i = !1) {
  const { props: s, ref: o, patchFlag: r, children: l, transition: a } = n, u = e ? Eo(s || {}, e) : s, c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: n.type,
    props: u,
    key: u && wg(u),
    ref: e && e.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      t && o ? Ve(o) ? o.concat(fl(e)) : [o, fl(e)] : fl(e)
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
    ssContent: n.ssContent && no(n.ssContent),
    ssFallback: n.ssFallback && no(n.ssFallback),
    placeholder: n.placeholder,
    el: n.el,
    anchor: n.anchor,
    ctx: n.ctx,
    ce: n.ce,
    cacheIndex: n.cacheIndex
  };
  return a && i && _c(
    c,
    a.clone(c)
  ), c;
}
function be(n = " ", e = 0) {
  return Ht(ua, null, n, e);
}
function ee(n = "", e = !1) {
  return e ? (k(), kn(pi, null, n)) : Ht(pi, null, n);
}
function ri(n) {
  return n == null || typeof n == "boolean" ? Ht(pi) : Ve(n) ? Ht(
    me,
    null,
    // #3666, avoid reference pollution when reusing vnode
    n.slice()
  ) : Fc(n) ? bi(n) : Ht(ua, null, String(n));
}
function bi(n) {
  return n.el === null && n.patchFlag !== -1 || n.memo ? n : no(n);
}
function Dl(n, e) {
  let t = 0;
  const { shapeFlag: i } = n;
  if (e == null)
    e = null;
  else if (Ve(e))
    t = 16;
  else if (typeof e == "object")
    if (i & 65) {
      const s = e.default;
      s && (s._c && (s._d = !1), Dl(n, s()), s._c && (s._d = !0));
      return;
    } else {
      t = 32;
      const s = e._;
      !s && !cg(e) ? e._ctx = Zt : s === 3 && Zt && (Zt.slots._ === 1 ? e._ = 1 : (e._ = 2, n.patchFlag |= 1024));
    }
  else if (dt(e)) {
    if (i & 65) {
      Dl(n, { default: e });
      return;
    }
    e = { default: e, _ctx: Zt }, t = 32;
  } else
    e = String(e), i & 64 ? (t = 16, e = [be(e)]) : t = 8;
  n.children = e, n.shapeFlag |= t;
}
function Eo(...n) {
  const e = {};
  for (let t = 0; t < n.length; t++) {
    const i = n[t];
    for (const s in i)
      if (s === "class")
        e.class !== i.class && (e.class = qe([e.class, i.class]));
      else if (s === "style")
        e.style = Mi([e.style, i.style]);
      else if (Ql(s)) {
        const o = e[s], r = i[s];
        r && o !== r && !(Ve(o) && o.includes(r)) ? e[s] = o ? [].concat(o, r) : r : r == null && o == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !ea(s) && (e[s] = r);
      } else s !== "" && (e[s] = i[s]);
  }
  return e;
}
function Xn(n, e, t, i = null) {
  di(n, e, 7, [
    t,
    i
  ]);
}
const $b = og();
let Db = 0;
function Ob(n, e, t) {
  const i = n.type, s = (e ? e.appContext : n.appContext) || $b, o = {
    uid: Db++,
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
    scope: new y0(
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
    propsOptions: vb(i, s),
    emitsOptions: cb(i, s),
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
  return o.ctx = { _: o }, o.root = e ? e.root : o, o.emit = ub.bind(null, o), n.ce && n.ce(o), o;
}
let Qi = null;
const xg = () => Qi || Zt;
let Ol, ir;
{
  const n = ia(), e = (t, i) => {
    let s;
    return (s = n[t]) || (s = n[t] = []), s.push(i), (o) => {
      s.length > 1 ? s.forEach((r) => r(o)) : s[0](o);
    };
  };
  Ol = e(
    "__VUE_INSTANCE_SETTERS__",
    (t) => Qi = t
  ), ir = e(
    "__VUE_SSR_SETTERS__",
    (t) => sr = t
  );
}
const zc = (n) => {
  const e = Qi;
  return Ol(n), n.scope.on(), () => {
    n.scope.off(), Ol(e);
  };
}, sf = () => {
  Qi && Qi.scope.off(), Ol(null);
};
function kg(n) {
  return n.vnode.shapeFlag & 4;
}
let sr = !1;
function Lb(n, e = !1, t = !1) {
  e && ir(e);
  const { props: i, children: s } = n.vnode, o = kg(n);
  gb(n, i, o, e), bb(n, s, t || e);
  const r = o ? Eb(n, e) : void 0;
  return e && ir(!1), r;
}
function Eb(n, e) {
  const t = n.type;
  n.accessCache = /* @__PURE__ */ Object.create(null), n.proxy = new Proxy(n.ctx, rb);
  const { setup: i } = t;
  if (i) {
    Xi();
    const s = n.setupContext = i.length > 1 ? Bb(n) : null, o = zc(n), r = xr(
      i,
      n,
      0,
      [
        n.props,
        s
      ]
    ), l = Cp(r);
    if (Ji(), o(), (l || n.sp) && !qs(n) && nb(n), l) {
      if (r.then(sf, sf), e)
        return r.then((a) => {
          ir(!0);
          try {
            of(n, a, e);
          } finally {
            ir(!1);
          }
        }).catch((a) => {
          ra(a, n, 0);
        });
      n.asyncDep = r;
    } else
      of(n, r);
  } else
    Sg(n);
}
function of(n, e, t) {
  dt(e) ? n.type.__ssrInlineRender ? n.ssrRender = e : n.render = e : $t(e) && (n.setupState = Gp(e)), Sg(n);
}
function Sg(n, e, t) {
  const i = n.type;
  n.render || (n.render = i.render || ks);
}
const Ib = {
  get(n, e) {
    return Jt(n, "get", ""), n[e];
  }
};
function Bb(n) {
  const e = (t) => {
    n.exposed = t || {};
  };
  return {
    attrs: new Proxy(n.attrs, Ib),
    slots: n.slots,
    emit: n.emit,
    expose: e
  };
}
function ca(n) {
  return n.exposed ? n.exposeProxy || (n.exposeProxy = new Proxy(Gp(N0(n.exposed)), {
    get(e, t) {
      if (t in e)
        return e[t];
      if (t in Ko)
        return Ko[t](n);
    },
    has(e, t) {
      return t in e || t in Ko;
    }
  })) : n.proxy;
}
function Rb(n) {
  return dt(n) && "__vccOpts" in n;
}
const N = (n, e) => /* @__PURE__ */ K0(n, e, sr), Pb = "3.5.43";
let Ou;
const rf = typeof window < "u" && window.trustedTypes;
if (rf)
  try {
    Ou = /* @__PURE__ */ rf.createPolicy("vue", {
      createHTML: (n) => n
    });
  } catch {
  }
const Cg = Ou ? (n) => Ou.createHTML(n) : (n) => n, _b = "http://www.w3.org/2000/svg", Nb = "http://www.w3.org/1998/Math/MathML", yi = typeof document < "u" ? document : null, lf = yi && /* @__PURE__ */ yi.createElement("template"), Vb = {
  insert: (n, e, t) => {
    e.insertBefore(n, t || null);
  },
  remove: (n) => {
    const e = n.parentNode;
    e && e.removeChild(n);
  },
  createElement: (n, e, t, i) => {
    const s = e === "svg" ? yi.createElementNS(_b, n) : e === "mathml" ? yi.createElementNS(Nb, n) : t ? yi.createElement(n, { is: t }) : yi.createElement(n);
    return n === "select" && i && i.multiple != null && s.setAttribute("multiple", i.multiple), s;
  },
  createText: (n) => yi.createTextNode(n),
  createComment: (n) => yi.createComment(n),
  setText: (n, e) => {
    n.nodeValue = e;
  },
  setElementText: (n, e) => {
    n.textContent = e;
  },
  parentNode: (n) => n.parentNode,
  nextSibling: (n) => n.nextSibling,
  querySelector: (n) => yi.querySelector(n),
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
      lf.innerHTML = Cg(
        i === "svg" ? `<svg>${n}</svg>` : i === "mathml" ? `<math>${n}</math>` : n
      );
      const l = lf.content;
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
}, Hb = /* @__PURE__ */ Symbol("_vtc");
function Fb(n, e, t) {
  const i = n[Hb];
  i && (e = (e ? [e, ...i] : [...i]).join(" ")), e == null ? n.removeAttribute("class") : t ? n.setAttribute("class", e) : n.className = e;
}
const af = /* @__PURE__ */ Symbol("_vod"), zb = /* @__PURE__ */ Symbol("_vsh"), Wb = /* @__PURE__ */ Symbol(""), Kb = /(?:^|;)\s*display\s*:/;
function Ub(n, e, t) {
  const i = n.style, s = Rt(t);
  let o = !1;
  if (t && !s) {
    if (e)
      if (Rt(e))
        for (const r of e.split(";")) {
          const l = r.slice(0, r.indexOf(":")).trim();
          t[l] == null && Io(i, l, "");
        }
      else
        for (const r in e)
          t[r] == null && Io(i, r, "");
    for (const r in t) {
      r === "display" && (o = !0);
      const l = t[r];
      l != null ? Gb(
        n,
        r,
        !Rt(e) && e ? e[r] : void 0,
        l
      ) || Io(i, r, l) : Io(i, r, "");
    }
  } else if (s) {
    if (e !== t) {
      const r = i[Wb];
      r && (t += ";" + r), i.cssText = t, o = Kb.test(t);
    }
  } else e && n.removeAttribute("style");
  af in n && (n[af] = o ? i.display : "", n[zb] && (i.display = "none"));
}
const _r = /\s*!important$/;
function Io(n, e, t) {
  if (Ve(t))
    t.forEach((i) => Io(n, e, i));
  else if (t == null && (t = ""), e.startsWith("--"))
    _r.test(t) ? n.setProperty(e, t.replace(_r, ""), "important") : n.setProperty(e, t);
  else {
    const i = jb(n, e);
    _r.test(t) ? n.setProperty(
      Ii(i),
      t.replace(_r, ""),
      "important"
    ) : n[i] = t;
  }
}
const uf = ["Webkit", "Moz", "ms"], ja = {};
function jb(n, e) {
  const t = ja[e];
  if (t)
    return t;
  let i = An(e);
  if (i !== "filter" && i in n)
    return ja[e] = i;
  i = Tp(i);
  for (let s = 0; s < uf.length; s++) {
    const o = uf[s] + i;
    if (o in n)
      return ja[e] = o;
  }
  return e;
}
function Gb(n, e, t, i) {
  return n.tagName === "TEXTAREA" && (e === "width" || e === "height") && Rt(i) && t === i;
}
const cf = "http://www.w3.org/1999/xlink";
function hf(n, e, t, i, s, o = g0(e)) {
  i && e.startsWith("xlink:") ? t == null ? n.removeAttributeNS(cf, e.slice(6, e.length)) : n.setAttributeNS(cf, e, t) : t == null || o && !Dp(t) ? n.removeAttribute(e) : n.setAttribute(
    e,
    o ? "" : Wn(t) ? String(t) : t
  );
}
function ff(n, e, t, i, s) {
  if (e === "innerHTML" || e === "textContent") {
    t != null && (n[e] = e === "innerHTML" ? Cg(t) : t);
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
    l === "boolean" ? t = Dp(t) : t == null && l === "string" ? (t = "", r = !0) : l === "number" && (t = 0, r = !0);
  }
  try {
    n[e] = t;
  } catch {
  }
  r && n.removeAttribute(s || e);
}
function zi(n, e, t, i) {
  n.addEventListener(e, t, i);
}
function qb(n, e, t, i) {
  n.removeEventListener(e, t, i);
}
const df = /* @__PURE__ */ Symbol("_vei");
function Yb(n, e, t, i, s = null) {
  const o = n[df] || (n[df] = {}), r = o[e];
  if (i && r)
    r.value = i;
  else {
    const [l, a] = Zb(e);
    if (i) {
      const u = o[e] = t1(
        i,
        s
      );
      zi(n, l, u, a);
    } else r && (qb(n, l, r, a), o[e] = void 0);
  }
}
const Xb = /(Once|Passive|Capture)$/, Jb = /^on:?(?:Once|Passive|Capture)$/;
function Zb(n) {
  let e, t;
  for (; (t = n.match(Xb)) && !Jb.test(n); )
    e || (e = {}), n = n.slice(0, n.length - t[1].length), e[t[1].toLowerCase()] = !0;
  return [n[2] === ":" ? n.slice(3) : Ii(n.slice(2)), e];
}
let Ga = 0;
const Qb = /* @__PURE__ */ Promise.resolve(), e1 = () => Ga || (Qb.then(() => Ga = 0), Ga = Date.now());
function t1(n, e) {
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
        u && di(
          u,
          e,
          5,
          l
        );
      }
    } else
      di(
        s,
        e,
        5,
        [i]
      );
  };
  return t.value = n, t.attached = e1(), t;
}
const pf = (n) => n.charCodeAt(0) === 111 && n.charCodeAt(1) === 110 && // lowercase letter
n.charCodeAt(2) > 96 && n.charCodeAt(2) < 123, n1 = (n, e, t, i, s, o) => {
  const r = s === "svg";
  e === "class" ? Fb(n, i, r) : e === "style" ? Ub(n, t, i) : Ql(e) ? ea(e) || Yb(n, e, t, i, o) : (e[0] === "." ? (e = e.slice(1), !0) : e[0] === "^" ? (e = e.slice(1), !1) : i1(n, e, i, r)) ? (ff(n, e, i), !n.tagName.includes("-") && (e === "value" || e === "checked" || e === "selected") && hf(n, e, i, r, o, e !== "value")) : /* #11081 force set props for possible async custom element */ n._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (s1(n, e) || // @ts-expect-error _def is private
  n._def.__asyncLoader && (/[A-Z]/.test(e) || !Rt(i))) ? ff(n, An(e), i, o, e) : (e === "true-value" ? n._trueValue = i : e === "false-value" && (n._falseValue = i), hf(n, e, i, r));
};
function i1(n, e, t, i) {
  if (i)
    return !!(e === "innerHTML" || e === "textContent" || e in n && pf(e) && dt(t));
  if (e === "spellcheck" || e === "draggable" || e === "translate" || e === "autocorrect" || e === "sandbox" && n.tagName === "IFRAME" || e === "form" || e === "list" && n.tagName === "INPUT" || e === "type" && n.tagName === "TEXTAREA")
    return !1;
  if (e === "width" || e === "height") {
    const s = n.tagName;
    if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE")
      return !1;
  }
  return pf(e) && Rt(t) ? !1 : e in n;
}
function s1(n, e) {
  const t = (
    // @ts-expect-error _def is private
    n._def.props
  );
  if (!t)
    return !1;
  const i = An(e);
  return Array.isArray(t) ? t.some((s) => An(s) === i) : Object.keys(t).some((s) => An(s) === i);
}
const io = (n) => {
  const e = n.props["onUpdate:modelValue"] || !1;
  return Ve(e) ? (t) => hl(e, t) : e;
};
function o1(n) {
  n.target.composing = !0;
}
function gf(n) {
  const e = n.target;
  e.composing && (e.composing = !1, e.dispatchEvent(new Event("input")));
}
const ci = /* @__PURE__ */ Symbol("_assign"), Nr = /* @__PURE__ */ Symbol("_initialValue");
function qa(n, e, t) {
  return e && (n = n.trim()), t && (n = na(n)), n;
}
const Nt = {
  created(n, { modifiers: { lazy: e, trim: t, number: i } }, s) {
    n.parentNode && (n.type === "text" ? n[Nr] = n.defaultValue.replace(/[\r\n]/g, "") : n.type === "textarea" && (n[Nr] = n.defaultValue.replace(/\r\n?/g, `
`))), n[ci] = io(s);
    const o = i || s.props && s.props.type === "number";
    zi(n, e ? "change" : "input", (r) => {
      r.target.composing || n[ci](qa(n.value, t, o));
    }), (t || o) && zi(n, "change", () => {
      n.value = qa(n.value, t, o);
    }), e || (zi(n, "compositionstart", o1), zi(n, "compositionend", gf), zi(n, "change", gf));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(n, { value: e, modifiers: { trim: t, number: i } }) {
    const s = e ?? "", o = n[Nr];
    delete n[Nr], o !== void 0 && (n.type === "text" || n.type === "textarea") && n.value !== o ? n[ci](qa(n.value, t, i)) : n.value = s;
  },
  beforeUpdate(n, { value: e, oldValue: t, modifiers: { lazy: i, trim: s, number: o } }, r) {
    if (n[ci] = io(r), n.composing) return;
    const l = (o || n.type === "number") && !/^0\d/.test(n.value) ? na(n.value) : n.value, a = e ?? "";
    if (l === a)
      return;
    const u = n.getRootNode();
    (u instanceof Document || u instanceof ShadowRoot) && u.activeElement === n && n.type !== "range" && (i && e === t || s && n.value.trim() === a) || (n.value = a);
  }
}, hn = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(n, e, t) {
    n[ci] = io(t), zi(n, "change", () => {
      const i = n._modelValue, s = or(n), o = n.checked, r = n[ci];
      if (Ve(i)) {
        const l = Dc(i, s), a = l !== -1;
        if (o && !a)
          r(i.concat(s));
        else if (!o && a) {
          const u = [...i];
          u.splice(l, 1), r(u);
        }
      } else if (Di(i)) {
        const l = new Set(i);
        o ? l.add(s) : l.delete(s), r(l);
      } else
        r(Mg(n, o));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: mf,
  beforeUpdate(n, e, t) {
    n[ci] = io(t), mf(n, e, t);
  }
};
function mf(n, { value: e, oldValue: t }, i) {
  n._modelValue = e;
  let s;
  if (Ve(e))
    s = Dc(e, i.props.value) > -1;
  else if (Di(e))
    s = e.has(i.props.value);
  else {
    if (e === t) return;
    s = Oi(e, Mg(n, !0));
  }
  n.checked !== s && (n.checked = s);
}
const $s = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(n, { value: e, modifiers: { number: t } }, i) {
    n._modelValue = e, zi(n, "change", () => {
      const s = Array.prototype.filter.call(n.options, (a) => a.selected).map(
        (a) => t ? na(or(a)) : or(a)
      ), o = n.multiple, r = o ? Di(n._modelValue) ? new Set(s) : s : s[0], l = n._pendingValue = [
        o,
        o ? Ve(r) ? s.slice() : s : r
      ];
      try {
        n[ci](r);
      } finally {
        Pn(() => {
          n._pendingValue === l && (n._pendingValue = void 0);
        });
      }
    }), n[ci] = io(i);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(n, { value: e }) {
    vf(n, e);
  },
  beforeUpdate(n, { value: e }, t) {
    n._modelValue = e, n[ci] = io(t);
  },
  updated(n, { value: e }) {
    const t = n._pendingValue;
    n._pendingValue = void 0, (!t || t[0] !== n.multiple || !r1(e, t[1], t[0])) && vf(n, e);
  }
};
function r1(n, e, t) {
  if (!t || Ve(n)) return Oi(n, e);
  if (Di(n)) {
    if (n.size !== e.length) return !1;
    for (const i of e)
      if (!n.has(i)) return !1;
    return !0;
  }
  return !1;
}
function vf(n, e) {
  const t = n.multiple, i = Ve(e);
  if (!(t && !i && !Di(e))) {
    for (let s = 0, o = n.options.length; s < o; s++) {
      const r = n.options[s], l = or(r);
      if (t)
        if (i) {
          const a = typeof l;
          a === "string" || a === "number" ? r.selected = e.some((u) => String(u) === String(l)) : r.selected = Dc(e, l) > -1;
        } else
          r.selected = e.has(l);
      else if (Oi(or(r), e)) {
        n.selectedIndex !== s && (n.selectedIndex = s);
        return;
      }
    }
    !t && n.selectedIndex !== -1 && (n.selectedIndex = -1);
  }
}
function or(n) {
  return "_value" in n ? n._value : n.value;
}
function Mg(n, e) {
  const t = e ? "_trueValue" : "_falseValue";
  return t in n ? n[t] : e;
}
const l1 = ["ctrl", "shift", "alt", "meta"], a1 = {
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
  exact: (n, e) => l1.some((t) => n[`${t}Key`] && !e.includes(t))
}, ft = (n, e) => {
  if (!n) return n;
  const t = n._withMods || (n._withMods = {}), i = e.join(".");
  return t[i] || (t[i] = ((s, ...o) => {
    for (let r = 0; r < e.length; r++) {
      const l = a1[e[r]];
      if (l && l(s, e)) return;
    }
    return n(s, ...o);
  }));
}, u1 = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, Et = (n, e) => {
  const t = n._withKeys || (n._withKeys = {}), i = e.join(".");
  return t[i] || (t[i] = ((s) => {
    if (!("key" in s))
      return;
    const o = Ii(s.key);
    if (e.some(
      (r) => r === o || u1[r] === o
    ))
      return n(s);
  }));
}, c1 = /* @__PURE__ */ Ln({ patchProp: n1 }, Vb);
let yf;
function h1() {
  return yf || (yf = xb(c1));
}
const f1 = ((...n) => {
  const e = h1().createApp(...n), { mount: t } = e;
  return e.mount = (i) => {
    const s = p1(i);
    if (!s) return;
    const o = e._component;
    !dt(o) && !o.render && !o.template && (o.template = s.innerHTML), s.nodeType === 1 && (s.textContent = "");
    const r = t(s, !1, d1(s));
    return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), r;
  }, e;
});
function d1(n) {
  if (n instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && n instanceof MathMLElement)
    return "mathml";
}
function p1(n) {
  return Rt(n) ? document.querySelector(n) : n;
}
const g1 = '.plenio-overlay{position:fixed;inset:0;z-index:3000;background:#0000008c;display:flex;align-items:center;justify-content:center;font:13px/1.45 var(--font-family, sans-serif)}.plenio-overlay .plenio-dialog{position:relative;width:min(1280px,96vw);height:min(900px,94vh);max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);--plenio-dialog-h: min(900px, 94vh);display:flex;flex-direction:column;background:var(--comfy-menu-bg, #222);color:var(--fg-color, #ddd);border:1px solid var(--border-color, #444);border-radius:10px;box-shadow:0 12px 40px #0000007f}.plenio-overlay .resize-handle{position:absolute;right:2px;bottom:2px;width:16px;height:16px;cursor:nwse-resize;border-bottom-right-radius:8px;background:linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 0 0 / 8px 8px,linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 4px 4px / 8px 8px;touch-action:none}.plenio-overlay .plenio-dialog.maximized{border-radius:6px}.plenio-overlay .splitter{flex:none;background:transparent;touch-action:none}.plenio-overlay .splitter.horizontal{height:10px;margin:-3px 0;cursor:ns-resize;border-radius:5px}.plenio-overlay .splitter.vertical{width:10px;margin:0 -3px;cursor:ew-resize;border-radius:5px}.plenio-overlay .splitter:hover,.plenio-overlay .splitter:focus-visible{background:#4c9aff59;outline:none}.plenio-overlay .score-views>.splitter.horizontal{grid-row:1;align-self:end;height:10px;margin-bottom:-9px;z-index:2}.plenio-overlay .score-main>.splitter.vertical{grid-column:1;justify-self:end;align-self:stretch;width:10px;margin-right:-10px;z-index:2}.plenio-overlay header,.plenio-overlay footer,.plenio-overlay .doc-head{display:flex;align-items:center;gap:8px}.plenio-overlay header{padding:12px 16px;border-bottom:1px solid var(--border-color, #444)}.plenio-overlay header h2{margin:0;font-size:16px}.plenio-overlay .status{color:var(--descrip-text, #999)}.plenio-overlay .status.bad,.plenio-overlay .error{color:#e0685e}.plenio-overlay .spacer{flex:1}.plenio-overlay .body{overflow:auto;padding:8px 16px;flex:1;min-height:0}.plenio-overlay .hint{margin:8px 16px 0;color:var(--descrip-text, #999)}.plenio-overlay .doc{margin:10px 0 14px}.plenio-overlay .doc h3{margin:0;font-size:13px}.plenio-overlay .badge{font-size:11px;padding:1px 7px;border-radius:9px;background:var(--comfy-input-bg, #333);color:var(--descrip-text, #aaa)}.plenio-overlay .badge[data-state=edited],.plenio-overlay .badge[data-state="edited (merged)"]{background:#2f5f8a;color:#fff}.plenio-overlay .badge[data-state=manual]{background:#7a5a1e;color:#fff}.plenio-overlay .badge[data-state=conflict]{background:#8a2f2f;color:#fff}.plenio-overlay textarea,.plenio-overlay pre{box-sizing:border-box;width:100%;margin-top:6px;padding:8px;border-radius:6px;border:1px solid var(--border-color, #444);background:var(--comfy-input-bg, #1b1b1b);color:var(--input-text, #ddd);font:inherit;resize:vertical}.plenio-overlay pre{white-space:pre-wrap;max-height:220px;overflow:auto}.plenio-overlay .mono,.plenio-overlay pre{font-family:var(--code-font, ui-monospace, monospace);font-size:12px}.plenio-overlay .conflict{margin-top:6px;padding:8px;border-radius:6px;background:#8a2f2f40}.plenio-overlay .findings{padding:4px 16px;max-height:22vh;overflow:auto;border-top:1px solid var(--border-color, #444)}.plenio-overlay .findings ul{margin:6px 0;padding-left:18px}.plenio-overlay .arrangement{margin:6px 0}.plenio-overlay .arrangement p{margin:4px 0}.plenio-overlay .arrangement[data-status=fallback] strong{color:#d8a31a}.plenio-overlay .arrangement summary{cursor:pointer}.plenio-overlay .arrangement .experimental{display:inline-block;margin:0 4px;padding:0 6px;border:1px solid #d8a31a;border-radius:8px;color:#d8a31a;font-size:.85em;line-height:1.5}.plenio-overlay .arrangement .idea,.plenio-overlay .arrangement .kept{color:var(--descrip-text, #999)}.plenio-overlay li[data-severity=error] strong{color:#e0685e}.plenio-overlay li[data-severity=warning] strong{color:#d8a31a}.plenio-overlay li[data-severity=info],.plenio-overlay .where{color:var(--descrip-text, #999)}.plenio-overlay .arrangement .where{margin:0 6px}.plenio-overlay footer{padding:10px 16px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .facts{color:var(--descrip-text, #999)}.plenio-overlay button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);cursor:pointer}.plenio-overlay button:disabled{opacity:.45;cursor:default}.plenio-overlay button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button.icon{margin-left:auto;font-size:18px;line-height:1;padding:2px 8px}.plenio-overlay .asr{margin:4px 0;font-size:12px;color:var(--descrip-text, #aaa);display:flex;flex-wrap:wrap;gap:8px}.plenio-overlay .asr mark{background:#e6b43c4d;color:inherit;border-radius:3px;padding:0 3px;margin-right:3px}.plenio-overlay .diff{font-family:var(--plenio-mono, ui-monospace, monospace);font-size:12px;line-height:1.5;white-space:normal}.plenio-overlay .diff ins{background:#50aa5a4d;text-decoration:none}.plenio-overlay .diff del{background:#c846464d}.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .sections th,.plenio-overlay .sections td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .tabs{display:flex;gap:4px;margin-left:12px;flex:1}.plenio-overlay .tabs button{border-radius:6px 6px 0 0;border-bottom-color:transparent}.plenio-overlay .tabs button.active{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button:focus-visible,.plenio-overlay input:focus-visible,.plenio-overlay select:focus-visible,.plenio-overlay textarea:focus-visible,.plenio-overlay .notation-wrap:focus-visible{outline:2px solid #4c9aff;outline-offset:1px}.plenio-overlay .confirm{margin:8px 16px 0;padding:8px 10px;border:1px solid #c79a3a;border-radius:6px;display:flex;gap:8px;align-items:center}.plenio-overlay .link{border:none;background:none;padding:0 2px;color:#6fa8dc;text-decoration:underline;cursor:pointer}.plenio-overlay .facts.ok{color:#6fbf73}.plenio-overlay .facts.bad,.plenio-overlay .bad{color:#e0685e}.plenio-overlay .score-tab{display:flex;flex-direction:column;gap:6px}.plenio-overlay .palette,.plenio-overlay .view-tools,.plenio-overlay .transport{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.plenio-overlay .score-tab>.transport{padding:4px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #2a2a2a)}.plenio-overlay .score-tab>.transport>button:first-child{min-width:78px;font-weight:600}.plenio-overlay .palette .group{display:flex;align-items:center;gap:3px;padding-right:10px;border-right:1px solid var(--border-color, #444)}.plenio-overlay .palette .group:last-child{border-right:none}.plenio-overlay .palette .whole summary{cursor:pointer}.plenio-overlay .whole-tools{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.plenio-overlay input.chord{width:110px}.plenio-overlay input.tempo{width:60px}.plenio-overlay input,.plenio-overlay select{background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);border:1px solid var(--border-color, #555);border-radius:5px;padding:2px 5px}.plenio-overlay input[type=checkbox],.plenio-overlay input[type=range]{padding:0}.plenio-overlay .score-main{display:grid;grid-template-columns:var(--plenio-side-w, 230px) minmax(0,1fr);gap:10px;height:max(380px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 330px))}.plenio-overlay .score-main>.side{grid-area:1 / 1}.plenio-overlay .score-main>.splitter.vertical{grid-area:1 / 1;justify-self:end}.plenio-overlay .score-main>.score-views{grid-area:1 / 2}.plenio-overlay .score-main>.inspector{grid-area:1 / 3}.plenio-overlay .score-main.with-roll{height:max(260px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 620px))}.plenio-overlay .score-views{display:grid;grid-template-rows:minmax(0,3fr) minmax(0,2fr);gap:8px;min-width:0;min-height:0}.plenio-overlay .score-views.split{grid-template-rows:minmax(0,var(--plenio-notation-fr, 3fr)) minmax(0,var(--plenio-text-fr, 2fr))}.plenio-overlay .score-main[data-text=hidden] .score-views{grid-template-rows:minmax(0,1fr)}.plenio-overlay .score-main.with-inspector{grid-template-columns:var(--plenio-side-w, 210px) minmax(0,1fr) 250px}.plenio-overlay .score-main .side{display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}.plenio-overlay .fit-panel summary{cursor:pointer;color:var(--descrip-text, #aaa)}.plenio-overlay .lyrics-follow{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;font-size:12px}.plenio-overlay .lyrics-follow label{display:flex;gap:6px;align-items:center}.plenio-overlay .lyrics-follow .hint{margin:4px 0 0;color:var(--descrip-text, #999)}.plenio-overlay .lyrics-follow .hint.changed{color:#e8c46a}.plenio-overlay .view-tools .layouts{display:inline-flex;gap:2px}.plenio-overlay .view-tools .layouts button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector{overflow:auto;min-height:0;padding:6px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);display:flex;flex-direction:column;gap:10px}.plenio-overlay .inspector .panel{display:flex;flex-direction:column;gap:5px}.plenio-overlay .inspector .panel+.panel{border-top:1px solid var(--border-color, #444);padding-top:8px}.plenio-overlay .inspector h4{margin:0;font-size:13px}.plenio-overlay .inspector h4 .facts{font-weight:400;margin-left:4px}.plenio-overlay .inspector .field{display:flex;flex-wrap:wrap;align-items:center;gap:3px 5px}.plenio-overlay .inspector .field .name{width:44px;color:var(--descrip-text, #aaa)}.plenio-overlay .inspector button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector input.number{width:56px}.plenio-overlay .inspector input.pitch,.plenio-overlay .inspector input.meter{width:58px}.plenio-overlay .inspector input.chord{width:110px}.plenio-overlay .notation-wrap{position:relative;overflow:auto;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);color:var(--input-text, #e6e6e6);min-height:0}.plenio-overlay .notation-wrap.stale .notation{opacity:.45}.plenio-overlay .stale-note{position:sticky;top:0;margin:0;padding:4px 8px;background:#5a2626;color:#fff;z-index:1}.plenio-overlay .roll{display:flex;flex-direction:column;gap:4px;outline:none}.plenio-overlay .roll:focus-visible .roll-scroll{border-color:#4c9aff}.plenio-overlay .roll-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px}.plenio-overlay .roll-tools .group{display:flex;align-items:center;gap:3px}.plenio-overlay .roll-tools button.active.vocal{background:#2d5d9f;color:#fff}.plenio-overlay .roll-tools button.active.ins{background:#a0612a;color:#fff}.plenio-overlay .roll-tools button.mode{display:inline-flex;align-items:center;gap:4px}.plenio-overlay .roll-tools button.mode .icon{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}.plenio-overlay .roll-tools button.mode.active{background:#4a4f58;color:#fff;box-shadow:inset 0 0 0 1px #9ecbff}.plenio-overlay .roll-tools .hint{color:var(--descrip-text, #999);font-size:11px}.plenio-overlay .roll-scroll{position:relative;overflow:auto;overscroll-behavior:contain;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);user-select:none}.plenio-overlay .roll.stale .roll-svg{opacity:.45}.plenio-overlay .roll-svg{display:block;touch-action:none}.plenio-overlay .roll.mode-draw:not(.readonly,.stale) .roll-svg{cursor:crosshair}.plenio-overlay .roll-svg .roll-top,.plenio-overlay .roll-svg .keys{cursor:default}.plenio-overlay .roll-svg .band{fill:#9ecbff1f;stroke:#9ecbff;stroke-dasharray:4 3;pointer-events:none}.plenio-overlay .roll-svg .ruler{fill:transparent;cursor:pointer}.plenio-overlay .roll-svg .ruler:hover{fill:#ffffff0d}.plenio-overlay .roll-svg line.locator,.plenio-overlay .roll-svg .locator-mark line{stroke:#f4f6fa;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .locator-mark path{fill:#f4f6fa}.plenio-overlay .roll-svg line.playhead{stroke:#57d68d;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .row{fill:#ffffff06}.plenio-overlay .roll-svg .row.black{fill:#00000038}.plenio-overlay .roll-svg .row.c{fill:#ffffff0f}.plenio-overlay .roll-svg .lane{fill:#ffffff0a}.plenio-overlay .roll-svg line.bar{stroke:#ffffff59}.plenio-overlay .roll-svg line.beat{stroke:#ffffff1a}.plenio-overlay .roll-svg text{font-size:10px;fill:var(--descrip-text, #aaa);pointer-events:none}.plenio-overlay .roll-svg .section-label{fill:#9ecbff;font-style:italic}.plenio-overlay .roll-svg .note{cursor:grab;stroke:#00000080}.plenio-overlay .roll-svg .note.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .note.ins{fill:#f0a35e}.plenio-overlay .roll-svg .note.selected{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .note.playing{fill:#ffd84c}.plenio-overlay .roll-svg .note.dragged,.plenio-overlay .roll-svg .chord.dragged{opacity:.3}.plenio-overlay .roll-svg .ghost{fill-opacity:.55;stroke:#fff;stroke-dasharray:3 2;pointer-events:none}.plenio-overlay .roll-svg .ghost.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .ghost.ins{fill:#f0a35e}.plenio-overlay .roll-svg .chord rect{fill:#9ecbff2e;stroke:#9ecbff80;cursor:grab}.plenio-overlay .roll-svg .chord text{fill:var(--input-text, #e6e6e6);font-size:11px}.plenio-overlay .roll-svg .chord.selected rect{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .chord.ghost rect{stroke-dasharray:3 2}.plenio-overlay .roll-svg .keys-bg{fill:var(--comfy-menu-bg, #252525)}.plenio-overlay .roll-svg .top-bg{fill:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .roll.readonly .roll-svg .note,.plenio-overlay .roll.stale .roll-svg .note{cursor:default}.plenio-overlay .roll-scroll .chord-edit{position:absolute;width:80px;height:20px;font-size:11px}.plenio-overlay .roll-svg .lyrics-lane{fill:#4c9aff0f}.plenio-overlay .roll-svg .lyric-line rect{fill:#4c9aff29;stroke:#4c9aff73}.plenio-overlay .roll-svg .lyric-line.unsung rect{fill:transparent;stroke-dasharray:3 2}.plenio-overlay .roll-svg .lyric-line text{fill:var(--input-text, #e6e6e6);font-size:11px;font-style:italic}.plenio-overlay .roll-svg .lyric-line{cursor:grab}.plenio-overlay .roll-svg .lyric-line.selected rect{fill:#4c9aff6b;stroke:#4c9aff;stroke-width:1.5}.plenio-overlay .roll-svg .lyric-line.dragged rect{stroke-dasharray:4 2}.plenio-overlay .roll-svg .lyric-line rect.edge{fill:#4c9aff8c;stroke:none;cursor:ew-resize}.plenio-overlay .roll-svg .source-lane{fill:#96be9612;cursor:pointer}.plenio-overlay .roll-svg .source-wave{stroke:#8cc88cbf;stroke-width:1.2;fill:none;pointer-events:none}.plenio-overlay .roll-svg .source-missing{fill:#e0685e14;stroke:#e0685e59;stroke-dasharray:3 3}.plenio-overlay .roll-svg .source-label{fill:#a0d2a0e6;font-size:9px;pointer-events:none}.plenio-overlay .transport .hear{display:inline-flex;align-items:center;gap:2px}.plenio-overlay .transport .hear button.active{background:#2f6fd0;color:#fff}.plenio-overlay .transport .hear .level input{width:70px;vertical-align:middle}.plenio-overlay .roll-svg text.note-name{fill:#0a121ed9;font-size:8px;font-weight:600;pointer-events:none}.plenio-overlay .roll-svg text.syllable{fill:#9ecbff;font-size:9px;pointer-events:none}.plenio-overlay .roll-scroll .lyric-edit{position:absolute;width:280px;height:20px;font-size:11px}.plenio-overlay .roll-note{margin:0;color:var(--descrip-text, #999)}.plenio-overlay .gate{margin:4px 0;padding:4px 8px;border-left:3px solid #e0685e;background:#e0685e1f}.plenio-overlay .gate button{margin-left:8px}.plenio-overlay .notation svg .plenio-selected,.plenio-overlay .notation svg .plenio-selected path{fill:#4c9aff!important}.plenio-overlay .notation svg .plenio-playing,.plenio-overlay .notation svg .plenio-playing path{fill:#6fbf73!important}.plenio-overlay .notation svg .abcjs-note,.plenio-overlay .notation svg .abcjs-rest{cursor:pointer}.plenio-overlay .notation svg .abcjs-lyric{fill:#9ecbff}.plenio-overlay .abc-editor{min-height:0;overflow:hidden}.plenio-overlay .abc-editor .cm-editor{height:100%}.plenio-overlay .navigator{display:flex;flex-direction:column;gap:8px;flex:none}.plenio-overlay .navigator ol.sections{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.plenio-overlay .navigator li{padding:4px 6px;border-radius:6px;border:1px solid var(--border-color, #444)}.plenio-overlay .navigator li.current{border-color:#2f6fb0}.plenio-overlay .navigator:focus-visible{outline:1px solid #4c9aff}.plenio-overlay .navigator li.picked{background:#4c9aff2e;border-color:#4c9aff}.plenio-overlay .navigator li[draggable=true]{cursor:grab}.plenio-overlay .navigator li.drop-before{box-shadow:0 -3px #ffc440}.plenio-overlay .navigator li.drop-after{box-shadow:0 3px #ffc440}.plenio-overlay .navigator .section-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding:2px 0 4px}.plenio-overlay .navigator .section-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .section-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .section-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .navigator .section-head{display:flex;flex-direction:column;cursor:pointer}.plenio-overlay .navigator .section-tools{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.plenio-overlay .navigator .section-tools button,.plenio-overlay .navigator .split button{font-size:11px;padding:1px 6px}.plenio-overlay .navigator input.rename{width:100%}.plenio-overlay .navigator .split input{width:90px}.plenio-overlay .bar-strip{display:flex;flex-wrap:wrap;gap:2px}.plenio-overlay .bar-strip .bar{min-width:26px;font-size:10px;padding:1px 2px;border-radius:3px}.plenio-overlay .bar-strip .bar.alt{background:#2c3440}.plenio-overlay .bar-strip .bar.selected{background:#2f6fb0;color:#fff}.plenio-overlay .bar-strip .bar.picked{background:#4c9aff59;outline:1px solid #4c9aff}.plenio-overlay .bar-strip .bar[draggable=true]{cursor:grab}.plenio-overlay .bar-strip .bar.drop-before{box-shadow:-3px 0 #ffc440}.plenio-overlay .bar-strip .bar.drop-after{box-shadow:3px 0 #ffc440}.plenio-overlay .navigator .bar-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding-top:6px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .navigator .bar-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .bar-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .bar-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .bar-strip .bar.error{border-color:#e0685e;color:#e0685e}.plenio-overlay .status{display:flex;flex-wrap:wrap;gap:10px;margin:0}.plenio-overlay .status .change{color:#6fbf73}.plenio-overlay .diagnostics{margin:0;padding-left:18px}.plenio-overlay .lyrics-fit table,.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .lyrics-fit th,.plenio-overlay .lyrics-fit td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .lyrics-fit tr.mismatch td{color:#e0685e}.plenio-overlay .lyrics-fit h4{margin:8px 0 4px;font-size:12px}.plenio-overlay .midi-dialog{width:min(720px,92vw);height:auto;max-height:min(700px,92vh)}.plenio-overlay .midi-dialog .body h3{margin:14px 0 4px;font-size:13px}.plenio-overlay .midi-dialog .tracks{border-collapse:collapse;width:100%}.plenio-overlay .midi-dialog .tracks th,.plenio-overlay .midi-dialog .tracks td{text-align:left;padding:3px 12px 3px 0;border-bottom:1px solid var(--border-color, #3a3a3a)}.plenio-overlay .midi-dialog .tracks .number{display:inline-block;min-width:18px;color:var(--descrip-text, #999)}.plenio-overlay .midi-dialog .controls{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;margin:10px 0 0}.plenio-overlay .midi-dialog .report{margin:4px 0;padding-left:18px;color:var(--descrip-text, #bbb)}.plenio-overlay .midi-tools{display:inline-flex;gap:4px}.plenio-overlay .hidden-file{display:none}.plenio-overlay .track-panel{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;background:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .track-panel h4{margin:0 0 4px;font-size:13px}.plenio-overlay .track-panel ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}.plenio-overlay .track-panel li{display:grid;grid-template-columns:8px minmax(0,1fr) auto auto;grid-template-areas:"dot name count play" "dot destination destination clear" "dot sound sound sound";align-items:center;column-gap:6px;row-gap:1px;font-size:12px}.plenio-overlay .track-panel .dot{grid-area:dot;width:8px;height:8px;border-radius:50%}.plenio-overlay .track-panel .track-name{grid-area:name;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-overlay .track-panel .count{grid-area:count}.plenio-overlay .track-panel .play{grid-area:play;display:flex;align-items:center}.plenio-overlay .track-panel .play input{margin:0}.plenio-overlay .track-panel button.link{grid-area:clear}.plenio-overlay .track-panel .destination{grid-area:destination}.plenio-overlay .track-panel .destination,.plenio-overlay .track-panel .count{color:var(--descrip-text, #999);font-size:11px;white-space:nowrap}.plenio-overlay .track-panel select.sound{grid-area:sound;min-width:0;font-size:11px;padding:1px 2px}.plenio-overlay .track-panel .destination.unsent{color:#d8a31a}.plenio-overlay .track-panel li.guide{border-top:1px dashed var(--border-color, #444);padding-top:3px}.plenio-overlay .track-panel .hint{margin:6px 0 0;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .keys-help{position:relative}.plenio-overlay .keys-panel{position:absolute;z-index:30;top:26px;left:0;width:560px;max-height:60vh;overflow:auto;padding:8px 12px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .keys-panel .close{float:right}.plenio-overlay .keys-panel h5{margin:6px 0 2px}.plenio-overlay .keys-panel table{border-collapse:collapse;width:100%;font-size:12px}.plenio-overlay .keys-panel th{width:210px;text-align:left;white-space:nowrap;padding:1px 10px 1px 0;color:var(--input-text, #ddd);font-weight:600}.plenio-overlay .keys-panel td{color:var(--descrip-text, #aaa)}.plenio-overlay .transport .align{position:relative}.plenio-overlay .transport .align>button.active{border-color:#d6a14a;color:#f0c27a}.plenio-overlay .transport .align-panel{position:absolute;z-index:30;bottom:30px;left:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;width:460px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .align-panel .facts{flex-basis:100%;margin-bottom:4px}.plenio-overlay .roll-svg .sung-pitch{fill:none;stroke:#ff5fa2;stroke-width:1.6;stroke-linejoin:round;opacity:.85;pointer-events:none}.plenio-overlay .roll-tools label.unavailable{opacity:.55}.plenio-overlay .transport .record{display:inline-flex;align-items:center;gap:3px;position:relative}.plenio-overlay .transport .record .rec{color:#ff6b6b;font-weight:600}.plenio-overlay .transport .record .rec.on{background:#c62828;color:#fff;border-color:#ff6b6b}.plenio-overlay .transport .record .rec.counting{animation:plenio-blink .5s steps(2,start) infinite}@keyframes plenio-blink{to{opacity:.35}}.plenio-overlay .transport .record .step.on{background:#6a4fb3;color:#fff}.plenio-overlay .transport .midi-light{display:inline-block;width:8px;height:8px;border-radius:50%;background:#555}.plenio-overlay .transport .midi-light.ready{background:#2e7d32}.plenio-overlay .transport .midi-light.active{background:#7cfc00;box-shadow:0 0 6px #7cfc00}.plenio-overlay .transport .midi-settings{position:relative}.plenio-overlay .transport .midi-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:320px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .midi-panel .close{justify-self:end}.plenio-overlay .transport .midi-panel strong{margin-top:4px}.plenio-overlay .notation-export{position:relative;display:inline-flex}.plenio-overlay .notation-export .export-panel{position:absolute;z-index:30;top:calc(100% + 4px);left:0;display:grid;gap:6px;width:260px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .notation-export .export-panel .close{justify-self:end}.plenio-overlay .notation-export .formats{display:flex;gap:6px;flex-wrap:wrap}.plenio-overlay .transport .sounds-settings{position:relative}.plenio-overlay .transport .sounds-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:340px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .transport .sounds-panel .close{justify-self:end}.plenio-overlay .transport .sounds-panel strong{margin-top:4px}.plenio-overlay .transport .sounds-panel .row{display:flex;align-items:center;gap:6px}.plenio-overlay .transport .sounds-panel .row select,.plenio-overlay .transport .sounds-panel .row input{flex:1;min-width:0}.plenio-overlay .transport .sounds-panel .track{width:74px;flex:none}.plenio-overlay .roll-svg .rec-note{fill:#e53935d9;stroke:#ffcdd2;stroke-width:1;pointer-events:none}', m1 = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro"];
function v1(n, e) {
  const t = `[${e}]`, i = n.replace(/\s+$/, "");
  return i ? i.split(`
`).some((s) => s.trim() === t) ? n : `${i}

${t}
` : `${t}
`;
}
const rr = `
`;
function bf(n) {
  const e = [];
  return n.replace(/\r\n?/g, `
`).split(`
`).forEach((t, i) => {
    i > 0 && e.push(rr), e.push(...t.split(/\s+/).filter(Boolean));
  }), e;
}
function y1(n, e) {
  const t = bf(n), i = bf(e), s = t.length + 1, o = i.length + 1, r = new Array(s * o).fill(0);
  for (let h = t.length - 1; h >= 0; h--)
    for (let f = i.length - 1; f >= 0; f--)
      r[h * o + f] = t[h] === i[f] ? r[(h + 1) * o + f + 1] + 1 : Math.max(r[(h + 1) * o + f], r[h * o + f + 1]);
  const l = [], a = (h, f) => {
    const d = l[l.length - 1];
    d && d.op === h && f !== rr && !d.text.endsWith(rr) ? d.text += ` ${f}` : l.push({ op: h, text: f });
  };
  let u = 0, c = 0;
  for (; u < t.length || c < i.length; )
    u < t.length && c < i.length && t[u] === i[c] ? (a("same", t[u]), u++, c++) : c < i.length && (u >= t.length || r[u * o + c + 1] >= r[(u + 1) * o + c]) ? a("added", i[c++]) : a("removed", t[u++]);
  return l;
}
function b1(n) {
  return n.filter((e) => e.op !== "same" && e.text !== rr).reduce((e, t) => e + t.text.split(" ").filter(Boolean).length, 0);
}
const wf = 12, Vr = { width: 640, height: 420 }, w1 = { width: 1280, height: 900 }, Wc = 120, Kc = 720, Uc = 0.25, jc = 0.85, Gc = 160, qc = 460, Ag = "plenio.sheet.dialog";
function lr(n, e, t) {
  return Number.isFinite(n) ? Math.min(Math.max(n, e), Math.max(e, t)) : e;
}
function Lu(n, e) {
  const t = lr(n.width, Vr.width, Math.max(Vr.width, e.width - 16)), i = lr(n.height, Vr.height, Math.max(Vr.height, e.height - 16));
  return { width: Math.round(t), height: Math.round(i) };
}
function xf(n, e) {
  return Math.round(lr(n + e, Wc, Kc));
}
function x1(n, e, t) {
  return !Number.isFinite(t) || t <= 0 ? Eu(n) : Eu(n + e / t);
}
function Eu(n) {
  return Math.round(lr(n, Uc, jc) * 1e3) / 1e3;
}
function kf(n, e) {
  return Math.round(lr(n + e, Gc, qc));
}
function dl(n, e, t) {
  const i = n.clientX, s = n.clientY, o = n.currentTarget;
  let r = !1;
  try {
    o?.setPointerCapture?.(n.pointerId);
  } catch {
  }
  const l = () => {
    if (!r) {
      r = !0;
      try {
        o?.releasePointerCapture?.(n.pointerId);
      } catch {
      }
      window.removeEventListener("pointermove", a), window.removeEventListener("pointerup", l), window.removeEventListener("pointercancel", l), window.removeEventListener("blur", l), t?.();
    }
  }, a = (u) => {
    if (u.buttons === 0) {
      l();
      return;
    }
    e({ dx: u.clientX - i, dy: u.clientY - s });
  };
  window.addEventListener("pointermove", a), window.addEventListener("pointerup", l), window.addEventListener("pointercancel", l), window.addEventListener("blur", l);
}
function k1() {
  return { ...w1, maximized: !1 };
}
function S1(n = Tg()) {
  const e = k1();
  try {
    const t = n?.getItem(Ag);
    if (!t) return e;
    const i = JSON.parse(t);
    return { ...Lu(
      {
        width: typeof i.width == "number" ? i.width : e.width,
        height: typeof i.height == "number" ? i.height : e.height
      },
      { width: window.innerWidth, height: window.innerHeight }
    ), maximized: i.maximized === !0 };
  } catch {
    return e;
  }
}
function Ya(n, e = Tg()) {
  try {
    e?.setItem(Ag, JSON.stringify(n));
  } catch {
  }
}
function Tg() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const C1 = {
  key: 0,
  class: "lyrics-fit",
  "aria-label": "Lyrics against the score"
}, M1 = {
  key: 0,
  class: "error"
}, A1 = { key: 1 }, T1 = {
  key: 0,
  class: "bad"
}, $g = /* @__PURE__ */ tn({
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
        const u = await Ly(e.fetcher, {
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
    ), Li(() => clearTimeout(s));
    const l = N(
      () => (t.value?.sections ?? []).map((a) => {
        const u = a.vocal_notes ? a.syllables / a.vocal_notes : null, c = u === null ? "" : u < 0.85 ? "too few syllables" : u > 1.3 ? "too many syllables" : "fits", h = a.score_section !== void 0 && a.tag.toLowerCase() !== a.score_section.toLowerCase();
        return { ...a, ratio: u, fit: c, mismatch: h };
      })
    );
    return (a, u) => n.abc ? (k(), M("section", C1, [
      u[1] || (u[1] = g("h4", null, "Lyrics and the score's sections", -1)),
      i.value ? (k(), M("p", M1, F(i.value), 1)) : l.value.length ? (k(), M("table", A1, [
        u[0] || (u[0] = g("thead", null, [
          g("tr", null, [
            g("th", null, "Lyrics"),
            g("th", null, "Score section"),
            g("th", null, "Lines"),
            g("th", null, "Syllables"),
            g("th", null, "Vocal notes"),
            g("th", null, "Fit")
          ])
        ], -1)),
        g("tbody", null, [
          (k(!0), M(me, null, Ie(l.value, (c, h) => (k(), M("tr", {
            key: h,
            class: qe({ mismatch: c.mismatch })
          }, [
            g("td", null, "[" + F(c.tag) + "]", 1),
            g("td", null, [
              be(F(c.score_section ?? "—"), 1),
              c.mismatch ? (k(), M("span", T1, " ≠")) : ee("", !0)
            ]),
            g("td", null, F(c.lines), 1),
            g("td", null, F(c.syllables), 1),
            g("td", null, F(c.vocal_notes ?? "—"), 1),
            g("td", {
              class: qe({ bad: c.fit && c.fit !== "fits" })
            }, F(c.ratio === null ? "" : `${c.ratio.toFixed(2)} · ${c.fit}`), 3)
          ], 2))), 128))
        ])
      ])) : ee("", !0),
      u[2] || (u[2] = g("p", { class: "hint" }, "About one syllable per vocal note sings clearly; melismas (one syllable on several notes) are fine.", -1))
    ])) : ee("", !0);
  }
});
function $1(n) {
  const e = new Set((n.elements ?? []).map((i) => i.id)), t = n.model?.tracks;
  if (t) for (const i of [...t.vocal, ...t.ins, ...t.chords]) e.add(i.id);
  return e;
}
function D1(n, e) {
  const t = n?.model?.tracks, i = new Map(t ? [...t.vocal, ...t.ins].map((o) => [o.id, o]) : []), s = [];
  for (const o of e) {
    const r = i.get(o);
    for (const l of r && r.segments.length ? r.segments : [o]) s.includes(l) || s.push(l);
  }
  return s;
}
const Sf = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48];
function Iu(n, e) {
  const t = Sf.indexOf(n);
  return t < 0 ? null : Sf[t + e] ?? null;
}
function O1(n, e, t) {
  const i = n.elements ?? [], s = i.find((l) => l.display[1] === t);
  if (s) return s;
  let o = null, r = 0;
  for (const l of i) {
    const a = Math.min(t, l.display[1]) - Math.max(e, l.display[0]);
    a > r && (o = l, r = a);
  }
  return o;
}
function L1(n, e) {
  const t = n.elements ?? [];
  return t.find((i) => i.source[0] <= e && e < i.source[1]) ?? t.find((i) => i.source[1] === e) ?? null;
}
function Cs(n, e) {
  return !n || !e ? null : (n.elements ?? []).find((t) => t.id === e) ?? null;
}
function E1(n, e, t) {
  const i = Cs(n, e);
  if (!i) return null;
  const s = (n.elements ?? []).filter((r) => r.voice === i.voice), o = s.findIndex((r) => r.id === e);
  return s[o + t] ?? null;
}
function I1(n, e) {
  const t = Cs(n, e);
  if (!t) return null;
  const i = t.voice === "Vocal" ? "Ins" : "Vocal";
  return (n.elements ?? []).find(
    (s) => s.voice === i && s.onset_q <= t.onset_q && t.onset_q < s.onset_q + s.duration_q
  ) ?? null;
}
function B1(n, e, t = "Vocal") {
  return (n.elements ?? []).find((i) => i.bar === e && i.voice === t) ?? null;
}
function Bu(n, e) {
  const t = n.sections.findIndex((i) => i.start_bar <= e && e < i.start_bar + i.bars);
  return t < 0 ? 0 : t;
}
const R1 = {
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
function P1(n, e = "1/16") {
  if (!n) return "nothing selected";
  const t = 16 / Number(e.split("/")[1] ?? 16), i = R1[n.units * t] ?? `${n.units} units`, s = n.kind === "note" ? `${n.name}${n.tie_out ? " (tied)" : ""}` : "rest", o = n.chord ? `, chord ${n.chord}` : "";
  return `${n.voice} bar ${n.bar}: ${s}, ${n.kind === "bar_rest" ? "whole bar" : i}${o}`;
}
function pl(n) {
  const e = Math.max(0, n), t = Math.floor(e / 60), i = Math.floor(e - t * 60);
  return `${t}:${String(i).padStart(2, "0")}`;
}
let Ru = [], Dg = [];
(() => {
  let n = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < n.length; e++)
    (e % 2 ? Dg : Ru).push(t = t + n[e]);
})();
function _1(n) {
  if (n < 768) return !1;
  for (let e = 0, t = Ru.length; ; ) {
    let i = e + t >> 1;
    if (n < Ru[i]) t = i;
    else if (n >= Dg[i]) e = i + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function Cf(n) {
  return n >= 127462 && n <= 127487;
}
const Mf = 8205;
function N1(n, e, t = !0, i = !0) {
  return (t ? Og : V1)(n, e, i);
}
function Og(n, e, t) {
  if (e == n.length) return e;
  e && Lg(n.charCodeAt(e)) && Eg(n.charCodeAt(e - 1)) && e--;
  let i = Xa(n, e);
  for (e += Af(i); e < n.length; ) {
    let s = Xa(n, e);
    if (i == Mf || s == Mf || t && _1(s))
      e += Af(s), i = s;
    else if (Cf(s)) {
      let o = 0, r = e - 2;
      for (; r >= 0 && Cf(Xa(n, r)); )
        o++, r -= 2;
      if (o % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function V1(n, e, t) {
  for (; e > 1; ) {
    let i = Og(n, e - 2, t);
    if (i < e) return i;
    e--;
  }
  return 0;
}
function Xa(n, e) {
  let t = n.charCodeAt(e);
  if (!Eg(t) || e + 1 == n.length) return t;
  let i = n.charCodeAt(e + 1);
  return Lg(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function Lg(n) {
  return n >= 56320 && n < 57344;
}
function Eg(n) {
  return n >= 55296 && n < 56320;
}
function Af(n) {
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
    [e, t] = so(this, e, t);
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
    ), li.from(s, this.length - (t - e) + i.length);
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
    [e, t] = so(this, e, t);
    let i = [];
    return this.decompose(e, t, i, 0), li.from(i, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), s = new Uo(this), o = new Uo(e);
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
    return new Uo(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new Ig(this, e, t);
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
    return new Bg(i);
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
    return e.length == 1 && !e[0] ? nt.empty : e.length <= 32 ? new It(e) : li.from(It.split(e, []));
  }
}
class It extends nt {
  constructor(e, t = H1(e)) {
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
        return new F1(s, l, i, r);
      s = l + 1, i++;
    }
  }
  decompose(e, t, i, s) {
    let o = e <= 0 && t >= this.length ? this : new It(Tf(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let r = i.pop(), l = gl(o.text, r.text.slice(), 0, o.length);
      if (l.length <= 32)
        i.push(new It(l, r.length + o.length));
      else {
        let a = l.length >> 1;
        i.push(new It(l.slice(0, a)), new It(l.slice(a)));
      }
    } else
      i.push(o);
  }
  replace(e, t, i) {
    if (!(i instanceof It))
      return super.replace(e, t, i);
    [e, t] = so(this, e, t);
    let s = gl(this.text, gl(i.text, Tf(this.text, 0, e)), t), o = this.length + i.length - (t - e);
    return s.length <= 32 ? new It(s, o) : li.from(It.split(s, []), o);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = so(this, e, t);
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
      i.push(o), s += o.length + 1, i.length == 32 && (t.push(new It(i, s)), i = [], s = -1);
    return s > -1 && t.push(new It(i, s)), t;
  }
}
class li extends nt {
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
    if ([e, t] = so(this, e, t), i.lines < this.lines)
      for (let s = 0, o = 0; s < this.children.length; s++) {
        let r = this.children[s], l = o + r.length;
        if (e >= o && t <= l) {
          let a = r.replace(e - o, t - o, i), u = this.lines - r.lines + a.lines;
          if (a.lines < u >> 4 && a.lines > u >> 6) {
            let c = this.children.slice();
            return c[s] = a, new li(c, this.length - (t - e) + i.length);
          }
          return super.replace(o, l, a);
        }
        o = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = so(this, e, t);
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
    if (!(e instanceof li))
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
      for (let p of e)
        p.flatten(d);
      return new It(d, t);
    }
    let s = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), o = s << 1, r = s >> 1, l = [], a = 0, u = -1, c = [];
    function h(d) {
      let p;
      if (d.lines > o && d instanceof li)
        for (let v of d.children)
          h(v);
      else d.lines > r && (a > r || !a) ? (f(), l.push(d)) : d instanceof It && a && (p = c[c.length - 1]) instanceof It && d.lines + p.lines <= 32 ? (a += d.lines, u += d.length + 1, c[c.length - 1] = new It(p.text.concat(d.text), p.length + 1 + d.length)) : (a + d.lines > s && f(), a += d.lines, u += d.length + 1, c.push(d));
    }
    function f() {
      a != 0 && (l.push(c.length == 1 ? c[0] : li.from(c, u)), u = -1, a = c.length = 0);
    }
    for (let d of e)
      h(d);
    return f(), l.length == 1 ? l[0] : new li(l, t);
  }
}
nt.empty = /* @__PURE__ */ new It([""], 0);
function H1(n) {
  let e = -1;
  for (let t of n)
    e += t.length + 1;
  return e;
}
function gl(n, e, t = 0, i = 1e9) {
  for (let s = 0, o = 0, r = !0; o < n.length && s <= i; o++) {
    let l = n[o], a = s + l.length;
    a >= t && (a > i && (l = l.slice(0, i - s)), s < t && (l = l.slice(t - s)), r ? (e[e.length - 1] += l, r = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function Tf(n, e, t) {
  return gl(n, [""], e, t);
}
class Uo {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof It ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, s = this.nodes[i], o = this.offsets[i], r = o >> 1, l = s instanceof It ? s.text.length : s.children.length;
      if (r == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((o & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof It) {
        let a = s.text[r + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[r + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof It ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class Ig {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new Uo(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
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
class Bg {
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
}, Uo.prototype[Symbol.iterator] = Ig.prototype[Symbol.iterator] = Bg.prototype[Symbol.iterator] = function() {
  return this;
});
class F1 {
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
function so(n, e, t) {
  return e = Math.max(0, Math.min(n.length, e)), [e, Math.max(e, Math.min(n.length, t))];
}
function Qt(n, e, t = !0, i = !0) {
  return N1(n, e, t, i);
}
function z1(n) {
  return n >= 56320 && n < 57344;
}
function W1(n) {
  return n >= 55296 && n < 56320;
}
function K1(n, e) {
  let t = n.charCodeAt(e);
  if (!W1(t) || e + 1 == n.length)
    return t;
  let i = n.charCodeAt(e + 1);
  return z1(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function U1(n) {
  return n < 65536 ? 1 : 2;
}
const Pu = /\r\n?|\n/;
var fn = /* @__PURE__ */ (function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
})(fn || (fn = {}));
class Ti {
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
    _u(this, e, t);
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
    return new Ti(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : Rg(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Nu(this, e, t);
  }
  mapPos(e, t = -1, i = fn.Simple) {
    let s = 0, o = 0;
    for (let r = 0; r < this.sections.length; ) {
      let l = this.sections[r++], a = this.sections[r++], u = s + l;
      if (a < 0) {
        if (u > e)
          return o + (e - s);
        o += l;
      } else {
        if (i != fn.Simple && u >= e && (i == fn.TrackDel && s < e && u > e || i == fn.TrackBefore && s < e || i == fn.TrackAfter && u > e))
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
    return new Ti(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Ti(e);
  }
}
class Ft extends Ti {
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
    return _u(this, (t, i, s, o, r) => e = e.replace(s, s + (i - t), r), !1), e;
  }
  mapDesc(e, t = !1) {
    return Nu(this, e, t, !0);
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
    return this.empty ? e : e.empty ? this : Rg(this, e, !0);
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
    return e.empty ? this : Nu(this, e, t, !0);
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
    _u(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Ti.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], i = [], s = [], o = new ar(this);
    e: for (let r = 0, l = 0; ; ) {
      let a = r == e.length ? 1e9 : e[r++];
      for (; l < a || l == a && o.len == 0; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, a - l);
        Xt(s, c, -1);
        let h = o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0;
        Xt(t, c, h), h > 0 && ji(i, t, o.text), o.forward(c), l += c;
      }
      let u = e[r++];
      for (; l < u; ) {
        if (o.done)
          break e;
        let c = Math.min(o.len, u - l);
        Xt(t, c, -1), Xt(s, c, o.ins == -1 ? -1 : o.off == 0 ? o.ins : 0), o.forward(c), l += c;
      }
    }
    return {
      changes: new Ft(t, i),
      filtered: Ti.create(s)
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
      r < t && Xt(s, t - r, -1);
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
        let p = d ? typeof d == "string" ? nt.of(d.split(i || Pu)) : d : nt.empty, v = p.length;
        if (h == f && v == 0)
          return;
        h < r && a(), h > r && Xt(s, h - r, -1), Xt(s, f - h, v), ji(o, s, p), r = f;
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
function Xt(n, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = n.length - 2;
  s >= 0 && t <= 0 && t == n[s + 1] ? n[s] += e : s >= 0 && e == 0 && n[s] == 0 ? n[s + 1] += t : i ? (n[s] += e, n[s + 1] += t) : n.push(e, t);
}
function ji(n, e, t) {
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
function _u(n, e, t) {
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
function Nu(n, e, t, i = !1) {
  let s = [], o = i ? [] : null, r = new ar(n), l = new ar(e);
  for (let a = -1; ; ) {
    if (r.done && l.len || l.done && r.len)
      throw new Error("Mismatched change set lengths");
    if (r.ins == -1 && l.ins == -1) {
      let u = Math.min(r.len, l.len);
      Xt(s, u, -1), r.forward(u), l.forward(u);
    } else if (l.ins >= 0 && (r.ins < 0 || a == r.i || r.off == 0 && (l.len < r.len || l.len == r.len && !t))) {
      let u = l.len;
      for (Xt(s, l.ins, -1); u; ) {
        let c = Math.min(r.len, u);
        r.ins >= 0 && a < r.i && r.len <= c && (Xt(s, 0, r.ins), o && ji(o, s, r.text), a = r.i), r.forward(c), u -= c;
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
      Xt(s, u, a < r.i ? r.ins : 0), o && a < r.i && ji(o, s, r.text), a = r.i, r.forward(r.len - c);
    } else {
      if (r.done && l.done)
        return o ? Ft.createSet(s, o) : Ti.create(s);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function Rg(n, e, t = !1) {
  let i = [], s = t ? [] : null, o = new ar(n), r = new ar(e);
  for (let l = !1; ; ) {
    if (o.done && r.done)
      return s ? Ft.createSet(i, s) : Ti.create(i);
    if (o.ins == 0)
      Xt(i, o.len, 0, l), o.next();
    else if (r.len == 0 && !r.done)
      Xt(i, 0, r.ins, l), s && ji(s, i, r.text), r.next();
    else {
      if (o.done || r.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(o.len2, r.len), u = i.length;
        if (o.ins == -1) {
          let c = r.ins == -1 ? -1 : r.off ? 0 : r.ins;
          Xt(i, a, c, l), s && c && ji(s, i, r.text);
        } else r.ins == -1 ? (Xt(i, o.off ? 0 : o.len, a, l), s && ji(s, i, o.textBit(a))) : (Xt(i, o.off ? 0 : o.len, r.off ? 0 : r.ins, l), s && !r.off && ji(s, i, r.text));
        l = (o.ins > a || r.ins >= 0 && r.len > a) && (l || i.length > u), o.forward2(a), r.forward(a);
      }
    }
  }
}
class ar {
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
class Wi {
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
    return this.empty ? i = s = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), i == this.from && s == this.to ? this : new Wi(i, s, this.flags, this.goalColumn);
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
    return new Wi(e, t, i, s);
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
    return new te(e.ranges.map((t) => Wi.fromJSON(t)), e.main);
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
    return Wi.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)), s);
  }
  /**
  Create a selection range.
  */
  static range(e, t, i, s, o) {
    let r = s == null ? 7 : Math.min(6, s);
    return !o && e != t && (o = t < e ? 1 : -1), o && (r |= o < 0 ? 8 : 16), t < e ? Wi.create(t, e, r | 32, i) : Wi.create(e, t, r, i);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return Wi.create(e, t, 64, void 0);
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
function Pg(n, e) {
  for (let t of n.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let Yc = 0;
class xe {
  constructor(e, t, i, s, o) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = s, this.id = Yc++, this.default = e([]), this.extensions = typeof o == "function" ? o(this) : o;
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
    return new xe(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : Xc), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new ml([], this, 0, e);
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
    return new ml(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new ml(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function Xc(n, e) {
  return n == e || n.length == e.length && n.every((t, i) => t === e[i]);
}
class ml {
  constructor(e, t, i, s) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = s, this.id = Yc++;
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
        if (a && f.docChanged || u && (f.docChanged || f.selection) || Vu(h, c)) {
          let d = i(h);
          if (l ? !$f(d, h.values[r], s) : !s(d, h.values[r]))
            return h.values[r] = d, 1;
        }
        return 0;
      },
      reconfigure: (h, f) => {
        let d, p = f.config.address[o];
        if (p != null) {
          let v = El(f, p);
          if (this.dependencies.every((m) => m instanceof xe ? f.facet(m) === h.facet(m) : m instanceof Un ? f.field(m, !1) == h.field(m, !1) : !0) || (l ? $f(d = i(h), v, s) : s(d = i(h), v)))
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
function $f(n, e, t) {
  if (n.length != e.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!t(n[i], e[i]))
      return !1;
  return !0;
}
function Vu(n, e) {
  let t = !1;
  for (let i of e)
    jo(n, i) & 1 && (t = !0);
  return t;
}
function j1(n, e, t) {
  let i = t.map((a) => n[a.id]), s = t.map((a) => a.type), o = i.filter((a) => !(a & 1)), r = n[e.id] >> 1;
  function l(a) {
    let u = [];
    for (let c = 0; c < i.length; c++) {
      let h = El(a, i[c]);
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
        jo(a, u);
      return a.values[r] = l(a), 1;
    },
    update(a, u) {
      if (!Vu(a, o))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[r]) ? 0 : (a.values[r] = c, 1);
    },
    reconfigure(a, u) {
      let c = Vu(a, i), h = u.config.facets[e.id], f = u.facet(e);
      if (h && !c && Xc(t, h))
        return a.values[r] = f, 0;
      let d = l(a);
      return e.compare(d, f) ? (a.values[r] = f, 0) : (a.values[r] = d, 1);
    }
  };
}
const Hr = /* @__PURE__ */ xe.define({ static: !0 });
class Un {
  constructor(e, t, i, s, o) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = s, this.spec = o, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new Un(Yc++, e.create, e.update, e.compare || ((i, s) => i === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Hr).find((i) => i.field == this);
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
        let o = i.facet(Hr), r = s.facet(Hr), l;
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
    return [this, Hr.of({ field: this, create: e })];
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
function Co(n) {
  return (e) => new _g(e, n);
}
const ha = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ Co(vs.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ Co(vs.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ Co(vs.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ Co(vs.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ Co(vs.lowest)
};
class _g {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class fa {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new Hu(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return fa.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class Hu {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class Ll {
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
    for (let f of G1(e, t, r))
      f instanceof Un ? s.push(f) : (o[f.facet.id] || (o[f.facet.id] = [])).push(f);
    let l = /* @__PURE__ */ Object.create(null), a = [], u = [];
    for (let f of s)
      l[f.id] = u.length << 1, u.push((d) => f.slot(d));
    let c = i?.config.facets;
    for (let f in o) {
      let d = o[f], p = d[0].facet, v = c && c[f] || [];
      if (d.every(
        (m) => m.type == 0
        /* Provider.Static */
      ))
        if (l[p.id] = a.length << 1 | 1, Xc(v, d))
          a.push(i.facet(p));
        else {
          let m = p.combine(d.map((b) => b.value));
          a.push(i && p.compare(m, i.facet(p)) ? i.facet(p) : m);
        }
      else {
        for (let m of d)
          m.type == 0 ? (l[m.id] = a.length << 1 | 1, a.push(m.value)) : (l[m.id] = u.length << 1, u.push((b) => m.dynamicSlot(b)));
        l[p.id] = u.length << 1, u.push((m) => j1(m, p, d));
      }
    }
    let h = u.map((f) => f(l));
    return new Ll(e, r, h, l, a, o);
  }
}
function G1(n, e, t) {
  let i = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function o(r, l) {
    let a = s.get(r);
    if (a != null) {
      if (a <= l)
        return;
      let u = i[a].indexOf(r);
      u > -1 && i[a].splice(u, 1), r instanceof Hu && t.delete(r.compartment);
    }
    if (s.set(r, l), Array.isArray(r))
      for (let u of r)
        o(u, l);
    else if (r instanceof Hu) {
      if (t.has(r.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let u = e.get(r.compartment) || r.inner;
      t.set(r.compartment, u), o(u, l);
    } else if (r instanceof _g)
      o(r.inner, r.prec);
    else if (r instanceof Un)
      i[l].push(r), r.provides && o(r.provides, l);
    else if (r instanceof ml)
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
function jo(n, e) {
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
function El(n, e) {
  return e & 1 ? n.config.staticValues[e >> 1] : n.values[e >> 1];
}
const Ng = /* @__PURE__ */ xe.define(), Fu = /* @__PURE__ */ xe.define({
  combine: (n) => n.some((e) => e),
  static: !0
}), Vg = /* @__PURE__ */ xe.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), Hg = /* @__PURE__ */ xe.define(), Fg = /* @__PURE__ */ xe.define(), zg = /* @__PURE__ */ xe.define(), Wg = /* @__PURE__ */ xe.define({
  combine: (n) => n.length ? n[0] : !1
});
class vo {
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
    return new q1();
  }
}
class q1 {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new vo(this, e);
  }
}
class Y1 {
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
    return new St(this, e);
  }
}
class St {
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
    return t === void 0 ? void 0 : t == this.value ? this : new St(this.type, t);
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
    return new Y1(e.map || ((t) => t));
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
St.reconfigure = /* @__PURE__ */ St.define();
St.appendConfig = /* @__PURE__ */ St.define();
class en {
  constructor(e, t, i, s, o, r) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = s, this.annotations = o, this.scrollIntoView = r, this._doc = null, this._state = null, i && Pg(i, t.newLength), o.some((l) => l.type == en.time) || (this.annotations = o.concat(en.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, i, s, o, r) {
    return new en(e, t, i, s, o, r);
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
    let t = this.annotation(en.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
en.time = /* @__PURE__ */ vo.define();
en.userEvent = /* @__PURE__ */ vo.define();
en.addToHistory = /* @__PURE__ */ vo.define();
en.remote = /* @__PURE__ */ vo.define();
function X1(n, e) {
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
function Kg(n, e, t) {
  var i;
  let s, o, r;
  return t ? (s = e.changes, o = Ft.empty(e.changes.length), r = n.changes.compose(e.changes)) : (s = e.changes.map(n.changes), o = n.changes.mapDesc(e.changes, !0), r = n.changes.compose(s)), {
    changes: r,
    selection: e.selection ? e.selection.map(o) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(s),
    effects: St.mapEffects(n.effects, s).concat(St.mapEffects(e.effects, o)),
    annotations: n.annotations.length ? n.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: n.scrollIntoView || e.scrollIntoView
  };
}
function zu(n, e, t) {
  let i = e.selection, s = Xs(e.annotations);
  return e.userEvent && (s = s.concat(en.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof Ft ? e.changes : Ft.of(e.changes || [], t, n.facet(Vg)),
    selection: i && (i instanceof te ? i : te.single(i.anchor, i.head)),
    effects: Xs(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function Ug(n, e, t) {
  let i = zu(n, e.length ? e[0] : {}, n.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let o = 1; o < e.length; o++) {
    e[o].filter === !1 && (t = !1);
    let r = !!e[o].sequential;
    i = Kg(i, zu(n, e[o], r ? i.changes.newLength : n.doc.length), r);
  }
  let s = en.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return Z1(t ? J1(s) : s);
}
function J1(n) {
  let e = n.startState, t = !0;
  for (let s of e.facet(Hg)) {
    let o = s(n);
    if (o === !1) {
      t = !1;
      break;
    }
    Array.isArray(o) && (t = t === !0 ? o : X1(t, o));
  }
  if (t !== !0) {
    let s, o;
    if (t === !1)
      o = n.changes.invertedDesc, s = Ft.empty(e.doc.length);
    else {
      let r = n.changes.filter(t);
      s = r.changes, o = r.filtered.mapDesc(r.changes).invertedDesc;
    }
    n = en.create(e, s, n.selection && n.selection.map(o), St.mapEffects(n.effects, o), n.annotations, n.scrollIntoView);
  }
  let i = e.facet(Fg);
  for (let s = i.length - 1; s >= 0; s--) {
    let o = i[s](n);
    o instanceof en ? n = o : Array.isArray(o) && o.length == 1 && o[0] instanceof en ? n = o[0] : n = Ug(e, Xs(o), !1);
  }
  return n;
}
function Z1(n) {
  let e = n.startState, t = e.facet(zg), i = n;
  for (let s = t.length - 1; s >= 0; s--) {
    let o = t[s](n);
    o && Object.keys(o).length && (i = Kg(i, zu(e, o, n.changes.newLength), !0));
  }
  return i == n ? n : en.create(e, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const Q1 = [];
function Xs(n) {
  return n == null ? Q1 : Array.isArray(n) ? n : [n];
}
var Ci = /* @__PURE__ */ (function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
})(Ci || (Ci = {}));
const ew = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Wu;
try {
  Wu = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function tw(n) {
  if (Wu)
    return Wu.test(n);
  for (let e = 0; e < n.length; e++) {
    let t = n[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || ew.test(t)))
      return !0;
  }
  return !1;
}
function nw(n) {
  return (e) => {
    if (!/\S/.test(e))
      return Ci.Space;
    if (tw(e))
      return Ci.Word;
    for (let t = 0; t < n.length; t++)
      if (e.indexOf(n[t]) > -1)
        return Ci.Word;
    return Ci.Other;
  };
}
class rt {
  constructor(e, t, i, s, o, r) {
    this.config = e, this.doc = t, this.selection = i, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = o, r && (r._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      jo(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return jo(this, i), El(this, i);
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
    return Ug(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: s } = t;
    for (let l of e.effects)
      l.is(fa.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((a, u) => s.set(u, a)), t = null), s.set(l.value.compartment, l.value.extension)) : l.is(St.reconfigure) ? (t = null, i = l.value) : l.is(St.appendConfig) && (t = null, i = Xs(i).concat(l.value));
    let o;
    t ? o = e.startState.values.slice() : (t = Ll.resolve(i, s, this), o = new rt(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (a, u) => u.reconfigure(a, this), null).values);
    let r = e.startState.facet(Fu) ? e.newSelection : e.newSelection.asSingle();
    new rt(t, e.newDoc, r, o, (l, a) => a.update(l, e), e);
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
    let t = this.selection, i = e(t.ranges[0]), s = this.changes(i.changes), o = [i.range], r = Xs(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), u = this.changes(a.changes), c = u.map(s);
      for (let f = 0; f < l; f++)
        o[f] = o[f].map(c);
      let h = s.mapDesc(u, !0);
      o.push(a.range.map(h)), s = s.compose(c), r = St.mapEffects(r, c).concat(St.mapEffects(Xs(a.effects), h));
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
    return e instanceof Ft ? e : Ft.of(e, this.doc.length, this.facet(rt.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return nt.of(e.split(this.facet(rt.lineSeparator) || Pu));
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
    return t == null ? e.default : (jo(this, t), El(this, t));
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
        s instanceof Un && this.config.address[s.id] != null && (t[i] = s.spec.toJSON(this.field(e[i]), this));
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
    return rt.create({
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
    let t = Ll.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof nt ? e.doc : nt.of((e.doc || "").split(t.staticFacet(rt.lineSeparator) || Pu)), s = e.selection ? e.selection instanceof te ? e.selection : te.single(e.selection.anchor, e.selection.head) : te.single(0);
    return Pg(s, i.length), t.staticFacet(Fu) || (s = s.asSingle()), new rt(t, i, s, t.dynamicSlots.map(() => null), (o, r) => r.create(o), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(rt.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(rt.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(Wg);
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
    for (let i of this.facet(rt.phrases))
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
    for (let o of this.facet(Ng))
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
    return nw(t.length ? t[0] : "");
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
      let a = Qt(t, r, !1);
      if (o(t.slice(a, r)) != Ci.Word)
        break;
      r = a;
    }
    for (; l < s; ) {
      let a = Qt(t, l);
      if (o(t.slice(l, a)) != Ci.Word)
        break;
      l = a;
    }
    return r == l ? null : te.range(r + i, l + i);
  }
}
rt.allowMultipleSelections = Fu;
rt.tabSize = /* @__PURE__ */ xe.define({
  combine: (n) => n.length ? n[0] : 4
});
rt.lineSeparator = Vg;
rt.readOnly = Wg;
rt.phrases = /* @__PURE__ */ xe.define({
  compare(n, e) {
    let t = Object.keys(n), i = Object.keys(e);
    return t.length == i.length && t.every((s) => n[s] == e[s]);
  }
});
rt.languageData = Ng;
rt.changeFilter = Hg;
rt.transactionFilter = Fg;
rt.transactionExtender = zg;
fa.reconfigure = /* @__PURE__ */ St.define();
function da(n, e, t = {}) {
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
class Ds {
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
    return Ku.create(e, t, this);
  }
}
Ds.prototype.startSide = Ds.prototype.endSide = 0;
Ds.prototype.point = !1;
Ds.prototype.mapMode = fn.TrackDel;
function Jc(n, e) {
  return n == e || n.constructor == e.constructor && n.eq(e);
}
let Ku = class jg {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new jg(e, t, i);
  }
};
function Uu(n, e) {
  return n.from - e.from || n.value.startSide - e.value.startSide;
}
class Zc {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = s;
  }
  get length() {
    return Hs(this.to);
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
      let f = this.value[h], d = this.from[h] + e, p = this.to[h] + e, v, m;
      if (d == p) {
        let b = t.mapPos(d, f.startSide, f.mapMode);
        if (b == null || (v = m = b, f.startSide != f.endSide && (m = t.mapPos(d, f.endSide), m < v)))
          continue;
      } else if (v = t.mapPos(d, f.startSide), m = t.mapPos(p, f.endSide), v > m || v == m && f.startSide > 0 && f.endSide <= 0)
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
    return { mapped: r.length ? new Zc(l, a, r, c) : null, pos: u };
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
    if (i && (t = t.slice().sort(Uu)), this.isEmpty)
      return t.length ? Ye.of(t) : this;
    let l = new Gg(this, null, -1).goto(0), a = 0, u = [], c = new Ms();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let h = t[a++];
        c.addInner(h.from, h.to, h.value, !1) || u.push(h);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!r || s > this.chunkEnd(l.chunkIndex) || o < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!r || s > l.to || o < l.from || r(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || u.push(Ku.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !u.length ? Ye.empty : this.nextLayer.update({ add: u, filter: r, filterFrom: s, filterTo: o }));
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
        let [f, d] = t.length ? [Hs(i) + Hs(t).length, Hs(Hs(t).value).endSide] : [-1, -1], { mapped: p, pos: v } = c.map(u, e, f, d, r);
        p && (s = Math.max(s, p.maxPoint), t.push(p), i.push(v));
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
    return ur.from([this]).goto(e);
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
    return ur.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, i, s, o = -1) {
    let r = e.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= o), l = t.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= o), a = Df(r, l, i), u = new Mo(r, a, o), c = new Mo(l, a, o);
    i.iterGaps((h, f, d) => Of(u, h, c, f, d, s)), i.empty && i.length == 0 && Of(u, 0, c, 0, 0, s);
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
    let l = Df(o, r), a = new Mo(o, l, 0).goto(i), u = new Mo(r, l, 0).goto(i);
    for (; ; ) {
      if (a.to != u.to || !ju(a.active, u.active) || a.point && (!u.point || !Jc(a.point, u.point)))
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
    let r = new Mo(e, null, o).goto(t), l = t, a = r.openStart;
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
    for (let s of e instanceof Ku ? [e] : t ? iw(e) : e)
      i.add(s.from, s.to, s.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return Ye.empty;
    let t = Hs(e);
    for (let i = e.length - 2; i >= 0; i--)
      for (let s = e[i]; s != Ye.empty; s = s.nextLayer)
        t = new Ye(s.chunkPos, s.chunk, t, Math.max(s.maxPoint, t.maxPoint));
    return t;
  }
}
Ye.empty = /* @__PURE__ */ new Ye([], [], null, -1);
function Hs(n) {
  return n[n.length - 1];
}
function iw(n) {
  if (n.length > 1)
    for (let e = n[0], t = 1; t < n.length; t++) {
      let i = n[t];
      if (Uu(e, i) > 0)
        return n.slice().sort(Uu);
      e = i;
    }
  return n;
}
Ye.empty.nextLayer = Ye.empty;
class Ms {
  finishChunk(e) {
    this.chunks.push(new Zc(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
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
function Df(n, e, t) {
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
class Gg {
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
class ur {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let s = [];
    for (let o = 0; o < e.length; o++)
      for (let r = e[o]; !r.isEmpty; r = r.nextLayer)
        r.maxPoint >= i && s.push(new Gg(r, t, i, o));
    return s.length == 1 ? s[0] : new ur(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      Ja(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      Ja(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), Ja(this.heap, 0);
    }
  }
}
function Ja(n, e) {
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
class Mo {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = ur.from(e, t, i);
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
    Fr(this.active, e), Fr(this.activeTo, e), Fr(this.activeRank, e), this.minActive = Lf(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: s, rank: o } = this.cursor;
    for (; t < this.activeRank.length && (o - this.activeRank[t] || s - this.activeTo[t]) > 0; )
      t++;
    zr(this.active, t, i), zr(this.activeTo, t, s), zr(this.activeRank, t, o), e && zr(e, t, this.cursor.from), this.minActive = Lf(this.active, this.activeTo);
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
        this.removeActive(s), i && Fr(i, s);
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
function Of(n, e, t, i, s, o) {
  n.goto(e), t.goto(i);
  let r = i + s, l = i, a = i - e, u = !!o.boundChange;
  for (let c = !1; ; ) {
    let h = n.to + a - t.to, f = h || n.endSide - t.endSide, d = f < 0 ? n.to + a : t.to, p = Math.min(d, r);
    if (n.point || t.point ? (n.point && t.point && Jc(n.point, t.point) && ju(n.activeForPoint(n.to), t.activeForPoint(t.to)) || o.comparePoint(l, p, n.point, t.point), c = !1) : (c && (o.boundChange(l), c = !1), p > l && !ju(n.active, t.active) && o.compareRange(l, p, n.active, t.active), u && p < r && (h || n.openEnd(d) != t.openEnd(d)) && (c = !0)), d > r)
      break;
    l = d, f <= 0 && n.next(), f >= 0 && t.next();
  }
}
function ju(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (n[t] != e[t] && !Jc(n[t], e[t]))
      return !1;
  return !0;
}
function Fr(n, e) {
  for (let t = e, i = n.length - 1; t < i; t++)
    n[t] = n[t + 1];
  n.pop();
}
function zr(n, e, t) {
  for (let i = n.length - 1; i >= e; i--)
    n[i + 1] = n[i];
  n[e] = t;
}
function Lf(n, e) {
  let t = -1, i = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - i || n[s].endSide - n[t].endSide) < 0 && (t = s, i = e[s]);
  return t;
}
function pa(n, e, t = n.length) {
  let i = 0;
  for (let s = 0; s < t && s < n.length; )
    n.charCodeAt(s) == 9 ? (i += e - i % e, s++) : (i++, s = Qt(n, s));
  return i;
}
function sw(n, e, t, i) {
  for (let s = 0, o = 0; ; ) {
    if (o >= e)
      return s;
    if (s == n.length)
      break;
    o += n.charCodeAt(s) == 9 ? t - o % t : 1, s = Qt(n, s);
  }
  return n.length;
}
const Gu = "ͼ", Ef = typeof Symbol > "u" ? "__" + Gu : Symbol.for(Gu), qu = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), If = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class es {
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
        let p = l[d];
        if (/&/.test(d))
          o(
            d.split(/,\s*/).map((v) => r.map((m) => v.replace(/&/, m))).reduce((v, m) => v.concat(m)),
            p,
            a
          );
        else if (p && typeof p == "object") {
          if (!h) throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          o(s(d), p, c, f);
        } else p != null && c.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (v) => "-" + v.toLowerCase()) + ": " + p + ";");
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
    let e = If[Ef] || 1;
    return If[Ef] = e + 1, Gu + e.toString(36);
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
    let s = e[qu], o = i && i.nonce;
    s ? o && s.setNonce(o) : s = new ow(e, o), s.mount(Array.isArray(t) ? t : [t], e);
  }
}
let Bf = /* @__PURE__ */ new Map();
class ow {
  constructor(e, t) {
    let i = e.ownerDocument || e, s = i.defaultView;
    if (!e.head && e.adoptedStyleSheets && s.CSSStyleSheet) {
      let o = Bf.get(i);
      if (o) return e[qu] = o;
      this.sheet = new s.CSSStyleSheet(), Bf.set(i, this);
    } else
      this.styleTag = i.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[qu] = this;
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
var ts = {
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
}, cr = {
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
}, rw = typeof navigator < "u" && /Mac/.test(navigator.platform), lw = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var Gt = 0; Gt < 10; Gt++) ts[48 + Gt] = ts[96 + Gt] = String(Gt);
for (var Gt = 1; Gt <= 24; Gt++) ts[Gt + 111] = "F" + Gt;
for (var Gt = 65; Gt <= 90; Gt++)
  ts[Gt] = String.fromCharCode(Gt + 32), cr[Gt] = String.fromCharCode(Gt);
for (var Za in ts) cr.hasOwnProperty(Za) || (cr[Za] = ts[Za]);
function aw(n) {
  var e = rw && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || lw && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? cr : ts)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function ai() {
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
  for (; e < arguments.length; e++) qg(n, arguments[e]);
  return n;
}
function qg(n, e) {
  if (typeof e == "string")
    n.appendChild(document.createTextNode(e));
  else if (e != null) if (e.nodeType != null)
    n.appendChild(e);
  else if (Array.isArray(e))
    for (var t = 0; t < e.length; t++) qg(n, e[t]);
  else
    throw new RangeError("Unsupported child node: " + e);
}
let on = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Yu = typeof document < "u" ? document : { documentElement: { style: {} } };
const Xu = /* @__PURE__ */ /Edge\/(\d+)/.exec(on.userAgent), Yg = /* @__PURE__ */ /MSIE \d/.test(on.userAgent), Ju = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(on.userAgent), ga = !!(Yg || Ju || Xu), Rf = !ga && /* @__PURE__ */ /gecko\/(\d+)/i.test(on.userAgent), Qa = !ga && /* @__PURE__ */ /Chrome\/(\d+)/.exec(on.userAgent), Pf = "webkitFontSmoothing" in Yu.documentElement.style, Zu = !ga && /* @__PURE__ */ /Apple Computer/.test(on.vendor), _f = Zu && (/* @__PURE__ */ /Mobile\/\w+/.test(on.userAgent) || on.maxTouchPoints > 2);
var ge = {
  mac: _f || /* @__PURE__ */ /Mac/.test(on.platform),
  windows: /* @__PURE__ */ /Win/.test(on.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(on.platform),
  ie: ga,
  ie_version: Yg ? Yu.documentMode || 6 : Ju ? +Ju[1] : Xu ? +Xu[1] : 0,
  gecko: Rf,
  gecko_version: Rf ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(on.userAgent) || [0, 0])[1] : 0,
  chrome: !!Qa,
  chrome_version: Qa ? +Qa[1] : 0,
  ios: _f,
  android: /* @__PURE__ */ /Android\b/.test(on.userAgent),
  webkit: Pf,
  webkit_version: Pf ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(on.userAgent) || [0, 0])[1] : 0,
  safari: Zu,
  safari_version: Zu ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(on.userAgent) || [0, 0])[1] : 0,
  tabSize: Yu.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function Qc(n, e) {
  for (let t in n)
    t == "class" && e.class ? e.class += " " + n.class : t == "style" && e.style ? e.style += ";" + n.style : e[t] = n[t];
  return e;
}
const Il = /* @__PURE__ */ Object.create(null);
function eh(n, e, t) {
  if (n == e)
    return !0;
  n || (n = Il), e || (e = Il);
  let i = Object.keys(n), s = Object.keys(e);
  if (i.length - 0 != s.length - 0)
    return !1;
  for (let o of i)
    if (o != t && (s.indexOf(o) == -1 || n[o] !== e[o]))
      return !1;
  return !0;
}
function uw(n, e) {
  for (let t = n.attributes.length - 1; t >= 0; t--) {
    let i = n.attributes[t].name;
    e[i] == null && n.removeAttribute(i);
  }
  for (let t in e) {
    let i = e[t];
    t == "style" ? n.style.cssText = i : n.getAttribute(t) != i && n.setAttribute(t, i);
  }
}
function Nf(n, e, t) {
  let i = !1;
  if (e)
    for (let s in e)
      t && s in t || (i = !0, s == "style" ? n.style.cssText = "" : n.removeAttribute(s));
  if (t)
    for (let s in t)
      e && e[s] == t[s] || (i = !0, s == "style" ? n.style.cssText = t[s] : n.setAttribute(s, t[s]));
  return i;
}
function cw(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < n.attributes.length; t++) {
    let i = n.attributes[t];
    e[i.name] = i.value;
  }
  return e;
}
class Sr {
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
var qt = /* @__PURE__ */ (function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
})(qt || (qt = {}));
class Mt extends Ds {
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
    return new Cr(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), i = !!e.block;
    return t += i && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Os(e, t, t, i, e.widget || null, !1);
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
      let { start: o, end: r } = Xg(e, t);
      i = (o ? t ? -3e8 : -1 : 5e8) - 1, s = (r ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Os(e, i, s, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new Mr(e);
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
Mt.none = Ye.empty;
class Cr extends Mt {
  constructor(e) {
    let { start: t, end: i } = Xg(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? Qc(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Il;
  }
  eq(e) {
    return this == e || e instanceof Cr && this.tagName == e.tagName && eh(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Cr.prototype.point = !1;
class Mr extends Mt {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Mr && this.spec.class == e.spec.class && eh(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Mr.prototype.mapMode = fn.TrackBefore;
Mr.prototype.point = !0;
class Os extends Mt {
  constructor(e, t, i, s, o, r) {
    super(t, i, o, e), this.block = s, this.isReplace = r, this.mapMode = s ? t <= 0 ? fn.TrackBefore : fn.TrackAfter : fn.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? qt.WidgetRange : this.startSide <= 0 ? qt.WidgetBefore : qt.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Os && hw(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Os.prototype.point = !0;
function Xg(n, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = n;
  return t == null && (t = n.inclusive), i == null && (i = n.inclusive), { start: t ?? e, end: i ?? e };
}
function hw(n, e) {
  return n == e || !!(n && e && n.compare(e));
}
function Js(n, e, t, i = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + i >= n ? t[s] = Math.max(t[s], e) : t.push(n, e);
}
class hr extends Ds {
  constructor(e, t, i) {
    super(), this.tagName = e, this.attributes = t, this.rank = i;
  }
  eq(e) {
    return e == this || e instanceof hr && this.tagName == e.tagName && eh(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new hr(e.tagName, e.attributes || Il, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return Ye.of(e, t);
  }
}
hr.prototype.startSide = hr.prototype.endSide = -1;
function fr(n) {
  let e;
  return n.nodeType == 11 ? e = n.getSelection ? n : n.ownerDocument : e = n, e.getSelection();
}
function Qu(n, e) {
  return e ? n == e || n.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Go(n, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Qu(n, e.anchorNode);
  } catch {
    return !1;
  }
}
function vl(n) {
  return n.nodeType == 3 ? dr(n, 0, n.nodeValue.length).getClientRects() : n.nodeType == 1 ? n.getClientRects() : [];
}
function qo(n, e, t, i) {
  return t ? Vf(n, e, t, i, -1) || Vf(n, e, t, i, 1) : !1;
}
function ns(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}
function Bl(n) {
  return n.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
function Vf(n, e, t, i, s) {
  for (; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (s < 0 ? 0 : Ei(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let o = n.parentNode;
      if (!o || o.nodeType != 1)
        return !1;
      e = ns(n) + (s < 0 ? 0 : 1), n = o;
    } else if (n.nodeType == 1) {
      if (n = n.childNodes[e + (s < 0 ? -1 : 0)], n.nodeType == 1 && n.contentEditable == "false")
        return !1;
      e = s < 0 ? Ei(n) : 0;
    } else
      return !1;
  }
}
function Ei(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
function Rl(n, e) {
  let { left: t, right: i } = n;
  if (t == i)
    return n;
  let s = e ? t : i;
  return { left: s, right: s, top: n.top, bottom: n.bottom };
}
function fw(n) {
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
function Jg(n, e) {
  let t = e.width / n.offsetWidth, i = e.height / n.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - n.offsetWidth) < 1) && (t = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(e.height - n.offsetHeight) < 1) && (i = 1), { scaleX: t, scaleY: i };
}
function dw(n, e, t, i, s, o, r, l) {
  let a = n.ownerDocument, u = a.defaultView || window;
  for (let c = n, h = !1; c && !h; )
    if (c.nodeType == 1) {
      let f, d = c == a.body, p = 1, v = 1;
      if (d)
        f = fw(u);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(c).position) && (h = !0), c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let O = c.getBoundingClientRect();
        ({ scaleX: p, scaleY: v } = Jg(c, O)), f = {
          left: O.left,
          right: O.left + c.clientWidth * p,
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
            c.scrollLeft += m / p, O = (c.scrollLeft - E) * p;
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
function Zg(n, e = !0) {
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
class pw {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: i } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Ei(t) : 0), i, Math.min(e.focusOffset, i ? Ei(i) : 0));
  }
  set(e, t, i, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = s;
  }
}
function Qg(n) {
  let e = [];
  for (let t = n; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    t.nodeType == 1 && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function em(n, e = !0) {
  for (let { node: t, left: i, top: s } of n)
    e && t.scrollTop != s && (t.scrollTop = s), t.scrollLeft != i && (t.scrollLeft = i);
}
let gs = null;
ge.safari && ge.safari_version >= 26 && (gs = !1);
function tm(n) {
  if (n.setActive)
    return n.setActive();
  if (gs)
    return n.focus(gs);
  let e = Qg(n);
  n.focus(gs == null ? {
    get preventScroll() {
      return gs = { preventScroll: !0 }, !0;
    }
  } : void 0), gs || (gs = !1, em(e));
}
let Hf;
function dr(n, e, t = e) {
  let i = Hf || (Hf = document.createRange());
  return i.setEnd(n, t), i.setStart(n, e), i;
}
function Zs(n, e, t, i) {
  let s = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  i && ({ altKey: s.altKey, ctrlKey: s.ctrlKey, shiftKey: s.shiftKey, metaKey: s.metaKey } = i);
  let o = new KeyboardEvent("keydown", s);
  o.synthetic = !0, n.dispatchEvent(o);
  let r = new KeyboardEvent("keyup", s);
  return r.synthetic = !0, n.dispatchEvent(r), o.defaultPrevented || r.defaultPrevented;
}
function gw(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function mw(n, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (i = Math.min(i, Ei(t)); ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[i - 1];
      s.contentEditable == "false" ? i-- : (t = s, i = Ei(t));
    } else {
      if (t == n)
        return !0;
      i = ns(t), t = t.parentNode;
    }
}
function nm(n) {
  return n instanceof Window ? n.pageYOffset > Math.max(0, n.document.documentElement.scrollHeight - n.innerHeight - 4) : n.scrollTop > Math.max(1, n.scrollHeight - n.clientHeight - 4);
}
function im(n, e) {
  for (let t = n, i = e; ; ) {
    if (t.nodeType == 3 && i > 0)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i - 1], i = Ei(t);
    } else if (t.parentNode && !Bl(t))
      i = ns(t), t = t.parentNode;
    else
      return null;
  }
}
function sm(n, e) {
  for (let t = n, i = e; ; ) {
    if (t.nodeType == 3 && i < t.nodeValue.length)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i], i = 0;
    } else if (t.parentNode && !Bl(t))
      i = ns(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Nn {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new Nn(e.parentNode, ns(e), t);
  }
  static after(e, t) {
    return new Nn(e.parentNode, ns(e) + 1, t);
  }
}
var Ct = /* @__PURE__ */ (function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
})(Ct || (Ct = {}));
const Ls = Ct.LTR, th = Ct.RTL;
function om(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    e.push(1 << +n[t]);
  return e;
}
const vw = /* @__PURE__ */ om("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), yw = /* @__PURE__ */ om("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), ec = /* @__PURE__ */ Object.create(null), Jn = [];
for (let n of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ n.charCodeAt(0), t = /* @__PURE__ */ n.charCodeAt(1);
  ec[e] = t, ec[t] = -e;
}
function rm(n) {
  return n <= 247 ? vw[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? yw[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8204 ? 256 : 64336 <= n && n <= 65023 ? 4 : 1;
}
const bw = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class hi {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? th : Ls;
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
function lm(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++) {
    let i = n[t], s = e[t];
    if (i.from != s.from || i.to != s.to || i.direction != s.direction || !lm(i.inner, s.inner))
      return !1;
  }
  return !0;
}
const mt = [];
function ww(n, e, t, i, s) {
  for (let o = 0; o <= i.length; o++) {
    let r = o ? i[o - 1].to : e, l = o < i.length ? i[o].from : t, a = o ? 256 : s;
    for (let u = r, c = a, h = a; u < l; u++) {
      let f = rm(n.charCodeAt(u));
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
        let p = u && c == 8 || d < t && mt[d] == 8 ? h == 1 ? 1 : 8 : 256;
        for (let v = u; v < d; v++)
          mt[v] = p;
        u = d - 1;
      } else f == 8 && h == 1 && (mt[u] = 1);
      c = f, f & 7 && (h = f);
    }
  }
}
function xw(n, e, t, i, s) {
  let o = s == 1 ? 2 : 1;
  for (let r = 0, l = 0, a = 0; r <= i.length; r++) {
    let u = r ? i[r - 1].to : e, c = r < i.length ? i[r].from : t;
    for (let h = u, f, d, p; h < c; h++)
      if (d = ec[f = n.charCodeAt(h)])
        if (d < 0) {
          for (let v = l - 3; v >= 0; v -= 3)
            if (Jn[v + 1] == -d) {
              let m = Jn[v + 2], b = m & 2 ? s : m & 4 ? m & 1 ? o : s : 0;
              b && (mt[h] = mt[Jn[v]] = b), l = v;
              break;
            }
        } else {
          if (Jn.length == 189)
            break;
          Jn[l++] = h, Jn[l++] = f, Jn[l++] = a;
        }
      else if ((p = mt[h]) == 2 || p == 1) {
        let v = p == s;
        a = v ? 0 : 1;
        for (let m = l - 3; m >= 0; m -= 3) {
          let b = Jn[m + 2];
          if (b & 2)
            break;
          if (v)
            Jn[m + 2] |= 2;
          else {
            if (b & 4)
              break;
            Jn[m + 2] |= 4;
          }
        }
      }
  }
}
function kw(n, e, t, i) {
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
        for (let p = c, v = s, m = v ? t[v - 1].to : n; p > a; )
          p == m && (p = t[--v].from, m = v ? t[v - 1].to : n), mt[--p] = d;
        a = c;
      } else
        o = u, a++;
    }
  }
}
function tc(n, e, t, i, s, o, r) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == s % 2)
    for (let a = e, u = 0; a < t; ) {
      let c = !0, h = !1;
      if (u == o.length || a < o[u].from) {
        let v = mt[a];
        v != l && (c = !1, h = v == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, p = a;
      e: for (; ; )
        if (u < o.length && p == o[u].from) {
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
            v.from > a && r.push(new hi(a, v.from, d));
            let m = v.direction == Ls != !(d % 2);
            nc(n, m ? i + 1 : i, s, v.inner, v.from, v.to, r), a = v.to;
          }
          p = v.to;
        } else {
          if (p == t || (c ? mt[p] != l : mt[p] == l))
            break;
          p++;
        }
      f ? tc(n, a, p, i + 1, s, f, r) : a < p && r.push(new hi(a, p, d)), a = p;
    }
  else
    for (let a = t, u = o.length; a > e; ) {
      let c = !0, h = !1;
      if (!u || a > o[u - 1].to) {
        let v = mt[a - 1];
        v != l && (c = !1, h = v == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, p = a;
      e: for (; ; )
        if (u && p == o[u - 1].to) {
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
            v.to < a && r.push(new hi(v.to, a, d));
            let m = v.direction == Ls != !(d % 2);
            nc(n, m ? i + 1 : i, s, v.inner, v.from, v.to, r), a = v.from;
          }
          p = v.from;
        } else {
          if (p == e || (c ? mt[p - 1] != l : mt[p - 1] == l))
            break;
          p--;
        }
      f ? tc(n, p, a, i + 1, s, f, r) : p < a && r.push(new hi(p, a, d)), a = p;
    }
}
function nc(n, e, t, i, s, o, r) {
  let l = e % 2 ? 2 : 1;
  ww(n, s, o, i, l), xw(n, s, o, i, l), kw(s, o, i, l), tc(n, s, o, e, t, i, r);
}
function Sw(n, e, t) {
  if (!n)
    return [new hi(0, 0, e == th ? 1 : 0)];
  if (e == Ls && !t.length && !bw.test(n))
    return am(n.length);
  if (t.length)
    for (; n.length > mt.length; )
      mt[mt.length] = 256;
  let i = [], s = e == Ls ? 0 : 1;
  return nc(n, s, s, t, 0, n.length, i), i;
}
function am(n) {
  return [new hi(0, n, 0)];
}
let um = "";
function Cw(n, e, t, i, s) {
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
    l = hi.find(e, r, (o = i.bidiLevel) !== null && o !== void 0 ? o : -1, i.assoc);
  let a = e[l], u = a.side(s, t);
  if (r == u) {
    let f = l += s ? 1 : -1;
    if (f < 0 || f >= e.length)
      return null;
    a = e[l = f], r = a.side(!s, t), u = a.side(s, t);
  }
  let c = Qt(n.text, r, a.forward(s, t));
  (c < a.from || c > a.to) && (c = u), um = n.text.slice(Math.min(r, c), Math.max(r, c));
  let h = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  if (c == u) {
    if (!h)
      return s ? te.cursor(n.to, 1) : te.cursor(n.from, -1);
    if (h.level + (s ? 0 : 1) < a.level)
      return te.cursor(h.side(!s, t) + n.from, h.forward(s, t) ? 1 : -1, h.level);
  }
  return te.cursor(c + n.from, a.forward(s, t) ? -1 : 1, a.level);
}
function Mw(n, e, t) {
  for (let i = e; i < t; i++) {
    let s = rm(n.charCodeAt(i));
    if (s == 1)
      return Ls;
    if (s == 2 || s == 4)
      return th;
  }
  return Ls;
}
const cm = /* @__PURE__ */ xe.define(), hm = /* @__PURE__ */ xe.define(), fm = /* @__PURE__ */ xe.define(), dm = /* @__PURE__ */ xe.define(), ic = /* @__PURE__ */ xe.define(), pm = /* @__PURE__ */ xe.define(), gm = /* @__PURE__ */ xe.define(), nh = /* @__PURE__ */ xe.define(), ih = /* @__PURE__ */ xe.define(), mm = /* @__PURE__ */ xe.define({
  combine: (n) => n.some((e) => e)
}), vm = /* @__PURE__ */ xe.define({
  combine: (n) => n.some((e) => e)
}), ym = /* @__PURE__ */ xe.define();
class Qs {
  constructor(e, t, i, s, o, r = !1) {
    this.range = e, this.y = t, this.x = i, this.yMargin = s, this.xMargin = o, this.isSnapshot = r;
  }
  map(e) {
    return e.empty ? this : new Qs(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new Qs(te.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Wr = /* @__PURE__ */ St.define({ map: (n, e) => n.map(e) }), bm = /* @__PURE__ */ St.define();
function Vn(n, e, t) {
  let i = n.facet(dm);
  i.length ? i[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const ki = /* @__PURE__ */ xe.define({ combine: (n) => n.length ? n[0] : !0 });
let Aw = 0;
const zs = /* @__PURE__ */ xe.define({
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
    this.id = e, this.create = t, this.domEventHandlers = i, this.domEventObservers = s, this.baseExtensions = o(this), this.extension = this.baseExtensions.concat(zs.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(zs.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: i, eventObservers: s, provide: o, decorations: r } = t || {};
    return new vn(Aw++, e, i, s, (l) => {
      let a = [];
      return r && a.push(ma.of((u) => {
        let c = u.plugin(l);
        return c ? r(c) : Mt.none;
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
class eu {
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
            if (Vn(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
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
        Vn(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Vn(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const wm = /* @__PURE__ */ xe.define(), sh = /* @__PURE__ */ xe.define(), ma = /* @__PURE__ */ xe.define(), xm = /* @__PURE__ */ xe.define(), oh = /* @__PURE__ */ xe.define(), Ar = /* @__PURE__ */ xe.define(), km = /* @__PURE__ */ xe.define();
function Ff(n, e) {
  let t = n.state.facet(km);
  if (!t.length)
    return t;
  let i = t.map((o) => o instanceof Function ? o(n) : o), s = [];
  return Ye.spans(i, e.from, e.to, {
    point() {
    },
    span(o, r, l, a) {
      let u = o - e.from, c = r - e.from, h = s;
      for (let f = l.length - 1; f >= 0; f--, a--) {
        let d = l[f].spec.bidiIsolate, p;
        if (d == null && (d = Mw(e.text, u, c)), a > 0 && h.length && (p = h[h.length - 1]).to == u && p.direction == d)
          p.to = c, h = p.inner;
        else {
          let v = { from: u, to: c, direction: d, inner: [] };
          h.push(v), h = v.inner;
        }
      }
    }
  }), s;
}
const Sm = /* @__PURE__ */ xe.define();
function rh(n) {
  let e = 0, t = 0, i = 0, s = 0;
  for (let o of n.state.facet(Sm)) {
    let r = o(n);
    r && (r.left != null && (e = Math.max(e, r.left)), r.right != null && (t = Math.max(t, r.right)), r.top != null && (i = Math.max(i, r.top)), r.bottom != null && (s = Math.max(s, r.bottom)));
  }
  return { left: e, right: t, top: i, bottom: s };
}
const Bo = /* @__PURE__ */ xe.define();
class Mn {
  constructor(e, t, i, s) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = s;
  }
  join(e) {
    return new Mn(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
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
          for (let p = s; p < e.length && e[p].fromB <= h; p++)
            r = e[p].toA - e[p].toB;
          f = Math.max(f, d + r);
        } else if (s < e.length && e[s].fromB <= h) {
          let d = e[s++];
          h = Math.max(h, d.toB), f = Math.max(f, d.toA), r = d.toA - d.toB;
        } else
          break;
      i.push(new Mn(c, f, u, h));
    }
    return i;
  }
}
class Pl {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = Ft.empty(this.startState.doc.length);
    for (let o of i)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, r, l, a) => s.push(new Mn(o, r, l, a))), this.changedRanges = s;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new Pl(e, t, i);
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
const Tw = [];
class Ot {
  constructor(e, t, i = 0) {
    this.dom = e, this.length = t, this.flags = i, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return Tw;
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
      t && uw(this.dom, t);
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
    let i = ns(this.dom), s = this.length ? e > 0 : t > 0;
    return new Nn(this.parent.dom, i + (s ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof ya)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class va extends Ot {
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
          s = zf(s);
      else
        t.insertBefore(l.dom, s);
      i = l.dom;
    }
    for (s = i ? i.nextSibling : t.firstChild, o && s && (o.written = !0); s; )
      s = zf(s);
    this.length = r;
  }
}
function zf(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class ya extends va {
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
      let t = Ot.get(e);
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
        if (r instanceof $i)
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
class $i extends va {
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
    let i = new $i(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class oo extends va {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, i) {
    let s = new oo(t || document.createElement("div"), e);
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
        let p = c.children[f], v = d + p.length;
        v >= h && (p.isComposite() ? a(p, h - d) : (!r || r.isHidden && (t > 0 && !(r.flags & 32) || i && Dw(r, p))) && (v > h || p.flags & 32 && t <= 1) ? (r = p, l = h - d) : (d < h || p.flags & 16 && !p.isHidden && t >= -1) && (s = p, o = h - d)), d = v;
      }
    }
    a(this, e);
    let u = (t < 0 ? s : r) || s || r;
    return u ? { tile: u, offset: u == s ? o : l } : null;
  }
  coordsIn(e, t, i) {
    let s = this.resolveInline(e, t, !0);
    return s ? s.tile.coordsIn(Math.max(0, s.offset), t, i) : $w(this);
  }
  domIn(e, t) {
    let i = this.resolveInline(e, t);
    if (i) {
      let { tile: s, offset: o } = i;
      if (this.dom.contains(s.dom))
        return s.isText() ? new Nn(s.dom, Math.min(s.dom.nodeValue.length, o)) : s.domPosFor(o, s.flags & 16 ? 1 : s.flags & 32 ? -1 : t);
      let r = i.tile.parent, l = !1;
      for (let a of r.children) {
        if (l)
          return new Nn(a.dom, 0);
        a == i.tile && (l = !0);
      }
    }
    return new Nn(this.dom, 0);
  }
}
function $w(n) {
  let e = n.dom.lastChild;
  if (!e)
    return n.dom.getBoundingClientRect();
  let t = vl(e);
  return t[t.length - 1] || null;
}
function Dw(n, e) {
  let t = n.coordsIn(0, 1), i = e.coordsIn(0, 1);
  return t && i && i.top < t.bottom;
}
class dn extends va {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let i = new dn(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class xs extends Ot {
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
    let a = dr(this.dom, o, r).getClientRects();
    if (!a.length)
      return null;
    let u = a[(l ? l < 0 : t >= 0) ? 0 : a.length - 1];
    return ge.safari && !l && u.width == 0 && (u = Array.prototype.find.call(a, (c) => c.width) || u), i == null ? u : Rl(u, (l ? l > 0 : t < 0) == i);
  }
  static of(e, t) {
    let i = new xs(t || document.createTextNode(e), e);
    return t || (i.flags |= 2), i;
  }
}
class Es extends Ot {
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
      return Rl(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let o = this.dom.getClientRects(), r = null;
      if (!o.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let a = l ? o.length - 1 : 0; r = o[a], !(e > 0 ? a == 0 : a == o.length - 1 || r.top < r.bottom); a += l ? -1 : 1)
        ;
      return Rl(r, !l);
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
    return o || (o = e.toDOM(t), e.editable || (o.contentEditable = "false")), new Es(o, i, e, s);
  }
}
class _l extends Ot {
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
    return i == null ? s : Rl(s, t > 0 == i);
  }
}
class Ow {
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
class Lw {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.wrapper = i, this.rank = s;
  }
}
class Ew {
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
      let a = r.children[r.children.length - 1] = new xs(l.dom, l.text + e);
      a.parent = r;
    } else
      r.append(s || xs.of(e, (o = this.cache.find(xs)) === null || o === void 0 ? void 0 : o.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let i = this.curLine;
    i.dom != t.line.dom && (i.setDOM(this.cache.reused.has(t.line) ? tu(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let s = i;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let a = t.marks[l], u = s.lastChild;
      if (u instanceof dn && u.mark.eq(a.mark))
        u.dom != a.dom && u.setDOM(tu(a.dom)), s = u;
      else {
        let { dom: c } = a;
        this.cache.reused.get(a) && Ot.get(a.dom) && (c = tu(a.dom));
        let h = dn.of(a.mark, c);
        s.append(h), s = h;
      }
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
    }
    let o = Ot.get(e.text);
    o && this.cache.reused.set(
      o,
      2
      /* Reused.DOM */
    );
    let r = new xs(e.text, e.text.nodeValue);
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
    e || (e = Cm);
    let s = oo.start(e, t || ((i = this.cache.find(oo)) === null || i === void 0 ? void 0 : i.dom), !!t);
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
      if (t > 0 && (l = s.lastChild) && l instanceof dn && l.mark.eq(r))
        s = l, t--;
      else {
        let a = dn.of(r, (i = this.cache.find(dn, (u) => u.mark.eq(r))) === null || i === void 0 ? void 0 : i.dom);
        s.append(a), s = a, t = 0;
      }
    }
    return s;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Wf(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(ge.ios && Wf(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        nu,
        0,
        32
        /* TileFlag.After */
      ) || new Es(
        nu.toDOM(),
        0,
        nu,
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
        let t = e.rank * 102 + e.value.rank, i = new Lw(e.from, e.to, e.value, t), s = this.wrappers.length;
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
      if (i.from < this.pos && s instanceof $i && s.wrapper.eq(i.wrapper))
        t = s;
      else {
        let o = $i.of(i.wrapper, (e = this.cache.find($i, (r) => r.wrapper.eq(i.wrapper))) === null || e === void 0 ? void 0 : e.dom);
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
      _l,
      void 0,
      1
      /* Reused.Full */
    );
    return i && (i.flags = t), i || new _l(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class Iw {
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
const Nl = [Es, oo, xs, dn, _l, $i, ya];
for (let n = 0; n < Nl.length; n++)
  Nl[n].bucket = n;
class Bw {
  constructor(e) {
    this.view = e, this.buckets = Nl.map(() => []), this.index = Nl.map(() => 0), this.reused = /* @__PURE__ */ new Map();
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
          ), new Es(l.dom, t, e, l.flags & -498 | i));
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
class Rw {
  constructor(e, t, i, s, o) {
    this.view = e, this.decorations = s, this.disallowBlockEffectsFor = o, this.openWidget = !1, this.openMarks = 0, this.cache = new Bw(e), this.text = new Iw(e.state.doc), this.builder = new Ew(this.cache, new ya(e, e.contentDOM), Ye.iter(i)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Ow(t), this.reuseWalker = {
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
    let s = Nw(this.old), o = this.openMarks;
    this.old.advance(e, i ? 1 : -1, {
      skip: (r, l, a) => {
        if (r.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(a - l);
          else {
            let u = a > 0 || l < r.length ? Es.of(r.widget, this.view, a - l, r.flags & 496, this.cache.maybeReuse(r)) : this.cache.reuse(r);
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
        else if (r instanceof _l)
          this.cache.add(r);
        else if (r instanceof dn)
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
        r.isLine() ? this.builder.addLineStart(r.attrs, this.cache.maybeReuse(r)) : (this.cache.add(r), r instanceof dn && s.unshift(r.mark)), this.openWidget = !1;
      },
      leave: (r) => {
        r.isLine() ? s.length && (s.length = o = 0) : r instanceof dn && (s.shift(), o = Math.min(o, s.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let i = null, s = this.builder, o = -1, r = Ye.spans(this.decorations, e, t, {
      point: (l, a, u, c, h, f) => {
        if (u instanceof Os) {
          if (this.disallowBlockEffectsFor[f]) {
            if (u.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (a > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (o = c.length, h > c.length)
            s.continueWidget(a - l);
          else {
            let d = u.widget || (u.block ? ro.block : ro.inline), p = Pw(u), v = this.cache.findWidget(d, a - l, p) || Es.of(d, this.view, a - l, p);
            u.block ? (u.startSide > 0 && s.addLineStartIfNotCovered(i), s.addBlockWidget(v)) : (s.ensureLine(i), s.addInlineWidget(v, c, h));
          }
          i = null;
        } else
          i = _w(i, u);
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
      let o = Ot.get(s);
      if (s == this.view.contentDOM)
        break;
      o instanceof dn ? t.push(o) : o?.isLine() ? i = o : o instanceof $i || (s.nodeName == "DIV" && !i ? i = new oo(s, Cm) : i || t.push(dn.of(new Cr({ tagName: s.nodeName.toLowerCase(), attributes: cw(s) }), s)));
    }
    return i ? { line: i, marks: t } : null;
  }
}
function Wf(n, e) {
  let t = (i) => {
    for (let s of i.children)
      if ((e ? s.isText() : s.length) || t(s))
        return !0;
    return !1;
  };
  return t(n);
}
function Pw(n) {
  let e = n.isReplace ? (n.startSide < 0 ? 64 : 0) | (n.endSide > 0 ? 128 : 0) : n.startSide > 0 ? 32 : 16;
  return n.block && (e |= 256), e;
}
const Cm = { class: "cm-line" };
function _w(n, e) {
  let t = e.spec.attributes, i = e.spec.class;
  return !t && !i || (n || (n = { class: "cm-line" }), t && Qc(t, n), i && (n.class += " " + i)), n;
}
function Nw(n) {
  let e = [];
  for (let t = n.parents.length; t > 1; t--) {
    let i = t == n.parents.length ? n.tile : n.parents[t].tile;
    i instanceof dn && e.push(i.mark);
  }
  return e;
}
function tu(n) {
  let e = Ot.get(n);
  return e && e.setDOM(n.cloneNode()), n;
}
class ro extends Sr {
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
ro.inline = /* @__PURE__ */ new ro("span");
ro.block = /* @__PURE__ */ new ro("div");
const nu = /* @__PURE__ */ new class extends Sr {
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
class Kf {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = Mt.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new ya(e, e.contentDOM), this.updateInner([new Mn(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let i = e.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: c, toA: h }) => h < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let s = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? s = this.domChanged.newSel.head : !Gw(e.changes, this.hasComposition) && !e.selectionSet && (s = e.state.selection.main.head));
    let o = s > -1 ? Hw(this.view, e.changes, s) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: h } = this.hasComposition;
      i = new Mn(c, h, e.changes.mapPos(c, -1), e.changes.mapPos(h, 1)).addToSet(i.slice());
    }
    this.hasComposition = o ? { from: o.range.fromB, to: o.range.toB } : null, (ge.ie || ge.chrome) && !o && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let r = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let a = Ww(r, this.decorations, e.changes);
    a.length && (i = Mn.extendWithRanges(i, a));
    let u = Uw(l, this.blockWrappers, e.changes);
    return u.length && (i = Mn.extendWithRanges(i, u)), o && !i.some((c) => c.fromA <= o.range.fromA && c.toA >= o.range.toA) && (i = o.range.addToSet(i.slice())), this.tile.flags & 2 && i.length == 0 ? !1 : (this.updateInner(i, o), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: i } = this.view;
    i.ignore(() => {
      if (t || e.length) {
        let r = this.tile, l = new Rw(this.view, r, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && Ot.get(t.text) && l.cache.reused.set(
          Ot.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), sc(r, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let o = ge.chrome || ge.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(o), o && (o.written || i.selectionRange.focusNode != o.node || !this.tile.dom.contains(o.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let o of this.tile.children)
        o.isWidget() && o.widget instanceof iu && s.push(o.dom);
    i.updateGaps(s);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(bm) && (this.editContextFormatting = i.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: i } = this.tile, s = this.view.root.activeElement, o = s == i, r = !o && !(this.view.state.facet(ki) || i.tabIndex > -1) && Go(i, this.view.observer.selectionRange) && !(s && i.contains(s));
    if (!(o || t || r))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let a = this.view.state.selection.main, u, c;
    if (a.empty ? c = u = this.inlineDOMNearPos(a.anchor, a.assoc || 1) : (c = this.inlineDOMNearPos(a.head, a.head == a.from ? 1 : -1), u = this.inlineDOMNearPos(a.anchor, a.anchor == a.from ? 1 : -1)), ge.gecko && a.empty && !this.hasComposition && Vw(u)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => u.node.insertBefore(f, u.node.childNodes[u.offset] || null)), u = c = new Nn(f, 0), l = !0;
    }
    let h = this.view.observer.selectionRange;
    (l || !h.focusNode || (!qo(u.node, u.offset, h.anchorNode, h.anchorOffset) || !qo(c.node, c.offset, h.focusNode, h.focusOffset)) && !this.suppressWidgetCursorChange(h, a)) && (this.view.observer.ignore(() => {
      ge.android && ge.chrome && i.contains(h.focusNode) && jw(h.focusNode, i) && (i.blur(), i.focus({ preventScroll: !0 }));
      let f = fr(this.view.root);
      if (f) if (a.empty) {
        if (ge.gecko) {
          let d = Fw(u.node, u.offset);
          if (d && d != 3) {
            let p = (d == 1 ? im : sm)(u.node, u.offset);
            p && (u = new Nn(p.node, p.offset));
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
    }), this.view.observer.setSelectionRange(u, c)), this.impreciseAnchor = u.precise ? null : new Nn(h.anchorNode, h.anchorOffset), this.impreciseHead = c.precise ? null : new Nn(h.focusNode, h.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && qo(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, i = fr(e.root), { anchorNode: s, anchorOffset: o } = e.observer.selectionRange;
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
        let r = Ei(e) == 0 ? 0 : t == 0 ? -1 : 1;
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
      for (; o && !Ot.get(o); )
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
    return s.isWidget() ? s.widget instanceof iu ? null : s.coordsInWidget(o, t, !0) : s.coordsIn(o, t, i);
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
        let l = Qt(o.text, r);
        if (l == r)
          return null;
        let a = dr(o.dom, r, l).getClientRects();
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
    let t = [], { from: i, to: s } = e, o = this.view.contentDOM.clientWidth, r = o > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == Ct.LTR, u = 0, c = (h, f, d) => {
      for (let p = 0; p < h.children.length && !(f > s); p++) {
        let v = h.children[p], m = f + v.length, b = v.dom.getBoundingClientRect(), { height: O } = b;
        if (d && !p && (u += b.top - d.top), v instanceof $i)
          m > i && c(v, f, b);
        else if (f >= i && (u > 0 && t.push(-u), t.push(O + u), u = 0, r)) {
          let L = v.dom.lastChild, E = L ? vl(L) : [];
          if (E.length) {
            let I = E[E.length - 1], z = a ? I.right - b.left : b.right - I.left;
            z > l && (l = z, this.minWidth = o, this.minWidthFrom = f, this.minWidthTo = m);
          }
        }
        d && p == h.children.length - 1 && (u += d.bottom - b.bottom), f = m + v.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? Ct.RTL : Ct.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((r) => {
      if (r.isLine() && r.children.length && r.length <= 20) {
        let l = 0, a;
        for (let u of r.children) {
          if (!u.isText() || /[^ -~]/.test(u.text))
            return;
          let c = vl(u.dom);
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
      let r = vl(t.firstChild)[0];
      i = t.getBoundingClientRect().height, s = r && r.width ? r.width / 27 : 7, o = r && r.height ? r.height : i, t.remove();
    }), { lineHeight: i, charWidth: s, textHeight: o };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, s = 0; ; s++) {
      let o = s == t.viewports.length ? null : t.viewports[s], r = o ? o.from - 1 : this.view.state.doc.length;
      if (r > i) {
        let l = (t.lineBlockAt(r).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
        e.push(Mt.replace({
          widget: new iu(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, r));
      }
      if (!o)
        break;
      i = o.to + 1;
    }
    return Mt.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(ma).map((o) => (this.dynamicDecorationMap[e++] = typeof o == "function") ? o(this.view) : o), i = !1, s = this.view.state.facet(oh).map((o, r) => {
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
    this.blockWrappers = this.view.state.facet(xm).map((o) => typeof o == "function" ? o(this.view) : o);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let u = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = u.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let u of this.view.state.facet(ym))
      try {
        if (u(this.view, e.range, e))
          return !0;
      } catch (c) {
        Vn(this.view.state, c, "scroll handler");
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
    let o = rh(this.view), r = {
      left: i.left - o.left,
      top: i.top - o.top,
      right: i.right + o.right,
      bottom: i.bottom + o.bottom
    }, { offsetWidth: l, offsetHeight: a } = this.view.scrollDOM;
    if (dw(this.view.scrollDOM, r, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, a), -a), this.view.textDirection == Ct.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (i.top > window.visualViewport.offsetTop + window.visualViewport.height || i.bottom < window.visualViewport.offsetTop)) {
      let u = this.view.docView.lineAt(t.head, 1);
      if (u) {
        let c = Qg(u.dom);
        u.dom.scrollIntoView({ block: "nearest" }), em(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (i) => i.isWidget() || i.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    sc(this.tile);
  }
}
function sc(n, e) {
  let t = e?.get(n);
  if (t != 1) {
    t == null && n.destroy();
    for (let i of n.children)
      sc(i, e);
  }
}
function Vw(n) {
  return n.node.nodeType == 1 && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
function Mm(n, e) {
  let t = n.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let i = im(t.focusNode, t.focusOffset), s = sm(t.focusNode, t.focusOffset), o = i || s;
  if (s && i && s.node != i.node) {
    let l = Ot.get(s.node);
    if (!l || l.isText() && l.text != s.node.nodeValue)
      o = s;
    else if (n.docView.lastCompositionAfterCursor) {
      let a = Ot.get(i.node);
      !a || a.isText() && a.text != i.node.nodeValue || (o = s);
    }
  }
  if (n.docView.lastCompositionAfterCursor = o != i, !o)
    return null;
  let r = e - o.offset;
  return { from: r, to: r + o.node.nodeValue.length, node: o.node };
}
function Hw(n, e, t) {
  let i = Mm(n, t);
  if (!i)
    return null;
  let { node: s, from: o, to: r } = i, l = s.nodeValue;
  if (/[\n\r]/.test(l) || n.state.doc.sliceString(i.from, i.to) != l)
    return null;
  let a = e.invertedDesc;
  return { range: new Mn(a.mapPos(o), a.mapPos(r), o, r), text: s };
}
function Fw(n, e) {
  return n.nodeType != 1 ? 0 : (e && n.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < n.childNodes.length && n.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let zw = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Js(e, t, this.changes);
  }
  comparePoint(e, t) {
    Js(e, t, this.changes);
  }
  boundChange(e) {
    Js(e, e, this.changes);
  }
};
function Ww(n, e, t) {
  let i = new zw();
  return Ye.compare(n, e, t, i), i.changes;
}
class Kw {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Js(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    Js(e, e, this.changes);
  }
}
function Uw(n, e, t) {
  let i = new Kw();
  return Ye.compare(n, e, t, i), i.changes;
}
function jw(n, e) {
  for (let t = n; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Gw(n, e) {
  let t = !1;
  return e && n.iterChangedRanges((i, s) => {
    i < e.to && s > e.from && (t = !0);
  }), t;
}
class iu extends Sr {
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
function qw(n, e, t = 1) {
  let i = n.charCategorizer(e), s = n.doc.lineAt(e), o = e - s.from;
  if (s.length == 0)
    return te.cursor(e);
  o == 0 ? t = 1 : o == s.length && (t = -1);
  let r = o, l = o;
  t < 0 ? r = Qt(s.text, o, !1) : l = Qt(s.text, o);
  let a = i(s.text.slice(r, l));
  for (; r > 0; ) {
    let u = Qt(s.text, r, !1);
    if (i(s.text.slice(u, r)) != a)
      break;
    r = u;
  }
  for (; l < s.length; ) {
    let u = Qt(s.text, l);
    if (i(s.text.slice(l, u)) != a)
      break;
    l = u;
  }
  return te.undirectionalRange(r + s.from, l + s.from);
}
function Yw(n, e, t, i, s) {
  let o = Math.round((i - e.left) * n.defaultCharacterWidth);
  if (n.lineWrapping && t.height > n.defaultLineHeight * 1.5) {
    let l = n.viewState.heightOracle.textHeight, a = Math.floor((s - t.top - (n.defaultLineHeight - l) * 0.5) / l);
    o += a * n.viewState.heightOracle.lineLength;
  }
  let r = n.state.sliceDoc(t.from, t.to);
  return t.from + sw(r, o, n.state.tabSize);
}
function oc(n, e, t) {
  let i = n.lineBlockAt(e);
  if (Array.isArray(i.type)) {
    let s;
    for (let o of i.type) {
      if (o.from > e)
        break;
      if (!(o.to < e)) {
        if (o.from < e && o.to > e)
          return o;
        (!s || o.type == qt.Text && (s.type != o.type || (t < 0 ? o.from < e : o.to > e))) && (s = o);
      }
    }
    return s || i;
  }
  return i;
}
function Xw(n, e, t, i) {
  let s = oc(n, e.head, e.assoc || -1), o = !i || s.type != qt.Text || !(n.lineWrapping || s.widgetLineBreaks) ? null : n.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (o) {
    let r = n.dom.getBoundingClientRect(), l = n.textDirectionAt(s.from), a = n.posAtCoords({
      x: t == (l == Ct.LTR) ? r.right - 1 : r.left + 1,
      y: (o.top + o.bottom) / 2
    });
    if (a != null)
      return te.cursor(a, t ? -1 : 1);
  }
  return te.cursor(t ? s.to : s.from, t ? -1 : 1);
}
function Uf(n, e, t, i) {
  let s = n.state.doc.lineAt(e.head), o = n.bidiSpans(s), r = n.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let u = Cw(s, o, r, l, t), c = um;
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
function Jw(n, e, t) {
  let i = n.state.charCategorizer(e), s = i(t);
  return (o) => {
    let r = i(o);
    return s == Ci.Space && (s = r), s == r;
  };
}
function Zw(n, e, t, i) {
  let s = e.head, o = t ? 1 : -1;
  if (s == (t ? n.state.doc.length : 0))
    return te.cursor(s, e.assoc);
  let r = e.goalColumn, l, a = n.contentDOM.getBoundingClientRect(), u = n.coordsAtPos(s, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = n.documentTop;
  if (u)
    r == null && (r = u.left - a.left), l = o < 0 ? u.top : u.bottom;
  else {
    let p = n.viewState.lineBlockAt(s);
    r == null && (r = Math.min(a.right - a.left, n.defaultCharacterWidth * (s - p.from))), l = (o < 0 ? p.top : p.bottom) + c;
  }
  let h = a.left + r, f = n.viewState.heightOracle.textHeight >> 1, d = i ?? f;
  for (let p = 0; ; p += f) {
    let v = l + (d + p) * o, m = rc(n, { x: h, y: v }, !1, o);
    if (t ? v > a.bottom : v < a.top)
      return te.cursor(m.pos, m.assoc);
    let b = n.coordsAtPos(m.pos, m.assoc), O = b ? (b.top + b.bottom) / 2 : 0;
    if (!b || (t ? O > l : O < l))
      return te.cursor(m.pos, m.assoc, void 0, r);
  }
}
function Yo(n, e, t) {
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
function Am(n, e) {
  let t = null;
  for (let i = 0; i < e.ranges.length; i++) {
    let s = e.ranges[i], o = null;
    if (s.empty) {
      let r = Yo(n, s.from, 0);
      r != s.from && (o = te.cursor(r, -1));
    } else {
      let r = Yo(n, s.from, -1), l = Yo(n, s.to, 1);
      (r != s.from || l != s.to) && (s.undirectional ? o = te.undirectionalRange(s.from, s.to) : o = te.range(s.from == s.anchor ? r : l, s.from == s.head ? r : l));
    }
    o && (t || (t = e.ranges.slice()), t[i] = o);
  }
  return t ? te.create(t, e.mainIndex) : e;
}
function su(n, e, t) {
  let i = Yo(n.state.facet(Ar).map((s) => s(n)), t.from, e.head > t.from ? -1 : 1);
  return i == t.from ? t : te.cursor(i, i < t.from ? 1 : -1);
}
class ui {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function rc(n, e, t, i) {
  let s = n.contentDOM.getBoundingClientRect(), o = s.top + n.viewState.paddingTop, { x: r, y: l } = e, a = l - o, u;
  for (; ; ) {
    if (a < 0)
      return new ui(0, 1);
    if (a > n.viewState.docHeight)
      return new ui(n.state.doc.length, -1);
    if (u = n.elementAtHeight(a), i == null)
      break;
    if (u.type == qt.Text) {
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
    if (u.type == qt.Text) {
      let h = Yw(n, s, u, r, l);
      return new ui(h, h == u.from ? 1 : -1);
    }
  }
  if (u.type != qt.Text)
    return a < (u.top + u.bottom) / 2 ? new ui(u.from, 1) : new ui(u.to, -1);
  let c = n.docView.lineAt(u.from, 2);
  return (!c || c.length != u.length) && (c = n.docView.lineAt(u.from, -2)), new Qw(n, r, l, n.textDirectionAt(u.from)).scanTile(c, u.from);
}
class Qw {
  constructor(e, t, i, s) {
    this.view = e, this.x = t, this.y = i, this.baseDir = s, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: i, spans: s } = this.bidiSpansAt(e);
    return s[hi.find(s, e - i.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: i, spans: s } = this.bidiSpansAt(e);
    return s[hi.find(s, e - i.from, -1, t)].dir;
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
      let p = o - s, v = s + o >> 1;
      t: if (r.has(v)) {
        for (let O = 1; O < p; O++) {
          let L = v + O;
          if (L >= o && (L -= p), !r.has(L)) {
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
              let E = L.left > this.x ? this.x - L.left : L.right < this.x ? this.x - L.right : 0, I = Math.abs(E);
              I < h && (c = v, h = I, f = L), E && (b = E < 0 == (this.baseDir == Ct.LTR) ? -1 : 1);
            }
        }
      b == -1 && (!l || this.baseDirAt(e[v], 1)) ? o = v : b == 1 && (!l || this.baseDirAt(e[v + 1], -1)) && (s = v + 1);
    }
    if (!f) {
      if (!u && !a)
        return { i: 0, after: !1 };
      let p = a && (!u || this.y - a.bottom < u.top - this.y) ? a : u;
      return this.y = (p.top + p.bottom) / 2, this.scan(e, t, !0);
    }
    if (h && !i) {
      let { top: p, bottom: v } = f;
      if (a && a.bottom > (p + p + v) / 3)
        return this.y = a.bottom - 1, this.scan(e, t, !0);
      if (u && u.top < (p + v + v) / 3)
        return this.y = u.top + 1, this.scan(e, t, !0);
    }
    let d = (l ? this.dirAt(e[c], 1) : this.baseDir) == Ct.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (f.left + f.right) / 2 == d
    };
  }
  scanText(e, t) {
    let i = [];
    for (let o = 0; o < e.length; o = Qt(e.text, o))
      i.push(t + o);
    i.push(t + e.length);
    let s = this.scan(i, (o) => {
      let r = i[o] - t, l = i[o + 1] - t;
      return dr(e.dom, r, l).getClientRects();
    });
    return s.after ? new ui(i[s.i + 1], -1) : new ui(i[s.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new ui(t, 1);
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
      return a.flags & 48 ? null : (a.dom.nodeType == 1 ? a.dom : dr(a.dom, 0, a.length)).getClientRects();
    }), o = e.children[s.i], r = i[s.i];
    return o.isText() ? this.scanText(o, r) : o.isComposite() ? this.scanTile(o, r) : s.after ? new ui(i[s.i + 1], -1) : new ui(r, 1);
  }
}
const Fs = "￿";
class ex {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(rt.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Fs;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(i, s);
      let o = this.text.length;
      this.readNode(s);
      let r = Ot.get(s), l = s.nextSibling;
      if (l == t) {
        r?.breakAfter && !l && i != this.view.contentDOM && this.lineBreak();
        break;
      }
      let a = Ot.get(l);
      (r && a ? r.breakAfter : (r ? r.breakAfter : Bl(s)) || Bl(l) && (s.nodeName != "BR" || r?.isWidget()) && this.text.length > o) && !nx(l, t) && this.lineBreak(), s = l;
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
    let t = Ot.get(e), i = t && t.overrideDOMText;
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
      (e.nodeType == 3 ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + (tx(e, i.node, i.offset) ? t : 0));
  }
}
function tx(n, e, t) {
  for (; ; ) {
    if (!e || t < Ei(e))
      return !1;
    if (e == n)
      return !0;
    t = ns(e) + 1, e = e.parentNode;
  }
}
function nx(n, e) {
  let t;
  for (; !(n == e || !n); n = n.nextSibling) {
    let i = Ot.get(n);
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
class jf {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class ix {
  constructor(e, t, i, s) {
    this.typeOver = s, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: o, impreciseAnchor: r } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = Tm(e.docView.tile, t, i, 0))) {
      let a = o || r ? [] : ox(e), u = new ex(a, e);
      u.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = u.text, this.newSel = rx(a, this.bounds.from);
    } else {
      let a = e.observer.selectionRange, u = o && o.node == a.focusNode && o.offset == a.focusOffset || !Qu(e.contentDOM, a.focusNode) ? l.main.head : e.docView.posFromDOM(a.focusNode, a.focusOffset), c = r && r.node == a.anchorNode && r.offset == a.anchorOffset || !Qu(e.contentDOM, a.anchorNode) ? l.main.anchor : e.docView.posFromDOM(a.anchorNode, a.anchorOffset), h = e.viewport;
      if ((ge.ios || ge.chrome) && u != c && Math.min(u, c) <= l.main.from && Math.max(u, c) >= l.main.to && (h.from > 0 || h.to < e.state.doc.length)) {
        let f = Math.min(u, c), d = Math.max(u, c), p = h.from - f, v = h.to - d;
        (p == 0 || p == 1 || f == 0) && (v == 0 || v == -1 || d == e.state.doc.length) && (u = 0, c = e.state.doc.length);
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
function Tm(n, e, t, i) {
  if (n.isComposite()) {
    let s = -1, o = -1, r = -1, l = -1;
    for (let a = 0, u = i, c = i; a < n.children.length; a++) {
      let h = n.children[a], f = u + h.length;
      if (u < e && f > t)
        return Tm(h, e, t, u);
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
function $m(n, e) {
  let t, { newSel: i } = e, { state: s } = n, o = s.selection.main, r = n.inputState.lastKeyTime > Date.now() - 100 ? n.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: a } = e.bounds, u = o.from, c = null;
    (r === 8 || ge.android && e.text.length < a - l) && (u = o.to, c = "end");
    let h = s.doc.sliceString(l, a, Fs), f, d;
    !o.empty && o.from >= l && o.to <= a && (e.typeOver || h != e.text) && h.slice(0, o.from - l) == e.text.slice(0, o.from - l) && h.slice(o.to - l) == e.text.slice(f = e.text.length - (h.length - (o.to - l))) ? t = {
      from: o.from,
      to: o.to,
      insert: nt.of(e.text.slice(o.from - l, f).split(Fs))
    } : (d = Dm(h, e.text, u - l, c)) && (ge.chrome && r == 13 && d.toB == d.from + 2 && e.text.slice(d.from, d.toB) == Fs + Fs && d.toB--, t = {
      from: l + d.from,
      to: l + d.toA,
      insert: nt.of(e.text.slice(d.from, d.toB).split(Fs))
    });
  } else i && (!n.hasFocus && s.facet(ki) || Vl(i, o)) && (i = null);
  if (!t && !i)
    return !1;
  if ((ge.mac || ge.android) && t && t.from == t.to && t.from == o.head - 1 && /^\. ?$/.test(t.insert.toString()) && n.contentDOM.getAttribute("autocorrect") == "off" ? (i && t.insert.length == 2 && (i = te.single(i.main.anchor - 1, i.main.head - 1)), t = { from: t.from, to: t.to, insert: nt.of([t.insert.toString().replace(".", " ")]) }) : s.doc.lineAt(o.from).to < o.to && n.docView.lineHasWidget(o.to) && n.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: o.from,
    to: o.to,
    insert: s.toText(n.inputState.insertingText)
  } : ge.chrome && t && t.from == t.to && t.from == o.head && t.insert.toString() == `
 ` && n.lineWrapping && (i && (i = te.single(i.main.anchor - 1, i.main.head - 1)), t = { from: o.from, to: o.to, insert: nt.of([" "]) }), t)
    return lh(n, t, i, r);
  if (i && !Vl(i, o)) {
    let l = !1, a = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (l = !0), a = n.inputState.lastSelectionOrigin, a == "select.pointer" && (i = Am(s.facet(Ar).map((u) => u(n)), i))), n.dispatch({ selection: i, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function lh(n, e, t, i = -1) {
  if (ge.ios && n.inputState.flushIOSKey(e))
    return !0;
  let s = n.state.selection.main;
  if (ge.android && (e.to == s.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == s.from || e.from == s.from - 1 && n.state.sliceDoc(e.from, s.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && Zs(n.contentDOM, "Enter", 13) || (e.from == s.from - 1 && e.to == s.to && e.insert.length == 0 || i == 8 && e.insert.length < e.to - e.from && e.to > s.head) && Zs(n.contentDOM, "Backspace", 8) || e.from == s.from && e.to == s.to + 1 && e.insert.length == 0 && Zs(n.contentDOM, "Delete", 46)))
    return !0;
  let o = e.insert.toString();
  n.inputState.composing >= 0 && n.inputState.composing++;
  let r, l = () => r || (r = sx(n, e, t));
  return n.state.facet(pm).some((a) => a(n, e.from, e.to, o, l)) || n.dispatch(l()), !0;
}
function sx(n, e, t) {
  let i, s = n.state, o = s.selection.main, r = -1;
  if (e.from == e.to && e.from < o.from || e.from > o.to) {
    let a = e.from < o.from ? -1 : 1, u = a < 0 ? o.from : o.to, c = Yo(s.facet(Ar).map((h) => h(n)), u, a);
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
      let c = n.state.sliceDoc(e.from, e.to), h, f = t && Mm(n, t.main.head);
      if (f) {
        let p = e.insert.length - (e.to - e.from);
        h = { from: f.from, to: f.to - p };
      } else
        h = n.state.doc.lineAt(o.head);
      let d = o.to - e.to;
      i = s.changeByRange((p) => {
        if (p.from == o.from && p.to == o.to)
          return { changes: a, range: u || p.map(a) };
        let v = p.to - d, m = v - c.length;
        if (n.state.sliceDoc(m, v) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        v >= h.from && m <= h.to)
          return { range: p };
        let b = s.changes({ from: m, to: v, insert: e.insert }), O = p.to - o.to;
        return {
          changes: b,
          range: u ? te.range(Math.max(0, u.anchor + O), Math.max(0, u.head + O)) : p.map(b)
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
function Dm(n, e, t, i) {
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
function ox(n) {
  let e = [];
  if (n.root.activeElement != n.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: o } = n.observer.selectionRange;
  return t && (e.push(new jf(t, i)), (s != t || o != i) && e.push(new jf(s, o))), e;
}
function rx(n, e) {
  if (n.length == 0)
    return null;
  let t = n[0].pos, i = n.length == 2 ? n[1].pos : t;
  return t < 0 || i < 0 ? null : t == i ? te.create([te.cursor(i + e, -1)]) : te.single(t + e, i + e);
}
function Vl(n, e) {
  return e.head == n.main.head && e.anchor == n.main.anchor;
}
class lx {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, ge.safari && e.contentDOM.addEventListener("input", () => null), ge.gecko && Sx(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !mx(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
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
    let t = ux(e), i = this.handlers, s = this.view.contentDOM;
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
    if (this.tabFocusMode > 0 && e.keyCode != 27 && Lm.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), ge.android && ge.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (ge.ios && !e.synthetic && !e.altKey && !e.metaKey && (Om.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || cx.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && ge.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && ax(this.view.win) && (t.shiftKey = !1);
      let i = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == i && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, Zs(this.view.contentDOM, t.key, t.keyCode, t.mods));
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
function ax(n) {
  return n.visualViewport ? n.visualViewport.height * n.visualViewport.scale / n.document.documentElement.clientHeight < 0.85 : !1;
}
function Gf(n, e) {
  return (t, i) => {
    try {
      return e.call(n, i, t);
    } catch (s) {
      Vn(t.state, s);
    }
  };
}
function ux(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    return e[i] || (e[i] = { observers: [], handlers: [] });
  }
  for (let i of n) {
    let s = i.spec, o = s && s.plugin.domEventHandlers, r = s && s.plugin.domEventObservers;
    if (o)
      for (let l in o) {
        let a = o[l];
        a && t(l).handlers.push(Gf(i.value, a));
      }
    if (r)
      for (let l in r) {
        let a = r[l];
        a && t(l).observers.push(Gf(i.value, a));
      }
  }
  for (let i in Kn)
    t(i).handlers.push(Kn[i]);
  for (let i in un)
    t(i).observers.push(un[i]);
  return e;
}
const Om = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], cx = "dthko", Lm = [16, 17, 18, 20, 91, 92, 224, 225], Kr = 6;
function Ur(n) {
  return Math.max(0, n) * 0.7 + 8;
}
function hx(n, e) {
  return Math.max(Math.abs(n.clientX - e.clientX), Math.abs(n.clientY - e.clientY));
}
class fx {
  constructor(e, t, i, s) {
    this.view = e, this.startEvent = t, this.style = i, this.mustSelect = s, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Zg(e.contentDOM), this.atoms = e.state.facet(Ar).map((r) => r(e));
    let o = e.contentDOM.ownerDocument;
    o.addEventListener("mousemove", this.move = this.move.bind(this)), o.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(rt.allowMultipleSelections) && dx(e, t), this.dragging = gx(e, t) && Bm(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && hx(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, i = 0, s = 0, o = 0, r = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: s, right: r } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: o, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let a = rh(this.view);
    e.clientX - a.left <= s + Kr ? t = -Ur(s - e.clientX) : e.clientX + a.right >= r - Kr && (t = Ur(e.clientX - r)), e.clientY - a.top <= o + Kr ? i = -Ur(o - e.clientY) : e.clientY + a.bottom >= l - Kr && (i = Ur(e.clientY - l)), this.setScrollSpeed(t, i);
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
    let { view: t } = this, i = Am(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !i.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function dx(n, e) {
  let t = n.state.facet(cm);
  return t.length ? t[0](e) : ge.mac ? e.metaKey : e.ctrlKey;
}
function px(n, e) {
  let t = n.state.facet(hm);
  return t.length ? t[0](e) : ge.mac ? !e.altKey : !e.ctrlKey;
}
function gx(n, e) {
  let { main: t } = n.state.selection;
  if (t.empty)
    return !1;
  let i = fr(n.root);
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
function mx(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != n.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = Ot.get(t)) && i.isWidget() && !i.isHidden && i.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const Kn = /* @__PURE__ */ Object.create(null), un = /* @__PURE__ */ Object.create(null), Em = ge.ie && ge.ie_version < 15 || ge.ios && ge.webkit_version < 604;
function vx(n) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    n.focus(), t.remove(), Im(n, t.value);
  }, 50);
}
function ba(n, e, t) {
  for (let i of n.facet(e))
    t = i(t, n);
  return t;
}
function Im(n, e) {
  e = ba(n.state, nh, e);
  let { state: t } = n, i, s = 1, o = t.toText(e), r = o.lines == t.selection.ranges.length;
  if (lc != null && t.selection.ranges.every((a) => a.empty) && lc == o.toString()) {
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
un.scroll = (n) => {
  let e = n.inputState;
  e.lastScrollTop = n.scrollDOM.scrollTop, e.lastScrollLeft = n.scrollDOM.scrollLeft, ge.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
un.wheel = un.mousewheel = (n) => {
  n.inputState.lastWheelEvent = Date.now();
};
Kn.keydown = (n, e) => (n.inputState.setSelectionOrigin("select"), e.keyCode == 27 && n.inputState.tabFocusMode != 0 && (n.inputState.tabFocusMode = Date.now() + 2e3), !1);
un.touchstart = (n, e) => {
  let t = n.inputState, i = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), i && (t.lastTouchX = i.clientX, t.lastTouchY = i.clientY), t.setSelectionOrigin("select.pointer");
};
un.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
un.touchend = (n, e) => {
  n.inputState.touchActive = !1;
};
Kn.mousedown = (n, e) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let i of n.state.facet(fm))
    if (t = i(n, e), t)
      break;
  if (!t && e.button == 0 && (t = bx(n, e)), t) {
    let i = !n.hasFocus;
    n.inputState.startMouseSelection(new fx(n, e, t, i)), i && n.observer.ignore(() => {
      tm(n.contentDOM);
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
function qf(n, e, t, i) {
  if (i == 1)
    return te.cursor(e, t);
  if (i == 2)
    return qw(n.state, e, t);
  {
    let s = n.docView.lineAt(e, t), o = n.state.doc.lineAt(s ? s.posAtEnd : e), r = s ? s.posAtStart : o.from, l = s ? s.posAtEnd : o.to;
    return l < n.state.doc.length && l == o.to && l++, te.undirectionalRange(r, l);
  }
}
const yx = ge.ie && ge.ie_version <= 11;
let Yf = null, Xf = 0, Jf = 0;
function Bm(n) {
  if (!yx)
    return n.detail;
  let e = Yf, t = Jf;
  return Yf = n, Jf = Date.now(), Xf = !e || t > Date.now() - 400 && Math.abs(e.clientX - n.clientX) < 2 && Math.abs(e.clientY - n.clientY) < 2 ? (Xf + 1) % 3 : 1;
}
function bx(n, e) {
  let t = n.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), i = Bm(e), s = n.state.selection;
  return {
    update(o) {
      o.docChanged && (t.pos = o.changes.mapPos(t.pos), s = s.map(o.changes));
    },
    get(o, r, l) {
      let a = n.posAndSideAtCoords({ x: o.clientX, y: o.clientY }, !1), u, c = qf(n, a.pos, a.assoc, i);
      if (t.pos != a.pos && !r) {
        let h = qf(n, t.pos, t.assoc, i), f = Math.min(h.from, c.from), d = Math.max(h.to, c.to);
        c = f < c.from ? te.range(f, d, c.assoc) : te.range(d, f, c.assoc);
      }
      return r ? s.replaceRange(s.main.extend(c.from, c.to, c.assoc)) : l && i == 1 && s.ranges.length > 1 && (u = wx(s, a.pos)) ? u : l ? s.addRange(c) : te.create([c]);
    }
  };
}
function wx(n, e) {
  for (let t = 0; t < n.ranges.length; t++) {
    let { from: i, to: s } = n.ranges[t];
    if (i <= e && s >= e)
      return te.create(n.ranges.slice(0, t).concat(n.ranges.slice(t + 1)), n.mainIndex == t ? 0 : n.mainIndex - (n.mainIndex > t ? 1 : 0));
  }
  return null;
}
Kn.dragstart = (n, e) => {
  let { selection: { main: t } } = n.state;
  if (e.target.draggable) {
    let s = n.docView.tile.nearest(e.target);
    if (s && s.isWidget()) {
      let o = s.posAtStart, r = o + s.length;
      (o >= t.to || r <= t.from) && (t = te.undirectionalRange(o, r));
    }
  }
  let { inputState: i } = n;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", ba(n.state, ih, n.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
Kn.dragend = (n) => (n.inputState.draggedContent = null, !1);
function Zf(n, e, t, i) {
  if (t = ba(n.state, nh, t), !t)
    return;
  let s = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: o } = n.inputState, r = i && o && px(n, e) ? { from: o.from, to: o.to } : null, l = { from: s, insert: t }, a = n.state.changes(r ? [r, l] : l);
  n.focus(), n.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: r ? "move.drop" : "input.drop"
  }), n.inputState.draggedContent = null;
}
Kn.drop = (n, e) => {
  if (!e.dataTransfer)
    return !1;
  if (n.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let i = Array(t.length), s = 0, o = () => {
      ++s == t.length && Zf(n, e, i.filter((r) => r != null).join(n.state.lineBreak), !1);
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
      return Zf(n, e, i, !0), !0;
  }
  return !1;
};
Kn.paste = (n, e) => {
  if (n.state.readOnly)
    return !0;
  n.observer.flush();
  let t = Em ? null : e.clipboardData;
  return t ? (Im(n, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (vx(n), !1);
};
function xx(n, e) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function kx(n) {
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
  return { text: ba(n, ih, e.join(n.lineBreak)), ranges: t, linewise: i };
}
let lc = null;
Kn.copy = Kn.cut = (n, e) => {
  if (!Go(n.contentDOM, n.observer.selectionRange))
    return !1;
  let { text: t, ranges: i, linewise: s } = kx(n.state);
  if (!t && !s)
    return !1;
  lc = s ? t : null, e.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let o = Em ? null : e.clipboardData;
  return o ? (o.clearData(), o.setData("text/plain", t), !0) : (xx(n, t), !1);
};
const Rm = /* @__PURE__ */ vo.define();
function Pm(n, e) {
  let t = [];
  for (let i of n.facet(gm)) {
    let s = i(n, e);
    s && t.push(s);
  }
  return t.length ? n.update({ effects: t, annotations: Rm.of(!0) }) : null;
}
function _m(n) {
  setTimeout(() => {
    let e = n.hasFocus;
    if (e != n.inputState.notifiedFocused) {
      let t = Pm(n.state, e);
      t ? n.dispatch(t) : n.update([]);
    }
  }, 10);
}
un.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), _m(n);
};
un.blur = (n) => {
  n.observer.clearSelectionRange(), _m(n);
};
un.compositionstart = un.compositionupdate = (n) => {
  if (!n.observer.editContext && (n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0)) {
    let { main: e } = n.state.selection;
    !e.empty && n.lineBlockAt(e.from).from != n.lineBlockAt(e.to).from && n.dispatch({
      changes: n.state.selection.ranges.filter((t) => !t.empty).map((t) => ({ from: t.from, to: t.to })),
      userEvent: "input"
    }), n.inputState.composing = 0;
  }
};
un.compositionend = (n) => {
  n.observer.editContext || (n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionPendingKey = !0, n.inputState.compositionPendingChange = n.observer.pendingRecords().length > 0, n.inputState.compositionFirstChange = null, ge.chrome && ge.android ? n.observer.flushSoon() : n.inputState.compositionPendingChange ? Promise.resolve().then(() => n.observer.flush()) : setTimeout(() => {
    n.inputState.composing < 0 && n.docView.hasComposition && n.update([]);
  }, 50));
};
un.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
Kn.beforeinput = (n, e) => {
  var t, i;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (n.inputState.insertingText = e.data, n.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && n.observer.editContext) {
    let o = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), r = e.getTargetRanges();
    if (o && r.length) {
      let l = r[0], a = n.posAtDOM(l.startContainer, l.startOffset), u = n.posAtDOM(l.endContainer, l.endOffset);
      return lh(n, { from: a, to: u, insert: n.state.toText(o) }, null), !0;
    }
  }
  let s;
  if (ge.chrome && ge.android && (s = Om.find((o) => o.inputType == e.inputType)) && (n.observer.delayAndroidKey(s.key, s.keyCode), s.key == "Backspace" || s.key == "Delete")) {
    let o = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > o + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
  return ge.ios && e.inputType == "deleteContentForward" && n.observer.flushSoon(), ge.safari && e.inputType == "insertText" && n.inputState.composing >= 0 && setTimeout(() => un.compositionend(n, e), 20), !1;
};
const Qf = /* @__PURE__ */ new Set();
function Sx(n) {
  Qf.has(n) || (Qf.add(n), n.addEventListener("copy", () => {
  }), n.addEventListener("cut", () => {
  }));
}
const ed = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let lo = !1;
function td() {
  lo = !1;
}
class Cx {
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
    return ed.indexOf(e) > -1 != this.lineWrapping;
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
    let l = ed.indexOf(e) > -1, a = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
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
class Mx {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class _n {
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
    return typeof this._content == "number" ? qt.Text : Array.isArray(this._content) ? this._content : this._content.type;
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
    return this._content instanceof Os ? this._content.widget : null;
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
    return new _n(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var kt = /* @__PURE__ */ (function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
})(kt || (kt = {}));
const yl = 1e-3;
class an {
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
    this.height != e && (Math.abs(this.height - e) > yl && (lo = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, i) {
    return an.of(i);
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
      let { fromA: a, toA: u, fromB: c, toB: h } = s[l], f = o.lineAt(a, kt.ByPosNoHeight, i.setDoc(t), 0, 0), d = f.to >= u ? f : o.lineAt(u, kt.ByPosNoHeight, i, 0, 0);
      for (h += d.to - u, u = d.to; l > 0 && f.from <= s[l - 1].toA; )
        a = s[l - 1].fromA, c = s[l - 1].fromB, l--, a < f.from && (f = o.lineAt(a, kt.ByPosNoHeight, i, 0, 0));
      c += f.from - a, a = f.from;
      let p = ah.build(i.setDoc(r), e, c, h);
      o = Hl(o, o.replace(a, u, p));
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
    return e[t - 1] == null ? (r = !0, t--) : e[t] == null && (r = !0, i++), new Tx(an.of(e.slice(0, t)), r, an.of(e.slice(i)));
  }
}
function Hl(n, e) {
  return n == e ? n : (n.constructor != e.constructor && (lo = !0), e);
}
an.prototype.size = 1;
const Ax = /* @__PURE__ */ Mt.replace({});
class Nm extends an {
  constructor(e, t, i) {
    super(e, t), this.deco = i, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new _n(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, i, s) {
    return this.spaceAbove && e < i + this.spaceAbove ? new _n(s, 0, i, this.spaceAbove, Ax) : this.mainBlock(i, s);
  }
  lineAt(e, t, i, s, o) {
    let r = this.mainBlock(s, o);
    return this.spaceAbove ? this.blockAt(0, i, s, o).join(r) : r;
  }
  forEachLine(e, t, i, s, o, r) {
    e <= o + this.length && t >= o && r(this.lineAt(0, kt.ByPos, i, s, o));
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
class gn extends Nm {
  constructor(e, t, i) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = i;
  }
  mainBlock(e, t) {
    return new _n(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, i) {
    let s = i[0];
    return i.length == 1 && (s instanceof gn || s instanceof Kt && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof Kt ? s = new gn(s.length, this.height, this.spaceAbove) : s.height = this.height, this.outdated || (s.outdated = !1), s) : an.of(i);
  }
  updateHeight(e, t = 0, i = !1, s) {
    return s && s.from <= t && s.more ? this.setMeasuredHeight(s) : (i || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class Kt extends an {
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
      return new _n(c.from, c.length, f, h, 0);
    } else {
      let u = Math.max(0, Math.min(r - o, Math.floor((e - i) / l))), { from: c, length: h } = t.doc.line(o + u);
      return new _n(c, h, i + l * u, l, 0);
    }
  }
  lineAt(e, t, i, s, o) {
    if (t == kt.ByHeight)
      return this.blockAt(e, i, s, o);
    if (t == kt.ByPosNoHeight) {
      let { from: d, to: p } = i.doc.lineAt(e);
      return new _n(d, p - d, 0, 0, 0);
    }
    let { firstLine: r, perLine: l, perChar: a } = this.heightMetrics(i, o), u = i.doc.lineAt(e), c = l + u.length * a, h = u.number - r, f = s + l * h + a * (u.from - o - h);
    return new _n(u.from, u.length, Math.max(s, Math.min(f, s + this.height - c)), c, 0);
  }
  forEachLine(e, t, i, s, o, r) {
    e = Math.max(e, o), t = Math.min(t, o + this.length);
    let { firstLine: l, perLine: a, perChar: u } = this.heightMetrics(i, o);
    for (let c = e, h = s; c <= t; ) {
      let f = i.doc.lineAt(c);
      if (c == e) {
        let p = f.number - l;
        h += a * p + u * (e - o - p);
      }
      let d = a + u * f.length;
      r(new _n(f.from, f.length, h, d, 0)), h += d, c = f.to + 1;
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
    return an.of(i);
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
        h < 0 && (f = -h, h = s.heights[s.index++]), a == -1 ? a = h : Math.abs(h - a) >= yl && (a = -2);
        let d = new gn(c, h, f);
        d.outdated = !1, r.push(d), l += c + 1;
      }
      l <= o && r.push(null, new Kt(o - l).updateHeight(e, l));
      let u = an.of(r);
      return (a < 0 || Math.abs(u.height - this.height) >= yl || Math.abs(a - this.heightMetrics(e, t).perLine) >= yl) && (lo = !0), Hl(this, u);
    } else (i || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Tx extends an {
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
    let r = s + this.left.height, l = o + this.left.length + this.break, a = t == kt.ByHeight ? e < r : e < l, u = a ? this.left.lineAt(e, t, i, s, o) : this.right.lineAt(e, t, i, r, l);
    if (this.break || (a ? u.to < l : u.from > l))
      return u;
    let c = t == kt.ByPosNoHeight ? kt.ByPosNoHeight : kt.ByPos;
    return a ? u.join(this.right.lineAt(l, c, i, r, l)) : this.left.lineAt(l, c, i, s, o).join(u);
  }
  forEachLine(e, t, i, s, o, r) {
    let l = s + this.left.height, a = o + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, i, s, o, r), t >= a && this.right.forEachLine(e, t, i, l, a, r);
    else {
      let u = this.lineAt(a, kt.ByPos, i, s, o);
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
    if (e > 0 && nd(o, r - 1), t < this.length) {
      let l = o.length;
      this.decomposeRight(t, o), nd(o, l);
    }
    return an.of(o);
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
    return e.size > 2 * t.size || t.size > 2 * e.size ? an.of(this.break ? [e, null, t] : [e, t]) : (this.left = Hl(this.left, e), this.right = Hl(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, s) {
    let { left: o, right: r } = this, l = t + o.length + this.break, a = null;
    return s && s.from <= t + o.length && s.more ? a = o = o.updateHeight(e, t, i, s) : o.updateHeight(e, t, i), s && s.from <= l + r.length && s.more ? a = r = r.updateHeight(e, l, i, s) : r.updateHeight(e, l, i), a ? this.balanced(o, r) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function nd(n, e) {
  let t, i;
  n[e] == null && (t = n[e - 1]) instanceof Kt && (i = n[e + 1]) instanceof Kt && n.splice(e - 1, 3, new Kt(t.length + 1 + i.length));
}
const $x = 5;
class ah {
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
      i.block ? this.addBlock(new Nm(r, s, i)) : (r || o || s >= $x) && this.addLineDeco(s, o, r);
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
    let o = new ah(i, e);
    return Ye.spans(t, i, s, o, 0), o.finish(i);
  }
}
function Dx(n, e, t) {
  let i = new Ox();
  return Ye.compare(n, e, t, i, 0), i.changes;
}
class Ox {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, s) {
    (e < t || i && i.heightRelevant || s && s.heightRelevant) && Js(e, t, this.changes, 5);
  }
}
function Lx(n, e) {
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
function Ex(n) {
  let e = n.getBoundingClientRect(), t = n.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function Ix(n, e) {
  let t = n.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class ou {
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
    return Mt.replace({
      widget: new Bx(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class Bx extends Sr {
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
class id {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = sd, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Ct.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let i = t.facet(sh).some((s) => typeof s != "function" && s.class == "cm-lineWrapping");
    this.heightOracle = new Cx(i), this.stateDeco = od(t), this.heightMap = an.empty().applyChanges(this.stateDeco, nt.empty, this.heightOracle.setDoc(t.doc), [new Mn(0, 0, 0, t.doc.length)]);
    for (let s = 0; s < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); s++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = Mt.set(this.lineGaps.map((s) => s.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let s = i ? t.head : t.anchor;
      if (!e.some(({ from: o, to: r }) => s >= o && s <= r)) {
        let { from: o, to: r } = this.lineBlockAt(s);
        e.push(new jr(o, r));
      }
    }
    return this.viewports = e.sort((i, s) => i.from - s.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? sd : new uh(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Ro(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = od(this.state);
    let s = e.changedRanges, o = Mn.extendWithRanges(s, Dx(i, this.stateDeco, e ? e.changes : Ft.empty(this.state.doc.length))), r = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    td(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), o), (this.heightMap.height != r || lo) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = r);
    let a = o.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < a.from || t.range.head > a.to) || !this.viewportIsAppropriate(a)) && (a = this.getViewport(0, t));
    let u = a.from != this.viewport.from || a.to != this.viewport.to;
    this.viewport = a, e.flags |= this.updateForViewport(), (u || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(vm) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, i = window.getComputedStyle(t), s = this.heightOracle, o = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? Ct.RTL : Ct.LTR;
    let r = this.heightOracle.mustRefreshForWrapping(o) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), a = r || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let u = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: I, scaleY: z } = Jg(t, l);
      (I > 5e-3 && Math.abs(this.scaleX - I) > 5e-3 || z > 5e-3 && Math.abs(this.scaleY - z) > 5e-3) && (this.scaleX = I, this.scaleY = z, u |= 16, r = a = !0);
    }
    let h = (parseInt(i.paddingTop) || 0) * this.scaleY, f = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != h || this.paddingBottom != f) && (this.paddingTop = h, this.paddingBottom = f, u |= 18), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (a = !0), this.editorWidth = e.scrollDOM.clientWidth, u |= 16);
    let d = Zg(this.view.contentDOM, !1).y;
    d != this.scrollParent && (this.scrollParent = d, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let p = this.getScrollOffset();
    this.scrollOffset != p && (this.scrollAnchorHeight = -1, this.scrollOffset = p), this.scrolledToBottom = nm(this.scrollParent || e.win);
    let v = (this.printing ? Ix : Lx)(t, this.paddingTop), m = v.top - this.pixelViewport.top, b = v.bottom - this.pixelViewport.bottom;
    this.pixelViewport = v;
    let O = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (O != this.inView && (this.inView = O, O && (a = !0)), !this.inView && !this.scrollTarget && !Ex(e.dom))
      return 0;
    let L = l.width;
    if ((this.contentDOMWidth != L || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, u |= 16), a) {
      let I = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights(I) && (r = !0), r || s.lineWrapping && Math.abs(L - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: z, charWidth: R, textHeight: Y } = e.docView.measureTextSize();
        r = z > 0 && s.refresh(o, z, R, Y, Math.max(5, L / R), I), r && (e.docView.minWidth = 0, u |= 16);
      }
      m > 0 && b > 0 ? c = Math.max(m, b) : m < 0 && b < 0 && (c = Math.min(m, b)), td();
      for (let z of this.viewports) {
        let R = z.from == this.viewport.from ? I : e.docView.measureVisibleLineHeights(z);
        this.heightMap = (r ? an.empty().applyChanges(this.stateDeco, nt.empty, this.heightOracle, [new Mn(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(s, 0, r, new Mx(z.from, R));
      }
      lo && (u |= 2);
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
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, o = this.heightOracle, { visibleTop: r, visibleBottom: l } = this, a = new jr(s.lineAt(r - i * 1e3, kt.ByHeight, o, 0, 0).from, s.lineAt(l + (1 - i) * 1e3, kt.ByHeight, o, 0, 0).to);
    if (t) {
      let { head: u } = t.range;
      if (u < a.from || u > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), h = s.lineAt(u, kt.ByPos, o, 0, 0), f;
        t.y == "center" ? f = (h.top + h.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && u < a.from ? f = h.top : f = h.bottom - c, a = new jr(s.lineAt(f - 1e3 / 2, kt.ByHeight, o, 0, 0).from, s.lineAt(f + c + 1e3 / 2, kt.ByHeight, o, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new jr(this.heightMap.lineAt(i, kt.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(s, kt.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, kt.ByPos, this.heightOracle, 0, 0), { bottom: o } = this.heightMap.lineAt(t, kt.ByPos, this.heightOracle, 0, 0), { visibleTop: r, visibleBottom: l } = this;
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
      t.touchesRange(s.from, s.to) || i.push(new ou(t.mapPos(s.from), t.mapPos(s.to), s.size, s.displaySize));
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
    if (this.defaultTextDirection != Ct.LTR && !i)
      return [];
    let l = [], a = (c, h, f, d) => {
      if (h - c < o)
        return;
      let p = this.state.selection.main, v = [p.from];
      p.empty || v.push(p.to);
      for (let b of v)
        if (b > c && b < h) {
          a(c, b - 10, f, d), a(b + 10, h, f, d);
          return;
        }
      let m = Px(e, (b) => b.from >= f.from && b.to <= f.to && Math.abs(b.from - c) < o && Math.abs(b.to - h) < o && !v.some((O) => b.from < O && b.to > O));
      if (!m) {
        if (h < f.to && t && i && t.visibleRanges.some((L) => L.from <= h && L.to >= h)) {
          let L = t.moveToLineBoundary(te.cursor(h), !1, !0).head;
          L > c && (h = L);
        }
        let b = this.gapSize(f, c, h, d), O = i || b < 2e6 ? b : 2e6;
        m = new ou(c, h, b, O);
      }
      l.push(m);
    }, u = (c) => {
      if (c.length < r || c.type != qt.Text)
        return;
      let h = Rx(c.from, c.to, this.stateDeco);
      if (h.total < r)
        return;
      let f = this.scrollTarget ? this.scrollTarget.range.head : null, d, p;
      if (i) {
        let v = s / this.heightOracle.lineLength * this.heightOracle.lineHeight, m, b;
        if (f != null) {
          let O = qr(h, f), L = ((this.visibleBottom - this.visibleTop) / 2 + v) / c.height;
          m = O - L, b = O + L;
        } else
          m = (this.visibleTop - c.top - v) / c.height, b = (this.visibleBottom - c.top + v) / c.height;
        d = Gr(h, m), p = Gr(h, b);
      } else {
        let v = h.total * this.heightOracle.charWidth, m = s * this.heightOracle.charWidth, b = 0;
        if (v > 2e6)
          for (let z of e)
            z.from >= c.from && z.from < c.to && z.size != z.displaySize && z.from * this.heightOracle.charWidth + b < this.pixelViewport.left && (b = z.size - z.displaySize);
        let O = this.pixelViewport.left + b, L = this.pixelViewport.right + b, E, I;
        if (f != null) {
          let z = qr(h, f), R = ((L - O) / 2 + m) / v;
          E = z - R, I = z + R;
        } else
          E = (O - m) / v, I = (L + m) / v;
        d = Gr(h, E), p = Gr(h, I);
      }
      d > c.from && a(c.from, d, c, h), p < c.to && a(p, c.to, c, h);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(u) : u(c);
    return l;
  }
  gapSize(e, t, i, s) {
    let o = qr(s, i) - qr(s, t);
    return this.heightOracle.lineWrapping ? e.height * o : s.total * this.heightOracle.charWidth * o;
  }
  updateLineGaps(e) {
    ou.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = Mt.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
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
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Ro(this.heightMap.lineAt(e, kt.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Ro(this.heightMap.lineAt(this.scaler.fromDOM(e), kt.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Ro(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class jr {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Rx(n, e, t) {
  let i = [], s = n, o = 0;
  return Ye.spans(t, n, e, {
    span() {
    },
    point(r, l) {
      r > s && (i.push({ from: s, to: r }), o += r - s), s = l;
    }
  }, 20), s < e && (i.push({ from: s, to: e }), o += e - s), { total: o, ranges: i };
}
function Gr({ total: n, ranges: e }, t) {
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
function qr(n, e) {
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
function Px(n, e) {
  for (let t of n)
    if (e(t))
      return t;
}
const sd = {
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
function od(n) {
  let e = n.facet(ma).filter((i) => typeof i != "function"), t = n.facet(oh).filter((i) => typeof i != "function");
  return t.length && e.push(Ye.join(t)), e;
}
class uh {
  constructor(e, t, i) {
    let s = 0, o = 0, r = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let u = t.lineAt(l, kt.ByPos, e, 0, 0).top, c = t.lineAt(a, kt.ByPos, e, 0, 0).bottom;
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
    return e instanceof uh ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to) : !1;
  }
}
function Ro(n, e) {
  if (e.scale == 1)
    return n;
  let t = e.toDOM(n.top), i = e.toDOM(n.bottom);
  return new _n(n.from, n.length, t, i - t, Array.isArray(n._content) ? n._content.map((s) => Ro(s, e)) : n._content);
}
const Yr = /* @__PURE__ */ xe.define({ combine: (n) => n.join(" ") }), ac = /* @__PURE__ */ xe.define({ combine: (n) => n.indexOf(!0) > -1 }), uc = /* @__PURE__ */ es.newName(), Vm = /* @__PURE__ */ es.newName(), Hm = /* @__PURE__ */ es.newName(), Fm = { "&light": "." + Vm, "&dark": "." + Hm };
function cc(n, e, t) {
  return new es(e, {
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
const _x = /* @__PURE__ */ cc("." + uc, {
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
}, Fm), Nx = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, ru = ge.ie && ge.ie_version <= 11;
class Vx {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new pw(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let i of t)
        this.queue.push(i);
      (ge.ie && ge.ie_version <= 11 || ge.ios && e.composing) && t.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && ge.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(ge.chrome && ge.chrome_version < 126) && (this.editContext = new Fx(e), e.state.facet(ki) && (e.contentDOM.editContext = this.editContext.editContext)), ru && (this.onCharData = (t) => {
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
    if (i.state.facet(ki) ? i.root.activeElement != this.dom : !Go(this.dom, s))
      return;
    let o = s.anchorNode && i.docView.tile.nearest(s.anchorNode);
    if (o && o.isWidget() && o.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (ge.ie && ge.ie_version <= 11 || ge.android && ge.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    s.focusNode && qo(s.focusNode, s.focusOffset, s.anchorNode, s.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = fr(e.root);
    if (!t)
      return !1;
    let i = ge.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Hx(this.view, t) || t;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let s = Go(this.dom, i);
    return s && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && mw(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), s && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, Nx), ru && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), ru && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
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
        o && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = o.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && o.force && Zs(this.dom, o.key, o.keyCode));
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
    let { from: e, to: t, typeOver: i } = this.processRecords(), s = this.selectionChanged && Go(this.dom, this.selectionRange);
    if (e < 0 && !s)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = new ix(this.view, e, t, i);
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
    let i = this.view.state, s = $m(this.view, t);
    return this.view.state == i && (t.domChanged || t.newSel && !Vl(this.view.state.selection, t.newSel.main)) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let i = rd(t, e.previousSibling || e.target.previousSibling, -1), s = rd(t, e.nextSibling || e.target.nextSibling, 1);
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
    this.editContext && (this.editContext.update(e), e.startState.facet(ki) != e.state.facet(ki) && (e.view.contentDOM.editContext = e.state.facet(ki) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function rd(n, e, t) {
  for (; e; ) {
    let i = Ot.get(e);
    if (i && i.parent == n)
      return i;
    let s = e.parentNode;
    e = s != n.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function ld(n, e) {
  let t = e.startContainer, i = e.startOffset, s = e.endContainer, o = e.endOffset, r = n.docView.domAtPos(n.state.selection.main.anchor, 1);
  return qo(r.node, r.offset, s, o) && ([t, i, s, o] = [s, o, t, i]), { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: o };
}
function Hx(n, e) {
  if (e.getComposedRanges) {
    let s = e.getComposedRanges(n.root)[0];
    if (s)
      return ld(n, s);
  }
  let t = null;
  function i(s) {
    s.preventDefault(), s.stopImmediatePropagation(), t = s.getTargetRanges()[0];
  }
  return n.contentDOM.addEventListener("beforeinput", i, !0), n.dom.ownerDocument.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", i, !0), t ? ld(n, t) : null;
}
class Fx {
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
      let c = Dm(e.state.sliceDoc(l, a), i.text, (u ? s.from : s.to) - l, u ? "end" : null);
      if (!c) {
        let f = te.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd));
        Vl(f, s) || e.dispatch({ selection: f, userEvent: "select" });
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
        lh(e, h, te.single(this.toEditorPos(i.selectionStart, f), this.toEditorPos(i.selectionEnd, f)));
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
            s.push(Mt.mark({ attributes: { style: c } }).range(a, u));
          }
        }
      }
      e.dispatch({ effects: bm.of(Mt.set(s)) });
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
      let s = fr(i.root);
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
    this.dispatchTransactions = e.dispatchTransactions || i && ((s) => s.forEach((o) => i(o, this))) || ((s) => this.update(s)), this.dispatch = this.dispatch.bind(this), this._root = e.root || gw(e.parent) || document, this.viewState = new id(this, e.state || rt.create(e)), e.scrollTo && e.scrollTo.is(Wr) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(zs).map((s) => new eu(s));
    for (let s of this.plugins)
      s.update(this);
    this.observer = new Vx(this), this.inputState = new lx(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Kf(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof en ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
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
    e.some((f) => f.annotation(Rm)) ? (this.inputState.notifiedFocused = r, l = 1) : r != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = r, a = Pm(o, r), a || (l = 1));
    let u = this.observer.delayedAndroidKey, c = null;
    if (u ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(o.doc) || !this.state.selection.eq(o.selection)) && (c = null)) : this.observer.clear(), o.facet(rt.phrases) != this.state.facet(rt.phrases))
      return this.setState(o);
    s = Pl.create(this, o, e), s.flags |= l;
    let h = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let f of e) {
        if (h && (h = h.map(f.changes)), f.scrollIntoView) {
          let { main: d } = f.state.selection, { x: p, y: v } = this.state.facet(De.cursorScrollMargin);
          h = new Qs(d.empty ? d : te.cursor(d.head, d.head > d.anchor ? -1 : 1), "nearest", "nearest", v, p);
        }
        for (let d of f.effects)
          d.is(Wr) && (h = d.value.clip(this.state));
      }
      this.viewState.update(s, h), this.bidiCache = Fl.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(Bo) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((f) => f.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(Yr) != s.state.facet(Yr) && (this.viewState.mustMeasureContent = !0), (t || i || h || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !s.empty)
      for (let f of this.state.facet(ic))
        try {
          f(s);
        } catch (d) {
          Vn(this.state, d, "update listener");
        }
    (a || c) && Promise.resolve().then(() => {
      a && this.state == a.startState && this.dispatch(a), c && !$m(this, c) && u.force && Zs(this.contentDOM, u.key, u.keyCode);
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
      this.viewState = new id(this, e), this.plugins = e.facet(zs).map((i) => new eu(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new Kf(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(zs), i = e.state.facet(zs);
    if (t != i) {
      let s = [];
      for (let o of i) {
        let r = t.indexOf(o);
        if (r < 0)
          s.push(new eu(o));
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
          Vn(this.state, i, "doc view update listener");
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
          if (nm(i || this.win))
            o = -1, r = this.viewState.heightMap.height / this.viewState.scaleY;
          else {
            let p = this.viewState.scrollAnchorAt(s);
            o = p.from, r = p.top;
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
        let h = c.map((p) => {
          try {
            return p.read(this);
          } catch (v) {
            return Vn(this.state, v), ad;
          }
        }), f = Pl.create(this, this.state, []), d = !1;
        f.flags |= u, t ? t.flags |= u : t = f, this.updateState = 2, f.empty || (this.updatePlugins(f), this.inputState.update(f), this.updateAttrs(), d = this.docView.update(f), d && this.docViewUpdate());
        for (let p = 0; p < c.length; p++)
          if (h[p] != ad)
            try {
              let v = c[p];
              v.write && v.write(h[p], this);
            } catch (v) {
              Vn(this.state, v);
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
      for (let a of this.state.facet(ic))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return uc + " " + (this.state.facet(ac) ? Hm : Vm) + " " + this.state.facet(Yr);
  }
  updateAttrs() {
    let e = ud(this, wm, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(ki) ? "true" : "false",
      class: "cm-content",
      style: `${ge.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), ud(this, sh, t);
    let i = this.observer.ignore(() => {
      let s = Nf(this.contentDOM, this.contentAttrs, t), o = Nf(this.dom, this.editorAttrs, e);
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
    this.styleModules = this.state.facet(Bo);
    let e = this.state.facet(De.cspNonce);
    es.mount(this.root, this.styleModules.concat(_x).reverse(), e ? { nonce: e } : void 0);
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
    return su(this, e, Uf(this, e, t, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return su(this, e, Uf(this, e, t, (i) => Jw(this, e.head, i)));
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
    return Xw(this, e, t, i);
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
    return su(this, e, Zw(this, e, t, i));
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
    let i = rc(this, e, t);
    return i && i.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), rc(this, e, t);
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
    let i = this.state.doc.lineAt(e), s = this.bidiSpans(i), o = s[hi.find(s, e - i.from, -1, t)];
    return i.length && (e == i.from && t < 0 || e == i.to && t > 0) && o.dir != this.textDirectionAt(i.from) && (e == i.to ? (e = i.from + o.from, t = 1) : (e = i.from + o.to, t = -1)), this.docView.coordsAt(e, t, o.dir == Ct.RTL);
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
    return !this.state.facet(mm) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
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
    if (e.length > zx)
      return am(e.length);
    let t = this.textDirectionAt(e.from), i;
    for (let o of this.bidiCache)
      if (o.from == e.from && o.dir == t && (o.fresh || lm(o.isolates, i = Ff(this, e))))
        return o.order;
    i || (i = Ff(this, e));
    let s = Sw(e.text, t, i);
    return this.bidiCache.push(new Fl(e.from, e.to, t, i, !0, s)), s;
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
      tm(this.contentDOM), this.docView.updateSelection();
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
    return Wr.of(new Qs(typeof e == "number" ? te.cursor(e) : e, (i = t.y) !== null && i !== void 0 ? i : "nearest", (s = t.x) !== null && s !== void 0 ? s : "nearest", (o = t.yMargin) !== null && o !== void 0 ? o : 5, (r = t.xMargin) !== null && r !== void 0 ? r : 5));
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
    return Wr.of(new Qs(te.cursor(i.from), "start", "start", i.top - e, t, !0));
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
    let i = es.newName(), s = [Yr.of(i), Bo.of(cc(`.${i}`, e))];
    return t && t.dark && s.push(ac.of(!0)), s;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return ha.lowest(Bo.of(cc("." + uc, e, Fm)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), s = i && Ot.get(i) || Ot.get(e);
    return ((t = s?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
De.styleModule = Bo;
De.inputHandler = pm;
De.clipboardInputFilter = nh;
De.clipboardOutputFilter = ih;
De.scrollHandler = ym;
De.focusChangeEffect = gm;
De.perLineTextDirection = mm;
De.exceptionSink = dm;
De.updateListener = ic;
De.editable = ki;
De.mouseSelectionStyle = fm;
De.dragMovesSelection = hm;
De.clickAddsSelectionRange = cm;
De.decorations = ma;
De.blockWrappers = xm;
De.outerDecorations = oh;
De.atomicRanges = Ar;
De.bidiIsolatedRanges = km;
De.cursorScrollMargin = /* @__PURE__ */ xe.define({
  combine: (n) => {
    let e = 5, t = 5;
    for (let i of n)
      typeof i == "number" ? e = t = i : { x: e, y: t } = i;
    return { x: e, y: t };
  }
});
De.scrollMargins = Sm;
De.darkTheme = ac;
De.cspNonce = /* @__PURE__ */ xe.define({ combine: (n) => n.length ? n[0] : "" });
De.contentAttributes = sh;
De.editorAttributes = wm;
De.lineWrapping = /* @__PURE__ */ De.contentAttributes.of({ class: "cm-lineWrapping" });
De.announce = /* @__PURE__ */ St.define();
const zx = 4096, ad = {};
class Fl {
  constructor(e, t, i, s, o, r) {
    this.from = e, this.to = t, this.dir = i, this.isolates = s, this.fresh = o, this.order = r;
  }
  static update(e, t) {
    if (t.empty && !e.some((o) => o.fresh))
      return e;
    let i = [], s = e.length ? e[e.length - 1].dir : Ct.LTR;
    for (let o = Math.max(0, e.length - 10); o < e.length; o++) {
      let r = e[o];
      r.dir == s && !t.touchesRange(r.from, r.to) && i.push(new Fl(t.mapPos(r.from, 1), t.mapPos(r.to, -1), r.dir, r.isolates, !1, r.order));
    }
    return i;
  }
}
function ud(n, e, t) {
  for (let i = n.state.facet(e), s = i.length - 1; s >= 0; s--) {
    let o = i[s], r = typeof o == "function" ? o(n) : o;
    r && Qc(r, t);
  }
  return t;
}
const Wx = ge.mac ? "mac" : ge.windows ? "win" : ge.linux ? "linux" : "key";
function Kx(n, e) {
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
function Xr(n, e, t) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t !== !1 && e.shiftKey && (n = "Shift-" + n), n;
}
const Ux = /* @__PURE__ */ ha.default(/* @__PURE__ */ De.domEventHandlers({
  keydown(n, e) {
    return Yx(jx(e.state), n, e, "editor");
  }
})), zm = /* @__PURE__ */ xe.define({ enables: Ux }), cd = /* @__PURE__ */ new WeakMap();
function jx(n) {
  let e = n.facet(zm), t = cd.get(e);
  return t || cd.set(e, t = qx(e.reduce((i, s) => i.concat(s), []))), t;
}
let Ki = null;
const Gx = 4e3;
function qx(n, e = Wx) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), s = (r, l) => {
    let a = i[r];
    if (a == null)
      i[r] = l;
    else if (a != l)
      throw new Error("Key binding " + r + " is used both as a regular binding and as a multi-stroke prefix");
  }, o = (r, l, a, u, c) => {
    var h, f;
    let d = t[r] || (t[r] = /* @__PURE__ */ Object.create(null)), p = l.split(/ (?!$)/).map((b) => Kx(b, e));
    for (let b = 1; b < p.length; b++) {
      let O = p.slice(0, b).join(" ");
      s(O, !0), d[O] || (d[O] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(L) => {
          let E = Ki = { view: L, prefix: O, scope: r };
          return setTimeout(() => {
            Ki == E && (Ki = null);
          }, Gx), !0;
        }]
      });
    }
    let v = p.join(" ");
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
          c[f].run.push((d) => h(d, hc));
      }
    let a = r[e] || r.key;
    if (a)
      for (let u of l)
        o(u, a, r.run, r.preventDefault, r.stopPropagation), r.shift && o(u, "Shift-" + a, r.shift, r.preventDefault, r.stopPropagation);
  }
  return t;
}
let hc = null;
function Yx(n, e, t, i) {
  hc = e;
  let s = aw(e), o = K1(s, 0), r = U1(o) == s.length && s != " ", l = "", a = !1, u = !1, c = !1;
  Ki && Ki.view == t && Ki.scope == i && (l = Ki.prefix + " ", Lm.indexOf(e.keyCode) < 0 && (u = !0, Ki = null));
  let h = /* @__PURE__ */ new Set(), f = (m) => {
    if (m) {
      for (let b of m.run)
        if (!h.has(b) && (h.add(b), b(t)))
          return m.stopPropagation && (c = !0), !0;
      m.preventDefault && (m.stopPropagation && (c = !0), u = !0);
    }
    return !1;
  }, d = n[i], p, v;
  return d && (f(d[l + Xr(s, e, !r)]) ? a = !0 : r && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(ge.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(ge.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (p = ts[e.keyCode]) && p != s ? (f(d[l + Xr(p, e, !0)]) || e.shiftKey && (v = cr[e.keyCode]) != s && v != p && f(d[l + Xr(v, e, !1)])) && (a = !0) : r && e.shiftKey && f(d[l + Xr(s, e, !0)]) && (a = !0), !a && f(d._any) && (a = !0)), u && (a = !0), a && c && e.stopPropagation(), hc = null, a;
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
      let o = Wm(e);
      return [new As(t, s.left - o.left, s.top - o.top, null, s.bottom - s.top)];
    } else
      return Xx(e, t, i);
  }
}
function Wm(n) {
  let e = n.scrollDOM.getBoundingClientRect();
  return { left: (n.textDirection == Ct.LTR ? e.left : e.right - n.scrollDOM.clientWidth * n.scaleX) - n.scrollDOM.scrollLeft * n.scaleX, top: e.top - n.scrollDOM.scrollTop * n.scaleY };
}
function hd(n, e, t, i) {
  let s = n.coordsAtPos(e, t * 2);
  if (!s)
    return i;
  let o = n.dom.getBoundingClientRect(), r = (s.top + s.bottom) / 2, l = n.posAtCoords({ x: o.left + 1, y: r }), a = n.posAtCoords({ x: o.right - 1, y: r });
  return l == null || a == null ? i : { from: Math.max(i.from, Math.min(l, a)), to: Math.min(i.to, Math.max(l, a)) };
}
function Xx(n, e, t) {
  if (t.to <= n.viewport.from || t.from >= n.viewport.to)
    return [];
  let i = Math.max(t.from, n.viewport.from), s = Math.min(t.to, n.viewport.to), o = n.textDirection == Ct.LTR, r = n.contentDOM, l = r.getBoundingClientRect(), a = Wm(n), u = r.querySelector(".cm-line"), c = u && window.getComputedStyle(u), h = l.left + (c ? parseInt(c.paddingLeft) + Math.min(0, parseInt(c.textIndent)) : 0), f = l.right - (c ? parseInt(c.paddingRight) : 0), d = oc(n, i, 1), p = oc(n, s, -1), v = d.type == qt.Text ? d : null, m = p.type == qt.Text ? p : null;
  if (v && (n.lineWrapping || d.widgetLineBreaks) && (v = hd(n, i, 1, v)), m && (n.lineWrapping || p.widgetLineBreaks) && (m = hd(n, s, -1, m)), v && m && v.from == m.from && v.to == m.to)
    return O(L(t.from, t.to, v));
  {
    let I = v ? L(t.from, null, v) : E(d, !1), z = m ? L(null, t.to, m) : E(p, !0), R = [];
    return (v || d).to < (m || p).from - (v && m ? 1 : 0) || d.widgetLineBreaks > 1 && I.bottom + n.defaultLineHeight / 2 < z.top ? R.push(b(h, I.bottom, f, z.top)) : I.bottom < z.top && n.elementAtHeight((I.bottom + z.top) / 2).type == qt.Text && (I.bottom = z.top = (I.bottom + z.top) / 2), O(I).concat(R).concat(O(z));
  }
  function b(I, z, R, Y) {
    return new As(e, I - a.left, z - a.top, Math.max(0, R - I), Y - z);
  }
  function O({ top: I, bottom: z, horizontal: R }) {
    let Y = [];
    for (let K = 0; K < R.length; K += 2)
      Y.push(b(R[K], I, R[K + 1], z));
    return Y;
  }
  function L(I, z, R) {
    let Y = 1e9, K = -1e9, re = [];
    function j(ke, $e, ce, pe, He) {
      let Oe = n.coordsAtPos(ke, ke == R.to ? -2 : 2), Re = n.coordsAtPos(ce, ce == R.from ? 2 : -2);
      !Oe || !Re || (Y = Math.min(Oe.top, Re.top, Y), K = Math.max(Oe.bottom, Re.bottom, K), He == Ct.LTR ? re.push(o && $e ? h : Oe.left, o && pe ? f : Re.right) : re.push(!o && pe ? h : Re.left, !o && $e ? f : Oe.right));
    }
    let D = I ?? R.from, U = z ?? R.to;
    for (let ke of n.visibleRanges)
      if (ke.to > D && ke.from < U)
        for (let $e = Math.max(ke.from, D), ce = Math.min(ke.to, U); ; ) {
          let pe = n.state.doc.lineAt($e);
          for (let He of n.bidiSpans(pe)) {
            let Oe = He.from + pe.from, Re = He.to + pe.from;
            if (Oe >= ce)
              break;
            Re > $e && j(Math.max(Oe, $e), I == null && Oe <= D, Math.min(Re, ce), z == null && Re >= U, He.dir);
          }
          if ($e = pe.to + 1, $e >= ce)
            break;
        }
    return re.length == 0 && j(D, I == null, U, z == null, n.textDirection), { top: Y, bottom: K, horizontal: re };
  }
  function E(I, z) {
    let R = l.top + (z ? I.top : I.bottom);
    return { top: R, bottom: R, horizontal: [] };
  }
}
function Jx(n, e) {
  return n.constructor == e.constructor && n.eq(e);
}
class Zx {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(bl) != e.state.facet(bl) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, i = e.facet(bl);
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
    if (e.length != this.drawn.length || e.some((t, i) => !Jx(t, this.drawn[i]))) {
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
const bl = /* @__PURE__ */ xe.define();
function Km(n) {
  return [
    vn.define((e) => new Zx(e, n)),
    bl.of(n)
  ];
}
const ao = /* @__PURE__ */ xe.define({
  combine(n) {
    return da(n, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function Qx(n = {}) {
  return [
    ao.of(n),
    ek,
    tk,
    ik,
    vm.of(!0)
  ];
}
function Um(n) {
  return n.startState.facet(ao) != n.state.facet(ao);
}
const ek = /* @__PURE__ */ Km({
  above: !0,
  markers(n) {
    let { state: e } = n, t = e.facet(ao), i = [];
    for (let s of e.selection.ranges) {
      let o = s == e.selection.main;
      if (s.empty || t.drawRangeCursor && !(o && ge.ios && t.iosSelectionHandles)) {
        let r = o ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", l = s.empty ? s : te.cursor(s.head, s.assoc);
        for (let a of As.forRange(n, r, l))
          i.push(a);
      }
    }
    return i;
  },
  update(n, e) {
    n.transactions.some((i) => i.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = Um(n);
    return t && fd(n.state, e), n.docChanged || n.selectionSet || t;
  },
  mount(n, e) {
    fd(e.state, n);
  },
  class: "cm-cursorLayer"
});
function fd(n, e) {
  e.style.animationDuration = n.facet(ao).cursorBlinkRate + "ms";
}
const tk = /* @__PURE__ */ Km({
  above: !1,
  markers(n) {
    let e = [], { main: t, ranges: i } = n.state.selection;
    for (let s of i)
      if (!s.empty)
        for (let o of As.forRange(n, "cm-selectionBackground", s))
          e.push(o);
    if (ge.ios && !t.empty && n.state.facet(ao).iosSelectionHandles) {
      for (let s of As.forRange(n, "cm-selectionHandle cm-selectionHandle-start", te.cursor(t.from, 1)))
        e.push(s);
      for (let s of As.forRange(n, "cm-selectionHandle cm-selectionHandle-end", te.cursor(t.to, 1)))
        e.push(s);
    }
    return e;
  },
  update(n, e) {
    return n.docChanged || n.selectionSet || n.viewportChanged || Um(n);
  },
  class: "cm-selectionLayer"
}), nk = ge.gecko && ge.gecko_version == 153 ? "#ffffff01" : "transparent", ik = /* @__PURE__ */ ha.highest(/* @__PURE__ */ De.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: `${nk} !important` },
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
function sk() {
  return rk;
}
const ok = /* @__PURE__ */ Mt.line({ class: "cm-activeLine" }), rk = /* @__PURE__ */ vn.fromClass(class {
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
      s.from > e && (t.push(ok.range(s.from)), e = s.from);
    }
    return Mt.set(t);
  }
}, {
  decorations: (n) => n.decorations
}), Jr = "-10000px";
class jm {
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
function lk(n) {
  let e = n.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: e.clientHeight, right: e.clientWidth };
}
const lu = /* @__PURE__ */ xe.define({
  combine: (n) => {
    var e, t, i;
    return {
      position: ge.ios ? "absolute" : ((e = n.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = n.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((i = n.find((s) => s.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || lk
    };
  }
}), dd = /* @__PURE__ */ new WeakMap(), Gm = /* @__PURE__ */ vn.fromClass(class {
  constructor(n) {
    this.view = n, this.above = [], this.inView = !0, this.madeAbsolute = !1, this.lastTransaction = 0, this.measureTimeout = -1;
    let e = n.state.facet(lu);
    this.position = e.position, this.parent = e.parent, this.classes = n.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null, this.manager = new jm(n, ch, (t, i) => this.createTooltip(t, i), (t) => {
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
    let t = e || n.geometryChanged, i = n.state.facet(lu);
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
    return t.dom.style.position = this.position, t.dom.style.top = Jr, t.dom.style.left = "0px", this.container.insertBefore(t.dom, i), t.mount && t.mount(this.view), this.resizeObserver && this.resizeObserver.observe(t.dom), t;
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
    let i = this.view.scrollDOM.getBoundingClientRect(), s = rh(this.view);
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
      space: this.view.state.facet(lu).tooltipSpace(this.view),
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
        c.style.top = Jr;
        continue;
      }
      let d = a.arrow ? u.dom.querySelector(".cm-tooltip-arrow") : null, p = d ? 7 : 0, v = f.right - f.left, m = (e = dd.get(u)) !== null && e !== void 0 ? e : f.bottom - f.top, b = u.offset || uk, O = this.view.textDirection == Ct.LTR, L = f.width > i.right - i.left ? O ? i.left : i.right - f.width : O ? Math.max(i.left, Math.min(h.left - (d ? 14 : 0) + b.x, i.right - v)) : Math.min(Math.max(i.left, h.left - v + (d ? 14 : 0) - b.x), i.right - v), E = this.above[l];
      !a.strictSide && (E ? h.top - m - p - b.y < i.top : h.bottom + m + p + b.y > i.bottom) && E == i.bottom - h.bottom > h.top - i.top && (E = this.above[l] = !E);
      let I = (E ? h.top - i.top : i.bottom - h.bottom) - p;
      if (I < m && u.resize !== !1) {
        if (I < this.view.defaultLineHeight) {
          c.style.top = Jr;
          continue;
        }
        dd.set(u, m), c.style.height = (m = I) / o + "px";
      } else c.style.height && (c.style.height = "");
      let z = E ? h.top - m - p - b.y : h.bottom + p + b.y, R = L + v;
      if (u.overlap !== !0)
        for (let Y of r)
          Y.left < R && Y.right > L && Y.top < z + m && Y.bottom > z && (z = E ? Y.top - m - 2 - p : Y.bottom + p + 2);
      if (this.position == "absolute" ? (c.style.top = (z - n.parent.top) / o + "px", pd(c, (L - n.parent.left) / s)) : (c.style.top = z / o + "px", pd(c, L / s)), d) {
        let Y = h.left + (O ? b.x : -b.x) - (L + 14 - 7);
        d.style.left = Y / s + "px";
      }
      u.overlap !== !0 && r.push({ left: L, top: z, right: R, bottom: z + m }), c.classList.toggle("cm-tooltip-above", E), c.classList.toggle("cm-tooltip-below", !E), u.positioned && u.positioned(n.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let n of this.manager.tooltipViews)
        n.dom.style.top = Jr;
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function pd(n, e) {
  let t = parseInt(n.style.left, 10);
  (isNaN(t) || Math.abs(e - t) > 1) && (n.style.left = e + "px");
}
const ak = /* @__PURE__ */ De.baseTheme({
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
}), uk = { x: 0, y: 0 }, ch = /* @__PURE__ */ xe.define({
  enables: [Gm, ak]
}), zl = /* @__PURE__ */ xe.define({
  combine: (n) => n.reduce((e, t) => e.concat(t), [])
});
class wa {
  // Needs to be static so that host tooltip instances always match
  static create(e) {
    return new wa(e);
  }
  constructor(e) {
    this.view = e, this.mounted = !1, this.dom = document.createElement("div"), this.dom.classList.add("cm-tooltip-hover"), this.manager = new jm(e, zl, (t, i) => this.createHostedView(t, i), (t) => t.dom.remove());
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
const ck = /* @__PURE__ */ ch.compute([zl], (n) => {
  let e = n.facet(zl);
  return e.length === 0 ? null : {
    pos: Math.min(...e.map((t) => t.pos)),
    end: Math.max(...e.map((t) => {
      var i;
      return (i = t.end) !== null && i !== void 0 ? i : t.pos;
    })),
    create: wa.create,
    above: e[0].above,
    arrow: e.some((t) => t.arrow)
  };
}), hk = /* @__PURE__ */ xe.define();
class fk {
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
      let l = e.bidiSpans(e.state.doc.lineAt(s)).find((u) => u.from <= s && u.to >= s), a = l && l.dir == Ct.RTL ? -1 : 1;
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
      }, (a) => Vn(e.state, a, "hover tooltip"));
    } else
      r(o);
  }
  get tooltip() {
    let e = this.view.plugin(Gm), t = e ? e.manager.tooltips.findIndex((i) => i.create == wa.create) : -1;
    return t > -1 ? e.manager.tooltipViews[t] : null;
  }
  mousemove(e) {
    var t, i;
    this.lastMove = { x: e.clientX, y: e.clientY, target: e.target, time: Date.now() }, this.hoverTimeout < 0 && (this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime));
    let { active: s, tooltip: o } = this;
    if (s.length && !this.locked.has(s) && o && !dk(o.dom, e) || this.pending) {
      let { pos: r } = s[0] || this.pending, l = (i = (t = s[0]) === null || t === void 0 ? void 0 : t.end) !== null && i !== void 0 ? i : r;
      (r == l ? this.view.posAtCoords(this.lastMove) != r : !pk(this.view, r, l, e.clientX, e.clientY)) && (this.view.dispatch({ effects: this.setHover.of([]) }), this.pending = null);
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
const Zr = 4;
function dk(n, e) {
  let { left: t, right: i, top: s, bottom: o } = n.getBoundingClientRect(), r;
  if (r = n.querySelector(".cm-tooltip-arrow")) {
    let l = r.getBoundingClientRect();
    s = Math.min(l.top, s), o = Math.max(l.bottom, o);
  }
  return e.clientX >= t - Zr && e.clientX <= i + Zr && e.clientY >= s - Zr && e.clientY <= o + Zr;
}
function pk(n, e, t, i, s, o) {
  let r = n.scrollDOM.getBoundingClientRect(), l = n.documentTop + n.documentPadding.top + n.contentHeight;
  if (r.left > i || r.right < i || r.top > s || Math.min(r.bottom, l) < s)
    return !1;
  let a = n.posAtCoords({ x: i, y: s }, !1);
  return a >= e && a <= t;
}
function gk(n, e = {}) {
  let t = St.define(), i = /* @__PURE__ */ new WeakMap(), s = Un.define({
    create() {
      return [];
    },
    update(r, l) {
      let a = i.get(r);
      if (r.length && (e.hideOnChange && (l.docChanged || l.selection) ? r = [] : a && a(l) ? r = [] : e.hideOn && (r = r.filter((u) => !e.hideOn(l, u)))), l.docChanged && r.length) {
        let u = [];
        for (let c of r) {
          let h = l.changes.mapPos(c.pos, -1, fn.TrackDel);
          if (h != null) {
            let f = Object.assign(/* @__PURE__ */ Object.create(null), c);
            f.pos = h, f.end != null && (f.end = l.changes.mapPos(f.end)), u.push(f);
          }
        }
        r = u;
      }
      for (let u of l.effects)
        u.is(t) && (r = u.value, a = void 0), (u.is(mk) && !u.value || u.value == s) && (r = []);
      return r.length && a && i.set(r, a), r;
    },
    provide: (r) => zl.from(r)
  });
  const o = vn.define((r) => new fk(
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
      hk.of(o),
      ck
    ]
  };
}
const mk = /* @__PURE__ */ St.define(), gd = /* @__PURE__ */ xe.define({
  combine(n) {
    let e, t;
    for (let i of n)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), vk = /* @__PURE__ */ vn.fromClass(class {
  constructor(n) {
    this.input = n.state.facet(fc), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(n));
    let e = n.state.facet(gd);
    this.top = new Qr(n, !0, e.topContainer), this.bottom = new Qr(n, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(n) {
    let e = n.state.facet(gd);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Qr(n.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Qr(n.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = n.state.facet(fc);
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
class Qr {
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
          e = md(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = md(e);
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
function md(n) {
  let e = n.nextSibling;
  return n.remove(), e;
}
const fc = /* @__PURE__ */ xe.define({
  enables: vk
});
class is extends Ds {
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
is.prototype.elementClass = "";
is.prototype.toDOM = void 0;
is.prototype.mapMode = fn.TrackBefore;
is.prototype.startSide = is.prototype.endSide = -1;
is.prototype.point = !0;
const au = /* @__PURE__ */ xe.define(), yk = /* @__PURE__ */ xe.define(), bk = {
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
}, Xo = /* @__PURE__ */ xe.define();
function wk(n) {
  return [qm(), Xo.of({ ...bk, ...n })];
}
const vd = /* @__PURE__ */ xe.define({
  combine: (n) => n.some((e) => e)
});
function qm(n) {
  return [
    xk
  ];
}
const xk = /* @__PURE__ */ vn.fromClass(class {
  constructor(n) {
    this.view = n, this.domAfter = null, this.prevViewport = n.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = n.state.facet(Xo).map((e) => new bd(n, e)), this.fixed = !n.state.facet(vd);
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
    this.view.state.facet(vd) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = n.view.viewport;
  }
  syncGutters(n) {
    let e = this.dom.nextSibling;
    n && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = Ye.iter(this.view.state.facet(au), this.view.viewport.from), i = [], s = this.gutters.map((o) => new kk(o, this.view.viewport, -this.view.documentPadding.top));
    for (let o of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(o.type)) {
        let r = !0;
        for (let l of o.type)
          if (l.type == qt.Text && r) {
            dc(t, i, l.from);
            for (let a of s)
              a.line(this.view, l, i);
            r = !1;
          } else if (l.widget)
            for (let a of s)
              a.widget(this.view, l);
      } else if (o.type == qt.Text) {
        dc(t, i, o.from);
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
    let e = n.startState.facet(Xo), t = n.state.facet(Xo), i = n.docChanged || n.heightChanged || n.viewportChanged || !Ye.eq(n.startState.facet(au), n.state.facet(au), n.view.viewport.from, n.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(n) && (i = !0);
    else {
      i = !0;
      let s = [];
      for (let o of t) {
        let r = e.indexOf(o);
        r < 0 ? s.push(new bd(this.view, o)) : (this.gutters[r].update(n), s.push(this.gutters[r]));
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
    return e.textDirection == Ct.LTR ? { left: i, right: s } : { right: i, left: s };
  })
});
function yd(n) {
  return Array.isArray(n) ? n : [n];
}
function dc(n, e, t) {
  for (; n.value && n.from <= t; )
    n.from == t && e.push(n.value), n.next();
}
class kk {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.i = 0, this.cursor = Ye.iter(e.markers, t.from);
  }
  addElement(e, t, i) {
    let { gutter: s } = this, o = (t.top - this.height) / e.scaleY, r = t.height / e.scaleY;
    if (this.i == s.elements.length) {
      let l = new Ym(e, r, o, i);
      s.elements.push(l), s.dom.appendChild(l.dom);
    } else
      s.elements[this.i].update(e, r, o, i);
    this.height = t.bottom, this.i++;
  }
  line(e, t, i) {
    let s = [];
    dc(this.cursor, s, t.from), i.length && (s = s.concat(i));
    let o = this.gutter.config.lineMarker(e, t, s);
    o && s.unshift(o);
    let r = this.gutter;
    s.length == 0 && !r.config.renderEmptyElements || this.addElement(e, t, s);
  }
  widget(e, t) {
    let i = this.gutter.config.widgetMarker(e, t.widget, t), s = i ? [i] : null;
    for (let o of e.state.facet(yk)) {
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
class bd {
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
    this.markers = yd(t.markers(e)), t.initialSpacer && (this.spacer = new Ym(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = yd(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
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
class Ym {
  constructor(e, t, i, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, s);
  }
  update(e, t, i, s) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), Sk(this.markers, s) || this.setMarkers(e, s);
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
function Sk(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].compare(e[t]))
      return !1;
  return !0;
}
const Ck = /* @__PURE__ */ xe.define(), Mk = /* @__PURE__ */ xe.define(), Ws = /* @__PURE__ */ xe.define({
  combine(n) {
    return da(n, { formatNumber: String, domEventHandlers: {} }, {
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
class uu extends is {
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
function cu(n, e) {
  return n.state.facet(Ws).formatNumber(e, n.state);
}
const Ak = /* @__PURE__ */ Xo.compute([Ws], (n) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(Ck);
  },
  lineMarker(e, t, i) {
    return i.some((s) => s.toDOM) ? null : new uu(cu(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, i) => {
    for (let s of e.state.facet(Mk)) {
      let o = s(e, t, i);
      if (o)
        return o;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(Ws) != e.state.facet(Ws),
  initialSpacer(e) {
    return new uu(cu(e, wd(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = cu(t.view, wd(t.view.state.doc.lines));
    return i == e.number ? e : new uu(i);
  },
  domEventHandlers: n.facet(Ws).domEventHandlers,
  side: "before"
}));
function Tk(n = {}) {
  return [
    Ws.of(n),
    qm(),
    Ak
  ];
}
function wd(n) {
  let e = 9;
  for (; e < n; )
    e = e * 10 + 9;
  return e;
}
const $k = 1024;
let Dk = 0;
class hu {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class Je {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = Dk++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
    return typeof e != "function" && (e = pn.match(e)), (t) => {
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
class Jo {
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
const Ok = /* @__PURE__ */ Object.create(null);
class pn {
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
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Ok, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new pn(e.name || "", t, e.id, i);
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
pn.none = new pn(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class hh {
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
      t.push(s ? new pn(i.name, s, i.id, i.flags) : i);
    }
    return new hh(t);
  }
}
const el = /* @__PURE__ */ new WeakMap(), xd = /* @__PURE__ */ new WeakMap();
var Bt;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays", n[n.EnterBracketed = 16] = "EnterBracketed";
})(Bt || (Bt = {}));
class Tt {
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
    let e = Jo.get(this);
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
    return new gc(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, i = 0) {
    let s = el.get(this) || this.topNode, o = new gc(s);
    return o.moveTo(e, t), el.set(this, o._tree), o;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new $n(this, 0, 0, null);
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
    let i = pr(el.get(this) || this.topNode, e, t, !1);
    return el.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let i = pr(xd.get(this) || this.topNode, e, t, !0);
    return xd.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return Ik(this, e, t);
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
    return this.children.length <= 8 ? this : ph(pn.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, s) => new Tt(this.type, t, i, s, this.propValues), e.makeTree || ((t, i, s) => new Tt(pn.none, t, i, s)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return Bk(e);
  }
}
Tt.empty = new Tt(pn.none, [], [], 0);
class fh {
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
    return new fh(this.buffer, this.index);
  }
}
class ss {
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
    return pn.none;
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
    for (let a = e; a != t && !(Xm(o, s, r[a + 1], r[a + 2]) && (l = a, i > 0)); a = r[a + 3])
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
    return new ss(o, r, this.set);
  }
}
function Xm(n, e, t, i) {
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
function pr(n, e, t, i) {
  for (var s; n.from == n.to || (t < 1 ? n.from >= e : n.from > e) || (t > -1 ? n.to <= e : n.to < e); ) {
    let r = !i && n instanceof $n && n.index < 0 ? null : n.parent;
    if (!r)
      return n;
    n = r;
  }
  let o = i ? 0 : Bt.IgnoreOverlays;
  if (i)
    for (let r = n, l = r.parent; l; r = l, l = r.parent)
      r instanceof $n && r.index < 0 && ((s = l.enter(e, t, o)) === null || s === void 0 ? void 0 : s.from) != r.from && (n = l);
  for (; ; ) {
    let r = n.enter(e, t, o);
    if (!r)
      return n;
    n = r;
  }
}
class Jm {
  cursor(e = 0) {
    return new gc(this, e);
  }
  getChild(e, t = null, i = null) {
    let s = kd(this, e, t, i);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return kd(this, e, t, i);
  }
  resolve(e, t = 0) {
    return pr(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return pr(this, e, t, !0);
  }
  matchContext(e) {
    return pc(this.parent, e);
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
class $n extends Jm {
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
        if (!(!(o & Bt.EnterBracketed && c instanceof Tt && (f = Jo.get(c)) && !f.overlay && f.bracketed && i >= h && i <= h + c.length) && !Xm(s, i, h, h + c.length))) {
          if (c instanceof ss) {
            if (o & Bt.ExcludeBuffers)
              continue;
            let d = c.findChild(0, c.buffer.length, t, i - h, s);
            if (d > -1)
              return new Gi(new Lk(r, c, e, h), null, d);
          } else if (o & Bt.IncludeAnonymous || !c.type.isAnonymous || dh(c)) {
            let d;
            if (!(o & Bt.IgnoreMounts) && (d = Jo.get(c)) && !d.overlay)
              return new $n(d.tree, h, e, r);
            let p = new $n(c, h, e, r);
            return o & Bt.IncludeAnonymous || !p.type.isAnonymous ? p : p.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, s, o);
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
    if (!(i & Bt.IgnoreOverlays) && (s = Jo.get(this._tree)) && s.overlay) {
      let o = e - this.from, r = i & Bt.EnterBracketed && s.bracketed;
      for (let { from: l, to: a } of s.overlay)
        if ((t > 0 || r ? l <= o : l < o) && (t < 0 || r ? a >= o : a > o))
          return new $n(s.tree, s.overlay[0].from + this.from, -1, this);
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
function kd(n, e, t, i) {
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
function pc(n, e, t = e.length - 1) {
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
class Lk {
  constructor(e, t, i, s) {
    this.parent = e, this.buffer = t, this.index = i, this.start = s;
  }
}
class Gi extends Jm {
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
    return o < 0 ? null : new Gi(this.context, this, o);
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
    return o < 0 ? null : new Gi(this.context, this, o);
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
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new Gi(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new Gi(this.context, this._parent, e.findChild(
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
    return new Tt(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function Zm(n) {
  if (!n.length)
    return null;
  let e = 0, t = n[0];
  for (let o = 1; o < n.length; o++) {
    let r = n[o];
    (r.from > t.from || r.to < t.to) && (t = r, e = o);
  }
  let i = t instanceof $n && t.index < 0 ? null : t.parent, s = n.slice();
  return i ? s[e] = i : s.splice(e, 1), new Ek(s, t);
}
class Ek {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return Zm(this.heads);
  }
}
function Ik(n, e, t) {
  let i = n.resolveInner(e, t), s = null;
  for (let o = i instanceof $n ? i : i.context.parent; o; o = o.parent)
    if (o.index < 0) {
      let r = o.parent;
      (s || (s = [i])).push(r.resolve(e, t)), o = r;
    } else {
      let r = Jo.get(o.tree);
      if (r && r.overlay && r.overlay[0].from <= e && r.overlay[r.overlay.length - 1].to >= e) {
        let l = new $n(r.tree, r.overlay[0].from + o.from, -1, o);
        (s || (s = [i])).push(pr(l, e, t, !1));
      }
    }
  return s ? Zm(s) : i;
}
class gc {
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
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~Bt.EnterBracketed, e instanceof $n)
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
    return e ? e instanceof $n ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
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
          if (this.mode & Bt.IncludeAnonymous || l instanceof ss || !l.type.isAnonymous || dh(l))
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
      t = new Gi(this.buffer, t, this.stack[s]);
    return this.bufferNode = new Gi(this.buffer, t, this.index);
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
      return pc(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let s = e.length - 1, o = this.stack.length - 1; s >= 0; o--) {
      if (o < 0)
        return pc(this._tree, e, s);
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
function dh(n) {
  return n.children.some((e) => e instanceof ss || !e.type.isAnonymous || dh(e));
}
function Bk(n) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: s = $k, reused: o = [], minRepeatType: r = i.types.length } = n, l = Array.isArray(t) ? new fh(t, t.length) : t, a = i.types, u = 0, c = 0;
  function h(I, z, R, Y, K, re) {
    let { id: j, start: D, end: U, size: ke } = l, $e = c, ce = u;
    if (ke < 0)
      if (l.next(), ke == -1) {
        let Le = o[j];
        R.push(Le), Y.push(D - I);
        return;
      } else if (ke == -3) {
        u = j;
        return;
      } else if (ke == -4) {
        c = j;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ke}`);
    let pe = a[j], He, Oe, Re = D - I;
    if (U - D <= s && (Oe = m(l.pos - z, K))) {
      let Le = new Uint16Array(Oe.size - Oe.skip), J = l.pos - Oe.size, ct = Le.length;
      for (; l.pos > J; )
        ct = b(Oe.start, Le, ct);
      He = new ss(Le, U - Oe.start, i), Re = Oe.start - I;
    } else {
      let Le = l.pos - ke;
      l.next();
      let J = [], ct = [], ye = j >= r ? j : -1, Be = 0, se = U;
      for (; l.pos > Le; )
        ye >= 0 && l.id == ye && l.size >= 0 ? (l.end <= se - s && (p(J, ct, D, Be, l.end, se, ye, $e, ce), Be = J.length, se = l.end), l.next()) : re > 2500 ? f(D, Le, J, ct) : h(D, Le, J, ct, ye, re + 1);
      if (ye >= 0 && Be > 0 && Be < J.length && p(J, ct, D, Be, D, se, ye, $e, ce), J.reverse(), ct.reverse(), ye > -1 && Be > 0) {
        let Z = d(pe, ce);
        He = ph(pe, J, ct, 0, J.length, 0, U - D, Z, Z);
      } else
        He = v(pe, J, ct, U - D, $e - U, ce);
    }
    R.push(He), Y.push(Re);
  }
  function f(I, z, R, Y) {
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
      R.push(new ss(D, K[2] - U, i)), Y.push(U - I);
    }
  }
  function d(I, z) {
    return (R, Y, K) => {
      let re = 0, j = R.length - 1, D, U;
      if (j >= 0 && (D = R[j]) instanceof Tt) {
        if (!j && D.type == I && D.length == K)
          return D;
        (U = D.prop(Je.lookAhead)) && (re = Y[j] + D.length + U);
      }
      return v(I, R, Y, K, re, z);
    };
  }
  function p(I, z, R, Y, K, re, j, D, U) {
    let ke = [], $e = [];
    for (; I.length > Y; )
      ke.push(I.pop()), $e.push(z.pop() + R - K);
    I.push(v(i.types[j], ke, $e, re - K, D - re, U)), z.push(K - R);
  }
  function v(I, z, R, Y, K, re, j) {
    if (re) {
      let D = [Je.contextHash, re];
      j = j ? [D].concat(j) : [D];
    }
    if (K > 25) {
      let D = [Je.lookAhead, K];
      j = j ? [D].concat(j) : [D];
    }
    return new Tt(I, z, R, Y, j);
  }
  function m(I, z) {
    let R = l.fork(), Y = 0, K = 0, re = 0, j = R.end - s, D = { size: 0, start: 0, skip: 0 };
    e: for (let U = R.pos - I; R.pos > U; ) {
      let ke = R.size;
      if (R.id == z && ke >= 0) {
        D.size = Y, D.start = K, D.skip = re, re += 4, Y += 4, R.next();
        continue;
      }
      let $e = R.pos - ke;
      if (ke < 0 || $e < U || R.start < j)
        break;
      let ce = R.id >= r ? 4 : 0, pe = R.start;
      for (R.next(); R.pos > $e; ) {
        if (R.size < 0)
          if (R.size == -3 || R.size == -4)
            ce += 4;
          else
            break e;
        else R.id >= r && (ce += 4);
        R.next();
      }
      K = pe, Y += ke, re += ce;
    }
    return (z < 0 || Y == I) && (D.size = Y, D.start = K, D.skip = re), D.size > 4 ? D : void 0;
  }
  function b(I, z, R) {
    let { id: Y, start: K, end: re, size: j } = l;
    if (l.next(), j >= 0 && Y < r) {
      let D = R;
      if (j > 4) {
        let U = l.pos - (j - 4);
        for (; l.pos > U; )
          R = b(I, z, R);
      }
      z[--R] = D, z[--R] = re - I, z[--R] = K - I, z[--R] = Y;
    } else j == -3 ? u = Y : j == -4 && (c = Y);
    return R;
  }
  let O = [], L = [];
  for (; l.pos > 0; )
    h(n.start || 0, n.bufferStart || 0, O, L, -1, 0);
  let E = (e = n.length) !== null && e !== void 0 ? e : O.length ? L[0] + O[0].length : 0;
  return new Tt(a[n.topID], O.reverse(), L.reverse(), E);
}
const Sd = /* @__PURE__ */ new WeakMap();
function wl(n, e) {
  if (!n.isAnonymous || e instanceof ss || e.type != n)
    return 1;
  let t = Sd.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != n || !(i instanceof Tt)) {
        t = 1;
        break;
      }
      t += wl(n, i);
    }
    Sd.set(e, t);
  }
  return t;
}
function ph(n, e, t, i, s, o, r, l, a) {
  let u = 0;
  for (let p = i; p < s; p++)
    u += wl(n, e[p]);
  let c = Math.ceil(
    u * 1.5 / 8
    /* Balance.BranchFactor */
  ), h = [], f = [];
  function d(p, v, m, b, O) {
    for (let L = m; L < b; ) {
      let E = L, I = v[L], z = wl(n, p[L]);
      for (L++; L < b; L++) {
        let R = wl(n, p[L]);
        if (z + R >= c)
          break;
        z += R;
      }
      if (L == E + 1) {
        if (z > c) {
          let R = p[E];
          d(R.children, R.positions, 0, R.children.length, v[E] + O);
          continue;
        }
        h.push(p[E]);
      } else {
        let R = v[L - 1] + p[L - 1].length - I;
        h.push(ph(n, p, v, E, L, I, R, null, a));
      }
      f.push(I + O - o);
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
            let d = Math.max(f.from, a) - u, p = Math.min(f.to, h) - u;
            f = d >= p ? null : new Ts(d, p, f.tree, f.offset + u, l > 0, !!c);
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
class Qm {
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
    return typeof e == "string" && (e = new Rk(e)), i = i ? i.length ? i.map((s) => new hu(s.from, s.to)) : [new hu(0, 0)] : [new hu(0, e.length)], this.createParse(e, t || [], i);
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
class Rk {
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
let Pk = 0;
class Cn {
  /**
  @internal
  */
  constructor(e, t, i, s) {
    this.name = e, this.set = t, this.base = i, this.modified = s, this.id = Pk++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let i = typeof e == "string" ? e : "?";
    if (e instanceof Cn && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let s = new Cn(i, [], null, []);
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
    let t = new Wl(e);
    return (i) => i.modified.indexOf(t) > -1 ? i : Wl.get(i.base || i, i.modified.concat(t).sort((s, o) => s.id - o.id));
  }
}
let _k = 0;
class Wl {
  constructor(e) {
    this.name = e, this.instances = [], this.id = _k++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && Nk(t, l.modified));
    if (i)
      return i;
    let s = [], o = new Cn(e.name, s, e, t);
    for (let l of t)
      l.instances.push(o);
    let r = Vk(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let a of r)
          s.push(Wl.get(l, a));
    return o;
  }
}
function Nk(n, e) {
  return n.length == e.length && n.every((t, i) => t == e[i]);
}
function Vk(n) {
  let e = [[]];
  for (let t = 0; t < n.length; t++)
    for (let i = 0, s = e.length; i < s; i++)
      e.push(e[i].concat(n[t]));
  return e.sort((t, i) => i.length - t.length);
}
function Hk(n) {
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
        let c = new gr(i, r, a > 0 ? o.slice(0, a) : null);
        e[u] = c.sort(e[u]);
      }
  }
  return ev.add(e);
}
const ev = new Je({
  combine(n, e) {
    let t, i, s;
    for (; n || e; ) {
      if (!n || e && n.depth < e.depth ? (s = e, e = e.next) : (s = n, n = n.next), t && t.mode == s.mode && !s.context && !t.context)
        continue;
      let o = new gr(s.tags, s.mode, s.context);
      t ? t.next = o : i = o, t = o;
    }
    return i;
  }
});
class gr {
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
gr.empty = new gr([], 2, null);
function tv(n, e) {
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
function Fk(n, e) {
  let t = null;
  for (let i of n) {
    let s = i.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function zk(n, e, t, i = 0, s = n.length) {
  let o = new Wk(i, Array.isArray(e) ? e : [e], t);
  o.highlightRange(n.cursor(), i, s, "", o.highlighters), o.flush(s);
}
class Wk {
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
    let u = s, c = Kk(e) || gr.empty, h = Fk(o, c.tags);
    if (h && (u && (u += " "), u += h, c.mode == 1 && (s += (s ? " " : "") + h)), this.startSpan(Math.max(t, l), u), c.opaque)
      return;
    let f = e.tree && e.tree.prop(Je.mounted);
    if (f && f.overlay) {
      let d = e.node.enter(f.overlay[0].from + l, 1), p = this.highlighters.filter((m) => !m.scope || m.scope(f.tree.type)), v = e.firstChild();
      for (let m = 0, b = l; ; m++) {
        let O = m < f.overlay.length ? f.overlay[m] : null, L = O ? O.from + l : a, E = Math.max(t, b), I = Math.min(i, L);
        if (E < I && v)
          for (; e.from < I && (this.highlightRange(e, E, I, s, o), this.startSpan(Math.min(I, e.to), u), !(e.to >= L || !e.nextSibling())); )
            ;
        if (!O || L > i)
          break;
        b = O.to + l, b > t && (this.highlightRange(d.cursor(), Math.max(t, O.from + l), Math.min(i, b), "", p), this.startSpan(Math.min(i, b), u));
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
function Kk(n) {
  let e = n.type.prop(ev);
  for (; e && e.context && !n.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const de = Cn.define, tl = de(), Vi = de(), Cd = de(Vi), Md = de(Vi), Hi = de(), nl = de(Hi), fu = de(Hi), ti = de(), ds = de(ti), Zn = de(), Qn = de(), mc = de(), Ao = de(mc), il = de(), _e = {
  /**
  A comment.
  */
  comment: tl,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: de(tl),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: de(tl),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: de(tl),
  /**
  Any kind of identifier.
  */
  name: Vi,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: de(Vi),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: Cd,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: de(Cd),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: Md,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: de(Md),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: de(Vi),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: de(Vi),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: de(Vi),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: de(Vi),
  /**
  A literal value.
  */
  literal: Hi,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: nl,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: de(nl),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: de(nl),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: de(nl),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: fu,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: de(fu),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: de(fu),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: de(Hi),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: de(Hi),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: de(Hi),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: de(Hi),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: de(Hi),
  /**
  A language keyword.
  */
  keyword: Zn,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: de(Zn),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: de(Zn),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: de(Zn),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: de(Zn),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: de(Zn),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: de(Zn),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: de(Zn),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: de(Zn),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: de(Zn),
  /**
  An operator.
  */
  operator: Qn,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: de(Qn),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: de(Qn),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: de(Qn),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: de(Qn),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: de(Qn),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: de(Qn),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: de(Qn),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: de(Qn),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: de(Qn),
  /**
  Program or markup punctuation.
  */
  punctuation: mc,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: de(mc),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Ao,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: de(Ao),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: de(Ao),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: de(Ao),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: de(Ao),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: ti,
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
  contentSeparator: de(ti),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: de(ti),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: de(ti),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: de(ti),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: de(ti),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: de(ti),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: de(ti),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: de(ti),
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
  meta: il,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: de(il),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: de(il),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: de(il),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Cn.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Cn.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Cn.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Cn.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Cn.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Cn.defineModifier("special")
};
for (let n in _e) {
  let e = _e[n];
  e instanceof Cn && (e.name = n);
}
tv([
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
var du;
const Ks = /* @__PURE__ */ new Je();
function Uk(n) {
  return xe.define({
    combine: n ? (e) => e.concat(n) : void 0
  });
}
const jk = /* @__PURE__ */ new Je();
class Hn {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, i = [], s = "") {
    this.data = e, this.name = s, rt.prototype.hasOwnProperty("tree") || Object.defineProperty(rt.prototype, "tree", { get() {
      return gi(this);
    } }), this.parser = t, this.extension = [
      ho.of(this),
      rt.languageData.of((o, r, l) => {
        let a = Ad(o, r, l), u = a.type.prop(Ks);
        if (!u)
          return [];
        let c = o.facet(u), h = a.type.prop(jk);
        if (h) {
          let f = a.resolve(r - a.from, l);
          for (let d of h)
            if (d.test(f, o)) {
              let p = o.facet(d.facet);
              return d.type == "replace" ? p : p.concat(c);
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
    return Ad(e, t, i).type.prop(Ks) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(ho);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], s = (o, r) => {
      if (o.prop(Ks) == this.data) {
        i.push({ from: r, to: r + o.length });
        return;
      }
      let l = o.prop(Je.mounted);
      if (l) {
        if (l.tree.prop(Ks) == this.data) {
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
        u instanceof Tt && s(u, o.positions[a] + r);
      }
    };
    return s(gi(e), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
Hn.setState = /* @__PURE__ */ St.define();
function Ad(n, e, t) {
  let i = n.facet(ho), s = gi(n).topNode;
  if (!i || i.allowsNesting)
    for (let o = s; o; o = o.enter(e, t, Bt.ExcludeBuffers | Bt.EnterBracketed))
      o.type.isTop && (s = o);
  return s;
}
function gi(n) {
  let e = n.field(Hn.state, !1);
  return e ? e.tree : Tt.empty;
}
class Gk {
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
let To = null;
class uo {
  constructor(e, t, i = [], s, o, r, l, a) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = s, this.treeLen = o, this.viewport = r, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new uo(e, t, [], Tt.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new Gk(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != Tt.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
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
    let t = To;
    To = this;
    try {
      return e();
    } finally {
      To = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = Td(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: i, tree: s, treeLen: o, viewport: r, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((u, c, h, f) => a.push({ fromA: u, toA: c, fromB: h, toB: f })), i = Ts.applyChanges(i, a), s = Tt.empty, o = 0, r = { from: e.mapPos(r.from, -1), to: e.mapPos(r.to, 1) }, this.skipped.length) {
        l = [];
        for (let u of this.skipped) {
          let c = e.mapPos(u.from, 1), h = e.mapPos(u.to, -1);
          c < h && l.push({ from: c, to: h });
        }
      }
    }
    return new uo(this.parser, t, i, s, o, r, l, this.scheduleOn);
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
      s < e.to && o > e.from && (this.fragments = Td(this.fragments, s, o), this.skipped.splice(i--, 1));
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
    return new class extends Qm {
      createParse(t, i, s) {
        let o = s[0].from, r = s[s.length - 1].to;
        return {
          parsedPos: o,
          advance() {
            let a = To;
            if (a) {
              for (let u of s)
                a.tempSkipped.push(u);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = r, new Tt(pn.none, [], [], r - o);
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
    return To;
  }
}
function Td(n, e, t) {
  return Ts.applyChanges(n, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class co {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new co(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = uo.create(e.facet(ho).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new co(i);
  }
}
Hn.state = /* @__PURE__ */ Un.define({
  create: co.init,
  update(n, e) {
    for (let t of e.effects)
      if (t.is(Hn.setState))
        return t.value;
    return e.startState.facet(ho) != e.state.facet(ho) ? co.init(e.state) : n.apply(e);
  }
});
let nv = (n) => {
  let e = setTimeout(
    () => n(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (nv = (n) => {
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
const pu = typeof navigator < "u" && (!((du = navigator.scheduling) === null || du === void 0) && du.isInputPending) ? () => navigator.scheduling.isInputPending() : null, qk = /* @__PURE__ */ vn.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(Hn.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(Hn.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = nv(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: s } } = this.view, o = i.field(Hn.state);
    if (o.tree == o.context.tree && o.context.isDone(
      s + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let r = Date.now() + Math.min(this.chunkBudget, 100, e && !pu ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = o.context.treeLen < s && i.doc.length > s + 1e3, a = o.context.work(() => pu && pu() || Date.now() > r, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (o.context.takeTree(), this.view.dispatch({ effects: Hn.setState.of(new co(o.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(o.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Vn(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), ho = /* @__PURE__ */ xe.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: (n) => [
    Hn.state,
    qk,
    De.contentAttributes.compute([n], (e) => {
      let t = e.facet(n);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
}), Yk = /* @__PURE__ */ xe.define(), gh = /* @__PURE__ */ xe.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    let e = n[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return e;
  }
});
function Is(n) {
  let e = n.facet(gh);
  return e.charCodeAt(0) == 9 ? n.tabSize * e.length : e.length;
}
function Kl(n, e) {
  let t = "", i = n.tabSize, s = n.facet(gh)[0];
  if (s == "	") {
    for (; e >= i; )
      t += "	", e -= i;
    s = " ";
  }
  for (let o = 0; o < e; o++)
    t += s;
  return t;
}
function iv(n, e) {
  n instanceof rt && (n = new xa(n));
  for (let i of n.state.facet(Yk)) {
    let s = i(n, e);
    if (s !== void 0)
      return s;
  }
  let t = gi(n.state);
  return t.length >= e ? Xk(n, t, e) : null;
}
class xa {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Is(e);
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
    return pa(e, this.state.tabSize, t);
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
const sv = /* @__PURE__ */ new Je();
function Xk(n, e, t) {
  let i = e.resolveStack(t), s = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (s != i.node) {
    let o = [];
    for (let r = s; r && !(r.from < i.node.from || r.to > i.node.to || r.from == i.node.from && r.type == i.node.type); r = r.parent)
      o.push(r);
    for (let r = o.length - 1; r >= 0; r--)
      i = { node: o[r], next: i };
  }
  return ov(i, n, t);
}
function ov(n, e, t) {
  for (let i = n; i; i = i.next) {
    let s = Zk(i.node);
    if (s)
      return s(mh.create(e, t, i));
  }
  return 0;
}
function Jk(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function Zk(n) {
  let e = n.type.prop(sv);
  if (e)
    return e;
  let t = n.firstChild, i;
  if (t && (i = t.type.prop(Je.closedBy))) {
    let s = n.lastChild, o = s && i.indexOf(s.name) > -1;
    return (r) => nS(r, !0, 1, void 0, o && !Jk(r) ? s.from : void 0);
  }
  return n.parent == null ? Qk : null;
}
function Qk() {
  return 0;
}
class mh extends xa {
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
    return new mh(e, t, i);
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
      if (eS(i, e))
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
    return ov(this.context.next, this.base, this.pos);
  }
}
function eS(n, e) {
  for (let t = e; t; t = t.parent)
    if (n == t)
      return !0;
  return !1;
}
function tS(n) {
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
function nS(n, e, t, i, s) {
  let o = n.textAfter, r = o.match(/^\s*/)[0].length, l = i && o.slice(r, r + i.length) == i || s == n.pos + r, a = tS(n);
  return a ? l ? n.column(a.from) : n.column(a.to) : n.baseIndent + (l ? 0 : n.unit * t);
}
class ka {
  constructor(e, t) {
    this.specs = e;
    let i;
    function s(l) {
      let a = es.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const o = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, r = t.scope;
    this.scope = r instanceof Hn ? (l) => l.prop(Ks) == r.data : r ? (l) => l == r : void 0, this.style = tv(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: o
    }).style, this.module = i ? new es(i) : null, this.themeType = t.themeType;
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
    return new ka(e, t || {});
  }
}
const vc = /* @__PURE__ */ xe.define(), iS = /* @__PURE__ */ xe.define({
  combine(n) {
    return n.length ? [n[0]] : null;
  }
});
function gu(n) {
  let e = n.facet(vc);
  return e.length ? e : n.facet(iS);
}
function sS(n, e) {
  let t = [rS], i;
  return n instanceof ka && (n.module && t.push(De.styleModule.of(n.module)), i = n.themeType), i ? t.push(vc.computeN([De.darkTheme], (s) => s.facet(De.darkTheme) == (i == "dark") ? [n] : [])) : t.push(vc.of(n)), t;
}
class oS {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = gi(e.state), this.decorations = this.buildDeco(e, gu(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = gi(e.state), i = gu(e.state), s = i != gu(e.startState), { viewport: o } = e.view, r = e.changes.mapPos(this.decoratedTo, 1);
    t.length < o.to && !s && t.type == this.tree.type && r >= o.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = r) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, i), this.decoratedTo = o.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return Mt.none;
    let i = new Ms();
    for (let { from: s, to: o } of e.visibleRanges)
      zk(this.tree, t, (r, l, a) => {
        i.add(r, l, this.markCache[a] || (this.markCache[a] = Mt.mark({ class: a })));
      }, s, o);
    return i.finish();
  }
}
const rS = /* @__PURE__ */ ha.high(/* @__PURE__ */ vn.fromClass(oS, {
  decorations: (n) => n.decorations
})), lS = 1e4, aS = "()[]{}", uS = /* @__PURE__ */ new Je();
function yc(n, e, t) {
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
function bc(n) {
  let e = n.type.prop(uS);
  return e ? e(n.node) : n;
}
function Us(n, e, t, i = {}) {
  let s = i.maxScanDistance || lS, o = i.brackets || aS, r = gi(n), l = r.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let u = yc(a.type, t, o);
    if (u && a.from < a.to) {
      let c = bc(a);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return cS(n, e, t, a, c, u, o);
    }
  }
  return hS(n, e, t, r, l.type, s, o);
}
function cS(n, e, t, i, s, o, r) {
  let l = i.parent, a = { from: s.from, to: s.to }, u = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(i.from) : c.childAfter(i.to)))
    do
      if (t < 0 ? c.to <= i.from : c.from >= i.to) {
        if (u == 0 && o.indexOf(c.type.name) > -1 && c.from < c.to) {
          let h = bc(c);
          return { start: a, end: h ? { from: h.from, to: h.to } : void 0, matched: !0 };
        } else if (yc(c.type, t, r))
          u++;
        else if (yc(c.type, -t, r)) {
          if (u == 0) {
            let h = bc(c);
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
function hS(n, e, t, i, s, o, r) {
  if (t < 0 ? !e : e == n.doc.length)
    return null;
  let l = t < 0 ? n.sliceDoc(e - 1, e) : n.sliceDoc(e, e + 1), a = r.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let u = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = n.doc.iterRange(e, t > 0 ? n.doc.length : 0), h = 0;
  for (let f = 0; !c.next().done && f <= o; ) {
    let d = c.value;
    t < 0 && (f += d.length);
    let p = e + f * t;
    for (let v = t > 0 ? 0 : d.length - 1, m = t > 0 ? d.length : -1; v != m; v += t) {
      let b = r.indexOf(d[v]);
      if (!(b < 0 || i.resolveInner(p + v, 1).type != s))
        if (b % 2 == 0 == t > 0)
          h++;
        else {
          if (h == 1)
            return { start: u, end: { from: p + v, to: p + v + 1 }, matched: b >> 1 == a >> 1 };
          h--;
        }
    }
    t > 0 && (f += d.length);
  }
  return c.done ? { start: u, matched: !1 } : null;
}
function $d(n, e, t, i = 0, s = 0) {
  e == null && (e = n.search(/[^\s\u00a0]/), e == -1 && (e = n.length));
  let o = s;
  for (let r = i; r < e; r++)
    n.charCodeAt(r) == 9 ? o += t - o % t : o++;
  return o;
}
class rv {
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
    return this.lastColumnPos < this.start && (this.lastColumnValue = $d(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : $d(this.string, null, this.tabSize);
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
function fS(n) {
  return {
    name: n.name || "",
    token: n.token,
    blankLine: n.blankLine || (() => {
    }),
    startState: n.startState || (() => !0),
    copyState: n.copyState || dS,
    indent: n.indent || (() => null),
    languageData: n.languageData || {},
    tokenTable: n.tokenTable || bh,
    mergeTokens: n.mergeTokens !== !1
  };
}
function dS(n) {
  if (typeof n != "object")
    return n;
  let e = {};
  for (let t in n) {
    let i = n[t];
    e[t] = i instanceof Array ? i.slice() : i;
  }
  return e;
}
const Dd = /* @__PURE__ */ new WeakMap();
class vh extends Hn {
  constructor(e) {
    let t = Uk(e.languageData), i = fS(e), s, o = new class extends Qm {
      createParse(r, l, a) {
        return new gS(s, r, l, a);
      }
    }();
    super(t, o, [], e.name), this.topNode = yS(t, this), s = this, this.streamParser = i, this.stateAfter = new Je({ perNode: !0 }), this.tokenTable = e.tokenTable ? new cv(i.tokenTable) : vS;
  }
  /**
  Define a stream language.
  */
  static define(e) {
    return new vh(e);
  }
  /**
  @internal
  */
  getIndent(e) {
    let t, { overrideIndentation: i } = e.options;
    i && (t = Dd.get(e.state), t != null && t < e.pos - 1e4 && (t = void 0));
    let s = yh(this, e.node.tree, e.node.from, e.node.from, t ?? e.pos), o, r;
    if (s ? (r = s.state, o = s.pos + 1) : (r = this.streamParser.startState(e.unit), o = e.node.from), e.pos - o > 1e4)
      return null;
    for (; o < e.pos; ) {
      let a = e.state.doc.lineAt(o), u = Math.min(e.pos, a.to);
      if (a.length) {
        let c = i ? i(a.from) : -1, h = new rv(a.text, e.state.tabSize, e.unit, c < 0 ? void 0 : c);
        for (; h.pos < u - a.from; )
          av(this.streamParser.token, h, r);
      } else
        this.streamParser.blankLine(r, e.unit);
      if (u == e.pos)
        break;
      o = a.to + 1;
    }
    let l = e.lineAt(e.pos);
    return i && t == null && Dd.set(e.state, l.from), this.streamParser.indent(r, /^\s*(.*)/.exec(l.text)[1], e);
  }
  get allowsNesting() {
    return !1;
  }
}
function yh(n, e, t, i, s) {
  let o = t >= i && t + e.length <= s && e.prop(n.stateAfter);
  if (o)
    return { state: n.streamParser.copyState(o), pos: t + e.length };
  for (let r = e.children.length - 1; r >= 0; r--) {
    let l = e.children[r], a = t + e.positions[r], u = l instanceof Tt && a < s && yh(n, l, a, i, s);
    if (u)
      return u;
  }
  return null;
}
function lv(n, e, t, i, s) {
  if (s && t <= 0 && i >= e.length)
    return e;
  !s && t == 0 && e.type == n.topNode && (s = !0);
  for (let o = e.children.length - 1; o >= 0; o--) {
    let r = e.positions[o], l = e.children[o], a;
    if (r < i && l instanceof Tt) {
      if (!(a = lv(n, l, t - r, i - r, s)))
        break;
      return s ? new Tt(e.type, e.children.slice(0, o).concat(a), e.positions.slice(0, o + 1), r + a.length) : a;
    }
  }
  return null;
}
function pS(n, e, t, i, s) {
  for (let o of e) {
    let r = o.from + (o.openStart ? 25 : 0), l = o.to - (o.openEnd ? 25 : 0), a = r <= t && l > t && yh(n, o.tree, 0 - o.offset, t, l), u;
    if (a && a.pos <= i && (u = lv(n, o.tree, t + o.offset, a.pos + o.offset, !1)))
      return { state: a.state, tree: u };
  }
  return { state: n.streamParser.startState(s ? Is(s) : 4), tree: Tt.empty };
}
class gS {
  constructor(e, t, i, s) {
    this.lang = e, this.input = t, this.fragments = i, this.ranges = s, this.stoppedAt = null, this.chunks = [], this.chunkPos = [], this.chunk = [], this.chunkReused = void 0, this.rangeIndex = 0, this.to = s[s.length - 1].to;
    let o = uo.get(), r = s[0].from, { state: l, tree: a } = pS(e, i, r, this.to, o?.state);
    this.state = l, this.parsedPos = this.chunkStart = r + a.length;
    for (let u = 0; u < a.children.length; u++)
      this.chunks.push(a.children[u]), this.chunkPos.push(a.positions[u]);
    o && this.parsedPos < o.viewport.from - 1e5 && s.some((u) => u.from <= o.viewport.from && u.to >= o.viewport.from) && (this.state = this.lang.streamParser.startState(Is(o.state)), o.skipUntilInView(this.parsedPos, o.viewport.from), this.parsedPos = o.viewport.from), this.moveRangeIndex();
  }
  advance() {
    let e = uo.get(), t = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt), i = Math.min(
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
    let { line: t, end: i } = this.nextLine(), s = 0, { streamParser: o } = this.lang, r = new rv(t, e ? e.state.tabSize : 4, e ? Is(e.state) : 2);
    if (r.eol())
      o.blankLine(this.state, r.indentUnit);
    else
      for (; !r.eol(); ) {
        let l = av(o.token, r, this.state);
        if (l && (s = this.emitToken(this.lang.tokenTable.resolve(l), this.parsedPos + r.start, this.parsedPos + r.pos, s)), r.start > 1e4)
          break;
      }
    this.parsedPos = i, this.moveRangeIndex(), this.parsedPos < this.to && this.parsedPos++;
  }
  finishChunk() {
    let e = Tt.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet: mS,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    e = new Tt(e.type, e.children, e.positions, e.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]), this.chunks.push(e), this.chunkPos.push(this.chunkStart - this.ranges[0].from), this.chunk = [], this.chunkReused = void 0, this.chunkStart = this.parsedPos;
  }
  finish() {
    return new Tt(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
}
function av(n, e, t) {
  e.start = e.pos;
  for (let i = 0; i < 10; i++) {
    let s = n(e, t);
    if (e.pos > e.start)
      return s;
  }
  throw new Error("Stream parser failed to advance stream.");
}
const bh = /* @__PURE__ */ Object.create(null), mr = [pn.none], mS = /* @__PURE__ */ new hh(mr), Od = [], Ld = /* @__PURE__ */ Object.create(null), uv = /* @__PURE__ */ Object.create(null);
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
  uv[n] = /* @__PURE__ */ hv(bh, e);
class cv {
  constructor(e) {
    this.extra = e, this.table = Object.assign(/* @__PURE__ */ Object.create(null), uv);
  }
  resolve(e) {
    return e ? this.table[e] || (this.table[e] = hv(this.extra, e)) : 0;
  }
}
const vS = /* @__PURE__ */ new cv(bh);
function mu(n, e) {
  Od.indexOf(n) > -1 || (Od.push(n), console.warn(e));
}
function hv(n, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let a = [];
    for (let u of l.split(".")) {
      let c = n[u] || _e[u];
      c ? typeof c == "function" ? a.length ? a = a.map(c) : mu(u, `Modifier ${u} used at start of tag`) : a.length ? mu(u, `Tag ${u} used as modifier`) : a = Array.isArray(c) ? c : [c] : mu(u, `Unknown highlighting tag ${u}`);
    }
    for (let u of a)
      t.push(u);
  }
  if (!t.length)
    return 0;
  let i = e.replace(/ /g, "_"), s = i + " " + t.map((l) => l.id), o = Ld[s];
  if (o)
    return o.id;
  let r = Ld[s] = pn.define({
    id: mr.length,
    name: i,
    props: [Hk({ [i]: t })]
  });
  return mr.push(r), r.id;
}
function yS(n, e) {
  let t = pn.define({ id: mr.length, name: "Document", props: [
    Ks.add(() => n),
    sv.add(() => (i) => e.getIndent(i))
  ], top: !0 });
  return mr.push(t), t;
}
Ct.RTL, Ct.LTR;
const bS = (n) => {
  let { state: e } = n, t = e.doc.lineAt(e.selection.main.from), i = xh(n.state, t.from);
  return i.line ? wS(n) : i.block ? kS(n) : !1;
};
function wh(n, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let s = n(e, t);
    return s ? (i(t.update(s)), !0) : !1;
  };
}
const wS = /* @__PURE__ */ wh(
  MS,
  0
  /* CommentOption.Toggle */
), xS = /* @__PURE__ */ wh(
  fv,
  0
  /* CommentOption.Toggle */
), kS = /* @__PURE__ */ wh(
  (n, e) => fv(n, e, CS(e)),
  0
  /* CommentOption.Toggle */
);
function xh(n, e) {
  let t = n.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const $o = 50;
function SS(n, { open: e, close: t }, i, s) {
  let o = n.sliceDoc(i - $o, i), r = n.sliceDoc(s, s + $o), l = /\s*$/.exec(o)[0].length, a = /^\s*/.exec(r)[0].length, u = o.length - l;
  if (o.slice(u - e.length, u) == e && r.slice(a, a + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, h;
  s - i <= 2 * $o ? c = h = n.sliceDoc(i, s) : (c = n.sliceDoc(i, i + $o), h = n.sliceDoc(s - $o, s));
  let f = /^\s*/.exec(c)[0].length, d = /\s*$/.exec(h)[0].length, p = h.length - d - t.length;
  return c.slice(f, f + e.length) == e && h.slice(p, p + t.length) == t ? {
    open: {
      pos: i + f + e.length,
      margin: /\s/.test(c.charAt(f + e.length)) ? 1 : 0
    },
    close: {
      pos: s - d - t.length,
      margin: /\s/.test(h.charAt(p - 1)) ? 1 : 0
    }
  } : null;
}
function CS(n) {
  let e = [];
  for (let t of n.selection.ranges) {
    let i = n.doc.lineAt(t.from), s = t.to <= i.to ? i : n.doc.lineAt(t.to);
    s.from > i.from && s.from == t.to && (s = t.to == i.to + 1 ? i : n.doc.lineAt(t.to - 1));
    let o = e.length - 1;
    o >= 0 && e[o].to > i.from ? e[o].to = s.to : e.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: s.to });
  }
  return e;
}
function fv(n, e, t = e.selection.ranges) {
  let i = t.map((o) => xh(e, o.from).block);
  if (!i.every((o) => o))
    return null;
  let s = t.map((o, r) => SS(e, i[r], o.from, o.to));
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
function MS(n, e, t = e.selection.ranges) {
  let i = [], s = -1;
  e: for (let { from: o, to: r } of t) {
    let l = i.length, a = 1e9, u;
    for (let c = o; c <= r; ) {
      let h = e.doc.lineAt(c);
      if (u == null && (u = xh(e, h.from).line, !u))
        continue e;
      if (h.from > s && (o == r || r > h.from)) {
        s = h.from;
        let f = /^\s*/.exec(h.text)[0].length, d = f == h.length, p = h.text.slice(f, f + u.length) == u ? f : -1;
        f < h.text.length && f < a && (a = f), i.push({ line: h, comment: p, token: u, indent: f, empty: d, single: !1 });
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
function yo(n, e) {
  return te.create(n.ranges.map(e), n.mainIndex);
}
function jn(n, e) {
  return n.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Gn({ state: n, dispatch: e }, t) {
  let i = yo(n.selection, t);
  return i.eq(n.selection, !0) ? !1 : (e(jn(n, i)), !0);
}
function Sa(n, e) {
  return te.cursor(e ? n.to : n.from);
}
function dv(n, e) {
  return Gn(n, (t) => t.empty ? n.moveByChar(t, e) : Sa(t, e));
}
function nn(n) {
  return n.textDirectionAt(n.state.selection.main.head) == Ct.LTR;
}
const pv = (n) => dv(n, !nn(n)), gv = (n) => dv(n, nn(n));
function mv(n, e) {
  return Gn(n, (t) => t.empty ? n.moveByGroup(t, e) : Sa(t, e));
}
const AS = (n) => mv(n, !nn(n)), TS = (n) => mv(n, nn(n));
function $S(n, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(e.from, e.to))) || e.firstChild;
}
function Ca(n, e, t) {
  let i = gi(n).resolveInner(e.head), s = t ? Je.closedBy : Je.openedBy;
  for (let a = e.head; ; ) {
    let u = t ? i.childAfter(a) : i.childBefore(a);
    if (!u)
      break;
    $S(n, u, s) ? i = u : a = t ? u.to : u.from;
  }
  let o = i.type.prop(s), r, l;
  return o && (r = t ? Us(n, i.from, 1) : Us(n, i.to, -1)) && r.matched ? l = t ? r.end.to : r.end.from : l = t ? i.to : i.from, te.cursor(l, t ? -1 : 1);
}
const DS = (n) => Gn(n, (e) => Ca(n.state, e, !nn(n))), OS = (n) => Gn(n, (e) => Ca(n.state, e, nn(n)));
function vv(n, e) {
  return Gn(n, (t) => {
    if (!t.empty)
      return Sa(t, e);
    let i = n.moveVertically(t, e);
    return i.head != t.head ? i : n.moveToLineBoundary(t, e);
  });
}
const yv = (n) => vv(n, !1), bv = (n) => vv(n, !0);
function wv(n) {
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
function xv(n, e) {
  let t = wv(n), { state: i } = n, s = yo(i.selection, (r) => r.empty ? n.moveVertically(r, e, t.height) : Sa(r, e));
  if (s.eq(i.selection))
    return !1;
  let o;
  if (t.selfScroll) {
    let r = n.coordsAtPos(i.selection.main.head), l = n.scrollDOM.getBoundingClientRect(), a = l.top + t.marginTop, u = l.bottom - t.marginBottom;
    r && r.top > a && r.bottom < u && (o = De.scrollIntoView(s.main.head, { y: "start", yMargin: r.top - a }));
  }
  return n.dispatch(jn(i, s), { effects: o }), !0;
}
const Ed = (n) => xv(n, !1), wc = (n) => xv(n, !0);
function rs(n, e, t) {
  let i = n.lineBlockAt(e.head), s = n.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? i.to : i.from) && (s = n.moveToLineBoundary(e, t, !1)), !t && s.head == i.from && i.length) {
    let o = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    o && e.head != i.from + o && (s = te.cursor(i.from + o));
  }
  return s;
}
const LS = (n) => Gn(n, (e) => rs(n, e, !0)), ES = (n) => Gn(n, (e) => rs(n, e, !1)), IS = (n) => Gn(n, (e) => rs(n, e, !nn(n))), BS = (n) => Gn(n, (e) => rs(n, e, nn(n))), RS = (n) => Gn(n, (e) => n.moveToLineBoundary(e, !1, !1)), PS = (n) => Gn(n, (e) => n.moveToLineBoundary(e, !0, !1));
function _S(n, e, t) {
  let i = !1, s = yo(n.selection, (o) => {
    let r = Us(n, o.head, -1) || Us(n, o.head, 1) || o.head > 0 && Us(n, o.head - 1, 1) || o.head < n.doc.length && Us(n, o.head + 1, -1);
    if (!r || !r.end)
      return o;
    i = !0;
    let l = r.start.from == o.head ? r.end.to : r.end.from;
    return te.cursor(l);
  });
  return i ? (e(jn(n, s)), !0) : !1;
}
const NS = ({ state: n, dispatch: e }) => _S(n, e);
function En(n, e, t) {
  let i = yo(n.state.selection, (s) => {
    s.undirectional && s.head >= s.anchor != e && (s = te.range(s.head, s.anchor));
    let o = t(s);
    return te.range(s.anchor, o.head, o.goalColumn, o.bidiLevel || void 0, o.assoc);
  });
  return i.eq(n.state.selection) ? !1 : (n.dispatch(jn(n.state, i)), !0);
}
function kv(n, e) {
  return En(n, e, (t) => n.moveByChar(t, e));
}
const Sv = (n) => kv(n, !nn(n)), Cv = (n) => kv(n, nn(n));
function Mv(n, e) {
  return En(n, e, (t) => n.moveByGroup(t, e));
}
const VS = (n) => Mv(n, !nn(n)), HS = (n) => Mv(n, nn(n)), FS = (n) => {
  let e = !nn(n);
  return En(n, e, (t) => Ca(n.state, t, e));
}, zS = (n) => {
  let e = nn(n);
  return En(n, e, (t) => Ca(n.state, t, e));
};
function Av(n, e) {
  return En(n, e, (t) => n.moveVertically(t, e));
}
const Tv = (n) => Av(n, !1), $v = (n) => Av(n, !0);
function Dv(n, e) {
  return En(n, e, (t) => n.moveVertically(t, e, wv(n).height));
}
const Id = (n) => Dv(n, !1), Bd = (n) => Dv(n, !0), WS = (n) => En(n, !0, (e) => rs(n, e, !0)), KS = (n) => En(n, !1, (e) => rs(n, e, !1)), US = (n) => {
  let e = !nn(n);
  return En(n, e, (t) => rs(n, t, e));
}, jS = (n) => {
  let e = nn(n);
  return En(n, e, (t) => rs(n, t, e));
}, GS = (n) => En(n, !1, (e) => te.cursor(n.lineBlockAt(e.head).from)), qS = (n) => En(n, !0, (e) => te.cursor(n.lineBlockAt(e.head).to)), Rd = ({ state: n, dispatch: e }) => (e(jn(n, { anchor: 0 })), !0), Pd = ({ state: n, dispatch: e }) => (e(jn(n, { anchor: n.doc.length })), !0), _d = ({ state: n, dispatch: e }) => (e(jn(n, { anchor: n.selection.main.anchor, head: 0 })), !0), Nd = ({ state: n, dispatch: e }) => (e(jn(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), YS = ({ state: n, dispatch: e }) => (e(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), XS = ({ state: n, dispatch: e }) => {
  let t = Ma(n).map(({ from: i, to: s }) => te.undirectionalRange(i, Math.min(s + 1, n.doc.length)));
  return e(n.update({ selection: te.create(t), userEvent: "select" })), !0;
}, JS = ({ state: n, dispatch: e }) => {
  let t = yo(n.selection, (i) => {
    let s = gi(n), o = s.resolveStack(i.from, 1);
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
  return t.eq(n.selection) ? !1 : (e(jn(n, t)), !0);
};
function Ov(n, e) {
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
  return s.length == i.ranges.length ? !1 : (n.dispatch(jn(t, te.create(s, s.length - 1))), !0);
}
const ZS = (n) => Ov(n, !1), QS = (n) => Ov(n, !0), eC = ({ state: n, dispatch: e }) => {
  let t = n.selection, i = null;
  return t.ranges.length > 1 ? i = te.create([t.main]) : t.main.empty || (i = te.create([te.cursor(t.main.head)])), i ? (e(jn(n, i)), !0) : !1;
};
function Tr(n, e) {
  if (n.state.readOnly)
    return !1;
  let t = "delete.selection", { state: i } = n, s = i.changeByRange((o) => {
    let { from: r, to: l } = o;
    if (r == l) {
      let a = e(o);
      a < r ? (t = "delete.backward", a = sl(n, a, !1)) : a > r && (t = "delete.forward", a = sl(n, a, !0)), r = Math.min(r, a), l = Math.max(l, a);
    } else
      r = sl(n, r, !1), l = sl(n, l, !0);
    return r == l ? { range: o } : { changes: { from: r, to: l }, range: te.cursor(r, r < o.head ? -1 : 1) };
  });
  return s.changes.empty ? !1 : (n.dispatch(i.update(s, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? De.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function sl(n, e, t) {
  if (n instanceof De)
    for (let i of n.state.facet(De.atomicRanges).map((s) => s(n)))
      i.between(e, e, (s, o) => {
        s < e && o > e && (e = t ? o : s);
      });
  return e;
}
const Lv = (n, e, t) => Tr(n, (i) => {
  let s = i.from, { state: o } = n, r = o.doc.lineAt(s), l, a;
  if (t && !e && s > r.from && s < r.from + 200 && !/[^ \t]/.test(l = r.text.slice(0, s - r.from))) {
    if (l[l.length - 1] == "	")
      return s - 1;
    let u = pa(l, o.tabSize), c = u % Is(o) || Is(o);
    for (let h = 0; h < c && l[l.length - 1 - h] == " "; h++)
      s--;
    a = s;
  } else
    a = Qt(r.text, s - r.from, e, e) + r.from, a == s && r.number != (e ? o.doc.lines : 1) ? a += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(r.text.slice(a - r.from, s - r.from)) && (a = Qt(r.text, a - r.from, !1, !1) + r.from);
  return a;
}), xc = (n) => Lv(n, !1, !0), Ev = (n) => Lv(n, !0, !1), Iv = (n, e) => Tr(n, (t) => {
  let i = t.head, { state: s } = n, o = s.doc.lineAt(i), r = s.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (e ? o.to : o.from)) {
      i == t.head && o.number != (e ? s.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let a = Qt(o.text, i - o.from, e) + o.from, u = o.text.slice(Math.min(i, a) - o.from, Math.max(i, a) - o.from), c = r(u);
    if (l != null && c != l)
      break;
    (u != " " || i != t.head) && (l = c), i = a;
  }
  return i;
}), Bv = (n) => Iv(n, !1), tC = (n) => Iv(n, !0), nC = (n) => Tr(n, (e) => {
  let t = n.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), iC = (n) => Tr(n, (e) => {
  let t = n.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), sC = (n) => Tr(n, (e) => {
  let t = n.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), oC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: nt.of(["", ""]) },
    range: te.cursor(i.from)
  }));
  return e(n.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, rC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let s = i.from, o = n.doc.lineAt(s), r = s == o.from ? s - 1 : Qt(o.text, s - o.from, !1) + o.from, l = s == o.to ? s + 1 : Qt(o.text, s - o.from, !0) + o.from;
    return {
      changes: { from: r, to: l, insert: n.doc.slice(s, l).append(n.doc.slice(r, s)) },
      range: te.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(n.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Ma(n) {
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
function Rv(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [], s = [];
  for (let o of Ma(n)) {
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
const lC = ({ state: n, dispatch: e }) => Rv(n, e, !1), aC = ({ state: n, dispatch: e }) => Rv(n, e, !0);
function Pv(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let o of Ma(n))
    t ? i.push({ from: o.from, insert: n.doc.slice(o.from, o.to) + n.lineBreak }) : i.push({ from: o.to, insert: n.lineBreak + n.doc.slice(o.from, o.to) });
  let s = n.changes(i);
  return e(n.update({
    changes: s,
    selection: n.selection.map(s, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const uC = ({ state: n, dispatch: e }) => Pv(n, e, !1), cC = ({ state: n, dispatch: e }) => Pv(n, e, !0), hC = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: e } = n, t = e.changes(Ma(e).map(({ from: s, to: o }) => (s > 0 ? s-- : o < e.doc.length && o++, { from: s, to: o }))), i = yo(e.selection, (s) => {
    let o;
    if (n.lineWrapping) {
      let r = n.lineBlockAt(s.head), l = n.coordsAtPos(s.head, s.assoc || 1);
      l && (o = r.bottom + n.documentTop - l.bottom + n.defaultLineHeight / 2);
    }
    return n.moveVertically(s, !0, o);
  }).map(t);
  return n.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function fC(n, e) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = gi(n).resolveInner(e), i = t.childBefore(e), s = t.childAfter(e), o;
  return i && s && i.to <= e && s.from >= e && (o = i.type.prop(Je.closedBy)) && o.indexOf(s.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(s.from).from && !/\S/.test(n.sliceDoc(i.to, s.from)) ? { from: i.to, to: s.from } : null;
}
const Vd = /* @__PURE__ */ _v(!1), dC = /* @__PURE__ */ _v(!0);
function _v(n) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((s) => {
      let { from: o, to: r } = s, l = e.doc.lineAt(o), a = !n && o == r && fC(e, o);
      n && (o = r = (r <= l.to ? l : e.doc.lineAt(r)).to);
      let u = new xa(e, { simulateBreak: o, simulateDoubleBreak: !!a }), c = iv(u, o);
      for (c == null && (c = pa(/^\s*/.exec(e.doc.lineAt(o).text)[0], e.tabSize)); r < l.to && /\s/.test(l.text[r - l.from]); )
        r++;
      a ? { from: o, to: r } = a : o > l.from && o < l.from + 100 && !/\S/.test(l.text.slice(0, o)) && (o = l.from);
      let h = ["", Kl(e, c)];
      return a && h.push(Kl(e, u.lineIndent(l.from, -1))), {
        changes: { from: o, to: r, insert: nt.of(h) },
        range: te.cursor(o + 1 + h[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function kh(n, e) {
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
const pC = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new xa(n, { overrideIndentation: (o) => {
    let r = t[o];
    return r ?? -1;
  } }), s = kh(n, (o, r, l) => {
    let a = iv(i, o.from);
    if (a == null)
      return;
    /\S/.test(o.text) || (a = 0);
    let u = /^\s*/.exec(o.text)[0], c = Kl(n, a);
    (u != c || l.from < o.from + u.length) && (t[o.from] = a, r.push({ from: o.from, to: o.from + u.length, insert: c }));
  });
  return s.changes.empty || e(n.update(s, { userEvent: "indent" })), !0;
}, gC = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(kh(n, (t, i) => {
  i.push({ from: t.from, insert: n.facet(gh) });
}), { userEvent: "input.indent" })), !0), mC = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(kh(n, (t, i) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let o = pa(s, n.tabSize), r = 0, l = Kl(n, Math.max(0, o - Is(n)));
  for (; r < s.length && r < l.length && s.charCodeAt(r) == l.charCodeAt(r); )
    r++;
  i.push({ from: t.from + r, to: t.from + s.length, insert: l.slice(r) });
}), { userEvent: "delete.dedent" })), !0), vC = (n) => (n.setTabFocusMode(), !0), yC = [
  { key: "Ctrl-b", run: pv, shift: Sv, preventDefault: !0 },
  { key: "Ctrl-f", run: gv, shift: Cv },
  { key: "Ctrl-p", run: yv, shift: Tv },
  { key: "Ctrl-n", run: bv, shift: $v },
  { key: "Ctrl-a", run: RS, shift: GS },
  { key: "Ctrl-e", run: PS, shift: qS },
  { key: "Ctrl-d", run: Ev },
  { key: "Ctrl-h", run: xc },
  { key: "Ctrl-k", run: nC },
  { key: "Ctrl-Alt-h", run: Bv },
  { key: "Ctrl-o", run: oC },
  { key: "Ctrl-t", run: rC },
  { key: "Ctrl-v", run: wc }
], bC = /* @__PURE__ */ [
  { key: "ArrowLeft", run: pv, shift: Sv, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: AS, shift: VS, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: IS, shift: US, preventDefault: !0 },
  { key: "ArrowRight", run: gv, shift: Cv, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: TS, shift: HS, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: BS, shift: jS, preventDefault: !0 },
  { key: "ArrowUp", run: yv, shift: Tv, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Rd, shift: _d },
  { mac: "Ctrl-ArrowUp", run: Ed, shift: Id },
  { key: "ArrowDown", run: bv, shift: $v, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Pd, shift: Nd },
  { mac: "Ctrl-ArrowDown", run: wc, shift: Bd },
  { key: "PageUp", run: Ed, shift: Id },
  { key: "PageDown", run: wc, shift: Bd },
  { key: "Home", run: ES, shift: KS, preventDefault: !0 },
  { key: "Mod-Home", run: Rd, shift: _d },
  { key: "End", run: LS, shift: WS, preventDefault: !0 },
  { key: "Mod-End", run: Pd, shift: Nd },
  { key: "Enter", run: Vd, shift: Vd },
  { key: "Mod-a", run: YS },
  { key: "Backspace", run: xc, shift: xc, preventDefault: !0 },
  { key: "Delete", run: Ev, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: Bv, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: tC, preventDefault: !0 },
  { mac: "Mod-Backspace", run: iC, preventDefault: !0 },
  { mac: "Mod-Delete", run: sC, preventDefault: !0 }
].concat(/* @__PURE__ */ yC.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), wC = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: DS, shift: FS },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: OS, shift: zS },
  { key: "Alt-ArrowUp", run: lC },
  { key: "Shift-Alt-ArrowUp", run: uC },
  { key: "Alt-ArrowDown", run: aC },
  { key: "Shift-Alt-ArrowDown", run: cC },
  { key: "Mod-Alt-ArrowUp", run: ZS },
  { key: "Mod-Alt-ArrowDown", run: QS },
  { key: "Escape", run: eC },
  { key: "Mod-Enter", run: dC },
  { key: "Alt-l", mac: "Ctrl-l", run: XS },
  { key: "Mod-i", run: JS, preventDefault: !0 },
  { key: "Mod-[", run: mC },
  { key: "Mod-]", run: gC },
  { key: "Mod-Alt-\\", run: pC },
  { key: "Shift-Mod-k", run: hC },
  { key: "Shift-Mod-\\", run: NS },
  { key: "Mod-/", run: bS },
  { key: "Alt-A", mac: "Ctrl-A", run: xS },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: vC }
].concat(bC);
class Hd {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.diagnostic = i;
  }
}
class ys {
  constructor(e, t, i) {
    this.diagnostics = e, this.panel = t, this.selected = i;
  }
  static init(e, t, i) {
    let s = i.facet(vr).markerFilter;
    s && (e = s(e, i));
    let o = e.slice().sort((d, p) => d.from - p.from || d.to - p.to), r = new Ms(), l = [], a = 0, u = i.doc.iter(), c = 0, h = i.doc.length;
    for (let d = 0; ; ) {
      let p = d == o.length ? null : o[d];
      if (!p && !l.length)
        break;
      let v, m;
      if (l.length)
        v = a, m = l.reduce((L, E) => Math.min(L, E.to), p && p.from > v ? p.from : 1e8);
      else {
        if (v = p.from, v > h)
          break;
        m = p.to, l.push(p), d++;
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
      let O = Kv(l);
      if (b)
        r.add(v, v, Mt.widget({
          widget: new CC(O),
          diagnostics: l.slice()
        }));
      else {
        let L = l.reduce((E, I) => I.markClass ? E + " " + I.markClass : E, "");
        r.add(v, m, Mt.mark({
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
    return new ys(f, t, fo(f));
  }
}
function fo(n, e = null, t = 0) {
  let i = null;
  return n.between(t, 1e9, (s, o, { spec: r }) => {
    if (!(e && r.diagnostics.indexOf(e) < 0))
      if (!i)
        i = new Hd(s, o, e || r.diagnostics[0]);
      else {
        if (r.diagnostics.indexOf(i.diagnostic) < 0)
          return !1;
        i = new Hd(i.from, o, i.diagnostic);
      }
  }), i;
}
function Nv(n, e) {
  let t = e.pos, i = e.end || t, s = n.state.facet(vr).hideOn(n, t, i);
  if (s != null)
    return s;
  let o = n.startState.doc.lineAt(e.pos);
  return !!(n.effects.some((r) => r.is(Aa)) || n.changes.touchesRange(o.from, Math.max(o.to, i)));
}
function xC(n, e) {
  return n.field(Fn, !1) ? e : e.concat(St.appendConfig.of(IC));
}
function vu(n, e) {
  return {
    effects: xC(n, [Aa.of(e)])
  };
}
const Aa = /* @__PURE__ */ St.define(), Vv = /* @__PURE__ */ St.define(), Hv = /* @__PURE__ */ St.define(), Fn = /* @__PURE__ */ Un.define({
  create() {
    return new ys(Mt.none, null, null);
  },
  update(n, e) {
    if (e.docChanged && n.diagnostics.size) {
      let t = n.diagnostics.map(e.changes), i = null, s = n.panel;
      if (n.selected) {
        let o = e.changes.mapPos(n.selected.from, 1);
        i = fo(t, n.selected.diagnostic, o) || fo(t, null, o);
      }
      !t.size && s && e.state.facet(vr).autoPanel && (s = null), n = new ys(t, s, i);
    }
    for (let t of e.effects)
      if (t.is(Aa)) {
        let i = e.state.facet(vr).autoPanel ? t.value.length ? Ul.open : null : n.panel;
        n = ys.init(t.value, i, e.state);
      } else t.is(Vv) ? n = new ys(n.diagnostics, t.value ? Ul.open : null, n.selected) : t.is(Hv) && (n = new ys(n.diagnostics, n.panel, t.value));
    return n;
  },
  provide: (n) => [
    fc.from(n, (e) => e.panel),
    De.decorations.from(n, (e) => e.diagnostics)
  ]
}), kC = /* @__PURE__ */ Mt.mark({ class: "cm-lintRange cm-lintRange-active" });
function SC(n, e, t) {
  let { diagnostics: i } = n.state.field(Fn), s, o = -1, r = -1;
  i.between(e - (t < 0 ? 1 : 0), e + (t > 0 ? 1 : 0), (a, u, { spec: c }) => {
    if (e >= a && e <= u && (a == u || (e > a || t > 0) && (e < u || t < 0)))
      return s = c.diagnostics, o = a, r = u, !1;
  });
  let l = n.state.facet(vr).tooltipFilter;
  return s && l && (s = l(s, n.state)), s ? {
    pos: o,
    end: r,
    above: !0,
    create() {
      return { dom: Fv(n, s) };
    }
  } : null;
}
function Fv(n, e) {
  return ai("ul", { class: "cm-tooltip-lint" }, e.map((t) => Wv(n, t, !1)));
}
const Fd = (n) => {
  let e = n.state.field(Fn, !1);
  return !e || !e.panel ? !1 : (n.dispatch({ effects: Vv.of(!1) }), !0);
}, vr = /* @__PURE__ */ xe.define({
  combine(n) {
    return {
      sources: n.map((e) => e.source).filter((e) => e != null),
      ...da(n.map((e) => e.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null,
        hideOn: () => null
      }, {
        delay: Math.max,
        markerFilter: zd,
        tooltipFilter: zd,
        needsRefresh: (e, t) => e ? t ? (i) => e(i) || t(i) : e : t,
        hideOn: (e, t) => e ? t ? (i, s, o) => e(i, s, o) || t(i, s, o) : e : t,
        autoPanel: (e, t) => e || t
      })
    };
  }
});
function zd(n, e) {
  return n ? e ? (t, i) => e(n(t, i), i) : n : e;
}
function zv(n) {
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
function Wv(n, e, t) {
  var i;
  let s = t ? zv(e.actions) : [];
  return ai("li", { class: "cm-diagnostic cm-diagnostic-" + e.severity }, ai("span", { class: "cm-diagnosticText" }, e.renderMessage ? e.renderMessage(n) : e.message), (i = e.actions) === null || i === void 0 ? void 0 : i.map((o, r) => {
    let l = !1, a = (d) => {
      if (d.preventDefault(), l)
        return;
      l = !0;
      let p = fo(n.state.field(Fn).diagnostics, e);
      p && o.apply(n, p.from, p.to);
    }, { name: u } = o, c = s[r] ? u.indexOf(s[r]) : -1, h = c < 0 ? u : [
      u.slice(0, c),
      ai("u", u.slice(c, c + 1)),
      u.slice(c + 1)
    ], f = o.markClass ? " " + o.markClass : "";
    return ai("button", {
      type: "button",
      class: "cm-diagnosticAction" + f,
      onclick: a,
      onmousedown: a,
      "aria-label": ` Action: ${u}${c < 0 ? "" : ` (access key "${s[r]})"`}.`
    }, h);
  }), e.source && ai("div", { class: "cm-diagnosticSource" }, e.source));
}
class CC extends Sr {
  constructor(e) {
    super(), this.sev = e;
  }
  eq(e) {
    return e.sev == this.sev;
  }
  toDOM() {
    return ai("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
}
class Wd {
  constructor(e, t) {
    this.diagnostic = t, this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16), this.dom = Wv(e, t, !0), this.dom.id = this.id, this.dom.setAttribute("role", "option");
  }
}
class Ul {
  constructor(e) {
    this.view = e, this.items = [];
    let t = (s) => {
      if (!(s.ctrlKey || s.altKey || s.metaKey)) {
        if (s.keyCode == 27)
          Fd(this.view), this.view.focus();
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
          let { diagnostic: o } = this.items[this.selectedIndex], r = zv(o.actions);
          for (let l = 0; l < r.length; l++)
            if (r[l].toUpperCase().charCodeAt(0) == s.keyCode) {
              let a = fo(this.view.state.field(Fn).diagnostics, o);
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
    this.list = ai("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown: t,
      onclick: i
    }), this.dom = ai("div", { class: "cm-panel-lint" }, this.list, ai("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => Fd(this.view)
    }, "×")), this.update();
  }
  get selectedIndex() {
    let e = this.view.state.field(Fn).selected;
    if (!e)
      return -1;
    for (let t = 0; t < this.items.length; t++)
      if (this.items[t].diagnostic == e.diagnostic)
        return t;
    return -1;
  }
  update() {
    let { diagnostics: e, selected: t } = this.view.state.field(Fn), i = 0, s = !1, o = null, r = /* @__PURE__ */ new Set();
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
        h < 0 ? (f = new Wd(this.view, c), this.items.splice(i, 0, f), s = !0) : (f = this.items[h], h > i && (this.items.splice(i, h - i), s = !0)), t && f.diagnostic == t.diagnostic ? f.dom.hasAttribute("aria-selected") || (f.dom.setAttribute("aria-selected", "true"), o = f) : f.dom.hasAttribute("aria-selected") && f.dom.removeAttribute("aria-selected"), i++;
      }
    }); i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0); )
      s = !0, this.items.pop();
    this.items.length == 0 && (this.items.push(new Wd(this.view, {
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
    let t = this.view.state.field(Fn), i = fo(t.diagnostics, this.items[e].diagnostic);
    i && this.view.dispatch({
      selection: { anchor: i.from, head: i.to },
      scrollIntoView: !0,
      effects: Hv.of(i)
    });
  }
  static open(e) {
    return new Ul(e);
  }
}
function xl(n, e = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(n)}</svg>')`;
}
function ol(n) {
  return xl(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${n}" fill="none" stroke-width=".7"/>`, 'width="6" height="3"');
}
const MC = /* @__PURE__ */ De.baseTheme({
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
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ ol("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ ol("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ ol("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ ol("#66d") },
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
function AC(n) {
  return n == "error" ? 4 : n == "warning" ? 3 : n == "info" ? 2 : 1;
}
function Kv(n) {
  let e = "hint", t = 1;
  for (let i of n) {
    let s = AC(i.severity);
    s > t && (t = s, e = i.severity);
  }
  return e;
}
class Uv extends is {
  constructor(e) {
    super(), this.diagnostics = e, this.severity = Kv(e);
  }
  toDOM(e) {
    let t = document.createElement("div");
    t.className = "cm-lint-marker cm-lint-marker-" + this.severity;
    let i = this.diagnostics, s = e.state.facet(Ta).tooltipFilter;
    return s && (i = s(i, e.state)), i.length && (t.onmouseover = () => $C(e, t, i)), t;
  }
}
function TC(n, e) {
  let t = (i) => {
    let s = e.getBoundingClientRect();
    if (!(i.clientX > s.left - 10 && i.clientX < s.right + 10 && i.clientY > s.top - 10 && i.clientY < s.bottom + 10)) {
      for (let o = i.target; o; o = o.parentNode)
        if (o.nodeType == 1 && o.classList.contains("cm-tooltip-lint"))
          return;
      window.removeEventListener("mousemove", t), n.state.field(jv) && n.dispatch({ effects: Sh.of(null) });
    }
  };
  window.addEventListener("mousemove", t);
}
function $C(n, e, t) {
  function i() {
    let r = n.elementAtHeight(e.getBoundingClientRect().top + 5 - n.documentTop);
    n.coordsAtPos(r.from) && n.dispatch({ effects: Sh.of({
      pos: r.from,
      above: !1,
      clip: !1,
      create() {
        return {
          dom: Fv(n, t),
          getCoords: () => e.getBoundingClientRect()
        };
      }
    }) }), e.onmouseout = e.onmousemove = null, TC(n, e);
  }
  let { hoverTime: s } = n.state.facet(Ta), o = setTimeout(i, s);
  e.onmouseout = () => {
    clearTimeout(o), e.onmouseout = e.onmousemove = null;
  }, e.onmousemove = () => {
    clearTimeout(o), o = setTimeout(i, s);
  };
}
function DC(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of e) {
    let o = n.lineAt(s.from);
    (t[o.from] || (t[o.from] = [])).push(s);
  }
  let i = [];
  for (let s in t)
    i.push(new Uv(t[s]).range(+s));
  return Ye.of(i, !0);
}
const OC = /* @__PURE__ */ wk({
  class: "cm-gutter-lint",
  markers: (n) => n.state.field(kc),
  widgetMarker: (n, e, t) => {
    let i = [];
    return n.state.field(kc).between(t.from, t.to, (s, o, r) => {
      s > t.from && s < t.to && i.push(...r.diagnostics);
    }), i.length ? new Uv(i) : null;
  }
}), kc = /* @__PURE__ */ Un.define({
  create() {
    return Ye.empty;
  },
  update(n, e) {
    n = n.map(e.changes);
    let t = e.state.facet(Ta).markerFilter;
    for (let i of e.effects)
      if (i.is(Aa)) {
        let s = i.value;
        t && (s = t(s || [], e.state)), n = DC(e.state.doc, s.slice(0));
      }
    return n;
  }
}), Sh = /* @__PURE__ */ St.define(), jv = /* @__PURE__ */ Un.define({
  create() {
    return null;
  },
  update(n, e) {
    return n && e.docChanged && (n = Nv(e, n) ? null : { ...n, pos: e.changes.mapPos(n.pos) }), e.effects.reduce((t, i) => i.is(Sh) ? i.value : t, n);
  },
  provide: (n) => ch.from(n)
}), LC = /* @__PURE__ */ De.baseTheme({
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
    content: /* @__PURE__ */ xl('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')
  },
  ".cm-lint-marker-warning": {
    content: /* @__PURE__ */ xl('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')
  },
  ".cm-lint-marker-error": {
    content: /* @__PURE__ */ xl('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')
  }
}), EC = /* @__PURE__ */ gk(SC, { hideOn: Nv }), IC = [
  Fn,
  /* @__PURE__ */ De.decorations.compute([Fn], (n) => {
    let { selected: e, panel: t } = n.field(Fn);
    return !e || !t || e.from == e.to ? Mt.none : Mt.set([
      kC.range(e.from, e.to)
    ]);
  }),
  EC,
  MC
], Ta = /* @__PURE__ */ xe.define({
  combine(n) {
    return da(n, {
      hoverTime: 300,
      markerFilter: null,
      tooltipFilter: null
    });
  }
});
function BC(n = {}) {
  return [Ta.of(n), kc, OC, LC, jv];
}
const Kd = /* @__PURE__ */ tn({
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
    const l = vh.define({
      token(f) {
        return f.sol() && f.match(/^%.*/) ? "comment" : f.sol() && f.match(/^[A-Za-z]:.*/) ? "meta" : f.match(/^"[^"\n]*"/) ? "string" : f.match(/^\[K:[^\]\n]*\]/) ? "meta" : f.eat("|") ? "punctuation" : f.match(/^[zZ][0-9]*/) ? "atom" : f.match(/^(\^\^|__|\^|_|=)?[A-Ga-g][,']*[0-9]*-?/) ? "variableName" : (f.next(), null);
      },
      startState: () => null
    }), a = ka.define([
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
      return t.diagnostics.filter((p) => typeof p.start == "number" && typeof p.end == "number").map((p) => ({
        from: Math.min(p.start, d),
        to: Math.min(Math.max(p.end, p.start), d),
        severity: p.severity === "error" ? "error" : p.severity === "warning" ? "warning" : "info",
        message: p.message
      }));
    }
    kr(() => {
      s.value && (o = new De({
        parent: s.value,
        state: rt.create({
          doc: t.text,
          extensions: [
            Tk(),
            Qx(),
            sk(),
            zm.of(wC),
            l,
            sS(a),
            BC(),
            u,
            De.lineWrapping,
            rt.readOnly.of(!!t.readonly),
            De.contentAttributes.of({ "aria-label": "Score as ABC text", spellcheck: "false" }),
            De.updateListener.of((f) => {
              f.docChanged && !r && i("change", f.state.doc.toString()), f.selectionSet && !r && f.transactions.some((d) => d.isUserEvent("select")) && i("cursor", f.state.selection.main.head);
            })
          ]
        })
      }), o.dispatch(vu(o.state, c(o.state))));
    }), Li(() => o?.destroy()), Ge(
      () => t.text,
      (f) => {
        if (!o || o.state.doc.toString() === f) return;
        r = !0;
        const d = Math.min(o.state.selection.main.head, f.length);
        o.dispatch({ changes: { from: 0, to: o.state.doc.length, insert: f }, selection: { anchor: d } }), r = !1, o.dispatch(vu(o.state, c(o.state)));
      }
    ), Ge(
      () => t.diagnostics,
      () => {
        o && o.dispatch(vu(o.state, c(o.state)));
      }
    ), Ge(
      () => t.reveal,
      (f) => {
        if (!o || !f) return;
        const d = o.state.doc.length, [p, v] = [Math.min(f[0], d), Math.min(f[1], d)], m = o.state.selection.main;
        m.from === p && m.to === v || (r = !0, o.dispatch({ selection: te.single(p, v) }), r = !1, h(o, p));
      }
    );
    function h(f, d) {
      const p = f.scrollDOM, v = f.lineBlockAt(d);
      (v.top < p.scrollTop || v.bottom > p.scrollTop + p.clientHeight) && (p.scrollTop = Math.max(0, v.top - p.clientHeight / 3));
    }
    return (f, d) => (k(), M("div", {
      ref_key: "host",
      ref: s,
      class: "abc-editor"
    }, null, 512));
  }
}), si = 18, ms = 24, Si = si + ms, Po = 22, _o = 34, Sn = 36, RC = 6, Ud = 3, PC = 12, Gv = 6, qv = 28, _C = 21, NC = 108;
function Ch(n) {
  return [
    ...n.tracks.vocal.map((e) => ({ ...e, track: "vocal" })),
    ...n.tracks.ins.map((e) => ({ ...e, track: "ins" }))
  ];
}
function $a(n) {
  const e = Number(n.unit.split("/")[1]);
  return Number.isFinite(e) && e > 0 ? e : 32;
}
function VC(n, e) {
  return e === "auto" ? Math.max(1, n.grid.snap) : Math.max(1, Math.round($a(n) / e));
}
function HC(n, e = 4, t = 24) {
  let i = n.length ? Math.min(...n.map((o) => o.pitch)) - e : 60, s = n.length ? Math.max(...n.map((o) => o.pitch)) + e : 79;
  if (s - i + 1 < t) {
    const o = t - (s - i + 1);
    i -= Math.floor(o / 2), s += Math.ceil(o / 2);
  }
  return i < 0 && ([i, s] = [0, Math.min(127, s - i)]), s > 127 && ([i, s] = [Math.max(0, i - (s - 127)), 127]), [i, s];
}
function FC(n) {
  const e = n.map((s) => s.pitch), t = Math.max(0, Math.min(_C, ...e.map((s) => s - 2))), i = Math.min(127, Math.max(NC, ...e.map((s) => s + 2)));
  return [t, i];
}
function zC(n, e) {
  const t = Si + (e.lyrics ? Po : 0), i = t + (e.source ? _o : 0), s = Ch(n), [o, r] = FC(s), l = r - o + 1, a = e.pxPerQuarter / Math.max(n.grid.units_per_quarter, 1e-9), u = Math.max(Gv, Math.min(qv, Math.round(e.rowHeight ?? PC))), c = VC(n, e.snap), h = Math.max(1, Math.round(n.grid.units_per_quarter));
  return {
    pxPerUnit: a,
    rowHeight: u,
    high: r,
    low: o,
    focus: HC(s),
    total: n.total,
    snap: c,
    drawLength: Math.max(c, Math.round(h / c) * c),
    width: Sn + n.total * a + 40,
    height: i + l * u,
    top: i,
    sourceTop: e.source ? t : null
  };
}
const ot = (n, e) => Sn + n * e.pxPerUnit, ni = (n, e) => (n - Sn) / e.pxPerUnit, po = (n, e) => e.top + (e.high - n) * e.rowHeight;
function Yv(n, e, t, i) {
  const s = (po(i, n) + po(t, n) + n.rowHeight) / 2, o = Math.max(0, e - n.top), r = s - n.top - o / 2;
  return Math.round(Math.max(0, Math.min(Math.max(0, n.height - e), r)));
}
function jd(n, e, t, i) {
  const s = po(i, n);
  return s >= e + n.top && s + n.rowHeight <= e + t ? null : Yv(n, t, i, i);
}
function jl(n, e) {
  const t = e.high - Math.floor((n - e.top) / e.rowHeight);
  return Math.max(e.low, Math.min(e.high, t));
}
const Sc = (n, e) => Math.floor(n / e) * e, rl = (n, e) => Math.round(n / e) * e;
function Ui(n, e) {
  return {
    x: ot(n.onset, e),
    y: po(n.pitch, e) + 0.5,
    width: Math.max(2, n.duration * e.pxPerUnit - 1),
    height: Math.max(2, e.rowHeight - 1)
  };
}
function Gl(n, e, t) {
  const i = n.name.length * 7 + 10, s = e ? (e.onset - n.onset) * t.pxPerUnit - 2 : i;
  return Math.max(12, Math.min(i, s));
}
const WC = (n) => [1, 3, 6, 8, 10].includes((n % 12 + 12) % 12);
function KC(n) {
  return `C${Math.floor(n / 12) - 1}`;
}
function UC(n) {
  const e = [];
  for (const t of n.measures) {
    e.push({ unit: t.onset, kind: "bar", bar: t.n });
    const i = Number(t.meter.split("/")[0]) || 1, s = t.length / i;
    for (let o = 1; o < i; o++) e.push({ unit: t.onset + o * s, kind: "beat" });
  }
  return e;
}
function Gd(n, e, t, i, s, o, r = 0, l = 0) {
  const a = Math.max(0, Math.min(s.total, ni(n, s))), u = e - r;
  if (u < si) return { area: "header", unit: a };
  if (s.sourceTop !== null && u >= s.sourceTop && u < s.top) return { area: "source", unit: a };
  if (u >= Si && u < s.top) return { area: "lyrics", unit: a };
  if (u < Si) {
    for (let f = i.length - 1; f >= 0; f--) {
      const d = i[f], p = ot(d.onset, s);
      if (n >= p && n <= p + Gl(d, i[f + 1], s)) return { area: "chord", chord: d };
    }
    return { area: "lane", unit: a };
  }
  if (n - l < Sn) return { area: "keys", pitch: jl(e, s) };
  const c = t.filter((f) => {
    const d = Ui(f, s);
    return n >= d.x && n <= d.x + d.width && e >= d.y - 0.5 && e <= d.y + d.height + 0.5;
  }), h = c.find((f) => f.track === o) ?? c[0];
  if (h) {
    const f = Ui(h, s), d = n >= f.x + f.width - Math.min(RC, f.width / 3) ? "end" : "body";
    return { area: "note", note: h, edge: d };
  }
  return { area: "grid", unit: a, pitch: jl(e, s) };
}
function Xv(n, e, t) {
  return n.y0 < (n.from?.scrollTop ?? t) + e || n.y1 < t + e;
}
function Jv(n, e, t = 0, i = 0) {
  const s = n.from?.scrollTop ?? t, o = n.from?.scrollLeft ?? i, r = (f, d) => Math.max(d + Sn, Math.min(e.width, f)), l = (f, d) => Math.max(d + e.top, Math.min(e.height, f)), a = [r(n.x0, o), r(n.x1, i)], u = [l(n.y0, s), l(n.y1, t)], c = Math.min(...a), h = Math.min(...u);
  return { x: c, y: h, width: Math.max(...a) - c, height: Math.max(...u) - h };
}
function jC(n, e = 0, t = Si) {
  return Xv(n, t, e);
}
function GC(n, e, t) {
  return e.width <= 0 || e.height <= 0 ? [] : n.filter((i) => {
    const s = Ui(i, t);
    return s.x < e.x + e.width && s.x + s.width > e.x && s.y < e.y + e.height && s.y + s.height > e.y;
  });
}
function qC(n, e, t, i = 0, s = 0) {
  if (!Xv(e, t.top, i)) return [];
  const o = Jv(e, t, i, s);
  return o.width <= 0 ? [] : n.filter((r, l) => {
    const a = ot(r.onset, t);
    return a < o.x + o.width && a + Gl(r, n[l + 1], t) > o.x;
  });
}
function YC(n, e, t, i) {
  return { kind: "move", notes: n, anchor: e, fromUnit: t, fromPitch: i, delta: 0, semitones: 0 };
}
function XC(n, e = [], t = 1 / 0) {
  const i = e.filter((o) => o.track === n.track && o.onset > n.onset).map((o) => o.onset), s = Math.min(t, ...i);
  return { kind: "resize", note: n, end: n.onset + n.duration, overwrite: !1, limit: s };
}
function JC(n, e, t, i) {
  const s = Math.max(0, Math.min(Sc(e, i.snap), i.total - 1));
  return { kind: "draw", track: n, start: s, end: Math.min(i.total, s + i.snap), pitch: t };
}
function ZC(n, e = n.onset) {
  return { kind: "chord", chord: n, fromUnit: e, to: n.onset };
}
const No = (n, e, t) => Math.max(e, Math.min(t, n));
function QC(n, e, t, i, s) {
  switch (n.kind) {
    case "move": {
      const o = n.anchor.onset + (e - n.fromUnit), r = Math.min(...n.notes.map((f) => f.onset)), l = Math.max(...n.notes.map((f) => f.onset + f.duration)), a = No(rl(o, i.snap) - n.anchor.onset, -r, i.total - l), u = Math.min(...n.notes.map((f) => f.pitch)), c = Math.max(...n.notes.map((f) => f.pitch)), h = No(t - n.fromPitch, -u, 127 - c);
      return { ...n, delta: a, semitones: h, copy: s.alt };
    }
    case "resize": {
      const o = Math.min(i.snap, i.total - n.note.onset), r = s.alt ? i.total : Math.max(n.note.onset + n.note.duration, Math.min(i.total, n.limit)), l = No(rl(e, i.snap), n.note.onset + Math.max(1, o), r);
      return { ...n, end: Math.min(l, r), overwrite: s.alt };
    }
    case "draw": {
      const o = e <= n.start ? n.start + i.snap : Math.max(n.start + i.snap, rl(e, i.snap));
      return { ...n, end: Math.min(i.total, o) };
    }
    case "chord":
      return { ...n, to: No(rl(n.chord.onset + e - n.fromUnit, i.snap), 0, i.total - 1) };
  }
}
function e2(n, e) {
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
function t2(n) {
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
function n2(n) {
  return n ? n.kind === "move" ? n.copy ? /* @__PURE__ */ new Set() : new Set(n.notes.map((e) => e.id)) : n.kind === "resize" ? /* @__PURE__ */ new Set([n.note.id]) : /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set();
}
function i2(n, e, t, i, s, o) {
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
      const a = e.shift ? s.drawLength : s.snap, u = Math.min(...t.map((f) => f.onset)), c = Math.max(...t.map((f) => f.onset + f.duration)), h = No(l * a, -u, s.total - c);
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
const s2 = /^(vocal|ins):\d+$/;
function go(n, e) {
  const t = n?.model?.tracks, i = /* @__PURE__ */ new Set();
  if (!t) return i;
  const s = /* @__PURE__ */ new Map();
  for (const o of [...t.vocal, ...t.ins]) for (const r of o.segments) s.set(r, o.id);
  for (const o of e)
    if (s2.test(o)) i.add(o);
    else {
      const r = s.get(o);
      r && i.add(r);
    }
  return i;
}
function yr(n) {
  return new Set(n.filter((e) => e.startsWith("chord:")));
}
function ll(n, e = []) {
  return [...n.flatMap((t) => t.segments.length ? t.segments : [t.id]), ...e.map((t) => t.id)];
}
const Zv = [
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
], o2 = ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "9/8", "12/8", "2/2", "3/8"];
function Qv(n, e) {
  let t = null;
  for (const i of n.measures) i.onset <= e && (t = i);
  return t;
}
function ey(n, e, t) {
  const i = n?.model;
  if (!i) return { notes: [], chords: [], chordAtNote: null, measure: null };
  const s = go(n, e), o = yr(e), r = Ch(i).filter((h) => s.has(h.id)), l = i.tracks.chords.filter((h) => o.has(h.id)), a = r.length === 1 ? i.tracks.chords.find((h) => h.onset === r[0].onset) ?? null : null, u = r[0]?.onset ?? l[0]?.onset, c = u !== void 0 ? Qv(i, u) : t ? i.measures[t - 1] ?? null : null;
  return { notes: r, chords: l, chordAtNote: a, measure: c };
}
function r2(n, e) {
  const t = Qv(n, e) ?? n.measures[0], i = e - t.onset, s = Number(t.meter.split("/")[0]) || 1, o = t.length / s, r = Math.floor(i / o) + 1, l = i - (r - 1) * o, a = $a(n), u = l ? ` + ${l}/${a}` : "";
  return { bar: t.n, offset: i, beat: r, tick: l, text: `bar ${t.n} · beat ${r}${u}` };
}
function l2(n, e, t) {
  const i = n.measures[e - 1];
  return !i || !Number.isInteger(t) || t < 0 || t >= i.length ? null : i.onset + t;
}
const a2 = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, u2 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function Cc(n) {
  return `${u2[n % 12]}${Math.floor(n / 12) - 1}`;
}
function c2(n) {
  const e = n.trim();
  if (/^\d{1,3}$/.test(e)) {
    const o = Number(e);
    return o <= 127 ? o : null;
  }
  const t = /^([A-Ga-g])(##|#|bb|b)?(-?\d)$/.exec(e);
  if (!t) return null;
  const i = { "#": 1, "##": 2, b: -1, bb: -2 }[t[2] ?? ""] ?? 0, s = (Number(t[3]) + 1) * 12 + a2[t[1].toUpperCase()] + i;
  return s >= 0 && s <= 127 ? s : null;
}
function h2(n) {
  const e = $a(n), t = [];
  for (const i of [32, 16, 8, 4, 2, 1]) {
    e % i === 0 && t.push({ label: `1/${i}`, units: e / i });
    const s = e / i * 1.5;
    i >= 2 && i <= 16 && Number.isInteger(s) && t.push({ label: `1/${i}.`, units: s });
  }
  return t.sort((i, s) => i.units - s.units);
}
function f2(n, e) {
  return !n.length || n.every((t) => t.pitch === e) ? null : { op: "set_note_pitch", ids: n.map((t) => t.id), midi: e };
}
function Pi(n, e, t = []) {
  return !n.length && !t.length || n.some((i) => i.pitch + e < 0 || i.pitch + e > 127) ? null : { op: "set_note_pitch", ids: [...n.map((i) => i.id), ...t.map((i) => i.id)], semitones: e };
}
function qd(n, e) {
  return !n.length || n.every((t) => t.track === e) ? null : { op: "move_notes", ids: n.map((t) => t.id), track: e };
}
function d2(n, e, t) {
  return t === null || t === e.onset || t + e.duration > n.total ? null : { op: "move_notes", ids: [e.id], delta: t - e.onset };
}
function p2(n, e, t, i) {
  return !Number.isInteger(t) || t < 1 || t === e.duration || e.onset + t > n.total ? null : { op: "resize_note", id: e.id, duration: t, mode: i };
}
function g2(n, e, t) {
  const i = e.trim();
  return i ? t?.name === i ? null : { op: "put_chord", onset: n, name: i } : t ? { op: "delete_chord", onset: n } : null;
}
function m2(n, e) {
  return e === null || e === n.onset ? null : { op: "move_chord", onset: n.onset, to: e };
}
function Yd(n, e, t = 1) {
  return { op: "insert_measures", bar: e === "before" ? n.n : n.n + 1, count: t };
}
function v2(n, e = 1) {
  return { op: "duplicate_measures", bar: n.n, count: e };
}
function y2(n, e, t = 1) {
  return n.measures.length > t ? { op: "delete_measures", bar: e.n, count: t } : null;
}
function Xd(n, e) {
  const t = e.trim();
  return !/^\d+\/\d+$/.test(t) || t === n.meter ? null : { op: "change_meter", bar: n.n, count: 1, meter: t };
}
function ty(n, e) {
  return n.keys.find((t) => t.onset === e.onset && t.onset > 0) ?? null;
}
function b2(n, e) {
  return !Zv.includes(e) || e === n.key ? null : { op: "put_key", onset: n.onset, key: e };
}
function w2(n, e) {
  const t = ty(n, e);
  return t ? { op: "delete_key", onset: t.onset } : null;
}
function x2(n, e) {
  return n === "text" ? "text" : n === "daw" ? "daw" : n === "review" ? "review" : e;
}
const k2 = {
  class: "inspector",
  "aria-label": "Inspector"
}, S2 = {
  key: 0,
  class: "facts"
}, C2 = {
  key: 0,
  class: "panel",
  "aria-label": "Selected notes"
}, M2 = {
  key: 0,
  class: "facts"
}, A2 = {
  class: "field",
  role: "group",
  "aria-label": "Voice"
}, T2 = ["disabled"], $2 = ["disabled"], D2 = {
  class: "field",
  role: "group",
  "aria-label": "Pitch"
}, O2 = ["disabled"], L2 = ["disabled"], E2 = ["disabled", "onKeydown"], I2 = ["disabled"], B2 = ["disabled"], R2 = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, P2 = ["disabled", "onKeydown"], _2 = ["disabled", "aria-label", "onKeydown"], N2 = { class: "facts" }, V2 = {
  class: "field",
  role: "group",
  "aria-label": "Length"
}, H2 = ["disabled", "aria-label"], F2 = ["disabled"], z2 = ["value"], W2 = {
  class: "field",
  title: "Longer notes play over the following notes of the voice (they are shortened or removed)"
}, K2 = ["disabled"], U2 = {
  class: "field",
  role: "group",
  "aria-label": "Chord symbol at the note"
}, j2 = ["disabled", "onKeydown"], G2 = { class: "field" }, q2 = ["disabled"], Y2 = ["disabled"], X2 = {
  key: 1,
  class: "panel",
  "aria-label": "Selected chord symbol"
}, J2 = {
  key: 0,
  class: "facts"
}, Z2 = { class: "field" }, Q2 = ["disabled", "onKeydown"], eM = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbol"
}, tM = ["disabled"], nM = ["disabled"], iM = {
  class: "field",
  role: "group",
  "aria-label": "Start"
}, sM = ["disabled", "onKeydown"], oM = ["disabled", "onKeydown"], rM = { class: "field" }, lM = ["disabled"], aM = {
  key: 2,
  class: "panel",
  "aria-label": "Selected chord symbols"
}, uM = { class: "facts" }, cM = {
  class: "field",
  role: "group",
  "aria-label": "Transpose the chord symbols"
}, hM = ["disabled"], fM = ["disabled"], dM = { class: "field" }, pM = ["disabled"], gM = ["aria-label"], mM = { class: "facts" }, vM = {
  class: "field",
  role: "group",
  "aria-label": "Bars"
}, yM = ["disabled"], bM = ["disabled"], wM = ["disabled"], xM = ["disabled"], kM = {
  class: "field",
  role: "group",
  "aria-label": "Meter"
}, SM = ["disabled"], CM = { id: "plenio-meters" }, MM = ["value"], AM = {
  class: "field",
  role: "group",
  "aria-label": "Key"
}, TM = ["disabled"], $M = ["value"], DM = ["disabled"], OM = {
  key: 4,
  class: "facts"
}, LM = {
  key: 5,
  class: "error"
}, EM = /* @__PURE__ */ tn({
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
    const e = n, t = N(() => e.view?.model ?? null), i = N(() => ey(e.view, e.selection, e.fallbackBar)), s = N(() => i.value.notes.length === 1 ? i.value.notes[0] : null), o = N(() => i.value.chords.length === 1 && !i.value.notes.length ? i.value.chords[0] : null), r = N(() => i.value.measure), l = N(() => !e.readonly && !e.stale && !e.busy), a = N(() => t.value ? h2(t.value) : []), u = N(() => t.value && r.value ? ty(t.value, r.value) : null), c = N(() => {
      const j = s.value?.onset ?? o.value?.onset;
      return t.value && j !== void 0 ? r2(t.value, j) : null;
    }), h = N(() => {
      const j = new Set(i.value.notes.map((D) => D.track));
      return j.size === 1 ? [...j][0] : j.size ? "mixed" : null;
    }), f = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(1), p = /* @__PURE__ */ G(0), v = /* @__PURE__ */ G(1), m = /* @__PURE__ */ G(!1), b = /* @__PURE__ */ G(""), O = /* @__PURE__ */ G("4/4"), L = /* @__PURE__ */ G("C");
    Ge(
      [s, o, r, () => i.value.chordAtNote],
      () => {
        const j = s.value;
        f.value = j ? Cc(j.pitch) : "", v.value = j?.duration ?? 1, d.value = c.value?.bar ?? 1, p.value = c.value?.offset ?? 0, b.value = (j ? i.value.chordAtNote?.name : o.value?.name) ?? "", O.value = r.value?.meter ?? "4/4", L.value = r.value?.key ?? "C";
      },
      { immediate: !0 }
    );
    const E = /* @__PURE__ */ G(null);
    async function I(j) {
      !j || !l.value || (E.value = null, await e.operate(j));
    }
    function z() {
      const j = c2(f.value);
      if (j === null) {
        E.value = `"${f.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`, f.value = s.value ? Cc(s.value.pitch) : "";
        return;
      }
      I(f2(i.value.notes, j));
    }
    function R() {
      const j = t.value;
      if (!j) return;
      const D = l2(j, Number(d.value), Number(p.value));
      if (D === null) {
        E.value = "That position is not in the score (bar, and units from the start of the bar).";
        return;
      }
      s.value ? I(d2(j, s.value, D)) : o.value && I(m2(o.value, D));
    }
    function Y(j = Number(v.value)) {
      const D = t.value;
      !D || !s.value || I(p2(D, s.value, j, m.value ? "overwrite" : e.resizeMode));
    }
    function K() {
      const j = s.value?.onset ?? o.value?.onset;
      j !== void 0 && I(g2(j, b.value, s.value ? i.value.chordAtNote : o.value));
    }
    function re(j) {
      const D = [...i.value.notes.map((U) => U.id), ...i.value.chords.map((U) => U.id)];
      D.length && I({ op: j ? "delete_close_gap" : "delete", ids: D });
    }
    return (j, D) => (k(), M("aside", k2, [
      t.value ? (k(), M(me, { key: 1 }, [
        i.value.notes.length ? (k(), M("section", C2, [
          g("h4", null, [
            be(F(s.value ? `${h.value === "vocal" ? "Vocal" : "Ins"} note` : `${i.value.notes.length} notes`) + " ", 1),
            c.value ? (k(), M("span", M2, F(c.value.text), 1)) : ee("", !0)
          ]),
          g("div", A2, [
            D[36] || (D[36] = g("span", { class: "name" }, "voice", -1)),
            g("button", {
              class: qe({ active: h.value === "vocal" }),
              disabled: !l.value,
              onClick: D[0] || (D[0] = (U) => I(H(qd)(i.value.notes, "vocal")))
            }, "Vocal", 10, T2),
            g("button", {
              class: qe({ active: h.value === "ins" }),
              disabled: !l.value,
              onClick: D[1] || (D[1] = (U) => I(H(qd)(i.value.notes, "ins")))
            }, "Ins", 10, $2)
          ]),
          g("div", D2, [
            D[37] || (D[37] = g("span", { class: "name" }, "pitch", -1)),
            g("button", {
              disabled: !l.value,
              title: "Octave down",
              onClick: D[2] || (D[2] = (U) => I(H(Pi)(i.value.notes, -12, i.value.chords)))
            }, "−8va", 8, O2),
            g("button", {
              disabled: !l.value,
              title: "Semitone down",
              onClick: D[3] || (D[3] = (U) => I(H(Pi)(i.value.notes, -1, i.value.chords)))
            }, "−1", 8, L2),
            s.value ? We((k(), M("input", {
              key: 0,
              "onUpdate:modelValue": D[4] || (D[4] = (U) => f.value = U),
              class: "pitch",
              disabled: !l.value,
              "aria-label": "Pitch (e.g. C#5 or a MIDI number)",
              onKeydown: Et(ft(z, ["prevent"]), ["enter"]),
              onChange: z
            }, null, 40, E2)), [
              [Nt, f.value]
            ]) : ee("", !0),
            g("button", {
              disabled: !l.value,
              title: "Semitone up",
              onClick: D[5] || (D[5] = (U) => I(H(Pi)(i.value.notes, 1, i.value.chords)))
            }, "+1", 8, I2),
            g("button", {
              disabled: !l.value,
              title: "Octave up",
              onClick: D[6] || (D[6] = (U) => I(H(Pi)(i.value.notes, 12, i.value.chords)))
            }, "+8va", 8, B2)
          ]),
          s.value ? (k(), M(me, { key: 0 }, [
            g("div", R2, [
              D[38] || (D[38] = g("span", { class: "name" }, "start", -1)),
              D[39] || (D[39] = be(" bar ", -1)),
              We(g("input", {
                "onUpdate:modelValue": D[7] || (D[7] = (U) => d.value = U),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": "Bar",
                onKeydown: Et(ft(R, ["prevent"]), ["enter"]),
                onChange: R
              }, null, 40, P2), [
                [
                  Nt,
                  d.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              D[40] || (D[40] = be(" + ", -1)),
              We(g("input", {
                "onUpdate:modelValue": D[8] || (D[8] = (U) => p.value = U),
                class: "number",
                type: "number",
                min: "0",
                disabled: !l.value,
                "aria-label": `Units of ${t.value.unit} from the start of the bar`,
                onKeydown: Et(ft(R, ["prevent"]), ["enter"]),
                onChange: R
              }, null, 40, _2), [
                [
                  Nt,
                  p.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              g("span", N2, "× " + F(t.value.unit), 1)
            ]),
            g("div", V2, [
              D[42] || (D[42] = g("span", { class: "name" }, "length", -1)),
              We(g("input", {
                "onUpdate:modelValue": D[9] || (D[9] = (U) => v.value = U),
                class: "number",
                type: "number",
                min: "1",
                disabled: !l.value,
                "aria-label": `Length in units of ${t.value.unit}`,
                onKeydown: D[10] || (D[10] = Et(ft((U) => Y(), ["prevent"]), ["enter"])),
                onChange: D[11] || (D[11] = (U) => Y())
              }, null, 40, H2), [
                [
                  Nt,
                  v.value,
                  void 0,
                  { number: !0 }
                ]
              ]),
              g("select", {
                disabled: !l.value,
                "aria-label": "Length as a note value",
                value: "",
                onChange: D[12] || (D[12] = (U) => Y(Number(U.target.value)))
              }, [
                D[41] || (D[41] = g("option", {
                  value: "",
                  disabled: ""
                }, "note value…", -1)),
                (k(!0), M(me, null, Ie(a.value, (U) => (k(), M("option", {
                  key: U.label,
                  value: U.units
                }, F(U.label), 9, z2))), 128))
              ], 40, F2)
            ]),
            g("label", W2, [
              We(g("input", {
                "onUpdate:modelValue": D[13] || (D[13] = (U) => m.value = U),
                type: "checkbox",
                disabled: !l.value
              }, null, 8, K2), [
                [hn, m.value]
              ]),
              D[43] || (D[43] = be(" longer: over the next note ", -1))
            ]),
            g("div", U2, [
              D[44] || (D[44] = g("span", { class: "name" }, "chord", -1)),
              We(g("input", {
                "onUpdate:modelValue": D[14] || (D[14] = (U) => b.value = U),
                class: "chord",
                placeholder: "none",
                disabled: !l.value,
                "aria-label": "Chord symbol where the note starts (empty removes it)",
                onKeydown: Et(ft(K, ["prevent"]), ["enter"]),
                onChange: K
              }, null, 40, j2), [
                [Nt, b.value]
              ])
            ])
          ], 64)) : ee("", !0),
          g("div", G2, [
            g("button", {
              disabled: !l.value,
              title: "The notes become rests; bars keep their length (Delete)",
              onClick: D[15] || (D[15] = (U) => re(!1))
            }, "→ rest", 8, q2),
            g("button", {
              disabled: !l.value,
              title: "Delete, and let the note before take the time (Shift+Delete)",
              onClick: D[16] || (D[16] = (U) => re(!0))
            }, "close gap", 8, Y2)
          ])
        ])) : o.value ? (k(), M("section", X2, [
          g("h4", null, [
            D[45] || (D[45] = be(" Chord symbol ", -1)),
            c.value ? (k(), M("span", J2, F(c.value.text), 1)) : ee("", !0)
          ]),
          g("div", Z2, [
            D[46] || (D[46] = g("span", { class: "name" }, "name", -1)),
            We(g("input", {
              "onUpdate:modelValue": D[17] || (D[17] = (U) => b.value = U),
              class: "chord",
              disabled: !l.value,
              "aria-label": "Chord symbol (empty removes it)",
              onKeydown: Et(ft(K, ["prevent"]), ["enter"]),
              onChange: K
            }, null, 40, Q2), [
              [Nt, b.value]
            ])
          ]),
          g("div", eM, [
            D[47] || (D[47] = g("span", { class: "name" }, "pitch", -1)),
            g("button", {
              disabled: !l.value,
              title: "A semitone down (↓), spelled for the key",
              onClick: D[18] || (D[18] = (U) => I(H(Pi)([], -1, i.value.chords)))
            }, "−1", 8, tM),
            g("button", {
              disabled: !l.value,
              title: "A semitone up (↑), spelled for the key",
              onClick: D[19] || (D[19] = (U) => I(H(Pi)([], 1, i.value.chords)))
            }, "+1", 8, nM)
          ]),
          g("div", iM, [
            D[48] || (D[48] = g("span", { class: "name" }, "start", -1)),
            D[49] || (D[49] = be(" bar ", -1)),
            We(g("input", {
              "onUpdate:modelValue": D[20] || (D[20] = (U) => d.value = U),
              class: "number",
              type: "number",
              min: "1",
              disabled: !l.value,
              "aria-label": "Bar",
              onKeydown: Et(ft(R, ["prevent"]), ["enter"]),
              onChange: R
            }, null, 40, sM), [
              [
                Nt,
                d.value,
                void 0,
                { number: !0 }
              ]
            ]),
            D[50] || (D[50] = be(" + ", -1)),
            We(g("input", {
              "onUpdate:modelValue": D[21] || (D[21] = (U) => p.value = U),
              class: "number",
              type: "number",
              min: "0",
              disabled: !l.value,
              "aria-label": "Units from the start of the bar",
              onKeydown: Et(ft(R, ["prevent"]), ["enter"]),
              onChange: R
            }, null, 40, oM), [
              [
                Nt,
                p.value,
                void 0,
                { number: !0 }
              ]
            ])
          ]),
          g("div", rM, [
            g("button", {
              disabled: !l.value,
              onClick: D[22] || (D[22] = (U) => re(!1))
            }, "remove", 8, lM)
          ])
        ])) : i.value.chords.length > 1 ? (k(), M("section", aM, [
          g("h4", null, [
            be(F(i.value.chords.length) + " chord symbols ", 1),
            g("span", uM, F(i.value.chords.map((U) => U.name).join(" ")), 1)
          ]),
          g("div", cM, [
            D[51] || (D[51] = g("span", { class: "name" }, "pitch", -1)),
            g("button", {
              disabled: !l.value,
              title: "All a semitone down (↓), each spelled for its key",
              onClick: D[23] || (D[23] = (U) => I(H(Pi)([], -1, i.value.chords)))
            }, "−1", 8, hM),
            g("button", {
              disabled: !l.value,
              title: "All a semitone up (↑), each spelled for its key",
              onClick: D[24] || (D[24] = (U) => I(H(Pi)([], 1, i.value.chords)))
            }, "+1", 8, fM)
          ]),
          g("div", dM, [
            g("button", {
              disabled: !l.value,
              title: "Remove them (Delete)",
              onClick: D[25] || (D[25] = (U) => re(!1))
            }, "remove", 8, pM)
          ])
        ])) : ee("", !0),
        r.value ? (k(), M("section", {
          key: 3,
          class: "panel",
          "aria-label": `Bar ${r.value.n}`
        }, [
          g("h4", null, [
            be(" Bar " + F(r.value.n) + " ", 1),
            g("span", mM, F(r.value.meter) + " · " + F(r.value.key), 1)
          ]),
          g("div", vM, [
            g("button", {
              disabled: !l.value,
              title: "Insert an empty bar before this one",
              onClick: D[26] || (D[26] = (U) => I(H(Yd)(r.value, "before")))
            }, "+ before", 8, yM),
            g("button", {
              disabled: !l.value,
              title: "Insert an empty bar after this one",
              onClick: D[27] || (D[27] = (U) => I(H(Yd)(r.value, "after")))
            }, "+ after", 8, bM),
            g("button", {
              disabled: !l.value,
              title: "Insert a copy of this bar after it",
              onClick: D[28] || (D[28] = (U) => I(H(v2)(r.value)))
            }, "duplicate", 8, wM),
            g("button", {
              disabled: !l.value || t.value.measures.length < 2,
              title: "Delete this bar in both voices",
              onClick: D[29] || (D[29] = (U) => I(H(y2)(t.value, r.value)))
            }, "delete", 8, xM)
          ]),
          g("div", kM, [
            D[52] || (D[52] = g("span", { class: "name" }, "meter", -1)),
            We(g("input", {
              "onUpdate:modelValue": D[30] || (D[30] = (U) => O.value = U),
              class: "meter",
              list: "plenio-meters",
              disabled: !l.value,
              "aria-label": "Meter of this bar (empty bars only)",
              onKeydown: D[31] || (D[31] = Et(ft((U) => I(H(Xd)(r.value, O.value)), ["prevent"]), ["enter"])),
              onChange: D[32] || (D[32] = (U) => I(H(Xd)(r.value, O.value)))
            }, null, 40, SM), [
              [Nt, O.value]
            ]),
            g("datalist", CM, [
              (k(!0), M(me, null, Ie(H(o2), (U) => (k(), M("option", {
                key: U,
                value: U
              }, null, 8, MM))), 128))
            ])
          ]),
          g("div", AM, [
            D[53] || (D[53] = g("span", { class: "name" }, "key", -1)),
            We(g("select", {
              "onUpdate:modelValue": D[33] || (D[33] = (U) => L.value = U),
              disabled: !l.value,
              "aria-label": "Key from this bar on",
              onChange: D[34] || (D[34] = (U) => I(H(b2)(r.value, L.value)))
            }, [
              (k(!0), M(me, null, Ie(H(Zv), (U) => (k(), M("option", {
                key: U,
                value: U
              }, F(U), 9, $M))), 128))
            ], 40, TM), [
              [$s, L.value]
            ]),
            u.value ? (k(), M("button", {
              key: 0,
              disabled: !l.value,
              title: "Remove the key change at this bar",
              onClick: D[35] || (D[35] = (U) => I(H(w2)(t.value, r.value)))
            }, "remove change", 8, DM)) : ee("", !0)
          ])
        ], 8, gM)) : ee("", !0),
        !i.value.notes.length && !o.value && !r.value ? (k(), M("p", OM, " Select a note (piano roll or notation), a chord symbol or a bar. ")) : ee("", !0),
        E.value ? (k(), M("p", LM, F(E.value), 1)) : ee("", !0)
      ], 64)) : (k(), M("p", S2, F(n.view?.model_error?.message ?? "No score."), 1))
    ]));
  }
}), IM = { class: "keys-help" }, BM = ["aria-expanded"], RM = {
  key: 0,
  class: "keys-panel",
  role: "dialog",
  "aria-label": "Keys and gestures"
}, PM = /* @__PURE__ */ tn({
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
    return (i, s) => (k(), M("span", IM, [
      g("button", {
        "aria-expanded": e.value,
        title: "The keys and mouse gestures of the score editor",
        onClick: s[0] || (s[0] = (o) => e.value = !e.value)
      }, "⌨ keys", 8, BM),
      e.value ? (k(), M("div", RM, [
        g("button", {
          class: "close",
          "aria-label": "Close",
          onClick: s[1] || (s[1] = (o) => e.value = !1)
        }, "×"),
        (k(), M(me, null, Ie(t, (o) => g("section", {
          key: o.title
        }, [
          g("h5", null, F(o.title), 1),
          g("table", null, [
            (k(!0), M(me, null, Ie(o.rows, ([r, l]) => (k(), M("tr", { key: r }, [
              g("th", null, F(r), 1),
              g("td", null, F(l), 1)
            ]))), 128))
          ])
        ])), 64))
      ])) : ee("", !0)
    ]));
  }
}), _M = [
  { value: "vocal", label: "Vocal", title: "The sung melody (V: Vocal) - one voice, monophonic" },
  { value: "ins", label: "Instrument", title: "The instrumental melody (V: Ins) - one voice, monophonic" },
  { value: "chords", label: "Chords", title: "Chord symbols, read from the notes (best effort)" },
  { value: "guide", label: "Guide", title: "Playback and MIDI only - never sent to YuE2" },
  { value: "none", label: "do not import", title: "Leave this track out of the score" }
], Mc = [4, 8, 16, 32, 64];
function NM(n) {
  return n.map((e) => ({
    index: e.index,
    number: e.index + 1,
    name: e.name,
    notes: e.notes,
    role: e.role ?? "none"
  }));
}
function VM(n) {
  const e = {};
  for (const t of n) e[String(t.index)] = t.role === "none" ? null : t.role;
  return e;
}
function HM(n) {
  const e = n?.model?.unit ?? n?.header?.unit ?? "1/16", t = Number(e.split("/")[1]), i = Number.isFinite(t) && t > 0 ? t : 16, s = Mc.filter((o) => o <= i);
  return s.length ? s[s.length - 1] : Mc[0];
}
function FM(n) {
  let e = "";
  for (let t = 0; t < n.length; t += 8192)
    e += String.fromCharCode(...n.subarray(t, t + 8192));
  return btoa(e);
}
function zM(n) {
  const e = atob(n), t = new Uint8Array(e.length);
  for (let i = 0; i < e.length; i++) t[i] = e.charCodeAt(i);
  return t;
}
function eo(n, e, t = "audio/midi") {
  const i = new ArrayBuffer(e.length);
  new Uint8Array(i).set(e);
  const s = URL.createObjectURL(new Blob([i], { type: t })), o = document.createElement("a");
  o.href = s, o.download = n, o.rel = "noopener", o.click(), setTimeout(() => URL.revokeObjectURL(s), 0);
}
function WM(n) {
  const e = n.name.trim() || "unnamed";
  return n.notes === 1 ? `${e} · 1 note` : `${e} · ${n.notes} notes`;
}
function KM(n, e, t, { current: i = 0, keep: s = !0 } = {}) {
  const o = [...n];
  if (e && o.push(
    t ? s ? `${e} Guide note(s) in the file will be kept (never sent to YuE2).` : `${e} Guide note(s) in the file are left out (keep the Guide notes is off).` : `${e} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
  ), t && i) {
    const r = e && s ? "replaced by the file's" : "removed";
    o.push(`The sheet's ${i} Guide note(s) belong to the replaced score and are ${r} (Undo brings them back).`);
  }
  return o;
}
function Jd(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
class UM {
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
    t === void 0 ? this.entries[this.cursor] = { ...this.current, extra: e } : Jd(t) && Jd(e) && (this.entries[this.cursor] = { ...this.current, extra: { ...e, ...t } });
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
function to(n) {
  return n instanceof wp ? `${n.message}${n.hint ? ` — ${n.hint}` : ""}` : String(n instanceof Error ? n.message : n);
}
function jM(n) {
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
function GM(n, e) {
  const t = /* @__PURE__ */ js(null), i = /* @__PURE__ */ js(null), s = /* @__PURE__ */ G(null), o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(!1), l = /* @__PURE__ */ G(null), a = /* @__PURE__ */ G(null), u = /* @__PURE__ */ G([]), c = /* @__PURE__ */ G([]), h = new UM(n.text), f = /* @__PURE__ */ G(0);
  let d = "", p = 0, v, m = !1;
  const b = N(() => t.value && t.value.sha256 && !o.value ? t.value : null), O = N(() => Cs(i.value, c.value[0])), L = N(() => (f.value, h.canUndo)), E = N(() => (f.value, h.canRedo)), I = N(() => (f.value, h.undoLabel)), z = N(() => (f.value, h.redoLabel)), R = N(
    () => jM({
      text: n.text,
      view: t.value,
      pending: o.value,
      busy: r.value,
      checkFailed: a.value
    })
  ), Y = N(
    () => s.value !== null && s.value !== n.text && !!t.value && !t.value.ok
  );
  function K(ye, Be) {
    if (t.value = ye, a.value = null, ye.ok) {
      i.value = ye, s.value = Be;
      const se = $1(ye);
      c.value = c.value.filter((Z) => se.has(Z));
    }
  }
  async function re() {
    const ye = n.text, Be = ++p;
    if (d = ye, !ye.trim()) {
      t.value = null, o.value = !1;
      return;
    }
    try {
      const se = await Ey(e.fetcher, ye, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (Be !== p || d !== ye || n.text !== ye) return;
      K(se, ye), l.value = null;
    } catch (se) {
      n.text === ye && (l.value = to(se), a.value = l.value);
    } finally {
      n.text === ye && (o.value = !1);
    }
  }
  function j(ye = e.debounceMs ?? 300) {
    o.value = !0, clearTimeout(v), v = setTimeout(() => {
      re();
    }, ye);
  }
  function D(ye, Be, se, Z) {
    ye !== n.text && (m = !0, n.text = ye, m = !1, h.record(ye, Be, { group: se, extra: Z }), f.value++, e.onEdit?.());
  }
  function U(ye) {
    D(ye, "typing", "typing"), j();
  }
  function ke(ye, Be, se = null, Z) {
    return ye === n.text ? !1 : (h.seal(), Z && h.annotate(Z.before), D(ye, Be, void 0, Z?.after), h.seal(), clearTimeout(v), d = ye, o.value = !1, u.value = [], se && se.ok && (se.lyrics || !e.lyrics?.()) ? (K(se, ye), l.value = null) : j(0), !0);
  }
  async function $e(ye) {
    const Be = n.text;
    if (t.value && !t.value.ok)
      return l.value = "The ABC text is not valid; fix it or revert to the last valid score before editing the notation.", !1;
    r.value = !0, l.value = null;
    try {
      ++p;
      const se = await Iy(e.fetcher, Be, ye, e.lyrics?.() ?? null, e.lyricSpans?.() ?? null);
      if (n.text !== Be)
        return l.value = "The score changed while the edit was computed; it was not applied.", !1;
      const Z = e.onTransform?.(se, ye);
      return h.seal(), Z && h.annotate(Z.before), D(se.abc, se.changes[0] ?? ye.op, void 0, Z?.after), h.seal(), clearTimeout(v), o.value = !1, d = se.abc, K(se.analysis, se.abc), u.value = [...se.changes, ...se.warnings.map((ne) => `warning: ${ne}`)], se.select.length && (c.value = D1(se.analysis, se.select)), !0;
    } catch (se) {
      return l.value = to(se), !1;
    } finally {
      r.value = !1;
    }
  }
  function ce(ye) {
    ye && (m = !0, n.text = ye.text, m = !1, ye.extra !== void 0 && e.onRestore?.(ye.extra), f.value++, e.onEdit?.(), u.value = [], j(0));
  }
  const pe = () => ce(h.undo()), He = () => ce(h.redo());
  function Oe() {
    const ye = s.value;
    return ye === null || ye === n.text || !i.value ? !1 : (h.seal(), D(ye, "revert to the last valid score"), h.seal(), clearTimeout(v), d = ye, o.value = !1, t.value = i.value, a.value = null, l.value = null, u.value = ["reverted to the last valid score"], !0);
  }
  function Re(ye) {
    c.value = ye;
  }
  function Le(ye, Be, se) {
    h.seal(), h.annotate(Be), h.record(n.text, ye, { extra: se, side: !0 }), h.seal(), f.value++;
  }
  function J() {
    r.value ? setTimeout(J, 60) : n.text.trim() && !o.value && re();
  }
  Ge(
    () => n.text,
    (ye) => {
      m || (h.seal(), h.record(ye, "document replaced"), h.seal(), f.value++, j(0));
    },
    { flush: "sync" }
  );
  function ct() {
    clearTimeout(v);
  }
  return j(0), /* @__PURE__ */ ws({
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
    undoLabel: I,
    redoLabel: z,
    commitBlock: R,
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
const qM = {
  class: "plenio-dialog midi-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "Import MIDI"
}, YM = { class: "facts" }, XM = { class: "body" }, JM = {
  key: 0,
  class: "hint"
}, ZM = {
  key: 1,
  class: "error",
  role: "alert"
}, QM = { class: "tracks" }, eA = { class: "number" }, tA = ["onUpdate:modelValue", "aria-label"], nA = ["value", "title"], iA = {
  key: 0,
  class: "hint"
}, sA = { class: "controls" }, oA = { title: "Foreign timing is quantised to this note value" }, rA = ["value"], lA = { title: "Read chord symbols from the notes of the Chords track (best effort)" }, aA = {
  key: 0,
  title: "Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
}, uA = { class: "report" }, cA = { key: 0 }, hA = ["disabled"], fA = /* @__PURE__ */ tn({
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
    const t = n, i = e, s = /* @__PURE__ */ G(!1), o = /* @__PURE__ */ G(null), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(HM(t.view)), u = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(t.keepsGuide), h = N(() => l.value.filter((b) => b.notes > 0)), f = N(() => l.value.filter((b) => b.notes === 0)), d = N(
      () => r.value ? KM(r.value.report, r.value.guide.length, t.keepsGuide, {
        current: t.currentGuide ?? 0,
        keep: c.value
      }) : []
    );
    let p = 0;
    async function v(b) {
      const O = ++p;
      s.value = !0, o.value = null;
      try {
        const L = await By(t.fetcher, {
          data: t.data,
          grid: a.value,
          chords: u.value,
          mapping: b ? VM(l.value) : void 0
        });
        if (O !== p) return;
        r.value = L, b || (l.value = NM(L.tracks));
      } catch (L) {
        O === p && (o.value = to(L));
      } finally {
        O === p && (s.value = !1);
      }
    }
    function m() {
      v(!0);
    }
    return kr(() => {
      v(!1);
    }), (b, O) => (k(), M("div", {
      class: "plenio-overlay",
      onMousedown: O[9] || (O[9] = ft((L) => i("close"), ["self"]))
    }, [
      g("div", qM, [
        g("header", null, [
          O[10] || (O[10] = g("h2", null, "Import MIDI", -1)),
          g("span", YM, F(n.filename), 1),
          g("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close MIDI import",
            onClick: O[0] || (O[0] = (L) => i("close"))
          }, "×")
        ]),
        g("div", XM, [
          s.value ? (k(), M("p", JM, "Reading the file…")) : ee("", !0),
          o.value ? (k(), M("p", ZM, F(o.value), 1)) : ee("", !0),
          r.value && !o.value ? (k(), M(me, { key: 2 }, [
            g("table", QM, [
              O[11] || (O[11] = g("thead", null, [
                g("tr", null, [
                  g("th", null, "Track"),
                  g("th", null, "Role")
                ])
              ], -1)),
              g("tbody", null, [
                (k(!0), M(me, null, Ie(h.value, (L) => (k(), M("tr", {
                  key: L.index
                }, [
                  g("td", null, [
                    g("span", eA, F(L.number), 1),
                    be(" " + F(H(WM)(L)), 1)
                  ]),
                  g("td", null, [
                    We(g("select", {
                      "onUpdate:modelValue": (E) => L.role = E,
                      "aria-label": `Role of track ${L.number}`,
                      onChange: O[1] || (O[1] = (E) => m())
                    }, [
                      (k(!0), M(me, null, Ie(H(_M), (E) => (k(), M("option", {
                        key: E.value,
                        value: E.value,
                        title: E.title
                      }, F(E.label), 9, nA))), 128))
                    ], 40, tA), [
                      [$s, L.role]
                    ])
                  ])
                ]))), 128))
              ])
            ]),
            f.value.length ? (k(), M("p", iA, " Empty track(s) not shown: " + F(f.value.map((L) => L.number).join(", ")) + ". ", 1)) : ee("", !0),
            g("p", sA, [
              g("label", oA, [
                O[12] || (O[12] = be(" grid ", -1)),
                We(g("select", {
                  "onUpdate:modelValue": O[2] || (O[2] = (L) => a.value = L),
                  "aria-label": "Import grid",
                  onChange: O[3] || (O[3] = (L) => m())
                }, [
                  (k(!0), M(me, null, Ie(H(Mc), (L) => (k(), M("option", {
                    key: L,
                    value: L
                  }, "1/" + F(L), 9, rA))), 128))
                ], 544), [
                  [
                    $s,
                    a.value,
                    void 0,
                    { number: !0 }
                  ]
                ])
              ]),
              g("label", lA, [
                We(g("input", {
                  "onUpdate:modelValue": O[4] || (O[4] = (L) => u.value = L),
                  type: "checkbox",
                  "aria-label": "Read chords from the notes",
                  onChange: O[5] || (O[5] = (L) => m())
                }, null, 544), [
                  [hn, u.value]
                ]),
                O[13] || (O[13] = be(" read chords from the notes ", -1))
              ]),
              n.keepsGuide && r.value.guide.length ? (k(), M("label", aA, [
                We(g("input", {
                  "onUpdate:modelValue": O[6] || (O[6] = (L) => c.value = L),
                  type: "checkbox",
                  "aria-label": "Keep the Guide notes"
                }, null, 512), [
                  [hn, c.value]
                ]),
                O[14] || (O[14] = be(" keep the Guide notes ", -1))
              ])) : ee("", !0)
            ]),
            O[15] || (O[15] = g("h3", null, "What the import did", -1)),
            g("ul", uA, [
              (k(!0), M(me, null, Ie(d.value, (L, E) => (k(), M("li", { key: E }, F(L), 1))), 128)),
              d.value.length ? ee("", !0) : (k(), M("li", cA, "The file maps cleanly onto the score; nothing was lost or guessed."))
            ])
          ], 64)) : ee("", !0)
        ]),
        g("footer", null, [
          O[16] || (O[16] = g("span", { class: "spacer" }, null, -1)),
          g("button", {
            onClick: O[7] || (O[7] = (L) => i("close"))
          }, "Cancel"),
          g("button", {
            class: "primary",
            disabled: s.value || !r.value,
            title: "Replace the score with the imported one (one undo step)",
            onClick: O[8] || (O[8] = (L) => r.value && i("insert", r.value, c.value))
          }, " Insert ", 8, hA)
        ])
      ])
    ], 32));
  }
}), dA = {
  key: 0,
  class: "stale-note",
  role: "status"
}, pA = {
  key: 1,
  class: "error"
}, gA = /* @__PURE__ */ tn({
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
      for (const I of E)
        for (const z of I.staff ?? [])
          for (const R of z.voices ?? [])
            for (const Y of R)
              Y.el_type === "note" && typeof Y.endChar == "number" && Y.abselem?.elemset && L.set(Y.endChar, Y.abselem.elemset);
      return L;
    }
    function d(O) {
      const L = Cs(i.view, O);
      return L ? l.get(L.display[1]) ?? [] : [];
    }
    function p(O, L) {
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
        const I = Yy.renderAbc(O, L, {
          add_classes: !0,
          responsive: "resize",
          scale: i.zoom,
          foregroundColor: E,
          selectionColor: E,
          staffwidth: Math.max(480, Math.floor(O.clientWidth / i.zoom) - 30),
          wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
          clickListener: (z) => {
            const R = z;
            if (!i.view || typeof R.startChar != "number" || typeof R.endChar != "number") return;
            const Y = O1(i.view, R.startChar, R.endChar);
            Y && s("select", Y.id, u);
          }
        });
        l = f(I[0]), a = { "plenio-selected": [], "plenio-playing": [] }, p("plenio-selected", i.selection), p("plenio-playing", i.playing), r.value = null;
      } catch (E) {
        r.value = `The notation could not be drawn: ${E instanceof Error ? E.message : String(E)}`;
      }
    }
    function m(O) {
      const [L] = d(O), E = o.value?.parentElement;
      if (!L || !E) return;
      const I = E.getBoundingClientRect(), z = L.getBoundingClientRect();
      z.top < I.top ? E.scrollTop += z.top - I.top - 8 : z.bottom > I.bottom && (E.scrollTop += z.bottom - I.bottom + 8), z.left < I.left ? E.scrollLeft += z.left - I.left - 8 : z.right > I.right && (E.scrollLeft += z.right - I.right + 8);
    }
    e({ reveal: m }), Ge(() => [i.view?.display_abc, i.zoom], () => Pn(v)), Ge(
      () => i.selection,
      (O) => {
        p("plenio-selected", O), O[0] && m(O[0]);
      }
    ), Ge(
      () => i.playing,
      (O) => {
        p("plenio-playing", O), O[0] && m(O[0]);
      }
    ), kr(() => {
      v(), c = new ResizeObserver(() => {
        o.value && Math.abs(o.value.clientWidth - h) > 40 && v();
      }), o.value && c.observe(o.value);
    }), Li(() => c?.disconnect());
    function b(O) {
      u = O.shiftKey || O.ctrlKey || O.metaKey;
    }
    return (O, L) => (k(), M("div", {
      class: qe(["notation-wrap", { stale: n.stale }])
    }, [
      n.stale ? (k(), M("p", dA, " The text has errors - the notation shows the last valid score. Fix the ABC to continue. ")) : ee("", !0),
      r.value ? (k(), M("p", pA, F(r.value), 1)) : ee("", !0),
      g("div", {
        ref_key: "host",
        ref: o,
        class: "notation",
        "aria-label": "Score notation - click a note to select it",
        onPointerdownCapture: b
      }, null, 544)
    ], 2));
  }
});
function mA(n, e) {
  const t = [];
  let i = 0;
  return n.bars.forEach((s, o) => {
    const r = e?.[o] ?? null, l = r && r[1] > r[0] ? [r[0], r[1]] : null, a = l ? l[1] - l[0] : s.duration_s;
    t.push({ scoreStart: s.start_s, scoreDur: s.duration_s, realStart: i, realDur: a, source: l }), i += a;
  }), t;
}
function ny(n, e, t) {
  let i = null;
  for (const s of n)
    if (s[t] <= e + jt) i = s;
    else break;
  return i ?? n[0] ?? null;
}
function os(n, e) {
  const t = ny(n, e, "scoreStart");
  if (!t) return e;
  const i = t.scoreDur > 0 ? (e - t.scoreStart) / t.scoreDur : 0;
  return t.realStart + i * t.realDur;
}
function iy(n, e) {
  const t = ny(n, e, "realStart");
  if (!t) return e;
  const i = t.realDur > 0 ? (e - t.realStart) / t.realDur : 0;
  return t.scoreStart + i * t.scoreDur;
}
function vA(n, e, t) {
  const i = os(n, e), s = t == null ? 1 / 0 : os(n, t), o = [];
  for (const r of n) {
    if (!r.source) continue;
    const l = r.realStart + r.realDur, a = Math.max(r.realStart, i), u = Math.min(l, s);
    if (u <= a + jt) continue;
    let c = r.source[0] + (a - r.realStart) / r.realDur * (r.source[1] - r.source[0]), h = a - i, f = u - a;
    if (c < 0 && (h -= c, f += c, c = 0, f <= jt))
      continue;
    const d = o.at(-1);
    d && Math.abs(d.at + d.duration - h) < jt && Math.abs(d.offset + d.duration - c) < 0.01 ? d.duration += f : o.push({ at: h, offset: c, duration: f });
  }
  return o;
}
const sy = 0.04, jt = 1e-3, yA = 0.25, bA = 2;
function mo(n) {
  return Math.min(bA, Math.max(yA, Number.isFinite(n) ? n : 1));
}
function wA(n, e) {
  const t = mo(e.speed), i = e.to ?? n.duration_s, s = [], o = e.clock?.length ? e.clock : null, r = o ? os(o, e.from) : e.from, l = (a) => (o ? os(o, a) : a) - r;
  for (const a of ["Vocal", "Ins"])
    if (e.voices[a])
      for (const u of n.notes?.[a] ?? []) {
        if (u.start_s < e.from - jt || u.start_s >= i - jt) continue;
        const c = Math.min(u.start_s + u.duration_s, i), h = Math.max(0, l(u.start_s));
        s.push({ at: h / t, duration: (l(c) - h) / t, midi: u.midi, part: a });
      }
  if (e.voices.chords)
    for (const a of n.chords ?? []) {
      const u = Math.min(a.start_s + a.duration_s, i), c = Math.max(a.start_s, e.from);
      if (!(u <= c + jt))
        for (const h of a.pitches)
          s.push({ at: l(c) / t, duration: (l(u) - l(c)) / t, midi: h, part: "chord" });
    }
  if (e.voices.guide)
    for (const a of e.guide ?? []) {
      if (a.start_s < e.from - jt || a.start_s >= i - jt) continue;
      const u = Math.min(a.start_s + a.duration_s, i), c = Math.max(0, l(a.start_s));
      s.push({ at: c / t, duration: (l(u) - c) / t, midi: a.midi, part: "guide" });
    }
  if (e.metronome)
    for (const a of n.bars) {
      const u = Number(a.meter.split("/")[0]) || 1;
      for (let c = 0; c < u; c++) {
        const h = a.start_s + c * a.duration_s / u;
        h < e.from - jt || h >= i - jt || s.push({
          at: Math.max(0, l(h)) / t,
          duration: sy,
          midi: c === 0 ? 96 : 89,
          part: "click"
        });
      }
    }
  return s.sort((a, u) => a.at - u.at || a.midi - u.midi);
}
function xA(n, e) {
  const t = Math.max(e.from, e.to ?? n.duration_s), i = e.clock?.length ? e.clock : null, s = i ? os(i, t) - os(i, e.from) : t - e.from;
  return Math.max(0, s) / mo(e.speed);
}
function kA(n, e, t, i, s, o) {
  const r = n && e > 0 ? n.duration_s / e : 0, l = n && r > 0 ? Math.max(0, t - n.start_s) : 0, a = r > 0 ? Math.floor(l / r + 1e-6) : 0, u = r > 0 ? (l - a * r) / r * o : 0, c = u > 1e-3 ? 0 : 1, h = Math.max(0, i * e);
  return Array.from({ length: h }, (f, d) => {
    const p = c + h - 1 - d, v = ((a - p) % e + e) % e === 0;
    return { at: Math.max(0, s - u - p * o), duration: sy, midi: v ? 96 : 89, part: "click" };
  });
}
function SA(n, e) {
  const t = n.clock?.length ? n.clock : null;
  return t ? iy(t, os(t, n.from) + e * mo(n.speed)) : n.from + e * mo(n.speed);
}
function CA(n, e, t) {
  return (n.elements ?? []).filter(
    (i) => i.kind === "note" && t[i.voice] && i.start_s <= e + jt && e < i.start_s + i.duration_s - jt
  ).map((i) => i.id);
}
function oy(n) {
  return 440 * 2 ** ((n - 69) / 12);
}
function Zo(n, e) {
  let t = 1;
  for (const i of n.measures) {
    if (i.onset > e) break;
    t = i.n;
  }
  return t;
}
function Zd(n, e) {
  return n.measures[Math.max(0, Math.min(n.measures.length - 1, e - 1))]?.onset ?? 0;
}
function Qd(n, e, t) {
  const i = e > 0 ? Math.round(n / e) * e : Math.round(n);
  return Math.max(0, Math.min(t, i));
}
function Mh(n, e) {
  const t = n.model;
  if (!t) return 0;
  const i = Zo(t, e), s = t.measures[i - 1], o = n.bars[i - 1];
  return !s || !o || !s.length ? 0 : o.start_s + (e - s.onset) / s.length * o.duration_s;
}
function Ah(n, e) {
  const t = n.model;
  if (!t || !n.bars.length || !t.measures.length) return null;
  let i = 0;
  for (let l = 0; l < n.bars.length && !(n.bars[l].start_s > e + jt); l++)
    i = l;
  const s = n.bars[i], o = t.measures[Math.min(i, t.measures.length - 1)], r = s.duration_s > 0 ? (e - s.start_s) / s.duration_s : 0;
  return Math.max(0, Math.min(t.total, o.onset + Math.max(0, Math.min(1, r)) * o.length));
}
function ry(n, e) {
  const t = Zo(n, e), i = n.measures[t - 1];
  if (!i) return "1.1.1";
  const s = Number(i.meter.split("/")[0]) || 1, o = i.length / s, r = Math.max(0, e - i.onset), l = Math.min(s - 1, Math.floor(r / o)), a = n.grid.units_per_quarter / 4, u = a > 0 ? Math.floor((r - l * o) / a) : 0;
  return `${t}.${l + 1}.${u + 1}`;
}
const Th = [
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
], ql = {
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
function Vo(n) {
  return typeof n == "string" && Th.includes(n);
}
function $h() {
  return { Vocal: "soft", Ins: "plain", chord: "plain", guide: "plain" };
}
function ly(n) {
  const e = $h(), t = typeof n == "object" && n !== null ? n : {};
  return {
    Vocal: Vo(t.Vocal) ? t.Vocal : e.Vocal,
    Ins: Vo(t.Ins) ? t.Ins : e.Ins,
    chord: Vo(t.chord) ? t.chord : e.chord,
    guide: Vo(t.guide) ? t.guide : e.guide
  };
}
const MA = {
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
}, ep = /* @__PURE__ */ new WeakMap();
function yu(n, e, t) {
  let i = ep.get(n);
  i || ep.set(n, i = /* @__PURE__ */ new Map());
  let s = i.get(e);
  if (!s) {
    const o = new Float32Array(t.length + 1), r = new Float32Array(t.length + 1);
    t.forEach((l, a) => r[a + 1] = l), s = n.createPeriodicWave(o, r), i.set(e, s);
  }
  return s;
}
const tp = /* @__PURE__ */ new WeakMap();
function ay(n) {
  let e = tp.get(n);
  if (!e) {
    e = n.createBuffer(1, n.sampleRate, n.sampleRate);
    const t = e.getChannelData(0);
    let i = 1;
    for (let s = 0; s < t.length; s++)
      i = i * 16807 % 2147483647, t[s] = i / 2147483647 * 2 - 1;
    tp.set(n, e);
  }
  return e;
}
function wt(n, e, t, i = 0) {
  const s = n.createOscillator();
  return typeof e == "string" ? s.type = e : s.setPeriodicWave(e), s.frequency.value = t, s.detune.value = i, s;
}
function _i(n, e) {
  const t = n.createGain();
  return t.gain.value = e, t;
}
function Rn(n, e, t, i = 0.7) {
  const s = n.createBiquadFilter();
  return s.type = e, s.frequency.value = Math.min(t, n.sampleRate / 2 - 100), s.Q.value = i, s;
}
function Do(n, e, t, i, s, o) {
  const r = wt(n, "sine", i), l = n.createGain();
  l.gain.setValueAtTime(0, t), l.gain.setValueAtTime(0, t + o), l.gain.linearRampToValueAtTime(s, t + o + 0.4), r.connect(l);
  for (const a of e) l.connect(a.detune);
  return r;
}
function bu(n, e, t, i, s, o) {
  const r = n.createBufferSource();
  r.buffer = ay(n);
  const l = Rn(n, "bandpass", i, 1.2), a = n.createGain();
  return a.gain.setValueAtTime(s, t), a.gain.setTargetAtTime(0, t, o), r.connect(l).connect(a).connect(e), r;
}
const kl = (n, e) => Math.min(e * 2.5, Math.max(e * 0.3, e * 2 ** ((60 - n) / 24))), np = {
  plain: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (n, e, t) => [ip(wt(n, "sine", t), e)]
  },
  soft: {
    attack: 0.012,
    sustain: 0.85,
    decay: 0.4,
    release: 0.015,
    build: (n, e, t) => [ip(wt(n, "triangle", t), e)]
  },
  piano: {
    attack: 3e-3,
    sustain: 0,
    decay: 1.4,
    release: 0.09,
    build(n, e, t, i, s, o) {
      const r = yu(n, "piano", [1, 0.62, 0.36, 0.27, 0.16, 0.12, 0.07, 0.06, 0.035, 0.02, 0.012, 8e-3]), l = Rn(n, "lowpass", Math.min(t * (5 + 7 * s), 14e3), 0.5);
      l.frequency.setTargetAtTime(Math.max(t * 2.2, 400), i + 0.01, kl(o, 0.35)), l.connect(e);
      const a = wt(n, r, t, -1.5), u = wt(n, r, t, 1.5), c = _i(n, 0.5);
      a.connect(c), u.connect(c), c.connect(l);
      const h = bu(n, e, i, Math.min(t * 6, 7e3), 0.12 * s, 8e-3);
      return [a, u, h];
    }
  },
  epiano: {
    attack: 2e-3,
    sustain: 0,
    decay: 1.6,
    release: 0.12,
    build(n, e, t, i, s, o) {
      const r = wt(n, "sine", t), l = wt(n, "sine", t), a = n.createGain(), u = t * (1.2 + 2.2 * s);
      a.gain.setValueAtTime(u, i), a.gain.setTargetAtTime(t * 0.25, i, kl(o, 0.25)), l.connect(a).connect(r.frequency);
      const c = Rn(n, "highpass", 25, 0.7);
      c.connect(e);
      const h = wt(n, "sine", t * 4), f = n.createGain();
      return f.gain.setValueAtTime(0.18 * s, i), f.gain.setTargetAtTime(0, i, 0.06), h.connect(f).connect(c), r.connect(c), [r, l, h];
    }
  },
  strings: {
    attack: 0.22,
    sustain: 0.9,
    decay: 0.6,
    release: 0.2,
    build(n, e, t, i) {
      const s = Rn(n, "lowpass", Math.min(t * 5 + 800, 6e3), 0.6);
      s.connect(e);
      const o = [-9, 0, 8].map((l) => wt(n, "sawtooth", t, l));
      for (const l of o) l.connect(s);
      const r = Do(n, o, i, 5.3, 7, 0.3);
      return [...o, r];
    }
  },
  pad: {
    attack: 0.5,
    sustain: 0.95,
    decay: 1,
    release: 0.45,
    build(n, e, t, i) {
      const s = Math.min(t * 3 + 500, 4500), o = Rn(n, "lowpass", s, 0.8);
      o.connect(e);
      const r = wt(n, "sine", 0.25), l = _i(n, s * 0.3);
      r.connect(l).connect(o.frequency);
      const a = [wt(n, "sawtooth", t, -12), wt(n, "sawtooth", t, 11), wt(n, "triangle", t / 2)];
      for (const u of a) u.connect(o);
      return [...a, r];
    }
  },
  organ: {
    attack: 6e-3,
    sustain: 1,
    decay: 1,
    release: 0.025,
    build(n, e, t, i) {
      const s = yu(n, "organ", [1, 0.75, 0.55, 0.5, 0.18, 0.3, 0, 0.22, 0, 0.08, 0, 0.1]), o = wt(n, s, t), r = wt(n, "sine", t / 2), l = _i(n, 0.35);
      r.connect(l).connect(e), o.connect(e);
      const a = Do(n, [o, r], i, 6.6, 4, 0), u = bu(n, e, i, 3e3, 0.05, 4e-3);
      return [o, r, a, u];
    }
  },
  flute: {
    attack: 0.07,
    sustain: 0.85,
    decay: 0.5,
    release: 0.06,
    build(n, e, t, i) {
      const s = yu(n, "flute", [1, 0.13, 0.06, 0.02]), o = wt(n, s, t);
      o.connect(e);
      const r = n.createBufferSource();
      r.buffer = ay(n), r.loop = !0;
      const l = Rn(n, "bandpass", Math.min(t * 2, 8e3), 1.5), a = _i(n, 0.06);
      r.connect(l).connect(a).connect(e);
      const u = Do(n, [o], i, 4.9, 9, 0.25);
      return [o, r, u];
    }
  },
  voice: {
    attack: 0.08,
    sustain: 0.9,
    decay: 0.5,
    release: 0.09,
    build(n, e, t, i) {
      const s = wt(n, "sawtooth", t), o = Rn(n, "lowpass", 5e3, 0.5);
      s.connect(o);
      for (const [a, u, c] of [
        [800, 6, 1],
        [1150, 8, 0.55],
        [2900, 12, 0.18]
      ]) {
        const h = Rn(n, "bandpass", a, u), f = _i(n, c);
        o.connect(h).connect(f).connect(e);
      }
      const r = _i(n, 0.15);
      o.connect(r).connect(e);
      const l = Do(n, [s], i, 5.4, 18, 0.22);
      return [s, l];
    }
  },
  pluck: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.7,
    release: 0.07,
    build(n, e, t, i, s, o) {
      const r = Rn(n, "lowpass", Math.min(t * (6 + 6 * s), 9e3), 0.9);
      r.frequency.setTargetAtTime(Math.max(t * 1.5, 250), i + 5e-3, kl(o, 0.12)), r.connect(e);
      const l = wt(n, "sawtooth", t), a = wt(n, "triangle", t, 4);
      l.connect(r), a.connect(r);
      const u = bu(n, e, i, Math.min(t * 8, 8e3), 0.1 * s, 5e-3);
      return [l, a, u];
    }
  },
  lead: {
    attack: 0.01,
    sustain: 0.8,
    decay: 0.3,
    release: 0.06,
    build(n, e, t, i) {
      const s = Rn(n, "lowpass", Math.min(t * 8, 7e3), 2);
      s.frequency.setTargetAtTime(Math.min(t * 4, 4e3), i + 0.02, 0.2), s.connect(e);
      const o = wt(n, "square", t), r = wt(n, "sawtooth", t, 6);
      o.connect(s), r.connect(s);
      const l = Do(n, [o, r], i, 5.6, 10, 0.3);
      return [o, r, l];
    }
  },
  bass: {
    attack: 4e-3,
    sustain: 0.45,
    decay: 0.5,
    release: 0.06,
    build(n, e, t, i) {
      const s = wt(n, "sine", t), o = wt(n, "triangle", t), r = _i(n, 0.5);
      s.connect(e), o.connect(r).connect(e);
      const l = wt(n, "sawtooth", t), a = Rn(n, "lowpass", Math.min(t * 6, 2500), 1);
      a.frequency.setTargetAtTime(t * 2, i + 0.01, 0.12);
      const u = _i(n, 0.25);
      return l.connect(a).connect(u).connect(e), [s, o, l];
    }
  },
  mallets: {
    attack: 2e-3,
    sustain: 0,
    decay: 0.8,
    release: 0.1,
    build(n, e, t, i, s, o) {
      const r = wt(n, "sine", t), l = wt(n, "sine", t * 3.5), a = n.createGain();
      return a.gain.setValueAtTime(t * (1 + 1.5 * s), i), a.gain.setTargetAtTime(0, i, 0.05), l.connect(a).connect(r.frequency), r.connect(e), [r, l];
    }
  }
};
function ip(n, e) {
  return n.connect(e), n;
}
function Yl(n, e, t, i, s, { velocity: o = 0.8, level: r = 1 } = {}) {
  const l = np[t] ?? np.plain, a = oy(i), u = l.sustain === 0 ? kl(i, l.decay) : l.decay, c = r * MA[t] * (0.55 + 0.45 * Math.max(0, Math.min(1, o))), h = n.createGain();
  h.gain.setValueAtTime(0, s), h.gain.linearRampToValueAtTime(c, s + l.attack), h.gain.setTargetAtTime(c * l.sustain, s + l.attack, u), h.connect(e);
  const f = l.build(n, h, a, s, o, i);
  for (const m of f) m.start(s);
  let d = !1, p = !1;
  const v = (m) => {
    for (const b of f)
      try {
        b.stop(m);
      } catch {
      }
  };
  return f[0].onended = () => {
    p = !0, h.disconnect();
  }, l.sustain === 0 && v(s + l.attack + u * 7), {
    release(m) {
      if (d || p) return;
      d = !0;
      const b = Math.max(m, s + l.attack);
      h.gain.setTargetAtTime(0, b, l.release), v(b + l.release * 7);
    },
    stop() {
      if (p) return;
      p = !0, d = !0;
      const m = n.currentTime;
      try {
        h.gain.cancelScheduledValues(m), h.gain.setValueAtTime(0, m);
      } catch {
      }
      v(m), h.disconnect();
    }
  };
}
const AA = 0.25, TA = 30, wu = {
  Vocal: 0.22,
  Ins: 0.16,
  chord: 0.045,
  click: 0.1,
  guide: 0.1
}, xu = 6e-3;
class $A {
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
  sounds = $h();
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
    this.onTick = t.onTick ?? null, this.onEnd = t.onEnd ?? null, this.timer = setInterval(() => this.tick(), TA), this.tick();
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
    for (; this.next < this.events.length && this.events[this.next].at < t + AA; )
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
        u = Yl(t, o, this.sounds[e.part], e.midi, i, { level: wu[e.part] });
      } catch {
        try {
          u = Yl(t, o, "plain", e.midi, i, { level: wu[e.part] });
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
    r.type = "square", r.frequency.value = oy(e.midi);
    const l = t.createGain(), a = wu.click;
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
    o.gain.setValueAtTime(0, r), o.gain.linearRampToValueAtTime(1, r + xu), o.gain.setValueAtTime(1, Math.max(r + xu, l - xu)), o.gain.linearRampToValueAtTime(0, l), s.connect(o).connect(this.sourceGain), s.start(r, Math.max(0, t.offset), t.duration), s.onended = () => {
      this.sources = this.sources.filter((a) => a !== s), o.disconnect();
    }, this.sources.push(s);
  }
}
class DA {
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
        s.resume(), this.off(e), this.tones.set(e, Yl(s, s.destination, this.sound, e, s.currentTime, { velocity: Math.min(1, t / 127), level: 0.25 }));
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
let sp = null;
function Ac(n, e = 0.35, t = "soft") {
  const i = window.AudioContext ?? window.webkitAudioContext;
  if (i)
    try {
      sp ??= new i();
      const s = sp;
      s.resume();
      const o = s.currentTime + 0.01;
      Yl(s, s.destination, t, n, o, { level: 0.2 }).release(o + e);
    } catch {
    }
}
const OA = 200, Ns = /* @__PURE__ */ new Map(), LA = 2;
function EA(n, e) {
  if (n.numberOfChannels === 1) return n;
  const t = new e(1, 1, n.sampleRate).createBuffer(1, n.length, n.sampleRate), i = t.getChannelData(0);
  for (let s = 0; s < n.numberOfChannels; s++) {
    const o = n.getChannelData(s);
    for (let r = 0; r < o.length; r++) i[r] += o[r] / n.numberOfChannels;
  }
  return t;
}
function IA(n, e, t = OA) {
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
function BA(n, e = RA) {
  let t = Ns.get(n);
  if (!t) {
    for (t = (async () => {
      const i = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
      if (!i) throw new Error("This browser cannot decode audio (no Web Audio).");
      const s = await e(n), o = await new i(1, 1, 48e3).decodeAudioData(s), r = EA(o, i);
      return { buffer: r, envelope: IA(r.getChannelData(0), r.sampleRate) };
    })(), Ns.set(n, t); Ns.size > LA; ) Ns.delete(Ns.keys().next().value);
    t.catch(() => Ns.delete(n));
  }
  return t;
}
async function RA(n) {
  const e = await fetch(n);
  if (!e.ok) throw new Error(`The source recording could not be read (${e.status}).`);
  return e.arrayBuffer();
}
function PA(n, e, t, i) {
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
function _A(n) {
  return !n || "problem" in n || !Array.isArray(n.midi) || !(n.rate > 0) ? null : { rate: n.rate, start: n.start ?? 0, midi: n.midi };
}
function NA(n, e) {
  const t = Math.round((e - n.start) * n.rate);
  return t >= 0 && t < n.midi.length ? n.midi[t] : null;
}
function VA(n, e, t) {
  let i = 0;
  for (let r = 0; r < n.measures.length; r++) n.measures[r].onset <= t && (i = r);
  const s = n.measures[i], o = e?.[i];
  return !s || !o || !s.length ? null : o[0] + (t - s.onset) / s.length * (o[1] - o[0]);
}
function HA(n, e, t) {
  const i = [];
  for (const s of n.tracks.vocal) {
    const o = VA(n, e, s.onset + s.duration / 2), r = o === null ? null : NA(t, o);
    r !== null && i.push(s.pitch - r);
  }
  return i.length < 6 ? 0 : (i.sort((s, o) => s - o), 12 * Math.round(i[Math.floor(i.length / 2)] / 12));
}
function FA(n, e, t, i, s, o = 0) {
  const r = [];
  let l = [], a = null;
  const u = 1 / t.rate;
  for (let c = Math.max(0, i); c <= Math.min(s, n.measures.length - 1); c++) {
    const h = n.measures[c], f = e?.[c];
    if (!f || f[1] <= f[0]) {
      l.length > 1 && r.push(l), l = [], a = null;
      continue;
    }
    const d = Math.ceil((f[0] - t.start) * t.rate), p = Math.floor((f[1] - t.start) * t.rate - 1e-9);
    for (let v = d; v <= p; v++) {
      const m = v >= 0 && v < t.midi.length ? t.midi[v] : null, b = t.start + v * u;
      (m === null || a !== null && Math.abs(b - a - u) > u / 2) && (l.length > 1 && r.push(l), l = []), a = b, m !== null && l.push([h.onset + (b - f[0]) / (f[1] - f[0]) * h.length, m + o]);
    }
  }
  return l.length > 1 && r.push(l), r;
}
const zA = ["aria-label"], WA = {
  class: "roll-tools",
  role: "toolbar",
  "aria-label": "Piano roll"
}, KA = {
  class: "group",
  role: "group",
  "aria-label": "Mode"
}, UA = ["aria-pressed"], jA = ["aria-pressed"], GA = {
  class: "group",
  role: "group",
  "aria-label": "Draw into"
}, qA = ["aria-pressed"], YA = ["aria-pressed"], XA = { title: "Grid for drawing, moving and resizing" }, JA = { value: "auto" }, ZA = {
  class: "group clip-tools",
  role: "group",
  "aria-label": "Clipboard"
}, QA = ["disabled"], eT = ["disabled"], tT = ["disabled", "title"], nT = ["disabled", "title"], iT = { title: "Hear a note's pitch when it is drawn, grabbed or moved, and a key of the keyboard when it is clicked" }, sT = ["disabled", "title"], oT = {
  class: "group",
  role: "group",
  "aria-label": "Zoom"
}, rT = {
  key: 0,
  title: "The source recording's waveform in a lane over the roll (untick it for a cover far from the original)"
}, lT = ["title"], aT = ["disabled"], uT = { title: "The roll pages along with the playback line" }, cT = { class: "hint" }, hT = {
  key: 0,
  class: "roll-note"
}, fT = ["width", "height"], dT = ["y", "width", "height"], pT = ["x1", "x2", "y1", "y2"], gT = ["x", "y"], mT = ["x", "y"], vT = ["d"], yT = ["x1", "x2", "y1", "y2"], bT = ["x1", "x2", "y1", "y2"], wT = ["transform"], xT = ["y", "width", "height"], kT = ["y"], ST = ["transform"], CT = ["width", "height"], MT = ["x", "width", "height"], AT = ["y", "width", "height"], TT = ["y", "width", "height"], $T = ["x", "y", "width", "height"], DT = ["d"], OT = ["x", "y"], LT = ["y", "width", "height"], ET = ["x", "y", "width", "height"], IT = ["x", "y", "height"], BT = ["x", "y"], RT = ["x1", "x2", "y2"], PT = ["x"], _T = ["x"], NT = ["x", "y", "width", "height"], VT = ["x", "y"], HT = {
  key: 2,
  class: "chord ghost"
}, FT = ["x", "y", "width", "height"], zT = ["x", "y"], WT = ["x", "y", "width", "height"], KT = ["x1", "x2", "y2"], UT = ["transform"], jT = ["y2"], GT = ["onKeydown"], qT = ["onKeydown"], Oo = 5, op = 6.2, YT = 26, XT = /* @__PURE__ */ tn({
  __name: "PianoRoll",
  props: /* @__PURE__ */ On({
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
  emits: /* @__PURE__ */ On(["select", "locate", "clipboard", "lyricEdit", "lyricPlace", "lyricDelete"], ["update:lyricSelection", "update:zoom", "update:audition", "update:rowHeight", "update:follow", "update:sungVisible", "update:waveVisible", "update:track"]),
  setup(n, { expose: e, emit: t }) {
    const i = n, s = t, o = Vt(n, "lyricSelection"), r = Vt(n, "zoom"), l = Vt(n, "audition"), a = Vt(n, "rowHeight"), u = Vt(n, "follow"), c = Vt(n, "sungVisible"), h = Vt(n, "waveVisible"), f = N(() => !!i.source && h.value), d = /* @__PURE__ */ G(null), p = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), b = Vt(n, "track"), O = /* @__PURE__ */ G("draw"), L = /* @__PURE__ */ G("auto"), E = /* @__PURE__ */ G(null), I = /* @__PURE__ */ G(null), z = /* @__PURE__ */ G(!1), R = /* @__PURE__ */ G(0), Y = /* @__PURE__ */ G(0), K = /* @__PURE__ */ G(0), re = /* @__PURE__ */ G(0);
    let j = !1;
    const D = /* @__PURE__ */ G(null), U = /* @__PURE__ */ G(null), ke = /* @__PURE__ */ G(null);
    let $e = !1;
    const ce = /* @__PURE__ */ G(null);
    let pe = null, He = null;
    const Oe = N(() => i.view?.model ?? null), Re = N(() => Oe.value ? Ch(Oe.value) : []), Le = N(() => Oe.value?.tracks.chords ?? []), J = N(
      () => Oe.value ? zC(Oe.value, {
        pxPerQuarter: r.value,
        snap: L.value,
        lyrics: !!i.lyrics,
        source: f.value,
        rowHeight: a.value
      }) : null
    ), ct = /* @__PURE__ */ G(null);
    function ye(x) {
      l.value && Ac(x, 0.35, i.sound);
    }
    const Be = N(() => !i.readonly && !i.stale && !i.busy && !z.value), se = N(() => go(i.view, i.selection)), Z = N(() => yr(i.selection)), ne = N(() => go(i.view, i.playing)), Xe = N(() => n2(E.value)), ht = N(() => t2(E.value)), vt = N(() => {
      const x = J.value, A = I.value;
      if (!x || !A) return null;
      const T = Jv(A, x, Y.value, R.value), Q = new Set(A.keep);
      for (const Ee of GC(Re.value, T, x)) Q.add(Ee.id);
      const q = new Set(A.keepChords);
      for (const Ee of qC(Le.value, A, x, Y.value, R.value)) q.add(Ee.id);
      const ve = jC(A, Y.value);
      return { rect: T, ids: Q, chords: q, lane: ve };
    }), S = N(
      () => O.value === "draw" ? "click: a note (the last length) · drag: draw · Shift+drag: frame · drag a note: move (↕ pitch, Alt: copy) · drag its end: length (stops at the next note, Alt: over it) · double-click the lane: chord · Del: rest · Shift+Del: close the gap · Ctrl+wheel or G / H: zoom" : "drag: frame the notes to select (Shift: add) · click: note (Shift: add or remove) · drag a selected note: move them all (Alt: copy) · into the chord lane: chords too · Ctrl+A: all · ↑↓←→: move · Del: rest · Shift+Del: close the gap · Ctrl+C / Ctrl+X: copy / cut · Ctrl+V: paste at the cursor · Ctrl+Shift+V: insert · Ctrl+D: duplicate · Ctrl+wheel or G / H: zoom"
    ), w = N(
      () => i.lyrics && i.lyricsEditable ? " · lyrics lane: double-click: edit the words · drag a line: move · drag its start or end: longer / shorter · Del · Ctrl+C / Ctrl+V" : ""
    ), $ = N(() => Oe.value && i.locator !== null ? ry(Oe.value, i.locator) : "");
    function B(x, A, T) {
      const Q = ce.value;
      return !Q || !Q.delta ? [A, T] : Q.kind === "move" && Q.keys.includes(x) ? [A + Q.delta, T + Q.delta] : Q.key !== x ? [A, T] : Q.kind === "start" ? [Math.min(A + Q.delta, T - 1), T] : Q.kind === "end" ? [A, Math.max(T + Q.delta, A + 1)] : [A, T];
    }
    function _(x) {
      const A = ce.value;
      return A?.delta ? A.kind === "move" ? A.keys.includes(x) : A.key === x : !1;
    }
    const V = N(() => {
      const x = J.value, A = i.lyrics;
      if (!x || !A) return [];
      const T = A.sections.flatMap(
        (q) => q.lines.filter((ve) => ve.text).map((ve) => {
          const Ee = Cl(q.section, ve.line), [je, st] = B(Ee, ve.start, ve.end);
          return { ...ve, start: je, end: st, section: q.section, key: Ee };
        })
      ).sort((q, ve) => q.start - ve.start || q.line - ve.line), Q = new Set(o.value);
      return T.map((q, ve) => {
        const Ee = ot(q.start, x), je = T.slice(ve + 1).find((Ne) => Ne.start > q.start), st = je ? ot(je.start, x) - Ee - 2 : 640, Pe = Math.max(16, ot(q.end, x) - Ee), it = Math.max(1, Math.floor((Math.max(Pe, Math.min(st, q.text.length * op + 8)) - 8) / op)), Dt = q.text.length > it ? `${q.text.slice(0, Math.max(1, it - 1))}…` : q.text;
        return { ...q, x: Ee, width: Pe, shown: Dt, selected: Q.has(q.key), dragged: _(q.key) };
      }).filter((q) => et(q.start, Math.max(q.end, q.start + 64)));
    });
    function he(x) {
      const A = V.value.filter((q) => x >= q.x - Oo && x <= q.x + q.width + Oo), T = A.find((q) => x >= q.x && x <= q.x + q.width) ?? A[0];
      if (!T) return null;
      const Q = x >= T.x + T.width - Oo ? "end" : x <= T.x + Oo && T.width > 3 * Oo ? "start" : "move";
      return { key: T.key, start: T.start, end: T.end, part: Q };
    }
    function ie(x) {
      const A = [];
      for (const T of i.lyrics?.sections.flatMap((Q) => Q.lines.map((q) => ({ ...q, key: Cl(Q.section, q.line) }))) ?? []) {
        if (!(x.kind === "move" ? x.keys.includes(T.key) : T.key === x.key)) continue;
        const q = Math.max(T.end, T.start + 1);
        let ve = [T.start, q];
        x.kind === "move" ? ve = [T.start + x.delta, q + x.delta] : x.kind === "start" ? ve = [Math.min(T.start + x.delta, q - 1), q] : ve = [T.start, Math.max(q + x.delta, T.start + 1)], A.push({ key: T.key, start: Math.max(0, ve[0]), end: Math.max(1, ve[1]) });
      }
      return A;
    }
    const oe = N(() => {
      const x = /* @__PURE__ */ new Map();
      for (const A of i.lyrics?.sections ?? [])
        for (const T of A.lines) for (const Q of T.syllables) x.set(Q.onset, Q.end_of_word ? Q.text : `${Q.text}-`);
      return x;
    }), X = N(() => {
      const x = J.value;
      return x ? pt.value.map((A) => ({ n: A, rect: Ui(A, x) })).filter(({ rect: A }) => A.width >= YT).map(({ n: A, rect: T }) => ({ key: A.id, x: T.x + 2, y: T.y + T.height - 2.5, text: Cc(A.pitch) })) : [];
    }), Ae = N(() => {
      const x = J.value;
      return !x || !oe.value.size ? [] : pt.value.filter((A) => A.track === "vocal" && oe.value.has(A.onset)).map((A) => {
        const T = Ui(A, x);
        return { key: A.id, x: T.x + 1, y: T.y - 2, text: oe.value.get(A.onset) };
      });
    });
    function fe(x) {
      const A = Oe.value, T = i.lyrics;
      if (!A || !T) return null;
      for (const Q of T.sections) {
        const q = A.sections[Q.section];
        if (!q) continue;
        const ve = A.measures[q.first_bar - 1]?.onset ?? 0, Ee = A.measures[q.first_bar - 1 + q.bars]?.onset ?? A.total;
        if (x < ve || x >= Ee || Q.block === null) continue;
        const je = Q.lines.length ? Math.max(...Q.lines.map((Ne) => Ne.line)) + 1 : 0, st = Q.lines.find((Ne) => Ne.text && x >= Ne.start && x < Math.max(Ne.end, Ne.start + 1)), Pe = (Ne) => ({
          section: Q.section,
          block: Q.block,
          line: Ne.line,
          text: Ne.text,
          original: Ne.text,
          start: Ne.start
        });
        if (st) return Pe(st);
        const it = Q.phrases.find(([Ne, yt]) => x >= Ne && x < yt);
        if (it && !Q.lines.some((Ne) => Ne.syllables.length && Ne.start < it[1] && Ne.end > it[0]))
          return Pe({ line: je, text: "", start: it[0] });
        const Dt = [...Q.lines].reverse().find((Ne) => Ne.text && Ne.start <= x);
        return Pe(Dt ?? { line: je, text: "", start: ve });
      }
      return null;
    }
    function Ce(x) {
      const A = fe(x);
      A && ($e = !1, ke.value = A, Pn(() => {
        U.value?.focus(), U.value?.select();
      }));
    }
    function Te() {
      const x = ke.value;
      if (ke.value = null, !x || $e) {
        $e = !1;
        return;
      }
      d.value?.focus({ preventScroll: !0 }), x.text.trim() !== x.original.trim() && s("lyricEdit", { section: x.section, block: x.block, line: x.line, text: x.text.trim(), at: x.start });
    }
    function Fe() {
      $e = !0, ke.value = null, d.value?.focus({ preventScroll: !0 });
    }
    const ze = N(() => Oe.value ? `1/${Math.round($a(Oe.value) / (J.value?.snap ?? 1))}` : ""), Ke = N(() => {
      const x = J.value;
      if (!x) return [0, 0];
      const A = K.value || 1e5;
      return [ni(R.value - 200, x), ni(R.value + A + 200, x)];
    }), et = (x, A) => A >= Ke.value[0] && x <= Ke.value[1], pt = N(() => Re.value.filter((x) => et(x.onset, x.onset + x.duration))), Pt = N(
      () => Le.value.map((x, A) => ({ chord: x, next: Le.value[A + 1] })).filter(({ chord: x }) => et(x.onset, x.onset + 64))
    ), at = N(() => Oe.value ? UC(Oe.value).filter((x) => et(x.unit, x.unit)) : []), yn = N(() => {
      const x = J.value;
      return x ? Array.from({ length: x.high - x.low + 1 }, (A, T) => x.high - T) : [];
    }), qn = N(() => {
      const x = Oe.value;
      return x ? x.sections.filter((A) => !A.implicit).map((A) => ({ label: A.label, unit: x.measures[A.first_bar - 1]?.onset ?? 0 })).filter((A) => et(A.unit, A.unit + 64)) : [];
    });
    function Lt(x) {
      const A = v.value?.getBoundingClientRect();
      return [x.clientX - (A?.left ?? 0), x.clientY - (A?.top ?? 0)];
    }
    function _t(x) {
      return {
        note: !0,
        [x.track]: !0,
        selected: (vt.value?.ids ?? se.value).has(x.id),
        playing: ne.value.has(x.id),
        dragged: Xe.value.has(x.id)
      };
    }
    function bn(x) {
      const A = x.track === "vocal" ? "Vocal" : "Ins";
      let T = 1;
      for (const Q of Oe.value?.measures ?? []) Q.onset <= x.onset && (T = Q.n);
      return `${A} bar ${T}: ${x.name}, ${x.duration} units`;
    }
    function At(x) {
      s("select", x);
    }
    function ls(x) {
      const A = J.value;
      if (!A || x.button !== 0) return;
      d.value?.focus({ preventScroll: !0 });
      const [T, Q] = Lt(x), q = Gd(T, Q, Re.value, Le.value, A, b.value, Y.value, R.value);
      if (q.area === "keys") {
        l.value && Ac(q.pitch, 0.35, i.sound);
        return;
      }
      if (q.area === "header" || q.area === "source") {
        s("locate", Qd(q.unit, A.snap, A.total)), pe = { x: T, y: Q, start: null, started: !1, clear: !1, keep: null, ruler: !0 }, In(x);
        return;
      }
      const ve = x.shiftKey || x.ctrlKey || x.metaKey;
      if (q.area === "lyrics") {
        const Pe = he(T);
        if (!Pe) {
          ve || (o.value = []);
          return;
        }
        i.selection.length && At([]);
        const it = o.value, Dt = it.includes(Pe.key), Ne = ve ? Dt ? it.filter((yt) => yt !== Pe.key) : [...it, Pe.key] : Dt ? it : [Pe.key];
        if (Ne !== it && (o.value = Ne), i.lyricsEditable && (Ne.includes(Pe.key) || Pe.part !== "move")) {
          const yt = Pe.part === "move" ? [...Ne] : [Pe.key];
          pe = { x: T, y: Q, start: null, started: !1, clear: !1, keep: null, lyric: { kind: Pe.part, key: Pe.key, keys: yt, origin: ni(T, A), delta: 0 } }, In(x);
        }
        return;
      }
      o.value.length && !ve && (o.value = []);
      let Ee = null, je = !1, st = null;
      if (q.area === "note") {
        const Pe = se.value.has(q.note.id);
        let it;
        if (ve) {
          const Dt = new Set(se.value);
          Pe ? Dt.delete(q.note.id) : Dt.add(q.note.id), it = Re.value.filter((Ne) => Dt.has(Ne.id)), At(ll(it, Le.value.filter((Ne) => Z.value.has(Ne.id))));
        } else Pe ? it = Re.value.filter((Dt) => se.value.has(Dt.id)) : (it = [q.note], At(ll(it)));
        Be.value && it.some((Dt) => Dt.id === q.note.id) && (Ee = q.edge === "end" && it.length === 1 ? XC(q.note, Re.value, A.total) : YC(it, q.note, ni(T, A), jl(Q, A))), ye(q.note.pitch);
      } else if (q.area === "chord") {
        if (ve) {
          const Pe = new Set(Z.value);
          Pe.has(q.chord.id) ? Pe.delete(q.chord.id) : Pe.add(q.chord.id), At([...i.selection.filter((it) => !it.startsWith("chord:")), ...Pe]);
        } else Z.value.has(q.chord.id) || At([q.chord.id]);
        Be.value && (Ee = ZC(q.chord, ni(T, A)));
      } else if ((q.area === "grid" || q.area === "lane") && (O.value === "select" || x.shiftKey))
        st = ve ? { notes: [...se.value], chords: Le.value.filter((Pe) => Z.value.has(Pe.id)) } : { notes: [], chords: [] }, je = !ve;
      else if (q.area === "grid") {
        const Pe = !i.selection.length && !o.value.length;
        Be.value && !ve && (Ee = JC(b.value, q.unit, q.pitch, A), ye(q.pitch)), je = !ve, pe = { x: T, y: Q, start: Ee, started: !1, clear: je, keep: st, insert: Be.value && !ve && Pe }, In(x);
        return;
      } else
        je = !ve;
      pe = { x: T, y: Q, start: Ee, started: !1, clear: je, keep: st, from: { scrollTop: Y.value, scrollLeft: R.value } }, In(x);
    }
    function In(x) {
      try {
        v.value?.setPointerCapture?.(x.pointerId);
      } catch {
      }
    }
    function as(x) {
      const A = p.value, T = J.value;
      if (!A || !T) return;
      const Q = A.getBoundingClientRect();
      if (!Q.height) return;
      const q = T.rowHeight;
      if (x.clientY < Q.top + T.top + 12) A.scrollTop = Math.max(0, A.scrollTop - q);
      else if (x.clientY > Q.bottom - 16) A.scrollTop = A.scrollTop + q;
      else return;
      sn();
    }
    function Bs(x) {
      const A = J.value;
      if (!pe || !pe.start && !pe.keep && !pe.ruler && !pe.lyric || !A) return;
      const [T, Q] = Lt(x);
      if (pe.ruler) {
        s("locate", Qd(ni(T, A), A.snap, A.total));
        return;
      }
      if (pe.lyric) {
        if (!pe.started && Math.abs(T - pe.x) < Ud) return;
        pe.started = !0;
        const q = Math.round((ni(T, A) - pe.lyric.origin) / A.snap) * A.snap;
        ce.value = { ...pe.lyric, delta: q };
        return;
      }
      if (pe.started && as(x), !(!pe.started && Math.hypot(T - pe.x, Q - pe.y) < Ud)) {
        if (pe.started = !0, pe.keep)
          I.value = {
            x0: pe.x,
            y0: pe.y,
            x1: T,
            y1: Q,
            from: pe.from,
            keep: pe.keep.notes,
            keepChords: pe.keep.chords.map((q) => q.id)
          };
        else if (pe.start) {
          const q = E.value, ve = QC(pe.start, ni(T, A), jl(Q, A), A, { alt: x.altKey });
          ve.kind === "move" && ve.semitones !== (q?.kind === "move" ? q.semitones : 0) && ye(ve.anchor.pitch + ve.semitones), E.value = ve;
        }
      }
    }
    async function zt(x) {
      z.value = !0;
      try {
        await i.operate(x);
      } finally {
        z.value = !1, E.value = null;
      }
    }
    function Bi() {
      const x = pe;
      if (pe = null, !x || x.ruler) return;
      if (x.lyric) {
        const Q = ce.value;
        ce.value = null, x.started && Q?.delta && s("lyricPlace", ie(Q));
        return;
      }
      if (!x.started) {
        if (E.value = null, x.insert && x.start?.kind === "draw" && J.value) {
          const Q = J.value, q = Math.min(ct.value ?? Q.drawLength, Q.total - x.start.start);
          zt({ op: "insert_note", track: x.start.track, onset: x.start.start, duration: q, pitch: x.start.pitch });
          return;
        }
        x.clear && At([]);
        return;
      }
      if (x.keep) {
        const Q = vt.value?.ids ?? /* @__PURE__ */ new Set(), q = vt.value?.chords ?? new Set(x.keep.chords.map((ve) => ve.id));
        I.value = null, At(ll(Re.value.filter((ve) => Q.has(ve.id)), Le.value.filter((ve) => q.has(ve.id))));
        return;
      }
      const A = E.value, T = A ? e2(A, i.resizeMode) : null;
      if (!T) {
        E.value = null;
        return;
      }
      A?.kind === "draw" ? ct.value = A.end - A.start : A?.kind === "resize" && (ct.value = A.end - A.note.onset), zt(T);
    }
    function Ze() {
      pe = null, E.value = null, I.value = null, ce.value = null;
    }
    function Yn(x) {
      const A = J.value;
      if (!A) return;
      const [T, Q] = Lt(x), q = Gd(T, Q, Re.value, Le.value, A, b.value, Y.value, R.value);
      if (q.area === "lyrics") {
        i.lyricsEditable && Ce(q.unit);
        return;
      }
      if (Be.value) {
        if (q.area === "grid") {
          if (O.value !== "draw") return;
          const ve = Math.min(Sc(q.unit, A.snap), A.total - 1), Ee = Math.min(A.drawLength, A.total - ve);
          zt({ op: "insert_note", track: b.value, onset: ve, duration: Ee, pitch: q.pitch });
        } else if (q.area === "lane" || q.area === "chord") {
          const ve = q.area === "chord" ? q.chord : null, Ee = q.area === "chord" ? q.chord.onset : Math.min(Sc(q.unit, A.snap), A.total - 1);
          D.value = { onset: Ee, name: ve?.name ?? "", original: ve?.name ?? null }, Pn(() => {
            m.value?.focus(), m.value?.select();
          });
        }
      }
    }
    function bo() {
      const x = D.value;
      if (D.value = null, d.value?.focus({ preventScroll: !0 }), !x) return;
      const A = x.name.trim();
      if (A !== (x.original ?? "")) {
        if (!A) {
          x.original !== null && zt({ op: "delete_chord", onset: x.onset });
          return;
        }
        zt({ op: "put_chord", onset: x.onset, name: A });
      }
    }
    function us() {
      D.value = null, d.value?.focus({ preventScroll: !0 });
    }
    function mi(x) {
      if (x.target?.closest("input, select, textarea")) return;
      const T = J.value;
      if (!T) return;
      if (o.value.length && !x.ctrlKey && !x.metaKey) {
        const je = x.key === "ArrowLeft" ? -T.snap : x.key === "ArrowRight" ? T.snap : 0;
        if (x.key === "Delete" || x.key === "Backspace" || je || x.key === "Escape") {
          if (x.preventDefault(), x.stopPropagation(), x.key === "Escape") o.value = [];
          else if (i.lyricsEditable) je ? s("lyricPlace", ie({ kind: "move", key: "", keys: [...o.value], delta: je })) : s("lyricDelete", [...o.value]);
          else return;
          return;
        }
      }
      if (x.key === "Escape") {
        if (pe || E.value || I.value) Ze();
        else if (i.selection.length) At([]);
        else return;
        x.preventDefault(), x.stopPropagation();
        return;
      }
      const Q = x.key.toLowerCase();
      if ((Q === "g" || Q === "h") && !x.ctrlKey && !x.metaKey && !x.altKey) {
        x.preventDefault(), x.stopPropagation(), x.shiftKey ? Me(Q === "h" ? 2 : -2) : le(Q === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if (Q === "q" && !x.ctrlKey && !x.metaKey && !x.altKey) {
        x.preventDefault(), x.stopPropagation(), Yt(x.shiftKey);
        return;
      }
      if (x.key.toLowerCase() === "a" && (x.ctrlKey || x.metaKey) && !x.altKey) {
        x.preventDefault(), x.stopPropagation(), At(ll(Re.value, Le.value));
        return;
      }
      const q = Re.value.filter((je) => se.value.has(je.id)), ve = Le.value.filter((je) => Z.value.has(je.id)), Ee = i2(
        x.key,
        { shift: x.shiftKey, alt: x.altKey },
        q,
        ve,
        T,
        i.resizeMode
      );
      Ee !== void 0 && (x.preventDefault(), x.stopPropagation(), Ee && Be.value && zt(Ee));
    }
    function sn() {
      R.value = p.value?.scrollLeft ?? 0, Y.value = p.value?.scrollTop ?? 0, K.value = p.value?.clientWidth ?? 0, re.value = p.value?.clientHeight ?? 0;
    }
    function wn() {
      const x = J.value, A = p.value;
      j || !x || !A || !A.clientHeight || (j = !0, A.scrollTop = Yv(x, A.clientHeight, x.focus[0], x.focus[1]), sn());
    }
    function W(x, A = !0) {
      const T = J.value, Q = p.value, q = Re.value.find((je) => x.has(je.id));
      if (!T || !Q || !q || !Q.clientWidth) return;
      const ve = ot(q.onset, T);
      A && (ve < Q.scrollLeft + Sn || ve > Q.scrollLeft + Q.clientWidth - 40) && (Q.scrollLeft = Math.max(0, ve - Q.clientWidth / 3));
      const Ee = Q.clientHeight ? jd(T, Q.scrollTop, Q.clientHeight, q.pitch) : null;
      Ee !== null && (Q.scrollTop = Ee), sn();
    }
    function le(x, A) {
      const T = p.value, Q = J.value, q = Math.max(12, Math.min(240, Math.round(r.value * x)));
      if (q === r.value) return;
      if (!T || !Q) {
        r.value = q;
        return;
      }
      const ve = T.getBoundingClientRect(), Ee = i.locator !== null ? ot(i.locator, Q) - T.scrollLeft : null, je = A !== void 0 ? A - ve.left : Ee !== null && Ee >= Sn && Ee <= T.clientWidth ? Ee : T.clientWidth / 2, st = ni(T.scrollLeft + je, Q);
      r.value = q, Pn(() => {
        const Pe = J.value;
        Pe && (T.scrollLeft = Math.max(0, ot(st, Pe) - je), sn());
      });
    }
    function ae(x) {
      const A = x.deltaY || x.deltaX;
      if (x.altKey || (x.ctrlKey || x.metaKey) && x.shiftKey) {
        x.preventDefault(), Me(A < 0 ? 1 : -1, x.clientY);
        return;
      }
      !x.ctrlKey && !x.metaKey || (x.preventDefault(), le(A < 0 ? 1.15 : 1 / 1.15, x.clientX));
    }
    function Me(x, A) {
      const T = p.value, Q = J.value, q = Math.max(Gv, Math.min(qv, a.value + x));
      if (q === a.value) return;
      if (!T || !Q) {
        a.value = q;
        return;
      }
      const ve = T.getBoundingClientRect(), Ee = A !== void 0 ? A - ve.top : T.clientHeight / 2, je = Q.high - (T.scrollTop + Ee - Q.top) / Q.rowHeight;
      a.value = q, Pn(() => {
        const st = J.value;
        st && (T.scrollTop = Math.max(0, st.top + (st.high - je) * st.rowHeight - Ee), sn());
      });
    }
    function Yt(x) {
      const A = J.value;
      if (!A || !Be.value) return;
      const T = se.value.size ? Re.value.filter((Q) => se.value.has(Q.id)) : Re.value;
      T.length && zt({ op: "quantize", ids: T.map((Q) => Q.id), grid: A.snap, lengths: x });
    }
    const $r = N(() => {
      const x = i.source?.envelope;
      if (!x) return 1;
      let A = 0;
      for (let T = 0; T < x.max.length; T++) A = Math.max(A, x.max[T], -x.min[T]);
      return A || 1;
    }), Dr = N(() => {
      const x = J.value, A = Oe.value, T = i.sung;
      if (!x || !A || !T?.curve || !c.value) return [];
      const [Q, q] = Ke.value;
      let ve = 0, Ee = A.measures.length - 1;
      A.measures.forEach((st, Pe) => {
        st.onset + st.length < Q && (ve = Pe + 1), st.onset <= q && (Ee = Pe);
      });
      const je = (st) => x.top + (x.high - st) * x.rowHeight + x.rowHeight / 2;
      return FA(A, T.bars, T.curve, ve, Ee, T.offset).map((st, Pe) => ({
        key: `c${ve}-${Pe}`,
        d: st.map(([it, Dt], Ne) => `${Ne ? "L" : "M"}${ot(it, x).toFixed(1)} ${je(Dt).toFixed(1)}`).join("")
      }));
    }), Da = N(() => {
      const x = i.sung?.offset ?? 0;
      if (!x) return "sung";
      const A = Math.abs(x / 12);
      return `sung ${x > 0 ? "+" : "−"}${A > 1 ? A : ""}8va`;
    }), Rs = N(() => {
      const x = i.sung;
      if (!x) return "";
      if (x.problem) return `No sung pitch: ${x.problem}`;
      const A = x.offset;
      return `The source's sung pitch over the notes (node Sung Pitch)${A ? ` - drawn ${Math.abs(A / 12)} octave${Math.abs(A) > 12 ? "s" : ""} ${A > 0 ? "higher" : "lower"} than sung, where the transcription writes the melody` : ""}`;
    }), Or = N(() => {
      const x = J.value, A = Oe.value, T = i.source;
      if (!x || !A || !T || x.sourceTop === null) return [];
      const Q = x.sourceTop + _o / 2, q = (_o / 2 - 3) / $r.value, ve = [];
      return A.measures.forEach((Ee, je) => {
        if (!et(Ee.onset, Ee.onset + Ee.length)) return;
        const st = ot(Ee.onset, x), Pe = Ee.length * x.pxPerUnit, it = T.bars?.[je];
        if (!it) {
          ve.push({ key: `w${je}`, d: "", missing: !0, x: st, width: Pe });
          return;
        }
        const Dt = Math.max(1, Math.floor(Pe / 2)), Ne = [];
        PA(T.envelope, it[0], it[1], Dt).forEach(([yt, Ri], xo) => {
          const Lr = (st + (xo + 0.5) * (Pe / Dt)).toFixed(1);
          Ne.push(`M${Lr} ${(Q - Ri * q - 0.5).toFixed(1)}V${(Q - yt * q + 0.5).toFixed(1)}`);
        }), ve.push({ key: `w${je}`, d: Ne.join(""), missing: !1, x: st, width: Pe });
      }), ve;
    });
    function wo(x) {
      const A = J.value, T = p.value;
      if (x === null || !A || !T || !T.clientWidth) return;
      const Q = ot(x, A);
      Q >= T.scrollLeft + Sn && Q <= T.scrollLeft + T.clientWidth - 24 || (T.scrollLeft = Math.max(0, Q - Sn - 24), sn());
    }
    return Ge(se, (x) => W(x)), Ge(ne, (x) => {
      i.recorded && i.playhead !== null || (u.value || i.playhead === null) && W(x, i.playhead === null);
    }), Ge(
      () => i.playhead,
      (x) => {
        u.value && wo(x);
      }
    ), Ge(() => i.locator, wo), Ge(
      () => i.recorded?.notes.at(-1)?.pitch,
      (x) => {
        const A = J.value, T = p.value;
        if (x === void 0 || !A || !T?.clientHeight) return;
        const Q = jd(A, T.scrollTop, T.clientHeight, x);
        Q !== null && (T.scrollTop = Q, sn());
      }
    ), Ge(
      () => !!Oe.value,
      (x) => {
        x ? Pn(wn) : j = !1;
      }
    ), kr(() => {
      sn(), wn(), p.value && typeof ResizeObserver < "u" && (He = new ResizeObserver(() => {
        sn(), wn();
      }), He.observe(p.value));
    }), Li(() => He?.disconnect()), e({ zoomBy: le, zoomRows: Me }), (x, A) => (k(), M("div", {
      ref_key: "root",
      ref: d,
      class: qe(["roll", { stale: n.stale, readonly: n.readonly, [`mode-${O.value}`]: !0 }]),
      tabindex: "0",
      role: "application",
      "aria-label": O.value === "draw" ? "Piano roll, draw mode: drag to draw a note, drag a note to move it, drag its end to change its length" : "Piano roll, select mode: drag a frame to select the notes in it, drag a selected note to move them all",
      onKeydown: mi
    }, [
      g("div", WA, [
        g("span", KA, [
          g("button", {
            class: qe(["mode draw", { active: O.value === "draw" }]),
            "aria-pressed": O.value === "draw",
            title: "Draw notes: a drag on the empty grid draws a note",
            onClick: A[0] || (A[0] = (T) => O.value = "draw")
          }, [...A[20] || (A[20] = [
            g("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              g("path", { d: "M2.5 11.5 3 9 9.5 2.5l2 2L5 11z M8.5 3.5l2 2" })
            ], -1),
            be(" Draw ", -1)
          ])], 10, UA),
          g("button", {
            class: qe(["mode select", { active: O.value === "select" }]),
            "aria-pressed": O.value === "select",
            title: "Select notes: a drag on the empty grid pulls a frame, every note it touches is selected (Shift: add)",
            onClick: A[1] || (A[1] = (T) => O.value = "select")
          }, [...A[21] || (A[21] = [
            g("svg", {
              class: "icon",
              viewBox: "0 0 14 14",
              "aria-hidden": "true"
            }, [
              g("rect", {
                x: "2",
                y: "3",
                width: "10",
                height: "8",
                "stroke-dasharray": "2 1.5"
              })
            ], -1),
            be(" Select ", -1)
          ])], 10, jA)
        ]),
        g("span", GA, [
          A[22] || (A[22] = be(" draw into ", -1)),
          g("button", {
            class: qe([{ active: b.value === "vocal" }, "vocal"]),
            "aria-pressed": b.value === "vocal",
            onClick: A[2] || (A[2] = (T) => b.value = "vocal")
          }, " Vocal ", 10, qA),
          g("button", {
            class: qe([{ active: b.value === "ins" }, "ins"]),
            "aria-pressed": b.value === "ins",
            onClick: A[3] || (A[3] = (T) => b.value = "ins")
          }, " Ins ", 10, YA)
        ]),
        g("label", XA, [
          A[27] || (A[27] = be(" snap ", -1)),
          We(g("select", {
            "onUpdate:modelValue": A[4] || (A[4] = (T) => L.value = T),
            "aria-label": "Snap"
          }, [
            g("option", JA, "auto (" + F(L.value === "auto" ? ze.value : "score") + ")", 1),
            A[23] || (A[23] = g("option", { value: 4 }, "1/4", -1)),
            A[24] || (A[24] = g("option", { value: 8 }, "1/8", -1)),
            A[25] || (A[25] = g("option", { value: 16 }, "1/16", -1)),
            A[26] || (A[26] = g("option", { value: 32 }, "1/32", -1))
          ], 512), [
            [$s, L.value]
          ])
        ]),
        g("span", ZA, [
          g("button", {
            disabled: !n.selection.length,
            title: "Copy the selected notes and chord symbols (Ctrl+C)",
            onClick: A[5] || (A[5] = (T) => s("clipboard", "copy"))
          }, " Copy ", 8, QA),
          g("button", {
            disabled: !n.selection.length || !Be.value,
            title: "Cut: copy the selection, its notes become rests (Ctrl+X)",
            onClick: A[6] || (A[6] = (T) => s("clipboard", "cut"))
          }, " Cut ", 8, eT),
          g("button", {
            disabled: !n.clip || !Be.value || n.locator === null,
            title: n.clip ? `Paste ${n.clip} at the cursor, replacing what its voices play there (Ctrl+V)` : "Paste at the cursor (Ctrl+V) - copy notes, chord symbols or sections first",
            onClick: A[7] || (A[7] = (T) => s("clipboard", "paste"))
          }, " Paste ", 8, tT),
          g("button", {
            disabled: !n.clip || !Be.value || n.locator === null,
            title: n.clip ? `Insert ${n.clip} at the cursor: everything from the cursor on moves later by whole bars (Ctrl+Shift+V; Cubase: Paste Time)` : "Insert at the cursor, moving what follows (Ctrl+Shift+V) - copy notes, chord symbols or sections first",
            onClick: A[8] || (A[8] = (T) => s("clipboard", "insert"))
          }, " Insert ", 8, nT)
        ]),
        g("label", iT, [
          We(g("input", {
            "onUpdate:modelValue": A[9] || (A[9] = (T) => l.value = T),
            type: "checkbox",
            "aria-label": "Hear the notes you edit"
          }, null, 512), [
            [hn, l.value]
          ]),
          A[28] || (A[28] = be(" hear ", -1))
        ]),
        g("button", {
          disabled: !Be.value,
          title: `Quantize (Q): the selected notes - all notes when none is selected - to the grid (${ze.value}); Shift+Q: their lengths too`,
          onClick: A[10] || (A[10] = (T) => Yt(!1))
        }, " Q ", 8, sT),
        g("span", oT, [
          g("button", {
            title: "Zoom out along the bars (G, Ctrl+wheel)",
            "aria-label": "Zoom out",
            onClick: A[11] || (A[11] = (T) => le(1 / 1.25))
          }, "−"),
          g("button", {
            title: "Zoom in along the bars (H, Ctrl+wheel)",
            "aria-label": "Zoom in",
            onClick: A[12] || (A[12] = (T) => le(1.25))
          }, "+"),
          g("button", {
            title: "Lower rows (Shift+G, Alt+wheel)",
            "aria-label": "Lower rows",
            onClick: A[13] || (A[13] = (T) => Me(-2))
          }, "↕−"),
          g("button", {
            title: "Taller rows (Shift+H, Alt+wheel)",
            "aria-label": "Taller rows",
            onClick: A[14] || (A[14] = (T) => Me(2))
          }, "↕+")
        ]),
        n.source ? (k(), M("label", rT, [
          We(g("input", {
            "onUpdate:modelValue": A[15] || (A[15] = (T) => h.value = T),
            type: "checkbox",
            "aria-label": "Show the source's waveform"
          }, null, 512), [
            [hn, h.value]
          ]),
          A[29] || (A[29] = be(" wave ", -1))
        ])) : ee("", !0),
        n.sung ? (k(), M("label", {
          key: 1,
          title: Rs.value,
          class: qe({ unavailable: !!n.sung.problem })
        }, [
          We(g("input", {
            "onUpdate:modelValue": A[16] || (A[16] = (T) => c.value = T),
            type: "checkbox",
            disabled: !!n.sung.problem,
            "aria-label": "Show the sung pitch"
          }, null, 8, aT), [
            [hn, c.value]
          ]),
          be(" " + F(Da.value), 1)
        ], 10, lT)) : ee("", !0),
        g("label", uT, [
          We(g("input", {
            "onUpdate:modelValue": A[17] || (A[17] = (T) => u.value = T),
            type: "checkbox",
            "aria-label": "Follow the playback"
          }, null, 512), [
            [hn, u.value]
          ]),
          A[30] || (A[30] = be(" follow ", -1))
        ]),
        g("span", cT, F(S.value) + F(w.value), 1)
      ]),
      !Oe.value && n.view?.model_error ? (k(), M("p", hT, F(n.view.model_error.message), 1)) : Oe.value && J.value ? (k(), M("div", {
        key: 1,
        ref_key: "scroller",
        ref: p,
        class: "roll-scroll",
        style: Mi({ height: `${Math.min(n.height, J.value.height + 16)}px` }),
        onScroll: sn,
        onWheel: ae
      }, [
        (k(), M("svg", {
          ref_key: "svg",
          ref: v,
          class: "roll-svg",
          width: J.value.width,
          height: J.value.height,
          onPointerdown: ls,
          onPointermove: Bs,
          onPointerup: Bi,
          onPointercancel: Ze,
          onDblclick: Yn
        }, [
          (k(!0), M(me, null, Ie(yn.value, (T) => (k(), M("rect", {
            key: "row" + T,
            class: qe(["row", { black: H(WC)(T), c: T % 12 === 0 }]),
            x: 0,
            y: H(po)(T, J.value),
            width: J.value.width,
            height: J.value.rowHeight
          }, null, 10, dT))), 128)),
          (k(!0), M(me, null, Ie(at.value, (T) => (k(), M("line", {
            key: "l" + T.unit,
            class: qe(T.kind),
            x1: H(ot)(T.unit, J.value),
            x2: H(ot)(T.unit, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 10, pT))), 128)),
          (k(!0), M(me, null, Ie(pt.value, (T) => (k(), M("rect", Eo({
            key: T.id,
            class: _t(T)
          }, { ref_for: !0 }, H(Ui)(T, J.value), { rx: "2" }), [
            g("title", null, F(bn(T)), 1)
          ], 16))), 128)),
          (k(!0), M(me, null, Ie(X.value, (T) => (k(), M("text", {
            key: "p" + T.key,
            class: "note-name",
            x: T.x,
            y: T.y
          }, F(T.text), 9, gT))), 128)),
          (k(!0), M(me, null, Ie(Ae.value, (T) => (k(), M("text", {
            key: "y" + T.key,
            class: "syllable",
            x: T.x,
            y: T.y
          }, F(T.text), 9, mT))), 128)),
          (k(!0), M(me, null, Ie(Dr.value, (T) => (k(), M("path", {
            key: T.key,
            class: "sung-pitch",
            d: T.d
          }, null, 8, vT))), 128)),
          n.recorded ? (k(!0), M(me, { key: 0 }, Ie(n.recorded.notes, (T, Q) => (k(), M("rect", Eo({
            key: "rec" + Q,
            class: "rec-note"
          }, { ref_for: !0 }, H(Ui)({ onset: T.onset, duration: Math.max(T.duration, 0.5), pitch: T.pitch }, J.value), { rx: "2" }), null, 16))), 128)) : ee("", !0),
          (k(!0), M(me, null, Ie(ht.value, (T, Q) => (k(), M("rect", Eo({
            key: "ghost" + Q,
            class: ["ghost", T.track]
          }, { ref_for: !0 }, H(Ui)(T, J.value), { rx: "2" }), null, 16))), 128)),
          vt.value && vt.value.rect.height > 0 ? (k(), M("rect", Eo({
            key: 1,
            class: "band"
          }, vt.value.rect), null, 16)) : ee("", !0),
          n.locator !== null ? (k(), M("line", {
            key: 2,
            class: "locator",
            x1: H(ot)(n.locator, J.value),
            x2: H(ot)(n.locator, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 8, yT)) : ee("", !0),
          n.playhead !== null ? (k(), M("line", {
            key: 3,
            class: "playhead",
            x1: H(ot)(n.playhead, J.value),
            x2: H(ot)(n.playhead, J.value),
            y1: J.value.top,
            y2: J.value.height
          }, null, 8, bT)) : ee("", !0),
          g("g", {
            class: "keys",
            transform: `translate(${R.value} 0)`
          }, [
            g("rect", {
              class: "keys-bg",
              x: 0,
              y: J.value.top,
              width: H(Sn) - 2,
              height: J.value.height - J.value.top
            }, [...A[31] || (A[31] = [
              g("title", null, "Click a key to hear its pitch", -1)
            ])], 8, xT),
            (k(!0), M(me, null, Ie(yn.value.filter((T) => T % 12 === 0), (T) => (k(), M("text", {
              key: "k" + T,
              class: "key-label",
              x: 4,
              y: H(po)(T, J.value) + J.value.rowHeight - 2
            }, F(H(KC)(T)), 9, kT))), 128))
          ], 8, wT),
          g("g", {
            class: "roll-top",
            transform: `translate(0 ${Y.value})`
          }, [
            g("rect", {
              class: "top-bg",
              x: 0,
              y: 0,
              width: J.value.width,
              height: J.value.top
            }, null, 8, CT),
            g("rect", {
              class: "ruler",
              x: H(Sn),
              y: 0,
              width: J.value.width - H(Sn),
              height: H(si)
            }, [...A[32] || (A[32] = [
              g("title", null, "Click or drag here to set the cursor - playback and paste start there", -1)
            ])], 8, MT),
            g("rect", {
              class: "lane",
              x: 0,
              y: H(si),
              width: J.value.width,
              height: H(ms)
            }, null, 8, AT),
            n.source && J.value.sourceTop !== null ? (k(), M(me, { key: 0 }, [
              g("rect", {
                class: "source-lane",
                x: 0,
                y: J.value.sourceTop,
                width: J.value.width,
                height: H(_o)
              }, [...A[33] || (A[33] = [
                g("title", null, "The source recording, bar by bar where the transcription puts it - click to set the cursor", -1)
              ])], 8, TT),
              (k(!0), M(me, null, Ie(Or.value, (T) => (k(), M(me, {
                key: T.key
              }, [
                T.missing ? (k(), M("rect", {
                  key: 0,
                  class: "source-missing",
                  x: T.x,
                  y: J.value.sourceTop + 2,
                  width: T.width,
                  height: H(_o) - 4
                }, [...A[34] || (A[34] = [
                  g("title", null, "A bar the source does not have (inserted): silent while the source plays", -1)
                ])], 8, $T)) : (k(), M("path", {
                  key: 1,
                  class: "source-wave",
                  d: T.d
                }, null, 8, DT))
              ], 64))), 128)),
              g("text", {
                class: "source-label",
                x: R.value + 3,
                y: J.value.sourceTop + 11
              }, "source", 8, OT)
            ], 64)) : ee("", !0),
            n.lyrics ? (k(), M(me, { key: 1 }, [
              g("rect", {
                class: "lyrics-lane",
                x: 0,
                y: H(Si),
                width: J.value.width,
                height: H(Po)
              }, null, 8, LT),
              (k(!0), M(me, null, Ie(V.value, (T) => (k(), M("g", {
                key: T.key,
                class: qe(["lyric-line", { unsung: !T.syllables.length, selected: T.selected, dragged: T.dragged }])
              }, [
                g("rect", {
                  x: T.x,
                  y: H(Si) + 3,
                  width: T.width,
                  height: H(Po) - 6,
                  rx: "3"
                }, null, 8, ET),
                n.lyricsEditable ? (k(), M("rect", {
                  key: 0,
                  class: "edge",
                  x: T.x + T.width - 3,
                  y: H(Si) + 5,
                  width: 3,
                  height: H(Po) - 10
                }, null, 8, IT)) : ee("", !0),
                g("text", {
                  x: T.x + 4,
                  y: H(Si) + H(Po) / 2 + 4
                }, F(T.shown), 9, BT),
                g("title", null, F(T.text) + F(n.lyricsEditable ? " - click: select · drag: move · drag its start or end: longer / shorter · double-click: edit the words" : ""), 1)
              ], 2))), 128))
            ], 64)) : ee("", !0),
            (k(!0), M(me, null, Ie(at.value.filter((T) => T.kind === "bar"), (T) => (k(), M("line", {
              key: "t" + T.unit,
              class: "bar",
              x1: H(ot)(T.unit, J.value),
              x2: H(ot)(T.unit, J.value),
              y1: 0,
              y2: J.value.top
            }, null, 8, RT))), 128)),
            (k(!0), M(me, null, Ie(at.value.filter((T) => T.bar), (T) => (k(), M("text", {
              key: "n" + T.unit,
              class: "bar-number",
              x: H(ot)(T.unit, J.value) + 3,
              y: 12
            }, F(T.bar), 9, PT))), 128)),
            (k(!0), M(me, null, Ie(qn.value, (T) => (k(), M("text", {
              key: "s" + T.unit,
              class: "section-label",
              x: H(ot)(T.unit, J.value) + 22,
              y: 12
            }, F(T.label), 9, _T))), 128)),
            (k(!0), M(me, null, Ie(Pt.value, ({ chord: T, next: Q }) => (k(), M("g", {
              key: T.id,
              class: qe(["chord", {
                selected: (vt.value?.chords ?? Z.value).has(T.id),
                dragged: E.value?.kind === "chord" && E.value.chord.id === T.id
              }])
            }, [
              g("rect", {
                x: H(ot)(T.onset, J.value),
                y: H(si) + 3,
                width: H(Gl)(T, Q, J.value),
                height: H(ms) - 6,
                rx: "3"
              }, null, 8, NT),
              g("text", {
                x: H(ot)(T.onset, J.value) + 4,
                y: H(si) + H(ms) / 2 + 4
              }, F(T.name), 9, VT),
              g("title", null, "chord " + F(T.name) + " - drag to move, double-click to rename, Delete to remove", 1)
            ], 2))), 128)),
            E.value?.kind === "chord" ? (k(), M("g", HT, [
              g("rect", {
                x: H(ot)(E.value.to, J.value),
                y: H(si) + 3,
                width: H(Gl)(E.value.chord, void 0, J.value),
                height: H(ms) - 6,
                rx: "3"
              }, null, 8, FT),
              g("text", {
                x: H(ot)(E.value.to, J.value) + 4,
                y: H(si) + H(ms) / 2 + 4
              }, F(E.value.chord.name), 9, zT)
            ])) : ee("", !0),
            vt.value?.lane && vt.value.rect.width > 0 ? (k(), M("rect", {
              key: 3,
              class: "band",
              x: vt.value.rect.x,
              y: H(si),
              width: vt.value.rect.width,
              height: H(ms)
            }, null, 8, WT)) : ee("", !0),
            n.playhead !== null ? (k(), M("line", {
              key: 4,
              class: "playhead",
              x1: H(ot)(n.playhead, J.value),
              x2: H(ot)(n.playhead, J.value),
              y1: 0,
              y2: J.value.top
            }, null, 8, KT)) : ee("", !0),
            n.locator !== null ? (k(), M("g", {
              key: 5,
              class: "locator-mark",
              transform: `translate(${H(ot)(n.locator, J.value)} 0)`
            }, [
              g("line", {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: J.value.top
              }, null, 8, jT),
              A[35] || (A[35] = g("path", { d: "M-5 0 H5 L0 7 Z" }, null, -1)),
              g("title", null, "Cursor at " + F($.value) + " - click or drag in the ruler to move it", 1)
            ], 8, UT)) : ee("", !0)
          ], 8, ST)
        ], 40, fT)),
        D.value ? We((k(), M("input", {
          key: 0,
          ref_key: "chordInput",
          ref: m,
          "onUpdate:modelValue": A[18] || (A[18] = (T) => D.value.name = T),
          class: "chord-edit",
          "aria-label": "Chord symbol (empty removes it)",
          placeholder: "Am7",
          style: Mi({ left: `${H(ot)(D.value.onset, J.value)}px`, top: `${H(si) + 1 + Y.value}px` }),
          onKeydown: [
            Et(ft(bo, ["prevent"]), ["enter"]),
            Et(ft(us, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: us
        }, null, 44, GT)), [
          [Nt, D.value.name]
        ]) : ee("", !0),
        ke.value ? We((k(), M("input", {
          key: 1,
          ref_key: "lyricInput",
          ref: U,
          "onUpdate:modelValue": A[19] || (A[19] = (T) => ke.value.text = T),
          class: "lyric-edit",
          "aria-label": "Lyrics line (empty removes it)",
          placeholder: "the words of this phrase",
          style: Mi({ left: `${H(ot)(ke.value.start, J.value)}px`, top: `${H(Si) + 1 + Y.value}px` }),
          onKeydown: [
            Et(ft(Te, ["prevent"]), ["enter"]),
            Et(ft(Fe, ["prevent", "stop"]), ["esc"])
          ],
          onBlur: Te
        }, null, 44, qT)), [
          [Nt, ke.value.text]
        ]) : ee("", !0)
      ], 36)) : ee("", !0)
    ], 42, zA));
  }
}), Xl = (n) => [...new Set(n)].sort((e, t) => e - t);
function rp(n, e, t, i) {
  if (t.range && i !== null) {
    const [s, o] = i <= e ? [i, e] : [e, i], r = Array.from({ length: o - s + 1 }, (l, a) => s + a);
    return t.toggle ? Xl([...n, ...r]) : r;
  }
  return t.toggle ? n.includes(e) ? n.filter((s) => s !== e) : Xl([...n, e]) : [e];
}
function lp(n, e) {
  const t = new Set(e), i = Array.from({ length: n }, (s, o) => o).filter((s) => !t.has(s));
  return !i.length || i.length === n ? null : { order: i.map((s) => s + 1), selection: [] };
}
function ap(n, e) {
  const t = Xl(e).filter((o) => o >= 0 && o < n);
  if (!t.length) return null;
  const i = t[t.length - 1];
  return { order: [
    ...Array.from({ length: i + 1 }, (o, r) => r),
    ...t,
    ...Array.from({ length: n - i - 1 }, (o, r) => i + 1 + r)
  ].map((o) => o + 1), selection: t.map((o, r) => i + 1 + r) };
}
function up(n, e, t) {
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
function cp(n, e, t, i) {
  const s = Xl(e).filter((a) => a >= 0 && a < n);
  if (!s.length || t < 0 || t > n) return null;
  const o = i ? Array.from({ length: n }, (a, u) => u) : Array.from({ length: n }, (a, u) => u).filter((a) => !s.includes(a)), r = i ? t : t - s.filter((a) => a < t).length, l = [...o.slice(0, r), ...s, ...o.slice(r)];
  return !i && l.every((a, u) => a === u) ? null : { order: l.map((a) => a + 1), selection: s.map((a, u) => r + u) };
}
const Fi = /* @__PURE__ */ G(null);
function Jl(n) {
  return n.id.startsWith("ins:") ? "ins" : "vocal";
}
function JT(n, e, t = null) {
  const i = [...new Set(e)].sort((u, c) => u - c).filter((u) => n.sections[u]), s = i.map((u) => n.sections[u]);
  if (!s.length) return null;
  const o = [], r = [], l = [];
  let a = 0;
  for (const [u, c] of s.entries()) {
    const h = n.measures[c.first_bar - 1], f = n.measures[c.first_bar - 1 + c.bars - 1], d = h.onset, p = f.onset + f.length;
    for (const m of [...n.tracks.vocal, ...n.tracks.ins]) {
      if (m.onset >= p || m.onset + m.duration <= d) continue;
      const b = Math.max(m.onset, d);
      o.push({ track: Jl(m), onset: b - d + a, duration: Math.min(m.onset + m.duration, p) - b, pitch: m.pitch });
    }
    for (const m of n.tracks.chords) m.onset >= d && m.onset < p && r.push({ onset: m.onset - d + a, name: m.name });
    const v = t?.[i[u]];
    l.push(v ? { onset: a, label: c.label, lyrics: v } : { onset: a, label: c.label }), a += p - d;
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
function ZT(n) {
  const e = [...new Set(n)].sort((i, s) => i - s), t = [];
  for (let i = 0; i < e.length; ) {
    let s = i;
    for (; s + 1 < e.length && e[s + 1] === e[s] + 1; ) s++;
    t.push(s > i ? `${e[i]}-${e[s]}` : `${e[i]}`), i = s + 1;
  }
  return `bar${e.length > 1 ? "s" : ""} ${t.join(", ")}`;
}
function QT(n, e) {
  const t = [...new Set(e)].sort((r, l) => r - l).filter((r) => n.measures[r]);
  if (!t.length) return null;
  const i = [], s = [];
  let o = 0;
  for (const r of t) {
    const { onset: l, length: a } = n.measures[r], u = l + a;
    for (const c of [...n.tracks.vocal, ...n.tracks.ins]) {
      if (c.onset >= u || c.onset + c.duration <= l) continue;
      const h = Math.max(c.onset, l);
      i.push({ track: Jl(c), onset: h - l + o, duration: Math.min(c.onset + c.duration, u) - h, pitch: c.pitch });
    }
    for (const c of n.tracks.chords) c.onset >= l && c.onset < u && s.push({ onset: c.onset - l + o, name: c.name });
    o += a;
  }
  return { unit: n.unit, span: o, tracks: ["vocal", "ins"], withChords: !0, notes: i, chords: s, sections: [], label: ZT(t.map((r) => r + 1)) };
}
function hp(n, e, t) {
  if (!e.length && !t.length) return null;
  const i = Math.min(...e.map((l) => l.onset), ...t.map((l) => l.onset)), s = Math.max(...e.map((l) => l.onset + l.duration), ...t.map((l) => l.onset + 1)), o = ["vocal", "ins"].filter((l) => e.some((a) => Jl(a) === l)), r = [e.length ? `${e.length} note${e.length > 1 ? "s" : ""}` : "", t.length ? `${t.length} chord symbol${t.length > 1 ? "s" : ""}` : ""];
  return {
    unit: n.unit,
    span: s - i,
    tracks: o,
    withChords: t.length > 0,
    notes: e.map((l) => ({ track: Jl(l), onset: l.onset - i, duration: l.duration, pitch: l.pitch })),
    chords: t.map((l) => ({ onset: l.onset - i, name: l.name })),
    sections: [],
    label: r.filter(Boolean).join(" and ")
  };
}
function fp(n) {
  const e = /^1\/(\d+)$/.exec(n.trim());
  return e ? Number(e[1]) : NaN;
}
function e$(n, e) {
  const t = fp(e) / fp(n.unit);
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
function t$(n, e) {
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
function dp(n, e, t, i) {
  const s = e$(n, e.unit);
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
const n$ = {
  key: 0,
  class: "section-actions",
  role: "toolbar",
  "aria-label": "Arrange sections"
}, i$ = { class: "hint" }, s$ = ["disabled"], o$ = ["disabled"], r$ = ["disabled"], l$ = ["disabled"], a$ = ["disabled"], u$ = ["draggable", "aria-selected", "onDragstart", "onDragover"], c$ = ["onClick"], h$ = ["title"], f$ = { key: 0 }, d$ = ["onKeydown", "onBlur"], p$ = { class: "facts" }, g$ = {
  key: 0,
  class: "section-tools"
}, m$ = ["onClick"], v$ = ["onClick"], y$ = ["onClick"], b$ = ["onClick"], w$ = {
  key: 1,
  class: "split"
}, x$ = ["disabled"], k$ = {
  key: 2,
  class: "bar-actions",
  role: "toolbar",
  "aria-label": "Arrange bars"
}, S$ = { class: "hint" }, C$ = ["disabled"], M$ = ["disabled"], A$ = ["disabled"], T$ = ["disabled"], $$ = ["disabled"], D$ = ["draggable", "aria-selected", "title", "onClick", "onDragstart", "onDragover"], O$ = /* @__PURE__ */ tn({
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
    let p = null;
    const v = /* @__PURE__ */ G("sections"), m = /* @__PURE__ */ G(!1), b = /* @__PURE__ */ G(null), O = N(() => t.view?.sections ?? []), L = N(() => t.view?.bars ?? []), E = N(() => t.view && t.bar ? Bu(t.view, t.bar) : -1), I = N(() => new Set(t.errorBars)), z = N(() => !t.readonly && !!t.view?.model && O.value.length > 0);
    Ge(O, (w) => {
      l.value = (u ?? l.value).filter(($) => $ < w.length), u = null;
    }), Ge(L, (w) => {
      f.value = (p ?? f.value).filter(($) => $ < w.length), p = null;
    });
    function R(w, $) {
      s.value = w, o.value = $;
    }
    function Y(w) {
      const $ = o.value.trim();
      s.value = null, $ && $ !== O.value[w]?.label && i("operate", { op: "rename_section", section: w + 1, label: $ });
    }
    function K(w, $) {
      const B = O.value[w];
      B && i("operate", { op: "move_section_boundary", section: w + 1, start_bar: B.start_bar + $ });
    }
    function re(w) {
      const $ = t.sourceStarts?.[w - 1];
      return typeof $ == "number" ? pl($) : null;
    }
    function j(w, $) {
      v.value = "sections";
      const B = $.ctrlKey || $.metaKey;
      l.value = rp(l.value, w, { toggle: B, range: $.shiftKey }, a.value), $.shiftKey || (a.value = w);
      const _ = O.value[w];
      _ && !B && !$.shiftKey && i("goto", _.start_bar);
    }
    function D(w) {
      !w || !z.value || (u = w.selection, i("operate", { op: "arrange_sections", order: w.order }));
    }
    const U = () => D(ap(O.value.length, l.value)), ke = () => D(lp(O.value.length, l.value)), $e = (w) => D(up(O.value.length, l.value, w));
    function ce() {
      const w = t.view?.model;
      if (!w || !l.value.length) return;
      const $ = JT(w, l.value, t.sectionLyrics ?? null);
      $ && (Fi.value = $, i("notice", `copied ${$.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function pe(w, $) {
      v.value = "bars";
      const B = $.ctrlKey || $.metaKey;
      f.value = rp(f.value, w, { toggle: B, range: $.shiftKey }, d.value), $.shiftKey || (d.value = w);
      const _ = L.value[w];
      _ && !B && !$.shiftKey && i("goto", _.index);
    }
    function He(w) {
      !w || !z.value || (p = w.selection, i("operate", { op: "arrange_measures", order: w.order.map(($) => $ - 1) }));
    }
    const Oe = () => He(ap(L.value.length, f.value)), Re = () => He(lp(L.value.length, f.value)), Le = (w) => He(up(L.value.length, f.value, w));
    function J() {
      const w = t.view?.model;
      if (!w || !f.value.length) return;
      const $ = QT(w, f.value);
      $ && (Fi.value = $, i("notice", `copied ${$.label} - paste it at the cursor in the piano roll (Ctrl+V; Ctrl+Shift+V moves what follows)`));
    }
    function ct(w) {
      const $ = w.ctrlKey || w.metaKey, B = w.key.toLowerCase();
      if (w.key === "Delete" || w.key === "Backspace") Re();
      else if ($ && B === "d") Oe();
      else if ($ && B === "c") J();
      else if ($ && B === "x" && f.value.length < L.value.length)
        J(), Re();
      else if ($ && (w.key === "ArrowLeft" || w.key === "ArrowUp")) Le(-1);
      else if ($ && (w.key === "ArrowRight" || w.key === "ArrowDown")) Le(1);
      else if ($ && B === "a") f.value = L.value.map((_, V) => V);
      else if (w.key === "Escape" && f.value.length) f.value = [];
      else return !1;
      return !0;
    }
    function ye(w, $) {
      z.value && (v.value = "bars", f.value.includes(w) || (f.value = [w]), m.value = !0, $.dataTransfer?.setData("text/plain", "plenio-bars"), $.dataTransfer && ($.dataTransfer.effectAllowed = "copyMove"));
    }
    function Be(w, $) {
      if (!m.value) return;
      $.preventDefault();
      const B = $.currentTarget.getBoundingClientRect();
      b.value = $.clientX < B.left + B.width / 2 ? w : w + 1, $.dataTransfer && ($.dataTransfer.dropEffect = $.altKey || $.ctrlKey ? "copy" : "move");
    }
    function se(w) {
      !m.value || b.value === null || (w.preventDefault(), He(cp(L.value.length, f.value, b.value, w.altKey || w.ctrlKey)), Z());
    }
    function Z() {
      m.value = !1, b.value = null;
    }
    function ne(w) {
      if (!z.value || w.target?.closest("input, textarea, select")) return;
      if (v.value === "bars") {
        ct(w) && (w.preventDefault(), w.stopPropagation());
        return;
      }
      const $ = w.ctrlKey || w.metaKey, B = w.key.toLowerCase();
      let _ = !0;
      w.key === "Delete" || w.key === "Backspace" ? ke() : $ && B === "d" ? U() : $ && B === "c" ? ce() : $ && B === "x" && l.value.length < O.value.length ? (ce(), ke()) : $ && w.key === "ArrowUp" ? $e(-1) : $ && w.key === "ArrowDown" ? $e(1) : $ && B === "a" ? l.value = O.value.map((V, he) => he) : w.key === "Escape" && l.value.length ? l.value = [] : _ = !1, _ && (w.preventDefault(), w.stopPropagation());
    }
    function Xe(w, $) {
      z.value && (l.value.includes(w) || (l.value = [w]), c.value = !0, $.dataTransfer?.setData("text/plain", "plenio-sections"), $.dataTransfer && ($.dataTransfer.effectAllowed = "copyMove"));
    }
    function ht(w, $) {
      if (!c.value) return;
      $.preventDefault();
      const B = $.currentTarget.getBoundingClientRect();
      h.value = $.clientY < B.top + B.height / 2 ? w : w + 1, $.dataTransfer && ($.dataTransfer.dropEffect = $.altKey || $.ctrlKey ? "copy" : "move");
    }
    function vt(w) {
      !c.value || h.value === null || (w.preventDefault(), D(cp(O.value.length, l.value, h.value, w.altKey || w.ctrlKey)), S());
    }
    function S() {
      c.value = !1, h.value = null;
    }
    return (w, $) => (k(), M("nav", {
      class: "navigator",
      "aria-label": "Sections and bars",
      tabindex: "0",
      onKeydown: ne
    }, [
      z.value ? (k(), M("div", n$, [
        g("span", i$, F(l.value.length ? `${l.value.length} selected` : "Sections: click to select"), 1),
        g("button", {
          disabled: !l.value.length,
          title: "Duplicate the selected sections after the last one (Ctrl+D)",
          onClick: U
        }, " Duplicate ", 8, s$),
        g("button", {
          disabled: !l.value.length,
          title: "Copy the selected sections; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: ce
        }, " Copy ", 8, o$),
        g("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place earlier (Ctrl+↑)",
          "aria-label": "Move up",
          onClick: $[0] || ($[0] = (B) => $e(-1))
        }, "↑", 8, r$),
        g("button", {
          disabled: !l.value.length,
          title: "Move the selected sections one place later (Ctrl+↓)",
          "aria-label": "Move down",
          onClick: $[1] || ($[1] = (B) => $e(1))
        }, "↓", 8, l$),
        g("button", {
          disabled: !l.value.length || l.value.length >= O.value.length,
          class: "danger",
          title: "Delete the selected sections; the rest closes up (Del)",
          onClick: ke
        }, " Delete ", 8, a$)
      ])) : ee("", !0),
      g("ol", {
        class: "sections",
        onDragleave: $[5] || ($[5] = ft((B) => h.value = null, ["self"]))
      }, [
        (k(!0), M(me, null, Ie(O.value, (B, _) => (k(), M("li", {
          key: _,
          class: qe({
            current: _ === E.value,
            picked: l.value.includes(_),
            "drop-before": h.value === _,
            "drop-after": h.value === _ + 1 && _ === O.value.length - 1
          }),
          draggable: z.value,
          "aria-selected": l.value.includes(_),
          onDragstart: (V) => Xe(_, V),
          onDragover: (V) => ht(_, V),
          onDrop: vt,
          onDragend: S
        }, [
          g("div", {
            class: "section-head",
            onClick: (V) => j(_, V)
          }, [
            g("button", {
              class: "link",
              title: `Select (Ctrl+click: add, Shift+click: range) and go to bar ${B.start_bar}`
            }, [
              s.value !== _ ? (k(), M("strong", f$, F(B.label), 1)) : ee("", !0)
            ], 8, h$),
            s.value === _ ? We((k(), M("input", {
              key: 0,
              "onUpdate:modelValue": $[2] || ($[2] = (V) => o.value = V),
              class: "rename",
              "aria-label": "Section name",
              onClick: $[3] || ($[3] = ft(() => {
              }, ["stop"])),
              onKeydown: [
                Et(ft((V) => Y(_), ["prevent"]), ["enter"]),
                $[4] || ($[4] = Et(ft((V) => s.value = null, ["stop", "prevent"]), ["esc"]))
              ],
              onBlur: (V) => Y(_)
            }, null, 40, d$)), [
              [Nt, o.value]
            ]) : ee("", !0),
            g("span", p$, [
              be(" bars " + F(B.start_bar) + "-" + F(B.start_bar + B.bars - 1) + " · " + F(H(pl)(B.start_s)) + " ", 1),
              re(B.start_bar) ? (k(), M(me, { key: 0 }, [
                be(" · source " + F(re(B.start_bar)), 1)
              ], 64)) : ee("", !0)
            ])
          ], 8, c$),
          n.readonly ? ee("", !0) : (k(), M("div", g$, [
            g("button", {
              title: "Rename this section",
              onClick: (V) => R(_, B.label)
            }, "Rename", 8, m$),
            _ > 0 ? (k(), M(me, { key: 0 }, [
              g("button", {
                title: "Start this section one bar earlier",
                "aria-label": "Start one bar earlier",
                onClick: (V) => K(_, -1)
              }, "◀ bar", 8, v$),
              g("button", {
                title: "Start this section one bar later",
                "aria-label": "Start one bar later",
                onClick: (V) => K(_, 1)
              }, "bar ▶", 8, y$),
              g("button", {
                title: "Join this section to the one before",
                onClick: (V) => i("operate", { op: "merge_section", section: _ + 1 })
              }, " Join ↑ ", 8, b$)
            ], 64)) : ee("", !0)
          ]))
        ], 42, u$))), 128))
      ], 32),
      !n.readonly && n.bar ? (k(), M("div", w$, [
        g("label", null, [
          be(" New section at bar " + F(n.bar) + ": ", 1),
          We(g("input", {
            "onUpdate:modelValue": $[6] || ($[6] = (B) => r.value = B),
            "aria-label": "Name of the new section"
          }, null, 512), [
            [Nt, r.value]
          ])
        ]),
        g("button", {
          disabled: n.bar <= 1 || !r.value.trim(),
          title: "Start a new section at the selected bar",
          onClick: $[7] || ($[7] = (B) => i("operate", { op: "split_section", bar: n.bar, label: r.value }))
        }, " Split ", 8, x$)
      ])) : ee("", !0),
      z.value ? (k(), M("div", k$, [
        g("span", S$, F(f.value.length ? `${f.value.length} bar${f.value.length > 1 ? "s" : ""} selected` : "Bars: click to select (Ctrl / Shift: more)"), 1),
        g("button", {
          disabled: !f.value.length,
          title: "Duplicate the selected bars after the last one (Ctrl+D)",
          onClick: Oe
        }, " Duplicate ", 8, C$),
        g("button", {
          disabled: !f.value.length,
          title: "Copy the selected bars; paste them at the cursor in the piano roll (Ctrl+C)",
          onClick: J
        }, " Copy ", 8, M$),
        g("button", {
          disabled: !f.value.length,
          title: "Move the selected bars one place earlier (Ctrl+←)",
          "aria-label": "Move bars earlier",
          onClick: $[8] || ($[8] = (B) => Le(-1))
        }, "←", 8, A$),
        g("button", {
          disabled: !f.value.length,
          title: "Move the selected bars one place later (Ctrl+→)",
          "aria-label": "Move bars later",
          onClick: $[9] || ($[9] = (B) => Le(1))
        }, "→", 8, T$),
        g("button", {
          disabled: !f.value.length || f.value.length >= L.value.length,
          class: "danger",
          title: "Delete the selected bars; what follows moves up (Del)",
          onClick: Re
        }, " Delete ", 8, $$)
      ])) : ee("", !0),
      g("div", {
        class: "bar-strip",
        role: "list",
        "aria-label": "Bars",
        onDragleave: $[10] || ($[10] = ft((B) => b.value = null, ["self"]))
      }, [
        (k(!0), M(me, null, Ie(L.value, (B, _) => (k(), M("button", {
          key: B.index,
          role: "listitem",
          class: qe(["bar", {
            selected: B.index === n.bar,
            picked: f.value.includes(_),
            error: I.value.has(B.index),
            alt: n.view ? H(Bu)(n.view, B.index) % 2 === 1 : !1,
            "drop-before": b.value === _,
            "drop-after": b.value === _ + 1 && _ === L.value.length - 1
          }]),
          draggable: z.value,
          "aria-selected": f.value.includes(_),
          title: `Bar ${B.index} · ${H(pl)(B.start_s)} · ${B.chords.join(" ") || "no chord"}${z.value ? " - click to select (Ctrl+click: add, Shift+click: range), drag to move (Alt: copy)" : ""}`,
          onClick: (V) => pe(_, V),
          onDragstart: (V) => ye(_, V),
          onDragover: (V) => Be(_, V),
          onDrop: se,
          onDragend: Z
        }, F(B.index), 43, D$))), 128))
      ], 32)
    ], 32));
  }
}), L$ = {
  class: "palette",
  role: "toolbar",
  "aria-label": "Score operations"
}, E$ = {
  class: "group",
  "aria-label": "History"
}, I$ = ["disabled", "title"], B$ = ["disabled", "title"], R$ = {
  class: "group",
  "aria-label": "Pitch"
}, P$ = ["disabled"], _$ = ["disabled"], N$ = ["disabled"], V$ = ["disabled"], H$ = {
  class: "group",
  "aria-label": "Length"
}, F$ = ["disabled"], z$ = ["disabled"], W$ = ["disabled"], K$ = ["disabled"], U$ = {
  class: "group",
  "aria-label": "Chord"
}, j$ = ["disabled"], G$ = ["disabled"], q$ = ["disabled"], Y$ = { class: "group whole" }, X$ = { class: "whole-tools" }, J$ = ["disabled"], Z$ = ["disabled"], Q$ = ["disabled"], eD = ["disabled"], tD = ["disabled"], nD = ["disabled"], iD = /* @__PURE__ */ tn({
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
    const t = n, i = e, s = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(null), r = N(() => t.selection.filter((v) => t.view?.elements?.find((m) => m.id === v)?.kind === "note")), l = N(() => [...yr(t.selection)]), a = N(() => r.value.length > 0 || l.value.length > 0), u = N(() => t.primary?.kind === "note"), c = N(() => t.primary !== null && t.primary.kind !== "note"), h = N(() => {
      const v = t.primary;
      return !v || !t.view ? null : t.view.chords?.find((m) => m.bar === v.bar && Math.abs(m.start_s - v.start_s) < 1e-6) ?? null;
    }), f = N(() => t.primary && u.value ? Iu(t.primary.units, 1) : null), d = N(() => t.primary && u.value ? Iu(t.primary.units, -1) : null);
    Ge(
      () => t.view?.header?.tempo_bpm,
      (v) => {
        o.value = v ?? null;
      },
      { immediate: !0 }
    ), Ge(h, (v) => {
      s.value = v?.name ?? "";
    });
    function p(v) {
      l.value.length ? i("operate", { op: "set_note_pitch", ids: [...go(t.view, t.selection), ...l.value], semitones: v }) : r.value.length && i("operate", { op: "shift_pitch", ids: r.value, semitones: v });
    }
    return (v, m) => (k(), M("div", L$, [
      g("div", E$, [
        g("button", {
          disabled: !n.canUndo || n.busy,
          title: `Undo${n.undoLabel ? ": " + n.undoLabel : ""} (Ctrl+Z)`,
          onClick: m[0] || (m[0] = (b) => i("undo"))
        }, "↶", 8, I$),
        g("button", {
          disabled: !n.canRedo || n.busy,
          title: `Redo${n.redoLabel ? ": " + n.redoLabel : ""} (Ctrl+Y)`,
          onClick: m[1] || (m[1] = (b) => i("redo"))
        }, "↷", 8, B$)
      ]),
      g("div", R$, [
        g("button", {
          disabled: !a.value || n.busy,
          title: "Octave down (Shift+↓)",
          onClick: m[2] || (m[2] = (b) => p(-12))
        }, "−8va", 8, P$),
        g("button", {
          disabled: !a.value || n.busy,
          title: "Semitone down (↓): the selected notes and chord symbols",
          onClick: m[3] || (m[3] = (b) => p(-1))
        }, "−1", 8, _$),
        g("button", {
          disabled: !a.value || n.busy,
          title: "Semitone up (↑): the selected notes and chord symbols",
          onClick: m[4] || (m[4] = (b) => p(1))
        }, "+1", 8, N$),
        g("button", {
          disabled: !a.value || n.busy,
          title: "Octave up (Shift+↑)",
          onClick: m[5] || (m[5] = (b) => p(12))
        }, "+8va", 8, V$)
      ]),
      g("div", H$, [
        g("button", {
          disabled: !d.value || n.busy,
          title: "Shorter; a rest fills the time ([)",
          onClick: m[6] || (m[6] = (b) => n.primary && d.value && i("operate", { op: "set_duration", id: n.primary.id, units: d.value }))
        }, " shorter ", 8, F$),
        g("button", {
          disabled: !f.value || n.busy,
          title: "Longer, into the rest after the note (])",
          onClick: m[7] || (m[7] = (b) => n.primary && f.value && i("operate", { op: "set_duration", id: n.primary.id, units: f.value }))
        }, " longer ", 8, z$),
        g("button", {
          disabled: !r.value.length || n.busy,
          title: "Turn into a rest (R or Delete)",
          onClick: m[8] || (m[8] = (b) => i("operate", { op: "note_to_rest", ids: r.value }))
        }, " rest ", 8, W$),
        g("button", {
          disabled: !c.value || n.busy,
          title: "Turn the rest into a note (N)",
          onClick: m[9] || (m[9] = (b) => n.primary && i("operate", { op: "rest_to_note", id: n.primary.id }))
        }, " note ", 8, K$)
      ]),
      g("div", U$, [
        We(g("input", {
          "onUpdate:modelValue": m[10] || (m[10] = (b) => s.value = b),
          class: "chord",
          placeholder: "chord, e.g. Am7",
          "aria-label": "Chord symbol",
          disabled: !n.primary || n.busy,
          onKeydown: m[11] || (m[11] = Et(ft((b) => n.primary && s.value.trim() && i("operate", { op: "set_chord", id: n.primary.id, name: s.value }), ["prevent"]), ["enter"]))
        }, null, 40, j$), [
          [Nt, s.value]
        ]),
        g("button", {
          disabled: !n.primary || !s.value.trim() || n.busy,
          title: "Set the chord symbol at the selected note or rest",
          onClick: m[12] || (m[12] = (b) => n.primary && i("operate", { op: "set_chord", id: n.primary.id, name: s.value }))
        }, " set ", 8, G$),
        g("button", {
          disabled: !h.value || n.busy,
          title: "Remove the chord symbol at the selection",
          onClick: m[13] || (m[13] = (b) => h.value && i("operate", { op: "remove_chord", chord: h.value.id }))
        }, " remove ", 8, q$)
      ]),
      g("details", Y$, [
        m[22] || (m[22] = g("summary", { title: "Operations on the whole score" }, "Whole score", -1)),
        g("div", X$, [
          g("button", {
            disabled: n.busy,
            title: "Transpose everything a semitone down",
            onClick: m[14] || (m[14] = (b) => i("operate", { op: "transpose", semitones: -1 }))
          }, " transpose −1 ", 8, J$),
          g("button", {
            disabled: n.busy,
            title: "Transpose everything a semitone up",
            onClick: m[15] || (m[15] = (b) => i("operate", { op: "transpose", semitones: 1 }))
          }, " transpose +1 ", 8, Z$),
          g("label", null, [
            m[21] || (m[21] = be(" tempo ", -1)),
            We(g("input", {
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
          g("button", {
            disabled: n.busy || !o.value || o.value === n.view?.header?.tempo_bpm,
            title: "Set the quarter-note tempo; notes and bars stay",
            onClick: m[17] || (m[17] = (b) => o.value && i("operate", { op: "set_tempo", bpm: o.value }))
          }, " set tempo ", 8, Q$),
          g("button", {
            disabled: n.busy || !n.view?.has_chords,
            title: "Remove every chord symbol",
            onClick: m[18] || (m[18] = (b) => i("operate", { op: "strip_chords" }))
          }, " remove chords ", 8, eD),
          g("button", {
            disabled: n.busy,
            title: "Let the instrument play the vocal melody",
            onClick: m[19] || (m[19] = (b) => i("operate", { op: "move_vocal_to_ins" }))
          }, " melody → Ins ", 8, tD),
          g("button", {
            disabled: n.busy,
            title: "Replace every Vocal note by rests",
            onClick: m[20] || (m[20] = (b) => i("operate", { op: "silence_voice", voice: "Vocal" }))
          }, " silence Vocal ", 8, nD)
        ])
      ])
    ]));
  }
}), sD = {
  class: "transport",
  role: "group",
  "aria-label": "Playback"
}, oD = ["disabled", "title"], rD = {
  key: 0,
  class: "hear",
  role: "radiogroup",
  "aria-label": "Hear"
}, lD = ["aria-checked", "disabled", "title", "onClick"], aD = ["disabled"], uD = ["title"], cD = ["disabled"], hD = { class: "align" }, fD = ["aria-expanded", "title"], dD = {
  key: 0,
  class: "align-panel",
  role: "group",
  "aria-label": "Align the source recording"
}, pD = ["title"], gD = ["title"], mD = ["disabled"], vD = {
  key: 0,
  class: "facts"
}, yD = ["title"], bD = { title: "A click on every beat (takes effect at the next start)" }, wD = {
  class: "switches",
  role: "group",
  "aria-label": "Voices to play"
}, xD = {
  key: 0,
  title: "The Guide track: playback and MIDI only, never sent to YuE2"
}, kD = ["checked"], SD = { title: "Practice speed; the score's tempo is not changed" }, CD = { class: "facts" }, MD = {
  key: 1,
  class: "error"
}, AD = /* @__PURE__ */ tn({
  __name: "ScoreTransport",
  props: /* @__PURE__ */ On({
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
  emits: /* @__PURE__ */ On(["cursor", "time", "stopped"], ["update:voices", "update:speed", "update:metronome", "update:hear", "update:sourceLevel", "update:sourceShift"]),
  setup(n, { expose: e, emit: t }) {
    const i = n, s = Vt(n, "voices"), o = Vt(n, "speed"), r = Vt(n, "metronome"), l = Vt(n, "hear"), a = Vt(n, "sourceLevel"), u = Vt(n, "sourceShift"), c = /* @__PURE__ */ G(!1);
    function h(se) {
      u.value = Math.max(-10, Math.min(10, Math.round((u.value + se) * 1e3) / 1e3));
    }
    const f = N(() => {
      const se = Math.round(u.value * 1e3);
      return se ? `${Math.abs(se)} ms ${se > 0 ? "later" : "earlier"}` : "in place";
    }), d = t, p = new $A(), v = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1);
    let b = 0, O = null;
    const L = /* @__PURE__ */ G(!1), E = /* @__PURE__ */ G(0), I = /* @__PURE__ */ G(null);
    let z = null;
    const R = N(() => i.bar ?? 1), Y = N(() => i.from ?? i.view?.bars[R.value - 1]?.start_s ?? 0), K = N(() => i.position ? `the cursor (${i.position})` : `bar ${R.value}`), re = N(() => !!i.view?.notes), j = N(() => !!i.reference && !!i.source && o.value === 1), D = N(() => i.reference ? i.sourceProblem ? i.sourceProblem : i.source ? o.value !== 1 ? "the source plays at 100 % only" : null : "the source recording is loading…" : null);
    function U() {
      const se = j.value ? l.value : "notes";
      return { tones: se === "source" ? 0 : 1, source: se === "notes" ? 0 : a.value };
    }
    function ke(se) {
      const Z = i.view?.bars ?? [];
      let ne = 1;
      for (const Xe of Z) Xe.start_s <= se + jt && (ne = Xe.index);
      return ne;
    }
    function $e(se) {
      if (i.loopRange) return [i.loopRange.from, i.loopRange.to];
      const Z = i.view;
      if (!Z) return null;
      const ne = Z.sections[Bu(Z, ke(se))];
      return ne ? [ne.start_s, ne.end_s] : null;
    }
    function ce(se = Y.value, Z = null) {
      const ne = i.view;
      if (!ne) return;
      Re(), O = Z;
      const Xe = L.value && !Z ? $e(se) : null, ht = Xe && (se < Xe[0] - jt || se >= Xe[1] - jt) ? Xe[0] : se, vt = j.value, S = vt ? mA(ne, i.timelineBars) : null, w = { ...s.value };
      Z?.mute && (w[Z.mute] = !1), z = {
        from: ht,
        to: Xe ? Xe[1] : null,
        voices: w,
        speed: o.value,
        metronome: r.value,
        guide: i.guide ?? [],
        clock: S
      };
      const $ = z;
      b = Z ? He(ne, ht, Z.countIn, S) : 0;
      const B = wA(ne, $).map((V) => ({ ...V, at: V.at + b }));
      b && B.unshift(...Oe(ne, ht, Z?.countIn ?? 0, b));
      const _ = vt && S && i.source ? vA(S, ht, $.to).map((V) => ({ ...V, at: V.at + b })) : [];
      try {
        p.play(B, {
          source: _.length && i.source ? { buffer: i.source.buffer, segments: _ } : null,
          levels: U(),
          length: b + xA(ne, $),
          sounds: i.sounds,
          onTick: (V) => {
            m.value = V < b, !(V < b) && (E.value = SA($, V - b), d("cursor", CA(ne, E.value, $.voices)), d("time", E.value));
          },
          onEnd: () => {
            L.value && v.value && !Z ? ce(Xe?.[0] ?? $.from) : Le();
          }
        }), v.value = !0, m.value = b > 0, I.value = null;
      } catch (V) {
        I.value = V instanceof Error ? V.message : String(V);
      }
    }
    function pe(se, Z, ne) {
      const Xe = se.bars[ke(Z) - 1], ht = Number(Xe?.meter.split("/")[0]) || 4;
      return { beat: (ne?.[ke(Z) - 1]?.realDur ?? Xe?.duration_s ?? 2) / ht / mo(o.value), beats: ht };
    }
    function He(se, Z, ne, Xe) {
      if (ne <= 0) return 0;
      const { beat: ht, beats: vt } = pe(se, Z, Xe);
      return ne * vt * ht;
    }
    function Oe(se, Z, ne, Xe) {
      const { beat: ht, beats: vt } = pe(se, Z, z?.clock ?? null);
      return kA(se.bars[ke(Z) - 1] ?? null, vt, Z, ne, Xe, ht);
    }
    function Re() {
      p.stop(), v.value = !1, m.value = !1, O = null;
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
      const ne = p.elapsedAt(se) - b, Xe = Z.clock?.length ? Z.clock : null, ht = ne * mo(Z.speed);
      return Xe ? iy(Xe, os(Xe, Z.from) + ht) : Z.from + ht;
    }
    function ye() {
      v.value ? Le() : ce();
    }
    function Be() {
      l.value = l.value === "source" ? "notes" : "source";
    }
    return Ge(
      () => i.sounds,
      (se) => {
        se && p.setSounds(se);
      },
      { deep: !0 }
    ), Ge([l, a], () => {
      v.value && p.setLevels(U());
    }), Ge(
      () => i.from,
      (se, Z) => {
        v.value && !O && se !== null && se !== void 0 && se !== Z && ce(se);
      }
    ), e({ toggle: ye, stop: Le, swap: Be, playing: v, record: J, scoreSecondAt: ct, countingIn: m }), Li(() => p.close()), (se, Z) => (k(), M("div", sD, [
      g("button", {
        disabled: !re.value,
        title: v.value ? "Stop (Space)" : `Play from ${K.value} (Space)`,
        onClick: ye
      }, F(v.value ? "■ stop" : "▶ play"), 9, oD),
      ob(se.$slots, "record", {
        playing: v.value,
        countingIn: m.value
      }),
      n.reference ? (k(), M("span", rD, [
        (k(), M(me, null, Ie(["both", "notes", "source"], (ne) => g("button", {
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
        }, F(ne), 11, lD)), 64)),
        g("button", {
          disabled: !j.value,
          title: "A/B: the notes or the source alone - switched at once, also while it plays",
          onClick: Be
        }, "A/B", 8, aD),
        g("label", {
          class: "level",
          title: `The source's level under the notes: ${Math.round(a.value * 100)} %`
        }, [
          Z[14] || (Z[14] = be(" source ", -1)),
          We(g("input", {
            "onUpdate:modelValue": Z[0] || (Z[0] = (ne) => a.value = ne),
            type: "range",
            min: "0",
            max: "1",
            step: "0.05",
            disabled: !j.value,
            "aria-label": "Source level"
          }, null, 8, cD), [
            [
              Nt,
              a.value,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, uD),
        g("span", hD, [
          g("button", {
            class: qe({ active: u.value !== 0 }),
            "aria-expanded": c.value,
            title: `Align the recording with the bars (it is ${f.value})`,
            onClick: Z[1] || (Z[1] = (ne) => c.value = !c.value)
          }, " ⇆ align" + F(u.value ? ` ${Math.round(u.value * 1e3)} ms` : ""), 11, fD),
          c.value ? (k(), M("span", dD, [
            Z[15] || (Z[15] = g("span", { class: "facts" }, " The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback and the sung pitch follow. Kept with the sheet. ", -1)),
            g("button", {
              title: `One beat earlier (${Math.round((n.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: Z[2] || (Z[2] = (ne) => h(-(n.sourceBeat ?? 0.5)))
            }, "◀◀ beat", 8, pD),
            g("button", {
              title: "10 ms earlier",
              onClick: Z[3] || (Z[3] = (ne) => h(-0.01))
            }, "◀ 10 ms"),
            g("strong", null, F(f.value), 1),
            g("button", {
              title: "10 ms later",
              onClick: Z[4] || (Z[4] = (ne) => h(0.01))
            }, "10 ms ▶"),
            g("button", {
              title: `One beat later (${Math.round((n.sourceBeat ?? 0.5) * 1e3)} ms)`,
              onClick: Z[5] || (Z[5] = (ne) => h(n.sourceBeat ?? 0.5))
            }, "beat ▶▶", 8, gD),
            g("button", {
              disabled: !u.value,
              title: "Back to the transcription's beat grid",
              onClick: Z[6] || (Z[6] = (ne) => u.value = 0)
            }, "reset", 8, mD)
          ])) : ee("", !0)
        ]),
        D.value ? (k(), M("span", vD, F(D.value), 1)) : ee("", !0)
      ])) : ee("", !0),
      g("label", {
        title: n.loopRange ? `Play to the end of the selection (${n.loopRange.label}), then repeat it` : "Play to the end of the cursor's section, then repeat it (select notes to loop their bars)"
      }, [
        We(g("input", {
          "onUpdate:modelValue": Z[7] || (Z[7] = (ne) => L.value = ne),
          type: "checkbox"
        }, null, 512), [
          [hn, L.value]
        ]),
        be(" loop " + F(n.loopRange ? n.loopRange.label : "section"), 1)
      ], 8, yD),
      g("label", bD, [
        We(g("input", {
          "onUpdate:modelValue": Z[8] || (Z[8] = (ne) => r.value = ne),
          type: "checkbox"
        }, null, 512), [
          [hn, r.value]
        ]),
        Z[16] || (Z[16] = be(" metronome", -1))
      ]),
      g("span", wD, [
        g("label", null, [
          We(g("input", {
            "onUpdate:modelValue": Z[9] || (Z[9] = (ne) => s.value.Vocal = ne),
            type: "checkbox"
          }, null, 512), [
            [hn, s.value.Vocal]
          ]),
          Z[17] || (Z[17] = be(" Vocal", -1))
        ]),
        g("label", null, [
          We(g("input", {
            "onUpdate:modelValue": Z[10] || (Z[10] = (ne) => s.value.Ins = ne),
            type: "checkbox"
          }, null, 512), [
            [hn, s.value.Ins]
          ]),
          Z[18] || (Z[18] = be(" Ins", -1))
        ]),
        g("label", null, [
          We(g("input", {
            "onUpdate:modelValue": Z[11] || (Z[11] = (ne) => s.value.chords = ne),
            type: "checkbox"
          }, null, 512), [
            [hn, s.value.chords]
          ]),
          Z[19] || (Z[19] = be(" chords", -1))
        ]),
        n.guide?.length ? (k(), M("label", xD, [
          g("input", {
            checked: s.value.guide !== !1,
            type: "checkbox",
            "aria-label": "Play the Guide track",
            onChange: Z[12] || (Z[12] = (ne) => s.value = { ...s.value, guide: ne.target.checked })
          }, null, 40, kD),
          Z[20] || (Z[20] = be(" Guide ", -1))
        ])) : ee("", !0)
      ]),
      g("label", SD, [
        Z[22] || (Z[22] = be(" speed ", -1)),
        We(g("select", {
          "onUpdate:modelValue": Z[13] || (Z[13] = (ne) => o.value = ne),
          "aria-label": "Playback speed"
        }, [...Z[21] || (Z[21] = [
          g("option", { value: 0.5 }, "50 %", -1),
          g("option", { value: 0.75 }, "75 %", -1),
          g("option", { value: 1 }, "100 %", -1),
          g("option", { value: 1.25 }, "125 %", -1)
        ])], 512), [
          [
            $s,
            o.value,
            void 0,
            { number: !0 }
          ]
        ])
      ]),
      g("span", CD, F(v.value ? `▶ ${H(pl)(E.value)}` : `${n.position ? `cursor ${n.position} · ` : ""}a guide to the notes, not the model's sound`), 1),
      I.value ? (k(), M("span", MD, F(I.value), 1)) : ee("", !0)
    ]));
  }
}), TD = {
  class: "track-panel",
  role: "group",
  "aria-label": "Tracks"
}, $D = { class: "track-name" }, DD = { class: "count" }, OD = ["value", "aria-label", "title", "onChange"], LD = ["value", "title"], ED = ["title"], ID = ["checked", "aria-label", "onChange"], BD = {
  key: 0,
  class: "hint"
}, RD = {
  key: 1,
  class: "hint"
}, PD = /* @__PURE__ */ tn({
  __name: "TrackPanel",
  props: /* @__PURE__ */ On({
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
  emits: /* @__PURE__ */ On(["clearGuide"], ["update:voices", "update:sounds"]),
  setup(n, { emit: e }) {
    const t = n, i = Vt(n, "voices"), s = Vt(n, "sounds"), o = { Vocal: "Vocal", Ins: "Ins", chords: "chord", guide: "guide" };
    function r(h, f) {
      const d = o[h];
      s.value && d && (s.value = { ...s.value, [d]: f });
    }
    const l = e, a = N(
      () => n0(t.view, t.guideCount).filter((h) => t.keepsGuide || h.voice !== "guide")
    );
    function u(h) {
      return h === "guide" ? i.value.guide !== !1 : i.value[h] !== !1;
    }
    function c(h, f) {
      h === "guide" ? i.value = { ...i.value, guide: f } : i.value = { ...i.value, [h]: f };
    }
    return (h, f) => (k(), M("div", TD, [
      f[2] || (f[2] = g("h4", null, "Tracks", -1)),
      g("ul", null, [
        (k(!0), M(me, null, Ie(a.value, (d) => (k(), M("li", {
          key: d.voice,
          class: qe({ guide: d.voice === "guide", active: d.voice === "guide" && n.guideActive })
        }, [
          g("span", {
            class: "dot",
            style: Mi({ background: d.color }),
            "aria-hidden": "true"
          }, null, 4),
          g("span", $D, F(d.name), 1),
          g("span", {
            class: qe(["destination", { unsent: !d.sent }])
          }, F(d.destination), 3),
          g("span", DD, F(H(t0)(d.notes)), 1),
          s.value && o[d.voice] ? (k(), M("select", {
            key: 0,
            class: "sound",
            value: s.value[o[d.voice]],
            "aria-label": `Sound of the ${d.name} track`,
            title: `The ${d.name} track’s sound in the playback`,
            onChange: (p) => r(d.voice, p.target.value)
          }, [
            (k(!0), M(me, null, Ie(H(Th), (p) => (k(), M("option", {
              key: p,
              value: p,
              title: H(ql)[p].hint
            }, F(H(ql)[p].label), 9, LD))), 128))
          ], 40, OD)) : ee("", !0),
          g("label", {
            class: "play",
            title: `Play the ${d.name} track`
          }, [
            g("input", {
              type: "checkbox",
              checked: u(d.voice),
              "aria-label": `Play the ${d.name} track`,
              onChange: (p) => c(d.voice, p.target.checked)
            }, null, 40, ID)
          ], 8, ED),
          d.voice === "guide" && d.notes > 0 && !n.readonly ? (k(), M("button", {
            key: 1,
            class: "link",
            title: "Remove every Guide note from this sheet",
            onClick: f[0] || (f[0] = (p) => l("clearGuide"))
          }, " clear ")) : ee("", !0)
        ], 2))), 128))
      ]),
      n.keepsGuide ? (k(), M("p", BD, [...f[1] || (f[1] = [
        be(" The Guide track is yours alone: it is played here and written into exported MIDI files, and it is ", -1),
        g("strong", null, "never sent to YuE2", -1),
        be(". *Import MIDI…* fills it from a file's Guide track. ", -1)
      ])])) : (k(), M("p", RD, "This sheet keeps no Guide track; the three tracks above are what YuE2 reads."))
    ]));
  }
});
function Dh() {
  return { countIn: 1, quantize: 16, mode: "replace", mute: !0, thru: !0, stepLength: 8 };
}
function uy(n) {
  const e = Dh(), t = typeof n == "object" && n !== null ? n : {}, i = (s, o, r) => o.includes(s) ? s : r;
  return {
    countIn: i(t.countIn, [0, 1, 2], e.countIn),
    quantize: i(t.quantize, [0, 4, 8, 16, 32], e.quantize),
    mode: i(t.mode, ["replace", "merge"], e.mode),
    mute: typeof t.mute == "boolean" ? t.mute : e.mute,
    thru: typeof t.thru == "boolean" ? t.thru : e.thru,
    stepLength: i(t.stepLength, [1, 2, 4, 8, 16], e.stepLength)
  };
}
const cy = "plenio.score-editor.prefs";
function _D() {
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
    sounds: $h(),
    paper: "a4",
    record: Dh(),
    midiInput: "all"
  };
}
function ND(n) {
  const e = n.layout;
  return e === "text" ? { layout: "text", advanced: n.advanced === !0 } : e === "daw" ? { layout: "daw", advanced: n.advanced === !0 } : e === "both" ? { layout: "review", advanced: !0 } : { layout: "review", advanced: n.advanced === !0 };
}
function VD(n = hy()) {
  const e = _D();
  try {
    const t = n?.getItem(cy);
    if (!t) return e;
    const i = JSON.parse(t);
    return {
      ...ND(i),
      zoom: typeof i.zoom == "number" && i.zoom >= 0.6 && i.zoom <= 1.8 ? i.zoom : e.zoom,
      voices: {
        Vocal: i.voices?.Vocal !== !1,
        Ins: i.voices?.Ins !== !1,
        chords: i.voices?.chords !== !1,
        guide: i.voices?.guide !== !1
      },
      speed: typeof i.speed == "number" && i.speed >= 0.25 && i.speed <= 2 ? i.speed : e.speed,
      roll: i.roll !== !1,
      rollZoom: typeof i.rollZoom == "number" && i.rollZoom >= 12 && i.rollZoom <= 240 ? i.rollZoom : e.rollZoom,
      rollHeight: typeof i.rollHeight == "number" && i.rollHeight >= Wc && i.rollHeight <= Kc ? Math.round(i.rollHeight) : e.rollHeight,
      notationShare: typeof i.notationShare == "number" && i.notationShare >= Uc && i.notationShare <= jc ? i.notationShare : e.notationShare,
      sideWidth: typeof i.sideWidth == "number" && i.sideWidth >= Gc && i.sideWidth <= qc ? Math.round(i.sideWidth) : e.sideWidth,
      metronome: i.metronome === !0,
      hear: i.hear === "notes" || i.hear === "source" ? i.hear : e.hear,
      sourceLevel: typeof i.sourceLevel == "number" && i.sourceLevel >= 0 && i.sourceLevel <= 1 ? i.sourceLevel : e.sourceLevel,
      audition: i.audition !== !1,
      rowHeight: typeof i.rowHeight == "number" && i.rowHeight >= 6 && i.rowHeight <= 28 ? Math.round(i.rowHeight) : e.rowHeight,
      follow: i.follow !== !1,
      sung: i.sung !== !1,
      wave: i.wave !== !1,
      sounds: ly(i.sounds),
      paper: i.paper === "letter" ? "letter" : "a4",
      record: uy(i.record),
      midiInput: typeof i.midiInput == "string" && i.midiInput ? i.midiInput : "all"
    };
  } catch {
    return e;
  }
}
function HD(n, e = hy()) {
  try {
    e?.setItem(cy, JSON.stringify(n));
  } catch {
  }
}
function hy() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const FD = /^\[([^[\]\n]{1,40})\]$/;
function br(n) {
  const e = [], t = [];
  let i = null;
  for (const s of n.replace(/\r\n?/g, `
`).split(`
`)) {
    const o = s.trim(), r = FD.exec(o);
    r ? (i = { tag: r[1].trim(), lines: [] }, t.push(i)) : o && (i ? i.lines.push(o) : e.push(o));
  }
  return { preamble: e, blocks: t };
}
function Zl(n) {
  return n.replace(/^\[|\]$/g, "").trim().replace(/\s*\d+$/, "").toLowerCase();
}
function Oh(n, e) {
  return e && Zl(e.tag) === Zl(n) ? e.tag : n.replace(/(^|[\s-])(\p{L})/gu, (t, i, s) => i + s.toUpperCase());
}
function pp(n) {
  return n.sections.map((e) => n.measures[e.first_bar - 1]?.onset ?? 0);
}
function al(n, e) {
  if (!n?.trim() || !e) return null;
  const t = br(n), i = e.sections.filter((o) => !o.implicit);
  if (!t.blocks.length || t.blocks.length !== i.length || i.some((o, r) => Zl(o.label) !== Zl(t.blocks[r].tag))) return null;
  let s = 0;
  return { preamble: t.preamble, blocks: e.sections.map((o) => o.implicit ? null : t.blocks[s++]) };
}
function zD(n, e) {
  const t = n.preamble.length ? [n.preamble.join(`
`)] : [];
  return e.sections.forEach((i, s) => {
    if (i.implicit) return;
    const o = n.blocks[s] ?? null;
    t.push([`[${Oh(i.label, o)}]`, ...o?.lines ?? []].join(`
`));
  }), t.join(`

`);
}
function WD(n, e, t, i, s = () => null) {
  const o = i?.length ? i : [[0, e.total, 0]], r = pp(e), l = pp(t), a = (p) => {
    let v = -1;
    return r.forEach((m, b) => {
      m <= p && (v = b);
    }), v;
  }, u = (p) => {
    for (const [v, m, b] of o)
      if (p >= b && p < b + m - v) return v + p - b;
    return null;
  }, c = (p) => p ? { tag: p.tag, lines: [...p.lines] } : null, h = [], f = [], d = /* @__PURE__ */ new Set();
  return l.forEach((p, v) => {
    const m = u(p), b = m === null ? -1 : a(m);
    f.push(b), m === null ? h.push(s(p)) : b < 0 ? h.push(null) : m === r[b] || f[v - 1] !== b ? (h.push(c(n.blocks[b] ?? null)), d.add(b)) : h.push(null);
  }), r.forEach((p, v) => {
    const m = n.blocks[v]?.lines;
    if (!(d.has(v) || !m?.length))
      for (const [b, O, L] of o) {
        if (p < b || p >= O) continue;
        const E = L + p - b;
        let I = -1;
        l.forEach((R, Y) => {
          R <= E && (I = Y);
        });
        const z = I >= 0 && l[I] !== E ? h[I] : null;
        z && (h[I] = { tag: z.tag, lines: [...z.lines, ...m] });
      }
  }), { preamble: n.preamble, blocks: h };
}
function fy(n, e, t) {
  const i = [...n], s = t.trim();
  return e >= i.length ? s && i.push(s) : s ? i[e] = s : i.splice(e, 1), i;
}
function KD(n, e, t, i) {
  const s = br(n);
  if (!s.blocks[e]) return n;
  const r = s.blocks.map((a, u) => u === e ? { tag: a.tag, lines: fy(a.lines, t, i) } : a), l = s.preamble.length ? [s.preamble.join(`
`)] : [];
  for (const a of r) l.push([`[${a.tag}]`, ...a.lines].join(`
`));
  return l.join(`

`);
}
function UD(n, e, t, i, s) {
  const o = e.sections[t]?.label ?? "", r = n.blocks.map((l, a) => {
    if (a !== t) return l;
    const u = l ?? { tag: Oh(o, null), lines: [] };
    return { tag: u.tag, lines: fy(u.lines, i, s) };
  });
  return { preamble: n.preamble, blocks: r };
}
function jD(n, e, t) {
  const i = br(n);
  if (!i.blocks[e]) return n;
  const s = i.preamble.length ? [i.preamble.join(`
`)] : [];
  return i.blocks.forEach((o, r) => s.push([`[${o.tag}]`, ...r === e ? t : o.lines].join(`
`))), s.join(`

`);
}
function GD(n, e, t, i) {
  const s = e.sections[t]?.label ?? "", o = n.blocks.map(
    (r, l) => l === t ? { tag: (r ?? { tag: Oh(s, null) }).tag, lines: [...i] } : r
  );
  return { preamble: n.preamble, blocks: o };
}
const qD = 2, YD = 0.5, XD = 32;
function gp(n, e, t, i) {
  const s = [];
  for (const o of e) {
    const r = o.onset + o.duration;
    if (r <= t || o.onset >= i) continue;
    const l = Math.max(o.onset, t);
    s.push(`${l - t}.${Math.min(r, i) - l}.${o.pitch}`);
  }
  return `${n}:${s.join(",")}`;
}
function JD(n) {
  return n.measures.map((e) => [
    gp(e.meter, n.tracks.vocal, e.onset, e.onset + e.length),
    gp(e.meter, n.tracks.ins, e.onset, e.onset + e.length)
  ]);
}
function ZD(n, e) {
  let t = 0;
  for (let i = 0; i < 2; i++) n[i] === e[i] && (t += n[i].endsWith(":") ? YD : qD);
  return t;
}
function QD(n, e) {
  const t = n.map((l) => e.map((a) => ZD(l, a))), i = t.map((l) => l.length ? Math.max(...l) : 0), s = (l, a) => {
    let u = 0;
    for (; u < XD && l + u < n.length && a + u < e.length && !(i[l + u] <= 0 || t[l + u][a + u] !== i[l + u]); )
      u++;
    return u;
  }, o = [];
  let r = -1;
  for (let l = 0; l < n.length; l++) {
    const a = r + 1;
    let u;
    if (i[l] > 0) {
      const c = t[l].flatMap((d, p) => d === i[l] ? [p] : []), h = new Map(c.map((d) => [d, s(l, d)])), f = Math.max(...h.values());
      c.includes(a) && (h.get(a) ?? 0) >= f ? u = a : u = [...c].sort(
        (d, p) => (h.get(p) ?? 0) - (h.get(d) ?? 0) || Math.abs(d - a) - Math.abs(p - a) || d - p
      )[0];
    } else u = a < e.length ? a : null;
    o.push(u), u !== null && (r = u);
  }
  return o;
}
function e4(n, e) {
  if (e?.bars?.length)
    return !n || !e.bar_prints?.length ? n ? n.measures.map((t, i) => e.bars[i] ?? null) : e.bars : QD(JD(n), e.bar_prints).map((t) => t === null ? null : e.bars[t] ?? null);
}
const t4 = "0.4.5";
function n4(n) {
  return {
    sounds: { ...n.sounds },
    metronome: n.metronome,
    hear: n.hear,
    sourceLevel: n.sourceLevel,
    wave: n.wave,
    sung: n.sung,
    record: { ...n.record },
    paper: n.paper
  };
}
function mp(n, e) {
  return {
    ...n,
    ...e,
    sounds: { ...n.sounds, ...e.sounds ?? {} },
    record: { ...n.record, ...e.record ?? {} }
  };
}
function Lh(n) {
  if (typeof n != "object" || n === null) return {};
  const e = n, t = {};
  if (typeof e.sounds == "object" && e.sounds !== null) {
    const i = e.sounds;
    Object.values(i).some(Vo) && (t.sounds = ly(i));
  }
  return typeof e.metronome == "boolean" && (t.metronome = e.metronome), (e.hear === "both" || e.hear === "notes" || e.hear === "source") && (t.hear = e.hear), typeof e.sourceLevel == "number" && Number.isFinite(e.sourceLevel) && (t.sourceLevel = Math.max(0, Math.min(1, e.sourceLevel))), typeof e.wave == "boolean" && (t.wave = e.wave), typeof e.sung == "boolean" && (t.sung = e.sung), typeof e.record == "object" && e.record !== null && (t.record = uy(e.record)), (e.paper === "a4" || e.paper === "letter") && (t.paper = e.paper), t;
}
const ei = (n, e, t, i) => ({ Vocal: n, Ins: e, chord: t, guide: i }), ul = [
  { name: "Classic", note: "The editor’s plain tones", builtIn: !0, settings: { sounds: ei("soft", "plain", "plain", "plain") } },
  { name: "Pop", note: "Voice, plucked instrument, pad chords, bass", builtIn: !0, settings: { sounds: ei("voice", "pluck", "pad", "bass") } },
  { name: "Ballad", note: "Voice, piano, string chords, bass", builtIn: !0, settings: { sounds: ei("voice", "piano", "strings", "bass") } },
  { name: "Rock", note: "Synth lead, organ, plucked chords, bass", builtIn: !0, settings: { sounds: ei("lead", "organ", "pluck", "bass") } },
  { name: "Electronic / dance", note: "Synth lead, pluck, pad, bass - and the metronome", builtIn: !0, settings: { sounds: ei("lead", "pluck", "pad", "bass"), metronome: !0 } },
  { name: "Acoustic / singer-songwriter", note: "Voice, flute, plucked chords, bass", builtIn: !0, settings: { sounds: ei("voice", "flute", "pluck", "bass") } },
  { name: "Jazz / soul", note: "Voice, electric piano, electric-piano chords, bass", builtIn: !0, settings: { sounds: ei("voice", "epiano", "epiano", "bass") } },
  { name: "Orchestral / cinematic", note: "Flute, strings, string chords, bass", builtIn: !0, settings: { sounds: ei("flute", "strings", "strings", "bass") } },
  {
    name: "Composing with a MIDI keyboard",
    note: "Piano sounds, the metronome, one bar of count-in, 1/16 quantize",
    builtIn: !0,
    settings: { sounds: ei("piano", "epiano", "pad", "bass"), metronome: !0, record: { ...Dh(), countIn: 1, quantize: 16 } }
  },
  {
    name: "Cover: check the transcription",
    note: "The source under the notes, its waveform and sung pitch shown, the melody as a voice",
    builtIn: !0,
    settings: { hear: "both", wave: !0, sung: !0, sourceLevel: 0.8, sounds: ei("voice", "plain", "pad", "plain") }
  },
  {
    name: "Cover: free arrangement",
    note: "Only the notes play; the source’s waveform and sung pitch are hidden",
    builtIn: !0,
    settings: { hear: "notes", wave: !1, sung: !1 }
  }
], i4 = "plenio/score-editor-presets.json", s4 = "plenio.score_presets/1", dy = "plenio.score-editor.presets";
function py(n) {
  const e = typeof n == "object" && n !== null ? n : {};
  if (!Array.isArray(e.presets)) return [];
  const t = /* @__PURE__ */ new Set(), i = [];
  for (const s of e.presets) {
    const o = typeof s == "object" && s !== null ? s : {}, r = typeof o.name == "string" ? o.name.trim().slice(0, 60) : "";
    !r || t.has(r.toLowerCase()) || (t.add(r.toLowerCase()), i.push({ name: r, builtIn: !1, settings: Lh(o.settings) }));
  }
  return i;
}
function gy(n) {
  return JSON.stringify({ schema: s4, presets: n.map((e) => ({ name: e.name, settings: e.settings })) }, null, 1);
}
function o4() {
  try {
    return py(JSON.parse(window.localStorage.getItem(dy) ?? "{}"));
  } catch {
    return [];
  }
}
function r4(n) {
  try {
    return window.localStorage.setItem(dy, gy(n)), !0;
  } catch {
    return !1;
  }
}
const my = `/userdata/${encodeURIComponent(i4)}`;
async function l4(n) {
  if (n)
    try {
      const e = await n.fetchApi(my, { cache: "no-store" });
      if (e.status === 404) return { presets: [], where: "comfyui" };
      if (e.ok) return { presets: py(await e.json()), where: "comfyui" };
    } catch {
    }
  return { presets: o4(), where: "browser" };
}
async function vp(n, e) {
  const t = e.filter((i) => !i.builtIn);
  if (n)
    try {
      if ((await n.fetchApi(`${my}?overwrite=true`, { method: "POST", body: gy(t) })).ok) return "comfyui";
    } catch {
    }
  return r4(t) ? "browser" : "failed";
}
function a4(n, e) {
  return [...n.filter((t) => t.name.toLowerCase() !== e.name.toLowerCase()), e].sort((t, i) => t.name.localeCompare(i.name));
}
const Sl = "plenio.score_project/1", vy = ".plenio.json";
function u4(n, e = /* @__PURE__ */ new Date()) {
  return {
    schema: Sl,
    app: `Plenio Music Production System ${t4}`,
    saved: e.toISOString(),
    title: (n.title ?? "").trim(),
    score: n.score,
    guide: (n.guide ?? []).map(([t, i, s]) => [t, i, s]),
    lyrics: n.lyrics?.trim() ? n.lyrics : null,
    lyric_spans: n.lyrics?.trim() ? xp(n.lyricSpans ?? []) : [],
    settings: n.settings ? Lh(n.settings) : {}
  };
}
function c4(n) {
  return `${Array.from((n ?? "").trim(), (t) => /[\p{L}\p{N} \-_()]/u.test(t) ? t : "_").join("").slice(0, 80).trim() || "score"}${vy}`;
}
function h4(n) {
  let e;
  try {
    e = JSON.parse(n);
  } catch {
    return "This file is not a Plenio project (not JSON).";
  }
  const t = typeof e == "object" && e !== null ? e : {};
  return t.schema !== Sl ? `This file is not a Plenio score project (${Sl}); for a MIDI file use Import MIDI.` : typeof t.score != "string" || !t.score.trim() ? "The project holds no score." : {
    schema: Sl,
    app: typeof t.app == "string" ? t.app : "",
    saved: typeof t.saved == "string" ? t.saved : "",
    title: typeof t.title == "string" ? t.title : "",
    score: t.score,
    guide: i0(t.guide),
    lyrics: typeof t.lyrics == "string" && t.lyrics.trim() ? t.lyrics : null,
    lyric_spans: xp(t.lyric_spans),
    settings: Lh(t.settings)
  };
}
const f4 = {
  class: "record",
  role: "group",
  "aria-label": "Record with a MIDI keyboard"
}, d4 = ["disabled", "title"], p4 = ["disabled", "title"], g4 = ["title"], m4 = { class: "midi-settings" }, v4 = ["aria-expanded"], y4 = ["onKeydown"], b4 = { class: "facts" }, w4 = { key: 0 }, x4 = ["value"], k4 = ["value"], S4 = ["value"], C4 = { title: "Hear the keys you play (for keyboards without a sound of their own)" }, M4 = ["checked"], A4 = ["value"], T4 = { title: "Where the take's starts and ends go" }, $4 = ["value"], D4 = { title: "replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays" }, O4 = ["value"], L4 = { title: "Silence the old notes of the recorded voice while recording" }, E4 = ["checked"], I4 = ["value"], B4 = /* @__PURE__ */ tn({
  __name: "RecordControls",
  props: /* @__PURE__ */ On({
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
  emits: /* @__PURE__ */ On(["record", "stop", "step", "rest", "enable"], ["update:settings"]),
  setup(n, { emit: e }) {
    const t = n, i = Vt(n, "settings"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(null);
    function l() {
      o.value = !1, Pn(() => r.value?.focus());
    }
    const a = /* @__PURE__ */ G(performance.now()), u = setInterval(() => a.value = performance.now(), 120);
    Li(() => clearInterval(u));
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
    function p(v, m) {
      i.value = { ...i.value, [v]: m };
    }
    return (v, m) => (k(), M("span", f4, [
      g("button", {
        class: qe(["rec", { on: n.recording, counting: n.countingIn }]),
        disabled: !!n.disabled && !n.recording,
        title: d.value,
        onClick: m[0] || (m[0] = (b) => n.recording ? s("stop") : s("record"))
      }, " ● " + F(n.recording && n.countingIn ? "count-in" : "rec"), 11, d4),
      g("button", {
        class: qe(["step", { on: n.step }]),
        disabled: !!n.disabled || n.recording,
        title: n.disabled ?? (n.step ? "Step input is on: a key writes a note at the cursor and moves it on - click to stop" : `Step input into ${n.target}: every key writes a note of the step length at the cursor`),
        onClick: m[1] || (m[1] = (b) => s("step"))
      }, " step ", 10, p4),
      n.step ? (k(), M("button", {
        key: 0,
        title: "A rest: the cursor moves on by one step",
        onClick: m[2] || (m[2] = (b) => s("rest"))
      }, "rest ▶")) : ee("", !0),
      g("span", {
        class: qe(["midi-light", { active: h.value, ready: n.hub.status.value === "ready" }]),
        title: f.value,
        "aria-hidden": "true"
      }, null, 10, g4),
      g("span", m4, [
        g("button", {
          ref_key: "toggle",
          ref: r,
          "aria-expanded": o.value,
          title: "MIDI keyboard and recording settings",
          onClick: m[3] || (m[3] = (b) => o.value ? l() : o.value = !0)
        }, "🎹", 8, v4),
        o.value ? (k(), M("span", {
          key: 0,
          class: "midi-panel",
          role: "dialog",
          "aria-label": "MIDI and recording",
          onKeydown: Et(ft(l, ["stop", "prevent"]), ["esc"])
        }, [
          g("button", {
            class: "close",
            "aria-label": "Close",
            onClick: l
          }, "×"),
          m[24] || (m[24] = g("strong", null, "MIDI keyboard", -1)),
          g("span", b4, F(f.value), 1),
          n.hub.status.value === "ready" ? (k(), M("label", w4, [
            m[13] || (m[13] = be(" keyboard ", -1)),
            g("select", {
              value: n.hub.selected.value,
              "aria-label": "MIDI keyboard",
              onChange: m[4] || (m[4] = (b) => n.hub.selected.value = b.target.value)
            }, [
              m[12] || (m[12] = g("option", { value: "all" }, "all keyboards", -1)),
              (k(!0), M(me, null, Ie(n.hub.devices.value.filter((b) => b.connected), (b) => (k(), M("option", {
                key: b.id,
                value: b.id
              }, F(b.name), 9, k4))), 128)),
              c.value ? (k(), M("option", {
                key: 0,
                value: n.hub.selected.value,
                disabled: ""
              }, F(c.value) + " (unplugged)", 9, S4)) : ee("", !0)
            ], 40, x4)
          ])) : n.hub.status.value !== "asking" ? (k(), M("button", {
            key: 1,
            title: "Ask the browser for MIDI access",
            onClick: m[5] || (m[5] = (b) => s("enable"))
          }, "use MIDI")) : ee("", !0),
          g("label", C4, [
            g("input", {
              checked: i.value.thru,
              type: "checkbox",
              onChange: m[6] || (m[6] = (b) => p("thru", b.target.checked))
            }, null, 40, M4),
            m[14] || (m[14] = be(" hear the keys ", -1))
          ]),
          g("strong", null, "Recording into " + F(n.target), 1),
          m[25] || (m[25] = g("span", { class: "facts" }, [
            be("The voice is the roll's "),
            g("em", null, "draw into"),
            be("; the take starts at the cursor.")
          ], -1)),
          g("label", null, [
            m[16] || (m[16] = be(" count-in ", -1)),
            g("select", {
              value: i.value.countIn,
              "aria-label": "Count-in",
              onChange: m[7] || (m[7] = (b) => p("countIn", Number(b.target.value)))
            }, [...m[15] || (m[15] = [
              g("option", { value: 0 }, "none", -1),
              g("option", { value: 1 }, "1 bar", -1),
              g("option", { value: 2 }, "2 bars", -1)
            ])], 40, A4)
          ]),
          g("label", T4, [
            m[18] || (m[18] = be(" quantize ", -1)),
            g("select", {
              value: i.value.quantize,
              "aria-label": "Quantize the take",
              onChange: m[8] || (m[8] = (b) => p("quantize", Number(b.target.value)))
            }, [...m[17] || (m[17] = [
              g("option", { value: 4 }, "1/4", -1),
              g("option", { value: 8 }, "1/8", -1),
              g("option", { value: 16 }, "1/16", -1),
              g("option", { value: 32 }, "1/32", -1),
              g("option", { value: 0 }, "off (the score's finest)", -1)
            ])], 40, $4)
          ]),
          g("label", D4, [
            m[20] || (m[20] = be(" mode ", -1)),
            g("select", {
              value: i.value.mode,
              "aria-label": "Replace or merge",
              onChange: m[9] || (m[9] = (b) => p("mode", b.target.value))
            }, [...m[19] || (m[19] = [
              g("option", { value: "replace" }, "replace", -1),
              g("option", { value: "merge" }, "merge", -1)
            ])], 40, O4)
          ]),
          g("label", L4, [
            g("input", {
              checked: i.value.mute,
              type: "checkbox",
              onChange: m[10] || (m[10] = (b) => p("mute", b.target.checked))
            }, null, 40, E4),
            m[21] || (m[21] = be(" mute its old notes ", -1))
          ]),
          m[26] || (m[26] = g("strong", null, "Step input", -1)),
          g("label", null, [
            m[23] || (m[23] = be(" step ", -1)),
            g("select", {
              value: i.value.stepLength,
              "aria-label": "Step length",
              onChange: m[11] || (m[11] = (b) => p("stepLength", Number(b.target.value)))
            }, [...m[22] || (m[22] = [
              g("option", { value: 1 }, "1/1", -1),
              g("option", { value: 2 }, "1/2", -1),
              g("option", { value: 4 }, "1/4", -1),
              g("option", { value: 8 }, "1/8", -1),
              g("option", { value: 16 }, "1/16", -1)
            ])], 40, I4)
          ])
        ], 40, y4)) : ee("", !0)
      ])
    ]));
  }
}), R4 = { class: "notation-export" }, P4 = ["disabled", "aria-expanded", "title"], _4 = ["onKeydown"], N4 = { title: "The paper of the PDF and the print" }, V4 = { class: "formats" }, H4 = ["disabled"], F4 = ["disabled"], z4 = ["disabled"], W4 = ["disabled"], K4 = { class: "facts" }, U4 = /* @__PURE__ */ tn({
  __name: "NotationExport",
  props: /* @__PURE__ */ On({
    abc: {},
    title: {},
    blocked: {}
  }, {
    paper: { required: !0 },
    paperModifiers: {}
  }),
  emits: /* @__PURE__ */ On(["done", "failed"], ["update:paper"]),
  setup(n, { emit: e }) {
    const t = n, i = Vt(n, "paper"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(!1), l = /* @__PURE__ */ G(null);
    function a() {
      o.value = !1, Pn(() => l.value?.focus());
    }
    async function u(c) {
      if (!t.abc || r.value) return;
      r.value = !0, await new Promise((f) => setTimeout(f, 20));
      let h = null;
      try {
        h = Xy(t.abc, t.title, i.value);
        const { lines: f } = h;
        if (!f.length) throw new Error("the score has no music to draw");
        const d = i.value === "a4" ? "A4" : "Letter";
        if (c === "pdf") {
          const p = await Jy(f, i.value, t.title);
          eo(Pa(t.title, "pdf"), p, "application/pdf"), s("done", `exported the notation as PDF (${d})`);
        } else c === "png" ? (eo(Pa(t.title, "png"), await Zy(f), "image/png"), s("done", "exported the notation as PNG")) : c === "svg" ? (eo(Pa(t.title, "svg"), new TextEncoder().encode(Qy(f)), "image/svg+xml"), s("done", "exported the notation as SVG")) : (e0(f, i.value, t.title), s("done", `printing the notation (${d}) - the browser’s dialog also saves a vector PDF`));
        a();
      } catch (f) {
        s("failed", `The notation could not be exported: ${f instanceof Error ? f.message : String(f)}`);
      } finally {
        h?.dispose(), r.value = !1;
      }
    }
    return (c, h) => (k(), M("span", R4, [
      g("button", {
        ref_key: "toggle",
        ref: l,
        disabled: !n.abc,
        "aria-expanded": o.value,
        title: n.blocked ?? "The sheet music as PDF, PNG or SVG, or printed - both voices, chord symbols, sections and the lyrics",
        onClick: h[0] || (h[0] = (f) => o.value ? a() : o.value = !0)
      }, " Export notation… ", 8, P4),
      o.value ? (k(), M("span", {
        key: 0,
        class: "export-panel",
        role: "dialog",
        "aria-label": "Export the notation",
        onKeydown: Et(ft(a, ["stop", "prevent"]), ["esc"])
      }, [
        g("button", {
          class: "close",
          "aria-label": "Close",
          onClick: a
        }, "×"),
        g("label", N4, [
          h[7] || (h[7] = be(" paper ", -1)),
          We(g("select", {
            "onUpdate:modelValue": h[1] || (h[1] = (f) => i.value = f),
            "aria-label": "Paper"
          }, [...h[6] || (h[6] = [
            g("option", { value: "a4" }, "A4", -1),
            g("option", { value: "letter" }, "Letter", -1)
          ])], 512), [
            [$s, i.value]
          ])
        ]),
        g("span", V4, [
          g("button", {
            disabled: r.value,
            title: "Pages of the chosen paper, 300 dpi - for printing and sharing",
            onClick: h[2] || (h[2] = (f) => u("pdf"))
          }, "PDF", 8, H4),
          g("button", {
            disabled: r.value,
            title: "The whole score as one picture",
            onClick: h[3] || (h[3] = (f) => u("png"))
          }, "PNG", 8, F4),
          g("button", {
            disabled: r.value,
            title: "The whole score as a vector drawing (scales without loss)",
            onClick: h[4] || (h[4] = (f) => u("svg"))
          }, "SVG", 8, z4),
          g("button", {
            disabled: r.value,
            title: "The browser’s print dialog - it also saves a vector PDF",
            onClick: h[5] || (h[5] = (f) => u("print"))
          }, "Print…", 8, W4)
        ]),
        g("span", K4, F(r.value ? "drawing the pages…" : "What the notation shows: both voices, chord symbols, sections and the lyrics."), 1)
      ], 40, _4)) : ee("", !0)
    ]));
  }
}), j4 = { class: "sounds-settings" }, G4 = ["aria-expanded"], q4 = ["onKeydown"], Y4 = { class: "row" }, X4 = { label: "Built in" }, J4 = ["value", "title"], Z4 = {
  key: 0,
  label: "Yours"
}, Q4 = ["value"], eO = ["disabled"], tO = {
  key: 0,
  class: "facts"
}, nO = { class: "row" }, iO = ["onKeydown"], sO = ["disabled"], oO = {
  key: 1,
  class: "facts",
  role: "status"
}, rO = {
  key: 2,
  class: "facts"
}, lO = { class: "track" }, aO = ["value", "aria-label", "onChange"], uO = ["value", "title"], cO = ["title", "aria-label", "onClick"], hO = /* @__PURE__ */ tn({
  __name: "SoundsPanel",
  props: /* @__PURE__ */ On({
    fetcher: {},
    settings: {},
    keepsGuide: { type: Boolean }
  }, {
    sounds: { required: !0 },
    soundsModifiers: {}
  }),
  emits: /* @__PURE__ */ On(["apply"], ["update:sounds"]),
  setup(n, { emit: e }) {
    const t = n, i = Vt(n, "sounds"), s = e, o = /* @__PURE__ */ G(!1), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G([]), a = /* @__PURE__ */ G(null), u = /* @__PURE__ */ G(!1), c = /* @__PURE__ */ G(""), h = /* @__PURE__ */ G(!1), f = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(null), p = N(
      () => [
        ["Vocal", "Vocal"],
        ["Ins", "Instrument"],
        ["chord", "Chords"],
        ["guide", "Guide"]
      ].filter(([R]) => R !== "guide" || t.keepsGuide)
    ), v = N(() => l.value.find((R) => R.name === c.value) ?? null);
    async function m() {
      if (o.value = !0, u.value) return;
      const R = await l4(t.fetcher);
      l.value = R.presets, a.value = R.where, u.value = !0;
    }
    function b() {
      o.value = !1, h.value = !1, Pn(() => r.value?.focus());
    }
    function O() {
      const R = [...ul, ...l.value].find((Y) => Y.name === c.value);
      R && (s("apply", R.settings, R.name), d.value = `“${R.name}” is set.`);
    }
    async function L() {
      const R = f.value.trim().slice(0, 60);
      if (!R) return;
      if (ul.some((re) => re.name.toLowerCase() === R.toLowerCase())) {
        d.value = `“${R}” is a built-in preset - choose another name.`;
        return;
      }
      const Y = a4(l.value, { name: R, builtIn: !1, settings: structuredClone(t.settings) }), K = await vp(t.fetcher, Y);
      if (K === "failed") {
        d.value = "The preset could not be saved (neither in ComfyUI nor in this browser).";
        return;
      }
      l.value = Y, a.value = K, c.value = R, h.value = !1, f.value = "", d.value = K === "comfyui" ? `Saved “${R}” in ComfyUI’s user data.` : `Saved “${R}” in this browser only (ComfyUI’s user data could not be reached).`;
    }
    async function E() {
      const R = v.value;
      if (!R) return;
      const Y = l.value.filter((re) => re !== R);
      if (await vp(t.fetcher, Y) === "failed") {
        d.value = "The preset could not be deleted.";
        return;
      }
      l.value = Y, c.value = "", d.value = `Deleted “${R.name}”.`;
    }
    function I(R, Y) {
      i.value = { ...i.value, [R]: Y };
    }
    function z(R) {
      const Y = i.value[R], K = R === "chord" ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]] : R === "guide" ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]] : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]];
      for (const [re, j, D] of K) setTimeout(() => Ac(re, D, Y), j * 1e3);
    }
    return (R, Y) => (k(), M("span", j4, [
      g("button", {
        ref_key: "toggle",
        ref: r,
        "aria-expanded": o.value,
        title: "The tracks’ sounds and the presets",
        onClick: Y[0] || (Y[0] = (K) => o.value ? b() : m())
      }, "♫ sounds", 8, G4),
      o.value ? (k(), M("span", {
        key: 0,
        class: "sounds-panel",
        role: "dialog",
        "aria-label": "Sounds and presets",
        onKeydown: Et(ft(b, ["stop", "prevent"]), ["esc"])
      }, [
        g("button", {
          class: "close",
          "aria-label": "Close",
          onClick: b
        }, "×"),
        Y[6] || (Y[6] = g("strong", null, "Preset", -1)),
        g("span", Y4, [
          We(g("select", {
            "onUpdate:modelValue": Y[1] || (Y[1] = (K) => c.value = K),
            "aria-label": "Preset"
          }, [
            Y[5] || (Y[5] = g("option", { value: "" }, "- choose a preset -", -1)),
            g("optgroup", X4, [
              (k(!0), M(me, null, Ie(H(ul), (K) => (k(), M("option", {
                key: K.name,
                value: K.name,
                title: K.note
              }, F(K.name), 9, J4))), 128))
            ]),
            l.value.length ? (k(), M("optgroup", Z4, [
              (k(!0), M(me, null, Ie(l.value, (K) => (k(), M("option", {
                key: "own-" + K.name,
                value: K.name
              }, F(K.name), 9, Q4))), 128))
            ])) : ee("", !0)
          ], 512), [
            [$s, c.value]
          ]),
          g("button", {
            disabled: !c.value,
            title: "Set the preset’s sounds and settings",
            onClick: O
          }, "use", 8, eO),
          v.value ? (k(), M("button", {
            key: 0,
            title: "Delete this preset of yours",
            onClick: E
          }, "delete")) : ee("", !0)
        ]),
        c.value ? (k(), M("span", tO, F([...H(ul), ...l.value].find((K) => K.name === c.value)?.note ?? "Your preset"), 1)) : ee("", !0),
        g("span", nO, [
          h.value ? (k(), M(me, { key: 0 }, [
            We(g("input", {
              "onUpdate:modelValue": Y[2] || (Y[2] = (K) => f.value = K),
              maxlength: "60",
              placeholder: "name of the preset",
              "aria-label": "Name of the new preset",
              onKeydown: [
                Et(ft(L, ["prevent"]), ["enter"]),
                Y[3] || (Y[3] = Et(ft((K) => h.value = !1, ["stop", "prevent"]), ["esc"]))
              ]
            }, null, 40, iO), [
              [Nt, f.value]
            ]),
            g("button", {
              disabled: !f.value.trim(),
              onClick: L
            }, "save", 8, sO)
          ], 64)) : (k(), M("button", {
            key: 1,
            title: "Save the current sounds, metronome, cover view, recording and paper as a preset of yours",
            onClick: Y[4] || (Y[4] = (K) => h.value = !0)
          }, " save current as preset… "))
        ]),
        d.value ? (k(), M("span", oO, F(d.value), 1)) : a.value === "browser" ? (k(), M("span", rO, "Your presets are kept in this browser (ComfyUI’s user data could not be reached).")) : ee("", !0),
        Y[7] || (Y[7] = g("strong", null, "Sounds", -1)),
        (k(!0), M(me, null, Ie(p.value, ([K, re]) => (k(), M("label", {
          key: K,
          class: "row"
        }, [
          g("span", lO, F(re), 1),
          g("select", {
            value: i.value[K],
            "aria-label": `Sound of the ${re} track`,
            onChange: (j) => I(K, j.target.value)
          }, [
            (k(!0), M(me, null, Ie(H(Th), (j) => (k(), M("option", {
              key: j,
              value: j,
              title: H(ql)[j].hint
            }, F(H(ql)[j].label), 9, uO))), 128))
          ], 40, aO),
          g("button", {
            title: `Hear the ${re} track’s sound`,
            "aria-label": `Hear the ${re} sound`,
            onClick: ft((j) => z(K), ["prevent"])
          }, "▶", 8, cO)
        ]))), 128)),
        Y[8] || (Y[8] = g("span", { class: "facts" }, "Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.", -1))
      ], 40, q4)) : ee("", !0)
    ]));
  }
});
function fO(n) {
  return n.length >= 3 && (n[0] & 240) === 176 && (n[1] === 120 || n[1] === 123);
}
function dO(n, e, t) {
  if (n.length < 3) return null;
  const i = n[0] & 240, s = n[0] & 15, o = n[1] & 127, r = n[2] & 127;
  return i === 144 && r > 0 ? { kind: "on", note: o, velocity: r, time: e, input: t, channel: s } : i === 128 || i === 144 ? { kind: "off", note: o, velocity: r, time: e, input: t, channel: s } : null;
}
function pO(n, e) {
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
class gO {
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
    if (fO(t.data)) {
      this.letGo(e, i);
      return;
    }
    const s = dO(t.data, i, e);
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
    this.status.value = e, this.problem.value = pO(e, t);
  }
}
let yp = null;
function mO() {
  return yp ??= new gO(), yp;
}
const vO = 0.035;
class yO {
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
function bO(n, e) {
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
    let d = Math.round((f.start - t) / l) * l + t, p = Math.round((f.end - t) / l) * l + t;
    p <= d && (p = d + l);
    const v = u[h + 1];
    if (v) {
      const b = Math.round((v.start - t) / l) * l + t;
      b > d && (p = Math.min(p, b));
    }
    d = Math.max(0, Math.min(d, s - 1)), p = Math.min(p, s);
    const m = c.at(-1);
    if (m && d <= m.onset) {
      p - d > m.duration && (c[c.length - 1] = { onset: m.onset, duration: p - m.onset, pitch: f.pitch });
      continue;
    }
    m && m.onset + m.duration > d && (m.duration = d - m.onset), m && d - (m.onset + m.duration) <= l && (m.duration = d - m.onset), p > d && c.push({ onset: d, duration: p - d, pitch: f.pitch });
  }
  return c;
}
function wO(n, e, t, i, s) {
  return {
    op: "place_notes",
    track: n,
    notes: e.map((o) => ({ onset: o.onset, duration: o.duration, pitch: o.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...s === "replace" ? { clear: [Math.round(t), Math.max(Math.round(t), Math.round(i), ...e.map((o) => o.onset + o.duration))] } : {},
    label: "recorded"
  };
}
function ku(n, e) {
  if (!e) return 1;
  const t = Number(n.split("/")[1]) || 16;
  return Math.max(1, Math.round(t / e));
}
const xO = 40;
function kO(n) {
  const e = /* @__PURE__ */ G(!1), t = /* @__PURE__ */ G(!1), i = /* @__PURE__ */ js(null), s = /* @__PURE__ */ G(0), o = new DA();
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
    return re ? Ah(re, Math.max(0, K)) : null;
  }
  async function p() {
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
    if (i.value = new yO(D, j), r = !1, e.value = !0, s.value = D, !U.record(Mh(K, D), {
      countIn: re.countIn,
      mute: re.mute ? j === "vocal" ? "Vocal" : "Ins" : null
    })) {
      e.value = !1, i.value = null, n.problem("Playback could not start, so nothing can be recorded.");
      return;
    }
    n.notify(`recording into ${j === "vocal" ? "Vocal" : "Ins"} from bar ${CO(K, D)} - Space or ■ stop keeps it, Esc throws it away`);
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
    const D = Math.max(s.value, K.start), U = j.measures.find((He) => He.onset <= K.start && K.start < He.onset + He.length) ?? j.measures[0], ke = re.bars[(U?.n ?? 1) - 1], $e = U && ke?.duration_s ? U.length / ke.duration_s : 8, ce = Number(U?.meter.split("/")[0]) || 4, pe = bO(K.finish(D), {
      start: K.start,
      stop: D,
      total: j.total,
      grid: ku(j.unit, n.settings().quantize),
      chordUnits: vO * $e,
      pickup: (U?.length ?? 16) / ce / 2
    });
    if (!pe.length) {
      n.notify("nothing recorded - no key was played (is the keyboard chosen in 🎹?)");
      return;
    }
    await n.operate(wO(K.track, pe, K.start, D, n.settings().mode));
  }
  function L(K) {
    if (n.settings().thru && (n.sound && (o.sound = n.sound()), K.kind === "on" ? o.on(K.note, K.velocity) : o.off(K.note)), e.value && i.value) {
      const j = n.transport()?.scoreSecondAt(K.time) ?? null, D = n.view();
      if (j === null || !D) return;
      const U = SO(D, i.value.start, j);
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
      I();
    }, xO) };
  }
  async function I() {
    const K = a?.pitches ?? [];
    a = null;
    const j = n.view()?.model;
    if (!j || !K.length || n.readonly()) return;
    const D = ku(j.unit, n.settings().stepLength), U = n.locator.value;
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
    K && (n.locator.value = Math.min(K.total, n.locator.value + ku(K.unit, n.settings().stepLength)));
  }
  async function R() {
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
  return { recording: e, step: t, live: c, start: p, stop: v, cancel: m, onTime: b, onStopped: O, toggleStep: R, rest: z, ready: f, dispose: Y };
}
function SO(n, e, t) {
  const i = n.model;
  if (!i) return null;
  const s = Mh(n, e);
  if (t >= s) return Ah(n, t);
  const o = i.measures.find((a) => a.onset <= e && e < a.onset + a.length) ?? i.measures[0], r = n.bars[(o?.n ?? 1) - 1], l = o && r?.duration_s ? o.length / r.duration_s : 8;
  return e - (s - t) * l;
}
function CO(n, e) {
  let t = 1;
  for (const i of n.model?.measures ?? []) i.onset <= e && (t = i.n);
  return t;
}
const MO = {
  class: "view-tools",
  role: "group",
  "aria-label": "View"
}, AO = {
  class: "layouts",
  role: "radiogroup",
  "aria-label": "Layout"
}, TO = ["aria-checked"], $O = ["aria-checked"], DO = ["aria-checked"], OO = { title: "The piano roll and chord lane above the notation" }, LO = { title: "Show the ABC text under the notation" }, EO = { title: "Zoom of the notation" }, IO = {
  class: "midi-tools",
  role: "group",
  "aria-label": "Files"
}, BO = ["disabled", "title"], RO = ["disabled", "title"], PO = ["disabled"], _O = ["disabled", "title"], NO = ["disabled", "title"], VO = ["accept"], HO = {
  key: 1,
  class: "facts"
}, FO = {
  key: 2,
  class: "facts ok"
}, zO = {
  key: 3,
  class: "facts bad"
}, WO = {
  key: 4,
  class: "badge"
}, KO = {
  key: 1,
  class: "gate",
  role: "status"
}, UO = {
  key: 2,
  class: "gate",
  role: "status"
}, jO = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], GO = ["data-layout", "data-text"], qO = { class: "side" }, YO = {
  key: 1,
  class: "lyrics-follow",
  role: "group",
  "aria-label": "Lyrics"
}, XO = {
  key: 0,
  class: "hint"
}, JO = {
  key: 0,
  class: "hint changed"
}, ZO = {
  key: 1,
  class: "hint"
}, QO = {
  key: 2,
  class: "fit-panel"
}, eL = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], tL = ["aria-valuenow", "aria-valuemin", "aria-valuemax"], nL = {
  class: "status",
  "aria-live": "polite"
}, iL = {
  key: 5,
  class: "error",
  role: "alert"
}, sL = {
  key: 6,
  class: "error",
  role: "alert"
}, oL = {
  key: 7,
  class: "error",
  role: "alert"
}, rL = {
  key: 9,
  class: "diagnostics"
}, lL = ["data-severity"], aL = ["title", "onClick"], uL = {
  key: 1,
  class: "where"
}, bp = /* @__PURE__ */ tn({
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
    const o = /* @__PURE__ */ js(null), r = /* @__PURE__ */ G(null), l = /* @__PURE__ */ G(null);
    function a(y) {
      const C = y.op === "paste" && y.mode === "insert" && Array.isArray(y.sections) ? y.sections : [], P = typeof y.at == "number" ? y.at : 0, ue = Fi.value;
      return (we) => {
        let Se = -1;
        C.forEach((Ue, tt) => {
          Ue.onset <= we - P && (Se = tt);
        });
        const Qe = Se >= 0 ? ue?.sections[Se]?.lyrics : null;
        return Qe ? { tag: Qe.tag, lines: [...Qe.lines] } : null;
      };
    }
    const u = GM(t.doc, {
      fetcher: t.fetcher,
      onEdit: () => i("edited"),
      lyrics: () => l.value ?? t.lyrics ?? null,
      lyricSpans: () => X(),
      // an undo or redo brings the Guide notes and the lyrics of that step back with its text
      onRestore: (y) => {
        s(y) && (Array.isArray(y.guide) && t.guide !== void 0 && !Lo(y.guide, t.guide) && i("guideChange", [...y.guide]), "lyrics" in y && (o.value = y.lyrics ?? null), "looseLyrics" in y && (r.value = y.looseLyrics ?? null), Array.isArray(y.spans) && Ae(y.spans));
      },
      // bars that moved (arranged sections, Insert at the cursor, inserted, deleted or duplicated bars)
      // take their Guide notes along, and the lyrics follow the sections - in the same undo step as the text
      onTransform: (y, C) => {
        const P = {}, ue = {}, we = t.guide;
        if (we?.length && y.time_map?.length) {
          const bt = s0(we, y.time_map);
          Lo(bt, we) || (i("guideChange", bt), P.guide = [...we], ue.guide = bt);
        }
        const Se = X();
        if (Se.length && y.time_map?.length) {
          const bt = Fy(Se, y.time_map);
          cl(bt, Se) || (Ae(bt), P.spans = [...Se], ue.spans = bt);
        }
        const Qe = o.value, Ue = ce.value?.model, tt = y.analysis.model;
        if (Qe && Ue && tt) {
          const bt = WD(Qe, Ue, tt, y.time_map, a(C));
          o.value = bt, P.lyrics = Qe, ue.lyrics = bt;
        }
        return Object.keys(ue).length ? { before: P, after: ue } : void 0;
      }
    });
    Ge(
      () => [t.doc.text, u.commitBlock],
      ([y, C]) => {
        t.readonly || i("gate", y, C);
      },
      { immediate: !0 }
    );
    const c = /* @__PURE__ */ G(VD()), h = /* @__PURE__ */ G(x2(t.layoutDefault, c.value.layout));
    function f(y) {
      h.value = y, c.value = { ...c.value, layout: y };
    }
    const d = /* @__PURE__ */ G([]), p = /* @__PURE__ */ G(0), v = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(null), b = /* @__PURE__ */ G(null), O = /* @__PURE__ */ G(null), L = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G("vocal"), I = N({
      get: () => c.value.sounds,
      set: (y) => c.value = { ...c.value, sounds: y }
    }), z = N(() => n4(c.value));
    function R(y, C) {
      c.value = mp(c.value, y), u.notes = [`${C}: ${Y(y)}`];
    }
    function Y(y) {
      const C = [];
      return y.sounds && C.push("sounds"), y.metronome !== void 0 && C.push(`metronome ${y.metronome ? "on" : "off"}`), y.hear && C.push(`hear ${y.hear}`), (y.wave !== void 0 || y.sung !== void 0) && C.push("the source view"), y.record && C.push("recording"), y.paper && C.push(`paper ${y.paper === "a4" ? "A4" : "Letter"}`), C.length ? `${C.join(", ")} set` : "nothing to set";
    }
    const K = N(() => c.value.sounds[E.value === "vocal" ? "Vocal" : "Ins"]);
    Ge(c, (y) => HD(y), { deep: !0 });
    const re = mO();
    re.selected.value = c.value.midiInput, Ge(re.selected, (y) => c.value = { ...c.value, midiInput: y });
    const j = N({
      get: () => c.value.record,
      set: (y) => c.value = { ...c.value, record: y }
    }), D = kO({
      hub: re,
      transport: () => b.value,
      view: () => ce.value,
      locator: p,
      track: () => E.value,
      readonly: () => t.readonly,
      settings: () => c.value.record,
      operate: Yt,
      notify: (y) => u.notes = [y],
      problem: (y) => U.value = y,
      sound: () => K.value
    }), U = /* @__PURE__ */ G(null), ke = N(() => t.readonly ? "This score belongs to the other sheet; record in that sheet." : ne.value ? null : "Recording needs the piano roll’s score (a valid score in the editor’s subset).");
    function $e(y) {
      const C = y.target;
      L.value?.contains(C) || Ea(C) || y.ctrlKey || y.metaKey || y.altKey || y.key !== " " && y.key !== "Escape" || (y.preventDefault(), y.stopPropagation(), y.key === " " ? D.stop() : D.cancel());
    }
    Ge(D.recording, (y) => {
      y ? window.addEventListener("keydown", $e, !0) : window.removeEventListener("keydown", $e, !0);
    }), Li(() => {
      window.removeEventListener("keydown", $e, !0), D.cancel(), D.dispose();
    }), Li(() => u.dispose());
    const ce = N(() => u.lastValid), pe = N(() => !!u.view && !u.view.ok), He = N(() => u.view?.diagnostics ?? []), Oe = N(
      () => He.value.filter((y) => y.severity === "error" && y.bar).map((y) => y.bar)
    ), Re = N(
      () => ey(ce.value, u.selection, u.primary?.bar ?? null).measure?.n ?? u.primary?.bar ?? null
    ), Le = N(() => h.value !== "text"), J = N(() => h.value === "daw"), ct = N(() => t.guide ?? []), ye = N(() => o0(t.guide, ce.value?.model)), Be = N(() => J.value ? c.value.voices.guide ?? !0 : !1), se = N(() => Be.value ? ye.value : []), Z = N(() => Le.value && c.value.roll && !!(ce.value?.model || ce.value?.model_error)), ne = N(() => ce.value?.model ?? null), Xe = N(() => ne.value ? Zo(ne.value, p.value) : Re.value), ht = N(() => ce.value && ne.value ? Mh(ce.value, p.value) : null), vt = N(() => ne.value ? ry(ne.value, p.value) : "");
    Ge(
      () => ne.value?.total,
      (y) => {
        y !== void 0 && p.value > y && (p.value = y);
      }
    );
    let S = null, w = null, $ = !1;
    Ge(
      () => [t.lyricsTarget, t.lyrics, ne.value],
      ([y, C, P]) => {
        if (!y || !C?.trim()) {
          o.value = null, r.value = null, S = null, $ = !1;
          return;
        }
        const ue = C === S || C === w;
        if (S = C, ue && ($ || !P)) {
          if (o.value && P && o.value.blocks.length !== P.sections.length)
            r.value = l.value, o.value = null;
          else if (!o.value && r.value && P) {
            const Se = al(r.value, P);
            Se && (o.value = Se, r.value = null);
          }
          return;
        }
        const we = !$ && t.lyricsPending || C;
        o.value = P ? al(we, P) : null, r.value = o.value ? null : we, $ = !!P;
      },
      { immediate: !0 }
    ), Ge(
      [o, r, ne],
      () => {
        const y = o.value, C = ne.value;
        y ? C && y.blocks.length === C.sections.length && (l.value = zD(y, C)) : l.value = r.value;
      },
      { immediate: !0 }
    ), Ge(
      l,
      (y, C) => {
        w = y, i("lyricsChange", y), C !== void 0 && y !== C && u.refreshLyrics();
      },
      { immediate: !0 }
    );
    const B = N(
      () => !!t.lyricsTarget && !t.lyricsTarget.blocked && (!!t.lyricsTarget.own || !t.readonly)
    ), _ = N(
      () => !!l.value && !t.lyricsTarget?.own && xn(l.value) !== xn(t.lyrics ?? "")
    ), V = N(() => l.value ? br(l.value).blocks.map((y) => y.tag).join(" · ") : ""), he = N(() => l.value ?? t.lyrics ?? null);
    function ie() {
      return { lyrics: o.value, looseLyrics: r.value, spans: [...X()] };
    }
    const oe = /* @__PURE__ */ js(null);
    function X() {
      return oe.value ?? t.lyricSpans ?? [];
    }
    function Ae(y) {
      cl(y, X()) || (oe.value = y, i("lyricSpansChange", y), u.refreshLyrics());
    }
    Ge(
      () => t.lyricSpans,
      (y) => {
        y && oe.value && cl(y, oe.value) || (oe.value = null, u.refreshLyrics());
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
      const [P, ue] = Ir(C, y);
      return X().some(([we]) => we >= P && we < ue);
    }
    function Te(y) {
      const C = ce.value?.lyrics?.sections.find((P) => P.section === y);
      return o.value ? [...o.value.blocks[y]?.lines ?? []] : r.value === null || !C || C.block === null ? null : [...br(r.value).blocks[C.block]?.lines ?? []];
    }
    function Fe(y, C, P) {
      const ue = ne.value, we = ce.value?.lyrics;
      if (!ue || !we || !B.value) return [];
      const Se = ie();
      let Qe = X();
      const Ue = [];
      let tt = !1;
      for (const bt of [...new Set(y)].sort((Bn, Er) => Bn - Er)) {
        const Bn = Te(bt);
        if (Bn === null) continue;
        const Er = Ir(ue, bt), Ia = Ny(C(bt, _h(ue, we, bt, Bn)), Er), Rh = Ia.map((cs) => cs.text);
        if (o.value) o.value = GD(o.value, ue, bt, Rh);
        else if (r.value !== null) {
          const cs = we.sections.find((Ba) => Ba.section === bt)?.block;
          if (cs == null) continue;
          r.value = jD(r.value, cs, Rh);
        } else continue;
        Ia.forEach((cs, Ba) => {
          cs.id.startsWith("*") && Ue.push(Cl(bt, Ba));
        }), Qe = Vy(Qe, Er, Ia), tt = !0;
      }
      return tt ? (Ae(Qe), u.recordSide(P, Se, ie()), Ue) : [];
    }
    function ze(y) {
      const C = /* @__PURE__ */ new Map();
      for (const P of y) {
        const ue = Hy(P);
        ue && (C.has(ue.section) || C.set(ue.section, /* @__PURE__ */ new Set()), C.get(ue.section)?.add(ue.line));
      }
      return C;
    }
    function Ke(y) {
      const C = new Map(y.map((ue) => [ue.key, ue])), P = y.length;
      fe.value = Fe(
        [...ze(y.map((ue) => ue.key)).keys()],
        (ue, we) => we.map((Se, Qe) => {
          const Ue = C.get(Cl(ue, Qe));
          return Ue ? { ...Se, id: `*${Se.id}`, start: Ue.start, end: Ue.end } : Se;
        }),
        `lyrics: ${P === 1 ? "line" : `${P} lines`} placed`
      );
    }
    function et(y) {
      const C = ze(y);
      C.size && (Fe(
        [...C.keys()],
        (P, ue) => ue.filter((we, Se) => !C.get(P)?.has(Se)),
        `lyrics: ${y.length === 1 ? "line" : `${y.length} lines`} deleted`
      ), fe.value = []);
    }
    function pt() {
      const y = ne.value, C = ce.value?.lyrics;
      if (!y || !C) return [];
      const P = [];
      for (const [ue, we] of ze(fe.value)) {
        const Se = Te(ue);
        Se && _h(y, C, ue, Se).forEach((Qe, Ue) => {
          we.has(Ue) && P.push(Qe);
        });
      }
      return P;
    }
    function Pt() {
      const y = ne.value ? t$(ne.value.unit, Ph(pt())) : null;
      return y ? (Fi.value = y, u.error = null, u.notes = [`copied ${y.label} - Ctrl+V pastes them at the cursor`], !0) : !1;
    }
    function at(y, C, P) {
      const ue = ne.value;
      if (!ue) return;
      const we = _y(ue, C);
      if (we < 0 || Te(we) === null) {
        u.error = "The cursor is in a section without lyrics: set it into a section that has a lyrics block.";
        return;
      }
      const [, Se] = Ir(ue, we), Qe = y.filter((Ue) => C + Ue.offset < Se);
      Qe.length && (fe.value = Fe(
        [we],
        (Ue, tt) => [
          ...tt,
          ...Qe.map((bt, Bn) => ({
            id: `*new${Bn}`,
            text: bt.text,
            start: C + bt.offset,
            end: Math.min(C + bt.offset + bt.length, Se)
          }))
        ],
        P
      ), u.error = null, Qe.length < y.length && (u.notes = [`${y.length - Qe.length} line(s) did not fit before the section's end`]));
    }
    function yn(y) {
      const C = Fi.value;
      if ((y === "paste" || y === "insert") && C?.lyricLines?.length)
        return B.value ? ne.value && C.unit !== ne.value.unit ? (u.error = `The lines were copied with L:${C.unit} and do not fit this score's L:${ne.value.unit}.`, !0) : (at(C.lyricLines, p.value, `lyrics: ${C.label} pasted`), !0) : !0;
      if (!fe.value.length) return !1;
      if (y === "copy") Pt();
      else if (y === "cut")
        Pt() && et(fe.value);
      else if (y === "duplicate") {
        const P = pt();
        if (P.length) {
          const ue = Math.max(...P.map((we) => we.end));
          at(Ph(P), ue, `lyrics: ${P.length === 1 ? "line" : `${P.length} lines`} duplicated`);
        }
      }
      return !0;
    }
    function qn(y) {
      const C = ne.value;
      if (C && Ce(y.section)) {
        const ue = Math.max(1, Math.round(C.grid.units_per_quarter));
        Fe(
          [y.section],
          (we, Se) => {
            if (y.line < Se.length)
              return y.text ? Se.map((Ue, tt) => tt === y.line ? { ...Ue, text: y.text } : Ue) : Se.filter((Ue, tt) => tt !== y.line);
            const Qe = y.at ?? Se[Se.length - 1]?.end ?? Ir(C, y.section)[0];
            return y.text ? [...Se, { id: "*typed", text: y.text, start: Qe, end: Qe + ue }] : Se;
          },
          `lyrics: ${y.text || "line removed"}`
        );
        return;
      }
      const P = ie();
      if (o.value && C) o.value = UD(o.value, C, y.section, y.line, y.text);
      else if (r.value !== null) r.value = KD(r.value, y.block, y.line, y.text);
      else return;
      t.readonly || u.recordSide(`lyrics: ${y.text || "line removed"}`, P, ie());
    }
    function Lt() {
      const y = t.lyrics, C = ne.value;
      if (!y) return;
      const P = ie();
      o.value = C ? al(y, C) : null, r.value = o.value ? null : y, t.readonly || u.recordSide("lyrics reverted", P, ie());
    }
    Ge(ne, (y) => {
      if (!Oa || !y || r.value === null) return;
      Oa = !1;
      const C = al(r.value, y);
      C && (o.value = C, r.value = null);
    }), Ge(Re, (y) => {
      !Z.value && y && ne.value && (p.value = Zd(ne.value, y));
    });
    const _t = N({
      get: () => c.value.metronome,
      set: (y) => c.value = { ...c.value, metronome: y }
    }), bn = N(() => t.payload?.reference_audio ? zy(t.fetcher, t.payload.reference_audio) : null), At = /* @__PURE__ */ js(null), ls = /* @__PURE__ */ G(null);
    Ge(
      bn,
      (y) => {
        At.value = null, ls.value = null, y && BA(y).then(
          (C) => {
            bn.value === y && (At.value = C);
          },
          (C) => {
            bn.value === y && (ls.value = `the source recording could not be read: ${C instanceof Error ? C.message : String(C)}`);
          }
        );
      },
      { immediate: !0 }
    );
    const In = N({
      get: () => c.value.hear,
      set: (y) => c.value = { ...c.value, hear: y }
    }), as = N({
      get: () => c.value.sourceLevel,
      set: (y) => c.value = { ...c.value, sourceLevel: y }
    }), Bs = N(() => {
      const y = ce.value, C = y?.model;
      if (!y || !C) return null;
      const P = Rs(), ue = [...P.notes.map((tt) => [tt.onset, tt.onset + tt.duration]), ...P.chords.map((tt) => [tt.onset, tt.onset + 1])];
      if (!ue.length) return null;
      const we = Zo(C, Math.min(...ue.map(([tt]) => tt))), Se = Zo(C, Math.max(...ue.map(([, tt]) => tt)) - 1), Qe = y.bars[we - 1], Ue = y.bars[Se - 1];
      return !Qe || !Ue ? null : { from: Qe.start_s, to: Ue.start_s + Ue.duration_s, label: we === Se ? `bar ${we}` : `bars ${we}-${Se}` };
    }), zt = N(() => {
      const y = e4(ce.value?.model, t.payload?.timeline), C = t.sourceShift ?? 0;
      return !y || !C ? y : y.map((P) => P ? [P[0] - C, P[1] - C, P[2]] : null);
    }), Bi = N(() => {
      const y = zt.value?.[(Xe.value ?? 1) - 1] ?? zt.value?.find((P) => P);
      if (!y) return 0.5;
      const C = Number(y[2].split("/")[0]) || 4;
      return (y[1] - y[0]) / C;
    }), Ze = N(() => {
      const y = t.payload?.sung_pitch;
      if (!y) return null;
      const C = _A(y), P = ne.value;
      return !C || !P ? { problem: "problem" in y ? y.problem : "the sung pitch could not be read", curve: null, offset: 0, bars: void 0 } : { problem: null, curve: C, offset: HA(P, zt.value, C), bars: zt.value };
    }), Yn = N({
      get: () => t.sourceShift ?? 0,
      set: (y) => i("sourceShiftChange", Math.round(y * 1e3) / 1e3)
    }), bo = N(() => zt.value?.map((y) => y?.[0] ?? null) ?? null), us = N(() => ce.value?.header?.unit ?? "1/16"), mi = N({
      get: () => c.value.voices,
      set: (y) => c.value = { ...c.value, voices: y }
    }), sn = N({
      get: () => c.value.speed,
      set: (y) => c.value = { ...c.value, speed: y }
    });
    function wn(y, C = !1, P = "notation") {
      const ue = C ? u.selection.includes(y) ? u.selection.filter((Se) => Se !== y) : [...u.selection, y] : [y];
      u.select(ue);
      const we = Cs(ce.value, ue[0]);
      m.value = P !== "text" && we ? [we.source[0], we.source[1]] : m.value;
    }
    function W(y) {
      if (!ce.value || pe.value) return;
      const C = L1(ce.value, y);
      C && wn(C.id, !1, "text");
    }
    function le(y) {
      if (!ce.value) return;
      ce.value.model && (p.value = Zd(ce.value.model, y));
      const C = B1(ce.value, y);
      C && wn(C.id, !1, "keys");
    }
    function ae() {
      return D.recording.value ? (u.notes = ["recording - stop it (Space) before editing"], !0) : !1;
    }
    async function Me(y) {
      t.readonly || ae() || await u.operate(y);
    }
    function Yt(y) {
      return t.readonly || ae() ? Promise.resolve(!1) : u.operate(y);
    }
    function $r() {
      ae() || u.undo();
    }
    function Dr() {
      ae() || u.redo();
    }
    function Da(y) {
      u.select(y);
      const C = Cs(ce.value, y[0]);
      C && (m.value = [C.source[0], C.source[1]]);
    }
    function Rs() {
      const y = ne.value;
      if (!y) return { notes: [], chords: [] };
      const C = go(ce.value, u.selection), P = yr(u.selection);
      return {
        notes: [...y.tracks.vocal, ...y.tracks.ins].filter((ue) => C.has(ue.id)),
        chords: y.tracks.chords.filter((ue) => P.has(ue.id))
      };
    }
    function Or() {
      const y = ne.value, C = Rs(), P = y ? hp(y, C.notes, C.chords) : null;
      return P ? (Fi.value = P, u.error = null, u.notes = [`copied ${P.label} - Ctrl+V pastes it at the cursor, Ctrl+Shift+V inserts it there`], !0) : (u.error = "Select notes or chord symbols first (in the roll, the notation or the inspector).", !1);
    }
    async function wo(y) {
      if (yn(y)) return;
      const C = ne.value;
      if (y === "copy") {
        Or();
        return;
      }
      if (t.readonly || !C) return;
      if (y === "cut") {
        const we = Rs();
        if (!Or()) return;
        await Me({ op: "delete", ids: [...we.notes.map((Se) => Se.id), ...we.chords.map((Se) => Se.id)] });
        return;
      }
      if (y === "duplicate") {
        const we = Rs(), Se = hp(C, we.notes, we.chords);
        if (!Se) {
          u.error = "Select notes or chord symbols to duplicate first.";
          return;
        }
        const Qe = Math.min(...we.notes.map((tt) => tt.onset), ...we.chords.map((tt) => tt.onset)), Ue = dp(Se, C, Qe + Se.span, "overwrite");
        typeof Ue == "string" ? u.error = "There is no room after the selection to duplicate it." : await Me(Ue);
        return;
      }
      const P = Fi.value;
      if (!P) {
        u.error = "The clipboard is empty: copy notes, chord symbols or sections first.";
        return;
      }
      const ue = dp(P, C, p.value, y === "insert" ? "insert" : "overwrite");
      typeof ue == "string" ? u.error = ue : await Me(ue);
    }
    function x(y) {
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
      v.value = y === null || !ce.value ? null : Ah(ce.value, y), D.onTime(y);
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
      dl(y, ({ dy: P }) => c.value = { ...c.value, rollHeight: xf(C, P) });
    }
    function Ee(y) {
      const C = y.key === "ArrowUp" ? -16 : y.key === "ArrowDown" ? 16 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, rollHeight: xf(c.value.rollHeight, C) });
    }
    function je(y) {
      y.preventDefault();
      const C = c.value.notationShare, ue = y.currentTarget.parentElement?.clientHeight ?? 0;
      dl(y, ({ dy: we }) => c.value = { ...c.value, notationShare: x1(C, we, ue) });
    }
    function st(y) {
      const C = y.key === "ArrowDown" ? 0.03 : y.key === "ArrowUp" ? -0.03 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, notationShare: Eu(c.value.notationShare + C) });
    }
    function Pe(y) {
      y.preventDefault();
      const C = c.value.sideWidth;
      dl(y, ({ dx: P }) => c.value = { ...c.value, sideWidth: kf(C, P) });
    }
    function it(y) {
      const C = y.key === "ArrowLeft" ? -16 : y.key === "ArrowRight" ? 16 : 0;
      C && (y.preventDefault(), c.value = { ...c.value, sideWidth: kf(c.value.sideWidth, C) });
    }
    const Dt = /* @__PURE__ */ G(null), Ne = /* @__PURE__ */ G(null), yt = /* @__PURE__ */ G(null), Ri = /* @__PURE__ */ G(!1), xo = N(() => t.guide !== void 0), Lr = N(() => u.commitBlock ? u.commitBlock : t.doc.text.trim() && ce.value?.display_abc ? null : "There is no score to export yet."), Eh = N({
      get: () => c.value.paper,
      set: (y) => c.value = { ...c.value, paper: y }
    });
    function yy(y) {
      yt.value = null, u.notes = [y];
    }
    const Ps = N(() => t.readonly ? "This score belongs to the other sheet." : u.commitBlock ? u.commitBlock : t.doc.text.trim() ? null : "There is no score to export yet.");
    async function by() {
      const y = Ps.value;
      if (y) {
        yt.value = y;
        return;
      }
      Ri.value = !0, yt.value = null;
      try {
        const C = await Ry(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          guide: t.guide ?? []
        });
        eo(C.filename, zM(C.data));
      } catch (C) {
        yt.value = to(C);
      } finally {
        Ri.value = !1;
      }
    }
    async function wy() {
      const y = Ps.value;
      if (y) {
        yt.value = y;
        return;
      }
      Ri.value = !0, yt.value = null;
      try {
        const C = await Py(t.fetcher, {
          abc: t.doc.text,
          title: t.title ?? "",
          lyrics: l.value ?? t.lyrics ?? null,
          spans: X()
        });
        eo(C.filename, new TextEncoder().encode(C.data), C.type);
      } catch (C) {
        yt.value = to(C);
      } finally {
        Ri.value = !1;
      }
    }
    const Ih = /* @__PURE__ */ G(null);
    function xy() {
      const y = u4({
        title: t.title,
        score: t.doc.text,
        guide: t.guide ?? [],
        lyrics: l.value ?? t.lyrics ?? null,
        lyricSpans: X(),
        settings: z.value
      });
      eo(c4(t.title), new TextEncoder().encode(`${JSON.stringify(y, null, 1)}
`), "application/json"), yt.value = null, u.notes = [`saved the project: score${y.guide.length ? `, ${Bh(y.guide.length)}` : ""}${y.lyrics ? ", lyrics" : ""}, settings`];
    }
    function ky() {
      yt.value = null, Ih.value?.click();
    }
    async function Sy(y) {
      const C = y.target, P = C.files?.[0];
      if (C.value = "", !P) return;
      const ue = h4(await P.text());
      typeof ue == "string" ? yt.value = ue : Cy(ue, P.name);
    }
    const Bh = (y) => y === 1 ? "1 Guide note" : `${y} Guide notes`;
    let Oa = !1;
    function Cy(y, C) {
      if (ae()) return;
      if (t.readonly) {
        yt.value = "This score belongs to the other sheet; open the project in that sheet.";
        return;
      }
      const P = ["score"], ue = [], we = ie(), Se = {}, Qe = t.guide;
      Qe !== void 0 ? (we.guide = [...Qe], Se.guide = [...y.guide], y.guide.length && P.push(Bh(y.guide.length))) : y.guide.length && ue.push("the Guide notes (only the DAW sheet keeps a Guide track)"), y.lyrics && B.value ? (o.value = null, r.value = y.lyrics, Oa = !0, P.push("lyrics"), Ae(y.lyric_spans)) : y.lyrics && ue.push("the lyrics (this sheet cannot change them here)"), Object.assign(Se, ie()), Object.keys(y.settings).length && (c.value = mp(c.value, y.settings), P.push("settings"));
      const Ue = `open project (${C})`;
      u.replaceText(y.score, Ue, null, { before: we, after: Se }) || u.recordSide(Ue, we, Se), Se.guide && Qe !== void 0 && !Lo(Se.guide, Qe) && i("guideChange", Se.guide), yt.value = null, u.notes = [
        `opened ${C}: ${P.join(", ")}${y.title ? ` ("${y.title}")` : ""}`,
        ...ue.map((tt) => `not opened: ${tt}`)
      ];
    }
    function My() {
      yt.value = null, Dt.value?.click();
    }
    async function Ay(y) {
      const C = y.target, P = C.files?.[0];
      if (C.value = "", !!P)
        try {
          Ne.value = { data: FM(new Uint8Array(await P.arrayBuffer())), filename: P.name };
        } catch (ue) {
          yt.value = to(ue);
        }
    }
    function Ty(y, C) {
      if (t.readonly || ae()) return;
      const P = Ne.value?.filename ?? "file", ue = t.guide, we = ue === void 0 ? void 0 : C ? [...y.guide] : [], Se = ue === void 0 || we === void 0 ? void 0 : { before: { guide: [...ue] }, after: { guide: we } };
      u.replaceText(y.abc, `import MIDI (${P})`, y.analysis, Se), we !== void 0 && ue !== void 0 && !Lo(we, ue) && i("guideChange", we), Ne.value = null, yt.value = null;
    }
    function La(y) {
      const C = y;
      return C ? !!C.closest("input, textarea, select, .cm-editor") : !1;
    }
    const $y = /* @__PURE__ */ new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);
    function Ea(y) {
      const C = y;
      if (!C) return !1;
      if (C.closest('textarea, select, .cm-editor, [contenteditable="true"]')) return !0;
      const P = C.closest("input");
      return !!P && !$y.has(P.type);
    }
    function Dy(y) {
      y.key === " " && !Ea(y.target) && y.preventDefault();
    }
    function Oy(y) {
      const C = y.ctrlKey || y.metaKey;
      if (C && !t.readonly && (y.key === "z" || y.key === "Z" || y.key === "y")) {
        if (La(y.target) && !y.target.closest(".cm-editor")) return;
        y.preventDefault(), y.key === "y" || y.key.toLowerCase() === "z" && y.shiftKey ? Dr() : $r();
        return;
      }
      const P = C && !La(y.target) ? x(y) : null;
      if (P) {
        y.preventDefault(), y.stopPropagation(), wo(P);
        return;
      }
      if (y.key === " " && !C && !Ea(y.target)) {
        y.preventDefault(), b.value?.toggle();
        return;
      }
      if (La(y.target) || C) return;
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
      const ue = ce.value, we = u.primary, Se = y.key.toLowerCase();
      if ((Se === "g" || Se === "h") && !y.altKey && O.value) {
        y.preventDefault(), y.shiftKey ? O.value.zoomRows(Se === "h" ? 2 : -2) : O.value.zoomBy(Se === "h" ? 1.25 : 1 / 1.25);
        return;
      }
      if ((y.key === "Home" || y.key === "End") && ne.value) {
        y.preventDefault(), p.value = y.key === "Home" ? 0 : ne.value.total;
        return;
      }
      if (!ue || !we) return;
      (() => {
        switch (y.key) {
          case "ArrowRight":
          case "ArrowLeft": {
            const Ue = E1(ue, we.id, y.key === "ArrowRight" ? 1 : -1);
            return Ue && wn(Ue.id, y.shiftKey, "keys"), !0;
          }
          case "ArrowUp":
          case "ArrowDown": {
            if (y.altKey) {
              const Bn = I1(ue, we.id);
              return Bn && wn(Bn.id, !1, "keys"), !0;
            }
            if (t.readonly) return !1;
            const Ue = u.selection.filter((Bn) => Cs(ue, Bn)?.kind === "note"), tt = [...yr(u.selection)], bt = (y.shiftKey ? 12 : 1) * (y.key === "ArrowUp" ? 1 : -1);
            return tt.length ? Me({ op: "set_note_pitch", ids: [...go(ue, u.selection), ...tt], semitones: bt }) : Ue.length && Me({ op: "shift_pitch", ids: Ue, semitones: bt }), !0;
          }
          case "[":
          case "]": {
            if (t.readonly || we.kind !== "note") return !1;
            const Ue = Iu(we.units, y.key === "]" ? 1 : -1);
            return Ue && Me({ op: "set_duration", id: we.id, units: Ue }), !0;
          }
          case "r":
          case "Delete":
          case "Backspace":
            return t.readonly ? !1 : (we.kind === "note" && Me({ op: "note_to_rest", ids: u.selection }), !0);
          case "n":
            return t.readonly ? !1 : (we.kind !== "note" && Me({ op: "rest_to_note", id: we.id }), !0);
          default:
            return !1;
        }
      })() && (y.preventDefault(), y.stopPropagation());
    }
    return (y, C) => (k(), M("div", {
      ref_key: "tabRoot",
      ref: L,
      class: "score-tab",
      onKeydown: Oy,
      onKeyup: Dy
    }, [
      n.readonly ? ee("", !0) : (k(), kn(iD, {
        key: 0,
        view: ce.value,
        selection: H(u).selection,
        primary: H(u).primary,
        busy: H(u).busy,
        "can-undo": H(u).canUndo,
        "can-redo": H(u).canRedo,
        "undo-label": H(u).undoLabel,
        "redo-label": H(u).redoLabel,
        onOperate: Me,
        onUndo: $r,
        onRedo: Dr
      }, null, 8, ["view", "selection", "primary", "busy", "can-undo", "can-redo", "undo-label", "redo-label"])),
      g("div", MO, [
        g("span", AO, [
          g("button", {
            role: "radio",
            "aria-checked": h.value === "review",
            class: qe({ active: h.value === "review" }),
            title: "Piano roll, notation and inspector; the ABC text under Advanced",
            onClick: C[0] || (C[0] = (P) => f("review"))
          }, " Review ", 10, TO),
          g("button", {
            role: "radio",
            "aria-checked": J.value,
            class: qe({ active: J.value }),
            title: "Review plus the track headers: Vocal, Instrument, Chords and the Guide track (never sent to YuE2)",
            onClick: C[1] || (C[1] = (P) => f("daw"))
          }, " DAW ", 10, $O),
          g("button", {
            role: "radio",
            "aria-checked": h.value === "text",
            class: qe({ active: h.value === "text" }),
            title: "The ABC text with its diagnostics, and the notation",
            onClick: C[2] || (C[2] = (P) => f("text"))
          }, " Text ", 10, DO)
        ]),
        Le.value ? (k(), M(me, { key: 0 }, [
          g("label", OO, [
            We(g("input", {
              "onUpdate:modelValue": C[3] || (C[3] = (P) => c.value.roll = P),
              type: "checkbox",
              "aria-label": "Show the piano roll"
            }, null, 512), [
              [hn, c.value.roll]
            ]),
            C[33] || (C[33] = be(" piano roll ", -1))
          ]),
          g("label", LO, [
            We(g("input", {
              "onUpdate:modelValue": C[4] || (C[4] = (P) => c.value.advanced = P),
              type: "checkbox",
              "aria-label": "Show the ABC text (advanced)"
            }, null, 512), [
              [hn, c.value.advanced]
            ]),
            C[34] || (C[34] = be(" ABC text (advanced) ", -1))
          ])
        ], 64)) : ee("", !0),
        g("label", EO, [
          C[35] || (C[35] = be(" zoom ", -1)),
          We(g("input", {
            "onUpdate:modelValue": C[5] || (C[5] = (P) => c.value.zoom = P),
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
        Ht(PM),
        g("span", IO, [
          g("button", {
            disabled: Ri.value || !!Ps.value,
            title: Ps.value ?? "Download this score as a standard MIDI file (Vocal, Instrument, Chords and the Guide track)",
            onClick: by
          }, " Export MIDI ", 8, BO),
          g("button", {
            disabled: Ri.value || !!Ps.value,
            title: Ps.value ?? "Download the sheet music as MusicXML for notation programs (MuseScore, Sibelius, Finale, Dorico, Cubase): both voices, chord symbols, sections and the lyrics",
            onClick: wy
          }, " Export MusicXML ", 8, RO),
          Ht(U4, {
            paper: Eh.value,
            "onUpdate:paper": C[6] || (C[6] = (P) => Eh.value = P),
            abc: Lr.value ? null : ce.value?.display_abc ?? null,
            title: n.title ?? "",
            blocked: Lr.value,
            onDone: yy,
            onFailed: C[7] || (C[7] = (P) => yt.value = P)
          }, null, 8, ["paper", "abc", "title", "blocked"]),
          g("button", {
            disabled: !n.doc.text.trim(),
            title: "Save the score, the Guide notes and the lyrics in one project file, to go on later (Open project…)",
            onClick: xy
          }, " Save project ", 8, PO),
          g("button", {
            disabled: n.readonly,
            title: n.readonly ? "This score belongs to the other sheet." : "Read a MIDI file as the score (the report is shown before anything is replaced)",
            onClick: My
          }, " Import MIDI… ", 8, _O),
          g("button", {
            disabled: n.readonly,
            title: n.readonly ? "This score belongs to the other sheet." : "Open a project file: its score, Guide notes and lyrics replace these (one undo step)",
            onClick: ky
          }, " Open project… ", 8, NO),
          g("input", {
            ref_key: "midiFile",
            ref: Dt,
            class: "hidden-file",
            type: "file",
            accept: ".mid,.midi,audio/midi,audio/x-midi",
            "aria-label": "MIDI file",
            onChange: Ay
          }, null, 544),
          g("input", {
            ref_key: "projectFile",
            ref: Ih,
            class: "hidden-file",
            type: "file",
            accept: `${H(vy)},.json,application/json`,
            "aria-label": "Project file",
            onChange: Sy
          }, null, 40, VO)
        ]),
        H(u).pending ? (k(), M("span", HO, "checking…")) : H(u).view?.ok ? (k(), M("span", FO, "✓ valid")) : pe.value ? (k(), M("span", zO, "✖ " + F(He.value.length) + " error(s)", 1)) : ee("", !0),
        n.readonly ? (k(), M("span", WO, "read-only: owned by the other sheet")) : ee("", !0)
      ]),
      pe.value && !n.readonly ? (k(), M("p", KO, [
        C[36] || (C[36] = be(" The ABC text has errors: the notation shows the last valid score, and Apply and Approve are off until the text is valid again. ", -1)),
        H(u).canRevert ? (k(), M("button", {
          key: 0,
          onClick: C[8] || (C[8] = (P) => H(u).revertToLastValid())
        }, "Revert to last valid")) : ee("", !0),
        Le.value && !c.value.advanced ? (k(), M("button", {
          key: 1,
          onClick: C[9] || (C[9] = (P) => c.value.advanced = !0)
        }, "Show the ABC text")) : ee("", !0)
      ])) : H(u).view?.ok && H(u).view.model_error && !n.readonly ? (k(), M("p", UO, " This score is valid for YuE2 but outside the editor's supported subset (" + F(H(u).view.model_error.message) + "); edit it as ABC text. ", 1)) : ee("", !0),
      Z.value ? (k(), kn(XT, {
        key: 3,
        ref_key: "pianoRoll",
        ref: O,
        zoom: Q.value,
        "onUpdate:zoom": C[10] || (C[10] = (P) => Q.value = P),
        "row-height": c.value.rowHeight,
        "onUpdate:rowHeight": C[11] || (C[11] = (P) => c.value.rowHeight = P),
        follow: c.value.follow,
        "onUpdate:follow": C[12] || (C[12] = (P) => c.value.follow = P),
        track: E.value,
        "onUpdate:track": C[13] || (C[13] = (P) => E.value = P),
        recorded: H(D).recording.value ? { track: E.value, notes: H(D).live.value } : null,
        "sung-visible": c.value.sung,
        "onUpdate:sungVisible": C[14] || (C[14] = (P) => c.value.sung = P),
        "wave-visible": c.value.wave,
        "onUpdate:waveVisible": C[15] || (C[15] = (P) => c.value.wave = P),
        sound: K.value,
        sung: Ze.value,
        height: c.value.rollHeight,
        view: ce.value,
        selection: H(u).selection,
        playing: d.value,
        operate: Yt,
        readonly: n.readonly,
        stale: pe.value,
        busy: H(u).busy,
        locator: ne.value ? p.value : null,
        playhead: v.value,
        clip: H(Fi)?.label ?? null,
        lyrics: ce.value?.lyrics ?? null,
        "lyrics-editable": B.value,
        source: At.value ? { envelope: At.value.envelope, bars: zt.value } : null,
        audition: c.value.audition,
        "onUpdate:audition": C[16] || (C[16] = (P) => c.value.audition = P),
        "resize-mode": "rests",
        onSelect: Da,
        onLocate: C[17] || (C[17] = (P) => p.value = P),
        onClipboard: wo,
        "lyric-selection": fe.value,
        "onUpdate:lyricSelection": C[18] || (C[18] = (P) => fe.value = P),
        onLyricEdit: qn,
        onLyricPlace: Ke,
        onLyricDelete: et
      }, null, 8, ["zoom", "row-height", "follow", "track", "recorded", "sung-visible", "wave-visible", "sound", "sung", "height", "view", "selection", "playing", "readonly", "stale", "busy", "locator", "playhead", "clip", "lyrics", "lyrics-editable", "source", "audition", "lyric-selection"])) : ee("", !0),
      Z.value && ce.value?.model ? (k(), M("div", {
        key: 4,
        class: "splitter horizontal",
        role: "separator",
        tabindex: "0",
        "aria-label": "Resize the piano roll",
        "aria-valuenow": c.value.rollHeight,
        "aria-valuemin": H(Wc),
        "aria-valuemax": H(Kc),
        title: "Drag to resize the piano roll (arrow keys work too)",
        onPointerdown: ve,
        onKeydown: Ee
      }, null, 40, jO)) : ee("", !0),
      Ht(AD, {
        ref_key: "transport",
        ref: b,
        voices: mi.value,
        "onUpdate:voices": C[21] || (C[21] = (P) => mi.value = P),
        speed: sn.value,
        "onUpdate:speed": C[22] || (C[22] = (P) => sn.value = P),
        sounds: c.value.sounds,
        metronome: _t.value,
        "onUpdate:metronome": C[23] || (C[23] = (P) => _t.value = P),
        view: ce.value,
        bar: Xe.value,
        from: ht.value,
        position: vt.value,
        reference: bn.value,
        hear: In.value,
        "onUpdate:hear": C[24] || (C[24] = (P) => In.value = P),
        "source-level": as.value,
        "onUpdate:sourceLevel": C[25] || (C[25] = (P) => as.value = P),
        "source-shift": Yn.value,
        "onUpdate:sourceShift": C[26] || (C[26] = (P) => Yn.value = P),
        "source-beat": Bi.value,
        "timeline-bars": zt.value,
        guide: se.value,
        source: At.value,
        "source-problem": ls.value,
        "loop-range": Bs.value,
        onCursor: C[27] || (C[27] = (P) => d.value = P),
        onTime: A,
        onStopped: H(D).onStopped
      }, {
        record: Qp(({ countingIn: P }) => [
          Ht(B4, {
            settings: j.value,
            "onUpdate:settings": C[19] || (C[19] = (ue) => j.value = ue),
            hub: H(re),
            recording: H(D).recording.value,
            "counting-in": P,
            step: H(D).step.value,
            target: E.value === "vocal" ? "Vocal" : "Ins",
            disabled: ke.value,
            onRecord: H(D).start,
            onStop: H(D).stop,
            onStep: H(D).toggleStep,
            onRest: H(D).rest,
            onEnable: H(D).ready
          }, null, 8, ["settings", "hub", "recording", "counting-in", "step", "target", "disabled", "onRecord", "onStop", "onStep", "onRest", "onEnable"]),
          Ht(hO, {
            sounds: I.value,
            "onUpdate:sounds": C[20] || (C[20] = (ue) => I.value = ue),
            fetcher: n.fetcher,
            settings: z.value,
            "keeps-guide": xo.value,
            onApply: R
          }, null, 8, ["sounds", "fetcher", "settings", "keeps-guide"])
        ]),
        _: 1
      }, 8, ["voices", "speed", "sounds", "metronome", "view", "bar", "from", "position", "reference", "hear", "source-level", "source-shift", "source-beat", "timeline-bars", "guide", "source", "source-problem", "loop-range", "onStopped"]),
      g("div", {
        class: qe(["score-main", { "with-roll": Z.value && !!ce.value?.model, "with-inspector": Le.value }]),
        "data-layout": h.value,
        "data-text": Le.value ? c.value.advanced ? "shown" : "hidden" : "main",
        style: Mi(q.value)
      }, [
        g("div", qO, [
          J.value ? (k(), kn(PD, {
            key: 0,
            voices: mi.value,
            "onUpdate:voices": C[28] || (C[28] = (P) => mi.value = P),
            view: ce.value,
            "guide-count": ct.value.length,
            sounds: I.value,
            "onUpdate:sounds": C[29] || (C[29] = (P) => I.value = P),
            "keeps-guide": xo.value,
            readonly: n.readonly,
            onClearGuide: T
          }, null, 8, ["voices", "view", "guide-count", "sounds", "keeps-guide", "readonly"])) : ee("", !0),
          Ht(O$, {
            view: ce.value,
            bar: Re.value,
            "error-bars": Oe.value,
            "source-starts": bo.value,
            readonly: n.readonly,
            "section-lyrics": o.value?.blocks ?? null,
            onGoto: le,
            onOperate: Me,
            onNotice: C[30] || (C[30] = (P) => H(u).notes = [P])
          }, null, 8, ["view", "bar", "error-bars", "source-starts", "readonly", "section-lyrics"]),
          n.lyricsTarget && l.value !== null ? (k(), M("div", YO, [
            C[37] || (C[37] = g("strong", null, "Lyrics", -1)),
            n.lyricsTarget.blocked ? (k(), M("p", XO, F(n.lyricsTarget.blocked), 1)) : (k(), M(me, { key: 1 }, [
              _.value ? (k(), M("p", JO, [
                be(" Apply writes the changed lyrics into " + F(n.lyricsTarget.title) + ": " + F(V.value) + ". That sheet then asks for approval again. ", 1),
                n.lyricsTarget.replans ? (k(), M(me, { key: 0 }, [
                  be(" The planner reads those lyrics and plans again on the next run; this score is kept as yours (manual) and used. ")
                ], 64)) : ee("", !0)
              ])) : (k(), M("p", ZO, [
                be(F(n.lyricsTarget.own ? "This sheet's lyrics" : `The lyrics of ${n.lyricsTarget.title}`) + ": double-click the lyrics lane over the notes to edit a line where it is sung. ", 1),
                o.value && !n.readonly ? (k(), M(me, { key: 0 }, [
                  be("Duplicating, moving or deleting sections arranges them too.")
                ], 64)) : ee("", !0)
              ])),
              _.value ? (k(), M("button", {
                key: 2,
                title: "Back to the lyrics as their sheet has them (one undo step)",
                onClick: Lt
              }, " Revert the lyrics ")) : ee("", !0)
            ], 64))
          ])) : ee("", !0),
          Le.value && he.value ? (k(), M("details", QO, [
            C[38] || (C[38] = g("summary", null, "Lyrics fit", -1)),
            Ht($g, {
              lyrics: he.value,
              abc: n.doc.text,
              fetcher: n.fetcher,
              engine: n.payload?.engine ?? null,
              instrumental: n.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])
          ])) : ee("", !0)
        ]),
        g("div", {
          class: "splitter vertical",
          role: "separator",
          tabindex: "0",
          "aria-label": "Resize the side column",
          "aria-valuenow": c.value.sideWidth,
          "aria-valuemin": H(Gc),
          "aria-valuemax": H(qc),
          title: "Drag to resize the navigator column (arrow keys work too)",
          onPointerdown: Pe,
          onKeydown: it
        }, null, 40, eL),
        g("div", {
          class: qe(["score-views", { split: Le.value && c.value.advanced }])
        }, [
          Le.value ? ee("", !0) : (k(), kn(Kd, {
            key: 0,
            text: n.doc.text,
            diagnostics: He.value,
            reveal: m.value,
            readonly: n.readonly,
            onChange: H(u).typed,
            onCursor: W
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])),
          Ht(gA, {
            view: ce.value,
            stale: pe.value,
            selection: H(u).selection,
            playing: d.value,
            zoom: c.value.zoom,
            tabindex: "0",
            onSelect: C[31] || (C[31] = (P, ue) => wn(P, ue))
          }, null, 8, ["view", "stale", "selection", "playing", "zoom"]),
          Le.value && c.value.advanced ? (k(), M("div", {
            key: 1,
            class: "splitter horizontal",
            role: "separator",
            tabindex: "0",
            "aria-label": "Resize the ABC text",
            "aria-valuenow": c.value.notationShare,
            "aria-valuemin": H(Uc),
            "aria-valuemax": H(jc),
            title: "Drag to give the notation or the ABC text more room (arrow keys work too)",
            onPointerdown: je,
            onKeydown: st
          }, null, 40, tL)) : ee("", !0),
          Le.value && c.value.advanced ? (k(), kn(Kd, {
            key: 2,
            text: n.doc.text,
            diagnostics: He.value,
            reveal: m.value,
            readonly: n.readonly,
            onChange: H(u).typed,
            onCursor: W
          }, null, 8, ["text", "diagnostics", "reveal", "readonly", "onChange"])) : ee("", !0)
        ], 2),
        Le.value ? (k(), kn(EM, {
          key: 0,
          view: ce.value,
          selection: H(u).selection,
          operate: Yt,
          "fallback-bar": H(u).primary?.bar ?? null,
          readonly: n.readonly,
          stale: pe.value,
          busy: H(u).busy,
          "resize-mode": "rests"
        }, null, 8, ["view", "selection", "fallback-bar", "readonly", "stale", "busy"])) : ee("", !0)
      ], 14, GO),
      g("p", nL, [
        g("span", null, F(H(u).selection.length > 1 ? `${H(u).selection.length} selected · ` : "") + F(H(P1)(H(u).primary, us.value)), 1),
        (k(!0), M(me, null, Ie(H(u).notes, (P, ue) => (k(), M("span", {
          key: ue,
          class: "change"
        }, F(P), 1))), 128))
      ]),
      H(u).error ? (k(), M("p", iL, F(H(u).error), 1)) : ee("", !0),
      yt.value ? (k(), M("p", sL, F(yt.value), 1)) : ee("", !0),
      U.value ? (k(), M("p", oL, F(U.value), 1)) : ee("", !0),
      Ne.value ? (k(), kn(fA, {
        key: 8,
        fetcher: n.fetcher,
        data: Ne.value.data,
        filename: Ne.value.filename,
        view: ce.value,
        "keeps-guide": xo.value,
        "current-guide": ct.value.length,
        onClose: C[32] || (C[32] = (P) => Ne.value = null),
        onInsert: Ty
      }, null, 8, ["fetcher", "data", "filename", "view", "keeps-guide", "current-guide"])) : ee("", !0),
      He.value.length ? (k(), M("ul", rL, [
        (k(!0), M(me, null, Ie(He.value, (P, ue) => (k(), M("li", {
          key: ue,
          "data-severity": P.severity
        }, [
          g("strong", null, F(P.severity), 1),
          P.bar ? (k(), M("button", {
            key: 0,
            class: "link",
            title: `Go to bar ${P.bar}`,
            onClick: (we) => le(P.bar)
          }, "bar " + F(P.bar), 9, aL)) : P.line ? (k(), M("span", uL, "line " + F(P.line), 1)) : ee("", !0),
          be(" " + F(P.message), 1)
        ], 8, lL))), 128))
      ])) : ee("", !0)
    ], 544));
  }
}), cL = ["aria-label"], hL = ["title"], fL = {
  class: "tabs",
  role: "tablist",
  "aria-label": "Documents"
}, dL = ["aria-selected", "onClick"], pL = ["title", "aria-label", "aria-pressed"], gL = {
  key: 0,
  class: "hint"
}, mL = {
  key: 1,
  class: "confirm",
  role: "alertdialog",
  "aria-label": "Unapplied changes"
}, vL = ["disabled", "title"], yL = {
  class: "body",
  role: "tabpanel"
}, bL = { class: "doc-head" }, wL = ["data-state"], xL = ["disabled", "onClick"], kL = ["disabled", "onClick"], SL = ["onClick"], CL = {
  key: 0,
  class: "conflict"
}, ML = ["onClick"], AL = ["onClick"], TL = ["onClick"], $L = ["onUpdate:modelValue", "rows", "aria-label", "onInput"], DL = {
  key: 3,
  class: "tag-helpers"
}, OL = ["title", "onClick"], LL = {
  key: 0,
  class: "facts"
}, EL = {
  key: 4,
  class: "asr"
}, IL = { key: 0 }, BL = { key: 1 }, RL = { key: 5 }, PL = {
  key: 0,
  class: "diff"
}, _L = { key: 0 }, NL = { key: 1 }, VL = { key: 2 }, HL = { key: 3 }, FL = {
  key: 0,
  class: "doc context wide"
}, zL = { class: "doc-head" }, WL = ["title"], KL = {
  key: 1,
  class: "badge"
}, UL = {
  key: 0,
  class: "hint score-owner"
}, jL = {
  key: 1,
  class: "hint"
}, GL = {
  key: 1,
  class: "doc sections"
}, qL = {
  key: 0,
  class: "doc context"
}, YL = { class: "doc-head" }, XL = {
  class: "findings",
  "aria-label": "Validation"
}, JL = ["data-status"], ZL = { key: 0 }, QL = ["title"], eE = { key: 1 }, tE = ["title"], nE = { class: "idea" }, iE = {
  key: 0,
  class: "idea"
}, sE = { class: "where" }, oE = {
  key: 0,
  class: "kept"
}, rE = {
  key: 1,
  class: "error"
}, lE = {
  key: 2,
  class: "error"
}, aE = {
  key: 3,
  class: "error"
}, uE = {
  key: 4,
  class: "error"
}, cE = ["data-severity"], hE = { class: "where" }, fE = {
  key: 0,
  class: "facts"
}, dE = ["disabled"], pE = ["disabled", "title"], gE = ["disabled", "title"], mE = ["aria-valuenow", "title"], vE = /* @__PURE__ */ tn({
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
    }, l = { title: 1, style: 3, lyrics: 16, score: 18, artwork_prompt: 3 }, a = N(() => t.payload?.style_label === "caption"), u = N(() => ({ ...r, style: a.value ? "Caption" : "Style" })), c = (W) => W === "style" && a.value ? "Caption" : o[W], h = (W) => W === "style" && a.value ? 14 : l[W], f = /* @__PURE__ */ ws(Nh(t.state, t.payload, t.owned)), d = /* @__PURE__ */ G(t.payload), p = /* @__PURE__ */ G(null), v = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1), b = /* @__PURE__ */ G(null), O = N(() => {
      const W = f.find((ae) => ae.kind === "score"), le = b.value;
      return W && le?.reason && le.text === W.text ? le.reason : null;
    }), L = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G(0);
    let I;
    const z = N(() => t.payload?.context?.score ?? null), R = /* @__PURE__ */ ws({ kind: "score", text: z.value ?? "", intent: "keep" }), Y = N(
      () => !f.some((W) => W.kind === "score") && !!z.value && !!t.scoreTarget && !t.scoreTarget.blocked
    ), K = /* @__PURE__ */ G(null), re = N(() => {
      const W = K.value;
      return Y.value && W?.reason && W.text === R.text ? W.reason : null;
    }), j = N(
      () => Y.value && z.value && xn(R.text) !== xn(z.value) ? R.text : null
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
    ), ye = N(() => jy(t.payload?.timeline)), Be = N(() => {
      const W = t.asrNote ?? L.value;
      return W && W.draft_sha256 === ce("lyrics")?.upstream_sha256 ? W : null;
    }), se = (W) => y1(pe(W.kind) ?? "", W.text);
    function Z(W) {
      if (W.intent === "auto") return "auto";
      if (W.intent === "manual") return "manual";
      if (W.intent === "rebase") return "edited (merged)";
      if (He(W.kind)) return "conflict";
      const le = t.state.docs[W.kind]?.state ?? "auto", ae = xn(pe(W.kind) ?? "");
      return le === "auto" && xn(W.text) !== ae ? ae || !t.payload ? "edited" : "manual" : le;
    }
    function ne(W) {
      W.intent = "auto", W.text = pe(W.kind) ?? "";
    }
    function Xe(W) {
      W.intent = "manual";
    }
    function ht(W, le) {
      W.text = v1(W.text, le), w(W);
    }
    function vt(W) {
      W.intent = "manual";
    }
    function S(W) {
      W.intent = "rebase";
    }
    function w(W) {
      W.intent === "auto" && (W.intent = "keep");
    }
    function $() {
      Nh(t.state, t.payload, t.owned).forEach((le, ae) => Object.assign(f[ae], le)), V.value = [...t.guide ?? []], ie.value = [...t.lyricSpans ?? []], X.value = t.sourceShift ?? 0, R.text = z.value ?? "", E.value++;
    }
    const B = N(
      () => f.filter((W) => He(W.kind) && W.intent === "keep").map((W) => W.kind)
    ), _ = N(() => Gy(t.state, t.payload, f)), V = /* @__PURE__ */ G([...t.guide ?? []]);
    function he(W) {
      V.value = W;
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
    const Ce = /* @__PURE__ */ G(null), Te = N(() => f.find((W) => W.kind === "lyrics") ?? null), Fe = { title: "the Lyrics tab", blocked: null, replans: !1, own: !0 }, ze = N(() => Te.value ? Fe : t.lyricsTarget ?? null), Ke = N(() => {
      const W = t.payload?.context?.lyrics, le = Ce.value;
      return Te.value || !ze.value || ze.value.blocked || !le || !W ? null : xn(le) !== xn(W) ? le : null;
    });
    function et(W) {
      const le = Te.value;
      le ? W !== null && xn(W) !== xn(le.text) && (le.text = W, w(le)) : Ce.value = W;
    }
    function pt() {
      if (!Ke.value || !ze.value?.replans) return;
      const W = f.find((le) => le.kind === "score");
      W && W.intent === "keep" && (W.intent = "manual");
    }
    const Pt = N(
      () => Fh(_.value) !== Fh(t.state) || !Lo(V.value, t.guide ?? []) || !cl(ie.value, t.lyricSpans ?? []) || X.value !== (t.sourceShift ?? 0) || Ke.value !== null || j.value !== null
    ), at = N(() => {
      const W = t.payload?.arrangement;
      return W && W.status !== "skipped" ? W : null;
    }), yn = N(() => qy(at.value?.notes ?? [])), qn = N(() => (d.value?.findings ?? []).filter((W) => W.severity !== "info")), Lt = N(() => (d.value?.findings ?? []).filter((W) => W.severity === "info")), _t = N(() => qn.value.some((W) => W.severity === "error")), bn = N(
      () => !v.value && !_t.value && !B.value.length && !O.value && !re.value && !!d.value?.fingerprint
    ), At = N(
      () => B.value.length ? "Resolve the conflicts first." : O.value ?? re.value
    ), ls = N(() => B.value.length ? "⇄ conflict" : _t.value ? "✖ errors" : qn.value.length ? "⚠ warnings" : d.value?.waiting && !Pt.value ? "⏸ waiting for approval" : d.value ? "✓ valid" : "not run yet");
    async function In() {
      if (t.payload) {
        v.value = !0, p.value = null;
        try {
          d.value = await Ky(t.fetcher, {
            sheet_state: _.value,
            upstream: Uy(t.payload),
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
          p.value = W instanceof wp ? `${W.message}${W.hint ? ` — ${W.hint}` : ""}` : String(W);
        } finally {
          v.value = !1;
        }
      }
    }
    Ge(
      () => [...f.map((W) => W.text + W.intent), j.value ?? ""].join("\0"),
      () => {
        clearTimeout(I), I = setTimeout(In, 300);
      }
    );
    function as(W) {
      return j.value ? { text: j.value, approved: W } : null;
    }
    function Bs() {
      At.value || (pt(), D(), i(
        "apply",
        Hh(_.value, t.state.review?.approved_fingerprint ?? null),
        V.value,
        Ke.value,
        as(!1),
        !1,
        fe()
      ));
    }
    async function zt() {
      pt(), D(), await In(), bn.value && i(
        "apply",
        Hh(_.value, d.value?.fingerprint ?? null),
        V.value,
        Ke.value,
        as(!0),
        !0,
        fe()
      );
    }
    function Bi() {
      Pt.value ? m.value = !0 : i("close");
    }
    const Ze = /* @__PURE__ */ ws(S1()), Yn = /* @__PURE__ */ ws({ width: window.innerWidth, height: window.innerHeight }), bo = N(() => {
      const W = Ze.maximized ? Yn.height - 2 * wf : Ze.height;
      return Ze.maximized ? {
        width: `${Yn.width - 2 * wf}px`,
        height: `${W}px`,
        "--plenio-dialog-h": `${W}px`
      } : { width: `${Ze.width}px`, height: `${Ze.height}px`, "--plenio-dialog-h": `${W}px` };
    });
    function us() {
      Yn.width = window.innerWidth, Yn.height = window.innerHeight;
      const W = Lu({ width: Ze.width, height: Ze.height }, Yn);
      (W.width !== Ze.width || W.height !== Ze.height) && (Ze.width = W.width, Ze.height = W.height, Ya(Ze));
    }
    function mi() {
      Ze.maximized = !Ze.maximized, Ya(Ze);
    }
    function sn(W) {
      W.preventDefault(), W.stopPropagation();
      const le = { width: Ze.width, height: Ze.height };
      dl(
        W,
        ({ dx: ae, dy: Me }) => {
          const Yt = Lu(
            { width: le.width + ae, height: le.height + Me },
            { width: window.innerWidth, height: window.innerHeight }
          );
          Ze.width = Yt.width, Ze.height = Yt.height;
        },
        () => Ya(Ze)
      );
    }
    function wn(W) {
      W.key === "Escape" && !W.defaultPrevented && (W.preventDefault(), m.value ? m.value = !1 : Bi());
    }
    return kr(() => {
      window.addEventListener("keydown", wn), window.addEventListener("resize", us), t.payload && In();
      const W = ce("lyrics")?.upstream_sha256;
      !t.asrNote && W && Wy(t.fetcher, W).then((le) => L.value = le).catch(() => {
      });
    }), Li(() => {
      window.removeEventListener("keydown", wn), window.removeEventListener("resize", us), clearTimeout(I);
    }), (W, le) => (k(), M("div", {
      class: "plenio-overlay",
      onMousedown: ft(Bi, ["self"])
    }, [
      g("div", {
        class: qe(["plenio-dialog", { maximized: Ze.maximized }]),
        role: "dialog",
        "aria-modal": "true",
        "aria-label": n.title,
        style: Mi(bo.value)
      }, [
        g("header", {
          onDblclick: ft(mi, ["self"])
        }, [
          g("h2", null, F(n.title), 1),
          g("span", {
            class: qe(["status", { bad: _t.value || B.value.length }]),
            title: d.value?.status ?? ""
          }, F(ls.value), 11, hL),
          g("div", fL, [
            (k(!0), M(me, null, Ie(U.value, (ae) => (k(), M("button", {
              key: ae,
              role: "tab",
              "aria-selected": $e.value === ae,
              class: qe({ active: $e.value === ae }),
              onClick: (Me) => $e.value = ae
            }, F(c(ae)), 11, dL))), 128))
          ]),
          g("button", {
            class: "icon",
            title: Ze.maximized ? "Restore the window size (double-click the header)" : "Fill the browser window (double-click the header)",
            "aria-label": Ze.maximized ? "Restore" : "Maximize",
            "aria-pressed": Ze.maximized,
            onClick: mi
          }, F(Ze.maximized ? "❐" : "⛶"), 9, pL),
          g("button", {
            class: "icon",
            title: "Close (Esc)",
            "aria-label": "Close",
            onClick: Bi
          }, "×")
        ], 32),
        n.payload ? ee("", !0) : (k(), M("p", gL, [...le[4] || (le[4] = [
          be(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          g("em", null, "Make manual", -1),
          be(". ", -1)
        ])])),
        m.value ? (k(), M("div", mL, [
          le[5] || (le[5] = be(" You have changes that are not applied yet. ", -1)),
          g("button", {
            class: "primary",
            disabled: !!At.value,
            title: At.value ?? "Save your documents into the node",
            onClick: Bs
          }, " Apply ", 8, vL),
          g("button", {
            onClick: le[0] || (le[0] = (ae) => i("close"))
          }, "Discard"),
          g("button", {
            onClick: le[1] || (le[1] = (ae) => m.value = !1)
          }, "Keep editing")
        ])) : ee("", !0),
        g("div", yL, [
          (k(!0), M(me, null, Ie(Oe($e.value), (ae) => (k(), M("section", {
            key: ae.kind + E.value,
            class: qe(["doc", { wide: ae.kind === "score" }])
          }, [
            g("div", bL, [
              g("h3", null, F(u.value[ae.kind]), 1),
              g("span", {
                class: "badge",
                "data-state": Z(ae)
              }, F(Z(ae)), 9, wL),
              le[6] || (le[6] = g("span", { class: "spacer" }, null, -1)),
              g("button", {
                disabled: pe(ae.kind) === null,
                title: "Discard your edit and use the draft",
                onClick: (Me) => ne(ae)
              }, " Use draft ", 8, xL),
              ae.kind === "lyrics" ? (k(), M("button", {
                key: 0,
                disabled: ae.intent === "manual",
                title: "Keep exactly these words: the writer is not consulted any more (your lyrics reach YuE2 unchanged)",
                onClick: (Me) => Xe(ae)
              }, " Use my own lyrics ", 8, kL)) : (k(), M("button", {
                key: 1,
                title: "Always use your text; the draft is no longer computed",
                onClick: (Me) => Xe(ae)
              }, " Make manual ", 8, SL))
            ]),
            He(ae.kind) && ae.intent === "keep" ? (k(), M("div", CL, [
              be(" The draft changed after you edited this document (" + F(ce(ae.kind)?.reason) + "). ", 1),
              g("button", {
                onClick: (Me) => vt(ae)
              }, "Keep my edit (manual)", 8, ML),
              g("button", {
                onClick: (Me) => ne(ae)
              }, "Use the new draft", 8, AL),
              g("button", {
                onClick: (Me) => S(ae)
              }, "Merge by hand", 8, TL)
            ])) : ee("", !0),
            ae.kind === "score" ? (k(), kn(bp, {
              key: 1,
              doc: ae,
              fetcher: n.fetcher,
              payload: n.payload,
              readonly: !1,
              "layout-default": n.layout ?? null,
              lyrics: J.value,
              title: ct.value,
              guide: V.value,
              "lyric-spans": ie.value,
              "source-shift": X.value,
              "lyrics-target": ze.value,
              "lyrics-pending": Te.value ? null : Ce.value,
              onEdited: (Me) => w(ae),
              onGuideChange: he,
              onLyricSpansChange: oe,
              onSourceShiftChange: Ae,
              onLyricsChange: et,
              onGate: le[2] || (le[2] = (Me, Yt) => b.value = { text: Me, reason: Yt })
            }, null, 8, ["doc", "fetcher", "payload", "layout-default", "lyrics", "title", "guide", "lyric-spans", "source-shift", "lyrics-target", "lyrics-pending", "onEdited"])) : We((k(), M("textarea", {
              key: 2,
              "onUpdate:modelValue": (Me) => ae.text = Me,
              rows: h(ae.kind),
              spellcheck: "false",
              "aria-label": u.value[ae.kind],
              onInput: (Me) => w(ae)
            }, null, 40, $L)), [
              [Nt, ae.text]
            ]),
            ae.kind === "lyrics" ? (k(), M("p", DL, [
              le[7] || (le[7] = g("span", null, "Section tags (the model sings section by section):", -1)),
              (k(!0), M(me, null, Ie(H(m1), (Me) => (k(), M("button", {
                key: Me,
                title: `Add [${Me}]`,
                onClick: (Yt) => ht(ae, Me)
              }, " [" + F(Me) + "] ", 9, OL))), 128)),
              ae.intent === "manual" ? (k(), M("span", LL, "the writer is not consulted - these are your lyrics")) : ee("", !0)
            ])) : ee("", !0),
            ae.kind === "lyrics" && Be.value ? (k(), M("p", EL, [
              g("span", null, "Transcribed (" + F(Be.value.language) + ").", 1),
              Be.value.low_confidence.length ? (k(), M("span", IL, [
                le[8] || (le[8] = be(" Check these unsure words: ", -1)),
                (k(!0), M(me, null, Ie(Be.value.low_confidence, (Me, Yt) => (k(), M("mark", {
                  key: "low-" + Yt
                }, F(Me), 1))), 128))
              ])) : ee("", !0),
              Be.value.left_out.length ? (k(), M("span", BL, [
                le[9] || (le[9] = be("Left out as not sung: ", -1)),
                g("s", null, F(Be.value.left_out.join(" ")), 1)
              ])) : ee("", !0)
            ])) : ee("", !0),
            pe(ae.kind) !== null && H(xn)(pe(ae.kind) ?? "") !== H(xn)(ae.text) ? (k(), M("details", RL, [
              g("summary", null, "Changes against the draft (" + F(H(b1)(se(ae))) + " words)", 1),
              ae.kind !== "score" ? (k(), M("p", PL, [
                (k(!0), M(me, null, Ie(se(ae), (Me, Yt) => (k(), M(me, { key: Yt }, [
                  Me.text === H(rr) ? (k(), M("br", _L)) : Me.op === "added" ? (k(), M("ins", NL, F(Me.text + " "), 1)) : Me.op === "removed" ? (k(), M("del", VL, F(Me.text + " "), 1)) : (k(), M("span", HL, F(Me.text + " "), 1))
                ], 64))), 128))
              ])) : ee("", !0),
              g("pre", null, F(pe(ae.kind)), 1)
            ])) : ee("", !0),
            ae.kind === "lyrics" ? (k(), kn($g, {
              key: 6,
              lyrics: ae.text,
              abc: Le.value,
              fetcher: n.fetcher,
              engine: n.payload?.engine ?? null,
              instrumental: n.payload?.instrumental ?? !1
            }, null, 8, ["lyrics", "abc", "fetcher", "engine", "instrumental"])) : ee("", !0)
          ], 2))), 128)),
          $e.value === "score" && !Re.value && z.value ? (k(), M("section", FL, [
            g("div", zL, [
              le[10] || (le[10] = g("h3", null, "Score (ABC)", -1)),
              Y.value ? (k(), M("span", {
                key: 0,
                class: "badge",
                title: `The score belongs to ${n.scoreTarget?.title}`
              }, " from " + F(n.scoreTarget?.title) + F(j.value ? " · changed" : ""), 9, WL)) : (k(), M("span", KL, "from the other sheet (read-only)"))
            ]),
            Y.value ? (k(), M("p", UL, [
              le[11] || (le[11] = be(" Changes to the score go into ", -1)),
              g("strong", null, F(n.scoreTarget?.title), 1),
              le[12] || (le[12] = be(" on Apply, and the lyrics are kept as you see them here (manual), so the two stay a pair. ", -1)),
              le[13] || (le[13] = g("strong", null, "Approve", -1)),
              le[14] || (le[14] = be(" approves the changed score in that sheet too; with Apply it asks for approval again on the next run. ", -1))
            ])) : n.scoreTarget?.blocked ? (k(), M("p", jL, F(n.scoreTarget.blocked), 1)) : ee("", !0),
            Ht(bp, {
              doc: R,
              fetcher: n.fetcher,
              payload: n.payload,
              readonly: !Y.value,
              "layout-default": n.layout ?? null,
              lyrics: J.value,
              "lyrics-target": Te.value ? ze.value : null,
              "lyric-spans": ie.value,
              "source-shift": X.value,
              onLyricSpansChange: oe,
              onSourceShiftChange: Ae,
              onLyricsChange: et,
              onGate: le[3] || (le[3] = (ae, Me) => K.value = { text: ae, reason: Me })
            }, null, 8, ["doc", "fetcher", "payload", "readonly", "layout-default", "lyrics", "lyrics-target", "lyric-spans", "source-shift"])
          ])) : ee("", !0),
          $e.value === "lyrics" && ye.value.length ? (k(), M("section", GL, [
            le[16] || (le[16] = g("div", { class: "doc-head" }, [
              g("h3", null, "Sections of the source"),
              g("span", { class: "badge" }, "from Transcribe Score")
            ], -1)),
            g("table", null, [
              le[15] || (le[15] = g("thead", null, [
                g("tr", null, [
                  g("th", null, "Section"),
                  g("th", null, "Bars"),
                  g("th", null, "From"),
                  g("th", null, "To")
                ])
              ], -1)),
              g("tbody", null, [
                (k(!0), M(me, null, Ie(ye.value, (ae, Me) => (k(), M("tr", { key: Me }, [
                  g("td", null, F(ae.label), 1),
                  g("td", null, F(ae.bars), 1),
                  g("td", null, F(ae.start), 1),
                  g("td", null, F(ae.end), 1)
                ]))), 128))
              ])
            ])
          ])) : ee("", !0),
          (k(!0), M(me, null, Ie(n.payload?.context ?? {}, (ae, Me) => (k(), M(me, {
            key: "context-" + Me
          }, [
            Me !== "score" && s[Me] === $e.value ? (k(), M("section", qL, [
              g("div", YL, [
                g("h3", null, F(u.value[Me] ?? Me), 1),
                le[17] || (le[17] = g("span", { class: "badge" }, "from the other sheet (read-only)", -1))
              ]),
              g("pre", null, F(ae), 1)
            ])) : ee("", !0)
          ], 64))), 128))
        ]),
        g("section", XL, [
          at.value ? (k(), M("div", {
            key: 0,
            class: "arrangement",
            "data-status": at.value.status
          }, [
            at.value.status === "fallback" ? (k(), M("p", ZL, [
              le[18] || (le[18] = g("strong", null, "Arrangement not applied", -1)),
              g("span", {
                class: "experimental",
                title: H(Ra)
              }, "experimental", 8, QL),
              be(" - " + F(H(Vh)(at.value)) + ": " + F(at.value.summary.replace(/^not applied: /, "")), 1)
            ])) : (k(), M("details", eE, [
              g("summary", null, [
                le[19] || (le[19] = g("strong", null, "Arrangement", -1)),
                g("span", {
                  class: "experimental",
                  title: H(Ra)
                }, "experimental", 8, tE),
                be(" " + F(H(Vh)(at.value)) + ": " + F(at.value.summary), 1)
              ]),
              g("p", nE, F(H(Ra)), 1),
              at.value.idea ? (k(), M("p", iE, F(at.value.idea), 1)) : ee("", !0),
              g("ul", null, [
                (k(!0), M(me, null, Ie(at.value.sections ?? [], (ae) => (k(), M("li", {
                  key: ae.index
                }, [
                  g("strong", null, F(ae.index) + " " + F(ae.label), 1),
                  g("span", sE, "bars " + F(ae.bars), 1),
                  be(" " + F(ae.applied.length ? ae.applied.join("; ") : "unchanged") + " ", 1),
                  ae.kept.length ? (k(), M("span", oE, " - kept: " + F(ae.kept.join("; ")), 1)) : ee("", !0)
                ]))), 128)),
                (k(!0), M(me, null, Ie(yn.value, (ae, Me) => (k(), M("li", {
                  key: "note" + Me,
                  "data-severity": "info"
                }, F(ae), 1))), 128))
              ])
            ]))
          ], 8, JL)) : ee("", !0),
          p.value ? (k(), M("p", rE, F(p.value), 1)) : ee("", !0),
          B.value.length ? (k(), M("p", lE, " Resolve the conflict in: " + F(B.value.join(", ")) + ". ", 1)) : ee("", !0),
          O.value ? (k(), M("p", aE, "Score: " + F(O.value), 1)) : re.value ? (k(), M("p", uE, "Score: " + F(re.value), 1)) : ee("", !0),
          g("ul", null, [
            (k(!0), M(me, null, Ie(qn.value, (ae, Me) => (k(), M("li", {
              key: Me,
              "data-severity": ae.severity
            }, [
              g("strong", null, F(ae.severity), 1),
              le[20] || (le[20] = be()),
              g("span", hE, F(ae.where), 1),
              be(" " + F(ae.message), 1)
            ], 8, cE))), 128)),
            (k(!0), M(me, null, Ie(Lt.value, (ae, Me) => (k(), M("li", {
              key: "i" + Me,
              "data-severity": "info"
            }, F(ae.message), 1))), 128))
          ])
        ]),
        g("footer", null, [
          n.owned.includes("score") && d.value ? (k(), M("span", fE, " render: " + F(d.value.planning_mode) + ", ceiling " + F(Math.round(d.value.score_seconds)) + " s ", 1)) : ee("", !0),
          le[21] || (le[21] = g("span", { class: "spacer" }, null, -1)),
          g("button", {
            disabled: !Pt.value,
            title: "Discard every change made in this editor",
            onClick: $
          }, "Revert", 8, dE),
          g("button", { onClick: Bi }, "Close"),
          g("button", {
            class: "primary",
            disabled: !!At.value,
            title: At.value ?? "Save your documents into the node",
            onClick: Bs
          }, " Apply ", 8, pE),
          n.review === "stop for review" ? (k(), M("button", {
            key: 1,
            class: "primary",
            disabled: !bn.value,
            title: O.value ?? "Release exactly these documents for the next run",
            onClick: zt
          }, " Approve ", 8, gE)) : ee("", !0)
        ]),
        Ze.maximized ? ee("", !0) : (k(), M("div", {
          key: 2,
          class: "resize-handle",
          role: "separator",
          "aria-label": "Resize the window",
          "aria-valuenow": Ze.width,
          title: `Resize (${Ze.width} × ${Ze.height})`,
          onPointerdown: sn
        }, null, 40, mE))
      ], 14, cL)
    ], 32));
  }
});
function yE() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const n = document.createElement("style");
  n.id = "plenio-dialog-styles", n.textContent = g1, document.head.append(n);
}
function CE(n) {
  yE();
  const e = document.createElement("div");
  document.body.append(e);
  const t = () => {
    i.unmount(), e.remove();
  }, i = f1(vE, {
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
  CE as openSheetDialog
};
