import {html,F} from '../lib/html.js';
import {MS,TR,TEAMS,PL,NEWS,SITE,rk,topP,mainT,team,pteam,tour} from '../lib/data.js';
import {t,L} from '../lib/i18n.js';
import {byTime,byRecent,formOf,f2} from '../lib/calc.js';
import {Box,Rows,TeamLogo,Bm,Empty,NewsRow,NewsMini,NewsThumb,TourLogo,tourStyle,stLabel,artBg,Flag,Rt} from '../components/common.js';
import {GrandFinal,Socials} from '../components/Extra.js';
import {ForumBox} from './Forum.js';

const on=k=>SITE[k]!=='0';

/* главная новость + 3 малых (как на HLTV) */
const Featured=()=>{
  const [a,...rest]=NEWS;if(!a)return null;
  const bg=n=>n.bg||n.img;
  const st=n=>bg(n)?{backgroundImage:`linear-gradient(180deg,rgba(8,12,18,.05) 20%,rgba(8,12,18,.92)),url("${bg(n)}")`}:{backgroundImage:`linear-gradient(180deg,rgba(8,12,18,.05) 20%,rgba(8,12,18,.85)),${artBg(n.c,n.id,n.bgs)}`,backgroundSize:'cover'};
  return html`<div class="fgrid"><a class="fbig" style=${st(a)} href=${'#/news/'+a.id}><span class="ntag" style=${{background:a.c}}>${a.tag}</span><h2>${L(a.ti)}</h2>${L(a.sub)&&html`<p>${L(a.sub)}</p>`}<small>${a.d}${a.author&&' · '+a.author}</small></a>
<div class="fcol">${rest.slice(0,3).map(n=>html`<a class="fsm" key=${n.id} style=${st(n)} href=${'#/news/'+n.id}><span class="ntag" style=${{background:n.c}}>${n.tag}</span><b>${L(n.ti)}</b><small>${n.d}</small></a>`)}</div></div>`};

const EventHero=({o})=>{
  const info=html`<${F}><${TourLogo} o=${o} s=${o.img?48:72}/><div class="eh-i"><span class=${'badge '+o.s}>${o.s==='live'?'● ':''}${stLabel(o.s)}</span><h2>${o.n}</h2><div class="eh-m">${[o.d,o.loc,o.pr&&t('prize')+' '+o.pr].filter(Boolean).map((x,i)=>html`<span key=${i}>${x}</span>`)}</div>${L(o.ds)&&html`<p>${L(o.ds)}</p>`}</div><span class="btn">${t('bracket')} →</span><//>`;
  return o.img?html`<a class="evhero img" href=${'#/tournament/'+o.id}><span class="evb" style=${{backgroundImage:'url("'+o.img+'")'}}></span><span class="evi">${info}</span></a>`:html`<a class="evhero" style=${tourStyle(o)} href=${'#/tournament/'+o.id}>${info}</a>`};

export const Home=()=>{
  const mt=mainT(),lv=MS.filter(m=>m.st==='live'),up=MS.filter(m=>m.st==='up').sort(byTime),fin=MS.filter(m=>m.st==='fin').sort(byRecent);
  if(!TR.length&&!MS.length&&!TEAMS.length)return html`<div class="bx"><${Empty} text=${t('noData')}/></div>`;
  const heroMode=SITE.hero||'news';
  return html`<div class="g3">
<aside class="al">
${on('s_rank')&&html`<${Box} h=${t('rank')} href="#/rankings">${rk.slice(0,10).map(x=>html`<a class="rk1" key=${x.id} href=${'#/team/'+x.id}><span class="mu">${x.rank}</span><${TeamLogo} x=${x} s=${22}/><span class="tn">${x.name}</span><em>${x.pts}</em><i class=${x.ch>0?'up':x.ch<0?'dn':'mu'}>${x.ch>0?'▲'+x.ch:x.ch<0?'▼'+Math.abs(x.ch):'–'}</i></a>`)}<//>`}
${on('s_ann')&&html`<${Box} h=${t('ann')} href="#/tournaments">${TR.filter(o=>o.s!=='fin').slice(0,5).map(o=>html`<a class="ev1" key=${o.id} href=${'#/tournament/'+o.id}><${TourLogo} o=${o} s=${34}/><span><b>${o.n}</b><small>${[o.d,o.pr].filter(Boolean).join(' · ')}</small></span></a>`)}${!TR.some(o=>o.s!=='fin')&&html`<${Empty}/>`}<//>`}
${SITE.ban_img&&html`<a class="adbn" href=${SITE.ban_url||'#'} target=${SITE.ban_url?'_blank':null} rel="noreferrer"><img src=${SITE.ban_img} alt=""/></a>`}
</aside>
<div class="col">
<${GrandFinal}/>
${heroMode==='event'&&mt?html`<${EventHero} o=${mt}/>`:heroMode==='news'&&on('s_feat')?html`<${Featured}/>`:null}
${heroMode==='news'&&mt&&html`<${EventHero} o=${mt}/>`}
${on('s_live')&&lv.length>0&&html`<${Box} h=${t('live')} cls="livebox"><div class="mgrid">${lv.map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div><//>`}
${on('s_news')&&html`<${Box} h=${t('latest')} href="#/news">${NEWS.length?NEWS.slice(heroMode==='news'&&on('s_feat')?4:0,heroMode==='news'&&on('s_feat')?12:8).map(n=>html`<${NewsRow} key=${n.id} n=${n}/>`):html`<${Empty} text=${t('noNews')}/>`}<//>`}
<div class="g2">${on('s_res')&&html`<${Box} h=${t('res')} href="#/matches"><div class="mlist">${fin.slice(0,6).map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div>${!fin.length&&html`<${Empty}/>`}<//>`}
${on('s_up')&&html`<${Box} h=${t('upc')} href="#/matches"><div class="mlist">${up.slice(0,6).map(m=>html`<${Bm} key=${m.id} m=${m}/>`)}</div>${!up.length&&html`<${Empty}/>`}<//>`}</div></div>
<aside class="ar">
${on('s_top')&&PL.length>0&&html`<${Box} h=${t('top')} href="#/players">${topP.slice(0,8).map((p,i)=>html`<a class="tp1" key=${p.id} href=${'#/player/'+p.id}><span class="mu">${i+1}</span><${Flag} x=${p}/><b>${p.nick}</b><span class="mu">${pteam(p).tag}</span><${Rt} v=${p.rt}/></a>`)}<//>`}
${on('s_ev')&&html`<${Box} h=${t('tournaments')} href="#/tournaments">${[...TR].sort((a,b)=>({live:0,up:1,fin:2})[a.s]-({live:0,up:1,fin:2})[b.s]).slice(0,5).map(o=>html`<a class="ev1" key=${o.id} href=${'#/tournament/'+o.id}><${TourLogo} o=${o} s=${34}/><span><b>${o.n}</b><small>${o.d}</small></span><em class=${'badge sm '+o.s}>${stLabel(o.s)}</em></a>`)}<//>`}
${on('s_pop')&&NEWS.length>0&&html`<${Box} h=${t('pop')} href="#/news">${NEWS.slice(0,6).map(n=>html`<${NewsMini} key=${n.id} n=${n}/>`)}<//>`}
<${ForumBox}/>
<${Socials} mode="box"/>
<${Box} h=${t('ci')}><div class="st"><div><b>${TEAMS.length}</b>${t('teams')}</div><div><b>${PL.length}</b>${t('players')}</div><div><b>${MS.length}</b>${t('matches')}</div><div><b>${TR.length}</b>${t('tournaments')}</div></div><//>
</aside></div>`};
