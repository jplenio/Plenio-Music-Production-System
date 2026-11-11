"""Keep the model catalogue true (``resources/models.toml``) - without downloading a model.

    python tools/catalogue_check.py --check     # compare the catalogue with the hub; exit 1 on drift
    python tools/catalogue_check.py --write     # pin revisions, fill sizes and hashes, follow renamed repositories

For every Hugging Face file it asks the hub two small things: the repository's facts
(``GET /api/models/<repo>``: its current name and commit, whether it is gated) and the file's headers at the
pinned commit (``HEAD .../resolve/<commit>/<path>``: ``X-Linked-Size`` and ``X-Linked-ETag`` - for a file kept
in large-file storage the ETag is its SHA-256). A GitHub release asset is checked by its size (the release API's
``digest`` gives the hash where GitHub publishes one); ``--local <models folder>`` hashes a file found there with
the catalogue's size, for assets whose host publishes no hash.

``--check`` fails on: a URL that no longer resolves, a size or hash that differs at the pinned commit, a
repository that was renamed or became gated. ``--write`` updates the file: a ``resolve/main`` URL is pinned to
the repository's current commit, sizes and hashes are filled, a renamed repository gets its current name. It
never changes a licence, a role or a threshold - those are decisions.

Tests use recorded answers (``fetch=``); only this tool talks to the network. Standard library only.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.error
import urllib.request
from collections.abc import Callable, Mapping
from dataclasses import replace
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from plenio.core.files import read_toml  # noqa: E402
from plenio.core.models import SCHEMA, Component, Variant, parse_components  # noqa: E402

CATALOGUE = PROJECT / "resources" / "models.toml"
AGENT = "plenio-catalogue-check"
_COMMIT = re.compile(r"[0-9a-f]{40}")
_SHA256 = re.compile(r"[0-9a-f]{64}")
_RELEASE = re.compile(
    r"https://github\.com/(?P<repo>[\w.-]+/[\w.-]+)/releases/download/(?P<tag>[\w.-]+)/(?P<name>[\w./-]+)"
)

Answer = tuple[int, Mapping[str, str], bytes]
Fetch = Callable[[str, str], Answer]
"""``fetch(method, url)`` -> ``(status, headers with lower-case names, body)``; redirects to another host are
not followed for a HEAD (the hub's own headers are what is read)."""

HEADER = """\
# The model catalogue (schema plenio.models/2): the ComfyUI-format model files Plenio's templates load.
#
# A component is one thing a template needs; a variant is one file that can be it. One source of truth:
# tools/build_graphs.py writes the loaders' download entries from it, the System Check lists what is installed,
# the model plan (plenio/core/modelplan.py) chooses a variant per machine, and docs/user/models.md follows it.
#
#   templates           templates that need the component to run (they load its default variant)
#   optional_templates  templates in which only an optional (bypassed) block uses it
#   default             the variant the templates' loaders are set to (one per component)
#   url                 pinned to a full commit; bytes and sha256 are the file's own
#   quality, speed      ranks within the component (higher: better, faster)
#   vram_min_gib        below this much graphics memory the file runs only with heavy offloading
#   vram_full_gib       from this much on, its stage runs on the card
#   basis               where the two thresholds come from: "estimate" or "measured <when, on what>"
#
# This file is written by tools/catalogue_check.py --write (revisions, sizes, hashes, repository names): edit
# roles, licences, ranks and thresholds here; let the tool fill the rest.
"""


# --- the file -----------------------------------------------------------------------------------------------------


def _quoted(text: str) -> str:
    return json.dumps(text, ensure_ascii=False)


def _number(value: float) -> str:
    return f"{value:g}" if value != int(value) else f"{value:.1f}"


def dump(components: Mapping[str, Component]) -> str:
    """The catalogue as TOML text, in one fixed layout (so a rewrite changes only what changed)."""
    lines = [HEADER, f"schema = {_quoted(SCHEMA)}"]
    for component in components.values():
        lines += ["", "[[component]]", f"id = {_quoted(component.id)}", f"title = {_quoted(component.title)}"]
        lines.append(f"folder = {_quoted(component.folder)}")
        if component.loader_node:
            lines.append(
                f"loader = {{ node = {_quoted(component.loader_node)}, input = {_quoted(component.loader_input)} }}"
            )
        if component.accepts:
            lines.append(f"accepts = {_quoted(component.accepts)}")
        lines.append(f"templates = [{', '.join(_quoted(t) for t in component.templates)}]")
        if component.optional_templates:
            lines.append(
                f"optional_templates = [{', '.join(_quoted(t) for t in component.optional_templates)}]"
            )
        for variant in component.variants:
            lines += [
                "",
                "  [[component.variant]]",
                f"  id = {_quoted(variant.id)}",
                f"  file = {_quoted(variant.file)}",
                f"  url = {_quoted(variant.url)}",
                f"  bytes = {variant.bytes}",
                f"  sha256 = {_quoted(variant.sha256)}",
                f"  licence = {_quoted(variant.licence)}",
                f"  role = {_quoted(variant.role)}",
                f"  default = {'true' if variant.default else 'false'}",
                f"  gated = {'true' if variant.gated else 'false'}",
                f"  quality = {variant.quality}",
                f"  speed = {variant.speed}",
                f"  vram_min_gib = {_number(variant.vram_min_gib)}",
                f"  vram_full_gib = {_number(variant.vram_full_gib)}",
                f"  basis = {_quoted(variant.basis)}",
            ]
    return "\n".join(lines) + "\n"


# --- the hub ------------------------------------------------------------------------------------------------------


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args: Any, **kwargs: Any) -> None:
        return None


def network(method: str, url: str) -> Answer:
    """One request without credentials. A HEAD does not follow redirects: the hub answers a ``resolve`` URL with
    the file's facts in the headers of its redirect."""
    opener = urllib.request.build_opener(_NoRedirect) if method == "HEAD" else urllib.request.build_opener()
    request = urllib.request.Request(url, method=method, headers={"User-Agent": AGENT})  # noqa: S310 - https
    try:
        with opener.open(request, timeout=30) as answer:
            return answer.status, {k.lower(): v for k, v in answer.headers.items()}, answer.read()
    except urllib.error.HTTPError as error:
        return error.code, {k.lower(): v for k, v in error.headers.items()}, error.read()


def _hub_file(variant: Variant, fetch: Fetch, repos: dict[str, dict[str, Any]]) -> tuple[Variant, list[str]]:
    """``variant`` as the hub has it, and what differs from the catalogue."""
    hub = variant.hub
    assert hub is not None
    repo, revision, path = hub
    notes: list[str] = []
    if repo not in repos:
        status, _headers, body = fetch("GET", f"https://huggingface.co/api/models/{repo}")
        if status != 200:
            return variant, [f"the repository {repo} does not answer ({status})"]
        repos[repo] = json.loads(body)
    facts = repos[repo]
    name = str(facts.get("id") or repo)
    if name != repo:
        notes.append(f"the repository {repo} is now {name}")
    gated = bool(facts.get("gated"))
    if gated != variant.gated:
        notes.append(f"the repository {name} is {'now gated' if gated else 'no longer gated'}")
    commit = revision if _COMMIT.fullmatch(revision) else str(facts.get("sha") or "")
    if not _COMMIT.fullmatch(commit):
        return variant, [*notes, f"no commit to pin {repo} to"]
    if commit != revision:
        notes.append(f"{revision} is not a commit: pinned to {commit[:12]}")
    url = f"https://huggingface.co/{name}/resolve/{commit}/{path}"
    status, headers, _body = fetch("HEAD", url)
    if status not in (200, 301, 302, 303, 307, 308):
        return variant, [*notes, f"the file does not resolve ({status}): {url}"]
    size = int(headers.get("x-linked-size") or headers.get("content-length") or 0)
    etag = (headers.get("x-linked-etag") or headers.get("etag") or "").strip('W/"')
    digest = etag if _SHA256.fullmatch(etag) else ""
    if not size:
        notes.append("the hub names no size")
    elif variant.bytes and size != variant.bytes:
        notes.append(f"the size is {size}, not {variant.bytes}")
    if not digest:
        notes.append("the hub names no SHA-256 (not a large file?)")
    elif variant.sha256 and digest != variant.sha256:
        notes.append("the SHA-256 differs")
    elif not variant.sha256:
        notes.append("SHA-256 filled")
    if not variant.bytes and size:
        notes.append("size filled")
    return (
        replace(variant, url=url, bytes=size or variant.bytes, sha256=digest or variant.sha256, gated=gated),
        notes,
    )


def _release_file(
    variant: Variant, fetch: Fetch, local: Path | None, folder: str
) -> tuple[Variant, list[str]]:
    """A GitHub release asset: its size from the download's headers, its hash from the release API's ``digest`` -
    or from the file in ``local`` when it has the catalogue's size."""
    match = _RELEASE.fullmatch(variant.url)
    assert match is not None
    notes: list[str] = []
    size, digest = 0, ""
    status, _headers, body = fetch(
        "GET", f"https://api.github.com/repos/{match['repo']}/releases/tags/{match['tag']}"
    )
    if status == 200:
        asset = next((a for a in json.loads(body).get("assets", []) if a.get("name") == match["name"]), None)
        if asset is None:
            return variant, [f"the release {match['tag']} has no {match['name']}"]
        size = int(asset.get("size") or 0)
        found = str(asset.get("digest") or "")
        digest = found.removeprefix("sha256:") if _SHA256.fullmatch(found.removeprefix("sha256:")) else ""
    else:
        notes.append(f"GitHub's release API does not answer ({status})")
    if not digest and local is not None:
        path = local / folder / variant.file
        if path.is_file() and path.stat().st_size == (size or variant.bytes):
            hashed = hashlib.sha256()
            with path.open("rb") as handle:
                for block in iter(lambda: handle.read(1 << 20), b""):
                    hashed.update(block)
            digest = hashed.hexdigest()
            notes.append("SHA-256 from the local file of the same size")
    if size and variant.bytes and size != variant.bytes:
        notes.append(f"the size is {size}, not {variant.bytes}")
    if digest and variant.sha256 and digest != variant.sha256:
        notes.append("the SHA-256 differs")
    if not digest and not variant.sha256:
        notes.append("no SHA-256 published (give --local <models folder> to hash an installed copy)")
    return replace(variant, bytes=size or variant.bytes, sha256=digest or variant.sha256), notes


def survey(
    components: Mapping[str, Component], fetch: Fetch = network, local: Path | None = None
) -> tuple[dict[str, Component], dict[str, list[str]]]:
    """The catalogue as its hosts have it, and per variant what differs (empty: nothing)."""
    repos: dict[str, dict[str, Any]] = {}
    updated: dict[str, Component] = {}
    notes: dict[str, list[str]] = {}
    for component in components.values():
        variants = []
        for variant in component.variants:
            if variant.hub is not None:
                found, said = _hub_file(variant, fetch, repos)
            else:
                found, said = _release_file(variant, fetch, local, component.folder)
            variants.append(found)
            if said:
                notes[variant.id] = said
        updated[component.id] = replace(component, variants=tuple(variants))
    return updated, notes


FILLED = ("SHA-256 filled", "size filled", "SHA-256 from the local file of the same size")
"""Notes that say a gap was filled - no drift."""


def drift(notes: Mapping[str, list[str]]) -> dict[str, list[str]]:
    """The notes that mean the catalogue is no longer true."""
    found = {key: [n for n in said if n not in FILLED] for key, said in notes.items()}
    return {key: said for key, said in found.items() if said}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="compare; exit 1 on drift")
    mode.add_argument("--write", action="store_true", help="update the catalogue from its hosts")
    parser.add_argument("--file", type=Path, default=CATALOGUE)
    parser.add_argument(
        "--local", type=Path, help="a ComfyUI models folder, to hash files no host publishes a hash of"
    )
    args = parser.parse_args(argv)
    components = parse_components(read_toml(args.file), str(args.file), strict=args.check)
    updated, notes = survey(components, local=args.local)
    for key, said in notes.items():
        for note in said:
            print(f"{key}: {note}")
    if args.write:
        text = dump(updated)
        args.file.write_bytes(text.encode("utf-8"))
        parse_components(
            read_toml(args.file), str(args.file)
        )  # the written file is complete, or this says what is not
        print(f"written: {args.file}")
        return 0
    wrong = drift(notes)
    print("the catalogue is true to its hosts" if not wrong else f"{len(wrong)} file(s) drifted")
    return 1 if wrong else 0


if __name__ == "__main__":
    sys.exit(main())
