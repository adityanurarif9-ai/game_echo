export const characters = [
  {id:'classic',name:'Raka Klasik',price:0,tag:'KARAKTER AWAL',description:'Tampilan asli Raka untuk memulai pencarian Vira.'},
  {id:'neon',name:'Raka Neon',price:35,tag:'EDISI KOTA',description:'Aura neon kebiruan untuk menyusuri kota.'},
  {id:'sunset',name:'Raka Senja',price:80,tag:'EDISI LANGKA',description:'Aura senja hangat untuk menembus markas terakhir.'}
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
