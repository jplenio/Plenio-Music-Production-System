<#
.SYNOPSIS
    Development: runs the ARA SDK's ARATestHost on Plenio ARA, test by test, and reports what the host saw.

.DESCRIPTION
    Builds the test host once into build-ara-tests (the SDK's examples, nothing installed into the system). The test
    host itself hangs now and then right after it loaded a plug-in (the SDK's own test plug-in as well): a hung run is
    stopped and started again. The settings and songs are those of .dev\vst3-home (PLENIO_VST3_HOME).

.PARAMETER File
    The audio file for the tests (a WAV the plug-in made for the DAW, so Plenio ARA knows it).

.PARAMETER Tests
    Which tests (the test host's names); all of them when not given.
#>
param(
    [Parameter(Mandatory)] [string]$File,
    [string[]]$Tests = @('PropertyUpdates', 'ContentUpdates', 'ContentReading', 'ModificationCloning', 'Archiving', 'SplitArchives',
                         'DragAndDrop', 'PlaybackRendering', 'EditorView', 'Algorithms'),
    [int]$Tries = 6
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$hostExe = Join-Path $root 'build-ara-tests\bin\Release\ARATestHost.exe'
$plugin = Join-Path $root 'build\VST3\Release\Plenio.vst3\Contents\x86_64-win\Plenio.vst3'
$cmake = Join-Path (& "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -property installationPath) 'Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe'

if (-not (Test-Path $hostExe)) {
    & $cmake -S (Join-Path $root 'external\ARA_SDK\ARA_Examples') -B (Join-Path $root 'build-ara-tests') -G 'Visual Studio 17 2022' -A x64 `
        -D "ARA_VST3_SDK_DIR=$root\external\vst3sdk" -D ARA_SETUP_DEBUGGING=OFF -Wno-dev | Out-Null
    & $cmake --build (Join-Path $root 'build-ara-tests') --config Release --target ARATestHost --parallel -- /nologo /verbosity:minimal | Out-Null
}
if (-not (Test-Path -LiteralPath $File)) { throw "No such file: $File" }

$env:PLENIO_VST3_HOME = Join-Path $root '.dev\vst3-home'
$logs = Join-Path $root 'build-ara-tests\logs'
New-Item -ItemType Directory -Force $logs | Out-Null
$failed = 0
foreach ($test in $Tests) {
    $log = Join-Path $logs "$test.txt"
    $state = 'hung'
    for ($try = 1; $try -le $Tries -and $state -eq 'hung'; $try++) {
        $p = Start-Process -FilePath $hostExe -ArgumentList '-vst3', "`"$plugin`"", '"Plenio ARA"', '-test', $test, '-file', "`"$File`"" `
            -RedirectStandardError $log -RedirectStandardOutput "$log.out" -NoNewWindow -PassThru
        if ($p.WaitForExit(20000)) { $state = "exit $($p.ExitCode)" } else { Stop-Process -Id $p.Id -Force; Start-Sleep -Milliseconds 300 }
    }
    $text = Get-Content -LiteralPath $log -Raw
    $asserts = ([regex]::Matches($text, 'ARA_ASSERT')).Count
    $warnings = ([regex]::Matches($text, 'ARA_WARN')).Count
    $ok = $state -eq 'exit 0' -and $asserts -eq 0
    if (-not $ok) { $failed++ }
    '{0,-20} {1,-8} asserts {2}  warnings {3}  {4}' -f $test, $state, $asserts, $warnings, ($(if ($ok) { 'ok' } else { "FAILED: see $log" }))
}
if ($failed) { exit 1 }
