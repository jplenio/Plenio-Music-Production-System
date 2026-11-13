// HTTP to the Plenio Song API of a ComfyUI: this computer's (127.0.0.1) or, with a token, another one's. The client
// knows which Song API it talks to (v2 from Plenio 2.0 on, v1 before). Blocking calls for worker threads, never for
// the UI or audio thread. Errors come back in words: Plenio's own error object, or what the network said.
#pragma once

#include "core/json.h"

#include <cstdint>
#include <filesystem>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <variant>

namespace plenio::core
{

struct ApiError
{
    int status = 0;          // HTTP status; 0: no answer
    std::string code;        // Plenio's code (invalid_value, not_found, …) or "network"
    std::string message;     // for people
    std::string hint;
    std::string field;

    bool network() const { return status == 0; }
    std::string text() const { return hint.empty() ? message : message + " (" + hint + ")"; }
};

template <typename T>
using Result = std::variant<T, ApiError>;

template <typename T>
bool ok (const Result<T>& r) { return std::holds_alternative<T> (r); }

/// Stops every request made with it, from another thread (a plug-in that goes must not wait for the network).
class CancelToken
{
public:
    CancelToken();
    void cancel();
    bool cancelled() const;

    struct Impl;
    std::shared_ptr<Impl> impl;
};

class PlenioClient
{
public:
    /// `bearer`: the API token of a ComfyUI on another computer (empty: none is sent). `api`: the Song API's major
    /// version this ComfyUI answers with (2, or 1 for a Plenio before 2.0).
    PlenioClient (std::string host, int port, CancelToken token = {}, std::string bearer = {}, int api = 2);

    int apiVersion() const { return apiMajor; }
    /// A path of the Song API this ComfyUI speaks: api ("/jobs") -> "/plenio/api/v2/jobs".
    std::string api (const std::string& path) const;
    /// A job's path, by its id: "job_…" is a v2 job, anything else one a Plenio 1.x (or a project saved with it) made.
    static std::string jobPath (const std::string& id);
    /// The routes that turn a score into MIDI and back (their names differ between the two APIs).
    std::string scorePath (bool toMidi) const;

    const std::string& host() const { return hostName; }
    int port() const { return portNumber; }
    std::string baseUrl() const;

    Result<Json> get (const std::string& path, int timeoutSeconds = 30) const;
    Result<Json> post (const std::string& path, const Json& body, const std::string& idempotencyKey = {}, int timeoutSeconds = 120) const;
    Result<Json> del (const std::string& path, int timeoutSeconds = 30) const;

    /// Downloads to `target` through a temporary file; `progress(done, total)` may stop it by returning false.
    std::optional<ApiError> download (const std::string& path, const std::filesystem::path& target,
                                      const std::function<bool (std::uint64_t, std::uint64_t)>& progress = {}) const;

    /// Uploads a file as the request body (POST), e.g. a cover's recording.
    Result<Json> upload (const std::string& path, const std::filesystem::path& file, const std::string& contentType) const;

    /// Asks for the Song API's index at `path` with a short timeout: the HTTP status (0: nobody answers).
    int probe (const std::string& path, int timeoutMilliseconds = 1500) const;

private:
    std::string hostName;
    int portNumber;
    CancelToken token;
    std::string bearerToken;
    int apiMajor = 2;
};

/// Percent-encoding of a path segment (UTF-8).
std::string encodeSegment (std::string_view text);

} // namespace plenio::core
