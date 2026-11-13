// What the plug-in reads from Plenio's answers: a release record (<name>.plenio.json), timed lyrics (.srt) and a
// Song API job. All of it is hostile input: parsed leniently, bounded, never trusted to be well formed.
#pragma once

#include "core/json.h"
#include "core/timeline.h"

#include <map>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

namespace plenio::record
{

struct Line
{
    double start = 0.0; // seconds of the take's audio
    double end = 0.0;
    std::string text;
};

struct File
{
    std::string name;
    std::string role; // "", original, record, subtitles, cover, sheet_music, stem, stem_midi ...
    std::string stem; // for role "stem": vocals, drums, bass, other, rest
    std::string url;  // a job's file: /plenio/api/v2/jobs/<id>/files/<name> (v1 before Plenio 2.0)
};

struct Record
{
    std::string title;
    std::map<std::string, std::string> documents; // title, style, lyrics, score, artwork_prompt
    std::optional<double> stars;                  // 0 ... 5 in halves
    Json quality = Json::object();
    double seconds = 0.0;
    int sampleRate = 0;
    std::optional<timeline::Warp> warp;
    std::vector<Line> lines;
    std::vector<File> files;
};

/// The documents the Song Sheets keep, in the order they depend on each other.
inline const std::vector<std::string>& documentKinds()
{
    static const std::vector<std::string> kinds { "title", "style", "lyrics", "score", "artwork_prompt" };
    return kinds;
}

Record parse (const Json& record);

/// Subtitles as lines (start, end, text), sorted by start.
std::vector<Line> parseSrt (std::string_view text);

enum class JobStatus { queued, running, succeeded, failed, cancelled, unknown, waiting /* for a review (Song API v2) */ };

struct Job
{
    std::string id;
    JobStatus status = JobStatus::unknown;
    std::optional<int> queuePosition;
    std::string stage;
    std::optional<double> progress; // 0 ... 1
    std::map<std::string, std::uint64_t> seeds;
    std::string title;
    double seconds = 0.0;
    std::string folder;
    std::vector<File> files;
    std::string error;
    std::string errorCode; // Song API v2: "interrupted" or "lost" when ComfyUI stopped while the job ran
    std::vector<std::string> warnings;
    bool stems = false;

    bool finished() const noexcept
    {
        return status == JobStatus::succeeded || status == JobStatus::failed || status == JobStatus::cancelled;
    }
    const File* file (std::string_view role) const;
};

std::optional<Job> parseJob (const Json& job);

} // namespace plenio::record
