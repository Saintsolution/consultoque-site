import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const temp = await mkdtemp(join(tmpdir(), 'consultoque-tests-'));
try {
  await build({ entryPoints: ['tests/unificacao.test.ts'], outfile: join(temp, 'test.mjs'), bundle: true,
    platform: 'node', format: 'esm', define: { 'import.meta.env': '{}' }, packages: 'external' });
  const result = spawnSync(process.execPath, ['--test', join(temp, 'test.mjs')], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally { await rm(temp, { recursive: true, force: true }); }
