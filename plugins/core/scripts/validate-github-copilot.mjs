#!/usr/bin/env node
// GitHub Copilot plugin validator.
// Usage: node validate-github-copilot.mjs <marketplace-path>
//
// Validates a Copilot-compatible plugin structure:
//   - root plugin.json manifest
//   - skill folders with SKILL.md
//   - agent files with frontmatter
//   - .mcp.json if present
//   - no Claude Code artifacts in Copilot space

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (!ROOT) {
  console.error('Usage: node validate-github-copilot.mjs <marketplace-path>');
  process.exit(1);
}

const MANIFEST = path.join(ROOT, 'plugin.json');

let errors = 0;

const hdr     = (s) => console.log(`\n━━━ ${s} ━━━`);
const err     = (s) => { console.log(`  ❌ ${s}`); errors++; };
const ok      = (s) => console.log(`  ✅ ${s}`);
const rootRel = (p) => path.relative(ROOT, p);

const parseJson = (file) => {
  try {
    return { ok: true, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

const hasFrontmatter = (file) => {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  if (lines[0] !== '---') return false;
  return lines.filter((l) => l === '---').length >= 2;
};

const isDir  = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

// ==== plugin.json ====
hdr('Copilot manifest');
if (!fs.existsSync(MANIFEST)) {
  err(`plugin.json not found at ${rootRel(MANIFEST)}`);
  process.exit(1);
}
const manifest = parseJson(MANIFEST);
if (!manifest.ok) {
  err(`plugin.json is invalid JSON: ${manifest.error}`);
  process.exit(1);
}
ok('plugin.json valid JSON');

if (!manifest.data.name) {
  err('plugin.json missing "name"');
} else {
  ok(`name: ${manifest.data.name}`);
}

// ==== Check for .claude-plugin ====
const claudePluginDir = path.join(ROOT, '.claude-plugin');
if (isDir(claudePluginDir)) {
  if (fs.existsSync(path.join(ROOT, 'plugin.json'))) {
    ok('.claude-plugin/ present (dual-platform project)');
  } else {
    err('.claude-plugin/ directory present without root plugin.json — Copilot needs plugin.json at root');
  }
}

// ==== AGENTS.md ====
hdr('AGENTS.md');
const agentsMd = path.join(ROOT, 'AGENTS.md');
if (fs.existsSync(agentsMd)) {
  if (hasFrontmatter(agentsMd)) {
    ok('AGENTS.md present with frontmatter');
  } else {
    err('AGENTS.md missing or malformed frontmatter');
  }
} else {
  err('AGENTS.md not found at root');
}

// ==== Skills ====
hdr('Skills');

function resolvePaths(base, value) {
  if (typeof value === 'string') return [path.resolve(base, value)];
  if (Array.isArray(value)) return value.map((v) => path.resolve(base, v));
  return [];
}

const skillPaths = resolvePaths(ROOT, manifest.data.skills || []);
const skillDirsOnDisk = [];

if (skillPaths.length === 0) {
  const checkSkillsDir = (baseDir) => {
    if (!isDir(baseDir)) return;
    for (const e of fs.readdirSync(baseDir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (fs.existsSync(path.join(baseDir, e.name, 'SKILL.md'))) {
        skillDirsOnDisk.push(path.join(baseDir, e.name));
      }
    }
  };
  checkSkillsDir(path.join(ROOT, '.github', 'skills'));
  checkSkillsDir(path.join(ROOT, 'skills'));
} else {
  for (const sp of skillPaths) {
    if (!isDir(sp)) {
      err(`skills path not found: ${rootRel(sp)}`);
      continue;
    }
    if (fs.existsSync(path.join(sp, 'SKILL.md'))) {
      skillDirsOnDisk.push(sp);
    } else {
      for (const e of fs.readdirSync(sp, { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        if (fs.existsSync(path.join(sp, e.name, 'SKILL.md'))) {
          skillDirsOnDisk.push(path.join(sp, e.name));
        }
      }
    }
  }
}

if (skillDirsOnDisk.length === 0) {
  err('no skill directories found');
} else {
  for (const sd of skillDirsOnDisk) {
    const skillFile = path.join(sd, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      err(`missing SKILL.md in ${rootRel(sd)}`);
      continue;
    }
    if (!hasFrontmatter(skillFile)) {
      err(`skill missing frontmatter: ${rootRel(skillFile)}`);
      continue;
    }
    ok(`skill: ${path.basename(sd)}`);
  }
}

// ==== Agents ====
hdr('Agents');

const githubAgentsDir = path.join(ROOT, '.github', 'agents');
const flatAgentsDir = path.join(ROOT, 'agents');

let agentFiles = [];
if (isDir(githubAgentsDir)) {
  agentFiles = fs.readdirSync(githubAgentsDir)
    .filter((f) => f.endsWith('.agent.md') || f.endsWith('.md'))
    .map((f) => path.join(githubAgentsDir, f));
}
if (isDir(flatAgentsDir)) {
  agentFiles = agentFiles.concat(
    fs.readdirSync(flatAgentsDir)
      .filter((f) => f.endsWith('.agent.md') || f.endsWith('.md'))
      .map((f) => path.join(flatAgentsDir, f))
  );
}

if (agentFiles.length === 0) {
  ok('no agent directories found (optional)');
} else {
  for (const f of agentFiles) {
    if (!hasFrontmatter(f)) {
      err(`agent missing frontmatter: ${rootRel(f)}`);
      continue;
    }
    ok(`agent: ${path.basename(f)}`);
  }
}

// ==== MCP config ====
hdr('MCP config');
const mcpJson = path.join(ROOT, '.mcp.json');
if (fs.existsSync(mcpJson)) {
  const mj = parseJson(mcpJson);
  if (mj.ok) ok('.mcp.json valid JSON');
  else err(`.mcp.json invalid JSON: ${mj.error}`);
} else {
  ok('.mcp.json not found (optional)');
}

// ==== Summary ====
hdr('Summary');
if (errors === 0) {
  console.log('✅ Copilot plugin validated successfully');
  process.exit(0);
} else {
  console.log(`❌ Validation failed with ${errors} error(s)`);
  process.exit(1);
}
