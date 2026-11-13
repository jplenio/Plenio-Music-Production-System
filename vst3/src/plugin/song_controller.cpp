#include "plugin/song_controller.h"
#include "core/audio_file.h"
#include "core/clip_content.h"
#include "core/cover_art.h"
#include "core/library.h"
#include "core/log.h"
#include "core/paths.h"
#include "engine/loader.h"
#include "platform/dialogs.h"
#include "platform/drag.h"
#include "platform/main_thread.h"
#include "ui/editor_view.h"
#include "plenio_version.h"

#include <algorithm>
#include <cctype>
#include <cmath>
#include <cstdlib>
#include <filesystem>

namespace plenio::plugin
{
namespace
{
Json notesJson (const std::vector<midi::Note>& notes)
{
    Json out = Json::array();
    for (const auto& n : notes)
        out.push_back ({ n.tick, n.length, n.pitch, n.velocity });
    return out;
}

std::vector<midi::Note> notesFrom (const Json& j, int channel)
{
    std::vector<midi::Note> out;
    for (const auto& n : j.is_array() ? j : Json::array())
    {
        if (out.size() >= 100000 || ! n.is_array() || n.size() < 3 || ! n[0].is_number() || ! n[1].is_number() || ! n[2].is_number())
            continue;
        auto tick = static_cast<std::int64_t> (std::llround (n[0].get<double>()));
        auto length = static_cast<std::int64_t> (std::llround (n[1].get<double>()));
        auto pitch = static_cast<int> (std::lround (n[2].get<double>()));
        auto velocity = n.size() > 3 && n[3].is_number() ? static_cast<int> (std::lround (n[3].get<double>())) : 90;
        if (tick < 0 || length <= 0 || pitch < 0 || pitch > 127)
            continue;
        out.push_back ({ tick, length, pitch, std::clamp (velocity, 1, 127), channel });
    }
    std::sort (out.begin(), out.end(), [] (const midi::Note& a, const midi::Note& b) { return a.tick != b.tick ? a.tick < b.tick : a.pitch < b.pitch; });
    return out;
}

core::Mode modeOf (const std::string& name)
{
    if (name == "newTake")
        return core::Mode::newTake;
    if (name == "recompose")
        return core::Mode::recompose;
    if (name == "rewrite")
        return core::Mode::rewrite;
    return core::Mode::automatic;
}

const char* whatName (core::What w)
{
    switch (w)
    {
        case core::What::newSong: return "newSong";
        case core::What::newTake: return "newTake";
        case core::What::singYourNotes: return "singYourNotes";
        case core::What::recompose: return "recompose";
        case core::What::rewrite: return "rewrite";
    }
    return "";
}
} // namespace

SongController::SongController (engine::Player& p) : player (p), studio (core::Studio::get())
{
    session = std::make_unique<core::SongSession> (studio);
    session->setListener (this);
    connectionListener = studio->listen ([this] { emit ("connection", connectionView()); });
    timer = platform::addTimer (40, [this] { tick(); });
}

SongController::~SongController()
{
    *alive = false;
    platform::removeTimer (timer);
    studio->unlisten (connectionListener);
    session->setListener (nullptr);
    session.reset();
}

void SongController::setHostRate (double rate)
{
    if (std::abs (rate - hostRate) < 0.5)
        return;
    hostRate = rate;
    reloadAudio();
}

Json SongController::getState() const
{
    std::scoped_lock l (stateLock);
    return stateCopy;
}

void SongController::refreshState()
{
    Json state = { { "song", session->snapshot() } };
    if (editorWidth > 0 && editorHeight > 0)
        state["editor"] = { { "width", editorWidth }, { "height", editorHeight } };
    std::scoped_lock l (stateLock);
    stateCopy = std::move (state);
}

void SongController::setState (const Json& state)
{
    const auto& editor = json::obj (state, "editor");
    editorWidth = static_cast<int> (json::integer (editor, "width", 0));
    editorHeight = static_cast<int> (json::integer (editor, "height", 0));
    if (auto* song = json::find (state, "song"); song != nullptr && song->is_object())
        session->restore (*song);
    else
        session->close();
    refreshState();
}

void SongController::setEventSink (EventSink s)
{
    sink = std::move (s);
    lastSentPosition = -1;
}

std::pair<int, int> SongController::editorSize() const
{
    if (editorWidth > 0 && editorHeight > 0)
        return { editorWidth, editorHeight };
    return { ui::EditorView::defaultWidth, ui::EditorView::defaultHeight };
}

void SongController::setEditorSize (int width, int height)
{
    editorWidth = std::clamp (width, ui::EditorView::minWidth, 6000);
    editorHeight = std::clamp (height, ui::EditorView::minHeight, 4000);
    std::scoped_lock l (stateLock);
    stateCopy["editor"] = { { "width", editorWidth }, { "height", editorHeight } };
}

void SongController::emit (const std::string& name, const Json& payload) const
{
    if (sink)
        sink (name, payload);
}

void SongController::tick()
{
    player.collectGarbage();
    if (reaper && ++reaperTicks >= 12)
    {
        reaperTicks = 0;
        keepAudioInTime();
        followReaper();
    }
    if (! sink || hostRate <= 0)
        return;
    auto position = player.position();
    auto moving = player.moving();
    if (position != lastSentPosition || moving != lastSentMoving)
    {
        lastSentPosition = position;
        lastSentMoving = moving;
        emit ("transport", { { "seconds", static_cast<double> (position) / hostRate }, { "playing", moving }, { "preview", player.previewing() } });
    }
}

void SongController::songChanged()
{
    // edited notes and chords: the MIDI output follows at once, the audio stays
    if (auto current = player.current(); current && session->hasSong() && hostRate > 0)
    {
        const auto& song = session->current();
        if (const auto* take = song.active(); take != nullptr && take->number == current->takeNumber)
        {
            auto updated = std::make_shared<engine::TakeAudio> (*current);
            auto timing = take->timing();
            if (auto score = song.workingScore())
                updated->midi = engine::midiEvents (*score, timing, timeline::layOut (timing), hostRate);
            else
                updated->midi.clear();
            player.publish (updated);
        }
    }
    refreshState();
    emit ("song", songView());
}

void SongController::jobsChanged()
{
    refreshState();
    emit ("jobs", jobsView());
}

void SongController::activeTakeChanged()
{
    reloadAudio();
    if (placedInReaper())
        reaperDirty = true; // the stems, the score, the lyrics and the tempo map follow the take
}

void SongController::placeInReaper (bool tempo)
{
    if (! reaper || ! session->hasSong())
        return;
    const auto& song = session->current();
    if (song.takes.empty() || song.activeTake < 0)
        return;
    reaperTempo = tempo;
    reaperTakeCount = song.takes.size();
    bool missing = false;
    for (std::size_t i = 0; i < song.takes.size(); ++i)
        if (! dawFilesWithMidi (static_cast<int> (i)))
        {
            missing = true;
            prepareDaw (static_cast<int> (i));
        }
    if (missing)
    {
        reaperWanted = true; // again when the files are made
        return;
    }
    reaperWanted = false;

    ReaperSong rs;
    rs.id = song.id;
    rs.title = song.title;
    for (const auto& t : song.takes)
    {
        const auto& files = dawFiles[song.id + "/" + std::to_string (t.number)];
        rs.takes.push_back ({ t.number, t.label(), files.audio, timeline::layOut (t.timing()).audioAt + t.seconds });
        rs.length = std::max (rs.length, rs.takes.back().length);
    }
    const auto& take = song.takes[static_cast<std::size_t> (song.activeTake)];
    rs.activeTake = take.number;
    if (auto files = dawFilesWithMidi (song.activeTake))
    {
        rs.stems = files->stems;
        rs.parts = files->parts;
    }
    auto timing = take.timing();
    auto layout = timeline::layOut (timing);
    for (const auto& l : take.lines)
        rs.lines.push_back ({ layout.audioAt + l.start, layout.audioAt + l.end, l.text });
    if (auto score = song.workingScore())
        for (std::size_t i = 0; i < score->sections.size(); ++i)
        {
            auto end = i + 1 < score->sections.size() ? score->sections[i + 1].tick : score->endTick;
            auto name = score->sections[i].name;
            if (! name.empty() && name[0] >= 'a' && name[0] <= 'z')
                name[0] = static_cast<char> (name[0] - 'a' + 'A');
            rs.sections.push_back ({ timeline::scoreToProject (timing, layout, score->secondsOf (score->sections[i].tick)),
                                     timeline::scoreToProject (timing, layout, score->secondsOf (end)), name });
        }
    if (tempo)
        for (const auto& e : timeline::tempoMap (timing, layout, daw::ppq))
            rs.tempo.push_back ({ e.seconds, e.bpm, e.meter.first, e.meter.second, e.meterChanges || e.tick == 0 });
    if (auto cover = file (coverAddress (-1)))
        rs.cover = *cover;

    std::string problem;
    if (! reaper->place (rs, problem))
        tell (problem, true);
    else
        player.setSilentWhilePlaying (true); // the tracks play the song now
    refreshState();
    emit ("song", songView());
}

bool SongController::placedInReaper() const
{
    return reaper && session->hasSong() && reaper->placed (session->current().id);
}

void SongController::followReaper()
{
    if (! reaper || ! session->hasSong())
        return;
    const auto& song = session->current();
    const bool placed = reaper->placed (song.id);
    player.setSilentWhilePlaying (placed);
    if (! placed)
    {
        reaperDirty = false;
        return;
    }
    if (reaperDirty || song.takes.size() != reaperTakeCount)
    {
        reaperDirty = false;
        placeInReaper (reaperTempo);
        return;
    }
    // a take chosen on REAPER's Song track: Plenio follows
    if (auto chosen = reaper->chosenTake (song.id); chosen && song.activeTake >= 0
                                                    && *chosen != song.takes[static_cast<std::size_t> (song.activeTake)].number)
        for (std::size_t i = 0; i < song.takes.size(); ++i)
            if (song.takes[i].number == *chosen)
            {
                session->selectTake (static_cast<int> (i));
                break;
            }
}

void SongController::keepAudioInTime()
{
    const auto root = studio->library().root();
    if (int made = reaper->keepInTime ([&root] (const std::string& file) { return isLibraryAudio (root, file); }); made > 0)
        log::info ("REAPER: Plenio's audio keeps its time in {} item{} (timebase Time): a tempo map moves REAPER's grid onto the song, not the audio",
                   made, made == 1 ? "" : "s");
}

std::string SongController::coverAddress (int index) const
{
    if (! session->hasSong())
        return {};
    const auto& s = session->current();
    if (index < 0)
        index = core::coverTake (s);
    if (index < 0 || index >= static_cast<int> (s.takes.size()))
        return {};
    const auto& take = s.takes[static_cast<std::size_t> (index)];
    if (auto it = take.files.find ("cover_art"); it == take.files.end() || it->second.empty())
        return {};
    return "/files/cover/" + s.id + "/" + std::to_string (take.number); // a take's cover never changes
}

std::optional<std::filesystem::path> SongController::file (const std::string& address) const
{
    // /files/cover/<song id>/<take number>, /files/cover/<song id>/song
    static const std::string prefix = "/files/cover/";
    if (address.rfind (prefix, 0) != 0)
        return std::nullopt;
    const auto rest = address.substr (prefix.size(), address.find_first_of ("?#") - prefix.size());
    const auto slash = rest.find ('/');
    if (slash == std::string::npos)
        return std::nullopt;
    const auto id = rest.substr (0, slash);
    const auto which = rest.substr (slash + 1);
    auto allOf = [] (const std::string& s, auto fits) { return ! s.empty() && s.size() <= 64 && std::all_of (s.begin(), s.end(), fits); };
    if (! allOf (id, [] (unsigned char c) { return std::isalnum (c) != 0 || c == '-' || c == '_'; }))
        return std::nullopt;

    std::error_code ec;
    const auto library = studio->library();
    if (which == "song")
    {
        auto folder = library.find (id);
        if (! folder)
            return std::nullopt;
        auto cover = *folder / core::songCoverName;
        return std::filesystem::exists (cover, ec) ? std::optional<std::filesystem::path> (cover) : std::nullopt;
    }
    if (! allOf (which, [] (unsigned char c) { return std::isdigit (c) != 0; }) || ! session->hasSong() || session->current().id != id)
        return std::nullopt;
    const int number = std::atoi (which.c_str());
    for (const auto& take : session->current().takes)
        if (take.number == number)
            if (auto it = take.files.find ("cover_art"); it != take.files.end() && ! it->second.empty())
                if (auto path = library.resolve (session->current(), it->second); std::filesystem::exists (path, ec))
                    return path;
    return std::nullopt;
}

void SongController::tell (const std::string& text, bool problem)
{
    emit ("toast", { { "text", text }, { "problem", problem } });
}

void SongController::reloadAudio()
{
    ++loadGeneration;
    loadProblem.clear();
    if (! session->hasSong() || hostRate <= 0)
    {
        player.clear();
        loadedTake = -1;
        loading = false;
        emit ("song", songView());
        return;
    }
    const auto& song = session->current();
    const auto* take = song.active();
    if (take == nullptr)
    {
        player.clear();
        loadedTake = -1;
        loading = false;
        emit ("song", songView());
        return;
    }
    auto file = session->takeAudio (song.activeTake);
    if (! file)
    {
        player.clear();
        loadedTake = -1;
        loading = false;
        loadProblem = "The audio of " + take->label() + " is not in the song library (" + paths::toUtf8 (session->songFolder()) + ").";
        emit ("song", songView());
        return;
    }
    engine::LoadRequest request;
    request.audio = *file;
    request.stems = session->takeStems (song.activeTake);
    request.hostRate = hostRate;
    request.timing = take->timing();
    request.score = song.workingScore();
    request.takeNumber = take->number;
    loading = true;
    emit ("song", songView());

    auto generation = loadGeneration;
    auto token = alive;
    const int index = song.activeTake;
    studio->run ([this, request, generation, token, index]
    {
        std::string error;
        auto loaded = engine::load (request, &error);
        platform::postToMainThread ([this, loaded, generation, token, index, error]
        {
            if (! *token || generation != loadGeneration)
                return;
            loading = false;
            if (loaded)
            {
                player.publish (loaded);
                loadedTake = index;
            }
            else
            {
                player.clear();
                loadedTake = -1;
                loadProblem = "The take's audio could not be read: " + error;
            }
            emit ("song", songView());
        });
    });
}

void SongController::peaksOf (int index, int count)
{
    if (! session->hasSong())
        return;
    const auto& song = session->current();
    if (index < 0 || index >= static_cast<int> (song.takes.size()))
        return;
    auto file = session->takeAudio (index);
    if (! file)
        return;
    const int number = song.takes[static_cast<std::size_t> (index)].number;
    auto cache = file->parent_path() / ("peaks-" + std::to_string (count) + ".json");
    auto token = alive;
    auto f = *file;
    studio->run ([this, f, cache, count, index, number, token]
    {
        Json peaks;
        if (auto text = core::readFile (cache, 4 * 1024 * 1024))
            if (auto parsed = json::parse (*text); parsed && parsed->is_array())
                peaks = *parsed;
        if (peaks.is_null())
        {
            std::string error;
            auto decoded = audio::read (f, &error);
            if (! decoded)
                return;
            auto values = audio::peaks (*decoded, static_cast<std::size_t> (count));
            peaks = Json::array();
            for (float v : values)
                peaks.push_back (std::round (v * 1000.0f) / 1000.0f);
            core::writeFileAtomically (cache, peaks.dump());
        }
        platform::postToMainThread ([this, token, index, number, peaks]
        {
            if (*token)
                emit ("peaks", { { "index", index }, { "number", number }, { "peaks", peaks } });
        });
    });
}

void SongController::prepareDaw (int index)
{
    if (! session->hasSong())
        return;
    const auto& song = session->current();
    if (index < 0 || index >= static_cast<int> (song.takes.size()))
        return;
    const auto& take = song.takes[static_cast<std::size_t> (index)];
    const int number = take.number;
    const auto key = song.id + "/" + std::to_string (number);
    if (dawBusy.count (key) != 0)
        return;
    auto made = core::dawAudioJob (studio->library(), song, index);
    if (! made)
    {
        tell ("Take " + std::to_string (number) + " has no audio in the library: there is nothing to give the DAW.", true);
        return;
    }
    const auto job = *made;

    dawBusy.insert (key);
    dawProblems.erase (key);
    emit ("daw", dawView (number));
    auto token = alive;
    auto songId = song.id;
    studio->run ([this, job, token, number, key, songId]
    {
        std::string problem;
        auto files = daw::writeAudio (job, problem);
        platform::postToMainThread ([this, token, files, problem, number, key, songId]
        {
            if (! *token)
                return;
            dawBusy.erase (key);
            if (files)
                dawFiles[key] = *files;
            else
                dawProblems[key] = problem;
            if (! session->hasSong() || session->current().id != songId)
                return;
            if (! files)
                tell (problem, true);
            else
            {
                // the MIDI files along, so the folder holds everything
                const auto& takes = session->current().takes;
                for (std::size_t i = 0; i < takes.size(); ++i)
                    if (takes[i].number == number)
                        dawFilesWithMidi (static_cast<int> (i));
                if (reaperWanted)
                    placeInReaper (reaperTempo);
            }
            emit ("daw", dawView (number));
            refreshState();
        });
    });
}

std::optional<daw::Files> SongController::dawFilesWithMidi (int index)
{
    if (! session->hasSong())
        return std::nullopt;
    const auto& song = session->current();
    if (index < 0 || index >= static_cast<int> (song.takes.size()))
        return std::nullopt;
    const auto& take = song.takes[static_cast<std::size_t> (index)];
    auto it = dawFiles.find (song.id + "/" + std::to_string (take.number));
    if (it == dawFiles.end())
        return std::nullopt;
    // still made of this take's audio (a take of the same number made again replaces it)
    std::error_code ec;
    auto source = session->takeAudio (index);
    if (! source || *source != it->second.source || ! std::filesystem::exists (it->second.audio, ec)
        || std::filesystem::last_write_time (it->second.audio, ec) < std::filesystem::last_write_time (*source, ec))
    {
        dawFiles.erase (it);
        return std::nullopt;
    }
    // the working score for the take that plays (the owner's edits go along), the take's own for the others
    auto score = index == song.activeTake ? song.workingScore() : take.score();
    if (score)
    {
        auto title = paths::safeName (song.title.empty() ? std::string ("Song") : song.title, 60);
        std::string problem;
        if (! daw::writeMidi (it->second, title + " - Take " + std::to_string (take.number), title, *score, take.timing(), take.lines, problem))
            tell (problem, true);
    }
    return it->second;
}

std::string SongController::dawState (int number) const
{
    if (! session->hasSong())
        return "";
    const auto key = session->current().id + "/" + std::to_string (number);
    if (dawBusy.count (key) != 0)
        return "preparing";
    if (dawFiles.count (key) != 0)
        return "ready";
    if (dawProblems.count (key) != 0)
        return "failed";
    return "";
}

Json SongController::dawView (int number) const
{
    Json v = { { "number", number }, { "state", dawState (number) } };
    if (! session->hasSong())
        return v;
    const auto key = session->current().id + "/" + std::to_string (number);
    if (auto p = dawProblems.find (key); p != dawProblems.end())
        v["problem"] = p->second;
    if (auto f = dawFiles.find (key); f != dawFiles.end())
    {
        Json stems = Json::array();
        for (const auto& [name, path] : f->second.stems)
            stems.push_back (name);
        v["stems"] = stems;
        v["click"] = ! f->second.click.empty();
        v["folder"] = paths::toUtf8 (f->second.folder);
    }
    return v;
}

Json SongController::connectionView() const
{
    auto c = studio->connection().toJson();
    auto s = studio->settings();
    c["startComfyUI"] = s.startComfyUI && core::isThisComputer (s.host);
    return c;
}

Json SongController::jobsView() const
{
    Json jobs = Json::array();
    if (! session->hasSong())
        return jobs;
    for (const auto& j : session->current().jobs)
    {
        Json item = { { "number", j.number }, { "index", j.index }, { "status", j.status }, { "stage", j.stage },
                      { "progress", j.progress }, { "what", j.what } };
        if (j.queuePosition)
            item["queuePosition"] = *j.queuePosition;
        jobs.push_back (item);
    }
    return jobs;
}

Json SongController::songView() const
{
    if (! session->hasSong())
        return nullptr;
    const auto& s = session->current();
    Json v;
    v["id"] = s.id;
    v["title"] = s.title;
    v["kind"] = s.kind == core::SongKind::cover ? "cover" : "song";
    v["template"] = s.templateId;
    v["fields"] = s.fields;
    Json docs = Json::object();
    for (const auto& [k, d] : s.documents)
        docs[k] = { { "text", d.text }, { "manual", d.manual } };
    v["documents"] = docs;
    v["takesPerRun"] = s.takesPerRun;
    v["stems"] = s.stems;
    v["activeTake"] = s.activeTake;
    v["changes"] = s.changes();
    auto plan = s.plan (core::Mode::automatic);
    v["plan"] = { { "what", whatName (plan.what) }, { "label", core::label (plan.what) } };
    v["edited"] = { { "melody", s.edits.melody.has_value() }, { "instrument", s.edits.instrument.has_value() }, { "chords", s.edits.chords.has_value() } };
    v["loading"] = loading;
    v["loadProblem"] = loadProblem;
    v["folder"] = paths::toUtf8 (session->songFolder());
    if (auto cover = coverAddress (-1); ! cover.empty())
        v["cover"] = cover;

    Json takes = Json::array();
    for (std::size_t i = 0; i < s.takes.size(); ++i)
    {
        const auto& t = s.takes[i];
        Json stems = Json::array();
        for (const auto& st : t.stems)
            stems.push_back (st.name);
        Json item = { { "index", i }, { "number", t.number }, { "title", t.title }, { "label", t.label() },
                      { "seconds", t.seconds }, { "created", t.created }, { "what", t.what }, { "stems", stems },
                      { "hasAudio", session->takeAudio (static_cast<int> (i)).has_value() }, { "measured", t.bars.has_value() },
                      { "audioAt", timeline::layOut (t.timing()).audioAt }, { "daw", dawState (t.number) } };
        if (t.stars)
            item["stars"] = *t.stars;
        if (auto cover = coverAddress (static_cast<int> (i)); ! cover.empty())
            item["cover"] = cover;
        takes.push_back (item);
    }
    v["takes"] = takes;
    v["jobs"] = jobsView();
    v["reaper"] = { { "available", reaper != nullptr }, { "placed", placedInReaper() } };

    // the active take on the project's timeline: its working score, bars, sung lines
    const auto* take = s.active();
    if (take == nullptr)
        return v;
    auto timing = take->timing();
    auto layout = timeline::layOut (timing);
    Json lay = { { "scoreAt", layout.scoreAt }, { "audioAt", layout.audioAt }, { "leadInBars", layout.leadInBars },
                 { "measured", layout.measured }, { "seconds", take->seconds } };
    if (timing.bars)
    {
        auto [lo, hi] = timing.bars->tempoRange();
        lay["tempo"] = { lo, hi };
    }
    else
        lay["tempo"] = { layout.firstTempo, layout.firstTempo };
    v["layout"] = lay;

    Json lines = Json::array();
    for (const auto& l : take->lines)
        lines.push_back ({ { "start", layout.audioAt + l.start }, { "end", layout.audioAt + l.end }, { "text", l.text } });
    v["lines"] = lines;

    if (auto score = s.workingScore())
    {
        Json meters = Json::array();
        for (const auto& m : score->meters)
            meters.push_back ({ m.tick, m.numerator, m.denominator });
        Json sections = Json::array();
        for (const auto& sec : score->sections)
            sections.push_back ({ sec.tick, sec.name });
        Json chords = Json::array();
        for (const auto& c : score->chords)
            chords.push_back ({ c.tick, c.name });
        v["score"] = { { "ppq", score->ppq }, { "bpm", score->bpm }, { "key", score->key }, { "endTick", score->endTick },
                       { "meters", meters }, { "sections", sections }, { "melody", notesJson (score->melody) },
                       { "instrument", notesJson (score->instrument) }, { "chords", chords } };

        // every measure: its ticks and where it lies in the project (seconds), numbered as the project's bars
        Json measures = Json::array();
        auto starts = score->measureStarts();
        double firstLength = 0.0;
        for (std::size_t k = 0; k + 1 < starts.size(); ++k)
        {
            double a = timeline::scoreToProject (timing, layout, score->secondsOf (starts[k]));
            double b = timeline::scoreToProject (timing, layout, score->secondsOf (starts[k + 1]));
            if (k == 0)
                firstLength = b - a;
            measures.push_back ({ { "tick", starts[k] }, { "endTick", starts[k + 1] }, { "start", a }, { "end", b },
                                  { "number", layout.leadInBars + static_cast<int> (k) + 1 } });
        }
        Json leadIn = Json::array();
        for (int k = 0; k < layout.leadInBars && firstLength > 0; ++k)
            leadIn.push_back ({ { "start", layout.scoreAt - (layout.leadInBars - k) * firstLength },
                                { "end", layout.scoreAt - (layout.leadInBars - k - 1) * firstLength }, { "number", k + 1 } });
        v["measures"] = measures;
        v["leadIn"] = leadIn;
    }
    return v;
}

Json SongController::appState() const
{
    auto s = studio->settings();
    return { { "hello", { { "kind", "instrument" }, { "version", PLENIO_VERSION_STRING }, { "host", hostName } } },
             { "connection", connectionView() },
             { "settings", { { "library", s.library.empty() ? paths::toUtf8 (paths::defaultLibrary()) : s.library },
                             { "host", core::isThisComputer (s.host) ? std::string() : s.host }, { "hasToken", studio->hasToken() },
                             { "port", s.port }, { "startComfyUI", s.startComfyUI }, { "licenceAccepted", s.licenceAccepted },
                             { "takesPerRun", s.takesPerRun }, { "stems", s.stems }, { "flatKeys", s.flatKeys } } },
             { "song", songView() },
             { "position", hostRate > 0 ? static_cast<double> (player.position()) / hostRate : 0.0 } };
}

Json SongController::call (const std::string& method, const Json& params)
{
    using ui::CallError;
    auto requireSong = [this]
    {
        if (! session->hasSong())
            throw CallError ("no_song", "There is no song in this instance yet.");
    };

    if (method == "ui.hello")
        return { { "kind", "instrument" }, { "version", PLENIO_VERSION_STRING }, { "host", hostName }, { "platform", "windows" } };
    if (method == "app.state")
        return appState();
    if (method == "ui.log")
    {
        log::info ("UI: {}", json::str (params, "message", {}, 2000));
        return nullptr;
    }
    if (method == "ui.openUrl")
    {
        auto url = json::str (params, "url", {}, 2000);
        if (url.rfind ("https://", 0) == 0)
            platform::openExternally (url);
        return nullptr;
    }

    // the studio
    if (method == "studio.refresh")
    {
        studio->refresh();
        return connectionView();
    }
    if (method == "studio.start")
    {
        std::string why;
        bool started = studio->startComfyUI (why);
        return { { "started", started }, { "message", why } };
    }
    if (method == "api.template")
        return studio->templateDetail (json::str (params, "id", "yue2-song", 64));
    if (method == "api.briefs")
        return studio->briefs (json::str (params, "kind", "song", 16));
    if (method == "api.models")
        return studio->models();
    if (method == "settings.set")
    {
        auto s = studio->settings();
        if (auto* v = json::find (params, "library"); v != nullptr && v->is_string())
            s.library = v->get<std::string>();
        if (auto* v = json::find (params, "port"); v != nullptr && v->is_number_integer())
            s.port = std::clamp (v->get<int>(), 0, 65535);
        if (auto* v = json::find (params, "host"); v != nullptr && v->is_string())
            s.host = core::cleanHost (v->get<std::string>());
        // the token is never sent back to the UI and never written into the settings file or a project
        if (auto* v = json::find (params, "token"); v != nullptr && v->is_string())
            studio->setToken (v->get<std::string>());
        s.startComfyUI = json::boolean (params, "startComfyUI", s.startComfyUI);
        s.licenceAccepted = json::boolean (params, "licenceAccepted", s.licenceAccepted);
        s.flatKeys = json::boolean (params, "flatKeys", s.flatKeys);
        studio->setSettings (s);
        return appState();
    }
    if (method == "settings.chooseLibrary")
    {
        auto folder = platform::chooseFolder ("Where Plenio keeps its songs");
        return folder ? Json (paths::toUtf8 (*folder)) : Json (nullptr);
    }

    // the library
    if (method == "library.list")
    {
        Json list = Json::array();
        for (const auto& s : studio->library().list())
        {
            Json item = { { "id", s.id }, { "title", s.title }, { "kind", s.kind }, { "takes", s.takes }, { "modified", s.modified } };
            if (s.bestStars)
                item["stars"] = *s.bestStars;
            std::error_code ec;
            if (auto when = std::filesystem::last_write_time (s.folder / core::songCoverName, ec); ! ec)
            {
                // the cover's version in its URL; libc++ counts file time in __int128, which to_string does not take
                const auto version = static_cast<long long> (when.time_since_epoch().count());
                item["cover"] = "/files/cover/" + s.id + "/song?v=" + std::to_string (version);
            }
            list.push_back (item);
        }
        return list;
    }
    if (method == "song.open")
    {
        if (! session->open (json::str (params, "id", {}, 64)))
            throw CallError ("not_found", "The song is not in the library.");
        return songView();
    }
    if (method == "song.close")
    {
        session->close();
        return nullptr;
    }
    if (method == "song.reveal")
    {
        requireSong();
        platform::reveal (session->songFolder());
        return nullptr;
    }

    // making
    if (method == "song.new")
    {
        core::NewSong request;
        request.kind = json::str (params, "kind") == "cover" ? core::SongKind::cover : core::SongKind::song;
        request.fields = json::obj (params, "fields");
        request.title = json::str (params, "title", {}, 200);
        request.lyrics = json::str (params, "lyrics");
        request.sourceFile = paths::fromUtf8 (json::str (params, "sourceFile", {}, 2000));
        request.takesPerRun = static_cast<int> (json::integer (params, "takesPerRun", studio->settings().takesPerRun));
        request.stems = json::boolean (params, "stems", studio->settings().stems);
        if (request.kind == core::SongKind::cover && request.sourceFile.empty())
            throw CallError ("missing_source", "A cover needs a recording.");
        if (! studio->connection().connected())
            throw CallError ("offline", "ComfyUI with Plenio is not running: start it to make a song.");
        auto s = studio->settings();
        s.takesPerRun = std::clamp (request.takesPerRun, 1, 4);
        s.stems = request.stems;
        studio->setSettings (s);
        session->newSong (request);
        return songView();
    }
    if (method == "song.generate")
    {
        requireSong();
        session->generate (modeOf (json::str (params, "mode", "auto", 32)));
        return songView();
    }
    if (method == "song.cancel")
    {
        session->cancel();
        return songView();
    }
    if (method == "file.chooseAudio")
    {
        auto file = platform::chooseFile ("A recording for the cover",
                                          { { "Audio files", "*.wav;*.flac;*.mp3;*.ogg;*.m4a;*.aif;*.aiff;*.opus" }, { "All files", "*.*" } });
        return file ? Json (paths::toUtf8 (*file)) : Json (nullptr);
    }

    // choosing and editing
    if (method == "take.select")
    {
        requireSong();
        session->selectTake (static_cast<int> (json::integer (params, "index", -1)));
        return songView();
    }
    if (method == "take.delete")
    {
        requireSong();
        session->deleteTake (static_cast<int> (json::integer (params, "index", -1)));
        return songView();
    }
    if (method == "take.peaks")
    {
        requireSong();
        peaksOf (static_cast<int> (json::integer (params, "index", -1)), static_cast<int> (std::clamp<std::int64_t> (json::integer (params, "count", 1600), 16, 8000)));
        return nullptr;
    }
    if (method == "song.fields")
    {
        requireSong();
        session->setFields (json::obj (params, "fields"));
        return songView();
    }
    if (method == "song.document")
    {
        requireSong();
        auto kind = json::str (params, "kind", {}, 32);
        const auto& kinds = record::documentKinds();
        if (std::find (kinds.begin(), kinds.end(), kind) == kinds.end())
            throw CallError ("bad_request", "No such document: " + kind);
        session->setDocument (kind, json::str (params, "text"));
        return songView();
    }
    if (method == "song.resetDocument")
    {
        requireSong();
        session->resetDocument (json::str (params, "kind", {}, 32));
        return songView();
    }
    if (method == "song.notes")
    {
        requireSong();
        auto part = json::str (params, "part", "melody", 16) == "instrument" ? score::Part::instrument : score::Part::melody;
        session->setNotes (part, notesFrom (json::arr (params, "notes"), part == score::Part::instrument ? 1 : 0));
        return songView();
    }
    if (method == "song.chords")
    {
        requireSong();
        std::vector<score::ChordSymbol> chords;
        for (const auto& c : json::arr (params, "chords"))
            if (c.is_array() && c.size() >= 2 && c[0].is_number() && c[1].is_string() && chords.size() < 10000)
                chords.push_back ({ std::max<std::int64_t> (0, static_cast<std::int64_t> (std::llround (c[0].get<double>()))), c[1].get<std::string>().substr (0, 40) });
        std::sort (chords.begin(), chords.end(), [] (const score::ChordSymbol& a, const score::ChordSymbol& b) { return a.tick < b.tick; });
        session->setChords (std::move (chords));
        return songView();
    }
    if (method == "song.resetEdits")
    {
        requireSong();
        session->resetEdits();
        return songView();
    }
    if (method == "song.takesPerRun")
    {
        requireSong();
        session->setTakesPerRun (static_cast<int> (json::integer (params, "count", 1)));
        return songView();
    }
    if (method == "song.stems")
    {
        requireSong();
        session->setStems (json::boolean (params, "on", true));
        return songView();
    }
    if (method == "song.rename")
    {
        requireSong();
        session->rename (json::str (params, "title", {}, 200));
        return songView();
    }

    // REAPER
    if (method == "reaper.place")
    {
        requireSong();
        if (! reaper)
            throw CallError ("no_reaper", "Only REAPER lets Plenio put the song on the project's tracks.");
        placeInReaper (json::boolean (params, "tempo", true));
        return { { "state", reaperWanted ? "preparing" : "placed" } };
    }
    if (method == "reaper.forget")
    {
        requireSong();
        if (reaper)
            reaper->forget (session->current().id);
        player.setSilentWhilePlaying (false);
        refreshState();
        return songView();
    }
    if (method == "host.key")
    {
        if (reaper && json::str (params, "key", {}, 16) == "space")
        {
            reaper->playStop();
            return { { "handled", true } };
        }
        return { { "handled", false } };
    }

    // the DAW
    if (method == "daw.prepare")
    {
        requireSong();
        prepareDaw (static_cast<int> (json::integer (params, "index", -1)));
        return nullptr;
    }
    if (method == "daw.drag")
    {
        requireSong();
        const auto index = static_cast<int> (json::integer (params, "index", -1));
        const auto what = json::str (params, "what", "take", 16);
        auto files = dawFilesWithMidi (index);
        if (! files)
        {
            prepareDaw (index);
            return { { "state", "preparing" } };
        }
        std::vector<std::filesystem::path> list;
        if (what == "take" || what == "all")
            list.push_back (files->audio);
        if (what == "stems" || what == "all")
            for (const auto& s : files->stems)
                list.push_back (s.second);
        if (what == "stem")
            for (const auto& s : files->stems)
                if (s.first == json::str (params, "stem", {}, 20))
                    list.push_back (s.second);
        if (what == "midi" || what == "all")
            list.push_back (files->midi);
        if (what == "tempo")
            list.push_back (files->tempo);
        if (what == "click")
            list.push_back (files->click);
        std::erase_if (list, [] (const std::filesystem::path& f) { std::error_code ec; return f.empty() || ! std::filesystem::exists (f, ec); });
        if (list.empty())
            throw CallError ("not_ready", "These files are not there (yet).");
        auto result = platform::dragFiles (list);
        return { { "state", result == platform::DragResult::dropped ? "dropped" : result == platform::DragResult::cancelled ? "cancelled" : "failed" } };
    }
    if (method == "daw.reveal")
    {
        requireSong();
        auto files = dawFilesWithMidi (static_cast<int> (json::integer (params, "index", -1)));
        if (files)
            platform::reveal (files->midi.empty() ? files->audio : files->midi);
        return nullptr;
    }

    // listening
    if (method == "player.preview")
    {
        if (hostRate > 0)
            player.startPreview (static_cast<std::int64_t> (std::llround (std::max (0.0, json::num (params, "seconds", 0.0)) * hostRate)));
        return nullptr;
    }
    if (method == "player.stop")
    {
        player.stopPreview();
        return nullptr;
    }
    if (method == "player.stem")
    {
        auto index = static_cast<int> (json::integer (params, "index", -1));
        if (index >= 0 && index < engine::maxStems)
        {
            if (auto* v = json::find (params, "muted"); v != nullptr && v->is_boolean())
                player.setStemMuted (index, v->get<bool>());
            if (auto* v = json::find (params, "soloed"); v != nullptr && v->is_boolean())
                player.setStemSoloed (index, v->get<bool>());
            if (auto g = json::num (params, "gain"))
                player.setStemGain (index, static_cast<float> (std::clamp (*g, 0.0, 4.0)));
        }
        return nullptr;
    }
    if (method == "player.midiOut")
    {
        player.setMidiOut (json::boolean (params, "on", true));
        return nullptr;
    }

    throw CallError ("unknown_method", "Plenio does not know the call '" + method + "'.");
}

} // namespace plenio::plugin
