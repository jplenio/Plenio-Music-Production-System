// A small thread-safe log file: %LOCALAPPDATA%\Plenio\VST3\plenio.log (rotated at 4 MB). Never throws, never
// called from the audio thread.
#pragma once

#include <format>
#include <string>
#include <string_view>

namespace plenio::log
{

enum class Level { debug, info, warning, error };

void write (Level level, std::string_view message) noexcept;

/// The log file (for "Open log" in the UI).
std::string filePath();

template <typename... Args>
void info (std::format_string<Args...> f, Args&&... args) noexcept
{
    try { write (Level::info, std::format (f, std::forward<Args> (args)...)); } catch (...) {}
}

template <typename... Args>
void warn (std::format_string<Args...> f, Args&&... args) noexcept
{
    try { write (Level::warning, std::format (f, std::forward<Args> (args)...)); } catch (...) {}
}

template <typename... Args>
void error (std::format_string<Args...> f, Args&&... args) noexcept
{
    try { write (Level::error, std::format (f, std::forward<Args> (args)...)); } catch (...) {}
}

template <typename... Args>
void debug (std::format_string<Args...> f, Args&&... args) noexcept
{
    try { write (Level::debug, std::format (f, std::forward<Args> (args)...)); } catch (...) {}
}

} // namespace plenio::log
