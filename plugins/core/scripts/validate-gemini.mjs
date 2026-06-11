#!/usr/bin/env node
// Validates a generated Gemini CLI plugin skeleton.
// Usage: node validate-gemini.mjs <plugin-path>

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!ROOT) { console.error('Usage: node validate-gemini.mjs <plugin-path>'); process.exit(1); }

let errors = 0;
let warnings = 0;

function ok(msg)   { console.log(`  ✅ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); warnings++; }
function fail(msg) { console.log(`  ❌ ${msg}`); errors++; }

console.log('\n━━━ Gemini extension manifest ━━━');

const manifestPath = path.join(ROOT, 'gemini-extension.json');
let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  ok('gemini-extension.json valid JSON');
} catch {
  fail('gemini-extension.json missing or invalid JSON');
  process.exit(1);
}

if (!manifest.name)        fail('gemini-extension.json: missing "name"');
else ok(`name: ${manifest.name}`);

if (!manifest.version)     fail('gemini-extension.json: missing "version"');
else ok(`version: ${manifest.version}`);

if (!manifest.contextFileName) {
  fail('gemini-extension.json: missing "contextFileName"');
} else {
  ok(`contextFileName: ${manifest.contextFileName}`);
  const contextPath = path.join(ROOT, manifest.contextFileName);
  if (!fs.existsSync(contextPath)) {
    fail(`context file not found: ${manifest.contextFileName}`);
  } else {
    ok(`context file exists: ${manifest.contextFileName}`);
    const lines = fs.readFileSync(contextPath, 'utf-8').split('\n').filter(l => l.startsWith('@'));
    if (lines.length === 0) warn(`${manifest.contextFileName}: no @-include lines found`);
    else {
      console.log('\n━━━ Context file @-includes ━━━');
      for (const line of lines) {
        const rel = line.slice(1).trim();
        const abs = path.join(ROOT, rel);
        if (fs.existsSync(abs)) ok(rel);
        else fail(`@-include not found: ${rel}`);
      }
    }
  }
}

console.log('\n━━━ Summary ━━━');
if (errors === 0) console.log('✅ Gemini plugin validated successfully');
else { console.log(`❌ ${errors} error(s), ${warnings} warning(s)`); process.exit(1); }
