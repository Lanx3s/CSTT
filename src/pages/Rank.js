import {useState} from 'react';
import {html} from '../lib/html.js';
import {rk} from '../lib/data.js';
import {t,lang} from '../lib/i18n.js';
import {formOf} from '../lib/calc.js';
import {TeamLogo,Box,Flag,Empty,PlayerPic} from '../components/common.js';

/* рейтинг команд как на HLTV: у каждой команды раскрывается состав; открыта только первая */
export const Rank=()=>{
  const ru=lang==='ru',[open,so]=useState(()=>new Set(rk.length?[rk[0].id]:[]));
  const tog=id=>so(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n});
  return html`<${Box} h=${t('rank')}>${rk.length?html`<div class="rank2">${rk.map(x=>{const on=open.has(x.id);
  return html`<div class=${'rk2'+(on?' on':'')} key=${x.id}>
<div class="rk2-h" role="button" tabIndex="0" onClick=${()=>tog(x.id)} onKeyDown=${e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(x.id)}}}>
<span class=${'no n'+Math.min(x.rank,4)}>${x.rank}</span><${TeamLogo} x=${x} s=${40}/>
<span class="nm"><b>${x.name}</b><small><${Flag} x=${x}/> ${x.region||x.cc}</small></span>
<span class="form">${formOf(x.id,5).map((f,i)=>html`<i key=${i} class=${'f-'+f}>${f==='w'?'W':f==='l'?'L':'D'}</i>`)}</span>
<span class="pts"><b>${x.pts}</b><small>${t('points')}</small></span>
<span class=${'chg '+(x.ch>0?'up':x.ch<0?'dn':'mu')}>${x.ch>0?'▲ '+x.ch:x.ch<0?'▼ '+Math.abs(x.ch):'–'}</span>
<span class="rk2-ar">${on?'▴':'▾'}</span></div>
${on&&html`<div class="rk2-b"><div class="rk2-pl">${x.pl.slice(0,7).map(p=>html`<a class="rk2-p" key=${p.id} href=${'#/player/'+p.id}><span class="rk2-ph"><${PlayerPic} p=${p}/></span><span class="rk2-n"><${Flag} x=${p}/>${p.nick}</span></a>`)}${!x.pl.length&&html`<span class="mu rk2-e">${ru?'Состав не указан':'No lineup'}</span>`}</div>
<a class="rk2-go" href=${'#/team/'+x.id}>${ru?'Профиль команды':'Team profile'}</a></div>`}</div>`})}</div>`:html`<${Empty}/>`}<//>`};
