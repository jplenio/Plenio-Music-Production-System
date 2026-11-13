# Third-party software

Plenio VST3 is licensed under the Apache License 2.0 ([LICENSE](../LICENSE)). It is built with the following
components; each keeps its own licence. They are fetched at pinned versions by `tools/fetch_deps.ps1` into
`external/` (not part of this repository) and compiled into `Plenio.vst3` where noted.

| Component | Version | Licence | In the plug-in | Source |
|---|---|---|---|---|
| Steinberg VST 3 SDK | 3.8.1 (build 84) | MIT | yes | https://github.com/steinbergmedia/vst3sdk |
| ARA Audio Random Access SDK (ARA API, ARA Library) | 2.3.0 | Apache-2.0 | yes | https://github.com/Celemony/ARA_SDK |
| CHOC (Tracktion) | commit 8af031c | ISC | yes (WebView, with the patch in `cmake/patches/`) | https://github.com/Tracktion/choc |
| REAPER extension SDK (headers) | commit b2ca1ec | zlib | yes (declarations only) | https://github.com/justinfrankel/reaper-sdk |
| JSON for Modern C++ (nlohmann) | 3.12.0 | MIT | yes | https://github.com/nlohmann/json |
| cpp-httplib | 0.60.0 | MIT | yes | https://github.com/yhirose/cpp-httplib |
| dr_libs (dr_flac, dr_wav, dr_mp3) | commit dfe8377 | Public domain (Unlicense) or MIT-0 | yes | https://github.com/mackron/dr_libs |
| r8brain-free-src | 6.5 | MIT | yes | https://github.com/avaneev/r8brain-free-src |
| doctest | 2.5.3 | MIT | tests only | https://github.com/doctest/doctest |
| Vue | 3.5.43 | MIT | yes (the web UI) | https://github.com/vuejs/core |
| Vite, TypeScript, Vitest, vue-tsc, happy-dom | see `webui/package.json` | MIT / Apache-2.0 | build and test tools only | npm |

The Plenio icon (`resources/plenio.ico`, `webui/public/plenio-icon.png`) is the Plenio Player's icon from the
Plenio Music Production System (Apache-2.0, same author).

The pictures and videos in `docs/media` and the launch material are set in Montserrat (SIL Open Font License 1.1),
taken from the computer they were rendered on; the font is not part of this repository. The teaser's drawing (sky,
waves, the neon logo) follows the SoundCraft add-in's media scripts (same author, MIT/Apache-2.0).

The Microsoft Edge WebView2 Runtime is part of Windows 11 (and installed with Microsoft Edge on Windows 10); CHOC
loads it without the WebView2 SDK.

## What the plug-in talks to, but does not contain

| Software | Licence | How |
|---|---|---|
| ComfyUI | GPL-3.0 | a separate program on the same computer, over HTTP on 127.0.0.1 |
| Plenio Music Production System | Apache-2.0 | a ComfyUI extension, over its Song API |
| YuE2, SheetSage2 (music models) | CC BY-NC 4.0 | run by Plenio; **songs made with them may not be used commercially** |

## Trademarks

VST is a registered trademark of Steinberg Media Technologies GmbH. ARA Audio Random Access is a trademark of
Celemony Software GmbH. REAPER is a trademark of Cockos Incorporated. Cubase, Nuendo, Studio One, Ableton Live, FL Studio, Bitwig Studio,
Cakewalk, Sonar, Logic Pro and Pro Tools are trademarks of their owners. Plenio VST3 is not affiliated with or endorsed
by any of them; the names only say what the plug-in works with.
