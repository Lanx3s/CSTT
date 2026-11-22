/* Расчёты поверх данных: формы, H2H, таблицы групп, Swiss, плей-офф, статистика карт */
import {MS,TT,PS,team,player,tour} from './data.js';

export const PLAYOFF=['Round of 32','Round of 16','Quarterfinal','Semifinal','Third place','Grand Final','Upper bracket','Lower bracket'];
export const SINGLE=['Round of 32','Round of 16','Quarterfinal','Semifinal','Grand Final'];
export const f2=v=>(+v||0).toFixed(2);
export const f1=v=>(+v||0).toFixed(1);
export const rtc=v=>v>=1.1?'rt hi':v>=1?'rt up':'rt dn';   // класс цвета рейтинга

export const winner=m=>m.st==='fin'?(m.s1>m.s2?m.a:m.s2>m.s1?m.b:null):null;
export const loser=m=>{const w=winner(m);return w==null?null:(w===m.a?m.b:m.a)};
export const sortM=(a,b)=>(a.rnd-b.rnd)||(a.ord-b.ord)||(a.id-b.id);
export const msOf=tid=>MS.filter(m=>m.tour==tid);
/* ближайшие первыми */
export const byTime=(a,b)=>((a.ts||1e15)-(b.ts||1e15))||a.id-b.id;
/* последние первыми */
export const byRecent=(a,b)=>((b.ts||0)-(a.ts||0))||b.id-a.id;

export const tourTeams=tid=>{
  const seed=new Map(TT.filter(x=>x.tour==tid).map(x=>[x.team,x.seed||999]));
  const ids=new Set([...seed.keys()]);
  msOf(tid).forEach(m=>{if(m.a!=null)ids.add(m.a);if(m.b!=null)ids.add(m.b)});
  return [...ids].map(team).filter(x=>!x.tbd).sort((a,b)=>(seed.get(a.id)||999)-(seed.get(b.id)||999)||a.rank-b.rank)};

export const teamMs=id=>MS.filter(m=>m.a===id||m.b===id);
export const formOf=(id,n=5)=>teamMs(id).filter(m=>m.st==='fin').sort(byRecent).slice(0,n).map(m=>{const w=winner(m);return w==null?'d':w===id?'w':'l'}).reverse();
export const record=id=>{const f=teamMs(id).filter(m=>m.st==='fin');let w=0,l=0,d=0,mw=0,ml=0;
  f.forEach(m=>{const mine=m.a===id?m.s1:m.s2,his=m.a===id?m.s2:m.s1;mw+=mine;ml+=his;if(mine>his)w++;else if(mine<his)l++;else d++});
  return {n:f.length,w,l,d,mw,ml,wr:f.length?Math.round(w/f.length*100):0}};
export const h2h=(a,b)=>{if(a==null||b==null)return {list:[],a:0,b:0};
  const list=MS.filter(m=>m.st==='fin'&&((m.a===a&&m.b===b)||(m.a===b&&m.b===a))).sort(byRecent);
  let wa=0,wb=0;list.forEach(m=>{const w=winner(m);if(w===a)wa++;else if(w===b)wb++});return {list,a:wa,b:wb}};

/* ---------- Swiss ---------- */
const BK=/^(\d+)-(\d+)$/;
export const swiss=tid=>{
  const o=tour(tid);
  const ms=msOf(tid).filter(m=>m.stage==='Swiss').sort(sortM);
  const gk=ms.map(m=>m.grp).filter(k=>BK.test(k)).map(k=>k.split('-').map(Number)),W=(o&&o.sw)||(gk.length?Math.max(...gk.map(x=>x[0]))+1:3),Lm=(o&&o.sl)||(gk.length?Math.max(...gk.map(x=>x[1]))+1:3);
  const rec=new Map();const get=id=>rec.get(id)||[0,0];
  TT.filter(x=>x.tour==tid).forEach(x=>rec.set(x.team,[0,0]));
  const rounds=[...new Set(ms.map(m=>m.rnd||1))].sort((a,b)=>a-b);
  const out=rounds.map(r=>{
    const list=ms.filter(m=>(m.rnd||1)===r),bk={};
    /* корзина матча (например 2-0) — это и есть рекорд команд перед матчем, даже если предыдущие раунды не вносили */
    list.forEach(m=>{if(BK.test(m.grp)){const [gw,gl]=m.grp.split('-').map(Number);[m.a,m.b].forEach(id=>{if(id!=null)rec.set(id,[gw,gl])})}});
    list.forEach(m=>{
      let k=BK.test(m.grp)?m.grp:null;
      if(!k){const base=m.a!=null?get(m.a):m.b!=null?get(m.b):[0,0];k=base[0]+'-'+base[1]}
      (bk[k]||(bk[k]=[])).push(m)});
    /* после раунда обновляем записи */
    list.forEach(m=>{if(m.st!=='fin')return;const w=winner(m);if(m.a!=null&&!rec.has(m.a))rec.set(m.a,[0,0]);if(m.b!=null&&!rec.has(m.b))rec.set(m.b,[0,0]);
      if(w==null)return;const l=w===m.a?m.b:m.a;if(w!=null){const x=get(w);rec.set(w,[x[0]+1,x[1]])}if(l!=null){const y=get(l);rec.set(l,[y[0],y[1]+1])}});
    const buckets=Object.keys(bk).sort((a,b)=>{const [aw,al]=a.split('-'),[bw,bl]=b.split('-');return (bw-aw)||(al-bl)}).map(k=>({k,ms:bk[k]}));
    return {r,buckets}});
  const rows=[...rec.entries()].map(([id,[w,l]])=>({team:team(id),w,l,st:w>=W?'q':l>=Lm?'e':'p'}))
    .sort((a,b)=>(b.w-a.w)||(a.l-b.l)||(a.team.rank-b.team.rank));
  return {W,L:Lm,rounds:out,rows}};

/* ---------- Группы (круговая система) ---------- */
export const groupTables=(tid,stage='Group stage')=>{
  const ms=msOf(tid).filter(m=>m.stage===stage);
  const names=[...new Set([...ms.map(m=>m.grp||''),...TT.filter(x=>x.tour==tid&&x.grp).map(x=>x.grp)])].sort();
  return names.map(g=>{
    const gm=ms.filter(m=>(m.grp||'')===g).sort(sortM),ids=new Set(TT.filter(x=>x.tour==tid&&(x.grp||'')===g).map(x=>x.team));
    gm.forEach(m=>{if(m.a!=null)ids.add(m.a);if(m.b!=null)ids.add(m.b)});
    const R=new Map([...ids].map(id=>[id,{team:team(id),p:0,w:0,d:0,l:0,mw:0,ml:0,pts:0}]));
    gm.filter(m=>m.st==='fin'&&m.a!=null&&m.b!=null).forEach(m=>{const A=R.get(m.a),B=R.get(m.b);if(!A||!B)return;A.p++;B.p++;A.mw+=m.s1;A.ml+=m.s2;B.mw+=m.s2;B.ml+=m.s1;
      if(m.s1>m.s2){A.w++;B.l++;A.pts+=3}else if(m.s2>m.s1){B.w++;A.l++;B.pts+=3}else{A.d++;B.d++;A.pts++;B.pts++}});
    const rows=[...R.values()].sort((a,b)=>(b.pts-a.pts)||((b.mw-b.ml)-(a.mw-a.ml))||(b.mw-a.mw)||(a.team.rank-b.team.rank));
    return {g,rows,ms:gm}})};

/* ---------- GSL: 4 команды в группе, 5 матчей ---------- */
export const gslGroups=tid=>{
  const ms=msOf(tid).filter(m=>m.stage==='GSL');
  const names=[...new Set([...ms.map(m=>m.grp||''),...TT.filter(x=>x.tour==tid&&x.grp).map(x=>x.grp)])].sort();
  return names.map(g=>{const gm=ms.filter(m=>(m.grp||'')===g).sort(sortM);
    const r=n=>gm.filter(m=>(m.rnd||1)===n);
    const q=[];if(r(2)[0]&&winner(r(2)[0])!=null)q.push(winner(r(2)[0]));if(r(3)[0]&&winner(r(3)[0])!=null)q.push(winner(r(3)[0]));
    return {g,r1:r(1),r2:r(2),r3:r(3),q}})};

/* ---------- Плей-офф ---------- */
export const playoffs=tid=>{
  const ms=msOf(tid).filter(m=>PLAYOFF.includes(m.stage)),dbl=ms.some(m=>m.stage==='Upper bracket'||m.stage==='Lower bracket');
  const by=s=>ms.filter(m=>m.stage===s).sort(sortM);
  const rounds=s=>{const l=by(s),rs=[...new Set(l.map(m=>m.rnd||1))].sort((a,b)=>a-b);return rs.map((r,i)=>({k:s==='Upper bracket'?'ub':'lb',n:r,last:i===rs.length-1,pre:i===rs.length-2,ms:l.filter(m=>(m.rnd||1)===r)}))};
  return {dbl,
    single:SINGLE.filter(s=>!(dbl&&s==='Grand Final')).map(s=>({k:s,ms:by(s)})).filter(c=>c.ms.length),
    third:by('Third place'),upper:rounds('Upper bracket'),lower:rounds('Lower bracket'),gf:dbl?by('Grand Final'):[]}};

export const phases=tid=>{
  const ms=msOf(tid),has=s=>ms.some(m=>m.stage===s),P=[],st=l=>({live:l.some(m=>m.st==='live'),done:l.length>0&&l.every(m=>m.st==='fin')});
  const add=(k,n,l)=>P.push({k,n,count:l.length,...st(l)});
  if(has('Swiss'))add('swiss','Swiss',ms.filter(m=>m.stage==='Swiss'));
  if(has('Group stage'))add('groups','Group stage',ms.filter(m=>m.stage==='Group stage'));
  if(has('GSL'))add('gsl','GSL',ms.filter(m=>m.stage==='GSL'));
  const po=ms.filter(m=>PLAYOFF.includes(m.stage));if(po.length)add('playoffs','Playoffs',po);
  return P};

/* ---------- Карты ---------- */
export const mapStats=tid=>{
  const S={},g=n=>S[n]||(S[n]={name:n,played:0,picked:0,banned:0,left:0,rounds:0});
  MS.filter(m=>tid==null||m.tour==tid).forEach(m=>{
    m.maps.forEach(x=>{const r=g(x.m);if(x.a!=null){r.played++;r.rounds+=x.a+x.b}if(!m.veto.length&&(x.pick==='a'||x.pick==='b'))r.picked++});
    m.veto.forEach(v=>{const r=g(v.m);if(v.k==='ban')r.banned++;else if(v.k==='pick')r.picked++;else r.left++})});
  return S};

/* ---------- Игроки турнира ---------- */
export const playerAgg=tid=>{
  const ids=new Set(msOf(tid).map(m=>m.id)),agg={};
  PS.filter(x=>ids.has(x.m)).forEach(x=>{const r=agg[x.p]||(agg[x.p]={p:player(x.p),n:0,k:0,d:0,a:0,adr:0,rt:0,kast:0,hs:0});r.n++;r.k+=x.k;r.d+=x.d;r.a+=x.a;r.adr+=x.adr;r.rt+=x.rt;r.kast+=x.kast;r.hs+=x.hs});
  return Object.values(agg).filter(r=>r.p).map(r=>({...r,adr:r.adr/r.n,rt:r.rt/r.n,kast:r.kast/r.n,hs:r.hs/r.n})).sort((a,b)=>b.rt-a.rt)};

export const playerForm=id=>PS.filter(x=>x.p==id).map(x=>({...x,mt:MS.find(m=>m.id==x.m)})).filter(x=>x.mt).sort((a,b)=>byRecent(a.mt,b.mt));

/* карты команды: сколько сыграно / выиграно */
export const teamMaps=id=>{
  const S={};
  MS.filter(m=>m.st==='fin'&&(m.a===id||m.b===id)).forEach(m=>m.maps.forEach(x=>{if(x.a==null)return;const r=S[x.m]||(S[x.m]={name:x.m,p:0,w:0});r.p++;const mine=m.a===id?x.a:x.b,his=m.a===id?x.b:x.a;if(mine>his)r.w++}));
  return Object.values(S).sort((a,b)=>b.p-a.p)};
export const teamEvents=id=>{
  const ids=[...new Set(teamMs(id).map(m=>m.tour))];return ids.map(tid=>tour(tid)).filter(Boolean)};
