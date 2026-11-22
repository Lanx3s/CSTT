/* Поиск с подсказками (команды, игроки, турниры, новости) */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {TEAMS,PL,TR,NEWS,team,pteam} from '../lib/data.js';
import {t,L} from '../lib/i18n.js';
import {TeamLogo,Flag,TourLogo} from './common.js';

export const SearchBox=()=>{
  const [q,sq]=useState(''),[open,so]=useState(false),ref=useRef();
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))so(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[]);
  const s=q.trim().toLowerCase(),has=x=>(x||'').toLowerCase().includes(s);
  const R=s.length<1?[]:[
    ...TEAMS.filter(x=>has(x.name)||has(x.tag)).slice(0,4).map(x=>({k:'t'+x.id,h:'#/team/'+x.id,i:html`<${TeamLogo} x=${x} s=${22}/>`,n:x.name,s:t('team')+' · #'+x.rank})),
    ...PL.filter(x=>has(x.nick)||has(x.name)).slice(0,4).map(x=>({k:'p'+x.id,h:'#/player/'+x.id,i:html`<${Flag} x=${x}/>`,n:x.nick,s:pteam(x).name})),
    ...TR.filter(x=>has(x.n)).slice(0,3).map(x=>({k:'o'+x.id,h:'#/tournament/'+x.id,i:html`<${TourLogo} o=${x} s=${22}/>`,n:x.n,s:x.d})),
    ...NEWS.filter(n=>has(L(n.ti))).slice(0,3).map(n=>({k:'n'+n.id,h:'#/news/'+n.id,i:html`<span class="ntag" style=${{background:n.c}}>${n.tag}</span>`,n:L(n.ti),s:n.d}))];
  const go=()=>{if(q.trim()){so(false);location.hash='#/search/'+encodeURIComponent(q.trim())}};
  return html`<div class="sbox" ref=${ref}><input class="srch" placeholder=${t('searchPh')} value=${q} onInput=${e=>{sq(e.target.value);so(true)}} onFocus=${()=>so(true)} onKeyDown=${e=>{if(e.key==='Enter')go();if(e.key==='Escape')so(false)}}/>
${open&&R.length>0&&html`<div class="sdd">${R.map(r=>html`<a key=${r.k} href=${r.h} onClick=${()=>{so(false);sq('')}}><span class="si">${r.i}</span><span class="sn"><b>${r.n}</b><small>${r.s}</small></span></a>`)}<a class="all" href=${'#/search/'+encodeURIComponent(q.trim())} onClick=${()=>so(false)}>${t('all')} →</a></div>`}</div>`};
