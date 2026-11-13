// Where Plenio VST3 keeps its files, and UTF-8 <-> path conversion (paths are std::filesystem::path, text in the
// program is UTF-8).
#pragma once

#include <filesystem>
#include <string>
#include <string_view>

namespace plenio::paths
{

/// Settings: %APPDATA%\Plenio\VST3 (macOS: ~/Library/Application Support/Plenio/VST3, Linux: ~/.config/plenio-vst3).
std::filesystem::path appData();

/// Logs and caches: %LOCALAPPDATA%\Plenio\VST3 (macOS: ~/Library/Caches/Plenio/VST3, Linux: ~/.cache/plenio-vst3).
std::filesystem::path localData();

/// The default song library: Documents\Plenio\Songs.
std::filesystem::path defaultLibrary();

/// Plenio's own state folder (~/.plenio): the Plenio Player keeps how ComfyUI was last started there.
std::filesystem::path plenioState();

/// The user's home folder.
std::filesystem::path home();

std::string toUtf8 (const std::filesystem::path& path);
std::filesystem::path fromUtf8 (std::string_view text);

/// A file or folder name made safe for every file system: no reserved characters or names, at most `limit`
/// characters, never empty.
std::string safeName (std::string_view text, std::size_t limit = 80);

} // namespace plenio::paths
