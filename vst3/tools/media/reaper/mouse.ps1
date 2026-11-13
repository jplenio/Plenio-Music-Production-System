<#
.SYNOPSIS
    Plenio VST3's media tools: moves the mouse smoothly to a point (screen pixels) and clicks there, for recordings.

.EXAMPLE
    tools\media\reaper\mouse.ps1 -X 1250 -Y 368 -Double
#>
param([int]$X, [int]$Y, [switch]$Double, [switch]$NoClick, [int]$Ms = 700)

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class PlenioMouse {
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
    [DllImport("user32.dll")] public static extern void mouse_event(uint flags, int dx, int dy, uint data, UIntPtr extra);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
}
'@
[PlenioMouse]::SetProcessDPIAware() | Out-Null
$p = New-Object PlenioMouse+POINT
[PlenioMouse]::GetCursorPos([ref]$p) | Out-Null
$steps = [Math]::Max(1, [int]($Ms / 15))
for ($i = 1; $i -le $steps; $i++) {
    $u = $i / $steps
    $e = if ($u -lt 0.5) { 2 * $u * $u } else { 1 - [Math]::Pow(-2 * $u + 2, 2) / 2 }
    [PlenioMouse]::SetCursorPos([int]($p.X + ($X - $p.X) * $e), [int]($p.Y + ($Y - $p.Y) * $e)) | Out-Null
    Start-Sleep -Milliseconds 15
}
if (-not $NoClick) {
    $times = if ($Double) { 2 } else { 1 }
    for ($k = 0; $k -lt $times; $k++) {
        [PlenioMouse]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)   # left down
        Start-Sleep -Milliseconds 40
        [PlenioMouse]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)   # left up
        Start-Sleep -Milliseconds 80
    }
}
