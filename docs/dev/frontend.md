# Frontend

- Sources in `frontend/src`, TypeScript + Vite; the build writes `web/js/plenio.js` (committed).
- ComfyUI imports **every `*.js` file below `web/`** as an extension module. Only the entry is emitted as `.js`; lazily loaded chunks use `.mjs` (`frontend/vite.config.ts`).
- The ComfyUI app is imported from the scripts shim, kept external by the build: `../../../scripts/app.js` resolves to `/scripts/app.js` from `/extensions/<pack>/js/plenio.js`, independent of the install folder name.
- The official `@comfyorg/comfyui-frontend-types` package is not used: the 1.53.x releases on npm contain no type file. The few shapes Plenio needs are declared in `src/shared/comfy.ts`.
- Documented hooks only (R11): `registerExtension`, `getCustomWidgets`, `beforeRegisterNodeDef`, node callbacks, `addDOMWidget` with `getValue`/`setValue`. Never write to ComfyUI stores.
- Custom widgets are registered per input type (`PLENIO_SHEET_STATE`). Their values are plain JSON strings, saved with the workflow and sent to the backend unchanged.
- Blueprints: promoted widgets are expressed by subgraph inputs linked to inner widget inputs (the format of the current native blueprints). The older `properties.proxyWidgets` form is quarantined by frontend 1.53 and its stored value overrides the saved one on reload; the workflow validator rejects it.
- Styles use ComfyUI CSS variables so light and dark themes work.
- `npm run check` = `vue-tsc --noEmit`, Vitest (happy-dom) and the build.
- The Song Sheet editor (lazy chunk `open-*.mjs`, loaded when a sheet is opened) bundles Vue, abcjs and CodeMirror 6 (about 1.4 MB, 370 kB gzip); licences in `THIRD_PARTY.md`. Module map: `docs/design/score-editor-design.md` §15.3.
- The editor never keeps a second score model: every view comes from `/plenio/score/analyze` for exactly the current text (`useScoreSession.ts` drops answers for older texts); operations go through `/plenio/score/transform`.
- Playback uses WebAudio tones (`sheet-editor/score/player.ts`), not the abcjs synth, which would download a soundfont at play time.
- Plenio nodes with a DynamicCombo wrap `configure` (`extension/dynamicCombo.ts`) to repair a frontend 1.53.6 restore defect - the one recorded exception to R11.
