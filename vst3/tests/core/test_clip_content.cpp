#include <doctest/doctest.h>

#include "core/clip_content.h"
#include "core/library.h"
#include "core/midi_file.h"
#include "core/score.h"

#include <filesystem>

using namespace plenio;
using namespace plenio::core;

namespace
{
/// Plenio's MIDI of a score: 4/4 at 120 BPM (as the bars below), E♭ major, two sung notes, two chords.
std::string scoreMidiBase64()
{
    midi::File f;
    f.division = 480;
    midi::Track conductor;
    conductor.events.push_back (midi::metaEvent (0, midi::meta::trackName, "A River of Traffic"));
    conductor.events.push_back (midi::tempoEvent (0, 120.0));
    conductor.events.push_back (midi::timeSignatureEvent (0, 4, 4));
    midi::Event key;
    key.status = 0xFF;
    key.metaType = midi::meta::keySignature;
    key.data = { static_cast<std::uint8_t> (static_cast<std::int8_t> (-3)), 0 }; // E♭ major
    conductor.events.push_back (key);
    conductor.events.push_back (midi::metaEvent (4 * 1920, midi::meta::endOfTrack, ""));
    f.tracks.push_back (conductor);
    midi::Track vocal;
    vocal.events.push_back (midi::metaEvent (0, midi::meta::trackName, "Vocal"));
    midi::addNotes (vocal, { { 480, 480, 67, 127, 0 }, { 1920, 960, 70, 90, 0 } });
    f.tracks.push_back (vocal);
    midi::Track chords;
    chords.events.push_back (midi::metaEvent (0, midi::meta::trackName, "Chords"));
    chords.events.push_back (midi::metaEvent (0, midi::meta::text, "plenio:chord Eb"));
    chords.events.push_back (midi::metaEvent (1920, midi::meta::text, "plenio:chord Cm7b5/Gb"));
    midi::addNotes (chords, score::voicings ({ { 0, "Eb" }, { 1920, "Cm7b5/Gb" } }, 4 * 1920));
    f.tracks.push_back (chords);
    return base64Encode (midi::write (f));
}

/// A song of one take: four measures of 4/4 at 120 BPM, the first 1 s into the audio (one lead-in bar of 2 s).
Song riverSong()
{
    Song s;
    s.id = "s-0000000000aa";
    s.title = "A River of Traffic";
    Take t;
    t.number = 2;
    t.title = s.title;
    t.seconds = 9.0;
    timeline::BarMap bars;
    bars.score = { 0.0, 2.0, 4.0, 6.0, 8.0 };
    bars.audio = { 1.0, 3.0, 5.0, 7.0, 9.0 };
    bars.meters = { { 4, 4 }, { 4, 4 }, { 4, 4 }, { 4, 4 } };
    t.bars = bars;
    t.scoreMidi = scoreMidiBase64();
    s.takes.push_back (t);
    s.adopt (0);
    return s;
}
} // namespace

TEST_CASE ("a clip's name says which take it is")
{
    auto a = parseClipName ("A River of Traffic - Take 2.wav");
    REQUIRE (a);
    CHECK (a->title == "A River of Traffic");
    CHECK (a->take == 2);
    CHECK (a->stem.empty());

    auto b = parseClipName ("C:\\Songs\\daw\\A River of Traffic - Take 12 - Vocals_01.wav");
    REQUIRE (b);
    CHECK (b->take == 12);
    CHECK (b->stem == "vocals");

    auto c = parseClipName ("Night - Drive - Take 3 (1)"); // a DAW's own number after it
    REQUIRE (c);
    CHECK (c->title == "Night - Drive");
    CHECK (c->take == 3);

    CHECK_FALSE (parseClipName ("A River of Traffic - Take 2b"));
    CHECK_FALSE (parseClipName ("A River of Traffic.wav"));
    CHECK_FALSE (parseClipName ("A River of Traffic - Take .wav"));
    CHECK_FALSE (parseClipName (""));
}

TEST_CASE ("note names on the circle of fifths, with music signs")
{
    CHECK (fifthsOf ("C") == 0);
    CHECK (fifthsOf ("G") == 1);
    CHECK (fifthsOf ("F") == -1);
    CHECK (fifthsOf ("Eb") == -3);
    CHECK (fifthsOf ("F#") == 6);
    CHECK (fifthsOf ("Gb") == -6);
    CHECK_FALSE (fifthsOf ("H"));
    CHECK (withMusicSigns ("Bbm7b5") == "B\xE2\x99\xAD" "m7\xE2\x99\xAD" "5");
    CHECK (withMusicSigns ("F#") == "F\xE2\x99\xAF");
    CHECK (withMusicSigns ("Am") == "Am");
}

TEST_CASE ("a clip is found in the library by its name and length")
{
    auto root = std::filesystem::temp_directory_path() / "plenio-vst3-tests" / "clips";
    std::filesystem::remove_all (root);
    Library library (root);
    REQUIRE (library.save (riverSong()));

    // the DAW's file: the lead-in (1 s: the first bar line at the project's start, the audio a second later) and 9 s
    auto daw = matchClip (library, "A River of Traffic - Take 2.wav", 10.0);
    REQUIRE (daw);
    CHECK (daw->takeIndex == 0);
    CHECK (daw->offset == doctest::Approx (0.0));
    // Plenio's own file of the take: 9 s, the lead-in before it
    auto own = matchClip (library, "A River of Traffic - Take 2.flac", 9.02);
    REQUIRE (own);
    CHECK (own->offset == doctest::Approx (1.0));
    // another length, another take, another song: not this take
    CHECK_FALSE (matchClip (library, "A River of Traffic - Take 2.wav", 30.0));
    CHECK_FALSE (matchClip (library, "A River of Traffic - Take 3.wav", 10.0));
    CHECK_FALSE (matchClip (library, "Night Drive - Take 2.wav", 10.0));
    std::filesystem::remove_all (root);
}

TEST_CASE ("a take's content on the clip's own time")
{
    ClipMatch match;
    match.song = riverSong();
    match.takeIndex = 0;
    match.offset = 0.0; // the DAW's file

    auto c = contentOf (match);
    // the lead-in bar and four measures at 120 BPM, then the end
    REQUIRE (c.tempo.size() == 6);
    CHECK (c.tempo[0].seconds == doctest::Approx (0.0)); // the lead-in bar at the project's start
    CHECK (c.tempo[1].seconds == doctest::Approx (2.0)); // the score's first bar
    for (std::size_t k = 1; k < c.tempo.size(); ++k)
    {
        CHECK (c.tempo[k].quarters - c.tempo[k - 1].quarters == doctest::Approx (4.0));
        CHECK (c.tempo[k].seconds - c.tempo[k - 1].seconds == doctest::Approx (2.0));
    }
    REQUIRE (c.bars.size() == 1);
    CHECK (c.bars[0].numerator == 4);

    // the sung notes: the first a quarter after the score's first bar (one lead-in bar of 4 quarters)
    REQUIRE (c.notes.size() == 2);
    CHECK (c.notes[0].pitch == 67);
    CHECK (c.notes[0].start - c.tempo[1].seconds == doctest::Approx (0.5));
    CHECK (c.notes[0].duration == doctest::Approx (0.5));
    CHECK (c.notes[0].volume == doctest::Approx (1.0f));

    // the chords: roots and basses on the circle of fifths, degrees, names with music signs
    REQUIRE (c.chords.size() == 2);
    CHECK (c.chords[0].quarters == doctest::Approx (4.0));
    CHECK (c.chords[0].root == -3);
    CHECK (c.chords[0].degrees[0] == 1);
    CHECK (c.chords[0].degrees[4] == 3);
    CHECK (c.chords[0].degrees[7] == 5);
    CHECK (c.chords[1].root == 0);
    CHECK (c.chords[1].bass == -6);
    CHECK (c.chords[1].degrees[3] == 3);
    CHECK (c.chords[1].degrees[6] == 5);
    CHECK (c.chords[1].degrees[10] == 7);
    CHECK (c.chords[1].name == "Cm7\xE2\x99\xAD" "5/G\xE2\x99\xAD");
    REQUIRE (c.key);
    CHECK (c.key->root == -3);
    CHECK_FALSE (c.key->minor);

    // Plenio's own file starts a second later on the project: everything a second earlier on its own time
    match.offset = 1.0;
    auto own = contentOf (match);
    CHECK (own.notes[0].start == doctest::Approx (c.notes[0].start - 1.0));
    CHECK (own.tempo[1].seconds == doctest::Approx (c.tempo[1].seconds - 1.0));

    // a drum stem: the tempo and the chords, no sung notes
    match.stem = "drums";
    CHECK (contentOf (match).notes.empty());
}
