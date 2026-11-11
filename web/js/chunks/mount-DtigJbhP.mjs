import { d as ie, o as re, c as l, b as s, t as a, e as c, j as F, f as _e, w as ue, v as Ce, g as f, h as S, i as o, l as le, a as Te, F as w, r as T, u as R, n as j, m as $e, p as K, q as Se, k as Pe, s as Oe } from "./runtime-dom.esm-bundler-BuebSeFB.mjs";
import { P as H, a as Ee, l as Re, s as je, f as A, h as ze, H as Ne, t as Ue, w as se, b as Ae, c as Fe, S as Le, d as Me, E as ae, e as De, r as Ie } from "./main-CEmOssgd.mjs";
const Be = ".plenio-setup{display:flex;flex-direction:column;gap:10px;padding:12px;font-size:13px;color:var(--fg-color, #ddd);overflow-y:auto;height:100%;box-sizing:border-box}.plenio-setup header{display:flex;align-items:baseline;gap:8px}.plenio-setup h2{margin:0;font-size:16px}.plenio-setup .version,.plenio-setup .hint{color:var(--descrip-text, #999);font-size:12px}.plenio-setup .steps{display:flex;flex-wrap:wrap;gap:4px}.plenio-setup .steps button{font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid var(--border-color, #555);background:none;color:inherit;cursor:pointer}.plenio-setup .steps button.current{background:var(--comfy-menu-secondary-bg, #333);font-weight:600}.plenio-setup section{display:flex;flex-direction:column;gap:8px}.plenio-setup button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #222);color:inherit;cursor:pointer}.plenio-setup button:disabled{opacity:.5;cursor:default}.plenio-setup button.primary{align-self:flex-start;background:var(--p-primary-color, #3b82f6);border-color:transparent;color:var(--p-primary-contrast-color, #fff)}.plenio-setup .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px;border:1px solid var(--border-color, #444);border-radius:6px}.plenio-setup .row.focus{border-color:var(--p-primary-color, #3b82f6)}.plenio-setup .row .what{display:flex;flex-direction:column;gap:2px;flex:1 1 200px;min-width:0}.plenio-setup .row progress{width:100%}.plenio-setup .state.ok{color:#4ade80}.plenio-setup .state.warn,.plenio-setup .warn{color:#fbbf24}.plenio-setup .state.error,.plenio-setup .error{color:#f87171}.plenio-setup .ok{color:#4ade80}.plenio-setup .findings{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:6px}.plenio-setup .choice,.plenio-setup .folder{display:flex;gap:6px;align-items:center}.plenio-setup select{max-width:100%;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px}.plenio-setup .go{display:flex;flex-direction:column;gap:6px}.plenio-access{border:1px solid var(--p-primary-color, #3b82f6);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}.plenio-access header{display:flex;justify-content:space-between}.plenio-access .close{background:none;border:none;font-size:18px}.plenio-access ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px}.plenio-access .mark{display:inline-block;width:1.2em}.plenio-access form{display:flex;gap:6px}.plenio-access input{flex:1;min-width:0;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px;padding:3px 6px}.plenio-setup audio{width:100%}.plenio-setup .go.two{flex-direction:row;flex-wrap:wrap}.plenio-setup .go button{text-align:left}.plenio-setup .recent{display:flex;flex-direction:column;gap:2px}.plenio-setup .links{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px}.plenio-setup .links a{color:var(--p-primary-color, #60a5fa)}.plenio-setup button.link{background:none;border:none;padding:0 2px;color:var(--p-primary-color, #60a5fa);text-align:left}.plenio-setup .report pre{white-space:pre-wrap;max-height:240px;overflow:auto;font-size:11px;background:var(--comfy-input-bg, #1a1a1a);padding:6px}.plenio-setup .report-button{align-self:flex-start;font-size:12px}";
async function $(u, r, p = "GET", g) {
  const d = await u.fetchApi(r, {
    method: p,
    ...g === void 0 ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(g) }
  }), y = await d.json().catch(() => ({}));
  if (!d.ok) {
    const k = y?.error ?? {};
    throw new H(k.message ?? `Request failed (${d.status})`, k.hint ?? null);
  }
  return y;
}
const b = {
  plan: (u) => $(u, "/plenio/setup/plan"),
  state: (u) => $(u, "/plenio/setup/state"),
  saveState: (u, r) => $(u, "/plenio/setup/state", "POST", r),
  findings: (u) => $(u, "/plenio/setup/findings"),
  folders: (u) => $(u, "/plenio/setup/folders"),
  download: (u, r, p = {}) => $(u, "/plenio/setup/downloads", "POST", { variants: r, folders: p }),
  pause: (u, r) => $(u, `/plenio/setup/downloads/${encodeURIComponent(r)}/pause`, "POST", {}),
  resume: (u, r) => $(u, `/plenio/setup/downloads/${encodeURIComponent(r)}/resume`, "POST", {}),
  cancel: (u, r) => $(u, `/plenio/setup/downloads/${encodeURIComponent(r)}`, "DELETE"),
  check: (u, r) => $(u, "/plenio/setup/check", "POST", { variant: r }),
  saveToken: (u, r) => $(u, "/plenio/setup/hub-token", "POST", { token: r }),
  report: (u, r, p) => $(u, "/plenio/setup/report", "POST", { workflow: r, error: p }),
  reportZip: async (u, r, p) => {
    const g = await u.fetchApi("/plenio/setup/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: r, error: p, download: !0 })
    });
    if (!g.ok) throw new H(`The report could not be made (${g.status})`);
    return g.blob();
  },
  testSong: (u) => $(u, "/plenio/setup/test-song", "POST", {}),
  job: (u, r) => $(u, `/plenio/api/v1/jobs/${encodeURIComponent(r)}?wait=20`)
}, He = {
  class: "plenio-access",
  role: "dialog",
  "aria-label": "This model needs your OK on Hugging Face"
}, Ve = {
  key: 0,
  class: "hint"
}, Ye = { class: "mark" }, qe = ["href"], Je = { class: "mark" }, Ke = ["href"], Ge = ["disabled"], We = { class: "mark" }, Ze = ["disabled"], Qe = {
  key: 0,
  class: "hint"
}, Xe = {
  key: 1,
  class: "error",
  role: "alert"
}, et = /* @__PURE__ */ ie({
  __name: "AccessDialog",
  props: {
    fetcher: {},
    variant: {}
  },
  emits: ["close", "ready"],
  setup(u, { emit: r }) {
    const p = u, g = r, d = f(null), y = f(""), k = f(!1), P = f(null), L = S(() => Ee(d.value));
    function O(v) {
      return v instanceof H ? v.hint ? `${v.message} ${v.hint}` : v.message : v instanceof Error ? v.message : String(v);
    }
    function x(v) {
      return v === !0 ? "✓" : v === !1 ? "✕" : "○";
    }
    async function m() {
      k.value = !0;
      try {
        d.value = await b.check(p.fetcher, p.variant), P.value = null, d.value.step === "ready" && g("ready", p.variant);
      } catch (v) {
        P.value = O(v);
      } finally {
        k.value = !1;
      }
    }
    async function D() {
      k.value = !0;
      try {
        await b.saveToken(p.fetcher, y.value.trim()), y.value = "", P.value = null;
      } catch (v) {
        P.value = O(v);
      } finally {
        k.value = !1;
      }
      await m();
    }
    return re(() => {
      m();
    }), (v, h) => (o(), l("div", He, [
      s("header", null, [
        h[2] || (h[2] = s("strong", null, "This model needs your OK on Hugging Face", -1)),
        s("button", {
          class: "close",
          "aria-label": "Close",
          onClick: h[0] || (h[0] = (I) => g("close"))
        }, "×")
      ]),
      d.value && d.value.step !== "ready" ? (o(), l("p", Ve, a(d.value.message), 1)) : c("", !0),
      s("ol", null, [
        s("li", null, [
          s("span", Ye, a(x(L.value.accept)), 1),
          h[3] || (h[3] = F(" Open the model's page and accept its terms. ", -1)),
          d.value?.page ? (o(), l("a", {
            key: 0,
            href: d.value.page,
            target: "_blank",
            rel: "noopener"
          }, "Open the page", 8, qe)) : c("", !0),
          h[4] || (h[4] = s("p", { class: "hint" }, "You need a free Hugging Face account. The makers see your user name and e-mail.", -1))
        ]),
        s("li", null, [
          s("span", Je, a(x(L.value.token)), 1),
          h[5] || (h[5] = F(" Give this computer a token that may read it. ", -1)),
          d.value?.token_page ? (o(), l("a", {
            key: 0,
            href: d.value.token_page,
            target: "_blank",
            rel: "noopener"
          }, "Open the token page", 8, Ke)) : c("", !0),
          h[6] || (h[6] = s("p", { class: "hint" }, ' Create a token of type "Read" (or fine-grained with "Read access to contents of all public gated repos you can access"), then paste it here: ', -1)),
          s("form", {
            onSubmit: _e(D, ["prevent"])
          }, [
            ue(s("input", {
              "onUpdate:modelValue": h[1] || (h[1] = (I) => y.value = I),
              type: "password",
              autocomplete: "off",
              placeholder: "hf_…",
              "aria-label": "Hugging Face token"
            }, null, 512), [
              [Ce, y.value]
            ]),
            s("button", {
              type: "submit",
              disabled: k.value || !y.value.trim()
            }, "Save", 8, Ge)
          ], 32)
        ]),
        s("li", null, [
          s("span", We, a(L.value.pending ? "…" : "○"), 1),
          s("button", {
            class: "primary",
            disabled: k.value,
            onClick: m
          }, "Check and download", 8, Ze),
          L.value.pending ? (o(), l("p", Qe, "Your request is with the model's makers. This can take days.")) : c("", !0)
        ])
      ]),
      P.value ? (o(), l("p", Xe, a(P.value), 1)) : c("", !0)
    ]));
  }
}), tt = { class: "plenio-setup" }, nt = {
  key: 0,
  class: "version"
}, ot = { class: "steps" }, lt = ["onClick"], st = {
  key: 0,
  class: "error",
  role: "alert"
}, at = {
  key: 1,
  class: "hint"
}, it = { key: 2 }, rt = { class: "line" }, ut = { class: "hint" }, pt = {
  key: 0,
  class: "findings"
}, ct = ["onClick"], dt = ["href"], vt = {
  key: 1,
  class: "ok"
}, ft = { key: 3 }, ht = ["checked", "onChange"], yt = ["checked", "onChange"], gt = { key: 4 }, mt = { class: "line" }, bt = {
  key: 0,
  class: "warn"
}, kt = {
  key: 1,
  class: "warn"
}, xt = {
  key: 2,
  class: "warn"
}, wt = { class: "what" }, _t = ["value", "onChange"], Ct = ["value"], Tt = { class: "hint" }, $t = { class: "hint" }, St = {
  key: 3,
  class: "folders"
}, Pt = ["onUpdate:modelValue"], Ot = ["value"], Et = ["disabled"], Rt = { key: 5 }, jt = { class: "what" }, zt = { class: "hint" }, Nt = ["value"], Ut = { class: "hint" }, At = ["disabled", "onClick"], Ft = ["disabled"], Lt = { key: 6 }, Mt = ["src"], Dt = {
  key: 2,
  class: "findings"
}, It = ["disabled"], Bt = {
  key: 7,
  class: "home"
}, Ht = { class: "go" }, Vt = ["title", "onClick"], Yt = { class: "go two" }, qt = {
  key: 1,
  class: "recent"
}, Jt = ["onClick"], Kt = { class: "links" }, Gt = ["href"], Wt = {
  key: 8,
  class: "report",
  "aria-label": "Problem report"
}, Zt = { class: "go two" }, Qt = /* @__PURE__ */ ie({
  __name: "SetupPanel",
  props: {
    fetcher: {},
    onDownloads: { type: Function },
    openTemplate: { type: Function },
    openPlayer: { type: Function },
    openContinue: { type: Function },
    problemContext: { type: Function },
    focus: {}
  },
  setup(u) {
    const r = u, p = f(null), g = f(""), d = f(null), y = f(null), k = f({}), P = K({}), L = K({}), O = K({}), x = f("computer"), m = f(null), D = f(!1), v = f(null), h = K(/* @__PURE__ */ new Set());
    let I = null;
    const V = f([]), B = f(null);
    async function pe() {
      try {
        const t = r.problemContext();
        B.value = (await b.report(r.fetcher, t.workflow, t.error)).files;
      } catch (t) {
        m.value = z(t);
      }
    }
    async function ce() {
      try {
        const t = r.problemContext(), n = await b.reportZip(r.fetcher, t.workflow, t.error), e = document.createElement("a");
        e.href = URL.createObjectURL(n), e.download = "plenio-report.zip", e.click(), setTimeout(() => URL.revokeObjectURL(e.href), 1e4);
      } catch (t) {
        m.value = z(t);
      }
    }
    const Y = S(() => d.value ? ze(d.value, J.value) : null), de = S(() => Ne.filter((t) => Z.value.includes(t.template)));
    async function ee() {
      try {
        V.value = (await Re(r.fetcher)).filter((t) => t.audio).slice(0, 5);
      } catch {
        V.value = [];
      }
    }
    le(x, (t) => {
      t === "go" && ee();
    });
    const q = f(null), G = f(null), W = f(!1), _ = S(() => Ue(q.value, G.value));
    let te = !0;
    async function ve() {
      W.value = !0, G.value = null, q.value = null;
      try {
        let t = await b.testSong(r.fetcher);
        for (q.value = t; te && !["succeeded", "failed", "cancelled"].includes(t.status); )
          t = await b.job(r.fetcher, t.id), q.value = t;
      } catch (t) {
        G.value = t instanceof H ? { message: t.message, hint: t.hint } : { message: z(t) };
      } finally {
        W.value = !1;
      }
    }
    function z(t) {
      return t instanceof H ? t.hint ? `${t.message} ${t.hint}` : t.message : t instanceof Error ? t.message : String(t);
    }
    const J = S(() => p.value ? se(p.value) : []), N = S(
      () => d.value && p.value ? Ae(d.value, J.value, p.value.extras, L) : []
    ), M = S(() => Fe(N.value)), Z = S(() => (d.value?.templates ?? []).map((t) => t.template)), ne = S(() => d.value?.policy.offline || d.value?.policy.downloads === "off");
    async function fe() {
      try {
        const [t, n, e, i] = await Promise.all([
          b.state(r.fetcher),
          b.plan(r.fetcher),
          b.findings(r.fetcher),
          b.folders(r.fetcher)
        ]);
        p.value = t.state, g.value = t.version, d.value = n, y.value = e, k.value = i.folders;
        for (const C of n.downloads) O[C.id] = C;
        x.value = r.focus ? "plan" : je(t.state, N.value), m.value = null;
      } catch (t) {
        m.value = z(t);
      }
    }
    async function he() {
      try {
        d.value = await b.plan(r.fetcher);
      } catch (t) {
        m.value = z(t);
      }
    }
    async function Q(t) {
      try {
        const n = await b.saveState(r.fetcher, t);
        p.value = n.state;
      } catch (n) {
        m.value = z(n);
      }
    }
    function E(t) {
      x.value = t, Q({ step: t, ...t === "go" ? { done: !0 } : {} });
    }
    function ye(t, n) {
      if (!p.value) return;
      const e = new Set(se(p.value));
      n ? e.add(t) : e.delete(t), Q({ templates: Z.value.filter((i) => e.has(i)) });
    }
    function ge(t, n) {
      if (!p.value) return;
      const e = new Set(p.value.extras);
      n ? e.add(t) : e.delete(t), Q({ extras: ae.map((i) => i.id).filter((i) => e.has(i)) });
    }
    async function X(t) {
      if (t.length) {
        D.value = !0;
        try {
          const n = await b.download(r.fetcher, t, { ...P });
          for (const e of n.downloads) O[e.id] = e;
          m.value = null, x.value === "plan" && E("downloads");
        } catch (n) {
          m.value = z(n);
        } finally {
          D.value = !1;
        }
      }
    }
    async function me(t, n) {
      try {
        if (t === "download" || t === "retry") return await X([n]);
        if (t === "access") {
          v.value = n;
          return;
        }
        const e = { pause: b.pause, resume: b.resume, cancel: b.cancel }[t], i = await e(r.fetcher, n);
        O[i.download.id] = i.download;
      } catch (e) {
        m.value = z(e);
      }
    }
    const be = {
      download: "Download",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      retry: "Try again",
      access: "What to do"
    };
    function U(t) {
      const n = O[t.variant.id], e = t.variant.installed || h.has(t.variant.id);
      return Ie(e, n?.state === "installed" ? void 0 : n);
    }
    function ke() {
      const t = y.value?.computer, n = (t?.devices ?? []).filter((i) => i.kind !== "cpu").sort((i, C) => (C.total_bytes ?? 0) - (i.total_bytes ?? 0))[0];
      return [
        n ? `${n.name} · ${A(n.total_bytes ?? 0)}` : "no graphics card",
        t?.ram_total_bytes ? `${A(t.ram_total_bytes)} RAM` : "",
        t?.disk_free_bytes != null ? `${A(t.disk_free_bytes)} free on the models drive` : ""
      ].filter(Boolean).join(" · ");
    }
    const oe = S(() => (y.value?.findings ?? []).filter((t) => t.severity !== "ok")), xe = S(() => N.value.length > 0 && N.value.every((t) => t.variant.installed || h.has(t.variant.id)));
    function we(t) {
      navigator.clipboard?.writeText(t);
    }
    return le(
      () => Object.values(O).map((t) => t.state).join(","),
      (t, n) => {
        t !== n && t.includes("installed") && he();
      }
    ), re(() => {
      I = r.onDownloads((t) => {
        O[t.id] = t, t.state === "installed" ? h.add(t.id) : h.delete(t.id);
      }), fe().then(() => {
        x.value === "go" && ee();
      });
    }), Te(() => {
      te = !1, I?.();
    }), (t, n) => (o(), l("div", tt, [
      s("header", null, [
        n[13] || (n[13] = s("h2", null, "Plenio Setup", -1)),
        g.value ? (o(), l("span", nt, a(g.value), 1)) : c("", !0)
      ]),
      s("nav", ot, [
        (o(!0), l(w, null, T(R(Me), (e, i) => (o(), l("button", {
          key: e,
          class: j({ current: x.value === e }),
          onClick: (C) => E(e)
        }, a(i + 1) + " " + a(R(Le)[e]), 11, lt))), 128))
      ]),
      m.value ? (o(), l("p", st, a(m.value), 1)) : c("", !0),
      !p.value && !m.value ? (o(), l("p", at, "Reading this computer…")) : c("", !0),
      p.value && x.value === "computer" ? (o(), l("section", it, [
        s("p", rt, a(ke()), 1),
        s("p", ut, "ComfyUI " + a(y.value?.computer.comfyui) + " · " + a(y.value?.computer.platform), 1),
        oe.value.length ? (o(), l("ul", pt, [
          (o(!0), l(w, null, T(oe.value, (e) => (o(), l("li", {
            key: e.id + e.text,
            class: j(e.severity)
          }, [
            s("span", null, a(e.text), 1),
            e.fix?.action === "copy" ? (o(), l("button", {
              key: 0,
              onClick: (i) => we(e.fix.payload.text)
            }, a(e.fix.label), 9, ct)) : e.fix?.action === "open_url" ? (o(), l("a", {
              key: 1,
              href: e.fix.payload.url,
              target: "_blank",
              rel: "noopener"
            }, a(e.fix.label), 9, dt)) : c("", !0)
          ], 2))), 128))
        ])) : (o(), l("p", vt, "Nothing on this computer needs attention.")),
        s("button", {
          class: "primary",
          onClick: n[0] || (n[0] = (e) => E("wants"))
        }, "Next")
      ])) : c("", !0),
      p.value && x.value === "wants" ? (o(), l("section", ft, [
        n[14] || (n[14] = s("p", { class: "hint" }, "Setup plans the files for what you tick. You can change it later.", -1)),
        (o(!0), l(w, null, T(Z.value, (e) => (o(), l("label", {
          key: e,
          class: "choice"
        }, [
          s("input", {
            type: "checkbox",
            checked: J.value.includes(e),
            onChange: (i) => ye(e, i.target.checked)
          }, null, 40, ht),
          F(" " + a(e), 1)
        ]))), 128)),
        n[15] || (n[15] = s("p", { class: "hint" }, "Optional parts of these templates:", -1)),
        (o(!0), l(w, null, T(R(ae), (e) => (o(), l("label", {
          key: e.id,
          class: "choice"
        }, [
          s("input", {
            type: "checkbox",
            checked: p.value.extras.includes(e.id),
            onChange: (i) => ge(e.id, i.target.checked)
          }, null, 40, yt),
          F(" " + a(e.label), 1)
        ]))), 128)),
        s("button", {
          class: "primary",
          onClick: n[1] || (n[1] = (e) => E("plan"))
        }, "Next")
      ])) : c("", !0),
      p.value && x.value === "plan" ? (o(), l("section", gt, [
        s("p", mt, a(N.value.length) + " files · " + a(M.value.files) + " to download · " + a(R(A)(M.value.bytes)), 1),
        M.value.nonCommercial.length ? (o(), l("p", bt, "Non-commercial licence: " + a(M.value.nonCommercial.join(", ")) + ".", 1)) : c("", !0),
        d.value?.policy.offline ? (o(), l("p", kt, "Offline mode is on: Setup fetches nothing. Place the files as each row says.")) : d.value?.policy.downloads === "off" ? (o(), l("p", xt, "Downloads are switched off in config.toml ([models] downloads).")) : c("", !0),
        (o(!0), l(w, null, T(N.value, (e) => (o(), l("div", {
          key: e.component,
          class: j(["row", { focus: u.focus === e.component }])
        }, [
          s("div", wt, [
            s("strong", null, a(e.title), 1),
            e.variants.length > 1 ? (o(), l("select", {
              key: 0,
              value: e.variant.id,
              onChange: (i) => L[e.component] = i.target.value
            }, [
              (o(!0), l(w, null, T(e.variants, (i) => (o(), l("option", {
                key: i.id,
                value: i.id
              }, a(i.file) + " · " + a(R(A)(i.bytes)) + a(i.id === e.planned ? " (the plan)" : ""), 9, Ct))), 128))
            ], 40, _t)) : c("", !0),
            s("span", Tt, [
              F(a(e.reason), 1),
              e.warning ? (o(), l(w, { key: 0 }, [
                F(" - " + a(e.warning), 1)
              ], 64)) : c("", !0)
            ]),
            s("span", $t, "models/" + a(e.folder) + " · " + a(e.variant.licence) + " · " + a(R(A)(e.variant.bytes)), 1)
          ]),
          s("span", {
            class: j(["state", U(e).tone])
          }, a(U(e).status), 3)
        ], 2))), 128)),
        Object.keys(k.value).length ? (o(), l("details", St, [
          n[16] || (n[16] = s("summary", null, "Where the files go", -1)),
          (o(!0), l(w, null, T(k.value, (e, i) => (o(), l("label", {
            key: i,
            class: "folder"
          }, [
            s("span", null, "models/" + a(i), 1),
            ue(s("select", {
              "onUpdate:modelValue": (C) => P[i] = C
            }, [
              (o(!0), l(w, null, T(e, (C) => (o(), l("option", {
                key: C.path,
                value: C.path
              }, a(C.path) + a(C.free_bytes != null ? ` · ${R(A)(C.free_bytes)} free` : ""), 9, Ot))), 128))
            ], 8, Pt), [
              [Se, P[i]]
            ])
          ]))), 128))
        ])) : c("", !0),
        s("button", {
          class: "primary",
          disabled: D.value || ne.value || M.value.files === 0,
          onClick: n[2] || (n[2] = (e) => X(N.value.filter((i) => !i.variant.installed).map((i) => i.variant.id)))
        }, " Download all (" + a(R(A)(M.value.bytes)) + ") ", 9, Et),
        M.value.files === 0 ? (o(), l("button", {
          key: 4,
          class: "primary",
          onClick: n[3] || (n[3] = (e) => E("test"))
        }, "Next")) : c("", !0)
      ])) : c("", !0),
      p.value && x.value === "downloads" ? (o(), l("section", Rt, [
        (o(!0), l(w, null, T(N.value, (e) => (o(), l("div", {
          key: e.component,
          class: "row"
        }, [
          s("div", jt, [
            s("strong", null, a(e.title), 1),
            s("span", zt, a(e.variant.file), 1),
            U(e).progress !== null ? (o(), l("progress", {
              key: 0,
              value: U(e).progress ?? 0,
              max: "1"
            }, null, 8, Nt)) : c("", !0),
            s("span", Ut, a(U(e).detail), 1)
          ]),
          s("span", {
            class: j(["state", U(e).tone])
          }, a(U(e).status), 3),
          (o(!0), l(w, null, T(U(e).actions, (i) => (o(), l("button", {
            key: i,
            disabled: ne.value && (i === "download" || i === "retry"),
            onClick: (C) => me(i, e.variant.id)
          }, a(be[i]), 9, At))), 128))
        ]))), 128)),
        s("button", {
          class: "primary",
          disabled: !xe.value,
          onClick: n[4] || (n[4] = (e) => E("test"))
        }, "Next", 8, Ft)
      ])) : c("", !0),
      p.value && x.value === "test" ? (o(), l("section", Lt, [
        n[17] || (n[17] = s("p", null, " The test song makes a one-minute instrumental with 1 · YuE2 · Song and your files - no cover art, no HQ - so that a problem shows here, not in your first song. ", -1)),
        _.value.text ? (o(), l("p", {
          key: 0,
          class: j(_.value.state === "ok" ? "ok" : _.value.state === "failed" ? "error" : "hint")
        }, a(_.value.text), 3)) : c("", !0),
        _.value.audio ? (o(), l("audio", {
          key: 1,
          src: _.value.audio,
          controls: "",
          preload: "none"
        }, null, 8, Mt)) : c("", !0),
        _.value.finding ? (o(), l("ul", Dt, [
          s("li", {
            class: j(_.value.finding.severity)
          }, [
            s("span", null, a(_.value.finding.text), 1),
            _.value.finding.fix ? (o(), l("button", {
              key: 0,
              onClick: n[5] || (n[5] = (e) => E("plan"))
            }, a(_.value.finding.fix.label), 1)) : c("", !0)
          ], 2)
        ])) : c("", !0),
        _.value.state !== "running" ? (o(), l("button", {
          key: 3,
          class: "primary",
          disabled: W.value,
          onClick: ve
        }, a(_.value.state === "idle" ? "Make the test song" : "Make it again"), 9, It)) : c("", !0),
        s("button", {
          onClick: n[6] || (n[6] = (e) => E("go"))
        }, a(_.value.state === "ok" ? "Next" : "Skip"), 1)
      ])) : c("", !0),
      p.value && x.value === "go" ? (o(), l("section", Bt, [
        Y.value ? (o(), l("p", {
          key: 0,
          class: j(Y.value.ready ? "ok" : "warn")
        }, [
          F(a(Y.value.ready ? "Everything ready ✓" : "Files are missing") + " · " + a(Y.value.line) + " ", 1),
          s("button", {
            class: "link",
            onClick: n[7] || (n[7] = (e) => E("plan"))
          }, "Manage")
        ], 2)) : c("", !0),
        s("div", Ht, [
          (o(!0), l(w, null, T(de.value, (e) => (o(), l("button", {
            key: e.template,
            class: j({ primary: J.value.includes(e.template) }),
            title: e.template,
            onClick: (i) => u.openTemplate(e.template)
          }, a(e.label), 11, Vt))), 128))
        ]),
        s("div", Yt, [
          s("button", {
            onClick: n[8] || (n[8] = (e) => u.openPlayer())
          }, "Open the player"),
          s("button", {
            onClick: n[9] || (n[9] = (e) => u.openContinue())
          }, "Continue a song…")
        ]),
        V.value.length ? (o(), l("div", qt, [
          n[18] || (n[18] = s("span", { class: "hint" }, "Recent songs", -1)),
          (o(!0), l(w, null, T(V.value, (e) => (o(), l("button", {
            key: e.path,
            class: "link",
            onClick: (i) => u.openPlayer(e.path)
          }, "▶ " + a(e.title), 9, Jt))), 128))
        ])) : c("", !0),
        s("nav", Kt, [
          (o(!0), l(w, null, T(R(De), (e) => (o(), l("a", {
            key: e.label,
            href: e.url,
            target: "_blank",
            rel: "noopener"
          }, a(e.label), 9, Gt))), 128))
        ])
      ])) : c("", !0),
      B.value ? (o(), l("section", Wt, [
        n[19] || (n[19] = s("p", null, [
          s("strong", null, "Problem report"),
          F(" - what the zip holds. Paths keep their last two parts, your user name is replaced, the workflow's texts are empty. Attach the zip to an issue. ")
        ], -1)),
        (o(!0), l(w, null, T(B.value, (e, i) => (o(), l("details", { key: i }, [
          s("summary", null, a(i), 1),
          s("pre", null, a(e), 1)
        ]))), 128)),
        s("div", Zt, [
          s("button", {
            class: "primary",
            onClick: ce
          }, "Save the zip"),
          s("button", {
            onClick: n[10] || (n[10] = (e) => B.value = null)
          }, "Close")
        ])
      ])) : c("", !0),
      p.value && !B.value ? (o(), l("button", {
        key: 9,
        class: "link report-button",
        onClick: pe
      }, "Report a problem…")) : c("", !0),
      v.value ? (o(), $e(et, {
        key: 10,
        fetcher: u.fetcher,
        variant: v.value,
        onClose: n[11] || (n[11] = (e) => v.value = null),
        onReady: n[12] || (n[12] = (e) => {
          v.value = null, X([e]);
        })
      }, null, 8, ["fetcher", "variant"])) : c("", !0)
    ]));
  }
});
function Xt() {
  if (document.getElementById("plenio-setup-styles")) return;
  const u = document.createElement("style");
  u.id = "plenio-setup-styles", u.textContent = Be, document.head.append(u);
}
function nn(u, r, p = null) {
  Xt();
  const g = f(p), d = f(0), y = Pe({
    render: () => Oe(Qt, {
      key: d.value,
      fetcher: r.fetcher,
      onDownloads: r.onDownloads,
      openTemplate: r.openTemplate,
      openPlayer: r.openPlayer,
      openContinue: r.openContinue,
      problemContext: r.problemContext,
      focus: g.value
    })
  });
  return y.mount(u), {
    focus(k) {
      g.value = k, d.value += 1;
    },
    unmount: () => y.unmount()
  };
}
export {
  nn as mountSetup
};
