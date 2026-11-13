#include "platform/keys.h"

#ifdef _WIN32
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>

namespace plenio::platform
{

void forwardKeyToHost (void* pluginWindow, unsigned virtualKey)
{
    auto* window = static_cast<HWND> (pluginWindow);
    if (window == nullptr || ! IsWindow (window))
        return;
    // a docked editor: the host's main window holds it; a floating one: the main window owns its frame
    HWND root = GetAncestor (window, GA_ROOT);
    HWND owner = root != nullptr ? GetWindow (root, GW_OWNER) : nullptr;
    HWND target = owner != nullptr ? owner : root;
    if (target == nullptr)
        return;
    const auto scan = static_cast<LPARAM> (MapVirtualKeyW (virtualKey, MAPVK_VK_TO_VSC)) << 16;
    PostMessageW (target, WM_KEYDOWN, virtualKey, 1 | scan);
    PostMessageW (target, WM_KEYUP, virtualKey, 1 | scan | (LPARAM (1) << 30) | (LPARAM (1) << 31));
}

} // namespace plenio::platform

#else

namespace plenio::platform
{
void forwardKeyToHost (void*, unsigned) {}
} // namespace plenio::platform

#endif
