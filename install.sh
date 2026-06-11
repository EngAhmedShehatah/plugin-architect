#!/usr/bin/env sh
# plugin-architect installer
# Installs plugin-architect for all detected AI agents on this machine.
#
# From a local clone:
#   sh install.sh [--dry-run] [--only <id,...>] [--force] [--uninstall]
#
# One-liner (no clone needed):
#   curl -fsSL https://raw.githubusercontent.com/EngAhmedShehatah/plugin-architect/main/install.sh | sh

set -e

MIN_NODE_MAJOR=18

# ── Node check ────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found. Install Node ${MIN_NODE_MAJOR}+ and retry." >&2
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt "$MIN_NODE_MAJOR" ]; then
  echo "❌ Node ${NODE_MAJOR} is too old. Need Node ${MIN_NODE_MAJOR}+." >&2
  exit 1
fi

# ── Local clone fast-path ─────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/bin/install.js" ]; then
  exec node "$SCRIPT_DIR/bin/install.js" "$@"
fi

# ── Remote (curl | sh) path ───────────────────────────────────────────────────
exec npx -y github:EngAhmedShehatah/plugin-architect "$@"
