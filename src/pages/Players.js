import {useState} from 'react';
import {html} from '../lib/html.js';
import {PL,TEAMS,TI,team,pteam} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {f2,f1} from '../lib/calc.js';
import {Box,Empty,Flag,TeamLogo,TeamLink,PlayerPic,Rt,Tabs,Ico} from '../components/common.js';

const COLS=[['rt','Rating',p=>f2(p.rt)],['kd','K/D',p=>f2(p.kd)],['adr','ADR',p=>f1(p.adr)],['kast','KAST',p=>p.kast+'%'],['hs','HS%',p=>p.hs+'%'],['maps',null,p=>p.maps]];

export const Players=()=>{
  const [q,sq]=useState(''),[tm,st]=useState(''),[cc,sc]=useState(''),[role,sro]=useState(''),[view,sv]=useState('cards'),[sort,ss]=useState('rt');
  const ccs=[...new Set(PL.map(p=>p.cc).filter(Boolean))].sort(),roles=[...new Set(PL.map(p=>p.role).filter(Boolean))].sort();
  const l=PL.filter(p=>(!q||(p.nick+' '+p.name).toLowerCase().includes(q.toLowerCase()))&&(!tm||p.team==tm)&&(!cc||p.cc===cc)&&(!role||p.role===role)).sort((a,b)=>b[sort]-a[sort]);
  const th=(k,lb)=>html`<th class=${'num srt '+(sort===k?'on':'')} onClick=${()=>ss(k)}>${lb}${sort===k?' ▼':''}</th>`;
  return html`<div class="col"><div class="toolbar"><input class="srch" placeholder=${t('players')+'…'} value=${q} onInput=${e=>sq(e.target.value)}/>
<select value=${tm} onChange=${e=>st(e.target.value)}><option value="">${t('allT')}</option>${TEAMS.map(x=>html`<option key=${x.id} value=${x.id}>${x.name}</option>`)}</select>
<select value=${cc} onChange=${e=>sc(e.target.value)}><option value="">${t('allC')}</option>${ccs.map(x=>html`<option key=${x} value=${x}>${x}</option>`)}</select>
<select value=${role} onChange=${e=>sro(e.target.value)}><option value="">${t('allR')}</option>${roles.map(x=>html`<option key=${x} value=${x}>${x}</option>`)}</select>
<${Tabs} tabs=${[['cards',t('cards')],['table',t('table')]]} cur=${view} on=${sv}/></div>
${!l.length?html`<${Empty}/>`:view==='cards'?html`<div class="pgrid2">${l.map(p=>{const T=pteam(p),ti=TI.filter(x=>x.player===p.id).slice(0,2);return html`<a class="pcd" key=${p.id} href=${'#/player/'+p.id}>
<div class="pcd-p" style=${{'--c':T.col}}><${PlayerPic} p=${p}/><span class="pcd-t"><${TeamLogo} x=${T} s=${26}/></span></div>
<div class="pcd-i"><b><${Flag} x=${p}/> ${p.nick}</b><small>${p.name||' '}</small><small class="mu">${[T.name,p.role].filter(Boolean).join(' · ')}</small></div>
<div class="pcd-r"><${Rt} v=${p.rt}/><span>Rating</span></div></a>`})}</div>`:
html`<${Box} h=${t('players')} right=${html`<span class="hint">${l.length}</span>`}><table class="tbl"><thead><tr><th class="num">#</th><th>${t('players')}</th><th>${t('team')}</th>${th('maps',t('maps'))}${th('kd','K/D')}${th('adr','ADR')}${th('kast','KAST')}${th('hs','HS%')}${th('rt','Rating')}</tr></thead><tbody>${l.map((p,i)=>html`<tr key=${p.id}><td class="num mu">${i+1}</td><td><a class="plk" href=${'#/player/'+p.id}><${Flag} x=${p}/><b>${p.nick}</b></a></td><td><${TeamLink} id=${p.team} s=${18}/></td><td class="num">${p.maps}</td><td class="num">${f2(p.kd)}</td><td class="num">${f1(p.adr)}</td><td class="num">${p.kast}%</td><td class="num">${p.hs}%</td><td class="num"><${Rt} v=${p.rt}/></td></tr>`)}</tbody></table><//>`}</div>`};
