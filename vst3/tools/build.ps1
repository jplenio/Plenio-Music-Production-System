<#
.SYNOPSIS
    Builds Plenio VST3 (the web UI, the bundle Plenio.vst3, the tests) with CMake and Visual Studio 2022.

.PARAMETER Config
    Release (default) or Debug.

.PARAMETER Clean
    Configure the build folder anew.

.PARAMETER NoWebUI
    Use the existing webui/dist instead of running npm.

.EXAMPLE
    pwsh tools/build.ps1
    pwsh tools/build.ps1 -Config Debug
#>
param(
    [ValidateSet('Release', 'Debug', 'RelWithDebInfo')] [string]$Config = 'Release',
    [switch]$Clean,
    [switch]$NoWebUI
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root 'build'

function Find-CMake {
    $onPath = Get-Command cmake -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }
    $vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vswhere) {
        $vs = & $vswhere -latest -products * -property installationPath
        $candidate = Join-Path $vs 'Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe'
        if (Test-Path $candidate) { return $candidate }
    }
    throw 'CMake not found: install it or Visual Studio 2022 with "C++ CMake tools for Windows"'
}

if (-not (Test-Path (Join-Path $root 'external/vst3sdk/CMakeLists.txt'))) {
    & (Join-Path $PSScriptRoot 'fetch_deps.ps1')
}

$cmake = Find-CMake
if ($Clean -and (Test-Path $build)) { Remove-Item -Recurse -Force $build }

$webui = if ($NoWebUI) { 'OFF' } else { 'ON' }
& $cmake -S $root -B $build -G 'Visual Studio 17 2022' -A x64 "-DPLENIO_BUILD_WEBUI=$webui"
if ($LASTEXITCODE -ne 0) { throw 'CMake configure failed' }

& $cmake --build $build --config $Config --parallel -- /nologo /verbosity:minimal
if ($LASTEXITCODE -ne 0) { throw 'build failed' }

$bundle = Join-Path $build "VST3/$Config/Plenio.vst3"
Write-Host ''
Write-Host "Built: $bundle"
