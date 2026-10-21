import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,isCorrect,getEnding} from './game.js';
test('four levels increase from alphabet conversion to inverse composition',()=>{
  assert.equal(levels.length,4);
  assert.deepEqual(levels.map(level=>level.puzzles.length),[3,3,3,3]);
  assert.ok(levels[3].puzzles[2].prompt.includes('q(p(x))'));
});
test('typed answers accept intended formats without accepting wrong calculations',()=>{
  assert.ok(isCorrect(levels[0].puzzles[2],'5 – 3 – 8 – 15'));
  assert.ok(isCorrect(levels[2].puzzles[2],' chief '));
  assert.ok(isCorrect(levels[3].puzzles[2],'8'));
  assert.equal(isCorrect(levels[1].puzzles[1],'43'),false);
});
test('true, neutral and bad endings depend on evidence, accuracy and escape',()=>{
  assert.equal(getEnding({dossiers:4,mistakes:3,escaped:true}),'true');
  assert.equal(getEnding({dossiers:4,mistakes:4,escaped:true}),'neutral');
  assert.equal(getEnding({dossiers:3,mistakes:0,escaped:true}),'neutral');
  assert.equal(getEnding({dossiers:4,mistakes:0,escaped:false}),'bad');
});
