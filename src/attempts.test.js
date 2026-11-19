import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,isCorrect} from './game.js';
import {keyOptions,chooseAttempt,attemptMap,attemptPuzzles} from './attempts.js';

test('setiap masuk level membuat angka dan tempat kunci baru',()=>{
  for(let level=0;level<levels.length;level++){
    const first=chooseAttempt(level,null,()=>0);
    const second=chooseAttempt(level,first,()=>0);
    assert.notEqual(first.seed,second.seed);
    assert.notEqual(first.hidden,second.hidden);
    assert.ok(keyOptions(level).includes(first.hidden));
    assert.ok(attemptMap(level,first.hidden).caches[first.hidden].x>levels[level].map.terminal);
    const oldPuzzles=attemptPuzzles(level,first);
    const newPuzzles=attemptPuzzles(level,second);
    assert.ok(oldPuzzles.some((puzzle,index)=>puzzle.prompt!==newPuzzles[index].prompt));
    assert.ok(oldPuzzles.some((puzzle,index)=>puzzle.answers[0]!==newPuzzles[index].answers[0]));
    assert.deepEqual(attemptPuzzles(level,first),oldPuzzles,'soal tetap sama selama satu percobaan');
  }
});

test('semua cipherteks dinamis sesuai rumus dan jawaban termasuk verifikasi angka',()=>{
  for(let level=0;level<levels.length;level++)for(const seed of [0,1,426134,0xffffffff]){
    const puzzles=attemptPuzzles(level,{seed,variant:seed%3});
    assert.equal(puzzles.length,3);
    puzzles.forEach(puzzle=>{
      assert.ok(isCorrect(puzzle,puzzle.answers[0]));
      assert.ok(puzzle.formula&&puzzle.hint&&puzzle.example);
      const [,factor,sign,offset]=puzzle.prompt.match(/= (\d+)x ([+−]) (\d+)/);
      const a=Number(factor),b=(sign==='−'?-1:1)*Number(offset);
      const decodeNumber=value=>{
        const x=(Number(value.replaceAll('−','-'))-b)/a;
        assert.ok(Number.isInteger(x));
        return x;
      };
      if(/cipherteks/.test(puzzle.prompt)){
        const cipher=puzzle.prompt.match(/cipherteks ([0-9−]+)/)[1];
        assert.equal(decodeNumber(cipher),Number(puzzle.answers[0]));
      }else{
        const values=puzzle.prompt.match(/dekripsi ([0-9−–]+)/)[1].split('–');
        const word=values.map(value=>{
          const x=decodeNumber(value);
          return x===0?' ':String.fromCharCode((x>0?64:96)+Math.abs(x));
        }).join('');
        const verification=puzzle.prompt.match(/Kode verifikasi ([0-9−]+)/)[1];
        assert.equal(puzzle.answers[0],`${word} ${decodeNumber(verification)}`);
        assert.equal(isCorrect(puzzle,puzzle.answers[0].toUpperCase()),true,'Caps Lock tetap diterima saat mengetik');
      }
    });
  }
});
