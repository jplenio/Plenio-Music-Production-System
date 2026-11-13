// Audio files: FLAC, WAV and MP3 read into memory (planar float), resampled to the host's rate, peaks for the
// waveforms, WAV written for the DAW. Off the audio thread only.
#pragma once

#include <cstdint>
#include <filesystem>
#include <optional>
#include <string>
#include <vector>

namespace plenio::audio
{

struct Buffer
{
    double sampleRate = 0.0;
    std::vector<std::vector<float>> channels; // planar, equal lengths

    std::size_t frames() const { return channels.empty() ? 0 : channels.front().size(); }
    double seconds() const { return sampleRate > 0 ? static_cast<double> (frames()) / sampleRate : 0.0; }
    bool empty() const { return frames() == 0; }
};

/// Reads a whole audio file (by its content: FLAC, WAV or MP3). At most `maxSeconds`.
std::optional<Buffer> read (const std::filesystem::path& file, std::string* error = nullptr, double maxSeconds = 1800.0);

/// The buffer at another rate (r8brain, 24-bit quality); the same buffer when the rates match.
Buffer resample (const Buffer& in, double targetRate);

/// Stereo: mono is doubled, more channels are cut to two.
Buffer toStereo (Buffer in);

/// The highest absolute sample of every bucket of `frames / count` frames, over all channels (0 ... 1).
std::vector<float> peaks (const Buffer& buffer, std::size_t count);

/// Writes a WAV file (24-bit integer PCM), `leadingSilenceSeconds` of silence first (to start on the project's start).
bool writeWav (const std::filesystem::path& file, const Buffer& buffer, double leadingSilenceSeconds = 0.0, std::string* error = nullptr);

} // namespace plenio::audio
