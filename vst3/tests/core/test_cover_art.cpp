#include <doctest/doctest.h>

#include "core/cover_art.h"
#include "core/library.h"

#include <filesystem>
#include <string>

using namespace plenio;
using namespace plenio::core;
namespace fs = std::filesystem;

namespace
{
std::string u32 (std::uint32_t v)
{
    return { static_cast<char> (v >> 24), static_cast<char> (v >> 16), static_cast<char> (v >> 8), static_cast<char> (v) };
}

std::string block (int type, const std::string& body, bool last)
{
    const auto n = static_cast<std::uint32_t> (body.size());
    std::string header { static_cast<char> (type | (last ? 0x80 : 0)), static_cast<char> (n >> 16), static_cast<char> (n >> 8),
                         static_cast<char> (n) };
    return header + body;
}

std::string picture (std::uint32_t type, const std::string& mime, const std::string& data)
{
    return u32 (type) + u32 (static_cast<std::uint32_t> (mime.size())) + mime + u32 (5) + "Cover" + u32 (1024) + u32 (1024)
         + u32 (24) + u32 (0) + u32 (static_cast<std::uint32_t> (data.size())) + data;
}

/// The start of a FLAC file as Plenio writes it: STREAMINFO, the pictures, padding (no audio needed here).
std::string flac (const std::vector<std::string>& pictures)
{
    std::string out = "fLaC" + block (0, std::string (34, '\0'), false);
    for (const auto& p : pictures)
        out += block (6, p, false);
    return out + block (1, std::string (8, '\0'), true);
}

const std::string jpegOne = "\xFF\xD8\xFF\xE0 the first cover";
const std::string jpegTwo = "\xFF\xD8\xFF\xE0 another cover, a little longer";

fs::path testFolder (const char* name)
{
    auto folder = fs::temp_directory_path() / "plenio-vst3-tests" / name;
    fs::remove_all (folder);
    fs::create_directories (folder);
    return folder;
}
} // namespace

TEST_CASE ("the cover art a FLAC file carries")
{
    const auto folder = testFolder ("cover-flac");
    auto write = [&] (const char* name, const std::string& content)
    {
        REQUIRE (writeFileAtomically (folder / name, content));
        return folder / name;
    };

    auto front = embeddedPicture (write ("front.flac", flac ({ picture (0, "image/png", "other"), picture (3, "image/jpeg", jpegOne) })));
    REQUIRE (front);
    CHECK (front->mime == "image/jpeg");
    CHECK (front->data == jpegOne); // the front cover before any other picture

    auto other = embeddedPicture (write ("other.flac", flac ({ picture (0, "image/jpeg", jpegTwo) })));
    REQUIRE (other);
    CHECK (other->data == jpegTwo);

    CHECK_FALSE (embeddedPicture (write ("none.flac", flac ({}))));
    CHECK_FALSE (embeddedPicture (write ("song.wav", "RIFF....WAVEfmt ")));
    CHECK_FALSE (embeddedPicture (folder / "missing.flac"));
    // a picture block whose image claims more bytes than the block holds
    const auto head = u32 (3) + u32 (10) + "image/jpeg" + u32 (5) + "Cover" + u32 (1) + u32 (1) + u32 (24) + u32 (0);
    CHECK_FALSE (embeddedPicture (write ("broken.flac", "fLaC" + block (6, head + u32 (4000) + "short", true))));
    fs::remove_all (folder);
}

TEST_CASE ("a song shows its active take's cover, else its newest take's")
{
    Song s;
    s.takes.resize (3);
    s.activeTake = 1;
    CHECK (coverTake (s) == -1);
    s.takes[0].files["cover_art"] = "takes/1/a.jpg";
    CHECK (coverTake (s) == 0);
    s.takes[2].files["cover_art"] = "takes/3/c.jpg";
    CHECK (coverTake (s) == 2); // the newest with one
    s.takes[1].files["cover_art"] = "takes/2/b.jpg";
    CHECK (coverTake (s) == 1); // the active take's own
}

TEST_CASE ("the library finds older takes' covers in their FLAC and keeps cover.jpg with the song")
{
    const auto root = testFolder ("cover-library");
    Library library (root);
    Song s;
    s.id = "s-0000000000c1";
    s.title = "Night Drive";
    s.takes.resize (2);
    s.takes[0].number = 1;
    s.takes[0].files["song"] = "takes/1/Night Drive - Take 1.flac";
    s.takes[1].number = 2;
    s.takes[1].files["song"] = "takes/2/Night Drive - Take 2.flac";
    s.activeTake = 0;
    REQUIRE (library.save (s));
    const auto folder = *library.find (s.id);
    fs::create_directories (folder / "takes" / "1");
    fs::create_directories (folder / "takes" / "2");
    REQUIRE (writeFileAtomically (folder / "takes" / "1" / "Night Drive - Take 1.flac", flac ({ picture (3, "image/jpeg", jpegOne) })));
    REQUIRE (writeFileAtomically (folder / "takes" / "2" / "Night Drive - Take 2.flac", flac ({}))); // made without cover art

    // a take made before the plug-in kept covers: found in its FLAC, beside it
    CHECK (library.findCovers (s));
    REQUIRE (s.takes[0].files.count ("cover_art"));
    CHECK (fs::exists (folder / "takes" / "1" / "Night Drive - Take 1.jpg"));
    CHECK (readFile (library.resolve (s, s.takes[0].files["cover_art"])).value_or ("") == jpegOne);
    CHECK_FALSE (s.takes[1].files.count ("cover_art"));
    CHECK_FALSE (library.findCovers (s)); // once

    library.writeCover (s);
    CHECK (readFile (folder / songCoverName).value_or ("") == jpegOne);

    // take 2 gets a cover of its own (as Plenio sends it with a run) and is chosen: cover.jpg follows
    REQUIRE (writeFileAtomically (folder / "takes" / "2" / "Night Drive - Take 2.jpg", jpegTwo));
    s.takes[1].files["cover_art"] = "takes/2/Night Drive - Take 2.jpg";
    s.activeTake = 1;
    library.writeCover (s);
    CHECK (readFile (folder / songCoverName).value_or ("") == jpegTwo);
    s.activeTake = 0;
    library.writeCover (s);
    CHECK (readFile (folder / songCoverName).value_or ("") == jpegOne);
    fs::remove_all (root);
}
