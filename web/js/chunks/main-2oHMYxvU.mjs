import { api as D } from "../../../../scripts/api.js";
import { app as H } from "../../../../scripts/app.js";
function h(e, t) {
  return function(...r) {
    e?.apply(this, r), t.apply(this, r);
  };
}
const I = "COMFY_DYNAMICCOMBO_V3";
function V(e) {
  const t = e?.widgets_values_named;
  return t && typeof t == "object" && !Array.isArray(t) ? { ...t } : Array.isArray(e?.widgets_values) ? [...e.widgets_values] : void 0;
}
function L(e) {
  return (e.widgets ?? []).filter((t) => t.serialize !== !1);
}
function Y(e, t) {
  const r = L(e);
  return Array.isArray(t) ? r.length === t.length && r.every((n, s) => n.value === t[s]) : r.every((n) => !(n.name in t) || n.value === t[n.name]);
}
function B(e, t) {
  return (e.options?.values ?? []).includes(t);
}
function R(e, t, r) {
  if (!t || !e.widgets || Y(e, t)) return !1;
  let n = 0;
  for (let s = 0; s < e.widgets.length; s++) {
    const o = e.widgets[s];
    if (o.serialize === !1) continue;
    let i;
    if (Array.isArray(t)) {
      if (n >= t.length) break;
      i = t[n++];
    } else if (o.name in t)
      i = t[o.name];
    else
      continue;
    if (r.has(o.name) && !B(o, i)) return !0;
    o.value !== i && (o.value = i);
  }
  return !0;
}
function F(e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of Object.values(e ?? {}))
    for (const [n, s] of Object.entries(r ?? {}))
      Array.isArray(s) && s[0] === I && t.add(n);
  return t;
}
const C = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Set();
function E(e, t) {
  C.set(e, t);
  for (const r of y) r(e);
}
function b(e) {
  return C.get(e) ?? null;
}
function J(e) {
  return y.add(e), () => y.delete(e);
}
const $ = /* @__PURE__ */ new Map();
function K(e) {
  e?.draft_sha256 && $.set(e.draft_sha256, e);
}
function U(e) {
  return e ? $.get(e) ?? null : null;
}
const v = "plenio.sheet_state/1", f = ["title", "style", "lyrics", "score", "artwork_prompt"];
function O() {
  return { schema: v, docs: {} };
}
function A(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return O();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== v || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function q(e) {
  const t = {};
  for (const n of f) {
    const s = e.docs[n];
    s && (t[n] = s);
  }
  const r = { schema: v, docs: t };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(r);
}
function M(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function G(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = f.filter((n) => M(e, n) !== "auto").map(
    (n) => `${n.replace("_", " ")} ${M(e, n)}`
  ), r = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + r;
}
function N(e) {
  const t = Math.floor(e / 60), r = Math.round(e - t * 60);
  return `${t}:${String(r).padStart(2, "0")}`;
}
function pe(e) {
  return e?.bars?.length ? (e.sections ?? []).map(([t, r, n]) => {
    const s = e.bars[Math.max(0, r - 1)], o = e.bars[Math.min(e.bars.length - 1, r - 1 + n - 1)];
    return { label: t, bars: n, start: N(s?.[0] ?? 0), end: N(o?.[1] ?? e.duration_s) };
  }) : [];
}
function m(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((s) => s.replace(/\s+$/, ""));
  let r = 0, n = t.length;
  for (; r < n && !t[r]; ) r++;
  for (; n > r && !t[n - 1]; ) n--;
  return t.slice(r, n).join(`
`);
}
function X(e, t, r) {
  const n = e.docs[r];
  return n ? n.text : t?.docs[r]?.upstream ?? "";
}
function fe(e, t, r) {
  return r.map((n) => ({ kind: n, text: X(e, t, n), intent: "keep" }));
}
function de(e, t, r) {
  const n = { ...e.docs };
  for (const o of r) {
    const i = e.docs[o.kind], l = t?.docs[o.kind], a = m(o.text);
    if (o.intent === "auto")
      delete n[o.kind];
    else if (o.intent === "manual")
      n[o.kind] = { state: "manual", text: a };
    else if (o.intent === "rebase")
      l?.upstream_sha256 ? n[o.kind] = { state: "edited", text: a, base_sha256: l.upstream_sha256 } : n[o.kind] = { state: "manual", text: a };
    else if (i)
      m(i.text) !== a && (n[o.kind] = { ...i, text: a });
    else {
      const c = m(l?.upstream ?? "");
      if (a === c) continue;
      n[o.kind] = l?.upstream_sha256 ? { state: "edited", text: a, base_sha256: l.upstream_sha256 } : { state: "manual", text: a };
    }
  }
  const s = { ...O(), docs: n };
  return e.review?.approved_fingerprint && (s.review = { approved_fingerprint: e.review.approved_fingerprint }), s;
}
function me(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function Q(e, t) {
  return f.filter((r) => e.includes(r) || t.docs[r]?.state === "manual");
}
function ge(e) {
  const t = {};
  for (const r of e?.owned ?? []) t[r] = e?.docs[r]?.upstream ?? null;
  return t;
}
const P = "PLENIO_SHEET_STATE";
let x = null;
function Z(e) {
  x = e;
}
const ee = (e, t, r) => {
  let n = typeof r?.[1]?.default == "string" ? r[1].default : "";
  const s = document.createElement("div");
  s.className = "plenio-sheet-state";
  const o = document.createElement("span");
  o.className = "plenio-sheet-summary";
  const i = document.createElement("button");
  i.className = "plenio-sheet-open", i.textContent = "Edit Song Sheet…", s.append(i, o);
  const l = () => {
    const c = b(String(e.id)), p = c ? ` · ${c.status}` : "";
    o.textContent = G(A(n)) + p;
  }, a = e.addDOMWidget(t, P, s, {
    getValue: () => n,
    setValue: (c) => {
      n = typeof c == "string" ? c : "", l();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return i.addEventListener("click", async (c) => {
    c.stopPropagation();
    const p = A(n);
    p === null && (o.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const d = b(String(e.id)), z = (e.inputs ?? []).filter((u) => u.link != null).map((u) => u.name), _ = p ?? { schema: "plenio.sheet_state/1", docs: {} }, S = d?.owned ?? Q(z, _), W = String(e.widgets?.find((u) => u.name === "review")?.value ?? "continue"), { openSheetDialog: j } = await import("./open-Daqc1JCC.mjs");
    if (!x) throw new Error("Plenio: API not initialised");
    j({
      title: e.title || "Song Sheet",
      state: _,
      payload: d,
      asrNote: U(d?.docs.lyrics?.upstream_sha256),
      owned: S.length ? S : [...f],
      review: W,
      fetcher: x,
      onApply: (u) => {
        a.value = q(u), e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), J((c) => {
    c === String(e.id) && l();
  }), l(), { widget: a };
}, te = `
.plenio-sheet-state { display: flex; align-items: center; gap: 8px; font: 12px/28px var(--font-family, sans-serif);
  color: var(--descrip-text, #999); padding: 0 4px; white-space: nowrap; overflow: hidden; }
.plenio-sheet-summary { overflow: hidden; text-overflow: ellipsis; }
.plenio-sheet-open { flex: none; padding: 2px 10px; border-radius: 6px; border: 1px solid var(--border-color, #555);
  background: var(--comfy-input-bg, #333); color: var(--input-text, #ddd); cursor: pointer; font: inherit; line-height: 20px; }
.plenio-sheet-open:hover { background: #2f6fb0; color: #fff; }
.plenio-summary { font: 12px/1.45 var(--font-family, sans-serif); color: var(--input-text, #ddd);
  background: var(--comfy-input-bg, #222); border-radius: 6px; padding: 6px 10px; overflow: auto; }
.plenio-summary[data-status="warning"] { border-left: 3px solid #d8a31a; }
.plenio-summary[data-status="error"] { border-left: 3px solid #d0453b; }
.plenio-summary h3, .plenio-summary h4, .plenio-summary h5 { margin: 6px 0 4px; font-size: 13px; }
.plenio-summary ul { margin: 2px 0 6px 16px; padding: 0; }
.plenio-summary p { margin: 4px 0; }
.plenio-summary pre { white-space: pre-wrap; font-size: 11px; }
.plenio-summary code { font-family: var(--code-font, monospace); }
`;
function ne() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = te, document.head.append(e);
}
function w(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function g(e) {
  return w(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function re(e) {
  const t = [];
  let r = !1, n = null;
  const s = () => {
    r && (t.push("</ul>"), r = !1);
  };
  for (const o of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (n !== null) {
      o.startsWith("```") ? (t.push(`<pre><code>${w(n.join(`
`))}</code></pre>`), n = null) : n.push(o);
      continue;
    }
    if (o.startsWith("```")) {
      s(), n = [];
      continue;
    }
    const i = /^(#{1,4})\s+(.*)$/.exec(o);
    if (i) {
      s();
      const a = Math.min(i[1].length + 2, 6);
      t.push(`<h${a}>${g(i[2])}</h${a}>`);
      continue;
    }
    const l = /^\s*[-*]\s+(.*)$/.exec(o);
    if (l) {
      r || (t.push("<ul>"), r = !0), t.push(`<li>${g(l[1])}</li>`);
      continue;
    }
    s(), o.trim() && t.push(`<p>${g(o)}</p>`);
  }
  return s(), n !== null && t.push(`<pre><code>${w(n.join(`
`))}</code></pre>`), t.join("");
}
const oe = "plenio_summary", k = "plenio_summary";
function se(e) {
  const t = e.widgets?.find((n) => n.name === k);
  if (t?.element) return t.element;
  const r = document.createElement("div");
  return r.className = "plenio-summary", e.addDOMWidget(k, "plenio_summary", r, { serialize: !1, getValue: () => "", setValue: () => {
  } }), r;
}
function ie(e) {
  e.prototype.onExecuted = h(e.prototype.onExecuted, function(t) {
    const r = t?.[oe], n = r?.[r.length - 1];
    if (!n?.markdown) return;
    const s = se(this);
    s.dataset.status = n.status ?? "", s.innerHTML = re(n.markdown), this.setDirtyCanvas?.(!0, !0);
  });
}
const ae = "Plenio.Core", T = D;
Z(T);
H.registerExtension({
  name: ae,
  getCustomWidgets: () => ({ [P]: ee }),
  beforeRegisterNodeDef(e, t) {
    if (!t.name.startsWith("Plenio")) return;
    ie(e);
    const r = F(t.input);
    if (r.size) {
      const n = e.prototype.configure;
      e.prototype.configure = function(s) {
        const o = V(s), i = n?.call(this, s);
        return R(this, o, r), i;
      };
    }
    t.name === "PlenioTranscribeLyrics" && (e.prototype.onExecuted = h(e.prototype.onExecuted, function(n) {
      for (const s of n?.plenio_asr ?? []) K(s);
    })), t.name === "PlenioSongSheet" && (e.prototype.onExecuted = h(e.prototype.onExecuted, function(n) {
      const s = n?.plenio_sheet, o = s?.[s.length - 1];
      o && E(String(this.id), o);
    }));
  },
  setup() {
    ne(), T.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && E(String(t.node_id), t);
    });
  }
});
export {
  ae as E,
  pe as a,
  q as b,
  m as c,
  de as n,
  fe as s,
  ge as u,
  me as w
};
