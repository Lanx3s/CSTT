import {useState} from 'react';
import {html} from '../lib/html.js';
import {PL,TR,MAPS,team,pteam} from '../lib/data.js';
import {t,lang} from '../lib/i18n.js';
import {playerAgg,mapStats,f2,f1} from '../lib/calc.js';
import {Box,Empty,Flag,TeamLogo,Rt,MapTile,PlayerPic} from '../components/common.js';

/* блок категории: лидер с фото + ещё 4 игрока (формат как на HLTV) */
const Top=({title,list,get,fmt,asc})=>{
  const l=[...list].filter(p=>get(p)!=null&&(asc?get(p)>0:get(p)>0)).sort((a,b)=>asc?get(a)-get(b):get(b)-get(a)).slice(0,5);
  if(!l.length)return null;
  const [f,...r]=l,F1=pteam(f);
  return html`<div class="stc"><h4>${title}</h4><div class="stc-box">
<a class="stc-top" href=${'#/player/'+f.id}><${PlayerPic} p=${f}/><span class="stc-i"><span class="stc-n"><${Flag} x=${f}/><b>${f.nick}</b></span><small>${F1.name}</small></span><b class="stc-v">${fmt(get(f))}</b>${!F1.tbd&&html`<span class="stc-wm"><${TeamLogo} x=${F1} s=${64}/></span>`}</a>
${r.map(p=>html`<a class="stc-r" key=${p.id} href=${'#/player/'+p.id}><span class="stc-n"><${Flag} x=${p}/><b>${p.nick}</b><small>(${pteam(p).name})</small></span><b class="stc-v">${fmt(get(p))}</b></a>`)}</div></div>`};

export const Stats=()=>{
  const [ev,se]=useState('');
  const base=ev?playerAgg(+ev).map(r=>({...r.p,rt:r.rt,kd:r.d?r.k/r.d:r.k,adr:r.adr,kast:r.kast,hs:r.hs,kpr:0,dpr:0,maps:r.n})):PL;
  const by=k=>[...base].sort((a,b)=>b[k]-a[k]),S=mapStats(ev?+ev:null),rows=Object.values(S).sort((a,b)=>b.played-a.played);
  return html`<div class="col"><div class="toolbar"><select value=${ev} onChange=${e=>se(e.target.value)}><option value="">${t('tournaments')}: ${t('all')}</option>${TR.map(o=>html`<option key=${o.id} value=${o.id}>${o.n}</option>`)}</select></div>
${!base.length?html`<${Empty}/>`:html`<div class="stg2"><${Top} title="Rating" list=${base} get=${p=>p.rt} fmt=${f2}/><${Top} title=${lang==='ru'?'Убийства / смерти (K/D)':'K/D ratio'} list=${base} get=${p=>p.kd} fmt=${f2}/><${Top} title=${lang==='ru'?'Урон за раунд (ADR)':'Damage per round'} list=${base} get=${p=>p.adr} fmt=${f1}/><${Top} title="KAST" list=${base} get=${p=>p.kast} fmt=${v=>Math.round(v)+'%'}/><${Top} title=${lang==='ru'?'Убийств за раунд':'Kills per round'} list=${base} get=${p=>p.kpr} fmt=${f2}/><${Top} title=${lang==='ru'?'Смертей за раунд (меньше — лучше)':'Deaths per round (lower is better)'} list=${base} get=${p=>p.dpr} fmt=${f2} asc=${1}/><${Top} title=${lang==='ru'?'Процент хедшотов':'Headshot %'} list=${base} get=${p=>p.hs} fmt=${v=>Math.round(v)+'%'}/><${Top} title=${lang==='ru'?'Сыграно карт':'Maps played'} list=${base} get=${p=>p.maps} fmt=${v=>Math.round(v)}/></div>`}
<${Box} h=${t('mapStatsT')}>${rows.length?html`<table class="tbl"><thead><tr><th>${t('map')}</th><th class="num">${t('played2')}</th><th class="num">${t('picked')}</th><th class="num">${t('banned')}</th><th class="num">${t('avgR')}</th></tr></thead><tbody>${rows.map(r=>html`<tr key=${r.name}><td><b>${r.name}</b></td><td class="num">${r.played}</td><td class="num">${r.picked}</td><td class="num">${r.banned}</td><td class="num">${r.played?Math.round(r.rounds/r.played):'–'}</td></tr>`)}</tbody></table>`:html`<${Empty}/>`}<//></div>`};
