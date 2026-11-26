import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgression, addExperience, buySkill } from '../src/progression.js';

test('experience levels up and awards skill points',()=>{
 const p=createProgression();addExperience(p,100);assert.equal(p.level,2);assert.equal(p.skillPoints,1);
});

test('skills spend points once and apply gameplay modifiers',()=>{
 const p=createProgression();addExperience(p,100);assert.equal(buySkill(p,'survival'),true);
 assert.equal(p.modifiers.maxHealth,110);assert.equal(p.skillPoints,0);assert.equal(buySkill(p,'survival'),false);
});

test('experience does not level down and invalid skills are rejected',()=>{
 const p=createProgression();addExperience(p,25);assert.equal(p.level,1);assert.equal(buySkill(p,'unknown'),false);
});