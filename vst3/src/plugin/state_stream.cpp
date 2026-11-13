#include "plugin/state_stream.h"
#include "core/log.h"

#include <array>
#include <cstring>
#include <string>

namespace plenio::plugin
{
namespace
{
constexpr std::array<char, 4> magic { 'P', 'L', 'N', 'V' };
constexpr std::uint32_t formatVersion = 1;

bool writeAll (Steinberg::IBStream* stream, const void* data, std::uint64_t size)
{
    auto* bytes = static_cast<const char*> (data);
    while (size > 0)
    {
        auto chunk = static_cast<Steinberg::int32> (std::min<std::uint64_t> (size, 1u << 20));
        Steinberg::int32 written = 0;
        if (stream->write (const_cast<char*> (bytes), chunk, &written) != Steinberg::kResultOk || written <= 0)
            return false;
        bytes += written;
        size -= static_cast<std::uint64_t> (written);
    }
    return true;
}

bool readAll (Steinberg::IBStream* stream, void* data, std::uint64_t size)
{
    auto* bytes = static_cast<char*> (data);
    while (size > 0)
    {
        auto chunk = static_cast<Steinberg::int32> (std::min<std::uint64_t> (size, 1u << 20));
        Steinberg::int32 read = 0;
        if (stream->read (bytes, chunk, &read) != Steinberg::kResultOk || read <= 0)
            return false;
        bytes += read;
        size -= static_cast<std::uint64_t> (read);
    }
    return true;
}

void putU32 (char* at, std::uint32_t v)
{
    for (int i = 0; i < 4; ++i)
        at[i] = static_cast<char> ((v >> (8 * i)) & 0xFF);
}

void putU64 (char* at, std::uint64_t v)
{
    for (int i = 0; i < 8; ++i)
        at[i] = static_cast<char> ((v >> (8 * i)) & 0xFF);
}

std::uint32_t getU32 (const char* at)
{
    std::uint32_t v = 0;
    for (int i = 0; i < 4; ++i)
        v |= static_cast<std::uint32_t> (static_cast<unsigned char> (at[i])) << (8 * i);
    return v;
}

std::uint64_t getU64 (const char* at)
{
    std::uint64_t v = 0;
    for (int i = 0; i < 8; ++i)
        v |= static_cast<std::uint64_t> (static_cast<unsigned char> (at[i])) << (8 * i);
    return v;
}
} // namespace

bool writeState (Steinberg::IBStream* stream, const Json& state)
{
    if (stream == nullptr)
        return false;
    try
    {
        auto text = state.dump (-1, ' ', false, Json::error_handler_t::replace);
        char header[16];
        std::memcpy (header, magic.data(), 4);
        putU32 (header + 4, formatVersion);
        putU64 (header + 8, text.size());
        return writeAll (stream, header, sizeof (header)) && writeAll (stream, text.data(), text.size());
    }
    catch (const std::exception& e)
    {
        log::error ("state: not written: {}", e.what());
        return false;
    }
}

std::optional<Json> readState (Steinberg::IBStream* stream)
{
    if (stream == nullptr)
        return std::nullopt;
    char header[16];
    if (! readAll (stream, header, sizeof (header)) || std::memcmp (header, magic.data(), 4) != 0)
    {
        log::warn ("state: not a Plenio state");
        return std::nullopt;
    }
    auto version = getU32 (header + 4);
    auto size = getU64 (header + 8);
    if (version > formatVersion || size > maxStateBytes)
    {
        log::warn ("state: version {} or size {} not readable", version, size);
        return std::nullopt;
    }
    std::string text (static_cast<std::size_t> (size), '\0');
    if (! readAll (stream, text.data(), size))
    {
        log::warn ("state: cut short");
        return std::nullopt;
    }
    auto parsed = json::parse (text);
    if (! parsed || ! parsed->is_object())
    {
        log::warn ("state: not JSON");
        return std::nullopt;
    }
    return parsed;
}

} // namespace plenio::plugin
