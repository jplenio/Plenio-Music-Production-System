"""Export formats (FLAC 24-bit, MP3 VBR V0, WAV 32-bit float), tags, cover art and tag reading."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from plenio.core.errors import PlenioUserError
from plenio.core.release import FORMATS, embed_cover, read_tags, write_audio

pytest.importorskip("av")

TAGS = {
    "title": "Neon Rain",
    "artist": "Plenio",
    "album": "Tests",
    "date": "2026",
    "track": "3/12",
    "genre": "Pop",
    "comment": "Ümlaut and ß",
    "album_artist": "Plenio Artists",
    "composer": "J. P.",
}


def noise(seconds: float = 3.0, rate: int = 44100, level: float = 0.2) -> np.ndarray:
    return level * np.random.default_rng(1).standard_normal((2, int(seconds * rate)))


def decode(path: Path) -> tuple[np.ndarray, int]:
    import av

    with av.open(str(path)) as container:
        stream = container.streams.audio[0]
        frames = [frame.to_ndarray() for frame in container.decode(stream)]
        rate = int(stream.rate)
    data = np.concatenate(frames, axis=-1)
    return data.astype(np.float64), rate


@pytest.mark.parametrize("kind", sorted(FORMATS))
def test_formats_round_trip_with_tags(tmp_path: Path, kind: str) -> None:
    x = noise()
    path = tmp_path / f"song{FORMATS[kind]['extension']}"
    facts = write_audio(path, x, 44100, kind, TAGS)
    assert facts["format"] == kind and facts["seconds"] == 3.0 and facts["channels"] == 2
    assert not path.with_name(path.name + ".part").exists()
    tags, cover = read_tags(path)
    expected = (
        TAGS if kind != "wav" else {k: v for k, v in TAGS.items() if k not in ("album_artist", "composer")}
    )
    assert {k: tags.get(k) for k in expected} == expected and cover is None
    data, rate = decode(path)
    assert rate == 44100
    if kind == "wav":  # 32-bit float, interleaved: exact to float32 precision
        assert np.max(np.abs(data.reshape(-1, 2).T - x)) < 1e-6


def test_flac_is_24_bit_lossless_and_wav_is_float(tmp_path: Path) -> None:
    x = noise(1.0)
    write_audio(tmp_path / "a.flac", x, 44100, "flac")
    write_audio(tmp_path / "a.wav", x * 3, 44100, "wav")  # far over full scale: float keeps it
    flac, _ = decode(tmp_path / "a.flac")
    ints = flac.reshape(-1)  # s32 interleaved with 24 significant bits
    assert np.all(np.mod(ints, 256) == 0)
    wav, _ = decode(tmp_path / "a.wav")
    assert float(np.max(np.abs(wav))) > 1.5  # no clipping in 32-bit float
    facts = write_audio(tmp_path / "b.flac", x * 3, 44100, "flac")
    assert facts["clipped_samples"] > 0 and facts["peak"] > 1


def test_mp3_is_vbr_v0(tmp_path: Path) -> None:
    rich = noise(6.0)
    t = np.arange(44100 * 6) / 44100
    tone = 0.3 * np.vstack([np.sin(2 * np.pi * 440 * t)] * 2)
    write_audio(tmp_path / "rich.mp3", rich, 44100, "mp3")
    write_audio(tmp_path / "tone.mp3", tone, 44100, "mp3")
    kbps = {name: (tmp_path / f"{name}.mp3").stat().st_size * 8 / 6 / 1000 for name in ("rich", "tone")}
    assert kbps["rich"] > 200 and kbps["tone"] < 100  # variable bit rate at the highest quality


def test_bad_audio_and_format_are_refused(tmp_path: Path) -> None:
    with pytest.raises(PlenioUserError, match="Unknown export format"):
        write_audio(tmp_path / "x.ogg", noise(0.1), 44100, "ogg")
    with pytest.raises(PlenioUserError, match="mono or stereo"):
        write_audio(tmp_path / "x.flac", np.zeros((3, 100)), 44100)


def test_cover_art(tmp_path: Path) -> None:
    pytest.importorskip("PIL")
    from plenio.core.release import cover_jpeg

    image = np.random.default_rng(0).random((300, 500, 3))
    jpeg = cover_jpeg(image)
    assert jpeg[:3] == b"\xff\xd8\xff"
    import io

    from PIL import Image

    assert Image.open(io.BytesIO(jpeg)).size == (300, 300)  # square centre crop
    for kind in ("flac", "mp3"):  # written by Plenio itself (0.2.2; before: only with mutagen installed)
        path = tmp_path / f"c.{kind}"
        write_audio(path, noise(0.5), 44100, kind, TAGS)
        assert embed_cover(path, jpeg) is True
        assert embed_cover(path, cover_jpeg(image[::-1])) is True  # replaces, never adds a second picture
        tags, cover = read_tags(path)
        assert (
            cover == cover_jpeg(image[::-1]) and tags == read_tags(path)[0] and tags["title"] == "Neon Rain"
        )
        assert tags["album"] == TAGS["album"]  # the other tags are kept
    write_audio(tmp_path / "c.wav", noise(0.5), 44100, "wav")
    assert embed_cover(tmp_path / "c.wav", jpeg) is False


def id3_frames(data: bytes) -> tuple[int, list[tuple[bytes, bytes]]]:
    """Major version and (id, body) of the frames of an ID3v2.3 tag at the start of ``data``."""
    assert data[:3] == b"ID3"
    size = sum((b & 0x7F) << (7 * (3 - i)) for i, b in enumerate(data[6:10]))
    tag, frames, index = data[10 : 10 + size], [], 0
    while index + 10 <= len(tag) and tag[index]:
        length = int.from_bytes(tag[index + 4 : index + 8], "big")
        frames.append((tag[index : index + 4], tag[index + 10 : index + 10 + length]))
        index += 10 + length
    return data[3], frames


def test_mp3_covers_are_id3v23_front_covers(tmp_path: Path) -> None:
    """0.2.2 owner report: the cover was in the MP3 (ID3v2.4, UTF-8), but Windows and many players read
    no 2.4 tags. MP3s are written with ID3v2.3; a 2.4 tag is converted when the cover is embedded; the
    comment becomes a COMM frame (ffmpeg writes it as TXXX, which players do not show)."""
    av = pytest.importorskip("av")
    jpeg = b"\xff\xd8\xff\xe0" + bytes(200)
    tags = {**TAGS, "title": "Grüße ✓", "comment": "Schön"}
    path = tmp_path / "v23.mp3"
    write_audio(path, noise(0.5), 44100, "mp3", tags)
    embed_cover(path, jpeg)
    major, frames = id3_frames(path.read_bytes())
    ids = [frame_id for frame_id, _ in frames]
    assert major == 3 and ids.count(b"APIC") == 1 and b"COMM" in ids and b"TXXX" not in ids
    apic = dict(frames)[b"APIC"]
    assert apic.startswith(b"\x00image/jpeg\x00\x03") and apic.endswith(jpeg)  # Latin-1, front cover
    assert all(body[0] in (0, 1) for frame_id, body in frames if frame_id[:1] == b"T")  # no UTF-8 (2.4 only)
    assert read_tags(path)[0]["title"] == "Grüße ✓" and read_tags(path)[0]["comment"] == "Schön"
    # an ID3v2.4 file (ffmpeg's default, for example a file from elsewhere) is converted
    old = tmp_path / "v24.mp3"
    container = av.open(str(old), "w", format="mp3")
    container.metadata["title"] = "Grüße ✓"
    container.metadata["date"] = "2026-09-26"
    stream = container.add_stream("libmp3lame", rate=44100, layout="stereo")
    frame = av.AudioFrame.from_ndarray(np.zeros((2, 4410), np.float32), format="fltp", layout="stereo")
    frame.sample_rate, frame.pts = 44100, 0
    for packet in [*stream.encode(frame), *stream.encode(None)]:
        container.mux(packet)
    container.close()
    assert old.read_bytes()[3] == 4
    embed_cover(old, jpeg)
    major, frames = id3_frames(old.read_bytes())
    assert major == 3 and dict(frames)[b"TYER"] == b"\x002026" and [i for i, _ in frames].count(b"APIC") == 1
    tags_back, cover = read_tags(old)
    assert tags_back["title"] == "Grüße ✓" and cover == jpeg


# --- Phase 9 audit regressions ------------------------------------------------------------


def test_mp3_at_rates_lame_cannot_encode_is_converted(tmp_path: Path) -> None:
    """AUD-03: MP3 of 96 kHz audio crashed with a raw PyAV error (LAME encodes at most 48 kHz)."""
    from plenio.core.release import mp3_rate

    assert [mp3_rate(r) for r in (44100, 48000, 88200, 96000, 176400, 192000, 37800)] == [
        44100,
        48000,
        44100,
        48000,
        44100,
        48000,
        44100,
    ]
    x = noise(1.0, rate=96000)
    facts = write_audio(tmp_path / "hi.mp3", x, 96000, "mp3", {"title": "Hi-res"})
    assert facts["sample_rate"] == 48000 and facts["converted_from_rate"] == 96000
    _data, rate = decode(tmp_path / "hi.mp3")
    assert rate == 48000
    flac = write_audio(tmp_path / "hi.flac", x, 96000, "flac")
    assert flac["sample_rate"] == 96000 and "converted_from_rate" not in flac


def test_nan_audio_is_refused_and_no_partial_file_is_left(tmp_path: Path) -> None:
    """AUD-11: write_audio encoded NaN samples into garbage."""
    x = noise(0.5)
    x[0, 100] = np.nan
    for kind in ("flac", "mp3", "wav"):
        with pytest.raises(PlenioUserError, match="NaN or infinite"):
            write_audio(tmp_path / f"bad.{kind}", x, 44100, kind)
    assert list(tmp_path.iterdir()) == []


def test_one_base_name_for_all_files_of_a_release(tmp_path: Path) -> None:
    """AUD-04: files of one export got different numbers, and an earlier record could be overwritten."""
    from plenio.core.release import plan_release

    (tmp_path / "Song.mp3").write_bytes(b"old")
    (tmp_path / "Song.plenio.json").write_text("{}", encoding="utf-8")  # the record of an MP3-only export
    stem = plan_release(tmp_path, "Song", [".flac", " (original).flac", ".plenio.json"])
    assert stem.name == "Song (2)"  # Song.flac is free, but its record would overwrite Song.plenio.json
    assert plan_release(tmp_path, "Other", [".flac", ".plenio.json"]).name == "Other"
    assert plan_release(tmp_path, "Song", [".flac", ".plenio.json"], collision="overwrite").name == "Song"
    with pytest.raises(PlenioUserError, match="Song.plenio.json already exists"):
        plan_release(tmp_path, "Song", [".flac", ".plenio.json"], collision="error")
    escaped = plan_release(tmp_path / "sub", "../../x", [".flac"])  # '..' parts become 'Untitled'
    assert (tmp_path / "sub").resolve() in escaped.resolve().parents
    assert plan_release(tmp_path, "a/b/Song", [".flac"]) == tmp_path / "a" / "b" / "Song"
