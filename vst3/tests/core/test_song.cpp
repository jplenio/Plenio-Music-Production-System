#include <doctest/doctest.h>

#include "core/audio_file.h"
#include "core/library.h"
#include "core/record.h"
#include "core/song.h"

#include <cmath>
#include <filesystem>

using namespace plenio;
using namespace plenio::core;

namespace
{
Song songWithTake()
{
    Song s;
    s.id = "s-000000000001";
    s.title = "Night Drive";
    s.fields = { { "genre", "synthwave" }, { "vocals", "sung" } };
    Take t;
    t.number = 1;
    t.job = "job-1";
    t.title = "Night Drive";
    t.fields = s.fields;
    t.documents = { { "title", "Night Drive" }, { "style", "synthwave" }, { "lyrics", "[verse]\nRain" }, { "score", "X:1" } };
    t.stars = 4.5;
    t.seconds = 92.4;
    t.sampleRate = 48000;
    t.files = { { "song", "takes/1/take.flac" } };
    t.stems = { { "vocals", "takes/1/stems/vocals.flac" } };
    t.warp = timeline::Warp { 1.01, -1.2 };
    t.lines = { { 12.0, 15.5, "Rain on the asphalt" } };
    s.takes.push_back (t);
    s.adopt (0);
    return s;
}
} // namespace

TEST_CASE ("what Generate does follows the add-in's rules")
{
    Song fresh;
    CHECK (fresh.plan (Mode::automatic).what == What::newSong);

    auto s = songWithTake();
    CHECK (s.changes().empty());
    auto plan = s.plan (Mode::automatic);
    CHECK (plan.what == What::newTake);
    CHECK (plan.documents.at ("score") == "X:1"); // the same notes, sung again

    s.documents["lyrics"] = Doc { "[verse]\nSnow", true };
    plan = s.plan (Mode::automatic);
    CHECK (plan.what == What::recompose); // new words need new notes
    CHECK (plan.documents.count ("score") == 0);
    CHECK (plan.documents.at ("lyrics") == "[verse]\nSnow");

    s.edits.melody = std::vector<midi::Note> { { 0, 480, 60, 90, 0 } };
    plan = s.plan (Mode::automatic);
    CHECK (plan.what == What::singYourNotes); // the owner's notes, sung as written
    CHECK (plan.notesEdited);

    s.fields["genre"] = "jazz";
    plan = s.plan (Mode::automatic);
    CHECK (plan.what == What::rewrite);
    CHECK (plan.documents.count ("score") == 0);
    CHECK (plan.documents.count ("title") == 0); // only what the owner wrote stays: the lyrics
    CHECK (plan.documents.at ("lyrics") == "[verse]\nSnow");

    auto changes = s.changes();
    CHECK (std::find (changes.begin(), changes.end(), "brief") != changes.end());
    CHECK (std::find (changes.begin(), changes.end(), "notes") != changes.end());
}

TEST_CASE ("a song survives JSON, and hostile JSON gives a sane song")
{
    auto s = songWithTake();
    s.edits.chords = std::vector<score::ChordSymbol> { { 0, "Am" }, { 1920, "F" } };
    s.takesPerRun = 4;
    auto back = songFromJson (toJson (s));
    CHECK (back.id == s.id);
    CHECK (back.takesPerRun == 4);
    REQUIRE (back.takes.size() == 1);
    CHECK (back.takes[0].stars == doctest::Approx (4.5));
    CHECK (back.takes[0].warp->b == doctest::Approx (-1.2));
    CHECK (back.takes[0].stems[0].name == "vocals");
    REQUIRE (back.edits.chords);
    CHECK ((*back.edits.chords)[1].name == "F");
    CHECK (toJson (back) == toJson (s));

    Json hostile = { { "id", 5 }, { "takes_per_run", 99 }, { "active_take", 7 }, { "takes", Json::array ({ { { "stars", 99 }, { "warp", { 1, "x" } } } }) },
                     { "edits", { { "melody", Json::array ({ Json::array ({ -1, 0, 300 }), Json::array ({ 0, 480, 60 }) }) } } } };
    auto sane = songFromJson (hostile);
    CHECK (! sane.id.empty());
    CHECK (sane.takesPerRun == 4);
    CHECK (sane.activeTake == 0);
    CHECK (sane.takes[0].stars == doctest::Approx (5.0));
    CHECK_FALSE (sane.takes[0].warp);
    REQUIRE (sane.edits.melody);
    CHECK (sane.edits.melody->size() == 1);
}

TEST_CASE ("base64 both ways")
{
    std::vector<std::uint8_t> bytes { 0, 1, 2, 250, 251, 252, 'M', 'T' };
    for (std::size_t n = 0; n <= bytes.size(); ++n)
    {
        std::vector<std::uint8_t> part (bytes.begin(), bytes.begin() + static_cast<std::ptrdiff_t> (n));
        CHECK (base64Decode (base64Encode (part)) == part);
    }
    CHECK (base64Encode ({ 'M', 'a', 'n' }) == "TWFu");
}

TEST_CASE ("a release record and its subtitles are read leniently")
{
    Json r = { { "title", "The Unspoken Things" },
               { "documents", { { "lyrics", { { "state", "auto" }, { "text", "[Verse]\nI wrote" } } }, { "score", { { "text", "X:1" } } } } },
               { "quality", { { "stars", 4.0 } } },
               { "audio", { { "seconds", 81.44 }, { "sample_rate", 48000 } } },
               { "timing", Json::array ({ { { "warp", { 1.001, -1.25 } }, { "lines", Json::array ({ { { "start", 2.0 }, { "end", 4.0 }, { "text", "I wrote" } }, { { "start", -1 }, { "end", 0 } } }) } } }) },
               { "files", Json::array ({ { { "name", "a.flac" } }, { { "name", "a-stems/vocals.flac" }, { "role", "stem" }, { "stem", "vocals" } } }) } };
    auto rec = record::parse (r);
    CHECK (rec.title == "The Unspoken Things");
    CHECK (rec.documents.at ("score") == "X:1");
    CHECK (rec.stars == doctest::Approx (4.0));
    CHECK (rec.sampleRate == 48000);
    REQUIRE (rec.warp);
    CHECK (rec.warp->a == doctest::Approx (1.001));
    CHECK (rec.lines.size() == 1);
    CHECK (rec.files[1].stem == "vocals");

    auto lines = record::parseSrt ("\xEF\xBB\xBF" "1\r\n00:00:02,000 --> 00:00:04,500\r\nRain on the asphalt\r\n\r\n2\n00:00:05,000 --> 00:00:06,000\nWe ride\nall night\n");
    REQUIRE (lines.size() == 2);
    CHECK (lines[0].end == doctest::Approx (4.5));
    CHECK (lines[1].text == "We ride\nall night");

    Json job = { { "id", "abc" }, { "status", "succeeded" }, { "stems", true },
                 { "result", { { "title", "T" }, { "files", Json::array ({ { { "name", "x.flac" }, { "url", "/plenio/api/v1/jobs/abc/files/x.flac" } },
                                                                          { { "name", "evil" }, { "url", "http://elsewhere/x" } } }) } } } };
    auto parsed = record::parseJob (job);
    REQUIRE (parsed);
    CHECK (parsed->finished());
    CHECK (parsed->stems);
    CHECK (parsed->files.size() == 1); // only the API's own file paths
}

TEST_CASE ("the library keeps a song in its folder and finds it again")
{
    auto root = std::filesystem::temp_directory_path() / "plenio-vst3-tests" / "library";
    std::filesystem::remove_all (root);
    Library library (root);
    auto s = songWithTake();
    REQUIRE (library.save (s));
    auto folder = library.find (s.id);
    REQUIRE (folder);
    CHECK (folder->filename().string().find ("Night Drive [s-000000000001]") != std::string::npos);
    auto loaded = library.load (s.id);
    REQUIRE (loaded);
    CHECK (loaded->takes.size() == 1);
    auto list = library.list();
    REQUIRE (list.size() == 1);
    CHECK (list[0].bestStars == doctest::Approx (4.5));
    CHECK (Library::takeFolder (*folder, 3) == *folder / "takes" / "3");

    // the folder follows the title once it is known
    s.title = "A River of Traffic";
    CHECK (library.tidy (s));
    auto moved = library.find (s.id);
    REQUIRE (moved);
    CHECK (moved->filename().string() == "A River of Traffic [s-000000000001]");
    CHECK (! library.tidy (s)); // the same name already
    CHECK (library.load (s.id));
    std::filesystem::remove_all (root);
}

TEST_CASE ("audio is written, read, resampled and measured")
{
    audio::Buffer tone;
    tone.sampleRate = 44100.0;
    tone.channels.assign (2, std::vector<float> (44100));
    for (std::size_t i = 0; i < 44100; ++i)
        tone.channels[0][i] = tone.channels[1][i] = 0.5f * static_cast<float> (std::sin (2.0 * 3.14159265358979 * 441.0 * static_cast<double> (i) / 44100.0));
    auto file = std::filesystem::temp_directory_path() / "plenio-vst3-tests" / "tone.wav";
    std::string error;
    REQUIRE_MESSAGE (audio::writeWav (file, tone, 0.5, &error), error);
    auto back = audio::read (file, &error);
    REQUIRE_MESSAGE (back, error);
    CHECK (back->sampleRate == doctest::Approx (44100.0));
    CHECK (back->frames() == 44100 + 22050); // the half second of silence first
    CHECK (std::abs (back->channels[0][22050 + 25]) == doctest::Approx (std::abs (tone.channels[0][25])).epsilon (0.001));

    auto at48 = audio::resample (*back, 48000.0);
    CHECK (at48.frames() == 72000);
    // the tone's level stays where the tone is
    float peak = 0.0f;
    for (std::size_t i = 30000; i < 60000; ++i)
        peak = std::max (peak, std::abs (at48.channels[0][i]));
    CHECK (peak == doctest::Approx (0.5).epsilon (0.02));

    auto p = audio::peaks (*back, 10);
    REQUIRE (p.size() == 10);
    CHECK (p[0] < 0.01f);  // silence
    CHECK (p[9] > 0.45f);  // the tone
    std::filesystem::remove (file);
}
