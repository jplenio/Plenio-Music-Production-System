// The studio: the ComfyUI with Plenio this computer runs, as every plug-in instance of the process sees it. One per
// process (shared by the instrument and Plenio ARA instances): it finds ComfyUI, watches it, keeps the Song API's
// descriptions (templates, styles, models) cached on disk so that the forms work offline, starts the owner's
// ComfyUI when asked, and runs the long work (jobs, downloads) on worker threads.
#pragma once

#include "core/client.h"
#include "core/library.h"
#include "core/settings.h"

#include <condition_variable>
#include <deque>
#include <functional>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <string>
#include <thread>
#include <vector>

namespace plenio::core
{

struct Connection
{
    enum class State { searching, connected, offline, starting };
    State state = State::searching;
    std::string host;
    int port = 0;
    std::string plenio;   // Plenio's version
    std::string api;      // the Song API's version ("2.0"; "1.4" for a Plenio before 2.0)
    int apiMajor = 2;
    std::string problem;  // why it is not connected, when Plenio said so: "token" (it asks for one), "remote_off"
    std::string comfyui;
    std::set<std::string> features; // "stems", "bars", "models" (Song API 1.4)
    std::string message;  // what the UI says about it

    bool connected() const { return state == State::connected; }
    bool has (const std::string& feature) const { return features.count (feature) > 0; }
    Json toJson() const;
};

class Studio
{
public:
    /// The process's studio (made by the first instance, gone with the last).
    static std::shared_ptr<Studio> get();
    ~Studio();

    Studio (const Studio&) = delete;
    Studio& operator= (const Studio&) = delete;

    Connection connection() const;
    /// A client for the connected ComfyUI (nothing while none answers).
    std::optional<PlenioClient> client() const;
    /// Look for ComfyUI again now.
    void refresh();
    /// Starts the owner's ComfyUI the way Plenio last started it (~/.plenio/player/comfyui-start.json).
    bool startComfyUI (std::string& why);

    /// The Song API's descriptions, from ComfyUI or (offline) the cache.
    Json templateDetail (const std::string& id) const;
    Json briefs (const std::string& kind) const;
    Json models() const;

    Settings settings() const;
    void setSettings (const Settings& settings);
    /// The token for a ComfyUI on another computer (kept in the system's credential store).
    bool hasToken() const;
    void setToken (const std::string& token);
    Library library() const;

    /// Runs `task` on a worker thread (long work: jobs, downloads, decoding).
    void run (std::function<void()> task);
    /// Called on the main thread whenever the connection changes; returns an id for unlisten.
    int listen (std::function<void()> onChange);
    void unlisten (int id);

    /// The token every worker's request uses: cancelled when the studio goes.
    const CancelToken& cancelToken() const { return token; }
    bool stopping() const;

private:
    Studio();
    void monitor();
    void worker();
    bool probe (const std::string& host, int port, Connection& into) const;
    void fetchDescriptions (const PlenioClient& client);
    void loadCache();
    void saveCache() const;
    void notify();
    std::vector<int> candidatePorts() const;

    mutable std::mutex lock;
    Connection current;
    Settings config;
    std::string bearer;
    Json cache = Json::object(); // templates {id: …}, briefs {song: …, cover: …}, models
    CancelToken token;
    bool stop = false;
    bool startRequested = false;
    std::int64_t startedAt = 0;
    std::condition_variable wakeMonitor;
    std::condition_variable wakeWorkers;
    std::deque<std::function<void()>> tasks;
    std::map<int, std::function<void()>> listeners;
    int nextListener = 1;
    std::thread monitorThread;
    std::vector<std::thread> workers;
};

} // namespace plenio::core
