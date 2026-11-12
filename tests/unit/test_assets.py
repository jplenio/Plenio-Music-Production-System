"""Asset catalogue, offline policy and resumable downloads."""

from __future__ import annotations

import hashlib
import http.server
import threading
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest

from plenio.core.assets import Asset, AssetFile, asset_folder, ensure_asset, http_fetch, load_catalogue
from plenio.core.assets.catalogue import parse_catalogue
from plenio.core.config import PlenioConfig
from plenio.core.errors import PlenioAssetError, PlenioCancelledError, PlenioUserError

ROOT = Path(__file__).resolve().parents[2]
REVISION = "0123456789abcdef0123456789abcdef01234567"
PAYLOAD = bytes(range(256)) * 64  # 16 KiB


def make_asset(size: int = len(PAYLOAD), sha: str | None = None) -> Asset:
    return Asset(
        "demo", "asr", "org/demo", REVISION, "MIT", "demo model", (AssetFile("sub/model.bin", size, sha),)
    )


def test_shipped_catalogue_is_valid() -> None:
    assets = load_catalogue(ROOT / "resources" / "assets.toml")
    for asset in assets.values():
        assert asset.total_size > 0


def test_catalogue_requires_pinned_revisions_and_safe_paths() -> None:
    base = {"id": "a", "kind": "asr", "repo": "o/r", "revision": REVISION, "licence": "MIT"}
    ok = {"schema": "plenio.assets/1", "asset": [{**base, "files": [{"path": "x/y.bin", "size": 3}]}]}
    assert parse_catalogue(ok, "test")["a"].files[0].path == "x/y.bin"
    bad_cases = [
        {**base, "revision": "main", "files": [{"path": "y.bin", "size": 3}]},
        {**base, "files": [{"path": "../y.bin", "size": 3}]},
        {**base, "files": [{"path": "C:/y.bin", "size": 3}]},
        {**base, "files": [{"path": "y.bin", "size": 0}]},
        {**base, "files": []},
        {k: v for k, v in base.items() if k != "licence"} | {"files": [{"path": "y.bin", "size": 3}]},
    ]
    for case in bad_cases:
        with pytest.raises(PlenioUserError):
            parse_catalogue({"schema": "plenio.assets/1", "asset": [case]}, "test")


class FakeFetcher:
    def __init__(self, data: bytes = PAYLOAD):
        self.data = data
        self.calls: list[str] = []

    def __call__(
        self,
        url: str,
        destination: Path,
        expected_size: int,
        progress: Callable[[int, int, str], None] | None,
        is_cancelled: Callable[[], bool] | None,
    ) -> None:
        self.calls.append(url)
        destination.write_bytes(self.data)
        if progress:
            progress(len(self.data), expected_size, "done")


def test_present_asset_needs_no_fetch(tmp_path: Path) -> None:
    asset = make_asset()
    target = asset_folder(tmp_path, asset) / "sub" / "model.bin"
    target.parent.mkdir(parents=True)
    target.write_bytes(PAYLOAD)
    fetch = FakeFetcher()
    assert ensure_asset(asset, tmp_path, PlenioConfig(offline=True), fetch=fetch) == target.parent.parent
    assert fetch.calls == []


def test_offline_error_names_folder_files_and_source(tmp_path: Path) -> None:
    config = PlenioConfig.load(env={"PLENIO_OFFLINE": "1"})
    with pytest.raises(PlenioAssetError) as error:
        ensure_asset(make_asset(), tmp_path, config, fetch=FakeFetcher())
    text = str(error.value)
    assert "offline mode is on (PLENIO_OFFLINE)" in text
    assert str(tmp_path / "asr" / "demo") in text
    assert "sub/model.bin" in text and REVISION in text and "MIT" in text


def test_auto_download_off_is_an_actionable_error(tmp_path: Path) -> None:
    with pytest.raises(PlenioAssetError) as error:
        ensure_asset(make_asset(), tmp_path, PlenioConfig(auto_download=False), fetch=FakeFetcher())
    assert "PLENIO_AUTO_DOWNLOAD=0" in str(error.value)


def test_download_is_verified_and_renamed(tmp_path: Path) -> None:
    progress: list[int] = []
    asset = make_asset(sha=hashlib.sha256(PAYLOAD).hexdigest())
    folder = ensure_asset(
        asset, tmp_path, PlenioConfig(), fetch=FakeFetcher(), progress=lambda d, t, m: progress.append(d)
    )
    assert (folder / "sub" / "model.bin").read_bytes() == PAYLOAD
    assert not list(folder.rglob("*.part"))
    assert progress[-1] == len(PAYLOAD)


def test_wrong_size_or_hash_is_rejected_and_cleaned_up(tmp_path: Path) -> None:
    with pytest.raises(PlenioAssetError, match="expected"):
        ensure_asset(make_asset(size=len(PAYLOAD) + 1), tmp_path, PlenioConfig(), fetch=FakeFetcher())
    with pytest.raises(PlenioAssetError, match="SHA-256"):
        ensure_asset(make_asset(sha="0" * 64), tmp_path, PlenioConfig(), fetch=FakeFetcher())
    assert not list(tmp_path.rglob("*.part")) and not list(tmp_path.rglob("model.bin"))


# --- real HTTP with Range support ------------------------------------------------


class RangeHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        start = 0
        header = self.headers.get("Range")
        if header:
            start = int(header.removeprefix("bytes=").split("-")[0])
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{len(PAYLOAD) - 1}/{len(PAYLOAD)}")
        else:
            self.send_response(200)
        body = PAYLOAD[start:]
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:
        pass


@pytest.fixture
def server() -> Iterator[str]:
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), RangeHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{httpd.server_address[1]}/file"
    httpd.shutdown()


def test_http_fetch_resumes_a_partial_file(server: str, tmp_path: Path) -> None:
    destination = tmp_path / "model.bin.part"
    destination.write_bytes(PAYLOAD[:1000])
    http_fetch(server, destination, len(PAYLOAD), None, None)
    assert destination.read_bytes() == PAYLOAD


def test_http_fetch_honours_cancellation(server: str, tmp_path: Path) -> None:
    with pytest.raises(PlenioCancelledError):
        http_fetch(server, tmp_path / "x.part", len(PAYLOAD), None, lambda: True)


@pytest.mark.io
def test_http_fetch_unreachable_host_is_actionable(tmp_path: Path) -> None:
    with pytest.raises(PlenioAssetError, match="Could not download"):
        http_fetch("http://127.0.0.1:9/none", tmp_path / "x.part", 10, None, None)


# --- found by the mutation run (phase 9.3) ---------------------------------------------------------------------------


class RecordingHandler(RangeHandler):
    """The Range server that notes what it was asked, and can ignore Range (a host that always sends all)."""

    asked: list[str | None] = []
    ignore_range = False

    def do_GET(self) -> None:
        RecordingHandler.asked.append(self.headers.get("Range"))
        if RecordingHandler.ignore_range:
            del self.headers["Range"]
        super().do_GET()


@pytest.fixture
def recording() -> Iterator[str]:
    RecordingHandler.asked = []
    RecordingHandler.ignore_range = False
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), RecordingHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{httpd.server_address[1]}/file"
    httpd.shutdown()


def test_a_partial_file_asks_only_for_the_rest_and_progress_counts_on(recording: str, tmp_path: Path) -> None:
    destination = tmp_path / "model.bin.part"
    destination.write_bytes(PAYLOAD[:1000])
    seen: list[int] = []
    http_fetch(recording, destination, len(PAYLOAD), lambda d, t, m: seen.append(d), None)
    assert RecordingHandler.asked == ["bytes=1000-"]
    assert destination.read_bytes() == PAYLOAD
    assert seen[0] > 1000 and seen[-1] == len(PAYLOAD)


def test_a_host_that_sends_everything_again_overwrites_the_partial_file(
    recording: str, tmp_path: Path
) -> None:
    RecordingHandler.ignore_range = True
    destination = tmp_path / "model.bin.part"
    destination.write_bytes(PAYLOAD[:1000])
    seen: list[int] = []
    http_fetch(recording, destination, len(PAYLOAD), lambda d, t, m: seen.append(d), None)
    assert destination.read_bytes() == PAYLOAD  # not the partial file with everything appended
    assert seen[-1] == len(PAYLOAD)


def test_a_fresh_download_starts_at_the_first_byte_and_a_whole_one_is_not_asked_again(
    recording: str, tmp_path: Path
) -> None:
    fresh = tmp_path / "fresh.part"
    http_fetch(recording, fresh, len(PAYLOAD), None, None)
    assert RecordingHandler.asked == [None] and fresh.read_bytes() == PAYLOAD
    http_fetch(recording, fresh, len(PAYLOAD), None, None)
    assert RecordingHandler.asked == [None]  # complete: no request at all
    too_long = tmp_path / "long.part"
    too_long.write_bytes(PAYLOAD + b"extra")
    http_fetch(recording, too_long, len(PAYLOAD), None, None)
    assert too_long.read_bytes() == PAYLOAD and RecordingHandler.asked[-1] is None


def test_progress_runs_over_every_file_of_an_asset_and_the_message_names_its_size(tmp_path: Path) -> None:
    two = Asset(
        "pair",
        "asr",
        "org/pair",
        REVISION,
        "MIT",
        "two files",
        (AssetFile("a.bin", len(PAYLOAD), None), AssetFile("b.bin", len(PAYLOAD), None)),
    )
    seen: list[tuple[int, int]] = []
    ensure_asset(
        two, tmp_path, PlenioConfig(), fetch=FakeFetcher(), progress=lambda d, t, m: seen.append((d, t))
    )
    assert seen == [(len(PAYLOAD), 2 * len(PAYLOAD)), (2 * len(PAYLOAD), 2 * len(PAYLOAD))]
    big = Asset("big", "asr", "org/big", REVISION, "MIT", "", (AssetFile("x.bin", 3 * 2**20, None),))
    with pytest.raises(PlenioAssetError, match=r"'big' \(asr, 3\.0 MiB, licence MIT\)"):
        ensure_asset(big, tmp_path, PlenioConfig(offline=True))
