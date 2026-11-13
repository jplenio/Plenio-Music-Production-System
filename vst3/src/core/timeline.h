// A take on the DAW's timeline. The audio is the master (SoundCraft add-in, 2026-11-06): YuE2 keeps no steady
// tempo, so the bars are measured in the take (Song API 1.4, GET /jobs/{id}/bars) and the DAW's tempo map follows
// them; the audio is never stretched. Ported from the add-in's BarMap, Take::lay_out and score::tempo_map.
//
// Layout: the score's first bar lies on a bar line of the project (`scoreAt`, whole bars of the first measure's
// length from the project's start), the audio where the bars put it against the score (`audioAt`). Lead-in bars
// before the score's first bar keep the first measure's tempo and meter. With this tempo map in the DAW, a note of
// the score keeps its musical position: project tick = lead-in ticks + score tick (scaled to the project's PPQ).
#pragma once

#include <cstdint>
#include <optional>
#include <utility>
#include <vector>

namespace plenio::timeline
{

using Meter = std::pair<int, int>;

/// Where the measures of a score lie in a take's audio.
struct BarMap
{
    std::vector<double> score;  // every measure's start and the score's end, in seconds of the score
    std::vector<double> audio;  // the same in seconds of the take's audio (negative before the audio starts)
    std::vector<Meter> meters;  // one per measure

    static double quarters (Meter m) { return m.first * 4.0 / (m.second > 0 ? m.second : 4); }

    /// In order, every measure with a meter that exists and a tempo between 5 and 1000.
    bool usable() const;
    std::vector<double> tempos() const; // quarter notes a minute, per measure
    std::pair<double, double> tempoRange() const;
    double audioOf (double scoreSeconds) const; // piecewise linear, continued outside
    double scoreOf (double audioSeconds) const;
};

/// Plenio's rough measurement: t_audio = a t_score + b.
struct Warp
{
    double a = 1.0;
    double b = 0.0;
    bool believable() const;
};

struct Layout
{
    double scoreAt = 0.0;   // project seconds of the score's first bar line
    double audioAt = 0.0;   // project seconds of the take's sample 0
    int leadInBars = 0;     // project bars before the score's first bar
    Meter firstMeter { 4, 4 };
    double firstTempo = 120.0;
    bool measured = false;  // from bars (true) or from the warp's straight line
};

struct TakeTiming
{
    double scoreBpm = 120.0;       // the score's own tempo
    std::vector<Meter> meters;     // the score's measures (used without bars)
    std::optional<BarMap> bars;
    std::optional<Warp> warp;
};

Layout layOut (const TakeTiming& timing);

/// Score seconds -> project seconds, and back.
double scoreToProject (const TakeTiming& timing, const Layout& layout, double scoreSeconds);
double projectToScore (const TakeTiming& timing, const Layout& layout, double projectSeconds);

/// Audio seconds of the take -> project seconds.
inline double audioToProject (const Layout& layout, double audioSeconds) { return layout.audioAt + audioSeconds; }

struct TempoEvent
{
    std::int64_t tick = 0;   // project ticks at `ppq`
    double seconds = 0.0;    // project seconds where it starts
    double bpm = 120.0;      // quarter notes a minute
    Meter meter { 4, 4 };
    bool meterChanges = false;
};

/// The project's tempo map while this take plays: one event per measure (lead-in first), at `ppq` ticks per quarter.
std::vector<TempoEvent> tempoMap (const TakeTiming& timing, const Layout& layout, int ppq);

/// A tick of the score (at `scorePpq`) as a project tick (at `projectPpq`) on that tempo map.
std::int64_t scoreTickToProjectTick (const Layout& layout, std::int64_t scoreTick, int scorePpq, int projectPpq);

/// Project seconds on a tempo map -> project ticks (for MIDI export of things given in seconds, like lyrics).
std::int64_t secondsToTick (const std::vector<TempoEvent>& map, double seconds, int ppq);

} // namespace plenio::timeline
