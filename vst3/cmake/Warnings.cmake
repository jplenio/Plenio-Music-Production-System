# Warnings and common settings for Plenio's own targets (not for third-party code).

function(plenio_target_defaults target)
    target_compile_features(${target} PUBLIC cxx_std_20)
    if(MSVC)
        target_compile_options(${target} PRIVATE /W4 /permissive- /utf-8 /Zc:__cplusplus /EHsc
            /wd4100   # unreferenced parameter (VST3 interfaces)
            /wd4127   # conditional expression is constant
        )
        target_compile_definitions(${target} PRIVATE NOMINMAX=1 WIN32_LEAN_AND_MEAN=1 _CRT_SECURE_NO_WARNINGS=1 UNICODE=1 _UNICODE=1)
    else()
        target_compile_options(${target} PRIVATE -Wall -Wextra -Wno-unused-parameter)
    endif()
endfunction()
