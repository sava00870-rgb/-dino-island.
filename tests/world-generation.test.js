import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/world-generation.js';

test('world terrain is deterministic for the same seed', () => {
 const a=createWorld('island-1'), b=createWorld('island-1');
 assert.equal(a.sampleHeight(12.5,-7.25),b.sampleHeight(12.5,-7.25));
 assert.equal(a.sampleBiome(12.5,-7.25),b.sampleBiome(12.5,-7.25));
});

test('terrain has meaningful elevation variation and remains finite', () => {
 const world=createWorld('terrain');
 const values=[]; for(let x=-80;x<=80;x+=8) for(let z=-80;z<=80;z+=8) if(world.isLand(x,z)) values.push(world.sampleHeight(x,z));
 assert.ok(values.every(Number.isFinite));
 assert.ok(Math.max(...values)-Math.min(...values)>5);
});

test('biome sampler returns multiple recognizable zones', () => {
 const world=createWorld('biomes');
 const found=new Set(); for(let x=-90;x<=90;x+=5) for(let z=-90;z<=90;z+=5) if(world.isLand(x,z)) found.add(world.sampleBiome(x,z));
 assert.ok(found.size>=4,`only ${found.size} biomes found`);
});

test('land boundary excludes deep ocean and includes safe center', () => {
 const world=createWorld('bounds');
 assert.equal(world.isLand(0,0),true);
 assert.equal(world.isLand(150,0),false);
 assert.equal(world.isLand(0,150),false);
});