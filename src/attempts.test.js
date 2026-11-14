import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,isCorrect} from './game.js';
import {keyOptions,chooseAttempt,attemptMap,attemptPuzzles} from './attempts.js';

test('setiap percobaan mengganti variasi soal dan tempat kunci yang bisa dijangkau',()=>{
  for(let level=0;level<levels.length;level++){
    const first=chooseAttempt(level,null,()=>0);
    const second=chooseAttempt(level,first,()=>0);
    assert.notEqual(first.variant,second.variant);
    assert.notEqual(first.hidden,second.hidden);
    assert.ok(keyOptions(level).includes(first.hidden));
    assert.ok(attemptMap(level,first.hidden).caches[first.hidden].x>levels[level].map.terminal);
    assert.notEqual(attemptPuzzles(level,first.variant)[0].prompt,attemptPuzzles(level,second.variant)[0].prompt);
  }
});

test('semua kode alternatif memakai rumus yang sesuai dengan jawabannya',()=>{
  for(let level=0;level<levels.length;level++)for(const variant of [0,1,2]){
    const puzzles=attemptPuzzles(level,variant);
    assert.equal(puzzles.length,3);
    puzzles.forEach((puzzle,index)=>{
      assert.ok(isCorrect(puzzle,levels[level].puzzles[index].answers[0]));
      assert.ok(puzzle.formula&&puzzle.hint&&puzzle.example);
      if(variant>0){
        assert.notEqual(puzzle.prompt,levels[level].puzzles[index].prompt);
        const [,factor,sign,offset]=puzzle.prompt.match(/= (\d+)x ([+−]) (\d+)/);
        const a=Number(factor),b=(sign==='−'?-1:1)*Number(offset);
        const decode=value=>{
          const x=(Number(value.replaceAll('−','-'))-b)/a;
          assert.ok(Number.isInteger(x));
          if(x===0)return ' ';
          return String.fromCharCode(64+Math.abs(x));
        };
        if(/cipherteks/.test(puzzle.prompt)){
          const cipher=puzzle.prompt.match(/cipherteks ([0-9−]+)/)[1];
          assert.equal((Number(cipher.replaceAll('−','-'))-b)/a,Number(puzzle.answers[0]));
        }else{
          const values=puzzle.prompt.match(/dekripsi ([0-9−–]+)/)[1].split('–');
          assert.equal(values.map(decode).join(''),puzzle.answers[0].toUpperCase());
        }
      }
    });
  }
});
