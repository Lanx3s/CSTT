import {createElement} from 'react';
import {html} from '../lib/html.js';
import {team,TEAMS,MS,TROPH,TI,tour} from '../lib/data.js';
import {t,lang} from '../lib/i18n.js';
import {record,formOf,teamMaps,teamEvents,byTime,byRecent,f2} from '../lib/calc.js';
import {Box,TeamLogo,Flag,Empty,Plate,Bm,Rt,PlayerPic,mapBg,Row,TourLogo,FavBtn,AchStrip,Ico,PT} from '../components/common.js';

const RB={IGL:'crown',AWPer:'target',AWP:'target',Entry:'bolt',Support:'shield',Lurker:'skull'};

export const Row2=({l,children,cls=''})=>html`<div class=${'pr '+cls}><span>${l}</span>${createElement('b',null,...(Array.isArray(children)?children:[children]))}</div>`;

export const Team=({id})=>{
  const x=team(id);if(x.tbd)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const ms=MS.filter(m=>m.a===x.id||m.b===x.id),fin=ms.filter(m=>m.st==='fin').sort(byRecent),pend=ms.filter(m=>m.st!=='fin').sort(byTime);
  const R=record(x.id),tr=TROPH.filter(y=>y.team===x.id),ti=TI.filter(y=>y.team===x.id&&y.player==null),mp=teamMaps(x.id),ev=teamEvents(x.id);
  const art=x.pl.length?x.pl.reduce((s,p)=>s+p.rt,0)/x.pl.length:0,ages=x.pl.filter(p=>p.age),age=ages.length?ages.reduce((s,p)=>s+p.age,0)/ages.length:0;
  const reg=x.region?TEAMS.filter(y=>y.region===x.region).sort((a,b)=>a.rank-b.rank).indexOf(x)+1:0;
  const pl=[...x.pl].sort((a,b)=>(a.role==='IGL'?-1:0)-(b.role==='IGL'?-1:0)||b.rt-a.rt);
  return html`<div class="col tprof">
${pl.length>0&&html`<div class="rost" style=${{'--n':pl.length}}>${pl.map(p=>html`<a class="rt1" key=${p.id} href=${'#/player/'+p.id}><${PlayerPic} p=${p}/>${RB[p.role]&&html`<span class="rbd" title=${p.role}><${Ico} n=${RB[p.role]} s=${14}/></span>`}<span class="rn"><${Flag} x=${p}/><b>${p.nick}</b></span></a>`)}</div>`}
<section class="prof2"><div class="pf-h"><${TeamLogo} x=${x} s=${104}/><div class="pf-t"><div class="pf-c"><${Flag} x=${x}/><span>${x.region||x.cc}</span></div><h1>${x.name}</h1>${x.slogan&&html`<p class="slg">${x.slogan}</p>`}</div><div class="pf-a"><${FavBtn} id=${x.id} cls="lg"/></div></div>
<div class="pf-rows"><${Row2} l=${t('rankC')}>#${x.rank}${reg>0&&html` <em class="sub">(${x.region} #${reg})</em>`}<//>
<${Row2} l=${t('pts')}>${x.pts}${x.ch!==0&&html` <em class=${'sub '+(x.ch>0?'up':'dn')}>${x.ch>0?'▲'+x.ch:'▼'+Math.abs(x.ch)}</em>`}<//>
${x.weeks!=null&&html`<${Row2} l=${t('weeksTop')}>${x.weeks}<//>`}
<${Row2} l=${t('avgAge')}>${age?age.toFixed(1):'–'}<//>
<${Row2} l=${t('avgRt')}><${Rt} v=${art}/><//>
<${Row2} l=${t('win')}>${R.n?R.wr+'% ':'–'}<em class="sub">(${R.w}-${R.l}${R.d?'-'+R.d:''})</em><//>
${x.founded&&html`<${Row2} l=${t('founded')}>${x.founded}<//>`}
${x.coach&&html`<${Row2} l=${t('coach')}>${x.coach}<//>`}
${x.elo>0&&html`<${Row2} l="AVG ELO">${x.elo}<//>`}
<${Row2} l=${t('form')}><span class="form">${formOf(x.id,5).map((f,i)=>html`<i key=${i} class=${'f-'+f}>${f==='w'?'W':f==='l'?'L':'D'}</i>`)}</span><//></div>
<${AchStrip} items=${[]} trophies=${tr}/></section>
<div class="stts">${[[R.n,t('matches')],[R.n?R.wr+'%':'–',t('win')],[mp.length?Math.round(mp.reduce((s,r)=>s+r.w,0)/Math.max(1,mp.reduce((s,r)=>s+r.p,0))*100)+'%':'–',t('mapWin')],[f2(art),t('avgRt')],[tr.length,t('trophies')],[ev.length,t('tournaments')]].map(([v,l])=>html`<div class="stt" key=${l}><b>${v}</b><span>${l}</span></div>`)}</div>
${ti.length>0&&html`<div class="plates">${ti.map(y=>html`<${Plate} key=${y.id} x=${y}/>`)}</div>`}
<div class="g2w"><div class="col">
${pl.length>0&&html`<${Box} h=${t('roster')}><${PT} list=${pl} team=${1}/><//>`}
${x.subs.length>0&&html`<${Box} h=${lang==='ru'?'Запасные':'Substitutes'}><${PT} list=${x.subs} team=${1}/><//>`}
${pend.length>0&&html`<${Box} h=${t('live')+' / '+t('upc')}><div class="mlist">${pend.slice(0,5).map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div><//>`}
<${Box} h=${t('hist')}>${fin.length?fin.slice(0,12).map(m=>html`<${Row} key=${m.id} m=${m} ev=${1}/>`):html`<${Empty}/>`}<//>
${tr.length>0&&html`<${Box} h=${t('trophies')}><div class="tro">${tr.map(y=>{const o=tour(y.tour);return html`<a class="tr1" key=${y.id} href=${o?'#/tournament/'+o.id:'#/team/'+x.id}>${y.img?html`<img src=${y.img} alt=""/>`:html`<span class="cup">★</span>`}<b>${y.title||(o&&o.n)}</b><small>${[y.place,y.year].filter(Boolean).join(' · ')}</small>${y.prize&&html`<small class="up">${y.prize}</small>`}</a>`})}</div><//>`}</div>
<aside>
${mp.length>0&&html`<${Box} h=${t('mapStatsT')}><div class="mapwr">${mp.map(r=>html`<div class="mwr" key=${r.name} style=${mapBg(r.name,.55)}><b>${r.name}</b><span>${r.w}/${r.p}</span><i style=${{width:Math.round(r.w/r.p*100)+'%'}}></i><em>${Math.round(r.w/r.p*100)}%</em></div>`)}</div><//>`}
${ev.length>0&&html`<${Box} h=${t('tournaments')}>${ev.map(o=>html`<a class="ev1" key=${o.id} href=${'#/tournament/'+o.id}><${TourLogo} o=${o} s=${30}/><span><b>${o.n}</b><small>${o.d}</small></span></a>`)}<//>`}
${x.about&&html`<${Box} h=${t('about')}><div class="in desc">${x.about}</div><//>`}</aside></div></div>`};
