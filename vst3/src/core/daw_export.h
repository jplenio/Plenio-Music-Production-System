// Files for the DAW: a take as the DAW wants it. Everything starts at the project's start (bar 1), so a file dropped
// at the start lies where the instrument plays it: the audio with the lead-in as silence, the MIDI with the project's
// tempo map (the bars measured in the take) and the notes at their musical positions.
#pragma once

#include "core/audio_file.h"
#include "core/record.h"
#include "core/score.h"
#include "core/timeline.h"

#include <cstdint>
#include <filesystem>
#include <optional>
#include <string>
#include <utility>
#include <vector>

namespace plenio::daw
{

/// The MIDI files' resolution (ticks per quarter note).
inline constexpr int ppq = 960;

/// "A minor" -> (0, minor), "Eb major" -> (-3, major); nothing for a name it does not know.
std::optional<std::pair<int, bool>> keySignature (const std::string& name);

/// The parts of a MIDI file.
enum Parts : int { melodyPart = 1, instrumentPart = 2, chordsPart = 4, allParts = 7 };

/// The score on the project's timeline: a conductor track (tempo map, meters, key, the song's sections as markers),
/// then Melody (channel 1, the sung lines as lyrics), Instrument (channel 2) and Chords (channel 3: voiced, with the
/// chord names as text), as many as `parts` asks; no part: the conductor alone (to give a DAW the tempo map).
std::vector<std::uint8_t> midiFile (const score::Score& score, const timeline::TakeTiming& timing, const std::vector<record::Line>& lines,
                                    const std::string& title, int parts = allParts);

/// A click on every beat of the tempo map (higher on the first beat of a bar), mono, `seconds` long.
audio::Buffer clickTrack (const std::vector<timeline::TempoEvent>& map, double seconds, double rate = 44100.0);

/// A take's files for the DAW, all in one folder (takes/<n>/daw: a drag of several files needs one folder).
struct Files
{
    std::filesystem::path folder;
    std::filesystem::path source;                                        // the take's own audio file they are made of
    std::filesystem::path audio;                                         // the take from the project's start
    std::vector<std::pair<std::string, std::filesystem::path>> stems;    // vocals, drums, bass, other, rest
    std::filesystem::path midi;                                          // the score (with the owner's edits)
    std::vector<std::pair<std::string, std::filesystem::path>> parts;    // Melody, Instrument Line, Chords: one file each
    std::filesystem::path tempo;                                         // the tempo map alone
    std::filesystem::path click;
};

/// What the audio files are made of (copied, so a worker can make them).
struct AudioJob
{
    std::filesystem::path folder;
    std::string base;                                                    // "Night Drive - Take 2"
    std::string title;
    std::filesystem::path audio;
    std::vector<std::pair<std::string, std::filesystem::path>> stems;
    double audioAt = 0.0;                                                // the lead-in, as silence
    double seconds = 0.0;
    std::vector<timeline::TempoEvent> map;                               // for the click
};

/// Writes the audio files (24-bit WAV from the project's start; kept while newer than their source) and the click.
/// Slow (seconds): on a worker.
std::optional<Files> writeAudio (const AudioJob& job, std::string& problem);

/// Writes the MIDI files into `files` (fast: before every drag, so the latest edits go along).
bool writeMidi (Files& files, const std::string& base, const std::string& title, const score::Score& score,
                const timeline::TakeTiming& timing, const std::vector<record::Line>& lines, std::string& problem);

} // namespace plenio::daw
