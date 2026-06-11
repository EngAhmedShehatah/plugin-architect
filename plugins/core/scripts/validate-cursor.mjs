#!/usr/bin/env node
// Validates a generated Cursor plugin skeleton.
// Usage: node validate-cursor.mjs <plugin-path>

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!ROOT) { console.error('Usage: node validate-cursor.mjs <plugin-path>'); process.exit(1); }

let errors = 0;
let warnings = 0;

function ok(msg)   { console.log(`  ✅ ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); warnings++; }
function fail(msg) { console.log(`  ❌ ${msg}`); errors++; }

console.log('\n━━━ Cursor rule files ━━━');

const rulesDir  = path.join(ROOT, '.cursor', 'rules');
const legacyFile = path.join(ROOT, '.cursorrules');

const hasModern = fs.existsSync(rulesDir);
const hasLegacy = fs.existsSync(legacyFile);

if (!hasModern && !hasLegacy) {
  fail('No Cursor rule files found — expected .cursor/rules/ or .cursorrules');
  process.exit(1);
}

if (hasModern) {
  ok('.cursor/rules/ directory present');
  const mdcFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.mdc'));
  if (mdcFiles.length === 0) warn('.cursor/rules/ is empty — add at least one .mdc rule file');
  else mdcFiles.forEach(f => ok(`rule: ${f}`));
}

if (hasLegacy) {
  if (hasModern) warn('.cursorrules also present — prefer .cursor/rules/*.mdc (modern format)');
  else ok('.cursorrules present (legacy format)');
}

console.log('\n━━━ Summary ━━━');
if (errors === 0) console.log('✅ Cursor plugin validated successfully');
else { console.log(`❌ ${errors} error(s), ${warnings} warning(s)`); process.exit(1); }
