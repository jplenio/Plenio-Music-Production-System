# Plenio's own code: the core (no VST3), the engine, and the bundle with both plug-ins.

# which Plenio the plug-in works with (resources/plenio-compat.json, kept up to date by the Plenio check)
file(READ "${PROJECT_SOURCE_DIR}/resources/plenio-compat.json" PLENIO_COMPAT_JSON)
string(JSON PLENIO_MINIMUM GET "${PLENIO_COMPAT_JSON}" minimum)
string(JSON PLENIO_RECOMMENDED GET "${PLENIO_COMPAT_JSON}" recommended)
string(JSON PLENIO_TESTED GET "${PLENIO_COMPAT_JSON}" tested)
set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS "${PROJECT_SOURCE_DIR}/resources/plenio-compat.json")
configure_file("${CMAKE_CURRENT_SOURCE_DIR}/plugin/version.h.in" "${PLENIO_GENERATED}/plenio_version.h" @ONLY)

add_subdirectory(core)
add_subdirectory(engine)

# The bundle with both plug-ins: Windows and macOS. On Linux only the core and its tests for now (the plug-in's window
# there, a GTK WebView inside the host's X11 window, is still to come).
if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    option(PLENIO_BUILD_PLUGIN "Build the plug-in bundle" OFF)
else()
    option(PLENIO_BUILD_PLUGIN "Build the plug-in bundle" ON)
endif()
if(NOT PLENIO_BUILD_PLUGIN)
    return()
endif()

set(PLENIO_PLUGIN_SOURCES
    plugin/entry.cpp
    plugin/ids.h
    plugin/instrument.h
    plugin/instrument.cpp
    plugin/ara_effect.h
    plugin/ara_effect.cpp
    plugin/state_stream.h
    plugin/state_stream.cpp
    plugin/song_controller.h
    plugin/song_controller.cpp
    platform/dialogs.h
    platform/dialogs.cpp
    platform/drag.h
    platform/drag.cpp
    platform/keys.h
    platform/keys.cpp
    plugin/reaper.h
    plugin/reaper.cpp
    ara/document_controller.h
    ara/document_controller.cpp
    ara/playback_renderer.h
    ara/playback_renderer.cpp
    ara/audio_source.h
    ara/audio_source.cpp
    ara/content_reader.h
    ara/factory.h
    ara/factory.cpp
    ui/backend.h
    ui/editor_view.h
    ui/editor_view.cpp
    ui/webview_panel.h
    ui/webview_panel.cpp
    ui/webui_resources.h
    "${vst3sdk_SOURCE_DIR}/public.sdk/source/vst/vstsinglecomponenteffect.cpp"
    "${PLENIO_WEBUI_CPP}"
)

# the bundle's folder icon: Plenio's own (the SDK's default is the VST logo, a Steinberg trademark)
set(SMTG_PACKAGE_ICON_PATH "${PROJECT_SOURCE_DIR}/resources/plenio.ico")
smtg_add_vst3plugin(Plenio ${PLENIO_PLUGIN_SOURCES})
plenio_target_defaults(Plenio)
target_include_directories(Plenio PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}" "${PLENIO_GENERATED}")
target_link_libraries(Plenio PRIVATE
    sdk
    ARA_PlugIn_Library
    plenio_core
    plenio_engine
    plenio_choc
    plenio_reaper_sdk
)
add_dependencies(Plenio plenio_webui)
set_source_files_properties("${PLENIO_WEBUI_CPP}" PROPERTIES GENERATED TRUE)
set_target_properties(Plenio PROPERTIES FOLDER "Plenio")

if(WIN32)
    target_sources(Plenio PRIVATE "${PROJECT_SOURCE_DIR}/resources/plenio.rc")
    target_link_libraries(Plenio PRIVATE ole32 oleaut32 shell32 shlwapi user32 gdi32 version)
endif()
if(APPLE)
    # the WebView is a WKWebView in the host's NSView; timers and tasks on the main run loop
    target_link_libraries(Plenio PRIVATE "-framework Cocoa" "-framework WebKit" "-framework CoreFoundation")
    set_target_properties(Plenio PROPERTIES
        MACOSX_BUNDLE_INFO_PLIST "${PROJECT_SOURCE_DIR}/resources/mac/Info.plist.in"
        MACOSX_BUNDLE_GUI_IDENTIFIER "io.github.jplenio.plenio-vst3"
        MACOSX_BUNDLE_SHORT_VERSION_STRING "${PROJECT_VERSION}"
        MACOSX_BUNDLE_BUNDLE_VERSION "${PROJECT_VERSION}"
        MACOSX_BUNDLE_COPYRIGHT "Johannes Plenio, Apache-2.0"
    )
endif()

if(MSVC)
    # the generated web UI source is large: no warnings and the big-object format for it
    set_source_files_properties("${PLENIO_WEBUI_CPP}" PROPERTIES COMPILE_OPTIONS "/W0;/bigobj")
endif()
