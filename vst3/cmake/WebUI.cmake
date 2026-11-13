# The web UI (webui/, Vue 3 + Vite) is built with npm and its files are compiled into the plug-in.
#
# PLENIO_WEBUI_DIST: the folder of the built UI (default webui/dist). When npm is found and
# PLENIO_BUILD_WEBUI is on, the build runs `npm run build` first. The plug-in can also load the UI from a folder
# at run time (environment variable PLENIO_WEBUI_DIR) to develop it without rebuilding the plug-in.

set(PLENIO_WEBUI_SOURCE "${CMAKE_CURRENT_SOURCE_DIR}/webui")
set(PLENIO_WEBUI_DIST "${PLENIO_WEBUI_SOURCE}/dist" CACHE PATH "The built web UI")
option(PLENIO_BUILD_WEBUI "Run npm to build the web UI" ON)

set(PLENIO_GENERATED "${PROJECT_BINARY_DIR}/generated")
file(MAKE_DIRECTORY "${PLENIO_GENERATED}")
set(PLENIO_WEBUI_CPP "${PLENIO_GENERATED}/webui_resources.cpp")

find_program(PLENIO_NPM NAMES npm.cmd npm)

file(GLOB_RECURSE PLENIO_WEBUI_INPUTS CONFIGURE_DEPENDS
    "${PLENIO_WEBUI_SOURCE}/src/*"
    "${PLENIO_WEBUI_SOURCE}/public/*"
    "${PLENIO_WEBUI_SOURCE}/index.html"
    "${PLENIO_WEBUI_SOURCE}/package.json"
    "${PLENIO_WEBUI_SOURCE}/vite.config.ts"
)

set(PLENIO_WEBUI_STAMP "${PLENIO_GENERATED}/webui.stamp")
if(PLENIO_BUILD_WEBUI AND PLENIO_NPM)
    add_custom_command(
        OUTPUT "${PLENIO_WEBUI_STAMP}"
        COMMAND "${PLENIO_NPM}" run build
        COMMAND "${CMAKE_COMMAND}" -E touch "${PLENIO_WEBUI_STAMP}"
        WORKING_DIRECTORY "${PLENIO_WEBUI_SOURCE}"
        DEPENDS ${PLENIO_WEBUI_INPUTS}
        COMMENT "Building the web UI (npm run build)"
        VERBATIM
    )
else()
    add_custom_command(
        OUTPUT "${PLENIO_WEBUI_STAMP}"
        COMMAND "${CMAKE_COMMAND}" -E touch "${PLENIO_WEBUI_STAMP}"
        COMMENT "Web UI: using the existing ${PLENIO_WEBUI_DIST}"
        VERBATIM
    )
endif()

add_custom_command(
    OUTPUT "${PLENIO_WEBUI_CPP}"
    COMMAND "${CMAKE_COMMAND}" -DSOURCE_DIR=${PLENIO_WEBUI_DIST} -DOUTPUT=${PLENIO_WEBUI_CPP}
            -P "${CMAKE_CURRENT_SOURCE_DIR}/cmake/EmbedFiles.cmake"
    DEPENDS "${PLENIO_WEBUI_STAMP}" "${CMAKE_CURRENT_SOURCE_DIR}/cmake/EmbedFiles.cmake"
    COMMENT "Embedding the web UI"
    VERBATIM
)
add_custom_target(plenio_webui DEPENDS "${PLENIO_WEBUI_CPP}")
set_target_properties(plenio_webui PROPERTIES FOLDER "Plenio")
