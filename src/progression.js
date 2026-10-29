export const levelTimeLimits=[240,210,240,300];

export function formatClock(seconds){
  const safe=Math.max(0,Math.floor(Number(seconds)||0));
  return `${String(Math.floor(safe/60)).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`;
}

export function calculateStars(remaining,total,health){
  const ratio=Math.max(0,Math.min(1,remaining/total));
  if(health>=3&&ratio>=0.5)return 3;
  if(health>=2&&ratio>=0.2)return 2;
  return 1;
}
