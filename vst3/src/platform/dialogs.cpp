#include "platform/dialogs.h"
#include "core/paths.h"

#ifdef _WIN32
 #include <windows.h>
 #include <shobjidl.h>
 #include <shellapi.h>
 #include <shlobj.h>
#endif

#ifndef _WIN32
 #include <spawn.h>
 #include <sys/wait.h>
 #include <unistd.h>
extern char** environ;
#endif

#include <optional>
#include <string>
#include <vector>

namespace plenio::platform
{
#ifdef _WIN32
namespace
{
template <typename T>
struct Com
{
    T* p = nullptr;
    ~Com()
    {
        if (p != nullptr)
            p->Release();
    }
    T** put() { return &p; }
    T* operator->() const { return p; }
};

std::optional<std::filesystem::path> showDialog (bool folders, const std::string& title, const std::vector<FileFilter>& filters, void* owner)
{
    Com<IFileOpenDialog> dialog;
    if (FAILED (CoCreateInstance (CLSID_FileOpenDialog, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS (dialog.put()))))
        return std::nullopt;
    DWORD options = 0;
    dialog->GetOptions (&options);
    options |= FOS_FORCEFILESYSTEM | FOS_PATHMUSTEXIST;
    if (folders)
        options |= FOS_PICKFOLDERS;
    else
        options |= FOS_FILEMUSTEXIST;
    dialog->SetOptions (options);
    auto wideTitle = paths::fromUtf8 (title).wstring();
    dialog->SetTitle (wideTitle.c_str());

    std::vector<std::wstring> texts;
    std::vector<COMDLG_FILTERSPEC> specs;
    texts.reserve (filters.size() * 2);
    for (const auto& f : filters)
    {
        texts.push_back (paths::fromUtf8 (f.label).wstring());
        texts.push_back (paths::fromUtf8 (f.patterns).wstring());
    }
    for (std::size_t i = 0; i < filters.size(); ++i)
        specs.push_back ({ texts[i * 2].c_str(), texts[i * 2 + 1].c_str() });
    if (! folders && ! specs.empty())
        dialog->SetFileTypes (static_cast<UINT> (specs.size()), specs.data());

    HWND parent = owner != nullptr ? GetAncestor (static_cast<HWND> (owner), GA_ROOT) : GetActiveWindow();
    if (dialog->Show (parent) != S_OK)
        return std::nullopt;
    Com<IShellItem> item;
    if (FAILED (dialog->GetResult (item.put())))
        return std::nullopt;
    PWSTR path = nullptr;
    if (FAILED (item->GetDisplayName (SIGDN_FILESYSPATH, &path)) || path == nullptr)
        return std::nullopt;
    std::filesystem::path result (path);
    CoTaskMemFree (path);
    return result;
}
} // namespace
#endif

#ifndef _WIN32
namespace
{
/// Runs a program (no shell between) and gives its standard output without the last line break; nothing when it
/// cannot start or ends with an error (a dialog cancelled).
std::optional<std::string> run (const std::vector<std::string>& args)
{
    int pipefd[2] = { -1, -1 };
    if (pipe (pipefd) != 0)
        return std::nullopt;
    posix_spawn_file_actions_t actions;
    posix_spawn_file_actions_init (&actions);
    posix_spawn_file_actions_adddup2 (&actions, pipefd[1], STDOUT_FILENO);
    posix_spawn_file_actions_addclose (&actions, pipefd[0]);
    std::vector<char*> argv;
    for (const auto& a : args)
        argv.push_back (const_cast<char*> (a.c_str()));
    argv.push_back (nullptr);
    pid_t pid = 0;
    const int started = posix_spawnp (&pid, argv[0], &actions, nullptr, argv.data(), environ);
    posix_spawn_file_actions_destroy (&actions);
    close (pipefd[1]);
    if (started != 0)
    {
        close (pipefd[0]);
        return std::nullopt;
    }
    std::string out;
    char buffer[4096];
    for (ssize_t n; (n = read (pipefd[0], buffer, sizeof buffer)) > 0;)
        out.append (buffer, static_cast<std::size_t> (n));
    close (pipefd[0]);
    int status = 0;
    waitpid (pid, &status, 0);
    if (! WIFEXITED (status) || WEXITSTATUS (status) != 0)
        return std::nullopt;
    while (! out.empty() && (out.back() == '\n' || out.back() == '\r'))
        out.pop_back();
    return out;
}

 #ifdef __APPLE__
/// Text inside an AppleScript string.
std::string quoted (const std::string& text)
{
    std::string out = "\"";
    for (char c : text)
    {
        if (c == '"' || c == '\\')
            out += '\\';
        out += c;
    }
    return out + "\"";
}

/// A dialog of System Events (a process of its own: the host's main thread waits for it, so the host itself must
/// not be the one asked).
std::optional<std::filesystem::path> appleDialog (const std::string& choose)
{
    auto answer = run ({ "osascript", "-e", "tell application \"System Events\" to activate", "-e",
                         "tell application \"System Events\" to POSIX path of (" + choose + ")" });
    if (! answer || answer->empty())
        return std::nullopt;
    return paths::fromUtf8 (*answer);
}
 #endif
} // namespace
#endif

std::optional<std::filesystem::path> chooseFile (const std::string& title, const std::vector<FileFilter>& filters, void* owner)
{
#ifdef _WIN32
    return showDialog (false, title, filters, owner);
#elif defined(__APPLE__)
    (void) owner;
    // "*.wav;*.flac" -> {"wav", "flac"}
    std::string types;
    for (const auto& f : filters)
        for (std::size_t at = 0; at < f.patterns.size();)
        {
            auto end = f.patterns.find (';', at);
            auto pattern = f.patterns.substr (at, end == std::string::npos ? std::string::npos : end - at);
            if (auto dot = pattern.rfind ('.'); dot != std::string::npos && pattern.find ('*') != std::string::npos)
                types += (types.empty() ? "" : ", ") + quoted (pattern.substr (dot + 1));
            if (end == std::string::npos)
                break;
            at = end + 1;
        }
    return appleDialog ("choose file with prompt " + quoted (title) + (types.empty() ? "" : " of type {" + types + "}"));
#else
    (void) owner;
    std::vector<std::string> args { "zenity", "--file-selection", "--title=" + title };
    for (const auto& f : filters)
    {
        std::string patterns = f.patterns;
        for (auto& c : patterns)
            if (c == ';')
                c = ' ';
        args.push_back ("--file-filter=" + f.label + " | " + patterns);
    }
    auto answer = run (args);
    return answer && ! answer->empty() ? std::optional<std::filesystem::path> (paths::fromUtf8 (*answer)) : std::nullopt;
#endif
}

std::optional<std::filesystem::path> chooseFolder (const std::string& title, void* owner)
{
#ifdef _WIN32
    return showDialog (true, title, {}, owner);
#elif defined(__APPLE__)
    (void) owner;
    return appleDialog ("choose folder with prompt " + quoted (title));
#else
    (void) owner;
    auto answer = run ({ "zenity", "--file-selection", "--directory", "--title=" + title });
    return answer && ! answer->empty() ? std::optional<std::filesystem::path> (paths::fromUtf8 (*answer)) : std::nullopt;
#endif
}

void reveal (const std::filesystem::path& path)
{
#ifdef _WIN32
    std::error_code ec;
    if (std::filesystem::is_directory (path, ec))
        ShellExecuteW (nullptr, L"open", path.wstring().c_str(), nullptr, nullptr, SW_SHOWNORMAL);
    else
    {
        auto args = L"/select,\"" + path.wstring() + L"\"";
        ShellExecuteW (nullptr, L"open", L"explorer.exe", args.c_str(), nullptr, SW_SHOWNORMAL);
    }
#elif defined(__APPLE__)
    std::error_code ec;
    if (std::filesystem::is_directory (path, ec))
        run ({ "open", paths::toUtf8 (path) });
    else
        run ({ "open", "-R", paths::toUtf8 (path) });
#else
    std::error_code ec;
    run ({ "xdg-open", paths::toUtf8 (std::filesystem::is_directory (path, ec) ? path : path.parent_path()) });
#endif
}

void openExternally (const std::string& target)
{
#ifdef _WIN32
    auto wide = paths::fromUtf8 (target).wstring();
    ShellExecuteW (nullptr, L"open", wide.c_str(), nullptr, nullptr, SW_SHOWNORMAL);
#elif defined(__APPLE__)
    run ({ "open", target });
#else
    run ({ "xdg-open", target });
#endif
}

} // namespace plenio::platform
