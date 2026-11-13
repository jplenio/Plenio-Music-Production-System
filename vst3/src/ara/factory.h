// The ARA factory of Plenio ARA and its VST3 main factory class (kARAMainFactoryClass), which lets hosts reach the
// factory without creating a plug-in instance (to restore ARA documents).
#pragma once

#include "ARA_API/ARAVST3.h"

namespace plenio::ara
{

const ARA::ARAFactory* factory() noexcept;

class MainFactory : public ARA::IMainFactory
{
public:
    MainFactory();
    virtual ~MainFactory();

    static Steinberg::FUnknown* createInstance (void*);

    const ARA::ARAFactory* PLUGIN_API getFactory() SMTG_OVERRIDE;

    DECLARE_FUNKNOWN_METHODS
};

} // namespace plenio::ara
