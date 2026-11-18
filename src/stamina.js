export const MAX_STAMINA=100;
export const INITIAL_STAMINA=0;
export const SPRINT_COST=.72;
export const EXHAUSTION_RECOVERY=22;
export const CORRECT_ANSWER_ENERGY=35;
export const ENERGY_PICKUP_VALUE=30;

export function stepStamina(energy,exhausted,wantsRun,moving,cost=SPRINT_COST){
  const available=Math.max(0,Math.min(MAX_STAMINA,energy));
  const ready=exhausted&&available<EXHAUSTION_RECOVERY?false:true;
  const running=Boolean(wantsRun&&moving&&ready&&available>0);
  const nextEnergy=Math.max(0,available-(running?cost:0));
  return {energy:nextEnergy,exhausted:nextEnergy===0||(exhausted&&nextEnergy<EXHAUSTION_RECOVERY),running};
}

export function rewardStamina(energy,bonus=0){
  return Math.min(MAX_STAMINA,Math.max(0,energy)+CORRECT_ANSWER_ENERGY+bonus);
}

export function pickupStamina(energy){
  return Math.min(MAX_STAMINA,Math.max(0,energy)+ENERGY_PICKUP_VALUE);
}
