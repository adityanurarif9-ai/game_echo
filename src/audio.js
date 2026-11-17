// Musik dan efek suara disintesis di browser agar tetap dapat dimainkan offline.
export function createAudio(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return {start(){},stop(){},effect(){},dispose(){}};
  const ctx=new AudioContextClass();
  const master=ctx.createGain();master.gain.value=.34;master.connect(ctx.destination);
  const musicBus=ctx.createGain();musicBus.gain.value=.58;musicBus.connect(master);
  let timer=null,step=0;
  const tempo=286;
  const melody=[
    293.66,0,349.23,0,440,0,523.25,440,
    349.23,0,293.66,0,261.63,0,293.66,0,
    349.23,0,440,0,523.25,0,440,392,
    329.63,0,392,0,440,392,329.63,0
  ];
  const chords=[
    {bass:146.83,notes:[293.66,349.23,440]},
    {bass:116.54,notes:[233.08,293.66,349.23]},
    {bass:174.61,notes:[261.63,349.23,440]},
    {bass:130.81,notes:[261.63,329.63,392]}
  ];
  function voice(freq,when,duration,volume,type='sine',target=musicBus,attack=.035){
    if(!freq||ctx.state!=='running')return;
    const oscillator=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(freq,when);
    filter.type='lowpass';filter.frequency.value=type==='triangle'?1550:2200;
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(volume,when+Math.min(attack,duration/3));
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(filter);filter.connect(gain);gain.connect(target);
    oscillator.start(when);oscillator.stop(when+duration+.03);
  }
  function beat(){
    if(ctx.state!=='running')return;
    const when=ctx.currentTime+.03;
    const chord=chords[Math.floor(step/8)%chords.length];
    const note=melody[step%melody.length];
    if(step%8===0){
      chord.notes.forEach((freq,index)=>voice(freq,when,2.25,.027-index*.003,'sine',musicBus,.32));
      voice(chord.bass,when,1.05,.085,'sine',musicBus,.05);
    }
    if(step%8===4)voice(chord.bass,when,.72,.048);
    if(step%2===0)voice(chord.notes[(step/2)%3]/2,when,.38,.024,'triangle');
    if(note){voice(note,when,.39,.052,'sine',musicBus,.065);voice(note*2,when,.24,.011,'sine',musicBus,.025)}
    step++;
  }
  const tone=(freq,when,duration,volume=.08,type='sine')=>voice(freq,when,duration,volume,type,master,.018);
  return {
    async start(){try{await ctx.resume();if(!timer){beat();timer=setInterval(beat,tempo)}}catch{}},
    stop(){if(timer){clearInterval(timer);timer=null}ctx.suspend().catch(()=>{})},
    effect(kind){if(ctx.state!=='running')return;const t=ctx.currentTime+.01;
      if(kind==='step')tone(85,t,.06,.027,'triangle');
      if(kind==='open'){tone(440,t,.12,.08,'sine');tone(660,t+.08,.16,.07,'sine')}
      if(kind==='correct'){tone(523,t,.13,.13,'triangle');tone(659,t+.13,.13,.12,'triangle');tone(784,t+.26,.24,.11,'triangle')}
      if(kind==='wrong'){tone(196,t,.18,.15,'sawtooth');tone(150,t+.14,.25,.10,'sawtooth')}
      if(kind==='pickup'){tone(659,t,.1,.12,'sine');tone(988,t+.1,.27,.12,'sine')}
      if(kind==='coin'){tone(784,t,.09,.16,'triangle');tone(1174,t+.055,.12,.15,'sine');tone(1568,t+.12,.21,.12,'sine')}
      if(kind==='energy'){tone(392,t,.1,.11,'sine');tone(588,t+.07,.14,.1,'triangle');tone(784,t+.15,.2,.09,'sine')}
      if(kind==='jump'){tone(330,t,.08,.045,'triangle');tone(494,t+.05,.12,.045,'triangle')}
      if(kind==='hit'){tone(120,t,.16,.17,'sawtooth');tone(85,t+.11,.25,.12,'sawtooth')}
      if(kind==='clear'){[523,659,784,1046].forEach((f,i)=>tone(f,t+i*.12,.35,.11,'triangle'))}
    },
    dispose(){if(timer)clearInterval(timer);ctx.close().catch(()=>{})}
  };
}
