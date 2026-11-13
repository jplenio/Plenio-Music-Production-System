#include "core/cover_art.h"

#include <cstdint>
#include <cstring>
#include <fstream>

namespace plenio::core
{

std::optional<Picture> embeddedPicture (const std::filesystem::path& flac)
{
    std::ifstream in (flac, std::ios::binary);
    char magic[4] {};
    if (! in.read (magic, 4) || std::memcmp (magic, "fLaC", 4) != 0)
        return std::nullopt;

    std::optional<Picture> first;
    for (int blocks = 0; blocks < 1000; ++blocks)
    {
        unsigned char header[4] {};
        if (! in.read (reinterpret_cast<char*> (header), 4))
            break;
        const bool last = (header[0] & 0x80) != 0;
        const int type = header[0] & 0x7f;
        const std::uint32_t length = (std::uint32_t (header[1]) << 16) | (std::uint32_t (header[2]) << 8) | header[3];
        if (type != 6) // not a PICTURE block
        {
            in.seekg (length, std::ios::cur);
            if (last || ! in)
                break;
            continue;
        }

        std::string block (length, '\0');
        if (! in.read (block.data(), static_cast<std::streamsize> (length)))
            break;
        std::size_t at = 0;
        bool fine = true;
        auto u32 = [&]() -> std::uint32_t
        {
            if (at + 4 > block.size())
            {
                fine = false;
                return 0;
            }
            const auto* b = reinterpret_cast<const unsigned char*> (block.data() + at);
            at += 4;
            return (std::uint32_t (b[0]) << 24) | (std::uint32_t (b[1]) << 16) | (std::uint32_t (b[2]) << 8) | b[3];
        };
        auto bytes = [&] (std::uint32_t n) -> std::string
        {
            if (! fine || n > block.size() - at)
            {
                fine = false;
                return {};
            }
            auto s = block.substr (at, n);
            at += n;
            return s;
        };
        const auto pictureType = u32();
        Picture picture;
        picture.mime = bytes (u32());
        bytes (u32()); // the description
        for (int k = 0; k < 4; ++k)
            u32(); // width, height, colour depth, colours
        picture.data = bytes (u32());
        if (fine && ! picture.data.empty())
        {
            if (pictureType == 3) // the front cover
                return picture;
            if (! first)
                first = std::move (picture);
        }
        if (last)
            break;
    }
    return first;
}

int coverTake (const Song& song)
{
    const int count = static_cast<int> (song.takes.size());
    auto has = [&] (int i)
    {
        const auto& files = song.takes[static_cast<std::size_t> (i)].files;
        auto it = files.find ("cover_art");
        return it != files.end() && ! it->second.empty();
    };
    if (song.activeTake >= 0 && song.activeTake < count && has (song.activeTake))
        return song.activeTake;
    for (int i = count - 1; i >= 0; --i)
        if (has (i))
            return i;
    return -1;
}

} // namespace plenio::core
