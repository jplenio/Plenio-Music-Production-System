#include "core/session.h"
#include "core/library.h"
#include "core/log.h"
#include "core/paths.h"
#include "platform/main_thread.h"

#include <atomic>
#include <chrono>
#include <mutex>
#include <set>
#include <thread>

namespace plenio::core
{
namespace fs = std::filesystem;

struct SongSession::Shared
{
    SongSession* session = nullptr; // main thread only; null once the session is gone
    std::shared_ptr<Studio> studio;
    std::atomic<bool> cancelled { false };
    std::mutex lock;
    std::set<std::string> followed; // job ids a worker follows now
};

struct SongSession::RunInput
{
    std::string songId;
    std::string title;
    std::string templateId;
    SongKind kind = SongKind::song;
    std::string group;
    int takes = 1;
    bool stems = true;
    int firstNumber = 1;
    Plan plan;
    std::vector<score::Part> editedParts;
    std::string scoreMidi;
    std::optional<score::Score> working;
    std::string sourceUpload;
    fs::path sourceFile;
    fs::path songFolder;
    std::string what;
};

namespace
{
std::int64_t secondsNow()
{
    return std::chrono::duration_cast<std::chrono::seconds> (std::chrono::system_clock::now().time_since_epoch()).count();
}

/// Runs `fn` with the session on the main thread, if it still lives then.
template <typename SharedPtr, typename Fn>
void toSession (const SharedPtr& shared, Fn fn)
{
    platform::postToMainThread ([shared, fn = std::move (fn)]() mutable
    {
        if (shared->session != nullptr)
            fn (*shared->session);
    });
}

std::string mimeOf (const fs::path& file)
{
    auto ext = paths::toUtf8 (file.extension());
    for (auto& c : ext)
        c = static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
    if (ext == ".mp3") return "audio/mpeg";
    if (ext == ".flac") return "audio/flac";
    if (ext == ".wav") return "audio/wav";
    if (ext == ".ogg" || ext == ".oga") return "audio/ogg";
    if (ext == ".m4a" || ext == ".aac") return "audio/mp4";
    if (ext == ".aif" || ext == ".aiff") return "audio/aiff";
    return "application/octet-stream";
}

Json documentsJson (const std::map<std::string, std::string>& docs)
{
    Json j = Json::object();
    for (const auto& [k, v] : docs)
        if (! v.empty())
            j[k] = v;
    return j;
}

const ApiError& errorOf (const Result<Json>& r) { return std::get<ApiError> (r); }
const Json& valueOf (const Result<Json>& r) { return std::get<Json> (r); }

std::optional<timeline::BarMap> barsFrom (const Json& answer)
{
    const auto& b = json::obj (answer, "bars");
    if (b.empty())
        return std::nullopt;
    timeline::BarMap bars;
    for (const auto& v : json::arr (b, "score"))
        if (v.is_number())
            bars.score.push_back (v.get<double>());
    for (const auto& v : json::arr (b, "audio"))
        if (v.is_number())
            bars.audio.push_back (v.get<double>());
    for (const auto& m : json::arr (b, "meters"))
        if (m.is_array() && m.size() == 2 && m[0].is_number_integer() && m[1].is_number_integer())
            bars.meters.push_back ({ m[0].get<int>(), m[1].get<int>() });
    if (! bars.usable())
        return std::nullopt;
    return bars;
}

std::string trimmed (std::string s)
{
    const char* space = " \t\r\n";
    s.erase (0, s.find_first_not_of (space));
    auto end = s.find_last_not_of (space);
    s.erase (end == std::string::npos ? 0 : end + 1);
    return s;
}

/// A release title without the number Plenio's naming adds when the title is in its folder already
/// ("Night Drive (2)" -> "Night Drive").
std::string withoutCollisionNumber (const std::string& title)
{
    auto open = title.rfind (" (");
    if (open == std::string::npos || open == 0 || title.size() < open + 4 || title.back() != ')')
        return title;
    for (auto i = open + 2; i + 1 < title.size(); ++i)
        if (title[i] < '0' || title[i] > '9')
            return title;
    return title.substr (0, open);
}

/// Fetches a finished job's files into the take's folder and makes the take of them.
std::optional<Take> deliver (const PlenioClient& client, const Connection& connection, const record::Job& job,
                             const fs::path& songFolder, int number, const std::string& fallbackTitle,
                             const std::string& what, const Json& fields, std::string& problem)
{
    auto folder = Library::takeFolder (songFolder, number);
    std::error_code ec;
    fs::create_directories (folder / "stems", ec);
    auto relative = [&] (const fs::path& p) { return paths::toUtf8 (fs::relative (p, songFolder, ec)); };
    auto title = job.title.empty() ? fallbackTitle : withoutCollisionNumber (job.title);
    auto base = paths::safeName (title.empty() ? std::string ("Song") : title, 60) + " - Take " + std::to_string (number);

    Take take;
    take.number = number;
    take.job = job.id;
    take.created = secondsNow();
    take.title = title;
    take.what = what;
    take.fields = fields;
    take.fields.erase ("source.audio");
    take.seeds = job.seeds;

    auto fetch = [&] (const record::File& f, const fs::path& target) -> bool
    {
        if (auto e = client.download (f.url, target))
        {
            problem = "The take's file " + f.name + " did not arrive: " + e->text();
            return false;
        }
        return true;
    };

    const record::File* song = nullptr;
    for (const auto& f : job.files)
        if (f.role.empty())
        {
            song = &f;
            break;
        }
    if (song == nullptr)
    {
        problem = "The take came without its audio.";
        return std::nullopt;
    }
    auto ext = paths::fromUtf8 (song->name).extension();
    auto songFile = folder / paths::fromUtf8 (base + paths::toUtf8 (ext));
    if (! fetch (*song, songFile))
        return std::nullopt;
    take.files["song"] = relative (songFile);

    record::Record rec;
    if (const auto* r = job.file ("record"))
    {
        auto recordFile = folder / "record.plenio.json";
        if (fetch (*r, recordFile))
        {
            take.files["record"] = relative (recordFile);
            if (auto text = readFile (recordFile))
                if (auto parsed = json::parse (*text))
                    rec = record::parse (*parsed);
        }
    }
    for (const auto& f : job.files)
    {
        if (f.role == "subtitles" && f.name.find ("(lines)") != std::string::npos)
        {
            auto linesFile = folder / "lines.srt";
            if (fetch (f, linesFile))
                take.files["lines"] = relative (linesFile);
        }
        else if (f.role == "stem" && ! f.stem.empty())
        {
            auto stemFile = folder / "stems" / paths::fromUtf8 (base + " - " + paths::safeName (f.stem, 20) + ".flac");
            if (fetch (f, stemFile))
                take.stems.push_back ({ f.stem, relative (stemFile) });
        }
        else if (f.role == "stem_midi" && ! f.stem.empty())
        {
            auto midiFile = folder / "stems" / paths::fromUtf8 (base + " - " + paths::safeName (f.stem, 20) + ".mid");
            if (fetch (f, midiFile))
                take.files["stem_midi_" + paths::safeName (f.stem, 20)] = relative (midiFile);
        }
        else if (f.role == "cover")
        {
            // the cover art Plenio painted (finish.cover_art): a JPEG beside the take's audio
            auto coverExt = paths::fromUtf8 (f.name).extension();
            auto coverFile = folder / paths::fromUtf8 (base + (coverExt.empty() ? std::string (".jpg") : paths::toUtf8 (coverExt)));
            if (fetch (f, coverFile))
                take.files["cover_art"] = relative (coverFile);
            else
                log::warn ("take {}: {}", number, problem); // the take is whole without its cover
        }
    }

    take.documents = rec.documents;
    take.stars = rec.stars;
    take.quality = rec.quality;
    take.seconds = rec.seconds > 0 ? rec.seconds : job.seconds;
    take.sampleRate = rec.sampleRate;
    take.warp = rec.warp;
    take.lines = rec.lines;
    if (take.lines.empty() && take.files.count ("lines"))
        if (auto text = readFile (songFolder / paths::fromUtf8 (take.files["lines"])))
            take.lines = record::parseSrt (*text);
    // the song's title as the writer wrote it (the release title may carry a number against a namesake)
    if (auto doc = take.documents.find ("title"); doc != take.documents.end() && ! trimmed (doc->second).empty())
        take.title = trimmed (doc->second).substr (0, 200);
    else if (! rec.title.empty())
        take.title = withoutCollisionNumber (rec.title);

    // the score as Plenio's MIDI file: the notes to show, play and edit
    if (auto abc = take.documents.find ("score"); abc != take.documents.end() && ! abc->second.empty())
    {
        auto r = client.post (client.scorePath (true), { { "abc", abc->second }, { "title", take.title } }, {}, 60);
        if (ok (r))
        {
            auto data = json::str (valueOf (r), "data", {}, 16 * 1024 * 1024);
            auto bytes = base64Decode (data);
            if (! bytes.empty())
            {
                take.scoreMidi = data;
                writeFileAtomically (folder / "score.mid", std::string_view (reinterpret_cast<const char*> (bytes.data()), bytes.size()));
                take.files["midi"] = relative (folder / "score.mid");
            }
        }
        else
            log::warn ("take {}: the score's MIDI was not made: {}", number, errorOf (r).text());
    }

    // where every bar lies in the audio: the DAW's tempo map follows it
    if (connection.has ("bars"))
    {
        auto r = client.get (PlenioClient::jobPath (job.id) + "/bars", 60);
        if (ok (r))
        {
            const auto& answer = valueOf (r);
            writeFileAtomically (folder / "bars.json", answer.dump());
            take.files["bars"] = relative (folder / "bars.json");
            take.bars = barsFrom (answer);
            if (! take.warp)
                if (const auto& w = json::arr (answer, "warp"); w.size() == 2 && w[0].is_number() && w[1].is_number())
                    if (timeline::Warp warp { w[0].get<double>(), w[1].get<double>() }; warp.believable())
                        take.warp = warp;
        }
        else
            log::warn ("take {}: no bars: {}", number, errorOf (r).text());
    }
    return take;
}
} // namespace

SongSession::SongSession (std::shared_ptr<Studio> s) : studioRef (std::move (s)), shared (std::make_shared<Shared>())
{
    shared->session = this;
    shared->studio = studioRef;
    connectionListener = studioRef->listen ([this]
    {
        if (studioRef->connection().connected())
            resumeJobs();
    });
}

SongSession::~SongSession()
{
    studioRef->unlisten (connectionListener);
    shared->session = nullptr;
    shared->cancelled = true;
}

void SongSession::tell (const std::string& text, bool problem)
{
    if (problem)
        log::warn ("{}", text);
    else
        log::info ("{}", text);
    if (listen != nullptr)
        listen->tell (text, problem);
}

void SongSession::updateCover (bool findOlder)
{
    if (! song)
        return;
    auto library = studioRef->library();
    if (findOlder && library.findCovers (*song))
        library.save (*song);
    library.writeCover (*song);
}

void SongSession::changed (bool save)
{
    if (! song)
        return;
    song->modified = secondsNow();
    if (save)
        studioRef->library().save (*song);
    if (listen != nullptr)
        listen->songChanged();
}

bool SongSession::busy() const
{
    return song && ! song->jobs.empty();
}

void SongSession::newSong (const NewSong& request)
{
    Song s;
    s.id = newSongId();
    s.kind = request.kind;
    s.templateId = request.kind == SongKind::cover ? "yue2-cover" : "yue2-song";
    s.created = secondsNow();
    s.fields = request.fields;
    s.takesPerRun = std::clamp (request.takesPerRun, 1, 4);
    s.stems = request.stems;
    s.title = request.title.empty() ? (request.kind == SongKind::cover ? "New cover" : "New song") : request.title;
    if (! request.title.empty())
        s.documents["title"] = Doc { request.title, true };
    if (! request.lyrics.empty())
    {
        // one's own lyrics, sung as written (Song API 1.3: the brief's lyrics_from and lyrics)
        s.fields["lyrics_from"] = "my own, sung as written below";
        s.fields["lyrics"] = request.lyrics;
    }
    song = std::move (s);

    if (request.kind == SongKind::cover && ! request.sourceFile.empty())
    {
        // the recording becomes a file of the song: the cover can be made again later
        auto folder = studioRef->library().folderFor (*song);
        std::error_code ec;
        fs::create_directories (folder / "source", ec);
        auto target = folder / "source" / request.sourceFile.filename();
        fs::copy_file (request.sourceFile, target, fs::copy_options::overwrite_existing, ec);
        song->sourceFile = ec ? paths::toUtf8 (request.sourceFile) : paths::toUtf8 (fs::path ("source") / request.sourceFile.filename());
    }
    editedSinceRun = false;
    changed();
    generate (Mode::automatic);
}

void SongSession::generate (Mode mode)
{
    if (! song)
        return;
    if (! song->jobs.empty())
    {
        tell ("Takes of this song are being made already.", true);
        return;
    }
    auto connection = studioRef->connection();
    if (! connection.connected())
    {
        tell ("ComfyUI with Plenio is not running: start it to make takes. Everything else works as it is.", true);
        return;
    }

    RunInput in;
    in.songId = song->id;
    in.title = song->title;
    in.templateId = song->templateId;
    in.kind = song->kind;
    in.group = "r" + std::to_string (secondsNow());
    in.takes = song->takesPerRun;
    in.stems = song->stems;
    in.firstNumber = song->nextTakeNumber();
    in.plan = song->plan (mode);
    in.what = label (in.plan.what);
    if (in.plan.notesEdited)
    {
        if (song->edits.melody)
            in.editedParts.push_back (score::Part::melody);
        if (song->edits.instrument)
            in.editedParts.push_back (score::Part::instrument);
        if (song->edits.chords)
            in.editedParts.push_back (score::Part::chords);
        if (const auto* take = song->active())
            in.scoreMidi = take->scoreMidi;
        in.working = song->workingScore();
    }
    in.sourceUpload = song->sourceUpload;
    if (! song->sourceFile.empty())
        in.sourceFile = studioRef->library().resolve (*song, song->sourceFile);
    in.songFolder = studioRef->library().folderFor (*song);

    for (int i = 0; i < in.takes; ++i)
    {
        PendingJob job;
        job.group = in.group;
        job.index = i;
        job.number = in.firstNumber + i;
        job.what = in.what;
        job.submitted = secondsNow();
        job.status = "submitting";
        song->jobs.push_back (job);
    }
    shared->cancelled = false;
    editedSinceRun = false;
    changed();
    if (listen != nullptr)
        listen->jobsChanged();

    auto keep = shared;
    studioRef->run ([keep, in]() { runTakes (keep, in); });
    tell (song->title + ": " + in.what + (in.takes > 1 ? " (" + std::to_string (in.takes) + " takes)" : "") + ".");
}

void SongSession::runTakes (std::shared_ptr<Shared> shared, RunInput in)
{
    auto fail = [&] (const std::string& why)
    {
        toSession (shared, [group = in.group, why] (SongSession& s) { s.runFinished (group, why); });
    };
    auto client = shared->studio->client();
    if (! client)
        return fail ("ComfyUI with Plenio is not running.");
    auto connection = shared->studio->connection();
    Plan plan = in.plan;

    // the owner's notes and chords into Plenio's own score first
    if (plan.notesEdited && ! in.scoreMidi.empty() && in.working)
    {
        std::string error;
        auto spliced = score::splice (base64Decode (in.scoreMidi), *in.working, in.editedParts, &error);
        if (! spliced)
            return fail ("Your notes could not be put into the score: " + error);
        auto r = client->post (client->scorePath (false), { { "data", base64Encode (*spliced) }, { "chords", false } }, {}, 60);
        if (! ok (r))
            return fail ("Plenio could not read your notes: " + errorOf (r).text());
        auto abc = json::str (valueOf (r), "abc");
        if (abc.empty())
            return fail ("Plenio read no score from your notes.");
        plan.documents["score"] = abc;
        toSession (shared, [abc] (SongSession& s)
        {
            if (s.song)
                s.song->documents["score"] = Doc { abc, true };
        });
    }

    // a cover's recording goes into ComfyUI's input folder once
    if (in.kind == SongKind::cover)
    {
        auto upload = in.sourceUpload;
        if (upload.empty())
        {
            if (in.sourceFile.empty())
                return fail ("The cover has no recording.");
            auto name = paths::toUtf8 (in.sourceFile.filename());
            auto r = client->upload (client->api ("/uploads?name=" + encodeSegment (name)), in.sourceFile, mimeOf (in.sourceFile));
            if (! ok (r))
                return fail ("The recording could not be sent to Plenio: " + errorOf (r).text());
            upload = json::str (valueOf (r), "name", {}, 400);
            toSession (shared, [upload] (SongSession& s)
            {
                if (s.song)
                {
                    s.song->sourceUpload = upload;
                    s.changed();
                }
            });
        }
        plan.fields["source.audio"] = upload;
    }

    Json base = { { "template", in.templateId },
                  { "fields", plan.fields },
                  // the release as the plug-in needs it: FLAC and the sung lines, no song page, no sheet music, no MP3
                  // (the template's release fields: sheet_music is a choice, the others are switches)
                  { "release", { { "folder", "plenio-vst3" }, { "flac", true }, { "mp3", false }, { "wav", false }, { "song_page", false },
                                 { "sheet_music", "off" }, { "lyrics_srt", true } } },
                  { "client", { { "name", "Plenio VST3" }, { "song", in.songId } } },
                  { "strict", false } };
    if (in.stems && connection.has ("stems"))
        base["stems"] = true;
    // Song API v2 can stop a job for a review of its words: the plug-in's own way is to edit and generate again
    if (client->apiVersion() >= 2)
        base["review"] = Json::array();
    Json seeds = Json::object();
    for (const auto& [k, v] : plan.seeds)
        if (k != "take")
            seeds[k] = v;
    if (! seeds.empty())
        base["seeds"] = seeds;

    auto submit = [&] (int index, const std::map<std::string, std::string>& docs) -> std::optional<std::string>
    {
        if (shared->cancelled)
            return std::nullopt;
        Json body = base;
        if (auto d = documentsJson (docs); ! d.empty())
            body["documents"] = d;
        auto key = "plenio-vst3-" + in.songId + "-" + in.group + "-" + std::to_string (index);
        auto r = client->post (client->api ("/jobs"), body, key, 60);
        if (! ok (r))
        {
            fail ("Plenio did not take the song: " + errorOf (r).text());
            return std::nullopt;
        }
        auto job = record::parseJob (valueOf (r));
        if (! job)
        {
            fail ("Plenio's answer named no job.");
            return std::nullopt;
        }
        for (const auto& w : job->warnings)
            log::warn ("job {}: {}", job->id, w);
        toSession (shared, [group = in.group, index, id = job->id] (SongSession& s) { s.jobSubmitted (group, index, id); });
        return job->id;
    };

    // a new song's takes share the first take's words and notes: the first one writes and composes them
    const bool share = in.takes > 1 && ! (plan.documents.count ("lyrics") && plan.documents.count ("score"));
    std::vector<std::string> ids;
    auto first = submit (0, plan.documents);
    if (! first)
        return;
    ids.push_back (*first);
    if (share)
    {
        follow (shared, in, { *first }, 0);
        // the first take's documents, as its record has them
        std::map<std::string, std::string> docs;
        {
            auto text = readFile (Library::takeFolder (in.songFolder, in.firstNumber) / "record.plenio.json");
            if (auto parsed = text ? json::parse (*text) : std::nullopt)
                docs = record::parse (*parsed).documents;
        }
        if (docs.empty() || shared->cancelled)
            return fail (shared->cancelled ? "" : "The first take gave no words and notes for the others.");
        std::vector<std::string> rest;
        for (int i = 1; i < in.takes; ++i)
        {
            auto id = submit (i, docs);
            if (! id)
                return;
            rest.push_back (*id);
        }
        follow (shared, in, rest, 1);
    }
    else
    {
        for (int i = 1; i < in.takes; ++i)
        {
            auto id = submit (i, plan.documents);
            if (! id)
                return;
            ids.push_back (*id);
        }
        follow (shared, in, ids, 0);
    }
    toSession (shared, [group = in.group] (SongSession& s) { s.runFinished (group, ""); });
}

void SongSession::follow (std::shared_ptr<Shared> shared, RunInput in, std::vector<std::string> ids, int firstIndex)
{
    auto client = shared->studio->client();
    if (! client)
        return;
    for (std::size_t k = 0; k < ids.size(); ++k)
    {
        const auto& id = ids[k];
        const int index = firstIndex + static_cast<int> (k);
        {
            std::scoped_lock l (shared->lock);
            if (! shared->followed.insert (id).second)
                continue; // another worker follows it already
        }
        int misses = 0;
        for (;;)
        {
            if (shared->cancelled || shared->studio->stopping())
                break;
            auto r = client->get (PlenioClient::jobPath (id) + "?wait=5", 20);
            if (! ok (r))
            {
                const auto& e = errorOf (r);
                if (e.code == "cancelled")
                    break;
                if (e.status == 404)
                {
                    toSession (shared, [group = in.group, index] (SongSession& s)
                    {
                        s.runFinished (group, "ComfyUI no longer knows take " + std::to_string (index + 1) + " of the run (it was restarted).");
                    });
                    break;
                }
                if (++misses > 30)
                {
                    toSession (shared, [group = in.group, text = e.text()] (SongSession& s) { s.runFinished (group, text); });
                    break;
                }
                std::this_thread::sleep_for (std::chrono::seconds (2));
                continue;
            }
            misses = 0;
            auto job = record::parseJob (valueOf (r));
            if (! job)
                break;
            toSession (shared, [group = in.group, index, j = *job] (SongSession& s) { s.jobUpdate (group, index, j); });
            if (job->status == record::JobStatus::waiting)
            {
                // a job that stops for a review although none was asked for: it goes on as written
                auto approved = client->post (PlenioClient::jobPath (id) + "/approve", Json::object(), {}, 30);
                if (! ok (approved))
                    std::this_thread::sleep_for (std::chrono::seconds (2));
                continue;
            }
            if (! job->finished())
                continue;
            if (job->status == record::JobStatus::succeeded)
            {
                std::string problem;
                auto take = deliver (*client, shared->studio->connection(), *job, in.songFolder, in.firstNumber + index,
                                     in.title, in.what, in.plan.fields, problem);
                if (take)
                    toSession (shared, [group = in.group, index, t = std::move (*take)] (SongSession& s) mutable { s.addTake (std::move (t), group, index); });
                else
                    toSession (shared, [group = in.group, problem] (SongSession& s) { s.runFinished (group, problem); });
            }
            else if (job->status == record::JobStatus::failed)
            {
                // Song API v2 keeps a job across a restart of ComfyUI and says that the run was cut short
                const bool cut = job->errorCode == "interrupted" || job->errorCode == "lost";
                toSession (shared, [group = in.group, index, cut, error = job->error] (SongSession& s)
                {
                    s.runFinished (group, cut ? "ComfyUI stopped while take " + std::to_string (index + 1) + " was being made. Generate makes it again."
                                              : "Take " + std::to_string (index + 1) + " failed: " + error);
                });
            }
            break;
        }
        std::scoped_lock l (shared->lock);
        shared->followed.erase (id);
    }
}

void SongSession::jobSubmitted (const std::string& group, int index, const std::string& id)
{
    if (! song)
        return;
    for (auto& j : song->jobs)
        if (j.group == group && j.index == index)
        {
            j.id = id;
            j.status = "queued";
        }
    studioRef->library().save (*song); // a project closed now still gets its takes when it opens again
    if (listen != nullptr)
        listen->jobsChanged();
}

void SongSession::jobUpdate (const std::string& group, int index, const record::Job& job)
{
    if (! song)
        return;
    for (auto& j : song->jobs)
        if (j.group == group && j.index == index)
        {
            static const char* names[] = { "queued", "running", "succeeded", "failed", "cancelled", "unknown", "running" };
            j.status = names[static_cast<int> (job.status)];
            j.stage = job.stage;
            j.progress = job.progress.value_or (j.progress);
            j.queuePosition = job.queuePosition;
        }
    if (listen != nullptr)
        listen->jobsChanged();
}

void SongSession::addTake (Take take, const std::string& group, int index)
{
    // the session shows another song now: the take stays in its own song's folder (found again on opening it)
    auto belongsHere = song && std::any_of (song->jobs.begin(), song->jobs.end(),
                                            [&] (const PendingJob& j) { return j.group == group && j.index == index; });
    if (! belongsHere)
    {
        log::info ("take {} arrived for a song not open here: kept in the library", take.number);
        return;
    }

    song->jobs.erase (std::remove_if (song->jobs.begin(), song->jobs.end(),
                                      [&] (const PendingJob& j) { return j.group == group && j.index == index; }),
                      song->jobs.end());
    song->takes.push_back (std::move (take));
    const int added = static_cast<int> (song->takes.size()) - 1;
    const auto& t = song->takes.back();

    // the first take of a run plays at once, unless the owner changed something meanwhile
    const bool firstOfRun = runsWithTake.insert (group).second;
    const bool adopted = (firstOfRun || song->activeTake < 0) && ! editedSinceRun;
    if (adopted)
        song->adopt (added);
    // the run is over: the folder gets the song's title (before anything reads from it again)
    if (song->jobs.empty())
        studioRef->library().tidy (*song);
    updateCover (true); // a cover the job did not hand over as a file of its own is still in the take's FLAC
    if (adopted && listen != nullptr)
        listen->activeTakeChanged();
    tell (t.label() + " of " + song->title + " is here.");
    changed();
    if (listen != nullptr)
        listen->jobsChanged();
}

void SongSession::runFinished (const std::string& group, const std::string& problem)
{
    if (! song)
        return;
    if (! problem.empty())
    {
        // the run stops: what was not made is no longer waited for
        song->jobs.erase (std::remove_if (song->jobs.begin(), song->jobs.end(),
                                          [&] (const PendingJob& j) { return j.group == group && (j.id.empty() || j.status == "failed"); }),
                          song->jobs.end());
        tell (problem, true);
    }
    else
    {
        // jobs that never delivered (cancelled) leave the list
        song->jobs.erase (std::remove_if (song->jobs.begin(), song->jobs.end(), [&] (const PendingJob& j) { return j.group == group; }),
                          song->jobs.end());
    }
    changed();
    if (listen != nullptr)
        listen->jobsChanged();
}

void SongSession::cancel()
{
    if (! song || song->jobs.empty())
        return;
    shared->cancelled = true;
    std::vector<std::string> ids;
    for (const auto& j : song->jobs)
        if (! j.id.empty())
            ids.push_back (j.id);
    song->jobs.clear();
    if (auto client = studioRef->client())
        studioRef->run ([c = *client, ids]
        {
            for (const auto& id : ids)
                c.del (PlenioClient::jobPath (id), 10);
        });
    tell ("The takes being made were cancelled.");
    changed();
    if (listen != nullptr)
        listen->jobsChanged();
}

void SongSession::resumeJobs()
{
    if (! song)
        return;
    // jobs a project left running: their takes are fetched now (ComfyUI made them while the project was closed)
    std::map<std::string, std::vector<PendingJob>> byGroup;
    for (const auto& j : song->jobs)
        if (! j.id.empty())
            byGroup[j.group].push_back (j);
    for (auto& [group, jobs] : byGroup)
    {
        for (const auto& j : jobs)
        {
            {
                std::scoped_lock l (shared->lock);
                if (shared->followed.count (j.id))
                    continue;
            }
            RunInput in;
            in.songId = song->id;
            in.title = song->title;
            in.group = group;
            in.firstNumber = j.number - j.index;
            in.what = j.what;
            in.plan.fields = song->fields;
            in.songFolder = studioRef->library().folderFor (*song);
            auto keep = shared;
            studioRef->run ([keep, in, id = j.id, index = j.index] { follow (keep, in, { id }, index); });
        }
    }
}

void SongSession::selectTake (int index)
{
    if (! song || index < 0 || index >= static_cast<int> (song->takes.size()) || index == song->activeTake)
        return;
    if (! song->changes().empty())
        log::info ("take {} chosen: the working copy's changes give way to its documents", index);
    song->adopt (index);
    updateCover();
    changed();
    if (listen != nullptr)
        listen->activeTakeChanged();
}

void SongSession::deleteTake (int index)
{
    if (! song || index < 0 || index >= static_cast<int> (song->takes.size()))
        return;
    // the files stay in the library's folder (a deleted take can be found there); only the song forgets it
    song->takes.erase (song->takes.begin() + index);
    if (song->activeTake == index)
    {
        song->activeTake = -1;
        if (! song->takes.empty())
            song->adopt (std::min (index, static_cast<int> (song->takes.size()) - 1));
        if (listen != nullptr)
            listen->activeTakeChanged();
    }
    else if (song->activeTake > index)
        --song->activeTake;
    updateCover();
    changed();
}

void SongSession::setFields (const Json& fields)
{
    if (! song || ! fields.is_object())
        return;
    for (const auto& [k, v] : fields.items())
    {
        if (v.is_null())
            song->fields.erase (k);
        else
            song->fields[k] = v;
    }
    editedSinceRun = true;
    changed();
}

void SongSession::setDocument (const std::string& kind, const std::string& text)
{
    if (! song)
        return;
    song->documents[kind] = Doc { text, true };
    if (kind == "title" && ! text.empty())
        song->title = text;
    editedSinceRun = true;
    changed();
}

void SongSession::resetDocument (const std::string& kind)
{
    if (! song)
        return;
    if (const auto* take = song->active(); take != nullptr && take->documents.count (kind))
        song->documents[kind] = Doc { take->documents.at (kind), false };
    else
        song->documents.erase (kind);
    changed();
}

void SongSession::setNotes (score::Part part, std::vector<midi::Note> notes)
{
    if (! song)
        return;
    if (part == score::Part::melody)
        song->edits.melody = std::move (notes);
    else if (part == score::Part::instrument)
        song->edits.instrument = std::move (notes);
    editedSinceRun = true;
    changed();
}

void SongSession::setChords (std::vector<score::ChordSymbol> chords)
{
    if (! song)
        return;
    song->edits.chords = std::move (chords);
    editedSinceRun = true;
    changed();
}

void SongSession::resetEdits()
{
    if (! song)
        return;
    song->edits = {};
    changed();
}

void SongSession::setTakesPerRun (int count)
{
    if (! song)
        return;
    song->takesPerRun = std::clamp (count, 1, 4);
    auto s = studioRef->settings();
    s.takesPerRun = song->takesPerRun;
    studioRef->setSettings (s);
    changed();
}

void SongSession::setStems (bool on)
{
    if (! song)
        return;
    song->stems = on;
    auto s = studioRef->settings();
    s.stems = on;
    studioRef->setSettings (s);
    changed();
}

void SongSession::rename (const std::string& title)
{
    if (! song || title.empty())
        return;
    song->title = title.substr (0, 200);
    song->documents["title"] = Doc { song->title, true };
    if (song->jobs.empty())
        studioRef->library().tidy (*song);
    changed();
}

bool SongSession::open (const std::string& id)
{
    auto loaded = studioRef->library().load (id);
    if (! loaded)
    {
        tell ("The song is not in the library.", true);
        return false;
    }
    song = std::move (*loaded);
    editedSinceRun = false;
    updateCover (true);
    changed (false);
    if (listen != nullptr)
        listen->activeTakeChanged();
    resumeJobs();
    return true;
}

void SongSession::close()
{
    song.reset();
    if (listen != nullptr)
    {
        listen->songChanged();
        listen->activeTakeChanged();
    }
}

Json SongSession::snapshot() const
{
    if (! song)
        return nullptr;
    return toJson (*song);
}

void SongSession::restore (const Json& state)
{
    if (! state.is_object())
    {
        song.reset();
        return;
    }
    auto fromProject = songFromJson (state);
    // the library may know more (takes that arrived after the project was saved): the newer one wins
    if (auto fromLibrary = studioRef->library().load (fromProject.id); fromLibrary && fromLibrary->modified > fromProject.modified)
        song = std::move (*fromLibrary);
    else
    {
        song = std::move (fromProject);
        studioRef->library().save (*song); // a project from another computer brings its song (without audio) along
    }
    // jobs that were still being submitted when the project was saved cannot be followed
    song->jobs.erase (std::remove_if (song->jobs.begin(), song->jobs.end(), [] (const PendingJob& j) { return j.id.empty(); }),
                      song->jobs.end());
    editedSinceRun = false;
    updateCover (true);
    if (listen != nullptr)
    {
        listen->songChanged();
        listen->activeTakeChanged();
    }
    if (studioRef->connection().connected())
        resumeJobs();
}

fs::path SongSession::songFolder() const
{
    return song ? studioRef->library().folderFor (*song) : fs::path();
}

std::optional<fs::path> SongSession::takeAudio (int index) const
{
    if (! song || index < 0 || index >= static_cast<int> (song->takes.size()))
        return std::nullopt;
    const auto& take = song->takes[static_cast<std::size_t> (index)];
    auto it = take.files.find ("song");
    if (it == take.files.end())
        return std::nullopt;
    auto path = studioRef->library().resolve (*song, it->second);
    std::error_code ec;
    return fs::exists (path, ec) ? std::optional<fs::path> (path) : std::nullopt;
}

std::vector<std::pair<std::string, fs::path>> SongSession::takeStems (int index) const
{
    std::vector<std::pair<std::string, fs::path>> out;
    if (! song || index < 0 || index >= static_cast<int> (song->takes.size()))
        return out;
    for (const auto& s : song->takes[static_cast<std::size_t> (index)].stems)
    {
        auto path = studioRef->library().resolve (*song, s.file);
        std::error_code ec;
        if (fs::exists (path, ec))
            out.push_back ({ s.name, path });
    }
    return out;
}

} // namespace plenio::core
