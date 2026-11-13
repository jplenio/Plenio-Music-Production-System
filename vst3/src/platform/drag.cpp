#include "platform/drag.h"

#ifdef _WIN32
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>
#include <ole2.h>
#include <shlobj.h>
#include <shobjidl.h>

namespace plenio::platform
{
namespace
{
/// The drop source: drops when the button is let go, gives up on Escape.
class DropSource final : public IDropSource
{
public:
    HRESULT STDMETHODCALLTYPE QueryInterface (REFIID riid, void** out) override
    {
        if (out == nullptr)
            return E_POINTER;
        if (riid == IID_IUnknown || riid == IID_IDropSource)
        {
            *out = static_cast<IDropSource*> (this);
            AddRef();
            return S_OK;
        }
        *out = nullptr;
        return E_NOINTERFACE;
    }
    ULONG STDMETHODCALLTYPE AddRef() override { return static_cast<ULONG> (InterlockedIncrement (&refs)); }
    ULONG STDMETHODCALLTYPE Release() override
    {
        auto n = InterlockedDecrement (&refs);
        if (n == 0)
            delete this;
        return static_cast<ULONG> (n);
    }
    HRESULT STDMETHODCALLTYPE QueryContinueDrag (BOOL escape, DWORD keys) override
    {
        if (escape)
            return DRAGDROP_S_CANCEL;
        if ((keys & (MK_LBUTTON | MK_RBUTTON)) == 0)
            return DRAGDROP_S_DROP;
        return S_OK;
    }
    HRESULT STDMETHODCALLTYPE GiveFeedback (DWORD) override { return DRAGDROP_S_USEDEFAULTCURSORS; }

private:
    LONG refs = 1;
};

template <typename T>
struct Releaser
{
    T* p = nullptr;
    ~Releaser()
    {
        if (p != nullptr)
            p->Release();
    }
};
} // namespace

DragResult dragFiles (const std::vector<std::filesystem::path>& files)
{
    if (files.empty())
        return DragResult::failed;
    // only while a button is down: a drag started after the button came up would drop at once wherever the mouse is
    if ((GetAsyncKeyState (VK_LBUTTON) & 0x8000) == 0 && (GetAsyncKeyState (VK_RBUTTON) & 0x8000) == 0)
        return DragResult::cancelled;
    // the UI thread of a plug-in window is a single-threaded apartment with OLE (the host's and WebView2's)
    const HRESULT ole = OleInitialize (nullptr);
    const bool ownOle = SUCCEEDED (ole);

    // the shell's own data object for the files, as Explorer drags them (every DAW takes that)
    std::vector<PIDLIST_ABSOLUTE> ids;
    for (const auto& f : files)
    {
        PIDLIST_ABSOLUTE id = nullptr;
        if (SUCCEEDED (SHParseDisplayName (f.c_str(), nullptr, &id, 0, nullptr)) && id != nullptr)
            ids.push_back (id);
    }
    DragResult result = DragResult::failed;
    if (ids.size() == files.size())
    {
        Releaser<IShellItemArray> items;
        if (SUCCEEDED (SHCreateShellItemArrayFromIDLists (static_cast<UINT> (ids.size()), const_cast<PCIDLIST_ABSOLUTE_ARRAY> (ids.data()), &items.p)))
        {
            Releaser<IDataObject> data;
            if (SUCCEEDED (items.p->BindToHandler (nullptr, BHID_DataObject, IID_PPV_ARGS (&data.p))))
            {
                auto* source = new DropSource();
                DWORD effect = DROPEFFECT_NONE;
                const HRESULT hr = DoDragDrop (data.p, source, DROPEFFECT_COPY | DROPEFFECT_LINK, &effect);
                source->Release();
                result = hr == DRAGDROP_S_DROP ? DragResult::dropped : hr == DRAGDROP_S_CANCEL ? DragResult::cancelled : DragResult::failed;
            }
        }
    }
    for (auto id : ids)
        CoTaskMemFree (id);
    if (ownOle)
        OleUninitialize();
    return result;
}

} // namespace plenio::platform

#else

namespace plenio::platform
{
DragResult dragFiles (const std::vector<std::filesystem::path>&)
{
    return DragResult::failed; // macOS and Linux: later
}
} // namespace plenio::platform

#endif
