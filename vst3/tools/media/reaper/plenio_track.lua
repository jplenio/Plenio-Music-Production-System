-- Plenio VST3's media tools: Plenio on a new track (without the browser), its window open.
reaper.Undo_BeginBlock()
reaper.InsertTrackAtIndex(reaper.CountTracks(0), true)
local track = reaper.GetTrack(0, reaper.CountTracks(0) - 1)
reaper.GetSetMediaTrackInfo_String(track, "P_NAME", "Plenio", true)
local fx = reaper.TrackFX_AddByName(track, "VST3i:Plenio (Plenio)", false, -1)
if fx < 0 then fx = reaper.TrackFX_AddByName(track, "Plenio", false, -1) end
reaper.TrackFX_Show(track, fx, 3)
reaper.Undo_EndBlock("Plenio on a track", -1)
