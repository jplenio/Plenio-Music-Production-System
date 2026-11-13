#include "ui/webview_panel.h"
#include "ui/webui_resources.h"
#include "core/json.h"
#include "core/log.h"
#include "core/paths.h"

#include <filesystem>
#include <fstream>
#include <optional>
#include <sstream>

#ifdef _WIN32
 #include <windows.h>
 #include <shellapi.h>

namespace
{
// choc puts WebView2's data in a folder named after the host's exe; a plug-in keeps its own (cmake/patches)
std::wstring plenioWebViewDataFolder()
{
    std::error_code ec;
    auto folder = plenio::paths::localData() / "WebView2";
    std::filesystem::create_directories (folder, ec);
    return folder.wstring();
}
} // namespace

 #define CHOC_WEBVIEW_USER_DATA_FOLDER_FN ::plenioWebViewDataFolder
#endif

#include "choc/gui/choc_WebView.h"

namespace plenio::ui
{
namespace
{
std::string environment (const char* name)
{
#ifdef _WIN32
    wchar_t buffer[4096] = {};
    std::wstring wide (name, name + std::strlen (name));
    auto n = GetEnvironmentVariableW (wide.c_str(), buffer, 4096);
    if (n == 0 || n >= 4096)
        return {};
    return paths::toUtf8 (std::filesystem::path (std::wstring (buffer, n)));
#else
    const char* v = std::getenv (name);
    return v != nullptr ? std::string (v) : std::string();
#endif
}

std::string mimeFor (const std::filesystem::path& file)
{
    auto ext = file.extension().string();
    for (auto& c : ext)
        c = static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
    if (ext == ".html") return "text/html; charset=utf-8";
    if (ext == ".js" || ext == ".mjs") return "text/javascript; charset=utf-8";
    if (ext == ".css") return "text/css; charset=utf-8";
    if (ext == ".json") return "application/json";
    if (ext == ".svg") return "image/svg+xml";
    if (ext == ".png") return "image/png";
    if (ext == ".jpg" || ext == ".jpeg") return "image/jpeg";
    if (ext == ".woff2") return "font/woff2";
    return "application/octet-stream";
}

std::string quoteJs (const std::string& text)
{
    return Json (text).dump();
}

void openExternally (const std::string& uri)
{
#ifdef _WIN32
    auto wide = paths::fromUtf8 (uri).wstring();
    ShellExecuteW (nullptr, L"open", wide.c_str(), nullptr, nullptr, SW_SHOWNORMAL);
#elif defined(__APPLE__)
    if (id url = choc::objc::callClass<id> ("NSURL", "URLWithString:", choc::objc::getNSString (uri)))
        choc::objc::call<BOOL> (choc::objc::callClass<id> ("NSWorkspace", "sharedWorkspace"), "openURL:", url);
#else
    (void) uri;
#endif
}

#ifdef __APPLE__
/// The WebView's NSView inside the host's: the whole of it, and growing with it.
void fill (id view, int width, int height)
{
    choc::objc::call<void> (view, "setFrame:", choc::objc::CGRect { { 0, 0 }, { static_cast<choc::objc::CGFloat> (width), static_cast<choc::objc::CGFloat> (height) } });
}
#endif
} // namespace

#ifdef _WIN32
namespace
{
const wchar_t* containerClass = L"PlenioVST3Editor";
HBRUSH backgroundBrush = nullptr;

HINSTANCE moduleHandle()
{
    HMODULE module = nullptr;
    GetModuleHandleExW (GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
                        reinterpret_cast<LPCWSTR> (&moduleHandle), &module);
    return module;
}

LRESULT CALLBACK containerProc (HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
        case WM_SIZE:
            for (HWND child = GetWindow (hwnd, GW_CHILD); child != nullptr; child = GetWindow (child, GW_HWNDNEXT))
                SetWindowPos (child, nullptr, 0, 0, LOWORD (lParam), HIWORD (lParam), SWP_NOZORDER | SWP_NOACTIVATE);
            return 0;
        case WM_ERASEBKGND:
        {
            RECT r;
            GetClientRect (hwnd, &r);
            FillRect (reinterpret_cast<HDC> (wParam), &r, backgroundBrush);
            return 1;
        }
        case WM_CTLCOLORSTATIC:
            SetTextColor (reinterpret_cast<HDC> (wParam), RGB (230, 226, 240));
            SetBkColor (reinterpret_cast<HDC> (wParam), RGB (20, 18, 26));
            return reinterpret_cast<LRESULT> (backgroundBrush);
        default:
            return DefWindowProcW (hwnd, message, wParam, lParam);
    }
}

void registerContainerClass()
{
    if (backgroundBrush == nullptr)
        backgroundBrush = CreateSolidBrush (RGB (20, 18, 26));
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof (wc);
    wc.lpfnWndProc = containerProc;
    wc.hInstance = moduleHandle();
    wc.hCursor = LoadCursor (nullptr, IDC_ARROW);
    wc.hbrBackground = backgroundBrush;
    wc.lpszClassName = containerClass;
    RegisterClassExW (&wc); // already registered by an earlier editor: fine
}
} // namespace
#endif

struct WebViewPanel::Impl
{
    CallHandler onCall;
    FileHandler onFile;
    std::unique_ptr<choc::ui::WebView> webview;
    bool pageLoaded = false;
    std::filesystem::path devFolder;
#ifdef _WIN32
    HWND container = nullptr;
    HWND message = nullptr;
#endif

    std::optional<choc::ui::WebView::Options::Resource> fetch (const std::string& requested)
    {
        auto path = requested.substr (0, requested.find_first_of ("?#"));
        if (path.empty() || path == "/")
            path = "/index.html";

        // files from disk the plug-in names (a song's cover): nothing else of the disk is reachable
        if (path.rfind ("/files/", 0) == 0)
        {
            if (auto file = onFile ? onFile (path) : std::nullopt)
            {
                std::ifstream in (*file, std::ios::binary);
                if (in)
                {
                    std::ostringstream content;
                    content << in.rdbuf();
                    return choc::ui::WebView::Options::Resource (content.str(), mimeFor (*file));
                }
            }
            return std::nullopt;
        }

        if (! devFolder.empty())
        {
            auto file = devFolder / paths::fromUtf8 (path.substr (1));
            std::ifstream in (file, std::ios::binary);
            if (in)
            {
                std::ostringstream content;
                content << in.rdbuf();
                return choc::ui::WebView::Options::Resource (content.str(), mimeFor (file));
            }
        }

        if (auto* f = webui::find (path))
            return choc::ui::WebView::Options::Resource (
                std::string_view (reinterpret_cast<const char*> (f->data), f->size), f->mime);

        log::warn ("web UI: no resource {}", path);
        return std::nullopt;
    }
};

WebViewPanel::WebViewPanel (void* parent, int width, int height, CallHandler handler, FileHandler files)
    : impl (std::make_unique<Impl>())
{
    impl->onCall = std::move (handler);
    impl->onFile = std::move (files);
    if (auto dir = environment ("PLENIO_WEBUI_DIR"); ! dir.empty())
        impl->devFolder = paths::fromUtf8 (dir);
    auto devUrl = environment ("PLENIO_WEBUI_URL");

#ifdef _WIN32
    registerContainerClass();
    impl->container = CreateWindowExW (0, containerClass, L"Plenio", WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN,
                                       0, 0, width, height, static_cast<HWND> (parent), nullptr, moduleHandle(), nullptr);
    if (impl->container == nullptr)
    {
        log::error ("editor: the container window could not be created ({})", GetLastError());
        return;
    }
#endif

    choc::ui::WebView::Options options;
    options.transparentBackground = true; // the container's dark background shows while the page loads
    options.enableDebugMode = ! impl->devFolder.empty() || ! devUrl.empty() || ! environment ("PLENIO_WEBUI_DEBUG").empty();
    options.fetchResource = [this] (const std::string& path) { return impl->fetch (path); };
    options.shouldAllowRequest = [] (const choc::ui::WebView::Options::Request& request)
    {
        // the page itself and the dev server stay inside; links (docs, licences) open in the user's browser
        if (request.uri.rfind ("http://localhost", 0) == 0 || request.uri.rfind ("http://127.0.0.1", 0) == 0)
            return true;
        if (request.uri.rfind ("https://", 0) == 0 || request.uri.rfind ("http://", 0) == 0 || request.uri.rfind ("mailto:", 0) == 0)
        {
            openExternally (request.uri);
            return false;
        }
        return true;
    };
    // WebView2 gets ready only after the host's message loop has run a little: the native function is bound then,
    // and the page is loaded again so that its script finds the function from the start
    options.webviewIsReady = [this, devUrl] (choc::ui::WebView& view)
    {
        view.bind ("plenioCall", [this] (const choc::value::ValueView& args) -> choc::value::Value
        {
            impl->pageLoaded = true;
            std::string request;
            if (args.isArray() && args.size() > 0 && args[0].isString())
                request = std::string (args[0].getString());
            auto answer = impl->onCall ? impl->onCall (request) : std::string ("{\"ok\":false}");
            return choc::value::createString (answer);
        });
        view.navigate (devUrl);
        logLayout ("ready");
    };

    impl->webview = std::make_unique<choc::ui::WebView> (options);

    if (! impl->webview->loadedOK())
    {
        log::error ("editor: WebView2 is not available");
        impl->webview.reset();
#ifdef _WIN32
        impl->message = CreateWindowExW (0, L"STATIC",
                                         L"Plenio needs the Microsoft Edge WebView2 Runtime to show its window.\r\n"
                                         L"Install it from https://developer.microsoft.com/microsoft-edge/webview2/ and open the plug-in again.",
                                         WS_CHILD | WS_VISIBLE | SS_CENTER, 0, height / 3, width, 80,
                                         impl->container, nullptr, moduleHandle(), nullptr);
#endif
        return;
    }

#ifdef _WIN32
    if (auto view = static_cast<HWND> (impl->webview->getViewHandle()))
    {
        SetWindowLongPtrW (view, GWL_STYLE, WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN | WS_CLIPSIBLINGS);
        SetParent (view, impl->container);
        SetWindowPos (view, nullptr, 0, 0, width, height, SWP_NOZORDER | SWP_FRAMECHANGED | SWP_SHOWWINDOW);
    }
#elif defined(__APPLE__)
    // the host's NSView holds the WKWebView
    if (auto view = static_cast<id> (impl->webview->getViewHandle()); view != nullptr && parent != nullptr)
    {
        choc::objc::call<void> (static_cast<id> (parent), "addSubview:", view);
        fill (view, width, height);
        choc::objc::call<void> (view, "setAutoresizingMask:", static_cast<unsigned long> (2 | 16)); // width and height sizable
    }
#endif
}

WebViewPanel::~WebViewPanel()
{
    // the WebView goes before its parent window
#ifdef __APPLE__
    if (impl->webview != nullptr)
        if (auto view = static_cast<id> (impl->webview->getViewHandle()))
            choc::objc::call<void> (view, "removeFromSuperview");
#endif
    impl->webview.reset();
#ifdef _WIN32
    if (impl->container != nullptr)
        DestroyWindow (impl->container);
#endif
}

bool WebViewPanel::ok() const
{
    return impl->webview != nullptr;
}

void WebViewPanel::logLayout (const char* when)
{
#ifdef _WIN32
    if (impl->container == nullptr)
        return;
    RECT c {}, v {};
    GetClientRect (impl->container, &c);
    HWND view = impl->webview != nullptr ? static_cast<HWND> (impl->webview->getViewHandle()) : nullptr;
    if (view != nullptr)
        GetWindowRect (view, &v);
    log::info ("editor {}: container {}x{} (dpi {}), view {}x{} (dpi {}), thread awareness {}", when,
               c.right - c.left, c.bottom - c.top, GetDpiForWindow (impl->container),
               v.right - v.left, v.bottom - v.top, view != nullptr ? GetDpiForWindow (view) : 0,
               static_cast<int> (GetAwarenessFromDpiAwarenessContext (GetThreadDpiAwarenessContext())));
#else
    (void) when;
#endif
}

void WebViewPanel::setSize (int width, int height)
{
#ifdef _WIN32
    if (impl->container != nullptr)
        SetWindowPos (impl->container, nullptr, 0, 0, width, height, SWP_NOZORDER | SWP_NOACTIVATE | SWP_NOMOVE);
    if (impl->message != nullptr)
        SetWindowPos (impl->message, nullptr, 0, height / 3, width, 80, SWP_NOZORDER | SWP_NOACTIVATE);
#elif defined(__APPLE__)
    if (impl->webview != nullptr)
        if (auto view = static_cast<id> (impl->webview->getViewHandle()))
            fill (view, width, height);
#else
    (void) width;
    (void) height;
#endif
}

void WebViewPanel::emit (const std::string& name, const std::string& payloadJson)
{
    if (impl->webview == nullptr || ! impl->pageLoaded)
        return;
    impl->webview->evaluateJavascript ("window.__plenioEvent && window.__plenioEvent(" + quoteJs (name) + "," + payloadJson + ");");
}

void WebViewPanel::focus()
{
#ifdef _WIN32
    if (impl->webview != nullptr)
        if (auto view = static_cast<HWND> (impl->webview->getViewHandle()))
            SetFocus (view);
#elif defined(__APPLE__)
    if (impl->webview != nullptr)
        if (auto view = static_cast<id> (impl->webview->getViewHandle()))
            if (id window = choc::objc::call<id> (view, "window"))
                choc::objc::call<BOOL> (window, "makeFirstResponder:", view);
#endif
}

} // namespace plenio::ui
