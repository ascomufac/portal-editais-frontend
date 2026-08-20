#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hooksPath = join(root, '.githooks');

if (!existsSync(join(hooksPath, 'post-commit'))) {
  console.warn('[setup-git-hooks] .githooks/post-commit não encontrado');
  process.exit(0);
}

try {
  chmodSync(join(hooksPath, 'post-commit'), 0o755);
} catch {
  // ignore on Windows
}

try {
  execSync('git rev-parse --is-inside-work-tree', {
    cwd: root,
    stdio: 'ignore',
  });
  execSync('git config core.hooksPath .githooks', { cwd: root, stdio: 'ignore' });
  console.log('[setup-git-hooks] core.hooksPath=.githooks');
} catch {
  // npm install fora de um clone git
}
