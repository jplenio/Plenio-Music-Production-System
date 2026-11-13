#include "ui/editor_view.h"
#include "platform/keys.h"
#include "platform/main_thread.h"
#include "core/log.h"

#include "base/source/fstring.h"

#include <algorithm>
#include <cmath>

#ifdef _WIN32
 #include <windows.h>
#endif

using namespace Steinberg;

namespace plenio::ui
{
namespace
{
int scaled (int logical, float scale)
{
    return static_cast<int> (std::lround (static_cast<float> (logical) * scale));
}
} // namespace

EditorView::EditorView (Vst::EditController* controller, Backend& b)
    : Vst::EditorView (controller), backend (b)
{
    setRect (scaledRect());
}

EditorView::~EditorView()
{
    *alive = false;
}

tresult PLUGIN_API EditorView::queryInterface (const TUID iid, void** obj)
{
    QUERY_INTERFACE (iid, obj, IPlugViewContentScaleSupport::iid, IPlugViewContentScaleSupport)
    return Vst::EditorView::queryInterface (iid, obj);
}

ViewRect EditorView::scaledRect() const
{
    auto [w, h] = backend.editorSize();
    return ViewRect (0, 0, scaled (std::max (w, minWidth), scale), scaled (std::max (h, minHeight), scale));
}

tresult PLUGIN_API EditorView::isPlatformTypeSupported (FIDString type)
{
#ifdef _WIN32
    return FIDStringsEqual (type, kPlatformTypeHWND) ? kResultTrue : kResultFalse;
#elif defined(__APPLE__)
    return FIDStringsEqual (type, kPlatformTypeNSView) ? kResultTrue : kResultFalse;
#else
    return kResultFalse;
#endif
}

tresult PLUGIN_API EditorView::attached (void* parent, FIDString type)
{
    if (isPlatformTypeSupported (type) != kResultTrue)
        return kResultFalse;

    int parentWidth = 0, parentHeight = 0;
#ifdef _WIN32
    // a host that does not tell the scale: the window's DPI says it
    if (! scaleFromHost)
    {
        auto dpi = GetDpiForWindow (static_cast<HWND> (parent));
        if (dpi >= 48 && dpi <= 480)
        {
            scale = static_cast<float> (dpi) / 96.0f;
            setRect (scaledRect());
        }
    }
    RECT pr {};
    if (GetClientRect (static_cast<HWND> (parent), &pr))
    {
        parentWidth = pr.right - pr.left;
        parentHeight = pr.bottom - pr.top;
    }
#endif

    const auto wanted = getRect();
    const bool mismatch = parentWidth > 0 && parentHeight > 0
                          && (parentWidth != wanted.getWidth() || parentHeight != wanted.getHeight());
    if (mismatch)
        setRect (ViewRect (0, 0, parentWidth, parentHeight)); // what the host really made, until it follows

    auto result = Vst::EditorView::attached (parent, type);
    const auto r = getRect();
    log::info ("editor attached: {}x{} at scale {}{}, wanted {}x{}", r.getWidth(), r.getHeight(), scale,
               scaleFromHost ? " (host)" : " (window DPI)", wanted.getWidth(), wanted.getHeight());

    hostWindow = parent;
    panel = std::make_unique<WebViewPanel> (parent, r.getWidth(), r.getHeight(),
                                            [this] (const std::string& request) { return handleCall (request); },
                                            [this] (const std::string& address) { return backend.file (address); });
    backend.setEventSink ([this] (const std::string& name, const Json& payload)
    {
        if (panel != nullptr)
            panel->emit (name, payload.dump (-1, ' ', false, Json::error_handler_t::replace));
    });

    if (mismatch)
        followHostWindowLater (wanted.getWidth(), wanted.getHeight());
    return result;
}

void EditorView::followHostWindowLater (int wantedWidth, int wantedHeight)
{
    // not from inside attached(): some hosts do not expect a resize while they attach
    addRef();
    platform::postToMainThread ([this, token = alive, wantedWidth, wantedHeight]
    {
        if (*token && isAttached())
        {
            ViewRect wanted (0, 0, wantedWidth, wantedHeight);
            const bool resized = plugFrame != nullptr && plugFrame->resizeView (this, &wanted) == kResultTrue;
            log::info ("editor: the host {} {}x{}", resized ? "took" : "refused", wantedWidth, wantedHeight);
        }
        release();
    });
}

tresult PLUGIN_API EditorView::removed()
{
    backend.setEventSink ({});
    panel.reset();
    hostWindow = nullptr;
    return Vst::EditorView::removed();
}

tresult PLUGIN_API EditorView::onSize (ViewRect* newSize)
{
    if (newSize == nullptr)
        return kInvalidArgument;
    auto result = Vst::EditorView::onSize (newSize);
    if (panel != nullptr)
        panel->setSize (newSize->getWidth(), newSize->getHeight());
    backend.setEditorSize (static_cast<int> (std::lround (newSize->getWidth() / scale)),
                           static_cast<int> (std::lround (newSize->getHeight() / scale)));
    return result;
}

tresult PLUGIN_API EditorView::checkSizeConstraint (ViewRect* wanted)
{
    if (wanted == nullptr)
        return kInvalidArgument;
    wanted->right = wanted->left + std::clamp (wanted->getWidth(), scaled (minWidth, scale), scaled (6000, scale));
    wanted->bottom = wanted->top + std::clamp (wanted->getHeight(), scaled (minHeight, scale), scaled (4000, scale));
    return kResultTrue;
}

tresult PLUGIN_API EditorView::onFocus (TBool state)
{
    if (state && panel != nullptr)
        panel->focus();
    return kResultTrue;
}

tresult PLUGIN_API EditorView::setContentScaleFactor (ScaleFactor factor)
{
    if (! std::isfinite (factor) || factor < 0.5f || factor > 4.0f)
        return kResultFalse;
    scaleFromHost = true;
    if (std::abs (factor - scale) < 0.001f)
        return kResultTrue;

    // the logical size stays; the window grows or shrinks with the scale
    scale = factor;
    auto r = scaledRect();
    log::info ("editor content scale {}: {}x{}", factor, r.getWidth(), r.getHeight());
    if (isAttached() && plugFrame != nullptr)
        plugFrame->resizeView (this, &r);
    else
        setRect (r);
    return kResultTrue;
}

std::string EditorView::handleCall (const std::string& request)
{
    Json answer;
    std::string method;
    try
    {
        auto parsed = json::parse (request);
        if (! parsed || ! parsed->is_object())
            throw CallError ("bad_request", "The call is not a JSON object.");
        method = json::str (*parsed, "method", {}, 128);
        if (method.empty())
            throw CallError ("bad_request", "The call names no method.");
        const auto& params = json::obj (*parsed, "params");
        auto result = backend.call (method, params);
        // a key the page does not use and the plug-in could not give the host itself (REAPER can): to the host's window
        if (method == "host.key" && ! json::boolean (result, "handled", false))
            platform::forwardKeyToHost (hostWindow, platform::spaceKey);
        answer = { { "ok", true }, { "result", result } };
    }
    catch (const CallError& e)
    {
        answer = { { "ok", false }, { "error", { { "code", e.code }, { "message", e.what() } } } };
    }
    catch (const std::exception& e)
    {
        log::error ("UI call {} failed: {}", method, e.what());
        answer = { { "ok", false }, { "error", { { "code", "internal" }, { "message", e.what() } } } };
    }
    catch (...)
    {
        answer = { { "ok", false }, { "error", { { "code", "internal" }, { "message", "unknown error" } } } };
    }
    return answer.dump (-1, ' ', false, Json::error_handler_t::replace);
}

} // namespace plenio::ui
