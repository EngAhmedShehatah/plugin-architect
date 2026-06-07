#!/usr/bin/env node
// Main validator orchestrator.
// Usage: node validate-plugins.mjs <marketplace-path>
//
// Runs in CI and locally via pre-commit hook.
// Dispatches to the platform-specific validator(s).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (!ROOT) {
  console.error('Usage: node validate-plugins.mjs <marketplace-path>');
  process.exit(1);
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLAUDE_VALIDATOR = path.join(SCRIPT_DIR, 'validate-claude-code.mjs');

const result = spawnSync(process.execPath, [CLAUDE_VALIDATOR, ROOT], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Failed to run validate-claude-code.mjs: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
