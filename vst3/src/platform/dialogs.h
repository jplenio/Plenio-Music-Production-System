// Small native helpers the web UI asks for: a file to open, a folder to show, a link to open.
#pragma once

#include <filesystem>
#include <optional>
#include <string>
#include <vector>

namespace plenio::platform
{

struct FileFilter
{
    std::string label;    // "Audio files"
    std::string patterns; // "*.wav;*.flac;*.mp3"
};

/// The system's open dialog (main thread). Nothing when the user cancels.
std::optional<std::filesystem::path> chooseFile (const std::string& title, const std::vector<FileFilter>& filters, void* owner = nullptr);

/// The system's folder dialog (main thread).
std::optional<std::filesystem::path> chooseFolder (const std::string& title, void* owner = nullptr);

/// Shows a file or folder in Explorer (or Finder).
void reveal (const std::filesystem::path& path);

/// Opens a link or file with its program.
void openExternally (const std::string& target);

} // namespace plenio::platform
