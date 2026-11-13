// The WebView inside the plug-in's editor window: a child window of the host's window that shows the web UI and
// carries calls (UI -> plug-in) and events (plug-in -> UI) as JSON text.
#pragma once

#include <filesystem>
#include <functional>
#include <memory>
#include <optional>
#include <string>

namespace plenio::ui
{

class WebViewPanel
{
public:
    /// A call from the UI: the request's JSON text in, the answer's JSON text out.
    using CallHandler = std::function<std::string (const std::string& request)>;
    /// A file the page shows from disk (`/files/…`): its path, or nothing.
    using FileHandler = std::function<std::optional<std::filesystem::path> (const std::string& address)>;

    /// `parent`: the host's native window (HWND on Windows). Sizes in physical pixels.
    WebViewPanel (void* parent, int width, int height, CallHandler onCall, FileHandler onFile = {});
    ~WebViewPanel();

    WebViewPanel (const WebViewPanel&) = delete;
    WebViewPanel& operator= (const WebViewPanel&) = delete;

    /// False when the system has no usable WebView (the panel then shows a message instead).
    bool ok() const;

    void setSize (int width, int height);

    /// Hands an event to the UI (`window.__plenioEvent(name, payload)`); dropped until the page has loaded.
    void emit (const std::string& name, const std::string& payloadJson);

    /// Gives the keyboard focus to the web page.
    void focus();

    /// Writes the window sizes and DPI to the log (diagnostics for host-specific scaling).
    void logLayout (const char* when);

private:
    struct Impl;
    std::unique_ptr<Impl> impl;
};

} // namespace plenio::ui
