import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { lineAndColumn, validateInput, MAX_TEXT_LENGTH } from './core.mjs';

test('package, changelog and displayed version stay synchronized', async () => {
  const packageJson = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const changelog = (await readFile(new URL('./CHANGELOG.md', import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
  const releaseWorkflow = await readFile(new URL('./.github/workflows/release.yml', import.meta.url), 'utf8');
  assert.ok(html.includes(`MIT License · v${packageJson.version}`));
  assert.ok(changelog.startsWith(`# Changelog\n\n## ${packageJson.version} - `));
  for (const file of ['index.html', 'styles.css', 'app.mjs', 'core.mjs', 'worker.js', 'server.mjs', 'package.json', 'README.md', 'LICENSE']) {
    assert.ok(releaseWorkflow.includes(file), `release archive must include ${file}`);
  }
});

test('accepts normal input and unicode flags', () => {
  assert.equal(validateInput({ pattern: '\\p{Letter}+', flags: 'gu', text: 'Москва' }), null);
});

test('rejects duplicate, invalid and mutually exclusive flags', () => {
  assert.match(validateInput({ pattern: 'a', flags: 'gg' }), /повторяться/);
  assert.match(validateInput({ pattern: 'a', flags: 'z' }), /поддерживаемые/);
  assert.match(validateInput({ pattern: 'a', flags: 'uv' }), /нельзя использовать вместе/);
});

test('enforces size limits', () => {
  assert.match(validateInput({ pattern: 'a', text: 'x'.repeat(MAX_TEXT_LENGTH + 1) }), /200 000/);
  assert.match(validateInput({ pattern: 'x'.repeat(2_001) }), /2 000/);
});

test('maps offsets to one-based line and column', () => {
  assert.deepEqual(lineAndColumn('abc\nxyz', 5), { line: 2, column: 2 });
});
