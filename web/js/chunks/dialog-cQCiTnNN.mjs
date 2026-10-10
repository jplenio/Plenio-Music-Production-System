// @__NO_SIDE_EFFECTS__
function So(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const o of e.split(",")) t[o] = 1;
  return (o) => o in t;
}
const V = {}, We = [], qe = () => {
}, kr = () => !1, Dt = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), $t = (e) => e.startsWith("onUpdate:"), ae = Object.assign, Ar = (e, t) => {
  const o = e.indexOf(t);
  o > -1 && e.splice(o, 1);
}, Hn = Object.prototype.hasOwnProperty, $ = (e, t) => Hn.call(e, t), M = Array.isArray, je = (e) => _t(e) === "[object Map]", Me = (e) => _t(e) === "[object Set]", Yo = (e) => _t(e) === "[object Date]", j = (e) => typeof e == "function", W = (e) => typeof e == "string", fe = (e) => typeof e == "symbol", L = (e) => e !== null && typeof e == "object", Er = (e) => (L(e) || j(e)) && j(e.then) && j(e.catch), Or = Object.prototype.toString, _t = (e) => Or.call(e), zn = (e) => _t(e).slice(8, -1), Mr = (e) => _t(e) === "[object Object]", Co = (e) => W(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ct = /* @__PURE__ */ So(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ht = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((o) => t[o] || (t[o] = e(o)));
}, Ln = /-\w/g, ie = Ht(
  (e) => e.replace(Ln, (t) => t.slice(1).toUpperCase())
), Kn = /\B([A-Z])/g, Pe = Ht(
  (e) => e.replace(Kn, "-$1").toLowerCase()
), Ir = Ht((e) => e.charAt(0).toUpperCase() + e.slice(1)), eo = Ht(
  (e) => e ? `on${Ir(e)}` : ""
), J = (e, t) => !Object.is(e, t), Mt = (e, ...t) => {
  for (let o = 0; o < e.length; o++)
    e[o](...t);
}, Pr = (e, t, o, r = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: r,
    value: o
  });
}, zt = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Xo;
const Lt = () => Xo || (Xo = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function To(e) {
  if (M(e)) {
    const t = {};
    for (let o = 0; o < e.length; o++) {
      const r = e[o], n = W(r) ? qn(r) : To(r);
      if (n)
        for (const i in n)
          t[i] = n[i];
    }
    return t;
  } else if (W(e) || L(e))
    return e;
}
const Un = /;(?![^(]*\))/g, Bn = /:([^]+)/, Wn = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function qn(e) {
  const t = {};
  return e.replace(Wn, (o) => o.startsWith("/*") ? "" : o).split(Un).forEach((o) => {
    if (o) {
      const r = o.split(Bn);
      r.length > 1 && (t[r[0].trim()] = r[1].trim());
    }
  }), t;
}
function ko(e) {
  let t = "";
  if (W(e))
    t = e;
  else if (M(e))
    for (let o = 0; o < e.length; o++) {
      const r = ko(e[o]);
      r && (t += r + " ");
    }
  else if (L(e))
    for (const o in e)
      e[o] && (t += o + " ");
  return t.trim();
}
const Gn = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", Jn = /* @__PURE__ */ So(Gn);
function Rr(e) {
  return !!e || e === "";
}
function Yn(e, t, o) {
  if (e.length !== t.length) return !1;
  let r = !0;
  for (let n = 0; r && n < e.length; n++)
    r = Ie(e[n], t[n], o);
  return r;
}
function Zo(e, t, o) {
  if (e.size !== t.size) return !1;
  const r = Array.from(t), n = new Uint8Array(r.length);
  for (const i of e) {
    let l = -1;
    for (let s = 0; s < r.length; s++)
      if (!n[s] && Ie(i, r[s], o)) {
        l = s;
        break;
      }
    if (l < 0) return !1;
    n[l] = 1;
  }
  return !0;
}
function Xn(e, t, o) {
  let r = je(e), n = je(t);
  if (r || n || (r = Me(e), n = Me(t), r || n))
    return r && n ? Zo(e, t, o) : !1;
  const i = Object.keys(e).length, l = Object.keys(t).length;
  if (i !== l)
    return !1;
  for (const s in e) {
    const c = e.hasOwnProperty(s), u = t.hasOwnProperty(s);
    if (c && !u || !c && u || !Ie(e[s], t[s], o))
      return !1;
  }
  return String(e) === String(t);
}
function Qo(e, t, o, r) {
  o || (o = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
  const [n, i] = o;
  if (n.has(e) || i.has(t))
    return n.get(e) === t && i.get(t) === e;
  n.set(e, t), i.set(t, e);
  const l = r(e, t, o);
  return n.delete(e), i.delete(t), l;
}
function Ie(e, t, o) {
  if (e === t) return !0;
  let r = Yo(e), n = Yo(t);
  return r || n ? r && n ? e.getTime() === t.getTime() : !1 : (r = fe(e), n = fe(t), r || n ? e === t : (r = M(e), n = M(t), r || n ? r && n ? Qo(e, t, o, Yn) : !1 : (r = L(e), n = L(t), r || n ? !r || !n ? !1 : Qo(e, t, o, Xn) : String(e) === String(t))));
}
function Ao(e, t) {
  return e.findIndex((o) => Ie(o, t));
}
const Fr = (e) => !!(e && e.__v_isRef === !0), Zn = (e) => W(e) ? e : e == null ? "" : M(e) || L(e) && (e.toString === Or || !j(e.toString)) ? Fr(e) ? Zn(e.value) : JSON.stringify(e, Vr, 2) : String(e), Vr = (e, t) => Fr(t) ? Vr(e, t.value) : je(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (o, [r, n], i) => (o[to(r, i) + " =>"] = n, o),
    {}
  )
} : Me(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((o) => to(o))
} : fe(t) ? to(t) : L(t) && !M(t) && !Mr(t) ? String(t) : t, to = (e, t = "") => {
  var o;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    fe(e) ? `Symbol(${(o = e.description) != null ? o : t})` : e
  );
};
let G;
class Qn {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && G && (G.active ? (this.parent = G, this.index = (G.scopes || (G.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, o;
      if (this.scopes) {
        const r = this.scopes.slice();
        for (t = 0, o = r.length; t < o; t++)
          r[t].pause();
      }
      for (t = 0, o = this.effects.length; t < o; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, o;
      if (this.scopes) {
        const n = this.scopes.slice();
        for (t = 0, o = n.length; t < o; t++)
          n[t].resume();
      }
      const r = this.effects.slice();
      for (t = 0, o = r.length; t < o; t++)
        r[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const o = G;
      try {
        return G = this, t();
      } finally {
        G = o;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = G, G = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (G === this)
        G = this.prevScope;
      else {
        let t = G;
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
      let o, r;
      for (o = 0, r = this.effects.length; o < r; o++)
        this.effects[o].stop();
      for (this.effects.length = 0, o = 0, r = this.cleanups.length; o < r; o++)
        this.cleanups[o]();
      if (this.cleanups.length = 0, this.scopes) {
        const n = this.scopes.slice();
        for (o = 0, r = n.length; o < r; o++)
          n[o].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const n = this.parent.scopes.pop();
        n && n !== this && (this.parent.scopes[this.index] = n, n.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function ei() {
  return G;
}
let H;
const oo = /* @__PURE__ */ new WeakSet();
class Nr {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, G && (G.active ? G.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, oo.has(this) && (oo.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Dr(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, er(this), $r(this);
    const t = H, o = ce;
    H = this, ce = !0;
    try {
      return this.fn();
    } finally {
      Hr(this), H = t, ce = o, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Mo(t);
      this.deps = this.depsTail = void 0, er(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? oo.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    uo(this) && this.run();
  }
  get dirty() {
    return uo(this);
  }
}
let jr = 0, ft, pt;
function Dr(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = pt, pt = e;
    return;
  }
  e.next = ft, ft = e;
}
function Eo() {
  jr++;
}
function Oo() {
  if (--jr > 0)
    return;
  if (pt) {
    let t = pt;
    for (pt = void 0; t; ) {
      const o = t.next;
      t.next = void 0, t.flags &= -9, t = o;
    }
  }
  let e;
  for (; ft; ) {
    let t = ft;
    for (ft = void 0; t; ) {
      const o = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (r) {
          e || (e = r);
        }
      t = o;
    }
  }
  if (e) throw e;
}
function $r(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Hr(e) {
  let t, o = e.depsTail, r = o;
  for (; r; ) {
    const n = r.prevDep;
    r.version === -1 ? (r === o && (o = n), Mo(r), ti(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = n;
  }
  e.deps = t, e.depsTail = o;
}
function uo(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (zr(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function zr(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ht) || (e.globalVersion = ht, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !uo(e))))
    return;
  e.flags |= 2;
  const t = e.dep, o = H, r = ce;
  H = e, ce = !0;
  try {
    $r(e);
    const n = e.fn(e._value);
    (t.version === 0 || J(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
  } catch (n) {
    throw t.version++, n;
  } finally {
    H = o, ce = r, Hr(e), e.flags &= -3;
  }
}
function Mo(e, t = !1) {
  const { dep: o, prevSub: r, nextSub: n } = e;
  if (r && (r.nextSub = n, e.prevSub = void 0), n && (n.prevSub = r, e.nextSub = void 0), o.subs === e && (o.subs = r, !r && o.computed)) {
    o.computed.flags &= -5;
    for (let i = o.computed.deps; i; i = i.nextDep)
      Mo(i, !0);
  }
  !t && !--o.sc && o.map && o.map.delete(o.key);
}
function ti(e) {
  const { prevDep: t, nextDep: o } = e;
  t && (t.nextDep = o, e.prevDep = void 0), o && (o.prevDep = t, e.nextDep = void 0);
}
let ce = !0;
const Lr = [];
function $e() {
  Lr.push(ce), ce = !1;
}
function He() {
  const e = Lr.pop();
  ce = e === void 0 ? !0 : e;
}
function er(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const o = H;
    H = void 0;
    try {
      t();
    } finally {
      H = o;
    }
  }
}
let ht = 0;
class oi {
  constructor(t, o) {
    this.sub = t, this.dep = o, this.version = o.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Kt {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!H || !ce || H === this.computed)
      return;
    let o = this.activeLink;
    if (o === void 0 || o.sub !== H)
      o = this.activeLink = new oi(H, this), H.deps ? (o.prevDep = H.depsTail, H.depsTail.nextDep = o, H.depsTail = o) : H.deps = H.depsTail = o, Kr(o);
    else if (o.version === -1 && (o.version = this.version, o.nextDep)) {
      const r = o.nextDep;
      r.prevDep = o.prevDep, o.prevDep && (o.prevDep.nextDep = r), o.prevDep = H.depsTail, o.nextDep = void 0, H.depsTail.nextDep = o, H.depsTail = o, H.deps === o && (H.deps = r);
    }
    return o;
  }
  trigger(t) {
    this.version++, ht++, this.notify(t);
  }
  notify(t) {
    Eo();
    try {
      for (let o = this.subs; o; o = o.prevSub)
        o.sub.notify() && o.sub.dep.notify();
    } finally {
      Oo();
    }
  }
}
function Kr(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let r = t.deps; r; r = r.nextDep)
        Kr(r);
    }
    const o = e.dep.subs;
    o !== e && (e.prevSub = o, o && (o.nextSub = e)), e.dep.subs = e;
  }
}
const ho = /* @__PURE__ */ new WeakMap(), Ge = /* @__PURE__ */ Symbol(
  ""
), go = /* @__PURE__ */ Symbol(
  ""
), gt = /* @__PURE__ */ Symbol(
  ""
);
function X(e, t, o) {
  if (ce && H) {
    let r = ho.get(e);
    r || ho.set(e, r = /* @__PURE__ */ new Map());
    let n = r.get(o);
    n || (r.set(o, n = new Kt()), n.map = r, n.key = o), n.track();
  }
}
function Ae(e, t, o, r, n, i) {
  const l = ho.get(e);
  if (!l) {
    ht++;
    return;
  }
  const s = (c) => {
    c && c.trigger();
  };
  if (Eo(), t === "clear")
    l.forEach(s);
  else {
    const c = M(e), u = c && Co(o);
    if (c && o === "length") {
      const p = Number(r);
      l.forEach((h, S) => {
        (S === "length" || S === gt || !fe(S) && S >= p) && s(h);
      });
    } else
      switch ((o !== void 0 || l.has(void 0)) && s(l.get(o)), u && s(l.get(gt)), t) {
        case "add":
          c ? u && s(l.get("length")) : (s(l.get(Ge)), je(e) && s(l.get(go)));
          break;
        case "delete":
          c || (s(l.get(Ge)), je(e) && s(l.get(go)));
          break;
        case "set":
          je(e) && s(l.get(Ge));
          break;
      }
  }
  Oo();
}
function Ye(e) {
  const t = /* @__PURE__ */ F(e);
  return t === e || (X(t, "iterate", gt), /* @__PURE__ */ le(e)) ? t : /* @__PURE__ */ be(e) ? /* @__PURE__ */ De(e) ? t.map((o) => ze(se(o))) : t.map(ze) : t.map(se);
}
function Ut(e) {
  return X(e = /* @__PURE__ */ F(e), "iterate", gt), e;
}
function ye(e, t) {
  return /* @__PURE__ */ be(e) ? ze(/* @__PURE__ */ De(e) ? se(t) : t) : se(t);
}
const ri = {
  __proto__: null,
  [Symbol.iterator]() {
    return ro(this, Symbol.iterator, (e) => ye(this, e));
  },
  concat(...e) {
    return Ye(this).concat(
      ...e.map((t) => M(t) ? Ye(t) : t)
    );
  },
  entries() {
    return ro(this, "entries", (e) => (e[1] = ye(this, e[1]), e));
  },
  every(e, t) {
    return Ce(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ce(
      this,
      "filter",
      e,
      t,
      (o) => o.map((r) => ye(this, r)),
      arguments
    );
  },
  find(e, t) {
    return Ce(
      this,
      "find",
      e,
      t,
      (o) => ye(this, o),
      arguments
    );
  },
  findIndex(e, t) {
    return Ce(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ce(
      this,
      "findLast",
      e,
      t,
      (o) => ye(this, o),
      arguments
    );
  },
  findLastIndex(e, t) {
    return Ce(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Ce(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return no(this, "includes", e);
  },
  indexOf(...e) {
    return no(this, "indexOf", e);
  },
  join(e) {
    return Ye(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return no(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Ce(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return lt(this, "pop");
  },
  push(...e) {
    return lt(this, "push", e);
  },
  reduce(e, ...t) {
    return tr(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return tr(this, "reduceRight", e, t);
  },
  shift() {
    return lt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ce(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return lt(this, "splice", e);
  },
  toReversed() {
    return Ye(this).toReversed();
  },
  toSorted(e) {
    return Ye(this).toSorted(e);
  },
  toSpliced(...e) {
    return Ye(this).toSpliced(...e);
  },
  unshift(...e) {
    return lt(this, "unshift", e);
  },
  values() {
    return ro(this, "values", (e) => ye(this, e));
  }
};
function ro(e, t, o) {
  const r = Ut(e), n = r[t]();
  return r !== e && !/* @__PURE__ */ le(e) && (n._next = n.next, n.next = () => {
    const i = n._next();
    return i.done || (i.value = o(i.value)), i;
  }), n;
}
const ni = Array.prototype;
function Ce(e, t, o, r, n, i) {
  const l = Ut(e), s = l !== e && !/* @__PURE__ */ le(e), c = l[t];
  if (c !== ni[t]) {
    const h = c.apply(e, i);
    return s ? se(h) : h;
  }
  let u = o;
  l !== e && (s ? u = function(h, S) {
    return o.call(this, ye(e, h), S, e);
  } : o.length > 2 && (u = function(h, S) {
    return o.call(this, h, S, e);
  }));
  const p = c.call(l, u, r);
  return s && n ? n(p) : p;
}
function tr(e, t, o, r) {
  const n = Ut(e), i = n !== e && !/* @__PURE__ */ le(e);
  let l = o, s = !1;
  n !== e && (i ? (s = r.length === 0, l = function(u, p, h) {
    return s && (s = !1, u = ye(e, u)), o.call(this, u, ye(e, p), h, e);
  }) : o.length > 3 && (l = function(u, p, h) {
    return o.call(this, u, p, h, e);
  }));
  const c = n[t](l, ...r);
  return s ? ye(e, c) : c;
}
function no(e, t, o) {
  const r = /* @__PURE__ */ F(e);
  X(r, "iterate", gt);
  const n = r[t](...o);
  return (n === -1 || n === !1) && /* @__PURE__ */ Ro(o[0]) ? (o[0] = /* @__PURE__ */ F(o[0]), r[t](...o)) : n;
}
function lt(e, t, o = []) {
  $e(), Eo();
  const r = (/* @__PURE__ */ F(e))[t].apply(e, o);
  return Oo(), He(), r;
}
const ii = /* @__PURE__ */ So("__proto__,__v_isRef,__isVue"), Ur = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(fe)
);
function li(e) {
  fe(e) || (e = String(e));
  const t = /* @__PURE__ */ F(this);
  return X(t, "has", e), t.hasOwnProperty(e);
}
class Br {
  constructor(t = !1, o = !1) {
    this._isReadonly = t, this._isShallow = o;
  }
  get(t, o, r) {
    if (o === "__v_skip") return t.__v_skip;
    const n = this._isReadonly, i = this._isShallow;
    if (o === "__v_isReactive")
      return !n;
    if (o === "__v_isReadonly")
      return n;
    if (o === "__v_isShallow")
      return i;
    if (o === "__v_raw")
      return r === (n ? i ? yi : Jr : i ? Gr : qr).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(r) ? t : void 0;
    const l = M(t);
    if (!n) {
      let c;
      if (l && (c = ri[o]))
        return c;
      if (o === "hasOwnProperty")
        return li;
    }
    const s = Reflect.get(
      t,
      o,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ ee(t) ? t : r
    );
    if ((fe(o) ? Ur.has(o) : ii(o)) || (n || X(t, "get", o), i))
      return s;
    if (/* @__PURE__ */ ee(s)) {
      const c = l && Co(o) ? s : s.value;
      return n && L(c) ? /* @__PURE__ */ vo(c) : c;
    }
    return L(s) ? n ? /* @__PURE__ */ vo(s) : /* @__PURE__ */ Yr(s) : s;
  }
}
class Wr extends Br {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, o, r, n) {
    let i = t[o];
    const l = M(t) && Co(o);
    if (!this._isShallow) {
      const u = /* @__PURE__ */ be(i);
      if (!/* @__PURE__ */ le(r) && !/* @__PURE__ */ be(r) && (i = /* @__PURE__ */ F(i), r = /* @__PURE__ */ F(r)), !l && /* @__PURE__ */ ee(i) && !/* @__PURE__ */ ee(r))
        return u || (i.value = r), !0;
    }
    const s = l ? Number(o) < t.length : $(t, o), c = Reflect.set(
      t,
      o,
      r,
      /* @__PURE__ */ ee(t) ? t : n
    );
    return t === /* @__PURE__ */ F(n) && c && (s ? J(r, i) && Ae(t, "set", o, r) : Ae(t, "add", o, r)), c;
  }
  deleteProperty(t, o) {
    const r = $(t, o);
    t[o];
    const n = Reflect.deleteProperty(t, o);
    return n && r && Ae(t, "delete", o, void 0), n;
  }
  has(t, o) {
    const r = Reflect.has(t, o);
    return (!fe(o) || !Ur.has(o)) && X(t, "has", o), r;
  }
  ownKeys(t) {
    return X(
      t,
      "iterate",
      M(t) ? "length" : Ge
    ), Reflect.ownKeys(t);
  }
}
class si extends Br {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, o) {
    return !0;
  }
  deleteProperty(t, o) {
    return !0;
  }
}
const ai = /* @__PURE__ */ new Wr(), ci = /* @__PURE__ */ new si(), fi = /* @__PURE__ */ new Wr(!0);
const yo = (e) => e, Tt = (e) => Reflect.getPrototypeOf(e);
function pi(e, t, o) {
  return function(...r) {
    const n = this.__v_raw, i = /* @__PURE__ */ F(n), l = je(i), s = e === "entries" || e === Symbol.iterator && l, c = e === "keys" && l, u = n[e](...r), p = o ? yo : t ? ze : se;
    return !t && X(
      i,
      "iterate",
      c ? go : Ge
    ), ae(
      // inheriting all iterator properties
      Object.create(u),
      {
        // iterator protocol
        next() {
          const { value: h, done: S } = u.next();
          return S ? { value: h, done: S } : {
            value: s ? [p(h[0]), p(h[1])] : p(h),
            done: S
          };
        }
      }
    );
  };
}
function kt(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function ui(e, t) {
  const o = {
    get(n) {
      const i = this.__v_raw, l = /* @__PURE__ */ F(i), s = /* @__PURE__ */ F(n);
      e || (J(n, s) && X(l, "get", n), X(l, "get", s));
      const { has: c } = Tt(l), u = t ? yo : e ? ze : se;
      if (c.call(l, n))
        return u(i.get(n));
      if (c.call(l, s))
        return u(i.get(s));
      i !== l && i.get(n);
    },
    get size() {
      const n = this.__v_raw;
      return !e && X(/* @__PURE__ */ F(n), "iterate", Ge), n.size;
    },
    has(n) {
      const i = this.__v_raw, l = /* @__PURE__ */ F(i), s = /* @__PURE__ */ F(n);
      return e || (J(n, s) && X(l, "has", n), X(l, "has", s)), n === s ? i.has(n) : i.has(n) || i.has(s);
    },
    forEach(n, i) {
      const l = this, s = l.__v_raw, c = /* @__PURE__ */ F(s), u = t ? yo : e ? ze : se;
      return !e && X(c, "iterate", Ge), s.forEach((p, h) => n.call(i, u(p), u(h), l));
    }
  };
  return ae(
    o,
    e ? {
      add: kt("add"),
      set: kt("set"),
      delete: kt("delete"),
      clear: kt("clear")
    } : {
      add(n) {
        const i = /* @__PURE__ */ F(this), l = Tt(i), s = /* @__PURE__ */ F(n), c = !t && !/* @__PURE__ */ le(n) && !/* @__PURE__ */ be(n) ? s : n;
        return l.has.call(i, c) || J(n, c) && l.has.call(i, n) || J(s, c) && l.has.call(i, s) || (i.add(c), Ae(i, "add", c, c)), this;
      },
      set(n, i) {
        !t && !/* @__PURE__ */ le(i) && !/* @__PURE__ */ be(i) && (i = /* @__PURE__ */ F(i));
        const l = /* @__PURE__ */ F(this), { has: s, get: c } = Tt(l);
        let u = s.call(l, n);
        u || (n = /* @__PURE__ */ F(n), u = s.call(l, n));
        const p = c.call(l, n);
        return l.set(n, i), u ? J(i, p) && Ae(l, "set", n, i) : Ae(l, "add", n, i), this;
      },
      delete(n) {
        const i = /* @__PURE__ */ F(this), { has: l, get: s } = Tt(i);
        let c = l.call(i, n);
        c || (n = /* @__PURE__ */ F(n), c = l.call(i, n)), s && s.call(i, n);
        const u = i.delete(n);
        return c && Ae(i, "delete", n, void 0), u;
      },
      clear() {
        const n = /* @__PURE__ */ F(this), i = n.size !== 0, l = n.clear();
        return i && Ae(
          n,
          "clear",
          void 0,
          void 0
        ), l;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((n) => {
    o[n] = pi(n, e, t);
  }), o;
}
function Io(e, t) {
  const o = ui(e, t);
  return (r, n, i) => n === "__v_isReactive" ? !e : n === "__v_isReadonly" ? e : n === "__v_raw" ? r : Reflect.get(
    $(o, n) && n in r ? o : r,
    n,
    i
  );
}
const di = {
  get: /* @__PURE__ */ Io(!1, !1)
}, hi = {
  get: /* @__PURE__ */ Io(!1, !0)
}, gi = {
  get: /* @__PURE__ */ Io(!0, !1)
};
const qr = /* @__PURE__ */ new WeakMap(), Gr = /* @__PURE__ */ new WeakMap(), Jr = /* @__PURE__ */ new WeakMap(), yi = /* @__PURE__ */ new WeakMap();
function vi(e) {
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
function Yr(e) {
  return /* @__PURE__ */ be(e) ? e : Po(
    e,
    !1,
    ai,
    di,
    qr
  );
}
// @__NO_SIDE_EFFECTS__
function xi(e) {
  return Po(
    e,
    !1,
    fi,
    hi,
    Gr
  );
}
// @__NO_SIDE_EFFECTS__
function vo(e) {
  return Po(
    e,
    !0,
    ci,
    gi,
    Jr
  );
}
function Po(e, t, o, r, n) {
  if (!L(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e))
    return e;
  const i = n.get(e);
  if (i)
    return i;
  const l = vi(zn(e));
  if (l === 0)
    return e;
  const s = new Proxy(
    e,
    l === 2 ? r : o
  );
  return n.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function De(e) {
  return /* @__PURE__ */ be(e) ? /* @__PURE__ */ De(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function be(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function le(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Ro(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function F(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ F(t) : e;
}
function mi(e) {
  return !$(e, "__v_skip") && Object.isExtensible(e) && Pr(e, "__v_skip", !0), e;
}
const se = (e) => L(e) ? /* @__PURE__ */ Yr(e) : e, ze = (e) => L(e) ? /* @__PURE__ */ vo(e) : e;
// @__NO_SIDE_EFFECTS__
function ee(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Ql(e) {
  return Xr(e, !1);
}
// @__NO_SIDE_EFFECTS__
function es(e) {
  return Xr(e, !0);
}
function Xr(e, t) {
  return /* @__PURE__ */ ee(e) ? e : new bi(e, t);
}
class bi {
  constructor(t, o) {
    this.dep = new Kt(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = o ? t : /* @__PURE__ */ F(t), this._value = o ? t : se(t), this.__v_isShallow = o;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const o = this._rawValue, r = this.__v_isShallow || /* @__PURE__ */ le(t) || /* @__PURE__ */ be(t);
    t = r ? t : /* @__PURE__ */ F(t), J(t, o) && (this._rawValue = t, this._value = r ? t : se(t), this.dep.trigger());
  }
}
function _i(e) {
  return /* @__PURE__ */ ee(e) ? e.value : e;
}
const wi = {
  get: (e, t, o) => t === "__v_raw" ? e : _i(Reflect.get(e, t, o)),
  set: (e, t, o, r) => {
    const n = e[t];
    return /* @__PURE__ */ ee(n) && !/* @__PURE__ */ ee(o) ? (n.value = o, !0) : Reflect.set(e, t, o, r);
  }
};
function Zr(e) {
  return /* @__PURE__ */ De(e) ? e : new Proxy(e, wi);
}
class Si {
  constructor(t) {
    this.__v_isRef = !0, this._value = void 0;
    const o = this.dep = new Kt(), { get: r, set: n } = t(o.track.bind(o), o.trigger.bind(o));
    this._get = r, this._set = n;
  }
  get value() {
    return this._value = this._get();
  }
  set value(t) {
    this._set(t);
  }
}
function Ci(e) {
  return new Si(e);
}
class Ti {
  constructor(t, o, r) {
    this.fn = t, this.setter = o, this._value = void 0, this.dep = new Kt(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ht - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !o, this.isSSR = r;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    H !== this)
      return Dr(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return zr(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
// @__NO_SIDE_EFFECTS__
function ki(e, t, o = !1) {
  let r, n;
  return j(e) ? r = e : (r = e.get, n = e.set), new Ti(r, n, o);
}
const At = {}, Pt = /* @__PURE__ */ new WeakMap();
let Be;
function Ai(e, t = !1, o = Be) {
  if (o) {
    let r = Pt.get(o);
    r || Pt.set(o, r = []), r.push(e);
  }
}
function Ei(e, t, o = V) {
  const { immediate: r, deep: n, once: i, scheduler: l, augmentJob: s, call: c } = o, u = (E) => n ? E : /* @__PURE__ */ le(E) || n === !1 || n === 0 ? Ee(E, 1) : Ee(E);
  let p, h, S, C, P = !1, A = !1;
  if (/* @__PURE__ */ ee(e) ? (h = () => e.value, P = /* @__PURE__ */ le(e)) : /* @__PURE__ */ De(e) ? (h = () => u(e), P = !0) : M(e) ? (A = !0, P = e.some((E) => /* @__PURE__ */ De(E) || /* @__PURE__ */ le(E)), h = () => e.map((E) => {
    if (/* @__PURE__ */ ee(E))
      return E.value;
    if (/* @__PURE__ */ De(E))
      return u(E);
    if (j(E))
      return c ? c(E, 2) : E();
  })) : j(e) ? t ? h = c ? () => c(e, 2) : e : h = () => {
    if (S) {
      $e();
      try {
        S();
      } finally {
        He();
      }
    }
    const E = Be;
    Be = p;
    try {
      return c ? c(e, 3, [C]) : e(C);
    } finally {
      Be = E;
    }
  } : h = qe, t && n) {
    const E = h, Y = n === !0 ? 1 / 0 : n;
    h = () => Ee(E(), Y);
  }
  const K = ei(), U = () => {
    p.stop(), K && K.active && Ar(K.effects, p);
  };
  if (i && t) {
    const E = t;
    t = (...Y) => {
      const Re = E(...Y);
      return U(), Re;
    };
  }
  let R = A ? new Array(e.length).fill(At) : At;
  const z = (E) => {
    if (!(!(p.flags & 1) || !p.dirty && !E))
      if (t) {
        const Y = p.run();
        if (E || n || P || (A ? Y.some((Re, Fe) => J(Re, R[Fe])) : J(Y, R))) {
          S && S();
          const Re = Be;
          Be = p;
          try {
            const Fe = [
              Y,
              // pass undefined as the old value when it's changed for the first time
              R === At ? void 0 : A && R[0] === At ? [] : R,
              C
            ];
            R = Y, c ? c(t, 3, Fe) : (
              // @ts-expect-error
              t(...Fe)
            );
          } finally {
            Be = Re;
          }
        }
      } else
        p.run();
  };
  return s && s(z), p = new Nr(h), p.scheduler = l ? () => l(z, !1) : z, C = (E) => Ai(E, !1, p), S = p.onStop = () => {
    const E = Pt.get(p);
    if (E) {
      if (c)
        c(E, 4);
      else
        for (const Y of E) Y();
      Pt.delete(p);
    }
  }, t ? r ? z(!0) : R = p.run() : l ? l(z.bind(null, !0), !0) : p.run(), U.pause = p.pause.bind(p), U.resume = p.resume.bind(p), U.stop = U, U;
}
function Ee(e, t = 1 / 0, o) {
  if (t <= 0 || !L(e) || e.__v_skip || (o = o || /* @__PURE__ */ new Map(), (o.get(e) || 0) >= t))
    return e;
  if (o.set(e, t), t--, /* @__PURE__ */ ee(e))
    Ee(e.value, t, o);
  else if (M(e))
    for (let r = 0; r < e.length; r++)
      Ee(e[r], t, o);
  else if (Me(e) || je(e))
    e.forEach((r) => {
      Ee(r, t, o);
    });
  else if (Mr(e)) {
    for (const r in e)
      Ee(e[r], t, o);
    for (const r of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, r) && Ee(e[r], t, o);
  }
  return e;
}
function wt(e, t, o, r) {
  try {
    return r ? e(...r) : e();
  } catch (n) {
    Bt(n, t, o);
  }
}
function _e(e, t, o, r) {
  if (j(e)) {
    const n = wt(e, t, o, r);
    return n && Er(n) && n.catch((i) => {
      Bt(i, t, o);
    }), n;
  }
  if (M(e)) {
    const n = [];
    for (let i = 0; i < e.length; i++)
      n.push(_e(e[i], t, o, r));
    return n;
  }
}
function Bt(e, t, o, r = !0) {
  const n = t ? t.vnode : null, { errorHandler: i, throwUnhandledErrorInProduction: l } = t && t.appContext.config || V;
  if (t) {
    let s = t.parent;
    const c = t.proxy, u = `https://vuejs.org/error-reference/#runtime-${o}`;
    for (; s; ) {
      const p = s.ec;
      if (p) {
        for (let h = 0; h < p.length; h++)
          if (p[h](e, c, u) === !1)
            return;
      }
      s = s.parent;
    }
    if (i) {
      $e(), wt(i, null, 10, [
        e,
        c,
        u
      ]), He();
      return;
    }
  }
  Oi(e, o, n, r, l);
}
function Oi(e, t, o, r = !0, n = !1) {
  if (n)
    throw e;
  console.error(e);
}
const Q = [];
let ge = -1;
const Ze = [];
let Ve = null, Xe = 0;
const Qr = /* @__PURE__ */ Promise.resolve();
let Rt = null;
function en(e) {
  const t = Rt || Qr;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Mi(e) {
  let t = ge + 1, o = Q.length;
  for (; t < o; ) {
    const r = t + o >>> 1, n = Q[r], i = yt(n);
    i < e || i === e && n.flags & 2 ? t = r + 1 : o = r;
  }
  return t;
}
function Fo(e) {
  if (!(e.flags & 1)) {
    const t = yt(e), o = Q[Q.length - 1];
    !o || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= yt(o) ? Q.push(e) : Q.splice(Mi(t), 0, e), e.flags |= 1, tn();
  }
}
function tn() {
  Rt || (Rt = Qr.then(rn));
}
function Ii(e) {
  if (!M(e))
    Ve && e.id === -1 ? Ve.splice(Xe + 1, 0, e) : e.flags & 1 || (Ze.push(e), e.flags |= 1);
  else
    for (let t = 0; t < e.length; t++)
      Ze.push(e[t]);
  tn();
}
function or(e, t, o = ge + 1) {
  for (; o < Q.length; o++) {
    const r = Q[o];
    if (r && r.flags & 2) {
      if (e && r.id !== e.uid)
        continue;
      Q.splice(o, 1), o--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function on(e) {
  if (Ze.length) {
    const t = [...new Set(Ze)].sort(
      (o, r) => yt(o) - yt(r)
    );
    if (Ze.length = 0, Ve) {
      for (let o = 0; o < t.length; o++)
        Ve.push(t[o]);
      return;
    }
    for (Ve = t, Xe = 0; Xe < Ve.length; Xe++) {
      const o = Ve[Xe];
      o.flags & 4 && (o.flags &= -2), o.flags & 8 || o(), o.flags &= -2;
    }
    Ve = null, Xe = 0;
  }
}
const yt = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function rn(e) {
  try {
    for (ge = 0; ge < Q.length; ge++) {
      const t = Q[ge];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), wt(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; ge < Q.length; ge++) {
      const t = Q[ge];
      t && (t.flags &= -2);
    }
    ge = -1, Q.length = 0, on(), Rt = null, (Q.length || Ze.length) && rn();
  }
}
let Z = null, nn = null;
function Ft(e) {
  const t = Z;
  return Z = e, nn = e && e.type.__scopeId || null, t;
}
function Pi(e, t = Z, o) {
  if (!t || e._n)
    return e;
  const r = (...n) => {
    r._d && fr(-1);
    const i = Ft(t), l = Oe.length;
    let s;
    try {
      s = e(...n);
    } finally {
      for (let c = Oe.length; c > l; c--) Do();
      Ft(i), r._d && fr(1);
    }
    return s;
  };
  return r._n = !0, r._c = !0, r._d = !0, r;
}
function ts(e, t) {
  if (Z === null)
    return e;
  const o = Jt(Z), r = e.dirs || (e.dirs = []);
  for (let n = 0; n < t.length; n++) {
    let [i, l, s, c = V] = t[n];
    i && (j(i) && (i = {
      mounted: i,
      updated: i
    }), i.deep && Ee(l), r.push({
      dir: i,
      instance: o,
      value: l,
      oldValue: void 0,
      arg: s,
      modifiers: c
    }));
  }
  return e;
}
function Ke(e, t, o, r) {
  const n = e.dirs, i = t && t.dirs;
  for (let l = 0; l < n.length; l++) {
    const s = n[l];
    i && (s.oldValue = i[l].value);
    let c = s.dir[r];
    c && ($e(), _e(c, o, 8, [
      e.el,
      s,
      e,
      t
    ]), He());
  }
}
function Ri(e, t, o = !1) {
  const r = En();
  if (r || et) {
    let n = et ? et._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
    if (n && e in n)
      return n[e];
    if (arguments.length > 1)
      return o && j(t) ? t.call(r && r.proxy) : t;
  }
}
const Fi = /* @__PURE__ */ Symbol.for("v-scx"), Vi = () => Ri(Fi);
function Ni(e, t) {
  return ln(
    e,
    null,
    { flush: "sync" }
  );
}
function os(e, t, o) {
  return ln(e, t, o);
}
function ln(e, t, o = V) {
  const { immediate: r, deep: n, flush: i, once: l } = o, s = ae({}, o), c = t && r || !t && i !== "post";
  let u;
  if (mt) {
    if (i === "sync") {
      const C = Vi();
      u = C.__watcherHandles || (C.__watcherHandles = []);
    } else if (!c) {
      const C = () => {
      };
      return C.stop = qe, C.resume = qe, C.pause = qe, C;
    }
  }
  const p = Le;
  s.call = (C, P, A) => _e(C, p, P, A);
  let h = !1;
  i === "post" ? s.scheduler = (C) => {
    te(C, p && p.suspense);
  } : i !== "sync" && (h = !0, s.scheduler = (C, P) => {
    P ? C() : Fo(C);
  }), s.augmentJob = (C) => {
    t && (C.flags |= 4), h && (C.flags |= 2, p && (C.id = p.uid, C.i = p));
  };
  const S = Ei(e, t, s);
  return mt && (u ? u.push(S) : c && S()), S;
}
const ji = /* @__PURE__ */ Symbol("_vte"), Wt = (e) => e.__isTeleport, io = /* @__PURE__ */ Symbol("_leaveCb");
function Di(e) {
  let t = e[0];
  if (e.length > 1) {
    for (const o of e)
      if (o.type !== we) {
        t = o;
        break;
      }
  }
  return t;
}
function sn(e) {
  if (!an(e))
    return Wt(e.type) && e.children ? Di(e.children) : e;
  if (e.component)
    return e.component.subTree;
  const { shapeFlag: t, children: o } = e;
  if (o) {
    if (t & 16)
      return o[0];
    if (t & 32 && j(o.default))
      return o.default();
  }
}
function Vo(e, t) {
  if (e.shapeFlag & 6 && e.component) {
    e.transition = t;
    const o = e.component.subTree;
    Vo(
      Wt(o.type) && sn(o) || o,
      t
    );
  } else e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function rs(e, t) {
  return j(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    ae({ name: e.name }, t, { setup: e })
  ) : e;
}
function $i(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function rr(e, t) {
  let o;
  return !!((o = Object.getOwnPropertyDescriptor(e, t)) && !o.configurable);
}
const Vt = /* @__PURE__ */ new WeakMap();
function ut(e, t, o, r, n = !1) {
  if (M(e)) {
    e.forEach(
      (A, K) => ut(
        A,
        t && (M(t) ? t[K] : t),
        o,
        r,
        n
      )
    );
    return;
  }
  if (Qe(r) && !n) {
    r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && ut(e, t, o, r.component.subTree);
    return;
  }
  const i = r.shapeFlag & 4 ? Jt(r.component) : r.el, l = n ? null : i, { i: s, r: c } = e, u = t && t.r, p = s.refs === V ? s.refs = {} : s.refs, h = s.setupState, S = /* @__PURE__ */ F(h), C = h === V ? kr : (A) => rr(p, A) ? !1 : $(S, A), P = (A, K) => !(K && rr(p, K));
  if (u != null && u !== c) {
    if (nr(t), W(u))
      p[u] = null, C(u) && (h[u] = null);
    else if (/* @__PURE__ */ ee(u)) {
      const A = t;
      P(u, A.k) && (u.value = null), A.k && (p[A.k] = null);
    }
  }
  if (j(c))
    wt(c, s, 12, [l, p]);
  else {
    const A = W(c), K = /* @__PURE__ */ ee(c);
    if (A || K) {
      const U = () => {
        if (e.f) {
          const R = A ? C(c) ? h[c] : p[c] : P() || !e.k ? c.value : p[e.k];
          if (n)
            M(R) && Ar(R, i);
          else if (M(R))
            R.includes(i) || R.push(i);
          else if (A)
            p[c] = [i], C(c) && (h[c] = p[c]);
          else {
            const z = [i];
            P(c, e.k) && (c.value = z), e.k && (p[e.k] = z);
          }
        } else A ? (p[c] = l, C(c) && (h[c] = l)) : K && (P(c, e.k) && (c.value = l), e.k && (p[e.k] = l));
      };
      if (l) {
        const R = () => {
          U(), Vt.delete(e);
        };
        R.id = -1, Vt.set(e, R), te(R, o);
      } else
        nr(e), U();
    }
  }
}
function nr(e) {
  const t = Vt.get(e);
  t && (t.flags |= 8, Vt.delete(e));
}
Lt().requestIdleCallback;
Lt().cancelIdleCallback;
const Qe = (e) => !!e.type.__asyncLoader, an = (e) => e.type.__isKeepAlive;
function Hi(e, t, o = Le, r = !1) {
  if (o) {
    const n = o[e] || (o[e] = []), i = t.__weh || (t.__weh = (...l) => {
      $e();
      const s = Ho(o), c = _e(t, o, e, l);
      return s(), He(), c;
    });
    return r ? n.unshift(i) : n.push(i), i;
  }
}
const cn = (e) => (t, o = Le) => {
  (!mt || e === "sp") && Hi(e, (...r) => t(...r), o);
}, ns = cn("m"), is = cn(
  "bum"
), zi = /* @__PURE__ */ Symbol.for("v-ndc");
function ls(e, t, o, r) {
  let n;
  const i = o, l = M(e);
  if (l || W(e)) {
    const s = l && /* @__PURE__ */ De(e);
    let c = !1, u = !1;
    s && (c = !/* @__PURE__ */ le(e), u = /* @__PURE__ */ be(e), e = Ut(e)), n = new Array(e.length);
    for (let p = 0, h = e.length; p < h; p++)
      n[p] = t(
        c ? u ? ze(se(e[p])) : se(e[p]) : e[p],
        p,
        void 0,
        i
      );
  } else if (typeof e == "number") {
    n = new Array(e);
    for (let s = 0; s < e; s++)
      n[s] = t(s + 1, s, void 0, i);
  } else if (L(e))
    if (e[Symbol.iterator])
      n = Array.from(
        e,
        (s, c) => t(s, c, void 0, i)
      );
    else {
      const s = Object.keys(e);
      n = new Array(s.length);
      for (let c = 0, u = s.length; c < u; c++) {
        const p = s[c];
        n[c] = t(e[p], p, c, i);
      }
    }
  else
    n = [];
  return n;
}
function ss(e, t, o, r, n, i) {
  if (o == null && (o = {}), Z.ce || Z.parent && Qe(Z.parent) && Z.parent.ce) {
    const u = o, p = Object.keys(u).length > 0;
    return u.name = t, bo(), _o(
      ne,
      null,
      [me("slot", u, r)],
      p ? -2 : 64
    );
  }
  let l = e[t];
  l && l._c && (l._d = !1);
  const s = Oe.length;
  bo();
  let c;
  try {
    const u = l && fn(l(o)), p = o.key || i || // slot content array of a dynamic conditional slot may have a branch
    // key attached in the `createSlots` helper, respect that
    u && u.key;
    c = _o(
      ne,
      {
        key: (p && !fe(p) ? p : `_${t}`) + // #7256 force differentiate fallback content from actual content
        (!u && r ? "_fb" : "")
      },
      u || (r ? r() : []),
      u && e._ === 1 ? 64 : -2
    );
  } catch (u) {
    for (let p = Oe.length; p > s; p--) Do();
    throw u;
  } finally {
    l && l._c && (l._d = !0);
  }
  return c.scopeId && (c.slotScopeIds = [c.scopeId + "-s"]), c;
}
function fn(e) {
  return e.some((t) => $o(t) ? !(t.type === we || t.type === ne && !fn(t.children)) : !0) ? e : null;
}
const xo = (e) => e ? On(e) ? Jt(e) : xo(e.parent) : null, dt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ae(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => xo(e.parent),
    $root: (e) => xo(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => e.type,
    $forceUpdate: (e) => e.f || (e.f = () => {
      Fo(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = en.bind(e.proxy)),
    $watch: (e) => qe
  })
), lo = (e, t) => e !== V && !e.__isScriptSetup && $(e, t), Li = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: o, setupState: r, data: n, props: i, accessCache: l, type: s, appContext: c } = e;
    if (t[0] !== "$") {
      const S = l[t];
      if (S !== void 0)
        switch (S) {
          case 1:
            return r[t];
          case 2:
            return n[t];
          case 4:
            return o[t];
          case 3:
            return i[t];
        }
      else {
        if (lo(r, t))
          return l[t] = 1, r[t];
        if ($(i, t))
          return l[t] = 3, i[t];
        if (o !== V && $(o, t))
          return l[t] = 4, o[t];
        l[t] = 0;
      }
    }
    const u = dt[t];
    let p, h;
    if (u)
      return t === "$attrs" && X(e.attrs, "get", ""), u(e);
    if (
      // css module (injected by vue-loader)
      (p = s.__cssModules) && (p = p[t])
    )
      return p;
    if (o !== V && $(o, t))
      return l[t] = 4, o[t];
    if (
      // global properties
      h = c.config.globalProperties, $(h, t)
    )
      return h[t];
  },
  set({ _: e }, t, o) {
    const { data: r, setupState: n, ctx: i } = e;
    return lo(n, t) ? (n[t] = o, !0) : $(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (i[t] = o, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: o, ctx: r, appContext: n, props: i, type: l }
  }, s) {
    let c;
    return !!(o[s] || lo(t, s) || $(i, s) || $(r, s) || $(dt, s) || $(n.config.globalProperties, s) || (c = l.__cssModules) && c[s]);
  },
  defineProperty(e, t, o) {
    return o.get != null ? e._.accessCache[t] = 0 : $(o, "value") && this.set(e, t, o.value, null), Reflect.defineProperty(e, t, o);
  }
};
function ir(e) {
  return M(e) ? e.reduce(
    (t, o) => (t[o] = null, t),
    {}
  ) : e;
}
function as(e, t) {
  return !e || !t ? e || t : M(e) && M(t) ? e.concat(t) : ae({}, ir(e), ir(t));
}
function pn() {
  return {
    app: null,
    config: {
      isNativeTag: kr,
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
let Ki = 0;
function Ui(e, t) {
  return function(r, n = null) {
    j(r) || (r = ae({}, r)), n != null && !L(n) && (n = null);
    const i = pn(), l = /* @__PURE__ */ new WeakSet(), s = [];
    let c = !1;
    const u = i.app = {
      _uid: Ki++,
      _component: r,
      _props: n,
      _container: null,
      _context: i,
      _instance: null,
      version: bl,
      get config() {
        return i.config;
      },
      set config(p) {
      },
      use(p, ...h) {
        return l.has(p) || (p && j(p.install) ? (l.add(p), p.install(u, ...h)) : j(p) && (l.add(p), p(u, ...h))), u;
      },
      mixin(p) {
        return u;
      },
      component(p, h) {
        return h ? (i.components[p] = h, u) : i.components[p];
      },
      directive(p, h) {
        return h ? (i.directives[p] = h, u) : i.directives[p];
      },
      mount(p, h, S) {
        if (!c) {
          const C = u._ceVNode || me(r, n);
          return C.appContext = i, S === !0 ? S = "svg" : S === !1 && (S = void 0), e(C, p, S), c = !0, u._container = p, p.__vue_app__ = u, Jt(C.component);
        }
      },
      onUnmount(p) {
        s.push(p);
      },
      unmount() {
        c && (_e(
          s,
          u._instance,
          16
        ), e(null, u._container), delete u._container.__vue_app__);
      },
      provide(p, h) {
        return i.provides[p] = h, u;
      },
      runWithContext(p) {
        const h = et;
        et = u;
        try {
          return p();
        } finally {
          et = h;
        }
      }
    };
    return u;
  };
}
let et = null;
function cs(e, t, o = V) {
  const r = En(), n = ie(t), i = Pe(t), l = un(e, n), s = Ci((c, u) => {
    let p, h = V, S;
    return Ni(() => {
      const C = e[n];
      J(p, C) && (p = C, u());
    }), {
      get() {
        return c(), o.get ? o.get(p) : p;
      },
      set(C) {
        const P = o.set ? o.set(C) : C;
        if (!J(P, p) && !(h !== V && J(C, h)))
          return;
        const A = r.vnode.props, K = !!(A && // check if parent has passed v-model
        (t in A || n in A || i in A) && (`onUpdate:${t}` in A || `onUpdate:${n}` in A || `onUpdate:${i}` in A));
        K || (p = C, u()), r.emit(`update:${t}`, P), J(C, h) && (J(C, P) && !J(P, S) || // #13524: browsers differ in when they flush microtasks between
        // event listeners. If a v-model listener emits an intermediate value
        // and a following listener restores the model to its previous prop
        // value before parent updates are flushed, the parent render can be
        // deduped as having no prop change. Force a local update so DOM state
        // such as an input's value is synchronized back to the current model.
        K && h !== V && !J(P, p)) && u(), h = C, S = P;
      }
    };
  });
  return s[Symbol.iterator] = () => {
    let c = 0;
    return {
      next() {
        return c < 2 ? { value: c++ ? l || V : s, done: !1 } : { done: !0 };
      }
    };
  }, s;
}
const un = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${ie(t)}Modifiers`] || e[`${Pe(t)}Modifiers`];
function Bi(e, t, ...o) {
  if (e.isUnmounted) return;
  const r = e.vnode.props || V;
  let n = o;
  const i = t.startsWith("update:"), l = i && un(r, t.slice(7));
  l && (l.trim && (n = o.map((p) => W(p) ? p.trim() : p)), l.number && (n = n.map(zt)));
  let s, c = r[s = eo(t)] || // also try camelCase event handler (#2249)
  r[s = eo(ie(t))];
  !c && i && (c = r[s = eo(Pe(t))]), c && _e(
    c,
    e,
    6,
    n
  );
  const u = r[s + "Once"];
  if (u) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[s])
      return;
    e.emitted[s] = !0, _e(
      u,
      e,
      6,
      n
    );
  }
}
function Wi(e, t, o = !1) {
  const r = t.emitsCache, n = r.get(e);
  if (n !== void 0)
    return n;
  const i = e.emits;
  let l = {};
  return i ? (M(i) ? i.forEach((s) => l[s] = null) : ae(l, i), L(e) && r.set(e, l), l) : (L(e) && r.set(e, null), null);
}
function qt(e, t) {
  return !e || !Dt(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), $(e, t[0].toLowerCase() + t.slice(1)) || $(e, Pe(t)) || $(e, t));
}
function lr(e) {
  const {
    type: t,
    vnode: o,
    proxy: r,
    withProxy: n,
    propsOptions: [i],
    slots: l,
    attrs: s,
    emit: c,
    render: u,
    renderCache: p,
    props: h,
    data: S,
    setupState: C,
    ctx: P,
    inheritAttrs: A
  } = e, K = Ft(e);
  let U, R;
  try {
    if (o.shapeFlag & 4) {
      const E = n || r, Y = E;
      U = ve(
        u.call(
          Y,
          E,
          p,
          h,
          C,
          S,
          P
        )
      ), R = s;
    } else {
      const E = t;
      U = ve(
        E.length > 1 ? E(
          h,
          { attrs: s, slots: l, emit: c }
        ) : E(
          h,
          null
        )
      ), R = t.props ? s : qi(s);
    }
  } catch (E) {
    Oe.length = 0, Bt(E, e, 1), U = me(we);
  }
  let z = U;
  if (R && A !== !1) {
    const E = Object.keys(R), { shapeFlag: Y } = z;
    E.length && Y & 7 && (i && E.some($t) && (R = Gi(
      R,
      i
    )), z = tt(z, R, !1, !0));
  }
  if (o.dirs && (z = tt(z, null, !1, !0), z.dirs = z.dirs ? z.dirs.concat(o.dirs) : o.dirs), o.transition) {
    const E = Wt(z.type) && sn(z) || z;
    Vo(E, o.transition);
  }
  return U = z, Ft(K), U;
}
const qi = (e) => {
  let t;
  for (const o in e)
    (o === "class" || o === "style" || Dt(o)) && ((t || (t = {}))[o] = e[o]);
  return t;
}, Gi = (e, t) => {
  const o = {};
  for (const r in e)
    (!$t(r) || !(r.slice(9) in t)) && (o[r] = e[r]);
  return o;
};
function Ji(e, t, o) {
  const { props: r, children: n, component: i } = e, { props: l, children: s, patchFlag: c } = t, u = i.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (o && c >= 0) {
    if (c & 1024)
      return !0;
    if (c & 16)
      return r ? sr(r, l, u) : !!l;
    if (c & 8) {
      const p = t.dynamicProps;
      for (let h = 0; h < p.length; h++) {
        const S = p[h];
        if (dn(l, r, S) && !qt(u, S))
          return !0;
      }
    }
  } else
    return (n || s) && (!s || !s.$stable) ? !0 : r === l ? !1 : r ? l ? sr(r, l, u) : !0 : !!l;
  return !1;
}
function sr(e, t, o) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length)
    return !0;
  for (let n = 0; n < r.length; n++) {
    const i = r[n];
    if (dn(t, e, i) && !qt(o, i))
      return !0;
  }
  return !1;
}
function dn(e, t, o) {
  const r = e[o], n = t[o];
  return o === "style" && L(r) && L(n) ? !Ie(r, n) : r !== n;
}
function Yi({ vnode: e, parent: t, suspense: o }, r) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e)
      (e = t.vnode).el = r, t = t.parent;
    else
      break;
  }
  o && o.activeBranch === e && (o.vnode.el = r);
}
const hn = {}, gn = () => Object.create(hn), yn = (e) => Object.getPrototypeOf(e) === hn;
function Xi(e, t, o, r = !1) {
  const n = {}, i = gn();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), vn(e, t, n, i);
  for (const l in e.propsOptions[0])
    l in n || (n[l] = void 0);
  o ? e.props = r ? n : /* @__PURE__ */ xi(n) : e.type.props ? e.props = n : e.props = i, e.attrs = i;
}
function Zi(e, t, o, r) {
  const {
    props: n,
    attrs: i,
    vnode: { patchFlag: l }
  } = e, s = /* @__PURE__ */ F(n), [c] = e.propsOptions;
  let u = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (r || l > 0) && !(l & 16)
  ) {
    if (l & 8) {
      const p = e.vnode.dynamicProps;
      for (let h = 0; h < p.length; h++) {
        let S = p[h];
        if (qt(e.emitsOptions, S))
          continue;
        const C = t[S];
        if (c)
          if ($(i, S))
            C !== i[S] && (i[S] = C, u = !0);
          else {
            const P = ie(S);
            n[P] = mo(
              c,
              s,
              P,
              C,
              e,
              !1
            );
          }
        else
          C !== i[S] && (i[S] = C, u = !0);
      }
    }
  } else {
    vn(e, t, n, i) && (u = !0);
    let p;
    for (const h in s)
      (!t || // for camelCase
      !$(t, h) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((p = Pe(h)) === h || !$(t, p))) && (c ? o && // for camelCase
      (o[h] !== void 0 || // for kebab-case
      o[p] !== void 0) && (n[h] = mo(
        c,
        s,
        h,
        void 0,
        e,
        !0
      )) : delete n[h]);
    if (i !== s)
      for (const h in i)
        (!t || !$(t, h)) && (delete i[h], u = !0);
  }
  u && Ae(e.attrs, "set", "");
}
function vn(e, t, o, r) {
  const [n, i] = e.propsOptions;
  let l = !1, s;
  if (t)
    for (let c in t) {
      if (ct(c))
        continue;
      const u = t[c];
      let p;
      n && $(n, p = ie(c)) ? !i || !i.includes(p) ? o[p] = u : (s || (s = {}))[p] = u : qt(e.emitsOptions, c) || (!(c in r) || u !== r[c]) && (r[c] = u, l = !0);
    }
  if (i) {
    const c = /* @__PURE__ */ F(o), u = s || V;
    for (let p = 0; p < i.length; p++) {
      const h = i[p];
      o[h] = mo(
        n,
        c,
        h,
        u[h],
        e,
        !$(u, h)
      );
    }
  }
  return l;
}
function mo(e, t, o, r, n, i) {
  const l = e[o];
  if (l != null) {
    const s = $(l, "default");
    if (s && r === void 0) {
      const c = l.default;
      if (l.type !== Function && !l.skipFactory && j(c)) {
        const { propsDefaults: u } = n;
        if (o in u)
          r = u[o];
        else {
          const p = Ho(n);
          r = u[o] = c.call(
            null,
            t
          ), p();
        }
      } else
        r = c;
      n.ce && n.ce._setProp(o, r);
    }
    l[
      0
      /* shouldCast */
    ] && (i && !s ? r = !1 : l[
      1
      /* shouldCastTrue */
    ] && (r === "" || r === Pe(o)) && (r = !0));
  }
  return r;
}
function Qi(e, t, o = !1) {
  const r = t.propsCache, n = r.get(e);
  if (n)
    return n;
  const i = e.props, l = {}, s = [];
  if (!i)
    return L(e) && r.set(e, We), We;
  if (M(i))
    for (let u = 0; u < i.length; u++) {
      const p = ie(i[u]);
      ar(p) && (l[p] = V);
    }
  else if (i)
    for (const u in i) {
      const p = ie(u);
      if (ar(p)) {
        const h = i[u], S = l[p] = M(h) || j(h) ? { type: h } : ae({}, h), C = S.type;
        let P = !1, A = !0;
        if (M(C))
          for (let K = 0; K < C.length; ++K) {
            const U = C[K], R = j(U) && U.name;
            if (R === "Boolean") {
              P = !0;
              break;
            } else R === "String" && (A = !1);
          }
        else
          P = j(C) && C.name === "Boolean";
        S[
          0
          /* shouldCast */
        ] = P, S[
          1
          /* shouldCastTrue */
        ] = A, (P || $(S, "default")) && s.push(p);
      }
    }
  const c = [l, s];
  return L(e) && r.set(e, c), c;
}
function ar(e) {
  return e[0] !== "$" && !ct(e);
}
const No = (e) => e === "_" || e === "_ctx" || e === "$stable", jo = (e) => M(e) ? e.map(ve) : [ve(e)], el = (e, t, o) => {
  if (t._n)
    return t;
  const r = Pi((...n) => jo(t(...n)), o);
  return r._c = !1, r;
}, xn = (e, t, o) => {
  const r = e._ctx;
  for (const n in e) {
    if (No(n)) continue;
    const i = e[n];
    if (j(i))
      t[n] = el(n, i, r);
    else if (i != null) {
      const l = jo(i);
      t[n] = () => l;
    }
  }
}, mn = (e, t) => {
  const o = jo(t);
  e.slots.default = () => o;
}, bn = (e, t, o) => {
  for (const r in t)
    (o || !No(r)) && (e[r] = t[r]);
}, tl = (e, t, o) => {
  const r = e.slots = gn();
  if (e.vnode.shapeFlag & 32) {
    const n = t._;
    n ? (bn(r, t, o), o && Pr(r, "_", n, !0)) : xn(t, r);
  } else t && mn(e, t);
}, ol = (e, t, o) => {
  const { vnode: r, slots: n } = e;
  let i = !0, l = V;
  if (r.shapeFlag & 32) {
    const s = t._;
    s ? o && s === 1 ? i = !1 : bn(n, t, o) : (i = !t.$stable, xn(t, n)), l = t;
  } else t && (mn(e, t), l = { default: 1 });
  if (i)
    for (const s in n)
      !No(s) && l[s] == null && delete n[s];
}, te = sl;
function rl(e) {
  return nl(e);
}
function nl(e, t) {
  const o = Lt();
  o.__VUE__ = !0;
  const {
    insert: r,
    remove: n,
    patchProp: i,
    createElement: l,
    createText: s,
    createComment: c,
    setText: u,
    setElementText: p,
    parentNode: h,
    nextSibling: S,
    setScopeId: C = qe,
    insertStaticContent: P
  } = e, A = (a, f, d, x = null, g = null, v = null, _ = void 0, b = null, m = !!f.dynamicChildren) => {
    if (a === f)
      return;
    a && !st(a, f) && (x = Ct(a), Se(a, g, v, !0), a = null), f.patchFlag === -2 && (m = !1, f.dynamicChildren = null), f.dynamicChildren && a && a.dynamicChildren && a.dynamicChildren.hasOnce && (f.dynamicChildren === We && (f.dynamicChildren = []), f.dynamicChildren.hasOnce = !0);
    const { type: y, ref: k, shapeFlag: w } = f;
    switch (y) {
      case Gt:
        K(a, f, d, x);
        break;
      case we:
        U(a, f, d, x);
        break;
      case ao:
        a == null && R(f, d, x, _);
        break;
      case ne:
        Fn(
          a,
          f,
          d,
          x,
          g,
          v,
          _,
          b,
          m
        );
        break;
      default:
        w & 1 ? Y(
          a,
          f,
          d,
          x,
          g,
          v,
          _,
          b,
          m
        ) : w & 6 ? Vn(
          a,
          f,
          d,
          x,
          g,
          v,
          _,
          b,
          m
        ) : (w & 64 || w & 128) && y.process(
          a,
          f,
          d,
          x,
          g,
          v,
          _,
          b,
          m,
          nt
        );
    }
    k != null && g ? ut(k, a && a.ref, v, f || a, !f) : k == null && a && a.ref != null && ut(a.ref, null, v, a, !0);
  }, K = (a, f, d, x) => {
    if (a == null)
      r(
        f.el = s(f.children),
        d,
        x
      );
    else {
      const g = f.el = a.el;
      f.children !== a.children && u(g, f.children);
    }
  }, U = (a, f, d, x) => {
    a == null ? r(
      f.el = c(f.children || ""),
      d,
      x
    ) : f.el = a.el;
  }, R = (a, f, d, x) => {
    [a.el, a.anchor] = P(
      a.children,
      f,
      d,
      x,
      a.el,
      a.anchor
    );
  }, z = ({ el: a, anchor: f }, d, x) => {
    let g;
    for (; a && a !== f; )
      g = S(a), r(a, d, x), a = g;
    r(f, d, x);
  }, E = ({ el: a, anchor: f }) => {
    let d;
    for (; a && a !== f; )
      d = S(a), n(a), a = d;
    n(f);
  }, Y = (a, f, d, x, g, v, _, b, m) => {
    if (f.type === "svg" ? _ = "svg" : f.type === "math" && (_ = "mathml"), a == null)
      Re(
        f,
        d,
        x,
        g,
        v,
        _,
        b,
        m
      );
    else {
      const y = a.el && a.el._isVueCE ? a.el : null;
      try {
        y && y._beginPatch(), Rn(
          a,
          f,
          g,
          v,
          _,
          b,
          m
        );
      } finally {
        y && y._endPatch();
      }
    }
  }, Re = (a, f, d, x, g, v, _, b) => {
    let m, y;
    const { props: k, shapeFlag: w, transition: T, dirs: O } = a;
    if (m = a.el = l(
      a.type,
      v,
      k && k.is,
      k
    ), w & 8 ? p(m, a.children) : w & 16 && Je(
      a.children,
      m,
      null,
      x,
      g,
      so(a, v),
      _,
      b
    ), O && Ke(a, null, x, "created"), Fe(m, a, a.scopeId, _, x), k) {
      for (const D in k)
        D !== "value" && !ct(D) && i(m, D, null, k[D], v, x);
      "value" in k && i(m, "value", null, k.value, v), (y = k.onVnodeBeforeMount) && he(y, x, a);
    }
    O && Ke(a, null, x, "beforeMount");
    const I = il(g, T);
    I && T.beforeEnter(m), r(m, f, d), ((y = k && k.onVnodeMounted) || I || O) && te(() => {
      y && he(y, x, a), I && T.enter(m), O && Ke(a, null, x, "mounted");
    }, g);
  }, Fe = (a, f, d, x, g) => {
    if (d && C(a, d), x)
      for (let v = 0; v < x.length; v++)
        C(a, x[v]);
    if (g) {
      let v = g.subTree;
      if (f === v || Cn(v.type) && (v.ssContent === f || v.ssFallback === f)) {
        const _ = g.vnode;
        Fe(
          a,
          _,
          _.scopeId,
          _.slotScopeIds,
          g.parent
        );
      }
    }
  }, Je = (a, f, d, x, g, v, _, b, m = 0) => {
    for (let y = m; y < a.length; y++) {
      const k = a[y] = b ? ke(a[y]) : ve(a[y]);
      A(
        null,
        k,
        f,
        d,
        x,
        g,
        v,
        _,
        b
      );
    }
  }, Rn = (a, f, d, x, g, v, _) => {
    const b = f.el = a.el;
    let { patchFlag: m, dynamicChildren: y, dirs: k } = f;
    m |= a.patchFlag & 16;
    const w = a.props || V, T = f.props || V;
    let O;
    if (d && Ue(d, !1), (O = T.onVnodeBeforeUpdate) && he(O, d, f, a), k && Ke(f, a, d, "beforeUpdate"), d && Ue(d, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    y && (!a.dynamicChildren || a.dynamicChildren.length !== y.length) && (m = 0, _ = !1, y = null), (w.innerHTML && T.innerHTML == null || w.textContent && T.textContent == null) && p(b, ""), y ? Yt(
      a.dynamicChildren,
      y,
      b,
      d,
      x,
      so(f, g),
      v
    ) : _ || Zt(
      a,
      f,
      b,
      null,
      d,
      x,
      so(f, g),
      v,
      !1
    ), m > 0) {
      if (m & 16)
        zo(b, w, T, d, g);
      else if (m & 2 && w.class !== T.class && i(b, "class", null, T.class, g), m & 4 && i(b, "style", w.style, T.style, g), m & 8) {
        const I = f.dynamicProps;
        for (let D = 0; D < I.length; D++) {
          const N = I[D], B = w[N], q = T[N];
          (q !== B || N === "value") && i(b, N, B, q, g, d);
        }
      }
      m & 1 && a.children !== f.children && p(b, f.children);
    } else !_ && y == null && zo(b, w, T, d, g);
    ((O = T.onVnodeUpdated) || k) && te(() => {
      O && he(O, d, f, a), k && Ke(f, a, d, "updated");
    }, x);
  }, Yt = (a, f, d, x, g, v, _) => {
    for (let b = 0; b < f.length; b++) {
      const m = a[b], y = f[b], k = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        m.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (m.type === ne || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !st(m, y) || // - In the case of a component, it could contain anything.
        m.shapeFlag & 198) ? h(m.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          d
        )
      );
      A(
        m,
        y,
        k,
        null,
        x,
        g,
        v,
        _,
        !0
      );
    }
  }, zo = (a, f, d, x, g) => {
    if (f !== d) {
      if (f !== V)
        for (const v in f)
          !ct(v) && !(v in d) && i(
            a,
            v,
            f[v],
            null,
            g,
            x
          );
      for (const v in d) {
        if (ct(v)) continue;
        const _ = d[v], b = f[v];
        _ !== b && v !== "value" && i(a, v, b, _, g, x);
      }
      "value" in d && i(a, "value", f.value, d.value, g);
    }
  }, Fn = (a, f, d, x, g, v, _, b, m) => {
    const y = f.el = a ? a.el : s(""), k = f.anchor = a ? a.anchor : s("");
    let { patchFlag: w, dynamicChildren: T, slotScopeIds: O } = f;
    O && (b = b ? b.concat(O) : O), a == null ? (r(y, d, x), r(k, d, x), Je(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      f.children || [],
      d,
      k,
      g,
      v,
      _,
      b,
      m
    )) : w > 0 && w & 64 && T && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    a.dynamicChildren && a.dynamicChildren.length === T.length ? (Yt(
      a.dynamicChildren,
      T,
      d,
      g,
      v,
      _,
      b
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (f.key != null || g && f === g.subTree) && _n(
      a,
      f,
      !0
      /* shallow */
    )) : Zt(
      a,
      f,
      d,
      k,
      g,
      v,
      _,
      b,
      m
    );
  }, Vn = (a, f, d, x, g, v, _, b, m) => {
    f.slotScopeIds = b, a == null ? f.shapeFlag & 512 ? g.ctx.activate(
      f,
      d,
      x,
      _,
      m
    ) : Lo(
      f,
      d,
      x,
      g,
      v,
      _,
      m
    ) : Nn(a, f, m);
  }, Lo = (a, f, d, x, g, v, _) => {
    const b = a.component = hl(
      a,
      x,
      g
    );
    if (an(a) && (b.ctx.renderer = nt), gl(b, !1, _), b.asyncDep) {
      if (g && g.registerDep(b, Ko, _), !a.el) {
        const m = b.subTree = me(we);
        U(null, m, f, d), a.placeholder = m.el;
      }
    } else
      Ko(
        b,
        a,
        f,
        d,
        g,
        v,
        _
      );
  }, Nn = (a, f, d) => {
    const x = f.component = a.component;
    if (Ji(a, f, d))
      if (x.asyncDep && !x.asyncResolved) {
        f.el = a.el, Xt(x, f, d);
        return;
      } else
        x.next = f, x.update();
    else
      f.el = a.el, x.vnode = f;
  }, Ko = (a, f, d, x, g, v, _) => {
    const b = () => {
      if (a.isMounted) {
        let { next: w, bu: T, u: O, parent: I, vnode: D } = a;
        {
          const ue = wn(a);
          if (ue) {
            w && (w.el = D.el, Xt(a, w, _)), ue.asyncDep.then(() => {
              te(() => {
                a.isUnmounted || y();
              }, g);
            });
            return;
          }
        }
        let N = w, B;
        Ue(a, !1), w ? (w.el = D.el, Xt(a, w, _)) : w = D, T && Mt(T), (B = w.props && w.props.onVnodeBeforeUpdate) && he(B, I, w, D), Ue(a, !0);
        const q = lr(a), pe = a.subTree;
        a.subTree = q, A(
          pe,
          q,
          // parent may have changed if it's in a teleport
          h(pe.el),
          // anchor may have changed if it's in a fragment
          Ct(pe),
          a,
          g,
          v
        ), w.el = q.el, N === null && Yi(a, q.el), O && te(O, g), (B = w.props && w.props.onVnodeUpdated) && te(
          () => he(B, I, w, D),
          g
        );
      } else {
        let w;
        const { el: T, props: O } = f, { bm: I, m: D, parent: N, root: B, type: q } = a, pe = Qe(f);
        Ue(a, !1), I && Mt(I), !pe && (w = O && O.onVnodeBeforeMount) && he(w, N, f), Ue(a, !0);
        {
          B.ce && B.ce._hasShadowRoot() && B.ce._injectChildStyle(
            q,
            a.parent ? a.parent.type : void 0
          );
          const ue = a.subTree = lr(a);
          A(
            null,
            ue,
            d,
            x,
            a,
            g,
            v
          ), f.el = ue.el;
        }
        if (D && te(D, g), !pe && (w = O && O.onVnodeMounted)) {
          const ue = f;
          te(
            () => he(w, N, ue),
            g
          );
        }
        (f.shapeFlag & 256 || N && Qe(N.vnode) && N.vnode.shapeFlag & 256) && a.a && te(a.a, g), a.isMounted = !0, f = d = x = null;
      }
    };
    a.scope.on();
    const m = a.effect = new Nr(b);
    a.scope.off();
    const y = a.update = m.run.bind(m), k = a.job = m.runIfDirty.bind(m);
    k.i = a, k.id = a.uid, m.scheduler = () => Fo(k), Ue(a, !0), y();
  }, Xt = (a, f, d) => {
    f.component = a;
    const x = a.vnode.props;
    a.vnode = f, a.next = null, Zi(a, f.props, x, d), ol(a, f.children, d), $e(), or(a), He();
  }, Zt = (a, f, d, x, g, v, _, b, m = !1) => {
    const y = a && a.children, k = a ? a.shapeFlag : 0, w = f.children, { patchFlag: T, shapeFlag: O } = f;
    if (T > 0) {
      if (T & 128) {
        Uo(
          y,
          w,
          d,
          x,
          g,
          v,
          _,
          b,
          m
        );
        return;
      } else if (T & 256) {
        jn(
          y,
          w,
          d,
          x,
          g,
          v,
          _,
          b,
          m
        );
        return;
      }
    }
    O & 8 ? (k & 16 && rt(y, g, v), w !== y && p(d, w)) : k & 16 ? O & 16 ? Uo(
      y,
      w,
      d,
      x,
      g,
      v,
      _,
      b,
      m
    ) : rt(y, g, v, !0) : (k & 8 && p(d, ""), O & 16 && Je(
      w,
      d,
      x,
      g,
      v,
      _,
      b,
      m
    ));
  }, jn = (a, f, d, x, g, v, _, b, m) => {
    a = a || We, f = f || We;
    const y = a.length, k = f.length, w = Math.min(y, k);
    let T;
    for (T = 0; T < w; T++) {
      const O = f[T] = m ? ke(f[T]) : ve(f[T]);
      A(
        a[T],
        O,
        d,
        null,
        g,
        v,
        _,
        b,
        m
      );
    }
    y > k ? rt(
      a,
      g,
      v,
      !0,
      !1,
      w
    ) : Je(
      f,
      d,
      x,
      g,
      v,
      _,
      b,
      m,
      w
    );
  }, Uo = (a, f, d, x, g, v, _, b, m) => {
    let y = 0;
    const k = f.length;
    let w = a.length - 1, T = k - 1;
    for (; y <= w && y <= T; ) {
      const O = a[y], I = f[y] = m ? ke(f[y]) : ve(f[y]);
      if (st(O, I))
        A(
          O,
          I,
          d,
          null,
          g,
          v,
          _,
          b,
          m
        );
      else
        break;
      y++;
    }
    for (; y <= w && y <= T; ) {
      const O = a[w], I = f[T] = m ? ke(f[T]) : ve(f[T]);
      if (st(O, I))
        A(
          O,
          I,
          d,
          null,
          g,
          v,
          _,
          b,
          m
        );
      else
        break;
      w--, T--;
    }
    if (y > w) {
      if (y <= T) {
        const O = T + 1, I = O < k ? f[O].el : x;
        for (; y <= T; )
          A(
            null,
            f[y] = m ? ke(f[y]) : ve(f[y]),
            d,
            I,
            g,
            v,
            _,
            b,
            m
          ), y++;
      }
    } else if (y > T)
      for (; y <= w; )
        Se(a[y], g, v, !0), y++;
    else {
      const O = y, I = y, D = /* @__PURE__ */ new Map();
      for (y = I; y <= T; y++) {
        const oe = f[y] = m ? ke(f[y]) : ve(f[y]);
        oe.key != null && D.set(oe.key, y);
      }
      let N, B = 0;
      const q = T - I + 1;
      let pe = !1, ue = 0;
      const it = new Array(q);
      for (y = 0; y < q; y++) it[y] = 0;
      for (y = O; y <= w; y++) {
        const oe = a[y];
        if (B >= q) {
          Se(oe, g, v, !0);
          continue;
        }
        let de;
        if (oe.key != null)
          de = D.get(oe.key);
        else
          for (N = I; N <= T; N++)
            if (it[N - I] === 0 && st(oe, f[N])) {
              de = N;
              break;
            }
        de === void 0 ? Se(oe, g, v, !0) : (it[de - I] = y + 1, de >= ue ? ue = de : pe = !0, A(
          oe,
          f[de],
          d,
          null,
          g,
          v,
          _,
          b,
          m
        ), B++);
      }
      const qo = pe ? ll(it) : We;
      for (N = qo.length - 1, y = q - 1; y >= 0; y--) {
        const oe = I + y, de = f[oe], Go = f[oe + 1], Jo = oe + 1 < k ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          Go.el || Sn(Go)
        ) : x;
        it[y] === 0 ? A(
          null,
          de,
          d,
          Jo,
          g,
          v,
          _,
          b,
          m
        ) : pe && (N < 0 || y !== qo[N] ? St(de, d, Jo, 2) : N--);
      }
    }
  }, St = (a, f, d, x, g = null) => {
    const { el: v, type: _, transition: b, children: m, shapeFlag: y } = a;
    if (y & 6) {
      St(a.component.subTree, f, d, x);
      return;
    }
    if (y & 128) {
      a.suspense.move(f, d, x);
      return;
    }
    if (y & 64) {
      _.move(a, f, d, nt);
      return;
    }
    if (_ === ne) {
      r(v, f, d);
      for (let w = 0; w < m.length; w++)
        St(m[w], f, d, x);
      r(a.anchor, f, d);
      return;
    }
    if (_ === ao) {
      z(a, f, d);
      return;
    }
    if (x !== 2 && y & 1 && b)
      if (x === 0)
        b.persisted && !v[io] ? r(v, f, d) : (b.beforeEnter(v), r(v, f, d), te(() => b.enter(v), g));
      else {
        const { leave: w, delayLeave: T, afterLeave: O } = b, I = () => {
          a.ctx.isUnmounted ? n(v) : r(v, f, d);
        }, D = () => {
          const N = v._isLeaving || !!v[io];
          v._isLeaving && v[io](
            !0
            /* cancelled */
          ), b.persisted && !N ? I() : w(v, () => {
            I(), O && O();
          });
        };
        T ? T(v, I, D) : D();
      }
    else
      r(v, f, d);
  }, Se = (a, f, d, x = !1, g = !1) => {
    const {
      type: v,
      props: _,
      ref: b,
      children: m,
      dynamicChildren: y,
      shapeFlag: k,
      patchFlag: w,
      dirs: T,
      cacheIndex: O,
      memo: I
    } = a;
    if ((w === -2 || y && y.hasOnce) && (g = !1), b != null && ($e(), ut(b, null, d, a, !0), He()), O != null && (!a.ctx || a.ctx === f) && (f.renderCache[O] = void 0), k & 256) {
      f.ctx.deactivate(a);
      return;
    }
    const D = k & 1 && T, N = !Qe(a);
    let B;
    if (N && (B = _ && _.onVnodeBeforeUnmount) && he(B, f, a), k & 6)
      $n(a.component, d, x);
    else {
      if (k & 128) {
        a.suspense.unmount(d, x);
        return;
      }
      D && Ke(a, null, f, "beforeUnmount"), k & 64 ? a.type.remove(
        a,
        f,
        d,
        nt,
        x
      ) : y && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !y.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (v !== ne || w > 0 && w & 64) ? rt(
        y,
        f,
        d,
        !1,
        !0
      ) : (v === ne && w & 384 || !g && k & 16) && rt(m, f, d), x && Bo(a);
    }
    const q = I != null && O == null;
    (N && (B = _ && _.onVnodeUnmounted) || D || q) && te(() => {
      B && he(B, f, a), D && Ke(a, null, f, "unmounted"), q && (a.el = null);
    }, d);
  }, Bo = (a) => {
    const { type: f, el: d, anchor: x, transition: g } = a;
    if (f === ne) {
      Dn(d, x);
      return;
    }
    if (f === ao) {
      E(a), g && !g.persisted && g.afterLeave && g.afterLeave();
      return;
    }
    const v = () => {
      n(d), g && !g.persisted && g.afterLeave && g.afterLeave();
    };
    if (a.shapeFlag & 1 && g && !g.persisted) {
      const { leave: _, delayLeave: b } = g, m = () => _(d, v);
      b ? b(a.el, v, m) : m();
    } else
      v();
  }, Dn = (a, f) => {
    let d;
    for (; a !== f; )
      d = S(a), n(a), a = d;
    n(f);
  }, $n = (a, f, d) => {
    const { bum: x, scope: g, job: v, subTree: _, um: b, m, a: y } = a;
    cr(m), cr(y), x && Mt(x), g.stop(), v ? (v.flags |= 8, Se(_, a, f, d)) : a.vnode.el && _ && (_.transition = a.vnode.transition, Se(_, a, f, d)), b && te(b, f), te(() => {
      a.isUnmounted = !0;
    }, f);
  }, rt = (a, f, d, x = !1, g = !1, v = 0) => {
    for (let _ = v; _ < a.length; _++)
      Se(a[_], f, d, x, g);
  }, Ct = (a) => {
    if (a.shapeFlag & 6)
      return Ct(a.component.subTree);
    if (a.shapeFlag & 128)
      return a.suspense.next();
    const f = S(a.anchor || a.el), d = f && f[ji];
    return d ? S(d) : f;
  };
  let Qt = !1;
  const Wo = (a, f, d) => {
    let x;
    a == null ? f._vnode && (Se(f._vnode, null, null, !0), x = f._vnode.component) : A(
      f._vnode || null,
      a,
      f,
      null,
      null,
      null,
      d
    ), f._vnode = a, Qt || (Qt = !0, or(x), on(), Qt = !1);
  }, nt = {
    p: A,
    um: Se,
    m: St,
    r: Bo,
    mt: Lo,
    mc: Je,
    pc: Zt,
    pbc: Yt,
    n: Ct,
    o: e
  };
  return {
    render: Wo,
    hydrate: void 0,
    createApp: Ui(Wo)
  };
}
function so({ type: e, props: t }, o) {
  return o === "svg" && e === "foreignObject" || o === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : o;
}
function Ue({ effect: e, job: t }, o) {
  o ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function il(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function _n(e, t, o = !1) {
  const r = e.children, n = t.children;
  if (M(r) && M(n))
    for (let i = 0; i < r.length; i++) {
      const l = r[i];
      let s = n[i];
      s.shapeFlag & 1 && !s.dynamicChildren && ((s.patchFlag <= 0 || s.patchFlag === 32) && (s = n[i] = ke(n[i]), s.el = l.el), !o && s.patchFlag !== -2 && _n(l, s)), s.type === Gt && (s.patchFlag === -1 && (s = n[i] = ke(s)), s.el = l.el), s.type === we && !s.el && (s.el = l.el);
    }
}
function ll(e) {
  const t = e.slice(), o = [0];
  let r, n, i, l, s;
  const c = e.length;
  for (r = 0; r < c; r++) {
    const u = e[r];
    if (u !== 0) {
      if (n = o[o.length - 1], e[n] < u) {
        t[r] = n, o.push(r);
        continue;
      }
      for (i = 0, l = o.length - 1; i < l; )
        s = i + l >> 1, e[o[s]] < u ? i = s + 1 : l = s;
      u < e[o[i]] && (i > 0 && (t[r] = o[i - 1]), o[i] = r);
    }
  }
  for (i = o.length, l = o[i - 1]; i-- > 0; )
    o[i] = l, l = t[l];
  return o;
}
function wn(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : wn(t);
}
function cr(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function Sn(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? Sn(t.subTree) : null;
}
const Cn = (e) => e.__isSuspense;
function sl(e, t) {
  t && t.pendingBranch ? M(e) ? t.effects.push(...e) : t.effects.push(e) : Ii(e);
}
const ne = /* @__PURE__ */ Symbol.for("v-fgt"), Gt = /* @__PURE__ */ Symbol.for("v-txt"), we = /* @__PURE__ */ Symbol.for("v-cmt"), ao = /* @__PURE__ */ Symbol.for("v-stc"), Oe = [];
let re = null;
function bo(e = !1) {
  Oe.push(re = e ? null : []);
}
function Do() {
  Oe.pop(), re = Oe[Oe.length - 1] || null;
}
let vt = 1;
function fr(e, t = !1) {
  vt += e, e < 0 && re && t && (re.hasOnce = !0);
}
function Tn(e) {
  return e.dynamicChildren = vt > 0 ? re || We : null, Do(), vt > 0 && re && re.push(e), e;
}
function fs(e, t, o, r, n, i) {
  return Tn(
    An(
      e,
      t,
      o,
      r,
      n,
      i,
      !0
    )
  );
}
function _o(e, t, o, r, n) {
  return Tn(
    me(
      e,
      t,
      o,
      r,
      n,
      !0
    )
  );
}
function $o(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function st(e, t) {
  return e.type === t.type && e.key === t.key;
}
const kn = ({ key: e }) => e ?? null, It = ({
  ref: e,
  ref_key: t,
  ref_for: o
}) => (typeof e == "number" && (e = "" + e), e != null ? W(e) || /* @__PURE__ */ ee(e) || j(e) ? { i: Z, r: e, k: t, f: !!o } : e : null);
function An(e, t = null, o = null, r = 0, n = null, i = e === ne ? 0 : 1, l = !1, s = !1) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && kn(t),
    ref: t && It(t),
    scopeId: nn,
    slotScopeIds: null,
    children: o,
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
    patchFlag: r,
    dynamicProps: n,
    dynamicChildren: null,
    appContext: null,
    ctx: Z
  };
  return s ? (Nt(c, o), i & 128 && e.normalize(c)) : o && (c.shapeFlag |= W(o) ? 8 : 16), vt > 0 && // avoid a block node from tracking itself
  !l && // has current parent block
  re && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (c.patchFlag > 0 || i & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  c.patchFlag !== 32 && re.push(c), c;
}
const me = al;
function al(e, t = null, o = null, r = 0, n = null, i = !1) {
  if ((!e || e === zi) && (e = we), $o(e)) {
    const s = tt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return o && Nt(s, o), vt > 0 && !i && re && (s.shapeFlag & 6 ? re[re.indexOf(e)] = s : re.push(s)), s.patchFlag = -2, s;
  }
  if (ml(e) && (e = e.__vccOpts), t) {
    t = cl(t);
    let { class: s, style: c } = t;
    s && !W(s) && (t.class = ko(s)), L(c) && (/* @__PURE__ */ Ro(c) && !M(c) && (c = ae({}, c)), t.style = To(c));
  }
  const l = W(e) ? 1 : Cn(e) ? 128 : Wt(e) ? 64 : L(e) ? 4 : j(e) ? 2 : 0;
  return An(
    e,
    t,
    o,
    r,
    n,
    l,
    i,
    !0
  );
}
function cl(e) {
  return e ? /* @__PURE__ */ Ro(e) || yn(e) ? ae({}, e) : e : null;
}
function tt(e, t, o = !1, r = !1) {
  const { props: n, ref: i, patchFlag: l, children: s, transition: c } = e, u = t ? pl(n || {}, t) : n, p = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: u,
    key: u && kn(u),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      o && i ? M(i) ? i.concat(It(t)) : [i, It(t)] : It(t)
    ) : i,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: s,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ne ? l === -1 ? 16 : l | 16 : l,
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
    ssContent: e.ssContent && tt(e.ssContent),
    ssFallback: e.ssFallback && tt(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce,
    cacheIndex: e.cacheIndex
  };
  return c && r && Vo(
    p,
    c.clone(p)
  ), p;
}
function fl(e = " ", t = 0) {
  return me(Gt, null, e, t);
}
function ps(e = "", t = !1) {
  return t ? (bo(), _o(we, null, e)) : me(we, null, e);
}
function ve(e) {
  return e == null || typeof e == "boolean" ? me(we) : M(e) ? me(
    ne,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : $o(e) ? ke(e) : me(Gt, null, String(e));
}
function ke(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : tt(e);
}
function Nt(e, t) {
  let o = 0;
  const { shapeFlag: r } = e;
  if (t == null)
    t = null;
  else if (M(t))
    o = 16;
  else if (typeof t == "object")
    if (r & 65) {
      const n = t.default;
      n && (n._c && (n._d = !1), Nt(e, n()), n._c && (n._d = !0));
      return;
    } else {
      o = 32;
      const n = t._;
      !n && !yn(t) ? t._ctx = Z : n === 3 && Z && (Z.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else if (j(t)) {
    if (r & 65) {
      Nt(e, { default: t });
      return;
    }
    t = { default: t, _ctx: Z }, o = 32;
  } else
    t = String(t), r & 64 ? (o = 16, t = [fl(t)]) : o = 8;
  e.children = t, e.shapeFlag |= o;
}
function pl(...e) {
  const t = {};
  for (let o = 0; o < e.length; o++) {
    const r = e[o];
    for (const n in r)
      if (n === "class")
        t.class !== r.class && (t.class = ko([t.class, r.class]));
      else if (n === "style")
        t.style = To([t.style, r.style]);
      else if (Dt(n)) {
        const i = t[n], l = r[n];
        l && i !== l && !(M(i) && i.includes(l)) ? t[n] = i ? [].concat(i, l) : l : l == null && i == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !$t(n) && (t[n] = l);
      } else n !== "" && (t[n] = r[n]);
  }
  return t;
}
function he(e, t, o, r = null) {
  _e(e, t, 7, [
    o,
    r
  ]);
}
const ul = pn();
let dl = 0;
function hl(e, t, o) {
  const r = e.type, n = (t ? t.appContext : e.appContext) || ul, i = {
    uid: dl++,
    vnode: e,
    type: r,
    parent: t,
    appContext: n,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Qn(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(n.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Qi(r, n),
    emitsOptions: Wi(r, n),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: V,
    // inheritAttrs
    inheritAttrs: r.inheritAttrs,
    // state
    ctx: V,
    data: V,
    props: V,
    attrs: V,
    slots: V,
    refs: V,
    setupState: V,
    setupContext: null,
    // suspense related
    suspense: o,
    suspenseId: o ? o.pendingId : 0,
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
  return i.ctx = { _: i }, i.root = t ? t.root : i, i.emit = Bi.bind(null, i), e.ce && e.ce(i), i;
}
let Le = null;
const En = () => Le || Z;
let jt, xt;
{
  const e = Lt(), t = (o, r) => {
    let n;
    return (n = e[o]) || (n = e[o] = []), n.push(r), (i) => {
      n.length > 1 ? n.forEach((l) => l(i)) : n[0](i);
    };
  };
  jt = t(
    "__VUE_INSTANCE_SETTERS__",
    (o) => Le = o
  ), xt = t(
    "__VUE_SSR_SETTERS__",
    (o) => mt = o
  );
}
const Ho = (e) => {
  const t = Le;
  return jt(e), e.scope.on(), () => {
    e.scope.off(), jt(t);
  };
}, pr = () => {
  Le && Le.scope.off(), jt(null);
};
function On(e) {
  return e.vnode.shapeFlag & 4;
}
let mt = !1;
function gl(e, t = !1, o = !1) {
  t && xt(t);
  const { props: r, children: n } = e.vnode, i = On(e);
  Xi(e, r, i, t), tl(e, n, o || t);
  const l = i ? yl(e, t) : void 0;
  return t && xt(!1), l;
}
function yl(e, t) {
  const o = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Li);
  const { setup: r } = o;
  if (r) {
    $e();
    const n = e.setupContext = r.length > 1 ? xl(e) : null, i = Ho(e), l = wt(
      r,
      e,
      0,
      [
        e.props,
        n
      ]
    ), s = Er(l);
    if (He(), i(), (s || e.sp) && !Qe(e) && $i(e), s) {
      if (l.then(pr, pr), t)
        return l.then((c) => {
          xt(!0);
          try {
            ur(e, c, t);
          } finally {
            xt(!1);
          }
        }).catch((c) => {
          Bt(c, e, 0);
        });
      e.asyncDep = l;
    } else
      ur(e, l);
  } else
    Mn(e);
}
function ur(e, t, o) {
  j(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : L(t) && (e.setupState = Zr(t)), Mn(e);
}
function Mn(e, t, o) {
  const r = e.type;
  e.render || (e.render = r.render || qe);
}
const vl = {
  get(e, t) {
    return X(e, "get", ""), e[t];
  }
};
function xl(e) {
  const t = (o) => {
    e.exposed = o || {};
  };
  return {
    attrs: new Proxy(e.attrs, vl),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Jt(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Zr(mi(e.exposed)), {
    get(t, o) {
      if (o in t)
        return t[o];
      if (o in dt)
        return dt[o](e);
    },
    has(t, o) {
      return o in t || o in dt;
    }
  })) : e.proxy;
}
function ml(e) {
  return j(e) && "__vccOpts" in e;
}
const us = (e, t) => /* @__PURE__ */ ki(e, t, mt), bl = "3.5.43";
let wo;
const dr = typeof window < "u" && window.trustedTypes;
if (dr)
  try {
    wo = /* @__PURE__ */ dr.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const In = wo ? (e) => wo.createHTML(e) : (e) => e, _l = "http://www.w3.org/2000/svg", wl = "http://www.w3.org/1998/Math/MathML", Te = typeof document < "u" ? document : null, hr = Te && /* @__PURE__ */ Te.createElement("template"), Sl = {
  insert: (e, t, o) => {
    t.insertBefore(e, o || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, o, r) => {
    const n = t === "svg" ? Te.createElementNS(_l, e) : t === "mathml" ? Te.createElementNS(wl, e) : o ? Te.createElement(e, { is: o }) : Te.createElement(e);
    return e === "select" && r && r.multiple != null && n.setAttribute("multiple", r.multiple), n;
  },
  createText: (e) => Te.createTextNode(e),
  createComment: (e) => Te.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Te.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, o, r, n, i) {
    const l = o ? o.previousSibling : t.lastChild;
    if (n && (n === i || n.nextSibling))
      for (; t.insertBefore(n.cloneNode(!0), o), !(n === i || !(n = n.nextSibling)); )
        ;
    else {
      hr.innerHTML = In(
        r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e
      );
      const s = hr.content;
      if (r === "svg" || r === "mathml") {
        const c = s.firstChild;
        for (; c.firstChild; )
          s.appendChild(c.firstChild);
        s.removeChild(c);
      }
      t.insertBefore(s, o);
    }
    return [
      // first
      l ? l.nextSibling : t.firstChild,
      // last
      o ? o.previousSibling : t.lastChild
    ];
  }
}, Cl = /* @__PURE__ */ Symbol("_vtc");
function Tl(e, t, o) {
  const r = e[Cl];
  r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : o ? e.setAttribute("class", t) : e.className = t;
}
const gr = /* @__PURE__ */ Symbol("_vod"), kl = /* @__PURE__ */ Symbol("_vsh"), Al = /* @__PURE__ */ Symbol(""), El = /(?:^|;)\s*display\s*:/;
function Ol(e, t, o) {
  const r = e.style, n = W(o);
  let i = !1;
  if (o && !n) {
    if (t)
      if (W(t))
        for (const l of t.split(";")) {
          const s = l.slice(0, l.indexOf(":")).trim();
          o[s] == null && at(r, s, "");
        }
      else
        for (const l in t)
          o[l] == null && at(r, l, "");
    for (const l in o) {
      l === "display" && (i = !0);
      const s = o[l];
      s != null ? Il(
        e,
        l,
        !W(t) && t ? t[l] : void 0,
        s
      ) || at(r, l, s) : at(r, l, "");
    }
  } else if (n) {
    if (t !== o) {
      const l = r[Al];
      l && (o += ";" + l), r.cssText = o, i = El.test(o);
    }
  } else t && e.removeAttribute("style");
  gr in e && (e[gr] = i ? r.display : "", e[kl] && (r.display = "none"));
}
const Et = /\s*!important$/;
function at(e, t, o) {
  if (M(o))
    o.forEach((r) => at(e, t, r));
  else if (o == null && (o = ""), t.startsWith("--"))
    Et.test(o) ? e.setProperty(t, o.replace(Et, ""), "important") : e.setProperty(t, o);
  else {
    const r = Ml(e, t);
    Et.test(o) ? e.setProperty(
      Pe(r),
      o.replace(Et, ""),
      "important"
    ) : e[r] = o;
  }
}
const yr = ["Webkit", "Moz", "ms"], co = {};
function Ml(e, t) {
  const o = co[t];
  if (o)
    return o;
  let r = ie(t);
  if (r !== "filter" && r in e)
    return co[t] = r;
  r = Ir(r);
  for (let n = 0; n < yr.length; n++) {
    const i = yr[n] + r;
    if (i in e)
      return co[t] = i;
  }
  return t;
}
function Il(e, t, o, r) {
  return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && W(r) && o === r;
}
const vr = "http://www.w3.org/1999/xlink";
function xr(e, t, o, r, n, i = Jn(t)) {
  r && t.startsWith("xlink:") ? o == null ? e.removeAttributeNS(vr, t.slice(6, t.length)) : e.setAttributeNS(vr, t, o) : o == null || i && !Rr(o) ? e.removeAttribute(t) : e.setAttribute(
    t,
    i ? "" : fe(o) ? String(o) : o
  );
}
function mr(e, t, o, r, n) {
  if (t === "innerHTML" || t === "textContent") {
    o != null && (e[t] = t === "innerHTML" ? In(o) : o);
    return;
  }
  const i = e.tagName;
  if (t === "value" && i !== "PROGRESS" && // custom elements may use _value internally
  !i.includes("-")) {
    const s = i === "OPTION" ? e.getAttribute("value") || "" : e.value, c = o == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(o);
    (s !== c || !("_value" in e)) && (e.value = c), o == null && e.removeAttribute(t), e._value = o;
    return;
  }
  let l = !1;
  if (o === "" || o == null) {
    const s = typeof e[t];
    s === "boolean" ? o = Rr(o) : o == null && s === "string" ? (o = "", l = !0) : s === "number" && (o = 0, l = !0);
  }
  try {
    e[t] = o;
  } catch {
  }
  l && e.removeAttribute(n || t);
}
function Ne(e, t, o, r) {
  e.addEventListener(t, o, r);
}
function Pl(e, t, o, r) {
  e.removeEventListener(t, o, r);
}
const br = /* @__PURE__ */ Symbol("_vei");
function Rl(e, t, o, r, n = null) {
  const i = e[br] || (e[br] = {}), l = i[t];
  if (r && l)
    l.value = r;
  else {
    const [s, c] = Nl(t);
    if (r) {
      const u = i[t] = $l(
        r,
        n
      );
      Ne(e, s, u, c);
    } else l && (Pl(e, s, l, c), i[t] = void 0);
  }
}
const Fl = /(Once|Passive|Capture)$/, Vl = /^on:?(?:Once|Passive|Capture)$/;
function Nl(e) {
  let t, o;
  for (; (o = e.match(Fl)) && !Vl.test(e); )
    t || (t = {}), e = e.slice(0, e.length - o[1].length), t[o[1].toLowerCase()] = !0;
  return [e[2] === ":" ? e.slice(3) : Pe(e.slice(2)), t];
}
let fo = 0;
const jl = /* @__PURE__ */ Promise.resolve(), Dl = () => fo || (jl.then(() => fo = 0), fo = Date.now());
function $l(e, t) {
  const o = (r) => {
    if (!r._vts)
      r._vts = Date.now();
    else if (r._vts <= o.attached)
      return;
    const n = o.value;
    if (M(n)) {
      const i = r.stopImmediatePropagation;
      r.stopImmediatePropagation = () => {
        i.call(r), r._stopped = !0;
      };
      const l = n.slice(), s = [r];
      for (let c = 0; c < l.length && !r._stopped; c++) {
        const u = l[c];
        u && _e(
          u,
          t,
          5,
          s
        );
      }
    } else
      _e(
        n,
        t,
        5,
        [r]
      );
  };
  return o.value = e, o.attached = Dl(), o;
}
const _r = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Hl = (e, t, o, r, n, i) => {
  const l = n === "svg";
  t === "class" ? Tl(e, r, l) : t === "style" ? Ol(e, o, r) : Dt(t) ? $t(t) || Rl(e, t, o, r, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : zl(e, t, r, l)) ? (mr(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && xr(e, t, r, l, i, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (Ll(e, t) || // @ts-expect-error _def is private
  e._def.__asyncLoader && (/[A-Z]/.test(t) || !W(r))) ? mr(e, ie(t), r, i, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), xr(e, t, r, l));
};
function zl(e, t, o, r) {
  if (r)
    return !!(t === "innerHTML" || t === "textContent" || t in e && _r(t) && j(o));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const n = e.tagName;
    if (n === "IMG" || n === "VIDEO" || n === "CANVAS" || n === "SOURCE")
      return !1;
  }
  return _r(t) && W(o) ? !1 : t in e;
}
function Ll(e, t) {
  const o = (
    // @ts-expect-error _def is private
    e._def.props
  );
  if (!o)
    return !1;
  const r = ie(t);
  return Array.isArray(o) ? o.some((n) => ie(n) === r) : Object.keys(o).some((n) => ie(n) === r);
}
const ot = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return M(t) ? (o) => Mt(t, o) : t;
};
function Kl(e) {
  e.target.composing = !0;
}
function wr(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const xe = /* @__PURE__ */ Symbol("_assign"), Ot = /* @__PURE__ */ Symbol("_initialValue");
function po(e, t, o) {
  return t && (e = e.trim()), o && (e = zt(e)), e;
}
const ds = {
  created(e, { modifiers: { lazy: t, trim: o, number: r } }, n) {
    e.parentNode && (e.type === "text" ? e[Ot] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Ot] = e.defaultValue.replace(/\r\n?/g, `
`))), e[xe] = ot(n);
    const i = r || n.props && n.props.type === "number";
    Ne(e, t ? "change" : "input", (l) => {
      l.target.composing || e[xe](po(e.value, o, i));
    }), (o || i) && Ne(e, "change", () => {
      e.value = po(e.value, o, i);
    }), t || (Ne(e, "compositionstart", Kl), Ne(e, "compositionend", wr), Ne(e, "change", wr));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t, modifiers: { trim: o, number: r } }) {
    const n = t ?? "", i = e[Ot];
    delete e[Ot], i !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== i ? e[xe](po(e.value, o, r)) : e.value = n;
  },
  beforeUpdate(e, { value: t, oldValue: o, modifiers: { lazy: r, trim: n, number: i } }, l) {
    if (e[xe] = ot(l), e.composing) return;
    const s = (i || e.type === "number") && !/^0\d/.test(e.value) ? zt(e.value) : e.value, c = t ?? "";
    if (s === c)
      return;
    const u = e.getRootNode();
    (u instanceof Document || u instanceof ShadowRoot) && u.activeElement === e && e.type !== "range" && (r && t === o || n && e.value.trim() === c) || (e.value = c);
  }
}, hs = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(e, t, o) {
    e[xe] = ot(o), Ne(e, "change", () => {
      const r = e._modelValue, n = bt(e), i = e.checked, l = e[xe];
      if (M(r)) {
        const s = Ao(r, n), c = s !== -1;
        if (i && !c)
          l(r.concat(n));
        else if (!i && c) {
          const u = [...r];
          u.splice(s, 1), l(u);
        }
      } else if (Me(r)) {
        const s = new Set(r);
        i ? s.add(n) : s.delete(n), l(s);
      } else
        l(Pn(e, i));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: Sr,
  beforeUpdate(e, t, o) {
    e[xe] = ot(o), Sr(e, t, o);
  }
};
function Sr(e, { value: t, oldValue: o }, r) {
  e._modelValue = t;
  let n;
  if (M(t))
    n = Ao(t, r.props.value) > -1;
  else if (Me(t))
    n = t.has(r.props.value);
  else {
    if (t === o) return;
    n = Ie(t, Pn(e, !0));
  }
  e.checked !== n && (e.checked = n);
}
const gs = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: o } }, r) {
    e._modelValue = t, Ne(e, "change", () => {
      const n = Array.prototype.filter.call(e.options, (c) => c.selected).map(
        (c) => o ? zt(bt(c)) : bt(c)
      ), i = e.multiple, l = i ? Me(e._modelValue) ? new Set(n) : n : n[0], s = e._pendingValue = [
        i,
        i ? M(l) ? n.slice() : n : l
      ];
      try {
        e[xe](l);
      } finally {
        en(() => {
          e._pendingValue === s && (e._pendingValue = void 0);
        });
      }
    }), e[xe] = ot(r);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    Cr(e, t);
  },
  beforeUpdate(e, { value: t }, o) {
    e._modelValue = t, e[xe] = ot(o);
  },
  updated(e, { value: t }) {
    const o = e._pendingValue;
    e._pendingValue = void 0, (!o || o[0] !== e.multiple || !Ul(t, o[1], o[0])) && Cr(e, t);
  }
};
function Ul(e, t, o) {
  if (!o || M(e)) return Ie(e, t);
  if (Me(e)) {
    if (e.size !== t.length) return !1;
    for (const r of t)
      if (!e.has(r)) return !1;
    return !0;
  }
  return !1;
}
function Cr(e, t) {
  const o = e.multiple, r = M(t);
  if (!(o && !r && !Me(t))) {
    for (let n = 0, i = e.options.length; n < i; n++) {
      const l = e.options[n], s = bt(l);
      if (o)
        if (r) {
          const c = typeof s;
          c === "string" || c === "number" ? l.selected = t.some((u) => String(u) === String(s)) : l.selected = Ao(t, s) > -1;
        } else
          l.selected = t.has(s);
      else if (Ie(bt(l), t)) {
        e.selectedIndex !== n && (e.selectedIndex = n);
        return;
      }
    }
    !o && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function bt(e) {
  return "_value" in e ? e._value : e.value;
}
function Pn(e, t) {
  const o = t ? "_trueValue" : "_falseValue";
  return o in e ? e[o] : t;
}
const Bl = ["ctrl", "shift", "alt", "meta"], Wl = {
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
  exact: (e, t) => Bl.some((o) => e[`${o}Key`] && !t.includes(o))
}, ys = (e, t) => {
  if (!e) return e;
  const o = e._withMods || (e._withMods = {}), r = t.join(".");
  return o[r] || (o[r] = ((n, ...i) => {
    for (let l = 0; l < t.length; l++) {
      const s = Wl[t[l]];
      if (s && s(n, t)) return;
    }
    return e(n, ...i);
  }));
}, ql = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, vs = (e, t) => {
  const o = e._withKeys || (e._withKeys = {}), r = t.join(".");
  return o[r] || (o[r] = ((n) => {
    if (!("key" in n))
      return;
    const i = Pe(n.key);
    if (t.some(
      (l) => l === i || ql[l] === i
    ))
      return e(n);
  }));
}, Gl = /* @__PURE__ */ ae({ patchProp: Hl }, Sl);
let Tr;
function Jl() {
  return Tr || (Tr = rl(Gl));
}
const xs = ((...e) => {
  const t = Jl().createApp(...e), { mount: o } = t;
  return t.mount = (r) => {
    const n = Xl(r);
    if (!n) return;
    const i = t._component;
    !j(i) && !i.render && !i.template && (i.template = n.innerHTML), n.nodeType === 1 && (n.textContent = "");
    const l = o(n, !1, Yl(n));
    return n instanceof Element && (n.removeAttribute("v-cloak"), n.setAttribute("data-v-app", "")), l;
  }, t;
});
function Yl(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Xl(e) {
  return W(e) ? document.querySelector(e) : e;
}
const ms = '.plenio-overlay{position:fixed;inset:0;z-index:3000;background:#0000008c;display:flex;align-items:center;justify-content:center;font:13px/1.45 var(--font-family, sans-serif)}.plenio-overlay .plenio-dialog{position:relative;width:min(1280px,96vw);height:min(900px,94vh);max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);--plenio-dialog-h: min(900px, 94vh);display:flex;flex-direction:column;background:var(--comfy-menu-bg, #222);color:var(--fg-color, #ddd);border:1px solid var(--border-color, #444);border-radius:10px;box-shadow:0 12px 40px #0000007f}.plenio-overlay .resize-handle{position:absolute;right:2px;bottom:2px;width:16px;height:16px;cursor:nwse-resize;border-bottom-right-radius:8px;background:linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 0 0 / 8px 8px,linear-gradient(135deg,transparent 0 46%,var(--descrip-text, #888) 46% 54%,transparent 54%) 4px 4px / 8px 8px;touch-action:none}.plenio-overlay .plenio-dialog.maximized{border-radius:6px}.plenio-overlay .splitter{flex:none;background:transparent;touch-action:none}.plenio-overlay .splitter.horizontal{height:10px;margin:-3px 0;cursor:ns-resize;border-radius:5px}.plenio-overlay .splitter.vertical{width:10px;margin:0 -3px;cursor:ew-resize;border-radius:5px}.plenio-overlay .splitter:hover,.plenio-overlay .splitter:focus-visible{background:#4c9aff59;outline:none}.plenio-overlay .score-views>.splitter.horizontal{grid-row:1;align-self:end;height:10px;margin-bottom:-9px;z-index:2}.plenio-overlay .score-main>.splitter.vertical{grid-column:1;justify-self:end;align-self:stretch;width:10px;margin-right:-10px;z-index:2}.plenio-overlay header,.plenio-overlay footer,.plenio-overlay .doc-head{display:flex;align-items:center;gap:8px}.plenio-overlay header{padding:12px 16px;border-bottom:1px solid var(--border-color, #444)}.plenio-overlay header h2{margin:0;font-size:16px}.plenio-overlay .status{color:var(--descrip-text, #999)}.plenio-overlay .status.bad,.plenio-overlay .error{color:#e0685e}.plenio-overlay .spacer{flex:1}.plenio-overlay .body{overflow:auto;padding:8px 16px;flex:1;min-height:0}.plenio-overlay .hint{margin:8px 16px 0;color:var(--descrip-text, #999)}.plenio-overlay .doc{margin:10px 0 14px}.plenio-overlay .doc h3{margin:0;font-size:13px}.plenio-overlay .badge{font-size:11px;padding:1px 7px;border-radius:9px;background:var(--comfy-input-bg, #333);color:var(--descrip-text, #aaa)}.plenio-overlay .badge[data-state=edited],.plenio-overlay .badge[data-state="edited (merged)"]{background:#2f5f8a;color:#fff}.plenio-overlay .badge[data-state=manual]{background:#7a5a1e;color:#fff}.plenio-overlay .badge[data-state=conflict]{background:#8a2f2f;color:#fff}.plenio-overlay textarea,.plenio-overlay pre{box-sizing:border-box;width:100%;margin-top:6px;padding:8px;border-radius:6px;border:1px solid var(--border-color, #444);background:var(--comfy-input-bg, #1b1b1b);color:var(--input-text, #ddd);font:inherit;resize:vertical}.plenio-overlay pre{white-space:pre-wrap;max-height:220px;overflow:auto}.plenio-overlay .mono,.plenio-overlay pre{font-family:var(--code-font, ui-monospace, monospace);font-size:12px}.plenio-overlay .conflict{margin-top:6px;padding:8px;border-radius:6px;background:#8a2f2f40}.plenio-overlay .findings{padding:4px 16px;max-height:22vh;overflow:auto;border-top:1px solid var(--border-color, #444)}.plenio-overlay .findings ul{margin:6px 0;padding-left:18px}.plenio-overlay .arrangement{margin:6px 0}.plenio-overlay .arrangement p{margin:4px 0}.plenio-overlay .arrangement[data-status=fallback] strong{color:#d8a31a}.plenio-overlay .arrangement summary{cursor:pointer}.plenio-overlay .arrangement .experimental{display:inline-block;margin:0 4px;padding:0 6px;border:1px solid #d8a31a;border-radius:8px;color:#d8a31a;font-size:.85em;line-height:1.5}.plenio-overlay .arrangement .idea,.plenio-overlay .arrangement .kept{color:var(--descrip-text, #999)}.plenio-overlay li[data-severity=error] strong{color:#e0685e}.plenio-overlay li[data-severity=warning] strong{color:#d8a31a}.plenio-overlay li[data-severity=info],.plenio-overlay .where{color:var(--descrip-text, #999)}.plenio-overlay .arrangement .where{margin:0 6px}.plenio-overlay footer{padding:10px 16px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .facts{color:var(--descrip-text, #999)}.plenio-overlay button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);cursor:pointer}.plenio-overlay button:disabled{opacity:.45;cursor:default}.plenio-overlay button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button.icon{margin-left:auto;font-size:18px;line-height:1;padding:2px 8px}.plenio-overlay .asr{margin:4px 0;font-size:12px;color:var(--descrip-text, #aaa);display:flex;flex-wrap:wrap;gap:8px}.plenio-overlay .asr mark{background:#e6b43c4d;color:inherit;border-radius:3px;padding:0 3px;margin-right:3px}.plenio-overlay .diff{font-family:var(--plenio-mono, ui-monospace, monospace);font-size:12px;line-height:1.5;white-space:normal}.plenio-overlay .diff ins{background:#50aa5a4d;text-decoration:none}.plenio-overlay .diff del{background:#c846464d}.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .sections th,.plenio-overlay .sections td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .tabs{display:flex;gap:4px;margin-left:12px;flex:1}.plenio-overlay .tabs button{border-radius:6px 6px 0 0;border-bottom-color:transparent}.plenio-overlay .tabs button.active{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-overlay button:focus-visible,.plenio-overlay input:focus-visible,.plenio-overlay select:focus-visible,.plenio-overlay textarea:focus-visible,.plenio-overlay .notation-wrap:focus-visible{outline:2px solid #4c9aff;outline-offset:1px}.plenio-overlay .confirm{margin:8px 16px 0;padding:8px 10px;border:1px solid #c79a3a;border-radius:6px;display:flex;gap:8px;align-items:center}.plenio-overlay .link{border:none;background:none;padding:0 2px;color:#6fa8dc;text-decoration:underline;cursor:pointer}.plenio-overlay .facts.ok{color:#6fbf73}.plenio-overlay .facts.bad,.plenio-overlay .bad{color:#e0685e}.plenio-overlay .score-tab{display:flex;flex-direction:column;gap:6px}.plenio-overlay .palette,.plenio-overlay .view-tools,.plenio-overlay .transport{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.plenio-overlay .score-tab>.transport{padding:4px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #2a2a2a)}.plenio-overlay .score-tab>.transport>button:first-child{min-width:78px;font-weight:600}.plenio-overlay .palette .group{display:flex;align-items:center;gap:3px;padding-right:10px;border-right:1px solid var(--border-color, #444)}.plenio-overlay .palette .group:last-child{border-right:none}.plenio-overlay .palette .whole summary{cursor:pointer}.plenio-overlay .whole-tools{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.plenio-overlay input.chord{width:110px}.plenio-overlay input.tempo{width:60px}.plenio-overlay input,.plenio-overlay select{background:var(--comfy-input-bg, #333);color:var(--input-text, #ddd);border:1px solid var(--border-color, #555);border-radius:5px;padding:2px 5px}.plenio-overlay input[type=checkbox],.plenio-overlay input[type=range]{padding:0}.plenio-overlay .score-main{display:grid;grid-template-columns:var(--plenio-side-w, 230px) minmax(0,1fr);gap:10px;height:max(380px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 330px))}.plenio-overlay .score-main>.side{grid-area:1 / 1}.plenio-overlay .score-main>.splitter.vertical{grid-area:1 / 1;justify-self:end}.plenio-overlay .score-main>.score-views{grid-area:1 / 2}.plenio-overlay .score-main>.inspector{grid-area:1 / 3}.plenio-overlay .score-main.with-roll{height:max(260px,calc(var(--plenio-dialog-h, min(900px, 94vh)) - 620px))}.plenio-overlay .score-views{display:grid;grid-template-rows:minmax(0,3fr) minmax(0,2fr);gap:8px;min-width:0;min-height:0}.plenio-overlay .score-views.split{grid-template-rows:minmax(0,var(--plenio-notation-fr, 3fr)) minmax(0,var(--plenio-text-fr, 2fr))}.plenio-overlay .score-main[data-text=hidden] .score-views{grid-template-rows:minmax(0,1fr)}.plenio-overlay .score-main.with-inspector{grid-template-columns:var(--plenio-side-w, 210px) minmax(0,1fr) 250px}.plenio-overlay .score-main .side{display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}.plenio-overlay .fit-panel summary{cursor:pointer;color:var(--descrip-text, #aaa)}.plenio-overlay .lyrics-follow{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;font-size:12px}.plenio-overlay .lyrics-follow label{display:flex;gap:6px;align-items:center}.plenio-overlay .lyrics-follow .hint{margin:4px 0 0;color:var(--descrip-text, #999)}.plenio-overlay .lyrics-follow .hint.changed{color:#e8c46a}.plenio-overlay .view-tools .layouts{display:inline-flex;gap:2px}.plenio-overlay .view-tools .layouts button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector{overflow:auto;min-height:0;padding:6px 8px;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);display:flex;flex-direction:column;gap:10px}.plenio-overlay .inspector .panel{display:flex;flex-direction:column;gap:5px}.plenio-overlay .inspector .panel+.panel{border-top:1px solid var(--border-color, #444);padding-top:8px}.plenio-overlay .inspector h4{margin:0;font-size:13px}.plenio-overlay .inspector h4 .facts{font-weight:400;margin-left:4px}.plenio-overlay .inspector .field{display:flex;flex-wrap:wrap;align-items:center;gap:3px 5px}.plenio-overlay .inspector .field .name{width:44px;color:var(--descrip-text, #aaa)}.plenio-overlay .inspector button.active{background:#2d5d9f;color:#fff}.plenio-overlay .inspector input.number{width:56px}.plenio-overlay .inspector input.pitch,.plenio-overlay .inspector input.meter{width:58px}.plenio-overlay .inspector input.chord{width:110px}.plenio-overlay .notation-wrap{position:relative;overflow:auto;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);color:var(--input-text, #e6e6e6);min-height:0}.plenio-overlay .notation-wrap.stale .notation{opacity:.45}.plenio-overlay .stale-note{position:sticky;top:0;margin:0;padding:4px 8px;background:#5a2626;color:#fff;z-index:1}.plenio-overlay .roll{display:flex;flex-direction:column;gap:4px;outline:none}.plenio-overlay .roll:focus-visible .roll-scroll{border-color:#4c9aff}.plenio-overlay .roll-tools{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px}.plenio-overlay .roll-tools .group{display:flex;align-items:center;gap:3px}.plenio-overlay .roll-tools button.active.vocal{background:#2d5d9f;color:#fff}.plenio-overlay .roll-tools button.active.ins{background:#a0612a;color:#fff}.plenio-overlay .roll-tools button.mode{display:inline-flex;align-items:center;gap:4px}.plenio-overlay .roll-tools button.mode .icon{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}.plenio-overlay .roll-tools button.mode.active{background:#4a4f58;color:#fff;box-shadow:inset 0 0 0 1px #9ecbff}.plenio-overlay .roll-tools .hint{color:var(--descrip-text, #999);font-size:11px}.plenio-overlay .roll-scroll{position:relative;overflow:auto;overscroll-behavior:contain;border:1px solid var(--border-color, #444);border-radius:6px;background:var(--comfy-input-bg, #1e1e1e);user-select:none}.plenio-overlay .roll.stale .roll-svg{opacity:.45}.plenio-overlay .roll-svg{display:block;touch-action:none}.plenio-overlay .roll.mode-draw:not(.readonly,.stale) .roll-svg{cursor:crosshair}.plenio-overlay .roll-svg .roll-top,.plenio-overlay .roll-svg .keys{cursor:default}.plenio-overlay .roll-svg .band{fill:#9ecbff1f;stroke:#9ecbff;stroke-dasharray:4 3;pointer-events:none}.plenio-overlay .roll-svg .ruler{fill:transparent;cursor:pointer}.plenio-overlay .roll-svg .ruler:hover{fill:#ffffff0d}.plenio-overlay .roll-svg line.locator,.plenio-overlay .roll-svg .locator-mark line{stroke:#f4f6fa;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .locator-mark path{fill:#f4f6fa}.plenio-overlay .roll-svg line.playhead{stroke:#57d68d;stroke-width:1.5;pointer-events:none}.plenio-overlay .roll-svg .row{fill:#ffffff06}.plenio-overlay .roll-svg .row.black{fill:#00000038}.plenio-overlay .roll-svg .row.c{fill:#ffffff0f}.plenio-overlay .roll-svg .lane{fill:#ffffff0a}.plenio-overlay .roll-svg line.bar{stroke:#ffffff59}.plenio-overlay .roll-svg line.beat{stroke:#ffffff1a}.plenio-overlay .roll-svg text{font-size:10px;fill:var(--descrip-text, #aaa);pointer-events:none}.plenio-overlay .roll-svg .section-label{fill:#9ecbff;font-style:italic}.plenio-overlay .roll-svg .note{cursor:grab;stroke:#00000080}.plenio-overlay .roll-svg .note.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .note.ins{fill:#f0a35e}.plenio-overlay .roll-svg .note.selected{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .note.playing{fill:#ffd84c}.plenio-overlay .roll-svg .note.dragged,.plenio-overlay .roll-svg .chord.dragged{opacity:.3}.plenio-overlay .roll-svg .ghost{fill-opacity:.55;stroke:#fff;stroke-dasharray:3 2;pointer-events:none}.plenio-overlay .roll-svg .ghost.vocal{fill:#4c9aff}.plenio-overlay .roll-svg .ghost.ins{fill:#f0a35e}.plenio-overlay .roll-svg .chord rect{fill:#9ecbff2e;stroke:#9ecbff80;cursor:grab}.plenio-overlay .roll-svg .chord text{fill:var(--input-text, #e6e6e6);font-size:11px}.plenio-overlay .roll-svg .chord.selected rect{stroke:#fff;stroke-width:2}.plenio-overlay .roll-svg .chord.ghost rect{stroke-dasharray:3 2}.plenio-overlay .roll-svg .keys-bg{fill:var(--comfy-menu-bg, #252525)}.plenio-overlay .roll-svg .top-bg{fill:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .roll.readonly .roll-svg .note,.plenio-overlay .roll.stale .roll-svg .note{cursor:default}.plenio-overlay .roll-scroll .chord-edit{position:absolute;width:80px;height:20px;font-size:11px}.plenio-overlay .roll-svg .lyrics-lane{fill:#4c9aff0f}.plenio-overlay .roll-svg .lyric-line rect{fill:#4c9aff29;stroke:#4c9aff73}.plenio-overlay .roll-svg .lyric-line.unsung rect{fill:transparent;stroke-dasharray:3 2}.plenio-overlay .roll-svg .lyric-line text{fill:var(--input-text, #e6e6e6);font-size:11px;font-style:italic}.plenio-overlay .roll-svg .lyric-line{cursor:grab}.plenio-overlay .roll-svg .lyric-line.selected rect{fill:#4c9aff6b;stroke:#4c9aff;stroke-width:1.5}.plenio-overlay .roll-svg .lyric-line.dragged rect{stroke-dasharray:4 2}.plenio-overlay .roll-svg .lyric-line rect.edge{fill:#4c9aff8c;stroke:none;cursor:ew-resize}.plenio-overlay .roll-svg .source-lane{fill:#96be9612;cursor:pointer}.plenio-overlay .roll-svg .source-wave{stroke:#8cc88cbf;stroke-width:1.2;fill:none;pointer-events:none}.plenio-overlay .roll-svg .source-missing{fill:#e0685e14;stroke:#e0685e59;stroke-dasharray:3 3}.plenio-overlay .roll-svg .source-label{fill:#a0d2a0e6;font-size:9px;pointer-events:none}.plenio-overlay .transport .hear{display:inline-flex;align-items:center;gap:2px}.plenio-overlay .transport .hear button.active{background:#2f6fd0;color:#fff}.plenio-overlay .transport .hear .level input{width:70px;vertical-align:middle}.plenio-overlay .roll-svg text.note-name{fill:#0a121ed9;font-size:8px;font-weight:600;pointer-events:none}.plenio-overlay .roll-svg text.syllable{fill:#9ecbff;font-size:9px;pointer-events:none}.plenio-overlay .roll-scroll .lyric-edit{position:absolute;width:280px;height:20px;font-size:11px}.plenio-overlay .roll-note{margin:0;color:var(--descrip-text, #999)}.plenio-overlay .gate{margin:4px 0;padding:4px 8px;border-left:3px solid #e0685e;background:#e0685e1f}.plenio-overlay .gate button{margin-left:8px}.plenio-overlay .notation svg .plenio-selected,.plenio-overlay .notation svg .plenio-selected path{fill:#4c9aff!important}.plenio-overlay .notation svg .plenio-playing,.plenio-overlay .notation svg .plenio-playing path{fill:#6fbf73!important}.plenio-overlay .notation svg .abcjs-note,.plenio-overlay .notation svg .abcjs-rest{cursor:pointer}.plenio-overlay .notation svg .abcjs-lyric{fill:#9ecbff}.plenio-overlay .abc-editor{min-height:0;overflow:hidden}.plenio-overlay .abc-editor .cm-editor{height:100%}.plenio-overlay .navigator{display:flex;flex-direction:column;gap:8px;flex:none}.plenio-overlay .navigator ol.sections{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.plenio-overlay .navigator li{padding:4px 6px;border-radius:6px;border:1px solid var(--border-color, #444)}.plenio-overlay .navigator li.current{border-color:#2f6fb0}.plenio-overlay .navigator:focus-visible{outline:1px solid #4c9aff}.plenio-overlay .navigator li.picked{background:#4c9aff2e;border-color:#4c9aff}.plenio-overlay .navigator li[draggable=true]{cursor:grab}.plenio-overlay .navigator li.drop-before{box-shadow:0 -3px #ffc440}.plenio-overlay .navigator li.drop-after{box-shadow:0 3px #ffc440}.plenio-overlay .navigator .section-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding:2px 0 4px}.plenio-overlay .navigator .section-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .section-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .section-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .navigator .section-head{display:flex;flex-direction:column;cursor:pointer}.plenio-overlay .navigator .section-tools{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.plenio-overlay .navigator .section-tools button,.plenio-overlay .navigator .split button{font-size:11px;padding:1px 6px}.plenio-overlay .navigator input.rename{width:100%}.plenio-overlay .navigator .split input{width:90px}.plenio-overlay .bar-strip{display:flex;flex-wrap:wrap;gap:2px}.plenio-overlay .bar-strip .bar{min-width:26px;font-size:10px;padding:1px 2px;border-radius:3px}.plenio-overlay .bar-strip .bar.alt{background:#2c3440}.plenio-overlay .bar-strip .bar.selected{background:#2f6fb0;color:#fff}.plenio-overlay .bar-strip .bar.picked{background:#4c9aff59;outline:1px solid #4c9aff}.plenio-overlay .bar-strip .bar[draggable=true]{cursor:grab}.plenio-overlay .bar-strip .bar.drop-before{box-shadow:-3px 0 #ffc440}.plenio-overlay .bar-strip .bar.drop-after{box-shadow:3px 0 #ffc440}.plenio-overlay .navigator .bar-actions{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding-top:6px;border-top:1px solid var(--border-color, #444)}.plenio-overlay .navigator .bar-actions .hint{flex-basis:100%;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .navigator .bar-actions button{font-size:11px;padding:1px 7px}.plenio-overlay .navigator .bar-actions button.danger:not(:disabled){border-color:#a04a44}.plenio-overlay .bar-strip .bar.error{border-color:#e0685e;color:#e0685e}.plenio-overlay .status{display:flex;flex-wrap:wrap;gap:10px;margin:0}.plenio-overlay .status .change{color:#6fbf73}.plenio-overlay .diagnostics{margin:0;padding-left:18px}.plenio-overlay .lyrics-fit table,.plenio-overlay .sections table{border-collapse:collapse;font-size:12px}.plenio-overlay .lyrics-fit th,.plenio-overlay .lyrics-fit td{text-align:left;padding:2px 12px 2px 0}.plenio-overlay .lyrics-fit tr.mismatch td{color:#e0685e}.plenio-overlay .lyrics-fit h4{margin:8px 0 4px;font-size:12px}.plenio-overlay .midi-dialog{width:min(720px,92vw);height:auto;max-height:min(700px,92vh)}.plenio-overlay .midi-dialog .body h3{margin:14px 0 4px;font-size:13px}.plenio-overlay .midi-dialog .tracks{border-collapse:collapse;width:100%}.plenio-overlay .midi-dialog .tracks th,.plenio-overlay .midi-dialog .tracks td{text-align:left;padding:3px 12px 3px 0;border-bottom:1px solid var(--border-color, #3a3a3a)}.plenio-overlay .midi-dialog .tracks .number{display:inline-block;min-width:18px;color:var(--descrip-text, #999)}.plenio-overlay .midi-dialog .controls{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;margin:10px 0 0}.plenio-overlay .midi-dialog .report{margin:4px 0;padding-left:18px;color:var(--descrip-text, #bbb)}.plenio-overlay .midi-tools{display:inline-flex;gap:4px}.plenio-overlay .hidden-file{display:none}.plenio-overlay .track-panel{border:1px solid var(--border-color, #444);border-radius:6px;padding:6px 8px;background:var(--comfy-input-bg, #1e1e1e)}.plenio-overlay .track-panel h4{margin:0 0 4px;font-size:13px}.plenio-overlay .track-panel ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}.plenio-overlay .track-panel li{display:grid;grid-template-columns:8px minmax(0,1fr) auto auto;grid-template-areas:"dot name count play" "dot destination destination clear" "dot sound sound sound";align-items:center;column-gap:6px;row-gap:1px;font-size:12px}.plenio-overlay .track-panel .dot{grid-area:dot;width:8px;height:8px;border-radius:50%}.plenio-overlay .track-panel .track-name{grid-area:name;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-overlay .track-panel .count{grid-area:count}.plenio-overlay .track-panel .play{grid-area:play;display:flex;align-items:center}.plenio-overlay .track-panel .play input{margin:0}.plenio-overlay .track-panel button.link{grid-area:clear}.plenio-overlay .track-panel .destination{grid-area:destination}.plenio-overlay .track-panel .destination,.plenio-overlay .track-panel .count{color:var(--descrip-text, #999);font-size:11px;white-space:nowrap}.plenio-overlay .track-panel select.sound{grid-area:sound;min-width:0;font-size:11px;padding:1px 2px}.plenio-overlay .track-panel .destination.unsent{color:#d8a31a}.plenio-overlay .track-panel li.guide{border-top:1px dashed var(--border-color, #444);padding-top:3px}.plenio-overlay .track-panel .hint{margin:6px 0 0;font-size:11px;color:var(--descrip-text, #999)}.plenio-overlay .keys-help{position:relative}.plenio-overlay .keys-panel{position:absolute;z-index:30;top:26px;left:0;width:560px;max-height:60vh;overflow:auto;padding:8px 12px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .keys-panel .close{float:right}.plenio-overlay .keys-panel h5{margin:6px 0 2px}.plenio-overlay .keys-panel table{border-collapse:collapse;width:100%;font-size:12px}.plenio-overlay .keys-panel th{width:210px;text-align:left;white-space:nowrap;padding:1px 10px 1px 0;color:var(--input-text, #ddd);font-weight:600}.plenio-overlay .keys-panel td{color:var(--descrip-text, #aaa)}.plenio-overlay .transport .align{position:relative}.plenio-overlay .transport .align>button.active{border-color:#d6a14a;color:#f0c27a}.plenio-overlay .transport .align-panel{position:absolute;z-index:30;bottom:30px;left:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;width:460px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .align-panel .facts{flex-basis:100%;margin-bottom:4px}.plenio-overlay .roll-svg .sung-pitch{fill:none;stroke:#ff5fa2;stroke-width:1.6;stroke-linejoin:round;opacity:.85;pointer-events:none}.plenio-overlay .roll-tools label.unavailable{opacity:.55}.plenio-overlay .transport .record{display:inline-flex;align-items:center;gap:3px;position:relative}.plenio-overlay .transport .record .rec{color:#ff6b6b;font-weight:600}.plenio-overlay .transport .record .rec.on{background:#c62828;color:#fff;border-color:#ff6b6b}.plenio-overlay .transport .record .rec.counting{animation:plenio-blink .5s steps(2,start) infinite}@keyframes plenio-blink{to{opacity:.35}}.plenio-overlay .transport .record .step.on{background:#6a4fb3;color:#fff}.plenio-overlay .transport .midi-light{display:inline-block;width:8px;height:8px;border-radius:50%;background:#555}.plenio-overlay .transport .midi-light.ready{background:#2e7d32}.plenio-overlay .transport .midi-light.active{background:#7cfc00;box-shadow:0 0 6px #7cfc00}.plenio-overlay .transport .midi-settings{position:relative}.plenio-overlay .transport .midi-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:320px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 24px #00000080}.plenio-overlay .transport .midi-panel .close{justify-self:end}.plenio-overlay .transport .midi-panel strong{margin-top:4px}.plenio-overlay .notation-export{position:relative;display:inline-flex}.plenio-overlay .notation-export .export-panel{position:absolute;z-index:30;top:calc(100% + 4px);left:0;display:grid;gap:6px;width:260px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .notation-export .export-panel .close{justify-self:end}.plenio-overlay .notation-export .formats{display:flex;gap:6px;flex-wrap:wrap}.plenio-overlay .transport .sounds-settings{position:relative}.plenio-overlay .transport .sounds-panel{position:absolute;z-index:30;bottom:30px;left:0;display:grid;grid-template-columns:1fr;gap:4px;width:340px;padding:8px 10px;background:var(--comfy-menu-bg, #202020);border:1px solid var(--border-color, #4e4e4e);border-radius:6px;box-shadow:0 6px 20px #00000073}.plenio-overlay .transport .sounds-panel .close{justify-self:end}.plenio-overlay .transport .sounds-panel strong{margin-top:4px}.plenio-overlay .transport .sounds-panel .row{display:flex;align-items:center;gap:6px}.plenio-overlay .transport .sounds-panel .row select,.plenio-overlay .transport .sounds-panel .row input{flex:1;min-width:0}.plenio-overlay .transport .sounds-panel .track{width:74px;flex:none}.plenio-overlay .roll-svg .rec-note{fill:#e53935d9;stroke:#ffcdd2;stroke-width:1;pointer-events:none}';
export {
  cs as A,
  To as B,
  pl as C,
  as as D,
  ss as E,
  ne as F,
  _o as G,
  me as H,
  Pi as I,
  is as a,
  An as b,
  fs as c,
  rs as d,
  ps as e,
  ys as f,
  Ql as g,
  us as h,
  bo as i,
  fl as j,
  xs as k,
  ms as l,
  os as m,
  ko as n,
  ns as o,
  vs as p,
  hs as q,
  ls as r,
  gs as s,
  Zn as t,
  _i as u,
  ds as v,
  ts as w,
  Yr as x,
  es as y,
  en as z
};
