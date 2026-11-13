#include "core/song.h"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <random>

namespace plenio::core
{
namespace
{
constexpr std::size_t maxDocumentChars = json::maxText;
constexpr std::size_t maxFields = 256;
constexpr std::size_t maxNotes = 200'000;
constexpr std::size_t maxJobs = 16;

std::string capped (std::string s, std::size_t limit = maxDocumentChars)
{
    if (s.size() > limit)
    {
        auto cut = limit;
        while (cut > 0 && (static_cast<unsigned char> (s[cut]) & 0xC0) == 0x80)
            --cut;
        s.resize (cut);
    }
    return s;
}

Json notesToJson (const std::vector<midi::Note>& notes)
{
    Json out = Json::array();
    for (const auto& n : notes)
        out.push_back ({ n.tick, n.length, n.pitch, n.velocity });
    return out;
}

std::vector<midi::Note> notesFromJson (const Json& j, int channel)
{
    std::vector<midi::Note> out;
    if (! j.is_array())
        return out;
    for (const auto& n : j)
    {
        if (out.size() >= maxNotes)
            break;
        if (! n.is_array() || n.size() < 3 || ! n[0].is_number_integer() || ! n[1].is_number_integer() || ! n[2].is_number_integer())
            continue;
        auto tick = n[0].get<std::int64_t>(), length = n[1].get<std::int64_t>();
        auto pitch = n[2].get<std::int64_t>();
        auto velocity = n.size() > 3 && n[3].is_number_integer() ? n[3].get<std::int64_t>() : 90;
        if (tick < 0 || tick > (std::int64_t (1) << 40) || length <= 0 || length > (std::int64_t (1) << 32) || pitch < 0 || pitch > 127)
            continue;
        out.push_back ({ tick, length, static_cast<int> (pitch), static_cast<int> (std::clamp<std::int64_t> (velocity, 1, 127)), channel });
    }
    std::sort (out.begin(), out.end(), [] (const midi::Note& a, const midi::Note& b) { return a.tick != b.tick ? a.tick < b.tick : a.pitch < b.pitch; });
    return out;
}

Json chordsToJson (const std::vector<score::ChordSymbol>& chords)
{
    Json out = Json::array();
    for (const auto& c : chords)
        out.push_back ({ c.tick, c.name });
    return out;
}

std::vector<score::ChordSymbol> chordsFromJson (const Json& j)
{
    std::vector<score::ChordSymbol> out;
    if (! j.is_array())
        return out;
    for (const auto& c : j)
        if (c.is_array() && c.size() >= 2 && c[0].is_number_integer() && c[1].is_string() && c[0].get<std::int64_t>() >= 0 && out.size() < 20000)
            out.push_back ({ c[0].get<std::int64_t>(), capped (c[1].get<std::string>(), 40) });
    std::sort (out.begin(), out.end(), [] (const score::ChordSymbol& a, const score::ChordSymbol& b) { return a.tick < b.tick; });
    return out;
}

Json seedsToJson (const std::map<std::string, std::uint64_t>& seeds)
{
    Json out = Json::object();
    for (const auto& [k, v] : seeds)
        out[k] = v;
    return out;
}

std::map<std::string, std::uint64_t> seedsFromJson (const Json& j)
{
    std::map<std::string, std::uint64_t> out;
    if (! j.is_object())
        return out;
    for (const auto& [k, v] : j.items())
        if (out.size() < 16 && k.size() <= 32 && (v.is_number_unsigned() || (v.is_number_integer() && v.get<std::int64_t>() >= 0)))
            out[k] = v.get<std::uint64_t>() & 0xFFFFFFFFull;
    return out;
}

Json fieldsSanitised (const Json& j)
{
    Json out = Json::object();
    if (! j.is_object())
        return out;
    for (const auto& [k, v] : j.items())
    {
        if (out.size() >= maxFields || k.size() > 128)
            continue;
        if (v.is_string())
            out[k] = capped (v.get<std::string>(), 4000);
        else if (v.is_number() || v.is_boolean())
            out[k] = v;
    }
    return out;
}

bool sameFields (const Json& a, const Json& b)
{
    return fieldsSanitised (a) == fieldsSanitised (b);
}
} // namespace

const char* label (What what)
{
    switch (what)
    {
        case What::newSong: return "write, compose and render the song";
        case What::newTake: return "render a new take of the same song";
        case What::singYourNotes: return "render a take of your notes";
        case What::recompose: return "compose new notes for the words, then render";
        case What::rewrite: return "write the song anew from the brief, then render";
    }
    return "";
}

std::optional<score::Score> Take::score() const
{
    if (scoreMidi.empty())
        return std::nullopt;
    auto bytes = base64Decode (scoreMidi);
    return score::parse (bytes);
}

timeline::TakeTiming Take::timing() const
{
    timeline::TakeTiming t;
    if (auto s = score())
    {
        t.scoreBpm = s->bpm;
        auto starts = s->measureStarts();
        std::size_t m = 0;
        for (std::size_t i = 0; i + 1 < starts.size(); ++i)
        {
            while (m + 1 < s->meters.size() && s->meters[m + 1].tick <= starts[i])
                ++m;
            t.meters.push_back ({ s->meters[m].numerator, s->meters[m].denominator });
        }
    }
    t.bars = bars;
    t.warp = warp;
    return t;
}

std::string Take::label() const
{
    std::string text = "Take " + std::to_string (number);
    if (stars)
    {
        auto v = *stars;
        auto shown = std::abs (v - std::round (v)) < 1e-6 ? std::to_string (static_cast<int> (std::round (v)))
                                                          : std::to_string (v).substr (0, 3);
        text += " \xC2\xB7 " + shown + " stars";
    }
    return text;
}

const Take* Song::active() const
{
    return activeTake >= 0 && activeTake < static_cast<int> (takes.size()) ? &takes[static_cast<std::size_t> (activeTake)] : nullptr;
}

Take* Song::active()
{
    return activeTake >= 0 && activeTake < static_cast<int> (takes.size()) ? &takes[static_cast<std::size_t> (activeTake)] : nullptr;
}

int Song::nextTakeNumber() const
{
    int n = 0;
    for (const auto& t : takes)
        n = std::max (n, t.number);
    return n + 1;
}

std::vector<std::string> Song::changes() const
{
    std::vector<std::string> out;
    const auto* take = active();
    if (take == nullptr)
        return out;
    if (! sameFields (fields, take->fields))
        out.push_back ("brief");
    for (const auto& docKind : record::documentKinds())
    {
        auto it = documents.find (docKind);
        if (it == documents.end() || ! it->second.manual)
            continue;
        auto made = take->documents.find (docKind);
        if (made == take->documents.end() || made->second != it->second.text)
            out.push_back (docKind == "artwork_prompt" ? "artwork prompt" : docKind);
    }
    if (edits.melody || edits.instrument)
        out.push_back ("notes");
    if (edits.chords)
        out.push_back ("chords");
    return out;
}

Plan Song::plan (Mode mode) const
{
    Plan plan;
    plan.fields = fieldsSanitised (fields);
    if (kind == SongKind::cover && ! sourceUpload.empty())
        plan.fields["source.audio"] = sourceUpload;
    plan.seeds = seeds;

    std::map<std::string, std::string> manual;
    for (const auto& [kind_, doc] : documents)
        if (doc.manual && ! doc.text.empty())
            manual[kind_] = doc.text;

    const auto* take = active();
    if (take == nullptr)
    {
        plan.what = What::newSong;
        plan.documents = manual;
        return plan;
    }

    auto changed = changes();
    auto has = [&] (const char* what) { return std::find (changed.begin(), changed.end(), what) != changed.end(); };
    const bool briefChanged = has ("brief");
    const bool wordsChanged = has ("title") || has ("style") || has ("lyrics");
    const bool notesEdited = edits.any();
    const bool scoreWritten = manual.count ("score") > 0 || notesEdited;

    switch (mode)
    {
        case Mode::rewrite: plan.what = What::rewrite; break;
        case Mode::recompose: plan.what = What::recompose; break;
        case Mode::newTake: plan.what = What::newTake; break;
        case Mode::automatic:
            if (briefChanged)
                plan.what = What::rewrite;
            else if (wordsChanged && ! scoreWritten)
                plan.what = What::recompose;
            else if (scoreWritten && (notesEdited || has ("score")))
                plan.what = What::singYourNotes;
            else
                plan.what = What::newTake;
            break;
    }

    // the take's documents, the owner's over them, then out with what an edit made stale
    plan.documents = take->documents;
    for (const auto& [k, v] : manual)
        plan.documents[k] = v;
    switch (plan.what)
    {
        case What::rewrite:
            plan.documents = manual;
            plan.documents.erase ("score");
            break;
        case What::recompose:
            plan.documents.erase ("score"); // the notes are being replaced on purpose, or were written for other words
            break;
        case What::newTake:
            if (wordsChanged && ! scoreWritten)
                plan.documents.erase ("score"); // the same notes would not fit the changed words
            break;
        default:
            break;
    }
    plan.notesEdited = notesEdited && (plan.what == What::singYourNotes || plan.what == What::newTake);
    for (auto it = plan.documents.begin(); it != plan.documents.end();)
        it = it->second.empty() ? plan.documents.erase (it) : std::next (it);
    return plan;
}

void Song::adopt (int index)
{
    if (index < 0 || index >= static_cast<int> (takes.size()))
        return;
    const auto& take = takes[static_cast<std::size_t> (index)];
    documents.clear();
    for (const auto& [k, v] : take.documents)
        documents[k] = Doc { v, false };
    fields = take.fields;
    if (! take.title.empty())
        title = take.title;
    edits = {};
    activeTake = index;
}

std::optional<score::Score> Song::workingScore() const
{
    const auto* take = active();
    if (take == nullptr)
        return std::nullopt;
    auto s = take->score();
    if (! s)
        return std::nullopt;
    if (edits.melody)
        s->melody = *edits.melody;
    if (edits.instrument)
        s->instrument = *edits.instrument;
    if (edits.chords)
    {
        s->chords = *edits.chords;
        s->chordNotes = score::voicings (s->chords, s->endTick);
    }
    return s;
}

std::string newSongId()
{
    static std::mt19937_64 rng { std::random_device {}() ^ static_cast<std::uint64_t> (std::chrono::steady_clock::now().time_since_epoch().count()) };
    auto now = static_cast<std::uint64_t> (std::chrono::duration_cast<std::chrono::seconds> (std::chrono::system_clock::now().time_since_epoch()).count());
    auto value = (now << 24) ^ (rng() & 0xFFFFFF);
    char text[32];
    std::snprintf (text, sizeof (text), "s-%012llx", static_cast<unsigned long long> (value & 0xFFFFFFFFFFFFull));
    return text;
}

Json toJson (const Take& t)
{
    Json j;
    j["number"] = t.number;
    j["job"] = t.job;
    j["created"] = t.created;
    j["title"] = t.title;
    j["what"] = t.what;
    j["fields"] = t.fields;
    j["seeds"] = seedsToJson (t.seeds);
    j["documents"] = t.documents;
    if (t.stars)
        j["stars"] = *t.stars;
    j["quality"] = t.quality;
    j["seconds"] = t.seconds;
    j["sample_rate"] = t.sampleRate;
    j["files"] = t.files;
    Json stems = Json::array();
    for (const auto& s : t.stems)
        stems.push_back ({ { "name", s.name }, { "file", s.file } });
    j["stems"] = stems;
    if (t.warp)
        j["warp"] = { t.warp->a, t.warp->b };
    if (t.bars)
    {
        Json meters = Json::array();
        for (auto [n, d] : t.bars->meters)
            meters.push_back ({ n, d });
        j["bars"] = { { "score", t.bars->score }, { "audio", t.bars->audio }, { "meters", meters } };
    }
    Json lines = Json::array();
    for (const auto& l : t.lines)
        lines.push_back ({ { "start", l.start }, { "end", l.end }, { "text", l.text } });
    j["lines"] = lines;
    j["score_midi"] = t.scoreMidi;
    return j;
}

Take takeFromJson (const Json& j)
{
    Take t;
    t.number = static_cast<int> (std::clamp<std::int64_t> (json::integer (j, "number", 0), 0, 100000));
    t.job = json::str (j, "job", {}, 128);
    t.created = json::integer (j, "created", 0);
    t.title = json::str (j, "title", {}, 400);
    t.what = json::str (j, "what", {}, 200);
    t.fields = fieldsSanitised (json::obj (j, "fields"));
    t.seeds = seedsFromJson (json::obj (j, "seeds"));
    for (const auto& kind : record::documentKinds())
        if (auto text = json::str (json::obj (j, "documents"), kind); ! text.empty())
            t.documents[kind] = text;
    if (auto stars = json::num (j, "stars"))
        t.stars = std::clamp (*stars, 0.0, 5.0);
    t.quality = json::obj (j, "quality");
    t.seconds = std::max (0.0, json::num (j, "seconds", 0.0));
    t.sampleRate = static_cast<int> (std::clamp<std::int64_t> (json::integer (j, "sample_rate", 0), 0, 768000));
    for (const auto& [k, v] : json::obj (j, "files").items())
        if (v.is_string() && k.size() <= 32 && t.files.size() < 32)
            t.files[k] = capped (v.get<std::string>(), 1000);
    for (const auto& s : json::arr (j, "stems"))
        if (auto name = json::str (s, "name", {}, 40), file = json::str (s, "file", {}, 1000); ! name.empty() && ! file.empty() && t.stems.size() < 8)
            t.stems.push_back ({ name, file });
    if (const auto& w = json::arr (j, "warp"); w.size() == 2 && w[0].is_number() && w[1].is_number())
    {
        timeline::Warp warp { w[0].get<double>(), w[1].get<double>() };
        if (warp.believable())
            t.warp = warp;
    }
    if (const auto& b = json::obj (j, "bars"); ! b.empty())
    {
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
        if (bars.usable())
            t.bars = bars;
    }
    for (const auto& l : json::arr (j, "lines"))
    {
        auto start = json::num (l, "start"), end = json::num (l, "end");
        if (start && end && *start >= 0 && *end >= *start && t.lines.size() < 20000)
            t.lines.push_back ({ *start, *end, json::str (l, "text", {}, 2000) });
    }
    t.scoreMidi = json::str (j, "score_midi", {}, 16 * 1024 * 1024);
    return t;
}

Json toJson (const Song& s)
{
    Json j;
    j["schema"] = "plenio-vst3.song/1";
    j["id"] = s.id;
    j["title"] = s.title;
    j["kind"] = s.kind == SongKind::cover ? "cover" : "song";
    j["template"] = s.templateId;
    j["created"] = s.created;
    j["modified"] = s.modified;
    j["fields"] = s.fields;
    j["seeds"] = seedsToJson (s.seeds);
    Json docs = Json::object();
    for (const auto& [k, d] : s.documents)
        docs[k] = { { "text", d.text }, { "state", d.manual ? "manual" : "auto" } };
    j["documents"] = docs;
    j["source"] = { { "upload", s.sourceUpload }, { "file", s.sourceFile } };
    j["takes_per_run"] = s.takesPerRun;
    j["stems"] = s.stems;
    Json edits = Json::object();
    if (s.edits.melody)
        edits["melody"] = notesToJson (*s.edits.melody);
    if (s.edits.instrument)
        edits["instrument"] = notesToJson (*s.edits.instrument);
    if (s.edits.chords)
        edits["chords"] = chordsToJson (*s.edits.chords);
    j["edits"] = edits;
    Json takes = Json::array();
    for (const auto& t : s.takes)
        takes.push_back (toJson (t));
    j["takes"] = takes;
    j["active_take"] = s.activeTake;
    Json jobs = Json::array();
    for (const auto& p : s.jobs)
        jobs.push_back ({ { "id", p.id }, { "group", p.group }, { "index", p.index }, { "number", p.number }, { "what", p.what },
                          { "submitted", p.submitted }, { "status", p.status }, { "stage", p.stage }, { "progress", p.progress } });
    j["jobs"] = jobs;
    return j;
}

Song songFromJson (const Json& j)
{
    Song s;
    s.id = json::str (j, "id", {}, 64);
    if (s.id.empty())
        s.id = newSongId();
    s.title = json::str (j, "title", {}, 400);
    s.kind = json::str (j, "kind") == "cover" ? SongKind::cover : SongKind::song;
    s.templateId = json::str (j, "template", s.kind == SongKind::cover ? "yue2-cover" : "yue2-song", 64);
    s.created = json::integer (j, "created", 0);
    s.modified = json::integer (j, "modified", 0);
    s.fields = fieldsSanitised (json::obj (j, "fields"));
    s.seeds = seedsFromJson (json::obj (j, "seeds"));
    for (const auto& kind : record::documentKinds())
    {
        const auto& d = json::obj (json::obj (j, "documents"), kind);
        if (! d.empty())
            s.documents[kind] = Doc { json::str (d, "text"), json::str (d, "state") == "manual" };
    }
    const auto& source = json::obj (j, "source");
    s.sourceUpload = json::str (source, "upload", {}, 400);
    s.sourceFile = json::str (source, "file", {}, 1000);
    s.takesPerRun = static_cast<int> (std::clamp<std::int64_t> (json::integer (j, "takes_per_run", 1), 1, 4));
    s.stems = json::boolean (j, "stems", true);
    const auto& edits = json::obj (j, "edits");
    if (auto* m = json::find (edits, "melody"))
        s.edits.melody = notesFromJson (*m, 0);
    if (auto* m = json::find (edits, "instrument"))
        s.edits.instrument = notesFromJson (*m, 1);
    if (auto* c = json::find (edits, "chords"))
        s.edits.chords = chordsFromJson (*c);
    for (const auto& t : json::arr (j, "takes"))
        if (s.takes.size() < maxTakes)
            s.takes.push_back (takeFromJson (t));
    s.activeTake = static_cast<int> (json::integer (j, "active_take", s.takes.empty() ? -1 : 0));
    if (s.activeTake >= static_cast<int> (s.takes.size()))
        s.activeTake = static_cast<int> (s.takes.size()) - 1;
    for (const auto& p : json::arr (j, "jobs"))
    {
        if (s.jobs.size() >= maxJobs)
            break;
        PendingJob job;
        job.id = json::str (p, "id", {}, 128);
        job.group = json::str (p, "group", {}, 64);
        job.index = static_cast<int> (std::clamp<std::int64_t> (json::integer (p, "index", 0), 0, 16));
        job.number = static_cast<int> (std::clamp<std::int64_t> (json::integer (p, "number", 0), 0, 100000));
        job.what = json::str (p, "what", {}, 200);
        job.submitted = json::integer (p, "submitted", 0);
        job.status = json::str (p, "status", {}, 40);
        job.stage = json::str (p, "stage", {}, 200);
        job.progress = std::clamp (json::num (p, "progress", 0.0), 0.0, 1.0);
        s.jobs.push_back (job);
    }
    return s;
}

std::string base64Encode (const std::vector<std::uint8_t>& bytes)
{
    static const char* table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string out;
    out.reserve ((bytes.size() + 2) / 3 * 4);
    std::size_t i = 0;
    for (; i + 2 < bytes.size(); i += 3)
    {
        std::uint32_t v = (std::uint32_t (bytes[i]) << 16) | (std::uint32_t (bytes[i + 1]) << 8) | bytes[i + 2];
        out += table[(v >> 18) & 63];
        out += table[(v >> 12) & 63];
        out += table[(v >> 6) & 63];
        out += table[v & 63];
    }
    if (i < bytes.size())
    {
        std::uint32_t v = std::uint32_t (bytes[i]) << 16;
        if (i + 1 < bytes.size())
            v |= std::uint32_t (bytes[i + 1]) << 8;
        out += table[(v >> 18) & 63];
        out += table[(v >> 12) & 63];
        out += i + 1 < bytes.size() ? table[(v >> 6) & 63] : '=';
        out += '=';
    }
    return out;
}

std::vector<std::uint8_t> base64Decode (std::string_view text)
{
    auto value = [] (char c) -> int
    {
        if (c >= 'A' && c <= 'Z') return c - 'A';
        if (c >= 'a' && c <= 'z') return c - 'a' + 26;
        if (c >= '0' && c <= '9') return c - '0' + 52;
        if (c == '+' || c == '-') return 62;
        if (c == '/' || c == '_') return 63;
        return -1;
    };
    std::vector<std::uint8_t> out;
    out.reserve (text.size() * 3 / 4);
    std::uint32_t buffer = 0;
    int bits = 0;
    for (char c : text)
    {
        int v = value (c);
        if (v < 0)
            continue; // padding, line breaks
        buffer = (buffer << 6) | static_cast<std::uint32_t> (v);
        bits += 6;
        if (bits >= 8)
        {
            bits -= 8;
            out.push_back (static_cast<std::uint8_t> ((buffer >> bits) & 0xFF));
        }
    }
    return out;
}

} // namespace plenio::core
