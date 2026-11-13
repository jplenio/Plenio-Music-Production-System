// REAPER, more deeply than any VST3 host: the song on the project's own tracks, as the SoundCraft add-in lays it out.
// A folder with the song's sections as regions; Lyrics (an item per sung line), Song (every take of the song as a
// take of one item: REAPER's own takes), Melody, Instrument Line, Chords (MIDI, muted), the stems; the project's
// tempo map from the bars measured in the take. The take chosen on the Song track and in Plenio stay the same.
//
// The audio is the master: Plenio's audio in the project keeps its time (REAPER's timebase Time), so a tempo map
// moves REAPER's grid onto the song and never stretches the song. REAPER's default timebase (beats: position, length,
// rate) would: a take dropped in at the project's 120 BPM played at 63 % of its speed once the song's 76 BPM came in.
//
// Through IReaperHostApplication (REAPER 5.02+): REAPER's extension API, by name. Every call on the main thread.
#pragma once

#include <filesystem>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <utility>
#include <vector>

namespace Steinberg
{
class FUnknown;
}

namespace plenio::plugin
{

/// What goes on REAPER's tracks: everything from the project's start (seconds of the project).
struct ReaperSong
{
    struct Take
    {
        int number = 0;
        std::string name;                // "Take 2 · 4 stars"
        std::filesystem::path audio;     // its DAW file
        double length = 0.0;             // seconds (lead-in included)
    };
    struct Span
    {
        double start = 0.0;
        double end = 0.0;
        std::string text;
    };
    struct Tempo
    {
        double seconds = 0.0;
        double bpm = 120.0;
        int numerator = 4;
        int denominator = 4;
        bool meter = false;              // the meter changes here
    };

    std::string id;
    std::string title;
    std::vector<Take> takes;
    int activeTake = 0;                                                  // its number
    std::vector<std::pair<std::string, std::filesystem::path>> stems;    // of the active take
    std::vector<std::pair<std::string, std::filesystem::path>> parts;    // Melody, Instrument Line, Chords
    std::vector<Span> lines;
    std::vector<Span> sections;
    std::vector<Tempo> tempo;                                            // empty: the project's tempo map stays
    double length = 0.0;
    std::filesystem::path cover; // the song's cover art: the icon of its folder and Song track (empty: none)
};

/// Whether `file` (UTF-8, as REAPER names it) is audio from Plenio's library under `root`: a take, a stem, a click.
bool isLibraryAudio (const std::filesystem::path& root, const std::string& file);

class Reaper
{
public:
    /// REAPER behind the host context, or nothing (another host, an old REAPER).
    static std::unique_ptr<Reaper> connect (Steinberg::FUnknown* hostContext);
    ~Reaper();

    /// Puts the song on tracks below the instrument's track, or brings its tracks up to date (the items Plenio put
    /// there make way; what else is on the tracks stays). The tempo map comes first, then the items. One undo step.
    bool place (const ReaperSong& song, std::string& problem);
    /// Any item in the project whose audio `isPlenio` (its file, UTF-8; for media REAPER copied into the project's
    /// folder, the file it came from) gets the timebase Time, once: marked, so a timebase chosen later stays. No
    /// undo step of its own (one would stand between the user and undoing the drop). Looks only when the project
    /// changed; returns how many items it set.
    int keepInTime (const std::function<bool (const std::string& file)>& isPlenio);
    /// Whether the song's tracks are in the project.
    bool placed (const std::string& songId) const;
    /// The take chosen on the Song track, by its number.
    std::optional<int> chosenTake (const std::string& songId) const;
    /// Chooses the take on the Song track.
    void chooseTake (const std::string& songId, int number);
    /// The song's tracks become ordinary tracks (Plenio forgets them; nothing is deleted).
    void forget (const std::string& songId);
    /// Transport: play or stop (the space bar in the plug-in's window).
    void playStop();

private:
    struct Api;
    explicit Reaper (std::unique_ptr<Api> api);
    std::unique_ptr<Api> api;
    void* lookedAt = nullptr; // the project keepInTime looked at last, and its state then
    int lookedAtState = 0;
};

} // namespace plenio::plugin
