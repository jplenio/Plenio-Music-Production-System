-- Plenio VST3's media tools: shows Plenio's floating window.
reaper.SetExtState("plenio_media", "hide", "0", false)
dofile(debug.getinfo(1, "S").source:sub(2):match("^(.*)plenio_show%.lua$") .. "plenio_window.lua")
