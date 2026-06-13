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

// All root-level platform manifests. Each that exists gets bumped to the same
// new version so all platforms stay in sync. The first entry is the version
// source — its current value is what gets bumped, then written to all others.
const PLATFORM_MANIFESTS = [
  '.claude-plugin/plugin.json',
  'plugin.json',
  '.codex-plugin/plugin.json',
  'gemini-extension.json',
];

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

function writeVersion(absPath, newVersion, label) {
  const data = JSON.parse(readFileSync(absPath, 'utf-8'));
  if (!data.version) { log(`⚠  ${label}: no version field, skipping`); return; }
  const old = data.version;
  data.version = newVersion;
  writeFileSync(absPath, JSON.stringify(data, null, 2) + '\n');
  stageFile(absPath);
  log(`${label}: ${old} → ${newVersion}`);
}

function isMergeCommit() {
  return existsSync(join(ROOT, '.git', 'MERGE_HEAD'));
}

function main() {
  if (SKIP)            { log('skipped (SKIP_VERSION_BUMP=true)'); return; }
  if (isMergeCommit()) { log('merge in progress, skipping'); return; }

  const allStaged = getStagedFiles();
  if (!allStaged.length) { log('no staged files, skipping'); return; }

  const meaningful = allStaged.filter((f) => !shouldIgnore(f));

  // Sub-plugins: bump their own manifest only when their folder has changes.
  const rootManifestPath = join(ROOT, '.claude-plugin', 'plugin.json');
  const rootManifest = JSON.parse(readFileSync(rootManifestPath, 'utf-8'));
  const pluginSources = rootManifest.plugins || [];
  for (const source of pluginSources) {
    const pluginFolder = source.replace(/^\.\//, '');
    const hasChanges = meaningful.some((f) => f.startsWith(pluginFolder + '/') || f === pluginFolder);
    if (!hasChanges) { log(`${pluginFolder}: no changes, skipping`); continue; }
    const pluginManifest = join(ROOT, pluginFolder, '.claude-plugin', 'plugin.json');
    if (!existsSync(pluginManifest)) { log(`⚠  ${pluginFolder}/.claude-plugin/plugin.json not found, skipping`); continue; }
    const subData = JSON.parse(readFileSync(pluginManifest, 'utf-8'));
    const newSubVer = bumpVersion(subData.version, BUMP_TYPE);
    writeVersion(pluginManifest, newSubVer, pluginFolder);
  }

  // Root platform manifests: derive new version from the first present manifest,
  // then write the same version to all others so they stay in sync.
  const present = PLATFORM_MANIFESTS.map((rel) => join(ROOT, rel)).filter(existsSync);
  if (!present.length) { log('no platform manifests found'); return; }

  const sourceData = JSON.parse(readFileSync(present[0], 'utf-8'));
  const newVersion = bumpVersion(sourceData.version, BUMP_TYPE);

  for (const absPath of present) {
    const label = absPath.slice(ROOT.length + 1);
    writeVersion(absPath, newVersion, label);
  }

  log(`✓ done (${BUMP_TYPE})`);
}

try {
  main();
} catch (e) {
  console.error(`[version-bump] ✗ ${e.message}`);
  process.exitCode = 1;
}
