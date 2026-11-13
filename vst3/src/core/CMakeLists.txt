# plenio_core: everything that needs neither VST3 nor a UI. Testable on its own (tests/core).

add_library(plenio_core STATIC
    log.h log.cpp
    paths.h paths.cpp
    json.h
    midi_file.h midi_file.cpp
    chords.h chords.cpp
    score.h score.cpp
    timeline.h timeline.cpp
    record.h record.cpp
    song.h song.cpp
    library.h library.cpp
    client.h client.cpp
    audio_file.h audio_file.cpp
    settings.h settings.cpp
    studio.h studio.cpp
    session.h session.cpp
    daw_export.h daw_export.cpp
    clip_content.h clip_content.cpp
    cover_art.h cover_art.cpp
    ../platform/main_thread.h ../platform/main_thread.cpp
)
plenio_target_defaults(plenio_core)
target_include_directories(plenio_core PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/.." "${PLENIO_GENERATED}")
target_link_libraries(plenio_core PUBLIC plenio_json PRIVATE plenio_httplib plenio_drlibs plenio_r8brain)
if(WIN32)
    target_link_libraries(plenio_core PUBLIC shell32 ole32)
endif()
set_target_properties(plenio_core PROPERTIES FOLDER "Plenio")
if(MSVC)
    # third-party single headers compiled in these files
    set_source_files_properties(audio_file.cpp client.cpp PROPERTIES COMPILE_OPTIONS "/W3;/wd4244;/wd4267;/wd4456;/wd4457;/wd4245")
endif()
