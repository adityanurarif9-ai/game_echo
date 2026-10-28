import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {levels,isCorrect,getEnding,coinTrails,tierPlatforms,floorHeightAt,canEnterAtHeight} from './game';
import {createAudio} from './audio';
import {MAX_STAMINA,EXHAUSTION_RECOVERY,stepStamina,rewardStamina} from './stamina';
import {levelTimeLimits,formatClock,calculateStars} from './progression';
import CacheProp from './CacheProp';
import GameGuide from './GameGuide';
import './style.css';
import './cache-props.css';
import './scanner-effects.css';
import './game-over.css';
import './game-hud.css';
import './title-logo.css';
import './guide.css';
import './loading-brand.css';
import './race-features.css';
import './adventure-upgrade.css';
import './mission-results.css';

const HERO_NAME = 'Raka';
const PROGRESS_KEY = 'project-echo-progress-v1';
function readProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');
    const completed=Array.isArray(saved.completed)?saved.completed.filter(value=>Number.isInteger(value)&&value>=0&&value<levels.length):[];
    const stars=levels.map((_,index)=>Math.max(0,Math.min(3,Number(saved.stars?.[index])||0)));
    return {unlocked:Math.max(0,Math.min(levels.length-1,Number(saved.unlocked)||0)),completed:[...new Set(completed)],coins:Math.max(0,Number(saved.coins)||0),stars};
  }catch{return {unlocked:0,completed:[],coins:0,stars:levels.map(()=>0)}}
}

function Sprite({id='r',walking=false,running=false,jumping=false,jumpFrame=2,direction='right',className=''}){
  const [frame,setFrame]=useState(0);
  useEffect(()=>{
    const preload=new Image();preload.src=`/sprites/${id}-hd-sheet.png`;
  },[id]);
  useEffect(()=>{
    if(!walking||jumping){setFrame(0);return}
    const clock=setInterval(()=>setFrame(v=>(v+1)%5),running?78:125);
    return()=>clearInterval(clock);
  },[walking,running,jumping]);
  const row=id==='r'?(jumping?3:running?2:walking?1:0):(walking?1:0);
  const column=id==='r'?(jumping?jumpFrame:walking?frame:0):(walking?frame:0);
  return <div className={`sprite hd-sprite hd-${id} ${className} ${direction==='left'?'face-left':''}`} style={{backgroundPosition:`${column*25}% ${id==='r'?row*100/3:row*100}%`}} aria-hidden="true"/>;
}

function App(){
  const [screen,setScreen]=useState('poster');
  const [loading,setLoading]=useState(false);
  const [pauseOpen,setPauseOpen]=useState(false);
  const [mode,setMode]=useState(null);
  const [room,setRoom]=useState(null);
  const [roomRole,setRoomRole]=useState(null);
  const [roomCode,setRoomCode]=useState('');
  const [roomUrl,setRoomUrl]=useState('');
  const [roomInput,setRoomInput]=useState(new URLSearchParams(location.search).get('room')||'');
  const [roomError,setRoomError]=useState('');
  const [roomConnected,setRoomConnected]=useState(false);
  const [roomConnecting,setRoomConnecting]=useState(false);
  const [roomServerAddress,setRoomServerAddress]=useState(()=>{
    const shared=new URLSearchParams(location.search).get('server');
    try{return shared||localStorage.getItem('echo-room-server')||import.meta.env.VITE_ROOM_SERVER_URL||''}catch{return shared||import.meta.env.VITE_ROOM_SERVER_URL||''}
  });
  const [started,setStarted]=useState(false);
  const [progress,setProgress]=useState(readProgress);
  const [level,setLevel]=useState(0);
  const [x,setX]=useState(9);
  const [walking,setWalking]=useState(false);
  const [running,setRunning]=useState(false);
  const [energy,setEnergy]=useState(MAX_STAMINA);
  const [energyFlash,setEnergyFlash]=useState(false);
  const [elevation,setElevation]=useState(0);
  const [jumping,setJumping]=useState(false);
  const [jumpFrame,setJumpFrame]=useState(2);
  const [coinIds,setCoinIds]=useState([]);
  const [coinBurst,setCoinBurst]=useState(null);
  const [droneX,setDroneX]=useState(57);
  const [direction,setDirection]=useState('right');
  const [dialog,setDialog]=useState(false);
  const [conversationStep,setConversationStep]=useState(null);
  const [conversationSeen,setConversationSeen]=useState(false);
  const [puzzleIndex,setPuzzleIndex]=useState(0);
  const [answer,setAnswer]=useState('');
  const [feedback,setFeedback]=useState(null);
  const [hint,setHint]=useState(false);
  const [showAnswer,setShowAnswer]=useState(false);
  const [health,setHealth]=useState(3);
  const [mistakes,setMistakes]=useState(0);
  const [collected,setCollected]=useState(false);
  const [pickupOpen,setPickupOpen]=useState(false);
  const [levelClear,setLevelClear]=useState(false);
  const [ending,setEnding]=useState(null);
  const [seconds,setSeconds]=useState(levelTimeLimits[0]);
  const [scannerOn,setScannerOn]=useState(false);
  const [help,setHelp]=useState(false);
  const [audioOn,setAudioOn]=useState(true);
  const [fullScreen,setFullScreen]=useState(false);
  const [toast,setToast]=useState('');
  const [hurt,setHurt]=useState(false);
  const [recovering,setRecovering]=useState(false);
  const keys=useRef({left:false,right:false,run:false,jump:false});
  const xRef=useRef(9);
  const elevationRef=useRef(0);
  const velocityRef=useRef(0);
  const energyRef=useRef(MAX_STAMINA);
  const exhaustedRef=useRef(false);
  const awardedEnergyRef=useRef(new Set());
  const coinIdsRef=useRef(new Set());
  const invincibleUntil=useRef(0);
  const interactRef=useRef(null);
  const audioRef=useRef(null);
  const lastStep=useRef(0);
  const lastSentMove=useRef(false);
  const wsRef=useRef(null);
  const pickupSeen=useRef(false);
  const firstScreen=useRef(true);
  const restartSeen=useRef(0);
  const timerFailureRef=useRef(false);
  const puzzleStartedAt=useRef(null);
  const hostedGame=location.protocol==='https:';
  const paused=mode==='multi'?Boolean(room?.paused):pauseOpen;
  const dossiers=mode==='multi'&&room?room.completed.length+(room.collected&&!room.completed.includes(level)?1:0):progress.completed.length+(collected&&!progress.completed.includes(level)?1:0);
  const unlocked=mode==='multi'?(room?.unlocked??0):progress.unlocked;
  const heroName=mode==='multi'?`Raka ${roomRole==='guest'?'2':'1'}`:HERO_NAME;
  const heroSprite='r';
  const peer=mode==='multi'&&room?room.positions?.[roomRole==='host'?'guest':'host']:null;
  const peerName=roomRole==='host'?'RAKA 2':'RAKA 1';
  const peerSprite='r';
  const current=levels[level];
  const timeLimit=levelTimeLimits[level];
  const starsEarned=calculateStars(seconds,timeLimit,health);
  const map=current.map;
  const trail=coinTrails[level];
  const solved=puzzleIndex>=current.puzzles.length;
  const nearby=(node)=>Math.abs(x-map[node])<(node==='npc'?2.8:3.2);
  const nearbyCache=map.caches.findIndex(cache=>Math.abs(x-cache.x)<3.2);
  const camera=Math.max(-120,Math.min(0,50-x*2.2));
  const talking=conversationStep!==null;
  const speakerPosition=talking?(current.dialogue[conversationStep].who==='r'?(roomRole==='guest'&&mode==='multi'?room?.positions?.host?.x??x:x):map.npc):x;
  const speakerOnScreen=Math.max(18,Math.min(82,camera+speakerPosition*2.2));
  const heroFacing=talking?(x<map.npc?'right':'left'):direction;
  const npcFacing=x<map.npc?'left':'right';
  const sound=kind=>{if(audioOn)audioRef.current?.effect(kind)};
  function toggleAudio(){
    if(audioOn){audioRef.current?.stop();setAudioOn(false)}
    else{if(!audioRef.current)audioRef.current=createAudio();audioRef.current.start();setAudioOn(true)}
  }
  useEffect(()=>{
    const sync=()=>setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange',sync);
    return()=>document.removeEventListener('fullscreenchange',sync);
  },[]);
  async function toggleFullScreen(){
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }catch{setToast('Layar penuh tidak tersedia di browser ini. Tampilan game tetap mengikuti ukuran jendela.')}
  }
  useEffect(()=>()=>audioRef.current?.dispose(),[]);
  useEffect(()=>()=>wsRef.current?.close(),[]);
  useEffect(()=>{try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress))}catch{}},[progress]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(timer)},[toast]);
  useEffect(()=>{if(!coinBurst)return;const timer=setTimeout(()=>setCoinBurst(null),620);return()=>clearTimeout(timer)},[coinBurst]);
  useEffect(()=>{if(!energyFlash)return;const timer=setTimeout(()=>setEnergyFlash(false),1300);return()=>clearTimeout(timer)},[energyFlash]);
  useEffect(()=>{
    if(firstScreen.current){firstScreen.current=false;return}
    setLoading(true);
    const timer=setTimeout(()=>setLoading(false),1600);
    return()=>clearTimeout(timer);
  },[screen]);
  useEffect(()=>{
    if(paused||loading||pickupOpen){keys.current={left:false,right:false,run:false,jump:false};setWalking(false);setRunning(false)}
  },[paused,loading,pickupOpen]);
  useEffect(()=>{
    if(screen==='game'&&collected&&!pickupSeen.current){
      pickupSeen.current=true;keys.current={left:false,right:false};setWalking(false);setPickupOpen(true);
    }
  },[screen,collected]);

  function sendRoom(message){
    if(wsRef.current?.readyState===WebSocket.OPEN)wsRef.current.send(JSON.stringify(message));
  }
  function connectRoom(create){
    wsRef.current?.close();restartSeen.current=0;setRoomError('');setRoomConnected(false);setRoom(null);setRoomCode('');setRoomRole(null);
    const code=roomInput.toUpperCase().trim();
    if(!create&&!code){setRoomError('Masukkan kode ruang dari temanmu.');return}
    let serverUrl;
    try{
      serverUrl=new URL(roomServerAddress.trim()||location.origin);
      if(!['http:','https:','ws:','wss:'].includes(serverUrl.protocol))throw new Error('protocol');
      serverUrl.protocol=serverUrl.protocol==='https:'||serverUrl.protocol==='wss:'?'wss:':'ws:';
      if(hostedGame&&serverUrl.protocol!=='wss:')throw new Error('secure');
      serverUrl.pathname='/echo-room';serverUrl.search='';serverUrl.hash='';
    }catch{setRoomError('Masukkan alamat server yang benar, misalnya https://nama-server.onrender.com.');return}
    try{localStorage.setItem('echo-room-server',roomServerAddress.trim())}catch{}
    setRoomConnecting(true);
    const socket=new WebSocket(serverUrl.href);
    let welcomed=false;
    wsRef.current=socket;
    socket.onopen=()=>socket.send(JSON.stringify(create?{type:'create'}:{type:'join',code}));
    socket.onmessage=event=>{
      let data;try{data=JSON.parse(event.data)}catch{return}
      if(data.type==='welcome'){
        welcomed=true;
        const link=new URL(location.origin);
        link.searchParams.set('room',data.code);
        if(hostedGame)link.searchParams.set('server',roomServerAddress.trim());
        setRoomRole(data.role);setRoomCode(data.code);setRoomUrl(hostedGame?link.href:data.lanUrl||'');setRoomConnected(true);setRoomConnecting(false);setRoomError('');
      }else if(data.type==='state')setRoom(data);
      else if(data.type==='error'||data.type==='roomClosed'){
        setRoomError(data.message);
        if(!welcomed){setRoomConnecting(false);socket.close()}
        if(data.type==='roomClosed'){setRoomConnected(false);setRoom(null);setRoomRole(null);setScreen('lobby')}
      }else if(data.type==='wrong')setRoomError(data.message);
    };
    socket.onerror=()=>{setRoomConnecting(false);setRoomError('Server belum tersambung. Periksa alamat server dan tunggu sebentar jika baru dinyalakan.')};
    socket.onclose=()=>{if(wsRef.current===socket){setRoomConnected(false);setRoomConnecting(false);if(!welcomed)setRoomError(previous=>previous||'Sambungan server terputus. Coba lagi sebentar.') }};
  }
  function leaveRoom(destination='mode'){
    wsRef.current?.close();wsRef.current=null;setRoom(null);setRoomRole(null);setRoomCode('');setRoomConnected(false);
    keys.current={left:false,right:false};setPauseOpen(false);setScreen(typeof destination==='string'?destination:'mode');
  }
  function beginLevel(index){
    if(mode==='multi')restartSeen.current=room?.restartCount??0;
    if(audioOn){if(!audioRef.current)audioRef.current=createAudio();audioRef.current.start()}
    setStarted(true);setPauseOpen(false);setScreen('game');setLevel(index);xRef.current=roomRole==='guest'?7:9;setX(xRef.current);setWalking(false);
    energyRef.current=MAX_STAMINA;exhaustedRef.current=false;awardedEnergyRef.current=new Set();setEnergy(MAX_STAMINA);setEnergyFlash(false);setCoinBurst(null);
    elevationRef.current=0;velocityRef.current=0;setElevation(0);setJumping(false);setJumpFrame(2);coinIdsRef.current=new Set();setCoinIds([]);
    setDirection('right');setDialog(false);setConversationStep(null);setConversationSeen(false);setPuzzleIndex(0);setAnswer('');
    setFeedback(null);setHint(false);setShowAnswer(false);setHealth(3);
    pickupSeen.current=false;setPickupOpen(false);setCollected(false);setLevelClear(false);setEnding(null);
    timerFailureRef.current=false;setSeconds(levelTimeLimits[index]);setToast('');setHurt(false);setRecovering(false);keys.current={left:false,right:false,run:false,jump:false};puzzleStartedAt.current=null;
  }
  function restartAttempt(){
    const start=roomRole==='guest'&&mode==='multi'?7:9;
    keys.current={left:false,right:false,run:false,jump:false};xRef.current=start;setX(start);setWalking(false);setRunning(false);setDirection('right');
    energyRef.current=MAX_STAMINA;exhaustedRef.current=false;awardedEnergyRef.current=new Set();setEnergy(MAX_STAMINA);setEnergyFlash(false);setCoinBurst(null);
    elevationRef.current=0;velocityRef.current=0;setElevation(0);setJumping(false);
    setDialog(false);setConversationStep(null);setConversationSeen(false);setPuzzleIndex(0);
    setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);
    setCollected(false);setPickupOpen(false);pickupSeen.current=false;setLevelClear(false);setHealth(3);
    timerFailureRef.current=false;setSeconds(levelTimeLimits[level]);setScannerOn(false);setHurt(false);setRecovering(false);puzzleStartedAt.current=null;
    invincibleUntil.current=Date.now()+1200;
    setToast('Percobaan dimulai lagi dari awal.');
  }
  useEffect(()=>{
    if(mode!=='multi'||!room||room.phase!=='game')return;
    if(room.restartCount!==restartSeen.current){restartSeen.current=room.restartCount;restartAttempt()}
  },[mode,room?.restartCount,room?.phase]);
  useEffect(()=>{
    if(mode!=='multi'||!room)return;
    if(room.phase==='game'&&(screen!=='game'||level!==room.level)){beginLevel(room.level);return}
    if(room.phase==='ending'&&screen!=='ending'){
      keys.current={left:false,right:false};setWalking(false);setDialog(false);setConversationStep(null);
      setEnding(room.ending||'bad');setScreen('ending');return;
    }
    if(room.phase==='select'&&(screen==='game'||screen==='ending')){
      keys.current={left:false,right:false};setWalking(false);setDialog(false);setConversationStep(null);setLevelClear(false);
      setEnding(null);setScreen('select');setToast(room.winner===roomRole?'Kamu menang! Bonus 50 koin.':'Raka lain lebih dulu sampai. Coba level berikutnya!');return;
    }
    if(room.phase==='game'){
      if(room.coinIds){room.coinIds.forEach(id=>coinIdsRef.current.add(id));setCoinIds([...coinIdsRef.current])}
      if(room.puzzleIndex!==puzzleIndex){setPuzzleIndex(room.puzzleIndex);setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);puzzleStartedAt.current=Date.now();if(room.puzzleIndex===3)setDialog(false)}
      setCollected(room.collected);
      if(room.correct&&room.puzzleIndex<3)setFeedback({correct:true,text:`Energi lari siap! ${levels[room.level].puzzles[room.puzzleIndex].explain}`});
    }
  },[mode,room?.phase,room?.level,room?.puzzleIndex,room?.correct,room?.collected,room?.coinIds,room?.ending,screen,level,puzzleIndex]);

  function startLevel(index){
    if(index>unlocked)return;
    if(mode==='multi'){if(roomRole==='host')sendRoom({type:'start',level:index});return}
    beginLevel(index);
  }
  function showLevelSelect(){
    setPauseOpen(false);
    if(mode==='multi'){
      sendRoom({type:'menu'});
      return;
    }
    keys.current={left:false,right:false};setWalking(false);setStarted(false);setScreen('select');
    setDialog(false);setConversationStep(null);setLevelClear(false);setEnding(null);setToast('');
  }
  function pauseGame(){
    if(screen!=='game'||dialog||levelClear||pickupOpen||ending||loading)return;
    keys.current={left:false,right:false};setWalking(false);
    if(mode==='multi')sendRoom({type:'pause'});else setPauseOpen(true);
  }
  function resumeGame(){
    if(mode==='multi')sendRoom({type:'resume'});else setPauseOpen(false);
  }
  function exitGame(){
    if(mode==='multi'){leaveRoom('poster');setMode(null)}
    else{setPauseOpen(false);keys.current={left:false,right:false};setWalking(false);setDialog(false);setConversationStep(null);setLevelClear(false);setScreen('poster')}
  }
  function advanceConversation(){
    if(conversationStep===null)return;
    if(conversationStep===current.dialogue.length-1){setConversationStep(null);setConversationSeen(true)}
    else setConversationStep(v=>v+1);
  }
  function interact(){
    if(talking){advanceConversation();return}
    if(screen!=='game'||dialog||levelClear||pickupOpen||ending||paused||loading)return;
    if(nearby('npc')&&(!conversationSeen||!nearby('terminal'))){sound('open');keys.current={left:false,right:false};setWalking(false);setConversationStep(0);return}
    if(nearby('terminal')&&!solved){sound('open');if(puzzleStartedAt.current===null)puzzleStartedAt.current=Date.now();setDialog(true);setFeedback(null);setAnswer('');setShowAnswer(false);return}
    if(nearbyCache!==-1&&!collected){
      if(!solved){setToast('Tempat terkunci · pecahkan kode terminal dahulu');return}
      if(nearbyCache===map.hidden){sound('pickup');if(mode==='multi')sendRoom({type:'collect'});else{setCollected(true);setProgress(p=>({...p,coins:p.coins+15}))}}
      else{sound('wrong');setToast('Tidak ada berkas di sini. Ikuti petunjuk misi di atas map.')}
      return;
    }
    if(nearby('door')&&collected){sound('clear');keys.current={left:false,right:false};setWalking(false);if(mode==='multi')sendRoom({type:'clear',remaining:seconds,health});else setLevelClear(true);return}
    if(nearby('door'))setToast('Pintu terkunci · temukan berkas tersembunyi');
  }
  interactRef.current=interact;
  useEffect(()=>{
    if(screen==='game'&&!conversationSeen&&!talking&&!dialog&&!levelClear&&!ending&&!paused&&!loading&&nearby('npc')){
      keys.current={left:false,right:false};setWalking(false);setConversationStep(0);
    }
  },[screen,x,level,conversationSeen,talking,dialog,levelClear,ending,paused,loading]);
  useEffect(()=>{
    function down(e){
      if(['ArrowLeft','ArrowRight','ArrowUp','a','A','d','D','w','W','e','E','Shift',' '].includes(e.key) && e.target.tagName!=='INPUT')e.preventDefault();
      if(e.target.tagName==='INPUT')return;
      if(screen==='game'&&!paused&&!pickupOpen&&!loading&&!recovering){
        if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.current.left=true;
        if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.current.right=true;
        if(e.key==='Shift')keys.current.run=true;
        if((e.key==='ArrowUp'||e.key.toLowerCase()==='w'||e.code==='Space')&&!e.repeat)keys.current.jump=true;
      }
      if(e.key.toLowerCase()==='e'&&!e.repeat)interactRef.current?.();
      if(e.key==='Escape'&&screen==='game'&&!dialog&&!levelClear&&!loading){
        if(paused)resumeGame();else pauseGame();
      }
    }
    function up(e){if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.current.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.current.right=false;if(e.key==='Shift')keys.current.run=false}
    function blur(){keys.current.left=false;keys.current.right=false;keys.current.run=false}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)};
  },[screen,paused,pickupOpen,loading,dialog,levelClear,mode,recovering]);
  useEffect(()=>{
    if(screen!=='game'||dialog||talking||levelClear||pickupOpen||ending||paused||loading||recovering)return;
    const loop=setInterval(()=>{
      const active=level>0 && Math.floor(Date.now()/1450)%2===0;
      setScannerOn(active);
      const delta=(keys.current.right?1:0)-(keys.current.left?1:0);
      const wasExhausted=exhaustedRef.current;
      const sprint=stepStamina(energyRef.current,wasExhausted,keys.current.run,delta!==0);
      energyRef.current=sprint.energy;exhaustedRef.current=sprint.exhausted;
      setEnergy(sprint.energy);
      if(!wasExhausted&&sprint.exhausted)setToast('Energi habis. Jalan dulu atau pecahkan soal untuk mengisinya.');
      setWalking(delta!==0);
      setRunning(sprint.running);
      const floorBefore=floorHeightAt(level,xRef.current);
      if(keys.current.jump&&elevationRef.current<=floorBefore+2&&velocityRef.current<=0){
        velocityRef.current=16.5;
        sound('jump');
      }
      keys.current.jump=false;
      let nextHeight=elevationRef.current+velocityRef.current;
      velocityRef.current-=1.3;
      let next=Math.max(3,Math.min(97,xRef.current+delta*(sprint.running?.54:.32)));
      if(!canEnterAtHeight(level,next,nextHeight))next=xRef.current;
      const floorAfter=floorHeightAt(level,next);
      if(nextHeight<=floorAfter&&velocityRef.current<=0){nextHeight=floorAfter;velocityRef.current=0}
      const airborne=nextHeight>floorAfter+2||velocityRef.current>0;
      setJumping(airborne);
      setJumpFrame(velocityRef.current>8?0:velocityRef.current>1?1:velocityRef.current>-4?2:velocityRef.current>-9?3:4);
      if(Math.abs(nextHeight-elevationRef.current)>.05){elevationRef.current=nextHeight;setElevation(nextHeight)}
      if(delta){setDirection(delta<0?'left':'right');if(!airborne&&Date.now()-lastStep.current>360){sound('step');lastStep.current=Date.now()}}
      const patroller=55+Math.sin(Date.now()/650)*8;
      if(level===2)setDroneX(patroller);
      const beams=map.scanners;
      const beamHit=active&&beams.some(point=>Math.abs(next-point)<1.4&&(level!==2||nextHeight<floorHeightAt(level,point)+51));
      const droneHit=level===2&&Math.abs(next-patroller)<1.65&&Math.abs(nextHeight-112)<47;
      const hit=(beamHit||droneHit)&&Date.now()>invincibleUntil.current;
      if(hit){
        sound('hit');setHurt(true);setRecovering(true);keys.current={left:false,right:false,run:false,jump:false};setWalking(false);setRunning(false);
        invincibleUntil.current=Date.now()+2000;
        setHealth(h=>Math.max(0,h-1));
        setTimeout(()=>{
          if(health<=1){setHurt(false);setRecovering(false);return}
          if(mode==='multi')sendRoom({type:'restart'});
          else restartAttempt();
        },1050);
        return;
      }
      xRef.current=next;setX(next);
      if(mode==='multi'&&(delta||airborne||lastSentMove.current)){
        sendRoom({type:'move',x:next,height:nextHeight,direction:delta<0?'left':delta>0?'right':direction,walking:delta!==0,running:sprint.running,jumping:airborne});
        lastSentMove.current=Boolean(delta||airborne);
      }
      trail.forEach((coin,index)=>{
        if(coinIdsRef.current.has(index)||Math.abs(next-coin.x)>1.45||Math.abs(nextHeight+29-coin.height)>36)return;
        coinIdsRef.current.add(index);setCoinIds([...coinIdsRef.current]);setCoinBurst({x:coin.x,height:coin.height,index});sound('coin');
        if(mode==='multi')sendRoom({type:'coin',index});
        else setProgress(p=>({...p,coins:p.coins+5}));
      });
    },40);
    return()=>clearInterval(loop);
  },[screen,level,dialog,talking,levelClear,pickupOpen,ending,audioOn,mode,direction,paused,loading,recovering,health]);
  useEffect(()=>{if(screen==='game'&&health===0&&!ending&&!recovering){if(mode==='multi')sendRoom({type:'fail'});else{setEnding('bad');setScreen('ending')}}},[screen,health,ending,mode,recovering]);
  useEffect(()=>{
    if(screen!=='game'||talking||levelClear||pickupOpen||ending||paused||loading||recovering)return;
    const timer=setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);
    return()=>clearInterval(timer);
  },[screen,talking,levelClear,pickupOpen,ending,paused,loading,recovering]);
  useEffect(()=>{if(screen==='game'&&seconds===0&&!ending&&!levelClear&&!timerFailureRef.current){timerFailureRef.current=true;if(mode==='multi')sendRoom({type:'fail'});else{setEnding('bad');setScreen('ending')}}},[screen,seconds,ending,levelClear,mode]);

  function submit(e){
    e.preventDefault();
    if(feedback?.correct)return;
    const puzzle=current.puzzles[puzzleIndex];
    if(!answer.trim())return;
    if(isCorrect(puzzle,answer)){
      sound('correct');
      let energyGain=0;
      if(!awardedEnergyRef.current.has(puzzleIndex)){
        awardedEnergyRef.current.add(puzzleIndex);
        const restored=rewardStamina(energyRef.current);
        energyGain=Math.round(restored-energyRef.current);
        energyRef.current=restored;exhaustedRef.current=restored<EXHAUSTION_RECOVERY;
        setEnergy(restored);setEnergyFlash(true);
      }
      if(mode==='multi')sendRoom({type:'solve',answer});
      else {
        const reward=10+Math.max(0,20-Math.floor((Date.now()-(puzzleStartedAt.current??Date.now()))/3000));
        setProgress(p=>({...p,coins:p.coins+reward}));
        setFeedback({correct:true,text:`+${reward} koin · ${energyGain?`+${energyGain} energi lari`:'energi penuh'}! ${puzzle.explain}`});
      }
      return;
    }
    sound('wrong');
    if(mode==='multi')sendRoom({type:'mistake'});
    setMistakes(v=>v+1);
    setHealth(v=>Math.max(0,v-1));
    setFeedback({correct:false,text:'Kode belum cocok. Periksa urutan hitungnya, lalu coba lagi.'});
  }
  function nextPuzzle(){
    if(mode==='multi'){sendRoom({type:'advance'});return}
    if(puzzleIndex===2){setPuzzleIndex(3);setDialog(false);setToast('Petunjuk lokasi berkas muncul di atas map!')}
    else setPuzzleIndex(v=>v+1);
    puzzleStartedAt.current=Date.now();
    setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);
  }
  function nextLevel(){
    setProgress(p=>({
      ...p,unlocked:level===3?p.unlocked:Math.max(p.unlocked,level+1),
      completed:p.completed.includes(level)?p.completed:[...p.completed,level],
      stars:p.stars.map((value,index)=>index===level?Math.max(value,starsEarned):value)
    }));
    if(level===3){setEnding(getEnding({dossiers,mistakes,escaped:true}));setScreen('ending');return}
    showLevelSelect();
  }
  const marker=nearby('npc')&&!conversationSeen?'npc':nearby('terminal')&&!solved?'terminal':nearbyCache!==-1&&!collected?'cache':nearby('npc')?'npc':nearby('door')?'door':null;
  const actionLabel=talking?'Lanjutkan percakapan':{npc:conversationSeen?'Bicara lagi':'Bicara dengan tokoh',terminal:'Buka terminal',cache:`Periksa ${map.caches[nearbyCache]?.name||'tempat'}`,door:collected?'Buka pintu':'Periksa pintu'}[marker];
  const endingInfo={
    true:{eyebrow:'TRUE ENDING',title:'Kebenaran terungkap.',description:'Empat berkas lengkap. Raka lolos, bukti terkirim, dan lokasi Vira akhirnya terungkap.'},
    neutral:{eyebrow:'NEUTRAL ENDING',title:'Raka berhasil lolos.',description:'Bukti terkirim, tetapi terlalu banyak kesalahan membuat beberapa data rusak. Kasus masih terbuka.'},
    bad:{eyebrow:'BAD ENDING',title:'Transmisi terputus.',description:'Sistem mengunci akses sebelum misi selesai. Ulangi operasi, gunakan petunjuk, dan amati pemindai.'}
  };
  return <div className={`app screen-${screen} ${screen==='game'?'playing':''} ${ending==='bad'?'game-over':''}`} style={{'--level-color':current.color}}>
    <main className="shell">
      {screen==='poster' ? <section className="title-screen" aria-label="Poster Jejak yang Hilang">
        <div className="title-scene">
          <div className="title-cast">
            {[{id:'chief',name:'Arman',side:'back-left'},{id:'anonim',name:'Nara',side:'back-mid'},{id:'pelaku',name:'Damar',side:'back-right'},{id:'v',name:'Vira',side:'front-left'},{id:'r',name:'Raka',side:'front-right'}].map(actor=><div key={actor.id} className={`cast-member ${actor.side}`}><img src={`/sprites/${actor.id}-idle.png`} alt={actor.name}/><span>{actor.name}</span></div>)}
          </div>
          <div className="title-vignette"/>
        </div>
        <div className="title-content">
          <div className="title-case-tag"><span className="live-dot"/> CASE 047 <i/> BERKAS RAHASIA</div>
          <p className="title-kicker">MISTERI · MATEMATIKA · PETUALANGAN</p>
          <h1 className="title-accessible-name">Jejak yang Hilang</h1>
          <img className="title-logo" src="/branding/jejak-yang-hilang.jpg" alt="Logo Jejak yang Hilang dengan kaca pembesar dan papan investigasi" fetchPriority="high" />
          <p className="title-story">Vira menemukan kebocoran data dan pergi. Raka mengikuti pesan berkode yang ia tinggalkan untuk mengungkap kebenarannya.</p>
          <p className="title-brief">TELUSURI JEJAKNYA · PECAHKAN KODENYA · TEMUKAN KEBENARAN</p>
          <div className="title-actions"><button className="title-play" onClick={()=>{if(audioOn){if(!audioRef.current)audioRef.current=createAudio();audioRef.current.start()}setScreen('mode')}}>▶ PLAY</button><button className="title-guide" onClick={()=>setHelp(true)}>CARA BERMAIN</button></div>
          <p className="title-subline">4 LEVEL · 2 CARA BERMAIN · 1 MISTERI</p>
        </div>
        <button className="title-sound" onClick={toggleAudio} aria-label={audioOn?'Matikan suara':'Nyalakan suara'}>{audioOn?'♫ Suara nyala':'♪ Suara mati'}</button>
      </section> : screen==='mode' ? <section className="mode-screen" aria-label="Pilih cara bermain">
        <button className="game-back" onClick={()=>setScreen('poster')}>← Kembali</button>
        <div className="mode-heading"><p>JEJAK YANG HILANG</p><h1>Pilih cara bermain</h1><span>Petualangan yang sama, sendiri atau bersama teman.</span></div>
        <div className="mode-options">
          <button onClick={()=>{setMode('single');setScreen('select')}}><span className="mode-icon">◈</span><strong>Single Player</strong><small>Jalani misi sebagai Raka di laptop ini.</small><b>MAIN SENDIRI →</b><span className="mode-portrait mode-portrait-one"><Sprite id="r"/></span></button>
          <button onClick={()=>{setMode('multi');setScreen('lobby')}}><span className="mode-icon">◆ ◆</span><strong>Multiplayer</strong><small>Dua Raka berlomba memecahkan kode dan mengumpulkan koin.</small><b>MULAI BALAPAN →</b><span className="mode-portrait mode-portrait-two"><Sprite id="r"/></span><span className="mode-portrait mode-portrait-three rival-preview"><Sprite id="r"/></span></button>
        </div>
      </section> : screen==='lobby' ? <section className="lobby-screen" aria-label="Ruang multiplayer">
        <button className="game-back" onClick={leaveRoom}>← Pilih mode</button>
        <div className="lobby-panel"><p className="title-kicker">MULTIPLAYER · 2 PEMAIN</p><h1>{roomCode?'Ruang siap':'Main bersama teman'}</h1>
          {hostedGame&&<label className="room-link">Alamat server multiplayer<input aria-label="Alamat server multiplayer" type="url" value={roomServerAddress} onChange={event=>setRoomServerAddress(event.target.value)} placeholder="https://nama-server.onrender.com" spellCheck="false"/><small>Isi sekali dengan alamat server online. Kode ruang tetap dibagikan ke temanmu.</small></label>}
          {roomConnected&&roomCode ? <>
            <div className="room-code"><small>KODE RUANG</small><strong>{roomCode}</strong></div>
            <p className="lobby-hint">{roomRole==='host'?'Kirim tautan dan kode ruang ini ke temanmu. Alamat server akan terisi otomatis dari tautan.':'Kamu bergabung sebagai Raka 2. Tunggu Raka 1 memilih level.'}</p>
            {roomRole==='host'&&roomUrl&&<label className="room-link">Alamat untuk laptop teman<input value={roomUrl} readOnly onFocus={e=>e.target.select()} onClick={e=>e.target.select()}/></label>}
            <div className="room-players"><span>● Raka 1 {room?.players?.host?'siap':'menunggu'}</span><span>● Raka 2 {room?.players?.guest?'siap':'menunggu'}</span></div>
            {roomRole==='host'&&<button className="title-play" disabled={!room?.players?.guest} onClick={()=>setScreen('select')}>PILIH LEVEL →</button>}
            {roomRole==='guest'&&<p className="waiting-note">Menunggu Raka 1 memulai balapan…</p>}
          </> : <>
            <p className="lobby-hint">Pemain pertama membuat ruang. Pemain kedua membuka game dari laptop lain lalu memasukkan kodenya.{roomConnecting?' Server sedang disambungkan, tunggu sebentar…':''}</p>
            <button className="title-play" disabled={roomConnecting} onClick={()=>connectRoom(true)}>{roomConnecting?'MENYAMBUNG…':'BUAT RUANG BARU'}</button>
            <div className="join-divider">ATAU MASUKKAN KODE TEMAN</div>
            <form className="join-form" onSubmit={event=>{event.preventDefault();connectRoom(false)}}><input aria-label="Kode ruang" value={roomInput} maxLength={6} disabled={roomConnecting} onChange={event=>setRoomInput(event.target.value.toUpperCase())} placeholder="CONTOH: A7K2QP"/><button type="submit" disabled={roomConnecting}>GABUNG →</button></form>
          </>}
          {roomError&&<p className="room-error" role="alert">{roomError}</p>}
        </div>
      </section> : screen==='select' ? <section className="level-select" aria-label="Pilih level">
        <div className="level-select-heading"><button className="menu-back" onClick={()=>mode==='multi'?setScreen('lobby'):setScreen('mode')}>← {mode==='multi'?'Ruang':'Pilih mode'}</button><p>JEJAK YANG HILANG · {mode==='multi'?`RUANG ${roomCode}`:'SINGLE PLAYER'}</p><h1>Pilih level</h1><span>{mode==='multi'&&roomRole==='guest'?'Raka 1 memilih level. Siapkan diri untuk balapan!':'Lokasi berikutnya terbuka setelah berkas di lokasi sebelumnya diamankan.'}</span><div className="select-coins">✦ {mode==='multi'?room?.coins??0:progress.coins} koin {mode==='multi'&&`· Lawan ${room?.scores?.[roomRole==='host'?'guest':'host']??0}`}</div>{mode==='multi'&&room?.lastResult&&<div className="race-result"><strong>{room.lastResult.winner===roomRole?'🏆 Kamu menang!':'Raka lain menang!'}</strong><span aria-label={`${room.lastResult.stars} dari 3 bintang`}>{[1,2,3].map(star=><i key={star} className={star<=room.lastResult.stars?'earned':''}>★</i>)}</span><small>Sisa waktu pemenang {formatClock(room.lastResult.remaining)}</small></div>}</div>
        <div className="level-cards">{levels.map((item,index)=>{const locked=index>unlocked;const done=(mode==='multi'?room?.completed:progress.completed)?.includes(index);const best=mode==='multi'?room?.stars?.[index]??0:progress.stars[index];return <button key={item.name} className={`level-card ${locked?'locked':''} ${done?'complete':''}`} onClick={()=>startLevel(index)} disabled={locked||(mode==='multi'&&roomRole!=='host')}><div className="level-card-art" style={{backgroundImage:`url('/scenes/room-${index}.svg')`}}/><div className="level-card-content"><span className="level-number">{String(index+1).padStart(2,'0')}</span><div><small>{item.chapter} · {formatClock(levelTimeLimits[index])}</small><strong>{item.name}</strong><em>{item.location}</em><span className="level-stars" aria-label={`Rekor ${best} dari 3 bintang`}>{[1,2,3].map(star=><i key={star} className={star<=best?'earned':''}>★</i>)}</span></div><b>{locked?'🔒 TERKUNCI':done?'✓ SELESAI':mode==='multi'&&roomRole==='guest'?'MENUNGGU':'▶ MAIN'}</b></div></button>})}</div>
        <p className="level-select-foot">BERKAS TERKUMPUL {dossiers}/4 · LEVEL TERBUKA {unlocked+1}/4</p>
      </section> : ending==='bad' ? <section className="game-over-screen" aria-label="Misi gagal" style={{'--failure-scene':`url('/scenes/room-${level}.svg')`}}>
        <div className="game-over-stage"><div className="failure-orbit"/><div className="failure-signal">×<span>CONNECTION LOST</span></div><Sprite id={heroSprite}/><div className="failure-floor"/><span className="failure-stage-caption">JEJAK YANG HILANG · {current.location.toUpperCase()}</span></div>
        <div className="game-over-copy"><p className="failure-kicker"><i/> GAME OVER · LEVEL {String(level+1).padStart(2,'0')} / 04</p><h1>MISI<br/><em>TERHENTI.</em></h1><p className="failure-reason">{seconds===0?'Waktu operasi habis sebelum bukti terkirim. Jalur ini masih bisa dicoba lagi.':health===0?`${heroName} terdeteksi terlalu sering oleh pemindai. Petunjuk Vira masih menunggu untuk dipecahkan.`:'Operasi tim terhenti. Susun kembali langkah kalian dan coba lagi.'}</p><div className="failure-progress"><span><small>LOKASI</small><strong>{current.name}</strong></span><span><small>BERKAS</small><strong>{dossiers} / 4 diamankan</strong></span></div><div className="failure-actions"><button className="failure-retry" onClick={()=>{if(mode!=='multi')setMistakes(0);startLevel(level)}} disabled={mode==='multi'&&roomRole!=='host'}>↻ <span>{mode==='multi'&&roomRole!=='host'?'Menunggu Raka':'Ulangi Level'}</span> →</button><button className="failure-levels" onClick={()=>{setMistakes(0);showLevelSelect()}}>Pilih Level</button></div><small className="failure-tip">{mode==='multi'?'Kalian akan mengulang level bersama.':'Nyawa dan soal di level ini akan dimulai dari awal.'}</small></div>
      </section> : ending ? <section className="result-card"><div className="result-actor"><Sprite id="r" walking/></div><div><p className="kicker">{endingInfo[ending].eyebrow}</p><h1>{endingInfo[ending].title}</h1><p>{endingInfo[ending].description}</p><div className="result-stats"><span>Berkas {dossiers}/4</span><span>Kesalahan {mode==='multi'?room?.mistakes:mistakes}</span><span>✦ {mode==='multi'?room?.coins??0:progress.coins} koin</span>{mode==='multi'&&<span>{room?.winner===roomRole?'🏆 Kamu menang!':'Raka lain menang'}</span>}</div><button className="main-button" onClick={()=>{setMistakes(0);showLevelSelect()}}>Pilih level →</button></div></section> : <>
        <section className="game-frame" aria-label="Bingkai permainan Jejak yang Hilang">
        <div className="game-top"><div className="hud-title"><span className="hud-level-badge" aria-hidden="true">{String(level+1).padStart(2,'0')}</span><div><p className="kicker">JEJAK YANG HILANG · {current.chapter}{mode==='multi'?` · RUANG ${roomCode}`:''}</p><h1>{current.name}</h1></div></div><div className="hud-right"><div className="game-stats"><div className="life-frame" aria-label={`Nyawa ${health} dari 3`}><small>NYAWA {mode==='multi'?heroName.toUpperCase():''}</small><strong>{[0,1,2].map(i=><i key={i} className={i<health?'alive':'lost'}>♥</i>)}</strong></div><div className="file-frame"><small>BERKAS</small><strong>▣ {dossiers}/4</strong></div><div className="coin-frame"><small>KOIN {mode==='multi'?heroName.toUpperCase():''}</small><strong>✦ {mode==='multi'?room?.coins??0:progress.coins}</strong>{mode==='multi'&&<em>Lawan ✦ {room?.scores?.[roomRole==='host'?'guest':'host']??0}</em>}</div><div className={`timer-frame ${seconds<30?'urgent':''}`} aria-label={`Sisa waktu ${formatClock(seconds)}`}><small>WAKTU</small><strong>◷ {formatClock(seconds)}</strong><span className="timer-track"><i style={{width:`${seconds/timeLimit*100}%`}}/></span></div></div><div className="game-menu"><button onClick={pauseGame} aria-label="Buka menu jeda" title="Jeda"><span aria-hidden="true">Ⅱ</span><span className="menu-text">Jeda</span></button><button onClick={toggleAudio} aria-label={audioOn?'Matikan suara':'Nyalakan suara'} title={audioOn?'Matikan suara':'Nyalakan suara'}>{audioOn?'♫':'♪'}</button><button onClick={toggleFullScreen} aria-label={fullScreen?'Keluar layar penuh':'Layar penuh'} title={fullScreen?'⤢':'⛶'}>{fullScreen?'⤢':'⛶'}</button><button onClick={()=>setHelp(v=>!v)} aria-label="Cara main" title="Cara main">?</button></div></div></div>
        <div className="mission-note"><b className="mission-label">{!solved?'MISI':collected?'TUJUAN':'PETUNJUK'}</b><span>{!solved?'Cari terminal di area ini dan pecahkan tiga kode.':collected?'Berkas aman. Kembali ke pintu keluar di awal area.':map.clue}</span><div className="journey-meter" aria-hidden="true"><i style={{width:`${x}%`}}/></div><small>{Math.round(x)}% area</small></div>
        <section className={`scene scene-${level} ${hurt?'hurt':''}`} aria-label={`Area permainan ${current.location}`}>
          <div className="scene-world" style={{left:`${camera}%`}}>
            <div className="scene-backdrop"><div className="scene-title">{current.location}</div></div>
            <div className="atmosphere"><i/><i/><i/><i/><i/></div>
            <div className="scene-ground"/>
            {level===2&&tierPlatforms.map((step,index)=><div key={step.start} className={`stair-platform stair-${index}`} style={{left:`${step.start}%`,width:`${step.end-step.start}%`,'--rise':`${step.height}px`}}><span>{index+1}</span></div>)}
            {trail.map((coin,index)=>!coinIds.includes(index)&&<div key={index} className="path-coin" style={{left:`${coin.x}%`,bottom:`calc(30% - 5px + ${coin.height}px)`}} aria-label={`Koin ${index+1}`}><i>✦</i></div>)}
            {coinBurst&&<div key={`${coinBurst.index}-${coinBurst.x}`} className="coin-burst" style={{left:`${coinBurst.x}%`,bottom:`calc(30% - 5px + ${coinBurst.height}px)`}} aria-hidden="true"><span>✦</span><b>+5</b></div>}
            {level===2&&<div className="security-drone" style={{left:`${droneX}%`}} aria-label="Drone patroli bergerak"><i/><b>●</b><i/></div>}
            <div className={`scene-npc ${level===1?'hologram':''} ${talking?'in-conversation':''}`} style={{left:`${map.npc}%`}}><span>{current.speaker}</span><Sprite id={current.npc} direction={npcFacing}/><i className="foot-shadow"/>{nearby('npc')&&!talking&&<b>TEKAN E</b>}</div>
            <div className={`object terminal-object ${solved?'terminal-solved':''} ${nearby('terminal')&&!solved?'terminal-near':''}`} style={{left:`${map.terminal}%`}}><div className="terminal-device" aria-hidden="true"><div className="terminal-screen"><small>VIRA / {String(level+1).padStart(2,'0')}</small><b>{solved?'ACCESS OK':'CODE LOCKED'}</b><span className="terminal-code">{solved?'▰▰▰▰▰':'▰▰▱▱▱'}</span><span className="terminal-scanline"/></div><div className="terminal-keyboard"><i/><i/><i/><span>●</span></div></div><span className="object-name">TERMINAL KODE</span>{!solved&&nearby('terminal')&&<i>TEKAN E</i>}</div>
            {map.caches.map((cache,index)=><div key={cache.name} className={`object cache-object cache-${index} ${solved&&!collected?'searchable':''} ${collected&&index===map.hidden?'taken':''}`} style={{left:`${cache.x}%`}}><CacheProp kind={cache.kind}/><span className="cache-name">{cache.name}</span>{nearbyCache===index&&!collected&&<i>TEKAN E</i>}</div>)}
            <div className={`object door-object ${collected?'ready':''}`} style={{left:`${map.door}%`}}><span className="object-icon">⇥</span><span>KELUAR</span>{nearby('door')&&<i>TEKAN E</i>}</div>
            {map.scanners.map(point=><div key={point} className={`scanner ${scannerOn?'on':''}`} style={{left:`${point}%`,bottom:`calc(30% - 4px + ${floorHeightAt(level,point)}px)`}} aria-label={`Pemindai ${scannerOn?'aktif':'siaga'}`}><div className="scanner-head"><i/><b/><i/></div><div className="scanner-beam"/><div className="scanner-base"/><span>PEMINDAI</span></div>)}
            {mode==='multi'&&room?.players?.[roomRole==='host'?'guest':'host']&&peer&&<div className="player peer-player rival-raka" style={{left:`${peer.x}%`,bottom:`calc(30% - 5px + ${peer.height||0}px)`}}><span>{peerName}</span><Sprite id={peerSprite} walking={peer.walking} running={peer.running} jumping={peer.jumping} direction={peer.direction}/><i className="foot-shadow"/></div>}
            <div className={`player ${hurt?'player-hit':''} ${jumping?'airborne':''}`} style={{left:`${x}%`,bottom:`calc(30% - 5px + ${elevation}px)`}}><span>{heroName.toUpperCase()}</span><Sprite id={heroSprite} walking={walking} running={running} jumping={jumping} jumpFrame={jumpFrame} direction={heroFacing}/><i className="foot-shadow"/></div>
          </div>
          <div className={`energy-hud ${energyFlash?'energy-gained':''} ${energy<EXHAUSTION_RECOVERY?'energy-low':''}`} role="meter" aria-label="Energi lari cepat" aria-valuemin={0} aria-valuemax={MAX_STAMINA} aria-valuenow={Math.round(energy)}><div className="energy-heading"><span>⚡ ENERGI LARI</span><strong>{Math.round(energy)}%</strong></div><div className="energy-track"><i style={{width:`${energy}%`}}/></div><small>{energyFlash?'JAWABAN BENAR · ENERGI BERTAMBAH':energy<EXHAUSTION_RECOVERY?'LARI TERKUNCI · PULIHKAN ENERGI':'SHIFT / TAHAN LARI · BENAR +35'}</small></div>
          {recovering&&<div className="scanner-impact" role="status"><div className="impact-ring"/><strong>TERDETEKSI</strong><span>{health>0?'Mengulang level dari awal...':'Nyawa habis...'}</span></div>}
          {talking&&<div className={`encounter-bubble ${current.dialogue[conversationStep].who==='r'?'from-r':'from-npc'}`} style={{'--bubble-x':`${speakerOnScreen}%`}} role="dialog" aria-label="Percakapan tokoh"><div className="encounter-heading"><span>PERTEMUAN · {conversationStep+1}/{current.dialogue.length}</span><strong>{current.dialogue[conversationStep].who==='r'?HERO_NAME:current.speaker}</strong></div><p>{current.dialogue[conversationStep].text}</p><button onClick={advanceConversation}>{conversationStep===current.dialogue.length-1?'Mulai misi':'Lanjut'} →</button></div>}
          {toast&&<div className="game-toast" role="status">{toast}</div>}
        </section>
        <div className="control-strip"><div className="movement"><button aria-label="Jalan ke kiri" onPointerDown={e=>{e.preventDefault();keys.current.left=true}} onPointerUp={()=>keys.current.left=false} onPointerCancel={()=>keys.current.left=false} onPointerLeave={()=>keys.current.left=false}>←</button><button aria-label="Jalan ke kanan" onPointerDown={e=>{e.preventDefault();keys.current.right=true}} onPointerUp={()=>keys.current.right=false} onPointerCancel={()=>keys.current.right=false} onPointerLeave={()=>keys.current.right=false}>→</button><button className="run-control" aria-label="Tahan untuk lari" onPointerDown={e=>{e.preventDefault();keys.current.run=true;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={()=>keys.current.run=false} onPointerCancel={()=>keys.current.run=false} onLostPointerCapture={()=>keys.current.run=false}>⚡ LARI</button><button className="jump-control" aria-label="Lompat" onPointerDown={e=>{e.preventDefault();keys.current.jump=true}}>↑ LOMPAT</button><span>← → / A D gerak · Shift lari · Spasi lompat</span></div><div><button className="interact-button" onClick={interact} disabled={!marker}>{actionLabel || 'Dekati objek untuk berinteraksi'} <kbd>E</kbd></button></div></div>
        </section>
        {pickupOpen&&<div className="evidence-reveal" role="dialog" aria-modal="true" aria-label="Berkas ditemukan"><div className="evidence-particles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="evidence-card"><p className="evidence-kicker">BUKTI DITEMUKAN · {current.dossier.code}</p><div className="evidence-art" aria-hidden="true"><div className="evidence-glow"/><div className="evidence-folder-back"/><div className="evidence-page"><span>CASE 047</span><i/><i/><i/></div><div className="evidence-folder-front"><b>▣</b><span>{current.dossier.code}</span></div></div><h2>{current.dossier.title}</h2><p>{current.dossier.detail}</p><button onClick={()=>setPickupOpen(false)}>Simpan berkas dan lanjut →</button></div></div>}
        {levelClear&&<div className="modal-backdrop mission-result-backdrop"><section className="clear-card mission-result" role="dialog" aria-modal="true" aria-label="Level selesai"><div className="mission-result-art" style={{backgroundImage:`linear-gradient(90deg,#0b2432aa,#0b243288),url('/scenes/room-${level}.svg')`}}><span className="result-chapter">MISI {String(level+1).padStart(2,'0')} / 04 · {current.chapter}</span><div className="result-seal">✓</div><h2>LEVEL SELESAI</h2><p>{current.name}</p></div><div className="mission-result-details"><span className="result-kicker">BERKAS DIAMANKAN · {current.dossier.code}</span><div className="result-stars" aria-label={`${starsEarned} dari 3 bintang`}>{[1,2,3].map(star=><span key={star} className={star<=starsEarned?'earned':''} style={{'--star-index':star}}>★</span>)}</div><strong className="result-rank">{starsEarned===3?'MISI SEMPURNA':starsEarned===2?'KERJA BAGUS':'MISI BERHASIL'}</strong><p className="result-criteria">3 bintang: selesai sebelum separuh waktu habis dengan 3 nyawa. 2 bintang: sisa minimal 20% waktu dan 2 nyawa.</p><div className="result-metrics"><span><small>SISA WAKTU</small><b>{formatClock(seconds)}</b></span><span><small>NYAWA</small><b>{health} / 3</b></span><span><small>REKOR</small><b>{Math.max(progress.stars[level],starsEarned)} ★</b></span></div><button className="result-next" onClick={nextLevel}>{level===3?'LIHAT AKHIR CERITA':'LANJUT KE PILIH LEVEL'} <span>→</span></button></div></section></div>}
        {paused&&<div className="pause-backdrop"><section className="pause-card" role="dialog" aria-modal="true" aria-label="Menu jeda"><span className="pause-symbol">Ⅱ</span><p className="pause-kicker">JEJAK YANG HILANG · LEVEL {String(level+1).padStart(2,'0')}</p><h2>Permainan dijeda</h2><p className="pause-caption">{mode==='multi'?'Kedua pemain sedang berhenti sejenak.':'Lanjutkan petualangan kapan saja.'}</p><div className="pause-actions"><button className="pause-resume" onClick={resumeGame}>▶ <span>Resume</span></button><button onClick={showLevelSelect}>▦ <span>Pilih Level</span></button><button onClick={exitGame}>↩ <span>Keluar Game</span></button></div><small>Tekan Esc untuk lanjut bermain</small></section></div>}
        {dialog&&puzzleIndex<3&&<div className="modal-backdrop terminal-backdrop"><section className="puzzle-card terminal-panel" role="dialog" aria-modal="true" aria-label="Teka-teki terminal"><div className="puzzle-head"><span className="terminal-live"><i/> TERMINAL VIRA <small>· TERHUBUNG</small></span><span className="terminal-steps">{[0,1,2].map(index=><b key={index} className={index<=puzzleIndex?'active':''}>{index+1}</b>)}</span><button onClick={()=>{setDialog(false);setFeedback(null);setAnswer('');setShowAnswer(false)}} aria-label="Tutup terminal">×</button></div><div className="puzzle-content"><p className="kicker">KODE {puzzleIndex+1} / 3 · {current.chapter} · {current.location}</p><h2>{current.puzzles[puzzleIndex].prompt}</h2><div className="formula-guide"><span>RUMUS YANG DIPAKAI</span><strong>{current.puzzles[puzzleIndex].formula}</strong><p>{current.puzzles[puzzleIndex].rule}</p><small>{current.puzzles[puzzleIndex].example}</small></div><form onSubmit={submit}><label htmlFor="code-answer">Ketik jawabanmu</label><div className="answer-line"><input id="code-answer" autoFocus autoComplete="off" value={answer} onChange={e=>{setAnswer(e.target.value);if(feedback&&!feedback.correct)setFeedback(null)}} disabled={feedback?.correct} placeholder="Tulis kode di sini"/><button className="main-button" type="submit" disabled={feedback?.correct}>Periksa →</button></div></form>{feedback&&<p role="status" className={`feedback ${feedback.correct?'correct':'incorrect'}`}>{feedback.text}</p>}{hint&&<p className="hint">Petunjuk: {current.puzzles[puzzleIndex].hint}</p>}{showAnswer&&<p className="answer-reveal" role="status"><strong>Jawaban: {current.puzzles[puzzleIndex].answers[0]}</strong><span>Ketik jawaban ini di kotak atas untuk lanjut.</span></p>}<div className="puzzle-actions"><div className="puzzle-help-actions"><button className="text-button" onClick={()=>setHint(v=>!v)}>{hint?'Sembunyikan':'Lihat'} petunjuk</button><button className="text-button" onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?'Sembunyikan':'Lihat'} jawaban</button></div>{feedback?.correct&&<button className="main-button" onClick={nextPuzzle}>{puzzleIndex===2?'Cari berkas dari petunjuk':'Soal berikutnya'} →</button>}</div></div></section></div>}
      </>}
      {help&&<GameGuide onClose={()=>setHelp(false)}/>}
    </main>
    {loading&&<div className="loading-screen" role="status" aria-live="polite"><div className="loading-art"><img src="/branding/jejak-yang-hilang.jpg" alt="Logo Jejak yang Hilang"/><i aria-hidden="true"/></div><p className="loading-kicker">MISI SEDANG DISIAPKAN</p><strong>Menyiapkan petualangan...</strong><div className="loading-track"><i/></div><small>MEMUAT</small></div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
