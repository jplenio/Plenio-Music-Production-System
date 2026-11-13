#include "core/record.h"

#include <algorithm>
#include <cmath>
#include <sstream>

namespace plenio::record
{
namespace
{
constexpr std::size_t maxLines = 20'000;
constexpr std::size_t maxFiles = 64;

bool finite (const Json& v)
{
    return v.is_number() && std::isfinite (v.get<double>());
}

std::optional<double> parseTimestamp (std::string_view text)
{
    // 00:01:02,345
    int h = 0, m = 0, s = 0, ms = 0;
    std::string t (text);
    std::replace (t.begin(), t.end(), '.', ',');
    if (std::sscanf (t.c_str(), "%d:%d:%d,%d", &h, &m, &s, &ms) != 4)
        return std::nullopt;
    if (h < 0 || m < 0 || s < 0 || ms < 0)
        return std::nullopt;
    return h * 3600.0 + m * 60.0 + s + ms / 1000.0;
}

std::string trim (std::string s)
{
    auto notSpace = [] (unsigned char c) { return ! std::isspace (c); };
    s.erase (s.begin(), std::find_if (s.begin(), s.end(), notSpace));
    s.erase (std::find_if (s.rbegin(), s.rend(), notSpace).base(), s.end());
    return s;
}
} // namespace

Record parse (const Json& r)
{
    Record out;
    if (! r.is_object())
        return out;
    out.title = json::str (r, "title", {}, 400);

    const auto& documents = json::obj (r, "documents");
    for (const auto& kind : documentKinds())
    {
        if (auto* d = json::find (documents, kind))
        {
            if (d->is_object())
                out.documents[kind] = json::str (*d, "text");
            else if (d->is_string())
                out.documents[kind] = d->get<std::string>();
        }
    }

    const auto& quality = json::obj (r, "quality");
    out.quality = quality;
    if (auto stars = json::num (quality, "stars"))
        out.stars = std::clamp (*stars, 0.0, 5.0);

    const auto& audio = json::obj (r, "audio");
    out.seconds = std::max (0.0, json::num (audio, "seconds", 0.0));
    out.sampleRate = static_cast<int> (std::clamp<std::int64_t> (json::integer (audio, "sample_rate", 0), 0, 768000));

    const auto& timing = json::arr (r, "timing");
    if (! timing.empty() && timing[0].is_object())
    {
        const auto& first = timing[0];
        if (auto* w = json::find (first, "warp"); w != nullptr && w->is_array() && w->size() == 2 && finite ((*w)[0]) && finite ((*w)[1]))
        {
            timeline::Warp warp { (*w)[0].get<double>(), (*w)[1].get<double>() };
            if (warp.believable())
                out.warp = warp;
        }
        for (const auto& line : json::arr (first, "lines"))
        {
            if (out.lines.size() >= maxLines)
                break;
            auto start = json::num (line, "start");
            auto end = json::num (line, "end");
            if (start && end && *start >= 0.0 && *end >= *start)
                out.lines.push_back ({ *start, *end, json::str (line, "text", {}, 2000) });
        }
        std::sort (out.lines.begin(), out.lines.end(), [] (const Line& a, const Line& b) { return a.start < b.start; });
    }

    for (const auto& f : json::arr (r, "files"))
    {
        if (out.files.size() >= maxFiles)
            break;
        auto name = json::str (f, "name", {}, 400);
        if (! name.empty())
            out.files.push_back ({ name, json::str (f, "role", {}, 40), json::str (f, "stem", {}, 40), {} });
    }
    return out;
}

std::vector<Line> parseSrt (std::string_view text)
{
    std::vector<Line> lines;
    std::istringstream in { std::string (text) };
    std::string row;
    std::vector<std::string> block;

    auto flush = [&]
    {
        // [number], "start --> end", text...
        std::size_t at = 0;
        if (at < block.size() && block[at].find ("-->") == std::string::npos)
            ++at;
        if (at < block.size())
        {
            auto arrow = block[at].find ("-->");
            if (arrow != std::string::npos)
            {
                auto start = parseTimestamp (trim (block[at].substr (0, arrow)));
                auto end = parseTimestamp (trim (block[at].substr (arrow + 3)));
                std::string words;
                for (std::size_t i = at + 1; i < block.size(); ++i)
                    words += (words.empty() ? "" : "\n") + block[i];
                if (start && end && *end >= *start && lines.size() < maxLines)
                    lines.push_back ({ *start, *end, words.substr (0, 2000) });
            }
        }
        block.clear();
    };

    while (std::getline (in, row))
    {
        if (! row.empty() && row.back() == '\r')
            row.pop_back();
        if (row.size() >= 3 && static_cast<unsigned char> (row[0]) == 0xEF && static_cast<unsigned char> (row[1]) == 0xBB
            && static_cast<unsigned char> (row[2]) == 0xBF)
            row = row.substr (3);
        if (trim (row).empty())
            flush();
        else
            block.push_back (row);
    }
    flush();
    std::sort (lines.begin(), lines.end(), [] (const Line& a, const Line& b) { return a.start < b.start; });
    return lines;
}

const File* Job::file (std::string_view role) const
{
    for (const auto& f : files)
        if (f.role == role)
            return &f;
    return nullptr;
}

std::optional<Job> parseJob (const Json& v)
{
    auto id = json::str (v, "id", {}, 128);
    if (id.empty())
        return std::nullopt;
    Job job;
    job.id = id;
    auto status = json::str (v, "status", {}, 40);
    job.status = status == "queued" ? JobStatus::queued
                 : status == "running" ? JobStatus::running
                 : status == "succeeded" ? JobStatus::succeeded
                 : status == "failed" ? JobStatus::failed
                 : status == "cancelled" ? JobStatus::cancelled
                 : status == "waiting_for_review" ? JobStatus::waiting
                                         : JobStatus::unknown;
    if (auto* q = json::find (v, "queue_position"); q != nullptr && q->is_number_integer())
        job.queuePosition = static_cast<int> (std::clamp<std::int64_t> (q->get<std::int64_t>(), 0, 100000));
    job.stage = json::str (json::obj (v, "stage"), "text", {}, 200);
    const auto& progress = json::obj (v, "progress");
    auto done = json::num (progress, "nodes_done");
    auto all = json::num (progress, "nodes");
    if (done && all && *all > 0)
        job.progress = std::clamp (*done / *all, 0.0, 1.0);
    for (const auto& [key, seed] : json::obj (v, "seeds").items())
        if (seed.is_number_unsigned() || (seed.is_number_integer() && seed.get<std::int64_t>() >= 0))
            if (job.seeds.size() < 16)
                job.seeds[key.substr (0, 32)] = seed.get<std::uint64_t>();
    job.stems = json::boolean (v, "stems", false);

    if (const auto& result = json::obj (v, "result"); ! result.empty())
    {
        job.title = json::str (result, "title", {}, 400);
        job.folder = json::str (result, "folder", {}, 2000);
        job.seconds = std::max (0.0, json::num (result, "seconds", 0.0));
        for (const auto& f : json::arr (result, "files"))
        {
            if (job.files.size() >= maxFiles)
                break;
            auto name = json::str (f, "name", {}, 400);
            auto url = json::str (f, "url", {}, 2000);
            // only the API's own file paths: never a server or a path the answer chose
            if (name.empty() || (url.rfind ("/plenio/api/v1/jobs/", 0) != 0 && url.rfind ("/plenio/api/v2/jobs/", 0) != 0))
                continue;
            job.files.push_back ({ name, json::str (f, "role", {}, 40), json::str (f, "stem", {}, 40), url });
        }
    }
    if (const auto& error = json::obj (v, "error"); ! error.empty())
    {
        job.errorCode = json::str (error, "code", {}, 64);
        auto node = json::str (error, "title", {}, 200);
        auto message = json::str (error, "message", {}, 4000);
        job.error = node.empty() ? message : node + ": " + message;
    }
    for (const auto& w : json::arr (v, "warnings"))
        if (w.is_string() && job.warnings.size() < 32)
            job.warnings.push_back (w.get<std::string>().substr (0, 400));
    return job;
}

} // namespace plenio::record
