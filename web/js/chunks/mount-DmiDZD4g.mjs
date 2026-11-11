import { d as X, o as Q, c as o, b as a, t as i, e as d, j as B, f as ue, w as Z, v as ce, g as m, h as D, i as s, l as pe, a as de, F as _, r as C, u as O, m as ve, n as V, p as z, q as fe, k as he, s as ye } from "./runtime-dom.esm-bundler-Nx6_N9ap.mjs";
import { P as H, a as me, s as ge, f as R, w as W, b as be, c as ke, S as xe, d as _e, E as J, r as we } from "./main-CfWdJfKL.mjs";
const Ce = ".plenio-setup{display:flex;flex-direction:column;gap:10px;padding:12px;font-size:13px;color:var(--fg-color, #ddd);overflow-y:auto;height:100%;box-sizing:border-box}.plenio-setup header{display:flex;align-items:baseline;gap:8px}.plenio-setup h2{margin:0;font-size:16px}.plenio-setup .version,.plenio-setup .hint{color:var(--descrip-text, #999);font-size:12px}.plenio-setup .steps{display:flex;flex-wrap:wrap;gap:4px}.plenio-setup .steps button{font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid var(--border-color, #555);background:none;color:inherit;cursor:pointer}.plenio-setup .steps button.current{background:var(--comfy-menu-secondary-bg, #333);font-weight:600}.plenio-setup section{display:flex;flex-direction:column;gap:8px}.plenio-setup button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #222);color:inherit;cursor:pointer}.plenio-setup button:disabled{opacity:.5;cursor:default}.plenio-setup button.primary{align-self:flex-start;background:var(--p-primary-color, #3b82f6);border-color:transparent;color:var(--p-primary-contrast-color, #fff)}.plenio-setup .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px;border:1px solid var(--border-color, #444);border-radius:6px}.plenio-setup .row.focus{border-color:var(--p-primary-color, #3b82f6)}.plenio-setup .row .what{display:flex;flex-direction:column;gap:2px;flex:1 1 200px;min-width:0}.plenio-setup .row progress{width:100%}.plenio-setup .state.ok{color:#4ade80}.plenio-setup .state.warn,.plenio-setup .warn{color:#fbbf24}.plenio-setup .state.error,.plenio-setup .error{color:#f87171}.plenio-setup .ok{color:#4ade80}.plenio-setup .findings{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:6px}.plenio-setup .choice,.plenio-setup .folder{display:flex;gap:6px;align-items:center}.plenio-setup select{max-width:100%;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px}.plenio-setup .go{display:flex;flex-direction:column;gap:6px}.plenio-access{border:1px solid var(--p-primary-color, #3b82f6);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}.plenio-access header{display:flex;justify-content:space-between}.plenio-access .close{background:none;border:none;font-size:18px}.plenio-access ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px}.plenio-access .mark{display:inline-block;width:1.2em}.plenio-access form{display:flex;gap:6px}.plenio-access input{flex:1;min-width:0;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px;padding:3px 6px}";
async function $(r, u, c = "GET", x) {
  const p = await r.fetchApi(u, {
    method: c,
    ...x === void 0 ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(x) }
  }), h = await p.json().catch(() => ({}));
  if (!p.ok) {
    const y = h?.error ?? {};
    throw new H(y.message ?? `Request failed (${p.status})`, y.hint ?? null);
  }
  return h;
}
const w = {
  plan: (r) => $(r, "/plenio/setup/plan"),
  state: (r) => $(r, "/plenio/setup/state"),
  saveState: (r, u) => $(r, "/plenio/setup/state", "POST", u),
  findings: (r) => $(r, "/plenio/setup/findings"),
  folders: (r) => $(r, "/plenio/setup/folders"),
  download: (r, u, c = {}) => $(r, "/plenio/setup/downloads", "POST", { variants: u, folders: c }),
  pause: (r, u) => $(r, `/plenio/setup/downloads/${encodeURIComponent(u)}/pause`, "POST", {}),
  resume: (r, u) => $(r, `/plenio/setup/downloads/${encodeURIComponent(u)}/resume`, "POST", {}),
  cancel: (r, u) => $(r, `/plenio/setup/downloads/${encodeURIComponent(u)}`, "DELETE"),
  check: (r, u) => $(r, "/plenio/setup/check", "POST", { variant: u }),
  saveToken: (r, u) => $(r, "/plenio/setup/hub-token", "POST", { token: u })
}, $e = {
  class: "plenio-access",
  role: "dialog",
  "aria-label": "This model needs your OK on Hugging Face"
}, Te = {
  key: 0,
  class: "hint"
}, Se = { class: "mark" }, Pe = ["href"], Ee = { class: "mark" }, Oe = ["href"], Re = ["disabled"], De = { class: "mark" }, Ne = ["disabled"], je = {
  key: 0,
  class: "hint"
}, Ae = {
  key: 1,
  class: "error",
  role: "alert"
}, Be = /* @__PURE__ */ X({
  __name: "AccessDialog",
  props: {
    fetcher: {},
    variant: {}
  },
  emits: ["close", "ready"],
  setup(r, { emit: u }) {
    const c = r, x = u, p = m(null), h = m(""), y = m(!1), T = m(null), N = D(() => me(p.value));
    function S(v) {
      return v instanceof H ? v.hint ? `${v.message} ${v.hint}` : v.message : v instanceof Error ? v.message : String(v);
    }
    function k(v) {
      return v === !0 ? "✓" : v === !1 ? "✕" : "○";
    }
    async function g() {
      y.value = !0;
      try {
        p.value = await w.check(c.fetcher, c.variant), T.value = null, p.value.step === "ready" && x("ready", c.variant);
      } catch (v) {
        T.value = S(v);
      } finally {
        y.value = !1;
      }
    }
    async function F() {
      y.value = !0;
      try {
        await w.saveToken(c.fetcher, h.value.trim()), h.value = "", T.value = null;
      } catch (v) {
        T.value = S(v);
      } finally {
        y.value = !1;
      }
      await g();
    }
    return Q(() => {
      g();
    }), (v, f) => (s(), o("div", $e, [
      a("header", null, [
        f[2] || (f[2] = a("strong", null, "This model needs your OK on Hugging Face", -1)),
        a("button", {
          class: "close",
          "aria-label": "Close",
          onClick: f[0] || (f[0] = (I) => x("close"))
        }, "×")
      ]),
      p.value && p.value.step !== "ready" ? (s(), o("p", Te, i(p.value.message), 1)) : d("", !0),
      a("ol", null, [
        a("li", null, [
          a("span", Se, i(k(N.value.accept)), 1),
          f[3] || (f[3] = B(" Open the model's page and accept its terms. ", -1)),
          p.value?.page ? (s(), o("a", {
            key: 0,
            href: p.value.page,
            target: "_blank",
            rel: "noopener"
          }, "Open the page", 8, Pe)) : d("", !0),
          f[4] || (f[4] = a("p", { class: "hint" }, "You need a free Hugging Face account. The makers see your user name and e-mail.", -1))
        ]),
        a("li", null, [
          a("span", Ee, i(k(N.value.token)), 1),
          f[5] || (f[5] = B(" Give this computer a token that may read it. ", -1)),
          p.value?.token_page ? (s(), o("a", {
            key: 0,
            href: p.value.token_page,
            target: "_blank",
            rel: "noopener"
          }, "Open the token page", 8, Oe)) : d("", !0),
          f[6] || (f[6] = a("p", { class: "hint" }, ' Create a token of type "Read" (or fine-grained with "Read access to contents of all public gated repos you can access"), then paste it here: ', -1)),
          a("form", {
            onSubmit: ue(F, ["prevent"])
          }, [
            Z(a("input", {
              "onUpdate:modelValue": f[1] || (f[1] = (I) => h.value = I),
              type: "password",
              autocomplete: "off",
              placeholder: "hf_…",
              "aria-label": "Hugging Face token"
            }, null, 512), [
              [ce, h.value]
            ]),
            a("button", {
              type: "submit",
              disabled: y.value || !h.value.trim()
            }, "Save", 8, Re)
          ], 32)
        ]),
        a("li", null, [
          a("span", De, i(N.value.pending ? "…" : "○"), 1),
          a("button", {
            class: "primary",
            disabled: y.value,
            onClick: g
          }, "Check and download", 8, Ne),
          N.value.pending ? (s(), o("p", je, "Your request is with the model's makers. This can take days.")) : d("", !0)
        ])
      ]),
      T.value ? (s(), o("p", Ae, i(T.value), 1)) : d("", !0)
    ]));
  }
}), Fe = { class: "plenio-setup" }, Ie = {
  key: 0,
  class: "version"
}, Ue = { class: "steps" }, ze = ["onClick"], Ve = {
  key: 0,
  class: "error",
  role: "alert"
}, Le = {
  key: 1,
  class: "hint"
}, Me = { key: 2 }, Ye = { class: "line" }, He = { class: "hint" }, qe = {
  key: 0,
  class: "findings"
}, Ge = ["onClick"], Ke = ["href"], We = {
  key: 1,
  class: "ok"
}, Je = { key: 3 }, Xe = ["checked", "onChange"], Qe = ["checked", "onChange"], Ze = { key: 4 }, et = { class: "line" }, tt = {
  key: 0,
  class: "warn"
}, nt = {
  key: 1,
  class: "warn"
}, st = {
  key: 2,
  class: "warn"
}, ot = { class: "what" }, at = ["value", "onChange"], lt = ["value"], it = { class: "hint" }, rt = { class: "hint" }, ut = {
  key: 3,
  class: "folders"
}, ct = ["onUpdate:modelValue"], pt = ["value"], dt = ["disabled"], vt = { key: 5 }, ft = { class: "what" }, ht = { class: "hint" }, yt = ["value"], mt = { class: "hint" }, gt = ["disabled", "onClick"], bt = ["disabled"], kt = { key: 6 }, xt = { key: 7 }, _t = { class: "go" }, wt = ["onClick"], Ct = /* @__PURE__ */ X({
  __name: "SetupPanel",
  props: {
    fetcher: {},
    onDownloads: { type: Function },
    openTemplate: { type: Function },
    openPlayer: { type: Function },
    focus: {}
  },
  setup(r) {
    const u = r, c = m(null), x = m(""), p = m(null), h = m(null), y = m({}), T = V({}), N = V({}), S = V({}), k = m("computer"), g = m(null), F = m(!1), v = m(null), f = V(/* @__PURE__ */ new Set());
    let I = null;
    function U(t) {
      return t instanceof H ? t.hint ? `${t.message} ${t.hint}` : t.message : t instanceof Error ? t.message : String(t);
    }
    const L = D(() => c.value ? W(c.value) : []), P = D(
      () => p.value && c.value ? be(p.value, L.value, c.value.extras, N) : []
    ), j = D(() => ke(P.value)), q = D(() => (p.value?.templates ?? []).map((t) => t.template)), G = D(() => p.value?.policy.offline || p.value?.policy.downloads === "off");
    async function ee() {
      try {
        const [t, n, e, l] = await Promise.all([
          w.state(u.fetcher),
          w.plan(u.fetcher),
          w.findings(u.fetcher),
          w.folders(u.fetcher)
        ]);
        c.value = t.state, x.value = t.version, p.value = n, h.value = e, y.value = l.folders;
        for (const b of n.downloads) S[b.id] = b;
        k.value = u.focus ? "plan" : ge(t.state, P.value), g.value = null;
      } catch (t) {
        g.value = U(t);
      }
    }
    async function te() {
      try {
        p.value = await w.plan(u.fetcher);
      } catch (t) {
        g.value = U(t);
      }
    }
    async function M(t) {
      try {
        const n = await w.saveState(u.fetcher, t);
        c.value = n.state;
      } catch (n) {
        g.value = U(n);
      }
    }
    function A(t) {
      k.value = t, M({ step: t, ...t === "go" ? { done: !0 } : {} });
    }
    function ne(t, n) {
      if (!c.value) return;
      const e = new Set(W(c.value));
      n ? e.add(t) : e.delete(t), M({ templates: q.value.filter((l) => e.has(l)) });
    }
    function se(t, n) {
      if (!c.value) return;
      const e = new Set(c.value.extras);
      n ? e.add(t) : e.delete(t), M({ extras: J.map((l) => l.id).filter((l) => e.has(l)) });
    }
    async function Y(t) {
      if (t.length) {
        F.value = !0;
        try {
          const n = await w.download(u.fetcher, t, { ...T });
          for (const e of n.downloads) S[e.id] = e;
          g.value = null, k.value === "plan" && A("downloads");
        } catch (n) {
          g.value = U(n);
        } finally {
          F.value = !1;
        }
      }
    }
    async function oe(t, n) {
      try {
        if (t === "download" || t === "retry") return await Y([n]);
        if (t === "access") {
          v.value = n;
          return;
        }
        const e = { pause: w.pause, resume: w.resume, cancel: w.cancel }[t], l = await e(u.fetcher, n);
        S[l.download.id] = l.download;
      } catch (e) {
        g.value = U(e);
      }
    }
    const ae = {
      download: "Download",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      retry: "Try again",
      access: "What to do"
    };
    function E(t) {
      const n = S[t.variant.id], e = t.variant.installed || f.has(t.variant.id);
      return we(e, n?.state === "installed" ? void 0 : n);
    }
    function le() {
      const t = h.value?.computer, n = (t?.devices ?? []).filter((l) => l.kind !== "cpu").sort((l, b) => (b.total_bytes ?? 0) - (l.total_bytes ?? 0))[0];
      return [
        n ? `${n.name} · ${R(n.total_bytes ?? 0)}` : "no graphics card",
        t?.ram_total_bytes ? `${R(t.ram_total_bytes)} RAM` : "",
        t?.disk_free_bytes != null ? `${R(t.disk_free_bytes)} free on the models drive` : ""
      ].filter(Boolean).join(" · ");
    }
    const K = D(() => (h.value?.findings ?? []).filter((t) => t.severity !== "ok")), ie = D(() => P.value.length > 0 && P.value.every((t) => t.variant.installed || f.has(t.variant.id)));
    function re(t) {
      navigator.clipboard?.writeText(t);
    }
    return pe(
      () => Object.values(S).map((t) => t.state).join(","),
      (t, n) => {
        t !== n && t.includes("installed") && te();
      }
    ), Q(() => {
      I = u.onDownloads((t) => {
        S[t.id] = t, t.state === "installed" ? f.add(t.id) : f.delete(t.id);
      }), ee();
    }), de(() => I?.()), (t, n) => (s(), o("div", Fe, [
      a("header", null, [
        n[10] || (n[10] = a("h2", null, "Plenio Setup", -1)),
        x.value ? (s(), o("span", Ie, i(x.value), 1)) : d("", !0)
      ]),
      a("nav", Ue, [
        (s(!0), o(_, null, C(O(_e), (e, l) => (s(), o("button", {
          key: e,
          class: z({ current: k.value === e }),
          onClick: (b) => A(e)
        }, i(l + 1) + " " + i(O(xe)[e]), 11, ze))), 128))
      ]),
      g.value ? (s(), o("p", Ve, i(g.value), 1)) : d("", !0),
      !c.value && !g.value ? (s(), o("p", Le, "Reading this computer…")) : d("", !0),
      c.value && k.value === "computer" ? (s(), o("section", Me, [
        a("p", Ye, i(le()), 1),
        a("p", He, "ComfyUI " + i(h.value?.computer.comfyui) + " · " + i(h.value?.computer.platform), 1),
        K.value.length ? (s(), o("ul", qe, [
          (s(!0), o(_, null, C(K.value, (e) => (s(), o("li", {
            key: e.id + e.text,
            class: z(e.severity)
          }, [
            a("span", null, i(e.text), 1),
            e.fix?.action === "copy" ? (s(), o("button", {
              key: 0,
              onClick: (l) => re(e.fix.payload.text)
            }, i(e.fix.label), 9, Ge)) : e.fix?.action === "open_url" ? (s(), o("a", {
              key: 1,
              href: e.fix.payload.url,
              target: "_blank",
              rel: "noopener"
            }, i(e.fix.label), 9, Ke)) : d("", !0)
          ], 2))), 128))
        ])) : (s(), o("p", We, "Nothing on this computer needs attention.")),
        a("button", {
          class: "primary",
          onClick: n[0] || (n[0] = (e) => A("wants"))
        }, "Next")
      ])) : d("", !0),
      c.value && k.value === "wants" ? (s(), o("section", Je, [
        n[11] || (n[11] = a("p", { class: "hint" }, "Setup plans the files for what you tick. You can change it later.", -1)),
        (s(!0), o(_, null, C(q.value, (e) => (s(), o("label", {
          key: e,
          class: "choice"
        }, [
          a("input", {
            type: "checkbox",
            checked: L.value.includes(e),
            onChange: (l) => ne(e, l.target.checked)
          }, null, 40, Xe),
          B(" " + i(e), 1)
        ]))), 128)),
        n[12] || (n[12] = a("p", { class: "hint" }, "Optional parts of these templates:", -1)),
        (s(!0), o(_, null, C(O(J), (e) => (s(), o("label", {
          key: e.id,
          class: "choice"
        }, [
          a("input", {
            type: "checkbox",
            checked: c.value.extras.includes(e.id),
            onChange: (l) => se(e.id, l.target.checked)
          }, null, 40, Qe),
          B(" " + i(e.label), 1)
        ]))), 128)),
        a("button", {
          class: "primary",
          onClick: n[1] || (n[1] = (e) => A("plan"))
        }, "Next")
      ])) : d("", !0),
      c.value && k.value === "plan" ? (s(), o("section", Ze, [
        a("p", et, i(P.value.length) + " files · " + i(j.value.files) + " to download · " + i(O(R)(j.value.bytes)), 1),
        j.value.nonCommercial.length ? (s(), o("p", tt, "Non-commercial licence: " + i(j.value.nonCommercial.join(", ")) + ".", 1)) : d("", !0),
        p.value?.policy.offline ? (s(), o("p", nt, "Offline mode is on: Setup fetches nothing. Place the files as each row says.")) : p.value?.policy.downloads === "off" ? (s(), o("p", st, "Downloads are switched off in config.toml ([models] downloads).")) : d("", !0),
        (s(!0), o(_, null, C(P.value, (e) => (s(), o("div", {
          key: e.component,
          class: z(["row", { focus: r.focus === e.component }])
        }, [
          a("div", ot, [
            a("strong", null, i(e.title), 1),
            e.variants.length > 1 ? (s(), o("select", {
              key: 0,
              value: e.variant.id,
              onChange: (l) => N[e.component] = l.target.value
            }, [
              (s(!0), o(_, null, C(e.variants, (l) => (s(), o("option", {
                key: l.id,
                value: l.id
              }, i(l.file) + " · " + i(O(R)(l.bytes)) + i(l.id === e.planned ? " (the plan)" : ""), 9, lt))), 128))
            ], 40, at)) : d("", !0),
            a("span", it, [
              B(i(e.reason), 1),
              e.warning ? (s(), o(_, { key: 0 }, [
                B(" - " + i(e.warning), 1)
              ], 64)) : d("", !0)
            ]),
            a("span", rt, "models/" + i(e.folder) + " · " + i(e.variant.licence) + " · " + i(O(R)(e.variant.bytes)), 1)
          ]),
          a("span", {
            class: z(["state", E(e).tone])
          }, i(E(e).status), 3)
        ], 2))), 128)),
        Object.keys(y.value).length ? (s(), o("details", ut, [
          n[13] || (n[13] = a("summary", null, "Where the files go", -1)),
          (s(!0), o(_, null, C(y.value, (e, l) => (s(), o("label", {
            key: l,
            class: "folder"
          }, [
            a("span", null, "models/" + i(l), 1),
            Z(a("select", {
              "onUpdate:modelValue": (b) => T[l] = b
            }, [
              (s(!0), o(_, null, C(e, (b) => (s(), o("option", {
                key: b.path,
                value: b.path
              }, i(b.path) + i(b.free_bytes != null ? ` · ${O(R)(b.free_bytes)} free` : ""), 9, pt))), 128))
            ], 8, ct), [
              [fe, T[l]]
            ])
          ]))), 128))
        ])) : d("", !0),
        a("button", {
          class: "primary",
          disabled: F.value || G.value || j.value.files === 0,
          onClick: n[2] || (n[2] = (e) => Y(P.value.filter((l) => !l.variant.installed).map((l) => l.variant.id)))
        }, " Download all (" + i(O(R)(j.value.bytes)) + ") ", 9, dt),
        j.value.files === 0 ? (s(), o("button", {
          key: 4,
          class: "primary",
          onClick: n[3] || (n[3] = (e) => A("test"))
        }, "Next")) : d("", !0)
      ])) : d("", !0),
      c.value && k.value === "downloads" ? (s(), o("section", vt, [
        (s(!0), o(_, null, C(P.value, (e) => (s(), o("div", {
          key: e.component,
          class: "row"
        }, [
          a("div", ft, [
            a("strong", null, i(e.title), 1),
            a("span", ht, i(e.variant.file), 1),
            E(e).progress !== null ? (s(), o("progress", {
              key: 0,
              value: E(e).progress ?? 0,
              max: "1"
            }, null, 8, yt)) : d("", !0),
            a("span", mt, i(E(e).detail), 1)
          ]),
          a("span", {
            class: z(["state", E(e).tone])
          }, i(E(e).status), 3),
          (s(!0), o(_, null, C(E(e).actions, (l) => (s(), o("button", {
            key: l,
            disabled: G.value && (l === "download" || l === "retry"),
            onClick: (b) => oe(l, e.variant.id)
          }, i(ae[l]), 9, gt))), 128))
        ]))), 128)),
        a("button", {
          class: "primary",
          disabled: !ie.value,
          onClick: n[4] || (n[4] = (e) => A("test"))
        }, "Next", 8, bt)
      ])) : d("", !0),
      c.value && k.value === "test" ? (s(), o("section", kt, [
        n[14] || (n[14] = a("p", null, "The test song makes a one-minute instrumental with your files - so that a problem shows here, not in your first song.", -1)),
        a("button", {
          class: "primary",
          onClick: n[5] || (n[5] = (e) => r.openTemplate("1 · YuE2 · Song"))
        }, "Open 1 · YuE2 · Song"),
        a("button", {
          onClick: n[6] || (n[6] = (e) => A("go"))
        }, "Skip")
      ])) : d("", !0),
      c.value && k.value === "go" ? (s(), o("section", xt, [
        a("div", _t, [
          (s(!0), o(_, null, C(L.value, (e) => (s(), o("button", {
            key: e,
            class: "primary",
            onClick: (l) => r.openTemplate(e)
          }, i(e), 9, wt))), 128)),
          a("button", {
            onClick: n[7] || (n[7] = (e) => r.openPlayer())
          }, "Open the player")
        ])
      ])) : d("", !0),
      v.value ? (s(), ve(Be, {
        key: 8,
        fetcher: r.fetcher,
        variant: v.value,
        onClose: n[8] || (n[8] = (e) => v.value = null),
        onReady: n[9] || (n[9] = (e) => {
          v.value = null, Y([e]);
        })
      }, null, 8, ["fetcher", "variant"])) : d("", !0)
    ]));
  }
});
function $t() {
  if (document.getElementById("plenio-setup-styles")) return;
  const r = document.createElement("style");
  r.id = "plenio-setup-styles", r.textContent = Ce, document.head.append(r);
}
function Pt(r, u, c = null) {
  $t();
  const x = m(c), p = m(0), h = he({
    render: () => ye(Ct, {
      key: p.value,
      fetcher: u.fetcher,
      onDownloads: u.onDownloads,
      openTemplate: u.openTemplate,
      openPlayer: u.openPlayer,
      focus: x.value
    })
  });
  return h.mount(r), {
    focus(y) {
      x.value = y, p.value += 1;
    },
    unmount: () => h.unmount()
  };
}
export {
  Pt as mountSetup
};
