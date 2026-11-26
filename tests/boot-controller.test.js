import test from 'node:test';
import assert from 'node:assert/strict';
import { createBootController } from '../src/boot-controller.js';

test('boot reaches ready only after scene initialization succeeds', () => {
  const states = [];
  const boot = createBootController({ initialize: () => ({ renderer: true }), onState: state => states.push(state) });
  assert.deepEqual(boot.initialize(), { renderer: true });
  assert.equal(boot.state, 'ready');
  assert.deepEqual(states, ['loading', 'ready']);
});

test('missing Three.js or renderer failure leaves a recoverable error state', () => {
  const states = [];
  const boot = createBootController({ initialize: () => { throw new Error('WebGL unavailable'); }, onState: state => states.push(state) });
  assert.equal(boot.initialize(), false);
  assert.equal(boot.state, 'error');
  assert.match(boot.error.message, /WebGL unavailable/);
  assert.deepEqual(states, ['loading', 'error']);
});

test('start is refused before ready and duplicate starts are refused', () => {
  const boot = createBootController({ initialize: () => ({}) });
  assert.equal(boot.start(), false);
  assert.deepEqual(boot.initialize(), {});
  assert.equal(boot.start(), true);
  assert.equal(boot.start(), false);
  boot.stop();
  assert.equal(boot.start(), true);
});
