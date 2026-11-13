#define DOCTEST_CONFIG_IMPLEMENT
#include <doctest/doctest.h>

#include <cstdlib>
#include <filesystem>

// The tests keep their settings, cache, log and songs apart from the user's: PLENIO_VST3_HOME, unless it is set.
int main (int argc, char** argv)
{
    const auto home = std::filesystem::temp_directory_path() / "plenio-vst3-tests";
#ifdef _WIN32
    if (const wchar_t* set = _wgetenv (L"PLENIO_VST3_HOME"); set == nullptr || *set == 0)
        _wputenv_s (L"PLENIO_VST3_HOME", home.wstring().c_str());
#else
    if (const char* set = std::getenv ("PLENIO_VST3_HOME"); set == nullptr || *set == 0)
        setenv ("PLENIO_VST3_HOME", home.c_str(), 1);
#endif
    doctest::Context context (argc, argv);
    return context.run();
}
