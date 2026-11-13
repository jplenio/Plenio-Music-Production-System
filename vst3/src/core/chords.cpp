#include "core/chords.h"

#include <array>
#include <map>

namespace plenio::chords
{
namespace
{
const std::map<std::string, std::vector<int>>& intervals()
{
    static const std::map<std::string, std::vector<int>> table {
        { "", { 0, 4, 7 } },        { "m", { 0, 3, 7 } },        { "dim", { 0, 3, 6 } },
        { "aug", { 0, 4, 8 } },     { "7", { 0, 4, 7, 10 } },    { "maj7", { 0, 4, 7, 11 } },
        { "m7", { 0, 3, 7, 10 } },  { "dim7", { 0, 3, 6, 9 } },  { "m7b5", { 0, 3, 6, 10 } },
        { "sus4", { 0, 5, 7 } },    { "sus2", { 0, 2, 7 } },     { "6", { 0, 4, 7, 9 } },
        { "m6", { 0, 3, 7, 9 } },   { "7sus4", { 0, 5, 7, 10 } }, { "m(maj7)", { 0, 3, 7, 11 } },
    };
    return table;
}

int natural (char letter)
{
    switch (letter)
    {
        case 'C': return 0;
        case 'D': return 2;
        case 'E': return 4;
        case 'F': return 5;
        case 'G': return 7;
        case 'A': return 9;
        case 'B': return 11;
        default: return -1;
    }
}

/// A pitch name at the start of `text` ([A-G](bb|##|b|#)?): its pitch class and length, or nothing.
std::optional<std::pair<int, std::size_t>> pitchName (std::string_view text)
{
    if (text.empty())
        return std::nullopt;
    int pc = natural (text[0]);
    if (pc < 0)
        return std::nullopt;
    std::size_t length = 1;
    if (text.substr (1, 2) == "bb" || text.substr (1, 2) == "##")
    {
        pc += text[1] == '#' ? 2 : -2;
        length = 3;
    }
    else if (text.size() > 1 && (text[1] == 'b' || text[1] == '#'))
    {
        pc += text[1] == '#' ? 1 : -1;
        length = 2;
    }
    return std::make_pair (((pc % 12) + 12) % 12, length);
}
} // namespace

const std::vector<std::string>& qualities()
{
    static const std::vector<std::string> list { "", "m", "dim", "aug", "7", "maj7", "m7", "dim7", "m7b5",
                                                 "sus4", "sus2", "6", "m6", "7sus4", "m(maj7)" };
    return list;
}

std::optional<Chord> parse (std::string_view symbol)
{
    auto root = pitchName (symbol);
    if (! root)
        return std::nullopt;
    Chord chord;
    chord.root = root->first;
    chord.rootName = std::string (symbol.substr (0, root->second));
    auto rest = symbol.substr (root->second);
    auto slash = rest.find ('/');
    auto quality = rest.substr (0, slash);
    if (intervals().count (std::string (quality)) == 0)
        return std::nullopt;
    chord.quality = std::string (quality);
    if (slash != std::string_view::npos)
    {
        auto bassText = rest.substr (slash + 1);
        auto bass = pitchName (bassText);
        if (! bass || bass->second != bassText.size())
            return std::nullopt;
        chord.bass = bass->first;
        chord.bassName = std::string (bassText);
    }
    return chord;
}

std::vector<int> intervalsOf (std::string_view quality)
{
    auto it = intervals().find (std::string (quality));
    return it == intervals().end() ? std::vector<int> {} : it->second;
}

std::vector<int> pitches (std::string_view symbol)
{
    auto chord = parse (symbol);
    if (! chord)
        return {};
    std::vector<int> out;
    if (chord->bass)
        out.push_back (36 + *chord->bass);
    for (int i : intervals().at (chord->quality))
        out.push_back (48 + chord->root + i);
    return out;
}

std::string symbol (const Chord& chord)
{
    auto text = chord.rootName + chord.quality;
    if (chord.bass)
        text += "/" + chord.bassName;
    return text;
}

std::string rootName (int pitchClass, bool flats)
{
    static const std::array<const char*, 12> sharp { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" };
    static const std::array<const char*, 12> flat { "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B" };
    auto pc = static_cast<std::size_t> (((pitchClass % 12) + 12) % 12);
    return flats ? flat[pc] : sharp[pc];
}

} // namespace plenio::chords
