cmake_minimum_required(VERSION 3.25)

# Plenio VST3: the Plenio Music Production System as a VST3 instrument (Plenio) and an ARA 2 clip companion
# (Plenio ARA) in one bundle. Dependencies come from external/ (tools/fetch_deps.ps1).

set(PLENIO_EXTERNAL "${CMAKE_CURRENT_SOURCE_DIR}/external" CACHE PATH "Folder of the fetched dependencies")
if(NOT EXISTS "${PLENIO_EXTERNAL}/vst3sdk/CMakeLists.txt")
    message(FATAL_ERROR "Dependencies missing: run tools/fetch_deps.ps1 first")
endif()

# The VST3 SDK: no examples of its own, no VSTGUI (the UI is a WebView), no links into system folders
# (tools/install.ps1 installs), the validator after every build, the C runtime linked statically so that the
# plug-in needs no Visual C++ redistributable.
set(SMTG_ENABLE_VST3_PLUGIN_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SMTG_ENABLE_VST3_HOSTING_EXAMPLES ON CACHE BOOL "")  # EditorHost and the validator; off for the core alone
set(SMTG_ENABLE_VSTGUI_SUPPORT OFF CACHE BOOL "" FORCE)
set(SMTG_CREATE_PLUGIN_LINK OFF CACHE BOOL "" FORCE)
set(SMTG_RUN_VST_VALIDATOR ON CACHE BOOL "")
set(SMTG_USE_STATIC_CRT ON CACHE BOOL "" FORCE)
set(SMTG_CXX_STANDARD "20" CACHE STRING "" FORCE)
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

set(vst3sdk_SOURCE_DIR "${PLENIO_EXTERNAL}/vst3sdk")

# One version for the whole repository: the plug-in carries Plenio's (pyproject.toml at the repository's root).
file(READ "${CMAKE_CURRENT_SOURCE_DIR}/../pyproject.toml" PLENIO_PYPROJECT)
string(REGEX MATCH "\nversion = \"([0-9]+\\.[0-9]+\\.[0-9]+)\"" _ "${PLENIO_PYPROJECT}")
if(NOT CMAKE_MATCH_1)
    message(FATAL_ERROR "No version found in ../pyproject.toml")
endif()
set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/../pyproject.toml")

project(PlenioVST3
    VERSION ${CMAKE_MATCH_1}
    DESCRIPTION "Plenio Music Production System as a VST3 and ARA 2 plug-in"
    HOMEPAGE_URL "https://github.com/jplenio/Plenio-Music-Production-System/tree/main/vst3"
    LANGUAGES C CXX
)
set(PLENIO_VERSION_STRING "${PROJECT_VERSION}")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set_property(GLOBAL PROPERTY USE_FOLDERS ON)

add_subdirectory("${vst3sdk_SOURCE_DIR}" "${PROJECT_BINARY_DIR}/vst3sdk")
smtg_enable_vst3_sdk()

# ARA 2: the plug-in side library
set(ARA_API_DIR "${PLENIO_EXTERNAL}/ARA_SDK/ARA_API" CACHE PATH "" FORCE)
add_subdirectory("${PLENIO_EXTERNAL}/ARA_SDK/ARA_Library" "${PROJECT_BINARY_DIR}/ARA_Library" EXCLUDE_FROM_ALL)

include(cmake/Dependencies.cmake)
include(cmake/Warnings.cmake)
include(cmake/WebUI.cmake)

add_subdirectory(src)

option(PLENIO_BUILD_TESTS "Build the tests" ON)
if(PLENIO_BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()
