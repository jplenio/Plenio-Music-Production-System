#include "core/log.h"
#include "core/paths.h"

#include <chrono>
#include <cstdio>
#include <ctime>
#include <filesystem>
#include <format>
#include <fstream>
#include <mutex>

namespace plenio::log
{
namespace
{
constexpr std::uintmax_t rotateAt = 4u * 1024u * 1024u;

std::mutex& lock()
{
    static std::mutex m;
    return m;
}

std::filesystem::path logPath()
{
    return paths::localData() / "plenio.log";
}

const char* name (Level level)
{
    switch (level)
    {
        case Level::debug:   return "debug";
        case Level::info:    return "info ";
        case Level::warning: return "warn ";
        case Level::error:   return "ERROR";
    }
    return "?";
}
} // namespace

std::string filePath()
{
    return paths::toUtf8 (logPath());
}

void write (Level level, std::string_view message) noexcept
{
    try
    {
        std::scoped_lock guard (lock());
        auto path = logPath();
        std::error_code ec;
        std::filesystem::create_directories (path.parent_path(), ec);

        if (std::filesystem::exists (path, ec) && std::filesystem::file_size (path, ec) > rotateAt)
        {
            auto old = path;
            old += ".1";
            std::filesystem::remove (old, ec);
            std::filesystem::rename (path, old, ec);
        }

        std::ofstream out (path, std::ios::app | std::ios::binary);
        if (! out)
            return;

        // the local time, as the one who reads the log lived it
        const auto now = std::chrono::system_clock::now();
        const auto seconds = std::chrono::system_clock::to_time_t (now);
        std::tm local {};
#ifdef _WIN32
        localtime_s (&local, &seconds);
#else
        localtime_r (&seconds, &local);
#endif
        const auto millis = std::chrono::duration_cast<std::chrono::milliseconds> (now.time_since_epoch()).count() % 1000;
        out << std::format ("{:04}-{:02}-{:02} {:02}:{:02}:{:02}.{:03} {} ", local.tm_year + 1900, local.tm_mon + 1, local.tm_mday,
                            local.tm_hour, local.tm_min, local.tm_sec, millis, name (level))
            << message << "\n";
    }
    catch (...)
    {
    }
}

} // namespace plenio::log
