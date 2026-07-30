#!/bin/bash
set -euo pipefail
mkdir -p "$HOME/.aflow-runner"
cp "$(dirname "$0")/config.json" "$HOME/.aflow-runner/config.json"
"$(dirname "$0")/agent-flow-runner" start
