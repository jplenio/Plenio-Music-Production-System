// Plenio ARA: the ARA 2 clip companion (an audio effect that works only in ARA mode, "Fx|OnlyARA").
#pragma once

#include "ui/backend.h"

#include "ARA_API/ARAVST3.h"
#include "ARA_Library/PlugIn/ARAPlug.h"
#include "public.sdk/source/vst/vstsinglecomponenteffect.h"

#include <map>
#include <memory>
#include <string>

namespace plenio::plugin
{

class AraEffect : public Steinberg::Vst::SingleComponentEffect,
                  public ARA::IPlugInEntryPoint,
                  public ARA::IPlugInEntryPoint2,
                  public ui::Backend
{
public:
    AraEffect();
    ~AraEffect() override;

    static Steinberg::FUnknown* createInstance (void*);

    Steinberg::tresult PLUGIN_API initialize (Steinberg::FUnknown* context) override;
    Steinberg::tresult PLUGIN_API terminate() override;
    Steinberg::tresult PLUGIN_API setActive (Steinberg::TBool state) override;
    Steinberg::tresult PLUGIN_API setState (Steinberg::IBStream* state) override;
    Steinberg::tresult PLUGIN_API getState (Steinberg::IBStream* state) override;

    Steinberg::tresult PLUGIN_API setBusArrangements (Steinberg::Vst::SpeakerArrangement* inputs, Steinberg::int32 numIns,
                                                      Steinberg::Vst::SpeakerArrangement* outputs, Steinberg::int32 numOuts) override;
    Steinberg::tresult PLUGIN_API canProcessSampleSize (Steinberg::int32 symbolicSampleSize) override;
    Steinberg::tresult PLUGIN_API setProcessing (Steinberg::TBool state) override;
    Steinberg::tresult PLUGIN_API process (Steinberg::Vst::ProcessData& data) override;

    Steinberg::IPlugView* PLUGIN_API createView (Steinberg::FIDString name) override;

    // ARA::IPlugInEntryPoint(2)
    const ARA::ARAFactory* PLUGIN_API getFactory() SMTG_OVERRIDE;
    const ARA::ARAPlugInExtensionInstance* PLUGIN_API bindToDocumentController (ARA::ARADocumentControllerRef controllerRef) SMTG_OVERRIDE;
    const ARA::ARAPlugInExtensionInstance* PLUGIN_API bindToDocumentControllerWithRoles (ARA::ARADocumentControllerRef controllerRef,
                                                                                         ARA::ARAPlugInInstanceRoleFlags knownRoles,
                                                                                         ARA::ARAPlugInInstanceRoleFlags assignedRoles) SMTG_OVERRIDE;

    // ui::Backend
    Json call (const std::string& method, const Json& params) override;
    void setEventSink (EventSink sink) override;
    std::pair<int, int> editorSize() const override;
    void setEditorSize (int width, int height) override;

    OBJ_METHODS (AraEffect, SingleComponentEffect)
    DEFINE_INTERFACES
        DEF_INTERFACE (ARA::IPlugInEntryPoint)
        DEF_INTERFACE (ARA::IPlugInEntryPoint2)
    END_DEFINE_INTERFACES (SingleComponentEffect)
    REFCOUNT_METHODS (SingleComponentEffect)

private:
    /// The clips of the document that are Plenio takes: which take each is, which plays, the song's other takes.
    Json araState();
    /// Another take arrived for a clip (main thread): it plays from now on, or the clip keeps what it had.
    void takeReady (const std::string& clipId, int number, std::shared_ptr<const struct AlternateHolder> holder, const std::string& problem);

    ARA::PlugIn::PlugInExtension araExtension;
    std::map<std::string, int> pendingTakes; // clip -> the take being made ready for it
    std::shared_ptr<bool> alive = std::make_shared<bool> (true);
    std::string hostName;
    EventSink sink;
    int editorWidth = 0;
    int editorHeight = 0;
};

} // namespace plenio::plugin
