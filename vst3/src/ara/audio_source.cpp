#include "ara/audio_source.h"
#include "core/library.h"
#include "core/log.h"
#include "core/paths.h"
#include "core/settings.h"

namespace plenio::ara
{
namespace
{
/// Longer sources are not cached (about 24 minutes of stereo at 48 kHz): the renderer passes silence for them.
constexpr ARA::ARASampleCount maxCachedSamples = 70'000'000;
} // namespace

void AudioSource::updateCache()
{
    cache.clear();
    const auto channels = getChannelCount();
    const auto samples = getSampleCount();
    if (channels <= 0 || samples <= 0 || channels > 32 || samples * channels > maxCachedSamples)
    {
        if (samples * channels > maxCachedSamples)
            log::warn ("ARA: an audio source of {} samples is too long to cache", samples);
        return;
    }

    try
    {
        cache.resize (static_cast<size_t> (channels) * static_cast<size_t> (samples));
        std::vector<void*> pointers (static_cast<size_t> (channels));
        for (ARA::ARAChannelCount c = 0; c < channels; ++c)
            pointers[static_cast<size_t> (c)] = cache.data() + static_cast<size_t> (c) * static_cast<size_t> (samples);

        // a failed read leaves silence: the host reports the error to the user
        ARA::PlugIn::HostAudioReader reader { this };
        reader.readAudioSamples (0, samples, pointers.data());
    }
    catch (const std::bad_alloc&)
    {
        log::error ("ARA: not enough memory to cache an audio source");
        cache.clear();
    }
}

void AudioSource::clearCache()
{
    cache.clear();
    cache.shrink_to_fit();
}

const core::ClipContent* AudioSource::content() const
{
    if (! looked)
    {
        looked = true;
        const char* name = getName();
        const double rate = getSampleRate();
        if (name != nullptr && rate > 0)
        {
            auto settings = core::loadSettings();
            core::Library library (settings.library.empty() ? paths::defaultLibrary() : paths::fromUtf8 (settings.library));
            if (auto match = core::matchClip (library, name, static_cast<double> (getSampleCount()) / rate))
            {
                clipContent = core::contentOf (*match);
                const auto& take = match->song.takes[static_cast<std::size_t> (match->takeIndex)];
                log::info ("ARA: '{}' is take {} of {}{}", name, take.number, match->song.title, match->stem.empty() ? "" : " (" + match->stem + ")");
                clipMatch = std::move (*match);
            }
        }
    }
    return clipContent ? &*clipContent : nullptr;
}

void AudioSource::forgetTake() noexcept
{
    looked = false;
    clipContent.reset();
    clipMatch.reset();
}

const core::ClipMatch* AudioSource::take() const
{
    content();
    return clipMatch ? &*clipMatch : nullptr;
}

const float* AudioSource::channel (ARA::ARAChannelCount c) const noexcept
{
    if (c < 0 || c >= getChannelCount() || cache.empty())
        return nullptr;
    return cache.data() + static_cast<size_t> (c) * static_cast<size_t> (getSampleCount());
}

} // namespace plenio::ara
