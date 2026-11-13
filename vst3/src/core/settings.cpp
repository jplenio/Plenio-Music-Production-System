#include "core/settings.h"
#include "core/library.h"
#include "core/paths.h"

#include <algorithm>
#include <fstream>

#ifdef _WIN32
 #include <windows.h>
 #include <wincred.h>
#endif

namespace plenio::core
{

Json Settings::toJson() const
{
    return { { "schema", "plenio-vst3.settings/1" },
             { "host", host },
             { "port", port },
             { "library", library },
             { "start_comfyui", startComfyUI },
             { "licence_accepted", licenceAccepted },
             { "takes_per_run", takesPerRun },
             { "stems", stems },
             { "flat_keys", flatKeys } };
}

Settings Settings::fromJson (const Json& j)
{
    Settings s;
    s.host = cleanHost (json::str (j, "host", "127.0.0.1", 200));
    if (s.host.empty())
        s.host = "127.0.0.1";
    s.port = static_cast<int> (std::clamp<std::int64_t> (json::integer (j, "port", 0), 0, 65535));
    s.library = json::str (j, "library", {}, 2000);
    s.startComfyUI = json::boolean (j, "start_comfyui", true);
    s.licenceAccepted = json::boolean (j, "licence_accepted", false);
    s.takesPerRun = static_cast<int> (std::clamp<std::int64_t> (json::integer (j, "takes_per_run", 1), 1, 4));
    s.stems = json::boolean (j, "stems", true);
    s.flatKeys = json::boolean (j, "flat_keys", false);
    return s;
}

Settings loadSettings()
{
    auto text = readFile (paths::appData() / "settings.json", 1024 * 1024);
    if (! text)
        return {};
    auto parsed = json::parse (*text);
    return parsed ? Settings::fromJson (*parsed) : Settings {};
}

bool saveSettings (const Settings& settings)
{
    return writeFileAtomically (paths::appData() / "settings.json", settings.toJson().dump (1));
}

std::string cleanHost (std::string text)
{
    auto trim = [] (std::string& s)
    {
        while (! s.empty() && (s.back() == ' ' || s.back() == '\t' || s.back() == '/'))
            s.pop_back();
        while (! s.empty() && (s.front() == ' ' || s.front() == '\t'))
            s.erase (s.begin());
    };
    trim (text);
    if (auto scheme = text.find ("://"); scheme != std::string::npos)
        text.erase (0, scheme + 3);
    if (auto slash = text.find ('/'); slash != std::string::npos)
        text.erase (slash);
    // a port after the name (not an IPv6 address, which has several colons)
    if (std::count (text.begin(), text.end(), ':') == 1)
        text.erase (text.find (':'));
    trim (text);
    for (char c : text)
        if (! ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '.' || c == '-' || c == '_' || c == ':'))
            return "127.0.0.1";
    return text.empty() || text.size() > 200 ? std::string ("127.0.0.1") : text;
}

bool isThisComputer (const std::string& host)
{
    return host.empty() || host == "127.0.0.1" || host == "localhost" || host == "::1";
}

namespace
{
std::string cleanToken (const std::string& text)
{
    std::string out;
    for (char c : text)
        if (c > ' ' && c < 127 && out.size() < 512)
            out += c;
    return out;
}
#ifdef _WIN32
const wchar_t* credentialName = L"Plenio VST3: Song API token";
#else
std::filesystem::path tokenFile() { return paths::appData() / "api-token"; }
#endif
} // namespace

std::string loadToken()
{
#ifdef _WIN32
    PCREDENTIALW found = nullptr;
    if (! CredReadW (credentialName, CRED_TYPE_GENERIC, 0, &found) || found == nullptr)
        return {};
    std::string token (reinterpret_cast<const char*> (found->CredentialBlob), found->CredentialBlobSize);
    CredFree (found);
    return cleanToken (token);
#else
    auto text = readFile (tokenFile(), 4096);
    return text ? cleanToken (*text) : std::string();
#endif
}

bool saveToken (const std::string& text)
{
    auto token = cleanToken (text);
#ifdef _WIN32
    if (token.empty())
        return CredDeleteW (credentialName, CRED_TYPE_GENERIC, 0) || GetLastError() == ERROR_NOT_FOUND;
    CREDENTIALW c {};
    c.Type = CRED_TYPE_GENERIC;
    c.TargetName = const_cast<LPWSTR> (credentialName);
    c.CredentialBlobSize = static_cast<DWORD> (token.size());
    c.CredentialBlob = reinterpret_cast<LPBYTE> (token.data());
    c.Persist = CRED_PERSIST_LOCAL_MACHINE;
    c.UserName = const_cast<LPWSTR> (L"plenio");
    return CredWriteW (&c, 0) != FALSE;
#else
    std::error_code ec;
    if (token.empty())
    {
        std::filesystem::remove (tokenFile(), ec);
        return true;
    }
    std::filesystem::create_directories (tokenFile().parent_path(), ec);
    {
        std::ofstream out (tokenFile(), std::ios::binary | std::ios::trunc);
        if (! out)
            return false;
        // the user alone, before the token is in it
        std::filesystem::permissions (tokenFile(), std::filesystem::perms::owner_read | std::filesystem::perms::owner_write,
                                      std::filesystem::perm_options::replace, ec);
        out << token;
    }
    return true;
#endif
}

} // namespace plenio::core
