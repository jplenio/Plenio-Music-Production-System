// A song: what it is made from, its takes, and what the owner changed since the active take.
//
// A take never changes once made: the fields, documents and seeds it was made from, its audio files, stems, bars,
// sung lines and its score as Plenio's MIDI file (kept inside the take, so a project carries every note even without
// the song library). The working copy (fields, documents, edits of notes and chords) starts as the active take's.
// What the next take is made from follows the SoundCraft add-in's rules (Song::plan): a changed brief writes the song
// anew, changed words without own notes compose new notes, changed notes are sung as written, nothing changed makes a
// new take of the same song.
#pragma once

#include "core/json.h"
#include "core/record.h"
#include "core/score.h"
#include "core/timeline.h"

#include <cstdint>
#include <map>
#include <optional>
#include <set>
#include <string>
#include <vector>

namespace plenio::core
{

/// The most takes one song keeps.
inline constexpr std::size_t maxTakes = 400;

struct Doc
{
    std::string text;
    bool manual = false; // the owner wrote or changed it: sent as it is, never replaced
};

struct StemFile
{
    std::string name; // vocals, drums, bass, other, rest
    std::string file; // relative to the song's folder
};

struct Take
{
    int number = 0;
    std::string job;
    std::int64_t created = 0; // seconds since 1970
    std::string title;
    std::string what;         // what Generate did ("render a new take of the same song")
    Json fields = Json::object();
    std::map<std::string, std::uint64_t> seeds;
    std::map<std::string, std::string> documents;
    std::optional<double> stars;
    Json quality = Json::object();
    double seconds = 0.0;
    int sampleRate = 0;
    std::map<std::string, std::string> files; // song, original, record, lines, midi, bars: relative to the song folder
    std::vector<StemFile> stems;
    std::optional<timeline::Warp> warp;
    std::optional<timeline::BarMap> bars;
    std::vector<record::Line> lines; // seconds of the take's audio
    std::string scoreMidi;           // Plenio's MIDI file of the take's score, base64 ("" when it has none)

    /// The take's score, parsed from scoreMidi (cached by the song).
    std::optional<score::Score> score() const;
    timeline::TakeTiming timing() const;
    std::string label() const; // "Take 3 · 4.5 stars"
};

/// The owner's changes of the active take's notes and chords, kept until the next take.
struct Edits
{
    std::optional<std::vector<midi::Note>> melody;
    std::optional<std::vector<midi::Note>> instrument;
    std::optional<std::vector<score::ChordSymbol>> chords;

    bool any() const { return melody || instrument || chords; }
};

enum class SongKind { song, cover };

/// A job of this song in the making (kept so that reopening a project follows it on).
struct PendingJob
{
    std::string id;           // the Song API's job id; empty while it is being submitted
    std::string group;        // the run it belongs to (takes of one Generate)
    int index = 0;            // its place in the run (0: the first take)
    int number = 0;           // the take number it will be
    std::string what;
    std::int64_t submitted = 0;
    std::string status;       // queued, running, …
    std::string stage;
    double progress = 0.0;
    std::optional<int> queuePosition;
};

enum class Mode { automatic, newTake, recompose, rewrite };
enum class What { newSong, newTake, singYourNotes, recompose, rewrite };

const char* label (What what);

struct Plan
{
    What what = What::newSong;
    Json fields = Json::object();
    std::map<std::string, std::string> documents;
    std::map<std::string, std::uint64_t> seeds; // the seeds the owner locked
    bool notesEdited = false;                   // the edited notes go back to Plenio first (its score as manual)
};

struct Song
{
    std::string id;
    std::string title;
    SongKind kind = SongKind::song;
    std::string templateId = "yue2-song";
    std::int64_t created = 0;
    std::int64_t modified = 0;
    Json fields = Json::object();                 // the brief as the owner has it now
    std::map<std::string, std::uint64_t> seeds;   // seeds the owner locked (others are drawn anew)
    std::map<std::string, Doc> documents;         // the working copy
    std::string sourceUpload;                     // a cover's recording in ComfyUI's input folder
    std::string sourceFile;                       // and as a file of the song (relative)
    int takesPerRun = 1;                          // 1 ... 4
    bool stems = true;                            // stems with every take
    Edits edits;
    std::vector<Take> takes;
    int activeTake = -1;
    std::vector<PendingJob> jobs;

    const Take* active() const;
    Take* active();
    int nextTakeNumber() const;

    /// What changed since the active take: "brief", "lyrics", "notes", "chords" …
    std::vector<std::string> changes() const;
    Plan plan (Mode mode) const;

    /// A take arrived (or was chosen): its documents and fields become the working copy, the edits are gone.
    void adopt (int index);

    /// The score the owner sees now: the active take's with the edits on it.
    std::optional<score::Score> workingScore() const;
};

/// A new song's id: "s-" + 12 hex digits (time and randomness).
std::string newSongId();

Json toJson (const Song& song);
/// A song from JSON written by any version; bounded and sanitised (never throws).
Song songFromJson (const Json& json);

Json toJson (const Take& take);
Take takeFromJson (const Json& json);

std::string base64Encode (const std::vector<std::uint8_t>& bytes);
std::vector<std::uint8_t> base64Decode (std::string_view text);

} // namespace plenio::core
