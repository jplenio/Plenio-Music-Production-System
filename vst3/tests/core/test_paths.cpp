#include <doctest/doctest.h>

#include "core/paths.h"

#include <cstdlib>
#include <filesystem>

using namespace plenio;

TEST_CASE ("safe names keep text and drop what file systems refuse")
{
    CHECK (paths::safeName ("Night Drive") == "Night Drive");
    CHECK (paths::safeName ("a/b\\c:d*e?f\"g<h>i|j") == "a_b_c_d_e_f_g_h_i_j");
    CHECK (paths::safeName ("  trailing dots... ") == "trailing dots");
    CHECK (paths::safeName ("") == "untitled");
    CHECK (paths::safeName ("CON") == "CON_");
    CHECK (paths::safeName ("Grüße aus Köln") == "Grüße aus Köln");
}

TEST_CASE ("safe names cut long text at a character boundary")
{
    std::string umlauts;
    for (int i = 0; i < 60; ++i)
        umlauts += "ü"; // two bytes each
    auto cut = paths::safeName (umlauts, 81);
    CHECK (cut.size() == 80);
    CHECK ((static_cast<unsigned char> (cut.back()) & 0xC0) == 0x80); // ends on the second byte of a "ü"
}

TEST_CASE ("UTF-8 paths survive the round trip")
{
    auto p = paths::fromUtf8 ("C:/Lieder/Grüße.flac");
    CHECK (paths::toUtf8 (p) == "C:/Lieder/Grüße.flac");
}

TEST_CASE ("PLENIO_VST3_HOME keeps settings, cache and songs apart")
{
#ifdef _WIN32
    const wchar_t* before = _wgetenv (L"PLENIO_VST3_HOME");
    const std::wstring previous = before != nullptr ? before : L""; // the tests' own home (tests/main.cpp)
    auto dev = std::filesystem::temp_directory_path() / "plenio-vst3-home-test";
    _wputenv_s (L"PLENIO_VST3_HOME", dev.wstring().c_str());
    CHECK (paths::appData() == dev / "config");
    CHECK (paths::localData() == dev / "cache");
    CHECK (paths::defaultLibrary() == dev / "Songs");
    _wputenv_s (L"PLENIO_VST3_HOME", previous.c_str());
    CHECK (paths::appData() != dev / "config");
#endif
}
