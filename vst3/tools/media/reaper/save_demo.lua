-- Plenio VST3's media tools: saves the demo project (in the repository's .dev folder), so REAPER quits without asking.
local here = debug.getinfo(1, "S").source:sub(2):match("^(.*)save_demo%.lua$")
local folder = here .. "../../../.dev/reaper-demo/"
reaper.RecursiveCreateDirectory(folder, 0)
reaper.Main_SaveProjectEx(0, folder .. "Plenio Demo.rpp", 0)
