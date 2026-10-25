import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import WebSocket from 'ws';
import {attachRooms} from './rooms.js';

function inbox(socket){
  const pending=[];
  const waiters=[];
  socket.on('message',raw=>{
    const message=JSON.parse(raw.toString());
    const match=waiters.findIndex(item=>item.check(message));
    if(match!==-1)waiters.splice(match,1)[0].resolve(message);
    else pending.push(message);
  });
  return check=>{
    const match=pending.findIndex(check);
    if(match!==-1)return Promise.resolve(pending.splice(match,1)[0]);
    return new Promise((resolve,reject)=>{
      const waiter={check,resolve};waiters.push(waiter);
      setTimeout(()=>{const at=waiters.indexOf(waiter);if(at!==-1){waiters.splice(at,1);reject(new Error('Room message timed out'))}},3000).unref();
    });
  };
}

test('two laptops share movement, puzzle progress, evidence and unlocked level',async t=>{
  const http=createServer();attachRooms(http);http.listen(0,'127.0.0.1');await once(http,'listening');
  t.after(()=>http.close());
  const url=`ws://127.0.0.1:${http.address().port}/echo-room`;
  const host=new WebSocket(url);const guest=new WebSocket(url);
  t.after(()=>{host.close();guest.close()});
  const hostNext=inbox(host);const guestNext=inbox(guest);
  await Promise.all([once(host,'open'),once(guest,'open')]);
  host.send(JSON.stringify({type:'create'}));
  const welcome=await hostNext(message=>message.type==='welcome');
  assert.equal(welcome.role,'host');
  assert.equal(welcome.code.length,6);
  guest.send(JSON.stringify({type:'join',code:welcome.code}));
  assert.equal((await guestNext(message=>message.type==='welcome')).role,'guest');
  await hostNext(message=>message.type==='state'&&message.players.guest);
  host.send(JSON.stringify({type:'start',level:0}));
  assert.equal((await guestNext(message=>message.type==='state'&&message.phase==='game')).level,0);
  guest.send(JSON.stringify({type:'pause'}));
  assert.equal((await hostNext(message=>message.type==='state'&&message.paused)).paused,true);
  host.send(JSON.stringify({type:'move',x:73,direction:'right',walking:true}));
  host.send(JSON.stringify({type:'resume'}));
  assert.equal((await hostNext(message=>message.type==='state'&&message.paused===false)).positions.host.x,9);
  host.send(JSON.stringify({type:'move',x:73,direction:'right',walking:true}));
  assert.equal((await guestNext(message=>message.type==='state'&&message.positions.host.x===73)).positions.host.walking,true);
  for(const [index,answer] of ['1','ORANG','HILANG'].entries()){
    host.send(JSON.stringify({type:'solve',answer}));
    assert.equal((await guestNext(message=>message.type==='state'&&message.puzzleIndex===index&&message.correct)).correct,true);
    host.send(JSON.stringify({type:'advance'}));
    assert.equal((await guestNext(message=>message.type==='state'&&message.puzzleIndex===index+1)).puzzleIndex,index+1);
  }
  guest.send(JSON.stringify({type:'move',x:89,direction:'right',walking:false}));
  await guestNext(message=>message.type==='state'&&message.positions.guest.x===89);
  guest.send(JSON.stringify({type:'collect'}));
  assert.equal((await hostNext(message=>message.type==='state'&&message.collected)).collected,true);
  host.send(JSON.stringify({type:'move',x:3,direction:'left',walking:false}));
  await hostNext(message=>message.type==='state'&&message.positions.host.x===3);
  host.send(JSON.stringify({type:'clear'}));
  const cleared=await guestNext(message=>message.type==='state'&&message.phase==='select'&&message.unlocked===1);
  assert.deepEqual(cleared.completed,[0]);
  host.send(JSON.stringify({type:'start',level:1}));
  await guestNext(message=>message.type==='state'&&message.phase==='game'&&message.level===1);
  guest.send(JSON.stringify({type:'menu'}));
  assert.equal((await hostNext(message=>message.type==='state'&&message.phase==='select'&&message.level===1)).paused,false);
});
