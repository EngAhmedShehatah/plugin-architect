# plugin-architect installer (Windows / PowerShell)
# Installs plugin-architect for all detected AI agents on this machine.
#
# From a local clone:
#   .\install.ps1 [--dry-run] [--only <id,...>] [--force] [--uninstall]
#
# One-liner (no clone needed):
#   irm https://raw.githubusercontent.com/EngAhmedShehatah/plugin-architect/main/install.ps1 | iex

param(
  [switch]$DryRun,
  [switch]$Force,
  [switch]$Uninstall,
  [string]$Only
)

$MIN_NODE_MAJOR = 18

# ── Node check ────────────────────────────────────────────────────────────────
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js not found. Install Node $MIN_NODE_MAJOR+ and retry."
  exit 1
}

$nodeMajor = [int](node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if ($nodeMajor -lt $MIN_NODE_MAJOR) {
  Write-Error "Node $nodeMajor is too old. Need Node $MIN_NODE_MAJOR+."
  exit 1
}

# ── Build args ────────────────────────────────────────────────────────────────
$extraArgs = @()
if ($DryRun)   { $extraArgs += '--dry-run' }
if ($Force)    { $extraArgs += '--force' }
if ($Uninstall){ $extraArgs += '--uninstall' }
if ($Only)     { $extraArgs += '--only'; $extraArgs += $Only }

# ── Local clone fast-path ─────────────────────────────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$localInstaller = Join-Path $scriptDir 'bin\install.js'

if (Test-Path $localInstaller) {
  & node $localInstaller @extraArgs
  exit $LASTEXITCODE
}

# ── Remote (irm | iex) path ───────────────────────────────────────────────────
& npx -y github:EngAhmedShehatah/plugin-architect @extraArgs
exit $LASTEXITCODE
