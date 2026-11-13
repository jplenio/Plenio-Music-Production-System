<#
.SYNOPSIS
    Development: builds one target of the configured build folder and prints only errors, warnings and results.

.PARAMETER Target
    Plenio (default), plenio_tests, ALL_BUILD …
#>
param([string]$Target = 'Plenio', [string]$Config = 'Release')

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmake = (Get-Command cmake -ErrorAction SilentlyContinue).Source
if (-not $cmake) {
    $vs = & "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -property installationPath
    $cmake = Join-Path $vs 'Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe'
}
$output = & $cmake --build (Join-Path $root 'build') --config $Config --target $Target --parallel -- /nologo /verbosity:minimal 2>&1
$code = $LASTEXITCODE
$output | Select-String -Pattern 'error|warning C|warning LNK|tests passed|tests failed|Result:|-> .*\.(vst3|exe)$' |
    ForEach-Object { $_.Line.Replace($root + '\', '') } | Select-Object -First 60
if ($code -ne 0) { Write-Host "BUILD FAILED ($code)"; exit $code }
Write-Host 'BUILD OK'
