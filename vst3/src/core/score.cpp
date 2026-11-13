#include "core/score.h"
#include "core/chords.h"

#include <algorithm>
#include <cctype>
#include <cmath>

namespace plenio::score
{
namespace
{
constexpr const char* chordText = "plenio:chord ";
constexpr int velocity = 90;
constexpr int melodyChannel = 0, instrumentChannel = 1, chordsChannel = 2;

std::string lower (std::string s)
{
    for (auto& c : s)
        c = static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
    return s;
}

/// Plenio's role of a track by its name.
std::optional<Part> roleOf (const std::string& name)
{
    auto n = lower (name);
    if (n == "vocal" || n == "vocal melody")
        return Part::melody;
    if (n == "instrument" || n == "ins" || n == "ins melody")
        return Part::instrument;
    if (n == "chords")
        return Part::chords;
    return std::nullopt;
}

const char* trackName (Part part)
{
    switch (part)
    {
        case Part::melody: return "Vocal";
        case Part::instrument: return "Instrument";
        case Part::chords: return "Chords";
    }
    return "";
}
} // namespace

std::string keyName (int sf, bool minor)
{
    static const char* majors[] = { "Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#" };
    static const char* minors[] = { "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#" };
    if (sf < -7 || sf > 7)
        return {};
    return std::string (minor ? minors[sf + 7] : majors[sf + 7]) + (minor ? " minor" : " major");
}

std::vector<std::int64_t> Score::measureStarts() const
{
    std::vector<std::int64_t> starts;
    if (meters.empty() || ppq <= 0)
        return starts;
    std::int64_t at = 0;
    std::size_t m = 0;
    while (at < endTick && starts.size() < 20000)
    {
        while (m + 1 < meters.size() && meters[m + 1].tick <= at)
            ++m;
        starts.push_back (at);
        auto length = static_cast<std::int64_t> (std::llround (quarters (meters[m]) * ppq));
        if (length <= 0)
            break;
        at += length;
    }
    starts.push_back (std::max (at, endTick));
    return starts;
}

std::int64_t Score::tickOf (double seconds) const
{
    return static_cast<std::int64_t> (std::llround (seconds * bpm / 60.0 * ppq));
}

std::vector<midi::Note> voicings (const std::vector<ChordSymbol>& chords, std::int64_t endTick)
{
    std::vector<midi::Note> notes;
    for (std::size_t i = 0; i < chords.size(); ++i)
    {
        auto until = i + 1 < chords.size() ? chords[i + 1].tick : endTick;
        if (until <= chords[i].tick)
            continue;
        for (int pitch : chords::pitches (chords[i].name))
            notes.push_back ({ chords[i].tick, until - chords[i].tick, pitch, velocity, chordsChannel });
    }
    return notes;
}

std::optional<Score> parse (std::span<const std::uint8_t> bytes, std::string* error)
{
    auto file = midi::read (bytes, error);
    if (! file)
        return std::nullopt;

    Score score;
    score.ppq = file->division;
    bool tempoSeen = false;
    std::int64_t last = 0;

    for (std::size_t t = 0; t < file->tracks.size(); ++t)
    {
        const auto& track = file->tracks[t];
        for (const auto& e : track.events)
        {
            last = std::max (last, e.tick);
            if (e.isMeta (midi::meta::tempo) && e.data.size() == 3 && ! tempoSeen)
            {
                auto micros = (e.data[0] << 16) | (e.data[1] << 8) | e.data[2];
                if (micros > 0)
                {
                    score.bpm = 60'000'000.0 / micros;
                    tempoSeen = true;
                }
            }
            else if (e.isMeta (midi::meta::timeSignature) && e.data.size() >= 2)
            {
                Meter m { e.tick, e.data[0], 1 << std::min<int> (e.data[1], 6) };
                if (m.numerator > 0 && (score.meters.empty() || score.meters.back().tick != m.tick))
                    score.meters.push_back (m);
                else if (m.numerator > 0)
                    score.meters.back() = m;
            }
            else if (e.isMeta (midi::meta::keySignature) && e.data.size() >= 2 && score.key.empty())
                score.key = keyName (static_cast<std::int8_t> (e.data[0]), e.data[1] != 0);
            else if (e.isMeta (midi::meta::marker))
                score.sections.push_back ({ e.tick, e.text() });
            else if (e.isMeta (midi::meta::trackName) && t == 0 && e.tick == 0)
                score.title = e.text();
        }

        auto role = roleOf (track.name());
        if (! role && t >= 1 && t <= 3 && track.name().empty())
            role = static_cast<Part> (t - 1); // an unnamed file: by position
        if (! role)
            continue;
        auto notes = midi::notesOf (track);
        switch (*role)
        {
            case Part::melody: score.melody = std::move (notes); break;
            case Part::instrument: score.instrument = std::move (notes); break;
            case Part::chords:
                score.chordNotes = std::move (notes);
                for (const auto& e : track.events)
                    if (e.isMeta (midi::meta::text))
                        if (auto text = e.text(); text.rfind (chordText, 0) == 0)
                            score.chords.push_back ({ e.tick, text.substr (std::char_traits<char>::length (chordText)) });
                break;
        }
    }

    std::sort (score.meters.begin(), score.meters.end(), [] (const Meter& a, const Meter& b) { return a.tick < b.tick; });
    if (score.meters.empty() || score.meters.front().tick != 0)
        score.meters.insert (score.meters.begin(), Meter { 0, 4, 4 });
    std::sort (score.sections.begin(), score.sections.end(), [] (const Section& a, const Section& b) { return a.tick < b.tick; });
    std::sort (score.chords.begin(), score.chords.end(), [] (const ChordSymbol& a, const ChordSymbol& b) { return a.tick < b.tick; });
    score.endTick = last;
    if (! (score.bpm > 5.0 && score.bpm < 1000.0))
        score.bpm = 120.0;
    return score;
}

std::optional<std::vector<std::uint8_t>> splice (std::span<const std::uint8_t> original, const Score& edited,
                                                 const std::vector<Part>& parts, std::string* error)
{
    int division = 0;
    auto chunks = midi::trackChunks (original, division, error);
    if (! chunks)
        return std::nullopt;
    auto file = midi::read (original, error);
    if (! file)
        return std::nullopt;
    if (division != edited.ppq)
    {
        if (error != nullptr)
            *error = "the score's MIDI file and the edited notes use other time bases";
        return std::nullopt;
    }

    for (auto part : parts)
    {
        // the track Plenio named for this part
        std::optional<std::size_t> index;
        for (std::size_t t = 1; t < file->tracks.size(); ++t)
            if (roleOf (file->tracks[t].name()) == part)
                index = t;
        if (! index)
        {
            if (error != nullptr)
                *error = std::string ("the score's MIDI file has no track ") + trackName (part);
            return std::nullopt;
        }

        midi::Track track;
        track.events.push_back (midi::metaEvent (0, midi::meta::trackName, trackName (part)));
        auto notes = part == Part::melody ? edited.melody : part == Part::instrument ? edited.instrument
                                                                                     : voicings (edited.chords, edited.endTick);
        int channel = part == Part::melody ? melodyChannel : part == Part::instrument ? instrumentChannel : chordsChannel;
        for (auto& n : notes)
        {
            n.channel = channel;
            n.velocity = velocity;
        }
        if (part == Part::chords)
            for (const auto& c : edited.chords)
                track.events.push_back (midi::metaEvent (c.tick, midi::meta::text, std::string (chordText) + c.name));
        midi::addNotes (track, notes);
        // the track lasts as long as the score, as Plenio writes it
        track.events.push_back (midi::metaEvent (edited.endTick, midi::meta::endOfTrack, ""));
        (*chunks)[*index] = midi::encodeTrack (track);
    }
    return midi::assemble (division, *chunks);
}

} // namespace plenio::score
