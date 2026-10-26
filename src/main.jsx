import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {levels,isCorrect,getEnding} from './game';
import {createAudio} from './audio';
import CacheProp from './CacheProp';
import './style.css';
import './cache-props.css';
import './scanner-effects.css';
import './game-over.css';
import './game-hud.css';
import './title-logo.css';

const HERO_NAME = 'Raka';
const PROGRESS_KEY = 'project-echo-progress-v1';
function readProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');
    const completed=Array.isArray(saved.completed)?saved.completed.filter(value=>Number.isInteger(value)&&value>=0&&value<levels.length):[];
    return {unlocked:Math.max(0,Math.min(levels.length-1,Number(saved.unlocked)||0)),completed:[...new Set(completed)]};
  }catch{return {unlocked:0,completed:[]}}
}

function Sprite({id='r',walking=false,direction='right',className=''}){
  const [frame,setFrame]=useState(0);
  useEffect(()=>{
    for(let index=0;index<5;index++){
      const preload=new Image();
      preload.src=`/sprites/${id}-walk-${index}.png`;
    }
  },[id]);
  useEffect(()=>{
    if(!walking){setFrame(0);return}
    const clock=setInterval(()=>setFrame(v=>(v+1)%5),125);
    return()=>clearInterval(clock);
  },[walking]);
  return <img className={`sprite ${className} ${direction==='left'?'face-left':''}`} src={`/sprites/${id}-${walking?`walk-${frame}`:'idle'}.png`} alt="" draggable="false"/>;
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
  const [started,setStarted]=useState(false);
  const [progress,setProgress]=useState(readProgress);
  const [level,setLevel]=useState(0);
  const [x,setX]=useState(9);
  const [walking,setWalking]=useState(false);
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
  const [seconds,setSeconds]=useState(150);
  const [scannerOn,setScannerOn]=useState(false);
  const [help,setHelp]=useState(false);
  const [audioOn,setAudioOn]=useState(true);
  const [fullScreen,setFullScreen]=useState(false);
  const [toast,setToast]=useState('');
  const [hurt,setHurt]=useState(false);
  const [recovering,setRecovering]=useState(false);
  const keys=useRef({left:false,right:false});
  const xRef=useRef(9);
  const invincibleUntil=useRef(0);
  const interactRef=useRef(null);
  const audioRef=useRef(null);
  const lastStep=useRef(0);
  const lastSentMove=useRef(false);
  const wsRef=useRef(null);
  const pickupSeen=useRef(false);
  const firstScreen=useRef(true);
  const restartSeen=useRef(0);
  const paused=mode==='multi'?Boolean(room?.paused):pauseOpen;
  const dossiers=mode==='multi'&&room?room.completed.length+(room.collected&&!room.completed.includes(level)?1:0):progress.completed.length+(collected&&!progress.completed.includes(level)?1:0);
  const unlocked=mode==='multi'?(room?.unlocked??0):progress.unlocked;
  const heroName=mode==='multi'&&roomRole==='guest'?'Vira':HERO_NAME;
  const heroSprite=mode==='multi'&&roomRole==='guest'?'v':'r';
  const peer=mode==='multi'&&room?room.positions?.[roomRole==='host'?'guest':'host']:null;
  const peerName=roomRole==='host'?'VIRA':'RAKA';
  const peerSprite=roomRole==='host'?'v':'r';
  const current=levels[level];
  const map=current.map;
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
  useEffect(()=>{
    if(firstScreen.current){firstScreen.current=false;return}
    setLoading(true);
    const timer=setTimeout(()=>setLoading(false),1600);
    return()=>clearTimeout(timer);
  },[screen]);
  useEffect(()=>{
    if(paused||loading||pickupOpen){keys.current={left:false,right:false};setWalking(false)}
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
    wsRef.current?.close();setRoomError('');setRoomConnected(false);setRoom(null);setRoomCode('');setRoomRole(null);
    const code=roomInput.toUpperCase().trim();
    if(!create&&!code){setRoomError('Masukkan kode ruang dari temanmu.');return}
    const protocol=location.protocol==='https:'?'wss:':'ws:';
    const socket=new WebSocket(`${protocol}//${location.host}/echo-room`);
    wsRef.current=socket;
    socket.onopen=()=>socket.send(JSON.stringify(create?{type:'create'}:{type:'join',code}));
    socket.onmessage=event=>{
      let data;try{data=JSON.parse(event.data)}catch{return}
      if(data.type==='welcome'){
        setRoomRole(data.role);setRoomCode(data.code);setRoomUrl(data.lanUrl||'');setRoomConnected(true);setRoomError('');
      }else if(data.type==='state')setRoom(data);
      else if(data.type==='error'||data.type==='roomClosed'){
        setRoomError(data.message);if(data.type==='roomClosed'){setRoomConnected(false);setRoom(null);setRoomRole(null);setScreen('lobby')}
      }else if(data.type==='wrong')setRoomError(data.message);
    };
    socket.onerror=()=>setRoomError('Server multiplayer belum tersambung. Jalankan game dengan npm.cmd run dev di laptop pembuat ruang.');
    socket.onclose=()=>setRoomConnected(false);
  }
  function leaveRoom(destination='mode'){
    wsRef.current?.close();wsRef.current=null;setRoom(null);setRoomRole(null);setRoomCode('');setRoomConnected(false);
    keys.current={left:false,right:false};setPauseOpen(false);setScreen(typeof destination==='string'?destination:'mode');
  }
  function beginLevel(index){
    if(audioOn){if(!audioRef.current)audioRef.current=createAudio();audioRef.current.start()}
    setStarted(true);setPauseOpen(false);setScreen('game');setLevel(index);xRef.current=roomRole==='guest'?7:9;setX(xRef.current);setWalking(false);
    setDirection('right');setDialog(false);setConversationStep(null);setConversationSeen(false);setPuzzleIndex(0);setAnswer('');
    setFeedback(null);setHint(false);setShowAnswer(false);setHealth(3);
    pickupSeen.current=false;setPickupOpen(false);setCollected(false);setLevelClear(false);setEnding(null);
    setSeconds(150);setToast('');setHurt(false);setRecovering(false);keys.current={left:false,right:false};
  }
  function restartAttempt(){
    const start=roomRole==='guest'&&mode==='multi'?7:9;
    keys.current={left:false,right:false};xRef.current=start;setX(start);setWalking(false);setDirection('right');
    setDialog(false);setConversationStep(null);setConversationSeen(false);setPuzzleIndex(0);
    setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);
    setCollected(false);setPickupOpen(false);pickupSeen.current=false;setLevelClear(false);
    setSeconds(150);setScannerOn(false);setHurt(false);setRecovering(false);
    invincibleUntil.current=Date.now()+1200;
    setToast('Pemindai mendeteksi gerakan. Level dimulai lagi dari awal.');
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
      setEnding(null);setScreen('select');setToast('Level selesai! Kartu level berikutnya sudah terbuka.');return;
    }
    if(room.phase==='game'){
      if(room.puzzleIndex!==puzzleIndex){setPuzzleIndex(room.puzzleIndex);setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);if(room.puzzleIndex===3)setDialog(false)}
      setCollected(room.collected);
      if(room.correct&&room.puzzleIndex<3)setFeedback({correct:true,text:levels[room.level].puzzles[room.puzzleIndex].explain});
    }
  },[mode,room?.phase,room?.level,room?.puzzleIndex,room?.correct,room?.collected,room?.ending,screen,level,puzzleIndex]);

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
    if(nearby('terminal')&&!solved){sound('open');setDialog(true);setFeedback(null);setAnswer('');setShowAnswer(false);return}
    if(nearbyCache!==-1&&!collected){
      if(!solved){setToast('Tempat terkunci · pecahkan kode terminal dahulu');return}
      if(nearbyCache===map.hidden){sound('pickup');if(mode==='multi')sendRoom({type:'collect'});else setCollected(true)}
      else{sound('wrong');setToast('Tidak ada berkas di sini. Ikuti petunjuk misi di atas map.')}
      return;
    }
    if(nearby('door')&&collected){sound('clear');keys.current={left:false,right:false};setWalking(false);if(mode==='multi')sendRoom({type:'clear'});else setLevelClear(true);return}
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
      if(['ArrowLeft','ArrowRight','a','A','d','D','e','E'].includes(e.key) && e.target.tagName!=='INPUT')e.preventDefault();
      if(e.target.tagName==='INPUT')return;
      if(screen==='game'&&!paused&&!pickupOpen&&!loading&&!recovering){
        if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.current.left=true;
        if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.current.right=true;
      }
      if(e.key.toLowerCase()==='e'&&!e.repeat)interactRef.current?.();
      if(e.key==='Escape'&&screen==='game'&&!dialog&&!levelClear&&!loading){
        if(paused)resumeGame();else pauseGame();
      }
    }
    function up(e){if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.current.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.current.right=false}
    function blur(){keys.current.left=false;keys.current.right=false}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)};
  },[screen,paused,pickupOpen,loading,dialog,levelClear,mode,recovering]);
  useEffect(()=>{
    if(screen!=='game'||dialog||talking||levelClear||pickupOpen||ending||paused||loading||recovering)return;
    const loop=setInterval(()=>{
      const active=level>0 && Math.floor(Date.now()/1450)%2===0;
      setScannerOn(active);
      const delta=(keys.current.right?1:0)-(keys.current.left?1:0);
      setWalking(delta!==0);
      if(!delta){if(mode==='multi'&&lastSentMove.current){sendRoom({type:'move',x:xRef.current,direction,walking:false});lastSentMove.current=false}return}
      setDirection(delta<0?'left':'right');
      if(Date.now()-lastStep.current>360){sound('step');lastStep.current=Date.now()}
      let next=Math.max(3,Math.min(97,xRef.current+delta*.32));
      const beams=map.scanners;
      const hit=active&&beams.some(point=>Math.abs(next-point)<1.4)&&Date.now()>invincibleUntil.current;
      if(hit){
        sound('hit');setHurt(true);setRecovering(true);keys.current={left:false,right:false};setWalking(false);
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
      if(mode==='multi'){lastSentMove.current=true;sendRoom({type:'move',x:next,direction:delta<0?'left':'right',walking:true})}
    },40);
    return()=>clearInterval(loop);
  },[screen,level,dialog,talking,levelClear,pickupOpen,ending,audioOn,mode,direction,paused,loading,recovering,health]);
  useEffect(()=>{if(mode==='multi'&&!walking&&lastSentMove.current){sendRoom({type:'move',x:xRef.current,direction,walking:false});lastSentMove.current=false}},[mode,walking]);
  useEffect(()=>{if(screen==='game'&&health===0&&!ending&&!recovering){if(mode==='multi')sendRoom({type:'fail'});else{setEnding('bad');setScreen('ending')}}},[screen,health,ending,mode,recovering]);
  useEffect(()=>{
    if(screen!=='game'||level!==3||talking||levelClear||pickupOpen||ending||paused||loading)return;
    const timer=setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);
    return()=>clearInterval(timer);
  },[screen,level,talking,levelClear,pickupOpen,ending,paused,loading]);
  useEffect(()=>{if(screen==='game'&&level===3&&seconds===0&&!ending){if(mode==='multi')sendRoom({type:'fail'});else{setEnding('bad');setScreen('ending')}}},[screen,level,seconds,ending,mode]);

  function submit(e){
    e.preventDefault();
    if(feedback?.correct)return;
    const puzzle=current.puzzles[puzzleIndex];
    if(!answer.trim())return;
    if(isCorrect(puzzle,answer)){
      sound('correct');
      if(mode==='multi')sendRoom({type:'solve',answer});
      else setFeedback({correct:true,text:puzzle.explain});
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
    setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);
  }
  function nextLevel(){
    setProgress(p=>({
      unlocked:level===3?p.unlocked:Math.max(p.unlocked,level+1),
      completed:p.completed.includes(level)?p.completed:[...p.completed,level]
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
          <p className="title-kicker">MISTERI · MATEMATIKA · PETUALANGAN</p>
          <h1 className="title-accessible-name">Jejak yang Hilang</h1>
          <img className="title-logo" src="/branding/jejak-yang-hilang.jpg" alt="Logo Jejak yang Hilang dengan kaca pembesar dan papan investigasi" fetchPriority="high" />
          <p className="title-story">Vira menemukan kebocoran data dan pergi. Raka mengikuti pesan berkode yang ia tinggalkan untuk mengungkap kebenarannya.</p>
          <div className="title-actions"><button className="title-play" onClick={()=>setScreen('mode')}>▶ PLAY</button><button className="title-guide" onClick={()=>setHelp(true)}>CARA BERMAIN</button></div>
          <p className="title-subline">4 LEVEL · 2 CARA BERMAIN · 1 MISTERI</p>
        </div>
        <button className="title-sound" onClick={toggleAudio} aria-label={audioOn?'Matikan suara':'Nyalakan suara'}>{audioOn?'♫ Suara nyala':'♪ Suara mati'}</button>
      </section> : screen==='mode' ? <section className="mode-screen" aria-label="Pilih cara bermain">
        <button className="game-back" onClick={()=>setScreen('poster')}>← Kembali</button>
        <div className="mode-heading"><p>JEJAK YANG HILANG</p><h1>Pilih cara bermain</h1><span>Petualangan yang sama, sendiri atau bersama teman.</span></div>
        <div className="mode-options">
          <button onClick={()=>{setMode('single');setScreen('select')}}><span className="mode-icon">◈</span><strong>Single Player</strong><small>Jalani misi sebagai Raka di laptop ini.</small><b>MAIN SENDIRI →</b></button>
          <button onClick={()=>{setMode('multi');setScreen('lobby')}}><span className="mode-icon">◆ ◆</span><strong>Multiplayer</strong><small>Raka dan Vira bekerja sama dari dua laptop secara live.</small><b>MAIN BERSAMA →</b></button>
        </div>
      </section> : screen==='lobby' ? <section className="lobby-screen" aria-label="Ruang multiplayer">
        <button className="game-back" onClick={leaveRoom}>← Pilih mode</button>
        <div className="lobby-panel"><p className="title-kicker">MULTIPLAYER · 2 PEMAIN</p><h1>{roomCode?'Ruang siap':'Main bersama teman'}</h1>
          {roomConnected&&roomCode ? <>
            <div className="room-code"><small>KODE RUANG</small><strong>{roomCode}</strong></div>
            <p className="lobby-hint">{roomRole==='host'?'Kirim kode ini ke temanmu. Keduanya harus membuka game di jaringan Wi-Fi yang sama.':'Kamu bergabung sebagai Vira. Tunggu Raka memilih level.'}</p>
            {roomRole==='host'&&roomUrl&&<label className="room-link">Alamat untuk laptop teman<input value={roomUrl} readOnly onFocus={e=>e.target.select()} onClick={e=>e.target.select()}/></label>}
            <div className="room-players"><span>● Raka {room?.players?.host?'siap':'menunggu'}</span><span>● Vira {room?.players?.guest?'siap':'menunggu'}</span></div>
            {roomRole==='host'&&<button className="title-play" disabled={!room?.players?.guest} onClick={()=>setScreen('select')}>PILIH LEVEL →</button>}
            {roomRole==='guest'&&<p className="waiting-note">Menunggu Raka memulai misi…</p>}
          </> : <>
            <p className="lobby-hint">Pemain pertama membuat ruang. Pemain kedua membuka game dari laptop lain lalu memasukkan kodenya.</p>
            <button className="title-play" onClick={()=>connectRoom(true)}>BUAT RUANG BARU</button>
            <div className="join-divider">ATAU MASUKKAN KODE TEMAN</div>
            <form className="join-form" onSubmit={event=>{event.preventDefault();connectRoom(false)}}><input aria-label="Kode ruang" value={roomInput} maxLength={6} onChange={event=>setRoomInput(event.target.value.toUpperCase())} placeholder="CONTOH: A7K2QP"/><button type="submit">GABUNG →</button></form>
          </>}
          {roomError&&<p className="room-error" role="alert">{roomError}</p>}
        </div>
      </section> : screen==='select' ? <section className="level-select" aria-label="Pilih level">
        <div className="level-select-heading"><button className="menu-back" onClick={()=>mode==='multi'?setScreen('lobby'):setScreen('mode')}>← {mode==='multi'?'Ruang':'Pilih mode'}</button><p>JEJAK YANG HILANG · {mode==='multi'?`RUANG ${roomCode}`:'SINGLE PLAYER'}</p><h1>Pilih level</h1><span>{mode==='multi'&&roomRole==='guest'?'Raka memilih level untuk kalian berdua.':'Lokasi berikutnya terbuka setelah berkas di lokasi sebelumnya diamankan.'}</span></div>
        <div className="level-cards">{levels.map((item,index)=>{const locked=index>unlocked;const done=(mode==='multi'?room?.completed:progress.completed)?.includes(index);return <button key={item.name} className={`level-card ${locked?'locked':''} ${done?'complete':''}`} onClick={()=>startLevel(index)} disabled={locked||(mode==='multi'&&roomRole!=='host')}><div className="level-card-art" style={{backgroundImage:`url('/scenes/room-${index}.svg')`}}/><div className="level-card-content"><span className="level-number">{String(index+1).padStart(2,'0')}</span><div><small>{item.chapter}</small><strong>{item.name}</strong><em>{item.location}</em></div><b>{locked?'🔒 TERKUNCI':done?'✓ SELESAI':mode==='multi'&&roomRole==='guest'?'MENUNGGU':'▶ MAIN'}</b></div></button>})}</div>
        <p className="level-select-foot">BERKAS TERKUMPUL {dossiers}/4 · LEVEL TERBUKA {unlocked+1}/4</p>
      </section> : ending==='bad' ? <section className="game-over-screen" aria-label="Misi gagal" style={{'--failure-scene':`url('/scenes/room-${level}.svg')`}}>
        <div className="game-over-stage"><div className="failure-orbit"/><div className="failure-signal">×<span>CONNECTION LOST</span></div><img src={`/sprites/${heroSprite}-idle.png`} alt={heroName}/><div className="failure-floor"/><span className="failure-stage-caption">JEJAK YANG HILANG · {current.location.toUpperCase()}</span></div>
        <div className="game-over-copy"><p className="failure-kicker"><i/> GAME OVER · LEVEL {String(level+1).padStart(2,'0')} / 04</p><h1>MISI<br/><em>TERHENTI.</em></h1><p className="failure-reason">{seconds===0?'Waktu operasi habis sebelum bukti terkirim. Jalur ini masih bisa dicoba lagi.':health===0?`${heroName} terdeteksi terlalu sering oleh pemindai. Petunjuk Vira masih menunggu untuk dipecahkan.`:'Operasi tim terhenti. Susun kembali langkah kalian dan coba lagi.'}</p><div className="failure-progress"><span><small>LOKASI</small><strong>{current.name}</strong></span><span><small>BERKAS</small><strong>{dossiers} / 4 diamankan</strong></span></div><div className="failure-actions"><button className="failure-retry" onClick={()=>{if(mode!=='multi')setMistakes(0);startLevel(level)}} disabled={mode==='multi'&&roomRole!=='host'}>↻ <span>{mode==='multi'&&roomRole!=='host'?'Menunggu Raka':'Ulangi Level'}</span> →</button><button className="failure-levels" onClick={()=>{setMistakes(0);showLevelSelect()}}>Pilih Level</button></div><small className="failure-tip">{mode==='multi'?'Kalian akan mengulang level bersama.':'Nyawa dan soal di level ini akan dimulai dari awal.'}</small></div>
      </section> : ending ? <section className="result-card"><div className="result-actor"><Sprite id="r" walking/></div><div><p className="kicker">{endingInfo[ending].eyebrow}</p><h1>{endingInfo[ending].title}</h1><p>{endingInfo[ending].description}</p><div className="result-stats"><span>Berkas {dossiers}/4</span><span>Kesalahan {mode==='multi'?room?.mistakes:mistakes}</span></div><button className="main-button" onClick={()=>{setMistakes(0);showLevelSelect()}}>Pilih level →</button></div></section> : <>
        <section className="game-frame" aria-label="Bingkai permainan Jejak yang Hilang">
        <div className="game-top"><div className="hud-title"><span className="hud-level-badge" aria-hidden="true">{String(level+1).padStart(2,'0')}</span><div><p className="kicker">JEJAK YANG HILANG · {current.chapter}{mode==='multi'?` · RUANG ${roomCode}`:''}</p><h1>{current.name}</h1></div></div><div className="hud-right"><div className="game-stats"><div className="life-frame" aria-label={`Nyawa ${health} dari 3`}><small>NYAWA {mode==='multi'?heroName.toUpperCase():''}</small><strong>{[0,1,2].map(i=><i key={i} className={i<health?'alive':'lost'}>♥</i>)}</strong></div><div className="file-frame"><small>BERKAS</small><strong>▣ {dossiers}/4</strong></div>{level===3&&<div className={`timer-frame ${seconds<35?'urgent':''}`}><small>WAKTU</small><strong>⏱ {seconds}s</strong></div>}</div><div className="game-menu"><button onClick={pauseGame} aria-label="Buka menu jeda" title="Jeda"><span aria-hidden="true">Ⅱ</span><span className="menu-text">Jeda</span></button><button onClick={toggleAudio} aria-label={audioOn?'Matikan suara':'Nyalakan suara'} title={audioOn?'Matikan suara':'Nyalakan suara'}>{audioOn?'♫':'♪'}</button><button onClick={toggleFullScreen} aria-label={fullScreen?'Keluar layar penuh':'Layar penuh'} title={fullScreen?'Keluar layar penuh':'Layar penuh'}>{fullScreen?'⤢':'⛶'}</button><button onClick={()=>setHelp(v=>!v)} aria-label="Cara main" title="Cara main">?</button></div></div></div>
        <div className="mission-note"><b className="mission-label">{!solved?'MISI':collected?'TUJUAN':'PETUNJUK'}</b><span>{!solved?'Cari terminal di area ini dan pecahkan tiga kode.':collected?'Berkas aman. Kembali ke pintu keluar di awal area.':map.clue}</span><div className="journey-meter" aria-hidden="true"><i style={{width:`${x}%`}}/></div><small>{Math.round(x)}% area</small></div>
        <section className={`scene scene-${level} ${hurt?'hurt':''}`} aria-label={`Area permainan ${current.location}`}>
          <div className="scene-world" style={{left:`${camera}%`}}>
            <div className="scene-backdrop"><div className="scene-title">{current.location}</div></div>
            <div className="atmosphere"><i/><i/><i/><i/><i/></div>
            <div className="scene-ground"/>
            <div className={`scene-npc ${level===1?'hologram':''} ${talking?'in-conversation':''}`} style={{left:`${map.npc}%`}}><span>{current.speaker}</span><Sprite id={current.npc} direction={npcFacing}/><i className="foot-shadow"/>{nearby('npc')&&!talking&&<b>TEKAN E</b>}</div>
            <div className={`object terminal-object ${solved?'terminal-solved':''} ${nearby('terminal')&&!solved?'terminal-near':''}`} style={{left:`${map.terminal}%`}}><div className="terminal-device" aria-hidden="true"><div className="terminal-screen"><small>VIRA / {String(level+1).padStart(2,'0')}</small><b>{solved?'ACCESS OK':'CODE LOCKED'}</b><span className="terminal-code">{solved?'▰▰▰▰▰':'▰▰▱▱▱'}</span><span className="terminal-scanline"/></div><div className="terminal-keyboard"><i/><i/><i/><span>●</span></div></div><span className="object-name">TERMINAL KODE</span>{!solved&&nearby('terminal')&&<i>TEKAN E</i>}</div>
            {map.caches.map((cache,index)=><div key={cache.name} className={`object cache-object cache-${index} ${solved&&!collected?'searchable':''} ${collected&&index===map.hidden?'taken':''}`} style={{left:`${cache.x}%`}}><CacheProp kind={cache.kind}/><span className="cache-name">{cache.name}</span>{nearbyCache===index&&!collected&&<i>TEKAN E</i>}</div>)}
            <div className={`object door-object ${collected?'ready':''}`} style={{left:`${map.door}%`}}><span className="object-icon">⇥</span><span>KELUAR</span>{nearby('door')&&<i>TEKAN E</i>}</div>
            {map.scanners.map(point=><div key={point} className={`scanner ${scannerOn?'on':''}`} style={{left:`${point}%`}} aria-label={`Pemindai ${scannerOn?'aktif':'siaga'}`}><div className="scanner-head"><i/><b/><i/></div><div className="scanner-beam"/><div className="scanner-base"/><span>PEMINDAI</span></div>)}
            {mode==='multi'&&room?.players?.[roomRole==='host'?'guest':'host']&&peer&&<div className="player peer-player" style={{left:`${peer.x}%`}}><span>{peerName}</span><Sprite id={peerSprite} walking={peer.walking} direction={peer.direction}/><i className="foot-shadow"/></div>}
            <div className={`player ${hurt?'player-hit':''}`} style={{left:`${x}%`}}><span>{heroName.toUpperCase()}</span><Sprite id={heroSprite} walking={walking} direction={heroFacing}/><i className="foot-shadow"/></div>
          </div>
          {recovering&&<div className="scanner-impact" role="status"><div className="impact-ring"/><strong>TERDETEKSI</strong><span>{health>0?'Mengulang level dari awal...':'Nyawa habis...'}</span></div>}
          {talking&&<div className={`encounter-bubble ${current.dialogue[conversationStep].who==='r'?'from-r':'from-npc'}`} style={{'--bubble-x':`${speakerOnScreen}%`}} role="dialog" aria-label="Percakapan tokoh"><div className="encounter-heading"><span>PERTEMUAN · {conversationStep+1}/{current.dialogue.length}</span><strong>{current.dialogue[conversationStep].who==='r'?HERO_NAME:current.speaker}</strong></div><p>{current.dialogue[conversationStep].text}</p><button onClick={advanceConversation}>{conversationStep===current.dialogue.length-1?'Mulai misi':'Lanjut'} →</button></div>}
          {toast&&<div className="game-toast" role="status">{toast}</div>}
        </section>
        <div className="control-strip"><div className="movement"><button aria-label="Jalan ke kiri" onPointerDown={e=>{e.preventDefault();keys.current.left=true}} onPointerUp={()=>keys.current.left=false} onPointerCancel={()=>keys.current.left=false} onPointerLeave={()=>keys.current.left=false}>←</button><button aria-label="Jalan ke kanan" onPointerDown={e=>{e.preventDefault();keys.current.right=true}} onPointerUp={()=>keys.current.right=false} onPointerCancel={()=>keys.current.right=false} onPointerLeave={()=>keys.current.right=false}>→</button><span>Gunakan ← → atau A D untuk berjalan</span></div><div><button className="interact-button" onClick={interact} disabled={!marker}>{actionLabel || 'Dekati objek untuk berinteraksi'} <kbd>E</kbd></button></div></div>
        </section>
        {pickupOpen&&<div className="evidence-reveal" role="dialog" aria-modal="true" aria-label="Berkas ditemukan"><div className="evidence-particles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="evidence-card"><p className="evidence-kicker">BUKTI DITEMUKAN · {current.dossier.code}</p><div className="evidence-art" aria-hidden="true"><div className="evidence-glow"/><div className="evidence-folder-back"/><div className="evidence-page"><span>CASE 047</span><i/><i/><i/></div><div className="evidence-folder-front"><b>▣</b><span>{current.dossier.code}</span></div></div><h2>{current.dossier.title}</h2><p>{current.dossier.detail}</p><button onClick={()=>setPickupOpen(false)}>Simpan berkas dan lanjut →</button></div></div>}
        {levelClear&&<div className="modal-backdrop"><section className="clear-card" role="dialog" aria-modal="true" aria-label="Level selesai"><p className="kicker">LEVEL {level+1} SELESAI</p><h2>Berkas diamankan.</h2><p>Kode terpecahkan dan jalur keluar terbuka. {level===3?'Saatnya mengirim bukti.':'Level berikutnya kini terbuka di layar pilih level.'}</p><button className="main-button" onClick={nextLevel}>{level===3?'Lihat akhir cerita':'Pilih level berikutnya'} →</button></section></div>}
        {paused&&<div className="pause-backdrop"><section className="pause-card" role="dialog" aria-modal="true" aria-label="Menu jeda"><span className="pause-symbol">Ⅱ</span><p className="pause-kicker">JEJAK YANG HILANG · LEVEL {String(level+1).padStart(2,'0')}</p><h2>Permainan dijeda</h2><p className="pause-caption">{mode==='multi'?'Kedua pemain sedang berhenti sejenak.':'Lanjutkan petualangan kapan saja.'}</p><div className="pause-actions"><button className="pause-resume" onClick={resumeGame}>▶ <span>Resume</span></button><button onClick={showLevelSelect}>▦ <span>Pilih Level</span></button><button onClick={exitGame}>↩ <span>Keluar Game</span></button></div><small>Tekan Esc untuk lanjut bermain</small></section></div>}
        {dialog&&puzzleIndex<3&&<div className="modal-backdrop terminal-backdrop"><section className="puzzle-card terminal-panel" role="dialog" aria-modal="true" aria-label="Teka-teki terminal"><div className="puzzle-head"><span className="terminal-live"><i/> TERMINAL VIRA <small>· TERHUBUNG</small></span><span className="terminal-steps">{[0,1,2].map(index=><b key={index} className={index<=puzzleIndex?'active':''}>{index+1}</b>)}</span><button onClick={()=>{setDialog(false);setFeedback(null);setAnswer('');setShowAnswer(false)}} aria-label="Tutup terminal">×</button></div><div className="puzzle-content"><p className="kicker">KODE {puzzleIndex+1} / 3 · {current.chapter} · {current.location}</p><h2>{current.puzzles[puzzleIndex].prompt}</h2><div className="formula-guide"><span>RUMUS YANG DIPAKAI</span><strong>{current.puzzles[puzzleIndex].formula}</strong><p>{current.puzzles[puzzleIndex].rule}</p><small>{current.puzzles[puzzleIndex].example}</small></div><form onSubmit={submit}><label htmlFor="code-answer">Ketik jawabanmu</label><div className="answer-line"><input id="code-answer" autoFocus autoComplete="off" value={answer} onChange={e=>{setAnswer(e.target.value);if(feedback&&!feedback.correct)setFeedback(null)}} disabled={feedback?.correct} placeholder="Tulis kode di sini"/><button className="main-button" type="submit" disabled={feedback?.correct}>Periksa →</button></div></form>{feedback&&<p role="status" className={`feedback ${feedback.correct?'correct':'incorrect'}`}>{feedback.text}</p>}{hint&&<p className="hint">Petunjuk: {current.puzzles[puzzleIndex].hint}</p>}{showAnswer&&<p className="answer-reveal" role="status"><strong>Jawaban: {current.puzzles[puzzleIndex].answers[0]}</strong><span>Ketik jawaban ini di kotak atas untuk lanjut.</span></p>}<div className="puzzle-actions"><div className="puzzle-help-actions"><button className="text-button" onClick={()=>setHint(v=>!v)}>{hint?'Sembunyikan':'Lihat'} petunjuk</button><button className="text-button" onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?'Sembunyikan':'Lihat'} jawaban</button></div>{feedback?.correct&&<button className="main-button" onClick={nextPuzzle}>{puzzleIndex===2?'Cari berkas dari petunjuk':'Soal berikutnya'} →</button>}</div></div></section></div>}
      </>}
      {help&&<div className="help-overlay"><section className="help-card"><button className="close-help" onClick={()=>setHelp(false)} aria-label="Tutup panduan">×</button><p className="kicker">PANDUAN AGEN</p><h2>Cara bermain</h2><ol><li>Tekan <b>Play</b>, lalu pilih <b>Single Player</b> atau <b>Multiplayer</b>. Dalam multiplayer, Raka membuat ruang dan Vira masuk dari laptop lain memakai kode yang tampil.</li><li>Pilih level yang sudah terbuka. Dalam multiplayer, Raka memilih level dan Vira ikut otomatis.</li><li>Berjalan dengan tombol <b>← →</b> atau <b>A D</b>. Di layar sentuh, tahan tombol panah di bawah arena.</li><li>Dekati tokoh atau <b>terminal</b>, lalu tekan <b>E</b> atau tombol interaksi.</li><li>Gunakan <b>rumus dan contoh</b> untuk menjawab tiga teka-teki. Dalam multiplayer, soal dan berkas menjadi progres bersama.</li><li>Ikuti petunjuk berkas, periksa tempat tersembunyi, lalu kembali ke pintu keluar. Hindari pemindai merah.</li></ol><p>Jawaban salah atau terkena pemindai mengurangi nyawa. Level terakhir memiliki batas 150 detik.</p><button className="main-button" onClick={()=>setHelp(false)}>Mengerti →</button></section></div>}
    </main>
    {loading&&<div className="loading-screen" role="status" aria-live="polite"><div className="loading-emblem"><span>E</span><i/></div><p className="loading-kicker">JEJAK YANG HILANG</p><strong>Menyiapkan petualangan...</strong><div className="loading-track"><i/></div><small>MEMUAT</small></div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
