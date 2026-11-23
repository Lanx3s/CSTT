import {useState,useEffect} from 'react';
import {html} from '../lib/html.js';
import {searchUsers} from '../lib/users.js';
import {UAva} from './User.js';
import {TEAMS,PL,TR,NEWS,team,pteam} from '../lib/data.js';
import {t,L,lang} from '../lib/i18n.js';
import {Box,Empty,TeamLogo,Flag,TourLogo,NewsMini} from '../components/common.js';

export const Search=({q})=>{
  const s=decodeURIComponent(q||'').toLowerCase().trim(),has=x=>(x||'').toLowerCase().includes(s);
  const tt=s?TEAMS.filter(x=>has(x.name)||has(x.tag)):[],pp=s?PL.filter(x=>has(x.nick)||has(x.name)):[],oo=s?TR.filter(x=>has(x.n)):[],nn=s?NEWS.filter(n=>has(L(n.ti))||has(L(n.sub))):[];
  const [uu,su]=useState([]);useEffect(()=>{let ok=1;if(s)searchUsers(s).then(r=>{if(ok)su(r)});else su([]);return()=>{ok=0}},[s]);
  const none=!tt.length&&!pp.length&&!oo.length&&!nn.length&&!uu.length;
  return html`<div class="col"><h2 class="sec">${t('search')}: «${s}»</h2>${none&&html`<${Box}><${Empty}/><//>`}
${tt.length>0&&html`<${Box} h=${t('teams')}>${tt.map(x=>html`<a class="ev1" key=${x.id} href=${'#/team/'+x.id}><${TeamLogo} x=${x} s=${32}/><span><b>${x.name}</b><small>#${x.rank} · ${x.cc}</small></span></a>`)}<//>`}
${pp.length>0&&html`<${Box} h=${t('players')}>${pp.map(x=>html`<a class="ev1" key=${x.id} href=${'#/player/'+x.id}><${Flag} x=${x}/><span><b>${x.nick}</b><small>${pteam(x).name}${x.name?' · '+x.name:''}</small></span></a>`)}<//>`}
${uu.length>0&&html`<${Box} h=${lang==='ru'?'Пользователи сайта':'Site users'}>${uu.map(u=>html`<a class="ev1" key=${u.id} href=${'#/user/'+(u.pid||encodeURIComponent(u.nick))}><${UAva} u=${u} s=${32}/><span><b>${u.nick}</b><small>ID ${u.pid||'—'}</small></span></a>`)}<//>`}
${oo.length>0&&html`<${Box} h=${t('tournaments')}>${oo.map(x=>html`<a class="ev1" key=${x.id} href=${'#/tournament/'+x.id}><${TourLogo} o=${x} s=${32}/><span><b>${x.n}</b><small>${x.d}</small></span></a>`)}<//>`}
${nn.length>0&&html`<${Box} h=${t('news')}>${nn.map(n=>html`<${NewsMini} key=${n.id} n=${n}/>`)}<//>`}</div>`};
