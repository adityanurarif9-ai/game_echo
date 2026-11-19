import {levels} from './game.js';

const messages=[
  ['1','ORANG','HILANG'],
  ['TEMUKAN','12','KUNCI'],
  ['Cari kunci','Di depan','mEngHilanG'],
  ['MaSiH MeNcARi','Dimana','Kunci Ada Di Sini']
];

const encodeLetter=(letter,signed)=>{
  if(letter===' ')return 0;
  const upper=letter.toUpperCase().charCodeAt(0)-64;
  return signed&&letter===letter.toLowerCase()?-upper:upper;
};
const coefficient=number=>number<0?`− ${Math.abs(number)}`:`+ ${number}`;
const numberText=number=>String(number).replaceAll('-', '−');
const nextNumber=seed=>(Math.imul(seed,1664525)+1013904223)>>>0;

export function keyOptions(level){
  const map=levels[level].map;
  return map.caches.flatMap((cache,index)=>cache.x>map.terminal&&cache.x<map.door?[index]:[]);
}

export function chooseAttempt(level,previous=null,random=Math.random){
  const options=keyOptions(level);
  if(options.length<2)throw new Error('Setiap level perlu sedikitnya dua tempat kunci setelah terminal.');
  const variants=[0,1,2].filter(value=>value!==previous?.variant);
  const hidingPlaces=options.filter(value=>value!==previous?.hidden);
  const sample=items=>items[Math.min(items.length-1,Math.floor(Math.max(0,Math.min(.999999,random()))*items.length))];
  let seed=Math.floor(Math.max(0,Math.min(.999999999,random()))*0x100000000)>>>0;
  if(seed===previous?.seed)seed=nextNumber(seed);
  const proposedCheck=3+Math.floor(Math.max(0,Math.min(.999999,random()))*18);
  const check=proposedCheck===previous?.check?3+(proposedCheck-2)%18:proposedCheck;
  return {variant:sample(variants),hidden:sample(hidingPlaces),seed,check};
}

export function attemptMap(level,hidden){
  const original=levels[level].map;
  const valid=keyOptions(level).includes(hidden)?hidden:original.hidden;
  const x=original.caches[valid].x;
  const zone=x<45?'awal':x<75?'tengah':'ujung';
  return {...original,hidden:valid,clue:`Sinyal kunci terdeteksi di bagian ${zone} area, setelah terminal. Periksa tempat penyimpanan di sana.`};
}

export function attemptPuzzles(level,attempt){
  const base=levels[level].puzzles;
  const seed=Number.isInteger(attempt?.seed)?attempt.seed:0;
  const variant=Number.isInteger(attempt?.variant)?attempt.variant:0;
  const check=Number.isInteger(attempt?.check)?attempt.check:3+seed%18;
  const signed=level>=2;
  return base.map((puzzle,index)=>{
    let state=(seed+Math.imul(level+1,100003)+Math.imul(index+1,17011)+variant*7919)>>>0;
    const draw=max=>{state=nextNumber(state);return state%max};
    const a=level===1||level===3?4+2*draw(4):2+draw(8);
    const b=draw(11)-5;
    const verification=3+(check-3+index*5)%18;
    const message=messages[level][index];
    const numeric=/^\d+$/.test(message);
    const inner=level===1||level===3?`f(x)=2x+1`:null;
    const outer=inner?`g(x)=${a/2}x ${coefficient(b-a/2)}`:null;
    const functionName=inner?'h':'f';
    const formula=`${inner?`${inner} · ${outer} · `:''}${functionName}(x) = ${a}x ${coefficient(b)} · ${functionName}⁻¹(y) = (y ${coefficient(-b)}) ÷ ${a}`;
    const sample=3, sampleCipher=a*sample+b;
    if(numeric){
      const target=4+(check-3+index*7)%20;
      const encrypted=a*target+b;
      return {...puzzle,prompt:`Sinyal baru: ${inner?'komposisi fungsi':'fungsi'} ${functionName}(x) = ${a}x ${coefficient(b)} menghasilkan cipherteks ${numberText(encrypted)}. Berapa plainteks x?`,formula,
        rule:`Balikkan fungsi: ${b<0?`tambah ${Math.abs(b)}`:`kurangi ${b}`}, lalu bagi ${a}.`,example:`Contoh: ${numberText(sampleCipher)} → (${numberText(sampleCipher)} ${coefficient(-b)}) ÷ ${a} = ${sample}.`,
        hint:`Hitung (${numberText(encrypted)} ${coefficient(-b)}) ÷ ${a}.`,answers:[String(target)],explain:`x = ${target}. Kode angka terminal terbuka.`};
    }
    const values=[...message].map(letter=>a*encodeLetter(letter,signed)+b);
    const first=message[0],firstValue=values[0],decoded=encodeLetter(first,signed);
    const checkCipher=a*verification+b;
    return {...puzzle,prompt:`Sinyal baru: dengan ${inner?'komposisi h':'fungsi f'}(x) = ${a}x ${coefficient(b)}, dekripsi ${values.map(numberText).join('–')}. Kode verifikasi ${numberText(checkCipher)} juga harus didekripsi. Tulis pesan sesuai huruf besar/kecil hasil dekripsi, lalu angka verifikasi.`,formula,
      rule:`Gunakan invers untuk setiap angka. ${signed?'Hasil positif = huruf besar, negatif = huruf kecil, dan 0 = spasi.':'Cocokkan hasil dengan A = 1 sampai Z = 26.'} Contoh format jawaban: Pesan 7.`,
      example:`Contoh: ${numberText(sampleCipher)} → ${sample} → C.`,hint:`Angka pertama ${numberText(firstValue)} → ${numberText(decoded)} → ${first}. Angka verifikasi dihitung dengan invers yang sama.`,
      answers:[`${message} ${verification}`],explain:`${puzzle.explain} Verifikasi ${verification} diterima.`};
  });
}
