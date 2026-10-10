import { d as M, o as F, a as z, c as l, b as o, w as A, v as D, t as s, e as v, F as k, r as T, f as U, g as h, h as V, i, j as C, k as I, l as P } from "./dialog-cQCiTnNN.mjs";
import { l as R, P as q, v as J } from "./main-BU0BDcRc.mjs";
const K = ".plenio-overlay .plenio-continue{width:min(820px,96vw);height:min(720px,90vh)}.plenio-continue header{display:flex;align-items:baseline;gap:12px;padding:12px 16px 8px;border-bottom:1px solid var(--border-color, #444)}.plenio-continue header .hint{flex:1;color:var(--descrip-text, #999);font-size:12px}.plenio-continue header .close{background:none;border:none;color:inherit;font-size:20px;cursor:pointer}.plenio-continue .toolbar{display:flex;gap:8px;padding:10px 16px}.plenio-continue .toolbar input[type=search]{flex:1;min-width:0;padding:5px 8px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #1a1a1a);color:inherit}.plenio-continue button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #2a2a2a);color:inherit;cursor:pointer}.plenio-continue button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-continue button:disabled{opacity:.5;cursor:default}.plenio-continue .error{margin:0 16px 8px;color:#f08080}.plenio-continue .list{flex:1;overflow:auto;padding:0 16px 16px}.plenio-continue .empty{color:var(--descrip-text, #999)}.plenio-continue .row{display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid var(--border-color, #333)}.plenio-continue .cover{width:44px;height:44px;flex:none;border-radius:4px;object-fit:cover}.plenio-continue .cover.none{display:flex;align-items:center;justify-content:center;background:var(--comfy-input-bg, #2a2a2a);color:var(--descrip-text, #888)}.plenio-continue .facts{flex:1;min-width:0;display:flex;flex-direction:column}.plenio-continue .title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-continue .meta{color:var(--descrip-text, #999);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-continue .play{width:32px;padding:4px 0}", G = {
  class: "plenio-dialog plenio-continue",
  role: "dialog",
  "aria-label": "Continue a song"
}, H = { class: "toolbar" }, Q = {
  key: 0,
  class: "error",
  role: "alert"
}, W = {
  class: "list",
  role: "list"
}, X = {
  key: 0,
  class: "empty"
}, Y = {
  key: 1,
  class: "empty"
}, Z = {
  key: 2,
  class: "empty"
}, ee = ["src"], te = {
  key: 1,
  class: "cover none",
  "aria-hidden": "true"
}, ne = { class: "facts" }, oe = { class: "title" }, le = { class: "meta" }, ie = ["title", "aria-label", "onClick"], ae = ["disabled", "onClick"], se = /* @__PURE__ */ M({
  __name: "ContinueDialog",
  props: {
    fetcher: {},
    onContinue: { type: Function }
  },
  emits: ["close"],
  setup(d, { emit: y }) {
    const a = d, u = y, r = h(null), p = h(null), m = h(null), x = h(""), c = h(null);
    let f = null;
    const w = V(() => {
      const e = x.value.toLowerCase().split(/\s+/).filter(Boolean);
      return (r.value ?? []).filter((t) => {
        const n = `${t.title} ${t.path} ${t.created.slice(0, 10)}`.toLowerCase();
        return e.every((_) => n.includes(_));
      });
    });
    function g(e) {
      return e instanceof q ? e.hint ? `${e.message} ${e.hint}` : e.message : e instanceof Error ? e.message : String(e);
    }
    function $(e) {
      const t = e.lastIndexOf("/");
      return J(a.fetcher, {
        filename: e.slice(t + 1),
        subfolder: t < 0 ? "" : e.slice(0, t),
        type: "output"
      });
    }
    function E(e) {
      if (e === null || !Number.isFinite(e)) return "";
      const t = Math.round(e);
      return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
    }
    function N(e) {
      return e.slice(0, 16).replace("T", " ");
    }
    function S(e) {
      const t = e.lastIndexOf("/");
      return t < 0 ? "" : e.slice(0, t);
    }
    function O(e) {
      if (e.audio) {
        if (c.value === e.path) {
          f?.pause(), c.value = null;
          return;
        }
        f?.pause(), f = new Audio($(e.audio)), f.addEventListener("ended", () => c.value = null), c.value = e.path, f.play().catch((t) => {
          c.value = null, p.value = `The audio could not be played: ${g(t)}`;
        });
      }
    }
    async function L(e, t) {
      m.value = e, p.value = null;
      try {
        await a.onContinue(t), u("close");
      } catch (n) {
        p.value = g(n);
      } finally {
        m.value = null;
      }
    }
    const b = h(null);
    async function B(e) {
      const t = e.target.files?.[0];
      if (t)
        try {
          const n = JSON.parse(await t.text());
          await L(t.name, { record: n, name: t.name });
        } catch (n) {
          p.value = `${t.name} could not be read: ${g(n)}`;
        } finally {
          b.value && (b.value.value = "");
        }
    }
    function j(e) {
      e.key === "Escape" && u("close");
    }
    return F(async () => {
      window.addEventListener("keydown", j);
      try {
        r.value = await R(a.fetcher);
      } catch (e) {
        r.value = [], p.value = g(e);
      }
    }), z(() => {
      window.removeEventListener("keydown", j), f?.pause();
    }), (e, t) => (i(), l("div", {
      class: "plenio-overlay",
      onMousedown: t[3] || (t[3] = U((n) => u("close"), ["self"]))
    }, [
      o("div", G, [
        o("header", null, [
          t[4] || (t[4] = o("strong", null, "Continue a song", -1)),
          t[5] || (t[5] = o("span", { class: "hint" }, " Opens the workflow a song was made with and keeps its title, style, lyrics and score in the Song Sheets. ", -1)),
          o("button", {
            class: "close",
            title: "Close",
            "aria-label": "Close",
            onClick: t[0] || (t[0] = (n) => u("close"))
          }, "×")
        ]),
        o("div", H, [
          A(o("input", {
            "onUpdate:modelValue": t[1] || (t[1] = (n) => x.value = n),
            type: "search",
            placeholder: "Search title, folder or date",
            "aria-label": "Search songs"
          }, null, 512), [
            [D, x.value]
          ]),
          o("button", {
            title: "A release record from another folder (<name>.plenio.json)",
            onClick: t[2] || (t[2] = (n) => b.value?.click())
          }, "Open a record file…"),
          o("input", {
            ref_key: "picker",
            ref: b,
            type: "file",
            accept: ".json,application/json",
            hidden: "",
            onChange: B
          }, null, 544)
        ]),
        p.value ? (i(), l("p", Q, s(p.value), 1)) : v("", !0),
        o("div", W, [
          r.value === null ? (i(), l("p", X, "Reading the output folder…")) : r.value.length ? w.value.length ? v("", !0) : (i(), l("p", Z, 'No song matches "' + s(x.value) + '".', 1)) : (i(), l("p", Y, " No release records in the output folder yet. Export Release writes one next to every song (<name>.plenio.json). ")),
          (i(!0), l(k, null, T(w.value, (n) => (i(), l("div", {
            key: n.path,
            class: "row",
            role: "listitem"
          }, [
            n.cover ? (i(), l("img", {
              key: 0,
              class: "cover",
              src: $(n.cover),
              alt: "",
              loading: "lazy"
            }, null, 8, ee)) : (i(), l("span", te, "♪")),
            o("div", ne, [
              o("span", oe, s(n.title), 1),
              o("span", le, [
                C(s(N(n.created)), 1),
                E(n.seconds) ? (i(), l(k, { key: 0 }, [
                  C(" · " + s(E(n.seconds)), 1)
                ], 64)) : v("", !0),
                n.plenio ? (i(), l(k, { key: 1 }, [
                  C(" · Plenio " + s(n.plenio), 1)
                ], 64)) : v("", !0),
                S(n.path) ? (i(), l(k, { key: 2 }, [
                  C(" · " + s(S(n.path)) + "/", 1)
                ], 64)) : v("", !0)
              ])
            ]),
            n.audio ? (i(), l("button", {
              key: 2,
              class: "play",
              title: c.value === n.path ? "Stop" : "Listen",
              "aria-label": c.value === n.path ? "Stop" : `Listen to ${n.title}`,
              onClick: (_) => O(n)
            }, s(c.value === n.path ? "■" : "▶"), 9, ie)) : v("", !0),
            o("button", {
              class: "primary",
              disabled: m.value !== null,
              onClick: (_) => L(n.path, { path: n.path })
            }, s(m.value === n.path ? "Opening…" : "Continue"), 9, ae)
          ]))), 128))
        ])
      ])
    ], 32));
  }
});
function re() {
  for (const [d, y] of [
    ["plenio-dialog-styles", P],
    ["plenio-continue-styles", K]
  ]) {
    if (document.getElementById(d)) continue;
    const a = document.createElement("style");
    a.id = d, a.textContent = y, document.head.append(a);
  }
}
function pe(d, y) {
  re();
  const a = document.createElement("div");
  document.body.append(a);
  const u = () => {
    r.unmount(), a.remove();
  }, r = I(se, { fetcher: d, onContinue: y, onClose: u });
  return r.mount(a), u;
}
export {
  pe as openContinueDialog
};
