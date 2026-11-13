#include "engine/player.h"

#include <algorithm>
#include <cmath>
#include <cstring>

namespace plenio::engine
{

Player::Player()
{
    for (auto& g : stemGain)
        g.store (1.0f);
}

Player::~Player()
{
    live.store (nullptr);
}

void Player::publish (std::shared_ptr<const TakeAudio> take)
{
    std::scoped_lock l (keepLock);
    if (keepCurrent)
        retired.push_back ({ keepCurrent, epoch.load() });
    keepCurrent = std::move (take);
    live.store (keepCurrent.get());
}

std::shared_ptr<const TakeAudio> Player::current() const
{
    std::scoped_lock l (keepLock);
    return keepCurrent;
}

void Player::collectGarbage()
{
    std::scoped_lock l (keepLock);
    // blocks later the audio thread holds the old take no more - unless it still fades it out
    const auto now = epoch.load();
    const auto* fading = fadingRef.load();
    retired.erase (std::remove_if (retired.begin(), retired.end(), [now, fading] (const Retired& r)
                   {
                       return now >= r.epoch + 3 && r.take.get() != fading;
                   }),
                   retired.end());
}

void Player::prepare (double sampleRate, int)
{
    rate = sampleRate > 0 ? sampleRate : 44100.0;
    fadeLength = std::max (32, static_cast<int> (rate * 0.006)); // 6 ms
    expectedNext = -1;
}

void Player::silenceMidi (MidiSink* sink, int sampleOffset)
{
    for (int ch = 0; ch < 16; ++ch)
        for (int note = 0; note < 128; ++note)
            if (notesOn[static_cast<std::size_t> (ch)][static_cast<std::size_t> (note)])
            {
                notesOn[static_cast<std::size_t> (ch)][static_cast<std::size_t> (note)] = false;
                if (sink != nullptr)
                    sink->send (sampleOffset, static_cast<std::uint8_t> (0x80 | ch), static_cast<std::uint8_t> (note), 0);
            }
}

void Player::renderTake (const TakeAudio& playingTake, const Block& block, std::int64_t position, float fromGain, float toGain, bool add)
{
    static const AudioData nothing;
    const AudioData& take = playingTake.audio ? *playingTake.audio : nothing;
    const auto frames = static_cast<std::int64_t> (take.frames());
    const int n = block.numSamples;
    const float master = gain.load();

    bool anySolo = false;
    for (int s = 0; s < take.stemCount && s < maxStems; ++s)
        anySolo |= stemSoloed[static_cast<std::size_t> (s)].load();
    bool stemsChanged = anySolo;
    for (int s = 0; s < take.stemCount && s < maxStems; ++s)
        stemsChanged |= stemMuted[static_cast<std::size_t> (s)].load() || stemOutputActive[static_cast<std::size_t> (s)].load()
                        || std::abs (stemGain[static_cast<std::size_t> (s)].load() - 1.0f) > 1e-6f;

    for (int i = 0; i < n; ++i)
    {
        const auto at = position + i - playingTake.startSample;
        const float ramp = n > 1 ? fromGain + (toGain - fromGain) * static_cast<float> (i) / static_cast<float> (n - 1) : toGain;
        float left = 0.0f, right = 0.0f;
        if (at >= 0 && at < frames)
        {
            const auto k = static_cast<std::size_t> (at);
            if (take.stemCount > 0 && stemsChanged)
            {
                // the main output: the audible stems whose own output is not active
                for (int s = 0; s < take.stemCount && s < maxStems; ++s)
                {
                    const auto si = static_cast<std::size_t> (s);
                    if (! take.hasStem[si] || k >= take.stems[si][0].size())
                        continue;
                    const bool audible = anySolo ? stemSoloed[si].load() : ! stemMuted[si].load();
                    const float g = stemGain[si].load();
                    const float sl = take.stems[si][0][k] * g, sr = take.stems[si][1][k] * g;
                    if (audible && ! stemOutputActive[si].load())
                    {
                        left += sl;
                        right += sr;
                    }
                    if (block.stems[s][0] != nullptr && block.stems[s][1] != nullptr && audible)
                    {
                        block.stems[s][0][i] += sl * ramp * master;
                        block.stems[s][1][i] += sr * ramp * master;
                    }
                }
            }
            else
            {
                left = take.mix[0][k];
                right = take.mix[1][k];
                for (int s = 0; s < take.stemCount && s < maxStems; ++s)
                {
                    const auto si = static_cast<std::size_t> (s);
                    if (take.hasStem[si] && k < take.stems[si][0].size() && block.stems[s][0] != nullptr && block.stems[s][1] != nullptr)
                    {
                        block.stems[s][0][i] += take.stems[si][0][k] * ramp * master;
                        block.stems[s][1][i] += take.stems[si][1][k] * ramp * master;
                    }
                }
            }
        }
        left *= ramp * master;
        right *= ramp * master;
        if (add)
        {
            block.main[0][i] += left;
            block.main[1][i] += right;
        }
        else
        {
            block.main[0][i] = left;
            block.main[1][i] = right;
        }
    }
}

void Player::render (const Block& block)
{
    const int n = block.numSamples;
    if (n <= 0 || block.main[0] == nullptr || block.main[1] == nullptr)
        return;
    std::memset (block.main[0], 0, sizeof (float) * static_cast<std::size_t> (n));
    std::memset (block.main[1], 0, sizeof (float) * static_cast<std::size_t> (n));
    for (int s = 0; s < maxStems; ++s)
        for (int c = 0; c < 2; ++c)
            if (block.stems[s][c] != nullptr)
                std::memset (block.stems[s][c], 0, sizeof (float) * static_cast<std::size_t> (n));

    // preview while the host stands; the host's transport wins
    if (auto r = previewRequest.load(); r != seenPreviewRequest)
    {
        seenPreviewRequest = r;
        previewPosition = previewStart.load();
        previewOn.store (true);
    }
    if (auto s = previewStop.load(); s != seenPreviewStop)
    {
        seenPreviewStop = s;
        previewOn.store (false);
    }
    if (block.playing && previewOn.load())
        previewOn.store (false);

    const bool previewing = ! block.playing && previewOn.load();
    const bool rolling = block.playing || previewing;
    const std::int64_t position = previewing ? previewPosition : block.projectSample;

    // a new take: fade the old one out while the new one fades in
    const TakeAudio* now = live.load();
    if (now != playing)
    {
        fadingOut = playing;
        fadeLeft = fadingOut != nullptr ? fadeLength : 0;
        playing = now;
        silenceMidi (block.midi);
    }

    if (rolling)
    {
        // a jump (loop, locate): the sounding notes end first
        if (expectedNext >= 0 && position != expectedNext)
            silenceMidi (block.midi);

        if (playing != nullptr)
        {
            float from = 1.0f;
            if (fadeLeft > 0)
                from = 1.0f - static_cast<float> (fadeLeft) / static_cast<float> (fadeLength);
            const float to = fadeLeft > 0 ? std::min (1.0f, from + static_cast<float> (n) / static_cast<float> (fadeLength)) : 1.0f;
            renderTake (*playing, block, position, from, to, false);
        }
        if (fadingOut != nullptr && fadeLeft > 0)
        {
            const float from = static_cast<float> (fadeLeft) / static_cast<float> (fadeLength);
            const float to = std::max (0.0f, from - static_cast<float> (n) / static_cast<float> (fadeLength));
            renderTake (*fadingOut, block, position, from, to, true);
        }

        // the score as MIDI, at the same times as the audio
        if (playing != nullptr && block.midi != nullptr && midiOut.load() && ! playing->midi.empty() && ! (block.playing && silentWhilePlaying.load()))
        {
            const auto& events = playing->midi;
            auto it = std::lower_bound (events.begin(), events.end(), position,
                                        [] (const MidiEvent& e, std::int64_t p) { return e.sample < p; });
            for (; it != events.end() && it->sample < position + n; ++it)
            {
                const int channel = it->status & 0x0F;
                const bool on = (it->status & 0xF0) == 0x90 && it->data2 > 0;
                auto& state = notesOn[static_cast<std::size_t> (channel)][it->data1 & 0x7F];
                if (on == state && ! on)
                    continue; // an off for a note that does not sound (it started before the jump)
                state = on;
                block.midi->send (static_cast<int> (it->sample - position), it->status, it->data1, it->data2);
            }
        }
        expectedNext = position + n;
        if (block.playing && silentWhilePlaying.load())
        {
            std::memset (block.main[0], 0, sizeof (float) * static_cast<std::size_t> (n));
            std::memset (block.main[1], 0, sizeof (float) * static_cast<std::size_t> (n));
            for (int s = 0; s < maxStems; ++s)
                for (int ch = 0; ch < 2; ++ch)
                    if (block.stems[s][ch] != nullptr)
                        std::memset (block.stems[s][ch], 0, sizeof (float) * static_cast<std::size_t> (n));
        }
        if (previewing)
        {
            previewPosition += n;
            if (playing == nullptr || previewPosition > playing->startSample + static_cast<std::int64_t> (playing->frames()))
                previewOn.store (false);
        }
    }
    else
    {
        if (expectedNext >= 0)
            silenceMidi (block.midi);
        expectedNext = -1;
    }

    if (fadeLeft > 0)
    {
        fadeLeft = std::max (0, fadeLeft - n);
        if (fadeLeft == 0)
            fadingOut = nullptr;
    }
    fadingRef.store (fadingOut);
    lastPosition.store (position);
    lastMoving.store (rolling);
    epoch.fetch_add (1);
}

} // namespace plenio::engine
