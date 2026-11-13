// What the web UI talks to: one backend per plug-in instance. The editor window forwards every call from the UI
// to it and passes its events on to the UI. Everything here runs on the UI thread.
#pragma once

#include "core/json.h"

#include <filesystem>
#include <functional>
#include <optional>
#include <stdexcept>
#include <string>

namespace plenio::ui
{

/// A call the backend refuses: `code` for the UI's logic, the message for the user.
struct CallError : std::runtime_error
{
    CallError (std::string errorCode, const std::string& message)
        : std::runtime_error (message), code (std::move (errorCode)) {}

    std::string code;
};

class Backend
{
public:
    virtual ~Backend() = default;

    /// A call from the UI. Returns the result (any JSON) or throws CallError.
    virtual Json call (const std::string& method, const Json& params) = 0;

    /// Events for the UI go to `sink` while an editor is open; an empty function when it closes.
    using EventSink = std::function<void (const std::string& name, const Json& payload)>;
    virtual void setEventSink (EventSink sink) = 0;

    /// The editor's size the plug-in remembers (logical pixels), and what the user resized it to.
    virtual std::pair<int, int> editorSize() const = 0;
    virtual void setEditorSize (int width, int height) = 0;

    /// A file the UI shows by its address (`/files/…`, such as a song's cover): where it is on disk, or nothing.
    virtual std::optional<std::filesystem::path> file (const std::string& address) const
    {
        (void) address;
        return std::nullopt;
    }
};

} // namespace plenio::ui
