#include "plugin/ara_effect.h"
#include "plugin/ids.h"
#include "plugin/state_stream.h"
#include "ara/audio_source.h"
#include "ara/document_controller.h"
#include "ara/factory.h"
#include "ara/playback_renderer.h"
#include "platform/main_thread.h"
#include "ui/editor_view.h"
#include "core/audio_file.h"
#include "core/clip_content.h"
#include "core/library.h"
#include "core/log.h"
#include "core/paths.h"
#include "core/settings.h"
#include "plenio_version.h"

#include "pluginterfaces/vst/ivsthostapplication.h"
#include "pluginterfaces/vst/ivstprocesscontext.h"
#include "pluginterfaces/base/funknownimpl.h"
#include "public.sdk/source/vst/utility/stringconvert.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <thread>

using namespace Steinberg;

namespace plenio::plugin
{

/// A take made ready for a clip on a worker, handed to the main thread.
struct AlternateHolder
{
    std::shared_ptr<const ara::Alternate> take;
};

namespace
{
std::string idOf (const ara::AudioSource* source)
{
    return std::to_string (reinterpret_cast<std::uintptr_t> (source));
}

ara::AudioSource* findSource (ara::DocumentController* dc, const std::string& id)
{
    if (dc == nullptr)
        return nullptr;
    for (auto* s : dc->getDocument()->getAudioSources())
        if (idOf (static_cast<ara::AudioSource*> (s)) == id)
            return static_cast<ara::AudioSource*> (s);
    return nullptr;
}
} // namespace

AraEffect::AraEffect()
{
    processContextRequirements.needTransportState();
}

AraEffect::~AraEffect() = default;

FUnknown* AraEffect::createInstance (void*)
{
    return static_cast<Vst::IAudioProcessor*> (new AraEffect());
}

tresult PLUGIN_API AraEffect::initialize (FUnknown* context)
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
    log::info ("Plenio ARA {} created in {}", PLENIO_VERSION_STRING, hostName.empty() ? "an unknown host" : hostName);

    addAudioInput (STR16 ("Stereo In"), Vst::SpeakerArr::kStereo);
    addAudioOutput (STR16 ("Stereo Out"), Vst::SpeakerArr::kStereo);
    return kResultOk;
}

tresult PLUGIN_API AraEffect::terminate()
{
    *alive = false;
    sink = {};
    platform::detachMainThread();
    return SingleComponentEffect::terminate();
}

tresult PLUGIN_API AraEffect::setBusArrangements (Vst::SpeakerArrangement* inputs, int32 numIns,
                                                  Vst::SpeakerArrangement* outputs, int32 numOuts)
{
    // one input and one output with the same channels (mono or stereo, like the clip's track)
    if (numIns == 1 && numOuts == 1 && inputs[0] == outputs[0]
        && (outputs[0] == Vst::SpeakerArr::kMono || outputs[0] == Vst::SpeakerArr::kStereo))
        return SingleComponentEffect::setBusArrangements (inputs, numIns, outputs, numOuts);
    return kResultFalse;
}

tresult PLUGIN_API AraEffect::canProcessSampleSize (int32 symbolicSampleSize)
{
    return symbolicSampleSize == Vst::kSample32 ? kResultTrue : kResultFalse;
}

tresult PLUGIN_API AraEffect::setProcessing (TBool)
{
    return kResultOk;
}

tresult PLUGIN_API AraEffect::setActive (TBool state)
{
    if (auto* renderer = araExtension.getPlaybackRenderer<ara::PlaybackRenderer>())
    {
        int32 channels = 2;
        if (! audioOutputs.empty())
            if (auto* bus = FCast<Vst::AudioBus> (audioOutputs[0].get()))
                channels = Vst::SpeakerArr::getChannelCount (bus->getArrangement());
        if (state)
            renderer->enableRendering (processSetup.sampleRate, channels, processSetup.maxSamplesPerBlock);
        else
            renderer->disableRendering();
    }
    return SingleComponentEffect::setActive (state);
}

tresult PLUGIN_API AraEffect::process (Vst::ProcessData& data)
{
    if (data.numSamples <= 0 || data.numOutputs < 1 || data.outputs[0].numChannels <= 0)
        return kResultOk;

    auto& out = data.outputs[0];
    if (auto* renderer = araExtension.getPlaybackRenderer<ara::PlaybackRenderer>())
    {
        const bool playing = data.processContext != nullptr && (data.processContext->state & Vst::ProcessContext::kPlaying) != 0;
        const auto position = data.processContext != nullptr ? data.processContext->projectTimeSamples : 0;
        renderer->render (out.channelBuffers32, out.numChannels, position, data.numSamples, playing);
        return kResultOk;
    }

    // not a playback renderer (editor only, or no ARA): the input passes unchanged
    for (int32 c = 0; c < out.numChannels; ++c)
    {
        float* dst = out.channelBuffers32[c];
        const float* src = (data.numInputs > 0 && c < data.inputs[0].numChannels) ? data.inputs[0].channelBuffers32[c] : nullptr;
        if (dst == nullptr)
            continue;
        if (src == nullptr)
            std::memset (dst, 0, sizeof (float) * static_cast<size_t> (data.numSamples));
        else if (src != dst)
            std::memcpy (dst, src, sizeof (float) * static_cast<size_t> (data.numSamples));
    }
    return kResultOk;
}

tresult PLUGIN_API AraEffect::setState (IBStream* state)
{
    auto read = readState (state);
    if (! read)
        return kResultFalse;
    const auto& editor = json::obj (*read, "editor");
    editorWidth = static_cast<int> (json::integer (editor, "width", 0));
    editorHeight = static_cast<int> (json::integer (editor, "height", 0));
    return kResultOk;
}

tresult PLUGIN_API AraEffect::getState (IBStream* state)
{
    Json out = { { "schema", "plenio-vst3.ara/1" }, { "version", PLENIO_VERSION_STRING } };
    if (editorWidth > 0 && editorHeight > 0)
        out["editor"] = { { "width", editorWidth }, { "height", editorHeight } };
    return writeState (state, out) ? kResultOk : kResultFalse;
}

IPlugView* PLUGIN_API AraEffect::createView (FIDString name)
{
    if (FIDStringsEqual (name, Vst::ViewType::kEditor))
        return new ui::EditorView (this, *this);
    return nullptr;
}

const ARA::ARAFactory* PLUGIN_API AraEffect::getFactory()
{
    return ara::factory();
}

const ARA::ARAPlugInExtensionInstance* PLUGIN_API AraEffect::bindToDocumentController (ARA::ARADocumentControllerRef)
{
    // ARA 1 only; this plug-in requires ARA 2
    return nullptr;
}

const ARA::ARAPlugInExtensionInstance* PLUGIN_API AraEffect::bindToDocumentControllerWithRoles (ARA::ARADocumentControllerRef controllerRef,
                                                                                                ARA::ARAPlugInInstanceRoleFlags knownRoles,
                                                                                                ARA::ARAPlugInInstanceRoleFlags assignedRoles)
{
    return araExtension.bindToARA (controllerRef, knownRoles, assignedRoles);
}

Json AraEffect::call (const std::string& method, const Json& params)
{
    if (method == "ui.hello")
        return { { "kind", "ara" },
                 { "version", PLENIO_VERSION_STRING },
                 { "host", hostName },
                 { "platform", "windows" },
                 { "bound", araExtension.isBoundToARA() } };

    if (method == "ui.log")
    {
        log::info ("UI (ARA): {}", json::str (params, "message", {}, 2000));
        return nullptr;
    }
    if (method == "app.state")
        return { { "hello", call ("ui.hello", {}) }, { "connection", nullptr }, { "settings", nullptr }, { "song", nullptr },
                 { "position", 0 }, { "ara", araState() } };
    if (method == "ara.state")
        return araState();
    if (method == "ara.playTake")
    {
        auto* dc = araExtension.isBoundToARA() ? araExtension.getDocumentController<ara::DocumentController>() : nullptr;
        if (dc == nullptr)
            throw ui::CallError ("not_bound", "Plenio ARA is not on a clip.");
        const auto id = json::str (params, "id", {}, 32);
        const int number = static_cast<int> (json::integer (params, "number", 0));
        auto* source = findSource (dc, id);
        if (source == nullptr)
            throw ui::CallError ("not_found", "That clip is no longer in the project.");
        const auto* match = source->take();
        if (match == nullptr)
            throw ui::CallError ("not_a_take", "This clip is no Plenio take.");
        const int own = match->song.takes[static_cast<std::size_t> (match->takeIndex)].number;
        if (number == own)
        {
            dc->whileRenderersWait ([&] { source->setAlternate (nullptr); });
            pendingTakes.erase (id);
            return araState();
        }
        int index = -1;
        for (std::size_t i = 0; i < match->song.takes.size(); ++i)
            if (match->song.takes[i].number == number)
                index = static_cast<int> (i);
        if (index < 0)
            throw ui::CallError ("not_found", "The song has no take " + std::to_string (number) + ".");
        auto settings = core::loadSettings();
        core::Library library (settings.library.empty() ? paths::defaultLibrary() : paths::fromUtf8 (settings.library));
        auto job = core::dawAudioJob (library, match->song, index);
        if (! job)
            throw ui::CallError ("no_audio", "Take " + std::to_string (number) + " is not in the library.");
        // a stem's clip plays the same stem of the other take
        const auto stem = match->stem;
        if (! stem.empty() && std::none_of (job->stems.begin(), job->stems.end(), [&] (const auto& s) { return s.first == stem; }))
            throw ui::CallError ("no_stem", "Take " + std::to_string (number) + " has no " + stem + " stem.");
        pendingTakes[id] = number;

        // the take's DAW file (made when missing), read and brought to the clip's rate on a worker
        const double rate = source->getSampleRate();
        const auto offset = static_cast<std::int64_t> (std::llround (match->offset * rate));
        auto token = alive;
        std::thread ([this, token, made = *job, rate, offset, number, id, stem]
        {
            std::string problem;
            auto holder = std::make_shared<AlternateHolder>();
            if (auto files = daw::writeAudio (made, problem))
            {
                auto file = files->audio;
                for (const auto& [name, path] : files->stems)
                    if (name == stem)
                        file = path;
                std::string error;
                if (auto buffer = audio::read (file, &error))
                {
                    auto ready = audio::resample (*buffer, rate);
                    auto alt = std::make_shared<ara::Alternate>();
                    alt->number = number;
                    alt->frames = static_cast<std::int64_t> (ready.frames());
                    alt->offset = offset;
                    alt->channels = std::move (ready.channels);
                    holder->take = alt;
                }
                else
                    problem = "The take could not be read: " + error;
            }
            platform::postToMainThread ([this, token, holder, problem, number, id]
            {
                if (*token)
                    takeReady (id, number, holder, problem);
            });
        }).detach();
        return araState();
    }

    throw ui::CallError ("unknown_method", "Plenio ARA does not know the call '" + method + "'.");
}

Json AraEffect::araState()
{
    Json clips = Json::array();
    auto* dc = araExtension.isBoundToARA() ? araExtension.getDocumentController<ara::DocumentController>() : nullptr;
    if (dc != nullptr)
        for (auto* s : dc->getDocument()->getAudioSources())
        {
            auto* source = static_cast<ara::AudioSource*> (s);
            const auto* match = source->take();
            if (match == nullptr)
                continue;
            const auto& own = match->song.takes[static_cast<std::size_t> (match->takeIndex)];
            Json takes = Json::array();
            for (const auto& t : match->song.takes)
            {
                Json item = { { "number", t.number }, { "label", t.label() }, { "seconds", t.seconds } };
                if (t.stars)
                    item["stars"] = *t.stars;
                takes.push_back (item);
            }
            const auto* alt = source->alternateTake();
            const auto id = idOf (source);
            Json clip = { { "id", id }, { "name", source->getName() != nullptr ? source->getName() : "" }, { "song", match->song.title },
                          { "stem", match->stem }, { "own", own.number }, { "playing", alt != nullptr ? alt->number : own.number },
                          { "takes", takes } };
            if (auto p = pendingTakes.find (id); p != pendingTakes.end())
                clip["pending"] = p->second;
            clips.push_back (clip);
        }
    return { { "bound", dc != nullptr }, { "clips", clips } };
}

void AraEffect::takeReady (const std::string& clipId, int number, std::shared_ptr<const AlternateHolder> holder, const std::string& problem)
{
    auto pending = pendingTakes.find (clipId);
    if (pending == pendingTakes.end() || pending->second != number)
        return; // the clip asked for another take meanwhile
    pendingTakes.erase (pending);
    auto* dc = araExtension.isBoundToARA() ? araExtension.getDocumentController<ara::DocumentController>() : nullptr;
    auto* source = findSource (dc, clipId);
    if (source != nullptr && holder->take)
    {
        dc->whileRenderersWait ([&] { source->setAlternate (holder->take); });
        log::info ("ARA: '{}' plays take {}", source->getName() != nullptr ? source->getName() : "", number);
    }
    if (sink)
    {
        if (! problem.empty())
            sink ("toast", { { "text", problem }, { "problem", true } });
        sink ("ara", araState());
    }
}

void AraEffect::setEventSink (EventSink s)
{
    sink = std::move (s);
}

std::pair<int, int> AraEffect::editorSize() const
{
    if (editorWidth > 0 && editorHeight > 0)
        return { editorWidth, editorHeight };
    return { ui::EditorView::defaultWidth, 560 };
}

void AraEffect::setEditorSize (int width, int height)
{
    editorWidth = std::clamp (width, ui::EditorView::minWidth, 6000);
    editorHeight = std::clamp (height, ui::EditorView::minHeight, 4000);
}

} // namespace plenio::plugin
