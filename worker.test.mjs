import test from 'node:test';
import assert from 'node:assert/strict';

const responses = [];
globalThis.self = { postMessage: (message) => responses.push(message) };
await import('./worker.js');

function run(pattern, text) {
  responses.length = 0;
  globalThis.self.onmessage({ data: { id: 1, pattern, flags: 'g', text, replacement: 'x' } });
  assert.equal(responses.length, 1);
  return responses[0];
}

test('exactly 1,000 matches are not reported as truncated', () => {
  const result = run('a', 'a'.repeat(1_000));
  assert.equal(result.ok, true);
  assert.equal(result.matches.length, 1_000);
  assert.equal(result.capped, false);
});

test('more than 1,000 matches are reported as truncated', () => {
  const result = run('a', 'a'.repeat(1_001));
  assert.equal(result.ok, true);
  assert.equal(result.matches.length, 1_000);
  assert.equal(result.capped, true);
});
