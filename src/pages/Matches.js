import {useState} from 'react';
import {html} from '../lib/html.js';
import {MS,TR,team} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {byTime,byRecent} from '../lib/calc.js';
import {Box,Rows,Row,Tabs,Empty} from '../components/common.js';
import {useFav} from '../lib/fav.js';

const Grouped=({list})=>{
  if(!list.length)return html`<${Empty}/>`;
  const g=[];list.forEach(m=>{const k=m.d||'—';let x=g.find(y=>y[0]===k);if(!x)g.push(x=[k,[]]);x[1].push(m)});
  return g.map(([d,l])=>html`<div key=${d}><div class="dh">${d}</div>${l.map(m=>html`<${Row} key=${m.id} m=${m} ev=${1}/>`)}</div>`)};

export const Matches=()=>{
  const fav=useFav(),[fo,sfo]=useState(false),[f,sf]=useState('all'),[to,sto]=useState(''),[q,sq]=useState('');
  const ok=m=>(!fo||fav.includes(m.a)||fav.includes(m.b))&&(!to||m.tour==to)&&(!q||(team(m.a).name+' '+team(m.b).name).toLowerCase().includes(q.toLowerCase()));
  const lv=MS.filter(m=>m.st==='live'&&ok(m)),up=MS.filter(m=>m.st==='up'&&ok(m)).sort(byTime),fin=MS.filter(m=>m.st==='fin'&&ok(m)).sort(byRecent);
  const B=[['all',t('all'),MS.filter(ok).length],['live',t('live'),lv.length],['up',t('upc'),up.length],['fin',t('res'),fin.length]];
  return html`<div class="col"><div class="toolbar"><${Tabs} tabs=${B} cur=${f} on=${sf}/>
<button class=${fo?'on':''} onClick=${()=>sfo(!fo)}>${t('favOnly')}</button><select value=${to} onChange=${e=>sto(e.target.value)}><option value="">${t('tournaments')}: ${t('all')}</option>${TR.map(o=>html`<option key=${o.id} value=${o.id}>${o.n}</option>`)}</select>
<input class="srch" placeholder=${t('team')+'…'} value=${q} onInput=${e=>sq(e.target.value)}/></div>
${(f==='all'||f==='live')&&lv.length>0&&html`<${Box} h=${t('live')} cls="livebox"><${Grouped} list=${lv}/><//>`}
${(f==='all'||f==='up')&&html`<${Box} h=${t('upc')}><${Grouped} list=${up}/><//>`}
${(f==='all'||f==='fin')&&html`<${Box} h=${t('res')}><${Grouped} list=${fin}/><//>`}</div>`};
