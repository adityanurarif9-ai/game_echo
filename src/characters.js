export const characters = [
  {id:'classic',sprite:'r',name:'Raka Klasik',price:0,tag:'AHLI KODE',description:'Jawaban benar memberi 45 energi, bukan 35.',ability:'+10 energi tiap jawaban benar',answerBonus:10,scannerRadius:1.4,sprintCost:.72},
  {id:'neon',sprite:'anonim',name:'Raka Bayangan',price:35,tag:'PENYAMARAN',description:'Sulit tertangkap laser: area deteksi lebih sempit.',ability:'Jangkauan laser berkurang 35%',answerBonus:0,scannerRadius:.91,sprintCost:.72},
  {id:'sunset',sprite:'pelaku',name:'Raka Taktis',price:80,tag:'PELARI',description:'Energi lari lebih awet saat mengejar Vira.',ability:'Energi lari 25% lebih hemat',answerBonus:0,scannerRadius:1.4,sprintCost:.54}
];

export const getCharacter=id=>characters.find(character=>character.id===id)||characters[0];
export const isCharacterId=id=>characters.some(character=>character.id===id);

export function restoreCharacters(saved={}){
  const owned=['classic',...new Set((Array.isArray(saved.ownedCharacters)?saved.ownedCharacters:[]).filter(isCharacterId))];
  return {ownedCharacters:[...new Set(owned)],selectedCharacter:owned.includes(saved.selectedCharacter)?saved.selectedCharacter:'classic'};
}

export function purchaseCharacter(progress,id){
  const character=characters.find(item=>item.id===id);
  if(!character||progress.ownedCharacters.includes(id)||progress.coins<character.price)return progress;
  return {...progress,coins:progress.coins-character.price,ownedCharacters:[...progress.ownedCharacters,id],selectedCharacter:id};
}

export function equipCharacter(progress,id){
  if(!progress.ownedCharacters.includes(id)||!isCharacterId(id))return progress;
  return {...progress,selectedCharacter:id};
}

export function roomCoinGain(previous,code,total){
  const safeTotal=Number.isFinite(Number(total))?Math.max(0,Number(total)):0;
  return Math.max(0,safeTotal-(previous.code===code?previous.coins:0));
}
