/* Статистика игрока для карточки: считается ТОЛЬКО из данных сайта —
   построчная статистика матчей (pstats) + счёт карт из матчей. Если построчной статистики нет, берутся поля профиля игрока из админки. */
import {PH} from './data.js';
import {playerForm} from './calc.js';

/* шкалы оценок (границы POOR/OKAY/GOOD/GREAT) и диапазон полосы; dir=-1 — чем меньше, тем лучше */
export const SCALE={
  rt:{l:'RATING',min:.6,max:1.5,t:[.95,1.05,1.2],d:2},
  kd:{l:'K/D',min:.5,max:1.6,t:[.9,1.05,1.25],d:2},
  dpr:{l:'DPR',min:.85,max:.5,t:[.75,.68,.62],d:2,dir:-1},
  kast:{l:'KAST',min:55,max:85,t:[66,70,75],d:1,u:'%'},
  hs:{l:'HS %',min:20,max:70,t:[35,45,55],d:1,u:'%'},
  adr:{l:'ADR',min:50,max:100,t:[65,72,80],d:1},
  kpr:{l:'KPR',min:.5,max:1,t:[.62,.7,.78],d:2}};
export const LEVELS=['POOR','OKAY','GOOD','GREAT'];
export const level=(k,v)=>{const s=SCALE[k];if(v==null||!isFinite(v))return -1;const dir=s.dir||1;let i=0;s.t.forEach(x=>{if(dir>0?v>=x:v<=x)i++});return i};
export const frac=(k,v)=>{const s=SCALE[k];if(v==null||!isFinite(v))return 0;return Math.max(0,Math.min(1,(v-s.min)/(s.max-s.min)))};

export const playerStats=p=>{
  const own=[p.team,...PH.filter(h=>h.player===p.id).map(h=>h.team)].filter(x=>x!=null);
  const sideOf=m=>own.includes(m.a)&&(m.a===p.team||!own.includes(m.b))?'a':own.includes(m.b)?'b':null;
  const rows=playerForm(p.id).filter(x=>x.mt.st==='fin').map(x=>{
    const sc=x.mt.maps.filter(z=>z.a!=null&&z.b!=null&&!z.live),rounds=sc.reduce((s,z)=>s+z.a+z.b,0),sd=sideOf(x.mt);
    return {...x,rounds,maps:sc.length,sd,res:sd?(sd==='a'?x.mt.s1-x.mt.s2:x.mt.s2-x.mt.s1):null}});
  const M={rt:null,kd:null,dpr:null,kast:null,hs:null,adr:null,kpr:null};
  if(!rows.length){
    const v=x=>x>0?+x:null;
    M.rt=v(p.rt);M.kd=v(p.kd);M.adr=v(p.adr);M.kast=v(p.kast);M.hs=v(p.hs);M.kpr=v(p.kpr);M.dpr=v(p.dpr);
    return {src:'profile',matches:0,maps:+p.maps||0,rounds:0,wins:0,losses:0,winrate:null,M}}
  const known=rows.filter(r=>r.rounds>0),avgR=known.length?known.reduce((s,r)=>s+r.rounds,0)/known.length:1;
  /* усреднение с весом по числу раундов; пустые значения (0 = не внесено) не учитываются */
  const wavg=k=>{let s=0,w=0;rows.forEach(r=>{if(r[k]>0){const x=r.rounds>0?r.rounds:avgR;s+=r[k]*x;w+=x}});return w?s/w:null};
  M.rt=wavg('rt');M.adr=wavg('adr');M.kast=wavg('kast');M.hs=wavg('hs');
  const K=rows.reduce((s,r)=>s+r.k,0),Dt=rows.reduce((s,r)=>s+r.d,0);
  M.kd=Dt>0?K/Dt:null;
  const kr=known.reduce((s,r)=>s+r.rounds,0);
  if(kr>0){M.kpr=known.reduce((s,r)=>s+r.k,0)/kr;M.dpr=known.reduce((s,r)=>s+r.d,0)/kr}
  const dec=rows.filter(r=>r.res!=null&&r.res!==0),W=dec.filter(r=>r.res>0).length;
  return {src:'matches',matches:rows.length,maps:rows.reduce((s,r)=>s+r.maps,0),rounds:rows.reduce((s,r)=>s+r.rounds,0),wins:W,losses:dec.length-W,winrate:dec.length?Math.round(W/dec.length*100):null,M}};
