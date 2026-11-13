#include "core/daw_export.h"
#include "core/midi_file.h"
#include "core/paths.h"

#include <algorithm>
#include <cctype>
#include <cmath>
#include <cstdio>
#include <map>

namespace plenio::daw
{

std::optional<std::pair<int, bool>> keySignature (const std::string& name)
{
    auto space = name.find (' ');
    if (space == std::string::npos)
        return std::nullopt;
    auto tonic = name.substr (0, space);
    auto mode = name.substr (space + 1);
    const bool minor = mode == "minor";
    if (! minor && mode != "major")
        return std::nullopt;
    static const std::map<std::string, int> majors { { "Cb", -7 }, { "Gb", -6 }, { "Db", -5 }, { "Ab", -4 }, { "Eb", -3 },
                                                     { "Bb", -2 }, { "F", -1 },  { "C", 0 },   { "G", 1 },   { "D", 2 },
                                                     { "A", 3 },   { "E", 4 },   { "B", 5 },   { "F#", 6 },  { "C#", 7 } };
    static const std::map<std::string, int> minors { { "Ab", -7 }, { "Eb", -6 }, { "Bb", -5 }, { "F", -4 },  { "C", -3 },
                                                     { "G", -2 },  { "D", -1 },  { "A", 0 },   { "E", 1 },   { "B", 2 },
                                                     { "F#", 3 },  { "C#", 4 },  { "G#", 5 },  { "D#", 6 },  { "A#", 7 } };
    const auto& table = minor ? minors : majors;
    auto it = table.find (tonic);
    if (it == table.end())
        return std::nullopt;
    return std::make_pair (it->second, minor);
}

namespace
{
midi::Track named (const std::string& name)
{
    midi::Track t;
    t.events.push_back (midi::metaEvent (0, midi::meta::trackName, name));
    return t;
}

std::vector<midi::Note> onProject (const std::vector<midi::Note>& notes, const timeline::Layout& layout, int scorePpq, int channel)
{
    std::vector<midi::Note> out;
    out.reserve (notes.size());
    for (const auto& n : notes)
    {
        auto start = timeline::scoreTickToProjectTick (layout, n.tick, scorePpq, ppq);
        auto end = timeline::scoreTickToProjectTick (layout, n.tick + std::max<std::int64_t> (1, n.length), scorePpq, ppq);
        midi::Note m = n;
        m.tick = start;
        m.length = std::max<std::int64_t> (1, end - start);
        m.channel = channel;
        out.push_back (m);
    }
    return out;
}
} // namespace

std::vector<std::uint8_t> midiFile (const score::Score& score, const timeline::TakeTiming& timing, const std::vector<record::Line>& lines,
                                    const std::string& title, int parts)
{
    auto layout = timeline::layOut (timing);
    auto map = timeline::tempoMap (timing, layout, ppq);

    midi::File file;
    file.format = 1;
    file.division = ppq;

    // the conductor: the tempo of every measure, the meters, the key, the sections
    auto conductor = named (title.empty() ? std::string ("Plenio") : title);
    bool meterAtStart = false;
    for (const auto& e : map)
    {
        conductor.events.push_back (midi::tempoEvent (e.tick, e.bpm));
        if (e.meterChanges || e.tick == 0)
        {
            conductor.events.push_back (midi::timeSignatureEvent (e.tick, e.meter.first, e.meter.second));
            meterAtStart = meterAtStart || e.tick == 0;
        }
    }
    if (! meterAtStart)
        conductor.events.push_back (midi::timeSignatureEvent (0, layout.firstMeter.first, layout.firstMeter.second));
    if (auto key = keySignature (score.key))
    {
        midi::Event k;
        k.tick = 0;
        k.status = 0xFF;
        k.metaType = midi::meta::keySignature;
        k.data = { static_cast<std::uint8_t> (static_cast<std::int8_t> (key->first)), static_cast<std::uint8_t> (key->second ? 1 : 0) };
        conductor.events.push_back (k);
    }
    for (const auto& s : score.sections)
        conductor.events.push_back (midi::metaEvent (timeline::scoreTickToProjectTick (layout, s.tick, score.ppq, ppq), midi::meta::marker,
                                                     s.name.empty() ? std::string () : std::string (1, static_cast<char> (std::toupper (static_cast<unsigned char> (s.name[0])))) + s.name.substr (1)));
    midi::sortEvents (conductor);
    file.tracks.push_back (std::move (conductor));

    if ((parts & melodyPart) != 0)
    {
        auto melody = named ("Melody");
        midi::addNotes (melody, onProject (score.melody, layout, score.ppq, 0));
        for (const auto& l : lines)
        {
            auto text = l.text;
            if (text.empty())
                continue;
            auto tick = timeline::secondsToTick (map, layout.audioAt + l.start, ppq);
            melody.events.push_back (midi::metaEvent (std::max<std::int64_t> (0, tick), midi::meta::lyric, text.substr (0, 400)));
        }
        midi::sortEvents (melody);
        file.tracks.push_back (std::move (melody));
    }
    if ((parts & instrumentPart) != 0)
    {
        auto instrument = named ("Instrument");
        midi::addNotes (instrument, onProject (score.instrument, layout, score.ppq, 1));
        midi::sortEvents (instrument);
        file.tracks.push_back (std::move (instrument));
    }
    if ((parts & chordsPart) != 0)
    {
        auto chords = named ("Chords");
        midi::addNotes (chords, onProject (score::voicings (score.chords, score.endTick), layout, score.ppq, 2));
        for (const auto& c : score.chords)
            chords.events.push_back (midi::metaEvent (timeline::scoreTickToProjectTick (layout, c.tick, score.ppq, ppq), midi::meta::text, c.name));
        midi::sortEvents (chords);
        file.tracks.push_back (std::move (chords));
    }
    return midi::write (file);
}

audio::Buffer clickTrack (const std::vector<timeline::TempoEvent>& map, double seconds, double rate)
{
    audio::Buffer out;
    out.sampleRate = rate;
    const auto frames = static_cast<std::size_t> (std::max (0.0, seconds) * rate);
    out.channels.assign (1, std::vector<float> (frames, 0.0f));
    if (map.empty() || frames == 0)
        return out;
    auto& samples = out.channels[0];
    const auto clickFrames = static_cast<std::size_t> (0.025 * rate);
    auto click = [&] (double at, bool accent)
    {
        const auto start = static_cast<std::size_t> (std::max (0.0, at) * rate);
        const double pitch = accent ? 1760.0 : 1320.0;
        const float level = accent ? 0.7f : 0.45f;
        for (std::size_t i = 0; i < clickFrames && start + i < frames; ++i)
        {
            const double t = static_cast<double> (i) / rate;
            const double envelope = std::exp (-t * 160.0);
            samples[start + i] += level * static_cast<float> (envelope * std::sin (2.0 * 3.14159265358979 * pitch * t));
        }
    };
    // beats of every measure: the measure's tempo until the next event (each event of the map starts a measure)
    for (std::size_t m = 0; m < map.size(); ++m)
    {
        const auto& e = map[m];
        const double beat = 60.0 / std::max (1.0, e.bpm) * 4.0 / std::max (1, e.meter.second);
        const double end = m + 1 < map.size() ? map[m + 1].seconds : seconds;
        int index = 0;
        for (double at = e.seconds; at < end - 1e-6 && at < seconds; at += beat, ++index)
        {
            // a measure longer than its meter (the last event, continued): the bar starts again every numerator beats
            click (at, index % std::max (1, e.meter.first) == 0);
        }
    }
    return out;
}

namespace
{
namespace fs = std::filesystem;

/// The file is there and not older than what it is made of.
bool fresh (const fs::path& made, const fs::path& source)
{
    std::error_code ec;
    if (! fs::exists (made, ec) || fs::file_size (made, ec) == 0)
        return false;
    auto a = fs::last_write_time (made, ec);
    if (ec)
        return false;
    auto b = fs::last_write_time (source, ec);
    return ec || a >= b;
}

bool writeAudioFile (const fs::path& source, const fs::path& target, double leadIn, std::string& problem)
{
    if (fresh (target, source))
        return true;
    std::string error;
    auto buffer = audio::read (source, &error);
    if (! buffer)
    {
        problem = "The audio could not be read: " + error;
        return false;
    }
    // written next to the target, then put in place: a DAW never sees half a file
    auto part = target;
    part += ".part";
    if (! audio::writeWav (part, *buffer, leadIn, &error))
    {
        problem = "The DAW file could not be written: " + error;
        return false;
    }
    std::error_code ec;
    fs::rename (part, target, ec);
    if (ec)
    {
        fs::remove (part, ec);
        problem = "The DAW file could not be put in place (is it open in the DAW?).";
        return false;
    }
    return true;
}
} // namespace

std::optional<Files> writeAudio (const AudioJob& job, std::string& problem)
{
    std::error_code ec;
    fs::create_directories (job.folder, ec);
    if (ec)
    {
        problem = "The folder for the DAW's files could not be made: " + ec.message();
        return std::nullopt;
    }
    Files files;
    files.folder = job.folder;
    files.source = job.audio;
    files.audio = job.folder / paths::fromUtf8 (job.base + ".wav");
    if (! writeAudioFile (job.audio, files.audio, job.audioAt, problem))
        return std::nullopt;
    for (const auto& [name, path] : job.stems)
    {
        auto target = job.folder / paths::fromUtf8 (job.base + " - " + name + ".wav");
        if (! writeAudioFile (path, target, job.audioAt, problem))
            return std::nullopt;
        files.stems.emplace_back (name, target);
    }
    files.click = job.folder / paths::fromUtf8 (job.title + " - Click.wav");
    if (! fresh (files.click, files.audio))
    {
        auto click = clickTrack (job.map, job.audioAt + job.seconds);
        std::string error;
        if (! audio::writeWav (files.click, click, 0.0, &error))
            files.click.clear(); // the click is a help, not a must
    }
    return files;
}

bool writeMidi (Files& files, const std::string& base, const std::string& title, const score::Score& score,
                const timeline::TakeTiming& timing, const std::vector<record::Line>& lines, std::string& problem)
{
    auto write = [&] (const fs::path& target, const std::vector<std::uint8_t>& bytes)
    {
        auto part = target;
        part += ".part";
        {
            std::FILE* f = nullptr;
#ifdef _WIN32
            f = _wfopen (part.c_str(), L"wb");
#else
            f = std::fopen (part.c_str(), "wb");
#endif
            if (f == nullptr)
                return false;
            const bool ok = std::fwrite (bytes.data(), 1, bytes.size(), f) == bytes.size();
            std::fclose (f);
            if (! ok)
                return false;
        }
        std::error_code ec;
        fs::rename (part, target, ec);
        return ! ec;
    };
    files.midi = files.folder / paths::fromUtf8 (base + ".mid");
    files.tempo = files.folder / paths::fromUtf8 (title + " - Tempo map.mid");
    bool ok = write (files.midi, midiFile (score, timing, lines, title)) && write (files.tempo, midiFile (score, timing, lines, title, 0));
    files.parts.clear();
    for (const auto& [name, part] : { std::pair<std::string, int> { "Melody", melodyPart }, { "Instrument Line", instrumentPart }, { "Chords", chordsPart } })
    {
        auto target = files.folder / paths::fromUtf8 (base + " - " + name + ".mid");
        ok = ok && write (target, midiFile (score, timing, lines, title, part));
        files.parts.emplace_back (name, target);
    }
    if (! ok)
    {
        problem = "The MIDI file could not be written (is it open in the DAW?).";
        return false;
    }
    return true;
}

} // namespace plenio::daw
