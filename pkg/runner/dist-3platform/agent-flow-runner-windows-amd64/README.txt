agent-flow runner package: agent-flow-runner-windows-amd64

1. Copy config.json to the default path if you want a shared machine-level config:
   Windows: %USERPROFILE%\.aflow-runner\config.json
   macOS:   ~/.aflow-runner/config.json

2. Start the runner:
   .\agent-flow-runner.exe start

3. Optional: install login autostart:
   .\agent-flow-runner.exe install-autostart

This package already includes a pre-filled config.json.
