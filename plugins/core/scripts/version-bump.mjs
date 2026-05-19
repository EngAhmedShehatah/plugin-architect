#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');

const SKIP      = (process.env.SKIP_VERSION_BUMP || '').toLowerCase() === 'true';
const BUMP_TYPE = (process.env.BUMP_TYPE || 'patch').toLowerCase();

const IGNORE_PATTERNS = [/^\.github\//i, /^plans\//i, /^debug\//i, /^LICENSE$/i, /^CHANGELOG/i];

function log(msg) { console.log(`[version-bump] ${msg}`); }

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim();
}

function getStagedFiles() {
  const output = run('git diff --cached --name-only');
  return output ? output.split('\n').filter(Boolean) : [];
}

function shouldIgnore(file) {
  return IGNORE_PATTERNS.some((p) => p.test(file));
}

function stageFile(absPath) {
  const rel = absPath.startsWith(ROOT + '/') ? absPath.slice(ROOT.length + 1) : absPath;
  execSync(`git add "${rel}"`, { cwd: ROOT, stdio: 'inherit' });
}

function bumpJsonVersion(absPath, label) {
  const data = JSON.parse(readFileSync(absPath, 'utf-8'));
  if (!data.version) { log(`⚠  ${label}: no version field, skipping`); return; }
  const old = data.version;
  data.version = bumpVersion(old, BUMP_TYPE);
  writeFileSync(absPath, JSON.stringify(data, null, 2) + '\n');
  stageFile(absPath);
  log(`${label}: ${old} → ${data.version}`);
}

function isMergeCommit() {
  return existsSync(join(ROOT, '.git', 'MERGE_HEAD'));
}

function main() {
  if (SKIP)            { log('skipped (SKIP_VERSION_BUMP=true)'); return; }
  if (isMergeCommit()) { log('merge in progress, skipping'); return; }

  const allStaged = getStagedFiles();
  if (!allStaged.length) { log('no staged files, skipping'); return; }

  const rootManifestPath = join(ROOT, '.claude-plugin', 'plugin.json');
  const rootManifest = JSON.parse(readFileSync(rootManifestPath, 'utf-8'));
  const pluginSources = rootManifest.plugins || [];

  const meaningful = allStaged.filter((f) => !shouldIgnore(f));
  for (const source of pluginSources) {
    const pluginFolder = source.replace(/^\.\//, '');
    const hasChanges = meaningful.some((f) => f.startsWith(pluginFolder + '/') || f === pluginFolder);
    if (!hasChanges) { log(`${pluginFolder}: no changes, skipping`); continue; }
    const pluginManifest = join(ROOT, pluginFolder, '.claude-plugin', 'plugin.json');
    if (!existsSync(pluginManifest)) { log(`⚠  ${pluginFolder}/.claude-plugin/plugin.json not found, skipping`); continue; }
    bumpJsonVersion(pluginManifest, pluginFolder);
  }

  bumpJsonVersion(rootManifestPath, '.claude-plugin/plugin.json');
  log(`✓ done (${BUMP_TYPE})`);
}

try {
  main();
} catch (e) {
  console.error(`[version-bump] ✗ ${e.message}`);
  process.exitCode = 1;
}
