import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeSave, parseSave } from '../src/save-system.js';

test('save round-trips versioned player, inventory and structures',()=>{
 const input={player:{x:4,z:8,hp:90},inventory:{wood:5},structures:[{id:'wall-1',x:1,z:2}],seed:'island'};
 const loaded=parseSave(serializeSave(input));
 assert.equal(loaded.ok,true);assert.equal(loaded.data.player.x,4);assert.equal(loaded.data.inventory.wood,5);assert.equal(loaded.data.structures.length,1);
});

test('malformed save returns safe defaults instead of throwing',()=>{
 const result=parseSave('{not valid');
 assert.equal(result.ok,false);assert.deepEqual(result.data.structures,[]);assert.equal(result.data.inventory.wood,0);
});

test('unsupported future save version is rejected safely',()=>{
 const result=parseSave(JSON.stringify({version:999,data:{}}));
 assert.equal(result.ok,false);
});