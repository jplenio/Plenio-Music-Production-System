// What the instrument's UI talks to: the song session, the player and the studio behind one call interface, and the
// view of the song the UI draws (takes, the working score on the project's timeline, sung lines, jobs). Main thread.
#pragma once

#include "core/daw_export.h"
#include "core/session.h"
#include "plugin/reaper.h"
#include "engine/player.h"
#include "ui/backend.h"

#include <atomic>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <string>

namespace plenio::plugin
{

class SongController : public ui::Backend, public core::SongSession::Listener
{
public:
    explicit SongController (engine::Player& player);
    ~SongController() override;

    void setHostName (std::string name) { hostName = std::move (name); }
    /// REAPER as the host: the song can go on the project's own tracks.
    void setReaper (std::unique_ptr<Reaper> r) { reaper = std::move (r); }
    /// The host's sample rate (setupProcessing): the take is loaded at it.
    void setHostRate (double rate);

    /// The project's state, from any thread (a copy kept up to date on the main thread).
    Json getState() const;
    /// Main thread.
    void setState (const Json& state);

    // ui::Backend
    Json call (const std::string& method, const Json& params) override;
    void setEventSink (EventSink sink) override;
    std::pair<int, int> editorSize() const override;
    void setEditorSize (int width, int height) override;
    /// `/files/cover/<song id>/<take number>`: the take's cover; `/files/cover/<song id>/song`: the song's cover.jpg.
    std::optional<std::filesystem::path> file (const std::string& address) const override;

    // core::SongSession::Listener
    void songChanged() override;
    void jobsChanged() override;
    void activeTakeChanged() override;
    void tell (const std::string& text, bool problem) override;

private:
    void tick();
    void reloadAudio();
    void refreshState();
    void emit (const std::string& name, const Json& payload) const;
    Json songView() const;
    Json jobsView() const;
    Json connectionView() const;
    Json appState() const;
    void peaksOf (int index, int count);
    /// The take's files for the DAW: the audio made on a worker (once), then the `daw` event.
    void prepareDaw (int index);
    /// The take's DAW files with the MIDI written again (the latest edits); nothing while the audio is not ready.
    std::optional<daw::Files> dawFilesWithMidi (int index);
    std::string dawState (int number) const;
    /// The song on REAPER's tracks, once every take's files are there (made first when missing).
    void placeInReaper (bool tempo);
    bool placedInReaper() const;
    /// Every half second: the take chosen on REAPER's Song track, and tracks to bring up to date.
    void followReaper();
    /// Every half second: Plenio's audio dropped into REAPER's project keeps its time (a tempo map would stretch it).
    void keepAudioInTime();
    /// The cover a take shows, as the UI asks for it (empty: none); `take` -1: the song's.
    std::string coverAddress (int take) const;
    Json dawView (int number) const;

    engine::Player& player;
    std::shared_ptr<core::Studio> studio;
    std::unique_ptr<core::SongSession> session;
    EventSink sink;
    std::string hostName;
    double hostRate = 0.0;
    std::uint64_t loadGeneration = 0;
    int loadedTake = -1;
    bool loading = false;
    std::string loadProblem;
    int timer = 0;
    int connectionListener = 0;
    std::int64_t lastSentPosition = -1;
    bool lastSentMoving = false;
    int editorWidth = 0, editorHeight = 0;
    mutable std::mutex stateLock;
    Json stateCopy = Json::object();
    std::map<std::string, daw::Files> dawFiles; // by "<song id>/<take number>"
    std::set<std::string> dawBusy;
    std::map<std::string, std::string> dawProblems;
    std::unique_ptr<Reaper> reaper;
    bool reaperWanted = false;  // place once the files are made
    bool reaperTempo = true;    // with the project's tempo map
    bool reaperDirty = false;   // the song changed: its tracks follow
    int reaperTicks = 0;
    std::size_t reaperTakeCount = 0;
    std::shared_ptr<bool> alive = std::make_shared<bool> (true);
};

} // namespace plenio::plugin
