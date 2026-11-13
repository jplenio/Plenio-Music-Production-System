#include "core/clip_content.h"
#include "core/chords.h"
#include "core/library.h"
#include "core/paths.h"
#include "core/timeline.h"

#include <algorithm>
#include <cctype>
#include <cmath>
#include <cstdlib>
#include <filesystem>

namespace plenio::core
{
namespace
{
constexpr int ppq = 960; // the project's ticks (as the DAW's files have them)

std::string lower (std::string s)
{
    std::transform (s.begin(), s.end(), s.begin(), [] (unsigned char c) { return static_cast<char> (std::tolower (c)); });
    return s;
}

bool isStem (const std::string& word)
{
    static const char* stems[] = { "vocals", "drums", "bass", "other", "rest" };
    for (const auto* s : stems)
        if (word == s)
            return true;
    return false;
}

double secondsOfTick (const std::vector<timeline::TempoEvent>& map, std::int64_t tick)
{
    if (map.empty())
        return static_cast<double> (tick) / ppq * 0.5;
    std::size_t k = 0;
    while (k + 1 < map.size() && map[k + 1].tick <= tick)
        ++k;
    const auto& e = map[k];
    return e.seconds + static_cast<double> (tick - e.tick) / ppq * 60.0 / std::max (1.0, e.bpm);
}
} // namespace

std::optional<daw::AudioJob> dawAudioJob (const Library& library, const Song& song, int takeIndex)
{
    if (takeIndex < 0 || takeIndex >= static_cast<int> (song.takes.size()))
        return std::nullopt;
    const auto& take = song.takes[static_cast<std::size_t> (takeIndex)];
    auto file = take.files.find ("song");
    if (file == take.files.end())
        return std::nullopt;
    std::error_code ec;
    daw::AudioJob job;
    job.audio = library.resolve (song, file->second);
    if (! std::filesystem::exists (job.audio, ec))
        return std::nullopt;
    for (const auto& s : take.stems)
    {
        auto path = library.resolve (song, s.file);
        if (std::filesystem::exists (path, ec))
            job.stems.emplace_back (s.name, path);
    }
    job.folder = job.audio.parent_path() / "daw";
    job.title = paths::safeName (song.title.empty() ? std::string ("Song") : song.title, 60);
    job.base = job.title + " - Take " + std::to_string (take.number);
    const auto timing = take.timing();
    const auto layout = timeline::layOut (timing);
    job.audioAt = layout.audioAt;
    job.seconds = take.seconds;
    job.map = timeline::tempoMap (timing, layout, daw::ppq);
    return job;
}

std::optional<int> fifthsOf (std::string_view noteName)
{
    if (noteName.empty())
        return std::nullopt;
    int base = 0;
    switch (noteName[0])
    {
        case 'F': base = -1; break;
        case 'C': base = 0; break;
        case 'G': base = 1; break;
        case 'D': base = 2; break;
        case 'A': base = 3; break;
        case 'E': base = 4; break;
        case 'B': base = 5; break;
        default: return std::nullopt;
    }
    for (std::size_t i = 1; i < noteName.size(); ++i)
    {
        if (noteName[i] == '#')
            base += 7;
        else if (noteName[i] == 'b')
            base -= 7;
        else
            return std::nullopt;
    }
    return base;
}

std::string withMusicSigns (std::string_view name)
{
    // the root's (and a slash bass's) accidentals, and the flat of a flattened fifth ("m7b5")
    std::string out;
    for (std::size_t i = 0; i < name.size(); ++i)
    {
        const char c = name[i];
        const bool afterNote = i > 0 && (std::string_view ("ABCDEFG").find (name[i - 1]) != std::string_view::npos);
        const bool beforeDigit = i + 1 < name.size() && std::isdigit (static_cast<unsigned char> (name[i + 1])) != 0;
        if (c == '#' && afterNote)
            out += "\xE2\x99\xAF"; // ♯
        else if (c == 'b' && (afterNote || beforeDigit))
            out += "\xE2\x99\xAD"; // ♭
        else
            out += c;
    }
    return out;
}

std::optional<ClipName> parseClipName (std::string_view name)
{
    std::string s (name);
    // no folders, no extension
    if (auto slash = s.find_last_of ("/\\"); slash != std::string::npos)
        s = s.substr (slash + 1);
    if (auto dot = s.find_last_of ('.'); dot != std::string::npos && s.size() - dot <= 5)
        s = s.substr (0, dot);
    // "<title> - Take <n>": the last such mark (a title may hold " - " itself)
    const std::string mark = " - Take ";
    auto at = s.rfind (mark);
    if (at == std::string::npos || at == 0)
        return std::nullopt;
    ClipName clip;
    clip.title = s.substr (0, at);
    std::size_t i = at + mark.size();
    std::size_t digits = 0;
    while (i + digits < s.size() && std::isdigit (static_cast<unsigned char> (s[i + digits])) != 0 && digits < 4)
        ++digits;
    if (digits == 0)
        return std::nullopt;
    clip.take = std::atoi (s.substr (i, digits).c_str());
    std::string rest = s.substr (i + digits);
    // " - vocals" and the like; what a DAW adds after it ("_01", " (1)", "-glued") does not matter
    const std::string stemMark = " - ";
    if (rest.rfind (stemMark, 0) == 0)
    {
        std::string word;
        for (std::size_t k = stemMark.size(); k < rest.size() && std::isalpha (static_cast<unsigned char> (rest[k])) != 0; ++k)
            word += static_cast<char> (std::tolower (static_cast<unsigned char> (rest[k])));
        if (isStem (word))
            clip.stem = word;
    }
    else if (! rest.empty() && std::isalnum (static_cast<unsigned char> (rest[0])) != 0)
        return std::nullopt; // "Take 12b": not a name the plug-in gave
    return clip;
}

std::optional<ClipMatch> matchClip (const Library& library, std::string_view name, double seconds)
{
    auto clip = parseClipName (name);
    if (! clip)
        return std::nullopt;
    const auto wanted = lower (clip->title);
    for (const auto& summary : library.list())
    {
        if (lower (paths::safeName (summary.title.empty() ? std::string ("Song") : summary.title, 60)) != wanted)
            continue;
        auto song = library.load (summary.id);
        if (! song)
            continue;
        for (std::size_t i = 0; i < song->takes.size(); ++i)
        {
            const auto& take = song->takes[i];
            if (take.number != clip->take)
                continue;
            const auto layout = timeline::layOut (take.timing());
            const double tolerance = std::max (0.3, 0.005 * take.seconds);
            std::optional<double> offset;
            if (std::abs (seconds - (layout.audioAt + take.seconds)) <= tolerance)
                offset = 0.0; // the DAW's file: from the project's start
            else if (std::abs (seconds - take.seconds) <= tolerance)
                offset = layout.audioAt; // Plenio's own file of the take
            if (! offset)
                continue;
            ClipMatch match;
            match.song = std::move (*song);
            match.takeIndex = static_cast<int> (i);
            match.stem = clip->stem;
            match.offset = *offset;
            return match;
        }
    }
    return std::nullopt;
}

ClipContent contentOf (const ClipMatch& match)
{
    ClipContent content;
    if (match.takeIndex < 0 || match.takeIndex >= static_cast<int> (match.song.takes.size()))
        return content;
    const auto& take = match.song.takes[static_cast<std::size_t> (match.takeIndex)];
    const auto timing = take.timing();
    const auto layout = timeline::layOut (timing);
    const auto map = timeline::tempoMap (timing, layout, ppq);
    if (map.empty())
        return content;

    // the tempo map: every measure, and its end after the last
    for (const auto& e : map)
        content.tempo.push_back ({ e.seconds - match.offset, static_cast<double> (e.tick) / ppq });
    {
        const auto& last = map.back();
        const double quarters = last.meter.first * 4.0 / std::max (1, last.meter.second);
        content.tempo.push_back ({ last.seconds + quarters * 60.0 / std::max (1.0, last.bpm) - match.offset,
                                   static_cast<double> (last.tick) / ppq + quarters });
    }
    for (std::size_t k = 0; k < map.size(); ++k)
        if (k == 0 || map[k].meterChanges)
            content.bars.push_back ({ map[k].meter.first, map[k].meter.second, static_cast<double> (map[k].tick) / ppq });

    auto score = take.score();
    if (! score)
        return content;
    auto quartersOf = [&] (std::int64_t scoreTick)
    { return static_cast<double> (timeline::scoreTickToProjectTick (layout, scoreTick, score->ppq, ppq)) / ppq; };

    if (match.stem.empty() || match.stem == "vocals")
        for (const auto& n : score->melody)
        {
            const auto a = timeline::scoreTickToProjectTick (layout, n.tick, score->ppq, ppq);
            const auto b = timeline::scoreTickToProjectTick (layout, n.tick + std::max<std::int64_t> (1, n.length), score->ppq, ppq);
            const double start = secondsOfTick (map, a) - match.offset;
            content.notes.push_back ({ start, std::max (0.01, secondsOfTick (map, b) - match.offset - start), n.pitch,
                                       static_cast<float> (std::clamp (n.velocity, 1, 127)) / 127.0f });
        }

    for (const auto& c : score->chords)
    {
        auto parsed = chords::parse (c.name);
        if (! parsed)
            continue;
        ClipContent::Chord chord;
        chord.quarters = quartersOf (c.tick);
        chord.root = fifthsOf (parsed->rootName).value_or (0);
        chord.bass = parsed->bass ? fifthsOf (parsed->bassName).value_or (chord.root) : chord.root;
        for (int interval : chords::intervalsOf (parsed->quality))
        {
            // the diatonic degree of each interval (a diminished seventh is a seventh, a sixth a sixth)
            static const int degreeOf[12] = { 1, 9, 2, 3, 3, 4, 5, 5, 5, 6, 7, 7 };
            int degree = degreeOf[((interval % 12) + 12) % 12];
            if (interval == 9 && parsed->quality == "dim7")
                degree = 7;
            chord.degrees[static_cast<std::size_t> (((interval % 12) + 12) % 12)] = static_cast<std::uint8_t> (degree);
        }
        chord.name = withMusicSigns (c.name);
        content.chords.push_back (std::move (chord));
    }

    if (auto space = score->key.find (' '); space != std::string::npos)
    {
        auto tonic = score->key.substr (0, space);
        if (auto root = fifthsOf (tonic))
        {
            ClipContent::Key key;
            key.root = *root;
            key.minor = score->key.substr (space + 1) == "minor";
            key.name = withMusicSigns (tonic) + (key.minor ? " minor" : " major");
            key.quarters = quartersOf (0);
            content.key = key;
        }
    }
    return content;
}

} // namespace plenio::core
