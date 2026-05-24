param(
  [string]$Version = "0.1.0",
  [string]$ServerAddr = "127.0.0.1:9201",
  [string]$RunnerToken = "",
  [string]$RunnerId = "",
  [string]$OutputDir = "dist",
  [switch]$SkipZip
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$cmdPath = Join-Path $projectRoot "cmd"
$distRoot = Join-Path $projectRoot $OutputDir

$targets = @(
  @{ GOOS = "windows"; GOARCH = "amd64"; BinaryName = "agent-flow-runner.exe"; PackageName = "agent-flow-runner-windows-amd64" },
  @{ GOOS = "windows"; GOARCH = "arm64"; BinaryName = "agent-flow-runner.exe"; PackageName = "agent-flow-runner-windows-arm64" },
  @{ GOOS = "darwin"; GOARCH = "arm64"; BinaryName = "agent-flow-runner"; PackageName = "agent-flow-runner-darwin-arm64" },
  @{ GOOS = "darwin"; GOARCH = "amd64"; BinaryName = "agent-flow-runner"; PackageName = "agent-flow-runner-darwin-amd64" }
)

function New-RunnerConfigJson {
  param(
    [string]$ConfigRunnerId,
    [string]$ConfigRunnerToken,
    [string]$ConfigServerAddr
  )

  return [ordered]@{
    runnerId = $ConfigRunnerId
    runnerToken = $ConfigRunnerToken
    serverAddr = $ConfigServerAddr
  } | ConvertTo-Json -Depth 3
}

function New-WindowsStartScript {
  return @'
@echo off
setlocal
if not exist "%USERPROFILE%\.aflow-runner" mkdir "%USERPROFILE%\.aflow-runner"
copy /Y "%~dp0config.json" "%USERPROFILE%\.aflow-runner\config.json" >nul
"%~dp0agent-flow-runner.exe" start
'@
}

function New-WindowsAutostartScript {
  return @'
@echo off
setlocal
if not exist "%USERPROFILE%\.aflow-runner" mkdir "%USERPROFILE%\.aflow-runner"
copy /Y "%~dp0config.json" "%USERPROFILE%\.aflow-runner\config.json" >nul
"%~dp0agent-flow-runner.exe" install-autostart
'@
}

function New-MacStartScript {
  return @'
#!/bin/bash
set -euo pipefail
mkdir -p "$HOME/.aflow-runner"
cp "$(dirname "$0")/config.json" "$HOME/.aflow-runner/config.json"
"$(dirname "$0")/agent-flow-runner" start
'@
}

function New-MacAutostartScript {
  return @'
#!/bin/bash
set -euo pipefail
mkdir -p "$HOME/.aflow-runner"
cp "$(dirname "$0")/config.json" "$HOME/.aflow-runner/config.json"
"$(dirname "$0")/agent-flow-runner" install-autostart
'@
}

function New-ReadmeText {
  param(
    [string]$PackageName,
    [string]$BinaryName
  )

  $startCommand = if ($BinaryName -like "*.exe") { ".\$BinaryName start" } else { "./$BinaryName start" }
  $autostartCommand = if ($BinaryName -like "*.exe") { ".\$BinaryName install-autostart" } else { "./$BinaryName install-autostart" }

  return @"
agent-flow runner package: $PackageName

1. Copy config.json to the default path if you want a shared machine-level config:
   Windows: %USERPROFILE%\.aflow-runner\config.json
   macOS:   ~/.aflow-runner/config.json

2. Start the runner:
   $startCommand

3. Optional: install login autostart:
   $autostartCommand

This package already includes a pre-filled config.json.
"@
}

if (Test-Path $distRoot) {
  Remove-Item -Recurse -Force $distRoot
}
New-Item -ItemType Directory -Path $distRoot | Out-Null

foreach ($target in $targets) {
  $packageDir = Join-Path $distRoot $target.PackageName
  New-Item -ItemType Directory -Path $packageDir | Out-Null

  $binaryPath = Join-Path $packageDir $target.BinaryName
  Write-Host "Building $($target.PackageName)..."

  $env:GOOS = $target.GOOS
  $env:GOARCH = $target.GOARCH
  $env:CGO_ENABLED = "0"

  go build -ldflags "-X main.defaultVersion=$Version" -o $binaryPath $cmdPath
  if ($LASTEXITCODE -ne 0) {
    throw "go build failed for $($target.PackageName)"
  }

  $configJson = New-RunnerConfigJson -ConfigRunnerId $RunnerId -ConfigRunnerToken $RunnerToken -ConfigServerAddr $ServerAddr
  Set-Content -Path (Join-Path $packageDir "config.json") -Value $configJson -Encoding utf8
  Set-Content -Path (Join-Path $packageDir "README.txt") -Value (New-ReadmeText -PackageName $target.PackageName -BinaryName $target.BinaryName) -Encoding utf8

  if ($target.GOOS -eq "windows") {
    Set-Content -Path (Join-Path $packageDir "start.cmd") -Value (New-WindowsStartScript) -Encoding ascii
    Set-Content -Path (Join-Path $packageDir "install-autostart.cmd") -Value (New-WindowsAutostartScript) -Encoding ascii
  } else {
    $startScript = Join-Path $packageDir "start.command"
    $autostartScript = Join-Path $packageDir "install-autostart.command"
    Set-Content -Path $startScript -Value (New-MacStartScript) -Encoding ascii
    Set-Content -Path $autostartScript -Value (New-MacAutostartScript) -Encoding ascii
  }

  if (-not $SkipZip) {
    $zipPath = Join-Path $distRoot ($target.PackageName + ".zip")
    if (Test-Path $zipPath) {
      Remove-Item -Force $zipPath
    }
    Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zipPath
  }
}

Remove-Item Env:GOOS -ErrorAction SilentlyContinue
Remove-Item Env:GOARCH -ErrorAction SilentlyContinue
Remove-Item Env:CGO_ENABLED -ErrorAction SilentlyContinue

Write-Host "Packages created in $distRoot"
