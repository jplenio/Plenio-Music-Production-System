// Standard MIDI files: read (hostile input: bounded, never trusted), write, and splice whole track chunks so that
// tracks nobody changed stay byte for byte as Plenio wrote them.
#pragma once

#include <cstdint>
#include <optional>
#include <span>
#include <string>
#include <string_view>
#include <vector>

namespace plenio::midi
{

/// The largest file read (Plenio's own limit).
inline constexpr std::size_t maxFileBytes = 8u * 1024u * 1024u;
inline constexpr std::size_t maxTracks = 256;
inline constexpr std::size_t maxEventsPerTrack = 2'000'000;

struct Event
{
    std::int64_t tick = 0;            // absolute, in the file's division
    std::uint8_t status = 0;          // 0x80 ... 0xEF channel messages, 0xFF meta, 0xF0 / 0xF7 sysex
    std::uint8_t metaType = 0;        // for meta events
    std::vector<std::uint8_t> data;   // channel: one or two data bytes; meta / sysex: the payload

    bool isMeta (std::uint8_t type) const noexcept { return status == 0xFF && metaType == type; }
    bool isNoteOn() const noexcept { return (status & 0xF0) == 0x90 && data.size() >= 2 && data[1] > 0; }
    bool isNoteOff() const noexcept
    {
        return ((status & 0xF0) == 0x80 && data.size() >= 2) || ((status & 0xF0) == 0x90 && data.size() >= 2 && data[1] == 0);
    }
    int channel() const noexcept { return status & 0x0F; }
    std::string text() const { return std::string (data.begin(), data.end()); }
};

namespace meta
{
inline constexpr std::uint8_t text = 0x01;
inline constexpr std::uint8_t trackName = 0x03;
inline constexpr std::uint8_t lyric = 0x05;
inline constexpr std::uint8_t marker = 0x06;
inline constexpr std::uint8_t endOfTrack = 0x2F;
inline constexpr std::uint8_t tempo = 0x51;
inline constexpr std::uint8_t timeSignature = 0x58;
inline constexpr std::uint8_t keySignature = 0x59;
} // namespace meta

struct Track
{
    std::vector<Event> events; // sorted by tick (stable: the file's order within a tick)

    std::string name() const;
};

struct File
{
    int format = 1;
    int division = 480; // ticks per quarter note
    std::vector<Track> tracks;
};

/// Parses a standard MIDI file. Running status, meta, sysex; SMPTE time is refused.
std::optional<File> read (std::span<const std::uint8_t> bytes, std::string* error = nullptr);

/// Writes format 1 (or 0 with one track): events sorted by tick, End of Track added.
std::vector<std::uint8_t> write (const File& file);

/// One track as its MTrk chunk.
std::vector<std::uint8_t> encodeTrack (const Track& track);

/// The track chunks of a file, each whole (with its MTrk header), and the file's division.
std::optional<std::vector<std::vector<std::uint8_t>>> trackChunks (std::span<const std::uint8_t> bytes, int& division,
                                                                   std::string* error = nullptr);

/// A format-1 file from whole track chunks.
std::vector<std::uint8_t> assemble (int division, const std::vector<std::vector<std::uint8_t>>& chunks);

// helpers to make events
Event noteOn (std::int64_t tick, int channel, int pitch, int velocity);
Event noteOff (std::int64_t tick, int channel, int pitch);
Event metaEvent (std::int64_t tick, std::uint8_t type, std::string_view payload);
Event tempoEvent (std::int64_t tick, double bpm);
Event timeSignatureEvent (std::int64_t tick, int numerator, int denominator);

/// A note on one channel: start and length in ticks.
struct Note
{
    std::int64_t tick = 0;
    std::int64_t length = 0;
    int pitch = 60;
    int velocity = 90;
    int channel = 0;
};

/// The notes of a track: every note-on paired with the next note-off of its pitch and channel (a note never ended
/// lasts to the track's last event).
std::vector<Note> notesOf (const Track& track);

/// Note-on and note-off events of notes (to put into a track).
void addNotes (Track& track, const std::vector<Note>& notes);

/// Sorts a track's events by tick, keeping the order of events at one tick (offs before ons at the same tick).
void sortEvents (Track& track);

} // namespace plenio::midi
