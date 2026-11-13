-- Plenio VST3's media tools: tells whether REAPER runs a script handed over on its command line.
local path = reaper.GetResourcePath() -- not written to: only to show REAPER answered
local out = io.open(os.getenv("TEMP") .. "\\plenio-reaper-probe.txt", "w")
if out then
  out:write("REAPER " .. reaper.GetAppVersion() .. "\n" .. path .. "\n")
  out:close()
end
