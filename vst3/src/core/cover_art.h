// Cover art. Plenio paints a take's cover when the brief asks for it (finish.cover_art) and hands it over as a JPEG of
// its own (the job's file with the role "cover"), embedded in the take's FLAC as well. A song shows the cover of its
// active take, else of its newest take that has one; its folder keeps that cover as cover.jpg, the name music players
// look for.
#pragma once

#include "core/song.h"

#include <filesystem>
#include <optional>
#include <string>

namespace plenio::core
{

struct Picture
{
    std::string mime; // "image/jpeg"
    std::string data; // the image file's bytes
};

/// The picture a FLAC file carries (its front cover, else the first one); nothing without one, or for another format.
std::optional<Picture> embeddedPicture (const std::filesystem::path& flac);

/// The take whose cover the song shows: the active take's, else the newest take's that has one; -1 when none has.
int coverTake (const Song& song);

/// The song's cover in its folder.
inline constexpr const char* songCoverName = "cover.jpg";

} // namespace plenio::core
