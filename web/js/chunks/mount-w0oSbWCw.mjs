import { d as ne, o as se, c as a, b as l, t as o, e as p, j as U, f as he, w as ae, v as ye, g as h, h as O, i as s, l as ge, a as me, F as $, r as S, u as N, n as F, m as ke, p as L, q as be, k as xe, s as _e } from "./runtime-dom.esm-bundler-BuebSeFB.mjs";
import { P as H, a as we, s as Ce, f as D, t as $e, w as ee, b as Se, c as Te, S as Pe, d as Oe, E as te, r as Ee } from "./main-BJvf6ebe.mjs";
const Re = ".plenio-setup{display:flex;flex-direction:column;gap:10px;padding:12px;font-size:13px;color:var(--fg-color, #ddd);overflow-y:auto;height:100%;box-sizing:border-box}.plenio-setup header{display:flex;align-items:baseline;gap:8px}.plenio-setup h2{margin:0;font-size:16px}.plenio-setup .version,.plenio-setup .hint{color:var(--descrip-text, #999);font-size:12px}.plenio-setup .steps{display:flex;flex-wrap:wrap;gap:4px}.plenio-setup .steps button{font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid var(--border-color, #555);background:none;color:inherit;cursor:pointer}.plenio-setup .steps button.current{background:var(--comfy-menu-secondary-bg, #333);font-weight:600}.plenio-setup section{display:flex;flex-direction:column;gap:8px}.plenio-setup button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #222);color:inherit;cursor:pointer}.plenio-setup button:disabled{opacity:.5;cursor:default}.plenio-setup button.primary{align-self:flex-start;background:var(--p-primary-color, #3b82f6);border-color:transparent;color:var(--p-primary-contrast-color, #fff)}.plenio-setup .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px;border:1px solid var(--border-color, #444);border-radius:6px}.plenio-setup .row.focus{border-color:var(--p-primary-color, #3b82f6)}.plenio-setup .row .what{display:flex;flex-direction:column;gap:2px;flex:1 1 200px;min-width:0}.plenio-setup .row progress{width:100%}.plenio-setup .state.ok{color:#4ade80}.plenio-setup .state.warn,.plenio-setup .warn{color:#fbbf24}.plenio-setup .state.error,.plenio-setup .error{color:#f87171}.plenio-setup .ok{color:#4ade80}.plenio-setup .findings{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:6px}.plenio-setup .choice,.plenio-setup .folder{display:flex;gap:6px;align-items:center}.plenio-setup select{max-width:100%;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px}.plenio-setup .go{display:flex;flex-direction:column;gap:6px}.plenio-access{border:1px solid var(--p-primary-color, #3b82f6);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}.plenio-access header{display:flex;justify-content:space-between}.plenio-access .close{background:none;border:none;font-size:18px}.plenio-access ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px}.plenio-access .mark{display:inline-block;width:1.2em}.plenio-access form{display:flex;gap:6px}.plenio-access input{flex:1;min-width:0;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px;padding:3px 6px}.plenio-setup audio{width:100%}";
async function w(r, u, c = "GET", C) {
  const d = await r.fetchApi(u, {
    method: c,
    ...C === void 0 ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(C) }
  }), y = await d.json().catch(() => ({}));
  if (!d.ok) {
    const g = y?.error ?? {};
    throw new H(g.message ?? `Request failed (${d.status})`, g.hint ?? null);
  }
  return y;
}
const x = {
  plan: (r) => w(r, "/plenio/setup/plan"),
  state: (r) => w(r, "/plenio/setup/state"),
  saveState: (r, u) => w(r, "/plenio/setup/state", "POST", u),
  findings: (r) => w(r, "/plenio/setup/findings"),
  folders: (r) => w(r, "/plenio/setup/folders"),
  download: (r, u, c = {}) => w(r, "/plenio/setup/downloads", "POST", { variants: u, folders: c }),
  pause: (r, u) => w(r, `/plenio/setup/downloads/${encodeURIComponent(u)}/pause`, "POST", {}),
  resume: (r, u) => w(r, `/plenio/setup/downloads/${encodeURIComponent(u)}/resume`, "POST", {}),
  cancel: (r, u) => w(r, `/plenio/setup/downloads/${encodeURIComponent(u)}`, "DELETE"),
  check: (r, u) => w(r, "/plenio/setup/check", "POST", { variant: u }),
  saveToken: (r, u) => w(r, "/plenio/setup/hub-token", "POST", { token: u }),
  testSong: (r) => w(r, "/plenio/setup/test-song", "POST", {}),
  job: (r, u) => w(r, `/plenio/api/v1/jobs/${encodeURIComponent(u)}?wait=20`)
}, je = {
  class: "plenio-access",
  role: "dialog",
  "aria-label": "This model needs your OK on Hugging Face"
}, Ne = {
  key: 0,
  class: "hint"
}, De = { class: "mark" }, Ae = ["href"], Be = { class: "mark" }, Fe = ["href"], Ie = ["disabled"], Ue = { class: "mark" }, Ve = ["disabled"], ze = {
  key: 0,
  class: "hint"
}, Me = {
  key: 1,
  class: "error",
  role: "alert"
}, Le = /* @__PURE__ */ ne({
  __name: "AccessDialog",
  props: {
    fetcher: {},
    variant: {}
  },
  emits: ["close", "ready"],
  setup(r, { emit: u }) {
    const c = r, C = u, d = h(null), y = h(""), g = h(!1), T = h(null), A = O(() => we(d.value));
    function P(v) {
      return v instanceof H ? v.hint ? `${v.message} ${v.hint}` : v.message : v instanceof Error ? v.message : String(v);
    }
    function _(v) {
      return v === !0 ? "✓" : v === !1 ? "✕" : "○";
    }
    async function m() {
      g.value = !0;
      try {
        d.value = await x.check(c.fetcher, c.variant), T.value = null, d.value.step === "ready" && C("ready", c.variant);
      } catch (v) {
        T.value = P(v);
      } finally {
        g.value = !1;
      }
    }
    async function V() {
      g.value = !0;
      try {
        await x.saveToken(c.fetcher, y.value.trim()), y.value = "", T.value = null;
      } catch (v) {
        T.value = P(v);
      } finally {
        g.value = !1;
      }
      await m();
    }
    return se(() => {
      m();
    }), (v, f) => (s(), a("div", je, [
      l("header", null, [
        f[2] || (f[2] = l("strong", null, "This model needs your OK on Hugging Face", -1)),
        l("button", {
          class: "close",
          "aria-label": "Close",
          onClick: f[0] || (f[0] = (z) => C("close"))
        }, "×")
      ]),
      d.value && d.value.step !== "ready" ? (s(), a("p", Ne, o(d.value.message), 1)) : p("", !0),
      l("ol", null, [
        l("li", null, [
          l("span", De, o(_(A.value.accept)), 1),
          f[3] || (f[3] = U(" Open the model's page and accept its terms. ", -1)),
          d.value?.page ? (s(), a("a", {
            key: 0,
            href: d.value.page,
            target: "_blank",
            rel: "noopener"
          }, "Open the page", 8, Ae)) : p("", !0),
          f[4] || (f[4] = l("p", { class: "hint" }, "You need a free Hugging Face account. The makers see your user name and e-mail.", -1))
        ]),
        l("li", null, [
          l("span", Be, o(_(A.value.token)), 1),
          f[5] || (f[5] = U(" Give this computer a token that may read it. ", -1)),
          d.value?.token_page ? (s(), a("a", {
            key: 0,
            href: d.value.token_page,
            target: "_blank",
            rel: "noopener"
          }, "Open the token page", 8, Fe)) : p("", !0),
          f[6] || (f[6] = l("p", { class: "hint" }, ' Create a token of type "Read" (or fine-grained with "Read access to contents of all public gated repos you can access"), then paste it here: ', -1)),
          l("form", {
            onSubmit: he(V, ["prevent"])
          }, [
            ae(l("input", {
              "onUpdate:modelValue": f[1] || (f[1] = (z) => y.value = z),
              type: "password",
              autocomplete: "off",
              placeholder: "hf_…",
              "aria-label": "Hugging Face token"
            }, null, 512), [
              [ye, y.value]
            ]),
            l("button", {
              type: "submit",
              disabled: g.value || !y.value.trim()
            }, "Save", 8, Ie)
          ], 32)
        ]),
        l("li", null, [
          l("span", Ue, o(A.value.pending ? "…" : "○"), 1),
          l("button", {
            class: "primary",
            disabled: g.value,
            onClick: m
          }, "Check and download", 8, Ve),
          A.value.pending ? (s(), a("p", ze, "Your request is with the model's makers. This can take days.")) : p("", !0)
        ])
      ]),
      T.value ? (s(), a("p", Me, o(T.value), 1)) : p("", !0)
    ]));
  }
}), He = { class: "plenio-setup" }, Ye = {
  key: 0,
  class: "version"
}, qe = { class: "steps" }, Ge = ["onClick"], Je = {
  key: 0,
  class: "error",
  role: "alert"
}, Ke = {
  key: 1,
  class: "hint"
}, We = { key: 2 }, Qe = { class: "line" }, Xe = { class: "hint" }, Ze = {
  key: 0,
  class: "findings"
}, et = ["onClick"], tt = ["href"], nt = {
  key: 1,
  class: "ok"
}, st = { key: 3 }, at = ["checked", "onChange"], lt = ["checked", "onChange"], ot = { key: 4 }, it = { class: "line" }, rt = {
  key: 0,
  class: "warn"
}, ut = {
  key: 1,
  class: "warn"
}, ct = {
  key: 2,
  class: "warn"
}, pt = { class: "what" }, dt = ["value", "onChange"], vt = ["value"], ft = { class: "hint" }, ht = { class: "hint" }, yt = {
  key: 3,
  class: "folders"
}, gt = ["onUpdate:modelValue"], mt = ["value"], kt = ["disabled"], bt = { key: 5 }, xt = { class: "what" }, _t = { class: "hint" }, wt = ["value"], Ct = { class: "hint" }, $t = ["disabled", "onClick"], St = ["disabled"], Tt = { key: 6 }, Pt = ["src"], Ot = {
  key: 2,
  class: "findings"
}, Et = ["disabled"], Rt = { key: 7 }, jt = { class: "go" }, Nt = ["onClick"], Dt = /* @__PURE__ */ ne({
  __name: "SetupPanel",
  props: {
    fetcher: {},
    onDownloads: { type: Function },
    openTemplate: { type: Function },
    openPlayer: { type: Function },
    focus: {}
  },
  setup(r) {
    const u = r, c = h(null), C = h(""), d = h(null), y = h(null), g = h({}), T = L({}), A = L({}), P = L({}), _ = h("computer"), m = h(null), V = h(!1), v = h(null), f = L(/* @__PURE__ */ new Set());
    let z = null;
    const M = h(null), Y = h(null), q = h(!1), k = O(() => $e(M.value, Y.value));
    let W = !0;
    async function le() {
      q.value = !0, Y.value = null, M.value = null;
      try {
        let t = await x.testSong(u.fetcher);
        for (M.value = t; W && !["succeeded", "failed", "cancelled"].includes(t.status); )
          t = await x.job(u.fetcher, t.id), M.value = t;
      } catch (t) {
        Y.value = t instanceof H ? { message: t.message, hint: t.hint } : { message: I(t) };
      } finally {
        q.value = !1;
      }
    }
    function I(t) {
      return t instanceof H ? t.hint ? `${t.message} ${t.hint}` : t.message : t instanceof Error ? t.message : String(t);
    }
    const G = O(() => c.value ? ee(c.value) : []), E = O(
      () => d.value && c.value ? Se(d.value, G.value, c.value.extras, A) : []
    ), B = O(() => Te(E.value)), Q = O(() => (d.value?.templates ?? []).map((t) => t.template)), X = O(() => d.value?.policy.offline || d.value?.policy.downloads === "off");
    async function oe() {
      try {
        const [t, n, e, i] = await Promise.all([
          x.state(u.fetcher),
          x.plan(u.fetcher),
          x.findings(u.fetcher),
          x.folders(u.fetcher)
        ]);
        c.value = t.state, C.value = t.version, d.value = n, y.value = e, g.value = i.folders;
        for (const b of n.downloads) P[b.id] = b;
        _.value = u.focus ? "plan" : Ce(t.state, E.value), m.value = null;
      } catch (t) {
        m.value = I(t);
      }
    }
    async function ie() {
      try {
        d.value = await x.plan(u.fetcher);
      } catch (t) {
        m.value = I(t);
      }
    }
    async function J(t) {
      try {
        const n = await x.saveState(u.fetcher, t);
        c.value = n.state;
      } catch (n) {
        m.value = I(n);
      }
    }
    function R(t) {
      _.value = t, J({ step: t, ...t === "go" ? { done: !0 } : {} });
    }
    function re(t, n) {
      if (!c.value) return;
      const e = new Set(ee(c.value));
      n ? e.add(t) : e.delete(t), J({ templates: Q.value.filter((i) => e.has(i)) });
    }
    function ue(t, n) {
      if (!c.value) return;
      const e = new Set(c.value.extras);
      n ? e.add(t) : e.delete(t), J({ extras: te.map((i) => i.id).filter((i) => e.has(i)) });
    }
    async function K(t) {
      if (t.length) {
        V.value = !0;
        try {
          const n = await x.download(u.fetcher, t, { ...T });
          for (const e of n.downloads) P[e.id] = e;
          m.value = null, _.value === "plan" && R("downloads");
        } catch (n) {
          m.value = I(n);
        } finally {
          V.value = !1;
        }
      }
    }
    async function ce(t, n) {
      try {
        if (t === "download" || t === "retry") return await K([n]);
        if (t === "access") {
          v.value = n;
          return;
        }
        const e = { pause: x.pause, resume: x.resume, cancel: x.cancel }[t], i = await e(u.fetcher, n);
        P[i.download.id] = i.download;
      } catch (e) {
        m.value = I(e);
      }
    }
    const pe = {
      download: "Download",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      retry: "Try again",
      access: "What to do"
    };
    function j(t) {
      const n = P[t.variant.id], e = t.variant.installed || f.has(t.variant.id);
      return Ee(e, n?.state === "installed" ? void 0 : n);
    }
    function de() {
      const t = y.value?.computer, n = (t?.devices ?? []).filter((i) => i.kind !== "cpu").sort((i, b) => (b.total_bytes ?? 0) - (i.total_bytes ?? 0))[0];
      return [
        n ? `${n.name} · ${D(n.total_bytes ?? 0)}` : "no graphics card",
        t?.ram_total_bytes ? `${D(t.ram_total_bytes)} RAM` : "",
        t?.disk_free_bytes != null ? `${D(t.disk_free_bytes)} free on the models drive` : ""
      ].filter(Boolean).join(" · ");
    }
    const Z = O(() => (y.value?.findings ?? []).filter((t) => t.severity !== "ok")), ve = O(() => E.value.length > 0 && E.value.every((t) => t.variant.installed || f.has(t.variant.id)));
    function fe(t) {
      navigator.clipboard?.writeText(t);
    }
    return ge(
      () => Object.values(P).map((t) => t.state).join(","),
      (t, n) => {
        t !== n && t.includes("installed") && ie();
      }
    ), se(() => {
      z = u.onDownloads((t) => {
        P[t.id] = t, t.state === "installed" ? f.add(t.id) : f.delete(t.id);
      }), oe();
    }), me(() => {
      W = !1, z?.();
    }), (t, n) => (s(), a("div", He, [
      l("header", null, [
        n[10] || (n[10] = l("h2", null, "Plenio Setup", -1)),
        C.value ? (s(), a("span", Ye, o(C.value), 1)) : p("", !0)
      ]),
      l("nav", qe, [
        (s(!0), a($, null, S(N(Oe), (e, i) => (s(), a("button", {
          key: e,
          class: F({ current: _.value === e }),
          onClick: (b) => R(e)
        }, o(i + 1) + " " + o(N(Pe)[e]), 11, Ge))), 128))
      ]),
      m.value ? (s(), a("p", Je, o(m.value), 1)) : p("", !0),
      !c.value && !m.value ? (s(), a("p", Ke, "Reading this computer…")) : p("", !0),
      c.value && _.value === "computer" ? (s(), a("section", We, [
        l("p", Qe, o(de()), 1),
        l("p", Xe, "ComfyUI " + o(y.value?.computer.comfyui) + " · " + o(y.value?.computer.platform), 1),
        Z.value.length ? (s(), a("ul", Ze, [
          (s(!0), a($, null, S(Z.value, (e) => (s(), a("li", {
            key: e.id + e.text,
            class: F(e.severity)
          }, [
            l("span", null, o(e.text), 1),
            e.fix?.action === "copy" ? (s(), a("button", {
              key: 0,
              onClick: (i) => fe(e.fix.payload.text)
            }, o(e.fix.label), 9, et)) : e.fix?.action === "open_url" ? (s(), a("a", {
              key: 1,
              href: e.fix.payload.url,
              target: "_blank",
              rel: "noopener"
            }, o(e.fix.label), 9, tt)) : p("", !0)
          ], 2))), 128))
        ])) : (s(), a("p", nt, "Nothing on this computer needs attention.")),
        l("button", {
          class: "primary",
          onClick: n[0] || (n[0] = (e) => R("wants"))
        }, "Next")
      ])) : p("", !0),
      c.value && _.value === "wants" ? (s(), a("section", st, [
        n[11] || (n[11] = l("p", { class: "hint" }, "Setup plans the files for what you tick. You can change it later.", -1)),
        (s(!0), a($, null, S(Q.value, (e) => (s(), a("label", {
          key: e,
          class: "choice"
        }, [
          l("input", {
            type: "checkbox",
            checked: G.value.includes(e),
            onChange: (i) => re(e, i.target.checked)
          }, null, 40, at),
          U(" " + o(e), 1)
        ]))), 128)),
        n[12] || (n[12] = l("p", { class: "hint" }, "Optional parts of these templates:", -1)),
        (s(!0), a($, null, S(N(te), (e) => (s(), a("label", {
          key: e.id,
          class: "choice"
        }, [
          l("input", {
            type: "checkbox",
            checked: c.value.extras.includes(e.id),
            onChange: (i) => ue(e.id, i.target.checked)
          }, null, 40, lt),
          U(" " + o(e.label), 1)
        ]))), 128)),
        l("button", {
          class: "primary",
          onClick: n[1] || (n[1] = (e) => R("plan"))
        }, "Next")
      ])) : p("", !0),
      c.value && _.value === "plan" ? (s(), a("section", ot, [
        l("p", it, o(E.value.length) + " files · " + o(B.value.files) + " to download · " + o(N(D)(B.value.bytes)), 1),
        B.value.nonCommercial.length ? (s(), a("p", rt, "Non-commercial licence: " + o(B.value.nonCommercial.join(", ")) + ".", 1)) : p("", !0),
        d.value?.policy.offline ? (s(), a("p", ut, "Offline mode is on: Setup fetches nothing. Place the files as each row says.")) : d.value?.policy.downloads === "off" ? (s(), a("p", ct, "Downloads are switched off in config.toml ([models] downloads).")) : p("", !0),
        (s(!0), a($, null, S(E.value, (e) => (s(), a("div", {
          key: e.component,
          class: F(["row", { focus: r.focus === e.component }])
        }, [
          l("div", pt, [
            l("strong", null, o(e.title), 1),
            e.variants.length > 1 ? (s(), a("select", {
              key: 0,
              value: e.variant.id,
              onChange: (i) => A[e.component] = i.target.value
            }, [
              (s(!0), a($, null, S(e.variants, (i) => (s(), a("option", {
                key: i.id,
                value: i.id
              }, o(i.file) + " · " + o(N(D)(i.bytes)) + o(i.id === e.planned ? " (the plan)" : ""), 9, vt))), 128))
            ], 40, dt)) : p("", !0),
            l("span", ft, [
              U(o(e.reason), 1),
              e.warning ? (s(), a($, { key: 0 }, [
                U(" - " + o(e.warning), 1)
              ], 64)) : p("", !0)
            ]),
            l("span", ht, "models/" + o(e.folder) + " · " + o(e.variant.licence) + " · " + o(N(D)(e.variant.bytes)), 1)
          ]),
          l("span", {
            class: F(["state", j(e).tone])
          }, o(j(e).status), 3)
        ], 2))), 128)),
        Object.keys(g.value).length ? (s(), a("details", yt, [
          n[13] || (n[13] = l("summary", null, "Where the files go", -1)),
          (s(!0), a($, null, S(g.value, (e, i) => (s(), a("label", {
            key: i,
            class: "folder"
          }, [
            l("span", null, "models/" + o(i), 1),
            ae(l("select", {
              "onUpdate:modelValue": (b) => T[i] = b
            }, [
              (s(!0), a($, null, S(e, (b) => (s(), a("option", {
                key: b.path,
                value: b.path
              }, o(b.path) + o(b.free_bytes != null ? ` · ${N(D)(b.free_bytes)} free` : ""), 9, mt))), 128))
            ], 8, gt), [
              [be, T[i]]
            ])
          ]))), 128))
        ])) : p("", !0),
        l("button", {
          class: "primary",
          disabled: V.value || X.value || B.value.files === 0,
          onClick: n[2] || (n[2] = (e) => K(E.value.filter((i) => !i.variant.installed).map((i) => i.variant.id)))
        }, " Download all (" + o(N(D)(B.value.bytes)) + ") ", 9, kt),
        B.value.files === 0 ? (s(), a("button", {
          key: 4,
          class: "primary",
          onClick: n[3] || (n[3] = (e) => R("test"))
        }, "Next")) : p("", !0)
      ])) : p("", !0),
      c.value && _.value === "downloads" ? (s(), a("section", bt, [
        (s(!0), a($, null, S(E.value, (e) => (s(), a("div", {
          key: e.component,
          class: "row"
        }, [
          l("div", xt, [
            l("strong", null, o(e.title), 1),
            l("span", _t, o(e.variant.file), 1),
            j(e).progress !== null ? (s(), a("progress", {
              key: 0,
              value: j(e).progress ?? 0,
              max: "1"
            }, null, 8, wt)) : p("", !0),
            l("span", Ct, o(j(e).detail), 1)
          ]),
          l("span", {
            class: F(["state", j(e).tone])
          }, o(j(e).status), 3),
          (s(!0), a($, null, S(j(e).actions, (i) => (s(), a("button", {
            key: i,
            disabled: X.value && (i === "download" || i === "retry"),
            onClick: (b) => ce(i, e.variant.id)
          }, o(pe[i]), 9, $t))), 128))
        ]))), 128)),
        l("button", {
          class: "primary",
          disabled: !ve.value,
          onClick: n[4] || (n[4] = (e) => R("test"))
        }, "Next", 8, St)
      ])) : p("", !0),
      c.value && _.value === "test" ? (s(), a("section", Tt, [
        n[14] || (n[14] = l("p", null, " The test song makes a one-minute instrumental with 1 · YuE2 · Song and your files - no cover art, no HQ - so that a problem shows here, not in your first song. ", -1)),
        k.value.text ? (s(), a("p", {
          key: 0,
          class: F(k.value.state === "ok" ? "ok" : k.value.state === "failed" ? "error" : "hint")
        }, o(k.value.text), 3)) : p("", !0),
        k.value.audio ? (s(), a("audio", {
          key: 1,
          src: k.value.audio,
          controls: "",
          preload: "none"
        }, null, 8, Pt)) : p("", !0),
        k.value.finding ? (s(), a("ul", Ot, [
          l("li", {
            class: F(k.value.finding.severity)
          }, [
            l("span", null, o(k.value.finding.text), 1),
            k.value.finding.fix ? (s(), a("button", {
              key: 0,
              onClick: n[5] || (n[5] = (e) => R("plan"))
            }, o(k.value.finding.fix.label), 1)) : p("", !0)
          ], 2)
        ])) : p("", !0),
        k.value.state !== "running" ? (s(), a("button", {
          key: 3,
          class: "primary",
          disabled: q.value,
          onClick: le
        }, o(k.value.state === "idle" ? "Make the test song" : "Make it again"), 9, Et)) : p("", !0),
        l("button", {
          onClick: n[6] || (n[6] = (e) => R("go"))
        }, o(k.value.state === "ok" ? "Next" : "Skip"), 1)
      ])) : p("", !0),
      c.value && _.value === "go" ? (s(), a("section", Rt, [
        l("div", jt, [
          (s(!0), a($, null, S(G.value, (e) => (s(), a("button", {
            key: e,
            class: "primary",
            onClick: (i) => r.openTemplate(e)
          }, o(e), 9, Nt))), 128)),
          l("button", {
            onClick: n[7] || (n[7] = (e) => r.openPlayer())
          }, "Open the player")
        ])
      ])) : p("", !0),
      v.value ? (s(), ke(Le, {
        key: 8,
        fetcher: r.fetcher,
        variant: v.value,
        onClose: n[8] || (n[8] = (e) => v.value = null),
        onReady: n[9] || (n[9] = (e) => {
          v.value = null, K([e]);
        })
      }, null, 8, ["fetcher", "variant"])) : p("", !0)
    ]));
  }
});
function At() {
  if (document.getElementById("plenio-setup-styles")) return;
  const r = document.createElement("style");
  r.id = "plenio-setup-styles", r.textContent = Re, document.head.append(r);
}
function It(r, u, c = null) {
  At();
  const C = h(c), d = h(0), y = xe({
    render: () => _e(Dt, {
      key: d.value,
      fetcher: u.fetcher,
      onDownloads: u.onDownloads,
      openTemplate: u.openTemplate,
      openPlayer: u.openPlayer,
      focus: C.value
    })
  });
  return y.mount(r), {
    focus(g) {
      C.value = g, d.value += 1;
    },
    unmount: () => y.unmount()
  };
}
export {
  It as mountSetup
};
