@echo off
setlocal
if not exist "%USERPROFILE%\.aflow-runner" mkdir "%USERPROFILE%\.aflow-runner"
copy /Y "%~dp0config.json" "%USERPROFILE%\.aflow-runner\config.json" >nul
"%~dp0agent-flow-runner.exe" start
