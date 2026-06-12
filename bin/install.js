#!/usr/bin/env node
// bin/install.js — plugin-architect unified installer
// Detects installed AI agents and installs plugin-architect for each.
// Usage: node bin/install.js [--force] [--only <id,...>] [--dry-run] [--uninstall]

import { spawnSync } from 'node:child_process';
import {
  existsSync, lstatSync, mkdirSync, copyFileSync,
  readFileSync, writeFileSync, readdirSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dir  = dirname(fileURLToPath(import.meta.url));
const ROOT   = resolve(__dir, '..');
const HOME   = homedir();
const IS_WIN = process.platform === 'win32';

// ─── PROVIDERS ────────────────────────────────────────────────────────────────
// Each entry: { id, label, detect, profile?, soft? }
//   detect   — pipe-separated clauses: command:<bin>, dir:<path>, vscode-ext:<needle>,
//              cursor-ext:<needle>, jetbrains-plugin:<needle>, macapp:<name>
//   profile  — npx-skills profile slug (omit for native installs)
//   soft     — true = opt-in only via --only; never auto-detected

const PROVIDERS = [
  // ── Native installs ────────────────────────────────────────────────────────
  { id: 'claude',      label: 'Claude Code',       detect: 'command:claude' },
  { id: 'gemini',      label: 'Gemini CLI',         detect: 'command:gemini' },
  { id: 'opencode',    label: 'opencode',           detect: 'command:opencode' },
  { id: 'openclaw',    label: 'OpenClaw',           detect: 'command:openclaw||dir:.openclaw/workspace' },
  // ── npx-skills agents ──────────────────────────────────────────────────────
  { id: 'codex',       label: 'Codex CLI',          detect: 'command:codex',                                             profile: 'codex' },
  { id: 'cursor',      label: 'Cursor',             detect: 'command:cursor||macapp:Cursor',                             profile: 'cursor' },
  { id: 'windsurf',    label: 'Windsurf',           detect: 'command:windsurf||macapp:Windsurf',                         profile: 'windsurf' },
  { id: 'cline',       label: 'Cline',              detect: 'vscode-ext:cline',                                          profile: 'cline' },
  { id: 'continue',    label: 'Continue',           detect: 'vscode-ext:continue.continue||vscode-ext:continue',         profile: 'continue' },
  { id: 'kilo',        label: 'Kilo Code',          detect: 'vscode-ext:kilocode',                                       profile: 'kilo' },
  { id: 'roo',         label: 'Roo Code',           detect: 'vscode-ext:roo||vscode-ext:rooveterinaryinc.roo-cline||cursor-ext:roo', profile: 'roo' },
  { id: 'augment',     label: 'Augment Code',       detect: 'vscode-ext:augment||jetbrains-plugin:augment',              profile: 'augment' },
  { id: 'copilot',     label: 'GitHub Copilot',     detect: '',                          soft: true,                     profile: 'github-copilot' },
  { id: 'aider-desk',  label: 'Aider Desk',         detect: 'command:aider',                                             profile: 'aider-desk' },
  { id: 'amp',         label: 'Sourcegraph Amp',    detect: 'command:amp',                                               profile: 'amp' },
  { id: 'bob',         label: 'IBM Bob',            detect: 'command:bob',                                               profile: 'bob' },
  { id: 'crush',       label: 'Crush',              detect: 'command:crush',                                             profile: 'crush' },
  { id: 'devin',       label: 'Devin',              detect: 'command:devin',                                             profile: 'devin' },
  { id: 'droid',       label: 'Droid',              detect: 'command:droid',                                             profile: 'droid' },
  { id: 'forgecode',   label: 'ForgeCode',          detect: 'command:forge',                                             profile: 'forgecode' },
  { id: 'goose',       label: 'Block Goose',        detect: 'command:goose',                                             profile: 'goose' },
  { id: 'iflow',       label: 'iFlow CLI',          detect: 'command:iflow',                                             profile: 'iflow-cli' },
  { id: 'kiro',        label: 'Kiro CLI',           detect: 'command:kiro',                                              profile: 'kiro-cli' },
  { id: 'mistral',     label: 'Mistral Vibe',       detect: 'command:mistral',                                           profile: 'mistral-vibe' },
  { id: 'openhands',   label: 'OpenHands',          detect: 'command:openhands',                                         profile: 'openhands' },
  { id: 'qwen',        label: 'Qwen Code',          detect: 'command:qwen',                                              profile: 'qwen-code' },
  { id: 'rovodev',     label: 'Atlassian Rovo Dev', detect: 'command:rovodev',                                           profile: 'rovodev' },
  { id: 'tabnine',     label: 'Tabnine CLI',        detect: 'command:tabnine',                                           profile: 'tabnine-cli' },
  { id: 'trae',        label: 'Trae',               detect: 'command:trae',                                              profile: 'trae' },
  { id: 'warp',        label: 'Warp',               detect: 'command:warp',                                              profile: 'warp' },
  { id: 'replit',      label: 'Replit Agent',       detect: 'command:replit',                                            profile: 'replit' },
  // ── Soft probes — opt-in via --only ────────────────────────────────────────
  { id: 'junie',       label: 'JetBrains Junie',   detect: 'jetbrains-plugin:junie',    soft: true,                     profile: 'junie' },
  { id: 'qoder',       label: 'Qoder',              detect: 'dir:.qoder',                soft: true,                     profile: 'qoder' },
  { id: 'antigravity', label: 'Google Antigravity', detect: 'dir:.gemini/antigravity',   soft: true,                     profile: 'antigravity' },
];

// ─── DETECTION ────────────────────────────────────────────────────────────────

function safeStat(p) {
  try { return lstatSync(p); } catch { return null; }
}

function hasCmd(cmd) {
  const r = spawnSync(
    IS_WIN ? 'where' : 'sh',
    IS_WIN ? [cmd] : ['-c', `command -v ${cmd}`],
    { encoding: 'utf-8' },
  );
  return r.status === 0;
}

function hasVscodeExt(needle) {
  const dirs = ['.vscode/extensions', '.cursor/extensions', '.windsurf/extensions'];
  for (const rel of dirs) {
    const base = join(HOME, rel);
    if (!existsSync(base)) continue;
    try {
      if (readdirSync(base).some(e => e.toLowerCase().includes(needle.toLowerCase()))) return true;
    } catch { /* ignore */ }
  }
  return false;
}

function hasCursorExt(needle) {
  const base = join(HOME, '.cursor/extensions');
  if (!existsSync(base)) return false;
  try {
    return readdirSync(base).some(e => e.toLowerCase().includes(needle.toLowerCase()));
  } catch { return false; }
}

function hasJetbrainsPlugin(needle) {
  const roots = IS_WIN
    ? [join(HOME, 'AppData/Roaming/JetBrains')]
    : [join(HOME, 'Library/Application Support/JetBrains'), join(HOME, '.config/JetBrains')];

  function walk(dir, depth) {
    if (depth > 3 || !existsSync(dir)) return false;
    try {
      for (const entry of readdirSync(dir)) {
        if (entry.toLowerCase().includes(needle.toLowerCase())) return true;
        if (depth < 3 && safeStat(join(dir, entry))?.isDirectory()) {
          if (walk(join(dir, entry), depth + 1)) return true;
        }
      }
    } catch { /* ignore */ }
    return false;
  }

  return roots.some(r => walk(r, 0));
}

function hasMacApp(name) {
  return existsSync(`/Applications/${name}.app`) ||
         existsSync(join(HOME, `Applications/${name}.app`));
}

function detectMatch(spec) {
  if (!spec) return false;
  for (const clause of spec.split('||')) {
    const colon = clause.indexOf(':');
    const type  = clause.slice(0, colon);
    const val   = clause.slice(colon + 1);
    if (type === 'command'          && hasCmd(val))              return true;
    if (type === 'dir'              && existsSync(join(HOME, val))) return true;
    if (type === 'file'             && existsSync(join(HOME, val))) return true;
    if (type === 'vscode-ext'       && hasVscodeExt(val))        return true;
    if (type === 'cursor-ext'       && hasCursorExt(val))        return true;
    if (type === 'jetbrains-plugin' && hasJetbrainsPlugin(val))  return true;
    if (type === 'macapp'           && hasMacApp(val))           return true;
  }
  return false;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf-8', stdio: 'inherit' });
  return r.status === 0;
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (safeStat(s)?.isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

function log(msg)  { process.stdout.write(msg + '\n'); }
function ok(msg)   { log(`  ✅ ${msg}`); }
function info(msg) { log(`  ℹ  ${msg}`); }
function skip(msg) { log(`  ⏭  ${msg}`); }
function fail(msg) { log(`  ❌ ${msg}`); }

// ─── INSTALL ──────────────────────────────────────────────────────────────────

function installClaude({ dry, force }) {
  if (!force) {
    const listed = spawnSync('claude', ['plugin', 'list'], { encoding: 'utf-8' });
    if (listed.stdout?.includes('plugin-architect')) {
      skip('Claude Code — already installed (--force to reinstall)');
      return;
    }
  }
  if (dry) { info('Claude Code — claude plugin install plugin-architect@<repo> + core@plugin-architect'); return; }
  const ok1 = run('claude', ['plugin', 'install', 'plugin-architect@https://github.com/EngAhmedShehatah/plugin-architect']);
  if (!ok1) { fail('Claude Code — marketplace install failed'); return; }
  const ok2 = run('claude', ['plugin', 'install', 'core@plugin-architect']);
  if (ok2) ok('Claude Code'); else fail('Claude Code — core plugin install failed');
}

function installGemini({ dry, force }) {
  if (!force) {
    const listed = spawnSync('gemini', ['extensions', 'list'], { encoding: 'utf-8' });
    if (listed.stdout?.includes('plugin-architect')) {
      skip('Gemini CLI — already installed (--force to reinstall)');
      return;
    }
  }
  if (dry) { info('Gemini CLI — gemini extensions install https://github.com/EngAhmedShehatah/plugin-architect'); return; }
  const success = run('gemini', ['extensions', 'install', 'https://github.com/EngAhmedShehatah/plugin-architect']);
  if (success) ok('Gemini CLI'); else fail('Gemini CLI — install failed');
}

function installViaSkills(provider, { dry }) {
  if (dry) { info(`${provider.label} — npx skills add github:EngAhmedShehatah/plugin-architect -a ${provider.profile}`); return; }
  const success = run('npx', ['-y', 'skills', 'add', 'github:EngAhmedShehatah/plugin-architect', '-a', provider.profile, '--yes', '--all']);
  if (success) ok(provider.label); else fail(`${provider.label} — skills install failed`);
}

function installOpencode({ dry }) {
  const pluginDest = join(HOME, '.config/opencode/plugins/plugin-architect');
  const skillsDest = join(HOME, '.config/opencode/skills/plugin-architect');
  const agentDest  = join(HOME, '.config/opencode/agents/plugin-architect.md');

  if (dry) {
    info(`opencode — plugin → ${pluginDest}`);
    info(`opencode — skills → ${skillsDest}`);
    info(`opencode — agent  → ${agentDest}`);
    return;
  }

  try {
    mkdirSync(pluginDest, { recursive: true });
    copyFileSync(join(ROOT, 'src/plugins/opencode/plugin.js'),    join(pluginDest, 'plugin.js'));
    copyFileSync(join(ROOT, 'src/plugins/opencode/package.json'), join(pluginDest, 'package.json'));

    const skillsBase = join(ROOT, 'plugins/core/skills');
    for (const name of readdirSync(skillsBase)) {
      if (name.endsWith('.json')) continue;
      if (!safeStat(join(skillsBase, name))?.isDirectory()) continue;
      copyDir(join(skillsBase, name), join(skillsDest, name));
    }

    mkdirSync(dirname(agentDest), { recursive: true });
    copyFileSync(join(ROOT, 'src/rules/plugin-architect-activate.md'), agentDest);

    ok('opencode');
  } catch (e) {
    fail(`opencode — ${e.message}`);
  }
}

function installOpenclaw({ dry }) {
  const workspace = process.env.OPENCLAW_WORKSPACE || join(HOME, '.openclaw/workspace');
  const skillDest = join(workspace, 'skills/plugin-architect');
  const soulPath  = join(workspace, 'SOUL.md');
  const skillSrc  = join(ROOT, 'plugins/core/skills/build-plugin/SKILL.md');
  const BEGIN     = '<!-- plugin-architect-begin -->';
  const END       = '<!-- plugin-architect-end -->';

  if (dry) { info(`OpenClaw — skill → ${skillDest}, SOUL.md → ${soulPath}`); return; }

  try {
    mkdirSync(skillDest, { recursive: true });
    const body = readFileSync(skillSrc, 'utf-8').replace(/^---[\s\S]*?---\n+/, '');
    writeFileSync(join(skillDest, 'SKILL.md'), `---\nname: plugin-architect\nversion: 1.0.0\nalways: false\n---\n\n${body}`);

    const snippet = `\n${BEGIN}\nUse plugin-architect to generate custom plugins for AI coding tools. Invoke the build-plugin skill when the user asks to build or generate a plugin.\n${END}\n`;
    if (existsSync(soulPath)) {
      const soul = readFileSync(soulPath, 'utf-8');
      if (!soul.includes(BEGIN)) writeFileSync(soulPath, soul + snippet);
    } else {
      writeFileSync(soulPath, snippet.trimStart());
    }
    ok('OpenClaw');
  } catch (e) {
    fail(`OpenClaw — ${e.message}`);
  }
}

// ─── UNINSTALL ────────────────────────────────────────────────────────────────

function uninstallClaude({ dry }) {
  if (dry) { info('Claude Code — claude plugin uninstall core@plugin-architect'); return; }
  run('claude', ['plugin', 'uninstall', 'core@plugin-architect']);
  ok('Claude Code — uninstalled');
}

function uninstallGemini({ dry }) {
  if (dry) { info('Gemini CLI — gemini extensions uninstall plugin-architect'); return; }
  run('gemini', ['extensions', 'uninstall', 'plugin-architect']);
  ok('Gemini CLI — uninstalled');
}

function uninstallViaSkills(provider, { dry }) {
  if (dry) { info(`${provider.label} — npx skills remove ... -a ${provider.profile}`); return; }
  run('npx', ['-y', 'skills', 'remove', 'github:EngAhmedShehatah/plugin-architect', '-a', provider.profile]);
  ok(`${provider.label} — uninstalled`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const dry        = args.includes('--dry-run');
const force      = args.includes('--force');
const uninstall  = args.includes('--uninstall');
const onlyIdx    = args.indexOf('--only');
const onlyIds    = onlyIdx !== -1 ? new Set(args[onlyIdx + 1]?.split(',') ?? []) : null;

const opts = { dry, force };

log(dry ? '\n🔍 plugin-architect installer — dry run\n' : '\n🔌 plugin-architect installer\n');

let acted = 0;

for (const provider of PROVIDERS) {
  if (onlyIds && !onlyIds.has(provider.id)) continue;
  if (provider.soft && !onlyIds?.has(provider.id)) continue;

  const detected = onlyIds?.has(provider.id) || detectMatch(provider.detect);
  if (!detected) continue;

  acted++;

  if (uninstall) {
    if (provider.id === 'claude')   { uninstallClaude(opts); continue; }
    if (provider.id === 'gemini')   { uninstallGemini(opts); continue; }
    if (provider.profile)           { uninstallViaSkills(provider, opts); continue; }
    continue;
  }

  if (provider.id === 'claude')   { installClaude(opts);   continue; }
  if (provider.id === 'gemini')   { installGemini(opts);   continue; }
  if (provider.id === 'opencode') { installOpencode(opts); continue; }
  if (provider.id === 'openclaw') { installOpenclaw(opts); continue; }
  if (provider.profile)           { installViaSkills(provider, opts); continue; }
}

if (acted === 0) {
  log('  No supported agents detected.');
  log('  Use --only <id> to target a specific agent (e.g. --only cursor,windsurf).');
  log('  Supported ids: ' + PROVIDERS.map(p => p.id).join(', '));
}

log('\n✅ Done.\n');
