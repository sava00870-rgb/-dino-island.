import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCircleMovement } from '../src/collision.js';

test('free movement stays unchanged when no obstacles are present', () => {
 const result=resolveCircleMovement({x:0,z:0},{x:2,z:1},0.5,[],{radius:10});
 assert.ok(Math.abs(result.position.x-2)<1e-9&&Math.abs(result.position.z-1)<1e-9);
 assert.equal(result.collided,false);
});

test('circle blocker prevents overlap and allows sliding along it', () => {
 const result=resolveCircleMovement({x:0,z:0},{x:3,z:1},0.5,[{type:'circle',x:2,z:0,radius:0.7}],{radius:10});
 assert.ok(Math.hypot(result.position.x-2,result.position.z)>=1.19);
 assert.ok(result.position.z>0.5);
 assert.equal(result.collided,true);
});

test('axis-aligned box blocks the player', () => {
 const result=resolveCircleMovement({x:0,z:0},{x:3,z:0},0.5,[{type:'aabb',minX:1,minZ:-1,maxX:2,maxZ:1}],{radius:10});
 assert.ok(result.position.x<=0.51);
 assert.equal(result.collided,true);
});

test('island boundary prevents leaving land circle', () => {
 const result=resolveCircleMovement({x:8,z:0},{x:5,z:0},0.5,[],{radius:10});
 assert.ok(Math.hypot(result.position.x,result.position.z)<=9.500001);
 assert.equal(result.collided,true);
});

test('diagonal movement cannot tunnel through a thin blocker', () => {
 const result=resolveCircleMovement({x:0,z:0},{x:4,z:4},0.4,[{type:'aabb',minX:1.5,minZ:1.5,maxX:1.7,maxZ:1.7}],{radius:20});
 assert.ok(!(result.position.x>1.11 && result.position.z>1.11));
 assert.equal(result.collided,true);
});