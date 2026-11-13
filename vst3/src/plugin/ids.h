// The names and class ids of the bundle's plug-ins. A class id never changes once released: hosts store it in
// their projects.
#pragma once

#include "pluginterfaces/base/funknown.h"

namespace plenio
{

inline constexpr const char* vendorName = "Plenio";
inline constexpr const char* vendorUrl = "https://github.com/jplenio/Plenio-Music-Production-System/tree/main/vst3";
inline constexpr const char* vendorMail = "";

/// The instrument: one song, its takes and stems, played in sync with the host.
inline constexpr const char* instrumentName = "Plenio";
/// The ARA 2 clip companion. Its ARA main factory class carries the same name: ARA hosts match them by name.
inline constexpr const char* araName = "Plenio ARA";

inline const Steinberg::FUID instrumentClassId (0x7B8DA237, 0x34F141E0, 0x8F0766C4, 0x1B885A5D);
inline const Steinberg::FUID araEffectClassId (0xCEB83E41, 0x0D9C4115, 0xA36698FF, 0x1D6F7FC6);
inline const Steinberg::FUID araMainFactoryClassId (0xF2B2D18E, 0xC8394841, 0xA419E11C, 0xE9685DB7);

/// ARA identifiers (reverse domain names; the archive id changes when the archive format does).
inline constexpr const char* araFactoryId = "com.github.jplenio.plenio-vst3.ara.factory";
inline constexpr const char* araDocumentArchiveId = "com.github.jplenio.plenio-vst3.ara.document.v1";

} // namespace plenio
