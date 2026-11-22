import {FavBtn} from '../components/common.js';
import {useState} from 'react';
import {html} from '../lib/html.js';
import {rk,TEAMS,TROPH} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {record,formOf,f2} from '../lib/calc.js';
import {TeamLogo,Flag,Empty,Tabs} from '../components/common.js';

export const TeamCard=({x})=>{
  const avg=x.pl.length?x.pl.reduce((s,p)=>s+p.rt,0)/x.pl.length:0,r=record(x.id);
  return html`<a class="tcd" href=${'#/team/'+x.id}>
<div class="tcd-b" style=${x.banner?{backgroundImage:`linear-gradient(180deg,rgba(10,14,20,.1),rgba(10,14,20,.85)),url("${x.banner}")`}:{backgroundImage:`linear-gradient(135deg,${x.col||'#445066'},#0c1117 130%)`}}><span class="rkb">#${x.rank}</span><${FavBtn} id=${x.id} cls="cardfav"/></div>
<div class="tcd-l"><${TeamLogo} x=${x} s=${72}/></div>
<b class="tcd-n">${x.name}</b>
<div class="tcd-s"><${Flag} x=${x}/><span>${x.region||x.cc}</span></div>
<div class="tcd-k"><div><b>${x.pts}</b><span>${t('points')}</span></div><div><b>${avg?f2(avg):'–'}</b><span>Rating</span></div><div><b>${r.n?r.wr+'%':'–'}</b><span>${t('win')}</span></div></div>
<div class="tcd-p">${x.pl.slice(0,5).map(p=>html`<span key=${p.id}><${Flag} x=${p}/>${p.nick}</span>`)}</div></a>`};

export const Teams=()=>{
  const [q,sq]=useState(''),[reg,sr]=useState(''),[sort,ss]=useState('rank');
  const regs=[...new Set(TEAMS.map(x=>x.region||x.cc).filter(Boolean))];
  const avg=x=>x.pl.length?x.pl.reduce((s,p)=>s+p.rt,0)/x.pl.length:0;
  const l=TEAMS.filter(x=>(!q||x.name.toLowerCase().includes(q.toLowerCase())||x.tag.toLowerCase().includes(q.toLowerCase()))&&(!reg||(x.region||x.cc)===reg)).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):sort==='rating'?avg(b)-avg(a):a.rank-b.rank);
  return html`<div class="col"><div class="toolbar"><input class="srch" placeholder=${t('team')+'…'} value=${q} onInput=${e=>sq(e.target.value)}/>
<select value=${reg} onChange=${e=>sr(e.target.value)}><option value="">${t('region')}: ${t('all')}</option>${regs.map(r=>html`<option key=${r} value=${r}>${r}</option>`)}</select>
<select value=${sort} onChange=${e=>ss(e.target.value)}><option value="rank">${t('sortBy')}: ${t('rank')}</option><option value="rating">${t('sortBy')}: Rating</option><option value="name">${t('sortBy')}: A–Z</option></select></div>
${l.length?html`<div class="tcds">${l.map(x=>html`<${TeamCard} key=${x.id} x=${x}/>`)}</div>`:html`<${Empty}/>`}</div>`};
