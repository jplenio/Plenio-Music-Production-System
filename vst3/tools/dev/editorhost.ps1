<#
.SYNOPSIS
    Development: opens the built plug-in in the VST3 SDK's EditorHost, apart from your own settings and songs.

.DESCRIPTION
    The settings, the cache and the song library live in .dev\vst3-home (PLENIO_VST3_HOME), and the page can be driven
    with tools\dev\cdp.mjs (WebView2 DevTools on port 9333). Prints the EditorHost's process id.

.PARAMETER Port
    The ComfyUI port written to the dev settings when they do not exist yet (8190: tools\dev_comfyui.ps1).

.PARAMETER DevHome
    The home folder (PLENIO_VST3_HOME): settings, cache, songs (default .dev\vst3-home).

.PARAMETER Ui
    Load the web UI from webui\dist on disk (PLENIO_WEBUI_DIR) instead of the copy built into the plug-in.
#>
param([int]$Port = 8190, [switch]$Ui, [int]$DebugPort = 9333, [string]$DevHome = '.dev\vst3-home')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$home_ = if ([System.IO.Path]::IsPathRooted($DevHome)) { $DevHome } else { Join-Path $root $DevHome }
$settings = Join-Path $home_ 'config\settings.json'
if (-not (Test-Path $settings)) {
    New-Item -ItemType Directory -Force (Split-Path $settings) | Out-Null
    @{ schema = 'plenio-vst3.settings/1'; port = $Port; start_comfyui = $false; licence_accepted = $false; takes_per_run = 1; stems = $false } |
        ConvertTo-Json | Set-Content -Encoding utf8 $settings
}
$env:PLENIO_VST3_HOME = $home_
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$DebugPort"
if ($Ui) { $env:PLENIO_WEBUI_DIR = Join-Path $root 'webui\dist' }

$host_ = Join-Path $root 'build\bin\Release\editorhost.exe'
$plugin = Join-Path $root 'build\VST3\Release\Plenio.vst3'
$p = Start-Process -FilePath $host_ -ArgumentList "`"$plugin`"" -PassThru
Write-Host "EditorHost $($p.Id) · dev home $home_ · DevTools port $DebugPort"
$p.Id
