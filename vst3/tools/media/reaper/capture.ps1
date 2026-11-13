<#
.SYNOPSIS
    Plenio VST3's media tools: a picture of a window (by its title) or of the whole screen, as PNG.

.EXAMPLE
    tools\media\reaper\capture.ps1 -Title 'REAPER v7' -Out shot.png
    tools\media\reaper\capture.ps1 -Screen -Out screen.png
#>
param([string]$Title = '', [switch]$Screen, [string]$Out = 'capture.png', [switch]$List)

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
public static class PlenioWin {
    public delegate bool EnumProc(IntPtr h, IntPtr p);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr p);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
    public static List<KeyValuePair<IntPtr, string>> Windows() {
        var list = new List<KeyValuePair<IntPtr, string>>();
        EnumWindows((h, p) => {
            if (!IsWindowVisible(h)) return true;
            var s = new StringBuilder(512);
            GetWindowText(h, s, 512);
            if (s.Length > 0) list.Add(new KeyValuePair<IntPtr, string>(h, s.ToString()));
            return true;
        }, IntPtr.Zero);
        return list;
    }
}
'@
[PlenioWin]::SetProcessDPIAware() | Out-Null

if ($List) {
    [PlenioWin]::Windows() | ForEach-Object { '{0}  {1}' -f $_.Key, $_.Value }
    return
}

if ($Screen) {
    $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CopyFromScreen($b.Left, $b.Top, 0, 0, $bmp.Size)
    $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Host "$Out ($($b.Width) x $($b.Height))"
    return
}

$hit = [PlenioWin]::Windows() | Where-Object { $_.Value -like "*$Title*" } | Select-Object -First 1
if (-not $hit) { throw "no window titled *$Title*" }
$r = New-Object PlenioWin+RECT
[PlenioWin]::GetWindowRect($hit.Key, [ref]$r) | Out-Null
$w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$dc = $g.GetHdc()
[PlenioWin]::PrintWindow($hit.Key, $dc, 2) | Out-Null   # PW_RENDERFULLCONTENT: also GPU-drawn content (WebView2)
$g.ReleaseHdc($dc)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "$Out ($w x $h) '$($hit.Value)' at $($r.Left),$($r.Top)"
