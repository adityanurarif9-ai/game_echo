import {randomBytes} from 'node:crypto';
import {networkInterfaces} from 'node:os';
import {WebSocket,WebSocketServer} from 'ws';
import {levels,isCorrect} from '../src/game.js';

const rooms=new Map();
const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const clamp=value=>Math.max(3,Math.min(97,Number(value)||9));
const send=(socket,data)=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(data))};
const racer=()=>({puzzleIndex:0,correct:false,collected:false,restartCount:0,mistakes:0,coins:0,puzzleStartedAt:null});
const position=x=>({x,direction:'right',walking:false,running:false});

function code(){
  let value;
  do{value=[...randomBytes(6)].map(byte=>letters[byte%letters.length]).join('')}while(rooms.has(value));
  return value;
}

function localAddress(){
  const addresses=Object.entries(networkInterfaces()).flatMap(([name,entries])=>(entries||[])
    .filter(entry=>entry.family==='IPv4'&&!entry.internal)
    .map(entry=>({name,address:entry.address})));
  const physical=addresses.filter(entry=>!/virtual|vbox|vmware|vEthernet|docker|wsl|hyper-v/i.test(entry.name));
  return (physical.find(entry=>/wi-?fi|wireless|wlan/i.test(entry.name))||physical[0]||addresses[0])?.address||null;
}

function snapshot(room,role){
  const self=room.racers[role];
  return {type:'state',code:room.code,phase:room.phase,paused:room.paused,level:room.level,unlocked:room.unlocked,
    completed:room.completed,puzzleIndex:self.puzzleIndex,correct:self.correct,collected:self.collected,restartCount:self.restartCount,
    mistakes:self.mistakes,coins:self.coins,scores:{host:room.racers.host.coins,guest:room.racers.guest.coins},winner:room.winner,ending:room.ending,
    players:{host:Boolean(room.host),guest:Boolean(room.guest)},positions:room.positions};
}
function broadcast(room){
  send(room.host,snapshot(room,'host'));send(room.guest,snapshot(room,'guest'));
}

export function attachRooms(httpServer){
  const wss=new WebSocketServer({noServer:true});
  httpServer.on('upgrade',(request,socket,head)=>{
    if(new URL(request.url,'http://localhost').pathname!=='/echo-room')return;
    wss.handleUpgrade(request,socket,head,ws=>wss.emit('connection',ws,request));
  });
  wss.on('connection',(socket,request)=>{
    let room=null;
    let role=null;
    socket.on('message',raw=>{
      let message;
      try{message=JSON.parse(raw.toString())}catch{return}
      if(!message||typeof message.type!=='string')return;
      if(message.type==='create'&&!room){
        room={code:code(),host:socket,guest:null,phase:'select',paused:false,level:0,unlocked:0,completed:[],ending:null,winner:null,
          racers:{host:racer(),guest:racer()},positions:{host:position(9),guest:position(7)}};
        rooms.set(room.code,room);role='host';
        const port=Number(request.headers.host?.split(':').at(-1))||5175;
        const lan=localAddress();
        send(socket,{type:'welcome',role,code:room.code,lanUrl:lan?`http://${lan}:${port}/?room=${room.code}`:null});
        broadcast(room);return;
      }
      if(message.type==='join'&&!room){
        const target=rooms.get(String(message.code||'').toUpperCase().trim());
        if(!target){send(socket,{type:'error',message:'Kode ruang tidak ditemukan.'});return}
        if(target.guest){send(socket,{type:'error',message:'Ruang ini sudah penuh.'});return}
        room=target;role='guest';room.guest=socket;
        send(socket,{type:'welcome',role,code:room.code});broadcast(room);return;
      }
      if(!room)return;
      const self=room.racers[role];
      if(message.type==='start'&&role==='host'){
        const index=Number(message.level);
        if(!room.guest){send(socket,{type:'error',message:'Tunggu pemain kedua bergabung dulu.'});return}
        if(!Number.isInteger(index)||index<0||index>room.unlocked)return;
        room.phase='game';room.paused=false;room.level=index;room.ending=null;room.winner=null;
        for(const player of Object.values(room.racers))Object.assign(player,{puzzleIndex:0,correct:false,collected:false,puzzleStartedAt:null});
        room.positions={host:position(9),guest:position(7)};
        broadcast(room);return;
      }
      if(message.type==='menu'&&room.phase!=='select'){
        room.phase='select';room.paused=false;broadcast(room);return;
      }
      if(room.phase!=='game')return;
      if(message.type==='pause'||message.type==='resume'){
        room.paused=message.type==='pause';
        for(const player of Object.values(room.positions)){player.walking=false;player.running=false}
        broadcast(room);return;
      }
      if(room.paused)return;
      if(message.type==='fail'){
        self.mistakes++;self.restartCount++;
        Object.assign(self,{puzzleIndex:0,correct:false,collected:false,puzzleStartedAt:null});
        room.positions[role]=position(role==='host'?9:7);
        broadcast(room);return;
      }
      if(message.type==='restart'){
        self.restartCount++;
        Object.assign(self,{puzzleIndex:0,correct:false,collected:false,puzzleStartedAt:null});
        room.positions[role]=position(role==='host'?9:7);
        broadcast(room);return;
      }
      if(message.type==='mistake'){
        self.mistakes++;broadcast(room);return;
      }
      if(message.type==='move'){
        room.positions[role]={x:clamp(message.x),direction:message.direction==='left'?'left':'right',walking:Boolean(message.walking),running:Boolean(message.running)};
        if(self.puzzleIndex===0&&self.puzzleStartedAt===null&&Math.abs(room.positions[role].x-levels[room.level].map.terminal)<3.2)self.puzzleStartedAt=Date.now();
        broadcast(room);return;
      }
      if(message.type==='solve'&&!self.correct){
        const puzzle=levels[room.level].puzzles[self.puzzleIndex];
        if(puzzle&&isCorrect(puzzle,String(message.answer||'').slice(0,80))){
          self.correct=true;
          self.coins+=10+Math.max(0,20-Math.floor((Date.now()-(self.puzzleStartedAt??Date.now()))/3000));
          broadcast(room);
        }
        else send(socket,{type:'wrong',message:'Kode belum cocok. Periksa rumusnya lagi.'});
        return;
      }
      if(message.type==='advance'&&self.correct){
        self.puzzleIndex=Math.min(3,self.puzzleIndex+1);self.correct=false;self.puzzleStartedAt=Date.now();broadcast(room);return;
      }
      if(message.type==='collect'&&!self.collected&&self.puzzleIndex===3){
        const hidden=levels[room.level].map.caches[levels[room.level].map.hidden].x;
        if(Math.abs(room.positions[role].x-hidden)<3.2){self.collected=true;self.coins+=15;broadcast(room)}
        return;
      }
      if(message.type==='clear'&&self.collected){
        if(Math.abs(room.positions[role].x-levels[room.level].map.door)>=3.2)return;
        room.winner=role;self.coins+=50;
        if(!room.completed.includes(room.level))room.completed.push(room.level);
        room.unlocked=Math.min(levels.length-1,Math.max(room.unlocked,room.level+1));
        if(room.level===levels.length-1){room.phase='ending';room.ending='true'}
        else room.phase='select';
        broadcast(room);
      }
    });
    socket.on('close',()=>{
      if(!room)return;
      if(role==='host'){
        send(room.guest,{type:'roomClosed',message:'Pembuat ruang keluar. Buat ruang baru untuk melanjutkan.'});
        room.guest?.close();rooms.delete(room.code);
      }else if(room.guest===socket){room.guest=null;room.paused=false;room.positions.guest=position(7);broadcast(room)}
    });
  });
  return wss;
}
