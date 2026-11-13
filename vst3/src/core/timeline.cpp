#include "core/timeline.h"

#include <algorithm>
#include <cmath>

namespace plenio::timeline
{
namespace
{
constexpr std::size_t maxBars = 4096;
constexpr double maxShift = 120.0;

bool increasing (const std::vector<double>& v)
{
    for (std::size_t i = 0; i < v.size(); ++i)
    {
        if (! std::isfinite (v[i]))
            return false;
        if (i > 0 && ! (v[i] > v[i - 1]))
            return false;
    }
    return true;
}

double through (const std::vector<double>& from, const std::vector<double>& to, double x)
{
    if (from.size() < 2 || from.size() != to.size())
        return x;
    auto it = std::upper_bound (from.begin(), from.end(), x);
    std::size_t k = it == from.begin() ? 0 : static_cast<std::size_t> (it - from.begin()) - 1;
    k = std::min (k, from.size() - 2);
    double a = from[k], b = from[k + 1], c = to[k], d = to[k + 1];
    if (! (b > a))
        return x;
    return c + (x - a) * (d - c) / (b - a);
}

bool meterExists (Meter m)
{
    static const int denominators[] = { 1, 2, 4, 8, 16, 32, 64 };
    return m.first >= 1 && m.first <= 64 && std::find (std::begin (denominators), std::end (denominators), m.second) != std::end (denominators);
}
} // namespace

bool BarMap::usable() const
{
    const auto count = meters.size();
    if (count < 1 || count > maxBars || score.size() != count + 1 || audio.size() != count + 1)
        return false;
    if (! std::all_of (meters.begin(), meters.end(), meterExists) || ! increasing (score) || ! increasing (audio))
        return false;
    for (double t : tempos())
        if (! (t >= 5.0 && t <= 1000.0))
            return false;
    return true;
}

std::vector<double> BarMap::tempos() const
{
    std::vector<double> out;
    for (std::size_t i = 0; i < meters.size() && i + 1 < audio.size(); ++i)
    {
        double length = audio[i + 1] - audio[i];
        out.push_back (length > 0 ? quarters (meters[i]) * 60.0 / length : 0.0);
    }
    return out;
}

std::pair<double, double> BarMap::tempoRange() const
{
    auto t = tempos();
    if (t.empty())
        return { 0.0, 0.0 };
    auto [lo, hi] = std::minmax_element (t.begin(), t.end());
    return { *lo, *hi };
}

double BarMap::audioOf (double scoreSeconds) const
{
    return through (score, audio, scoreSeconds);
}

double BarMap::scoreOf (double audioSeconds) const
{
    return through (audio, score, audioSeconds);
}

bool Warp::believable() const
{
    return std::isfinite (a) && std::isfinite (b) && a >= 0.5 && a <= 2.0 && std::abs (b) <= maxShift;
}

Layout layOut (const TakeTiming& timing)
{
    Layout layout;
    double shift = 0.0, barSeconds = 0.0;
    if (timing.bars && timing.bars->usable())
    {
        const auto& bars = *timing.bars;
        shift = bars.audio[0];
        barSeconds = bars.audio[1] - bars.audio[0];
        layout.firstMeter = bars.meters[0];
        layout.firstTempo = bars.tempos()[0];
        layout.measured = true;
    }
    else
    {
        Warp warp = timing.warp && timing.warp->believable() ? *timing.warp : Warp {};
        Meter first = timing.meters.empty() ? Meter { 4, 4 } : timing.meters.front();
        double bpm = timing.scoreBpm > 5.0 ? timing.scoreBpm : 120.0;
        shift = warp.b;
        barSeconds = BarMap::quarters (first) * 60.0 / bpm * warp.a;
        layout.firstMeter = first;
        layout.firstTempo = bpm / warp.a;
    }
    if (shift > 0.0 && barSeconds > 0.0)
    {
        layout.leadInBars = static_cast<int> (std::ceil (shift / barSeconds - 1e-9));
        layout.scoreAt = layout.leadInBars * barSeconds;
    }
    layout.audioAt = std::max (0.0, layout.scoreAt - shift);
    return layout;
}

double scoreToProject (const TakeTiming& timing, const Layout& layout, double scoreSeconds)
{
    if (timing.bars && timing.bars->usable())
        return layout.audioAt + timing.bars->audioOf (scoreSeconds);
    Warp warp = timing.warp && timing.warp->believable() ? *timing.warp : Warp {};
    return layout.scoreAt + warp.a * scoreSeconds;
}

double projectToScore (const TakeTiming& timing, const Layout& layout, double projectSeconds)
{
    if (timing.bars && timing.bars->usable())
        return timing.bars->scoreOf (projectSeconds - layout.audioAt);
    Warp warp = timing.warp && timing.warp->believable() ? *timing.warp : Warp {};
    return (projectSeconds - layout.scoreAt) / warp.a;
}

std::vector<TempoEvent> tempoMap (const TakeTiming& timing, const Layout& layout, int ppq)
{
    std::vector<TempoEvent> map;
    auto ticksOf = [ppq] (Meter m) { return static_cast<std::int64_t> (std::llround (BarMap::quarters (m) * ppq)); };

    // lead-in: the first measure's tempo and meter from the project's start
    map.push_back ({ 0, 0.0, layout.firstTempo, layout.firstMeter, true });
    std::int64_t tick = layout.leadInBars * ticksOf (layout.firstMeter);
    double seconds = layout.scoreAt;
    Meter meter = layout.firstMeter;

    if (timing.bars && timing.bars->usable())
    {
        const auto& bars = *timing.bars;
        auto tempos = bars.tempos();
        for (std::size_t k = 0; k < bars.meters.size(); ++k)
        {
            TempoEvent e { tick, layout.audioAt + bars.audio[k], tempos[k], bars.meters[k], bars.meters[k] != meter };
            meter = bars.meters[k];
            if (k == 0 && tick == 0)
                map.front() = e;
            else
                map.push_back (e);
            tick += ticksOf (bars.meters[k]);
        }
        return map;
    }

    // without bars: the score's tempo along the warp's line, a meter event where the meter changes
    Warp warp = timing.warp && timing.warp->believable() ? *timing.warp : Warp {};
    double bpm = (timing.scoreBpm > 5.0 ? timing.scoreBpm : 120.0) / warp.a;
    for (std::size_t k = 0; k < timing.meters.size(); ++k)
    {
        // one tempo all along: an event only where the meter changes (the lead-in has the first meter already)
        if (timing.meters[k] == meter)
        {
            tick += ticksOf (meter);
            seconds += BarMap::quarters (meter) * 60.0 / bpm;
            continue;
        }
        TempoEvent e { tick, seconds, bpm, timing.meters[k], true };
        if (tick == 0)
            map.front() = e;
        else
            map.push_back (e);
        meter = timing.meters[k];
        tick += ticksOf (meter);
        seconds += BarMap::quarters (meter) * 60.0 / bpm;
    }
    return map;
}

std::int64_t scoreTickToProjectTick (const Layout& layout, std::int64_t scoreTick, int scorePpq, int projectPpq)
{
    auto leadIn = static_cast<std::int64_t> (std::llround (layout.leadInBars * BarMap::quarters (layout.firstMeter) * projectPpq));
    if (scorePpq <= 0)
        return leadIn;
    return leadIn + static_cast<std::int64_t> (std::llround (static_cast<double> (scoreTick) * projectPpq / scorePpq));
}

std::int64_t secondsToTick (const std::vector<TempoEvent>& map, double seconds, int ppq)
{
    if (map.empty())
        return static_cast<std::int64_t> (std::llround (seconds * 2.0 * ppq));
    std::size_t k = 0;
    while (k + 1 < map.size() && map[k + 1].seconds <= seconds)
        ++k;
    const auto& e = map[k];
    return e.tick + static_cast<std::int64_t> (std::llround ((seconds - e.seconds) * e.bpm / 60.0 * ppq));
}

} // namespace plenio::timeline
