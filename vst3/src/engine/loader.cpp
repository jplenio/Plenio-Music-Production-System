#include "engine/loader.h"
#include "core/audio_file.h"
#include "core/log.h"
#include "core/paths.h"

#include <algorithm>
#include <cmath>

namespace plenio::engine
{

int stemOutput (const std::string& name)
{
    static const char* order[] = { "vocals", "drums", "bass", "other", "rest" };
    for (int i = 0; i < maxStems; ++i)
        if (name == order[i])
            return i;
    return -1;
}

std::vector<MidiEvent> midiEvents (const score::Score& score, const timeline::TakeTiming& timing,
                                   const timeline::Layout& layout, double hostRate)
{
    std::vector<MidiEvent> events;
    auto sampleOf = [&] (std::int64_t tick)
    {
        auto seconds = timeline::scoreToProject (timing, layout, score.secondsOf (tick));
        return static_cast<std::int64_t> (std::llround (seconds * hostRate));
    };
    auto add = [&] (const std::vector<midi::Note>& notes, int channel)
    {
        for (const auto& n : notes)
        {
            auto on = sampleOf (n.tick), off = sampleOf (n.tick + n.length);
            if (off <= on)
                off = on + 1;
            events.push_back ({ on, static_cast<std::uint8_t> (0x90 | channel), static_cast<std::uint8_t> (n.pitch & 0x7F),
                                static_cast<std::uint8_t> (std::clamp (n.velocity, 1, 127)) });
            events.push_back ({ off, static_cast<std::uint8_t> (0x80 | channel), static_cast<std::uint8_t> (n.pitch & 0x7F), 0 });
        }
    };
    add (score.melody, 0);
    add (score.instrument, 1);
    add (score.chordNotes, 2);
    // in time; at one sample the offs before the ons (a repeated note stays a new note)
    std::stable_sort (events.begin(), events.end(), [] (const MidiEvent& a, const MidiEvent& b)
    {
        if (a.sample != b.sample)
            return a.sample < b.sample;
        return (a.status & 0xF0) == 0x80 && (b.status & 0xF0) != 0x80;
    });
    return events;
}

std::shared_ptr<TakeAudio> load (const LoadRequest& request, std::string* error)
{
    auto decoded = audio::read (request.audio, error);
    if (! decoded)
        return nullptr;
    auto stereo = audio::toStereo (audio::resample (*decoded, request.hostRate));

    auto data = std::make_shared<AudioData>();
    data->sampleRate = request.hostRate;
    data->mix[0] = std::move (stereo.channels[0]);
    data->mix[1] = std::move (stereo.channels[1]);
    auto take = std::make_shared<TakeAudio>();
    take->takeNumber = request.takeNumber;

    const auto layout = timeline::layOut (request.timing);
    take->startSample = static_cast<std::int64_t> (std::llround (layout.audioAt * request.hostRate));

    int nextFree = 0;
    for (const auto& [name, file] : request.stems)
    {
        int slot = stemOutput (name);
        if (slot < 0)
        {
            while (nextFree < maxStems && data->hasStem[static_cast<std::size_t> (nextFree)])
                ++nextFree;
            slot = nextFree;
        }
        if (slot < 0 || slot >= maxStems || data->hasStem[static_cast<std::size_t> (slot)])
            continue;
        std::string why;
        auto stem = audio::read (file, &why);
        if (! stem)
        {
            log::warn ("stem {} not loaded: {}", name, why);
            continue;
        }
        auto s = audio::toStereo (audio::resample (*stem, request.hostRate));
        // a stem has the take's length (they add up to it)
        for (auto& c : s.channels)
            c.resize (data->frames(), 0.0f);
        auto& target = data->stems[static_cast<std::size_t> (slot)];
        target[0] = std::move (s.channels[0]);
        target[1] = std::move (s.channels[1]);
        data->hasStem[static_cast<std::size_t> (slot)] = true;
        data->stemCount = std::max (data->stemCount, slot + 1);
    }
    take->audio = data;

    if (request.score)
        take->midi = midiEvents (*request.score, request.timing, layout, request.hostRate);
    return take;
}

} // namespace plenio::engine
