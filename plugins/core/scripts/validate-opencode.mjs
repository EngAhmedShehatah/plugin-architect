#!/usr/bin/env node
// Validates a generated opencode plugin skeleton.
// Usage: node validate-opencode.mjs <plugin-path>

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!ROOT) { console.error('Usage: node validate-opencode.mjs <plugin-path>'); process.exit(1); }

let errors = 0;
let warnings = 0;

function ok(msg)   { console.log(`  ✅ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); warnings++; }
function fail(msg) { console.log(`  ❌ ${msg}`); errors++; }

console.log('\n━━━ opencode plugin files ━━━');

const pluginJs  = path.join(ROOT, 'src', 'plugins', 'opencode', 'plugin.js');
const pkgJson   = path.join(ROOT, 'src', 'plugins', 'opencode', 'package.json');
const agentsMd  = path.join(ROOT, 'AGENTS.md');

if (!fs.existsSync(pluginJs)) fail('src/plugins/opencode/plugin.js missing');
else ok('src/plugins/opencode/plugin.js present');

if (!fs.existsSync(pkgJson)) {
  fail('src/plugins/opencode/package.json missing');
} else {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
    if (pkg.type !== 'module') fail('src/plugins/opencode/package.json: "type" must be "module"');
    else ok('package.json: "type": "module"');
  } catch {
    fail('src/plugins/opencode/package.json: invalid JSON');
  }
}

console.log('\n━━━ AGENTS.md @-includes ━━━');

if (!fs.existsSync(agentsMd)) {
  warn('AGENTS.md not found — opencode uses AGENTS.md for skill auto-discovery');
} else {
  ok('AGENTS.md present');
  const lines = fs.readFileSync(agentsMd, 'utf-8').split('\n').filter(l => l.startsWith('@'));
  if (lines.length === 0) warn('AGENTS.md: no @-include lines found');
  else {
    for (const line of lines) {
      const rel = line.slice(1).trim();
      const abs = path.join(ROOT, rel);
      if (fs.existsSync(abs)) ok(rel);
      else fail(`@-include not found: ${rel}`);
    }
  }
}

console.log('\n━━━ Summary ━━━');
if (errors === 0) console.log('✅ opencode plugin validated successfully');
else { console.log(`❌ ${errors} error(s), ${warnings} warning(s)`); process.exit(1); }
