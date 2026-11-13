# Header-only dependencies as interface targets (all fetched by tools/fetch_deps.ps1; licences in THIRD_PARTY.md).

add_library(plenio_json INTERFACE)
target_include_directories(plenio_json SYSTEM INTERFACE "${PLENIO_EXTERNAL}/json/single_include")
target_compile_definitions(plenio_json INTERFACE JSON_USE_IMPLICIT_CONVERSIONS=0)

add_library(plenio_httplib INTERFACE)
target_include_directories(plenio_httplib SYSTEM INTERFACE "${PLENIO_EXTERNAL}/cpp-httplib")
if(WIN32)
    target_link_libraries(plenio_httplib INTERFACE ws2_32 crypt32)
endif()

add_library(plenio_drlibs INTERFACE)
target_include_directories(plenio_drlibs SYSTEM INTERFACE "${PLENIO_EXTERNAL}/dr_libs")

# r8brain with its default double-precision FFT (Ooura): quality over speed, resampling runs off the audio thread
add_library(plenio_r8brain STATIC "${PLENIO_EXTERNAL}/r8brain/r8bbase.cpp")
target_include_directories(plenio_r8brain SYSTEM PUBLIC "${PLENIO_EXTERNAL}/r8brain")
set_target_properties(plenio_r8brain PROPERTIES FOLDER "Libraries")

add_library(plenio_choc INTERFACE)
target_include_directories(plenio_choc SYSTEM INTERFACE "${PLENIO_EXTERNAL}/choc")

add_library(plenio_reaper_sdk INTERFACE)
target_include_directories(plenio_reaper_sdk SYSTEM INTERFACE "${PLENIO_EXTERNAL}/reaper-sdk/sdk")

add_library(plenio_doctest INTERFACE)
target_include_directories(plenio_doctest SYSTEM INTERFACE "${PLENIO_EXTERNAL}/doctest")
