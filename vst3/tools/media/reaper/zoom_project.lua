-- Plenio VST3's media tools: the whole project in view, the tracks fitted.
reaper.Main_OnCommand(40295, 0) -- View: Zoom out project
reaper.Main_OnCommand(40113, 0) -- View: Toggle track zoom to maximum height (off again below)
reaper.Main_OnCommand(40113, 0)
reaper.TrackList_AdjustWindows(false)
reaper.UpdateArrange()
