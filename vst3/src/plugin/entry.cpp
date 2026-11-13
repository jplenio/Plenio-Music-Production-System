// The bundle's factory: Plenio (instrument), Plenio ARA (ARA 2 effect) and the ARA main factory class. The ARA main
// factory carries the ARA effect's name: ARA hosts pair them by name when a module holds several effect classes.

#include "plugin/ids.h"
#include "plugin/instrument.h"
#include "plugin/ara_effect.h"
#include "ara/factory.h"
#include "plenio_version.h"

#include "public.sdk/source/main/pluginfactory.h"
#include "pluginterfaces/vst/ivstaudioprocessor.h"
#include "pluginterfaces/vst/ivstcomponent.h"

using namespace Steinberg;
using namespace Steinberg::Vst;

bool InitModule()
{
    return true;
}

bool DeinitModule()
{
    return true;
}

DEF_CLASS_IID (ARA::IMainFactory)
DEF_CLASS_IID (ARA::IPlugInEntryPoint)
DEF_CLASS_IID (ARA::IPlugInEntryPoint2)

BEGIN_FACTORY_DEF (plenio::vendorName, plenio::vendorUrl, plenio::vendorMail)

    DEF_CLASS2 (INLINE_UID_FROM_FUID (plenio::instrumentClassId),
                PClassInfo::kManyInstances,
                kVstAudioEffectClass,
                plenio::instrumentName,
                0,                                  // one component: processor and controller together
                "Instrument|Generator",
                PLENIO_VERSION_NUMBERS,
                kVstVersionString,
                plenio::plugin::Instrument::createInstance)

    DEF_CLASS2 (INLINE_UID_FROM_FUID (plenio::araEffectClassId),
                PClassInfo::kManyInstances,
                kVstAudioEffectClass,
                plenio::araName,
                0,
                "Fx|OnlyARA",
                PLENIO_VERSION_NUMBERS,
                kVstVersionString,
                plenio::plugin::AraEffect::createInstance)

    DEF_CLASS2 (INLINE_UID_FROM_FUID (plenio::araMainFactoryClassId),
                PClassInfo::kManyInstances,
                kARAMainFactoryClass,
                plenio::araName,                    // must equal the ARA effect's name
                0,
                "",
                PLENIO_VERSION_NUMBERS,
                kVstVersionString,
                plenio::ara::MainFactory::createInstance)

END_FACTORY
