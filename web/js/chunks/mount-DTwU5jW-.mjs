import { d as fe, o as he, c as s, b as o, t as a, e as c, j as S, f as ye, w as le, v as me, g as v, h as E, i as l, l as ce, a as Ae, F as x, r as C, u as A, n as D, m as De, p as G, q as Ne, k as Ue, s as ze } from "./runtime-dom.esm-bundler-BuebSeFB.mjs";
import { P as H, a as Ie, l as Le, s as Me, f as z, h as Fe, H as Be, t as Ve, w as de, b as He, c as We, S as qe, d as Ye, E as ve, e as Je, r as Ke } from "./main-qMTRrf7A.mjs";
const Ge = ".plenio-setup{display:flex;flex-direction:column;gap:10px;padding:12px;font-size:13px;color:var(--fg-color, #ddd);overflow-y:auto;height:100%;box-sizing:border-box}.plenio-setup header{display:flex;align-items:baseline;gap:8px}.plenio-setup h2{margin:0;font-size:16px}.plenio-setup .version,.plenio-setup .hint{color:var(--descrip-text, #999);font-size:12px}.plenio-setup .steps{display:flex;flex-wrap:wrap;gap:4px}.plenio-setup .steps button{font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid var(--border-color, #555);background:none;color:inherit;cursor:pointer}.plenio-setup .steps button.current{background:var(--comfy-menu-secondary-bg, #333);font-weight:600}.plenio-setup section{display:flex;flex-direction:column;gap:8px}.plenio-setup button{padding:4px 12px;border-radius:6px;border:1px solid var(--border-color, #555);background:var(--comfy-input-bg, #222);color:inherit;cursor:pointer}.plenio-setup button:disabled{opacity:.5;cursor:default}.plenio-setup button.primary{align-self:flex-start;background:var(--p-primary-color, #3b82f6);border-color:transparent;color:var(--p-primary-contrast-color, #fff)}.plenio-setup .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px;border:1px solid var(--border-color, #444);border-radius:6px}.plenio-setup .row.focus{border-color:var(--p-primary-color, #3b82f6)}.plenio-setup .row .what{display:flex;flex-direction:column;gap:2px;flex:1 1 200px;min-width:0}.plenio-setup .row progress{width:100%}.plenio-setup .state.ok{color:#4ade80}.plenio-setup .state.warn,.plenio-setup .warn{color:#fbbf24}.plenio-setup .state.error,.plenio-setup .error{color:#f87171}.plenio-setup .ok{color:#4ade80}.plenio-setup .findings{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:6px}.plenio-setup .choice,.plenio-setup .folder{display:flex;gap:6px;align-items:center}.plenio-setup select{max-width:100%;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px}.plenio-setup .go{display:flex;flex-direction:column;gap:6px}.plenio-access{border:1px solid var(--p-primary-color, #3b82f6);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px}.plenio-access header{display:flex;justify-content:space-between}.plenio-access .close{background:none;border:none;font-size:18px}.plenio-access ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px}.plenio-access .mark{display:inline-block;width:1.2em}.plenio-access form{display:flex;gap:6px}.plenio-access input{flex:1;min-width:0;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px;padding:3px 6px}.plenio-setup audio{width:100%}.plenio-setup .go.two{flex-direction:row;flex-wrap:wrap}.plenio-setup .go button{text-align:left}.plenio-setup .recent{display:flex;flex-direction:column;gap:2px}.plenio-setup .links{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px}.plenio-setup .links a{color:var(--p-primary-color, #60a5fa)}.plenio-setup button.link{background:none;border:none;padding:0 2px;color:var(--p-primary-color, #60a5fa);text-align:left}.plenio-setup .report pre{white-space:pre-wrap;max-height:240px;overflow:auto;font-size:11px;background:var(--comfy-input-bg, #1a1a1a);padding:6px}.plenio-setup .report-button{align-self:flex-start;font-size:12px}.plenio-setup .access code{word-break:break-all;user-select:all}.plenio-setup .access input{flex:1;min-width:0;background:var(--comfy-input-bg, #222);color:inherit;border:1px solid var(--border-color, #555);border-radius:4px;padding:3px 6px}.plenio-setup .tokens{margin:0;padding-left:16px}";
async function k(r, i, p = "GET", b) {
  const d = await r.fetchApi(i, {
    method: p,
    ...b === void 0 ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }
  }), g = await d.json().catch(() => ({}));
  if (!d.ok) {
    const w = g?.error ?? {};
    throw new H(w.message ?? `Request failed (${d.status})`, w.hint ?? null);
  }
  return g;
}
const m = {
  plan: (r) => k(r, "/plenio/setup/plan"),
  state: (r) => k(r, "/plenio/setup/state"),
  saveState: (r, i) => k(r, "/plenio/setup/state", "POST", i),
  findings: (r) => k(r, "/plenio/setup/findings"),
  folders: (r) => k(r, "/plenio/setup/folders"),
  download: (r, i, p = {}) => k(r, "/plenio/setup/downloads", "POST", { variants: i, folders: p }),
  pause: (r, i) => k(r, `/plenio/setup/downloads/${encodeURIComponent(i)}/pause`, "POST", {}),
  resume: (r, i) => k(r, `/plenio/setup/downloads/${encodeURIComponent(i)}/resume`, "POST", {}),
  cancel: (r, i) => k(r, `/plenio/setup/downloads/${encodeURIComponent(i)}`, "DELETE"),
  check: (r, i) => k(r, "/plenio/setup/check", "POST", { variant: i }),
  saveToken: (r, i) => k(r, "/plenio/setup/hub-token", "POST", { token: i }),
  report: (r, i, p) => k(r, "/plenio/setup/report", "POST", { workflow: i, error: p }),
  reportZip: async (r, i, p) => {
    const b = await r.fetchApi("/plenio/setup/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflow: i, error: p, download: !0 })
    });
    if (!b.ok) throw new H(`The report could not be made (${b.status})`);
    return b.blob();
  },
  tokens: (r) => k(r, "/plenio/setup/tokens"),
  makeToken: (r, i) => k(r, "/plenio/setup/tokens", "POST", { name: i }),
  revokeToken: (r, i) => k(r, `/plenio/setup/tokens/${encodeURIComponent(i)}`, "DELETE"),
  testSong: (r) => k(r, "/plenio/setup/test-song", "POST", {}),
  job: (r, i) => k(r, `/plenio/api/v1/jobs/${encodeURIComponent(i)}?wait=20`)
}, Ze = {
  class: "plenio-access",
  role: "dialog",
  "aria-label": "This model needs your OK on Hugging Face"
}, Qe = {
  key: 0,
  class: "hint"
}, Xe = { class: "mark" }, et = ["href"], tt = { class: "mark" }, nt = ["href"], ot = ["disabled"], lt = { class: "mark" }, st = ["disabled"], at = {
  key: 0,
  class: "hint"
}, it = {
  key: 1,
  class: "error",
  role: "alert"
}, rt = /* @__PURE__ */ fe({
  __name: "AccessDialog",
  props: {
    fetcher: {},
    variant: {}
  },
  emits: ["close", "ready"],
  setup(r, { emit: i }) {
    const p = r, b = i, d = v(null), g = v(""), w = v(!1), O = v(null), I = E(() => Ie(d.value));
    function R(f) {
      return f instanceof H ? f.hint ? `${f.message} ${f.hint}` : f.message : f instanceof Error ? f.message : String(f);
    }
    function _(f) {
      return f === !0 ? "✓" : f === !1 ? "✕" : "○";
    }
    async function h() {
      w.value = !0;
      try {
        d.value = await m.check(p.fetcher, p.variant), O.value = null, d.value.step === "ready" && b("ready", p.variant);
      } catch (f) {
        O.value = R(f);
      } finally {
        w.value = !1;
      }
    }
    async function M() {
      w.value = !0;
      try {
        await m.saveToken(p.fetcher, g.value.trim()), g.value = "", O.value = null;
      } catch (f) {
        O.value = R(f);
      } finally {
        w.value = !1;
      }
      await h();
    }
    return he(() => {
      h();
    }), (f, y) => (l(), s("div", Ze, [
      o("header", null, [
        y[2] || (y[2] = o("strong", null, "This model needs your OK on Hugging Face", -1)),
        o("button", {
          class: "close",
          "aria-label": "Close",
          onClick: y[0] || (y[0] = (F) => b("close"))
        }, "×")
      ]),
      d.value && d.value.step !== "ready" ? (l(), s("p", Qe, a(d.value.message), 1)) : c("", !0),
      o("ol", null, [
        o("li", null, [
          o("span", Xe, a(_(I.value.accept)), 1),
          y[3] || (y[3] = S(" Open the model's page and accept its terms. ", -1)),
          d.value?.page ? (l(), s("a", {
            key: 0,
            href: d.value.page,
            target: "_blank",
            rel: "noopener"
          }, "Open the page", 8, et)) : c("", !0),
          y[4] || (y[4] = o("p", { class: "hint" }, "You need a free Hugging Face account. The makers see your user name and e-mail.", -1))
        ]),
        o("li", null, [
          o("span", tt, a(_(I.value.token)), 1),
          y[5] || (y[5] = S(" Give this computer a token that may read it. ", -1)),
          d.value?.token_page ? (l(), s("a", {
            key: 0,
            href: d.value.token_page,
            target: "_blank",
            rel: "noopener"
          }, "Open the token page", 8, nt)) : c("", !0),
          y[6] || (y[6] = o("p", { class: "hint" }, ' Create a token of type "Read" (or fine-grained with "Read access to contents of all public gated repos you can access"), then paste it here: ', -1)),
          o("form", {
            onSubmit: ye(M, ["prevent"])
          }, [
            le(o("input", {
              "onUpdate:modelValue": y[1] || (y[1] = (F) => g.value = F),
              type: "password",
              autocomplete: "off",
              placeholder: "hf_…",
              "aria-label": "Hugging Face token"
            }, null, 512), [
              [me, g.value]
            ]),
            o("button", {
              type: "submit",
              disabled: w.value || !g.value.trim()
            }, "Save", 8, ot)
          ], 32)
        ]),
        o("li", null, [
          o("span", lt, a(I.value.pending ? "…" : "○"), 1),
          o("button", {
            class: "primary",
            disabled: w.value,
            onClick: h
          }, "Check and download", 8, st),
          I.value.pending ? (l(), s("p", at, "Your request is with the model's makers. This can take days.")) : c("", !0)
        ])
      ]),
      O.value ? (l(), s("p", it, a(O.value), 1)) : c("", !0)
    ]));
  }
}), ut = { class: "plenio-setup" }, pt = {
  key: 0,
  class: "version"
}, ct = { class: "steps" }, dt = ["onClick"], vt = {
  key: 0,
  class: "error",
  role: "alert"
}, ft = {
  key: 1,
  class: "hint"
}, ht = { key: 2 }, yt = { class: "line" }, mt = { class: "hint" }, gt = {
  key: 0,
  class: "findings"
}, kt = ["onClick"], bt = ["href"], xt = {
  key: 1,
  class: "ok"
}, wt = { key: 3 }, _t = ["checked", "onChange"], Ct = ["checked", "onChange"], Tt = { key: 4 }, $t = { class: "line" }, St = {
  key: 0,
  class: "warn"
}, Pt = {
  key: 1,
  class: "warn"
}, Et = {
  key: 2,
  class: "warn"
}, Ot = { class: "what" }, Rt = ["value", "onChange"], jt = ["value"], At = { class: "hint" }, Dt = { class: "hint" }, Nt = {
  key: 3,
  class: "folders"
}, Ut = ["onUpdate:modelValue"], zt = ["value"], It = ["disabled"], Lt = { key: 5 }, Mt = { class: "what" }, Ft = { class: "hint" }, Bt = ["value"], Vt = { class: "hint" }, Ht = ["disabled", "onClick"], Wt = ["disabled"], qt = { key: 6 }, Yt = ["src"], Jt = {
  key: 2,
  class: "findings"
}, Kt = ["disabled"], Gt = {
  key: 7,
  class: "home"
}, Zt = { class: "go" }, Qt = ["title", "onClick"], Xt = { class: "go two" }, en = {
  key: 1,
  class: "recent"
}, tn = ["onClick"], nn = { class: "hint" }, on = {
  key: 0,
  class: "warn"
}, ln = { class: "tokens" }, sn = ["onClick"], an = ["disabled"], rn = { class: "links" }, un = ["href"], pn = {
  key: 8,
  class: "report",
  "aria-label": "Problem report"
}, cn = { class: "go two" }, dn = /* @__PURE__ */ fe({
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
  setup(r) {
    const i = r, p = v(null), b = v(""), d = v(null), g = v(null), w = v({}), O = G({}), I = G({}), R = G({}), _ = v("computer"), h = v(null), M = v(!1), f = v(null), y = G(/* @__PURE__ */ new Set());
    let F = null;
    const W = v([]), B = v(null), se = v([]), Z = v(""), V = v(""), q = v(null);
    async function Q() {
      try {
        const t = await m.tokens(i.fetcher);
        se.value = t.tokens, Z.value = t.remote;
      } catch (t) {
        h.value = P(t);
      }
    }
    async function ge() {
      try {
        const t = await m.makeToken(i.fetcher, V.value);
        q.value = t.token, V.value = "", await Q();
      } catch (t) {
        h.value = P(t);
      }
    }
    async function ke(t) {
      try {
        await m.revokeToken(i.fetcher, t), await Q();
      } catch (n) {
        h.value = P(n);
      }
    }
    function ae(t) {
      return t ? new Date(t * 1e3).toLocaleString() : "never";
    }
    async function be() {
      try {
        const t = i.problemContext();
        B.value = (await m.report(i.fetcher, t.workflow, t.error)).files;
      } catch (t) {
        h.value = P(t);
      }
    }
    async function xe() {
      try {
        const t = i.problemContext(), n = await m.reportZip(i.fetcher, t.workflow, t.error), e = document.createElement("a");
        e.href = URL.createObjectURL(n), e.download = "plenio-report.zip", e.click(), setTimeout(() => URL.revokeObjectURL(e.href), 1e4);
      } catch (t) {
        h.value = P(t);
      }
    }
    const Y = E(() => d.value ? Fe(d.value, K.value) : null), we = E(() => Be.filter((t) => te.value.includes(t.template)));
    async function ie() {
      try {
        W.value = (await Le(i.fetcher)).filter((t) => t.audio).slice(0, 5);
      } catch {
        W.value = [];
      }
    }
    ce(_, (t) => {
      t === "go" && ie();
    });
    const J = v(null), X = v(null), ee = v(!1), T = E(() => Ve(J.value, X.value));
    let re = !0;
    async function _e() {
      ee.value = !0, X.value = null, J.value = null;
      try {
        let t = await m.testSong(i.fetcher);
        for (J.value = t; re && !["succeeded", "failed", "cancelled"].includes(t.status); )
          t = await m.job(i.fetcher, t.id), J.value = t;
      } catch (t) {
        X.value = t instanceof H ? { message: t.message, hint: t.hint } : { message: P(t) };
      } finally {
        ee.value = !1;
      }
    }
    function P(t) {
      return t instanceof H ? t.hint ? `${t.message} ${t.hint}` : t.message : t instanceof Error ? t.message : String(t);
    }
    const K = E(() => p.value ? de(p.value) : []), N = E(
      () => d.value && p.value ? He(d.value, K.value, p.value.extras, I) : []
    ), L = E(() => We(N.value)), te = E(() => (d.value?.templates ?? []).map((t) => t.template)), ue = E(() => d.value?.policy.offline || d.value?.policy.downloads === "off");
    async function Ce() {
      try {
        const [t, n, e, u] = await Promise.all([
          m.state(i.fetcher),
          m.plan(i.fetcher),
          m.findings(i.fetcher),
          m.folders(i.fetcher)
        ]);
        p.value = t.state, b.value = t.version, d.value = n, g.value = e, w.value = u.folders;
        for (const $ of n.downloads) R[$.id] = $;
        _.value = i.focus ? "plan" : Me(t.state, N.value), h.value = null;
      } catch (t) {
        h.value = P(t);
      }
    }
    async function Te() {
      try {
        d.value = await m.plan(i.fetcher);
      } catch (t) {
        h.value = P(t);
      }
    }
    async function ne(t) {
      try {
        const n = await m.saveState(i.fetcher, t);
        p.value = n.state;
      } catch (n) {
        h.value = P(n);
      }
    }
    function j(t) {
      _.value = t, ne({ step: t, ...t === "go" ? { done: !0 } : {} });
    }
    function $e(t, n) {
      if (!p.value) return;
      const e = new Set(de(p.value));
      n ? e.add(t) : e.delete(t), ne({ templates: te.value.filter((u) => e.has(u)) });
    }
    function Se(t, n) {
      if (!p.value) return;
      const e = new Set(p.value.extras);
      n ? e.add(t) : e.delete(t), ne({ extras: ve.map((u) => u.id).filter((u) => e.has(u)) });
    }
    async function oe(t) {
      if (t.length) {
        M.value = !0;
        try {
          const n = await m.download(i.fetcher, t, { ...O });
          for (const e of n.downloads) R[e.id] = e;
          h.value = null, _.value === "plan" && j("downloads");
        } catch (n) {
          h.value = P(n);
        } finally {
          M.value = !1;
        }
      }
    }
    async function Pe(t, n) {
      try {
        if (t === "download" || t === "retry") return await oe([n]);
        if (t === "access") {
          f.value = n;
          return;
        }
        const e = { pause: m.pause, resume: m.resume, cancel: m.cancel }[t], u = await e(i.fetcher, n);
        R[u.download.id] = u.download;
      } catch (e) {
        h.value = P(e);
      }
    }
    const Ee = {
      download: "Download",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      retry: "Try again",
      access: "What to do"
    };
    function U(t) {
      const n = R[t.variant.id], e = t.variant.installed || y.has(t.variant.id);
      return Ke(e, n?.state === "installed" ? void 0 : n);
    }
    function Oe() {
      const t = g.value?.computer, n = (t?.devices ?? []).filter((u) => u.kind !== "cpu").sort((u, $) => ($.total_bytes ?? 0) - (u.total_bytes ?? 0))[0];
      return [
        n ? `${n.name} · ${z(n.total_bytes ?? 0)}` : "no graphics card",
        t?.ram_total_bytes ? `${z(t.ram_total_bytes)} RAM` : "",
        t?.disk_free_bytes != null ? `${z(t.disk_free_bytes)} free on the models drive` : ""
      ].filter(Boolean).join(" · ");
    }
    const pe = E(() => (g.value?.findings ?? []).filter((t) => t.severity !== "ok")), Re = E(() => N.value.length > 0 && N.value.every((t) => t.variant.installed || y.has(t.variant.id)));
    function je(t) {
      navigator.clipboard?.writeText(t);
    }
    return ce(
      () => Object.values(R).map((t) => t.state).join(","),
      (t, n) => {
        t !== n && t.includes("installed") && Te();
      }
    ), he(() => {
      F = i.onDownloads((t) => {
        R[t.id] = t, t.state === "installed" ? y.add(t.id) : y.delete(t.id);
      }), Ce().then(() => {
        _.value === "go" && ie();
      });
    }), Ae(() => {
      re = !1, F?.();
    }), (t, n) => (l(), s("div", ut, [
      o("header", null, [
        n[15] || (n[15] = o("h2", null, "Plenio Setup", -1)),
        b.value ? (l(), s("span", pt, a(b.value), 1)) : c("", !0)
      ]),
      o("nav", ct, [
        (l(!0), s(x, null, C(A(Ye), (e, u) => (l(), s("button", {
          key: e,
          class: D({ current: _.value === e }),
          onClick: ($) => j(e)
        }, a(u + 1) + " " + a(A(qe)[e]), 11, dt))), 128))
      ]),
      h.value ? (l(), s("p", vt, a(h.value), 1)) : c("", !0),
      !p.value && !h.value ? (l(), s("p", ft, "Reading this computer…")) : c("", !0),
      p.value && _.value === "computer" ? (l(), s("section", ht, [
        o("p", yt, a(Oe()), 1),
        o("p", mt, "ComfyUI " + a(g.value?.computer.comfyui) + " · " + a(g.value?.computer.platform), 1),
        pe.value.length ? (l(), s("ul", gt, [
          (l(!0), s(x, null, C(pe.value, (e) => (l(), s("li", {
            key: e.id + e.text,
            class: D(e.severity)
          }, [
            o("span", null, a(e.text), 1),
            e.fix?.action === "copy" ? (l(), s("button", {
              key: 0,
              onClick: (u) => je(e.fix.payload.text)
            }, a(e.fix.label), 9, kt)) : e.fix?.action === "open_url" ? (l(), s("a", {
              key: 1,
              href: e.fix.payload.url,
              target: "_blank",
              rel: "noopener"
            }, a(e.fix.label), 9, bt)) : c("", !0)
          ], 2))), 128))
        ])) : (l(), s("p", xt, "Nothing on this computer needs attention.")),
        o("button", {
          class: "primary",
          onClick: n[0] || (n[0] = (e) => j("wants"))
        }, "Next")
      ])) : c("", !0),
      p.value && _.value === "wants" ? (l(), s("section", wt, [
        n[16] || (n[16] = o("p", { class: "hint" }, "Setup plans the files for what you tick. You can change it later.", -1)),
        (l(!0), s(x, null, C(te.value, (e) => (l(), s("label", {
          key: e,
          class: "choice"
        }, [
          o("input", {
            type: "checkbox",
            checked: K.value.includes(e),
            onChange: (u) => $e(e, u.target.checked)
          }, null, 40, _t),
          S(" " + a(e), 1)
        ]))), 128)),
        n[17] || (n[17] = o("p", { class: "hint" }, "Optional parts of these templates:", -1)),
        (l(!0), s(x, null, C(A(ve), (e) => (l(), s("label", {
          key: e.id,
          class: "choice"
        }, [
          o("input", {
            type: "checkbox",
            checked: p.value.extras.includes(e.id),
            onChange: (u) => Se(e.id, u.target.checked)
          }, null, 40, Ct),
          S(" " + a(e.label), 1)
        ]))), 128)),
        o("button", {
          class: "primary",
          onClick: n[1] || (n[1] = (e) => j("plan"))
        }, "Next")
      ])) : c("", !0),
      p.value && _.value === "plan" ? (l(), s("section", Tt, [
        o("p", $t, a(N.value.length) + " files · " + a(L.value.files) + " to download · " + a(A(z)(L.value.bytes)), 1),
        L.value.nonCommercial.length ? (l(), s("p", St, "Non-commercial licence: " + a(L.value.nonCommercial.join(", ")) + ".", 1)) : c("", !0),
        d.value?.policy.offline ? (l(), s("p", Pt, "Offline mode is on: Setup fetches nothing. Place the files as each row says.")) : d.value?.policy.downloads === "off" ? (l(), s("p", Et, "Downloads are switched off in config.toml ([models] downloads).")) : c("", !0),
        (l(!0), s(x, null, C(N.value, (e) => (l(), s("div", {
          key: e.component,
          class: D(["row", { focus: r.focus === e.component }])
        }, [
          o("div", Ot, [
            o("strong", null, a(e.title), 1),
            e.variants.length > 1 ? (l(), s("select", {
              key: 0,
              value: e.variant.id,
              onChange: (u) => I[e.component] = u.target.value
            }, [
              (l(!0), s(x, null, C(e.variants, (u) => (l(), s("option", {
                key: u.id,
                value: u.id
              }, a(u.file) + " · " + a(A(z)(u.bytes)) + a(u.id === e.planned ? " (the plan)" : ""), 9, jt))), 128))
            ], 40, Rt)) : c("", !0),
            o("span", At, [
              S(a(e.reason), 1),
              e.warning ? (l(), s(x, { key: 0 }, [
                S(" - " + a(e.warning), 1)
              ], 64)) : c("", !0)
            ]),
            o("span", Dt, "models/" + a(e.folder) + " · " + a(e.variant.licence) + " · " + a(A(z)(e.variant.bytes)), 1)
          ]),
          o("span", {
            class: D(["state", U(e).tone])
          }, a(U(e).status), 3)
        ], 2))), 128)),
        Object.keys(w.value).length ? (l(), s("details", Nt, [
          n[18] || (n[18] = o("summary", null, "Where the files go", -1)),
          (l(!0), s(x, null, C(w.value, (e, u) => (l(), s("label", {
            key: u,
            class: "folder"
          }, [
            o("span", null, "models/" + a(u), 1),
            le(o("select", {
              "onUpdate:modelValue": ($) => O[u] = $
            }, [
              (l(!0), s(x, null, C(e, ($) => (l(), s("option", {
                key: $.path,
                value: $.path
              }, a($.path) + a($.free_bytes != null ? ` · ${A(z)($.free_bytes)} free` : ""), 9, zt))), 128))
            ], 8, Ut), [
              [Ne, O[u]]
            ])
          ]))), 128))
        ])) : c("", !0),
        o("button", {
          class: "primary",
          disabled: M.value || ue.value || L.value.files === 0,
          onClick: n[2] || (n[2] = (e) => oe(N.value.filter((u) => !u.variant.installed).map((u) => u.variant.id)))
        }, " Download all (" + a(A(z)(L.value.bytes)) + ") ", 9, It),
        L.value.files === 0 ? (l(), s("button", {
          key: 4,
          class: "primary",
          onClick: n[3] || (n[3] = (e) => j("test"))
        }, "Next")) : c("", !0)
      ])) : c("", !0),
      p.value && _.value === "downloads" ? (l(), s("section", Lt, [
        (l(!0), s(x, null, C(N.value, (e) => (l(), s("div", {
          key: e.component,
          class: "row"
        }, [
          o("div", Mt, [
            o("strong", null, a(e.title), 1),
            o("span", Ft, a(e.variant.file), 1),
            U(e).progress !== null ? (l(), s("progress", {
              key: 0,
              value: U(e).progress ?? 0,
              max: "1"
            }, null, 8, Bt)) : c("", !0),
            o("span", Vt, a(U(e).detail), 1)
          ]),
          o("span", {
            class: D(["state", U(e).tone])
          }, a(U(e).status), 3),
          (l(!0), s(x, null, C(U(e).actions, (u) => (l(), s("button", {
            key: u,
            disabled: ue.value && (u === "download" || u === "retry"),
            onClick: ($) => Pe(u, e.variant.id)
          }, a(Ee[u]), 9, Ht))), 128))
        ]))), 128)),
        o("button", {
          class: "primary",
          disabled: !Re.value,
          onClick: n[4] || (n[4] = (e) => j("test"))
        }, "Next", 8, Wt)
      ])) : c("", !0),
      p.value && _.value === "test" ? (l(), s("section", qt, [
        n[19] || (n[19] = o("p", null, " The test song makes a one-minute instrumental with 1 · YuE2 · Song and your files - no cover art, no HQ - so that a problem shows here, not in your first song. It also loads the models once, so the song you make next starts quicker. ", -1)),
        T.value.text ? (l(), s("p", {
          key: 0,
          class: D(T.value.state === "ok" ? "ok" : T.value.state === "failed" ? "error" : "hint")
        }, a(T.value.text), 3)) : c("", !0),
        T.value.audio ? (l(), s("audio", {
          key: 1,
          src: T.value.audio,
          controls: "",
          preload: "none"
        }, null, 8, Yt)) : c("", !0),
        T.value.finding ? (l(), s("ul", Jt, [
          o("li", {
            class: D(T.value.finding.severity)
          }, [
            o("span", null, a(T.value.finding.text), 1),
            T.value.finding.fix ? (l(), s("button", {
              key: 0,
              onClick: n[5] || (n[5] = (e) => j("plan"))
            }, a(T.value.finding.fix.label), 1)) : c("", !0)
          ], 2)
        ])) : c("", !0),
        T.value.state !== "running" ? (l(), s("button", {
          key: 3,
          class: "primary",
          disabled: ee.value,
          onClick: _e
        }, a(T.value.state === "idle" ? "Make the test song" : "Make it again"), 9, Kt)) : c("", !0),
        o("button", {
          onClick: n[6] || (n[6] = (e) => j("go"))
        }, a(T.value.state === "ok" ? "Next" : "Skip"), 1)
      ])) : c("", !0),
      p.value && _.value === "go" ? (l(), s("section", Gt, [
        Y.value ? (l(), s("p", {
          key: 0,
          class: D(Y.value.ready ? "ok" : "warn")
        }, [
          S(a(Y.value.ready ? "Everything ready ✓" : "Files are missing") + " · " + a(Y.value.line) + " ", 1),
          o("button", {
            class: "link",
            onClick: n[7] || (n[7] = (e) => j("plan"))
          }, "Manage")
        ], 2)) : c("", !0),
        o("div", Zt, [
          (l(!0), s(x, null, C(we.value, (e) => (l(), s("button", {
            key: e.template,
            class: D({ primary: K.value.includes(e.template) }),
            title: e.template,
            onClick: (u) => r.openTemplate(e.template)
          }, a(e.label), 11, Qt))), 128))
        ]),
        o("div", Xt, [
          o("button", {
            onClick: n[8] || (n[8] = (e) => r.openPlayer())
          }, "Open the player"),
          o("button", {
            onClick: n[9] || (n[9] = (e) => r.openContinue())
          }, "Continue a song…")
        ]),
        W.value.length ? (l(), s("div", en, [
          n[20] || (n[20] = o("span", { class: "hint" }, "Recent songs", -1)),
          (l(!0), s(x, null, C(W.value, (e) => (l(), s("button", {
            key: e.path,
            class: "link",
            onClick: (u) => r.openPlayer(e.path)
          }, "▶ " + a(e.title), 9, tn))), 128))
        ])) : c("", !0),
        o("details", {
          class: "access",
          onToggle: Q
        }, [
          n[24] || (n[24] = o("summary", null, "API access", -1)),
          o("p", nn, [
            n[21] || (n[21] = S(" Programs on another computer (a DAW plug-in, a script) need a token for the Song API. This computer needs none. Now: ", -1)),
            o("strong", null, a(Z.value === "open" ? "every computer, no token (as before 2.0)" : Z.value === "off" ? "this computer only" : "another computer with a token"), 1),
            n[22] || (n[22] = S(" ([api] remote in Plenio's config.toml). ", -1))
          ]),
          q.value ? (l(), s("p", on, [
            n[23] || (n[23] = S(" The new token - copy it now, it is not shown again: ", -1)),
            o("code", null, a(q.value), 1),
            o("button", {
              class: "link",
              onClick: n[10] || (n[10] = (e) => q.value = null)
            }, "Done")
          ])) : c("", !0),
          o("ul", ln, [
            (l(!0), s(x, null, C(se.value, (e) => (l(), s("li", {
              key: e.id
            }, [
              o("strong", null, a(e.name), 1),
              S(" · made " + a(ae(e.created)) + " · last used " + a(ae(e.last_used)) + " ", 1),
              o("button", {
                class: "link",
                onClick: (u) => ke(e.id)
              }, "Take back", 8, sn)
            ]))), 128))
          ]),
          o("form", {
            class: "go two",
            onSubmit: ye(ge, ["prevent"])
          }, [
            le(o("input", {
              "onUpdate:modelValue": n[11] || (n[11] = (e) => V.value = e),
              placeholder: "Who uses it (my DAW)",
              "aria-label": "Token name"
            }, null, 512), [
              [me, V.value]
            ]),
            o("button", {
              type: "submit",
              disabled: !V.value.trim()
            }, "Make a token", 8, an)
          ], 32)
        ], 32),
        o("nav", rn, [
          (l(!0), s(x, null, C(A(Je), (e) => (l(), s("a", {
            key: e.label,
            href: e.url,
            target: "_blank",
            rel: "noopener"
          }, a(e.label), 9, un))), 128))
        ])
      ])) : c("", !0),
      B.value ? (l(), s("section", pn, [
        n[25] || (n[25] = o("p", null, [
          o("strong", null, "Problem report"),
          S(" - what the zip holds. Paths keep their last two parts, your user name is replaced, the workflow's texts are empty. Attach the zip to an issue. ")
        ], -1)),
        (l(!0), s(x, null, C(B.value, (e, u) => (l(), s("details", { key: u }, [
          o("summary", null, a(u), 1),
          o("pre", null, a(e), 1)
        ]))), 128)),
        o("div", cn, [
          o("button", {
            class: "primary",
            onClick: xe
          }, "Save the zip"),
          o("button", {
            onClick: n[12] || (n[12] = (e) => B.value = null)
          }, "Close")
        ])
      ])) : c("", !0),
      p.value && !B.value ? (l(), s("button", {
        key: 9,
        class: "link report-button",
        onClick: be
      }, "Report a problem…")) : c("", !0),
      f.value ? (l(), De(rt, {
        key: 10,
        fetcher: r.fetcher,
        variant: f.value,
        onClose: n[13] || (n[13] = (e) => f.value = null),
        onReady: n[14] || (n[14] = (e) => {
          f.value = null, oe([e]);
        })
      }, null, 8, ["fetcher", "variant"])) : c("", !0)
    ]));
  }
});
function vn() {
  if (document.getElementById("plenio-setup-styles")) return;
  const r = document.createElement("style");
  r.id = "plenio-setup-styles", r.textContent = Ge, document.head.append(r);
}
function yn(r, i, p = null) {
  vn();
  const b = v(p), d = v(0), g = Ue({
    render: () => ze(dn, {
      key: d.value,
      fetcher: i.fetcher,
      onDownloads: i.onDownloads,
      openTemplate: i.openTemplate,
      openPlayer: i.openPlayer,
      openContinue: i.openContinue,
      problemContext: i.problemContext,
      focus: b.value
    })
  });
  return g.mount(r), {
    focus(w) {
      b.value = w, d.value += 1;
    },
    unmount: () => g.unmount()
  };
}
export {
  yn as mountSetup
};
