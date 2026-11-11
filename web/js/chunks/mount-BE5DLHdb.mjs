import { d as oe, o as ie, c as s, b as a, t as o, e as c, j as I, f as be, w as re, v as xe, g as h, h as S, i as l, l as le, a as _e, F as _, r as C, u as R, n as j, m as we, p as q, q as Ce, k as $e, s as Te } from "./runtime-dom.esm-bundler-BuebSeFB.mjs";
import { P as K, a as Se, l as Ee, s as Pe, f as D, h as Oe, H as Re, t as je, w as se, b as Ne, c as Me, S as De, d as Fe, E as ae, e as Ae, r as Ie } from "./main-B6y0G08x.mjs";
const Be = ".plenio-setup{display:flex;flex-direction:column;gap:10px;padding:12px;font-size:13px;color:var(--fg-color, #ddd);overflow-y:auto;height:100%;box-sizing:border-box}.plenio-setup header{display:flex;align-items:baseline;gap:8px}.plenio-setup h2{margin:0;font-size:16px}.plenio-setup .version,.plenio-setup .hint{color:var(--descrip-text, #999);font-size:12px}.plenio-setup .steps{display:flex;flex-wrap:wrap;gap:4px}.plenio-setup .steps button{font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid var(--border-color, #555);background:none;color:inherit;cursor:pointer}.plenio-setup .steps button.current{background:var(--comfy-menu-secondary-bg, #333);font-weight:600}.plenio-setup section{display:flex;flex-direction:column;gap:8px}.plenio-setup button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #222);color:inherit;cursor:pointer}.plenio-setup button:disabled{opacity:.5;cursor:default}.plenio-setup button.primary{align-self:flex-start;background:var(--p-primary-color, #3b82f6);border-color:transparent;color:var(--p-primary-contrast-color, #fff)}.plenio-setup .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px;border:1px solid var(--border-color, #444);border-radius:6px}.plenio-setup .row.focus{border-color:var(--p-primary-color, #3b82f6)}.plenio-setup .row .what{display:flex;flex-direction:column;gap:2px;flex:1 1 200px;min-width:0}.plenio-setup .row progress{width:100%}.plenio-setup .state.ok{color:#4ade80}.plenio-setup .state.warn,.plenio-setup .warn{color:#fbbf24}.plenio-setup .state.error,.plenio-setup .error{color:#f87171}.plenio-setup .ok{color:#4ade80}.plenio-setup .findings{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:6px}.plenio-setup .choice,.plenio-setup .folder{display:flex;gap:6px;align-items:center}.plenio-setup select{max-width:100%;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px}.plenio-setup .go{display:flex;flex-direction:column;gap:6px}.plenio-access{border:1px solid var(--p-primary-color, #3b82f6);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}.plenio-access header{display:flex;justify-content:space-between}.plenio-access .close{background:none;border:none;font-size:18px}.plenio-access ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px}.plenio-access .mark{display:inline-block;width:1.2em}.plenio-access form{display:flex;gap:6px}.plenio-access input{flex:1;min-width:0;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px;padding:3px 6px}.plenio-setup audio{width:100%}.plenio-setup .go.two{flex-direction:row;flex-wrap:wrap}.plenio-setup .go button{text-align:left}.plenio-setup .recent{display:flex;flex-direction:column;gap:2px}.plenio-setup .links{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px}.plenio-setup .links a{color:var(--p-primary-color, #60a5fa)}.plenio-setup button.link{background:none;border:none;padding:0 2px;color:var(--p-primary-color, #60a5fa);text-align:left}";
async function $(r, u, p = "GET", T) {
  const d = await r.fetchApi(u, {
    method: p,
    ...T === void 0 ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(T) }
  }), y = await d.json().catch(() => ({}));
  if (!d.ok) {
    const g = y?.error ?? {};
    throw new K(g.message ?? `Request failed (${d.status})`, g.hint ?? null);
  }
  return y;
}
const w = {
  plan: (r) => $(r, "/plenio/setup/plan"),
  state: (r) => $(r, "/plenio/setup/state"),
  saveState: (r, u) => $(r, "/plenio/setup/state", "POST", u),
  findings: (r) => $(r, "/plenio/setup/findings"),
  folders: (r) => $(r, "/plenio/setup/folders"),
  download: (r, u, p = {}) => $(r, "/plenio/setup/downloads", "POST", { variants: u, folders: p }),
  pause: (r, u) => $(r, `/plenio/setup/downloads/${encodeURIComponent(u)}/pause`, "POST", {}),
  resume: (r, u) => $(r, `/plenio/setup/downloads/${encodeURIComponent(u)}/resume`, "POST", {}),
  cancel: (r, u) => $(r, `/plenio/setup/downloads/${encodeURIComponent(u)}`, "DELETE"),
  check: (r, u) => $(r, "/plenio/setup/check", "POST", { variant: u }),
  saveToken: (r, u) => $(r, "/plenio/setup/hub-token", "POST", { token: u }),
  testSong: (r) => $(r, "/plenio/setup/test-song", "POST", {}),
  job: (r, u) => $(r, `/plenio/api/v1/jobs/${encodeURIComponent(u)}?wait=20`)
}, Ue = {
  class: "plenio-access",
  role: "dialog",
  "aria-label": "This model needs your OK on Hugging Face"
}, ze = {
  key: 0,
  class: "hint"
}, He = { class: "mark" }, Le = ["href"], Ve = { class: "mark" }, Ye = ["href"], qe = ["disabled"], Ke = { class: "mark" }, Ge = ["disabled"], Je = {
  key: 0,
  class: "hint"
}, We = {
  key: 1,
  class: "error",
  role: "alert"
}, Qe = /* @__PURE__ */ oe({
  __name: "AccessDialog",
  props: {
    fetcher: {},
    variant: {}
  },
  emits: ["close", "ready"],
  setup(r, { emit: u }) {
    const p = r, T = u, d = h(null), y = h(""), g = h(!1), E = h(null), F = S(() => Se(d.value));
    function P(v) {
      return v instanceof K ? v.hint ? `${v.message} ${v.hint}` : v.message : v instanceof Error ? v.message : String(v);
    }
    function m(v) {
      return v === !0 ? "✓" : v === !1 ? "✕" : "○";
    }
    async function k() {
      g.value = !0;
      try {
        d.value = await w.check(p.fetcher, p.variant), E.value = null, d.value.step === "ready" && T("ready", p.variant);
      } catch (v) {
        E.value = P(v);
      } finally {
        g.value = !1;
      }
    }
    async function U() {
      g.value = !0;
      try {
        await w.saveToken(p.fetcher, y.value.trim()), y.value = "", E.value = null;
      } catch (v) {
        E.value = P(v);
      } finally {
        g.value = !1;
      }
      await k();
    }
    return ie(() => {
      k();
    }), (v, f) => (l(), s("div", Ue, [
      a("header", null, [
        f[2] || (f[2] = a("strong", null, "This model needs your OK on Hugging Face", -1)),
        a("button", {
          class: "close",
          "aria-label": "Close",
          onClick: f[0] || (f[0] = (z) => T("close"))
        }, "×")
      ]),
      d.value && d.value.step !== "ready" ? (l(), s("p", ze, o(d.value.message), 1)) : c("", !0),
      a("ol", null, [
        a("li", null, [
          a("span", He, o(m(F.value.accept)), 1),
          f[3] || (f[3] = I(" Open the model's page and accept its terms. ", -1)),
          d.value?.page ? (l(), s("a", {
            key: 0,
            href: d.value.page,
            target: "_blank",
            rel: "noopener"
          }, "Open the page", 8, Le)) : c("", !0),
          f[4] || (f[4] = a("p", { class: "hint" }, "You need a free Hugging Face account. The makers see your user name and e-mail.", -1))
        ]),
        a("li", null, [
          a("span", Ve, o(m(F.value.token)), 1),
          f[5] || (f[5] = I(" Give this computer a token that may read it. ", -1)),
          d.value?.token_page ? (l(), s("a", {
            key: 0,
            href: d.value.token_page,
            target: "_blank",
            rel: "noopener"
          }, "Open the token page", 8, Ye)) : c("", !0),
          f[6] || (f[6] = a("p", { class: "hint" }, ' Create a token of type "Read" (or fine-grained with "Read access to contents of all public gated repos you can access"), then paste it here: ', -1)),
          a("form", {
            onSubmit: be(U, ["prevent"])
          }, [
            re(a("input", {
              "onUpdate:modelValue": f[1] || (f[1] = (z) => y.value = z),
              type: "password",
              autocomplete: "off",
              placeholder: "hf_…",
              "aria-label": "Hugging Face token"
            }, null, 512), [
              [xe, y.value]
            ]),
            a("button", {
              type: "submit",
              disabled: g.value || !y.value.trim()
            }, "Save", 8, qe)
          ], 32)
        ]),
        a("li", null, [
          a("span", Ke, o(F.value.pending ? "…" : "○"), 1),
          a("button", {
            class: "primary",
            disabled: g.value,
            onClick: k
          }, "Check and download", 8, Ge),
          F.value.pending ? (l(), s("p", Je, "Your request is with the model's makers. This can take days.")) : c("", !0)
        ])
      ]),
      E.value ? (l(), s("p", We, o(E.value), 1)) : c("", !0)
    ]));
  }
}), Xe = { class: "plenio-setup" }, Ze = {
  key: 0,
  class: "version"
}, et = { class: "steps" }, tt = ["onClick"], nt = {
  key: 0,
  class: "error",
  role: "alert"
}, lt = {
  key: 1,
  class: "hint"
}, st = { key: 2 }, at = { class: "line" }, ot = { class: "hint" }, it = {
  key: 0,
  class: "findings"
}, rt = ["onClick"], ut = ["href"], ct = {
  key: 1,
  class: "ok"
}, pt = { key: 3 }, dt = ["checked", "onChange"], vt = ["checked", "onChange"], ft = { key: 4 }, ht = { class: "line" }, yt = {
  key: 0,
  class: "warn"
}, gt = {
  key: 1,
  class: "warn"
}, mt = {
  key: 2,
  class: "warn"
}, kt = { class: "what" }, bt = ["value", "onChange"], xt = ["value"], _t = { class: "hint" }, wt = { class: "hint" }, Ct = {
  key: 3,
  class: "folders"
}, $t = ["onUpdate:modelValue"], Tt = ["value"], St = ["disabled"], Et = { key: 5 }, Pt = { class: "what" }, Ot = { class: "hint" }, Rt = ["value"], jt = { class: "hint" }, Nt = ["disabled", "onClick"], Mt = ["disabled"], Dt = { key: 6 }, Ft = ["src"], At = {
  key: 2,
  class: "findings"
}, It = ["disabled"], Bt = {
  key: 7,
  class: "home"
}, Ut = { class: "go" }, zt = ["title", "onClick"], Ht = { class: "go two" }, Lt = {
  key: 1,
  class: "recent"
}, Vt = ["onClick"], Yt = { class: "links" }, qt = ["href"], Kt = /* @__PURE__ */ oe({
  __name: "SetupPanel",
  props: {
    fetcher: {},
    onDownloads: { type: Function },
    openTemplate: { type: Function },
    openPlayer: { type: Function },
    openContinue: { type: Function },
    focus: {}
  },
  setup(r) {
    const u = r, p = h(null), T = h(""), d = h(null), y = h(null), g = h({}), E = q({}), F = q({}), P = q({}), m = h("computer"), k = h(null), U = h(!1), v = h(null), f = q(/* @__PURE__ */ new Set());
    let z = null;
    const H = h([]), L = S(() => d.value ? Oe(d.value, Y.value) : null), ue = S(() => Re.filter((t) => W.value.includes(t.template)));
    async function Z() {
      try {
        H.value = (await Ee(u.fetcher)).filter((t) => t.audio).slice(0, 5);
      } catch {
        H.value = [];
      }
    }
    le(m, (t) => {
      t === "go" && Z();
    });
    const V = h(null), G = h(null), J = h(!1), b = S(() => je(V.value, G.value));
    let ee = !0;
    async function ce() {
      J.value = !0, G.value = null, V.value = null;
      try {
        let t = await w.testSong(u.fetcher);
        for (V.value = t; ee && !["succeeded", "failed", "cancelled"].includes(t.status); )
          t = await w.job(u.fetcher, t.id), V.value = t;
      } catch (t) {
        G.value = t instanceof K ? { message: t.message, hint: t.hint } : { message: B(t) };
      } finally {
        J.value = !1;
      }
    }
    function B(t) {
      return t instanceof K ? t.hint ? `${t.message} ${t.hint}` : t.message : t instanceof Error ? t.message : String(t);
    }
    const Y = S(() => p.value ? se(p.value) : []), N = S(
      () => d.value && p.value ? Ne(d.value, Y.value, p.value.extras, F) : []
    ), A = S(() => Me(N.value)), W = S(() => (d.value?.templates ?? []).map((t) => t.template)), te = S(() => d.value?.policy.offline || d.value?.policy.downloads === "off");
    async function pe() {
      try {
        const [t, n, e, i] = await Promise.all([
          w.state(u.fetcher),
          w.plan(u.fetcher),
          w.findings(u.fetcher),
          w.folders(u.fetcher)
        ]);
        p.value = t.state, T.value = t.version, d.value = n, y.value = e, g.value = i.folders;
        for (const x of n.downloads) P[x.id] = x;
        m.value = u.focus ? "plan" : Pe(t.state, N.value), k.value = null;
      } catch (t) {
        k.value = B(t);
      }
    }
    async function de() {
      try {
        d.value = await w.plan(u.fetcher);
      } catch (t) {
        k.value = B(t);
      }
    }
    async function Q(t) {
      try {
        const n = await w.saveState(u.fetcher, t);
        p.value = n.state;
      } catch (n) {
        k.value = B(n);
      }
    }
    function O(t) {
      m.value = t, Q({ step: t, ...t === "go" ? { done: !0 } : {} });
    }
    function ve(t, n) {
      if (!p.value) return;
      const e = new Set(se(p.value));
      n ? e.add(t) : e.delete(t), Q({ templates: W.value.filter((i) => e.has(i)) });
    }
    function fe(t, n) {
      if (!p.value) return;
      const e = new Set(p.value.extras);
      n ? e.add(t) : e.delete(t), Q({ extras: ae.map((i) => i.id).filter((i) => e.has(i)) });
    }
    async function X(t) {
      if (t.length) {
        U.value = !0;
        try {
          const n = await w.download(u.fetcher, t, { ...E });
          for (const e of n.downloads) P[e.id] = e;
          k.value = null, m.value === "plan" && O("downloads");
        } catch (n) {
          k.value = B(n);
        } finally {
          U.value = !1;
        }
      }
    }
    async function he(t, n) {
      try {
        if (t === "download" || t === "retry") return await X([n]);
        if (t === "access") {
          v.value = n;
          return;
        }
        const e = { pause: w.pause, resume: w.resume, cancel: w.cancel }[t], i = await e(u.fetcher, n);
        P[i.download.id] = i.download;
      } catch (e) {
        k.value = B(e);
      }
    }
    const ye = {
      download: "Download",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      retry: "Try again",
      access: "What to do"
    };
    function M(t) {
      const n = P[t.variant.id], e = t.variant.installed || f.has(t.variant.id);
      return Ie(e, n?.state === "installed" ? void 0 : n);
    }
    function ge() {
      const t = y.value?.computer, n = (t?.devices ?? []).filter((i) => i.kind !== "cpu").sort((i, x) => (x.total_bytes ?? 0) - (i.total_bytes ?? 0))[0];
      return [
        n ? `${n.name} · ${D(n.total_bytes ?? 0)}` : "no graphics card",
        t?.ram_total_bytes ? `${D(t.ram_total_bytes)} RAM` : "",
        t?.disk_free_bytes != null ? `${D(t.disk_free_bytes)} free on the models drive` : ""
      ].filter(Boolean).join(" · ");
    }
    const ne = S(() => (y.value?.findings ?? []).filter((t) => t.severity !== "ok")), me = S(() => N.value.length > 0 && N.value.every((t) => t.variant.installed || f.has(t.variant.id)));
    function ke(t) {
      navigator.clipboard?.writeText(t);
    }
    return le(
      () => Object.values(P).map((t) => t.state).join(","),
      (t, n) => {
        t !== n && t.includes("installed") && de();
      }
    ), ie(() => {
      z = u.onDownloads((t) => {
        P[t.id] = t, t.state === "installed" ? f.add(t.id) : f.delete(t.id);
      }), pe().then(() => {
        m.value === "go" && Z();
      });
    }), _e(() => {
      ee = !1, z?.();
    }), (t, n) => (l(), s("div", Xe, [
      a("header", null, [
        n[12] || (n[12] = a("h2", null, "Plenio Setup", -1)),
        T.value ? (l(), s("span", Ze, o(T.value), 1)) : c("", !0)
      ]),
      a("nav", et, [
        (l(!0), s(_, null, C(R(Fe), (e, i) => (l(), s("button", {
          key: e,
          class: j({ current: m.value === e }),
          onClick: (x) => O(e)
        }, o(i + 1) + " " + o(R(De)[e]), 11, tt))), 128))
      ]),
      k.value ? (l(), s("p", nt, o(k.value), 1)) : c("", !0),
      !p.value && !k.value ? (l(), s("p", lt, "Reading this computer…")) : c("", !0),
      p.value && m.value === "computer" ? (l(), s("section", st, [
        a("p", at, o(ge()), 1),
        a("p", ot, "ComfyUI " + o(y.value?.computer.comfyui) + " · " + o(y.value?.computer.platform), 1),
        ne.value.length ? (l(), s("ul", it, [
          (l(!0), s(_, null, C(ne.value, (e) => (l(), s("li", {
            key: e.id + e.text,
            class: j(e.severity)
          }, [
            a("span", null, o(e.text), 1),
            e.fix?.action === "copy" ? (l(), s("button", {
              key: 0,
              onClick: (i) => ke(e.fix.payload.text)
            }, o(e.fix.label), 9, rt)) : e.fix?.action === "open_url" ? (l(), s("a", {
              key: 1,
              href: e.fix.payload.url,
              target: "_blank",
              rel: "noopener"
            }, o(e.fix.label), 9, ut)) : c("", !0)
          ], 2))), 128))
        ])) : (l(), s("p", ct, "Nothing on this computer needs attention.")),
        a("button", {
          class: "primary",
          onClick: n[0] || (n[0] = (e) => O("wants"))
        }, "Next")
      ])) : c("", !0),
      p.value && m.value === "wants" ? (l(), s("section", pt, [
        n[13] || (n[13] = a("p", { class: "hint" }, "Setup plans the files for what you tick. You can change it later.", -1)),
        (l(!0), s(_, null, C(W.value, (e) => (l(), s("label", {
          key: e,
          class: "choice"
        }, [
          a("input", {
            type: "checkbox",
            checked: Y.value.includes(e),
            onChange: (i) => ve(e, i.target.checked)
          }, null, 40, dt),
          I(" " + o(e), 1)
        ]))), 128)),
        n[14] || (n[14] = a("p", { class: "hint" }, "Optional parts of these templates:", -1)),
        (l(!0), s(_, null, C(R(ae), (e) => (l(), s("label", {
          key: e.id,
          class: "choice"
        }, [
          a("input", {
            type: "checkbox",
            checked: p.value.extras.includes(e.id),
            onChange: (i) => fe(e.id, i.target.checked)
          }, null, 40, vt),
          I(" " + o(e.label), 1)
        ]))), 128)),
        a("button", {
          class: "primary",
          onClick: n[1] || (n[1] = (e) => O("plan"))
        }, "Next")
      ])) : c("", !0),
      p.value && m.value === "plan" ? (l(), s("section", ft, [
        a("p", ht, o(N.value.length) + " files · " + o(A.value.files) + " to download · " + o(R(D)(A.value.bytes)), 1),
        A.value.nonCommercial.length ? (l(), s("p", yt, "Non-commercial licence: " + o(A.value.nonCommercial.join(", ")) + ".", 1)) : c("", !0),
        d.value?.policy.offline ? (l(), s("p", gt, "Offline mode is on: Setup fetches nothing. Place the files as each row says.")) : d.value?.policy.downloads === "off" ? (l(), s("p", mt, "Downloads are switched off in config.toml ([models] downloads).")) : c("", !0),
        (l(!0), s(_, null, C(N.value, (e) => (l(), s("div", {
          key: e.component,
          class: j(["row", { focus: r.focus === e.component }])
        }, [
          a("div", kt, [
            a("strong", null, o(e.title), 1),
            e.variants.length > 1 ? (l(), s("select", {
              key: 0,
              value: e.variant.id,
              onChange: (i) => F[e.component] = i.target.value
            }, [
              (l(!0), s(_, null, C(e.variants, (i) => (l(), s("option", {
                key: i.id,
                value: i.id
              }, o(i.file) + " · " + o(R(D)(i.bytes)) + o(i.id === e.planned ? " (the plan)" : ""), 9, xt))), 128))
            ], 40, bt)) : c("", !0),
            a("span", _t, [
              I(o(e.reason), 1),
              e.warning ? (l(), s(_, { key: 0 }, [
                I(" - " + o(e.warning), 1)
              ], 64)) : c("", !0)
            ]),
            a("span", wt, "models/" + o(e.folder) + " · " + o(e.variant.licence) + " · " + o(R(D)(e.variant.bytes)), 1)
          ]),
          a("span", {
            class: j(["state", M(e).tone])
          }, o(M(e).status), 3)
        ], 2))), 128)),
        Object.keys(g.value).length ? (l(), s("details", Ct, [
          n[15] || (n[15] = a("summary", null, "Where the files go", -1)),
          (l(!0), s(_, null, C(g.value, (e, i) => (l(), s("label", {
            key: i,
            class: "folder"
          }, [
            a("span", null, "models/" + o(i), 1),
            re(a("select", {
              "onUpdate:modelValue": (x) => E[i] = x
            }, [
              (l(!0), s(_, null, C(e, (x) => (l(), s("option", {
                key: x.path,
                value: x.path
              }, o(x.path) + o(x.free_bytes != null ? ` · ${R(D)(x.free_bytes)} free` : ""), 9, Tt))), 128))
            ], 8, $t), [
              [Ce, E[i]]
            ])
          ]))), 128))
        ])) : c("", !0),
        a("button", {
          class: "primary",
          disabled: U.value || te.value || A.value.files === 0,
          onClick: n[2] || (n[2] = (e) => X(N.value.filter((i) => !i.variant.installed).map((i) => i.variant.id)))
        }, " Download all (" + o(R(D)(A.value.bytes)) + ") ", 9, St),
        A.value.files === 0 ? (l(), s("button", {
          key: 4,
          class: "primary",
          onClick: n[3] || (n[3] = (e) => O("test"))
        }, "Next")) : c("", !0)
      ])) : c("", !0),
      p.value && m.value === "downloads" ? (l(), s("section", Et, [
        (l(!0), s(_, null, C(N.value, (e) => (l(), s("div", {
          key: e.component,
          class: "row"
        }, [
          a("div", Pt, [
            a("strong", null, o(e.title), 1),
            a("span", Ot, o(e.variant.file), 1),
            M(e).progress !== null ? (l(), s("progress", {
              key: 0,
              value: M(e).progress ?? 0,
              max: "1"
            }, null, 8, Rt)) : c("", !0),
            a("span", jt, o(M(e).detail), 1)
          ]),
          a("span", {
            class: j(["state", M(e).tone])
          }, o(M(e).status), 3),
          (l(!0), s(_, null, C(M(e).actions, (i) => (l(), s("button", {
            key: i,
            disabled: te.value && (i === "download" || i === "retry"),
            onClick: (x) => he(i, e.variant.id)
          }, o(ye[i]), 9, Nt))), 128))
        ]))), 128)),
        a("button", {
          class: "primary",
          disabled: !me.value,
          onClick: n[4] || (n[4] = (e) => O("test"))
        }, "Next", 8, Mt)
      ])) : c("", !0),
      p.value && m.value === "test" ? (l(), s("section", Dt, [
        n[16] || (n[16] = a("p", null, " The test song makes a one-minute instrumental with 1 · YuE2 · Song and your files - no cover art, no HQ - so that a problem shows here, not in your first song. ", -1)),
        b.value.text ? (l(), s("p", {
          key: 0,
          class: j(b.value.state === "ok" ? "ok" : b.value.state === "failed" ? "error" : "hint")
        }, o(b.value.text), 3)) : c("", !0),
        b.value.audio ? (l(), s("audio", {
          key: 1,
          src: b.value.audio,
          controls: "",
          preload: "none"
        }, null, 8, Ft)) : c("", !0),
        b.value.finding ? (l(), s("ul", At, [
          a("li", {
            class: j(b.value.finding.severity)
          }, [
            a("span", null, o(b.value.finding.text), 1),
            b.value.finding.fix ? (l(), s("button", {
              key: 0,
              onClick: n[5] || (n[5] = (e) => O("plan"))
            }, o(b.value.finding.fix.label), 1)) : c("", !0)
          ], 2)
        ])) : c("", !0),
        b.value.state !== "running" ? (l(), s("button", {
          key: 3,
          class: "primary",
          disabled: J.value,
          onClick: ce
        }, o(b.value.state === "idle" ? "Make the test song" : "Make it again"), 9, It)) : c("", !0),
        a("button", {
          onClick: n[6] || (n[6] = (e) => O("go"))
        }, o(b.value.state === "ok" ? "Next" : "Skip"), 1)
      ])) : c("", !0),
      p.value && m.value === "go" ? (l(), s("section", Bt, [
        L.value ? (l(), s("p", {
          key: 0,
          class: j(L.value.ready ? "ok" : "warn")
        }, [
          I(o(L.value.ready ? "Everything ready ✓" : "Files are missing") + " · " + o(L.value.line) + " ", 1),
          a("button", {
            class: "link",
            onClick: n[7] || (n[7] = (e) => O("plan"))
          }, "Manage")
        ], 2)) : c("", !0),
        a("div", Ut, [
          (l(!0), s(_, null, C(ue.value, (e) => (l(), s("button", {
            key: e.template,
            class: j({ primary: Y.value.includes(e.template) }),
            title: e.template,
            onClick: (i) => r.openTemplate(e.template)
          }, o(e.label), 11, zt))), 128))
        ]),
        a("div", Ht, [
          a("button", {
            onClick: n[8] || (n[8] = (e) => r.openPlayer())
          }, "Open the player"),
          a("button", {
            onClick: n[9] || (n[9] = (e) => r.openContinue())
          }, "Continue a song…")
        ]),
        H.value.length ? (l(), s("div", Lt, [
          n[17] || (n[17] = a("span", { class: "hint" }, "Recent songs", -1)),
          (l(!0), s(_, null, C(H.value, (e) => (l(), s("button", {
            key: e.path,
            class: "link",
            onClick: (i) => r.openPlayer(e.path)
          }, "▶ " + o(e.title), 9, Vt))), 128))
        ])) : c("", !0),
        a("nav", Yt, [
          (l(!0), s(_, null, C(R(Ae), (e) => (l(), s("a", {
            key: e.label,
            href: e.url,
            target: "_blank",
            rel: "noopener"
          }, o(e.label), 9, qt))), 128))
        ])
      ])) : c("", !0),
      v.value ? (l(), we(Qe, {
        key: 8,
        fetcher: r.fetcher,
        variant: v.value,
        onClose: n[10] || (n[10] = (e) => v.value = null),
        onReady: n[11] || (n[11] = (e) => {
          v.value = null, X([e]);
        })
      }, null, 8, ["fetcher", "variant"])) : c("", !0)
    ]));
  }
});
function Gt() {
  if (document.getElementById("plenio-setup-styles")) return;
  const r = document.createElement("style");
  r.id = "plenio-setup-styles", r.textContent = Be, document.head.append(r);
}
function Qt(r, u, p = null) {
  Gt();
  const T = h(p), d = h(0), y = $e({
    render: () => Te(Kt, {
      key: d.value,
      fetcher: u.fetcher,
      onDownloads: u.onDownloads,
      openTemplate: u.openTemplate,
      openPlayer: u.openPlayer,
      openContinue: u.openContinue,
      focus: T.value
    })
  });
  return y.mount(r), {
    focus(g) {
      T.value = g, d.value += 1;
    },
    unmount: () => y.unmount()
  };
}
export {
  Qt as mountSetup
};
