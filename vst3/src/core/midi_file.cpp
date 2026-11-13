#include "core/midi_file.h"

#include <algorithm>
#include <cmath>
#include <map>

namespace plenio::midi
{
namespace
{
std::uint32_t be32 (std::span<const std::uint8_t> b, std::size_t at)
{
    return (std::uint32_t (b[at]) << 24) | (std::uint32_t (b[at + 1]) << 16) | (std::uint32_t (b[at + 2]) << 8) | b[at + 3];
}

std::uint16_t be16 (std::span<const std::uint8_t> b, std::size_t at)
{
    return static_cast<std::uint16_t> ((b[at] << 8) | b[at + 1]);
}

void put32 (std::vector<std::uint8_t>& out, std::uint32_t v)
{
    out.push_back (static_cast<std::uint8_t> (v >> 24));
    out.push_back (static_cast<std::uint8_t> (v >> 16));
    out.push_back (static_cast<std::uint8_t> (v >> 8));
    out.push_back (static_cast<std::uint8_t> (v));
}

void put16 (std::vector<std::uint8_t>& out, std::uint16_t v)
{
    out.push_back (static_cast<std::uint8_t> (v >> 8));
    out.push_back (static_cast<std::uint8_t> (v));
}

void putVlq (std::vector<std::uint8_t>& out, std::uint64_t v)
{
    std::uint8_t bytes[10];
    int n = 0;
    bytes[n++] = static_cast<std::uint8_t> (v & 0x7F);
    while ((v >>= 7) != 0 && n < 10)
        bytes[n++] = static_cast<std::uint8_t> ((v & 0x7F) | 0x80);
    while (n > 0)
        out.push_back (bytes[--n]);
}

bool fail (std::string* error, const char* why)
{
    if (error != nullptr)
        *error = why;
    return false;
}

int dataBytes (std::uint8_t status)
{
    switch (status & 0xF0)
    {
        case 0xC0:
        case 0xD0:
            return 1;
        default:
            return 2;
    }
}

bool parseTrack (std::span<const std::uint8_t> body, Track& track, std::string* error)
{
    std::size_t at = 0;
    std::int64_t tick = 0;
    std::uint8_t running = 0;

    auto vlq = [&] (std::uint64_t& value) -> bool
    {
        value = 0;
        for (int i = 0; i < 4; ++i)
        {
            if (at >= body.size())
                return false;
            auto b = body[at++];
            value = (value << 7) | (b & 0x7F);
            if ((b & 0x80) == 0)
                return true;
        }
        return false;
    };

    while (at < body.size())
    {
        if (track.events.size() >= maxEventsPerTrack)
            return fail (error, "too many events in a track");
        std::uint64_t delta = 0;
        if (! vlq (delta))
            return fail (error, "a delta time is cut");
        tick += static_cast<std::int64_t> (delta);
        if (tick > (std::int64_t (1) << 40))
            return fail (error, "a tick lies beyond any song");
        if (at >= body.size())
            return fail (error, "an event is cut");

        Event e;
        e.tick = tick;
        auto first = body[at];
        if (first == 0xFF)
        {
            if (at + 2 > body.size())
                return fail (error, "a meta event is cut");
            e.status = 0xFF;
            e.metaType = body[at + 1];
            at += 2;
            std::uint64_t length = 0;
            if (! vlq (length) || length > body.size() - at)
                return fail (error, "a meta event is cut");
            e.data.assign (body.begin() + static_cast<std::ptrdiff_t> (at), body.begin() + static_cast<std::ptrdiff_t> (at + length));
            at += length;
            running = 0;
            if (e.metaType == meta::endOfTrack)
                break;
        }
        else if (first == 0xF0 || first == 0xF7)
        {
            e.status = first;
            ++at;
            std::uint64_t length = 0;
            if (! vlq (length) || length > body.size() - at)
                return fail (error, "a sysex event is cut");
            e.data.assign (body.begin() + static_cast<std::ptrdiff_t> (at), body.begin() + static_cast<std::ptrdiff_t> (at + length));
            at += length;
            running = 0;
        }
        else
        {
            std::uint8_t status = running;
            if ((first & 0x80) != 0)
            {
                status = first;
                ++at;
            }
            if (status < 0x80 || status >= 0xF0)
                return fail (error, "a data byte without a status");
            running = status;
            auto n = static_cast<std::size_t> (dataBytes (status));
            if (at + n > body.size())
                return fail (error, "a channel event is cut");
            e.status = status;
            for (std::size_t i = 0; i < n; ++i)
                e.data.push_back (body[at + i] & 0x7F);
            at += n;
        }
        track.events.push_back (std::move (e));
    }
    return true;
}
} // namespace

std::string Track::name() const
{
    for (const auto& e : events)
    {
        if (e.tick > 0)
            break;
        if (e.isMeta (meta::trackName))
            return e.text();
    }
    return {};
}

std::optional<std::vector<std::vector<std::uint8_t>>> trackChunks (std::span<const std::uint8_t> bytes, int& division, std::string* error)
{
    if (bytes.size() > maxFileBytes)
    {
        fail (error, "the MIDI file is too large");
        return std::nullopt;
    }
    if (bytes.size() < 14 || bytes[0] != 'M' || bytes[1] != 'T' || bytes[2] != 'h' || bytes[3] != 'd')
    {
        fail (error, "not a MIDI file");
        return std::nullopt;
    }
    auto headerLength = be32 (bytes, 4);
    if (headerLength < 6 || headerLength > bytes.size() - 8)
    {
        fail (error, "a broken MIDI header");
        return std::nullopt;
    }
    division = be16 (bytes, 12);
    std::vector<std::vector<std::uint8_t>> chunks;
    std::size_t at = 8 + headerLength;
    while (at + 8 <= bytes.size())
    {
        auto length = be32 (bytes, at + 4);
        if (length > bytes.size() - at - 8)
        {
            fail (error, "a MIDI chunk is cut");
            return std::nullopt;
        }
        if (bytes[at] == 'M' && bytes[at + 1] == 'T' && bytes[at + 2] == 'r' && bytes[at + 3] == 'k')
        {
            chunks.emplace_back (bytes.begin() + static_cast<std::ptrdiff_t> (at), bytes.begin() + static_cast<std::ptrdiff_t> (at + 8 + length));
            if (chunks.size() > maxTracks)
            {
                fail (error, "too many MIDI tracks");
                return std::nullopt;
            }
        }
        at += 8 + length;
    }
    return chunks;
}

std::optional<File> read (std::span<const std::uint8_t> bytes, std::string* error)
{
    int division = 0;
    auto chunks = trackChunks (bytes, division, error);
    if (! chunks)
        return std::nullopt;
    if ((division & 0x8000) != 0 || division == 0)
    {
        fail (error, "the MIDI file has no musical time base");
        return std::nullopt;
    }
    File file;
    file.format = be16 (bytes, 8);
    file.division = division;
    for (const auto& chunk : *chunks)
    {
        Track track;
        if (! parseTrack (std::span<const std::uint8_t> (chunk).subspan (8), track, error))
            return std::nullopt;
        file.tracks.push_back (std::move (track));
    }
    return file;
}

void sortEvents (Track& track)
{
    // at one tick: meta first (names, tempo), then note-offs, then everything else in the file's order
    auto rank = [] (const Event& e)
    {
        if (e.status == 0xFF)
            return 0;
        if (e.isNoteOff())
            return 1;
        return 2;
    };
    std::stable_sort (track.events.begin(), track.events.end(), [&] (const Event& a, const Event& b)
    {
        if (a.tick != b.tick)
            return a.tick < b.tick;
        return rank (a) < rank (b);
    });
}

std::vector<std::uint8_t> encodeTrack (const Track& track)
{
    Track sorted = track;
    sortEvents (sorted);
    std::vector<std::uint8_t> body;
    std::int64_t last = 0;
    std::int64_t end = 0; // an End of Track the caller placed (the track lasts that long)
    for (const auto& e : sorted.events)
    {
        if (e.isMeta (meta::endOfTrack))
        {
            end = std::max (end, e.tick);
            continue;
        }
        putVlq (body, static_cast<std::uint64_t> (std::max<std::int64_t> (0, e.tick - last)));
        last = std::max (last, e.tick);
        if (e.status == 0xFF)
        {
            body.push_back (0xFF);
            body.push_back (e.metaType);
            putVlq (body, e.data.size());
            body.insert (body.end(), e.data.begin(), e.data.end());
        }
        else if (e.status == 0xF0 || e.status == 0xF7)
        {
            body.push_back (e.status);
            putVlq (body, e.data.size());
            body.insert (body.end(), e.data.begin(), e.data.end());
        }
        else
        {
            body.push_back (e.status);
            for (std::size_t i = 0; i < static_cast<std::size_t> (dataBytes (e.status)) && i < e.data.size(); ++i)
                body.push_back (e.data[i] & 0x7F);
        }
    }
    putVlq (body, static_cast<std::uint64_t> (std::max<std::int64_t> (0, end - last)));
    body.push_back (0xFF);
    body.push_back (meta::endOfTrack);
    body.push_back (0x00);

    std::vector<std::uint8_t> chunk { 'M', 'T', 'r', 'k' };
    put32 (chunk, static_cast<std::uint32_t> (body.size()));
    chunk.insert (chunk.end(), body.begin(), body.end());
    return chunk;
}

std::vector<std::uint8_t> assemble (int division, const std::vector<std::vector<std::uint8_t>>& chunks)
{
    std::vector<std::uint8_t> out { 'M', 'T', 'h', 'd' };
    put32 (out, 6);
    put16 (out, chunks.size() == 1 ? 0 : 1);
    put16 (out, static_cast<std::uint16_t> (chunks.size()));
    put16 (out, static_cast<std::uint16_t> (division));
    for (const auto& c : chunks)
        out.insert (out.end(), c.begin(), c.end());
    return out;
}

std::vector<std::uint8_t> write (const File& file)
{
    std::vector<std::vector<std::uint8_t>> chunks;
    for (const auto& t : file.tracks)
        chunks.push_back (encodeTrack (t));
    return assemble (file.division, chunks);
}

Event noteOn (std::int64_t tick, int channel, int pitch, int velocity)
{
    Event e;
    e.tick = tick;
    e.status = static_cast<std::uint8_t> (0x90 | (channel & 0x0F));
    e.data = { static_cast<std::uint8_t> (std::clamp (pitch, 0, 127)), static_cast<std::uint8_t> (std::clamp (velocity, 1, 127)) };
    return e;
}

Event noteOff (std::int64_t tick, int channel, int pitch)
{
    Event e;
    e.tick = tick;
    e.status = static_cast<std::uint8_t> (0x80 | (channel & 0x0F));
    e.data = { static_cast<std::uint8_t> (std::clamp (pitch, 0, 127)), 64 };
    return e;
}

Event metaEvent (std::int64_t tick, std::uint8_t type, std::string_view payload)
{
    Event e;
    e.tick = tick;
    e.status = 0xFF;
    e.metaType = type;
    e.data.assign (payload.begin(), payload.end());
    return e;
}

Event tempoEvent (std::int64_t tick, double bpm)
{
    auto micros = static_cast<std::uint32_t> (std::clamp (std::lround (60'000'000.0 / std::clamp (bpm, 1.0, 1000.0)), 1L, 0xFFFFFFL));
    Event e;
    e.tick = tick;
    e.status = 0xFF;
    e.metaType = meta::tempo;
    e.data = { static_cast<std::uint8_t> (micros >> 16), static_cast<std::uint8_t> (micros >> 8), static_cast<std::uint8_t> (micros) };
    return e;
}

Event timeSignatureEvent (std::int64_t tick, int numerator, int denominator)
{
    int power = 0;
    while ((1 << power) < denominator && power < 7)
        ++power;
    Event e;
    e.tick = tick;
    e.status = 0xFF;
    e.metaType = meta::timeSignature;
    e.data = { static_cast<std::uint8_t> (std::clamp (numerator, 1, 255)), static_cast<std::uint8_t> (power), 24, 8 };
    return e;
}

std::vector<Note> notesOf (const Track& track)
{
    std::vector<Note> notes;
    std::map<std::pair<int, int>, std::vector<std::pair<std::int64_t, int>>> open; // (channel, pitch) -> (start, velocity)
    std::int64_t lastTick = 0;
    for (const auto& e : track.events)
    {
        lastTick = std::max (lastTick, e.tick);
        if (e.isNoteOn())
            open[{ e.channel(), e.data[0] }].push_back ({ e.tick, e.data[1] });
        else if (e.isNoteOff())
        {
            auto& starts = open[{ e.channel(), e.data[0] }];
            if (starts.empty())
                continue;
            auto [start, velocity] = starts.front(); // first in, first out: overlapping notes of one pitch
            starts.erase (starts.begin());
            notes.push_back ({ start, std::max<std::int64_t> (1, e.tick - start), e.data[0], velocity, e.channel() });
        }
    }
    for (auto& [key, starts] : open)
        for (auto [start, velocity] : starts)
            notes.push_back ({ start, std::max<std::int64_t> (1, lastTick - start), key.second, velocity, key.first });
    std::sort (notes.begin(), notes.end(), [] (const Note& a, const Note& b)
    {
        return a.tick != b.tick ? a.tick < b.tick : a.pitch < b.pitch;
    });
    return notes;
}

void addNotes (Track& track, const std::vector<Note>& notes)
{
    for (const auto& n : notes)
    {
        track.events.push_back (noteOn (n.tick, n.channel, n.pitch, n.velocity));
        track.events.push_back (noteOff (n.tick + std::max<std::int64_t> (1, n.length), n.channel, n.pitch));
    }
}

} // namespace plenio::midi
