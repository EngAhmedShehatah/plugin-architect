#!/usr/bin/env node
// Validates a generated Codex plugin skeleton.
// Usage: node validate-codex.mjs <plugin-path>

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!ROOT) { console.error('Usage: node validate-codex.mjs <plugin-path>'); process.exit(1); }

let errors = 0;
let warnings = 0;

function ok(msg)   { console.log(`  ✅ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); warnings++; }
function fail(msg) { console.log(`  ❌ ${msg}`); errors++; }

console.log('\n━━━ Codex plugin manifest ━━━');

const manifestPath = path.join(ROOT, '.codex-plugin', 'plugin.json');
let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  ok('.codex-plugin/plugin.json valid JSON');
} catch {
  fail('.codex-plugin/plugin.json missing or invalid JSON');
  process.exit(1);
}

if (!manifest.name)        fail('.codex-plugin/plugin.json: missing "name"');
else ok(`name: ${manifest.name}`);

if (!manifest.version)     fail('.codex-plugin/plugin.json: missing "version"');
else ok(`version: ${manifest.version}`);

if (!manifest.description) fail('.codex-plugin/plugin.json: missing "description"');
else ok(`description present`);

if (!manifest.skills) {
  fail('.codex-plugin/plugin.json: missing "skills" — required for @<skill-name> invocation');
} else {
  ok(`skills: ${manifest.skills}`);
  const skillsDir = path.resolve(ROOT, manifest.skills);
  if (!fs.existsSync(skillsDir)) {
    fail(`skills directory not found: ${manifest.skills}`);
  } else {
    ok('skills directory exists');
    console.log('\n━━━ Skill folders ━━━');
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    const skillFolders = entries.filter(e => e.isDirectory());
    if (skillFolders.length === 0) {
      warn('skills directory is empty — add at least one skill folder');
    } else {
      for (const folder of skillFolders) {
        const skillMd = path.join(skillsDir, folder.name, 'SKILL.md');
        if (fs.existsSync(skillMd)) ok(`@${folder.name} → SKILL.md present`);
        else warn(`@${folder.name} → SKILL.md missing`);
      }
    }
  }
}

if (manifest.interface?.defaultPrompt) {
  const prompts = manifest.interface.defaultPrompt;
  if (!Array.isArray(prompts) || prompts.length === 0) {
    warn('interface.defaultPrompt should be a non-empty array of strings');
  } else {
    ok(`defaultPrompt: ${prompts.length} string(s)`);
  }
}

console.log('\n━━━ Summary ━━━');
if (errors === 0) console.log('✅ Codex plugin validated successfully');
else { console.log(`❌ ${errors} error(s), ${warnings} warning(s)`); process.exit(1); }
