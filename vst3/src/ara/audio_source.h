// An audio source of the host (a file under clips) as Plenio ARA keeps it: its samples, cached for the renderer
// once the host allows access.
#pragma once

#include "ARA_Library/PlugIn/ARAPlug.h"
#include "core/clip_content.h"

#include <cstdint>
#include <memory>
#include <optional>
#include <vector>

namespace plenio::ara
{

/// Another take of the song, playing in a clip instead of the clip's own audio: the take's DAW file (it starts at
/// the project's start like every take's), at the clip's sample rate.
struct Alternate
{
    int number = 0;
    std::int64_t frames = 0;
    std::int64_t offset = 0; // the clip's sample 0 is this frame of the take's file
    std::vector<std::vector<float>> channels;
};

class AudioSource : public ARA::PlugIn::AudioSource
{
public:
    using ARA::PlugIn::AudioSource::AudioSource;

    /// Reads all samples from the host (main thread, while sample access is enabled).
    void updateCache();
    void clearCache();

    bool hasCache() const noexcept { return ! cache.empty(); }
    const float* channel (ARA::ARAChannelCount c) const noexcept;

    /// The Plenio take this clip is, by its name and length (looked up in the library once), and what it holds;
    /// nothing for a clip that is no Plenio take. Main thread.
    const core::ClipContent* content() const;
    /// The name or the length changed: look again.
    void forgetTake() noexcept;
    /// The take this clip is (its song, the take, the stem, where it lies on the project), or nothing.
    const core::ClipMatch* take() const;

    /// The take that plays in the clip instead of its own audio (nothing: its own). Renderers read it while the
    /// document controller lets them; it is changed only while they wait.
    const Alternate* alternateTake() const noexcept { return alternate.get(); }
    void setAlternate (std::shared_ptr<const Alternate> a) noexcept { alternate = std::move (a); }

private:
    std::vector<float> cache; // channel after channel
    mutable bool looked = false;
    mutable std::optional<core::ClipContent> clipContent;
    mutable std::optional<core::ClipMatch> clipMatch;
    std::shared_ptr<const Alternate> alternate;
};

} // namespace plenio::ara
