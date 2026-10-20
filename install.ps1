#Requires -Version 5.1
<#
    Installs the Things for Typora themes into the current user's Typora
    theme folder. Existing files with the same names are backed up as .bak.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$source = Join-Path $PSScriptRoot "themes"
$target = Join-Path $env:APPDATA "Typora\themes"

if (-not (Test-Path -LiteralPath $source)) {
    throw "Theme source folder not found: $source"
}

if (-not (Test-Path -LiteralPath $target)) {
    New-Item -ItemType Directory -Path $target -Force | Out-Null
}

foreach ($file in @("things-light.css", "things-dark.css")) {
    $from = Join-Path $source $file
    $to = Join-Path $target $file
    if (Test-Path -LiteralPath $to) {
        Copy-Item -LiteralPath $to -Destination "$to.bak" -Force
    }
    Copy-Item -LiteralPath $from -Destination $to -Force
    Write-Host "installed $file"
}

$fontSource = Join-Path $source "things"
if (Test-Path -LiteralPath $fontSource) {
    $fontTarget = Join-Path $target "things"
    if (-not (Test-Path -LiteralPath $fontTarget)) {
        New-Item -ItemType Directory -Path $fontTarget -Force | Out-Null
    }
    Get-ChildItem -LiteralPath $fontSource -File | Copy-Item -Destination $fontTarget -Force
    Write-Host "installed things/ (JetBrains Mono)"
}

Write-Host ""
Write-Host "Theme folder: $target"
Write-Host "Restart Typora, then choose 'things-light' or 'things-dark' from the Themes menu."
