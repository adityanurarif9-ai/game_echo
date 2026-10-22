import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {levels,isCorrect,getEnding} from './game';
import {createAudio} from './audio';
import './style.css';

const NODES = {npc:16,terminal:34,dossier:56,door:91};
const HERO_NAME = 'Raka';

function Sprite({id='r',walking=false,direction='right',className=''}){
  const [frame,setFrame]=useState(0);
  useEffect(()=>{
    if(!walking){setFrame(0);return}
    const clock=setInterval(()=>setFrame(v=>(v+1)%5),125);
    return()=>clearInterval(clock);
  },[walking]);
  return <img className={`sprite ${className} ${direction==='left'?'face-left':''}`} src={`/sprites/${id}-${walking?`walk-${frame}`:'idle'}.png`} alt="" draggable="false"/>;
}

function App(){
  const [started,setStarted]=useState(false);
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
  const [dossiers,setDossiers]=useState(0);
  const [collected,setCollected]=useState(false);
  const [levelClear,setLevelClear]=useState(false);
  const [ending,setEnding]=useState(null);
  const [seconds,setSeconds]=useState(150);
  const [scannerOn,setScannerOn]=useState(false);
  const [help,setHelp]=useState(false);
  const [audioOn,setAudioOn]=useState(true);
  const [toast,setToast]=useState('');
  const [hurt,setHurt]=useState(false);
  const keys=useRef({left:false,right:false});
  const xRef=useRef(9);
  const invincibleUntil=useRef(0);
  const interactRef=useRef(null);
  const audioRef=useRef(null);
  const lastStep=useRef(0);
  const current=levels[level];
  const solved=puzzleIndex>=current.puzzles.length;
  const nearby=(node)=>Math.abs(x-NODES[node])<(node==='npc'?6:7);
  const talking=conversationStep!==null;
  const heroFacing=talking?(x<NODES.npc?'right':'left'):direction;
  const npcFacing=x<NODES.npc?'left':'right';
  const sound=kind=>{if(audioOn)audioRef.current?.effect(kind)};
  function toggleAudio(){
    if(audioOn){audioRef.current?.stop();setAudioOn(false)}
    else{if(!audioRef.current)audioRef.current=createAudio();audioRef.current.start();setAudioOn(true)}
  }
  useEffect(()=>()=>audioRef.current?.dispose(),[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(timer)},[toast]);

  function reset(){
    if(audioOn){if(!audioRef.current)audioRef.current=createAudio();audioRef.current.start()}
    setStarted(true);setLevel(0);xRef.current=9;setX(9);setWalking(false);
    setDirection('right');setDialog(false);setConversationStep(null);setConversationSeen(false);setPuzzleIndex(0);setAnswer('');
    setFeedback(null);setHint(false);setShowAnswer(false);setHealth(3);setMistakes(0);
    setDossiers(0);setCollected(false);setLevelClear(false);setEnding(null);
    setSeconds(150);setToast('');setHurt(false);keys.current={left:false,right:false};
  }
  function advanceConversation(){
    if(conversationStep===null)return;
    if(conversationStep===current.dialogue.length-1){setConversationStep(null);setConversationSeen(true)}
    else setConversationStep(v=>v+1);
  }
  function interact(){
    if(talking){advanceConversation();return}
    if(!started||dialog||levelClear||ending)return;
    if(nearby('npc')&&(!conversationSeen||!nearby('terminal'))){sound('open');keys.current={left:false,right:false};setWalking(false);setConversationStep(0);return}
    if(nearby('terminal')&&!solved){sound('open');setDialog(true);setFeedback(null);setAnswer('');setShowAnswer(false);return}
    if(nearby('dossier')&&solved&&!collected){sound('pickup');setToast('Berkas berhasil diamankan');setCollected(true);setDossiers(n=>n+1);return}
    if(nearby('door')&&collected){sound('clear');keys.current={left:false,right:false};setWalking(false);setLevelClear(true)}
  }
  interactRef.current=interact;
  useEffect(()=>{
    if(started&&!conversationSeen&&!talking&&!dialog&&!levelClear&&!ending&&nearby('npc')){
      keys.current={left:false,right:false};setWalking(false);setConversationStep(0);
    }
  },[started,x,level,conversationSeen,talking,dialog,levelClear,ending]);
  useEffect(()=>{
    function down(e){
      if(['ArrowLeft','ArrowRight','a','A','d','D','e','E'].includes(e.key) && e.target.tagName!=='INPUT')e.preventDefault();
      if(e.target.tagName==='INPUT')return;
      if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.current.left=true;
      if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.current.right=true;
      if(e.key.toLowerCase()==='e'&&!e.repeat)interactRef.current?.();
    }
    function up(e){if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.current.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.current.right=false}
    function blur(){keys.current.left=false;keys.current.right=false}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)};
  },[]);
  useEffect(()=>{
    if(!started||dialog||talking||levelClear||ending)return;
    const loop=setInterval(()=>{
      const active=level>0 && Math.floor(Date.now()/1450)%2===0;
      setScannerOn(active);
      const delta=(keys.current.right?1:0)-(keys.current.left?1:0);
      setWalking(delta!==0);
      if(!delta)return;
      setDirection(delta<0?'left':'right');
      if(Date.now()-lastStep.current>360){sound('step');lastStep.current=Date.now()}
      let next=Math.max(4,Math.min(96,xRef.current+delta*.55));
      const beams=level>1?[44,73]:level===1?[72]:[];
      const hit=active&&beams.some(point=>Math.abs(next-point)<1.4)&&Date.now()>invincibleUntil.current;
      if(hit){
        sound('hit');setHurt(true);setTimeout(()=>setHurt(false),380);
        invincibleUntil.current=Date.now()+1300;
        next=Math.max(5,xRef.current-delta*7);
        setHealth(h=>Math.max(0,h-1));
      }
      xRef.current=next;setX(next);
    },40);
    return()=>clearInterval(loop);
  },[started,level,dialog,talking,levelClear,ending,audioOn]);
  useEffect(()=>{if(started&&health===0&&!ending)setEnding('bad')},[started,health,ending]);
  useEffect(()=>{
    if(!started||level!==3||talking||levelClear||ending)return;
    const timer=setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);
    return()=>clearInterval(timer);
  },[started,level,talking,levelClear,ending]);
  useEffect(()=>{if(started&&level===3&&seconds===0&&!ending)setEnding('bad')},[started,level,seconds,ending]);

  function submit(e){
    e.preventDefault();
    if(feedback?.correct)return;
    const puzzle=current.puzzles[puzzleIndex];
    if(!answer.trim())return;
    if(isCorrect(puzzle,answer)){sound('correct');setFeedback({correct:true,text:puzzle.explain});return}
    sound('wrong');
    setMistakes(v=>v+1);
    setHealth(v=>Math.max(0,v-1));
    setFeedback({correct:false,text:'Kode belum cocok. Periksa urutan hitungnya, lalu coba lagi.'});
  }
  function nextPuzzle(){
    if(puzzleIndex===2){setPuzzleIndex(3);setDialog(false)}
    else setPuzzleIndex(v=>v+1);
    setAnswer('');setFeedback(null);setHint(false);setShowAnswer(false);
  }
  function nextLevel(){
    if(level===3){setEnding(getEnding({dossiers,mistakes,escaped:true}));return}
    setLevel(v=>v+1);xRef.current=9;setX(9);setWalking(false);
    setPuzzleIndex(0);setCollected(false);setLevelClear(false);setDialog(false);setConversationStep(null);setConversationSeen(false);
    setFeedback(null);setHint(false);setShowAnswer(false);setHealth(3);setSeconds(150);setToast('Level baru · cari terminal');
  }
  const marker=nearby('npc')&&!conversationSeen?'npc':nearby('terminal')&&!solved?'terminal':nearby('npc')?'npc':nearby('dossier')&&solved&&!collected?'dossier':nearby('door')&&collected?'door':null;
  const actionLabel=talking?'Lanjutkan percakapan':{npc:conversationSeen?'Bicara lagi':'Bicara dengan tokoh',terminal:'Buka terminal',dossier:'Ambil berkas',door:'Buka pintu'}[marker];
  const endingInfo={
    true:{eyebrow:'TRUE ENDING',title:'Kebenaran terungkap.',description:'Empat berkas lengkap. Raka lolos, bukti terkirim, dan lokasi Vira akhirnya terungkap.'},
    neutral:{eyebrow:'NEUTRAL ENDING',title:'Raka berhasil lolos.',description:'Bukti terkirim, tetapi terlalu banyak kesalahan membuat beberapa data rusak. Kasus masih terbuka.'},
    bad:{eyebrow:'BAD ENDING',title:'Transmisi terputus.',description:'Sistem mengunci akses sebelum misi selesai. Ulangi operasi, gunakan petunjuk, dan amati pemindai.'}
  };
  return <div className="app" style={{'--level-color':current.color}}>
    <header className="site-header"><div className="brand"><span className="brand-icon">E</span><span>PROJECT <b>ECHO</b></span></div><div className="header-actions"><button className="audio-button" onClick={toggleAudio} aria-pressed={audioOn}>{audioOn?'♫ Suara nyala':'♫ Suara mati'}</button><button className="quiet-button" onClick={()=>setHelp(v=>!v)}>Cara main <span>?</span></button></div></header>
    <main className="shell">
      {!started ? <section className="landing"><div className="landing-copy"><p className="kicker">OPERASI 047 · MISI INTERAKTIF</p><h1>Jejak terakhir<br/><em>Agen Vira.</em></h1><p>Raka harus menjelajahi empat lokasi, memecahkan kode matematika, dan membawa bukti keluar sebelum sistem menghapusnya.</p><div className="landing-actions"><button className="main-button" onClick={reset}>Mulai bermain <span>→</span></button><span>Berjalan · pecahkan kode · cari jalan keluar</span></div><div className="landing-chips"><span>4 level</span><span>12 teka-teki</span><span>3 akhir cerita</span></div></div><div className="landing-visual"><div className="visual-glow"/><div className="visual-floor"/><Sprite id="r" walking className="landing-actor"/><div className="visual-caption"><small>FILE 047</small><strong>RAKA · AGEN R</strong><span>Investigasi dimulai di sini</span></div></div></section> : ending ? <section className="result-card"><div className="result-actor"><Sprite id="r" walking={ending!=='bad'}/></div><div><p className="kicker">{endingInfo[ending].eyebrow}</p><h1>{endingInfo[ending].title}</h1><p>{endingInfo[ending].description}</p><div className="result-stats"><span>Berkas {dossiers}/4</span><span>Kesalahan {mistakes}</span></div><button className="main-button" onClick={reset}>Main lagi →</button></div></section> : <>
        <div className="game-top"><div><p className="kicker">LEVEL {String(level+1).padStart(2,'0')} / 04 · {current.chapter}</p><h1>{current.name}</h1><p>{current.goal}</p></div><div className="game-stats"><span>♥ {health}/3</span><span>▣ {dossiers}/4 berkas</span>{level===3&&<strong className={seconds<35?'urgent':''}>⏱ {seconds}s</strong>}</div></div>
        <div className="level-track" aria-label="Kemajuan level">{levels.map((item,i)=><div key={item.name} className={i===level?'selected':i<level?'done':''}><span>{i<level?'✓':i+1}</span><small>{item.name}</small></div>)}</div>
        <section className={`scene scene-${level} ${hurt?'hurt':''}`} aria-label={`Area permainan ${current.location}`}>
          <div className="scene-backdrop"><div className="scene-title">{current.location}</div></div>
          <div className="atmosphere"><i/><i/><i/><i/><i/></div>
          <div className="scene-ground"/>
          <div className={`scene-npc ${level===1?'hologram':''} ${talking?'in-conversation':''}`} style={{left:`${NODES.npc}%`}}><span>{current.speaker}</span><Sprite id={current.npc} direction={npcFacing}/><i className="foot-shadow"/>{nearby('npc')&&!talking&&<b>TEKAN E</b>}</div>
          <div className="object terminal-object" style={{left:`${NODES.terminal}%`}}><span className="object-icon">⌘</span><span>TERMINAL</span>{!solved&&nearby('terminal')&&<i>TEKAN E</i>}</div>
          <div className={`object dossier-object ${solved?'ready':''} ${collected?'taken':''}`} style={{left:`${NODES.dossier}%`}}><span className="object-icon">▣</span><span>{collected?'DIAMBIL':'BUKTI'}</span>{solved&&!collected&&nearby('dossier')&&<i>TEKAN E</i>}</div>
          <div className={`object door-object ${collected?'ready':''}`} style={{left:`${NODES.door}%`}}><span className="object-icon">⇥</span><span>KELUAR</span>{collected&&nearby('door')&&<i>TEKAN E</i>}</div>
          {(level>1?[44,73]:level===1?[72]:[]).map(point=><div key={point} className={`scanner ${scannerOn?'on':''}`} style={{left:`${point}%`}}><span>PEMINDAI</span></div>)}
          <div className="player" style={{left:`${x}%`}}><span>{HERO_NAME.toUpperCase()}</span><Sprite id="r" walking={walking} direction={heroFacing}/><i className="foot-shadow"/></div>
          {talking&&<div className={`encounter-bubble ${current.dialogue[conversationStep].who==='r'?'from-r':'from-npc'}`} role="dialog" aria-label="Percakapan tokoh"><div className="encounter-heading"><span>PERTEMUAN · {conversationStep+1}/{current.dialogue.length}</span><strong>{current.dialogue[conversationStep].who==='r'?HERO_NAME:current.speaker}</strong></div><p>{current.dialogue[conversationStep].text}</p><button onClick={advanceConversation}>{conversationStep===current.dialogue.length-1?'Mulai misi':'Lanjut'} →</button></div>}
          {toast&&<div className="game-toast" role="status">{toast}</div>}
        </section>
        <div className="control-strip"><div className="movement"><button aria-label="Jalan ke kiri" onPointerDown={e=>{e.preventDefault();keys.current.left=true}} onPointerUp={()=>keys.current.left=false} onPointerCancel={()=>keys.current.left=false} onPointerLeave={()=>keys.current.left=false}>←</button><button aria-label="Jalan ke kanan" onPointerDown={e=>{e.preventDefault();keys.current.right=true}} onPointerUp={()=>keys.current.right=false} onPointerCancel={()=>keys.current.right=false} onPointerLeave={()=>keys.current.right=false}>→</button><span>Gunakan ← → atau A D untuk berjalan</span></div><div><button className="interact-button" onClick={interact} disabled={!marker}>{actionLabel || 'Dekati objek untuk berinteraksi'} <kbd>E</kbd></button></div></div>
        {levelClear&&<div className="modal-backdrop"><section className="clear-card" role="dialog" aria-modal="true" aria-label="Level selesai"><p className="kicker">LEVEL {level+1} SELESAI</p><h2>Berkas diamankan.</h2><p>Kode terpecahkan dan jalur keluar terbuka. {level===3?'Saatnya mengirim bukti.':'Lanjutkan penyelidikan ke lokasi berikutnya.'}</p><button className="main-button" onClick={nextLevel}>{level===3?'Lihat akhir cerita':'Level berikutnya'} →</button></section></div>}
        {dialog&&puzzleIndex<3&&<div className="modal-backdrop"><section className="puzzle-card" role="dialog" aria-modal="true" aria-label="Teka-teki terminal"><div className="puzzle-head"><span>TERMINAL / {puzzleIndex+1} DARI 3</span><button onClick={()=>{setDialog(false);setFeedback(null);setAnswer('');setShowAnswer(false)}} aria-label="Tutup terminal">×</button></div><div className="puzzle-content"><p className="kicker">{current.chapter} · {current.location}</p><h2>{current.puzzles[puzzleIndex].prompt}</h2><div className="formula-guide"><span>RUMUS YANG DIPAKAI</span><strong>{current.puzzles[puzzleIndex].formula}</strong><p>{current.puzzles[puzzleIndex].rule}</p><small>{current.puzzles[puzzleIndex].example}</small></div><form onSubmit={submit}><label htmlFor="code-answer">Ketik jawabanmu</label><div className="answer-line"><input id="code-answer" autoFocus autoComplete="off" value={answer} onChange={e=>{setAnswer(e.target.value);if(feedback&&!feedback.correct)setFeedback(null)}} disabled={feedback?.correct} placeholder="Tulis kode di sini"/><button className="main-button" type="submit" disabled={feedback?.correct}>Periksa →</button></div></form>{feedback&&<p role="status" className={`feedback ${feedback.correct?'correct':'incorrect'}`}>{feedback.text}</p>}{hint&&<p className="hint">Petunjuk: {current.puzzles[puzzleIndex].hint}</p>}{showAnswer&&<p className="answer-reveal" role="status"><strong>Jawaban: {current.puzzles[puzzleIndex].answers[0]}</strong><span>Ketik jawaban ini di kotak atas untuk lanjut.</span></p>}<div className="puzzle-actions"><div className="puzzle-help-actions"><button className="text-button" onClick={()=>setHint(v=>!v)}>{hint?'Sembunyikan':'Lihat'} petunjuk</button><button className="text-button" onClick={()=>setShowAnswer(v=>!v)}>{showAnswer?'Sembunyikan':'Lihat'} jawaban</button></div>{feedback?.correct&&<button className="main-button" onClick={nextPuzzle}>{puzzleIndex===2?'Ambil berkas di ruangan':'Soal berikutnya'} →</button>}</div></div></section></div>}
      </>}
      {help&&<div className="help-overlay"><section className="help-card"><button className="close-help" onClick={()=>setHelp(false)} aria-label="Tutup panduan">×</button><p className="kicker">PANDUAN AGEN</p><h2>Cara bermain</h2><ol><li>Berjalan dengan tombol <b>← →</b> atau <b>A D</b>. Di ponsel, tahan tombol panah di bawah arena.</li><li>Temui tokoh di ruangan dan baca percakapannya. Setelah itu, dekati <b>terminal</b>, lalu tekan <b>E</b> atau tombol interaksi.</li><li>Gunakan kotak <b>rumus dan contoh</b> untuk mengerjakan tiga teka-teki. Kalau bingung, tekan <b>Lihat jawaban</b> di bawah soal.</li><li>Ambil <b>berkas</b>, kemudian berjalan ke <b>pintu keluar</b>.</li><li>Pemindai merah menyala bergantian. Tunggu saat padam untuk lewat. Salah menjawab atau terkena pemindai mengurangi nyawa.</li></ol><p>Setiap level memulihkan nyawa. Level terakhir memiliki batas 150 detik. Petunjuk boleh dibuka kapan saja.</p><button className="main-button" onClick={()=>setHelp(false)}>Mengerti →</button></section></div>}
    </main><footer>PROJECT ECHO <span>MATEMATIKA · MISTERI · PETUALANGAN</span></footer>
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
