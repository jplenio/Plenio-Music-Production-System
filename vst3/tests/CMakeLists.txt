# Unit tests of the core and the engine (doctest), run with ctest or tools/test.ps1.

add_executable(plenio_tests
    main.cpp
    core/test_paths.cpp
    core/test_midi_score.cpp
    core/test_timeline.cpp
    core/test_song.cpp
    core/test_api.cpp
    core/test_daw.cpp
    core/test_clip_content.cpp
    core/test_cover_art.cpp
    engine/test_player.cpp
)
plenio_target_defaults(plenio_tests)
target_link_libraries(plenio_tests PRIVATE plenio_core plenio_engine plenio_doctest)

# REAPER's side of the plug-in, against a fake REAPER (no DAW runs in the tests)
target_sources(plenio_tests PRIVATE plugin/test_reaper.cpp "${PROJECT_SOURCE_DIR}/src/plugin/reaper.cpp")
target_include_directories(plenio_tests PRIVATE "${PROJECT_SOURCE_DIR}/src" "${vst3sdk_SOURCE_DIR}")
target_link_libraries(plenio_tests PRIVATE pluginterfaces plenio_reaper_sdk)
target_compile_definitions(plenio_tests PRIVATE PLENIO_TEST_DATA="${CMAKE_CURRENT_SOURCE_DIR}/data")
set_target_properties(plenio_tests PROPERTIES FOLDER "Tests")
add_test(NAME plenio_tests COMMAND plenio_tests)
