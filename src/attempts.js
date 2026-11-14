import {levels} from './game.js';

const messages=[
  ['1','ORANG','HILANG'],
  ['TEMUKAN','12','KUNCI'],
  ['Cari kunci','Di depan','mEngHilanG'],
  ['MaSiH MeNcARi','Dimana','Kunci Ada Di Sini']
];

const ciphers=[
  [null,{a:3,b:1},{a:4,b:-2}],
  [null,{a:6,b:1,inner:'f(x)=2x+1',outer:'g(x)=3x−2'},{a:8,b:3,inner:'f(x)=2x+1',outer:'g(x)=4x−1'}],
  [null,{a:4,b:3},{a:5,b:-1}],
  [null,{a:6,b:1,inner:'f(x)=2x+1',outer:'g(x)=3x−2'},{a:8,b:3,inner:'f(x)=2x+1',outer:'g(x)=4x−1'}]
];

const encodeLetter=(letter,signed)=>{
  if(letter===' ')return 0;
  const upper=letter.toUpperCase().charCodeAt(0)-64;
  return signed&&letter===letter.toLowerCase()?-upper:upper;
};
const coefficient=number=>number<0?`− ${Math.abs(number)}`:`+ ${number}`;
const numberText=number=>String(number).replaceAll('-', '−');

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
  return {variant:sample(variants),hidden:sample(hidingPlaces)};
}

export function attemptMap(level,hidden){
  const original=levels[level].map;
  const valid=keyOptions(level).includes(hidden)?hidden:original.hidden;
  const x=original.caches[valid].x;
  const zone=x<45?'awal':x<75?'tengah':'ujung';
  return {...original,hidden:valid,clue:`Sinyal kunci terdeteksi di bagian ${zone} area, setelah terminal. Periksa tempat penyimpanan di sana.`};
}

export function attemptPuzzles(level,variant){
  const base=levels[level].puzzles;
  const cipher=ciphers[level]?.[variant];
  if(!cipher)return base;
  const {a,b,inner,outer}=cipher;
  const formula=`${inner?`${inner} · ${outer} · `:''}${inner?'h':'f'}(x) = ${a}x ${coefficient(b)} · ${inner?'h':'f'}⁻¹(y) = (y ${coefficient(-b)}) ÷ ${a}`;
  const signed=level>=2;
  return base.map((puzzle,index)=>{
    const message=messages[level][index];
    const numeric=/^\d+$/.test(message);
    const sample=3;
    const sampleCipher=a*sample+b;
    if(numeric){
      const encrypted=a*Number(message)+b;
      return {...puzzle,prompt:`Sinyal baru: ${inner?'komposisi fungsi':'fungsi'} ${inner?'h':'f'}(x) = ${a}x ${coefficient(b)} menghasilkan cipherteks ${numberText(encrypted)}. Berapa plainteks x?`,formula,
        rule:`Balikkan fungsi: ${b<0?`tambah ${Math.abs(b)}`:`kurangi ${b}`}, lalu bagi ${a}.`,example:`Contoh: ${numberText(sampleCipher)} → (${numberText(sampleCipher)} ${coefficient(-b)}) ÷ ${a} = ${sample}.`,
        hint:`Hitung (${numberText(encrypted)} ${coefficient(-b)}) ÷ ${a}.`};
    }
    const values=[...message].map(letter=>a*encodeLetter(letter,signed)+b);
    const first=message[0],firstValue=values[0],decoded=encodeLetter(first,signed);
    return {...puzzle,prompt:`Sinyal baru: dengan ${inner?'komposisi h':'fungsi f'}(x) = ${a}x ${coefficient(b)}, dekripsi ${values.map(numberText).join('–')}. Pesan apa yang muncul?`,formula,
      rule:`Gunakan invers untuk setiap angka. ${signed?'Hasil positif = huruf besar, negatif = huruf kecil, dan 0 = spasi.':'Cocokkan hasil dengan A = 1 sampai Z = 26.'}`,
      example:`Contoh: ${numberText(sampleCipher)} → ${sample} → C.`,hint:`Angka pertama ${numberText(firstValue)} → ${numberText(decoded)} → ${first}.`};
  });
}
