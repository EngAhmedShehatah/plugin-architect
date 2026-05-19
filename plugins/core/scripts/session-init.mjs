#!/usr/bin/env node
// SessionStart hook — creates a tmp/<session_id>/ folder for this session.
// Temporary files (plans, summaries, etc.) written during the session go there.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const payload = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

  const { session_id, cwd } = payload;

  if (!session_id) {
    process.stderr.write('[session-init] no session_id in payload\n');
    process.exit(1);
  }

  const sessionDir = join(cwd, 'tmp', session_id);
  mkdirSync(sessionDir, { recursive: true });

  // Sentinel file so any script in this session can resolve the active session dir
  writeFileSync(join(cwd, 'tmp', '.current-session'), session_id);
}

main().catch((e) => {
  process.stderr.write(`[session-init] error: ${e.message}\n`);
  process.exit(1);
});
