// ARA content as the host reads it: a list of events of one ARA content type, owned by the reader (with the names
// the events point to, which must live as long as the reader).
#pragma once

#include "ARA_Library/PlugIn/ARAPlug.h"

#include <string>
#include <utility>
#include <vector>

namespace plenio::ara
{

template <typename Event>
class EventsReader final : public ARA::PlugIn::ContentReader
{
public:
    explicit EventsReader (std::vector<Event> e) : events (std::move (e)) {}

    /// Events with a name each (chords, keys): the reader keeps the strings and points the events at them.
    EventsReader (std::vector<Event> e, std::vector<std::string> n) : events (std::move (e)), names (std::move (n))
    {
        for (std::size_t i = 0; i < events.size() && i < names.size(); ++i)
            events[i].name = names[i].c_str();
    }

    ARA::ARAInt32 getEventCount() noexcept override { return static_cast<ARA::ARAInt32> (events.size()); }
    const void* getDataForEvent (ARA::ARAInt32 index) noexcept override
    {
        if (index < 0 || static_cast<std::size_t> (index) >= events.size())
            return nullptr;
        return &events[static_cast<std::size_t> (index)];
    }

private:
    std::vector<Event> events;
    std::vector<std::string> names;
};

} // namespace plenio::ara
