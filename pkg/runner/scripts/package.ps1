param(
  [string]$Version = "0.1.0",
  [string]$ServerAddr = "127.0.0.1:9201",
  [string]$RunnerToken = "",
  [string]$RunnerId = "",
  [uint32]$MaxConcurrentTasks = 1,
  [string]$OutputDir = "dist",
  [switch]$SkipZip
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$distRoot = Join-Path $projectRoot $OutputDir

$targets = @(
  @{ GOOS = "windows"; GOARCH = "amd64"; BinaryName = "agent-flow-runner.exe"; PackageName = "agent-flow-runner-windows-amd64"; DefaultShell = "powershell.exe"; PathSeparator = "\"; LineEnding = "CRLF"; AvailableCommands = "cmd.exe,powershell.exe,pwsh.exe,where.exe,git,pnpm,npm,node" },
  @{ GOOS = "windows"; GOARCH = "arm64"; BinaryName = "agent-flow-runner.exe"; PackageName = "agent-flow-runner-windows-arm64"; DefaultShell = "powershell.exe"; PathSeparator = "\"; LineEnding = "CRLF"; AvailableCommands = "cmd.exe,powershell.exe,pwsh.exe,where.exe,git,pnpm,npm,node" },
  @{ GOOS = "darwin"; GOARCH = "arm64"; BinaryName = "agent-flow-runner"; PackageName = "agent-flow-runner-darwin-arm64"; DefaultShell = "zsh"; PathSeparator = "/"; LineEnding = "LF"; AvailableCommands = "sh,bash,zsh,git,pnpm,npm,node,grep,find,rg,which" },
  @{ GOOS = "darwin"; GOARCH = "amd64"; BinaryName = "agent-flow-runner"; PackageName = "agent-flow-runner-darwin-amd64"; DefaultShell = "zsh"; PathSeparator = "/"; LineEnding = "LF"; AvailableCommands = "sh,bash,zsh,git,pnpm,npm,node,grep,find,rg,which" },
  @{ GOOS = "linux"; GOARCH = "amd64"; BinaryName = "agent-flow-runner"; PackageName = "agent-flow-runner-linux-amd64"; DefaultShell = "bash"; PathSeparator = "/"; LineEnding = "LF"; AvailableCommands = "sh,bash,git,pnpm,npm,node,grep,find,rg,which,sed,awk" }
)

function New-RunnerConfigJson {
  param(
    [string]$ConfigRunnerId,
    [string]$ConfigRunnerToken,
    [string]$ConfigServerAddr,
    [uint32]$ConfigMaxConcurrentTasks
  )

  return [ordered]@{
    runnerId = $ConfigRunnerId
    runnerToken = $ConfigRunnerToken
    serverAddr = $ConfigServerAddr
    maxConcurrentTasks = $ConfigMaxConcurrentTasks
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

function New-LinuxStartScript {
  return @'
#!/bin/bash
set -euo pipefail
package_dir="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.aflow-runner"
cp "$package_dir/config.json" "$HOME/.aflow-runner/config.json"
chmod 600 "$HOME/.aflow-runner/config.json"
exec "$package_dir/agent-flow-runner" start
'@
}

function New-ReadmeText {
  param(
    [string]$PackageName,
    [string]$BinaryName,
    [string]$TargetOS
  )

  if ($TargetOS -eq "linux") {
    return @"
agent-flow runner package: $PackageName

1. Make the runner and start script executable after extracting the zip:
   chmod +x ./agent-flow-runner ./start.sh

2. Start the runner (config.json will be copied to ~/.aflow-runner/config.json):
   ./start.sh

3. For server startup, configure a systemd service that runs:
   /absolute/path/to/agent-flow-runner start

This package already includes a pre-filled config.json.
Linux autostart is managed by systemd; the install-autostart command is only available on Windows and macOS.
"@
  }

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

Push-Location $projectRoot
try {
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

    $ldflags = @(
      "-X main.defaultVersion=$Version",
      "-X main.buildTargetOS=$($target.GOOS)",
      "-X main.buildTargetArch=$($target.GOARCH)",
      "-X main.buildDefaultShell=$($target.DefaultShell)",
      "-X main.buildPathSeparator=$($target.PathSeparator)",
      "-X main.buildLineEnding=$($target.LineEnding)",
      "-X main.buildAvailableCommands=$($target.AvailableCommands)"
    ) -join " "

    go build -ldflags $ldflags -o $binaryPath .\cmd
    if ($LASTEXITCODE -ne 0) {
      throw "go build failed for $($target.PackageName)"
    }

    $configJson = New-RunnerConfigJson -ConfigRunnerId $RunnerId -ConfigRunnerToken $RunnerToken -ConfigServerAddr $ServerAddr -ConfigMaxConcurrentTasks $MaxConcurrentTasks
    Set-Content -Path (Join-Path $packageDir "config.json") -Value $configJson -Encoding utf8
    Set-Content -Path (Join-Path $packageDir "README.txt") -Value (New-ReadmeText -PackageName $target.PackageName -BinaryName $target.BinaryName -TargetOS $target.GOOS) -Encoding utf8

    if ($target.GOOS -eq "windows") {
      Set-Content -Path (Join-Path $packageDir "start.cmd") -Value (New-WindowsStartScript) -Encoding ascii
      Set-Content -Path (Join-Path $packageDir "install-autostart.cmd") -Value (New-WindowsAutostartScript) -Encoding ascii
    } elseif ($target.GOOS -eq "linux") {
      Set-Content -Path (Join-Path $packageDir "start.sh") -Value (New-LinuxStartScript) -Encoding ascii
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
}
finally {
  Remove-Item Env:GOOS -ErrorAction SilentlyContinue
  Remove-Item Env:GOARCH -ErrorAction SilentlyContinue
  Remove-Item Env:CGO_ENABLED -ErrorAction SilentlyContinue
  Pop-Location
}

Write-Host "Packages created in $distRoot"
