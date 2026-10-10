import test from 'node:test';
import assert from 'node:assert/strict';
import { lineAndColumn, validateInput, MAX_TEXT_LENGTH } from './core.mjs';

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
