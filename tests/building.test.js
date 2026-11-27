import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePlacement, createStructure } from '../src/building.js';

const world={slopeAt:()=>0,overlaps:()=>false,playerDistance:()=>4,hasResources:()=>true};
test('valid placement returns an accepted structure record',()=>{
 const piece={id:'wall',cost:{wood:4},maxSlope:.3};
 assert.equal(validatePlacement(piece,{x:2,z:3,y:0,rotation:0},world).valid,true);
 const s=createStructure('wall',{x:2,z:3,y:0,rotation:0});assert.equal(s.pieceId,'wall');assert.equal(s.x,2);
});

test('placement rejects steep terrain, overlap and insufficient materials',()=>{
 const piece={id:'foundation',cost:{wood:5},maxSlope:.2};
 assert.equal(validatePlacement(piece,{x:0,z:0,y:0}, {...world,slopeAt:()=>.6}).reason,'Слишком крутой склон');
 assert.equal(validatePlacement(piece,{x:0,z:0,y:0}, {...world,overlaps:()=>true}).reason,'Место занято');
 assert.equal(validatePlacement(piece,{x:0,z:0,y:0}, {...world,hasResources:()=>false}).reason,'Не хватает ресурсов');
});

test('placement rejects structures too far from player',()=>{
 const result=validatePlacement({id:'wall',cost:{},maxSlope:.5},{x:20,z:0,y:0}, {...world,playerDistance:()=>20});
 assert.equal(result.valid,false);assert.equal(result.reason,'Слишком далеко');
});