// Builds what the player plays from a take's files: the audio and stems decoded and resampled to the host's rate,
// placed where the layout puts them, and the score's notes as MIDI events at the audio's times. Off the audio thread.
#pragma once

#include "core/score.h"
#include "core/timeline.h"
#include "engine/player.h"

#include <filesystem>
#include <memory>
#include <optional>
#include <string>
#include <utility>
#include <vector>

namespace plenio::engine
{

struct LoadRequest
{
    std::filesystem::path audio;
    std::vector<std::pair<std::string, std::filesystem::path>> stems; // name -> file
    double hostRate = 44100.0;
    timeline::TakeTiming timing;
    std::optional<score::Score> score; // the working score (with the owner's edits)
    int takeNumber = 0;
};

/// The stem output a stem name goes to (vocals 0, drums 1, bass 2, other 3, rest 4; anything else the next free).
int stemOutput (const std::string& name);

std::shared_ptr<TakeAudio> load (const LoadRequest& request, std::string* error = nullptr);

/// The score's melody (channel 1), instrument line (2) and chords (3) as events at project samples.
std::vector<MidiEvent> midiEvents (const score::Score& score, const timeline::TakeTiming& timing,
                                   const timeline::Layout& layout, double hostRate);

} // namespace plenio::engine
