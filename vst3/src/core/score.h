// A take's score as Plenio exports it to MIDI (/plenio/score/midi/export): a conductor track (title, the
// "plenio:score" layout text, one tempo, meters, key, sections as markers) and the tracks Vocal, Instrument and
// Chords (chord symbols as "plenio:chord <name>" texts with their voicings). The plug-in shows and edits these, and
// sends changed tracks back inside Plenio's own file (everything else byte for byte), so that Plenio's import
// (/plenio/score/midi/import) reads it as its own.
#pragma once

#include "core/midi_file.h"

#include <algorithm>
#include <cstdint>
#include <optional>
#include <span>
#include <string>
#include <vector>

namespace plenio::score
{

struct Meter
{
    std::int64_t tick = 0;
    int numerator = 4;
    int denominator = 4;
};

struct Section
{
    std::int64_t tick = 0;
    std::string name;
};

struct ChordSymbol
{
    std::int64_t tick = 0;
    std::string name;
};

enum class Part { melody, instrument, chords };

struct Score
{
    int ppq = 480;
    double bpm = 120.0;
    std::string title;
    std::string key;                  // "A minor", "F# major"; empty when unknown
    std::vector<Meter> meters;        // at least one, the first at tick 0
    std::vector<Section> sections;
    std::vector<midi::Note> melody;      // Vocal
    std::vector<midi::Note> instrument;  // Instrument (Ins)
    std::vector<midi::Note> chordNotes;  // the chords' voicings
    std::vector<ChordSymbol> chords;
    std::int64_t endTick = 0;

    /// The start of every measure and the end (one value more than measures).
    std::vector<std::int64_t> measureStarts() const;
    /// Quarter notes of a measure of this meter.
    static double quarters (const Meter& m) { return m.numerator * 4.0 / std::max (1, m.denominator); }
    double secondsOf (std::int64_t tick) const { return static_cast<double> (tick) / ppq * 60.0 / bpm; }
    std::int64_t tickOf (double seconds) const;
};

/// Reads Plenio's MIDI file. A file without Plenio's track names still gives its notes by position (tracks 1-3).
std::optional<Score> parse (std::span<const std::uint8_t> bytes, std::string* error = nullptr);

/// Plenio's file with some parts replaced by `edited`'s: the conductor and every part not named stay byte for byte.
/// Chords are written as Plenio writes them: a "plenio:chord" text per symbol and its voicing until the next.
std::optional<std::vector<std::uint8_t>> splice (std::span<const std::uint8_t> original, const Score& edited,
                                                 const std::vector<Part>& parts, std::string* error = nullptr);

/// The voicings of chord symbols, each until the next symbol (or the score's end).
std::vector<midi::Note> voicings (const std::vector<ChordSymbol>& chords, std::int64_t endTick);

/// A key signature as text ("A minor").
std::string keyName (int sharpsOrFlats, bool minor);

} // namespace plenio::score
