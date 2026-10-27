// Musik dan efek suara dibuat langsung dengan Web Audio. Tidak memakai file
// musik eksternal, sehingga game tetap bisa dimainkan tanpa internet.
export function createAudio(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return {start(){},stop(){},effect(){},dispose(){}};
  const ctx=new AudioContextClass();
  const master=ctx.createGain();master.gain.value=.34;master.connect(ctx.destination);
  let timer=null,step=0;
  const melody=[440,0,523.25,0,659.25,587.33,523.25,0,392,0,440,523.25,0,392,329.63,0];
  const bass=[110,130.81,146.83,98];
  function tone(freq,when,duration,volume=.08,type='sine'){
    if(!freq||ctx.state!=='running')return;
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(freq,when);
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(volume,when+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(gain);gain.connect(master);
    oscillator.start(when);oscillator.stop(when+duration+.02);
  }
  function beat(){
    const t=ctx.currentTime+.025;
    tone(melody[step%16],t,.31,.11,'triangle');
    if(step%4===0)tone(bass[Math.floor(step/4)%4],t,.65,.075,'sine');
    if(step%8===0){tone(bass[Math.floor(step/4)%4]*2,t,1.2,.018,'sine');tone(bass[Math.floor(step/4)%4]*3,t,1.2,.013,'sine')}
    step++;
  }
  return {
    async start(){try{await ctx.resume();if(!timer){beat();timer=setInterval(beat,285)}}catch{}},
    stop(){if(timer){clearInterval(timer);timer=null}ctx.suspend().catch(()=>{})},
    effect(kind){if(ctx.state!=='running')return;const t=ctx.currentTime+.01;
      if(kind==='step')tone(85,t,.06,.027,'triangle');
      if(kind==='open'){tone(440,t,.12,.08,'sine');tone(660,t+.08,.16,.07,'sine')}
      if(kind==='correct'){tone(523,t,.13,.13,'triangle');tone(659,t+.13,.13,.12,'triangle');tone(784,t+.26,.24,.11,'triangle')}
      if(kind==='wrong'){tone(196,t,.18,.15,'sawtooth');tone(150,t+.14,.25,.10,'sawtooth')}
      if(kind==='pickup'){tone(659,t,.1,.12,'sine');tone(988,t+.1,.27,.12,'sine')}
      if(kind==='coin'){tone(880,t,.07,.09,'sine');tone(1174,t+.06,.13,.08,'triangle')}
      if(kind==='jump'){tone(330,t,.08,.045,'triangle');tone(494,t+.05,.12,.045,'triangle')}
      if(kind==='hit'){tone(120,t,.16,.17,'sawtooth');tone(85,t+.11,.25,.12,'sawtooth')}
      if(kind==='clear'){[523,659,784,1046].forEach((f,i)=>tone(f,t+i*.12,.35,.11,'triangle'))}
    },
    dispose(){if(timer)clearInterval(timer);ctx.close().catch(()=>{})}
  };
}
