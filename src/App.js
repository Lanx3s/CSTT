import {useState,useEffect} from 'react';
import {html} from './lib/html.js';
import {SITE,MS,DEMO,team} from './lib/data.js';
import {useAuth} from './lib/auth.js';
import {lang,setLang,t,NAV,L} from './lib/i18n.js';
import {byTime,byRecent} from './lib/calc.js';
import {TeamLogo} from './components/common.js';
import {SearchBox} from './components/SearchBox.js';
import LOGO from './assets/logo.png';
import {Login,Profile} from './pages/Account.js';
import {Home} from './pages/Home.js';
import {News,NewsPost} from './pages/News.js';
import {Match} from './pages/Match.js';
import {Matches} from './pages/Matches.js';
import {Tours} from './pages/Tours.js';
import {Tour} from './pages/Tour.js';
import {Rank} from './pages/Rank.js';
import {Teams} from './pages/Teams.js';
import {Team} from './pages/Team.js';
import {Players} from './pages/Players.js';
import {Player} from './pages/Player.js';
import {Stats} from './pages/Stats.js';
import {Search} from './pages/Search.js';
import {Forum} from './pages/Forum.js';
import {GrandFinal,Socials} from './components/Extra.js';
import {Admin} from './admin/Admin.js';

const parse=()=>location.hash.replace(/^#\/?/,'').split('/');
const ROUTES={'':Home,news:News,matches:Matches,match:Match,tournaments:Tours,tournament:Tour,rankings:Rank,teams:Teams,team:Team,players:Players,player:Player,stats:Stats,search:Search,forum:Forum,login:Login,profile:Profile};

const Ticker=()=>{
  const live=MS.filter(m=>m.st==='live'),up=MS.filter(m=>m.st==='up').sort(byTime).slice(0,8),fin=MS.filter(m=>m.st==='fin').sort(byRecent).slice(0,6);
  const l=[...live,...up,...fin];if(!l.length)return null;
  return html`<div class="strip"><div class="wrap sw">${l.map(m=>{const A=team(m.a),B=team(m.b),f=m.st==='fin';return html`<a class=${'tk '+m.st} key=${m.id} href=${'#/match/'+m.id}><div class="tkh"><span class=${m.st==='live'?'live':''}>${m.st==='live'?'LIVE':m.st==='fin'?t('finished'):[m.d,m.tm].filter(Boolean).join(' ')}</span><span>BO${m.bo}</span></div><div class=${f&&m.s1>m.s2?'w':''}><${TeamLogo} x=${A} s=${16}/><span class="tn">${A.tag}</span><b>${m.st==='up'?'–':m.s1}</b></div><div class=${f&&m.s2>m.s1?'w':''}><${TeamLogo} x=${B} s=${16}/><span class="tn">${B.tag}</span><b>${m.st==='up'?'–':m.s2}</b></div></a>`})}</div></div>`};

const ToTop=()=>{const [v,sv]=useState(false);useEffect(()=>{const h=()=>sv(scrollY>700);addEventListener('scroll',h,{passive:true});return()=>removeEventListener('scroll',h)},[]);return v?html`<button class="totop" title="Наверх" onClick=${()=>scrollTo({top:0,behavior:'smooth'})}>↑</button>`:null};

export const App=()=>{
  const au=useAuth(),[,f]=useState(0),[r,sr]=useState(parse());
  useEffect(()=>{const h=()=>{sr(parse());scrollTo(0,0)};addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[]);
  useEffect(()=>{document.title=(SITE.nm||'CSTT')+' — Counter-Strike 2'},[]);
  const setL=v=>{setLang(v);f(x=>x+1)};
  if(r[0]==='admin')return html`<${Admin}/>`;
  const P=(r[0]==='news'&&r[1])?NewsPost:ROUTES[r[0]]||Home,hide=(SITE.nav_hide||'').split(',').map(x=>x.trim());
    return html`<div class="app">
${SITE.ann_text&&html`<div class="annbar" style=${SITE.ann_col?{background:SITE.ann_col}:{}}>${SITE.ann_url?html`<a href=${SITE.ann_url}>${SITE.ann_text}</a>`:SITE.ann_text}</div>`}
${DEMO&&html`<div class="annbar demo">${t('demo')}</div>`}
<header class="top"><div class="wrap hin"><a class="logo" href="#/"><img src=${SITE.logo||LOGO} alt=""/><b>${SITE.nm||'CSTT'}</b></a>
<nav class="hnav">${NAV.filter(([k])=>!hide.includes(k)).map(([k,h])=>html`<a key=${k} href=${'#/'+h} class=${r[0]===h||(h==='tournaments'&&r[0]==='tournament')||(h==='matches'&&r[0]==='match')||(h==='teams'&&r[0]==='team')||(h==='players'&&r[0]==='player')?'on':''}>${t(k)}</a>`)}</nav>
<div class="tools"><${SearchBox}/>
<div class="lang"><button class=${lang==='ru'?'on':''} onClick=${()=>setL('ru')}>RU</button><button class=${lang==='en'?'on':''} onClick=${()=>setL('en')}>EN</button></div>
${au.user?html`<a class="usr" href="#/profile">${au.profile&&au.profile.avatar?html`<img src=${au.profile.avatar} alt=""/>`:html`<i>${((au.profile&&au.profile.nick)||'?')[0]}</i>`}<span>${(au.profile&&au.profile.nick)||''}</span></a>`:html`<a class="btn" href="#/login">${t('signin')}</a>`}</div></div></header>
${SITE.s_strip!=='0'&&html`<${Ticker}/>`}
<main class="wrap"><div class="pg" key=${r.join('/')}><${P} id=${r[1]} q=${r[1]} tab=${r[2]}/></div></main>
<footer><div class="wrap"><div class="fl0"><img src=${SITE.logo||LOGO} alt=""/><b>${SITE.nm||'CSTT'}</b></div>${SITE.about&&html`<p class="fa">${SITE.about}</p>`}
<${Socials}/><div class="fl">${SITE.email&&html`<a href=${'mailto:'+SITE.email}>${SITE.email}</a>`}</div>
<div class="mu">${SITE.ft||'© 2026 CSTT · Counter-Strike 2'}</div></div></footer><${ToTop}/></div>`};
