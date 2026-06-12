import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_PATH = join(__dirname, '../../rules/plugin-architect-activate.md');

function readRules() {
  try {
    return readFileSync(RULES_PATH, 'utf-8').trim();
  } catch {
    return '# Plugin Architect\n\nRun build-plugin skill to generate a custom plugin for this project.';
  }
}

export default {
  name: 'plugin-architect',

  hooks: {
    'session.created': async () => {
      return { context: readRules() };
    },

    'tui.prompt.append': async () => {
      return null;
    },
  },
};
