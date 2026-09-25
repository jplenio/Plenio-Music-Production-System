import { s as Lr, u as Hr, w as is, n as jr, a as Nt } from "./main-2hptl8Ty.mjs";
// @__NO_SIDE_EFFECTS__
function Nn(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const W = {}, Xe = [], Ze = () => {
}, $s = () => !1, Qt = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), en = (e) => e.startsWith("onUpdate:"), ye = Object.assign, Ds = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, kr = Object.prototype.hasOwnProperty, V = (e, t) => kr.call(e, t), P = Array.isArray, ke = (e) => Mt(e) === "[object Map]", qt = (e) => Mt(e) === "[object Set]", os = (e) => Mt(e) === "[object Date]", j = (e) => typeof e == "function", X = (e) => typeof e == "string", Ee = (e) => typeof e == "symbol", q = (e) => e !== null && typeof e == "object", Ns = (e) => (q(e) || j(e)) && j(e.then) && j(e.catch), Ls = Object.prototype.toString, Mt = (e) => Ls.call(e), Vr = (e) => Mt(e).slice(8, -1), Hs = (e) => Mt(e) === "[object Object]", Ln = (e) => X(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, mt = /* @__PURE__ */ Nn(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), tn = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((n) => t[n] || (t[n] = e(n)));
}, Kr = /-\w/g, ge = tn(
  (e) => e.replace(Kr, (t) => t.slice(1).toUpperCase())
), Ur = /\B([A-Z])/g, tt = tn(
  (e) => e.replace(Ur, "-$1").toLowerCase()
), js = tn((e) => e.charAt(0).toUpperCase() + e.slice(1)), hn = tn(
  (e) => e ? `on${js(e)}` : ""
), Ae = (e, t) => !Object.is(e, t), Bt = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, ks = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, Hn = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let ls;
const nn = () => ls || (ls = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function jn(e) {
  if (P(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = X(s) ? zr(s) : jn(s);
      if (r)
        for (const i in r)
          t[i] = r[i];
    }
    return t;
  } else if (X(e) || q(e))
    return e;
}
const Br = /;(?![^(]*\))/g, Wr = /:([^]+)/, qr = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function zr(e) {
  const t = {};
  return e.replace(qr, (n) => n.startsWith("/*") ? "" : n).split(Br).forEach((n) => {
    if (n) {
      const s = n.split(Wr);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function wt(e) {
  let t = "";
  if (X(e))
    t = e;
  else if (P(e))
    for (let n = 0; n < e.length; n++) {
      const s = wt(e[n]);
      s && (t += s + " ");
    }
  else if (q(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const Jr = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Gr = /* @__PURE__ */ Nn(Jr);
function Vs(e) {
  return !!e || e === "";
}
function Yr(e, t, n) {
  if (e.length !== t.length) return !1;
  let s = !0;
  for (let r = 0; s && r < e.length; r++)
    s = sn(e[r], t[r], n);
  return s;
}
function fs(e, t, n) {
  if (e.size !== t.size) return !1;
  const s = Array.from(t), r = new Uint8Array(s.length);
  for (const i of e) {
    let o = -1;
    for (let l = 0; l < s.length; l++)
      if (!r[l] && sn(i, s[l], n)) {
        o = l;
        break;
      }
    if (o < 0) return !1;
    r[o] = 1;
  }
  return !0;
}
function Xr(e, t, n) {
  let s = ke(e), r = ke(t);
  if (s || r || (s = qt(e), r = qt(t), s || r))
    return s && r ? fs(e, t, n) : !1;
  const i = Object.keys(e).length, o = Object.keys(t).length;
  if (i !== o)
    return !1;
  for (const l in e) {
    const c = e.hasOwnProperty(l), d = t.hasOwnProperty(l);
    if (c && !d || !c && d || !sn(e[l], t[l], n))
      return !1;
  }
  return String(e) === String(t);
}
function cs(e, t, n, s) {
  n || (n = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
  const [r, i] = n;
  if (r.has(e) || i.has(t))
    return r.get(e) === t && i.get(t) === e;
  r.set(e, t), i.set(t, e);
  const o = s(e, t, n);
  return r.delete(e), i.delete(t), o;
}
function sn(e, t, n) {
  if (e === t) return !0;
  let s = os(e), r = os(t);
  return s || r ? s && r ? e.getTime() === t.getTime() : !1 : (s = Ee(e), r = Ee(t), s || r ? e === t : (s = P(e), r = P(t), s || r ? s && r ? cs(e, t, n, Yr) : !1 : (s = q(e), r = q(t), s || r ? !s || !r ? !1 : cs(e, t, n, Xr) : String(e) === String(t))));
}
const Ks = (e) => !!(e && e.__v_isRef === !0), ee = (e) => X(e) ? e : e == null ? "" : P(e) || q(e) && (e.toString === Ls || !j(e.toString)) ? Ks(e) ? ee(e.value) : JSON.stringify(e, Us, 2) : String(e), Us = (e, t) => Ks(t) ? Us(e, t.value) : ke(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], i) => (n[gn(s, i) + " =>"] = r, n),
    {}
  )
} : qt(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => gn(n))
} : Ee(t) ? gn(t) : q(t) && !P(t) && !Hs(t) ? String(t) : t, gn = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Ee(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
let ne;
class Zr {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && ne && (ne.active ? (this.parent = ne, this.index = (ne.scopes || (ne.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes) {
        const s = this.scopes.slice();
        for (t = 0, n = s.length; t < n; t++)
          s[t].pause();
      }
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes) {
        const r = this.scopes.slice();
        for (t = 0, n = r.length; t < n; t++)
          r[t].resume();
      }
      const s = this.effects.slice();
      for (t = 0, n = s.length; t < n; t++)
        s[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = ne;
      try {
        return ne = this, t();
      } finally {
        ne = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = ne, ne = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (ne === this)
        ne = this.prevScope;
      else {
        let t = ne;
        for (; t; ) {
          if (t.prevScope === this) {
            t.prevScope = this.prevScope;
            break;
          }
          t = t.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, s;
      for (n = 0, s = this.effects.length; n < s; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, s = this.cleanups.length; n < s; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        const r = this.scopes.slice();
        for (n = 0, s = r.length; n < s; n++)
          r[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Qr() {
  return ne;
}
let U;
const mn = /* @__PURE__ */ new WeakSet();
class Bs {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, ne && (ne.active ? ne.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, mn.has(this) && (mn.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || qs(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, us(this), zs(this);
    const t = U, n = me;
    U = this, me = !0;
    try {
      return this.fn();
    } finally {
      Js(this), U = t, me = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Kn(t);
      this.deps = this.depsTail = void 0, us(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? mn.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    En(this) && this.run();
  }
  get dirty() {
    return En(this);
  }
}
let Ws = 0, yt, _t;
function qs(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = _t, _t = e;
    return;
  }
  e.next = yt, yt = e;
}
function kn() {
  Ws++;
}
function Vn() {
  if (--Ws > 0)
    return;
  if (_t) {
    let t = _t;
    for (_t = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; yt; ) {
    let t = yt;
    for (yt = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (s) {
          e || (e = s);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function zs(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Js(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Kn(s), ei(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function En(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Gs(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Gs(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === St) || (e.globalVersion = St, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !En(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = U, s = me;
  U = e, me = !0;
  try {
    zs(e);
    const r = e.fn(e._value);
    (t.version === 0 || Ae(r, e._value)) && (e.flags |= 128, e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    U = n, me = s, Js(e), e.flags &= -3;
  }
}
function Kn(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let i = n.computed.deps; i; i = i.nextDep)
      Kn(i, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function ei(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let me = !0;
const Ys = [];
function Ke() {
  Ys.push(me), me = !1;
}
function Ue() {
  const e = Ys.pop();
  me = e === void 0 ? !0 : e;
}
function us(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = U;
    U = void 0;
    try {
      t();
    } finally {
      U = n;
    }
  }
}
let St = 0;
class ti {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Un {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!U || !me || U === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== U)
      n = this.activeLink = new ti(U, this), U.deps ? (n.prevDep = U.depsTail, U.depsTail.nextDep = n, U.depsTail = n) : U.deps = U.depsTail = n, Xs(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = U.depsTail, n.nextDep = void 0, U.depsTail.nextDep = n, U.depsTail = n, U.deps === n && (U.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, St++, this.notify(t);
  }
  notify(t) {
    kn();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Vn();
    }
  }
}
function Xs(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Xs(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const On = /* @__PURE__ */ new WeakMap(), Qe = /* @__PURE__ */ Symbol(
  ""
), Mn = /* @__PURE__ */ Symbol(
  ""
), Ct = /* @__PURE__ */ Symbol(
  ""
);
function re(e, t, n) {
  if (me && U) {
    let s = On.get(e);
    s || On.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Un()), r.map = s, r.key = n), r.track();
  }
}
function De(e, t, n, s, r, i) {
  const o = On.get(e);
  if (!o) {
    St++;
    return;
  }
  const l = (c) => {
    c && c.trigger();
  };
  if (kn(), t === "clear")
    o.forEach(l);
  else {
    const c = P(e), d = c && Ln(n);
    if (c && n === "length") {
      const a = Number(s);
      o.forEach((g, S) => {
        (S === "length" || S === Ct || !Ee(S) && S >= a) && l(g);
      });
    } else
      switch ((n !== void 0 || o.has(void 0)) && l(o.get(n)), d && l(o.get(Ct)), t) {
        case "add":
          c ? d && l(o.get("length")) : (l(o.get(Qe)), ke(e) && l(o.get(Mn)));
          break;
        case "delete":
          c || (l(o.get(Qe)), ke(e) && l(o.get(Mn)));
          break;
        case "set":
          ke(e) && l(o.get(Qe));
          break;
      }
  }
  Vn();
}
function nt(e) {
  const t = /* @__PURE__ */ N(e);
  return t === e || (re(t, "iterate", Ct), /* @__PURE__ */ de(e)) ? t : /* @__PURE__ */ Oe(e) ? /* @__PURE__ */ Ve(e) ? t.map((n) => Be(pe(n))) : t.map(Be) : t.map(pe);
}
function rn(e) {
  return re(e = /* @__PURE__ */ N(e), "iterate", Ct), e;
}
function Ce(e, t) {
  return /* @__PURE__ */ Oe(e) ? Be(/* @__PURE__ */ Ve(e) ? pe(t) : t) : pe(t);
}
const ni = {
  __proto__: null,
  [Symbol.iterator]() {
    return yn(this, Symbol.iterator, (e) => Ce(this, e));
  },
  concat(...e) {
    return nt(this).concat(
      ...e.map((t) => P(t) ? nt(t) : t)
    );
  },
  entries() {
    return yn(this, "entries", (e) => (e[1] = Ce(this, e[1]), e));
  },
  every(e, t) {
    return Pe(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Pe(
      this,
      "filter",
      e,
      t,
      (n) => n.map((s) => Ce(this, s)),
      arguments
    );
  },
  find(e, t) {
    return Pe(
      this,
      "find",
      e,
      t,
      (n) => Ce(this, n),
      arguments
    );
  },
  findIndex(e, t) {
    return Pe(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Pe(
      this,
      "findLast",
      e,
      t,
      (n) => Ce(this, n),
      arguments
    );
  },
  findLastIndex(e, t) {
    return Pe(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Pe(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return _n(this, "includes", e);
  },
  indexOf(...e) {
    return _n(this, "indexOf", e);
  },
  join(e) {
    return nt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return _n(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Pe(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return pt(this, "pop");
  },
  push(...e) {
    return pt(this, "push", e);
  },
  reduce(e, ...t) {
    return as(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return as(this, "reduceRight", e, t);
  },
  shift() {
    return pt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Pe(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return pt(this, "splice", e);
  },
  toReversed() {
    return nt(this).toReversed();
  },
  toSorted(e) {
    return nt(this).toSorted(e);
  },
  toSpliced(...e) {
    return nt(this).toSpliced(...e);
  },
  unshift(...e) {
    return pt(this, "unshift", e);
  },
  values() {
    return yn(this, "values", (e) => Ce(this, e));
  }
};
function yn(e, t, n) {
  const s = rn(e), r = s[t]();
  return s !== e && !/* @__PURE__ */ de(e) && (r._next = r.next, r.next = () => {
    const i = r._next();
    return i.done || (i.value = n(i.value)), i;
  }), r;
}
const si = Array.prototype;
function Pe(e, t, n, s, r, i) {
  const o = rn(e), l = o !== e && !/* @__PURE__ */ de(e), c = o[t];
  if (c !== si[t]) {
    const g = c.apply(e, i);
    return l ? pe(g) : g;
  }
  let d = n;
  o !== e && (l ? d = function(g, S) {
    return n.call(this, Ce(e, g), S, e);
  } : n.length > 2 && (d = function(g, S) {
    return n.call(this, g, S, e);
  }));
  const a = c.call(o, d, s);
  return l && r ? r(a) : a;
}
function as(e, t, n, s) {
  const r = rn(e), i = r !== e && !/* @__PURE__ */ de(e);
  let o = n, l = !1;
  r !== e && (i ? (l = s.length === 0, o = function(d, a, g) {
    return l && (l = !1, d = Ce(e, d)), n.call(this, d, Ce(e, a), g, e);
  }) : n.length > 3 && (o = function(d, a, g) {
    return n.call(this, d, a, g, e);
  }));
  const c = r[t](o, ...s);
  return l ? Ce(e, c) : c;
}
function _n(e, t, n) {
  const s = /* @__PURE__ */ N(e);
  re(s, "iterate", Ct);
  const r = s[t](...n);
  return (r === -1 || r === !1) && /* @__PURE__ */ zn(n[0]) ? (n[0] = /* @__PURE__ */ N(n[0]), s[t](...n)) : r;
}
function pt(e, t, n = []) {
  Ke(), kn();
  const s = (/* @__PURE__ */ N(e))[t].apply(e, n);
  return Vn(), Ue(), s;
}
const ri = /* @__PURE__ */ Nn("__proto__,__v_isRef,__isVue"), Zs = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Ee)
);
function ii(e) {
  Ee(e) || (e = String(e));
  const t = /* @__PURE__ */ N(this);
  return re(t, "has", e), t.hasOwnProperty(e);
}
class Qs {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, s) {
    if (n === "__v_skip") return t.__v_skip;
    const r = this._isReadonly, i = this._isShallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return i;
    if (n === "__v_raw")
      return s === (r ? i ? gi : sr : i ? nr : tr).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const o = P(t);
    if (!r) {
      let c;
      if (o && (c = ni[n]))
        return c;
      if (n === "hasOwnProperty")
        return ii;
    }
    const l = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ oe(t) ? t : s
    );
    if ((Ee(n) ? Zs.has(n) : ri(n)) || (r || re(t, "get", n), i))
      return l;
    if (/* @__PURE__ */ oe(l)) {
      const c = o && Ln(n) ? l : l.value;
      return r && q(c) ? /* @__PURE__ */ Rn(c) : c;
    }
    return q(l) ? r ? /* @__PURE__ */ Rn(l) : /* @__PURE__ */ Wn(l) : l;
  }
}
class er extends Qs {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let i = t[n];
    const o = P(t) && Ln(n);
    if (!this._isShallow) {
      const d = /* @__PURE__ */ Oe(i);
      if (!/* @__PURE__ */ de(s) && !/* @__PURE__ */ Oe(s) && (i = /* @__PURE__ */ N(i), s = /* @__PURE__ */ N(s)), !o && /* @__PURE__ */ oe(i) && !/* @__PURE__ */ oe(s))
        return d || (i.value = s), !0;
    }
    const l = o ? Number(n) < t.length : V(t, n), c = Reflect.set(
      t,
      n,
      s,
      /* @__PURE__ */ oe(t) ? t : r
    );
    return t === /* @__PURE__ */ N(r) && c && (l ? Ae(s, i) && De(t, "set", n, s) : De(t, "add", n, s)), c;
  }
  deleteProperty(t, n) {
    const s = V(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && De(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!Ee(n) || !Zs.has(n)) && re(t, "has", n), s;
  }
  ownKeys(t) {
    return re(
      t,
      "iterate",
      P(t) ? "length" : Qe
    ), Reflect.ownKeys(t);
  }
}
class oi extends Qs {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return !0;
  }
  deleteProperty(t, n) {
    return !0;
  }
}
const li = /* @__PURE__ */ new er(), fi = /* @__PURE__ */ new oi(), ci = /* @__PURE__ */ new er(!0);
const In = (e) => e, Lt = (e) => Reflect.getPrototypeOf(e);
function ui(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, i = /* @__PURE__ */ N(r), o = ke(i), l = e === "entries" || e === Symbol.iterator && o, c = e === "keys" && o, d = r[e](...s), a = n ? In : t ? Be : pe;
    return !t && re(
      i,
      "iterate",
      c ? Mn : Qe
    ), ye(
      // inheriting all iterator properties
      Object.create(d),
      {
        // iterator protocol
        next() {
          const { value: g, done: S } = d.next();
          return S ? { value: g, done: S } : {
            value: l ? [a(g[0]), a(g[1])] : a(g),
            done: S
          };
        }
      }
    );
  };
}
function Ht(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function ai(e, t) {
  const n = {
    get(r) {
      const i = this.__v_raw, o = /* @__PURE__ */ N(i), l = /* @__PURE__ */ N(r);
      e || (Ae(r, l) && re(o, "get", r), re(o, "get", l));
      const { has: c } = Lt(o), d = t ? In : e ? Be : pe;
      if (c.call(o, r))
        return d(i.get(r));
      if (c.call(o, l))
        return d(i.get(l));
      i !== o && i.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && re(/* @__PURE__ */ N(r), "iterate", Qe), r.size;
    },
    has(r) {
      const i = this.__v_raw, o = /* @__PURE__ */ N(i), l = /* @__PURE__ */ N(r);
      return e || (Ae(r, l) && re(o, "has", r), re(o, "has", l)), r === l ? i.has(r) : i.has(r) || i.has(l);
    },
    forEach(r, i) {
      const o = this, l = o.__v_raw, c = /* @__PURE__ */ N(l), d = t ? In : e ? Be : pe;
      return !e && re(c, "iterate", Qe), l.forEach((a, g) => r.call(i, d(a), d(g), o));
    }
  };
  return ye(
    n,
    e ? {
      add: Ht("add"),
      set: Ht("set"),
      delete: Ht("delete"),
      clear: Ht("clear")
    } : {
      add(r) {
        const i = /* @__PURE__ */ N(this), o = Lt(i), l = /* @__PURE__ */ N(r), c = !t && !/* @__PURE__ */ de(r) && !/* @__PURE__ */ Oe(r) ? l : r;
        return o.has.call(i, c) || Ae(r, c) && o.has.call(i, r) || Ae(l, c) && o.has.call(i, l) || (i.add(c), De(i, "add", c, c)), this;
      },
      set(r, i) {
        !t && !/* @__PURE__ */ de(i) && !/* @__PURE__ */ Oe(i) && (i = /* @__PURE__ */ N(i));
        const o = /* @__PURE__ */ N(this), { has: l, get: c } = Lt(o);
        let d = l.call(o, r);
        d || (r = /* @__PURE__ */ N(r), d = l.call(o, r));
        const a = c.call(o, r);
        return o.set(r, i), d ? Ae(i, a) && De(o, "set", r, i) : De(o, "add", r, i), this;
      },
      delete(r) {
        const i = /* @__PURE__ */ N(this), { has: o, get: l } = Lt(i);
        let c = o.call(i, r);
        c || (r = /* @__PURE__ */ N(r), c = o.call(i, r)), l && l.call(i, r);
        const d = i.delete(r);
        return c && De(i, "delete", r, void 0), d;
      },
      clear() {
        const r = /* @__PURE__ */ N(this), i = r.size !== 0, o = r.clear();
        return i && De(
          r,
          "clear",
          void 0,
          void 0
        ), o;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    n[r] = ui(r, e, t);
  }), n;
}
function Bn(e, t) {
  const n = ai(e, t);
  return (s, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    V(n, r) && r in s ? n : s,
    r,
    i
  );
}
const di = {
  get: /* @__PURE__ */ Bn(!1, !1)
}, pi = {
  get: /* @__PURE__ */ Bn(!1, !0)
}, hi = {
  get: /* @__PURE__ */ Bn(!0, !1)
};
const tr = /* @__PURE__ */ new WeakMap(), nr = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), gi = /* @__PURE__ */ new WeakMap();
function mi(e) {
  switch (e) {
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
function Wn(e) {
  return /* @__PURE__ */ Oe(e) ? e : qn(
    e,
    !1,
    li,
    di,
    tr
  );
}
// @__NO_SIDE_EFFECTS__
function yi(e) {
  return qn(
    e,
    !1,
    ci,
    pi,
    nr
  );
}
// @__NO_SIDE_EFFECTS__
function Rn(e) {
  return qn(
    e,
    !0,
    fi,
    hi,
    sr
  );
}
function qn(e, t, n, s, r) {
  if (!q(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e))
    return e;
  const i = r.get(e);
  if (i)
    return i;
  const o = mi(Vr(e));
  if (o === 0)
    return e;
  const l = new Proxy(
    e,
    o === 2 ? s : n
  );
  return r.set(e, l), l;
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return /* @__PURE__ */ Oe(e) ? /* @__PURE__ */ Ve(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function de(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function zn(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function N(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ N(t) : e;
}
function _i(e) {
  return !V(e, "__v_skip") && Object.isExtensible(e) && ks(e, "__v_skip", !0), e;
}
const pe = (e) => q(e) ? /* @__PURE__ */ Wn(e) : e, Be = (e) => q(e) ? /* @__PURE__ */ Rn(e) : e;
// @__NO_SIDE_EFFECTS__
function oe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function vn(e) {
  return vi(e, !1);
}
function vi(e, t) {
  return /* @__PURE__ */ oe(e) ? e : new bi(e, t);
}
class bi {
  constructor(t, n) {
    this.dep = new Un(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : /* @__PURE__ */ N(t), this._value = n ? t : pe(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || /* @__PURE__ */ de(t) || /* @__PURE__ */ Oe(t);
    t = s ? t : /* @__PURE__ */ N(t), Ae(t, n) && (this._rawValue = t, this._value = s ? t : pe(t), this.dep.trigger());
  }
}
function Pn(e) {
  return /* @__PURE__ */ oe(e) ? e.value : e;
}
const xi = {
  get: (e, t, n) => t === "__v_raw" ? e : Pn(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return /* @__PURE__ */ oe(r) && !/* @__PURE__ */ oe(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function rr(e) {
  return /* @__PURE__ */ Ve(e) ? e : new Proxy(e, xi);
}
class wi {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Un(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = St - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    U !== this)
      return qs(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Gs(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
// @__NO_SIDE_EFFECTS__
function Si(e, t, n = !1) {
  let s, r;
  return j(e) ? s = e : (s = e.get, r = e.set), new wi(s, r, n);
}
const jt = {}, zt = /* @__PURE__ */ new WeakMap();
let Ye;
function Ci(e, t = !1, n = Ye) {
  if (n) {
    let s = zt.get(n);
    s || zt.set(n, s = []), s.push(e);
  }
}
function Ti(e, t, n = W) {
  const { immediate: s, deep: r, once: i, scheduler: o, augmentJob: l, call: c } = n, d = (A) => r ? A : /* @__PURE__ */ de(A) || r === !1 || r === 0 ? Ne(A, 1) : Ne(A);
  let a, g, S, C, L = !1, I = !1;
  if (/* @__PURE__ */ oe(e) ? (g = () => e.value, L = /* @__PURE__ */ de(e)) : /* @__PURE__ */ Ve(e) ? (g = () => d(e), L = !0) : P(e) ? (I = !0, L = e.some((A) => /* @__PURE__ */ Ve(A) || /* @__PURE__ */ de(A)), g = () => e.map((A) => {
    if (/* @__PURE__ */ oe(A))
      return A.value;
    if (/* @__PURE__ */ Ve(A))
      return d(A);
    if (j(A))
      return c ? c(A, 2) : A();
  })) : j(e) ? t ? g = c ? () => c(e, 2) : e : g = () => {
    if (S) {
      Ke();
      try {
        S();
      } finally {
        Ue();
      }
    }
    const A = Ye;
    Ye = a;
    try {
      return c ? c(e, 3, [C]) : e(C);
    } finally {
      Ye = A;
    }
  } : g = Ze, t && r) {
    const A = g, G = r === !0 ? 1 / 0 : r;
    g = () => Ne(A(), G);
  }
  const J = Qr(), B = () => {
    a.stop(), J && J.active && Ds(J.effects, a);
  };
  if (i && t) {
    const A = t;
    t = (...G) => {
      const he = A(...G);
      return B(), he;
    };
  }
  let D = I ? new Array(e.length).fill(jt) : jt;
  const K = (A) => {
    if (!(!(a.flags & 1) || !a.dirty && !A))
      if (t) {
        const G = a.run();
        if (A || r || L || (I ? G.some((he, _e) => Ae(he, D[_e])) : Ae(G, D))) {
          S && S();
          const he = Ye;
          Ye = a;
          try {
            const _e = [
              G,
              // pass undefined as the old value when it's changed for the first time
              D === jt ? void 0 : I && D[0] === jt ? [] : D,
              C
            ];
            D = G, c ? c(t, 3, _e) : (
              // @ts-expect-error
              t(..._e)
            );
          } finally {
            Ye = he;
          }
        }
      } else
        a.run();
  };
  return l && l(K), a = new Bs(g), a.scheduler = o ? () => o(K, !1) : K, C = (A) => Ci(A, !1, a), S = a.onStop = () => {
    const A = zt.get(a);
    if (A) {
      if (c)
        c(A, 4);
      else
        for (const G of A) G();
      zt.delete(a);
    }
  }, t ? s ? K(!0) : D = a.run() : o ? o(K.bind(null, !0), !0) : a.run(), B.pause = a.pause.bind(a), B.resume = a.resume.bind(a), B.stop = B, B;
}
function Ne(e, t = 1 / 0, n) {
  if (t <= 0 || !q(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t))
    return e;
  if (n.set(e, t), t--, /* @__PURE__ */ oe(e))
    Ne(e.value, t, n);
  else if (P(e))
    for (let s = 0; s < e.length; s++)
      Ne(e[s], t, n);
  else if (qt(e) || ke(e))
    e.forEach((s) => {
      Ne(s, t, n);
    });
  else if (Hs(e)) {
    for (const s in e)
      Ne(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Ne(e[s], t, n);
  }
  return e;
}
function It(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    on(r, t, n);
  }
}
function Me(e, t, n, s) {
  if (j(e)) {
    const r = It(e, t, n, s);
    return r && Ns(r) && r.catch((i) => {
      on(i, t, n);
    }), r;
  }
  if (P(e)) {
    const r = [];
    for (let i = 0; i < e.length; i++)
      r.push(Me(e[i], t, n, s));
    return r;
  }
}
function on(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: o } = t && t.appContext.config || W;
  if (t) {
    let l = t.parent;
    const c = t.proxy, d = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; l; ) {
      const a = l.ec;
      if (a) {
        for (let g = 0; g < a.length; g++)
          if (a[g](e, c, d) === !1)
            return;
      }
      l = l.parent;
    }
    if (i) {
      Ke(), It(i, null, 10, [
        e,
        c,
        d
      ]), Ue();
      return;
    }
  }
  Ai(e, n, r, s, o);
}
function Ai(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const ie = [];
let Se = -1;
const lt = [];
let je = null, rt = 0;
const ir = /* @__PURE__ */ Promise.resolve();
let Jt = null;
function Ei(e) {
  const t = Jt || ir;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Oi(e) {
  let t = Se + 1, n = ie.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = ie[s], i = Tt(r);
    i < e || i === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function Jn(e) {
  if (!(e.flags & 1)) {
    const t = Tt(e), n = ie[ie.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Tt(n) ? ie.push(e) : ie.splice(Oi(t), 0, e), e.flags |= 1, or();
  }
}
function or() {
  Jt || (Jt = ir.then(fr));
}
function Mi(e) {
  if (!P(e))
    je && e.id === -1 ? je.splice(rt + 1, 0, e) : e.flags & 1 || (lt.push(e), e.flags |= 1);
  else
    for (let t = 0; t < e.length; t++)
      lt.push(e[t]);
  or();
}
function ds(e, t, n = Se + 1) {
  for (; n < ie.length; n++) {
    const s = ie[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      ie.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function lr(e) {
  if (lt.length) {
    const t = [...new Set(lt)].sort(
      (n, s) => Tt(n) - Tt(s)
    );
    if (lt.length = 0, je) {
      for (let n = 0; n < t.length; n++)
        je.push(t[n]);
      return;
    }
    for (je = t, rt = 0; rt < je.length; rt++) {
      const n = je[rt];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    je = null, rt = 0;
  }
}
const Tt = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function fr(e) {
  try {
    for (Se = 0; Se < ie.length; Se++) {
      const t = ie[Se];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), It(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Se < ie.length; Se++) {
      const t = ie[Se];
      t && (t.flags &= -2);
    }
    Se = -1, ie.length = 0, lr(), Jt = null, (ie.length || lt.length) && fr();
  }
}
let ae = null, cr = null;
function Gt(e) {
  const t = ae;
  return ae = e, cr = e && e.type.__scopeId || null, t;
}
function Ii(e, t = ae, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && vs(-1);
    const i = Gt(t), o = et.length;
    let l;
    try {
      l = e(...r);
    } finally {
      for (let c = et.length; c > o; c--) Ar();
      Gt(i), s._d && vs(1);
    }
    return l;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function Ri(e, t) {
  if (ae === null)
    return e;
  const n = un(ae), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [i, o, l, c = W] = t[r];
    i && (j(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Ne(o), s.push({
      dir: i,
      instance: n,
      value: o,
      oldValue: void 0,
      arg: l,
      modifiers: c
    }));
  }
  return e;
}
function ze(e, t, n, s) {
  const r = e.dirs, i = t && t.dirs;
  for (let o = 0; o < r.length; o++) {
    const l = r[o];
    i && (l.oldValue = i[o].value);
    let c = l.dir[s];
    c && (Ke(), Me(c, n, 8, [
      e.el,
      l,
      e,
      t
    ]), Ue());
  }
}
function Pi(e, t, n = !1) {
  const s = bo();
  if (s || ft) {
    let r = ft ? ft._context.provides : s ? s.parent == null || s.ce ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && j(t) ? t.call(s && s.proxy) : t;
  }
}
const Fi = /* @__PURE__ */ Symbol.for("v-scx"), $i = () => Pi(Fi);
function Di(e, t, n) {
  return Ni(e, t, n);
}
function Ni(e, t, n = W) {
  const { immediate: s, deep: r, flush: i, once: o } = n, l = ye({}, n), c = t && s || !t && i !== "post";
  let d;
  if (Ot) {
    if (i === "sync") {
      const C = $i();
      d = C.__watcherHandles || (C.__watcherHandles = []);
    } else if (!c) {
      const C = () => {
      };
      return C.stop = Ze, C.resume = Ze, C.pause = Ze, C;
    }
  }
  const a = We;
  l.call = (C, L, I) => Me(C, a, L, I);
  let g = !1;
  i === "post" ? l.scheduler = (C) => {
    le(C, a && a.suspense);
  } : i !== "sync" && (g = !0, l.scheduler = (C, L) => {
    L ? C() : Jn(C);
  }), l.augmentJob = (C) => {
    t && (C.flags |= 4), g && (C.flags |= 2, a && (C.id = a.uid, C.i = a));
  };
  const S = Ti(e, t, l);
  return Ot && (d ? d.push(S) : c && S()), S;
}
const Li = /* @__PURE__ */ Symbol("_vte"), ln = (e) => e.__isTeleport, bn = /* @__PURE__ */ Symbol("_leaveCb");
function Hi(e) {
  let t = e[0];
  if (e.length > 1) {
    for (const n of e)
      if (n.type !== He) {
        t = n;
        break;
      }
  }
  return t;
}
function ur(e) {
  if (!ar(e))
    return ln(e.type) && e.children ? Hi(e.children) : e;
  if (e.component)
    return e.component.subTree;
  const { shapeFlag: t, children: n } = e;
  if (n) {
    if (t & 16)
      return n[0];
    if (t & 32 && j(n.default))
      return n.default();
  }
}
function Gn(e, t) {
  if (e.shapeFlag & 6 && e.component) {
    e.transition = t;
    const n = e.component.subTree;
    Gn(
      ln(n.type) && ur(n) || n,
      t
    );
  } else e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function ji(e, t) {
  return j(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    ye({ name: e.name }, t, { setup: e })
  ) : e;
}
function ki(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function ps(e, t) {
  let n;
  return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
const Yt = /* @__PURE__ */ new WeakMap();
function vt(e, t, n, s, r = !1) {
  if (P(e)) {
    e.forEach(
      (I, J) => vt(
        I,
        t && (P(t) ? t[J] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (bt(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && vt(e, t, n, s.component.subTree);
    return;
  }
  const i = s.shapeFlag & 4 ? un(s.component) : s.el, o = r ? null : i, { i: l, r: c } = e, d = t && t.r, a = l.refs === W ? l.refs = {} : l.refs, g = l.setupState, S = /* @__PURE__ */ N(g), C = g === W ? $s : (I) => ps(a, I) ? !1 : V(S, I), L = (I, J) => !(J && ps(a, J));
  if (d != null && d !== c) {
    if (hs(t), X(d))
      a[d] = null, C(d) && (g[d] = null);
    else if (/* @__PURE__ */ oe(d)) {
      const I = t;
      L(d, I.k) && (d.value = null), I.k && (a[I.k] = null);
    }
  }
  if (j(c))
    It(c, l, 12, [o, a]);
  else {
    const I = X(c), J = /* @__PURE__ */ oe(c);
    if (I || J) {
      const B = () => {
        if (e.f) {
          const D = I ? C(c) ? g[c] : a[c] : L() || !e.k ? c.value : a[e.k];
          if (r)
            P(D) && Ds(D, i);
          else if (P(D))
            D.includes(i) || D.push(i);
          else if (I)
            a[c] = [i], C(c) && (g[c] = a[c]);
          else {
            const K = [i];
            L(c, e.k) && (c.value = K), e.k && (a[e.k] = K);
          }
        } else I ? (a[c] = o, C(c) && (g[c] = o)) : J && (L(c, e.k) && (c.value = o), e.k && (a[e.k] = o));
      };
      if (o) {
        const D = () => {
          B(), Yt.delete(e);
        };
        D.id = -1, Yt.set(e, D), le(D, n);
      } else
        hs(e), B();
    }
  }
}
function hs(e) {
  const t = Yt.get(e);
  t && (t.flags |= 8, Yt.delete(e));
}
nn().requestIdleCallback;
nn().cancelIdleCallback;
const bt = (e) => !!e.type.__asyncLoader, ar = (e) => e.type.__isKeepAlive;
function Vi(e, t, n = We, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), i = t.__weh || (t.__weh = (...o) => {
      Ke();
      const l = Zn(n), c = Me(t, n, e, o);
      return l(), Ue(), c;
    });
    return s ? r.unshift(i) : r.push(i), i;
  }
}
const dr = (e) => (t, n = We) => {
  (!Ot || e === "sp") && Vi(e, (...s) => t(...s), n);
}, Ki = dr("m"), Ui = dr(
  "bum"
), Bi = /* @__PURE__ */ Symbol.for("v-ndc");
function kt(e, t, n, s) {
  let r;
  const i = n, o = P(e);
  if (o || X(e)) {
    const l = o && /* @__PURE__ */ Ve(e);
    let c = !1, d = !1;
    l && (c = !/* @__PURE__ */ de(e), d = /* @__PURE__ */ Oe(e), e = rn(e)), r = new Array(e.length);
    for (let a = 0, g = e.length; a < g; a++)
      r[a] = t(
        c ? d ? Be(pe(e[a])) : pe(e[a]) : e[a],
        a,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let l = 0; l < e; l++)
      r[l] = t(l + 1, l, void 0, i);
  } else if (q(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (l, c) => t(l, c, void 0, i)
      );
    else {
      const l = Object.keys(e);
      r = new Array(l.length);
      for (let c = 0, d = l.length; c < d; c++) {
        const a = l[c];
        r[c] = t(e[a], a, c, i);
      }
    }
  else
    r = [];
  return r;
}
const Fn = (e) => e ? Ir(e) ? un(e) : Fn(e.parent) : null, xt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ye(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Fn(e.parent),
    $root: (e) => Fn(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => e.type,
    $forceUpdate: (e) => e.f || (e.f = () => {
      Jn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Ei.bind(e.proxy)),
    $watch: (e) => Ze
  })
), xn = (e, t) => e !== W && !e.__isScriptSetup && V(e, t), Wi = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: i, accessCache: o, type: l, appContext: c } = e;
    if (t[0] !== "$") {
      const S = o[t];
      if (S !== void 0)
        switch (S) {
          case 1:
            return s[t];
          case 2:
            return r[t];
          case 4:
            return n[t];
          case 3:
            return i[t];
        }
      else {
        if (xn(s, t))
          return o[t] = 1, s[t];
        if (V(i, t))
          return o[t] = 3, i[t];
        if (n !== W && V(n, t))
          return o[t] = 4, n[t];
        o[t] = 0;
      }
    }
    const d = xt[t];
    let a, g;
    if (d)
      return t === "$attrs" && re(e.attrs, "get", ""), d(e);
    if (
      // css module (injected by vue-loader)
      (a = l.__cssModules) && (a = a[t])
    )
      return a;
    if (n !== W && V(n, t))
      return o[t] = 4, n[t];
    if (
      // global properties
      g = c.config.globalProperties, V(g, t)
    )
      return g[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: i } = e;
    return xn(r, t) ? (r[t] = n, !0) : V(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, props: i, type: o }
  }, l) {
    let c;
    return !!(n[l] || xn(t, l) || V(i, l) || V(s, l) || V(xt, l) || V(r.config.globalProperties, l) || (c = o.__cssModules) && c[l]);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : V(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function pr() {
  return {
    app: null,
    config: {
      isNativeTag: $s,
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
let qi = 0;
function zi(e, t) {
  return function(s, r = null) {
    j(s) || (s = ye({}, s)), r != null && !q(r) && (r = null);
    const i = pr(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let c = !1;
    const d = i.app = {
      _uid: qi++,
      _component: s,
      _props: r,
      _container: null,
      _context: i,
      _instance: null,
      version: Ao,
      get config() {
        return i.config;
      },
      set config(a) {
      },
      use(a, ...g) {
        return o.has(a) || (a && j(a.install) ? (o.add(a), a.install(d, ...g)) : j(a) && (o.add(a), a(d, ...g))), d;
      },
      mixin(a) {
        return d;
      },
      component(a, g) {
        return g ? (i.components[a] = g, d) : i.components[a];
      },
      directive(a, g) {
        return g ? (i.directives[a] = g, d) : i.directives[a];
      },
      mount(a, g, S) {
        if (!c) {
          const C = d._ceVNode || Le(s, r);
          return C.appContext = i, S === !0 ? S = "svg" : S === !1 && (S = void 0), e(C, a, S), c = !0, d._container = a, a.__vue_app__ = d, un(C.component);
        }
      },
      onUnmount(a) {
        l.push(a);
      },
      unmount() {
        c && (Me(
          l,
          d._instance,
          16
        ), e(null, d._container), delete d._container.__vue_app__);
      },
      provide(a, g) {
        return i.provides[a] = g, d;
      },
      runWithContext(a) {
        const g = ft;
        ft = d;
        try {
          return a();
        } finally {
          ft = g;
        }
      }
    };
    return d;
  };
}
let ft = null;
const Ji = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ge(t)}Modifiers`] || e[`${tt(t)}Modifiers`];
function Gi(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || W;
  let r = n;
  const i = t.startsWith("update:"), o = i && Ji(s, t.slice(7));
  o && (o.trim && (r = n.map((a) => X(a) ? a.trim() : a)), o.number && (r = r.map(Hn)));
  let l, c = s[l = hn(t)] || // also try camelCase event handler (#2249)
  s[l = hn(ge(t))];
  !c && i && (c = s[l = hn(tt(t))]), c && Me(
    c,
    e,
    6,
    r
  );
  const d = s[l + "Once"];
  if (d) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, Me(
      d,
      e,
      6,
      r
    );
  }
}
function Yi(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const i = e.emits;
  let o = {};
  return i ? (P(i) ? i.forEach((l) => o[l] = null) : ye(o, i), q(e) && s.set(e, o), o) : (q(e) && s.set(e, null), null);
}
function fn(e, t) {
  return !e || !Qt(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), V(e, t[0].toLowerCase() + t.slice(1)) || V(e, tt(t)) || V(e, t));
}
function gs(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [i],
    slots: o,
    attrs: l,
    emit: c,
    render: d,
    renderCache: a,
    props: g,
    data: S,
    setupState: C,
    ctx: L,
    inheritAttrs: I
  } = e, J = Gt(e);
  let B, D;
  try {
    if (n.shapeFlag & 4) {
      const A = r || s, G = A;
      B = Te(
        d.call(
          G,
          A,
          a,
          g,
          C,
          S,
          L
        )
      ), D = l;
    } else {
      const A = t;
      B = Te(
        A.length > 1 ? A(
          g,
          { attrs: l, slots: o, emit: c }
        ) : A(
          g,
          null
        )
      ), D = t.props ? l : Xi(l);
    }
  } catch (A) {
    et.length = 0, on(A, e, 1), B = Le(He);
  }
  let K = B;
  if (D && I !== !1) {
    const A = Object.keys(D), { shapeFlag: G } = K;
    A.length && G & 7 && (i && A.some(en) && (D = Zi(
      D,
      i
    )), K = ct(K, D, !1, !0));
  }
  if (n.dirs && (K = ct(K, null, !1, !0), K.dirs = K.dirs ? K.dirs.concat(n.dirs) : n.dirs), n.transition) {
    const A = ln(K.type) && ur(K) || K;
    Gn(A, n.transition);
  }
  return B = K, Gt(J), B;
}
const Xi = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Qt(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Zi = (e, t) => {
  const n = {};
  for (const s in e)
    (!en(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Qi(e, t, n) {
  const { props: s, children: r, component: i } = e, { props: o, children: l, patchFlag: c } = t, d = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return s ? ms(s, o, d) : !!o;
    if (c & 8) {
      const a = t.dynamicProps;
      for (let g = 0; g < a.length; g++) {
        const S = a[g];
        if (hr(o, s, S) && !fn(d, S))
          return !0;
      }
    }
  } else
    return (r || l) && (!l || !l.$stable) ? !0 : s === o ? !1 : s ? o ? ms(s, o, d) : !0 : !!o;
  return !1;
}
function ms(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const i = s[r];
    if (hr(t, e, i) && !fn(n, i))
      return !0;
  }
  return !1;
}
function hr(e, t, n) {
  const s = e[n], r = t[n];
  return n === "style" && q(s) && q(r) ? !sn(s, r) : s !== r;
}
function eo({ vnode: e, parent: t, suspense: n }, s) {
  for (; t; ) {
    const r = t.subTree;
    if (r.suspense && r.suspense.activeBranch === e && (r.suspense.vnode.el = r.el = s, e = r), r === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
  n && n.activeBranch === e && (n.vnode.el = s);
}
const gr = {}, mr = () => Object.create(gr), yr = (e) => Object.getPrototypeOf(e) === gr;
function to(e, t, n, s = !1) {
  const r = {}, i = mr();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), _r(e, t, r, i);
  for (const o in e.propsOptions[0])
    o in r || (r[o] = void 0);
  n ? e.props = s ? r : /* @__PURE__ */ yi(r) : e.type.props ? e.props = r : e.props = i, e.attrs = i;
}
function no(e, t, n, s) {
  const {
    props: r,
    attrs: i,
    vnode: { patchFlag: o }
  } = e, l = /* @__PURE__ */ N(r), [c] = e.propsOptions;
  let d = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const a = e.vnode.dynamicProps;
      for (let g = 0; g < a.length; g++) {
        let S = a[g];
        if (fn(e.emitsOptions, S))
          continue;
        const C = t[S];
        if (c)
          if (V(i, S))
            C !== i[S] && (i[S] = C, d = !0);
          else {
            const L = ge(S);
            r[L] = $n(
              c,
              l,
              L,
              C,
              e,
              !1
            );
          }
        else
          C !== i[S] && (i[S] = C, d = !0);
      }
    }
  } else {
    _r(e, t, r, i) && (d = !0);
    let a;
    for (const g in l)
      (!t || // for camelCase
      !V(t, g) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((a = tt(g)) === g || !V(t, a))) && (c ? n && // for camelCase
      (n[g] !== void 0 || // for kebab-case
      n[a] !== void 0) && (r[g] = $n(
        c,
        l,
        g,
        void 0,
        e,
        !0
      )) : delete r[g]);
    if (i !== l)
      for (const g in i)
        (!t || !V(t, g)) && (delete i[g], d = !0);
  }
  d && De(e.attrs, "set", "");
}
function _r(e, t, n, s) {
  const [r, i] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let c in t) {
      if (mt(c))
        continue;
      const d = t[c];
      let a;
      r && V(r, a = ge(c)) ? !i || !i.includes(a) ? n[a] = d : (l || (l = {}))[a] = d : fn(e.emitsOptions, c) || (!(c in s) || d !== s[c]) && (s[c] = d, o = !0);
    }
  if (i) {
    const c = /* @__PURE__ */ N(n), d = l || W;
    for (let a = 0; a < i.length; a++) {
      const g = i[a];
      n[g] = $n(
        r,
        c,
        g,
        d[g],
        e,
        !V(d, g)
      );
    }
  }
  return o;
}
function $n(e, t, n, s, r, i) {
  const o = e[n];
  if (o != null) {
    const l = V(o, "default");
    if (l && s === void 0) {
      const c = o.default;
      if (o.type !== Function && !o.skipFactory && j(c)) {
        const { propsDefaults: d } = r;
        if (n in d)
          s = d[n];
        else {
          const a = Zn(r);
          s = d[n] = c.call(
            null,
            t
          ), a();
        }
      } else
        s = c;
      r.ce && r.ce._setProp(n, s);
    }
    o[
      0
      /* shouldCast */
    ] && (i && !l ? s = !1 : o[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === tt(n)) && (s = !0));
  }
  return s;
}
function so(e, t, n = !1) {
  const s = t.propsCache, r = s.get(e);
  if (r)
    return r;
  const i = e.props, o = {}, l = [];
  if (!i)
    return q(e) && s.set(e, Xe), Xe;
  if (P(i))
    for (let d = 0; d < i.length; d++) {
      const a = ge(i[d]);
      ys(a) && (o[a] = W);
    }
  else if (i)
    for (const d in i) {
      const a = ge(d);
      if (ys(a)) {
        const g = i[d], S = o[a] = P(g) || j(g) ? { type: g } : ye({}, g), C = S.type;
        let L = !1, I = !0;
        if (P(C))
          for (let J = 0; J < C.length; ++J) {
            const B = C[J], D = j(B) && B.name;
            if (D === "Boolean") {
              L = !0;
              break;
            } else D === "String" && (I = !1);
          }
        else
          L = j(C) && C.name === "Boolean";
        S[
          0
          /* shouldCast */
        ] = L, S[
          1
          /* shouldCastTrue */
        ] = I, (L || V(S, "default")) && l.push(a);
      }
    }
  const c = [o, l];
  return q(e) && s.set(e, c), c;
}
function ys(e) {
  return e[0] !== "$" && !mt(e);
}
const Yn = (e) => e === "_" || e === "_ctx" || e === "$stable", Xn = (e) => P(e) ? e.map(Te) : [Te(e)], ro = (e, t, n) => {
  if (t._n)
    return t;
  const s = Ii((...r) => Xn(t(...r)), n);
  return s._c = !1, s;
}, vr = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Yn(r)) continue;
    const i = e[r];
    if (j(i))
      t[r] = ro(r, i, s);
    else if (i != null) {
      const o = Xn(i);
      t[r] = () => o;
    }
  }
}, br = (e, t) => {
  const n = Xn(t);
  e.slots.default = () => n;
}, xr = (e, t, n) => {
  for (const s in t)
    (n || !Yn(s)) && (e[s] = t[s]);
}, io = (e, t, n) => {
  const s = e.slots = mr();
  if (e.vnode.shapeFlag & 32) {
    const r = t._;
    r ? (xr(s, t, n), n && ks(s, "_", r, !0)) : vr(t, s);
  } else t && br(e, t);
}, oo = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let i = !0, o = W;
  if (s.shapeFlag & 32) {
    const l = t._;
    l ? n && l === 1 ? i = !1 : xr(r, t, n) : (i = !t.$stable, vr(t, r)), o = t;
  } else t && (br(e, t), o = { default: 1 });
  if (i)
    for (const l in r)
      !Yn(l) && o[l] == null && delete r[l];
}, le = ao;
function lo(e) {
  return fo(e);
}
function fo(e, t) {
  const n = nn();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: i,
    createElement: o,
    createText: l,
    createComment: c,
    setText: d,
    setElementText: a,
    parentNode: g,
    nextSibling: S,
    setScopeId: C = Ze,
    insertStaticContent: L
  } = e, I = (f, u, p, _ = null, h = null, y = null, x = void 0, b = null, v = !!u.dynamicChildren) => {
    if (f === u)
      return;
    f && !ht(f, u) && (_ = Dt(f), Re(f, h, y, !0), f = null), u.patchFlag === -2 && (v = !1, u.dynamicChildren = null), u.dynamicChildren && f && f.dynamicChildren && f.dynamicChildren.hasOnce && (u.dynamicChildren === Xe && (u.dynamicChildren = []), u.dynamicChildren.hasOnce = !0);
    const { type: m, ref: O, shapeFlag: w } = u;
    switch (m) {
      case cn:
        J(f, u, p, _);
        break;
      case He:
        B(f, u, p, _);
        break;
      case Sn:
        f == null && D(u, p, _, x);
        break;
      case ce:
        an(
          f,
          u,
          p,
          _,
          h,
          y,
          x,
          b,
          v
        );
        break;
      default:
        w & 1 ? G(
          f,
          u,
          p,
          _,
          h,
          y,
          x,
          b,
          v
        ) : w & 6 ? Ft(
          f,
          u,
          p,
          _,
          h,
          y,
          x,
          b,
          v
        ) : (w & 64 || w & 128) && m.process(
          f,
          u,
          p,
          _,
          h,
          y,
          x,
          b,
          v,
          at
        );
    }
    O != null && h ? vt(O, f && f.ref, y, u || f, !u) : O == null && f && f.ref != null && vt(f.ref, null, y, f, !0);
  }, J = (f, u, p, _) => {
    if (f == null)
      s(
        u.el = l(u.children),
        p,
        _
      );
    else {
      const h = u.el = f.el;
      u.children !== f.children && d(h, u.children);
    }
  }, B = (f, u, p, _) => {
    f == null ? s(
      u.el = c(u.children || ""),
      p,
      _
    ) : u.el = f.el;
  }, D = (f, u, p, _) => {
    [f.el, f.anchor] = L(
      f.children,
      u,
      p,
      _,
      f.el,
      f.anchor
    );
  }, K = ({ el: f, anchor: u }, p, _) => {
    let h;
    for (; f && f !== u; )
      h = S(f), s(f, p, _), f = h;
    s(u, p, _);
  }, A = ({ el: f, anchor: u }) => {
    let p;
    for (; f && f !== u; )
      p = S(f), r(f), f = p;
    r(u);
  }, G = (f, u, p, _, h, y, x, b, v) => {
    if (u.type === "svg" ? x = "svg" : u.type === "math" && (x = "mathml"), f == null)
      he(
        u,
        p,
        _,
        h,
        y,
        x,
        b,
        v
      );
    else {
      const m = f.el && f.el._isVueCE ? f.el : null;
      try {
        m && m._beginPatch(), Rt(
          f,
          u,
          h,
          y,
          x,
          b,
          v
        );
      } finally {
        m && m._endPatch();
      }
    }
  }, he = (f, u, p, _, h, y, x, b) => {
    let v, m;
    const { props: O, shapeFlag: w, transition: T, dirs: M } = f;
    if (v = f.el = o(
      f.type,
      y,
      O && O.is,
      O
    ), w & 8 ? a(v, f.children) : w & 16 && Ie(
      f.children,
      v,
      null,
      _,
      h,
      wn(f, y),
      x,
      b
    ), M && ze(f, null, _, "created"), _e(v, f, f.scopeId, x, _), O) {
      for (const k in O)
        k !== "value" && !mt(k) && i(v, k, null, O[k], y, _);
      "value" in O && i(v, "value", null, O.value, y), (m = O.onVnodeBeforeMount) && we(m, _, f);
    }
    M && ze(f, null, _, "beforeMount");
    const F = co(h, T);
    F && T.beforeEnter(v), s(v, u, p), ((m = O && O.onVnodeMounted) || F || M) && le(() => {
      m && we(m, _, f), F && T.enter(v), M && ze(f, null, _, "mounted");
    }, h);
  }, _e = (f, u, p, _, h) => {
    if (p && C(f, p), _)
      for (let y = 0; y < _.length; y++)
        C(f, _[y]);
    if (h) {
      let y = h.subTree;
      if (u === y || Tr(y.type) && (y.ssContent === u || y.ssFallback === u)) {
        const x = h.vnode;
        _e(
          f,
          x,
          x.scopeId,
          x.slotScopeIds,
          h.parent
        );
      }
    }
  }, Ie = (f, u, p, _, h, y, x, b, v = 0) => {
    for (let m = v; m < f.length; m++) {
      const O = f[m] = b ? $e(f[m]) : Te(f[m]);
      I(
        null,
        O,
        u,
        p,
        _,
        h,
        y,
        x,
        b
      );
    }
  }, Rt = (f, u, p, _, h, y, x) => {
    const b = u.el = f.el;
    let { patchFlag: v, dynamicChildren: m, dirs: O } = u;
    v |= f.patchFlag & 16;
    const w = f.props || W, T = u.props || W;
    let M;
    if (p && Je(p, !1), (M = T.onVnodeBeforeUpdate) && we(M, p, u, f), O && ze(u, f, p, "beforeUpdate"), p && Je(p, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    m && (!f.dynamicChildren || f.dynamicChildren.length !== m.length) && (v = 0, x = !1, m = null), (w.innerHTML && T.innerHTML == null || w.textContent && T.textContent == null) && a(b, ""), m ? qe(
      f.dynamicChildren,
      m,
      b,
      p,
      _,
      wn(u, h),
      y
    ) : x || dn(
      f,
      u,
      b,
      null,
      p,
      _,
      wn(u, h),
      y,
      !1
    ), v > 0) {
      if (v & 16)
        Pt(b, w, T, p, h);
      else if (v & 2 && w.class !== T.class && i(b, "class", null, T.class, h), v & 4 && i(b, "style", w.style, T.style, h), v & 8) {
        const F = u.dynamicProps;
        for (let k = 0; k < F.length; k++) {
          const H = F[k], Y = w[H], Q = T[H];
          (Q !== Y || H === "value") && i(b, H, Y, Q, h, p);
        }
      }
      v & 1 && f.children !== u.children && a(b, u.children);
    } else !x && m == null && Pt(b, w, T, p, h);
    ((M = T.onVnodeUpdated) || O) && le(() => {
      M && we(M, p, u, f), O && ze(u, f, p, "updated");
    }, _);
  }, qe = (f, u, p, _, h, y, x) => {
    for (let b = 0; b < u.length; b++) {
      const v = f[b], m = u[b], O = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        v.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (v.type === ce || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !ht(v, m) || // - In the case of a component, it could contain anything.
        v.shapeFlag & 198) ? g(v.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          p
        )
      );
      I(
        v,
        m,
        O,
        null,
        _,
        h,
        y,
        x,
        !0
      );
    }
  }, Pt = (f, u, p, _, h) => {
    if (u !== p) {
      if (u !== W)
        for (const y in u)
          !mt(y) && !(y in p) && i(
            f,
            y,
            u[y],
            null,
            h,
            _
          );
      for (const y in p) {
        if (mt(y)) continue;
        const x = p[y], b = u[y];
        x !== b && y !== "value" && i(f, y, b, x, h, _);
      }
      "value" in p && i(f, "value", u.value, p.value, h);
    }
  }, an = (f, u, p, _, h, y, x, b, v) => {
    const m = u.el = f ? f.el : l(""), O = u.anchor = f ? f.anchor : l("");
    let { patchFlag: w, dynamicChildren: T, slotScopeIds: M } = u;
    M && (b = b ? b.concat(M) : M), f == null ? (s(m, p, _), s(O, p, _), Ie(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      u.children || [],
      p,
      O,
      h,
      y,
      x,
      b,
      v
    )) : w > 0 && w & 64 && T && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    f.dynamicChildren && f.dynamicChildren.length === T.length ? (qe(
      f.dynamicChildren,
      T,
      p,
      h,
      y,
      x,
      b
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (u.key != null || h && u === h.subTree) && wr(
      f,
      u,
      !0
      /* shallow */
    )) : dn(
      f,
      u,
      p,
      O,
      h,
      y,
      x,
      b,
      v
    );
  }, Ft = (f, u, p, _, h, y, x, b, v) => {
    u.slotScopeIds = b, f == null ? u.shapeFlag & 512 ? h.ctx.activate(
      u,
      p,
      _,
      x,
      v
    ) : E(
      u,
      p,
      _,
      h,
      y,
      x,
      v
    ) : z(f, u, v);
  }, E = (f, u, p, _, h, y, x) => {
    const b = f.component = vo(
      f,
      _,
      h
    );
    if (ar(f) && (b.ctx.renderer = at), xo(b, !1, x), b.asyncDep) {
      if (h && h.registerDep(b, R, x), !f.el) {
        const v = b.subTree = Le(He);
        B(null, v, u, p), f.placeholder = v.el;
      }
    } else
      R(
        b,
        f,
        u,
        p,
        h,
        y,
        x
      );
  }, z = (f, u, p) => {
    const _ = u.component = f.component;
    if (Qi(f, u, p))
      if (_.asyncDep && !_.asyncResolved) {
        u.el = f.el, Z(_, u, p);
        return;
      } else
        _.next = u, _.update();
    else
      u.el = f.el, _.vnode = u;
  }, R = (f, u, p, _, h, y, x) => {
    const b = () => {
      if (f.isMounted) {
        let { next: w, bu: T, u: M, parent: F, vnode: k } = f;
        {
          const be = Sr(f);
          if (be) {
            w && (w.el = k.el, Z(f, w, x)), be.asyncDep.then(() => {
              le(() => {
                f.isUnmounted || m();
              }, h);
            });
            return;
          }
        }
        let H = w, Y;
        Je(f, !1), w ? (w.el = k.el, Z(f, w, x)) : w = k, T && Bt(T), (Y = w.props && w.props.onVnodeBeforeUpdate) && we(Y, F, w, k), Je(f, !0);
        const Q = gs(f), ve = f.subTree;
        f.subTree = Q, I(
          ve,
          Q,
          // parent may have changed if it's in a teleport
          g(ve.el),
          // anchor may have changed if it's in a fragment
          Dt(ve),
          f,
          h,
          y
        ), w.el = Q.el, H === null && eo(f, Q.el), M && le(M, h), (Y = w.props && w.props.onVnodeUpdated) && le(
          () => we(Y, F, w, k),
          h
        );
      } else {
        let w;
        const { el: T, props: M } = u, { bm: F, m: k, parent: H, root: Y, type: Q } = f, ve = bt(u);
        Je(f, !1), F && Bt(F), !ve && (w = M && M.onVnodeBeforeMount) && we(w, H, u), Je(f, !0);
        {
          Y.ce && Y.ce._hasShadowRoot() && Y.ce._injectChildStyle(
            Q,
            f.parent ? f.parent.type : void 0
          );
          const be = f.subTree = gs(f);
          I(
            null,
            be,
            p,
            _,
            f,
            h,
            y
          ), u.el = be.el;
        }
        if (k && le(k, h), !ve && (w = M && M.onVnodeMounted)) {
          const be = u;
          le(
            () => we(w, H, be),
            h
          );
        }
        (u.shapeFlag & 256 || H && bt(H.vnode) && H.vnode.shapeFlag & 256) && f.a && le(f.a, h), f.isMounted = !0, u = p = _ = null;
      }
    };
    f.scope.on();
    const v = f.effect = new Bs(b);
    f.scope.off();
    const m = f.update = v.run.bind(v), O = f.job = v.runIfDirty.bind(v);
    O.i = f, O.id = f.uid, v.scheduler = () => Jn(O), Je(f, !0), m();
  }, Z = (f, u, p) => {
    u.component = f;
    const _ = f.vnode.props;
    f.vnode = u, f.next = null, no(f, u.props, _, p), oo(f, u.children, p), Ke(), ds(f), Ue();
  }, dn = (f, u, p, _, h, y, x, b, v = !1) => {
    const m = f && f.children, O = f ? f.shapeFlag : 0, w = u.children, { patchFlag: T, shapeFlag: M } = u;
    if (T > 0) {
      if (T & 128) {
        Qn(
          m,
          w,
          p,
          _,
          h,
          y,
          x,
          b,
          v
        );
        return;
      } else if (T & 256) {
        $r(
          m,
          w,
          p,
          _,
          h,
          y,
          x,
          b,
          v
        );
        return;
      }
    }
    M & 8 ? (O & 16 && ut(m, h, y), w !== m && a(p, w)) : O & 16 ? M & 16 ? Qn(
      m,
      w,
      p,
      _,
      h,
      y,
      x,
      b,
      v
    ) : ut(m, h, y, !0) : (O & 8 && a(p, ""), M & 16 && Ie(
      w,
      p,
      _,
      h,
      y,
      x,
      b,
      v
    ));
  }, $r = (f, u, p, _, h, y, x, b, v) => {
    f = f || Xe, u = u || Xe;
    const m = f.length, O = u.length, w = Math.min(m, O);
    let T;
    for (T = 0; T < w; T++) {
      const M = u[T] = v ? $e(u[T]) : Te(u[T]);
      I(
        f[T],
        M,
        p,
        null,
        h,
        y,
        x,
        b,
        v
      );
    }
    m > O ? ut(
      f,
      h,
      y,
      !0,
      !1,
      w
    ) : Ie(
      u,
      p,
      _,
      h,
      y,
      x,
      b,
      v,
      w
    );
  }, Qn = (f, u, p, _, h, y, x, b, v) => {
    let m = 0;
    const O = u.length;
    let w = f.length - 1, T = O - 1;
    for (; m <= w && m <= T; ) {
      const M = f[m], F = u[m] = v ? $e(u[m]) : Te(u[m]);
      if (ht(M, F))
        I(
          M,
          F,
          p,
          null,
          h,
          y,
          x,
          b,
          v
        );
      else
        break;
      m++;
    }
    for (; m <= w && m <= T; ) {
      const M = f[w], F = u[T] = v ? $e(u[T]) : Te(u[T]);
      if (ht(M, F))
        I(
          M,
          F,
          p,
          null,
          h,
          y,
          x,
          b,
          v
        );
      else
        break;
      w--, T--;
    }
    if (m > w) {
      if (m <= T) {
        const M = T + 1, F = M < O ? u[M].el : _;
        for (; m <= T; )
          I(
            null,
            u[m] = v ? $e(u[m]) : Te(u[m]),
            p,
            F,
            h,
            y,
            x,
            b,
            v
          ), m++;
      }
    } else if (m > T)
      for (; m <= w; )
        Re(f[m], h, y, !0), m++;
    else {
      const M = m, F = m, k = /* @__PURE__ */ new Map();
      for (m = F; m <= T; m++) {
        const fe = u[m] = v ? $e(u[m]) : Te(u[m]);
        fe.key != null && k.set(fe.key, m);
      }
      let H, Y = 0;
      const Q = T - F + 1;
      let ve = !1, be = 0;
      const dt = new Array(Q);
      for (m = 0; m < Q; m++) dt[m] = 0;
      for (m = M; m <= w; m++) {
        const fe = f[m];
        if (Y >= Q) {
          Re(fe, h, y, !0);
          continue;
        }
        let xe;
        if (fe.key != null)
          xe = k.get(fe.key);
        else
          for (H = F; H <= T; H++)
            if (dt[H - F] === 0 && ht(fe, u[H])) {
              xe = H;
              break;
            }
        xe === void 0 ? Re(fe, h, y, !0) : (dt[xe - F] = m + 1, xe >= be ? be = xe : ve = !0, I(
          fe,
          u[xe],
          p,
          null,
          h,
          y,
          x,
          b,
          v
        ), Y++);
      }
      const ns = ve ? uo(dt) : Xe;
      for (H = ns.length - 1, m = Q - 1; m >= 0; m--) {
        const fe = F + m, xe = u[fe], ss = u[fe + 1], rs = fe + 1 < O ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          ss.el || Cr(ss)
        ) : _;
        dt[m] === 0 ? I(
          null,
          xe,
          p,
          rs,
          h,
          y,
          x,
          b,
          v
        ) : ve && (H < 0 || m !== ns[H] ? $t(xe, p, rs, 2) : H--);
      }
    }
  }, $t = (f, u, p, _, h = null) => {
    const { el: y, type: x, transition: b, children: v, shapeFlag: m } = f;
    if (m & 6) {
      $t(f.component.subTree, u, p, _);
      return;
    }
    if (m & 128) {
      f.suspense.move(u, p, _);
      return;
    }
    if (m & 64) {
      x.move(f, u, p, at);
      return;
    }
    if (x === ce) {
      s(y, u, p);
      for (let w = 0; w < v.length; w++)
        $t(v[w], u, p, _);
      s(f.anchor, u, p);
      return;
    }
    if (x === Sn) {
      K(f, u, p);
      return;
    }
    if (_ !== 2 && m & 1 && b)
      if (_ === 0)
        b.persisted && !y[bn] ? s(y, u, p) : (b.beforeEnter(y), s(y, u, p), le(() => b.enter(y), h));
      else {
        const { leave: w, delayLeave: T, afterLeave: M } = b, F = () => {
          f.ctx.isUnmounted ? r(y) : s(y, u, p);
        }, k = () => {
          const H = y._isLeaving || !!y[bn];
          y._isLeaving && y[bn](
            !0
            /* cancelled */
          ), b.persisted && !H ? F() : w(y, () => {
            F(), M && M();
          });
        };
        T ? T(y, F, k) : k();
      }
    else
      s(y, u, p);
  }, Re = (f, u, p, _ = !1, h = !1) => {
    const {
      type: y,
      props: x,
      ref: b,
      children: v,
      dynamicChildren: m,
      shapeFlag: O,
      patchFlag: w,
      dirs: T,
      cacheIndex: M,
      memo: F
    } = f;
    if ((w === -2 || m && m.hasOnce) && (h = !1), b != null && (Ke(), vt(b, null, p, f, !0), Ue()), M != null && (!f.ctx || f.ctx === u) && (u.renderCache[M] = void 0), O & 256) {
      u.ctx.deactivate(f);
      return;
    }
    const k = O & 1 && T, H = !bt(f);
    let Y;
    if (H && (Y = x && x.onVnodeBeforeUnmount) && we(Y, u, f), O & 6)
      Nr(f.component, p, _);
    else {
      if (O & 128) {
        f.suspense.unmount(p, _);
        return;
      }
      k && ze(f, null, u, "beforeUnmount"), O & 64 ? f.type.remove(
        f,
        u,
        p,
        at,
        _
      ) : m && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !m.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (y !== ce || w > 0 && w & 64) ? ut(
        m,
        u,
        p,
        !1,
        !0
      ) : (y === ce && w & 384 || !h && O & 16) && ut(v, u, p), _ && es(f);
    }
    const Q = F != null && M == null;
    (H && (Y = x && x.onVnodeUnmounted) || k || Q) && le(() => {
      Y && we(Y, u, f), k && ze(f, null, u, "unmounted"), Q && (f.el = null);
    }, p);
  }, es = (f) => {
    const { type: u, el: p, anchor: _, transition: h } = f;
    if (u === ce) {
      Dr(p, _);
      return;
    }
    if (u === Sn) {
      A(f), h && !h.persisted && h.afterLeave && h.afterLeave();
      return;
    }
    const y = () => {
      r(p), h && !h.persisted && h.afterLeave && h.afterLeave();
    };
    if (f.shapeFlag & 1 && h && !h.persisted) {
      const { leave: x, delayLeave: b } = h, v = () => x(p, y);
      b ? b(f.el, y, v) : v();
    } else
      y();
  }, Dr = (f, u) => {
    let p;
    for (; f !== u; )
      p = S(f), r(f), f = p;
    r(u);
  }, Nr = (f, u, p) => {
    const { bum: _, scope: h, job: y, subTree: x, um: b, m: v, a: m } = f;
    _s(v), _s(m), _ && Bt(_), h.stop(), y ? (y.flags |= 8, Re(x, f, u, p)) : f.vnode.el && x && (x.transition = f.vnode.transition, Re(x, f, u, p)), b && le(b, u), le(() => {
      f.isUnmounted = !0;
    }, u);
  }, ut = (f, u, p, _ = !1, h = !1, y = 0) => {
    for (let x = y; x < f.length; x++)
      Re(f[x], u, p, _, h);
  }, Dt = (f) => {
    if (f.shapeFlag & 6)
      return Dt(f.component.subTree);
    if (f.shapeFlag & 128)
      return f.suspense.next();
    const u = S(f.anchor || f.el), p = u && u[Li];
    return p ? S(p) : u;
  };
  let pn = !1;
  const ts = (f, u, p) => {
    let _;
    f == null ? u._vnode && (Re(u._vnode, null, null, !0), _ = u._vnode.component) : I(
      u._vnode || null,
      f,
      u,
      null,
      null,
      null,
      p
    ), u._vnode = f, pn || (pn = !0, ds(_), lr(), pn = !1);
  }, at = {
    p: I,
    um: Re,
    m: $t,
    r: es,
    mt: E,
    mc: Ie,
    pc: dn,
    pbc: qe,
    n: Dt,
    o: e
  };
  return {
    render: ts,
    hydrate: void 0,
    createApp: zi(ts)
  };
}
function wn({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Je({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function co(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function wr(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (P(s) && P(r))
    for (let i = 0; i < s.length; i++) {
      const o = s[i];
      let l = r[i];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = r[i] = $e(r[i]), l.el = o.el), !n && l.patchFlag !== -2 && wr(o, l)), l.type === cn && (l.patchFlag === -1 && (l = r[i] = $e(l)), l.el = o.el), l.type === He && !l.el && (l.el = o.el);
    }
}
function uo(e) {
  const t = e.slice(), n = [0];
  let s, r, i, o, l;
  const c = e.length;
  for (s = 0; s < c; s++) {
    const d = e[s];
    if (d !== 0) {
      if (r = n[n.length - 1], e[r] < d) {
        t[s] = r, n.push(s);
        continue;
      }
      for (i = 0, o = n.length - 1; i < o; )
        l = i + o >> 1, e[n[l]] < d ? i = l + 1 : o = l;
      d < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), n[i] = s);
    }
  }
  for (i = n.length, o = n[i - 1]; i-- > 0; )
    n[i] = o, o = t[o];
  return n;
}
function Sr(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Sr(t);
}
function _s(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function Cr(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? Cr(t.subTree) : null;
}
const Tr = (e) => e.__isSuspense;
function ao(e, t) {
  t && t.pendingBranch ? P(e) ? t.effects.push(...e) : t.effects.push(e) : Mi(e);
}
const ce = /* @__PURE__ */ Symbol.for("v-fgt"), cn = /* @__PURE__ */ Symbol.for("v-txt"), He = /* @__PURE__ */ Symbol.for("v-cmt"), Sn = /* @__PURE__ */ Symbol.for("v-stc"), et = [];
let ue = null;
function te(e = !1) {
  et.push(ue = e ? null : []);
}
function Ar() {
  et.pop(), ue = et[et.length - 1] || null;
}
let At = 1;
function vs(e, t = !1) {
  At += e, e < 0 && ue && t && (ue.hasOnce = !0);
}
function Er(e) {
  return e.dynamicChildren = At > 0 ? ue || Xe : null, Ar(), At > 0 && ue && ue.push(e), e;
}
function se(e, t, n, s, r, i) {
  return Er(
    $(
      e,
      t,
      n,
      s,
      r,
      i,
      !0
    )
  );
}
function po(e, t, n, s, r) {
  return Er(
    Le(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Or(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function ht(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Mr = ({ key: e }) => e ?? null, Wt = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? X(e) || /* @__PURE__ */ oe(e) || j(e) ? { i: ae, r: e, k: t, f: !!n } : e : null);
function $(e, t = null, n = null, s = 0, r = null, i = e === ce ? 0 : 1, o = !1, l = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Mr(t),
    ref: t && Wt(t),
    scopeId: cr,
    slotScopeIds: null,
    children: n,
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
    shapeFlag: i,
    patchFlag: s,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: ae
  };
  return l ? (Xt(c, n), i & 128 && e.normalize(c)) : n && (c.shapeFlag |= X(n) ? 8 : 16), At > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  ue && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && ue.push(c), c;
}
const Le = ho;
function ho(e, t = null, n = null, s = 0, r = null, i = !1) {
  if ((!e || e === Bi) && (e = He), Or(e)) {
    const l = ct(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Xt(l, n), At > 0 && !i && ue && (l.shapeFlag & 6 ? ue[ue.indexOf(e)] = l : ue.push(l)), l.patchFlag = -2, l;
  }
  if (To(e) && (e = e.__vccOpts), t) {
    t = go(t);
    let { class: l, style: c } = t;
    l && !X(l) && (t.class = wt(l)), q(c) && (/* @__PURE__ */ zn(c) && !P(c) && (c = ye({}, c)), t.style = jn(c));
  }
  const o = X(e) ? 1 : Tr(e) ? 128 : ln(e) ? 64 : q(e) ? 4 : j(e) ? 2 : 0;
  return $(
    e,
    t,
    n,
    s,
    r,
    o,
    i,
    !0
  );
}
function go(e) {
  return e ? /* @__PURE__ */ zn(e) || yr(e) ? ye({}, e) : e : null;
}
function ct(e, t, n = !1, s = !1) {
  const { props: r, ref: i, patchFlag: o, children: l, transition: c } = e, d = t ? mo(r || {}, t) : r, a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: d,
    key: d && Mr(d),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && i ? P(i) ? i.concat(Wt(t)) : [i, Wt(t)] : Wt(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ce ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: c,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && ct(e.ssContent),
    ssFallback: e.ssFallback && ct(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce,
    cacheIndex: e.cacheIndex
  };
  return c && s && Gn(
    a,
    c.clone(a)
  ), a;
}
function it(e = " ", t = 0) {
  return Le(cn, null, e, t);
}
function Ge(e = "", t = !1) {
  return t ? (te(), po(He, null, e)) : Le(He, null, e);
}
function Te(e) {
  return e == null || typeof e == "boolean" ? Le(He) : P(e) ? Le(
    ce,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Or(e) ? $e(e) : Le(cn, null, String(e));
}
function $e(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : ct(e);
}
function Xt(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (P(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), Xt(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !yr(t) ? t._ctx = ae : r === 3 && ae && (ae.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else if (j(t)) {
    if (s & 65) {
      Xt(e, { default: t });
      return;
    }
    t = { default: t, _ctx: ae }, n = 32;
  } else
    t = String(t), s & 64 ? (n = 16, t = [it(t)]) : n = 8;
  e.children = t, e.shapeFlag |= n;
}
function mo(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = wt([t.class, s.class]));
      else if (r === "style")
        t.style = jn([t.style, s.style]);
      else if (Qt(r)) {
        const i = t[r], o = s[r];
        o && i !== o && !(P(i) && i.includes(o)) ? t[r] = i ? [].concat(i, o) : o : o == null && i == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !en(r) && (t[r] = o);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function we(e, t, n, s = null) {
  Me(e, t, 7, [
    n,
    s
  ]);
}
const yo = pr();
let _o = 0;
function vo(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || yo, i = {
    uid: _o++,
    vnode: e,
    type: s,
    parent: t,
    appContext: r,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Zr(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(r.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: so(s, r),
    emitsOptions: Yi(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: W,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: W,
    data: W,
    props: W,
    attrs: W,
    slots: W,
    refs: W,
    setupState: W,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Gi.bind(null, i), e.ce && e.ce(i), i;
}
let We = null;
const bo = () => We || ae;
let Zt, Et;
{
  const e = nn(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (i) => {
      r.length > 1 ? r.forEach((o) => o(i)) : r[0](i);
    };
  };
  Zt = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => We = n
  ), Et = t(
    "__VUE_SSR_SETTERS__",
    (n) => Ot = n
  );
}
const Zn = (e) => {
  const t = We;
  return Zt(e), e.scope.on(), () => {
    e.scope.off(), Zt(t);
  };
}, bs = () => {
  We && We.scope.off(), Zt(null);
};
function Ir(e) {
  return e.vnode.shapeFlag & 4;
}
let Ot = !1;
function xo(e, t = !1, n = !1) {
  t && Et(t);
  const { props: s, children: r } = e.vnode, i = Ir(e);
  to(e, s, i, t), io(e, r, n || t);
  const o = i ? wo(e, t) : void 0;
  return t && Et(!1), o;
}
function wo(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Wi);
  const { setup: s } = n;
  if (s) {
    Ke();
    const r = e.setupContext = s.length > 1 ? Co(e) : null, i = Zn(e), o = It(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), l = Ns(o);
    if (Ue(), i(), (l || e.sp) && !bt(e) && ki(e), l) {
      if (o.then(bs, bs), t)
        return o.then((c) => {
          Et(!0);
          try {
            xs(e, c, t);
          } finally {
            Et(!1);
          }
        }).catch((c) => {
          on(c, e, 0);
        });
      e.asyncDep = o;
    } else
      xs(e, o);
  } else
    Rr(e);
}
function xs(e, t, n) {
  j(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : q(t) && (e.setupState = rr(t)), Rr(e);
}
function Rr(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Ze);
}
const So = {
  get(e, t) {
    return re(e, "get", ""), e[t];
  }
};
function Co(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, So),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function un(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(rr(_i(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in xt)
        return xt[n](e);
    },
    has(t, n) {
      return n in t || n in xt;
    }
  })) : e.proxy;
}
function To(e) {
  return j(e) && "__vccOpts" in e;
}
const st = (e, t) => /* @__PURE__ */ Si(e, t, Ot), Ao = "3.5.43";
let Dn;
const ws = typeof window < "u" && window.trustedTypes;
if (ws)
  try {
    Dn = /* @__PURE__ */ ws.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Pr = Dn ? (e) => Dn.createHTML(e) : (e) => e, Eo = "http://www.w3.org/2000/svg", Oo = "http://www.w3.org/1998/Math/MathML", Fe = typeof document < "u" ? document : null, Ss = Fe && /* @__PURE__ */ Fe.createElement("template"), Mo = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Fe.createElementNS(Eo, e) : t === "mathml" ? Fe.createElementNS(Oo, e) : n ? Fe.createElement(e, { is: n }) : Fe.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Fe.createTextNode(e),
  createComment: (e) => Fe.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Fe.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, s, r, i) {
    const o = n ? n.previousSibling : t.lastChild;
    if (r && (r === i || r.nextSibling))
      for (; t.insertBefore(r.cloneNode(!0), n), !(r === i || !(r = r.nextSibling)); )
        ;
    else {
      Ss.innerHTML = Pr(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Ss.content;
      if (s === "svg" || s === "mathml") {
        const c = l.firstChild;
        for (; c.firstChild; )
          l.appendChild(c.firstChild);
        l.removeChild(c);
      }
      t.insertBefore(l, n);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, Io = /* @__PURE__ */ Symbol("_vtc");
function Ro(e, t, n) {
  const s = e[Io];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Cs = /* @__PURE__ */ Symbol("_vod"), Po = /* @__PURE__ */ Symbol("_vsh"), Fo = /* @__PURE__ */ Symbol(""), $o = /(?:^|;)\s*display\s*:/;
function Do(e, t, n) {
  const s = e.style, r = X(n);
  let i = !1;
  if (n && !r) {
    if (t)
      if (X(t))
        for (const o of t.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          n[l] == null && gt(s, l, "");
        }
      else
        for (const o in t)
          n[o] == null && gt(s, o, "");
    for (const o in n) {
      o === "display" && (i = !0);
      const l = n[o];
      l != null ? Lo(
        e,
        o,
        !X(t) && t ? t[o] : void 0,
        l
      ) || gt(s, o, l) : gt(s, o, "");
    }
  } else if (r) {
    if (t !== n) {
      const o = s[Fo];
      o && (n += ";" + o), s.cssText = n, i = $o.test(n);
    }
  } else t && e.removeAttribute("style");
  Cs in e && (e[Cs] = i ? s.display : "", e[Po] && (s.display = "none"));
}
const Vt = /\s*!important$/;
function gt(e, t, n) {
  if (P(n))
    n.forEach((s) => gt(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    Vt.test(n) ? e.setProperty(t, n.replace(Vt, ""), "important") : e.setProperty(t, n);
  else {
    const s = No(e, t);
    Vt.test(n) ? e.setProperty(
      tt(s),
      n.replace(Vt, ""),
      "important"
    ) : e[s] = n;
  }
}
const Ts = ["Webkit", "Moz", "ms"], Cn = {};
function No(e, t) {
  const n = Cn[t];
  if (n)
    return n;
  let s = ge(t);
  if (s !== "filter" && s in e)
    return Cn[t] = s;
  s = js(s);
  for (let r = 0; r < Ts.length; r++) {
    const i = Ts[r] + s;
    if (i in e)
      return Cn[t] = i;
  }
  return t;
}
function Lo(e, t, n, s) {
  return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && X(s) && n === s;
}
const As = "http://www.w3.org/1999/xlink";
function Es(e, t, n, s, r, i = Gr(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(As, t.slice(6, t.length)) : e.setAttributeNS(As, t, n) : n == null || i && !Vs(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : Ee(n) ? String(n) : n
  );
}
function Os(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Pr(n) : n);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const l = i === "OPTION" ? e.getAttribute("value") || "" : e.value, c = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (l !== c || !("_value" in e)) && (e.value = c), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let o = !1;
  if (n === "" || n == null) {
    const l = typeof e[t];
    l === "boolean" ? n = Vs(n) : n == null && l === "string" ? (n = "", o = !0) : l === "number" && (n = 0, o = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  o && e.removeAttribute(r || t);
}
function ot(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function Ho(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const Ms = /* @__PURE__ */ Symbol("_vei");
function jo(e, t, n, s, r = null) {
  const i = e[Ms] || (e[Ms] = {}), o = i[t];
  if (s && o)
    o.value = s;
  else {
    const [l, c] = Ko(t);
    if (s) {
      const d = i[t] = Wo(
        s,
        r
      );
      ot(e, l, d, c);
    } else o && (Ho(e, l, o, c), i[t] = void 0);
  }
}
const ko = /(Once|Passive|Capture)$/, Vo = /^on:?(?:Once|Passive|Capture)$/;
function Ko(e) {
  let t, n;
  for (; (n = e.match(ko)) && !Vo.test(e); )
    t || (t = {}), e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
  return [e[2] === ":" ? e.slice(3) : tt(e.slice(2)), t];
}
let Tn = 0;
const Uo = /* @__PURE__ */ Promise.resolve(), Bo = () => Tn || (Uo.then(() => Tn = 0), Tn = Date.now());
function Wo(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    const r = n.value;
    if (P(r)) {
      const i = s.stopImmediatePropagation;
      s.stopImmediatePropagation = () => {
        i.call(s), s._stopped = !0;
      };
      const o = r.slice(), l = [s];
      for (let c = 0; c < o.length && !s._stopped; c++) {
        const d = o[c];
        d && Me(
          d,
          t,
          5,
          l
        );
      }
    } else
      Me(
        r,
        t,
        5,
        [s]
      );
  };
  return n.value = e, n.attached = Bo(), n;
}
const Is = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, qo = (e, t, n, s, r, i) => {
  const o = r === "svg";
  t === "class" ? Ro(e, s, o) : t === "style" ? Do(e, n, s) : Qt(t) ? en(t) || jo(e, t, n, s, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : zo(e, t, s, o)) ? (Os(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Es(e, t, s, o, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (Jo(e, t) || // @ts-expect-error _def is private
  e._def.__asyncLoader && (/[A-Z]/.test(t) || !X(s))) ? Os(e, ge(t), s, i, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), Es(e, t, s, o));
};
function zo(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Is(t) && j(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return Is(t) && X(n) ? !1 : t in e;
}
function Jo(e, t) {
  const n = (
    // @ts-expect-error _def is private
    e._def.props
  );
  if (!n)
    return !1;
  const s = ge(t);
  return Array.isArray(n) ? n.some((r) => ge(r) === s) : Object.keys(n).some((r) => ge(r) === s);
}
const Rs = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return P(t) ? (n) => Bt(t, n) : t;
};
function Go(e) {
  e.target.composing = !0;
}
function Ps(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Kt = /* @__PURE__ */ Symbol("_assign"), Ut = /* @__PURE__ */ Symbol("_initialValue");
function An(e, t, n) {
  return t && (e = e.trim()), n && (e = Hn(e)), e;
}
const Yo = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e.parentNode && (e.type === "text" ? e[Ut] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Ut] = e.defaultValue.replace(/\r\n?/g, `
`))), e[Kt] = Rs(r);
    const i = s || r.props && r.props.type === "number";
    ot(e, t ? "change" : "input", (o) => {
      o.target.composing || e[Kt](An(e.value, n, i));
    }), (n || i) && ot(e, "change", () => {
      e.value = An(e.value, n, i);
    }), t || (ot(e, "compositionstart", Go), ot(e, "compositionend", Ps), ot(e, "change", Ps));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t, modifiers: { trim: n, number: s } }) {
    const r = t ?? "", i = e[Ut];
    delete e[Ut], i !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== i ? e[Kt](An(e.value, n, s)) : e.value = r;
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: i } }, o) {
    if (e[Kt] = Rs(o), e.composing) return;
    const l = (i || e.type === "number") && !/^0\d/.test(e.value) ? Hn(e.value) : e.value, c = t ?? "";
    if (l === c)
      return;
    const d = e.getRootNode();
    (d instanceof Document || d instanceof ShadowRoot) && d.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === c) || (e.value = c);
  }
}, Xo = ["ctrl", "shift", "alt", "meta"], Zo = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => Xo.some((n) => e[`${n}Key`] && !t.includes(n))
}, Qo = (e, t) => {
  if (!e) return e;
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = ((r, ...i) => {
    for (let o = 0; o < t.length; o++) {
      const l = Zo[t[o]];
      if (l && l(r, t)) return;
    }
    return e(r, ...i);
  }));
}, el = /* @__PURE__ */ ye({ patchProp: qo }, Mo);
let Fs;
function tl() {
  return Fs || (Fs = lo(el));
}
const nl = ((...e) => {
  const t = tl().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = rl(s);
    if (!r) return;
    const i = t._component;
    !j(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const o = n(r, !1, sl(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), o;
  }, t;
});
function sl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function rl(e) {
  return X(e) ? document.querySelector(e) : e;
}
const il = '.plenio-overlay{position:fixed;inset:0;z-index:3000;background:#0000008c;display:flex;align-items:center;justify-content:center;font:13px/1.45 var(--font-family, sans-serif)}.plenio-overlay .plenio-dialog{width:min(920px,94vw);max-height:92vh;display:flex;flex-direction:column;background:var(--comfy-menu-bg, #222);color:var(--fg-color, #ddd);border:1px solid var(--border-color, #444);border-radius:10px;box-shadow:0 12px 40px #0000007f}.plenio-overlay header,.plenio-overlay footer,.plenio-overlay .doc-head{display:flex;align-items:center;gap:8px}.plenio-overlay header{padding:12px 16px;border-bottom:1px solid var(--border-color, #444)}.plenio-overlay header h2{margin:0;font-size:16px}.plenio-overlay .status{color:var(--descrip-text, #999)}.plenio-overlay .status.bad,.plenio-overlay .error{color:#e0685e}.plenio-overlay .spacer{flex:1}.plenio-overlay .body{overflow:auto;padding:8px 16px}.plenio-overlay .hint{margin:8px 16px 0;color:var(--descrip-text, #999)}.plenio-overlay .doc{margin:10px 0 14px}.plenio-overlay .doc h3{margin:0;font-size:13px}.plenio-overlay .badge{font-size:11px;padding:1px 7px;border-radius:9px;background:var(--comfy-input-bg, #333);color:var(--descrip-text, #aaa)}.plenio-overlay .badge[data-state=edited],.plenio-overlay .badge[data-state="edited (merged)"]{background:#2f5f8a;color:#fff}.plenio-overlay .badge[data-state=manual]{background:#7a5a1e;color:#fff}.plenio-overlay .badge[data-state=conflict]{background:#8a2f2f;color:#fff}.plenio-overlay textarea,.plenio-overlay pre{box-sizing:border-box;width:100%;margin-top:6px;padding:8px;border-radius:6px;border:1px solid var(--border-color, #444);background:var(--comfy-input-bg, #1b1b1b);color:var(--input-text, #ddd);font:inherit;resize:vertical}.plenio-overlay pre{white-space:pre-wrap;max-height:220px;overflow:auto}.plenio-overlay .mono,.plenio-overlay pre{font-family:var(--code-font, ui-monospace, monospace);font-size:12px}.plenio-overlay .conflict{margin-top:6px;padding:8px;border-radius:6px;background:#8a2f2f40}.plenio-overlay .findings{padding:4px 16px;max-height:22vh;overflow:auto;border-top:1px solid var(--border-color, #444)}.plenio-overlay .findings ul{margin:6px 0;padding-left:18px}.plenio-overlay li[data-severity=error] strong{color:#e0685e}.plenio-overlay li[data-severity=warning] strong{color:#d8a31a}.plenio-overlay li[data-severity=info],.plenio-overlay .where{color:var(--descrip-text, #999)}.plenio-overlay footer{padding:10px 16px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .facts{color:var(--descrip-text, #999)}.plenio-overlay button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);cursor:pointer}.plenio-overlay button:disabled{opacity:.45;cursor:default}.plenio-overlay button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button.icon{margin-left:auto;font-size:18px;line-height:1;padding:2px 8px}';
class Fr extends Error {
  constructor(t, n = null) {
    super(t), this.hint = n;
  }
  hint;
}
async function ol(e, t, n) {
  const s = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  }), r = await s.json();
  if (!s.ok) {
    const i = r?.error ?? {};
    throw new Fr(i.message ?? `Request failed (${s.status})`, i.hint ?? null);
  }
  return r;
}
function ll(e, t) {
  return ol(e, "/plenio/sheet/resolve", t);
}
const fl = ["aria-label"], cl = {
  key: 0,
  class: "hint"
}, ul = { class: "body" }, al = { class: "doc-head" }, dl = ["data-state"], pl = ["disabled", "onClick"], hl = ["onClick"], gl = {
  key: 0,
  class: "conflict"
}, ml = ["onClick"], yl = ["onClick"], _l = ["onClick"], vl = ["onUpdate:modelValue", "rows", "onInput"], bl = { key: 1 }, xl = { class: "doc-head" }, wl = { class: "findings" }, Sl = {
  key: 0,
  class: "error"
}, Cl = {
  key: 1,
  class: "error"
}, Tl = ["data-severity"], Al = { class: "where" }, El = {
  key: 0,
  class: "facts"
}, Ol = ["disabled"], Ml = ["disabled"], Il = /* @__PURE__ */ ji({
  __name: "SheetDialog",
  props: {
    title: {},
    state: {},
    payload: {},
    owned: {},
    review: {},
    fetcher: {}
  },
  emits: ["apply", "close"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = {
      title: "Title",
      style: "Style",
      lyrics: "Lyrics",
      score: "Score (ABC)",
      artwork_prompt: "Artwork prompt"
    }, i = { title: 1, style: 3, lyrics: 14, score: 18, artwork_prompt: 3 }, o = /* @__PURE__ */ Wn(Lr(n.state, n.payload, n.owned)), l = /* @__PURE__ */ vn(n.payload), c = /* @__PURE__ */ vn(null), d = /* @__PURE__ */ vn(!1);
    let a;
    const g = (E) => n.payload?.docs[E] ?? null, S = (E) => g(E)?.upstream ?? null, C = (E) => g(E)?.status === "conflict";
    function L(E) {
      if (E.intent === "auto") return "auto";
      if (E.intent === "manual") return "manual";
      if (E.intent === "rebase") return "edited (merged)";
      if (C(E.kind)) return "conflict";
      const z = n.state.docs[E.kind]?.state ?? "auto", R = Nt(S(E.kind) ?? "");
      return z === "auto" && Nt(E.text) !== R ? R || !n.payload ? "edited" : "manual" : z;
    }
    function I(E) {
      E.intent = "auto", E.text = S(E.kind) ?? "";
    }
    function J(E) {
      E.intent = "manual";
    }
    function B(E) {
      E.intent = "manual";
    }
    function D(E) {
      E.intent = "rebase";
    }
    function K(E) {
      E.intent === "auto" && (E.intent = "keep");
    }
    const A = st(
      () => o.filter((E) => C(E.kind) && E.intent === "keep").map((E) => E.kind)
    ), G = st(() => jr(n.state, n.payload, o)), he = st(() => (l.value?.findings ?? []).filter((E) => E.severity !== "info")), _e = st(() => (l.value?.findings ?? []).filter((E) => E.severity === "info")), Ie = st(() => he.value.some((E) => E.severity === "error")), Rt = st(
      () => !d.value && !Ie.value && !A.value.length && !!l.value?.fingerprint
    );
    async function qe() {
      if (n.payload) {
        d.value = !0, c.value = null;
        try {
          l.value = await ll(n.fetcher, {
            sheet_state: G.value,
            upstream: Hr(n.payload),
            owned: n.owned,
            review: n.review,
            engine: n.payload.engine,
            instrumental: n.payload.instrumental,
            context: n.payload.context,
            target_seconds: n.payload.target_seconds ?? null
          });
        } catch (E) {
          c.value = E instanceof Fr ? `${E.message}${E.hint ? ` — ${E.hint}` : ""}` : String(E);
        } finally {
          d.value = !1;
        }
      }
    }
    Di(
      () => o.map((E) => E.text + E.intent).join("\0"),
      () => {
        clearTimeout(a), a = setTimeout(qe, 300);
      }
    );
    function Pt() {
      s("apply", is(G.value, n.state.review?.approved_fingerprint ?? null));
    }
    async function an() {
      await qe(), Rt.value && s("apply", is(G.value, l.value?.fingerprint ?? null));
    }
    function Ft(E) {
      E.key === "Escape" && s("close");
    }
    return Ki(() => {
      window.addEventListener("keydown", Ft), n.payload && qe();
    }), Ui(() => {
      window.removeEventListener("keydown", Ft), clearTimeout(a);
    }), (E, z) => (te(), se("div", {
      class: "plenio-overlay",
      onMousedown: z[2] || (z[2] = Qo((R) => s("close"), ["self"]))
    }, [
      $("div", {
        class: "plenio-dialog",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": e.title
      }, [
        $("header", null, [
          $("h2", null, ee(e.title), 1),
          $("span", {
            class: wt(["status", { bad: Ie.value || A.value.length }])
          }, ee(l.value?.status ?? "not run yet"), 3),
          $("button", {
            class: "icon",
            title: "Close (Esc)",
            onClick: z[0] || (z[0] = (R) => s("close"))
          }, "×")
        ]),
        e.payload ? Ge("", !0) : (te(), se("p", cl, [...z[3] || (z[3] = [
          it(" This sheet has not run yet, so there are no drafts to show. Run the workflow once, or enter text and use ", -1),
          $("em", null, "Make manual", -1),
          it(". ", -1)
        ])])),
        $("div", ul, [
          (te(!0), se(ce, null, kt(o, (R) => (te(), se("section", {
            key: R.kind,
            class: "doc"
          }, [
            $("div", al, [
              $("h3", null, ee(r[R.kind]), 1),
              $("span", {
                class: "badge",
                "data-state": L(R)
              }, ee(L(R)), 9, dl),
              z[4] || (z[4] = $("span", { class: "spacer" }, null, -1)),
              $("button", {
                disabled: S(R.kind) === null,
                onClick: (Z) => I(R)
              }, "Use draft", 8, pl),
              $("button", {
                onClick: (Z) => J(R)
              }, "Make manual", 8, hl)
            ]),
            C(R.kind) && R.intent === "keep" ? (te(), se("div", gl, [
              it(" The draft changed after you edited this document (" + ee(g(R.kind)?.reason) + "). ", 1),
              $("button", {
                onClick: (Z) => B(R)
              }, "Keep my edit (manual)", 8, ml),
              $("button", {
                onClick: (Z) => I(R)
              }, "Use the new draft", 8, yl),
              $("button", {
                onClick: (Z) => D(R)
              }, "Merge by hand", 8, _l)
            ])) : Ge("", !0),
            Ri($("textarea", {
              "onUpdate:modelValue": (Z) => R.text = Z,
              rows: i[R.kind],
              class: wt({ mono: R.kind === "score" }),
              spellcheck: "false",
              onInput: (Z) => K(R)
            }, null, 42, vl), [
              [Yo, R.text]
            ]),
            S(R.kind) !== null && Pn(Nt)(S(R.kind) ?? "") !== Pn(Nt)(R.text) ? (te(), se("details", bl, [
              z[5] || (z[5] = $("summary", null, "Current draft", -1)),
              $("pre", null, ee(S(R.kind)), 1)
            ])) : Ge("", !0)
          ]))), 128)),
          (te(!0), se(ce, null, kt(e.payload?.context ?? {}, (R, Z) => (te(), se("section", {
            key: "context-" + Z,
            class: "doc context"
          }, [
            $("div", xl, [
              $("h3", null, ee(r[Z] ?? Z), 1),
              z[6] || (z[6] = $("span", { class: "badge" }, "from the text sheet (read-only)", -1))
            ]),
            $("pre", null, ee(R), 1)
          ]))), 128))
        ]),
        $("section", wl, [
          c.value ? (te(), se("p", Sl, ee(c.value), 1)) : Ge("", !0),
          A.value.length ? (te(), se("p", Cl, " Resolve the conflict in: " + ee(A.value.join(", ")) + ". ", 1)) : Ge("", !0),
          $("ul", null, [
            (te(!0), se(ce, null, kt(he.value, (R, Z) => (te(), se("li", {
              key: Z,
              "data-severity": R.severity
            }, [
              $("strong", null, ee(R.severity), 1),
              z[7] || (z[7] = it()),
              $("span", Al, ee(R.where), 1),
              it(" " + ee(R.message), 1)
            ], 8, Tl))), 128)),
            (te(!0), se(ce, null, kt(_e.value, (R, Z) => (te(), se("li", {
              key: "i" + Z,
              "data-severity": "info"
            }, ee(R.message), 1))), 128))
          ])
        ]),
        $("footer", null, [
          e.owned.includes("score") && l.value ? (te(), se("span", El, " render: " + ee(l.value.planning_mode) + ", ceiling " + ee(Math.round(l.value.score_seconds)) + " s ", 1)) : Ge("", !0),
          z[8] || (z[8] = $("span", { class: "spacer" }, null, -1)),
          $("button", {
            onClick: z[1] || (z[1] = (R) => s("close"))
          }, "Cancel"),
          $("button", {
            class: "primary",
            disabled: !!A.value.length,
            onClick: Pt
          }, "Apply", 8, Ol),
          e.review === "stop for review" ? (te(), se("button", {
            key: 1,
            class: "primary",
            disabled: !Rt.value,
            onClick: an
          }, " Approve ", 8, Ml)) : Ge("", !0)
        ])
      ], 8, fl)
    ], 32));
  }
});
function Rl() {
  if (document.getElementById("plenio-dialog-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-dialog-styles", e.textContent = il, document.head.append(e);
}
function $l(e) {
  Rl();
  const t = document.createElement("div");
  document.body.append(t);
  const n = () => {
    s.unmount(), t.remove();
  }, s = nl(Il, {
    title: e.title,
    state: e.state,
    payload: e.payload,
    owned: e.owned,
    review: e.review,
    fetcher: e.fetcher,
    onApply: (r) => {
      e.onApply(r), n();
    },
    onClose: n
  });
  return s.mount(t), n;
}
export {
  $l as openSheetDialog
};
