"""The analysis track of a song (phase 7.3, PD §9.4): what the visuals know of the music ahead of time.

Once per song the player decodes its audio (PyAV and numpy, which ComfyUI's Python has), computes the energy of three
bands at 50 Hz, their onsets, the beats and downbeats, the sections and the drops, and keeps the result in its cache
(``plenio.analysis/1``, about 50 KB a song). The visuals read it as a *cue* each frame (``visuals/conductor.ts``).

- Beats and downbeats come from the release's measured bars (``<name>.bars.json``, written by the Song API or the
  editor; the player only reads it) when the song has them, else from the autocorrelation of the onset envelope.
- Sections come from the novelty of the band energies (the record holds no section times the player could trust).
- A *drop* is a downbeat where the low band jumps after at least two quieter bars.
- ``confidence`` (0..1) says how sure the beats are: measured bars 1; otherwise how clearly one tempo stands out. The
  Director falls back to *Match the music* below a threshold (7.6).

Other music (not made with Plenio) gets the same track from its audio alone.
"""

from __future__ import annotations

import base64
import hashlib
import json
import math
import threading
from pathlib import Path
from typing import Any

SCHEMA = "plenio.analysis/1"
RATE = 50
"""Frames a second of the band envelopes."""
DECODE_RATE = 22050
BANDS = {"low": (30.0, 150.0), "mid": (150.0, 2500.0), "high": (2500.0, 11000.0)}
MAX_SECONDS = 15 * 60
"""Longer audio is analysed for its first fifteen minutes."""


def decode(audio: Path, rate: int = DECODE_RATE) -> Any:
    """The audio as mono float32 at ``rate`` (``None`` when it cannot be decoded here)."""
    try:
        import av
        import numpy as np
    except ImportError:
        return None
    chunks = []
    total = 0
    try:
        with av.open(str(audio)) as container:
            stream = container.streams.audio[0]
            resampler = av.AudioResampler(format="flt", layout="mono", rate=rate)
            for frame in container.decode(stream):
                for out in resampler.resample(frame):
                    data = out.to_ndarray().reshape(-1).astype(np.float32)
                    chunks.append(data)
                    total += len(data)
                if total > MAX_SECONDS * rate:
                    break
    except Exception:  # noqa: BLE001 - an unreadable file has no track
        return None
    return np.concatenate(chunks) if chunks else None


FRAMES_PER_BLOCK = 2000
"""Frames of the band analysis computed together (about 16 MB of spectrum)."""


def band_envelopes(mono: Any, rate: int, out_rate: int = RATE) -> dict[str, Any]:
    """Energy of three bands at ``out_rate`` Hz, each scaled to 0..255 by its own 99th percentile."""
    import numpy as np

    hop, size = max(1, rate // out_rate), 2048
    padded = np.pad(mono.astype(np.float32), (size // 2, size // 2))
    frames = np.lib.stride_tricks.sliding_window_view(padded, size)[::hop]
    window = np.hanning(size).astype(np.float32)
    hz = np.fft.rfftfreq(size, 1 / rate)
    masks = {name: (hz >= lo) & (hz < hi) for name, (lo, hi) in BANDS.items()}
    energy = {name: np.empty(len(frames), dtype=np.float64) for name in BANDS}
    # a block of frames at a time: a 15-minute song would need gigabytes for its whole spectrum at once
    for start in range(0, len(frames), FRAMES_PER_BLOCK):
        power = np.abs(np.fft.rfft(frames[start : start + FRAMES_PER_BLOCK] * window, axis=1)) ** 2
        for name, mask in masks.items():
            energy[name][start : start + len(power)] = np.sqrt(power[:, mask].sum(axis=1))
    out = {}
    for name in BANDS:
        e = energy[name]
        top = max(float(np.percentile(e, 99)), 1e-9)
        out[name] = np.clip(255 * e / top, 0, 255).astype(np.uint8)
    return out


def flux(envelope: Any) -> Any:
    import numpy as np

    e = envelope.astype(np.float32)
    return np.maximum(np.diff(e, prepend=e[:1]), 0.0)


def onsets(envelope: Any, out_rate: int = RATE, refractory: float = 0.09) -> list[float]:
    """Moments the envelope rises sharply: positive flux above 1.5 x its local median, at least 90 ms apart."""
    import numpy as np

    f = flux(envelope)
    if len(f) < 3:
        return []
    window = 2 * out_rate + 1
    padded = np.pad(f, (out_rate, out_rate), mode="edge")
    local = np.median(np.lib.stride_tricks.sliding_window_view(padded, window), axis=1)
    peaks = (f > 1.5 * local + 6) & (f >= np.roll(f, 1)) & (f > np.roll(f, -1))
    picked: list[float] = []
    last = -1.0
    for i in np.flatnonzero(peaks):
        t = i / out_rate
        if t - last >= refractory:
            picked.append(round(float(t), 3))
            last = t
    return picked


def tempo(novelty: Any, out_rate: int = RATE) -> tuple[float, float]:
    """The beat period in seconds (60 to 200 BPM) by the autocorrelation of the onset envelope, and how clearly it
    stands out (0..1)."""
    import numpy as np

    x = novelty.astype(np.float64) - float(novelty.mean())
    if not np.any(x):
        return 0.5, 0.0
    n = len(x)
    spectrum = np.fft.rfft(x, 2 * n)
    ac = np.fft.irfft(spectrum * np.conj(spectrum))[:n]
    ac /= max(ac[0], 1e-9)
    lo, hi = int(out_rate * 60 / 200), int(out_rate * 60 / 60)
    if hi >= n:
        return 0.5, 0.0
    lags = np.arange(lo, hi + 1)
    # a lag scores with its double too (a beat is a beat at twice the period), leaning to the usual 120 BPM
    double = ac[np.minimum(n - 1, 2 * lags)]
    weight = np.exp(-0.5 * (np.log2(lags / (out_rate * 0.5)) / 1.0) ** 2)
    score = (ac[lags] + 0.5 * double) * weight
    best = int(lags[int(np.argmax(score))])
    # the peak between its neighbours, for less than a frame's error
    if 1 <= best < n - 1:
        a, b, c = ac[best - 1], ac[best], ac[best + 1]
        shift = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) != 0 else 0.0
    else:
        shift = 0.0
    clearness = float(np.clip(ac[best] / max(float(np.max(ac[lo : hi + 1])), 1e-9), 0, 1)) * float(
        np.clip(ac[best] * 2, 0, 1)
    )
    return (best + float(np.clip(shift, -0.5, 0.5))) / out_rate, clearness


def beat_grid(novelty: Any, period: float, seconds: float, out_rate: int = RATE) -> list[float]:
    """Beats every ``period`` from the phase that lines up best with the onset envelope, each moved to the strongest
    onset within 60 ms (a song's tempo drifts a little)."""
    import numpy as np

    step = period * out_rate
    phases = np.arange(0, step, 0.25)
    best, top = 0.0, -1.0
    for phase in phases:
        at = np.arange(phase, len(novelty), step)
        total = float(novelty[np.clip(np.round(at).astype(int), 0, len(novelty) - 1)].sum())
        if total > top:
            best, top = float(phase), total
    beats = []
    reach = int(0.06 * out_rate)
    t = best
    while t < len(novelty):
        i = int(round(t))
        lo, hi = max(0, i - reach), min(len(novelty), i + reach + 1)
        j = lo + int(np.argmax(novelty[lo:hi])) if novelty[lo:hi].max() > 0 else i
        beats.append(round(j / out_rate, 3))
        t += step
    return [b for b in beats if b <= seconds]


def track_beats(
    novelty: Any, period: float, seconds: float, out_rate: int = RATE, tightness: float = 100.0
) -> list[float]:
    """Beats by dynamic programming (Ellis 2007): each frame's best path is its onset strength plus the best earlier
    beat half to twice a period back, a penalty growing with the log of how far the gap is from the period - so
    the beats follow a tempo that drifts, and land on the onsets."""
    import numpy as np

    o = novelty.astype(np.float64)
    if not np.any(o):
        return beat_grid(novelty, period, seconds, out_rate)
    o = o / max(float(o.std()), 1e-9)
    p = period * out_rate
    n = len(o)
    score = o.copy()
    back = np.full(n, -1, dtype=np.int64)
    lo, hi = int(round(p / 2)), int(round(2 * p))
    gaps = np.arange(lo, hi + 1)
    penalty = tightness * np.log(gaps / p) ** 2
    for t in range(lo, n):
        start = t - gaps
        valid = start >= 0
        if not np.any(valid):
            continue
        candidates = score[start[valid]] - penalty[valid]
        k = int(np.argmax(candidates))
        if candidates[k] > 0:
            score[t] = o[t] + candidates[k]
            back[t] = start[valid][k]
    tail = max(0, n - int(round(p)))
    t = tail + int(np.argmax(score[tail:]))
    path = []
    while t >= 0:
        path.append(t)
        t = int(back[t])
    return [round(i / out_rate, 3) for i in reversed(path) if i / out_rate <= seconds]


def downbeats_of(beats: list[float], low: Any, per_bar: int = 4, out_rate: int = RATE) -> list[float]:
    """Every ``per_bar``-th beat, from the offset whose beats carry the most low-band energy (the kick of a bar's
    first beat)."""
    import numpy as np

    if not beats:
        return []
    best, top = 0, -1.0
    for offset in range(per_bar):
        picked = beats[offset::per_bar]
        idx = np.clip((np.array(picked) * out_rate).astype(int), 0, len(low) - 1)
        total = float(low[idx].astype(np.float64).mean()) if len(idx) else 0.0
        if total > top:
            best, top = offset, total
    return beats[best::per_bar]


def from_bars(bars: dict[str, Any], seconds: float | None = None) -> tuple[list[float], list[float]] | None:
    """Beats and downbeats from measured bars (``bars.audio`` and ``bars.meters``), ``None`` without them. Bars at or
    past the end of the analysed audio (a stale bars file, a song longer than what is analysed) are left out, and a
    time that does not move on is dropped."""
    raw = [
        float(x) for x in (bars.get("audio") or []) if isinstance(x, (int, float)) and math.isfinite(float(x))
    ]
    times: list[float] = []
    for x in raw:
        if (seconds is None or x < seconds) and (not times or x > times[-1]):
            times.append(x)
    meters = bars.get("meters") or []
    if len(times) < 2:
        return None
    beats: list[float] = []
    for k, start in enumerate(times):
        end = times[k + 1] if k + 1 < len(times) else start + (start - times[k - 1])
        count = int(meters[k][0]) if k < len(meters) and isinstance(meters[k], list) and meters[k] else 4
        count = max(1, min(16, count))
        beats += [round(start + (end - start) * j / count, 3) for j in range(count)]
    return beats, [round(t, 3) for t in times]


def sections_of(
    bands: dict[str, Any], downbeats: list[float], seconds: float, out_rate: int = RATE
) -> list[dict[str, Any]]:
    """Sections by the novelty of the band energies over four-bar blocks: a new section where the energy moves most,
    at least about 8 s apart; each with its energy 0..1 (the mean of the bands against the song's loudest block)."""
    import numpy as np

    stack = np.stack([bands[k].astype(np.float64) for k in ("low", "mid", "high")])
    edges = downbeats[::4] if len(downbeats) >= 8 else list(np.arange(0.0, seconds, 8.0))
    if not edges or edges[0] > 0.5:
        edges = [0.0, *edges]
    edges = [*edges, seconds]
    blocks = []
    for a, b in zip(edges[:-1], edges[1:], strict=True):
        lo, hi = int(a * out_rate), max(int(a * out_rate) + 1, int(b * out_rate))
        blocks.append(stack[:, lo:hi].mean(axis=1) if hi <= stack.shape[1] else stack[:, lo:].mean(axis=1))
    if not blocks:
        return [{"name": "song", "start": 0.0, "end": round(seconds, 3), "energy": 0.5}]
    level = np.array([float(b.mean()) for b in blocks])
    change = [0.0] + [float(np.abs(blocks[k] - blocks[k - 1]).mean()) for k in range(1, len(blocks))]
    threshold = max(8.0, float(np.percentile(change, 70)))
    cuts = [0]
    for k in range(1, len(blocks)):
        if change[k] >= threshold and edges[k] - edges[cuts[-1]] >= 7.5:
            cuts.append(k)
    cuts.append(len(blocks))
    loudest = max(float(level.max()), 1e-9)
    out: list[dict[str, Any]] = []
    for n, (a, b) in enumerate(zip(cuts[:-1], cuts[1:], strict=True)):
        energy = float(level[a:b].mean()) / loudest
        out.append({"name": f"part {n + 1}", "start": round(float(edges[a]), 3), "end": round(float(edges[b]), 3),
                    "energy": round(energy, 3)})  # fmt: skip
    # the loud ones are the song's choruses, the quiet ones its verses (the Director pairs them by kind)
    if len(out) >= 3:
        high = float(np.percentile([s["energy"] for s in out], 60))
        for s in out:
            s["kind"] = "high" if float(s["energy"]) >= high else "low"
    return out


def drops_of(low: Any, downbeats: list[float], out_rate: int = RATE) -> list[dict[str, Any]]:
    """A downbeat where the low band's next bar is much louder than the two bars before it, which were quiet."""
    import numpy as np

    out: list[dict[str, Any]] = []
    for k in range(2, len(downbeats) - 1):
        a, b, c, d = (
            int(x * out_rate) for x in (downbeats[k - 2], downbeats[k], downbeats[k], downbeats[k + 1])
        )
        before = float(low[a:b].astype(np.float64).mean()) if b > a else 0.0
        after = float(low[c:d].astype(np.float64).mean()) if d > c else 0.0
        if after > 2.0 * before + 25 and before < 90:
            drop: dict[str, Any] = {
                "t": downbeats[k],
                "kind": "drop",
                "strength": round(min(1.0, (after - before) / 200), 3),
            }
            # one jump is one drop: of two within two bars, the stronger (a jump inside a bar shows on two downbeats)
            if out and k - int(out[-1]["k"]) <= 2:
                if float(drop["strength"]) > float(out[-1]["strength"]):
                    out[-1] = {**drop, "k": k}
                continue
            out.append({**drop, "k": k})
    return [{key: value for key, value in d.items() if key != "k"} for d in out]


def _bpm(beats: list[float]) -> float | None:
    """The tempo from the median beat length (``None`` with too few beats, or beats that do not move on)."""
    import numpy as np

    if len(beats) <= 2:
        return None
    step = float(np.median(np.diff(beats)))
    return round(60 / step, 2) if step > 0 else None


def analyse(mono: Any, rate: int = DECODE_RATE, bars: dict[str, Any] | None = None) -> dict[str, Any]:
    """The track of ``mono`` audio (and its measured bars, when known)."""
    import numpy as np

    seconds = len(mono) / rate
    bands = band_envelopes(mono, rate)
    novelty = flux(bands["low"]).astype(np.float64) + 0.6 * flux(bands["mid"]).astype(np.float64)
    measured = from_bars(bars, seconds) if bars else None
    if measured:
        beats, downbeats = measured
        confidence = 1.0
        source = "bars"
    else:
        period, clearness = tempo(novelty)
        beats = track_beats(novelty, period, seconds)
        downbeats = downbeats_of(beats, bands["low"])
        confidence = round(clearness, 3)
        source = "audio"
    return {
        "schema": SCHEMA,
        "rate": RATE,
        "seconds": round(seconds, 3),
        "source": source,
        "confidence": confidence,
        "bpm": _bpm(beats),
        "beats": beats,
        "downbeats": downbeats,
        "sections": sections_of(bands, downbeats, seconds),
        "bands": {k: base64.b64encode(v.tobytes()).decode("ascii") for k, v in bands.items()},
        "onsets": {"low": onsets(bands["low"]), "high": onsets(bands["high"])},
        "peaks": drops_of(bands["low"], downbeats),
    }


def measured_bars(record: Path | None) -> dict[str, Any] | None:
    """The measured bars kept beside a release record (``<name>.bars.json``), read only; ``None`` without them."""
    if record is None:
        return None
    name = record.name.removesuffix(".plenio.json")
    try:
        kept = json.loads(record.with_name(name + ".bars.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    answer = kept.get("answer") if isinstance(kept, dict) else None
    bars = answer.get("bars") if isinstance(answer, dict) else None
    return bars if isinstance(bars, dict) else None


_COMPUTING = threading.Lock()
"""One track computed at a time: a few requests for long songs at once would each take hundreds of megabytes."""


def track(audio: Path, cache: Path, record: Path | None = None) -> dict[str, Any] | None:
    """The song's track, computed once and kept in ``cache`` until its audio (or measured bars) change; one at a
    time (a request that waited finds the track the one before it computed)."""
    found = _cached(audio, cache, record)
    if found is not None:
        return found
    with _COMPUTING:
        return _cached(audio, cache, record) or _compute(audio, cache, record)


def _key(audio: Path, cache: Path, record: Path | None) -> Path:
    stat = audio.stat()
    bars_file = record.with_name(record.name.removesuffix(".plenio.json") + ".bars.json") if record else None
    bars_stamp = int(bars_file.stat().st_mtime) if bars_file and bars_file.exists() else 0
    stamp = f"{SCHEMA}|{audio}|{stat.st_size}|{int(stat.st_mtime)}|{bars_stamp}"
    return cache / f"analysis-{hashlib.sha1(stamp.encode()).hexdigest()[:16]}.json"


def _cached(audio: Path, cache: Path, record: Path | None) -> dict[str, Any] | None:
    try:
        found: dict[str, Any] = json.loads(_key(audio, cache, record).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    return found if found.get("schema") == SCHEMA else None


def _compute(audio: Path, cache: Path, record: Path | None) -> dict[str, Any] | None:
    key = _key(audio, cache, record)
    mono = decode(audio)
    if mono is None or len(mono) < DECODE_RATE:
        return None
    result = analyse(mono, DECODE_RATE, measured_bars(record))
    if not all(math.isfinite(float(x)) for x in result["beats"]):
        return None
    try:
        cache.mkdir(parents=True, exist_ok=True)
        temp = key.with_suffix(".tmp")
        # no NaN or infinity: a browser's JSON.parse refuses them (and the cache would keep them)
        temp.write_text(json.dumps(result, allow_nan=False), encoding="utf-8")
        temp.replace(key)
    except (OSError, ValueError):
        pass
    try:
        json.dumps(result, allow_nan=False)
    except ValueError:
        return None
    return result
