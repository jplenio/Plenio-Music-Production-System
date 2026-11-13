// Keys the plug-in's page does not use belong to the host (the space bar starts and stops the transport).
#pragma once

namespace plenio::platform
{

/// Hands a key press to the host's window that holds (or owns) the plug-in's window.
void forwardKeyToHost (void* pluginWindow, unsigned virtualKey);

inline constexpr unsigned spaceKey = 0x20;

} // namespace plenio::platform
