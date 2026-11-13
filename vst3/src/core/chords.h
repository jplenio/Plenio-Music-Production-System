// Chord symbols as Plenio and YuE2 write them: a root (C, F#, Bb ...), one of fifteen qualities and an optional
// slash bass ("Am7", "F/C", "Bbmaj7"). Ported from Plenio (plenio/core/score/model.py, yue2_abc_tools.py) so that
// a chord changed in the plug-in comes back exactly when Plenio reads the MIDI file.
#pragma once

#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace plenio::chords
{

/// The qualities YuE2's dialect supports, in Plenio's order.
const std::vector<std::string>& qualities();

struct Chord
{
    int root = 0;            // pitch class 0 ... 11
    std::string rootName;    // as written: "F#", "Bb"
    std::string quality;     // "", "m", "maj7" ...
    std::optional<int> bass; // pitch class of a slash bass
    std::string bassName;
};

/// The chord a symbol names, or nothing when YuE2 would not read it.
std::optional<Chord> parse (std::string_view symbol);

/// The pitches it sounds: the root from C3 to B3 with its quality's intervals, a slash bass an octave lower
/// (Plenio's voicing). Empty for a symbol YuE2 does not support.
std::vector<int> pitches (std::string_view symbol);

/// A quality's intervals above the root in semitones ("m7": 0 3 7 10); empty for one YuE2 does not know.
std::vector<int> intervalsOf (std::string_view quality);

/// The symbol of a chord: root name + quality (+ "/" + bass).
std::string symbol (const Chord& chord);

/// The twelve root names as the plug-in offers them (sharps or flats).
std::string rootName (int pitchClass, bool flats);

} // namespace plenio::chords
