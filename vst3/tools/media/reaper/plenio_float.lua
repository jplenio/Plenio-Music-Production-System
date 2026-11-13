-- Plenio VST3's media tools: Plenio in a floating window of its own (the FX chain closed).
for t = 0, reaper.CountTracks(0) - 1 do
  local track = reaper.GetTrack(0, t)
  for f = 0, reaper.TrackFX_GetCount(track) - 1 do
    local _, name = reaper.TrackFX_GetFXName(track, f, "")
    if name:find("Plenio") and not name:find("ARA") then
      reaper.TrackFX_Show(track, f, 0) -- the chain closed
      reaper.TrackFX_Show(track, f, 3) -- the plug-in floating
      return
    end
  end
end
