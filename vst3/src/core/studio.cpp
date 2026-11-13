#include "core/studio.h"
#include "plenio_version.h"
#include "core/log.h"
#include "core/paths.h"
#include "platform/main_thread.h"

#include <chrono>

#ifdef _WIN32
 #include <windows.h>
#endif

namespace plenio::core
{
namespace
{
std::mutex& singletonLock()
{
    static std::mutex m;
    return m;
}

std::weak_ptr<Studio>& singleton()
{
    static std::weak_ptr<Studio> s;
    return s;
}

std::int64_t now()
{
    return std::chrono::duration_cast<std::chrono::seconds> (std::chrono::steady_clock::now().time_since_epoch()).count();
}

/// How Plenio last started ComfyUI: main.py, its Python, the arguments (the newest entry whose main.py exists).
struct RememberedStart
{
    std::filesystem::path main;
    std::filesystem::path python;
    std::vector<std::string> args;
};

std::optional<RememberedStart> rememberedStart()
{
    auto text = readFile (paths::plenioState() / "player" / "comfyui-start.json", 1024 * 1024);
    if (! text)
        return std::nullopt;
    auto parsed = json::parse (*text);
    if (! parsed || ! parsed->is_object())
        return std::nullopt;
    std::optional<RememberedStart> best;
    double bestAt = -1;
    for (const auto& [main, entry] : parsed->items())
    {
        auto path = paths::fromUtf8 (main);
        std::error_code ec;
        if (! entry.is_object() || ! std::filesystem::is_regular_file (path, ec))
            continue;
        auto at = json::num (entry, "at", 0.0);
        if (at <= bestAt)
            continue;
        RememberedStart s;
        s.main = path;
        s.python = paths::fromUtf8 (json::str (entry, "python", {}, 2000));
        for (const auto& a : json::arr (entry, "args"))
            if (a.is_string() && s.args.size() < 64)
                s.args.push_back (a.get<std::string>());
        best = s;
        bestAt = at;
    }
    return best;
}
} // namespace

Json Connection::toJson() const
{
    const char* names[] = { "searching", "connected", "offline", "starting" };
    return { { "state", names[static_cast<int> (state)] },
             { "host", host },
             { "port", port },
             { "plenio", plenio },
             { "api", api },
             { "apiMajor", apiMajor },
             { "problem", problem },
             { "remote", ! isThisComputer (host) },
             { "comfyui", comfyui },
             { "features", std::vector<std::string> (features.begin(), features.end()) },
             { "recommended", PLENIO_RECOMMENDED_PLENIO },
             { "message", message } };
}

std::shared_ptr<Studio> Studio::get()
{
    std::scoped_lock l (singletonLock());
    if (auto s = singleton().lock())
        return s;
    std::shared_ptr<Studio> s (new Studio());
    singleton() = s;
    return s;
}

Studio::Studio()
{
    config = loadSettings();
    bearer = loadToken();
    loadCache();
    current.message = "Looking for ComfyUI with Plenio …";
    monitorThread = std::thread ([this] { monitor(); });
    for (int i = 0; i < 3; ++i)
        workers.emplace_back ([this] { worker(); });
}

Studio::~Studio()
{
    {
        std::scoped_lock l (lock);
        stop = true;
        tasks.clear();
    }
    token.cancel(); // every request of the workers returns at once
    wakeMonitor.notify_all();
    wakeWorkers.notify_all();
    if (monitorThread.joinable())
        monitorThread.join();
    for (auto& w : workers)
        if (w.joinable())
            w.join();
}

bool Studio::stopping() const
{
    std::scoped_lock l (lock);
    return stop;
}

Connection Studio::connection() const
{
    std::scoped_lock l (lock);
    return current;
}

std::optional<PlenioClient> Studio::client() const
{
    std::scoped_lock l (lock);
    if (! current.connected())
        return std::nullopt;
    return PlenioClient (current.host, current.port, token, bearer, current.apiMajor);
}

bool Studio::hasToken() const
{
    std::scoped_lock l (lock);
    return ! bearer.empty();
}

void Studio::setToken (const std::string& text)
{
    if (! saveToken (text))
        log::warn ("studio: the token could not be kept in the system's credential store");
    {
        std::scoped_lock l (lock);
        bearer = loadToken();
        if (bearer.empty() && ! text.empty())
            bearer = text; // not kept, but used until the DAW closes
    }
    refresh();
}

void Studio::refresh()
{
    wakeMonitor.notify_all();
}

Settings Studio::settings() const
{
    std::scoped_lock l (lock);
    return config;
}

void Studio::setSettings (const Settings& s)
{
    bool reconnect = false;
    {
        std::scoped_lock l (lock);
        reconnect = s.port != config.port || s.host != config.host;
        config = s;
    }
    saveSettings (s);
    if (reconnect)
        refresh();
}

Library Studio::library() const
{
    auto s = settings();
    return Library (s.library.empty() ? paths::defaultLibrary() : paths::fromUtf8 (s.library));
}

void Studio::run (std::function<void()> task)
{
    {
        std::scoped_lock l (lock);
        if (stop)
            return;
        tasks.push_back (std::move (task));
    }
    wakeWorkers.notify_one();
}

void Studio::worker()
{
    for (;;)
    {
        std::function<void()> task;
        {
            std::unique_lock l (lock);
            wakeWorkers.wait (l, [this] { return stop || ! tasks.empty(); });
            if (stop)
                return;
            task = std::move (tasks.front());
            tasks.pop_front();
        }
        try
        {
            task();
        }
        catch (const std::exception& e)
        {
            log::error ("studio task failed: {}", e.what());
        }
        catch (...)
        {
            log::error ("studio task failed");
        }
    }
}

int Studio::listen (std::function<void()> onChange)
{
    std::scoped_lock l (lock);
    int id = nextListener++;
    listeners[id] = std::move (onChange);
    return id;
}

void Studio::unlisten (int id)
{
    std::scoped_lock l (lock);
    listeners.erase (id);
}

void Studio::notify()
{
    // on the main thread; a listener that went in between is not called
    platform::postToMainThread ([weak = std::weak_ptr<Studio> (singleton())]
    {
        auto self = weak.lock();
        if (! self)
            return;
        std::vector<std::function<void()>> calls;
        {
            std::scoped_lock l (self->lock);
            for (auto& [id, fn] : self->listeners)
                calls.push_back (fn);
        }
        for (auto& fn : calls)
            fn();
    });
}

std::vector<int> Studio::candidatePorts() const
{
    std::vector<int> ports;
    auto add = [&] (int p)
    {
        if (p > 0 && p < 65536 && std::find (ports.begin(), ports.end(), p) == ports.end())
            ports.push_back (p);
    };
    Settings s = settings();
    if (s.port > 0)
    {
        add (s.port);
        return ports;
    }
    if (auto start = rememberedStart())
        for (std::size_t i = 0; i + 1 < start->args.size(); ++i)
            if (start->args[i] == "--port")
                add (std::atoi (start->args[i + 1].c_str()));
    add (8188);
    add (8000);
    return ports;
}

bool Studio::probe (const std::string& host, int port, Connection& into) const
{
    std::string secret;
    {
        std::scoped_lock l (lock);
        secret = bearer;
    }
    // Song API v2 (Plenio 2.0) when it is there, v1 for a Plenio before it
    int major = 2;
    const int patience = isThisComputer (host) ? 800 : 2500; // another computer: a name to look up, a network in between
    int status = PlenioClient (host, port, token, secret, 2).probe ("/plenio/api/v2", patience);
    if (status == 404)
    {
        major = 1;
        status = PlenioClient (host, port, token, secret, 1).probe ("/plenio/api/v1", patience);
    }
    if (status == 401 || status == 403)
    {
        // Plenio answers, but not to this computer: say why instead of "not running"
        into.host = host;
        into.port = port;
        into.problem = status == 401 ? "token" : "remote_off";
        return false;
    }
    if (status != 200)
        return false;
    PlenioClient c (host, port, token, secret, major);
    auto info = c.get (c.api (""), 5);
    if (! ok (info))
        return false;
    const auto& j = std::get<Json> (info);
    into.host = host;
    into.port = port;
    into.apiMajor = major;
    into.problem.clear();
    into.plenio = json::str (j, "plenio", {}, 40);
    into.api = json::str (j, "version", {}, 40);
    into.comfyui = json::str (j, "comfyui", {}, 40);
    into.features.clear();
    for (const auto& f : json::arr (j, "features"))
        if (f.is_string())
            into.features.insert (f.get<std::string>());
    if (major >= 2) // what v1 announced as features is part of v2
        into.features.insert ({ "stems", "bars", "models" });
    return true;
}

void Studio::fetchDescriptions (const PlenioClient& c)
{
    Json fresh = Json::object();
    for (const char* id : { "yue2-song", "yue2-cover" })
        if (auto t = c.get (c.api (std::string ("/templates/") + id), 30); ok (t))
            fresh["templates"][id] = std::get<Json> (t);
    for (const char* kind : { "song", "cover" })
        if (auto b = c.get (c.api (std::string ("/briefs?kind=") + kind), 30); ok (b))
            fresh["briefs"][kind] = std::get<Json> (b);
    if (auto m = c.get (c.api ("/models"), 30); ok (m))
        fresh["models"] = std::get<Json> (m);
    {
        std::scoped_lock l (lock);
        for (auto& [k, v] : fresh.items())
            cache[k] = v;
    }
    saveCache();
}

void Studio::monitor()
{
    bool announced = false;
    for (;;)
    {
        Connection found;
        bool connected = false;
        auto host = settings().host;
        for (int port : candidatePorts())
        {
            if (stopping())
                return;
            if (probe (host, port, found))
            {
                connected = true;
                break;
            }
        }

        bool changed = false;
        std::optional<PlenioClient> fetchFrom;
        {
            std::scoped_lock l (lock);
            auto before = current;
            if (connected)
            {
                found.state = Connection::State::connected;
                found.message = "Plenio " + found.plenio + " on ComfyUI " + found.comfyui;
                if (! found.has ("bars") || ! found.has ("stems"))
                    found.message += std::string (" (Plenio ") + PLENIO_RECOMMENDED_PLENIO + " brings stems and measured bars)";
                startRequested = false;
                if (before.state != Connection::State::connected || before.port != found.port || before.plenio != found.plenio || before.host != found.host || before.apiMajor != found.apiMajor)
                    fetchFrom = PlenioClient (found.host, found.port, token, bearer, found.apiMajor);
                current = found;
            }
            else if (startRequested && now() - startedAt < 300)
            {
                current.state = Connection::State::starting;
                current.message = "ComfyUI is starting …";
            }
            else
            {
                startRequested = false;
                current.state = Connection::State::offline;
                current.features.clear();
                current.problem = found.problem;
                current.host = host;
                if (found.problem == "token")
                    current.message = bearer.empty() ? "The ComfyUI on " + host + " asks for a token. Make one there in Plenio Setup > API access and enter it in the settings."
                                                     : "The ComfyUI on " + host + " does not accept the token. Make a new one there in Plenio Setup > API access.";
                else if (found.problem == "remote_off")
                    current.message = "The ComfyUI on " + host + " answers no other computer ([api] remote = \"off\" in its Plenio configuration).";
                else if (! isThisComputer (host))
                    current.message = "No ComfyUI with Plenio answers on " + host + ". Playing and editing work; to make songs, start ComfyUI there with --listen.";
                else
                    current.message = "ComfyUI with Plenio is not running. Playing and editing work; to make songs, start ComfyUI.";
            }
            changed = ! announced || before.state != current.state || before.port != current.port || before.message != current.message || before.host != current.host;
        }
        if (fetchFrom)
            fetchDescriptions (*fetchFrom);
        if (changed)
        {
            announced = true;
            log::info ("studio: {}", connection().message);
            notify();
        }

        std::unique_lock l (lock);
        auto wait = current.connected() ? std::chrono::seconds (10) : std::chrono::seconds (3);
        wakeMonitor.wait_for (l, wait);
        if (stop)
            return;
    }
}

bool Studio::startComfyUI (std::string& why)
{
    if (! isThisComputer (settings().host))
    {
        why = "ComfyUI runs on another computer (" + settings().host + "): start it there.";
        return false;
    }
    auto start = rememberedStart();
    if (! start)
    {
        why = "Plenio has not started ComfyUI on this computer yet (no ~/.plenio/player/comfyui-start.json). Start ComfyUI once yourself.";
        return false;
    }
#ifdef _WIN32
    auto quote = [] (const std::wstring& s)
    {
        if (! s.empty() && s.find_first_of (L" \t\"") == std::wstring::npos)
            return s;
        std::wstring out = L"\"";
        for (wchar_t c : s)
        {
            if (c == L'"')
                out += L'\\';
            out += c;
        }
        return out + L"\"";
    };
    std::wstring command = quote (start->python.wstring()) + L" " + quote (start->main.wstring());
    for (const auto& a : start->args)
        command += L" " + quote (paths::fromUtf8 (a).wstring());

    auto logFile = paths::localData() / "comfyui.log";
    std::error_code ec;
    std::filesystem::create_directories (logFile.parent_path(), ec);
    SECURITY_ATTRIBUTES sa { sizeof (sa), nullptr, TRUE };
    HANDLE out = CreateFileW (logFile.wstring().c_str(), GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE, &sa,
                              CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, nullptr);
    STARTUPINFOW si {};
    si.cb = sizeof (si);
    si.dwFlags = STARTF_USESTDHANDLES;
    si.hStdOutput = out;
    si.hStdError = out;
    si.hStdInput = nullptr;
    PROCESS_INFORMATION pi {};
    auto workDir = start->main.parent_path().wstring();
    std::vector<wchar_t> buffer (command.begin(), command.end());
    buffer.push_back (0);
    BOOL created = CreateProcessW (nullptr, buffer.data(), nullptr, nullptr, TRUE,
                                   CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP | DETACHED_PROCESS, nullptr,
                                   workDir.c_str(), &si, &pi);
    if (out != INVALID_HANDLE_VALUE)
        CloseHandle (out);
    if (! created)
    {
        why = "ComfyUI could not be started (" + std::to_string (GetLastError()) + ")";
        return false;
    }
    CloseHandle (pi.hThread);
    CloseHandle (pi.hProcess);
    log::info ("studio: started ComfyUI ({}), log {}", paths::toUtf8 (start->main), paths::toUtf8 (logFile));
#else
    why = "starting ComfyUI is not available on this platform yet";
    return false;
#endif
    {
        std::scoped_lock l (lock);
        startRequested = true;
        startedAt = now();
        current.state = Connection::State::starting;
        current.message = "ComfyUI is starting …";
    }
    notify();
    refresh();
    return true;
}

Json Studio::templateDetail (const std::string& id) const
{
    std::scoped_lock l (lock);
    return json::obj (json::obj (cache, "templates"), id);
}

Json Studio::briefs (const std::string& kind) const
{
    std::scoped_lock l (lock);
    return json::obj (json::obj (cache, "briefs"), kind);
}

Json Studio::models() const
{
    std::scoped_lock l (lock);
    return json::obj (cache, "models");
}

void Studio::loadCache()
{
    auto text = readFile (paths::localData() / "api-cache.json", 64u * 1024u * 1024u);
    if (! text)
        return;
    if (auto parsed = json::parse (*text); parsed && parsed->is_object())
        cache = *parsed;
}

void Studio::saveCache() const
{
    Json copy;
    {
        std::scoped_lock l (lock);
        copy = cache;
    }
    writeFileAtomically (paths::localData() / "api-cache.json", copy.dump());
}

} // namespace plenio::core
