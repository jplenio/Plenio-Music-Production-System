<#
.SYNOPSIS
    Fetches every third-party dependency of Plenio VST3 at a pinned version into external/.

.DESCRIPTION
    Each dependency is cloned once (shallow) at the tag or commit below; an existing checkout at the right
    revision is left alone, one at another revision is replaced. Afterwards the patches in cmake/patches are
    applied (each once). Run it again after changing a pin. Every licence is permissive: see THIRD_PARTY.md.

.PARAMETER Force
    Delete and fetch every dependency again.
#>
param([switch]$Force)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$external = Join-Path $root 'external'
New-Item -ItemType Directory -Force $external | Out-Null

# name, repository, revision (tag or full commit), recursive
$deps = @(
    @{ Name = 'vst3sdk';      Repo = 'https://github.com/steinbergmedia/vst3sdk.git';   Rev = 'v3.8.1_build_84';                          Recursive = $true  },
    @{ Name = 'ARA_SDK';      Repo = 'https://github.com/Celemony/ARA_SDK.git';         Rev = 'releases/2.3.0';                           Recursive = $true  },
    @{ Name = 'choc';         Repo = 'https://github.com/Tracktion/choc.git';           Rev = '8af031c2ba4f5723f4b0a5ca14e0b4984af15b0e'; Recursive = $false },
    @{ Name = 'reaper-sdk';   Repo = 'https://github.com/justinfrankel/reaper-sdk.git'; Rev = 'b2ca1ec92c9a7864fb72346037986a384971ed03'; Recursive = $false },
    @{ Name = 'json';         Repo = 'https://github.com/nlohmann/json.git';            Rev = 'v3.12.0';                                  Recursive = $false },
    @{ Name = 'cpp-httplib';  Repo = 'https://github.com/yhirose/cpp-httplib.git';      Rev = 'v0.60.0';                                  Recursive = $false },
    @{ Name = 'dr_libs';      Repo = 'https://github.com/mackron/dr_libs.git';          Rev = 'dfe8377631000664666519fdb83da193fd8037f4'; Recursive = $false },
    @{ Name = 'r8brain';      Repo = 'https://github.com/avaneev/r8brain-free-src.git'; Rev = 'version-6.5';                              Recursive = $false },
    @{ Name = 'doctest';      Repo = 'https://github.com/doctest/doctest.git';          Rev = 'v2.5.3';                                   Recursive = $false }
)

function Get-Head([string]$dir) {
    if (-not (Test-Path (Join-Path $dir '.git'))) { return $null }
    $sha = (& git -C $dir rev-parse HEAD 2>$null)
    if ($LASTEXITCODE -ne 0) { return $null }
    return $sha.Trim()
}

function Resolve-Rev([string]$repo, [string]$rev) {
    if ($rev -match '^[0-9a-f]{40}$') { return $rev }
    $lines = & git ls-remote $repo "refs/tags/$rev" "refs/tags/$rev^{}"
    if ($LASTEXITCODE -ne 0 -or -not $lines) { throw "cannot resolve $rev in $repo" }
    # an annotated tag lists the commit under ^{}; a lightweight one only once
    $peeled = $lines | Where-Object { $_ -match '\^\{\}$' } | Select-Object -First 1
    $line = if ($peeled) { $peeled } else { $lines | Select-Object -First 1 }
    return ($line -split '\s+')[0]
}

foreach ($dep in $deps) {
    $dir = Join-Path $external $dep.Name
    $want = Resolve-Rev $dep.Repo $dep.Rev
    $have = Get-Head $dir
    if (-not $Force -and $have -eq $want) {
        Write-Host ("{0,-12} {1} (present)" -f $dep.Name, $dep.Rev)
        continue
    }
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
    Write-Host ("{0,-12} {1} (fetching)" -f $dep.Name, $dep.Rev)
    New-Item -ItemType Directory -Force $dir | Out-Null
    & git -C $dir init -q
    & git -C $dir remote add origin $dep.Repo
    & git -C $dir fetch -q --depth 1 origin $want
    if ($LASTEXITCODE -ne 0) { throw "fetch of $($dep.Name) failed" }
    & git -C $dir checkout -q FETCH_HEAD
    if ($dep.Recursive) {
        & git -C $dir submodule update -q --init --recursive --depth 1
        if ($LASTEXITCODE -ne 0) { throw "submodules of $($dep.Name) failed" }
    }
}

# Patches: cmake/patches/<dependency>-<what>.patch, applied once (git apply --check tells whether it still applies)
$patches = Get-ChildItem (Join-Path $root 'cmake/patches') -Filter '*.patch' -ErrorAction SilentlyContinue
foreach ($patch in $patches) {
    $name = $patch.BaseName.Split('-')[0]
    $dir = Join-Path $external $name
    & git -C $dir apply --reverse --check $patch.FullName 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "patch $($patch.Name): applied already"; continue }
    & git -C $dir apply $patch.FullName
    if ($LASTEXITCODE -ne 0) { throw "patch $($patch.Name) does not apply" }
    Write-Host "patch $($patch.Name): applied"
}
Write-Host 'dependencies ready'
