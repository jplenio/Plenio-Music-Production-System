#include "plugin/reaper.h"
#include "core/log.h"
#include "core/paths.h"

#include "pluginterfaces/base/funknown.h"
#include "pluginterfaces/base/funknownimpl.h"

namespace Steinberg
{
#include "reaper_vst3_interfaces.h"
DEF_CLASS_IID (IReaperHostApplication)
} // namespace Steinberg

#include <algorithm>
#include <array>
#include <cctype>
#include <cstdlib>
#include <cstring>
#include <iterator>
#include <map>

// REAPER's own types: only ever pointers
struct ReaProject;
struct MediaTrack;
struct MediaItem;
struct MediaItem_Take;
class PCM_source;

namespace plenio::plugin
{

struct Reaper::Api
{
    Steinberg::IReaperHostApplication* host = nullptr;

    MediaTrack* (*GetTrack) (ReaProject*, int) = nullptr;
    int (*CountTracks) (ReaProject*) = nullptr;
    void (*InsertTrackAtIndex) (int, bool) = nullptr;
    double (*GetMediaTrackInfo_Value) (MediaTrack*, const char*) = nullptr;
    bool (*SetMediaTrackInfo_Value) (MediaTrack*, const char*, double) = nullptr;
    bool (*GetSetMediaTrackInfo_String) (MediaTrack*, const char*, char*, bool) = nullptr;
    MediaItem* (*AddMediaItemToTrack) (MediaTrack*) = nullptr;
    MediaItem_Take* (*AddTakeToMediaItem) (MediaItem*) = nullptr;
    PCM_source* (*PCM_Source_CreateFromFile) (const char*) = nullptr;
    bool (*SetMediaItemTake_Source) (MediaItem_Take*, PCM_source*) = nullptr;
    bool (*SetMediaItemInfo_Value) (MediaItem*, const char*, double) = nullptr;
    bool (*GetSetMediaItemTakeInfo_String) (MediaItem_Take*, const char*, char*, bool) = nullptr;
    bool (*GetSetMediaItemInfo_String) (MediaItem*, const char*, char*, bool) = nullptr;
    void (*SetActiveTake) (MediaItem_Take*) = nullptr;
    MediaItem_Take* (*GetActiveTake) (MediaItem*) = nullptr;
    int (*GetMediaItemNumTakes) (MediaItem*) = nullptr;
    MediaItem_Take* (*GetMediaItemTake) (MediaItem*, int) = nullptr;
    int (*CountTrackMediaItems) (MediaTrack*) = nullptr;
    MediaItem* (*GetTrackMediaItem) (MediaTrack*, int) = nullptr;
    bool (*DeleteTrackMediaItem) (MediaTrack*, MediaItem*) = nullptr;
    bool (*SetTempoTimeSigMarker) (ReaProject*, int, double, int, double, double, int, int, bool) = nullptr;
    int (*CountTempoTimeSigMarkers) (ReaProject*) = nullptr;
    bool (*DeleteTempoTimeSigMarker) (ReaProject*, int) = nullptr;
    int (*AddProjectMarker2) (ReaProject*, bool, double, double, const char*, int, int) = nullptr;
    bool (*DeleteProjectMarker) (ReaProject*, int, bool) = nullptr;
    void (*UpdateTimeline)() = nullptr;
    void (*UpdateArrange)() = nullptr;
    void (*TrackList_AdjustWindows) (bool) = nullptr;
    void (*Undo_BeginBlock2) (ReaProject*) = nullptr;
    void (*Undo_EndBlock2) (ReaProject*, const char*, int) = nullptr;
    void (*PreventUIRefresh) (int) = nullptr;
    void (*Main_OnCommand) (int, int) = nullptr;
    void (*UpdateItemInProject) (MediaItem*) = nullptr;
    int (*CountMediaItems) (ReaProject*) = nullptr;
    MediaItem* (*GetMediaItem) (ReaProject*, int) = nullptr;
    PCM_source* (*GetMediaItemTake_Source) (MediaItem_Take*) = nullptr;
    void (*GetMediaSourceFileName) (PCM_source*, char*, int) = nullptr;
    PCM_source* (*GetMediaSourceParent) (PCM_source*) = nullptr;
    bool (*TakeIsMIDI) (MediaItem_Take*) = nullptr;
    int (*GetProjectStateChangeCount) (ReaProject*) = nullptr;

    template <typename F>
    bool get (F& f, const char* name)
    {
        f = reinterpret_cast<F> (host->getReaperApi (name));
        if (f == nullptr)
            log::warn ("REAPER: no {}", name);
        return f != nullptr;
    }

    bool load()
    {
        bool ok = true;
        ok &= get (GetTrack, "GetTrack");
        ok &= get (CountTracks, "CountTracks");
        ok &= get (InsertTrackAtIndex, "InsertTrackAtIndex");
        ok &= get (GetMediaTrackInfo_Value, "GetMediaTrackInfo_Value");
        ok &= get (SetMediaTrackInfo_Value, "SetMediaTrackInfo_Value");
        ok &= get (GetSetMediaTrackInfo_String, "GetSetMediaTrackInfo_String");
        ok &= get (AddMediaItemToTrack, "AddMediaItemToTrack");
        ok &= get (AddTakeToMediaItem, "AddTakeToMediaItem");
        ok &= get (PCM_Source_CreateFromFile, "PCM_Source_CreateFromFile");
        ok &= get (SetMediaItemTake_Source, "SetMediaItemTake_Source");
        ok &= get (SetMediaItemInfo_Value, "SetMediaItemInfo_Value");
        ok &= get (GetSetMediaItemTakeInfo_String, "GetSetMediaItemTakeInfo_String");
        ok &= get (GetSetMediaItemInfo_String, "GetSetMediaItemInfo_String");
        ok &= get (SetActiveTake, "SetActiveTake");
        ok &= get (GetActiveTake, "GetActiveTake");
        ok &= get (GetMediaItemNumTakes, "GetMediaItemNumTakes");
        ok &= get (GetMediaItemTake, "GetMediaItemTake");
        ok &= get (CountTrackMediaItems, "CountTrackMediaItems");
        ok &= get (GetTrackMediaItem, "GetTrackMediaItem");
        ok &= get (DeleteTrackMediaItem, "DeleteTrackMediaItem");
        ok &= get (SetTempoTimeSigMarker, "SetTempoTimeSigMarker");
        ok &= get (CountTempoTimeSigMarkers, "CountTempoTimeSigMarkers");
        ok &= get (DeleteTempoTimeSigMarker, "DeleteTempoTimeSigMarker");
        ok &= get (AddProjectMarker2, "AddProjectMarker2");
        ok &= get (DeleteProjectMarker, "DeleteProjectMarker");
        ok &= get (UpdateTimeline, "UpdateTimeline");
        ok &= get (UpdateArrange, "UpdateArrange");
        ok &= get (TrackList_AdjustWindows, "TrackList_AdjustWindows");
        ok &= get (Undo_BeginBlock2, "Undo_BeginBlock2");
        ok &= get (Undo_EndBlock2, "Undo_EndBlock2");
        ok &= get (PreventUIRefresh, "PreventUIRefresh");
        ok &= get (Main_OnCommand, "Main_OnCommand");
        ok &= get (UpdateItemInProject, "UpdateItemInProject");
        ok &= get (CountMediaItems, "CountMediaItems");
        ok &= get (GetMediaItem, "GetMediaItem");
        ok &= get (GetMediaItemTake_Source, "GetMediaItemTake_Source");
        ok &= get (GetMediaSourceFileName, "GetMediaSourceFileName");
        ok &= get (GetMediaSourceParent, "GetMediaSourceParent");
        ok &= get (TakeIsMIDI, "TakeIsMIDI");
        ok &= get (GetProjectStateChangeCount, "GetProjectStateChangeCount");
        return ok;
    }

    ReaProject* project() const { return static_cast<ReaProject*> (host->getReaperParent (3)); }
    MediaTrack* ownTrack() const { return static_cast<MediaTrack*> (host->getReaperParent (1)); }

    // --- tracks of the song: marked with P_EXT:plenio = "<song id>:<role>" ---

    std::string trackText (MediaTrack* t, const char* key) const
    {
        std::array<char, 4096> buffer {};
        if (! GetSetMediaTrackInfo_String (t, key, buffer.data(), false))
            return {};
        return std::string (buffer.data());
    }
    void setTrackText (MediaTrack* t, const char* key, const std::string& text) const
    {
        std::vector<char> buffer (text.begin(), text.end());
        buffer.push_back (0);
        GetSetMediaTrackInfo_String (t, key, buffer.data(), true);
    }
    std::map<std::string, MediaTrack*> songTracks (const std::string& songId) const
    {
        std::map<std::string, MediaTrack*> out;
        auto* p = project();
        const auto prefix = songId + ":";
        for (int i = 0, n = CountTracks (p); i < n; ++i)
        {
            auto* t = GetTrack (p, i);
            auto mark = trackText (t, "P_EXT:plenio");
            if (mark.rfind (prefix, 0) == 0)
                out[mark.substr (prefix.size())] = t;
        }
        return out;
    }
    // --- items: those Plenio puts on the song's tracks are marked with P_EXT:plenio_item = "<song id>" ---

    std::string itemText (MediaItem* item, const char* key) const
    {
        std::array<char, 4096> buffer {};
        if (item == nullptr || ! GetSetMediaItemInfo_String (item, key, buffer.data(), false))
            return {};
        return std::string (buffer.data());
    }
    void setItemText (MediaItem* item, const char* key, const std::string& text) const
    {
        std::vector<char> buffer (text.begin(), text.end());
        buffer.push_back (0);
        GetSetMediaItemInfo_String (item, key, buffer.data(), true);
    }
    /// Takes away the items Plenio put on the track; what the user put there stays.
    void clearItems (MediaTrack* t) const
    {
        for (int i = CountTrackMediaItems (t) - 1; i >= 0; --i)
            if (auto* item = GetTrackMediaItem (t, i); ! itemText (item, "P_EXT:plenio_item").empty())
                DeleteTrackMediaItem (t, item);
    }
    /// A new item of the song from the project's start, marked as Plenio's.
    MediaItem* newItem (MediaTrack* t, const std::string& songId, double position, double length) const
    {
        auto* item = AddMediaItemToTrack (t);
        SetMediaItemInfo_Value (item, "D_POSITION", position);
        SetMediaItemInfo_Value (item, "D_LENGTH", length);
        setItemText (item, "P_EXT:plenio_item", songId);
        return item;
    }
    /// An item playing a file (audio or MIDI) from the project's start.
    MediaItem* fileItem (MediaTrack* t, const std::string& songId, const std::filesystem::path& file, double length, const std::string& name) const
    {
        auto* item = newItem (t, songId, 0.0, length);
        auto* take = AddTakeToMediaItem (item);
        if (auto* source = PCM_Source_CreateFromFile (paths::toUtf8 (file).c_str()))
            SetMediaItemTake_Source (take, source);
        setTakeText (take, "P_NAME", name);
        return item;
    }
    /// The item keeps its time when the tempo changes (timebase Time), marked: Plenio does it once.
    void keepInTime (MediaItem* item) const
    {
        SetMediaItemInfo_Value (item, "C_BEATATTACHMODE", 0.0);
        setItemText (item, "P_EXT:plenio_time", "1");
    }
    /// The file a take plays: its source's, or for a section or a reversed take, the file of the source it wraps.
    std::string sourceFile (MediaItem_Take* take) const
    {
        auto* source = take != nullptr ? GetMediaItemTake_Source (take) : nullptr;
        for (int depth = 0; source != nullptr && depth < 8; ++depth)
        {
            std::array<char, 4096> buffer {};
            GetMediaSourceFileName (source, buffer.data(), static_cast<int> (buffer.size()));
            if (buffer[0] != 0)
                return std::string (buffer.data());
            source = GetMediaSourceParent (source);
        }
        return {};
    }
    void setTakeText (MediaItem_Take* take, const char* key, const std::string& text) const
    {
        std::vector<char> buffer (text.begin(), text.end());
        buffer.push_back (0);
        GetSetMediaItemTakeInfo_String (take, key, buffer.data(), true);
    }
    std::string takeText (MediaItem_Take* take, const char* key) const
    {
        std::array<char, 4096> buffer {};
        if (take == nullptr || ! GetSetMediaItemTakeInfo_String (take, key, buffer.data(), false))
            return {};
        return std::string (buffer.data());
    }
    MediaItem* songItem (const std::string& songId) const
    {
        auto tracks = songTracks (songId);
        auto it = tracks.find ("song");
        if (it == tracks.end())
            return nullptr;
        for (int i = 0, n = CountTrackMediaItems (it->second); i < n; ++i)
            if (auto* item = GetTrackMediaItem (it->second, i); itemText (item, "P_EXT:plenio_item") == songId)
                return item;
        return nullptr;
    }
};

namespace
{
int color (int r, int g, int b)
{
    return (r | (g << 8) | (b << 16)) | 0x1000000; // Windows' COLORREF with REAPER's "custom colour" bit
}
} // namespace

bool isLibraryAudio (const std::filesystem::path& root, const std::string& file)
{
    // Windows' paths: either slash, any case
    auto folded = [] (std::string s)
    {
        for (auto& c : s)
            c = c == '\\' ? '/' : static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
        while (! s.empty() && s.back() == '/')
            s.pop_back();
        return s;
    };
    const auto folder = folded (paths::toUtf8 (root));
    const auto path = folded (file);
    if (folder.empty() || path.size() <= folder.size() + 1 || path.compare (0, folder.size(), folder) != 0 || path[folder.size()] != '/')
        return false;
    static const char* audio[] = { ".wav", ".flac", ".mp3", ".ogg", ".opus", ".aif", ".aiff", ".w64" };
    const auto dot = path.find_last_of ('.');
    if (dot == std::string::npos || path.find ('/', dot) != std::string::npos)
        return false;
    const auto extension = path.substr (dot);
    return std::any_of (std::begin (audio), std::end (audio), [&] (const char* e) { return extension == e; });
}

std::unique_ptr<Reaper> Reaper::connect (Steinberg::FUnknown* hostContext)
{
    if (hostContext == nullptr)
        return nullptr;
    Steinberg::IReaperHostApplication* host = nullptr;
    if (hostContext->queryInterface (Steinberg::IReaperHostApplication::iid, reinterpret_cast<void**> (&host)) != Steinberg::kResultOk || host == nullptr)
        return nullptr;
    auto api = std::make_unique<Api>();
    api->host = host;
    if (! api->load())
    {
        host->release();
        log::warn ("REAPER: the extension API lacks functions Plenio needs; the song stays in the instrument");
        return nullptr;
    }
    log::info ("REAPER: the song can go on the project's tracks");
    return std::unique_ptr<Reaper> (new Reaper (std::move (api)));
}

Reaper::Reaper (std::unique_ptr<Api> a) : api (std::move (a)) {}

Reaper::~Reaper()
{
    if (api && api->host != nullptr)
        api->host->release();
}

bool Reaper::place (const ReaperSong& song, std::string& problem)
{
    auto& a = *api;
    auto* project = a.project();
    if (song.takes.empty())
    {
        problem = "The song has no take yet.";
        return false;
    }
    a.Undo_BeginBlock2 (project);
    a.PreventUIRefresh (1);

    // the tracks: found again by their mark, made below the instrument's track when missing
    struct Role
    {
        const char* key;
        std::string name;
    };
    std::vector<Role> roles = { { "folder", "Plenio · " + song.title }, { "lyrics", "Lyrics" }, { "song", "Song" } };
    for (const auto& [name, file] : song.parts)
        roles.push_back ({ name == "Melody" ? "melody" : name == "Chords" ? "chords" : "instrument", name });
    static const char* stemKeys[] = { "vocals", "drums", "bass", "other", "rest" };
    for (const auto* key : stemKeys)
        for (const auto& [name, file] : song.stems)
            if (name == key)
            {
                std::string label = name;
                label[0] = static_cast<char> (std::toupper (static_cast<unsigned char> (label[0])));
                roles.push_back ({ key, label });
            }

    auto tracks = a.songTracks (song.id);
    int insertAt = -1; // after the instrument's track, or after the song's folder's last track
    if (auto* own = a.ownTrack())
        insertAt = static_cast<int> (a.GetMediaTrackInfo_Value (own, "IP_TRACKNUMBER")); // 1-based: the index after it
    if (insertAt < 0)
        insertAt = a.CountTracks (project);
    if (! tracks.empty())
    {
        // after the last track the song has now
        int last = 0;
        for (const auto& [key, t] : tracks)
            last = std::max (last, static_cast<int> (a.GetMediaTrackInfo_Value (t, "IP_TRACKNUMBER")));
        insertAt = last;
    }
    for (const auto& role : roles)
    {
        auto it = tracks.find (role.key);
        if (it == tracks.end())
        {
            a.InsertTrackAtIndex (insertAt, true);
            auto* t = a.GetTrack (project, insertAt);
            ++insertAt;
            a.setTrackText (t, "P_EXT:plenio", song.id + ":" + role.key);
            tracks[role.key] = t;
        }
        a.setTrackText (tracks[role.key], "P_NAME", role.name);
    }
    // the folder: the folder track opens it, the last of the song's tracks closes it
    std::vector<MediaTrack*> ordered;
    for (const auto& [key, t] : tracks)
        ordered.push_back (t);
    std::sort (ordered.begin(), ordered.end(), [&] (MediaTrack* x, MediaTrack* y)
               { return a.GetMediaTrackInfo_Value (x, "IP_TRACKNUMBER") < a.GetMediaTrackInfo_Value (y, "IP_TRACKNUMBER"); });
    for (auto* t : ordered)
        a.SetMediaTrackInfo_Value (t, "I_FOLDERDEPTH", 0.0);
    a.SetMediaTrackInfo_Value (tracks["folder"], "I_FOLDERDEPTH", 1.0);
    a.SetMediaTrackInfo_Value (ordered.back(), "I_FOLDERDEPTH", -1.0);
    a.SetMediaTrackInfo_Value (tracks["folder"], "I_CUSTOMCOLOR", color (176, 92, 255));
    // the song's cover art as the icon of its folder and its Song track (a song without one keeps what is there)
    if (! song.cover.empty())
        for (const char* key : { "folder", "song" })
            a.setTrackText (tracks[key], "P_ICON", paths::toUtf8 (song.cover));

    // what Plenio put on the song's tracks before makes way (on all of them: the track of a stem the take lacks
    // falls silent), and the regions it made
    for (const auto& [key, t] : tracks)
        a.clearItems (t);
    auto* folder = tracks["folder"];
    auto old = a.trackText (folder, "P_EXT:plenio_regions");
    for (std::size_t at = 0; at < old.size();)
    {
        auto comma = old.find (',', at);
        auto number = old.substr (at, comma == std::string::npos ? std::string::npos : comma - at);
        if (! number.empty())
            a.DeleteProjectMarker (project, std::atoi (number.c_str()), true);
        if (comma == std::string::npos)
            break;
        at = comma + 1;
    }

    // the project's tempo map, the take's bars: before the items and regions, which a change of tempo moves or
    // stretches (REAPER's default timebase follows the beats)
    if (! song.tempo.empty())
    {
        for (int i = a.CountTempoTimeSigMarkers (project) - 1; i >= 0; --i)
            a.DeleteTempoTimeSigMarker (project, i);
        for (const auto& t : song.tempo)
            a.SetTempoTimeSigMarker (project, -1, t.seconds, -1, -1.0, t.bpm, t.meter ? t.numerator : 0, t.meter ? t.denominator : 0, false);
    }

    // Song: one item, every take of the song as one of REAPER's takes. In time, as all of the song's audio.
    auto* songTrack = tracks["song"];
    double longest = 0.0;
    for (const auto& t : song.takes)
        longest = std::max (longest, t.length);
    auto* item = a.newItem (songTrack, song.id, 0.0, std::max (longest, song.length));
    a.keepInTime (item);
    MediaItem_Take* chosen = nullptr;
    for (const auto& t : song.takes)
    {
        auto* take = a.AddTakeToMediaItem (item);
        if (auto* source = a.PCM_Source_CreateFromFile (paths::toUtf8 (t.audio).c_str()))
            a.SetMediaItemTake_Source (take, source);
        a.setTakeText (take, "P_NAME", t.name);
        a.setTakeText (take, "P_EXT:plenio_take", std::to_string (t.number));
        if (t.number == song.activeTake)
            chosen = take;
    }
    if (chosen != nullptr)
        a.SetActiveTake (chosen);
    a.UpdateItemInProject (item);
    a.SetMediaTrackInfo_Value (songTrack, "B_MUTE", song.stems.empty() ? 0.0 : 1.0); // the stems are the song, as in the add-in

    // the stems of the chosen take, in time; the score's parts, muted (an instrument on them makes them heard). The
    // MIDI keeps REAPER's timebase: its notes sit on the beats of the tempo map, as in the file.
    for (const auto& [name, file] : song.stems)
    {
        auto* t = tracks[name];
        a.keepInTime (a.fileItem (t, song.id, file, song.length, name));
        a.SetMediaTrackInfo_Value (t, "B_MUTE", 0.0);
    }
    for (const auto& [name, file] : song.parts)
    {
        auto* t = tracks[name == "Melody" ? "melody" : name == "Chords" ? "chords" : "instrument"];
        a.fileItem (t, song.id, file, song.length, name);
        a.SetMediaTrackInfo_Value (t, "B_MUTE", 1.0);
    }

    // Lyrics: an empty item per sung line, its text as the item's notes; in time with the audio
    auto* lyrics = tracks["lyrics"];
    for (const auto& l : song.lines)
    {
        auto* line = a.newItem (lyrics, song.id, l.start, std::max (0.1, l.end - l.start));
        a.SetMediaItemInfo_Value (line, "C_BEATATTACHMODE", 0.0);
        std::vector<char> text (l.text.begin(), l.text.end());
        text.push_back (0);
        a.GetSetMediaItemInfo_String (line, "P_NOTES", text.data(), true);
    }

    // the sections as regions
    std::string made;
    static const int colours[][3] = { { 255, 90, 160 }, { 160, 92, 255 }, { 92, 141, 255 }, { 47, 195, 168 }, { 255, 178, 62 }, { 255, 122, 89 } };
    for (std::size_t i = 0; i < song.sections.size(); ++i)
    {
        const auto& s = song.sections[i];
        const auto* c = colours[i % 6];
        auto index = a.AddProjectMarker2 (project, true, s.start, s.end, s.text.c_str(), -1, color (c[0], c[1], c[2]));
        if (index >= 0)
            made += (made.empty() ? "" : ",") + std::to_string (index);
    }
    a.setTrackText (folder, "P_EXT:plenio_regions", made);

    a.PreventUIRefresh (-1);
    a.TrackList_AdjustWindows (false);
    a.UpdateTimeline();
    a.UpdateArrange();
    a.Undo_EndBlock2 (project, "Plenio: the song on tracks", -1);
    a.Main_OnCommand (40047, 0); // Peaks: build any missing peaks
    log::info ("REAPER: {} on tracks ({} takes, {} stems, take {} chosen)", song.title, song.takes.size(), song.stems.size(), song.activeTake);
    return true;
}

bool Reaper::placed (const std::string& songId) const
{
    return api->songItem (songId) != nullptr;
}

int Reaper::keepInTime (const std::function<bool (const std::string&)>& isPlenio)
{
    auto& a = *api;
    auto* project = a.project();
    const int state = a.GetProjectStateChangeCount (project);
    if (project == lookedAt && state == lookedAtState)
        return 0;
    lookedAt = project;
    lookedAtState = state;
    int made = 0;
    for (int i = 0, n = a.CountMediaItems (project); i < n; ++i)
    {
        auto* item = a.GetMediaItem (project, i);
        if (item == nullptr || ! a.itemText (item, "P_EXT:plenio_time").empty())
            continue;
        bool plenio = false;
        for (int k = 0, takes = a.GetMediaItemNumTakes (item); k < takes && ! plenio; ++k)
        {
            auto* take = a.GetMediaItemTake (item, k);
            if (take == nullptr || a.TakeIsMIDI (take))
                continue; // MIDI sits on the beats
            auto original = a.takeText (take, "P_EXT:ORIGINAL_FILENAME"); // media REAPER copied into the project's folder
            plenio = (! original.empty() && isPlenio (original)) || isPlenio (a.sourceFile (take));
        }
        if (plenio)
        {
            a.keepInTime (item);
            ++made;
        }
    }
    if (made > 0)
    {
        a.UpdateArrange();
        lookedAtState = a.GetProjectStateChangeCount (project); // its own change is no reason to look again
    }
    return made;
}

std::optional<int> Reaper::chosenTake (const std::string& songId) const
{
    auto* item = api->songItem (songId);
    if (item == nullptr)
        return std::nullopt;
    auto text = api->takeText (api->GetActiveTake (item), "P_EXT:plenio_take");
    if (text.empty())
        return std::nullopt;
    return std::atoi (text.c_str());
}

void Reaper::chooseTake (const std::string& songId, int number)
{
    auto* item = api->songItem (songId);
    if (item == nullptr)
        return;
    for (int i = 0, n = api->GetMediaItemNumTakes (item); i < n; ++i)
    {
        auto* take = api->GetMediaItemTake (item, i);
        if (api->takeText (take, "P_EXT:plenio_take") == std::to_string (number))
        {
            if (api->GetActiveTake (item) != take)
            {
                api->SetActiveTake (take);
                api->UpdateItemInProject (item);
                api->UpdateArrange();
            }
            return;
        }
    }
}

void Reaper::forget (const std::string& songId)
{
    for (const auto& [key, t] : api->songTracks (songId))
        api->setTrackText (t, "P_EXT:plenio", "");
}

void Reaper::playStop()
{
    api->Main_OnCommand (40044, 0); // Transport: Play/stop
}

} // namespace plenio::plugin
