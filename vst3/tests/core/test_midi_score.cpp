#include <doctest/doctest.h>

#include "core/chords.h"
#include "core/midi_file.h"
#include "core/score.h"

using namespace plenio;

namespace
{
/// A file the way Plenio's export writes it: conductor, Vocal, Instrument, Chords.
std::vector<std::uint8_t> plenioLikeFile()
{
    midi::File f;
    f.division = 480;
    midi::Track conductor;
    conductor.events.push_back (midi::metaEvent (0, midi::meta::trackName, "Night Drive"));
    conductor.events.push_back (midi::metaEvent (0, midi::meta::text, "plenio:score {\"version\":1,\"unit\":32,\"layout\":[4,4]}"));
    conductor.events.push_back (midi::tempoEvent (0, 84.0));
    conductor.events.push_back (midi::timeSignatureEvent (0, 4, 4));
    conductor.events.push_back (midi::timeSignatureEvent (3 * 1920, 2, 4));
    midi::Event key;
    key.status = 0xFF;
    key.metaType = midi::meta::keySignature;
    key.data = { 0, 1 }; // A minor
    conductor.events.push_back (key);
    conductor.events.push_back (midi::metaEvent (0, midi::meta::marker, "Verse 1"));
    conductor.events.push_back (midi::metaEvent (1920 * 2, midi::meta::marker, "Chorus"));
    conductor.events.push_back (midi::metaEvent (3 * 1920 + 960, midi::meta::endOfTrack, ""));
    f.tracks.push_back (conductor);

    midi::Track vocal;
    vocal.events.push_back (midi::metaEvent (0, midi::meta::trackName, "Vocal"));
    midi::addNotes (vocal, { { 0, 480, 69, 90, 0 }, { 480, 480, 71, 90, 0 }, { 960, 960, 72, 90, 0 } });
    f.tracks.push_back (vocal);

    midi::Track ins;
    ins.events.push_back (midi::metaEvent (0, midi::meta::trackName, "Instrument"));
    midi::addNotes (ins, { { 0, 1920, 57, 90, 1 } });
    f.tracks.push_back (ins);

    midi::Track chords;
    chords.events.push_back (midi::metaEvent (0, midi::meta::trackName, "Chords"));
    chords.events.push_back (midi::metaEvent (0, midi::meta::text, "plenio:chord Am"));
    chords.events.push_back (midi::metaEvent (1920, midi::meta::text, "plenio:chord F"));
    midi::addNotes (chords, score::voicings ({ { 0, "Am" }, { 1920, "F" } }, 3 * 1920 + 960));
    f.tracks.push_back (chords);
    return midi::write (f);
}
} // namespace

TEST_CASE ("a MIDI file survives writing and reading")
{
    auto bytes = plenioLikeFile();
    std::string error;
    auto file = midi::read (bytes, &error);
    REQUIRE_MESSAGE (file, error);
    CHECK (file->division == 480);
    CHECK (file->tracks.size() == 4);
    CHECK (file->tracks[1].name() == "Vocal");
    auto notes = midi::notesOf (file->tracks[1]);
    REQUIRE (notes.size() == 3);
    CHECK (notes[2].tick == 960);
    CHECK (notes[2].length == 960);
    CHECK (notes[2].pitch == 72);
}

TEST_CASE ("broken MIDI files are refused, never trusted")
{
    std::string error;
    CHECK_FALSE (midi::read (std::vector<std::uint8_t> {}, &error));
    CHECK_FALSE (midi::read (std::vector<std::uint8_t> { 'M', 'T', 'h', 'd', 0, 0, 0, 6, 0, 1, 0, 1, 0x80, 0x18 }, &error)); // SMPTE
    auto bytes = plenioLikeFile();
    bytes.resize (bytes.size() - 7); // cut inside the last track
    CHECK_FALSE (midi::read (bytes, &error));
    CHECK (! error.empty());
}

TEST_CASE ("Plenio's score is read: tempo, meters, key, sections, parts, chord symbols")
{
    auto s = score::parse (plenioLikeFile());
    REQUIRE (s);
    CHECK (s->title == "Night Drive");
    CHECK (s->bpm == doctest::Approx (84.0).epsilon (0.001));
    CHECK (s->key == "A minor");
    REQUIRE (s->meters.size() == 2);
    CHECK (s->meters[1].numerator == 2);
    REQUIRE (s->sections.size() == 2);
    CHECK (s->sections[1].name == "Chorus");
    CHECK (s->melody.size() == 3);
    CHECK (s->instrument.size() == 1);
    REQUIRE (s->chords.size() == 2);
    CHECK (s->chords[1].name == "F");
    auto starts = s->measureStarts();
    REQUIRE (starts.size() == 5); // three 4/4 measures, one 2/4, and the end
    CHECK (starts[3] == 3 * 1920);
    CHECK (starts[4] == 3 * 1920 + 960);
}

TEST_CASE ("edited parts go back inside Plenio's file, the rest byte for byte")
{
    auto original = plenioLikeFile();
    auto s = score::parse (original);
    REQUIRE (s);
    s->melody[1].pitch = 74;
    s->chords[1].name = "Dm7";
    std::string error;
    auto spliced = score::splice (original, *s, { score::Part::melody, score::Part::chords }, &error);
    REQUIRE_MESSAGE (spliced, error);

    int division = 0;
    auto before = midi::trackChunks (original, division);
    auto after = midi::trackChunks (*spliced, division);
    REQUIRE (before);
    REQUIRE (after);
    REQUIRE (after->size() == before->size());
    CHECK ((*after)[0] == (*before)[0]); // the conductor
    CHECK ((*after)[2] == (*before)[2]); // the instrument line, not edited
    CHECK ((*after)[1] != (*before)[1]);

    auto back = score::parse (*spliced);
    REQUIRE (back);
    CHECK (back->melody[1].pitch == 74);
    REQUIRE (back->chords.size() == 2);
    CHECK (back->chords[1].name == "Dm7");
    CHECK (back->chordNotes.size() == 3 + 4); // Am (3) and Dm7 (4) voiced as Plenio voices them
}

TEST_CASE ("chord symbols as YuE2 reads them")
{
    CHECK (chords::pitches ("C") == std::vector<int> { 48, 52, 55 });
    CHECK (chords::pitches ("Am7") == std::vector<int> { 57, 60, 64, 67 });
    CHECK (chords::pitches ("F/C") == std::vector<int> { 36, 53, 57, 60 });
    CHECK (chords::pitches ("Bbmaj7") == std::vector<int> { 58, 62, 65, 69 });
    CHECK (chords::pitches ("Cm(maj7)") == std::vector<int> { 48, 51, 55, 59 });
    CHECK (chords::pitches ("H7").empty());
    CHECK (chords::pitches ("Cadd9").empty()); // not in YuE2's dialect: silent, never guessed
    CHECK (chords::pitches ("C/").empty());
    auto chord = chords::parse ("F#m7b5/C");
    REQUIRE (chord);
    CHECK (chord->root == 6);
    CHECK (chord->quality == "m7b5");
    CHECK (chords::symbol (*chord) == "F#m7b5/C");
    CHECK (chords::qualities().size() == 15);
}
