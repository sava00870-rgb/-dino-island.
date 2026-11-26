import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('inline browser scripts in index.html are valid JavaScript', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const scripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)]
    .filter(([, attributes]) => !/\\bsrc\\s*=/.test(attributes));
  assert.ok(scripts.length >= 2, 'expected the boot fallback and game module scripts');
  for (const [, attributes, source] of scripts) {
    const isModule = /\\btype\\s*=\\s*["']module["']/i.test(attributes);
    const args = ['--check', ...(isModule ? ['--input-type=module'] : [])];
    const result = spawnSync(process.execPath, args, { input: source, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout || 'inline script syntax check failed');
  }
});
