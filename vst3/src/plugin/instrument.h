// Plenio, the instrument: one song with its takes and stems, played in sync with the host's timeline.
//
// Buses: MIDI in (reserved), MIDI out (melody, instrument line, chords), the song (main stereo output) and five
// stereo stem outputs (vocals, drums, bass, other, rest) that are off until the host activates them; an active stem
// output takes its stem out of the main output.
#pragma once

#include "engine/player.h"
#include "plugin/song_controller.h"

#include "public.sdk/source/vst/vstsinglecomponenteffect.h"

#include <memory>
#include <string>

namespace plenio::plugin
{

class Instrument : public Steinberg::Vst::SingleComponentEffect
{
public:
    Instrument();
    ~Instrument() override;

    static Steinberg::FUnknown* createInstance (void*);

    // IPluginBase
    Steinberg::tresult PLUGIN_API initialize (Steinberg::FUnknown* context) override;
    Steinberg::tresult PLUGIN_API terminate() override;

    // IComponent
    Steinberg::tresult PLUGIN_API setState (Steinberg::IBStream* state) override;
    Steinberg::tresult PLUGIN_API getState (Steinberg::IBStream* state) override;
    Steinberg::tresult PLUGIN_API setActive (Steinberg::TBool state) override;
    Steinberg::tresult PLUGIN_API activateBus (Steinberg::Vst::MediaType type, Steinberg::Vst::BusDirection dir,
                                               Steinberg::int32 index, Steinberg::TBool state) override;

    // IAudioProcessor
    Steinberg::tresult PLUGIN_API setBusArrangements (Steinberg::Vst::SpeakerArrangement* inputs, Steinberg::int32 numIns,
                                                      Steinberg::Vst::SpeakerArrangement* outputs, Steinberg::int32 numOuts) override;
    Steinberg::tresult PLUGIN_API canProcessSampleSize (Steinberg::int32 symbolicSampleSize) override;
    Steinberg::tresult PLUGIN_API setupProcessing (Steinberg::Vst::ProcessSetup& setup) override;
    Steinberg::tresult PLUGIN_API setProcessing (Steinberg::TBool state) override;
    Steinberg::tresult PLUGIN_API process (Steinberg::Vst::ProcessData& data) override;

    // IEditController
    Steinberg::IPlugView* PLUGIN_API createView (Steinberg::FIDString name) override;

private:
    engine::Player player;
    std::unique_ptr<SongController> controller;
    std::shared_ptr<bool> alive = std::make_shared<bool> (true);
    std::string hostName;
};

} // namespace plenio::plugin
