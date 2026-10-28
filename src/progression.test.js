import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateStars,formatClock,levelTimeLimits} from './progression.js';

test('each level has a countdown and stars reward speed plus remaining lives',()=>{
  assert.deepEqual(levelTimeLimits,[240,210,180,150]);
  assert.equal(formatClock(150),'02:30');
  assert.equal(formatClock(-5),'00:00');
  assert.equal(calculateStars(120,240,3),3);
  assert.equal(calculateStars(119,240,3),2);
  assert.equal(calculateStars(180,240,2),2);
  assert.equal(calculateStars(47,240,3),1);
  assert.equal(calculateStars(200,240,1),1);
});
