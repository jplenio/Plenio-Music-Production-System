// A clip in the DAW that is a Plenio take: found by its name ("Night Drive - Take 2", "… - Take 2 - vocals", as the
// plug-in names every file it gives the DAW) and its length, and what it holds on its own time: the tempo map of the
// bars measured in the take, the meters, the key, the sung notes and the chords. For Plenio ARA (the host reads them
// as ARA content); no ARA here, so it is tested on its own.
#pragma once

#include "core/daw_export.h"
#include "core/song.h"

#include <array>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace plenio::core
{

class Library;

/// "Night Drive - Take 2 - vocals.wav" (with a DAW's own suffixes: "_01", " (1)", "-glued") -> its parts.
struct ClipName
{
    std::string title;
    int take = 0;
    std::string stem; // empty: the song
};
std::optional<ClipName> parseClipName (std::string_view name);

struct ClipMatch
{
    Song song;
    int takeIndex = -1;
    std::string stem;
    /// Seconds of the project at the clip's sample 0: 0 for the DAW's file (it starts at the project's start), the
    /// lead-in for Plenio's own file of the take.
    double offset = 0.0;
};

/// The take a clip is, from the library: the name says which song and take, the length which file (the DAW's,
/// padded with the lead-in, or Plenio's own). Nothing for a clip that is no Plenio take.
std::optional<ClipMatch> matchClip (const Library& library, std::string_view name, double seconds);

/// What a take holds, in seconds of the clip and quarter notes from the project's start (bar 1).
struct ClipContent
{
    struct Tempo
    {
        double seconds = 0.0;
        double quarters = 0.0;
    };
    struct Bar
    {
        int numerator = 4;
        int denominator = 4;
        double quarters = 0.0;
    };
    struct Note
    {
        double start = 0.0;
        double duration = 0.0;
        int pitch = 60;
        float volume = 0.7f;
    };
    struct Chord
    {
        double quarters = 0.0;
        int root = 0;                         // circle of fifths: C 0, G 1, F -1, Eb -3 …
        int bass = 0;
        std::array<std::uint8_t, 12> degrees {}; // per semitone above the root: 0 unused, else the diatonic degree
        std::string name;                     // with the music sign ♭ and ♯ (as ARA asks)
    };
    struct Key
    {
        double quarters = 0.0;
        int root = 0;
        bool minor = false;
        std::string name;
    };

    std::vector<Tempo> tempo; // at least two (the last closes the song)
    std::vector<Bar> bars;
    std::vector<Note> notes;  // the sung line (the song and its vocal stem)
    std::vector<Chord> chords;
    std::optional<Key> key;
};

ClipContent contentOf (const ClipMatch& match);

/// What the DAW's audio files of a take are made of: its audio and stems from the library (those that are there),
/// the lead-in, the tempo map for the click; nothing when the take's audio is not in the library.
std::optional<daw::AudioJob> dawAudioJob (const Library& library, const Song& song, int takeIndex);

/// "Eb" -> -3, "F#" -> 6: a note name's place on the circle of fifths.
std::optional<int> fifthsOf (std::string_view noteName);

/// "Bbm7b5" -> "B♭m7♭5".
std::string withMusicSigns (std::string_view name);

} // namespace plenio::core
