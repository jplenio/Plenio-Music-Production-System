#include "platform/main_thread.h"
#include "core/log.h"

#include <algorithm>
#include <deque>
#include <map>
#include <memory>
#include <mutex>
#include <thread>

#ifdef _WIN32
 #include <windows.h>
#elif defined(__APPLE__)
 // the host's main run loop: tasks through the main dispatch queue, timers as run loop timers (plain C APIs)
 #include <CoreFoundation/CoreFoundation.h>
 #include <dispatch/dispatch.h>
 #include <cstdint>
#endif

namespace plenio::platform
{
namespace
{
struct Dispatcher
{
    std::mutex lock;
    std::deque<std::function<void()>> queue;
    std::map<int, std::function<void()>> timers;
    int nextTimer = 1;
    int users = 0;
    std::thread::id thread;
#ifdef _WIN32
    HWND window = nullptr;
#elif defined(__APPLE__)
    std::map<int, CFRunLoopTimerRef> runLoopTimers;
#endif
};

Dispatcher& dispatcher()
{
    static Dispatcher d;
    return d;
}

void drain()
{
    auto& d = dispatcher();
    for (int guard = 0; guard < 10000; ++guard)
    {
        std::function<void()> fn;
        {
            std::scoped_lock l (d.lock);
            if (d.queue.empty())
                return;
            fn = std::move (d.queue.front());
            d.queue.pop_front();
        }
        try
        {
            if (fn)
                fn();
        }
        catch (const std::exception& e)
        {
            log::error ("main thread task failed: {}", e.what());
        }
        catch (...)
        {
            log::error ("main thread task failed");
        }
    }
}

void fireTimer (int id)
{
    std::function<void()> fn;
    {
        auto& d = dispatcher();
        std::scoped_lock l (d.lock);
        auto it = d.timers.find (id);
        if (it == d.timers.end())
            return;
        fn = it->second; // a copy: the timer may remove itself while it runs
    }
    try
    {
        if (fn)
            fn();
    }
    catch (const std::exception& e)
    {
        log::error ("timer failed: {}", e.what());
    }
    catch (...)
    {
        log::error ("timer failed");
    }
}

#ifdef _WIN32
constexpr UINT drainMessage = WM_APP + 0x51;
const wchar_t* className = L"PlenioVST3Dispatcher";

HINSTANCE moduleHandle()
{
    HMODULE module = nullptr;
    GetModuleHandleExW (GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
                        reinterpret_cast<LPCWSTR> (&moduleHandle), &module);
    return module;
}

LRESULT CALLBACK windowProc (HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    if (message == drainMessage)
    {
        drain();
        return 0;
    }
    if (message == WM_TIMER)
    {
        fireTimer (static_cast<int> (wParam));
        return 0;
    }
    return DefWindowProcW (hwnd, message, wParam, lParam);
}
#elif defined(__APPLE__)
void drainOnMain (void*)
{
    drain();
}

void timerFired (CFRunLoopTimerRef, void* info)
{
    fireTimer (static_cast<int> (reinterpret_cast<std::intptr_t> (info)));
}
#endif
} // namespace

void attachMainThread()
{
    auto& d = dispatcher();
    std::scoped_lock l (d.lock);
    if (d.users++ > 0)
        return;

    d.thread = std::this_thread::get_id();
#ifdef _WIN32
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof (wc);
    wc.lpfnWndProc = windowProc;
    wc.hInstance = moduleHandle();
    wc.lpszClassName = className;
    RegisterClassExW (&wc); // fails harmlessly when still registered
    d.window = CreateWindowExW (0, className, L"", 0, 0, 0, 0, 0, HWND_MESSAGE, nullptr, wc.hInstance, nullptr);
    if (d.window == nullptr)
        log::error ("the dispatcher window could not be created ({})", GetLastError());
#endif
}

void detachMainThread()
{
    auto& d = dispatcher();
    std::scoped_lock l (d.lock);
    if (d.users == 0 || --d.users > 0)
        return;

#ifdef _WIN32
    if (d.window != nullptr)
    {
        for (auto& [id, fn] : d.timers)
            KillTimer (d.window, static_cast<UINT_PTR> (id));
        DestroyWindow (d.window);
        d.window = nullptr;
    }
    UnregisterClassW (className, moduleHandle());
#elif defined(__APPLE__)
    for (auto& [id, timer] : d.runLoopTimers)
    {
        CFRunLoopTimerInvalidate (timer);
        CFRelease (timer);
    }
    d.runLoopTimers.clear();
#endif
    d.timers.clear();
    d.queue.clear();
}

bool isMainThread() noexcept
{
    return dispatcher().thread == std::this_thread::get_id();
}

void postToMainThread (std::function<void()> fn)
{
    auto& d = dispatcher();
    std::scoped_lock l (d.lock);
    if (d.users == 0)
        return;
    d.queue.push_back (std::move (fn));
#ifdef _WIN32
    if (d.window != nullptr && d.queue.size() == 1)
        PostMessageW (d.window, drainMessage, 0, 0);
#elif defined(__APPLE__)
    if (d.queue.size() == 1)
        dispatch_async_f (dispatch_get_main_queue(), nullptr, drainOnMain);
#endif
}

int addTimer (int milliseconds, std::function<void()> fn)
{
    auto& d = dispatcher();
    std::scoped_lock l (d.lock);
    if (d.users == 0)
        return 0;
    int id = d.nextTimer++;
    d.timers[id] = std::move (fn);
#ifdef _WIN32
    if (d.window == nullptr || SetTimer (d.window, static_cast<UINT_PTR> (id), static_cast<UINT> (milliseconds), nullptr) == 0)
    {
        d.timers.erase (id);
        return 0;
    }
#elif defined(__APPLE__)
    CFRunLoopTimerContext context {};
    context.info = reinterpret_cast<void*> (static_cast<std::intptr_t> (id));
    const double interval = std::max (1, milliseconds) / 1000.0;
    auto timer = CFRunLoopTimerCreate (kCFAllocatorDefault, CFAbsoluteTimeGetCurrent() + interval, interval, 0, 0, timerFired, &context);
    if (timer == nullptr)
    {
        d.timers.erase (id);
        return 0;
    }
    CFRunLoopAddTimer (CFRunLoopGetMain(), timer, kCFRunLoopCommonModes);
    d.runLoopTimers[id] = timer;
#endif
    return id;
}

void removeTimer (int id)
{
    auto& d = dispatcher();
    std::scoped_lock l (d.lock);
    if (d.timers.erase (id) == 0)
        return;
#ifdef _WIN32
    if (d.window != nullptr)
        KillTimer (d.window, static_cast<UINT_PTR> (id));
#elif defined(__APPLE__)
    if (auto it = d.runLoopTimers.find (id); it != d.runLoopTimers.end())
    {
        CFRunLoopTimerInvalidate (it->second);
        CFRelease (it->second);
        d.runLoopTimers.erase (it);
    }
#endif
}

} // namespace plenio::platform
