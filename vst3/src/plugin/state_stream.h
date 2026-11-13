// The plug-in's state in the host's project: a small header and UTF-8 JSON. Unknown or broken states are refused
// without harm (the instance then starts empty and says so).
#pragma once

#include "core/json.h"

#include "pluginterfaces/base/ibstream.h"

#include <optional>

namespace plenio::plugin
{

/// The most bytes of state read (the song without its audio is far smaller).
inline constexpr std::uint64_t maxStateBytes = 64ull * 1024ull * 1024ull;

bool writeState (Steinberg::IBStream* stream, const Json& state);
std::optional<Json> readState (Steinberg::IBStream* stream);

} // namespace plenio::plugin
