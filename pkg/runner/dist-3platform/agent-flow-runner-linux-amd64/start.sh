#!/bin/bash
set -euo pipefail
package_dir="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.aflow-runner"
cp "$package_dir/config.json" "$HOME/.aflow-runner/config.json"
chmod 600 "$HOME/.aflow-runner/config.json"
exec "$package_dir/agent-flow-runner" start
