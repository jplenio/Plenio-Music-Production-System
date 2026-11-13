#include <doctest/doctest.h>

#include "core/daw_export.h"
#include "core/midi_file.h"

#include <cmath>
#include <filesystem>
#include <fstream>
#include <iterator>

using namespace plenio;

namespace
{
/// Four measures of 4/4 at 120, 100, 150 and 120 BPM, the first 1 s into the audio (one lead-in bar).
timeline::TakeTiming timing()
{
    timeline::BarMap m;
    m.score = { 0.0, 2.0, 4.0, 6.0, 8.0 };
    m.audio = { 1.0, 3.0, 5.4, 7.0, 9.0 };
    m.meters = { { 4, 4 }, { 4, 4 }, { 4, 4 }, { 4, 4 } };
    timeline::TakeTiming t;
    t.scoreBpm = 120.0;
    t.meters = m.meters;
    t.bars = m;
    return t;
}

score::Score song()
{
    score::Score s;
    s.ppq = 480;
    s.bpm = 120.0;
    s.title = "Night Drive";
    s.key = "Eb major";
    s.meters = { { 0, 4, 4 } };
    s.sections = { { 0, "verse" }, { 2 * 1920, "chorus" } };
    s.melody = { { 480, 480, 67, 90, 0 }, { 1920, 960, 69, 90, 0 } };
    s.instrument = { { 0, 1920, 48, 80, 1 } };
    s.chords = { { 0, "Cm" }, { 1920, "Ab" } };
    s.endTick = 4 * 1920;
    return s;
}
} // namespace

TEST_CASE ("key names become key signatures")
{
    CHECK (daw::keySignature ("A minor") == std::make_pair (0, true));
    CHECK (daw::keySignature ("Eb major") == std::make_pair (-3, false));
    CHECK (daw::keySignature ("F# major") == std::make_pair (6, false));
    CHECK (daw::keySignature ("C# minor") == std::make_pair (4, true));
    CHECK_FALSE (daw::keySignature ("H dorian"));
    CHECK_FALSE (daw::keySignature (""));
}

TEST_CASE ("the DAW's MIDI file puts the score on the project's tempo map")
{
    auto t = timing();
    auto bytes = daw::midiFile (song(), t, { { 0.5, 2.0, "Rain on the asphalt" } }, "Night Drive");
    auto file = midi::read (bytes);
    REQUIRE (file);
    CHECK (file->division == daw::ppq);
    REQUIRE (file->tracks.size() == 4);
    CHECK (file->tracks[1].name() == "Melody");
    CHECK (file->tracks[2].name() == "Instrument");
    CHECK (file->tracks[3].name() == "Chords");

    // the conductor: one tempo per measure (the lead-in bar first), 4/4 at the start, the key, the sections
    int tempos = 0;
    bool meter = false, key = false;
    std::vector<std::pair<std::int64_t, std::string>> markers;
    for (const auto& e : file->tracks[0].events)
    {
        tempos += e.isMeta (midi::meta::tempo) ? 1 : 0;
        meter = meter || (e.isMeta (midi::meta::timeSignature) && e.tick == 0 && e.data[0] == 4);
        key = key || (e.isMeta (midi::meta::keySignature) && static_cast<std::int8_t> (e.data[0]) == -3);
        if (e.isMeta (midi::meta::marker))
            markers.emplace_back (e.tick, e.text());
    }
    CHECK (tempos == 5);
    CHECK (meter);
    CHECK (key);
    REQUIRE (markers.size() == 2);
    // the score's first bar is the project's second (one lead-in bar of 4 quarters at 960)
    CHECK (markers[0] == std::make_pair (std::int64_t (4 * 960), std::string ("Verse")));
    CHECK (markers[1].first == 4 * 960 + 2 * 4 * 960);

    // the notes at their musical places, on channels 1-3
    auto melody = midi::notesOf (file->tracks[1]);
    REQUIRE (melody.size() == 2);
    CHECK (melody[0].tick == 4 * 960 + 960);
    CHECK (melody[0].length == 960);
    CHECK (melody[0].channel == 0);
    auto instrument = midi::notesOf (file->tracks[2]);
    REQUIRE (instrument.size() == 1);
    CHECK (instrument[0].channel == 1);
    auto chords = midi::notesOf (file->tracks[3]);
    CHECK (chords.size() >= 6); // two chords, three notes or more each
    CHECK (chords.front().channel == 2);

    // the sung line as a lyric where it is sung: 0.5 s into the audio, which starts 1 s into the project
    bool lyric = false;
    for (const auto& e : file->tracks[1].events)
        if (e.isMeta (midi::meta::lyric))
        {
            lyric = true;
            CHECK (e.text() == "Rain on the asphalt");
            CHECK (e.tick == 2 * 960 + 960); // 1.5 s at 120 BPM in the lead-in bar
        }
    CHECK (lyric);

    // the tempo map alone
    auto tempoOnly = midi::read (daw::midiFile (song(), t, {}, "Night Drive", 0));
    REQUIRE (tempoOnly);
    CHECK (tempoOnly->tracks.size() == 1);
    // one part with the conductor
    auto chordsOnly = midi::read (daw::midiFile (song(), t, {}, "Night Drive", daw::chordsPart));
    REQUIRE (chordsOnly);
    REQUIRE (chordsOnly->tracks.size() == 2);
    CHECK (chordsOnly->tracks[1].name() == "Chords");
}

TEST_CASE ("the click follows the measured bars")
{
    auto t = timing();
    auto layout = timeline::layOut (t);
    auto map = timeline::tempoMap (t, layout, daw::ppq);
    auto click = daw::clickTrack (map, 11.0, 1000.0);
    REQUIRE (click.frames() == 11000);
    auto loud = [&] (double seconds)
    {
        float peak = 0.0f;
        for (std::size_t i = static_cast<std::size_t> (seconds * 1000.0); i < static_cast<std::size_t> (seconds * 1000.0) + 10; ++i)
            peak = std::max (peak, std::abs (click.channels[0][i]));
        return peak;
    };
    CHECK (loud (0.0) > 0.01f);   // the lead-in bar's first beat
    CHECK (loud (0.5) > 0.01f);   // its second beat (120 BPM)
    CHECK (loud (0.25) < 0.001f); // between beats
    CHECK (loud (4.0) > 0.01f);   // the score's second measure (100 BPM) starts at 2 + 2 = 4 s of the project
    CHECK (loud (4.6) > 0.01f);   // its second beat: 0.6 s later
    CHECK (loud (4.3) < 0.001f);
}

TEST_CASE ("the take's files for the DAW start at the project's start")
{
    auto folder = std::filesystem::temp_directory_path() / "plenio-vst3-tests" / "daw";
    std::filesystem::remove_all (folder);
    std::filesystem::create_directories (folder);
    audio::Buffer tone;
    tone.sampleRate = 8000.0;
    tone.channels.assign (2, std::vector<float> (8000, 0.25f));
    std::string error;
    REQUIRE (audio::writeWav (folder / "source.wav", tone, 0.0, &error));

    daw::AudioJob job;
    job.folder = folder / "daw";
    job.base = "Night Drive - Take 2";
    job.title = "Night Drive";
    job.audio = folder / "source.wav";
    job.stems = { { "vocals", folder / "source.wav" } };
    job.audioAt = 0.5;
    job.seconds = 1.0;
    auto t = timing();
    job.map = timeline::tempoMap (t, timeline::layOut (t), daw::ppq);
    std::string problem;
    auto files = daw::writeAudio (job, problem);
    REQUIRE_MESSAGE (files, problem);
    auto made = audio::read (files->audio, &error);
    REQUIRE (made);
    CHECK (made->seconds() == doctest::Approx (1.5).epsilon (0.01)); // half a second of lead-in first
    CHECK (std::abs (made->channels[0][100]) < 1e-4f);
    CHECK (made->channels[0][static_cast<std::size_t> (0.75 * 8000)] == doctest::Approx (0.25f).epsilon (0.01));
    REQUIRE (files->stems.size() == 1);
    CHECK (std::filesystem::exists (files->stems[0].second));
    CHECK (std::filesystem::exists (files->click));

    REQUIRE (daw::writeMidi (*files, job.base, job.title, song(), t, {}, problem));
    CHECK (std::filesystem::exists (files->midi));
    CHECK (files->tempo.filename().string() == "Night Drive - Tempo map.mid");
    REQUIRE (files->parts.size() == 3);
    CHECK (files->parts[1].first == "Instrument Line");
    CHECK (std::filesystem::exists (files->parts[2].second));
    std::filesystem::remove_all (folder);
}
