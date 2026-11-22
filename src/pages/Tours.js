import {useState} from 'react';
import {html} from '../lib/html.js';
import {TR,MS,team} from '../lib/data.js';
import {t,L} from '../lib/i18n.js';
import {tourTeams} from '../lib/calc.js';
import {Tabs,Empty,TourLogo,tourStyle,stLabel,TeamLogo,Chip} from '../components/common.js';

export const TourCard=({o})=>{
  const w=o.s==='fin'&&o.winner!=null?team(o.winner):null,n=o.tn||tourTeams(o.id).length;
  return html`<a class="tcard" style=${tourStyle(o)} href=${'#/tournament/'+o.id}>
<${TourLogo} o=${o} s=${64}/>
<div class="tc-i"><div class="tc-h"><span class=${'badge '+o.s}>${o.s==='live'?'● ':''}${stLabel(o.s)}</span>${o.tier&&html`<${Chip}>${o.tier}<//>`}</div><h3>${o.n}</h3>
<div class="kv"><div><b>${o.pr||'–'}</b><span>${t('prize')}</span></div><div><b>${o.d||'–'}</b><span>${t('dates')}</span></div><div><b>${n||'–'}</b><span>${t('teamsN')}</span></div>${o.loc&&html`<div><b>${o.loc}</b><span>${t('loc')}</span></div>`}</div></div>
${w&&html`<div class="tc-w"><small>${t('winner')}</small><${TeamLogo} x=${w} s=${40}/><b>${w.name}</b></div>`}</a>`};

export const Tours=()=>{
  const [f,sf]=useState('all'),[q,sq]=useState('');
  const l=TR.filter(o=>!q||o.n.toLowerCase().includes(q.toLowerCase())),S=[['live',t('ongoing')],['up',t('upcomingEv')],['fin',t('finishedEv')]];
  return html`<div class="col"><div class="toolbar"><${Tabs} tabs=${[['all',t('all')],...S.map(([k,v])=>[k,v,l.filter(o=>o.s===k).length])]} cur=${f} on=${sf}/><input class="srch" placeholder=${t('search')+'…'} value=${q} onInput=${e=>sq(e.target.value)}/></div>
${S.filter(([k])=>f==='all'||f===k).map(([k,v])=>{const x=l.filter(o=>o.s===k);return x.length?html`<section key=${k}><h2 class="sec">${v}</h2><div class="tgrid">${x.map(o=>html`<${TourCard} key=${o.id} o=${o}/>`)}</div></section>`:null})}
${!l.length&&html`<${Empty}/>`}</div>`};
