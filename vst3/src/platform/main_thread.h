// Running work on the host's UI thread (the "main thread" of the plug-in): results of background work, the
// WebView, the REAPER API and ARA model calls all belong there.
//
// attach() is called on the UI thread when a plug-in instance is created and detach() when it goes; the dispatcher
// lives while at least one instance does. post() works from any thread; work posted while no instance lives is
// dropped. Timers call back on the UI thread.
#pragma once

#include <functional>

namespace plenio::platform
{

void attachMainThread();
void detachMainThread();

/// True on the thread that attached the dispatcher.
bool isMainThread() noexcept;

/// Runs `fn` on the UI thread soon (in order). Safe from any thread except the audio thread (it allocates).
void postToMainThread (std::function<void()> fn);

/// Calls `fn` on the UI thread about every `milliseconds`; returns an id for removeTimer (0: failed).
int addTimer (int milliseconds, std::function<void()> fn);
void removeTimer (int id);

} // namespace plenio::platform
