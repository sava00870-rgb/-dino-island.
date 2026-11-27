import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventory, addItem, removeItem, craftItem } from '../src/inventory.js';

test('inventory respects stack and slot limits',()=>{
 const inv=createInventory({},3,10);
 assert.deepEqual(addItem(inv,'wood',15),{added:15,remaining:0});
 assert.deepEqual(addItem(inv,'stone',10),{added:10,remaining:0});
 assert.deepEqual(addItem(inv,'fiber',1),{added:0,remaining:1});
});

test('removeItem refuses insufficient quantity without mutating inventory',()=>{
 const inv=createInventory({wood:3});
 assert.equal(removeItem(inv,'wood',4),false);
 assert.equal(inv.items.wood,3);
});

test('craftItem consumes ingredients atomically and adds output',()=>{
 const inv=createInventory({wood:5,stone:3,fiber:2});
 const result=craftItem(inv,{ingredients:{wood:3,stone:2},output:{id:'axe',count:1}});
 assert.equal(result.ok,true);assert.equal(inv.items.wood,2);assert.equal(inv.items.stone,1);assert.equal(inv.items.axe,1);
});

test('craftItem reports missing materials and changes nothing',()=>{
 const inv=createInventory({wood:1});
 const result=craftItem(inv,{ingredients:{wood:2,stone:1},output:{id:'spear',count:1}});
 assert.equal(result.ok,false);assert.deepEqual(inv.items,{wood:1});
});