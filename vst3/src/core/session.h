// One song in one plug-in instance: what the owner does with it (new song, generate, choose a take, edit lyrics,
// notes and chords) and the long work behind Generate (the edited notes back to Plenio, 1-4 jobs, the downloads
// into the song library, the score's MIDI, the bars). The song is only touched on the main thread; workers get
// copies and send their results back to it.
#pragma once

#include "core/song.h"
#include "core/studio.h"

#include <filesystem>
#include <functional>
#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>

namespace plenio::core
{

struct NewSong
{
    SongKind kind = SongKind::song;
    Json fields = Json::object();     // the brief (style template, genre, length, vocals …)
    std::string title;                // optional: own title
    std::string lyrics;               // optional: own lyrics (sung as written)
    std::filesystem::path sourceFile; // a cover's recording
    int takesPerRun = 1;
    bool stems = true;
};

class SongSession
{
public:
    /// Who hears about changes (the UI and the engine): always on the main thread.
    struct Listener
    {
        virtual ~Listener() = default;
        virtual void songChanged() = 0;
        virtual void jobsChanged() = 0;
        virtual void activeTakeChanged() = 0;
        virtual void tell (const std::string& text, bool problem) = 0;
    };

    explicit SongSession (std::shared_ptr<Studio> studio);
    ~SongSession();

    SongSession (const SongSession&) = delete;
    SongSession& operator= (const SongSession&) = delete;

    void setListener (Listener* listener) { listen = listener; }
    Studio& studio() const { return *studioRef; }

    bool hasSong() const { return song.has_value(); }
    const Song& current() const { return *song; }

    // making
    void newSong (const NewSong& request);
    void generate (Mode mode = Mode::automatic);
    void cancel();
    bool busy() const;

    // choosing and editing (the working copy)
    void selectTake (int index);
    void deleteTake (int index);
    void setFields (const Json& fields);
    void setDocument (const std::string& kind, const std::string& text);
    void resetDocument (const std::string& kind);
    void setNotes (score::Part part, std::vector<midi::Note> notes);
    void setChords (std::vector<score::ChordSymbol> chords);
    void resetEdits();
    void setTakesPerRun (int count);
    void setStems (bool on);
    void rename (const std::string& title);

    // the library
    bool open (const std::string& id);
    void close();

    // the project's state: the song without its audio
    Json snapshot() const;
    void restore (const Json& state);

    // files of the active (or any) take, absolute
    std::filesystem::path songFolder() const;
    std::optional<std::filesystem::path> takeAudio (int index) const;
    std::vector<std::pair<std::string, std::filesystem::path>> takeStems (int index) const;

private:
    struct Shared;
    struct RunInput;
    static void runTakes (std::shared_ptr<Shared> shared, RunInput input);
    static void follow (std::shared_ptr<Shared> shared, RunInput input, std::vector<std::string> ids, int firstIndex);

    void changed (bool save = true);
    void addTake (Take take, const std::string& group, int index);
    void jobUpdate (const std::string& group, int index, const record::Job& job);
    void jobSubmitted (const std::string& group, int index, const std::string& id);
    void runFinished (const std::string& group, const std::string& problem);
    void resumeJobs();
    void tell (const std::string& text, bool problem = false);
    /// The song's cover: cover.jpg in its folder follows the take the song shows; with `findOlder`, the covers of
    /// takes fetched before the plug-in kept them are taken from their FLAC first.
    void updateCover (bool findOlder = false);

    std::shared_ptr<Studio> studioRef;
    std::shared_ptr<Shared> shared;
    std::optional<Song> song;
    Listener* listen = nullptr;
    bool editedSinceRun = false;
    std::set<std::string> runsWithTake; // runs whose first take arrived (it was chosen)
    int connectionListener = 0;
};

} // namespace plenio::core
