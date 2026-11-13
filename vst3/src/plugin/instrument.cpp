#include "plugin/instrument.h"
#include "plugin/ids.h"
#include "plugin/reaper.h"
#include "plugin/state_stream.h"
#include "platform/main_thread.h"
#include "ui/editor_view.h"
#include "core/log.h"
#include "plenio_version.h"

#include "pluginterfaces/vst/ivsthostapplication.h"
#include "pluginterfaces/vst/ivstevents.h"
#include "pluginterfaces/vst/ivstprocesscontext.h"
#include "pluginterfaces/base/funknownimpl.h"
#include "public.sdk/source/vst/utility/stringconvert.h"

#include <algorithm>
#include <cstring>

using namespace Steinberg;

namespace plenio::plugin
{
namespace
{
/// The player's MIDI as VST3 note events on the event output bus.
struct EventSink : engine::MidiSink
{
    Vst::IEventList* out = nullptr;
    int numSamples = 0;

    void send (int offset, std::uint8_t status, std::uint8_t data1, std::uint8_t data2) override
    {
        if (out == nullptr)
            return;
        Vst::Event e {};
        e.busIndex = 0;
        e.sampleOffset = std::clamp (offset, 0, std::max (0, numSamples - 1));
        e.ppqPosition = 0;
        e.flags = Vst::Event::kIsLive;
        if ((status & 0xF0) == 0x90 && data2 > 0)
        {
            e.type = Vst::Event::kNoteOnEvent;
            e.noteOn.channel = static_cast<int16> (status & 0x0F);
            e.noteOn.pitch = static_cast<int16> (data1);
            e.noteOn.velocity = static_cast<float> (data2) / 127.0f;
            e.noteOn.noteId = -1;
            e.noteOn.length = 0;
            e.noteOn.tuning = 0;
        }
        else
        {
            e.type = Vst::Event::kNoteOffEvent;
            e.noteOff.channel = static_cast<int16> (status & 0x0F);
            e.noteOff.pitch = static_cast<int16> (data1);
            e.noteOff.velocity = 0.0f;
            e.noteOff.noteId = -1;
            e.noteOff.tuning = 0;
        }
        out->addEvent (e);
    }
};
} // namespace

Instrument::Instrument()
{
    processContextRequirements.needTransportState()
        .needTempo()
        .needTimeSignature()
        .needProjectTimeMusic()
        .needBarPositionMusic()
        .needCycleMusic();
}

Instrument::~Instrument() = default;

FUnknown* Instrument::createInstance (void*)
{
    return static_cast<Vst::IAudioProcessor*> (new Instrument());
}

tresult PLUGIN_API Instrument::initialize (FUnknown* context)
{
    auto result = SingleComponentEffect::initialize (context);
    if (result != kResultOk)
        return result;

    platform::attachMainThread();

    if (auto app = U::cast<Vst::IHostApplication> (context))
    {
        Vst::String128 name {};
        if (app->getName (name) == kResultOk)
            hostName = Vst::StringConvert::convert (name);
    }
    log::info ("Plenio {} instrument created in {}", PLENIO_VERSION_STRING, hostName.empty() ? "an unknown host" : hostName);

    addEventInput (STR16 ("MIDI In"), 16);
    addEventOutput (STR16 ("MIDI Out"), 16);
    addAudioOutput (STR16 ("Song"), Vst::SpeakerArr::kStereo, Vst::kMain, Vst::BusInfo::kDefaultActive);
    addAudioOutput (STR16 ("Vocals"), Vst::SpeakerArr::kStereo, Vst::kAux, 0);
    addAudioOutput (STR16 ("Drums"), Vst::SpeakerArr::kStereo, Vst::kAux, 0);
    addAudioOutput (STR16 ("Bass"), Vst::SpeakerArr::kStereo, Vst::kAux, 0);
    addAudioOutput (STR16 ("Other"), Vst::SpeakerArr::kStereo, Vst::kAux, 0);
    addAudioOutput (STR16 ("Rest"), Vst::SpeakerArr::kStereo, Vst::kAux, 0);

    controller = std::make_unique<SongController> (player);
    controller->setHostName (hostName);
    controller->setReaper (Reaper::connect (context));
    return kResultOk;
}

tresult PLUGIN_API Instrument::terminate()
{
    *alive = false;
    player.clear();
    controller.reset();
    platform::detachMainThread();
    return SingleComponentEffect::terminate();
}

tresult PLUGIN_API Instrument::setBusArrangements (Vst::SpeakerArrangement* inputs, int32 numIns,
                                                   Vst::SpeakerArrangement* outputs, int32 numOuts)
{
    const auto buses = static_cast<int32> (audioOutputs.size());
    if (numIns != 0 || numOuts < 1 || numOuts > buses || outputs == nullptr)
        return kResultFalse;
    for (int32 i = 0; i < numOuts; ++i)
        if (outputs[i] != Vst::SpeakerArr::kStereo)
            return kResultFalse;
    // Every bus is stereo and stays stereo. Some hosts name only the buses they use (the song alone, or the song
    // and a few stems): that is what Plenio has, so the answer is yes instead of a refusal the host has to work around.
    if (numOuts < buses)
        return kResultTrue;
    return SingleComponentEffect::setBusArrangements (inputs, numIns, outputs, numOuts);
}

tresult PLUGIN_API Instrument::canProcessSampleSize (int32 symbolicSampleSize)
{
    return symbolicSampleSize == Vst::kSample32 ? kResultTrue : kResultFalse;
}

tresult PLUGIN_API Instrument::setupProcessing (Vst::ProcessSetup& setup)
{
    auto result = SingleComponentEffect::setupProcessing (setup);
    const double rate = setup.sampleRate;
    // the song is touched on the main thread only (hosts call this from various threads)
    platform::postToMainThread ([this, rate, token = alive]
    {
        if (*token && controller != nullptr)
            controller->setHostRate (rate);
    });
    return result;
}

tresult PLUGIN_API Instrument::setProcessing (TBool)
{
    return kResultOk;
}

tresult PLUGIN_API Instrument::setActive (TBool state)
{
    if (state)
        player.prepare (processSetup.sampleRate, processSetup.maxSamplesPerBlock);
    return SingleComponentEffect::setActive (state);
}

tresult PLUGIN_API Instrument::activateBus (Vst::MediaType type, Vst::BusDirection dir, int32 index, TBool state)
{
    auto result = SingleComponentEffect::activateBus (type, dir, index, state);
    if (type == Vst::kAudio && dir == Vst::kOutput && index >= 1 && index <= engine::maxStems)
        player.setStemOutputActive (index - 1, state != 0);
    return result;
}

tresult PLUGIN_API Instrument::process (Vst::ProcessData& data)
{
    if (data.numSamples <= 0 || data.outputs == nullptr || data.numOutputs < 1)
        return kResultOk;

    engine::Block block;
    block.numSamples = data.numSamples;
    if (data.processContext != nullptr)
    {
        block.projectSample = data.processContext->projectTimeSamples;
        block.playing = (data.processContext->state & Vst::ProcessContext::kPlaying) != 0;
    }

    // whatever the host hands over is written: silence where Plenio has nothing to play (a host that offers a
    // bus the plug-in did not ask for, or fewer channels, must not hear what was left in its buffers)
    auto silence = [&] (Vst::AudioBusBuffers& bus)
    {
        if (bus.channelBuffers32 != nullptr)
            for (int32 c = 0; c < bus.numChannels; ++c)
                if (bus.channelBuffers32[c] != nullptr)
                    std::memset (bus.channelBuffers32[c], 0, sizeof (float) * static_cast<size_t> (data.numSamples));
        bus.silenceFlags = bus.numChannels >= 64 ? ~uint64 (0) : ((uint64 (1) << bus.numChannels) - 1);
    };
    if (data.symbolicSampleSize != Vst::kSample32)
        return kResultOk;

    auto& main = data.outputs[0];
    if (main.numChannels < 2 || main.channelBuffers32 == nullptr || main.channelBuffers32[0] == nullptr || main.channelBuffers32[1] == nullptr)
    {
        for (int32 b = 0; b < data.numOutputs; ++b)
            silence (data.outputs[b]);
        return kResultOk;
    }
    block.main[0] = main.channelBuffers32[0];
    block.main[1] = main.channelBuffers32[1];
    for (int s = 0; s < engine::maxStems && s + 1 < data.numOutputs; ++s)
    {
        auto& bus = data.outputs[s + 1];
        auto* info = s + 1 < static_cast<int> (audioOutputs.size()) ? FCast<Vst::AudioBus> (audioOutputs[static_cast<std::size_t> (s + 1)].get()) : nullptr;
        if (bus.numChannels >= 2 && bus.channelBuffers32 != nullptr && info != nullptr && info->isActive())
        {
            block.stems[s][0] = bus.channelBuffers32[0];
            block.stems[s][1] = bus.channelBuffers32[1];
        }
        else
            silence (bus);
    }
    // more channels than stereo on the main bus, more buses than Plenio's: silent
    for (int32 c = 2; c < main.numChannels; ++c)
        if (main.channelBuffers32[c] != nullptr)
            std::memset (main.channelBuffers32[c], 0, sizeof (float) * static_cast<size_t> (data.numSamples));
    for (int32 b = engine::maxStems + 1; b < data.numOutputs; ++b)
        silence (data.outputs[b]);

    EventSink sink;
    sink.out = data.outputEvents;
    sink.numSamples = data.numSamples;
    block.midi = data.outputEvents != nullptr ? &sink : nullptr;

    player.render (block);

    main.silenceFlags = 0;
    for (int s = 0; s < engine::maxStems && s + 1 < data.numOutputs; ++s)
        if (block.stems[s][0] != nullptr)
            data.outputs[s + 1].silenceFlags = 0;
    return kResultOk;
}

tresult PLUGIN_API Instrument::setState (IBStream* state)
{
    auto read = readState (state);
    if (! read)
        return kResultFalse;
    if (controller != nullptr)
    {
        if (platform::isMainThread())
            controller->setState (*read);
        else
            platform::postToMainThread ([this, s = *read, token = alive]
            {
                if (*token && controller != nullptr)
                    controller->setState (s);
            });
    }
    return kResultOk;
}

tresult PLUGIN_API Instrument::getState (IBStream* state)
{
    Json out = controller != nullptr ? controller->getState() : Json::object();
    out["schema"] = "plenio-vst3.instrument/1";
    out["version"] = PLENIO_VERSION_STRING;
    return writeState (state, out) ? kResultOk : kResultFalse;
}

IPlugView* PLUGIN_API Instrument::createView (FIDString name)
{
    if (FIDStringsEqual (name, Vst::ViewType::kEditor) && controller != nullptr)
        return new ui::EditorView (this, *controller);
    return nullptr;
}

} // namespace plenio::plugin
