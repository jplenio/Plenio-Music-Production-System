import { d as N, o as B, a as M, c as l, b as o, w as P, v as z, t as s, e as v, F as k, r as D, f as T, g as h, h as U, i, j as C, k as V } from "./runtime-dom.esm-bundler-BuebSeFB.mjs";
import { d as I } from "./dialog-BPG96sbf.mjs";
import { l as R, P as q, i as J, p as K, v as G } from "./main-CEmOssgd.mjs";
const H = ".plenio-overlay .plenio-continue{width:min(820px,96vw);height:min(720px,90vh)}.plenio-continue header{display:flex;align-items:baseline;gap:12px;padding:12px 16px 8px;border-bottom:1px solid var(--border-color, #444)}.plenio-continue header .hint{flex:1;color:var(--descrip-text, #999);font-size:12px}.plenio-continue header .close{background:none;border:none;color:inherit;font-size:20px;cursor:pointer}.plenio-continue .toolbar{display:flex;gap:8px;padding:10px 16px}.plenio-continue .toolbar input[type=search]{flex:1;min-width:0;padding:5px 8px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #1a1a1a);color:inherit}.plenio-continue button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #2a2a2a);color:inherit;cursor:pointer}.plenio-continue button.primary{background:#2f6fb0;border-color:#2f6fb0;color:#fff}.plenio-continue button:disabled{opacity:.5;cursor:default}.plenio-continue .error{margin:0 16px 8px;color:#f08080}.plenio-continue .list{flex:1;overflow:auto;padding:0 16px 16px}.plenio-continue .empty{color:var(--descrip-text, #999)}.plenio-continue .row{display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid var(--border-color, #333)}.plenio-continue .cover{width:44px;height:44px;flex:none;border-radius:4px;object-fit:cover}.plenio-continue .cover.none{display:flex;align-items:center;justify-content:center;background:var(--comfy-input-bg, #2a2a2a);color:var(--descrip-text, #888)}.plenio-continue .facts{flex:1;min-width:0;display:flex;flex-direction:column}.plenio-continue .title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-continue .meta{color:var(--descrip-text, #999);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.plenio-continue .play{width:32px;padding:4px 0}", Q = {
  class: "plenio-dialog plenio-continue",
  role: "dialog",
  "aria-label": "Continue a song"
}, W = { class: "toolbar" }, X = {
  key: 0,
  class: "error",
  role: "alert"
}, Y = {
  class: "list",
  role: "list"
}, Z = {
  key: 0,
  class: "empty"
}, ee = {
  key: 1,
  class: "empty"
}, te = {
  key: 2,
  class: "empty"
}, ne = ["src"], oe = {
  key: 1,
  class: "cover none",
  "aria-hidden": "true"
}, le = { class: "facts" }, ie = { class: "title" }, ae = { class: "meta" }, se = ["title", "aria-label", "onClick"], re = ["disabled", "onClick"], ce = /* @__PURE__ */ N({
  __name: "ContinueDialog",
  props: {
    fetcher: {},
    onContinue: { type: Function }
  },
  emits: ["close"],
  setup(d, { emit: m }) {
    const a = d, p = m, r = h(null), c = h(null), y = h(null), x = h(""), u = h(null);
    let f = null;
    const _ = U(() => {
      const t = x.value.toLowerCase().split(/\s+/).filter(Boolean);
      return (r.value ?? []).filter((e) => {
        const n = `${e.title} ${e.path} ${e.created.slice(0, 10)}`.toLowerCase();
        return t.every((w) => n.includes(w));
      });
    });
    function g(t) {
      return t instanceof q ? t.hint ? `${t.message} ${t.hint}` : t.message : t instanceof Error ? t.message : String(t);
    }
    function $(t) {
      const e = t.lastIndexOf("/");
      return G(a.fetcher, {
        filename: t.slice(e + 1),
        subfolder: e < 0 ? "" : t.slice(0, e),
        type: "output"
      });
    }
    function j(t) {
      if (t === null || !Number.isFinite(t)) return "";
      const e = Math.round(t);
      return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`;
    }
    function F(t) {
      return t.slice(0, 16).replace("T", " ");
    }
    function E(t) {
      const e = t.lastIndexOf("/");
      return e < 0 ? "" : t.slice(0, e);
    }
    function O(t) {
      if (t.audio) {
        if (u.value === t.path) {
          f?.pause(), u.value = null;
          return;
        }
        f?.pause(), f = new Audio($(t.audio)), f.addEventListener("ended", () => u.value = null), u.value = t.path, f.play().catch((e) => {
          u.value = null, c.value = `The audio could not be played: ${g(e)}`;
        });
      }
    }
    async function L(t, e) {
      y.value = t, c.value = null;
      try {
        await a.onContinue(e), p("close");
      } catch (n) {
        c.value = g(n);
      } finally {
        y.value = null;
      }
    }
    const b = h(null);
    async function A(t) {
      const e = t.target.files?.[0];
      if (e)
        try {
          const n = J(e) ? await K(e) : JSON.parse(await e.text());
          if (n === null) {
            c.value = `${e.name} carries no Plenio project: it was exported before Plenio 0.8.0 or with “project in FLAC” off. Open its <name>.plenio.json instead.`;
            return;
          }
          await L(e.name, { record: n, name: e.name });
        } catch (n) {
          c.value = `${e.name} could not be read: ${g(n)}`;
        } finally {
          b.value && (b.value.value = "");
        }
    }
    function S(t) {
      t.key === "Escape" && p("close");
    }
    return B(async () => {
      window.addEventListener("keydown", S);
      try {
        r.value = await R(a.fetcher);
      } catch (t) {
        r.value = [], c.value = g(t);
      }
    }), M(() => {
      window.removeEventListener("keydown", S), f?.pause();
    }), (t, e) => (i(), l("div", {
      class: "plenio-overlay",
      onMousedown: e[3] || (e[3] = T((n) => p("close"), ["self"]))
    }, [
      o("div", Q, [
        o("header", null, [
          e[4] || (e[4] = o("strong", null, "Continue a song", -1)),
          e[5] || (e[5] = o("span", { class: "hint" }, " Opens the workflow a song was made with and keeps its title, style, lyrics and score in the Song Sheets. ", -1)),
          o("button", {
            class: "close",
            title: "Close",
            "aria-label": "Close",
            onClick: e[0] || (e[0] = (n) => p("close"))
          }, "×")
        ]),
        o("div", W, [
          P(o("input", {
            "onUpdate:modelValue": e[1] || (e[1] = (n) => x.value = n),
            type: "search",
            placeholder: "Search title, folder or date",
            "aria-label": "Search songs"
          }, null, 512), [
            [z, x.value]
          ]),
          o("button", {
            title: "A release record (<name>.plenio.json) or a song's FLAC (it carries its record since Plenio 0.8.0), from any folder",
            onClick: e[2] || (e[2] = (n) => b.value?.click())
          }, "Open a record or FLAC…"),
          o("input", {
            ref_key: "picker",
            ref: b,
            type: "file",
            accept: ".json,application/json,.flac,audio/flac",
            hidden: "",
            onChange: A
          }, null, 544)
        ]),
        c.value ? (i(), l("p", X, s(c.value), 1)) : v("", !0),
        o("div", Y, [
          r.value === null ? (i(), l("p", Z, "Reading the output folder…")) : r.value.length ? _.value.length ? v("", !0) : (i(), l("p", te, 'No song matches "' + s(x.value) + '".', 1)) : (i(), l("p", ee, " No release records in the output folder yet. Export Release writes one next to every song (<name>.plenio.json). ")),
          (i(!0), l(k, null, D(_.value, (n) => (i(), l("div", {
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
            }, null, 8, ne)) : (i(), l("span", oe, "♪")),
            o("div", le, [
              o("span", ie, s(n.title), 1),
              o("span", ae, [
                C(s(F(n.created)), 1),
                j(n.seconds) ? (i(), l(k, { key: 0 }, [
                  C(" · " + s(j(n.seconds)), 1)
                ], 64)) : v("", !0),
                n.plenio ? (i(), l(k, { key: 1 }, [
                  C(" · Plenio " + s(n.plenio), 1)
                ], 64)) : v("", !0),
                E(n.path) ? (i(), l(k, { key: 2 }, [
                  C(" · " + s(E(n.path)) + "/", 1)
                ], 64)) : v("", !0)
              ])
            ]),
            n.audio ? (i(), l("button", {
              key: 2,
              class: "play",
              title: u.value === n.path ? "Stop" : "Listen",
              "aria-label": u.value === n.path ? "Stop" : `Listen to ${n.title}`,
              onClick: (w) => O(n)
            }, s(u.value === n.path ? "■" : "▶"), 9, se)) : v("", !0),
            o("button", {
              class: "primary",
              disabled: y.value !== null,
              onClick: (w) => L(n.path, { path: n.path })
            }, s(y.value === n.path ? "Opening…" : "Continue"), 9, re)
          ]))), 128))
        ])
      ])
    ], 32));
  }
});
function ue() {
  for (const [d, m] of [
    ["plenio-dialog-styles", I],
    ["plenio-continue-styles", H]
  ]) {
    if (document.getElementById(d)) continue;
    const a = document.createElement("style");
    a.id = d, a.textContent = m, document.head.append(a);
  }
}
function ve(d, m) {
  ue();
  const a = document.createElement("div");
  document.body.append(a);
  const p = () => {
    r.unmount(), a.remove();
  }, r = V(ce, { fetcher: d, onContinue: m, onClose: p });
  return r.mount(a), p;
}
export {
  ve as openContinueDialog
};
