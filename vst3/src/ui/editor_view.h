// The plug-in's editor window (IPlugView): a resizable WebView that shows the web UI and connects it to the
// instance's Backend.
//
// Sizes: the backend remembers the logical size (CSS pixels); the view's rect is that times the content scale (the
// host's IPlugViewContentScaleSupport, else the window's DPI). Hosts differ in when they tell the scale (before or
// after they made their window), so after attaching the view asks the host to follow its size, and fills the
// host's window when the host cannot resize it.
#pragma once

#include "ui/backend.h"
#include "ui/webview_panel.h"

#include "public.sdk/source/vst/vsteditcontroller.h"
#include "pluginterfaces/gui/iplugviewcontentscalesupport.h"

#include <memory>

namespace plenio::ui
{

class EditorView : public Steinberg::Vst::EditorView, public Steinberg::IPlugViewContentScaleSupport
{
public:
    /// The backend belongs to the plug-in, which outlives its views (the view holds a reference to it).
    EditorView (Steinberg::Vst::EditController* controller, Backend& backend);
    ~EditorView() override;

    Steinberg::tresult PLUGIN_API isPlatformTypeSupported (Steinberg::FIDString type) override;
    Steinberg::tresult PLUGIN_API attached (void* parent, Steinberg::FIDString type) override;
    Steinberg::tresult PLUGIN_API removed() override;
    Steinberg::tresult PLUGIN_API onSize (Steinberg::ViewRect* newSize) override;
    Steinberg::tresult PLUGIN_API canResize() override { return Steinberg::kResultTrue; }
    Steinberg::tresult PLUGIN_API checkSizeConstraint (Steinberg::ViewRect* rect) override;
    Steinberg::tresult PLUGIN_API onFocus (Steinberg::TBool state) override;

    Steinberg::tresult PLUGIN_API setContentScaleFactor (ScaleFactor factor) override;

    DELEGATE_REFCOUNT (Steinberg::Vst::EditorView)
    Steinberg::tresult PLUGIN_API queryInterface (const Steinberg::TUID iid, void** obj) override;

    /// Logical size of the editor when it first opens.
    static constexpr int defaultWidth = 1180;
    static constexpr int defaultHeight = 760;
    static constexpr int minWidth = 760;
    static constexpr int minHeight = 500;

private:
    std::string handleCall (const std::string& request);
    Steinberg::ViewRect scaledRect() const;
    void followHostWindowLater (int wantedWidth, int wantedHeight);

    Backend& backend;
    std::unique_ptr<WebViewPanel> panel;
    void* hostWindow = nullptr;
    std::shared_ptr<bool> alive = std::make_shared<bool> (true);
    float scale = 1.0f;
    bool scaleFromHost = false;
};

} // namespace plenio::ui
