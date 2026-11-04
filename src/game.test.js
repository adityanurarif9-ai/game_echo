import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,isCorrect,getEnding,coinTrails,energyTrails,tierPlatforms,finalPlatforms,floorHeightAt,canEnterAtHeight,movementLimit,advanceVira,catchesVira,beeHitsPlayer} from './game.js';
import {MAX_STAMINA,stepStamina,rewardStamina,pickupStamina} from './stamina.js';
test('four levels contain three document-based decryption puzzles each',()=>{
  assert.equal(levels.length,4);
  assert.deepEqual(levels.map(level=>level.puzzles.length),[3,3,3,3]);
  assert.ok(levels[3].puzzles[2].prompt.includes('45, −83'));
});
test('typed answers accept intended formats without accepting wrong calculations',()=>{
  const expected=[['1','ORANG','HILANG'],['TEMUKAN','12','KUNCI'],['CARI KUNCI','DI DEPAN','MENGHILANG'],['MASIH MENCARI','DIMANA','KUNCI ADA DI SINI']];
  expected.forEach((answers,level)=>answers.forEach((answer,index)=>{
    assert.ok(isCorrect(levels[level].puzzles[index],` ${answer.toLowerCase()} `));
    assert.equal(isCorrect(levels[level].puzzles[index],'jawaban salah'),false);
  }));
});
test('corrected ciphertext and signed letter codes decode to the documented answers',()=>{
  const decode=(numbers,inverse)=>numbers.map(number=>{
    const value=inverse(number);
    assert.ok(Number.isInteger(value));
    if(value===0)return ' ';
    assert.ok(Math.abs(value)>=1&&Math.abs(value)<=26);
    return String.fromCharCode((value>0?64:96)+Math.abs(value));
  }).join('');
  assert.equal(decode([119,29,77,125,65,5,83],y=>(y+1)/6),'TEMUKAN');
  assert.equal(decode([11,-1,-52,-25,2,-31,-61,-40,-7,-25],y=>(y-2)/3),'Cari kunci');
  assert.equal(decode([45,-83,-55,-11,-35,1,5,-15,-3,1,17,-35,1,77,-35,-55,-35],y=>(y-1)/4),'Kunci Ada Di Sini');
});
test('true, neutral and bad endings depend on evidence, accuracy and escape',()=>{
  assert.equal(getEnding({dossiers:4,mistakes:3,escaped:true}),'true');
  assert.equal(getEnding({dossiers:4,mistakes:4,escaped:true}),'neutral');
  assert.equal(getEnding({dossiers:3,mistakes:0,escaped:true}),'neutral');
  assert.equal(getEnding({dossiers:4,mistakes:0,escaped:false}),'bad');
});
test('lari cepat menghabiskan energi, berhenti untuk pulih, jawaban benar menambah energi',()=>{
  let state={energy:MAX_STAMINA,exhausted:false};
  for(let tick=0;tick<150&&!state.exhausted;tick++)state=stepStamina(state.energy,state.exhausted,true,true);
  assert.equal(state.energy,0);
  assert.equal(state.exhausted,true);
  assert.equal(stepStamina(state.energy,state.exhausted,true,true).running,false);
  for(let tick=0;tick<80;tick++)state=stepStamina(state.energy,state.exhausted,false,false);
  assert.ok(state.energy>=19&&state.energy<22);
  assert.equal(stepStamina(state.energy,state.exhausted,true,true).running,false);
  const restored=rewardStamina(state.energy);
  assert.ok(restored>state.energy);
  assert.equal(stepStamina(restored,false,true,true).running,true);
  assert.equal(rewardStamina(95),MAX_STAMINA);
});
test('level three stairs require jumping and its coins follow reachable heights',()=>{
  assert.equal(tierPlatforms.length,4);
  assert.equal(floorHeightAt(2,42),32);
  assert.equal(floorHeightAt(2,67),96);
  assert.equal(floorHeightAt(1,67),0);
  assert.equal(canEnterAtHeight(2,42,0),false);
  assert.equal(canEnterAtHeight(2,42,40),true);
  assert.ok(tierPlatforms.every((step,index)=>index===0||step.height-tierPlatforms[index-1].height<=32));
  assert.equal(levels[2].map.scanners.length,2,'dua laser tetap ada');
  assert.ok(levels[2].map.scanners[1]-levels[2].map.scanners[0]>=30,'laser cukup berjauhan');
  assert.deepEqual(coinTrails.map(trail=>trail.length),[7,7,7,7]);
  for(const coin of coinTrails[2])assert.ok(coin.height-floorHeightAt(2,coin.x)<=30);
});

test('lebah level tiga hanya mengenai lompatan dekat saat aktif',()=>{
  assert.equal(beeHitsPlayer(false,58,136,58),false);
  assert.equal(beeHitsPlayer(true,58,96,58),false);
  assert.equal(beeHitsPlayer(true,56,136,58),false);
  assert.equal(beeHitsPlayer(true,57.3,136,58),false);
  assert.equal(beeHitsPlayer(true,58,136,58),true);
});
test('Vira waits before a separate exit and final chase uses elevated platforms',()=>{
  for(const level of levels){
    assert.ok(level.map.entrance<level.map.npc);
    assert.ok(level.map.terminal<level.map.caches[level.map.hidden].x,'kunci berada setelah terminal agar pemain tidak bolak-balik');
    assert.ok(level.map.caches[level.map.hidden].x<level.map.door);
    assert.ok(movementLimit(level.map,false)<level.map.door);
    assert.equal(movementLimit(level.map,true),level.map.door);
    assert.ok(level.map.vira>level.map.npc);
    assert.ok(level.map.door>level.map.vira);
    assert.ok(level.map.door>=95);
  }
  assert.equal(finalPlatforms.length,5);
  assert.equal(floorHeightAt(3,56),88);
  assert.equal(floorHeightAt(3,63),128);
  assert.equal(floorHeightAt(3,97),0);
  assert.equal(canEnterAtHeight(3,63,0),false);
  for(const coin of coinTrails[3])assert.ok(coin.height-floorHeightAt(3,coin.x)<=30);
  assert.equal(catchesVira(80,0,80),false);
  let rakaX=59,viraX=levels[3].map.vira,caught=false;
  for(let tick=0;tick<150;tick++){
    rakaX+=.32;viraX=advanceVira(viraX);
    if(catchesVira(rakaX,floorHeightAt(3,rakaX),viraX)){caught=true;break}
  }
  assert.equal(caught,true,'Raka yang mengejar harus bisa menyusul Vira sebelum ujung peta');
});

test('energy cells refill stamina and sit on reachable paths',()=>{
  assert.equal(pickupStamina(10),40);
  assert.equal(pickupStamina(85),MAX_STAMINA);
  assert.deepEqual(energyTrails.map(trail=>trail.length),[2,2,3,3]);
  energyTrails.forEach((trail,level)=>trail.forEach(cell=>{
    assert.ok(cell.x>levels[level].map.entrance&&cell.x<levels[level].map.door);
    assert.ok(cell.height-floorHeightAt(level,cell.x)<=30);
  }));
});
