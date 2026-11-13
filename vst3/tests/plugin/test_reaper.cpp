// REAPER's side of the plug-in against a fake REAPER (REAPER itself never runs in the tests). The fake keeps tracks,
// items, takes, sources, tempo markers and regions, and does to items what REAPER's timebase does when the tempo
// changes: an item in "beats (position, length, rate)", REAPER's default, is stretched; one in "beats (position
// only)" moved; one in "time" stays as it is.
#include <doctest/doctest.h>

#include "plugin/reaper.h"

#include "pluginterfaces/base/funknown.h"

namespace Steinberg
{
#include "reaper_vst3_interfaces.h"
}

#include <algorithm>
#include <cstring>
#include <filesystem>
#include <map>
#include <memory>
#include <string>
#include <vector>

namespace fs = std::filesystem;

// REAPER's types as the fake has them (the plug-in only ever holds pointers to them)
class PCM_source
{
public:
    std::string file;              // empty: a section or a reversed take, wrapping `parent`
    PCM_source* parent = nullptr;
    bool midi = false;
};
struct MediaTrack;
struct MediaItem;
struct MediaItem_Take
{
    MediaItem* item = nullptr;
    PCM_source* source = nullptr;
    std::map<std::string, std::string> text;
};
struct MediaItem
{
    MediaTrack* track = nullptr;
    std::map<std::string, double> values { { "C_BEATATTACHMODE", -1.0 } };
    std::map<std::string, std::string> text;
    std::vector<std::unique_ptr<MediaItem_Take>> takes;
    MediaItem_Take* active = nullptr;
    int stretched = 0; // changes of tempo that stretched it
    int moved = 0;     // and that moved it
};
struct MediaTrack
{
    std::map<std::string, double> values { { "C_BEATATTACHMODE", -1.0 } };
    std::map<std::string, std::string> text;
    std::vector<std::unique_ptr<MediaItem>> items;
};
struct ReaProject
{
    struct Tempo
    {
        double seconds = 0.0;
        double bpm = 120.0;
    };
    struct Region
    {
        int index = 0;
        double start = 0.0;
        double end = 0.0;
        std::string name;
    };
    std::vector<std::unique_ptr<MediaTrack>> tracks;
    std::vector<std::unique_ptr<PCM_source>> sources;
    std::vector<Tempo> tempo { { 0.0, 120.0 } }; // a new project's
    std::vector<Region> regions;
    int nextRegion = 1;
    int timebase = 1;  // the project's default timebase: beats (position, length, rate), as REAPER's
    int state = 0;     // GetProjectStateChangeCount
    int looks = 0;     // CountMediaItems calls
    MediaTrack* own = nullptr; // the instrument's track
};

namespace fake
{
ReaProject* project = nullptr;

void tempoChanged (ReaProject* p)
{
    for (auto& t : p->tracks)
        for (auto& item : t->items)
        {
            int mode = static_cast<int> (item->values["C_BEATATTACHMODE"]);
            if (mode < 0)
                mode = static_cast<int> (t->values["C_BEATATTACHMODE"]);
            if (mode < 0)
                mode = p->timebase;
            if (mode == 1)
                ++item->stretched;
            else if (mode == 2)
                ++item->moved;
        }
    ++p->state;
}
bool text (std::map<std::string, std::string>& m, const char* key, char* buffer, bool set)
{
    if (set)
    {
        m[key] = buffer;
        return true;
    }
    auto it = m.find (key);
    if (it == m.end())
        return false;
    std::strcpy (buffer, it->second.c_str());
    return true;
}
int indexOf (MediaTrack* t)
{
    for (std::size_t i = 0; i < project->tracks.size(); ++i)
        if (project->tracks[i].get() == t)
            return static_cast<int> (i);
    return -1;
}

MediaTrack* GetTrack (ReaProject* p, int i) { return i >= 0 && i < static_cast<int> (p->tracks.size()) ? p->tracks[static_cast<std::size_t> (i)].get() : nullptr; }
int CountTracks (ReaProject* p) { return static_cast<int> (p->tracks.size()); }
void InsertTrackAtIndex (int at, bool)
{
    at = std::clamp (at, 0, static_cast<int> (project->tracks.size()));
    project->tracks.insert (project->tracks.begin() + at, std::make_unique<MediaTrack>());
}
double GetMediaTrackInfo_Value (MediaTrack* t, const char* key)
{
    if (std::string (key) == "IP_TRACKNUMBER")
        return indexOf (t) + 1.0;
    auto it = t->values.find (key);
    return it == t->values.end() ? 0.0 : it->second;
}
bool SetMediaTrackInfo_Value (MediaTrack* t, const char* key, double v)
{
    t->values[key] = v;
    return true;
}
bool GetSetMediaTrackInfo_String (MediaTrack* t, const char* key, char* buffer, bool set) { return text (t->text, key, buffer, set); }
MediaItem* AddMediaItemToTrack (MediaTrack* t)
{
    t->items.push_back (std::make_unique<MediaItem>());
    t->items.back()->track = t;
    return t->items.back().get();
}
MediaItem_Take* AddTakeToMediaItem (MediaItem* item)
{
    item->takes.push_back (std::make_unique<MediaItem_Take>());
    item->takes.back()->item = item;
    if (item->active == nullptr)
        item->active = item->takes.back().get();
    return item->takes.back().get();
}
PCM_source* PCM_Source_CreateFromFile (const char* file)
{
    auto s = std::make_unique<PCM_source>();
    s->file = file;
    s->midi = s->file.size() > 4 && s->file.substr (s->file.size() - 4) == ".mid";
    project->sources.push_back (std::move (s));
    return project->sources.back().get();
}
bool SetMediaItemTake_Source (MediaItem_Take* take, PCM_source* s)
{
    take->source = s;
    return true;
}
bool SetMediaItemInfo_Value (MediaItem* item, const char* key, double v)
{
    item->values[key] = v;
    return true;
}
bool GetSetMediaItemTakeInfo_String (MediaItem_Take* take, const char* key, char* buffer, bool set) { return text (take->text, key, buffer, set); }
bool GetSetMediaItemInfo_String (MediaItem* item, const char* key, char* buffer, bool set) { return text (item->text, key, buffer, set); }
void SetActiveTake (MediaItem_Take* take) { take->item->active = take; }
MediaItem_Take* GetActiveTake (MediaItem* item) { return item->active; }
int GetMediaItemNumTakes (MediaItem* item) { return static_cast<int> (item->takes.size()); }
MediaItem_Take* GetMediaItemTake (MediaItem* item, int k) { return k >= 0 && k < static_cast<int> (item->takes.size()) ? item->takes[static_cast<std::size_t> (k)].get() : nullptr; }
int CountTrackMediaItems (MediaTrack* t) { return static_cast<int> (t->items.size()); }
MediaItem* GetTrackMediaItem (MediaTrack* t, int i) { return i >= 0 && i < static_cast<int> (t->items.size()) ? t->items[static_cast<std::size_t> (i)].get() : nullptr; }
bool DeleteTrackMediaItem (MediaTrack* t, MediaItem* item)
{
    auto it = std::find_if (t->items.begin(), t->items.end(), [&] (const auto& i) { return i.get() == item; });
    if (it == t->items.end())
        return false;
    t->items.erase (it);
    return true;
}
bool SetTempoTimeSigMarker (ReaProject* p, int index, double seconds, int, double, double bpm, int, int, bool)
{
    if (index < 0)
        p->tempo.push_back ({ seconds, bpm });
    else
        p->tempo[static_cast<std::size_t> (index)] = { seconds, bpm };
    tempoChanged (p);
    return true;
}
int CountTempoTimeSigMarkers (ReaProject* p) { return static_cast<int> (p->tempo.size()); }
bool DeleteTempoTimeSigMarker (ReaProject* p, int i)
{
    p->tempo.erase (p->tempo.begin() + i);
    tempoChanged (p);
    return true;
}
int AddProjectMarker2 (ReaProject* p, bool, double start, double end, const char* name, int, int)
{
    p->regions.push_back ({ p->nextRegion, start, end, name });
    return p->nextRegion++;
}
bool DeleteProjectMarker (ReaProject* p, int index, bool)
{
    auto it = std::find_if (p->regions.begin(), p->regions.end(), [&] (const auto& r) { return r.index == index; });
    if (it == p->regions.end())
        return false;
    p->regions.erase (it);
    return true;
}
void UpdateTimeline() {}
void UpdateArrange() {}
void TrackList_AdjustWindows (bool) {}
void Undo_BeginBlock2 (ReaProject*) {}
void Undo_EndBlock2 (ReaProject* p, const char*, int) { ++p->state; }
void PreventUIRefresh (int) {}
void Main_OnCommand (int, int) {}
void UpdateItemInProject (MediaItem*) {}
int CountMediaItems (ReaProject* p)
{
    ++p->looks;
    int n = 0;
    for (auto& t : p->tracks)
        n += static_cast<int> (t->items.size());
    return n;
}
MediaItem* GetMediaItem (ReaProject* p, int i)
{
    for (auto& t : p->tracks)
    {
        if (i < static_cast<int> (t->items.size()))
            return t->items[static_cast<std::size_t> (i)].get();
        i -= static_cast<int> (t->items.size());
    }
    return nullptr;
}
PCM_source* GetMediaItemTake_Source (MediaItem_Take* take) { return take->source; }
void GetMediaSourceFileName (PCM_source* s, char* buffer, int size)
{
    std::strncpy (buffer, s->file.c_str(), static_cast<std::size_t> (size) - 1);
    buffer[size - 1] = 0;
}
PCM_source* GetMediaSourceParent (PCM_source* s) { return s->parent; }
bool TakeIsMIDI (MediaItem_Take* take) { return take->source != nullptr && take->source->midi; }
int GetProjectStateChangeCount (ReaProject* p) { return p->state; }
} // namespace fake

namespace
{
#define FAKE(name) { #name, reinterpret_cast<void*> (&fake::name) }

class FakeHost : public Steinberg::IReaperHostApplication
{
public:
    Steinberg::tresult PLUGIN_API queryInterface (const Steinberg::TUID wanted, void** obj) override
    {
        if (Steinberg::FUnknownPrivate::iidEqual (wanted, Steinberg::IReaperHostApplication::iid))
        {
            addRef();
            *obj = static_cast<Steinberg::IReaperHostApplication*> (this);
            return Steinberg::kResultOk;
        }
        *obj = nullptr;
        return Steinberg::kNoInterface;
    }
    Steinberg::uint32 PLUGIN_API addRef() override { return ++refs; }
    Steinberg::uint32 PLUGIN_API release() override { return --refs; }
    void* PLUGIN_API getReaperApi (Steinberg::CStringA name) override
    {
        static const std::map<std::string, void*> api = {
            FAKE (GetTrack), FAKE (CountTracks), FAKE (InsertTrackAtIndex), FAKE (GetMediaTrackInfo_Value),
            FAKE (SetMediaTrackInfo_Value), FAKE (GetSetMediaTrackInfo_String), FAKE (AddMediaItemToTrack),
            FAKE (AddTakeToMediaItem), FAKE (PCM_Source_CreateFromFile), FAKE (SetMediaItemTake_Source),
            FAKE (SetMediaItemInfo_Value), FAKE (GetSetMediaItemTakeInfo_String), FAKE (GetSetMediaItemInfo_String),
            FAKE (SetActiveTake), FAKE (GetActiveTake), FAKE (GetMediaItemNumTakes), FAKE (GetMediaItemTake),
            FAKE (CountTrackMediaItems), FAKE (GetTrackMediaItem), FAKE (DeleteTrackMediaItem),
            FAKE (SetTempoTimeSigMarker), FAKE (CountTempoTimeSigMarkers), FAKE (DeleteTempoTimeSigMarker),
            FAKE (AddProjectMarker2), FAKE (DeleteProjectMarker), FAKE (UpdateTimeline), FAKE (UpdateArrange),
            FAKE (TrackList_AdjustWindows), FAKE (Undo_BeginBlock2), FAKE (Undo_EndBlock2), FAKE (PreventUIRefresh),
            FAKE (Main_OnCommand), FAKE (UpdateItemInProject), FAKE (CountMediaItems), FAKE (GetMediaItem),
            FAKE (GetMediaItemTake_Source), FAKE (GetMediaSourceFileName), FAKE (GetMediaSourceParent),
            FAKE (TakeIsMIDI), FAKE (GetProjectStateChangeCount),
        };
        auto it = api.find (name);
        return it == api.end() ? nullptr : it->second;
    }
    void* PLUGIN_API getReaperParent (Steinberg::uint32 what) override
    {
        if (what == 3)
            return fake::project;
        return what == 1 ? fake::project->own : nullptr;
    }
    void* PLUGIN_API reaperExtended (Steinberg::uint32, void*, void*, void*) override { return nullptr; }

    int refs = 1;
};

#undef FAKE

/// A project with the instrument on its only track, and Plenio connected to it.
struct Studio
{
    ReaProject project;
    FakeHost host;
    std::unique_ptr<plenio::plugin::Reaper> reaper;

    Studio()
    {
        fake::project = &project;
        project.tracks.push_back (std::make_unique<MediaTrack>());
        project.own = project.tracks.front().get();
        reaper = plenio::plugin::Reaper::connect (&host);
    }
    ~Studio()
    {
        reaper.reset();
        fake::project = nullptr;
    }
    MediaTrack* track (const std::string& mark)
    {
        for (auto& t : project.tracks)
            if (t->text["P_EXT:plenio"] == mark)
                return t.get();
        return nullptr;
    }
    /// An item the user drops in: REAPER's default timebase.
    MediaItem* drop (MediaTrack* t, const std::string& file)
    {
        auto* item = fake::AddMediaItemToTrack (t);
        fake::SetMediaItemTake_Source (fake::AddTakeToMediaItem (item), fake::PCM_Source_CreateFromFile (file.c_str()));
        ++project.state;
        return item;
    }
    std::vector<MediaItem*> plenioItems()
    {
        std::vector<MediaItem*> out;
        for (auto& t : project.tracks)
            for (auto& item : t->items)
                if (! item->text["P_EXT:plenio_item"].empty())
                    out.push_back (item.get());
        return out;
    }
};

const fs::path library = "C:/Users/someone/OneDrive/Dokumente/Plenio/Songs";

std::string inLibrary (const std::string& rest)
{
    return (library / "Night Drive [s-1]" / "takes" / rest).generic_string();
}

plenio::plugin::ReaperSong nightDrive()
{
    plenio::plugin::ReaperSong s;
    s.id = "s-1";
    s.title = "Night Drive";
    s.takes = { { 1, "Take 1 · 4 stars", inLibrary ("1/daw/Night Drive - Take 1.wav"), 95.0 },
                { 2, "Take 2 · 4.5 stars", inLibrary ("2/daw/Night Drive - Take 2.wav"), 93.0 } };
    s.activeTake = 2;
    s.stems = { { "vocals", inLibrary ("2/daw/Night Drive - Take 2 - vocals.wav") },
                { "drums", inLibrary ("2/daw/Night Drive - Take 2 - drums.wav") } };
    s.parts = { { "Melody", inLibrary ("2/daw/Night Drive - Take 2 - Melody.mid") },
                { "Chords", inLibrary ("2/daw/Night Drive - Take 2 - Chords.mid") } };
    s.lines = { { 3.2, 6.0, "Headlights on the water" }, { 6.4, 9.5, "and nowhere to be" } };
    s.sections = { { 0.0, 12.6, "Intro" }, { 12.6, 40.0, "Verse" } };
    s.tempo = { { 0.0, 76.0, 4, 4, true }, { 3.158, 75.9, 4, 4, false }, { 6.32, 76.1, 4, 4, false } };
    s.length = 95.0;
    s.cover = inLibrary ("2/Night Drive - Take 2.jpg");
    return s;
}
} // namespace

TEST_CASE ("Put on tracks: the tempo map first, the song's audio in time, the user's items stay")
{
    Studio studio;
    REQUIRE (studio.reaper != nullptr);
    std::string problem;
    REQUIRE (studio.reaper->place (nightDrive(), problem));

    // the tempo map of the take's bars, REAPER's 120 BPM gone
    REQUIRE (studio.project.tempo.size() == 3);
    CHECK (studio.project.tempo[0].bpm == doctest::Approx (76.0));
    CHECK (studio.project.regions.size() == 2);

    // nothing Plenio put there was moved or stretched by the tempo map
    const auto items = studio.plenioItems();
    CHECK (items.size() == 1 + 2 + 2 + 2); // the song, the stems, the parts, the lines
    for (auto* item : items)
    {
        CHECK (item->stretched == 0);
        CHECK (item->moved == 0);
    }

    // the audio and the lyrics keep their time; the MIDI keeps REAPER's timebase (its notes sit on the beats)
    auto* song = studio.track ("s-1:song");
    REQUIRE (song != nullptr);
    REQUIRE (song->items.size() == 1);
    CHECK (song->items[0]->values["C_BEATATTACHMODE"] == 0.0);
    CHECK (song->items[0]->takes.size() == 2);
    CHECK (studio.reaper->chosenTake ("s-1") == 2);
    for (const char* stem : { "s-1:vocals", "s-1:drums" })
    {
        auto* t = studio.track (stem);
        REQUIRE (t != nullptr);
        REQUIRE (t->items.size() == 1);
        CHECK (t->items[0]->values["C_BEATATTACHMODE"] == 0.0);
        CHECK (t->items[0]->text["P_EXT:plenio_time"] == "1");
    }
    auto* melody = studio.track ("s-1:melody");
    REQUIRE (melody != nullptr);
    CHECK (melody->items[0]->values["C_BEATATTACHMODE"] == -1.0);
    auto* lyrics = studio.track ("s-1:lyrics");
    REQUIRE (lyrics != nullptr);
    REQUIRE (lyrics->items.size() == 2);
    CHECK (lyrics->items[0]->values["C_BEATATTACHMODE"] == 0.0);
    CHECK (lyrics->items[0]->values["D_POSITION"] == doctest::Approx (3.2));

    // the cover art as the icon of the song's folder and its Song track
    CHECK (studio.track ("s-1:folder")->text["P_ICON"] == inLibrary ("2/Night Drive - Take 2.jpg"));
    CHECK (song->text["P_ICON"] == inLibrary ("2/Night Drive - Take 2.jpg"));
    CHECK (studio.track ("s-1:vocals")->text["P_ICON"].empty());

    // the user records on the vocals' track, then chooses take 1 (another tempo map, no drums stem)
    auto* vocals = studio.track ("s-1:vocals");
    auto* own = studio.drop (vocals, "D:/Recordings/harmony.wav");
    auto other = nightDrive();
    other.activeTake = 1;
    other.stems = { { "vocals", inLibrary ("1/daw/Night Drive - Take 1 - vocals.wav") } };
    other.parts = { { "Melody", inLibrary ("1/daw/Night Drive - Take 1 - Melody.mid") } };
    other.tempo[0].bpm = 80.0;
    REQUIRE (studio.reaper->place (other, problem));

    CHECK (studio.project.tempo.size() == 3);
    CHECK (studio.project.tempo[0].bpm == doctest::Approx (80.0));
    CHECK (studio.project.regions.size() == 2); // the old ones made way
    CHECK (studio.reaper->chosenTake ("s-1") == 1);
    REQUIRE (vocals->items.size() == 2); // the user's own item stays
    CHECK (std::any_of (vocals->items.begin(), vocals->items.end(), [&] (const auto& i) { return i.get() == own; }));
    CHECK (studio.track ("s-1:drums")->items.empty()); // take 1 has no drums stem: its track falls silent
    for (auto* item : studio.plenioItems())
    {
        CHECK (item->stretched == 0);
        CHECK (item->moved == 0);
    }
}

TEST_CASE ("REAPER: Plenio's audio dropped into the project keeps its time when the tempo map comes")
{
    Studio studio;
    REQUIRE (studio.reaper != nullptr);
    auto isPlenio = [] (const std::string& file) { return plenio::plugin::isLibraryAudio (library, file); };

    // what the user drags in: REAPER gives each item its default timebase
    studio.project.tracks.push_back (std::make_unique<MediaTrack>());
    auto* t = studio.project.tracks.back().get();
    auto* take = studio.drop (t, inLibrary ("1/daw/Night Drive - Take 1.wav"));
    auto* midi = studio.drop (t, inLibrary ("1/daw/Night Drive - Tempo map.mid"));
    auto* own = studio.drop (t, "D:/Recordings/guitar.wav");
    // REAPER copied a stem into the project's folder (Preferences: copy imported media)
    auto* copy = studio.drop (t, "D:/Projects/Night Drive/Audio/Night Drive - Take 1 - vocals.wav");
    copy->takes[0]->text["P_EXT:ORIGINAL_FILENAME"] = inLibrary ("1/daw/Night Drive - Take 1 - vocals.wav");
    // a part of the take, reversed: REAPER's section source wraps the file's
    auto* reversed = studio.drop (t, "");
    reversed->takes[0]->source->parent = fake::PCM_Source_CreateFromFile (inLibrary ("1/daw/Night Drive - Click.wav").c_str());
    // a take the user set to follow the beats after Plenio kept it in time
    auto* chosen = studio.drop (t, inLibrary ("2/daw/Night Drive - Take 2.wav"));
    chosen->values["C_BEATATTACHMODE"] = 1.0;
    chosen->text["P_EXT:plenio_time"] = "1";

    CHECK (studio.reaper->keepInTime (isPlenio) == 3);
    for (auto* item : { take, copy, reversed })
    {
        CHECK (item->values["C_BEATATTACHMODE"] == 0.0);
        CHECK (item->text["P_EXT:plenio_time"] == "1");
    }
    CHECK (midi->values["C_BEATATTACHMODE"] == -1.0);
    CHECK (own->values["C_BEATATTACHMODE"] == -1.0);
    CHECK (chosen->values["C_BEATATTACHMODE"] == 1.0);

    // nothing changed in the project: no look at its items
    const int looks = studio.project.looks;
    CHECK (studio.reaper->keepInTime (isPlenio) == 0);
    CHECK (studio.project.looks == looks);

    // REAPER imports the tempo map of the dropped MIDI file: 120 BPM becomes the song's 76
    fake::DeleteTempoTimeSigMarker (&studio.project, 0);
    fake::SetTempoTimeSigMarker (&studio.project, -1, 0.0, -1, -1.0, 76.0, 4, 4, false);
    CHECK (take->stretched == 0);
    CHECK (copy->stretched == 0);
    CHECK (reversed->stretched == 0);
    CHECK (own->stretched == 2); // what happened to the owner's take: REAPER stretched it to 76/120 of its speed

    // a take dropped in later is kept in time at the next look
    auto* later = studio.drop (t, inLibrary ("2/daw/Night Drive - Take 2 - bass.wav"));
    CHECK (studio.reaper->keepInTime (isPlenio) == 1);
    CHECK (later->values["C_BEATATTACHMODE"] == 0.0);
}

TEST_CASE ("REAPER: audio of Plenio's library, by its path")
{
    using plenio::plugin::isLibraryAudio;
    CHECK (isLibraryAudio (library, "C:\\Users\\someone\\OneDrive\\Dokumente\\Plenio\\Songs\\A [s-2]\\takes\\1\\daw\\A - Take 1.wav"));
    CHECK (isLibraryAudio (library, "c:/users/someone/onedrive/dokumente/plenio/songs/A [s-2]/takes/1/A - Take 1.FLAC"));
    CHECK (isLibraryAudio (library / "", inLibrary ("1/daw/Night Drive - Click.wav")));
    CHECK_FALSE (isLibraryAudio (library, inLibrary ("1/daw/Night Drive - Take 1.mid")));
    CHECK_FALSE (isLibraryAudio (library, "C:/Users/someone/OneDrive/Dokumente/Plenio/Songs2/A - Take 1.wav"));
    CHECK_FALSE (isLibraryAudio (library, "D:/Elsewhere/Night Drive - Take 1.wav"));
    CHECK_FALSE (isLibraryAudio (library, inLibrary ("1/daw.wav/notes")));
    CHECK_FALSE (isLibraryAudio (library, ""));
    CHECK_FALSE (isLibraryAudio (fs::path(), "C:/A - Take 1.wav"));
}
