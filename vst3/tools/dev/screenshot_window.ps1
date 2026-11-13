<#
.SYNOPSIS
    Saves a screenshot of a process's main window as PNG (for checking the plug-in's UI during development).

.PARAMETER ProcessId
    The process whose main window is captured.

.PARAMETER Out
    The PNG to write.

.PARAMETER TitleLike
    Instead of the main window: the first visible top-level window of the process whose title matches (wildcards).
#>
param(
    [Parameter(Mandatory)] [int]$ProcessId,
    [Parameter(Mandatory)] [string]$Out,
    [string]$TitleLike = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public static class PlenioWin {
    public delegate bool EnumProc(IntPtr hwnd, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr lParam);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int max);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdc, uint flags);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
    public static List<IntPtr> Windows(uint pid) {
        var found = new List<IntPtr>();
        EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p == pid && IsWindowVisible(h)) found.Add(h); return true; }, IntPtr.Zero);
        return found;
    }
    public static string Title(IntPtr h) { var sb = new StringBuilder(512); GetWindowText(h, sb, 512); return sb.ToString(); }
}
'@

[PlenioWin]::SetProcessDPIAware() | Out-Null
$windows = [PlenioWin]::Windows([uint32]$ProcessId)
if ($TitleLike) { $windows = $windows | Where-Object { [PlenioWin]::Title($_) -like $TitleLike } }
$hwnd = $windows | Select-Object -First 1
if (-not $hwnd) { throw "no visible window of process $ProcessId" }

[PlenioWin]::SetForegroundWindow($hwnd) | Out-Null
Start-Sleep -Milliseconds 400
$r = New-Object PlenioWin+RECT
[PlenioWin]::GetWindowRect($hwnd, [ref]$r) | Out-Null
$w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
$bitmap = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.CopyFromScreen($r.Left, $r.Top, 0, 0, (New-Object System.Drawing.Size $w, $h))
$g.Dispose()
$bitmap.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
Write-Host "saved $Out ($w x $h) of '$([PlenioWin]::Title($hwnd))'"
