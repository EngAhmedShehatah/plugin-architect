#!/usr/bin/env node
// bin/install.js — plugin-architect unified installer
// Detects installed AI agents and installs plugin-architect for each.
// Usage: node bin/install.js [--force] [--only <id,...>] [--dry-run] [--uninstall]

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import {
  existsSync, lstatSync, mkdirSync, copyFileSync,
  readFileSync, writeFileSync, readdirSync,
  renameSync, rmSync, unlinkSync,
  openSync, readSync, closeSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { randomBytes } from 'node:crypto';

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
  { id: 'claude',      label: 'Claude Code',       detect: 'command:claude' },
  { id: 'gemini',      label: 'Gemini CLI',         detect: 'command:gemini' },
  { id: 'opencode',    label: 'opencode',           detect: 'command:opencode' },
  { id: 'copilot',     label: 'GitHub Copilot',     detect: 'command:copilot' },
  { id: 'codex',       label: 'Codex CLI',          detect: 'command:codex' }
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

// ─── OPENCODE HELPERS ─────────────────────────────────────────────────────────

const OPENCODE_PLUGIN_REL   = './plugins/plugin-architect/plugin.js';
const OPENCODE_AGENTS_BEGIN = '<!-- plugin-architect-begin -->';
const OPENCODE_AGENTS_END   = '<!-- plugin-architect-end -->';

function opencodeConfigDir() {
  if (process.env.XDG_CONFIG_HOME) return join(process.env.XDG_CONFIG_HOME, 'opencode');
  if (IS_WIN) return join(process.env.APPDATA || join(HOME, 'AppData', 'Roaming'), 'opencode');
  return join(HOME, '.config', 'opencode');
}

function stripJsonComments(src) {
  let out = '', i = 0;
  const n = src.length;
  let inStr = false, strChar = '', inLine = false, inBlock = false;
  while (i < n) {
    const c = src[i], nx = i + 1 < n ? src[i + 1] : '';
    if (inLine)  { if (c === '\n') { inLine = false; out += c; } i++; continue; }
    if (inBlock) { if (c === '*' && nx === '/') { inBlock = false; i += 2; } else i++; continue; }
    if (inStr)   { out += c; if (c === '\\' && i + 1 < n) { out += src[++i]; } else if (c === strChar) inStr = false; i++; continue; }
    if (c === '"' || c === "'") { inStr = true; strChar = c; out += c; i++; continue; }
    if (c === '/' && nx === '/') { inLine = true; i += 2; continue; }
    if (c === '/' && nx === '*') { inBlock = true; i += 2; continue; }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

function readJsonc(p) {
  if (!existsSync(p)) return {};
  const raw = readFileSync(p, 'utf-8').trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (_) {}
  try { return JSON.parse(stripJsonComments(raw)); } catch { return null; }
}

function writeJsonAtomic(p, obj) {
  mkdirSync(dirname(p), { recursive: true });
  const tmp = join(dirname(p), `.${randomBytes(4).toString('hex')}.tmp`);
  writeFileSync(tmp, JSON.stringify(obj, null, 2) + '\n', { mode: 0o600 });
  renameSync(tmp, p);
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
  if (dry) { info('Claude Code — claude plugin install core@plugin-architect'); return; }
  const installed = run('claude', ['plugin', 'install', 'core@plugin-architect']);
  if (installed) ok('Claude Code'); else fail('Claude Code — core plugin install failed');
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

function installCodex({ dry, force }) {
  if (dry) { info('Codex CLI — codex plugin marketplace add https://github.com/EngAhmedShehatah/plugin-architect'); return; }
  const success = run('codex', ['plugin', 'marketplace', 'add', 'https://github.com/EngAhmedShehatah/plugin-architect']);
  if (success) ok('Codex CLI'); else fail('Codex CLI — marketplace add failed');
}

function installViaSkills(provider, { dry }) {
  if (dry) { info(`${provider.label} — npx skills add github:EngAhmedShehatah/plugin-architect -a ${provider.profile}`); return; }
  const success = run('npx', ['-y', 'skills', 'add', 'github:EngAhmedShehatah/plugin-architect', '-a', provider.profile, '--yes', '--all']);
  if (success) ok(provider.label); else fail(`${provider.label} — skills install failed`);
}

function installOpencode({ dry, force }) {
  const dir        = opencodeConfigDir();
  const pluginDest = join(dir, 'plugins', 'plugin-architect');
  const skillsDest = join(dir, 'skills', 'plugin-architect');
  const agentsDest = join(dir, 'agents');
  const agentDest  = join(agentsDest, 'plugin-architect.md');
  const agentsMd   = join(dir, 'AGENTS.md');
  const ocJson     = join(dir, 'opencode.json');

  if (dry) {
    info(`opencode — plugin  → ${pluginDest}`);
    info(`opencode — skills  → ${skillsDest}`);
    info(`opencode — agent   → ${agentDest}`);
    info(`opencode — patch   → ${ocJson} (plugin entry)`);
    return;
  }

  try {
    // 1. Plugin files
    mkdirSync(pluginDest, { recursive: true });
    for (const f of ['plugin.js', 'package.json']) {
      const dest = join(pluginDest, f);
      if (existsSync(dest) && !force) { info(`  skipped ${dest} (exists; --force to overwrite)`); continue; }
      copyFileSync(join(ROOT, 'src/plugins/opencode', f), dest);
    }
    process.stdout.write(`  installed: ${pluginDest}\n`);

    // 2. Skills
    const skillsBase = join(ROOT, 'plugins/core/skills');
    for (const name of readdirSync(skillsBase)) {
      if (name.endsWith('.json')) continue;
      if (!safeStat(join(skillsBase, name))?.isDirectory()) continue;
      const dest = join(skillsDest, name);
      if (existsSync(dest) && !force) { info(`  skipped ${dest}/ (exists; --force to overwrite)`); continue; }
      copyDir(join(skillsBase, name), dest);
    }
    process.stdout.write(`  installed: ${skillsDest}\n`);

    // 3. Agent file
    mkdirSync(agentsDest, { recursive: true });
    const ruleSrc = join(ROOT, 'src/rules/plugin-architect-activate.md');
    if (existsSync(ruleSrc)) {
      if (existsSync(agentDest) && !force) {
        info(`  skipped ${agentDest} (exists; --force to overwrite)`);
      } else {
        copyFileSync(ruleSrc, agentDest);
        process.stdout.write(`  installed: ${agentDest}\n`);
      }
    }

    // 4. AGENTS.md — inject fenced block
    if (existsSync(ruleSrc)) {
      const ruleBody = readFileSync(ruleSrc, 'utf-8').trimEnd() + '\n';
      const fenced   = `${OPENCODE_AGENTS_BEGIN}\n${ruleBody}${OPENCODE_AGENTS_END}\n`;
      if (existsSync(agentsMd)) {
        const body = readFileSync(agentsMd, 'utf-8');
        if (!body.includes(OPENCODE_AGENTS_BEGIN)) {
          const sep = body.endsWith('\n\n') ? '' : body.endsWith('\n') ? '\n' : '\n\n';
          writeFileSync(agentsMd, body + sep + fenced, { mode: 0o644 });
          process.stdout.write(`  appended: ${agentsMd}\n`);
        } else {
          info(`  ${agentsMd} already contains plugin-architect block`);
        }
      } else {
        writeFileSync(agentsMd, fenced, { mode: 0o644 });
        process.stdout.write(`  installed: ${agentsMd}\n`);
      }
    }

    // 5. opencode.json — register plugin entry (idempotent, JSONC-tolerant)
    const cfg = readJsonc(ocJson);
    if (cfg === null) { fail(`opencode — ${ocJson} unparseable; edit manually then re-run`); return; }
    const bakPath = ocJson + '.bak';
    if (existsSync(ocJson) && !existsSync(bakPath)) { try { copyFileSync(ocJson, bakPath); } catch (_) {} }
    if (!Array.isArray(cfg.plugin)) cfg.plugin = [];
    if (!cfg.plugin.includes(OPENCODE_PLUGIN_REL)) cfg.plugin.push(OPENCODE_PLUGIN_REL);
    writeJsonAtomic(ocJson, cfg);
    process.stdout.write(`  patched: ${ocJson}\n`);

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

function uninstallCodex({ dry }) {
  if (dry) { info('Codex CLI — codex plugin marketplace remove plugin-architect'); return; }
  run('codex', ['plugin', 'marketplace', 'remove', 'plugin-architect']);
  ok('Codex CLI — uninstalled');
}

function uninstallOpencode({ dry }) {
  const dir       = opencodeConfigDir();
  const ocJson    = join(dir, 'opencode.json');
  const pluginDir = join(dir, 'plugins', 'plugin-architect');
  const skillsDir = join(dir, 'skills', 'plugin-architect');
  const agentFile = join(dir, 'agents', 'plugin-architect.md');
  const agentsMd  = join(dir, 'AGENTS.md');

  if (dry) {
    info(`opencode — would remove ${pluginDir}, ${skillsDir}, ${agentFile}`);
    info(`opencode — would prune ${ocJson} plugin entry`);
    return;
  }

  if (existsSync(ocJson)) {
    const cfg = readJsonc(ocJson);
    if (cfg && Array.isArray(cfg.plugin)) {
      cfg.plugin = cfg.plugin.filter(p => p !== OPENCODE_PLUGIN_REL);
      if (cfg.plugin.length === 0) delete cfg.plugin;
      try { writeJsonAtomic(ocJson, cfg); process.stdout.write(`  pruned: ${ocJson}\n`); } catch (_) {}
    }
  }

  try { if (existsSync(pluginDir)) rmSync(pluginDir, { recursive: true, force: true }); } catch (_) {}
  try { if (existsSync(skillsDir)) rmSync(skillsDir, { recursive: true, force: true }); } catch (_) {}
  try { if (existsSync(agentFile)) unlinkSync(agentFile); } catch (_) {}

  if (existsSync(agentsMd)) {
    const body  = readFileSync(agentsMd, 'utf-8');
    const begin = body.indexOf(OPENCODE_AGENTS_BEGIN);
    const end   = body.indexOf(OPENCODE_AGENTS_END);
    if (begin !== -1 && end !== -1 && end > begin) {
      const before  = body.slice(0, begin).replace(/\n+$/, '\n');
      const after   = body.slice(end + OPENCODE_AGENTS_END.length).replace(/^\n+/, '\n');
      const updated = (before + after).trim();
      if (updated) writeFileSync(agentsMd, updated + '\n', { mode: 0o644 });
      else try { unlinkSync(agentsMd); } catch (_) {}
    }
  }

  ok('opencode — uninstalled');
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
const yes        = args.includes('--yes') || args.includes('-y');
const onlyIdx    = args.indexOf('--only');
const onlyIds    = onlyIdx !== -1 ? new Set(args[onlyIdx + 1]?.split(',') ?? []) : null;

const opts = { dry, force };

log(dry ? '\n🔍 plugin-architect installer — dry run\n' : '\n🔌 plugin-architect installer\n');

let acted = 0;

// Collect detected providers
const detected = [];
for (const provider of PROVIDERS) {
  if (onlyIds && !onlyIds.has(provider.id)) continue;
  if (provider.soft && !onlyIds?.has(provider.id)) continue;
  if (!onlyIds?.has(provider.id) && !detectMatch(provider.detect)) continue;
  detected.push(provider);
}

if (detected.length === 0) {
  log('  No supported agents detected.');
  log('  Use --only <id> to target a specific agent (e.g. --only opencode,codex).');
  log('  Supported ids: claude, gemini, opencode, codex, copilot');
  log('\n✅ Done.\n');
  process.exit(0);
}

// Interactive confirmation (skip when --only, --yes, --uninstall, or non-TTY)
const confirmed = [];
const interactive = !onlyIds && !uninstall && !yes && process.stdout.isTTY;

if (interactive) {
  log('Detected:\n');
  for (const p of detected) log(`  • ${p.label}`);
  log('');
  for (const p of detected) {
    process.stdout.write(`  Install for ${p.label}? [Y/n] `);
    let ans = '';
    try {
      const fd  = existsSync('/dev/tty') ? fs.openSync('/dev/tty', 'r') : null;
      if (fd !== null) {
        const buf = Buffer.alloc(64);
        const n   = fs.readSync(fd, buf, 0, 64);
        fs.closeSync(fd);
        ans = buf.slice(0, n).toString().trim().toLowerCase();
      }
    } catch { ans = ''; }
    process.stdout.write('\n');
    if (ans === '' || ans === 'y' || ans === 'yes') confirmed.push(p);
  }
  log('');
} else {
  confirmed.push(...detected);
}

for (const provider of confirmed) {
  acted++;

  if (uninstall) {
    if (provider.id === 'claude')   { uninstallClaude(opts);   continue; }
    if (provider.id === 'gemini')   { uninstallGemini(opts);   continue; }
    if (provider.id === 'codex')    { uninstallCodex(opts);    continue; }
    if (provider.id === 'opencode') { uninstallOpencode(opts); continue; }
    if (provider.profile)           { uninstallViaSkills(provider, opts); continue; }
    continue;
  }

  if (provider.id === 'claude')   { installClaude(opts);   continue; }
  if (provider.id === 'gemini')   { installGemini(opts);   continue; }
  if (provider.id === 'codex')    { installCodex(opts);    continue; }
  if (provider.id === 'opencode') { installOpencode(opts); continue; }
  if (provider.id === 'openclaw') { installOpenclaw(opts); continue; }
  if (provider.profile)           { installViaSkills(provider, opts); continue; }
}

if (acted === 0 && confirmed.length === 0 && detected.length > 0) {
  log('  No tools selected. Nothing installed.');
}

log('\n✅ Done.\n');
