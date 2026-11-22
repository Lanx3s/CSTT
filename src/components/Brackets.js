/* Турнирные сетки: Swiss, группы (круговая), GSL, single/double elimination */
import {useState} from 'react';
import {html,F} from '../lib/html.js';
import {team,tour} from '../lib/data.js';
import {swiss,groupTables,gslGroups,playoffs,phases,winner} from '../lib/calc.js';
import {t} from '../lib/i18n.js';
import {Bm,Row,TeamLogo,TeamLink,Empty,Tabs,Rows} from './common.js';

/* колонки с соединительными линиями (линии рисует CSS по классам in/out/up/dn) */
export const Cols=({cols,tag})=>html`<div class="brx">${cols.map((c,i)=>{
  const nx=cols[i+1],pv=cols[i-1],n=c.ms.length,rOut=nx&&n?nx.ms.length/n:0,rIn=pv&&n?pv.ms.length/n:0;
  return html`<div class="brc" key=${i}><h4>${c.title}</h4><div class="brs">${c.ms.map((m,j)=>{
    const cl=['slot'];
    if(rOut===1||rOut===.5)cl.push('out');if(rOut===.5)cl.push(j%2?'dn':'up');
    if(rIn===1||rIn===2)cl.push('in');
    return html`<div class=${cl.join(' ')} key=${m.id}><${Bm} m=${m} tag=${tag}/></div>`})}</div></div>`})}</div>`;

/* ---------- плей-офф ---------- */
export const Playoffs=({tid})=>{
  const P=playoffs(tid);
  if(!P.single.length&&!P.upper.length&&!P.lower.length&&!P.gf.length)return html`<${Empty}/>`;
  if(!P.dbl)return html`<div class="brw"><${Cols} cols=${P.single.map(c=>({title:t(c.k),ms:c.ms}))}/>${P.third.length>0&&html`<div class="third"><h4>${t('Third place')}</h4>${P.third.map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div>`}</div>`;
  const nm=(k,c,arr)=>c.last?t(k==='ub'?'Upper final':'Lower final'):(k==='ub'&&c.pre&&arr.length>2?t('Upper semifinal'):t(k==='ub'?'Upper round':'Lower round')+' '+c.n);
  return html`<div class="brw">
<div class="brsec"><span class="bl up">${t('Upper bracket')}</span><${Cols} cols=${P.upper.map(c=>({title:nm('ub',c,P.upper),ms:c.ms}))}/></div>
<div class="brsec"><span class="bl lo">${t('Lower bracket')}</span><${Cols} cols=${P.lower.map(c=>({title:nm('lb',c,P.lower),ms:c.ms}))}/></div>
${P.gf.length>0&&html`<div class="brsec"><span class="bl gf">${t('Grand Final')}</span><div class="gfb">${P.gf.map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div></div>`}</div>`};

/* ---------- Swiss ---------- */
const stLine={q:'qual',e:'elim',p:''};
export const Swiss=({tid,compact})=>{
  const S=swiss(tid);
  if(!S.rounds.length&&!S.rows.length)return html`<${Empty}/>`;
  const sc=k=>k.split('-').map(Number),
    keys=[...new Set(S.rounds.flatMap(R=>R.buckets.map(b=>b.k)))].sort((x,y)=>{const a=sc(x),b=sc(y);return (b[0]-b[1])-(a[0]-a[1])||b[0]-a[0]}),
    ends=b=>{const [w,l]=sc(b.k),fin=b.ms.filter(m=>m.st==='fin'&&m.a!=null&&m.b!=null&&m.s1!==m.s2),Wn=m=>m.s1>m.s2?m.a:m.b,Ls=m=>m.s1>m.s2?m.b:m.a,out=[],n=Math.max(b.ms.length,fin.length);
      if(w===S.W-1)out.push({kind:'q',k:b.k,ids:fin.map(Wn),n,o:keys.indexOf(b.k)+.1});
      if(l===S.L-1)out.push({kind:'e',k:b.k,ids:fin.map(Ls),n,o:keys.indexOf(b.k)+.2});return out},
    cols=S.rounds.map((R,i)=>({h:t('round')+' '+R.r,items:[...R.buckets.map(b=>({t:'b',b,o:keys.indexOf(b.k)})),...(i>0?S.rounds[i-1].buckets.flatMap(ends).map(e=>({t:'e',e,o:e.o})):[])]}));
  const last=S.rounds[S.rounds.length-1];if(last){const ex=last.buckets.flatMap(ends);if(ex.length)cols.push({h:'Итог',items:ex.map(e=>({t:'e',e,o:e.o}))})}
  cols.forEach(cl=>cl.items.sort((x,y)=>x.o-y.o));
  const box=e=>html`<div class=${'sw5-e '+e.kind} key=${e.k+e.kind}><div class="sw5-eh">${e.kind==='q'?'✔ '+t('qualified'):'✖ '+t('eliminated')}</div>${[...Array(e.n)].map((_,j)=>{const id=e.ids[j];return id!=null?html`<a class="sw5-t" key=${j} href=${'#/team/'+id}><${TeamLogo} x=${team(id)} s=${20}/><span class="tn">${team(id).name}</span></a>`:html`<div class="sw5-t none" key=${j}>—</div>`})}</div>`;
  return html`<div class="swiss"><div class="swg6">
${cols.map((cl,ci)=>html`<div class="sw6c" key=${ci}><h4>${cl.h}</h4><div class="sw6i">${cl.items.map(it=>{if(it.t==='e')return box(it.e);const [w,l]=sc(it.b.k);return html`<div class=${'sw5-b'+(w===S.W-1?' dq':'')+(l===S.L-1?' de':'')} key=${it.b.k}><div class="sw5-bh"><b>${it.b.k}</b><span>${w===S.W-1&&l===S.L-1?'✔ / ✖':w===S.W-1?t('toQual'):l===S.L-1?t('toOut'):''}</span></div><div class="sw5-ms">${it.b.ms.map(m=>html`<${Bm} key=${m.id} m=${m} tag=${1}/>`)}</div></div>`})}</div></div>`)}
</div>
${!compact&&html`<table class="tbl swtbl"><thead><tr><th class="num">#</th><th>${t('team')}</th><th class="num">${t('record')}</th><th>${t('status')}</th></tr></thead><tbody>${S.rows.map((r,i)=>html`<tr key=${r.team.id} class=${stLine[r.st]}><td class="num mu">${i+1}</td><td><${TeamLink} id=${r.team.id} s=${20}/></td><td class="num"><b>${r.w}-${r.l}</b></td><td>${r.st==='q'?html`<span class="up">${t('qualified')}</span>`:r.st==='e'?html`<span class="dn">${t('eliminated')}</span>`:html`<span class="mu">${t('inPlay')}</span>`}</td></tr>`)}</tbody></table>`}</div>`};

/* ---------- Группы ---------- */
export const Groups=({tid})=>{
  const G=groupTables(tid),o=tour(tid),adv=(o&&o.adv)||2;
  if(!G.length)return html`<${Empty}/>`;
  return html`<div class="grps">${G.map(g=>html`<div class="grp" key=${g.g}><h4>${g.g?t('group')+' '+g.g:t('group')}</h4>
<table class="tbl"><thead><tr><th class="num">#</th><th>${t('team')}</th><th class="num">${t('played')}</th><th class="num">W-D-L</th><th class="num">${t('mapDiff')}</th><th class="num">${t('pts')}</th></tr></thead><tbody>${g.rows.map((r,i)=>html`<tr key=${r.team.id} class=${i<adv?'qual':''}><td class="num mu">${i+1}</td><td><${TeamLink} id=${r.team.id} s=${20}/></td><td class="num">${r.p}</td><td class="num">${r.w}-${r.d}-${r.l}</td><td class="num">${r.mw-r.ml>0?'+':''}${r.mw-r.ml}</td><td class="num"><b>${r.pts}</b></td></tr>`)}</tbody></table>
<div class="gms">${g.ms.map(m=>html`<${Row} key=${m.id} m=${m}/>`)}</div></div>`)}</div>`};

/* ---------- GSL ---------- */
export const Gsl=({tid})=>{
  const G=gslGroups(tid);if(!G.length)return html`<${Empty}/>`;
  return html`<div class="gsls">${G.map(g=>html`<div class="gsl" key=${g.g}><h4>${g.g?t('group')+' '+g.g:t('group')}${g.q.length>0&&html`<span class="qs">${g.q.map(id=>html`<${TeamLogo} key=${id} x=${team(id)} s=${16}/>`)}</span>`}</h4>
<div class="gslc"><div><small>${t('gslOpen')}</small>${g.r1.map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div>
<div><small>${t('gslMid')}</small>${g.r2.map((m,i)=>html`<div key=${m.id}><em class="gtag">${i===0?t('gslWin'):t('gslElim')}</em><${Bm} m=${m}/></div>`)}</div>
<div><small>${t('gslDec')}</small>${g.r3.map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div></div></div>`)}</div>`};

/* ---------- Выбор стадии ---------- */
export const Stage=({tid,kind,compact})=>kind==='swiss'?html`<${Swiss} tid=${tid} compact=${compact}/>`:kind==='groups'?html`<${Groups} tid=${tid}/>`:kind==='gsl'?html`<${Gsl} tid=${tid}/>`:html`<${Playoffs} tid=${tid}/>`;
export const defaultPhase=ph=>{const a=ph.find(p=>p.live)||ph.find(p=>!p.done)||ph[ph.length-1];return a&&a.k};

/* вся сетка турнира: переключатель стадий */
export const Bracket=({tid,compact})=>{
  const ph=phases(tid),[k,sk]=useState(defaultPhase(ph));
  if(!ph.length)return html`<${Empty} text=${t('noBracket')}/>`;
  const cur=ph.find(p=>p.k===k)?k:ph[0].k;
  return html`<div class="bracket">${ph.length>1&&html`<${Tabs} cls="sub" tabs=${ph.map(p=>[p.k,t(p.n)+(p.live?' ●':'')])} cur=${cur} on=${sk}/>`}<${Stage} tid=${tid} kind=${cur} compact=${compact}/></div>`};
