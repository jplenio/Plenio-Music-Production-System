import { api as O } from "../../../../scripts/api.js";
import { app as W } from "../../../../scripts/app.js";
function M(e, t) {
  return function(...o) {
    e?.apply(this, o), t.apply(this, o);
  };
}
const N = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Set();
function E(e, t) {
  N.set(e, t);
  for (const o of g) o(e);
}
function _(e) {
  return N.get(e) ?? null;
}
function j(e) {
  return g.add(e), () => g.delete(e);
}
const x = "plenio.sheet_state/1", d = ["title", "style", "lyrics", "score", "artwork_prompt"];
function T() {
  return { schema: x, docs: {} };
}
function b(e) {
  if (e == null || typeof e == "string" && e.trim() === "")
    return T();
  if (typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t?.schema !== x || typeof t.docs != "object" || t.docs === null ? null : t;
  } catch {
    return null;
  }
}
function z(e) {
  const t = {};
  for (const n of d) {
    const r = e.docs[n];
    r && (t[n] = r);
  }
  const o = { schema: x, docs: t };
  return e.review?.approved_fingerprint && (o.review = { approved_fingerprint: e.review.approved_fingerprint }), JSON.stringify(o);
}
function k(e, t) {
  return e.docs[t]?.state ?? "auto";
}
function I(e) {
  if (e === null) return "Song Sheet state is unreadable - open the editor to repair it.";
  const t = d.filter((n) => k(e, n) !== "auto").map(
    (n) => `${n.replace("_", " ")} ${k(e, n)}`
  ), o = e.review?.approved_fingerprint ? " · approved" : "";
  return (t.length ? t.join(" · ") : "all documents automatic") + o;
}
function f(e) {
  const t = e.replace(/\r\n?/g, `
`).split(`
`).map((r) => r.replace(/\s+$/, ""));
  let o = 0, n = t.length;
  for (; o < n && !t[o]; ) o++;
  for (; n > o && !t[n - 1]; ) n--;
  return t.slice(o, n).join(`
`);
}
function L(e, t, o) {
  const n = e.docs[o];
  return n ? n.text : t?.docs[o]?.upstream ?? "";
}
function ee(e, t, o) {
  return o.map((n) => ({ kind: n, text: L(e, t, n), intent: "keep" }));
}
function te(e, t, o) {
  const n = { ...e.docs };
  for (const i of o) {
    const a = e.docs[i.kind], l = t?.docs[i.kind], s = f(i.text);
    if (i.intent === "auto")
      delete n[i.kind];
    else if (i.intent === "manual")
      n[i.kind] = { state: "manual", text: s };
    else if (i.intent === "rebase")
      l?.upstream_sha256 ? n[i.kind] = { state: "edited", text: s, base_sha256: l.upstream_sha256 } : n[i.kind] = { state: "manual", text: s };
    else if (a)
      f(a.text) !== s && (n[i.kind] = { ...a, text: s });
    else {
      const p = f(l?.upstream ?? "");
      if (s === p) continue;
      n[i.kind] = l?.upstream_sha256 ? { state: "edited", text: s, base_sha256: l.upstream_sha256 } : { state: "manual", text: s };
    }
  }
  const r = { ...T(), docs: n };
  return e.review?.approved_fingerprint && (r.review = { approved_fingerprint: e.review.approved_fingerprint }), r;
}
function ne(e, t) {
  return t ? { ...e, review: { approved_fingerprint: t } } : { ...e, review: void 0 };
}
function V(e, t) {
  return d.filter((o) => e.includes(o) || t.docs[o]?.state === "manual");
}
function oe(e) {
  const t = {};
  for (const o of e?.owned ?? []) t[o] = e?.docs[o]?.upstream ?? null;
  return t;
}
const A = "PLENIO_SHEET_STATE";
let h = null;
function R(e) {
  h = e;
}
const Y = (e, t, o) => {
  let n = typeof o?.[1]?.default == "string" ? o[1].default : "";
  const r = document.createElement("div");
  r.className = "plenio-sheet-state";
  const i = document.createElement("span");
  i.className = "plenio-sheet-summary";
  const a = document.createElement("button");
  a.className = "plenio-sheet-open", a.textContent = "Edit Song Sheet…", r.append(a, i);
  const l = () => {
    const p = _(String(e.id)), u = p ? ` · ${p.status}` : "";
    i.textContent = I(b(n)) + u;
  }, s = e.addDOMWidget(t, A, r, {
    getValue: () => n,
    setValue: (p) => {
      n = typeof p == "string" ? p : "", l();
    },
    getMinHeight: () => 30,
    getMaxHeight: () => 30
  });
  return a.addEventListener("click", async (p) => {
    p.stopPropagation();
    const u = b(n);
    u === null && (i.textContent = "The stored state is unreadable; it will be replaced when you apply.");
    const v = _(String(e.id)), P = (e.inputs ?? []).filter((c) => c.link != null).map((c) => c.name), w = u ?? { schema: "plenio.sheet_state/1", docs: {} }, S = v?.owned ?? V(P, w), D = String(e.widgets?.find((c) => c.name === "review")?.value ?? "continue"), { openSheetDialog: H } = await import("./open-yyzVLJTv.mjs");
    if (!h) throw new Error("Plenio: API not initialised");
    H({
      title: e.title || "Song Sheet",
      state: w,
      payload: v,
      owned: S.length ? S : [...d],
      review: D,
      fetcher: h,
      onApply: (c) => {
        s.value = z(c), e.setDirtyCanvas?.(!0, !0);
      }
    });
  }), j((p) => {
    p === String(e.id) && l();
  }), l(), { widget: s };
}, B = `
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
function J() {
  if (document.getElementById("plenio-styles")) return;
  const e = document.createElement("style");
  e.id = "plenio-styles", e.textContent = B, document.head.append(e);
}
function y(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function m(e) {
  return y(e).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function K(e) {
  const t = [];
  let o = !1, n = null;
  const r = () => {
    o && (t.push("</ul>"), o = !1);
  };
  for (const i of e.replace(/\r\n?/g, `
`).split(`
`)) {
    if (n !== null) {
      i.startsWith("```") ? (t.push(`<pre><code>${y(n.join(`
`))}</code></pre>`), n = null) : n.push(i);
      continue;
    }
    if (i.startsWith("```")) {
      r(), n = [];
      continue;
    }
    const a = /^(#{1,4})\s+(.*)$/.exec(i);
    if (a) {
      r();
      const s = Math.min(a[1].length + 2, 6);
      t.push(`<h${s}>${m(a[2])}</h${s}>`);
      continue;
    }
    const l = /^\s*[-*]\s+(.*)$/.exec(i);
    if (l) {
      o || (t.push("<ul>"), o = !0), t.push(`<li>${m(l[1])}</li>`);
      continue;
    }
    r(), i.trim() && t.push(`<p>${m(i)}</p>`);
  }
  return r(), n !== null && t.push(`<pre><code>${y(n.join(`
`))}</code></pre>`), t.join("");
}
const U = "plenio_summary", $ = "plenio_summary";
function q(e) {
  const t = e.widgets?.find((n) => n.name === $);
  if (t?.element) return t.element;
  const o = document.createElement("div");
  return o.className = "plenio-summary", e.addDOMWidget($, "plenio_summary", o, { serialize: !1, getValue: () => "", setValue: () => {
  } }), o;
}
function F(e) {
  e.prototype.onExecuted = M(e.prototype.onExecuted, function(t) {
    const o = t?.[U], n = o?.[o.length - 1];
    if (!n?.markdown) return;
    const r = q(this);
    r.dataset.status = n.status ?? "", r.innerHTML = K(n.markdown), this.setDirtyCanvas?.(!0, !0);
  });
}
const G = "Plenio.Core", C = O;
R(C);
W.registerExtension({
  name: G,
  getCustomWidgets: () => ({ [A]: Y }),
  beforeRegisterNodeDef(e, t) {
    t.name.startsWith("Plenio") && (F(e), t.name === "PlenioSongSheet" && (e.prototype.onExecuted = M(e.prototype.onExecuted, function(o) {
      const n = o?.plenio_sheet, r = n?.[n.length - 1];
      r && E(String(this.id), r);
    })));
  },
  setup() {
    J(), C.addEventListener("plenio.sheet", (e) => {
      const t = e.detail;
      t?.node_id && E(String(t.node_id), t);
    });
  }
});
export {
  G as E,
  f as a,
  te as n,
  ee as s,
  oe as u,
  ne as w
};
