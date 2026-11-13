<#
.SYNOPSIS
    Installs Plenio VST3 for every VST3 host: Plenio.vst3 into C:\Program Files\Common Files\VST3.

.DESCRIPTION
    Takes the bundle next to this script (a release zip) or the build (build\VST3\Release\Plenio.vst3). The system's
    VST3 folder needs administrator rights: the script asks for them (UAC) when started without. Your songs, settings
    and Plenio itself are not touched.

.PARAMETER Bundle
    Another Plenio.vst3 to install.

.PARAMETER Uninstall
    Removes Plenio.vst3 from the system's VST3 folder.

.EXAMPLE
    tools\install.ps1
    tools\install.ps1 -Uninstall
#>
param([string]$Bundle = '', [switch]$Uninstall, [switch]$Elevated)

$ErrorActionPreference = 'Stop'
$target = Join-Path ${env:CommonProgramFiles} 'VST3\Plenio.vst3'

function Test-Admin {
    $me = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    return $me.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Finish([int]$code) {
    if ($Elevated) { Read-Host 'Press Enter to close this window' | Out-Null }
    exit $code
}

if (-not (Test-Admin)) {
    # again, as administrator (a window of its own: it says what it did and waits)
    $arguments = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$PSCommandPath`"", '-Elevated')
    if ($Bundle) { $arguments += @('-Bundle', "`"$((Resolve-Path $Bundle).Path)`"") }
    if ($Uninstall) { $arguments += '-Uninstall' }
    $shell = (Get-Process -Id $PID).Path
    try {
        $p = Start-Process -FilePath $shell -ArgumentList $arguments -Verb RunAs -Wait -PassThru
        exit $p.ExitCode
    } catch {
        Write-Host 'Plenio needs administrator rights to go into the system''s VST3 folder.'
        exit 1
    }
}

try {
    if ($Uninstall) {
        if (Test-Path $target) {
            Remove-Item -Recurse -Force $target
            Write-Host "Removed $target"
        } else {
            Write-Host 'Plenio VST3 is not installed.'
        }
        Finish 0
    }

    if (-not $Bundle) {
        $here = Join-Path $PSScriptRoot 'Plenio.vst3'
        $built = Join-Path (Split-Path -Parent $PSScriptRoot) 'build\VST3\Release\Plenio.vst3'
        if (Test-Path $here) { $Bundle = $here }
        elseif (Test-Path $built) { $Bundle = $built }
        else { throw 'No Plenio.vst3 found: build it first (tools\build.ps1).' }
    }
    $dll = Join-Path $Bundle 'Contents\x86_64-win\Plenio.vst3'
    if (-not (Test-Path $dll)) { throw "$Bundle is not a Plenio bundle." }

    if (Test-Path $target) {
        try {
            Remove-Item -Recurse -Force $target
        } catch {
            throw 'The installed Plenio is in use: close your DAW (and EditorHost), then install again.'
        }
    }
    Copy-Item -Recurse $Bundle $target
    $version = (Get-Item (Join-Path $target 'Contents\x86_64-win\Plenio.vst3')).VersionInfo.ProductVersion
    Write-Host "Installed Plenio VST3 $version into $target"

    # the plug-in's window is a WebView2: the runtime comes with Windows 11 and current Edge
    $key = '{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
    $runtime = $null
    foreach ($root in @("HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\$key", "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\$key", "HKCU:\Software\Microsoft\EdgeUpdate\Clients\$key")) {
        $found = Get-ItemProperty $root -ErrorAction SilentlyContinue
        if ($found -and $found.pv -and $found.pv -ne '0.0.0.0') { $runtime = $found.pv; break }
    }
    if ($runtime) { Write-Host "WebView2 Runtime ${runtime}: fine." }
    else { Write-Warning 'The Microsoft Edge WebView2 Runtime was not found; Plenio''s window needs it: https://developer.microsoft.com/microsoft-edge/webview2/' }
    Write-Host 'Let your DAW scan for new plug-ins (REAPER: Options > Preferences > Plug-ins > VST > Re-scan).'
    Finish 0
} catch {
    Write-Host "Not installed: $($_.Exception.Message)" -ForegroundColor Red
    Finish 1
}
