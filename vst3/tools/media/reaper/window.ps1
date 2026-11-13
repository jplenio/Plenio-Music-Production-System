<#
.SYNOPSIS
    Plenio VST3's media tools: puts a window (by its title) at a place and size, or in front, or sends it keys.

.EXAMPLE
    tools\media\reaper\window.ps1 -Title 'REAPER v7' -X 0 -Y 0 -Width 2560 -Height 1440
    tools\media\reaper\window.ps1 -Title 'Add FX' -Keys 'plenio'
#>
param([string]$Title, [int]$X = -1, [int]$Y = -1, [int]$Width = 0, [int]$Height = 0, [switch]$Front, [string]$Keys = '', [switch]$Rect)

Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class PlenioPlace {
    public delegate bool EnumProc(IntPtr h, IntPtr p);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr p);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int w, int hh, uint flags);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
    public static IntPtr Find(string part) {
        IntPtr found = IntPtr.Zero;
        EnumWindows((h, p) => {
            if (!IsWindowVisible(h)) return true;
            var s = new StringBuilder(512);
            GetWindowText(h, s, 512);
            if (s.ToString().Contains(part)) { found = h; return false; }
            return true;
        }, IntPtr.Zero);
        return found;
    }
}
'@
[PlenioPlace]::SetProcessDPIAware() | Out-Null
$h = [PlenioPlace]::Find($Title)
if ($h -eq [IntPtr]::Zero) { throw "no window titled *$Title*" }
if ($Width -gt 0) {
    [PlenioPlace]::ShowWindow($h, 9) | Out-Null   # SW_RESTORE: not maximized
    [PlenioPlace]::SetWindowPos($h, [IntPtr]::Zero, $X, $Y, $Width, $Height, 0x0044) | Out-Null  # SWP_NOZORDER | SWP_SHOWWINDOW
} elseif ($X -ge 0) {
    [PlenioPlace]::SetWindowPos($h, [IntPtr]::Zero, $X, $Y, 0, 0, 0x0045) | Out-Null  # and SWP_NOSIZE
}
if ($Front -or $Keys) { [PlenioPlace]::SetForegroundWindow($h) | Out-Null; Start-Sleep -Milliseconds 250 }
if ($Keys) { [System.Windows.Forms.SendKeys]::SendWait($Keys) }
$r = New-Object PlenioPlace+RECT
[PlenioPlace]::GetWindowRect($h, [ref]$r) | Out-Null
if ($Rect) { '{0} {1} {2} {3}' -f $r.Left, $r.Top, ($r.Right - $r.Left), ($r.Bottom - $r.Top) }
