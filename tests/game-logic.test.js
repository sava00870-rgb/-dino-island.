import test from 'node:test';
import assert from 'node:assert/strict';
import { movementVector, createResourceRecord, resetResourceRecords } from '../src/game-logic.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('forward follows camera heading at cardinal yaw angles', () => {
  for (const [yaw, expectedX, expectedZ] of [
    [0, 0, 1], [Math.PI / 2, 1, 0], [Math.PI, 0, -1], [-Math.PI / 2, -1, 0]
  ]) {
    const v = movementVector(yaw, 1, 0);
    close(v.x, expectedX);
    close(v.z, expectedZ);
  }
});

test('strafe follows camera right vector at cardinal yaw angles', () => {
  for (const [yaw, expectedX, expectedZ] of [
    [0, 1, 0], [Math.PI / 2, 0, -1], [Math.PI, -1, 0], [-Math.PI / 2, 0, 1]
  ]) {
    const v = movementVector(yaw, 0, 1);
    close(v.x, expectedX);
    close(v.z, expectedZ);
  }
});

test('diagonal movement is normalized and zero input stays zero', () => {
  const v = movementVector(0, 1, 1);
  close(Math.hypot(v.x, v.z), 1);
  assert.deepEqual(movementVector(0, 0, 0), { x: 0, z: 0 });
});

test('resource records restore the right mesh instance regardless of group index', () => {
  const writes = [];
  const makeMesh = name => ({ name, setMatrixAt(index, matrix) { writes.push([name, index, matrix]); } });
  const treeMesh = makeMesh('trees');
  const stoneMesh = makeMesh('stones');
  const bushMesh = makeMesh('bushes');
  const crownMesh = makeMesh('crowns');
  const foliageMesh = makeMesh('foliage');
  const records = [
    createResourceRecord({ mesh: treeMesh, index: 0, original: 'tree-transform', linked: [
      { mesh: crownMesh, index: 0, original: 'crown-transform' },
      { mesh: foliageMesh, index: 0, original: 'foliage-transform' }
    ] }),
    createResourceRecord({ mesh: treeMesh, index: 1, original: 'tree2-transform' }),
    createResourceRecord({ mesh: stoneMesh, index: 0, original: 'stone-transform' }),
    createResourceRecord({ mesh: bushMesh, index: 0, original: 'bush-transform' })
  ];
  for (const record of records) record.mesh.setMatrixAt(record.index, 'hidden');
  writes.length = 0;
  resetResourceRecords(records);
  assert.deepEqual(writes, [
    ['trees', 0, 'tree-transform'], ['crowns', 0, 'crown-transform'],
    ['foliage', 0, 'foliage-transform'], ['trees', 1, 'tree2-transform'],
    ['stones', 0, 'stone-transform'], ['bushes', 0, 'bush-transform']
  ]);
});
