<#
.SYNOPSIS
    Packs a built Plenio VST3 for Windows into dist\: the installer, a portable zip and their checksums.

.DESCRIPTION
    Takes build\VST3\Release\Plenio.vst3 (tools\build.ps1 makes it) and writes
      dist\Plenio-VST3-<version>-windows-x64-setup.exe   the installer (Inno Setup 6: iscc on the PATH or installed)
      dist\Plenio-VST3-<version>-windows-x64.zip         Plenio.vst3, install.ps1 and the notes, to install by hand
      dist\SHA256SUMS-windows.txt
    The version comes from the build (build\generated\plenio_version.h). The release workflow runs this script too.

.PARAMETER Build
    The build folder (default build).

.PARAMETER NoInstaller
    Only the zip (no Inno Setup needed).

.EXAMPLE
    pwsh tools/package.ps1
#>
param([string]$Build = '', [switch]$NoInstaller)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $Build) { $Build = Join-Path $root 'build' }
$bundle = Join-Path $Build 'VST3\Release\Plenio.vst3'
$header = Join-Path $Build 'generated\plenio_version.h'
if (-not (Test-Path (Join-Path $bundle 'Contents\x86_64-win\Plenio.vst3'))) { throw "No built bundle in ${bundle}: run tools\build.ps1 first." }
$version = (Select-String -Path $header -Pattern '#define PLENIO_VERSION_STRING "([^"]+)"').Matches[0].Groups[1].Value
$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$name = "Plenio-VST3-$version-windows-x64"

# the portable zip: the bundle and what installs it
$stage = Join-Path ([System.IO.Path]::GetTempPath()) "plenio-package-$PID"
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
$folder = Join-Path $stage $name
New-Item -ItemType Directory -Force $folder | Out-Null
Copy-Item -Recurse $bundle (Join-Path $folder 'Plenio.vst3')
Copy-Item (Join-Path $root 'tools\install.ps1') $folder
Copy-Item (Join-Path (Split-Path -Parent $root) 'LICENSE') $folder   # the repository's licence (Apache-2.0)
foreach ($f in 'NOTICE.md', 'THIRD_PARTY.md') { Copy-Item (Join-Path $root $f) $folder }
@"
Plenio VST3 $version for Windows (64-bit)

Install
  Right-click install.ps1 > Run with PowerShell (it asks for administrator rights), or copy the folder
  Plenio.vst3 into C:\Program Files\Common Files\VST3 yourself. Then let your DAW look for new plug-ins.
  The installer (Plenio-VST3-$version-windows-x64-setup.exe) does the same with a click.

Remove
  install.ps1 -Uninstall, or delete C:\Program Files\Common Files\VST3\Plenio.vst3.

The tutorial: https://github.com/jplenio/Plenio-Music-Production-System/blob/main/vst3/docs/TUTORIAL.md
"@ | Set-Content -Encoding utf8 (Join-Path $folder 'INSTALL.txt')
$zip = Join-Path $dist "$name.zip"
Remove-Item -Force $zip -ErrorAction SilentlyContinue
Compress-Archive -Path $folder -DestinationPath $zip -CompressionLevel Optimal
Remove-Item -Recurse -Force $stage
Write-Host "zip:       $zip"

# the installer
$outputs = @($zip)
if (-not $NoInstaller) {
    $iscc = (Get-Command iscc -ErrorAction SilentlyContinue).Source
    foreach ($p in @("${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe", "$env:ProgramFiles\Inno Setup 6\ISCC.exe", "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe")) {
        if (-not $iscc -and (Test-Path $p)) { $iscc = $p }
    }
    if (-not $iscc) { throw 'Inno Setup 6 not found (https://jrsoftware.org/isinfo.php); or package with -NoInstaller.' }
    & $iscc /Q "/DAppVersion=$version" "/DBundleDir=$bundle" "/DOutputDir=$dist" (Join-Path $root 'installer\windows\PlenioVST3.iss')
    if ($LASTEXITCODE -ne 0) { throw "Inno Setup failed ($LASTEXITCODE)" }
    $setup = Join-Path $dist "$name-setup.exe"
    Write-Host "installer: $setup"
    $outputs = @($setup) + $outputs
}

# the checksums
$sums = Join-Path $dist 'SHA256SUMS-windows.txt'
$outputs | ForEach-Object { '{0}  {1}' -f (Get-FileHash -Algorithm SHA256 $_).Hash.ToLower(), (Split-Path -Leaf $_) } | Set-Content -Encoding ascii $sums
Write-Host "checksums: $sums"
