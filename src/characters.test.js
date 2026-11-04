import test from 'node:test';
import assert from 'node:assert/strict';
import {characters,getCharacter,restoreCharacters,purchaseCharacter,equipCharacter,isCharacterId,roomCoinGain} from './characters.js';

test('akun lama mendapat Raka gratis dan pilihan karakter yang valid',()=>{
  assert.deepEqual(restoreCharacters({}),{ownedCharacters:['classic'],selectedCharacter:'classic'});
  assert.deepEqual(restoreCharacters({ownedCharacters:['neon','neon','unknown'],selectedCharacter:'unknown'}),{ownedCharacters:['classic','neon'],selectedCharacter:'classic'});
  assert.equal(isCharacterId('sunset'),true);
  assert.equal(isCharacterId('unknown'),false);
});

test('pembelian karakter memotong koin satu kali dan tersimpan sebagai pilihan',()=>{
  const progress={coins:50,...restoreCharacters({})};
  const bought=purchaseCharacter(progress,'neon');
  assert.equal(bought.coins,50-getCharacter('neon').price);
  assert.deepEqual(bought.ownedCharacters,['classic','neon']);
  assert.equal(bought.selectedCharacter,'neon');
  assert.equal(purchaseCharacter(bought,'neon'),bought);
  assert.equal(purchaseCharacter(progress,'sunset'),progress);
  assert.equal(characters.length,3);
  assert.equal(new Set(characters.map(character=>character.sprite)).size,3);
});

test('hanya karakter yang sudah dibeli yang bisa dipakai',()=>{
  const progress={coins:50,...restoreCharacters({ownedCharacters:['neon'],selectedCharacter:'classic'})};
  assert.equal(equipCharacter(progress,'sunset'),progress);
  assert.equal(equipCharacter(progress,'neon').selectedCharacter,'neon');
});

test('koin multiplayer masuk saldo lokal satu kali per kenaikan skor',()=>{
  assert.equal(roomCoinGain({code:null,coins:0},'ABC123',5),5);
  assert.equal(roomCoinGain({code:'ABC123',coins:5},'ABC123',5),0);
  assert.equal(roomCoinGain({code:'ABC123',coins:5},'ABC123',15),10);
  assert.equal(roomCoinGain({code:'ABC123',coins:15},'XYZ789',0),0);
});
