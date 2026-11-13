# Releases

Published Registry versions are immutable: every fix is a new version.

## Preparing and publishing (2.0)

A version is three numbers - there are no pre-release versions. `tools/release.py` prepares it, a tag publishes it.

```bash
python tools/bench.py --api http://127.0.0.1:8188 --label <version> --card "<card>"     # on the reference card
python tools/release.py prepare <version> --bench docs/test-reports/data/bench-<version>.json
git diff                                   # review: the version, the dated CHANGELOG, the generated files,
git add docs/releases docs/security        # the two new files: the notes and the review request
git commit -am "Release <version>"
python tools/release.py verify             # the checks again on the committed tree
git tag v<version> && git push origin main v<version>    # the owner's step: it publishes
```

`prepare` needs a clean tree and a benchmark report within the budgets (`docs/dev/performance.md`); it writes the version into `pyproject.toml`, `plenio/__init__.py`, `frontend/package.json` and its lock file, dates the CHANGELOG section (which must have its intro: a paragraph before its first `###`), runs `tools/build_graphs.py`, `tools/api_docs.py`, `tools/facts.py --write` and `tools/media_links.py --write`, writes the release notes (`tools/release_notes.py`) and the review request with the package gate's delta against the last published version, then runs `verify`. It commits nothing.

The tag starts `.github/workflows/release.yml`: the whole CI with the browser check, the check that the tag is the version and the tree is as prepared, the release files (`tools/build_release_assets.py`: the full download with the Studio add-on, the six templates, `SHA256SUMS.txt`), the GitHub release with the committed notes, the Comfy Registry (secret `REGISTRY_ACCESS_TOKEN`, publisher `jplenio`, package `comfyui-plenio-music`), and `tools/verify_install.py`, which installs the published package into a fresh ComfyUI and checks that it registers <!--fact:nodes-->39<!--/fact--> nodes, <!--fact:templates-->6<!--/fact--> templates and <!--fact:blueprints-->14<!--/fact--> blueprints with no import error and without the add-on.

After publishing: `python tools/registry_status.py --version <version>` (the scheduled `registry.yml` opens an issue when a version's status changes); file the review request of `docs/security/review-<version>.md` if the version is flagged.

The Registry's icon and banner are the raw GitHub URLs of `assets/branding/icon.png` and `assets/branding/banner.png` (`[tool.comfy]` in `pyproject.toml`); they must exist on `main` before publishing. `verify` checks that they are PNGs and that the Registry takes them: the icon square and at most 400 px, the banner 21:9.

### The release page

The notes are the CHANGELOG section, made for a reader of the release page: the banner, the intro, the films to watch, the **Highlights** (a picture beside each), **Updating from 1.x**, how to install - and then every change, folded part by part. How the page looks is `docs/releases/<version>.json`:

```json
{"banner": "assets/branding/banner-large.png",
 "watch": [{"key": "film-hero", "label": "Plenio 2.0 in 50 seconds"}],
 "pictures": {"Plenio Setup": "assets/branding/2.0.0/setup.jpg"}}
```

`pictures` go by a highlight's bold lead-in; a film in `watch` is linked only once `resources/media.toml` knows its key (it is uploaded). After the films are uploaded and their ids committed, run `python tools/release_notes.py <version>` again - `verify` fails until the notes link them. `python tools/release_notes.py <version> --print` shows the page without writing it.

### Films, tutorials and pictures

They are made in the separate workspace `Plenio-Media` beside this repository (its `docs/new-version-in-six-commands.md`). Before the tag: `node media.mjs install` there copies the banner, the icon, the mark and the README's pictures into `assets/` (review and commit them here), and `node media.mjs kit <version>` collects the films, tutorials, posts and the posting plan. After the tag: `node media.mjs publish youtube --apply` uploads them privately and writes their ids into `resources/media.toml` (commit it), `--release` makes them public.

## Demo gallery

The listening page is GitHub Pages from the `docs/` folder of `main` (`docs/index.html`, `docs/.nojekyll` so the other documents are not processed); every push to `main` publishes it. From the top: two films with sound (`#sound`; `docs/assets/media/` - *Plenio in 30 seconds* and *Twelve genres*, 720p H.264 with a poster each, cut from the 1.4.0 social clips), the song videos on YouTube (`#videos`), new songs (`#new`, shown once there is one), how the songs were made (`#how`) and the archive (`#archive`) with its three collections.

**Song videos and new songs** come from `docs/demo-showcase.js`, written by `tools/demo_showcase.py` - [docs/demo-showcase.md](../demo-showcase.md) says how to add a song (from its FLAC or record: SoundCloud, YouTube or its MP3 copied into `docs/assets/showcase/`) or a video, list and remove them. Only what the song's page in the player shows is copied.

The archive's three collections have a tab each (`#plenio`, `#songs`, `#covers` open one):

- **Songs from Plenio** - `docs/demo-plenio.js`, covers in `docs/assets/demo-plenio/`. Built by `python tools/build_demo_catalog.py <folder with *.plenio.json>` from the release records of a batch: one song per brief template (length against the brief, Song Sheet warnings, a render that matches the template's vocals, distinct titles; `--pick TEMPLATE=FILE` overrides a choice). It also writes the upload checklist `docs/demo-plenio-upload.md` (files, SoundCloud titles, descriptions, tags, alternatives per genre). Running it again keeps the `soundcloudUrl` and `comment` values typed into the catalog and its config. The tab shows only the songs that have a `soundcloudUrl` (the others stay in the catalog); a song's cover is its JPG in `docs/assets/demo-plenio/` when stored there (run the tool again after adding one), otherwise the page loads the track's SoundCloud artwork (oEmbed).
- **MiniMax Music 3** and **YuE2 Cover** - `docs/demo-tracks.js`, `docs/demo-covers.js`, images in `docs/assets/demo-covers/`; built with the predecessor toolkit's scripts, new entries are added by hand in the same format.

The Song API's reference is on the same site: `docs/api/index.html` (`/api/`) shows `docs/api/openapi.json` with Redoc, loaded from jsDelivr - the one page of the site that loads a script from elsewhere.

Audio is streamed from SoundCloud: a track's `soundcloudUrl` is its public SoundCloud URL (a player loads when the visitor presses play; without a URL the card says *Coming to SoundCloud*), and the playlist button of a tab uses that catalog's `soundcloudPlaylistUrl`. The song videos show YouTube's picture of each video (`i.ytimg.com`) and load the player from `youtube-nocookie.com` only on a click; the films and a new song's MP3 come from the page itself. The page loads nothing else from third parties.
