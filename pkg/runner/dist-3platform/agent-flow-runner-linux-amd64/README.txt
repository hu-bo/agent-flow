agent-flow runner package: agent-flow-runner-linux-amd64

1. Make the runner and start script executable after extracting the zip:
   chmod +x ./agent-flow-runner ./start.sh

2. Start the runner (config.json will be copied to ~/.aflow-runner/config.json):
   ./start.sh

3. For server startup, configure a systemd service that runs:
   /absolute/path/to/agent-flow-runner start

This package already includes a pre-filled config.json.
Linux autostart is managed by systemd; the install-autostart command is only available on Windows and macOS.
