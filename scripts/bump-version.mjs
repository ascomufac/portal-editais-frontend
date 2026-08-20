#!/usr/bin/env node
/**
 * Bump semver (tag vX.Y.Z + package.json) a partir da mensagem do último commit.
 * Uso: node scripts/bump-version.mjs [--from-hook]
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const fromHook = process.argv.includes('--from-hook');
const isMain =
  Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === process.argv[1];

const run = (cmd, opts = {}) =>
  execSync(cmd, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  }).trim();

const tryRun = (cmd) => {
  try {
    return run(cmd);
  } catch {
    return '';
  }
};

function main() {
  if (process.env.SKIP_VERSION_BUMP === '1') {
    return;
  }

  const branch = tryRun('git rev-parse --abbrev-ref HEAD');
  if (fromHook && branch && branch !== 'main' && branch !== 'master') {
    return;
  }

  const msg = tryRun('git log -1 --pretty=%B');
  if (!msg || msg.includes('[skip version]')) {
    return;
  }

  // Evita reentrância / amend de merge
  const parents = tryRun('git rev-list --parents -n 1 HEAD').split(/\s+/);
  if (parents.length > 2) {
    return;
  }

  const headSha = tryRun('git rev-parse HEAD');
  const tagsOnHead = tryRun(`git tag --points-at ${headSha}`)
    .split('\n')
    .filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
  if (tagsOnHead.length > 0) {
    return;
  }

  const lastTag =
    tryRun('git describe --tags --abbrev=0 --match "v*" 2>/dev/null') || 'v0.0.0';
  const match = lastTag.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  let major = match ? Number(match[1]) : 0;
  let minor = match ? Number(match[2]) : 0;
  let patch = match ? Number(match[3]) : 0;

  const firstLine = msg.split('\n')[0] || '';
  const body = msg.slice(firstLine.length);
  const isBreaking =
    /BREAKING CHANGE/i.test(body) ||
    /^(feat|fix|perf|refactor)(\(.+\))?!:/.test(firstLine);

  let bump = 'patch';
  if (isBreaking) bump = 'major';
  else if (/^feat(\(.+\))?:/.test(firstLine)) bump = 'minor';
  else if (/^(fix|perf|refactor)(\(.+\))?:/.test(firstLine)) bump = 'patch';

  if (bump === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  const version = `${major}.${minor}.${patch}`;
  const tag = `v${version}`;

  const pkgPath = join(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  if (fromHook) {
    try {
      run('git add package.json');
      run('git commit --amend --no-edit --no-verify');
    } catch {
      console.warn('[bump-version] não foi possível amend; tag será no HEAD atual');
    }
  }

  const subject = firstLine.slice(0, 72);
  try {
    run(`git tag -a ${tag} -m "Release ${tag}: ${subject.replace(/"/g, '')}"`);
    console.log(`[bump-version] ${tag} (${bump})`);
  } catch (err) {
    console.warn(`[bump-version] falha ao criar tag ${tag}:`, err?.message || err);
    if (!fromHook) process.exit(1);
  }
}

if (isMain) {
  main();
}
