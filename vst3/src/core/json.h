// JSON helpers. Everything read from Plenio, files or the UI is hostile: these accessors never throw, cap text and
// fall back to a default when a value is missing or of another type.
#pragma once

#include <nlohmann/json.hpp>

#include <cmath>
#include <cstdint>
#include <optional>
#include <string>
#include <string_view>

namespace plenio
{

using Json = nlohmann::json;

namespace json
{

/// The most characters kept of one text read from outside (the Song API's own limit for documents).
inline constexpr std::size_t maxText = 200'000;

inline const Json* find (const Json& j, std::string_view key) noexcept
{
    if (! j.is_object())
        return nullptr;
    auto it = j.find (key);
    return it == j.end() ? nullptr : &*it;
}

inline std::string str (const Json& j, std::string_view key, std::string fallback = {}, std::size_t limit = maxText)
{
    if (auto* v = find (j, key); v != nullptr && v->is_string())
    {
        auto s = v->get_ref<const std::string&>();
        if (s.size() > limit)
            s.resize (limit);
        return s;
    }
    return fallback;
}

inline std::optional<double> num (const Json& j, std::string_view key) noexcept
{
    if (auto* v = find (j, key); v != nullptr && v->is_number())
    {
        auto d = v->get<double>();
        if (std::isfinite (d))
            return d;
    }
    return std::nullopt;
}

inline double num (const Json& j, std::string_view key, double fallback) noexcept
{
    return num (j, key).value_or (fallback);
}

inline std::int64_t integer (const Json& j, std::string_view key, std::int64_t fallback) noexcept
{
    if (auto* v = find (j, key); v != nullptr)
    {
        if (v->is_number_integer())
            return v->get<std::int64_t>();
        if (v->is_number_unsigned())
        {
            auto u = v->get<std::uint64_t>();
            return u > static_cast<std::uint64_t> (INT64_MAX) ? fallback : static_cast<std::int64_t> (u);
        }
        if (v->is_number_float())
        {
            auto d = v->get<double>();
            if (std::isfinite (d) && std::abs (d) < 9.0e15)
                return static_cast<std::int64_t> (d);
        }
    }
    return fallback;
}

inline bool boolean (const Json& j, std::string_view key, bool fallback) noexcept
{
    if (auto* v = find (j, key); v != nullptr && v->is_boolean())
        return v->get<bool>();
    return fallback;
}

inline const Json& obj (const Json& j, std::string_view key) noexcept
{
    static const Json empty = Json::object();
    if (auto* v = find (j, key); v != nullptr && v->is_object())
        return *v;
    return empty;
}

inline const Json& arr (const Json& j, std::string_view key) noexcept
{
    static const Json empty = Json::array();
    if (auto* v = find (j, key); v != nullptr && v->is_array())
        return *v;
    return empty;
}

/// Parses text that came from outside; nullopt instead of an exception.
inline std::optional<Json> parse (std::string_view text) noexcept
{
    try
    {
        auto j = Json::parse (text, nullptr, false);
        if (j.is_discarded())
            return std::nullopt;
        return j;
    }
    catch (...)
    {
        return std::nullopt;
    }
}

} // namespace json
} // namespace plenio
