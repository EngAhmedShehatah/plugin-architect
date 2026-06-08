#!/usr/bin/env node
// Main validator orchestrator.
// Usage: node validate-plugins.mjs <marketplace-path>
//
// Runs in CI and locally via pre-commit hook.
// Auto-detects which platform(s) the marketplace targets and runs the
// appropriate validator(s):
//   - .claude-plugin/plugin.json exists  → Claude Code validator
//   - root plugin.json exists (standalone) → Copilot validator
//
// Both validators run when both manifest types are present.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (!ROOT) {
  console.error('Usage: node validate-plugins.mjs <marketplace-path>');
  process.exit(1);
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLAUDE_VALIDATOR   = path.join(SCRIPT_DIR, 'validate-claude-code.mjs');
const COPILOT_VALIDATOR  = path.join(SCRIPT_DIR, 'validate-github-copilot.mjs');

const claudeManifest = path.join(ROOT, '.claude-plugin', 'plugin.json');
const copilotManifest = path.join(ROOT, 'plugin.json');

let exitCode = 0;

function runValidator(label, validatorPath) {
  console.log(`\n🔍 Running ${label} validator...`);
  const result = spawnSync(process.execPath, [validatorPath, ROOT], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to run ${label} validator: ${result.error.message}`);
    exitCode = 1;
  } else if (result.status !== 0) {
    exitCode = 1;
  }
}

const hasClaude  = fs.existsSync(claudeManifest);
const hasCopilot = fs.existsSync(copilotManifest);

if (!hasClaude && !hasCopilot) {
  console.error(`No plugin manifest found at ${ROOT}`);
  console.error(`  Expected: ${path.join('.claude-plugin', 'plugin.json')} or plugin.json`);
  process.exit(1);
}

if (hasClaude) {
  runValidator('Claude Code', CLAUDE_VALIDATOR);
}

if (hasCopilot) {
  runValidator('GitHub Copilot', COPILOT_VALIDATOR);
}

process.exit(exitCode);
