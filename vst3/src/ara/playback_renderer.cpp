#include "ara/playback_renderer.h"
#include "ara/audio_source.h"
#include "ara/document_controller.h"

#include <algorithm>
#include <cstring>

namespace plenio::ara
{

void PlaybackRenderer::enableRendering (ARA::ARASampleRate rate, ARA::ARAChannelCount channels, ARA::ARASampleCount) noexcept
{
    sampleRate = rate;
    channelCount = channels;
}

void PlaybackRenderer::disableRendering() noexcept
{
}

void PlaybackRenderer::render (float* const* output, int channels, ARA::ARASamplePosition position,
                               ARA::ARASampleCount count, bool playing) noexcept
{
    for (int c = 0; c < channels; ++c)
        if (output[c] != nullptr)
            std::memset (output[c], 0, sizeof (float) * static_cast<size_t> (count));

    if (! playing || count <= 0)
        return;

    auto* controller = getDocumentController<DocumentController>();
    if (controller == nullptr || ! controller->rendererWillAccessModelGraph())
    {
        if (controller != nullptr)
            controller->rendererDidAccessModelGraph();
        return;
    }

    const auto end = position + count;
    for (const auto* region : getPlaybackRegions())
    {
        const auto* source = region->getAudioModification()->getAudioSource<const AudioSource>();
        if (source->getSampleRate() != sampleRate)
            continue;

        // another take of the song in this clip: its file, at the same places (every take starts at the project's start)
        if (const auto* alt = source->alternateTake(); alt != nullptr && ! alt->channels.empty())
        {
            const auto regionStart = region->getStartInPlaybackSamples (sampleRate);
            const auto regionEnd = region->getEndInPlaybackSamples (sampleRate);
            if (end <= regionStart || regionEnd <= position)
                continue;
            const auto offset = region->getStartInAudioModificationSamples() - regionStart;
            const auto from = std::max (regionStart, position);
            const auto to = std::min (regionEnd, end);
            for (int c = 0; c < channels; ++c)
            {
                if (output[c] == nullptr)
                    continue;
                const auto& in = alt->channels[static_cast<size_t> (std::min<int> (c, static_cast<int> (alt->channels.size()) - 1))];
                for (auto t = from; t < to; ++t)
                {
                    const auto frame = t + offset + alt->offset;
                    if (frame >= 0 && frame < alt->frames)
                        output[c][t - position] += in[static_cast<size_t> (frame)];
                }
            }
            continue;
        }

        if (! source->isSampleAccessEnabled() || ! source->hasCache())
            continue;

        const auto regionStart = region->getStartInPlaybackSamples (sampleRate);
        const auto regionEnd = region->getEndInPlaybackSamples (sampleRate);
        if (end <= regionStart || regionEnd <= position)
            continue;

        const auto offset = region->getStartInAudioModificationSamples() - regionStart;
        auto from = std::max ({ regionStart, position, -offset });
        auto to = std::min ({ regionEnd, end, region->getEndInAudioModificationSamples() - offset, source->getSampleCount() - offset });
        if (to <= from)
            continue;

        const auto sourceChannels = source->getChannelCount();
        for (int c = 0; c < channels; ++c)
        {
            if (output[c] == nullptr)
                continue;
            // the same channel, or the last one the source has (mono to stereo)
            const float* in = source->channel (std::min<ARA::ARAChannelCount> (c, sourceChannels - 1));
            if (in == nullptr)
                continue;
            for (auto t = from; t < to; ++t)
                output[c][t - position] += in[t + offset];
        }
    }

    controller->rendererDidAccessModelGraph();
}

} // namespace plenio::ara
