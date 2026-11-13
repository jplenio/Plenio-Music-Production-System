#include "core/library.h"
#include "core/cover_art.h"
#include "core/log.h"
#include "core/paths.h"

#include <algorithm>
#include <cctype>
#include <fstream>
#include <sstream>

namespace plenio::core
{
namespace fs = std::filesystem;

bool writeFileAtomically (const fs::path& file, std::string_view content)
{
    std::error_code ec;
    fs::create_directories (file.parent_path(), ec);
    auto temp = file;
    temp += ".tmp";
    {
        std::ofstream out (temp, std::ios::binary | std::ios::trunc);
        if (! out)
            return false;
        out.write (content.data(), static_cast<std::streamsize> (content.size()));
        if (! out)
            return false;
    }
    fs::rename (temp, file, ec);
    if (ec)
    {
        // a reader holding the old file open on Windows: replace by copy
        fs::copy_file (temp, file, fs::copy_options::overwrite_existing, ec);
        fs::remove (temp);
        return ! ec;
    }
    return true;
}

std::optional<std::string> readFile (const fs::path& file, std::size_t limit)
{
    std::error_code ec;
    auto size = fs::file_size (file, ec);
    if (ec || size > limit)
        return std::nullopt;
    std::ifstream in (file, std::ios::binary);
    if (! in)
        return std::nullopt;
    std::string content (static_cast<std::size_t> (size), '\0');
    in.read (content.data(), static_cast<std::streamsize> (size));
    if (! in && ! in.eof())
        return std::nullopt;
    return content;
}

Library::Library (fs::path root) : rootFolder (std::move (root)) {}

std::optional<fs::path> Library::find (std::string_view id) const
{
    if (id.empty())
        return std::nullopt;
    auto suffix = "[" + std::string (id) + "]";
    std::error_code ec;
    for (const auto& entry : fs::directory_iterator (rootFolder, ec))
    {
        if (! entry.is_directory (ec))
            continue;
        auto name = paths::toUtf8 (entry.path().filename());
        if (name.size() >= suffix.size() && name.compare (name.size() - suffix.size(), suffix.size(), suffix) == 0)
            return entry.path();
    }
    return std::nullopt;
}

fs::path Library::folderFor (const Song& song) const
{
    if (auto found = find (song.id))
        return *found;
    auto title = song.title.empty() ? std::string ("Untitled") : song.title;
    auto folder = rootFolder / paths::fromUtf8 (paths::safeName (title, 60) + " [" + song.id + "]");
    std::error_code ec;
    fs::create_directories (folder, ec);
    if (ec)
        log::error ("library: {} could not be made: {}", paths::toUtf8 (folder), ec.message());
    return folder;
}

bool Library::tidy (const Song& song) const
{
    auto found = find (song.id);
    if (! found || song.title.empty())
        return false;
    auto wanted = rootFolder / paths::fromUtf8 (paths::safeName (song.title, 60) + " [" + song.id + "]");
    if (found->filename() == wanted.filename())
        return false;
    std::error_code ec;
    if (fs::exists (wanted, ec))
        return false;
    fs::rename (*found, wanted, ec);
    if (ec)
    {
        log::info ("library: {} keeps its name ({})", paths::toUtf8 (found->filename()), ec.message());
        return false;
    }
    return true;
}

fs::path Library::takeFolder (const fs::path& songFolder, int number)
{
    return songFolder / "takes" / std::to_string (number);
}

bool Library::save (const Song& song) const
{
    auto folder = folderFor (song);
    auto text = toJson (song).dump (1, ' ', false, Json::error_handler_t::replace);
    if (! writeFileAtomically (folder / "song.json", text))
    {
        log::error ("library: song.json of {} not written", song.id);
        return false;
    }
    return true;
}

std::optional<Song> Library::loadFrom (const fs::path& folder)
{
    auto text = readFile (folder / "song.json");
    if (! text)
        return std::nullopt;
    auto parsed = json::parse (*text);
    if (! parsed || ! parsed->is_object())
    {
        log::warn ("library: {} holds no readable song", paths::toUtf8 (folder));
        return std::nullopt;
    }
    return songFromJson (*parsed);
}

std::optional<Song> Library::load (std::string_view id) const
{
    auto folder = find (id);
    return folder ? loadFrom (*folder) : std::nullopt;
}

std::vector<SongSummary> Library::list() const
{
    std::vector<SongSummary> out;
    std::error_code ec;
    for (const auto& entry : fs::directory_iterator (rootFolder, ec))
    {
        if (! entry.is_directory (ec) || out.size() >= 5000)
            continue;
        auto text = readFile (entry.path() / "song.json", 64u * 1024u * 1024u);
        if (! text)
            continue;
        auto parsed = json::parse (*text);
        if (! parsed || ! parsed->is_object())
            continue;
        SongSummary s;
        s.id = json::str (*parsed, "id", {}, 64);
        s.title = json::str (*parsed, "title", {}, 400);
        s.kind = json::str (*parsed, "kind", "song", 16);
        s.modified = json::integer (*parsed, "modified", 0);
        for (const auto& t : json::arr (*parsed, "takes"))
        {
            ++s.takes;
            if (auto stars = json::num (t, "stars"); stars && (! s.bestStars || *stars > *s.bestStars))
                s.bestStars = *stars;
        }
        s.folder = entry.path();
        if (! s.id.empty())
            out.push_back (std::move (s));
    }
    std::sort (out.begin(), out.end(), [] (const SongSummary& a, const SongSummary& b) { return a.modified > b.modified; });
    return out;
}

fs::path Library::resolve (const Song& song, std::string_view relative) const
{
    auto rel = paths::fromUtf8 (relative);
    if (rel.is_absolute())
        return rel;
    if (auto folder = find (song.id))
        return *folder / rel;
    return folderFor (song) / rel;
}

bool Library::findCovers (Song& song) const
{
    bool found = false;
    std::error_code ec;
    for (auto& take : song.takes)
    {
        if (auto it = take.files.find ("cover_art"); it != take.files.end() && fs::exists (resolve (song, it->second), ec))
            continue;
        auto audio = take.files.find ("song");
        if (audio == take.files.end())
            continue;
        const auto file = resolve (song, audio->second);
        auto ext = file.extension().string();
        std::transform (ext.begin(), ext.end(), ext.begin(), [] (unsigned char c) { return static_cast<char> (std::tolower (c)); });
        if (ext != ".flac")
            continue;
        auto picture = embeddedPicture (file);
        if (! picture || picture->mime != "image/jpeg")
            continue;
        auto cover = file;
        cover.replace_extension (".jpg");
        if (! writeFileAtomically (cover, picture->data))
            continue;
        take.files["cover_art"] = paths::toUtf8 (fs::relative (cover, folderFor (song), ec));
        log::info ("{}: take {}'s cover taken from its FLAC", song.title, take.number);
        found = true;
    }
    return found;
}

void Library::writeCover (const Song& song) const
{
    const int index = coverTake (song);
    if (index < 0)
        return;
    const auto source = resolve (song, song.takes[static_cast<std::size_t> (index)].files.at ("cover_art"));
    auto ext = source.extension().string();
    std::transform (ext.begin(), ext.end(), ext.begin(), [] (unsigned char c) { return static_cast<char> (std::tolower (c)); });
    if (ext != ".jpg" && ext != ".jpeg")
        return;
    auto data = readFile (source, 32u * 1024u * 1024u);
    if (! data)
        return;
    const auto target = folderFor (song) / songCoverName;
    if (auto existing = readFile (target, 32u * 1024u * 1024u); existing && *existing == *data)
        return;
    if (writeFileAtomically (target, *data))
        log::info ("{}: cover.jpg is take {}'s cover", song.title, song.takes[static_cast<std::size_t> (index)].number);
}

} // namespace plenio::core
