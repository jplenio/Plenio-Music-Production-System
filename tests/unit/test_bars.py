"""Finding the bars of a score in audio whose tempo wanders (Song API 1.4, ``GET /jobs/{id}/bars``): on made-up
audio, where the truth is known. Moved with ``plenio/core/bars.py`` from the SoundCraft add-in, where it was measured
on the owner's songs; the release record's part is new here."""

from __future__ import annotations

import json
import unittest
from pathlib import Path

import numpy as np
import pytest

from plenio.core import bars as beats

SR = beats.SAMPLE_RATE


def wandering(score_seconds: np.ndarray, depth: float, periods: float = 1.0) -> np.ndarray:
    """A take's time for a time of the score: a slow sine around the straight line, as YuE2 renders do."""
    return score_seconds + depth * np.sin(2 * np.pi * periods * score_seconds / score_seconds[-1])


def clicks(times: np.ndarray, seconds: float, accent_every: int = 4) -> np.ndarray:
    """A short noise burst on every time, louder on every first of a bar, on a little steady noise."""
    rng = np.random.default_rng(3)
    audio = 0.002 * rng.standard_normal(int(seconds * SR)).astype(np.float32)
    burst = (rng.standard_normal(400) * np.exp(-np.arange(400) / 80)).astype(np.float32)
    for k, t in enumerate(times):
        at = int(t * SR)
        if 0 <= at < len(audio) - 400:
            audio[at : at + 400] += (1.0 if k % accent_every == 0 else 0.6) * burst
    return audio


class Pulses(unittest.TestCase):
    def test_a_pulse_is_what_the_meter_feels(self) -> None:
        pulses, firsts = beats.pulses_of([(4, 4), (2, 4)])
        self.assertEqual(pulses.tolist(), [0, 1, 2, 3, 4, 5, 6])
        self.assertEqual(firsts.tolist(), [0, 4, 6])
        pulses, firsts = beats.pulses_of([(6, 8), (9, 8)])
        self.assertEqual(pulses.tolist(), [0, 1.5, 3, 4.5, 6, 7.5])
        self.assertEqual(firsts.tolist(), [0, 2, 5])
        pulses, firsts = beats.pulses_of([(7, 8), (3, 8)])
        self.assertEqual(pulses.tolist(), [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 5])
        self.assertEqual(firsts.tolist(), [0, 7, 8])


class Believable(unittest.TestCase):
    meters = [(4, 4), (4, 4), (4, 4)]

    def test_bars_near_the_scores_tempo_in_order(self) -> None:
        self.assertTrue(beats.believable([0.0, 2.0, 4.1, 6.0], self.meters, 120.0))

    def test_anything_else_is_not(self) -> None:
        for bars in (
            [0.0, 2.0, 4.0],  # a measure short
            [0.0, 2.0, 2.0, 4.0],  # not in order
            [0.0, 2.0, 5.0, 7.0],  # a bar far too long
            [0.0, 2.0, float("nan"), 6.0],
        ):
            self.assertFalse(beats.believable(bars, self.meters, 120.0), bars)


class FindBars(unittest.TestCase):
    def find(self, meters, bpm, depth, warp, shift=0.0, wanted=None, harmony=None, anchors=None):
        pulses, firsts = beats.pulses_of(meters)
        score = pulses * 60.0 / bpm
        truth = wandering(score, depth) + shift
        audio = clicks(truth, float(truth[-1]) + 2.0, accent_every=len(pulses) // len(meters))
        found = beats.find_bars(beats.onset_envelope(audio), meters, bpm, warp, harmony, wanted, anchors)
        return found, truth[firsts]

    def test_bars_follow_a_tempo_that_wanders(self) -> None:
        # A quarter of a second off the straight line: what no single tempo could follow.
        found, truth = self.find([(4, 4)] * 60, 84.0, 0.25, [1.0, 0.0], shift=0.5)
        self.assertLess(np.abs(found - truth)[1:-1].max(), 0.012)

    def test_mixed_meters_keep_their_measures(self) -> None:
        meters = ([(4, 4)] * 7 + [(2, 4)]) * 6
        found, truth = self.find(meters, 96.0, 0.2, [1.0, 0.0], shift=0.3)
        self.assertLess(np.abs(found - truth)[1:-1].max(), 0.015)

    def test_six_eight_goes_by_its_dotted_quarters(self) -> None:
        found, truth = self.find([(6, 8)] * 60, 100.0, 0.15, [1.0, 0.0], shift=0.3)
        self.assertLess(np.abs(found - truth)[1:-1].max(), 0.015)

    def test_a_warp_off_by_a_second_is_found_back(self) -> None:
        found, truth = self.find([(4, 4)] * 40, 90.0, 0.1, [1.0, 1.0], shift=0.5)
        self.assertLess(np.abs(found - truth)[1:-1].max(), 0.02)

    def test_the_singing_says_which_pulse_is_which(self) -> None:
        # Clicks alone repeat with every beat; a warp a beat and a bit off would stay a whole beat off.
        meters, bpm, depth = [(4, 4)] * 30, 90.0, 0.05
        pulses, firsts = beats.pulses_of(meters)
        score = pulses * 60.0 / bpm
        truth = wandering(score, depth)
        beat = 60.0 / bpm
        audio = clicks(truth, float(truth[-1]) + 2.0)
        envelope = beats.onset_envelope(audio)
        marks = np.column_stack([truth[::2], score[::2]])
        warp = [1.0, beat * 0.9]
        plain = beats.find_bars(envelope, meters, bpm, warp)
        sung = beats.find_bars(envelope, meters, bpm, warp, anchors=marks)
        self.assertGreater(np.median(np.abs(plain - truth[firsts])), beat * 0.5)
        self.assertLess(np.abs(sung - truth[firsts])[1:-1].max(), 0.02)

    def test_the_scores_notes_say_which_pulse_is_which(self) -> None:
        # Two chords in turn, bar by bar: only the right bars have the score's chord on them.
        meters, bpm, depth = [(4, 4)] * 30, 90.0, 0.05
        pulses, firsts = beats.pulses_of(meters)
        score = pulses * 60.0 / bpm
        truth = wandering(score, depth)
        beat = 60.0 / bpm
        total = float(truth[-1]) + 2.0
        audio = clicks(truth, total)
        rate = 20.0
        chroma = np.zeros((int(total * rate), 12))
        wanted = np.zeros((len(pulses), 12))
        a, b = [0, 4, 7], [2, 5, 9]
        for j, t in enumerate(truth):
            chord = a if (j // 4) % 2 == 0 else b
            v = np.zeros(12)
            v[chord] = 1
            v = (v - v.mean()) / np.linalg.norm(v - v.mean())
            start = int(t * rate)
            chroma[start : start + int(beat * rate) + 1] = v
            wanted[j] = v
        # Off by a whole beat: only the chords can tell.
        warp = [1.0, beat]
        found = beats.find_bars(
            beats.onset_envelope(audio), meters, bpm, warp, beats.Harmony(chroma, rate), wanted
        )
        self.assertLess(np.abs(found - truth[firsts])[1:-1].max(), 0.02)

    def test_where_nothing_sounds_the_tempo_goes_on(self) -> None:
        # The score starts before the audio, and the audio is silent in the middle.
        meters = [(4, 4)] * 40
        bpm = 100.0
        pulses, firsts = beats.pulses_of(meters)
        score = pulses * 60.0 / bpm
        truth = score - 1.5
        keep = (truth < 30) | (truth > 45)
        audio = clicks(truth[keep], float(truth[-1]) + 2.0)
        found = beats.find_bars(beats.onset_envelope(audio), meters, bpm, [1.0, -1.5])
        self.assertLess(np.abs(found - truth[firsts])[2:-2].max(), 0.05)
        self.assertTrue(beats.believable(found, meters, bpm))


def bar_chord(pulse: int, pulses_per_bar: int) -> np.ndarray:
    """Two chords in turn, bar by bar, as pitch classes: a unit vector without its mean."""
    v = np.zeros(12)
    v[[0, 4, 7] if (pulse // pulses_per_bar) % 2 == 0 else [2, 5, 9]] = 1
    return (v - v.mean()) / np.linalg.norm(v - v.mean())


def bar_chords(truth: np.ndarray, pulses_per_bar: int, total: float, rate: float = 20.0):
    """The chords where the truth has them: the audio's pitch classes, and the score's on each pulse."""
    chroma = np.zeros((int(total * rate), 12))
    wanted = np.zeros((len(truth), 12))
    for j, t in enumerate(truth):
        wanted[j] = bar_chord(j, pulses_per_bar)
        if j + 1 < len(truth):
            chroma[int(max(0, t) * rate) : int(truth[j + 1] * rate) + 1] = wanted[j]
    return chroma, wanted


def score_frames(score: np.ndarray, pulses_per_bar: int, rate: float = 20.0) -> np.ndarray:
    """The score's pitch classes as frames at its own tempo."""
    notes = np.zeros((int(score[-1] * rate) + 1, 12))
    for j in range(len(score) - 1):
        notes[int(score[j] * rate) : int(score[j + 1] * rate) + 1] = bar_chord(j, pulses_per_bar)
    return notes


class TheStart(unittest.TestCase):
    """A song's first bars, where the session's bars begin: reckoned from where the song is sure."""

    meters = [(4, 4)] * 40
    bpm = 84.0

    def setUp(self) -> None:
        self.pulses, self.firsts = beats.pulses_of(self.meters)
        self.score = self.pulses * 60.0 / self.bpm
        self.beat = 60.0 / self.bpm

    def free_beginning(self, truth: np.ndarray, measures: int = 8) -> np.ndarray:
        """Strong onsets at 8 % slower than the song in the first measures, then the song."""
        cut = float(truth[self.firsts[measures]])
        audio = clicks(truth[truth >= cut], float(truth[-1]) + 2.0)
        burst = clicks(np.arange(0.0, cut, self.beat * 1.08), cut + 0.05)
        audio[: len(burst)] += burst
        return audio

    def test_onsets_at_another_tempo_do_not_pull_the_first_bars_away(self) -> None:
        truth = self.score + 0.3
        envelope = beats.onset_envelope(self.free_beginning(truth))
        found = beats.find_bars(envelope, self.meters, self.bpm, [1.0, 0.3])
        # These clicks pull far harder than a song's onsets do; the first search alone lies 1.8 s off here.
        self.assertLess(np.abs(found - truth[self.firsts]).max(), 0.12)
        self.assertLess(np.abs(found - truth[self.firsts])[9:-1].max(), 0.01)

    def test_the_tempo_stays_even_through_them(self) -> None:
        truth = self.score + 0.3
        found = beats.find_bars(
            beats.onset_envelope(self.free_beginning(truth)), self.meters, self.bpm, [1.0, 0.3]
        )
        tempo = 4 * 60.0 / np.diff(found)
        self.assertLess(np.abs(tempo[:9] / self.bpm - 1).max(), 0.02)

    def test_a_beginning_that_really_is_slower_stays_when_the_pitches_say_so(self) -> None:
        # Six per cent slower for eight bars, then the song, with the chords where this take has them.
        stretch = np.where(self.score < self.score[self.firsts[8]], 1.06, 1.0)
        truth = np.concatenate([[0.0], np.cumsum(np.diff(self.score) * stretch[:-1])]) + 0.3
        total = float(truth[-1]) + 2.0
        chroma, wanted = bar_chords(truth, 4, total)
        harmony = beats.Harmony(chroma, 20.0, score_frames(self.score, 4))
        found = beats.find_bars(
            beats.onset_envelope(clicks(truth, total)), self.meters, self.bpm, [1.03, 0.3], harmony, wanted
        )
        errors = np.abs(found - truth[self.firsts])[1:-1]
        # The bar line of the sudden change is smoothed a little; no song changes tempo at a stroke.
        self.assertLess(errors[7], 0.06)
        self.assertLess(np.delete(errors, 7).max(), 0.01)

    def test_a_song_sure_from_its_first_bar_is_left_alone(self) -> None:
        truth = wandering(self.score, 0.05) + 0.3
        envelope = beats.onset_envelope(clicks(truth, float(truth[-1]) + 2.0))
        found = beats.find_bars(envelope, self.meters, self.bpm, [1.0, 0.3])
        self.assertLess(np.abs(found - truth[self.firsts])[1:-1].max(), 0.01)

    def test_a_line_seconds_off_at_the_start_still_finds_the_song(self) -> None:
        # As one of the owner's songs: the true place lies more than 2.5 s from where the warp puts it.
        truth = wandering(self.score, 0.05) - 2.7
        total = float(truth[-1]) + 2.0
        chroma, wanted = bar_chords(truth, 4, total)
        harmony = beats.Harmony(chroma, 20.0, score_frames(self.score, 4))
        envelope = beats.onset_envelope(clicks(truth[truth >= 0], total))
        found = beats.find_bars(envelope, self.meters, self.bpm, [1.0, 0.3], harmony, wanted)
        self.assertLess(np.abs(found - truth[self.firsts])[1:-1].max(), 0.02)

    def test_a_song_with_nothing_sure_keeps_what_was_found(self) -> None:
        # Silence: no error, and bars that go on at the score's tempo.
        envelope = np.zeros(int(self.score[-1] * beats.FRAMES_PER_SECOND) + 400)
        found = beats.find_bars(envelope, self.meters, self.bpm, [1.0, 0.0])
        self.assertTrue(beats.believable(found, self.meters, self.bpm))


class Measure(unittest.TestCase):
    """What the route answers, with Plenio's modules made up: what it does when the song does not meet."""

    class Score:
        meters = [(4, 4)] * 30
        tempo = 90
        vocal = ins = ()

    def modules(self, estimate=None):
        score = self.Score

        class Align:
            RATE = 20

            @staticmethod
            def estimate(_path, _text):
                return estimate

            @staticmethod
            def _audio_chroma(_path):
                return np.ones((4000, 12)) / np.sqrt(12)

            @staticmethod
            def _score_chroma(_score, count):
                return np.ones((count, 12)) / np.sqrt(12)

        class Canonical:
            @staticmethod
            def from_abc(_text):
                return score

        return Align, Canonical

    def setUp(self) -> None:
        self.load, self.match = beats._load_mono, beats._match
        pulses, _ = beats.pulses_of(self.Score.meters)
        truth = wandering(pulses * 60.0 / self.Score.tempo, 0.1)
        beats._load_mono = lambda _path: clicks(truth, float(truth[-1]) + 2.0)

    def tearDown(self) -> None:
        beats._load_mono, beats._match = self.load, self.match

    def test_a_song_that_meets_its_score_gets_its_bars(self) -> None:
        answer = beats.measure("x", "abc", [1.0, 0.0], [], *self.modules())
        self.assertEqual(answer["warp"], [1.0, 0.0])
        bars = answer["bars"]
        self.assertEqual((len(bars["score"]), len(bars["audio"]), len(bars["meters"])), (31, 31, 30))
        self.assertEqual(bars["meters"][0], [4, 4])
        self.assertAlmostEqual(bars["score"][1], 4 * 60 / 90, places=5)

    def test_without_a_warp_the_estimate_gives_it(self) -> None:
        answer = beats.measure("x", "abc", None, [], *self.modules({"warp": [1.0, 0.0]}))
        self.assertEqual(answer["warp"], [1.0, 0.0])
        self.assertIsNotNone(answer["bars"])

    def test_without_a_warp_or_an_estimate_nothing_is_said(self) -> None:
        self.assertEqual(beats.measure("x", "abc", None, [], *self.modules()), {"warp": None, "bars": None})

    def test_bars_the_notes_do_not_fit_are_not_believed(self) -> None:
        # Clearly worse on the bars than on the straight line.
        results = iter([0.2, 0.3])
        beats._match = lambda *_args: next(results)
        answer = beats.measure("x", "abc", [1.0, 0.0], [], *self.modules())
        self.assertIsNone(answer["bars"])
        self.assertEqual(answer["warp"], [1.0, 0.0])


# --- a release record's take ----------------------------------------------------------------------------------


def record(score: str = "X:1", warp: object = (1.01, -0.5)) -> dict:
    return {
        "schema": "plenio.record/1",
        "documents": {"score": {"text": score, "state": "auto"}},
        "files": [
            {"name": "Song (original).flac", "role": "original"},
            {"name": "Song.flac"},
            {"name": "Song (lines).srt", "role": "subtitles"},
        ],
        "timing": [
            {
                "warp": list(warp) if warp is not None else None,
                "lines": [
                    {
                        "text": "a line",
                        "start": 1.0,
                        "end": 2.0,
                        "units": [[1.0, 1, 0.5], [1.4, 3, 0.9], ["x", 1, 2]],
                    },
                    {"text": "no units", "start": 3.0, "end": 4.0},
                ],
            }
        ],
    }


def test_a_record_gives_its_warp_anchors_score_and_audio(tmp_path: Path) -> None:
    data = record()
    assert beats.record_warp(data) == [1.01, -0.5]
    assert beats.record_anchors(data) == [[1.0, 0.5], [1.4, 0.9]]
    assert beats.record_score(data) == "X:1"
    (tmp_path / "Song.flac").write_bytes(b"flac")
    assert beats.record_audio(tmp_path / "Song.plenio.json", data) == tmp_path / "Song.flac"
    for broken in (
        {},
        {"timing": "x"},
        {"timing": [{"warp": [1, float("nan")]}]},
        {"timing": [{"warp": [True, 0]}]},
    ):
        assert beats.record_warp(broken) is None
        assert beats.record_anchors(broken) == []
    assert beats.record_score({"documents": {"score": "X:2"}}) == "X:2"
    assert beats.record_audio(tmp_path / "x.plenio.json", {"files": [{"name": "../Song.flac"}]}) is None


def test_the_bars_are_measured_once_and_kept_beside_the_record(tmp_path: Path) -> None:
    path = tmp_path / "Song.plenio.json"
    path.write_text(json.dumps(record()), encoding="utf-8")
    (tmp_path / "Song.flac").write_bytes(b"flac")
    calls: list[tuple] = []

    def fake(audio, score, warp, anchors):
        calls.append((Path(audio).name, score, warp, anchors))
        return {"warp": warp, "bars": {"score": [0.0, 2.0], "audio": [0.5, 2.6], "meters": [[4, 4]]}}

    first = beats.record_bars(path, measure_fn=fake)
    again = beats.record_bars(path, measure_fn=fake)
    assert first == again and first["bars"]["audio"] == [0.5, 2.6]
    assert calls == [("Song.flac", "X:1", [1.01, -0.5], [[1.0, 0.5], [1.4, 0.9]])]
    assert (
        json.loads((tmp_path / "Song.bars.json").read_text(encoding="utf-8"))["schema"] == beats.BARS_SCHEMA
    )
    # another audio file in its place: measured anew
    (tmp_path / "Song.flac").write_bytes(b"flac, rendered again")
    beats.record_bars(path, measure_fn=fake)
    assert len(calls) == 2


def test_a_record_without_a_score_or_audio_says_why(tmp_path: Path) -> None:
    path = tmp_path / "Song.plenio.json"
    path.write_text(json.dumps(record(score="")), encoding="utf-8")
    assert beats.record_bars(path)["why"] == "the song's audio file is not beside its record"
    (tmp_path / "Song.flac").write_bytes(b"flac")
    answer = beats.record_bars(path, measure_fn=lambda *a: pytest.fail("no score: nothing to measure"))
    assert answer == {"warp": [1.01, -0.5], "bars": None, "why": "the record has no score"}
