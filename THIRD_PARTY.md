# Third-party components

Everything that is **shipped** with Plenio and was not written for Plenio. Development-only tools (pytest, ruff, mypy, Vite, TypeScript, Vitest) are not shipped and not listed.

| Component | Version | Where | Licence | Notes |
|---|---|---|---|---|
| YuE `abc_tools.py` | commit `e76a8753` | `plenio/third_party/yue2_abc_tools.py` | Apache-2.0 (`plenio/third_party/LICENSE-YuE.txt`) | unchanged; provenance and hash in `plenio/third_party/README.md` |
| Upstream example scores | YuE `main` @ `09a1e8a8` | `tests/fixtures/abc/upstream-*.abc` | Apache-2.0 | test fixtures only |
| Vue (`vue`, `@vue/runtime-dom`, `@vue/runtime-core`, `@vue/reactivity`, `@vue/shared`) | 3.5.43 | bundled into `web/js/chunks/*.mjs` (Song Sheet editor) | MIT (text below) | loaded only when the editor opens |

When the frontend bundles another library, it is added here with its licence text in the same change.

## Licence texts

### Vue (MIT)

```text
The MIT License (MIT)

Copyright (c) 2018-present, Yuxi (Evan) You

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

Not shipped, used at runtime: ComfyUI (GPL-3.0) and the Python packages it installs. Model weights are never shipped; see `docs/user/licensing.md`.
