-- Plenio VST3's media tools: hides Plenio's floating window.
reaper.SetExtState("plenio_media", "hide", "1", false)
dofile(debug.getinfo(1, "S").source:sub(2):match("^(.*)plenio_hide%.lua$") .. "plenio_window.lua")
