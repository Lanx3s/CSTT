import {useState} from 'react';
import {html} from '../lib/html.js';
import {PL,TR,MAPS,team,pteam} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {playerAgg,mapStats,f2,f1} from '../lib/calc.js';
import {Box,Empty,Flag,TeamLogo,Rt,MapTile} from '../components/common.js';

const Top=({title,list,get,fmt})=>html`<${Box} h=${title}>${list.slice(0,10).map((p,i)=>html`<a class="tp1" key=${p.id} href=${'#/player/'+p.id}><span class="mu">${i+1}</span><${Flag} x=${p}/><b>${p.nick}</b><span class="mu">${pteam(p).tag}</span><b class=${i===0?'up':''}>${fmt(get(p))}</b></a>`)}<//>`;

export const Stats=()=>{
  const [ev,se]=useState('');
  const base=ev?playerAgg(+ev).map(r=>({...r.p,rt:r.rt,kd:r.d?r.k/r.d:r.k,adr:r.adr,kast:r.kast,hs:r.hs,kpr:0,maps:r.n})):PL;
  const by=k=>[...base].sort((a,b)=>b[k]-a[k]),S=mapStats(ev?+ev:null),rows=Object.values(S).sort((a,b)=>b.played-a.played);
  return html`<div class="col"><div class="toolbar"><select value=${ev} onChange=${e=>se(e.target.value)}><option value="">${t('tournaments')}: ${t('all')}</option>${TR.map(o=>html`<option key=${o.id} value=${o.id}>${o.n}</option>`)}</select></div>
${!base.length?html`<${Empty}/>`:html`<div class="g3e"><${Top} title="Rating" list=${by('rt')} get=${p=>p.rt} fmt=${f2}/><${Top} title="K/D" list=${by('kd')} get=${p=>p.kd} fmt=${f2}/><${Top} title="ADR" list=${by('adr')} get=${p=>p.adr} fmt=${f1}/><${Top} title="KAST" list=${by('kast')} get=${p=>p.kast} fmt=${v=>Math.round(v)+'%'}/><${Top} title="HS%" list=${by('hs')} get=${p=>p.hs} fmt=${v=>Math.round(v)+'%'}/>${!ev&&html`<${Top} title="KPR" list=${by('kpr')} get=${p=>p.kpr} fmt=${f2}/>`}</div>`}
<${Box} h=${t('mapStatsT')}>${rows.length?html`<table class="tbl"><thead><tr><th>${t('map')}</th><th class="num">${t('played2')}</th><th class="num">${t('picked')}</th><th class="num">${t('banned')}</th><th class="num">${t('avgR')}</th></tr></thead><tbody>${rows.map(r=>html`<tr key=${r.name}><td><b>${r.name}</b></td><td class="num">${r.played}</td><td class="num">${r.picked}</td><td class="num">${r.banned}</td><td class="num">${r.played?Math.round(r.rounds/r.played):'–'}</td></tr>`)}</tbody></table>`:html`<${Empty}/>`}<//></div>`};
