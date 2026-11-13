// Ported from the SoundCraft add-in's tests of BarMap, lay_out and tempo_map (crates/project, crates/commands).
#include <doctest/doctest.h>

#include "core/timeline.h"

#include <cmath>

using namespace plenio::timeline;

namespace
{
/// Four measures of 4/4 that run at 120, 100, 150 and 120, the first at `first` in the audio.
BarMap bars (double first)
{
    BarMap m;
    m.score = { 0.0, 2.0, 4.0, 6.0, 8.0 };
    m.audio = { first, first + 2.0, first + 4.4, first + 6.0, first + 8.0 };
    m.meters = { { 4, 4 }, { 4, 4 }, { 4, 4 }, { 4, 4 } };
    return m;
}
} // namespace

TEST_CASE ("a bar map goes both ways through its measures and on outside them")
{
    auto map = bars (1.0);
    CHECK (map.usable());
    auto tempos = map.tempos();
    REQUIRE (tempos.size() == 4);
    CHECK (tempos[0] == doctest::Approx (120.0));
    CHECK (tempos[1] == doctest::Approx (100.0));
    CHECK (tempos[2] == doctest::Approx (150.0));
    auto [lo, hi] = map.tempoRange();
    CHECK (lo == doctest::Approx (100.0));
    CHECK (hi == doctest::Approx (150.0));
    for (auto [score, audio] : { std::pair { 0.0, 1.0 }, { 2.0, 3.0 }, { 3.0, 4.2 }, { 4.0, 5.4 }, { 8.0, 9.0 }, { 9.0, 10.0 }, { -1.0, 0.0 } })
    {
        CHECK (map.audioOf (score) == doctest::Approx (audio));
        CHECK (map.scoreOf (audio) == doctest::Approx (score));
    }
}

TEST_CASE ("bars that cannot be true are not used")
{
    auto map = bars (1.0);
    map.audio[2] = map.audio[1]; // not in order
    CHECK_FALSE (map.usable());
    map = bars (1.0);
    map.meters.pop_back(); // a measure short
    CHECK_FALSE (map.usable());
    map = bars (1.0);
    map.meters[0] = { 5, 3 }; // no such meter
    CHECK_FALSE (map.usable());
    map = bars (1.0);
    map.audio[4] = 1000.0; // 0.2 BPM
    CHECK_FALSE (map.usable());
}

TEST_CASE ("the score's first bar lies on a bar line, the audio where the bars put it")
{
    TakeTiming timing;
    timing.bars = bars (1.0); // the first measure starts 1 s into the audio, lasts 2 s
    auto layout = layOut (timing);
    CHECK (layout.measured);
    CHECK (layout.leadInBars == 1);
    CHECK (layout.scoreAt == doctest::Approx (2.0));
    CHECK (layout.audioAt == doctest::Approx (1.0));
    CHECK (scoreToProject (timing, layout, 0.0) == doctest::Approx (2.0));
    CHECK (scoreToProject (timing, layout, 4.0) == doctest::Approx (6.4));
    CHECK (projectToScore (timing, layout, 6.4) == doctest::Approx (4.0));

    // the score starts before the audio: no lead-in, the audio later
    timing.bars = bars (-0.5);
    layout = layOut (timing);
    CHECK (layout.leadInBars == 0);
    CHECK (layout.scoreAt == doctest::Approx (0.0));
    CHECK (layout.audioAt == doctest::Approx (0.5));
}

TEST_CASE ("the tempo map follows the measured bars to the sample")
{
    TakeTiming timing;
    timing.bars = bars (1.0);
    auto layout = layOut (timing);
    auto map = tempoMap (timing, layout, 960);
    REQUIRE (map.size() == 5); // lead-in, then one per measure
    CHECK (map[0].tick == 0);
    CHECK (map[0].bpm == doctest::Approx (120.0));
    CHECK (map[1].tick == 4 * 960);
    CHECK (map[1].seconds == doctest::Approx (2.0));
    CHECK (map[2].bpm == doctest::Approx (100.0));
    CHECK (map[3].seconds == doctest::Approx (1.0 + 5.4)); // audioAt + the audio's time of the third measure
    // the seconds of a bar line on this map are the audio's time of that measure
    for (std::size_t k = 1; k < map.size(); ++k)
    {
        auto expected = map[k - 1].seconds + (map[k].tick - map[k - 1].tick) / 960.0 * 60.0 / map[k - 1].bpm;
        CHECK (map[k].seconds == doctest::Approx (expected));
    }
    CHECK (scoreTickToProjectTick (layout, 480, 480, 960) == 4 * 960 + 960);
    CHECK (secondsToTick (map, 6.4, 960) == 4 * 960 * 3);
    CHECK (secondsToTick (map, 5.4, 960) == 4 * 960 * 2 + 2240); // 1.4 s into the measure at 100 BPM
}

TEST_CASE ("without bars the take lies on the warp's straight line")
{
    TakeTiming timing;
    timing.scoreBpm = 90.0;
    timing.meters = { { 3, 4 }, { 3, 4 }, { 4, 4 }, { 4, 4 } };
    timing.warp = Warp { 1.0, 0.5 };
    auto layout = layOut (timing);
    CHECK_FALSE (layout.measured);
    CHECK (layout.leadInBars == 1);
    CHECK (layout.scoreAt == doctest::Approx (2.0)); // a 3/4 bar at 90 BPM
    CHECK (layout.audioAt == doctest::Approx (1.5));
    auto map = tempoMap (timing, layout, 960);
    REQUIRE (map.size() == 2); // the lead-in in 3/4, the change to 4/4
    CHECK (map[0].meter == Meter { 3, 4 });
    CHECK (map[1].meter == Meter { 4, 4 });
    CHECK (map[1].tick == 3 * 3 * 960);
    // an unbelievable warp is not used
    timing.warp = Warp { 7.0, 0.0 };
    CHECK (layOut (timing).audioAt == doctest::Approx (0.0));
}
