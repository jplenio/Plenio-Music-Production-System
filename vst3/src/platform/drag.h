// Dragging files out of the plug-in's window: to the DAW's tracks, to the desktop.
#pragma once

#include <filesystem>
#include <vector>

namespace plenio::platform
{

enum class DragResult { dropped, cancelled, failed };

/// Starts a drag of the files (all in one folder) and returns when they were dropped or the drag was given up.
/// Call on the UI thread while the mouse button is down: the drag follows the mouse from where it is.
DragResult dragFiles (const std::vector<std::filesystem::path>& files);

} // namespace plenio::platform
