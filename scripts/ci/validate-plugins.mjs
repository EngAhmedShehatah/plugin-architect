#!/usr/bin/env node
// Plugin structure validator. Runs in GitHub Actions (PRs) and locally via pre-commit hook.
// Catches the main failure modes that prevent plugins from loading:
//   - invalid JSON in any manifest (marketplace, plugin, hooks, mcp)
//   - missing plugin source paths
//   - missing or malformed YAML frontmatter on agents, commands, skills
//   - missing required `description` on commands and skills
//   - malformed `description` shape — value must terminate on a single line.
//     Plain scalars end at end-of-line; double-quoted values must close with `"`
//     on the same line. Block scalars (`|` / `>`) and unclosed quoted strings
//     are rejected — both are visually fragile in YAML and never appear in
//     official Claude Code agent/skill/command examples.
//   - broken cross-references in `skills:` frontmatter (agent or command points
//     to a skill name that doesn't exist under any plugin's skills/ tree)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const MARKETPLACE = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

let errors = 0;

const hdr = (s) => console.log(`\n━━━ ${s} ━━━`);
const err = (s) => { console.log(`  ❌ ${s}`); errors++; };
const ok  = (s) => console.log(`  ✅ ${s}`);
const repoRel = (p) => path.relative(REPO_ROOT, p);

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

const hasDescription = (file) =>
  /^description:/m.test(fs.readFileSync(file, 'utf8'));

// Validate the shape of the `description:` value.
// Must be a single-line plain scalar or double-quoted string.
// Block scalars (| / >) and unclosed quoted strings are rejected.
const validateDescriptionShape = (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return { ok: true };
  const lines = fmMatch[1].split(/\r?\n/);
  let descIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('description:')) { descIdx = i; break; }
  }
  if (descIdx === -1) return { ok: true };
  const raw = lines[descIdx].slice('description:'.length);
  const value = raw.replace(/^\s+/, '');
  if (value === '') return { ok: false, reason: 'description value is empty' };
  if (value === '|' || value === '>' || value.startsWith('|') || value.startsWith('>')) {
    return { ok: false, reason: `block scalar form (${value[0]}) not allowed — use single-line plain or double-quoted` };
  }
  if (value.startsWith('"')) {
    let i = 1;
    let closed = false;
    while (i < value.length) {
      if (value[i] === '\\') { i += 2; continue; }
      if (value[i] === '"') { closed = true; break; }
      i++;
    }
    if (!closed) {
      return { ok: false, reason: 'double-quoted description does not close on same line' };
    }
    const trailing = value.substring(i + 1).trim();
    if (trailing !== '' && !trailing.startsWith('#')) {
      return { ok: false, reason: `unexpected content after closing quote: ${JSON.stringify(trailing.slice(0, 40))}` };
    }
  }
  return { ok: true };
};

const isDir  = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const listMd = (dir) =>
  fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(dir, f));

// Extract `skills:` array entries from a file's YAML frontmatter.
const extractSkillRefs = (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return [];
  const skillsBlock = fm[1].match(/(?:^|\n)skills:\s*\n((?:[ \t]+-[ \t]+.+\n?)+)/);
  if (!skillsBlock) return [];
  const refs = [];
  for (const line of skillsBlock[1].split(/\r?\n/)) {
    const m = line.match(/^[ \t]+-[ \t]+["']?([A-Za-z][A-Za-z0-9_-]*(?::[A-Za-z][A-Za-z0-9_-]*)?)["']?\s*(?:#.*)?$/);
    if (m) refs.push(m[1]);
  }
  return refs;
};

// Resolve a raw skill ref to its canonical `<pluginName>:<skillName>` form.
const resolveSkillRef = (ref, ownerPluginName) =>
  ref.includes(':') ? ref : `${ownerPluginName}:${ref}`;

// ==== marketplace.json ====
hdr('Marketplace manifest');
if (!fs.existsSync(MARKETPLACE)) {
  err(`marketplace.json not found at ${repoRel(MARKETPLACE)}`);
  process.exit(1);
}
const marketplace = parseJson(MARKETPLACE);
if (!marketplace.ok) {
  err(`marketplace.json is invalid JSON: ${marketplace.error}`);
  process.exit(1);
}
ok('marketplace.json valid');

const plugins = marketplace.data.plugins || [];

// ==== build skill registry ====
const skillRegistry = new Set();
for (const { name: pluginName, source } of plugins) {
  const root = path.join(REPO_ROOT, source.replace(/^\.\//, ''));
  const skillsDir = path.join(root, 'skills');
  if (!isDir(skillsDir)) continue;
  for (const e of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md'))) {
      skillRegistry.add(`${pluginName}:${e.name}`);
    }
  }
}

// ==== per-plugin checks ====
for (const { name, source } of plugins) {
  hdr(`Plugin: ${name} (${source})`);
  const cleanSource = source.replace(/^\.\//, '');
  const pluginRoot = path.join(REPO_ROOT, cleanSource);

  if (!isDir(pluginRoot)) {
    err(`missing plugin dir: ${pluginRoot}`);
    continue;
  }

  const manifest = path.join(pluginRoot, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifest)) {
    err(`missing ${repoRel(manifest)}`);
    continue;
  }
  const pm = parseJson(manifest);
  if (!pm.ok) {
    err(`invalid JSON: ${repoRel(manifest)} (${pm.error})`);
    continue;
  }
  if (!pm.data.name) {
    err(`plugin.json missing 'name': ${repoRel(manifest)}`);
    continue;
  }
  ok(`plugin.json: name=${pm.data.name}`);

  // Agents
  const agentsDir = path.join(pluginRoot, 'agents');
  if (isDir(agentsDir)) {
    for (const f of listMd(agentsDir)) {
      if (!hasFrontmatter(f)) {
        err(`agent missing or malformed frontmatter: ${repoRel(f)}`);
        continue;
      }
      const descCheck = validateDescriptionShape(f);
      if (!descCheck.ok) {
        err(`agent ${path.basename(f)}: ${descCheck.reason}`);
        continue;
      }
      const refs = extractSkillRefs(f);
      const broken = refs.filter((r) => !skillRegistry.has(resolveSkillRef(r, pm.data.name)));
      if (broken.length > 0) {
        err(`agent ${path.basename(f)}: unknown skill ref(s): ${broken.join(', ')}`);
      } else {
        const tag = refs.length > 0 ? ` (${refs.length} skill ref${refs.length === 1 ? '' : 's'} ✓)` : '';
        ok(`agent: ${path.basename(f)}${tag}`);
      }
    }
  }

  // Commands
  const commandsDir = path.join(pluginRoot, 'commands');
  if (isDir(commandsDir)) {
    for (const f of listMd(commandsDir)) {
      if (!hasFrontmatter(f)) {
        err(`command missing frontmatter: ${repoRel(f)}`);
        continue;
      }
      if (!hasDescription(f)) {
        err(`command missing description: ${repoRel(f)}`);
        continue;
      }
      const descCheck = validateDescriptionShape(f);
      if (!descCheck.ok) {
        err(`command ${path.basename(f)}: ${descCheck.reason}`);
        continue;
      }
      const refs = extractSkillRefs(f);
      const broken = refs.filter((r) => !skillRegistry.has(resolveSkillRef(r, pm.data.name)));
      if (broken.length > 0) {
        err(`command ${path.basename(f)}: unknown skill ref(s): ${broken.join(', ')}`);
      } else {
        const tag = refs.length > 0 ? ` (${refs.length} skill ref${refs.length === 1 ? '' : 's'} ✓)` : '';
        ok(`command: ${path.basename(f)}${tag}`);
      }
    }
  }

  // Skills
  const skillsDir = path.join(pluginRoot, 'skills');
  if (isDir(skillsDir)) {
    const subdirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => path.join(skillsDir, e.name));
    for (const sd of subdirs) {
      const skillFile = path.join(sd, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;
      if (!hasFrontmatter(skillFile)) {
        err(`skill missing frontmatter: ${repoRel(skillFile)}`);
        continue;
      }
      if (!hasDescription(skillFile)) {
        err(`skill missing description: ${repoRel(skillFile)}`);
        continue;
      }
      const descCheck = validateDescriptionShape(skillFile);
      if (!descCheck.ok) {
        err(`skill ${path.basename(sd)}: ${descCheck.reason}`);
        continue;
      }
      ok(`skill: ${path.basename(sd)}`);
    }
  }

  // Hooks JSON
  const hooksJson = path.join(pluginRoot, 'hooks', 'hooks.json');
  if (fs.existsSync(hooksJson)) {
    const hj = parseJson(hooksJson);
    if (hj.ok) ok('hooks.json valid JSON');
    else err(`hooks.json invalid JSON: ${repoRel(hooksJson)} (${hj.error})`);
  }

  // MCP JSON
  const mcpJson = path.join(pluginRoot, '.mcp.json');
  if (fs.existsSync(mcpJson)) {
    const mj = parseJson(mcpJson);
    if (mj.ok) ok('.mcp.json valid JSON');
    else err(`.mcp.json invalid JSON: ${repoRel(mcpJson)} (${mj.error})`);
  }
}

hdr('Summary');
if (errors === 0) {
  console.log('✅ All plugins validated successfully');
  process.exit(0);
} else {
  console.log(`❌ Validation failed with ${errors} error(s)`);
  process.exit(1);
}
