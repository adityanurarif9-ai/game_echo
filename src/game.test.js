import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,isCorrect,getEnding} from './game.js';
test('four levels contain three document-based decryption puzzles each',()=>{
  assert.equal(levels.length,4);
  assert.deepEqual(levels.map(level=>level.puzzles.length),[3,3,3,3]);
  assert.ok(levels[3].puzzles[2].prompt.includes('45, −83'));
});
test('typed answers accept intended formats without accepting wrong calculations',()=>{
  const expected=[['1','ORANG','HILANG'],['TEMUKAN','12','KUNCI'],['CARI BERKAS','DI DEPAN','MENGHILANG'],['MASIH MENCARI','DIMANA','KUNCI ADA DI SINI']];
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
  assert.equal(decode([11,-1,-52,-25,2,-4,-13,-52,-31,-1,-55],y=>(y-2)/3),'Cari berkas');
  assert.equal(decode([45,-83,-55,-11,-35,1,5,-15,-3,1,17,-35,1,77,-35,-55,-35],y=>(y-1)/4),'Kunci Ada Di Sini');
});
test('true, neutral and bad endings depend on evidence, accuracy and escape',()=>{
  assert.equal(getEnding({dossiers:4,mistakes:3,escaped:true}),'true');
  assert.equal(getEnding({dossiers:4,mistakes:4,escaped:true}),'neutral');
  assert.equal(getEnding({dossiers:3,mistakes:0,escaped:true}),'neutral');
  assert.equal(getEnding({dossiers:4,mistakes:0,escaped:false}),'bad');
});
