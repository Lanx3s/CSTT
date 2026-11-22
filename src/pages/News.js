import {useState} from 'react';
import {html} from '../lib/html.js';
import {NEWS,MS,TR,SITE,news as getNews,tour,team} from '../lib/data.js';
import {t,L} from '../lib/i18n.js';
import {byTime} from '../lib/calc.js';
import {Box,Empty,NewsRow,NewsMini,Bm,Chip,TourLogo,TeamLogo,Tabs} from '../components/common.js';
import {Md,readTime} from '../components/Md.js';

/* ---------- список новостей ---------- */
export const News=()=>{
  const [tag,st]=useState(''),[q,sq]=useState('');
  const tags=[...new Set(NEWS.map(n=>n.tag))];
  const list=NEWS.filter(n=>(!tag||n.tag===tag)&&(!q||(L(n.ti)+' '+L(n.sub)).toLowerCase().includes(q.toLowerCase())));
  const up=MS.filter(m=>m.st!=='fin').sort(byTime).slice(0,5);
  return html`<div class="g2w"><div class="col">
<div class="toolbar"><div class="pills"><button class=${!tag?'on':''} onClick=${()=>st('')}>${t('all')}</button>${tags.map(x=>html`<button key=${x} class=${tag===x?'on':''} onClick=${()=>st(x)}>${x}</button>`)}</div><input class="srch" placeholder=${t('search')+'…'} value=${q} onInput=${e=>sq(e.target.value)}/></div>
<${Box} h=${t('news')}>${list.length?list.map(n=>html`<${NewsRow} key=${n.id} n=${n}/>`):html`<${Empty} text=${t('noNews')}/>`}<//></div>
<aside><${Box} h=${t('upc')} href="#/matches">${up.length?html`<div class="mlist">${up.map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div>`:html`<${Empty}/>`}<//>
<${Box} h=${t('pop')}>${NEWS.slice(0,6).map(n=>html`<${NewsMini} key=${n.id} n=${n}/>`)}<//></aside></div>`};

/* ---------- страница поста ---------- */
export const NewsPost=({id})=>{
  const n=getNews(id);
  const [cp,scp]=useState(false),[lb,slb]=useState(null);
  if(!n)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const i=NEWS.findIndex(x=>x.id===n.id),prev=NEWS[i+1],next=NEWS[i-1];
  const bg=n.bg||n.img,lay=n.layout==='hltv'||!n.layout?'hltv':n.layout==='side'?(n.img||n.gallery[0]?'side':'plain'):bg?(n.layout||'cover'):'plain',body=L(n.body),R=n.tour!=null?tour(n.tour):null,T=n.team!=null?team(n.team):null;
  const rel=NEWS.filter(x=>x.id!==n.id&&(x.tag===n.tag||(n.tour!=null&&x.tour===n.tour))).slice(0,4),more=rel.length?rel:NEWS.filter(x=>x.id!==n.id).slice(0,4);
  const copy=()=>{try{navigator.clipboard.writeText(location.href);scp(true);setTimeout(()=>scp(false),1800)}catch(e){}};
  const head=html`<div class="ph-in"><a class="back" href="#/news">← ${t('allNews')}</a><span class="ntag lg" style=${{background:n.c}}>${n.tag}</span><h1>${L(n.ti)}</h1>${L(n.sub)&&html`<p class="lead">${L(n.sub)}</p>`}<div class="meta"><span>${n.d}</span>${n.author&&html`<span>${t('author')}: <b>${n.author}</b></span>`}${body&&html`<span>${readTime(body)} ${t('minRead')}</span>`}<button class="ghost" onClick=${copy}>${cp?'✓ '+t('copied'):'🔗 '+t('share')}</button></div></div>`;
  if(lay==='hltv'){const cv=n.img||n.bg;return html`<div class="post hltv"><div class="pgrid"><article class="pbody">
<div class="hn-top"><a class="back" href="#/news">← ${t('allNews')}</a><span class="ntag lg" style=${{background:n.c}}>${n.tag}</span>${R&&html`<a class="hn-ev" href=${'#/tournament/'+R.id}><${TourLogo} o=${R} s=${18}/>${R.n}</a>`}</div>
<h1>${L(n.ti)}</h1>
<div class="hn-by"><span>${n.author||'CSTT'}</span><span>${n.d}${readTime?' · '+readTime(body)+' '+t('minRead'):''}</span></div>
${L(n.sub)&&html`<p class="lead">${L(n.sub)}</p>`}
${cv&&html`<img class="hn-img" src=${cv} alt="" onClick=${()=>slb(cv)}/>`}
${body?html`<${Md} text=${body}/>`:null}
${n.gallery.length>0&&html`<div class="gal2">${n.gallery.map((g,k)=>html`<img key=${k} src=${g} alt="" loading="lazy" onClick=${()=>slb(g)}/>`)}</div>`}${lb&&html`<div class="lbx" onClick=${()=>slb(null)}><img src=${lb} alt=""/></div>`}
<div class="pnav">${prev?html`<a href=${'#/news/'+prev.id}>← ${t('prev')}<b>${L(prev.ti)}</b></a>`:html`<span/>`}${next?html`<a class="r" href=${'#/news/'+next.id}>${t('next')} →<b>${L(next.ti)}</b></a>`:html`<span/>`}</div></article>
<aside>${(R||T)&&html`<${Box} h=${t('relEvent')}><div class="in">${R&&html`<a class="emb embt" href=${'#/tournament/'+R.id}><${TourLogo} o=${R} s=${44}/><span><b>${R.n}</b><small>${[R.d,R.pr].filter(Boolean).join(' · ')}</small></span></a>`}${T&&!T.tbd&&html`<a class="emb embt" href=${'#/team/'+T.id}><${TeamLogo} x=${T} s=${44}/><span><b>${T.name}</b></span></a>`}</div><//>`}
<${Box} h=${t('related')}>${more.map(x=>html`<${NewsMini} key=${x.id} n=${x}/>`)}<//></aside></div></div>`}
  return html`<div class=${'post '+lay} style=${lay==='full'?{'--pbg':`url("${bg}")`}:{}}>
${lay==='cover'&&html`<div class="phero" style=${{backgroundImage:`linear-gradient(180deg,rgba(8,12,18,.35),var(--bg) 98%),url("${bg}")`}}>${head}</div>`}
${lay!=='cover'&&lay!=='side'&&html`<div class="phead">${head}</div>`}
<div class="pgrid"><article class="pbody">${lay==='side'&&html`<div class="sidehd">${n.img||n.gallery[0]?html`<img class="sideimg" src=${n.img||n.gallery[0]} alt="" onClick=${()=>slb(n.img||n.gallery[0])}/>`:null}${head}</div>`}${n.img&&lay==='plain'&&html`<img class="pcover" src=${n.img} alt=""/>`}${body?html`<${Md} text=${body}/>`:null}
${n.gallery.length>0&&html`<div class="gal2">${n.gallery.map((g,k)=>html`<img key=${k} src=${g} alt="" loading="lazy" onClick=${()=>slb(g)}/>`)}</div>`}${lb&&html`<div class="lbx" onClick=${()=>slb(null)}><img src=${lb} alt=""/></div>`}<div class="pnav">${prev?html`<a href=${'#/news/'+prev.id}>← ${t('prev')}<b>${L(prev.ti)}</b></a>`:html`<span/>`}${next?html`<a class="r" href=${'#/news/'+next.id}>${t('next')} →<b>${L(next.ti)}</b></a>`:html`<span/>`}</div></article>
<aside>${(R||T)&&html`<${Box} h=${t('relEvent')}><div class="in">${R&&html`<a class="emb embt" href=${'#/tournament/'+R.id}><${TourLogo} o=${R} s=${44}/><span><b>${R.n}</b><small>${[R.d,R.pr].filter(Boolean).join(' · ')}</small></span></a>`}${T&&!T.tbd&&html`<a class="emb embt" href=${'#/team/'+T.id}><${TeamLogo} x=${T} s=${44}/><span><b>${T.name}</b><small>#${T.rank} · ${T.pts} ${t('points')}</small></span></a>`}</div><//>`}
<${Box} h=${t('related')}>${more.map(x=>html`<${NewsMini} key=${x.id} n=${x}/>`)}<//></aside></div></div>`};
