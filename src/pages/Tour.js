import {useState} from 'react';
import {html} from '../lib/html.js';
import {MS,NEWS,tour,team,pteam,player,TT,MAPS} from '../lib/data.js';
import {t,L} from '../lib/i18n.js';
import {tourTeams,playerAgg,mapStats,byTime,byRecent,f2,f1,phases} from '../lib/calc.js';
import {Box,Rows,Row,TeamLogo,TeamLink,Bm,Empty,Tabs,Rt,Flag,MapTile,Chip,TourLogo,tourStyle,stLabel,Ico,NewsRow,mapInfo} from '../components/common.js';
import {Bracket} from '../components/Brackets.js';
import {Md} from '../components/Md.js';
import {TeamsAttending} from '../components/Extra.js';

const medal=i=>['trophy','medal','medal'][i]||null;
const MapPool=({o,full})=>{
  const S=mapStats(o.id),names=o.pool.length?o.pool:[...MAPS.filter(m=>m.active).map(m=>m.name)];
  const extra=Object.keys(S).filter(k=>!names.some(n=>n.toLowerCase()===k.toLowerCase()));
  if(!names.length&&!extra.length)return html`<${Empty} text=${t('none')} icon="🗺"/>`;
  const card=n=>{const s=S[n]||Object.values(S).find(x=>x.name.toLowerCase()===n.toLowerCase())||{played:0,picked:0,banned:0,rounds:0};
    return html`<${MapTile} key=${n} name=${n} cls=${full?'lg':''}>${full&&html`<div class="mstats"><span><b>${s.played}</b>${t('played2')}</span><span><b>${s.picked}</b>${t('picked')}</span><span><b>${s.banned}</b>${t('banned')}</span><span><b>${s.played?Math.round(s.rounds/s.played):'–'}</b>${t('avgR')}</span></div>`}<//>`};
  return html`<div class=${full?'mpool full':'mpool'}>${names.map(card)}${full&&extra.map(card)}</div>`};

const Overview=({o,ms})=>{
  const teams=tourTeams(o.id),mvp=o.s==='fin'?player(o.mvp):null,win=o.s==='fin'&&o.winner!=null?team(o.winner):null,top=playerAgg(o.id).slice(0,5);
  const S={up:t('soonT'),live:t('goingT'),fin:t('finished')};
  const info=[[t('prize'),o.pr],[t('dates'),o.d],[t('loc'),o.loc],[t('organizer'),o.organizer],[t('tier'),o.tier],[t('fmt'),o.fmt],[t('teamsN'),o.tn||teams.length],[t('stage'),o.st&&t(o.st)],[t('status'),S[o.s]]].filter(r=>r[1]);
  const lv=ms.filter(m=>m.st!=='fin').sort(byTime),fin=ms.filter(m=>m.st==='fin').sort(byRecent);
  return html`<div class="g2w"><div class="col">
<${Box} h=${t('info')}><table class="tbl ib"><tbody>${info.map(([a,b])=>html`<tr key=${a}><td>${a}</td><td><b>${b}</b></td></tr>`)}</tbody></table>${L(o.ds)&&html`<div class="in desc">${L(o.ds)}</div>`}<//>
${o.prizes.length>0&&html`<${Box} h=${t('prizes')}><table class="tbl prz"><tbody>${o.prizes.map((r,i)=>html`<tr key=${i}><td class="pl">${medal(i)?html`<span class=${'md m'+i}><${Ico} n=${medal(i)} s=${16}/></span>`:null}${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]&&(team(+r[2]).tbd?r[2]:html`<${TeamLink} id=${+r[2]} s=${18}/>`)}</td></tr>`)}</tbody></table><//>`}
${o.pool.length>0&&html`<${Box} h=${t('mappool')}><div class="in"><${MapPool} o=${o}/></div><//>`}
${teams.length>0&&html`<${TeamsAttending} o=${o} teams=${teams}/>`}</div>
<aside>${lv.length>0&&html`<${Box} h=${t('live')+' / '+t('upc')}><div class="mlist">${lv.slice(0,6).map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div><//>`}
${fin.length>0&&html`<${Box} h=${t('res')}><div class="mlist">${fin.slice(0,6).map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div><//>`}
${top.length>0&&html`<${Box} h=${t('top')}>${top.map((r,i)=>html`<a class="tp1" key=${r.p.id} href=${'#/player/'+r.p.id}><span class="mu">${i+1}</span><${Flag} x=${r.p}/><b>${r.p.nick}</b><span class="mu">${pteam(r.p).tag}</span><${Rt} v=${r.rt}/></a>`)}<//>`}
${!lv.length&&!fin.length&&html`<${Box} h=${t('matches')}><${Empty}/><//>`}</aside></div>`};

const ByDate=({list})=>{if(!list.length)return html`<${Empty}/>`;const g=[];list.forEach(m=>{const k=m.d||'—';let x=g.find(y=>y[0]===k);if(!x)g.push(x=[k,[]]);x[1].push(m)});return g.map(([d,l])=>html`<div key=${d}><div class="dh">${d}</div>${l.map(m=>html`<${Row} key=${m.id} m=${m}/>`)}</div>`)};

export const Tour=({id,tab:tab0})=>{
  const o=tour(id),[tab,st]=useState(tab0||'overview');
  if(!o)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const ms=MS.filter(m=>m.tour==o.id),teams=tourTeams(o.id),lb=playerAgg(o.id),nw=NEWS.filter(n=>n.tour===o.id),win=o.s==='fin'&&o.winner!=null?team(o.winner):null,mvp=o.s==='fin'?player(o.mvp):null;
  const go=k=>{st(k);try{history.replaceState(null,'','#/tournament/'+o.id+'/'+k)}catch(e){}};
  const grpOf=new Map(TT.filter(x=>x.tour==o.id).map(x=>[x.team,x]));
  const T=[['overview',t('overview')],['bracket',t('bracket')],['matches',t('matches'),ms.length],['part',t('part'),teams.length],['mappool',t('mappool'),o.pool.length||null],['stats',t('stats')],...(nw.length?[['news',t('news'),nw.length]]:[]),...(o.rules?[['rules',t('rules')]]:[])];
  const body={
    overview:html`<${Overview} o=${o} ms=${ms}/>`,
    bracket:html`<${Box} h=${t('bracket')}><div class="in"><${Bracket} tid=${o.id}/></div><//>`,
    matches:html`<div class="col"><${Box} h=${t('live')+' / '+t('upc')}><${ByDate} list=${ms.filter(m=>m.st!=='fin').sort(byTime)}/><//><${Box} h=${t('res')}><${ByDate} list=${ms.filter(m=>m.st==='fin').sort(byRecent)}/><//></div>`,
    part:html`<${TeamsAttending} o=${o} teams=${teams}/>`,
    mappool:html`<${Box} h=${t('mappool')}><div class="in"><${MapPool} o=${o} full=${1}/></div><//>`,
    stats:html`<${Box} h=${t('stats')}>${lb.length?html`<table class="tbl"><thead><tr><th class="num">#</th><th>${t('players')}</th><th>${t('team')}</th><th class="num">${t('maps')}</th><th class="num">K-D</th><th class="num">ADR</th><th class="num">KAST</th><th class="num">Rating</th></tr></thead><tbody>${lb.map((r,i)=>html`<tr key=${r.p.id}><td class="num mu">${i+1}</td><td><a class="plk" href=${'#/player/'+r.p.id}><${Flag} x=${r.p}/><b>${r.p.nick}</b></a></td><td><${TeamLink} id=${r.p.team} s=${18}/></td><td class="num">${r.n}</td><td class="num">${r.k}-${r.d}</td><td class="num">${f1(r.adr)}</td><td class="num">${r.kast?Math.round(r.kast)+'%':'–'}</td><td class="num"><${Rt} v=${r.rt}/></td></tr>`)}</tbody></table>`:html`<${Empty}/>`}<//>`,
    news:html`<${Box} h=${t('news')}>${nw.map(n=>html`<${NewsRow} key=${n.id} n=${n}/>`)}<//>`,
    rules:html`<${Box} h=${t('rules')}><div class="in"><${Md} text=${o.rules}/></div><//>`};
  return html`<div class="col tpage">
<section class="thd" style=${tourStyle(o)}><${TourLogo} o=${o} s=${96}/><div class="th-i"><div class="th-t"><span class=${'badge '+o.s}>${o.s==='live'?'● ':''}${stLabel(o.s)}</span>${o.tier&&html`<${Chip}>${o.tier}<//>`}${o.organizer&&html`<span class="mu">${o.organizer}</span>`}</div><h1>${o.n}</h1>
<div class="kv"><div><b>${o.pr||'–'}</b><span>${t('prize')}</span></div><div><b>${o.d||'–'}</b><span>${t('dates')}</span></div><div><b>${o.tn||teams.length||'–'}</b><span>${t('teamsN')}</span></div><div><b>${o.loc||'–'}</b><span>${t('loc')}</span></div>${o.fmt&&html`<div><b>${o.fmt}</b><span>${t('fmt')}</span></div>`}</div></div>
</section>
${(win||mvp)&&html`<div class="win">${o.trophy&&html`<img class="cup" src=${o.trophy} alt=""/>`}${win&&html`<a class="wb" href=${'#/team/'+win.id}><small>${t('winner')}</small><span><${TeamLogo} x=${win} s=${44}/><b>${win.name}</b></span></a>`}${mvp&&html`<a class="wb" href=${'#/player/'+mvp.id}><small>${t('mvp')}</small><span><${Flag} x=${mvp}/><b>${mvp.nick}</b></span></a>`}</div>`}
<${Tabs} tabs=${T} cur=${tab} on=${go}/>${body[tab]||body.overview}</div>`};
