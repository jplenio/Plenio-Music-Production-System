#include "core/audio_file.h"
#include "core/log.h"

#include <algorithm>
#include <cmath>
#include <cstring>
#include <fstream>
#include <memory>

#define DR_FLAC_IMPLEMENTATION
#define DR_WAV_IMPLEMENTATION
#define DR_MP3_IMPLEMENTATION
#include "dr_flac.h"
#include "dr_mp3.h"
#include "dr_wav.h"

#include "CDSPResampler.h"

namespace plenio::audio
{
namespace
{
std::optional<std::vector<std::uint8_t>> slurp (const std::filesystem::path& file, std::size_t limit)
{
    std::error_code ec;
    auto size = std::filesystem::file_size (file, ec);
    if (ec || size > limit)
        return std::nullopt;
    std::ifstream in (file, std::ios::binary);
    if (! in)
        return std::nullopt;
    std::vector<std::uint8_t> bytes (static_cast<std::size_t> (size));
    in.read (reinterpret_cast<char*> (bytes.data()), static_cast<std::streamsize> (size));
    if (! in)
        return std::nullopt;
    return bytes;
}

Buffer fromInterleaved (const float* data, std::uint64_t frames, unsigned channels, double rate)
{
    Buffer b;
    b.sampleRate = rate;
    b.channels.assign (channels, std::vector<float> (static_cast<std::size_t> (frames)));
    for (std::uint64_t f = 0; f < frames; ++f)
        for (unsigned c = 0; c < channels; ++c)
            b.channels[c][static_cast<std::size_t> (f)] = data[f * channels + c];
    return b;
}

bool fail (std::string* error, std::string why)
{
    if (error != nullptr)
        *error = std::move (why);
    return false;
}
} // namespace

std::optional<Buffer> read (const std::filesystem::path& file, std::string* error, double maxSeconds)
{
    constexpr std::size_t maxBytes = 2048u * 1024u * 1024u;
    auto bytes = slurp (file, maxBytes);
    if (! bytes)
    {
        fail (error, "the file could not be read");
        return std::nullopt;
    }
    const auto* data = bytes->data();
    const auto size = bytes->size();

    auto checked = [&] (std::uint64_t frames, unsigned channels, unsigned rate) -> bool
    {
        if (channels == 0 || channels > 16 || rate < 8000 || rate > 768000)
            return fail (error, "the audio's format is not supported");
        if (static_cast<double> (frames) / rate > maxSeconds)
            return fail (error, "the audio is too long");
        return true;
    };

    if (size >= 4 && std::memcmp (data, "fLaC", 4) == 0)
    {
        unsigned channels = 0, rate = 0;
        drflac_uint64 frames = 0;
        std::unique_ptr<float, void (*) (void*)> pcm (
            drflac_open_memory_and_read_pcm_frames_f32 (data, size, &channels, &rate, &frames, nullptr),
            [] (void* p) { drflac_free (p, nullptr); });
        if (! pcm || ! checked (frames, channels, rate))
        {
            if (! pcm)
                fail (error, "the FLAC file could not be decoded");
            return std::nullopt;
        }
        return fromInterleaved (pcm.get(), frames, channels, rate);
    }

    if (size >= 12 && (std::memcmp (data, "RIFF", 4) == 0 || std::memcmp (data, "RF64", 4) == 0 || std::memcmp (data, "riff", 4) == 0))
    {
        unsigned channels = 0, rate = 0;
        drwav_uint64 frames = 0;
        std::unique_ptr<float, void (*) (void*)> pcm (
            drwav_open_memory_and_read_pcm_frames_f32 (data, size, &channels, &rate, &frames, nullptr),
            [] (void* p) { drwav_free (p, nullptr); });
        if (! pcm || ! checked (frames, channels, rate))
        {
            if (! pcm)
                fail (error, "the WAV file could not be decoded");
            return std::nullopt;
        }
        return fromInterleaved (pcm.get(), frames, channels, rate);
    }

    // MP3 last: its frames have no fixed signature at the start (ID3 or a sync word)
    {
        drmp3_config config {};
        drmp3_uint64 frames = 0;
        std::unique_ptr<float, void (*) (void*)> pcm (
            drmp3_open_memory_and_read_pcm_frames_f32 (data, size, &config, &frames, nullptr),
            [] (void* p) { drmp3_free (p, nullptr); });
        if (pcm && frames > 0 && checked (frames, config.channels, config.sampleRate))
            return fromInterleaved (pcm.get(), frames, config.channels, config.sampleRate);
    }

    fail (error, "not a FLAC, WAV or MP3 file");
    return std::nullopt;
}

Buffer resample (const Buffer& in, double targetRate)
{
    if (in.empty() || targetRate <= 0 || std::abs (in.sampleRate - targetRate) < 1e-6)
        return in;
    Buffer out;
    out.sampleRate = targetRate;
    const auto inFrames = in.frames();
    const auto outFrames = static_cast<std::size_t> (std::llround (static_cast<double> (inFrames) * targetRate / in.sampleRate));
    constexpr int block = 4096;
    for (const auto& channel : in.channels)
    {
        r8b::CDSPResampler24 resampler (in.sampleRate, targetRate, block);
        std::vector<float> result;
        result.reserve (outFrames + 16);
        std::vector<double> input (block);
        std::size_t at = 0;
        // feed until enough output came (r8brain has latency: it is flushed with zeros)
        while (result.size() < outFrames)
        {
            int n = 0;
            for (; n < block; ++n)
                input[static_cast<std::size_t> (n)] = at < inFrames ? static_cast<double> (channel[at++]) : 0.0;
            double* produced = nullptr;
            int got = resampler.process (input.data(), n, produced);
            for (int i = 0; i < got && result.size() < outFrames; ++i)
                result.push_back (static_cast<float> (produced[i]));
            if (at >= inFrames + static_cast<std::size_t> (block) * 64)
                break; // a safety stop for a resampler that never fills
        }
        result.resize (outFrames, 0.0f);
        out.channels.push_back (std::move (result));
    }
    return out;
}

Buffer toStereo (Buffer in)
{
    if (in.channels.size() == 1)
        in.channels.push_back (in.channels.front());
    else if (in.channels.size() > 2)
        in.channels.resize (2);
    return in;
}

std::vector<float> peaks (const Buffer& buffer, std::size_t count)
{
    std::vector<float> out (count, 0.0f);
    const auto frames = buffer.frames();
    if (frames == 0 || count == 0)
        return out;
    for (std::size_t i = 0; i < count; ++i)
    {
        auto from = frames * i / count;
        auto to = std::max (from + 1, frames * (i + 1) / count);
        float peak = 0.0f;
        for (const auto& channel : buffer.channels)
            for (auto f = from; f < to && f < frames; ++f)
                peak = std::max (peak, std::abs (channel[f]));
        out[i] = std::min (peak, 1.0f);
    }
    return out;
}

bool writeWav (const std::filesystem::path& file, const Buffer& buffer, double leadingSilenceSeconds, std::string* error)
{
    if (buffer.empty())
        return fail (error, "no audio to write");
    std::error_code ec;
    std::filesystem::create_directories (file.parent_path(), ec);
    const auto channels = static_cast<unsigned> (buffer.channels.size());
    const auto silence = static_cast<std::size_t> (std::llround (std::max (0.0, leadingSilenceSeconds) * buffer.sampleRate));
    const auto frames = silence + buffer.frames();

    std::vector<std::uint8_t> pcm (frames * channels * 3);
    for (std::size_t f = 0; f < buffer.frames(); ++f)
        for (unsigned c = 0; c < channels; ++c)
        {
            auto v = static_cast<std::int32_t> (std::lround (std::clamp (buffer.channels[c][f], -1.0f, 1.0f) * 8388607.0f));
            auto* p = &pcm[((silence + f) * channels + c) * 3];
            p[0] = static_cast<std::uint8_t> (v);
            p[1] = static_cast<std::uint8_t> (v >> 8);
            p[2] = static_cast<std::uint8_t> (v >> 16);
        }

    drwav_data_format format {};
    format.container = frames * channels * 3 > 0xFFFFFF00ull ? drwav_container_rf64 : drwav_container_riff;
    format.format = DR_WAVE_FORMAT_PCM;
    format.channels = channels;
    format.sampleRate = static_cast<drwav_uint32> (std::lround (buffer.sampleRate));
    format.bitsPerSample = 24;

    auto temp = file;
    temp += ".part";
    drwav wav;
#ifdef _WIN32
    if (! drwav_init_file_write_w (&wav, temp.wstring().c_str(), &format, nullptr))
#else
    if (! drwav_init_file_write (&wav, temp.string().c_str(), &format, nullptr))
#endif
        return fail (error, "the WAV file could not be made");
    auto written = drwav_write_pcm_frames (&wav, frames, pcm.data());
    drwav_uninit (&wav);
    if (written != frames)
    {
        std::filesystem::remove (temp, ec);
        return fail (error, "the WAV file could not be written in full");
    }
    std::filesystem::rename (temp, file, ec);
    return ec ? fail (error, "the WAV file could not be put in place") : true;
}

} // namespace plenio::audio
