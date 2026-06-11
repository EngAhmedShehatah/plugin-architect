#!/usr/bin/env node
// Main validator orchestrator.
// Usage: node validate-plugins.mjs <marketplace-path>
//
// Runs in CI and locally via pre-commit hook.
// Auto-detects which platform(s) the marketplace targets and runs the
// appropriate validator(s):
//   - .claude-plugin/plugin.json present         → Claude Code validator
//   - root plugin.json present (standalone)      → Copilot validator
//   - gemini-extension.json present              → Gemini validator
//   - .cursor/rules/ or .cursorrules present     → Cursor validator
//   - src/plugins/opencode/plugin.js present     → opencode validator
//
// Multiple validators run when multiple manifest types are present.

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
const GEMINI_VALIDATOR   = path.join(SCRIPT_DIR, 'validate-gemini.mjs');
const CURSOR_VALIDATOR   = path.join(SCRIPT_DIR, 'validate-cursor.mjs');
const OPENCODE_VALIDATOR = path.join(SCRIPT_DIR, 'validate-opencode.mjs');

const claudeManifest  = path.join(ROOT, '.claude-plugin', 'plugin.json');
const copilotManifest = path.join(ROOT, 'plugin.json');
const geminiManifest  = path.join(ROOT, 'gemini-extension.json');
const cursorRulesDir  = path.join(ROOT, '.cursor', 'rules');
const cursorLegacy    = path.join(ROOT, '.cursorrules');
const opencodePlugin  = path.join(ROOT, 'src', 'plugins', 'opencode', 'plugin.js');

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

const hasClaude   = fs.existsSync(claudeManifest);
const hasCopilot  = fs.existsSync(copilotManifest);
const hasGemini   = fs.existsSync(geminiManifest);
const hasCursor   = fs.existsSync(cursorRulesDir) || fs.existsSync(cursorLegacy);
const hasOpencode = fs.existsSync(opencodePlugin);

if (!hasClaude && !hasCopilot && !hasGemini && !hasCursor && !hasOpencode) {
  console.error(`No plugin manifest found at ${ROOT}`);
  console.error('  Expected one of:');
  console.error(`    .claude-plugin/plugin.json     (Claude Code)`);
  console.error(`    plugin.json                    (GitHub Copilot)`);
  console.error(`    gemini-extension.json          (Gemini CLI)`);
  console.error(`    .cursor/rules/ or .cursorrules (Cursor)`);
  console.error(`    src/plugins/opencode/plugin.js (opencode)`);
  process.exit(1);
}

if (hasClaude)   runValidator('Claude Code',    CLAUDE_VALIDATOR);
if (hasCopilot)  runValidator('GitHub Copilot', COPILOT_VALIDATOR);
if (hasGemini)   runValidator('Gemini',         GEMINI_VALIDATOR);
if (hasCursor)   runValidator('Cursor',         CURSOR_VALIDATOR);
if (hasOpencode) runValidator('opencode',        OPENCODE_VALIDATOR);

process.exit(exitCode);
