#include "core/paths.h"

#include <cstdlib>

#ifdef _WIN32
 #include <windows.h>
 #include <shlobj.h>
 #include <knownfolders.h>
#endif

namespace plenio::paths
{
namespace
{
#ifdef _WIN32
std::filesystem::path knownFolder (REFKNOWNFOLDERID id)
{
    PWSTR raw = nullptr;
    std::filesystem::path result;
    if (SUCCEEDED (SHGetKnownFolderPath (id, KF_FLAG_CREATE, nullptr, &raw)) && raw != nullptr)
        result = std::filesystem::path (raw);
    if (raw != nullptr)
        CoTaskMemFree (raw);
    return result;
}
#endif

std::filesystem::path env (const char* name)
{
#ifdef _WIN32
    wchar_t buffer[32768] = {};
    std::wstring wide (name, name + std::char_traits<char>::length (name));
    auto n = GetEnvironmentVariableW (wide.c_str(), buffer, 32768);
    if (n > 0 && n < 32768)
        return std::filesystem::path (std::wstring (buffer, n));
    return {};
#else
    const char* v = std::getenv (name);
    return v != nullptr ? std::filesystem::path (v) : std::filesystem::path();
#endif
}
} // namespace

std::filesystem::path home()
{
#ifdef _WIN32
    auto p = knownFolder (FOLDERID_Profile);
    return p.empty() ? env ("USERPROFILE") : p;
#else
    return env ("HOME");
#endif
}

/// Development and tests: PLENIO_VST3_HOME keeps the settings, the cache and the songs in a folder of their own.
std::filesystem::path devHome()
{
    return env ("PLENIO_VST3_HOME");
}

std::filesystem::path appData()
{
    if (auto dev = devHome(); ! dev.empty())
        return dev / "config";
#ifdef _WIN32
    auto base = knownFolder (FOLDERID_RoamingAppData);
    if (base.empty())
        base = env ("APPDATA");
    return base / "Plenio" / "VST3";
#elif defined(__APPLE__)
    return home() / "Library" / "Application Support" / "Plenio" / "VST3";
#else
    auto xdg = env ("XDG_CONFIG_HOME");
    return (xdg.empty() ? home() / ".config" : xdg) / "plenio-vst3";
#endif
}

std::filesystem::path localData()
{
    if (auto dev = devHome(); ! dev.empty())
        return dev / "cache";
#ifdef _WIN32
    auto base = knownFolder (FOLDERID_LocalAppData);
    if (base.empty())
        base = env ("LOCALAPPDATA");
    return base / "Plenio" / "VST3";
#elif defined(__APPLE__)
    return home() / "Library" / "Caches" / "Plenio" / "VST3";
#else
    auto xdg = env ("XDG_CACHE_HOME");
    return (xdg.empty() ? home() / ".cache" : xdg) / "plenio-vst3";
#endif
}

std::filesystem::path defaultLibrary()
{
    if (auto dev = devHome(); ! dev.empty())
        return dev / "Songs";
#ifdef _WIN32
    auto docs = knownFolder (FOLDERID_Documents);
    if (docs.empty())
        docs = home() / "Documents";
    return docs / "Plenio" / "Songs";
#else
    return home() / "Documents" / "Plenio" / "Songs";
#endif
}

std::filesystem::path plenioState()
{
    return home() / ".plenio";
}

std::string toUtf8 (const std::filesystem::path& path)
{
    auto u8 = path.u8string();
    return std::string (u8.begin(), u8.end());
}

std::filesystem::path fromUtf8 (std::string_view text)
{
    std::u8string u8 (text.begin(), text.end());
    return std::filesystem::path (u8);
}

std::string safeName (std::string_view text, std::size_t limit)
{
    std::string out;
    out.reserve (text.size());
    for (char c : text)
    {
        auto u = static_cast<unsigned char> (c);
        if (u < 32 || c == '<' || c == '>' || c == ':' || c == '"' || c == '/' || c == '\\' || c == '|' || c == '?' || c == '*')
            out += '_';
        else
            out += c;
    }
    // no trailing dots or spaces (Windows drops them), no leading spaces
    while (! out.empty() && (out.back() == '.' || out.back() == ' '))
        out.pop_back();
    while (! out.empty() && out.front() == ' ')
        out.erase (out.begin());

    // cut at a character boundary (UTF-8 continuation bytes are 10xxxxxx)
    if (out.size() > limit)
    {
        auto cut = limit;
        while (cut > 0 && (static_cast<unsigned char> (out[cut]) & 0xC0) == 0x80)
            --cut;
        out.resize (cut);
    }

    static const char* reserved[] = { "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6",
                                      "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6",
                                      "LPT7", "LPT8", "LPT9" };
    std::string upper;
    for (char c : out)
        upper += static_cast<char> ((c >= 'a' && c <= 'z') ? c - 32 : c);
    for (auto* r : reserved)
        if (upper == r)
            out += "_";

    return out.empty() ? std::string ("untitled") : out;
}

} // namespace plenio::paths
