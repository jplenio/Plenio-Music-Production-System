-- Plenio VST3's media tools: shows Plenio's floating window, or hides it when plenio_hide.lua set the flag (ExtState plenio_media hide).
local hide = reaper.GetExtState("plenio_media", "hide") == "1"
for t = 0, reaper.CountTracks(0) - 1 do
  local track = reaper.GetTrack(0, t)
  for f = 0, reaper.TrackFX_GetCount(track) - 1 do
    local _, name = reaper.TrackFX_GetFXName(track, f, "")
    if name:find("Plenio") and not name:find("ARA") then
      reaper.TrackFX_Show(track, f, hide and 2 or 3)
      return
    end
  end
end
