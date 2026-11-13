<#
.SYNOPSIS
    Development: starts a ComfyUI of its own with Plenio from a Git checkout, to test the plug-in against a Plenio
    that is not released yet. The owner's ComfyUI installation stays as it is.

.DESCRIPTION
    Finds ComfyUI the way the Plenio Player does (~/.plenio/player/comfyui-start.json: main.py, its Python and the
    owner's options), makes a base folder in .dev/comfy-base whose custom_nodes holds only a link to the Plenio
    checkout, and starts ComfyUI there on 127.0.0.1 with the owner's models folder and GPU options. Its output (the
    songs of tests) stays in .dev/comfy-base/output. The log: .dev/comfyui.log.

.PARAMETER Plenio
    The Plenio checkout (default: the one this folder is part of).

.PARAMETER Port
    The port (default 8190, so that it never meets the owner's ComfyUI on 8188).

.PARAMETER Stop
    Ends a running dev instance (the one this script started).
#>
param(
    [string]$Plenio = '',
    [int]$Port = 8190,
    [switch]$Stop
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dev = Join-Path $root '.dev'
$base = Join-Path $dev 'comfy-base'
$pidFile = Join-Path $dev 'comfyui.pid'
New-Item -ItemType Directory -Force $dev | Out-Null

if ($Stop) {
    if (Test-Path $pidFile) {
        $id = [int](Get-Content $pidFile)
        Get-Process -Id $id -ErrorAction SilentlyContinue | Stop-Process -Force
        Remove-Item $pidFile
        Write-Host "stopped the dev ComfyUI ($id)"
    } else {
        Write-Host 'no dev ComfyUI known'
    }
    return
}

if (-not $Plenio) { $Plenio = Split-Path -Parent $root }
$Plenio = (Resolve-Path $Plenio).Path

# how ComfyUI was last started (written by Plenio when ComfyUI loads it)
$startFile = Join-Path $HOME '.plenio/player/comfyui-start.json'
if (-not (Test-Path $startFile)) { throw "no ${startFile}: start your ComfyUI with Plenio once" }
$known = Get-Content $startFile -Raw | ConvertFrom-Json
$entry = $known.PSObject.Properties | Where-Object { Test-Path $_.Name } | Sort-Object { $_.Value.at } -Descending | Select-Object -First 1
if (-not $entry) { throw "no ComfyUI of ${startFile} still exists" }
$main = $entry.Name
$python = $entry.Value.python

# the owner's options, without those that would open the instance, load other nodes or clash with ours
$skipWithValue = @('--listen', '--port', '--base-directory', '--output-directory', '--input-directory', '--temp-directory',
                   '--user-directory', '--front-end-version', '--enable-cors-header', '--whitelist-custom-nodes', '--extra-model-paths-config')
$skip = @('--enable-manager', '--auto-launch', '--disable-auto-launch', '--disable-all-custom-nodes')
$extra = @()
$owner = @($entry.Value.args)
for ($i = 0; $i -lt $owner.Count; $i++) {
    $a = [string]$owner[$i]
    if ($skipWithValue -contains $a) { $i++; continue }
    if ($skip -contains $a) { continue }
    $extra += $a
}

# base folder: custom_nodes holds only the link to the checkout
$nodes = Join-Path $base 'custom_nodes'
New-Item -ItemType Directory -Force $nodes | Out-Null
$link = Join-Path $nodes 'Plenio-Music-Production-System'
if (-not (Test-Path $link)) {
    New-Item -ItemType Junction -Path $link -Target $Plenio | Out-Null
}

$all = @($main) + $extra + @('--base-directory', $base, '--listen', '127.0.0.1', '--port', "$Port", '--disable-auto-launch')
$log = Join-Path $dev 'comfyui.log'
Write-Host "ComfyUI: $main"
Write-Host "Python:  $python"
Write-Host "Plenio:  $Plenio"
Write-Host "Options: $($all[1..($all.Count-1)] -join ' ')"
$p = Start-Process -FilePath $python -ArgumentList ($all | ForEach-Object { if ($_ -match '\s') { "`"$_`"" } else { $_ } }) `
    -WorkingDirectory (Split-Path -Parent $main) -RedirectStandardOutput $log -RedirectStandardError "$log.err" -PassThru -WindowStyle Hidden
Set-Content $pidFile $p.Id
Write-Host "started (pid $($p.Id)); waiting for http://127.0.0.1:$Port/plenio/api/v2 ..."

$deadline = (Get-Date).AddMinutes(5)
while ((Get-Date) -lt $deadline) {
    if ($p.HasExited) { throw "ComfyUI ended (exit $($p.ExitCode)); see $log and $log.err" }
    try {
        $info = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/plenio/api/v2" -TimeoutSec 3
        Write-Host "ready: Plenio $($info.plenio), Song API $($info.version), ComfyUI $($info.comfyui)"
        return
    } catch {
        Start-Sleep -Seconds 2
    }
}
throw "ComfyUI did not answer within 5 minutes; see $log"
