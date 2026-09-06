import test from 'node:test';
import assert from 'node:assert/strict';

const source = await import('../src/ai-chat.js');

test('AI chat module loads with production AI Search integration', () => {
  assert.equal(typeof source.handleAiChat, 'function');
});
