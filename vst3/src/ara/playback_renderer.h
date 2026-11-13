// Plenio ARA's playback renderer: renders the playback regions it is given at the host's timeline position.
// Today: the clip's own audio (pass-through); later another take of the song.
#pragma once

#include "ARA_Library/PlugIn/ARAPlug.h"

namespace plenio::ara
{

class PlaybackRenderer : public ARA::PlugIn::PlaybackRenderer
{
public:
    using ARA::PlugIn::PlaybackRenderer::PlaybackRenderer;

    /// Audio thread: fills `output` (`channels` buffers) for the host's samples [position, position + count).
    void render (float* const* output, int channels, ARA::ARASamplePosition position, ARA::ARASampleCount count, bool playing) noexcept;

    void enableRendering (ARA::ARASampleRate sampleRate, ARA::ARAChannelCount channels, ARA::ARASampleCount maxSamples) noexcept;
    void disableRendering() noexcept;

private:
    ARA::ARASampleRate sampleRate = 44100.0;
    ARA::ARAChannelCount channelCount = 2;
};

} // namespace plenio::ara
