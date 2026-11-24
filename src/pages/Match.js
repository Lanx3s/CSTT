import {Comments} from '../components/Comments.js';
import {html,F} from '../lib/html.js';
import {MS,PS,TR,team,tour,player,SITE} from '../lib/data.js';
import {t,L} from '../lib/i18n.js';
import {Compare} from '../components/Fx.js';
import {Lineups,MatchInfo} from '../components/Extra.js';
import {winner,formOf,h2h,byRecent,byTime,f2} from '../lib/calc.js';
import {Box,Empty,TeamLogo,Flag,Bm,Rt,mapBg,flagSrc,MapTile,TourLogo,Chip,Row,PlayerPic} from '../components/common.js';

const Form=({id})=>html`<span class="form">${formOf(id,5).map((x,i)=>html`<i key=${i} class=${'f-'+x}>${x==='w'?'W':x==='l'?'L':'D'}</i>`)}</span>`;

const Side=({id,right,sc,cl})=>{const T=team(id),inner=html`<${F}><${TeamLogo} x=${T} s=${92}/><b class="nm">${T.name}</b>${sc!=null&&html`<b class=${'hx-sc '+(cl||'')}>${sc}</b>`}<span class="sb">${T.cc&&html`<${Flag} x=${T}/>`}${T.rank?html`<span>#${T.rank}</span>`:null}</span>${id!=null&&html`<${Form} id=${id}/>`}<//>`;
  return T.tbd?html`<div class=${'mteam '+(right?'r':'')}>${inner}</div>`:html`<a class=${'mteam '+(right?'r':'')} href=${'#/team/'+T.id}>${inner}</a>`};

/* карточка карты: фон-картинка, кто выбрал, счёт, половины */
const MapCard=({x,i,m,pk})=>{
  if(!x)return html`<div class="mcard empty"><div class="mc-top"><span>${t('map')} ${i+1}</span></div><div class="mc-name">TBD</div><div class="mc-h">${t('tbdMap')}</div></div>`;
  const has=x.a!=null,wa=has&&x.a>x.b,wb=has&&x.b>x.a,p=pk(x);
  return html`<div class=${'mcard '+(x.live?'live':has?'done':'up')} style=${mapBg(x.m)}>
<div class="mc-top"><span>${t('map')} ${i+1}</span>${x.live?html`<span class="live">LIVE</span>`:p==='d'?html`<span class="pk">${t('decider')}</span>`:p?html`<span class="pk"><${TeamLogo} x=${team(p==='a'?m.a:m.b)} s=${16}/> ${t('pick')}</span>`:null}</div>
<div class="mc-name">${x.m}</div>
${has?html`<div class="mc-sc"><${TeamLogo} x=${team(m.a)} s=${30}/><b class=${wa?'w':wb?'l':''}>${x.a}</b><i>:</i><b class=${wb?'w':wa?'l':''}>${x.b}</b><${TeamLogo} x=${team(m.b)} s=${30}/></div>`:html`<div class="mc-sc mu">—</div>`}
${x.h&&x.h.length>=4&&html`<div class="mc-h" title=${t('halves')}>${x.h[0]}:${x.h[1]} <span>·</span> ${x.h[2]}:${x.h[3]}${x.h.length>=6?html` <span>·</span> OT ${x.h[4]}:${x.h[5]}`:''}</div>`}</div>`};

const Veto=({m})=>{
  if(!m.veto.length)return null;
  const nm=v=>v.t==='d'?t('decider'):team(v.t==='a'?m.a:m.b).tag;
  return html`<${Box} h=${t('vetoT')}><div class="vt">${m.veto.map((v,i)=>html`<div class=${'vc '+v.k} key=${i} style=${mapBg(v.m,.15)}><span class="vn">${i+1}</span><span class="vk">${v.k==='ban'?'BAN':v.k==='pick'?'PICK':t('decider').toUpperCase()}</span><b class="vm">${v.m}</b><span class="vw">${v.t==='d'?html`<i class="mu">—</i>`:html`<${TeamLogo} x=${team(v.t==='a'?m.a:m.b)} s=${18}/>`}<span>${nm(v)}</span></span></div>`)}</div><//>`};

const Stats=({m})=>{
  const rows=PS.filter(x=>x.m===m.id).map(x=>({...x,pl:player(x.p)})).filter(x=>x.pl);
  if(!rows.length)return html`<${Box} h=${t('matchStats')}><${Empty} text=${t('noStats')} icon="📊"/><//>`;
  const best=m.mvp!=null?m.mvp:rows.slice().sort((a,b)=>b.rt-a.rt)[0].p;
  return html`<div class="g2">${[m.a,m.b].filter(k=>k!=null).map(k=>html`<${Box} key=${k} h=${team(k).name}><table class="tbl"><thead><tr><th>${t('players')}</th><th class="num">K-D</th><th class="num">+/-</th><th class="num">ADR</th><th class="num">KAST</th><th class="num">Rating</th></tr></thead><tbody>${rows.filter(x=>x.pl.team===k).sort((a,b)=>b.rt-a.rt).map(x=>html`<tr key=${x.p} class=${x.p===best?'mvp':''}><td><a class="plk" href=${'#/player/'+x.p}><${Flag} x=${x.pl}/><b>${x.pl.nick}</b>${x.p===best&&html`<span class="star" title=${t('matchMvp')}>★</span>`}</a></td><td class="num">${x.k}-${x.d}</td><td class=${'num '+(x.k-x.d>=0?'up':'dn')}>${x.k-x.d>0?'+':''}${x.k-x.d}</td><td class="num">${(+x.adr).toFixed(1)}</td><td class="num">${x.kast?x.kast+'%':'–'}</td><td class="num"><${Rt} v=${x.rt}/></td></tr>`)}</tbody></table><//>`)}</div>`};

export const Match=({id})=>{
  const m=MS.find(x=>x.id==id);if(!m)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const A=team(m.a),B=team(m.b),R=tour(m.tour),f=m.st==='fin',w=winner(m),H=h2h(m.a,m.b);
  const pickFromVeto=x=>{const v=m.veto.find(v=>v.k==='pick'&&v.m.toLowerCase()===x.m.toLowerCase());if(v)return v.t;const l=m.veto.find(v=>v.k==='left'&&v.m.toLowerCase()===x.m.toLowerCase());return l?'d':null};
  const pk=x=>x.pick||pickFromVeto(x)||'';
  const n=f?m.maps.length:Math.max(m.bo,m.maps.length),slots=Array.from({length:n},(_,i)=>m.maps[i]||null);
  const same=MS.filter(x=>x.tour===m.tour&&x.id!==m.id&&(x.stage===m.stage)&&(x.grp||'')===(m.grp||'')).sort(byTime).slice(0,6);
  const bg={};
  const pool=R?R.pool:[];
  return html`<div class="mpage">
<div class="crumb"><a href="#/tournaments">${t('tournaments')}</a><i>›</i>${R?html`<a href=${'#/tournament/'+R.id}>${R.n}</a>`:null}<i>›</i><a href=${'#/tournament/'+m.tour+'/bracket'}>${t(m.stage)||'—'}${m.grp?' · '+t('group')+' '+m.grp:''}${m.rnd&&['Swiss','GSL','Group stage'].includes(m.stage)?' · '+t('round')+' '+m.rnd:''}</a></div>
<section class="mhd" style=${bg}>
<div class="mh-main"><${Side} id=${m.a} sc=${m.st==='up'?null:m.s1} cl=${f?(w===m.a?'w':w===m.b?'l':''):''}/>
<div class="mcenter"><div class=${'hx-time'+(m.tm?'':' nd')}>${m.tm||m.d||'—'}</div>${m.tm&&m.d&&html`<div class="hx-date">${m.d}</div>`}${R&&html`<a class="hx-ev" href=${'#/tournament/'+R.id}>${R.n}</a>`}<div class=${'hx-st '+m.st}>${m.st==='live'?'● LIVE':f?t('finished'):'BO'+m.bo}</div>${m.st!=='up'&&html`<span class="bo">BO${m.bo}</span>`}</div>
<${Side} id=${m.b} right=${1} sc=${m.st==='up'?null:m.s2} cl=${f?(w===m.b?'w':w===m.a?'l':''):''}/></div>
${(m.note||(f&&w!=null))&&html`<div class="mh-note">${m.note}${f&&w!=null&&html`<${F}> <b>${team(w).name}</b> ${t('winner').toLowerCase()}<//>`}</div>`}</section>
<div class="mgrid2"><div class="col">
<${Box} h=${t('maps')} right=${f&&m.maps.length?html`<span class="hint">${t('mapsPlayed')}: ${m.maps.length}</span>`:null}>${slots.length?html`<div class="mcards">${slots.map((x,i)=>html`<${MapCard} key=${i} x=${x} i=${i} m=${m} pk=${pk}/>`)}</div>`:html`<${Empty} text=${t('noMapsYet')} icon="🗺"/>`}${!m.maps.length&&pool.length>0&&html`<div class="poolrow"><small>${t('mappool')}</small><div>${pool.map(p=>html`<${MapTile} key=${p} name=${p} cls="sm"/>`)}</div></div>`}<//>
<${Compare} m=${m}/>
<${Lineups} m=${m}/>
<${Veto} m=${m}/>
<${Stats} m=${m}/>
<${Comments} kind="match" id=${m.id}/></div>
<aside>
<${MatchInfo} m=${m}/>
<${Box} h=${t('h2h')}><div class="h2h"><${TeamLogo} x=${A} s=${40}/><div class="sc"><b class=${H.a>H.b?'w':''}>${H.a}</b><i>–</i><b class=${H.b>H.a?'w':''}>${H.b}</b></div><${TeamLogo} x=${B} s=${40}/></div>${H.list.slice(0,4).map(x=>html`<${Bm} key=${x.id} m=${x} tag=${1}/>`)}${!H.list.length&&html`<${Empty} text=${t('none')}/>`}<//>
<${Box} h=${t('form')}><div class="frow"><span>${A.name}</span><${Form} id=${m.a}/></div><div class="frow"><span>${B.name}</span><${Form} id=${m.b}/></div><//>
${same.length>0&&html`<${Box} h=${t('sameEvent')} href=${'#/tournament/'+m.tour}><div class="mlist">${same.map(x=>html`<${Bm} key=${x.id} m=${x}/>`)}</div><//>`}
</aside></div></div>`};
