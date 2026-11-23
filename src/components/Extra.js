/* Соцсети, плашка гранд-финала на главной, составы и сравнение игроков в матче */
import {html,F} from '../lib/html.js';
import {useState} from 'react';
import {MS,SITE,TEAMS as _TM,team,tour,pteam,PH,TROPH,TT} from '../lib/data.js';
import {t,lang} from '../lib/i18n.js';
import {byTime,f2,f1} from '../lib/calc.js';
import {Box,TeamLogo,Flag,PlayerPic,Rt,Empty,Hex,Ico} from './common.js';

/* ---------- соцсети CSTT ---------- */
const IC={
  tg:['Telegram','M21.9 4.3 2.7 11.7c-.8.3-.8 1.2 0 1.4l4.8 1.5 1.8 5.6c.2.6 1 .8 1.4.3l2.6-2.5 4.9 3.6c.6.4 1.3.1 1.5-.6L23 5.6c.2-.9-.6-1.6-1.1-1.3zM9 14l9.8-6.2-7.6 7.5-.3 3.2L9 14z'],
  ds:['Discord','M19.3 5.3A17 17 0 0 0 15.1 4l-.5 1a15.6 15.6 0 0 0-5.2 0l-.5-1a17 17 0 0 0-4.200 1.300C2 9.300 1.300 13.100 1.700 16.800a17 17 0 0 0 5.200 2.600l1.100-1.800c-.6-.2-1.200-.5-1.700-.9l.4-.3a12 12 0 0 0 10.200 0l.4.300c-.5.400-1.100.700-1.700.900l1.100 1.800a17 17 0 0 0 5.200-2.600c.5-4.300-.8-8-3.400-11.500zM8.700 14.500c-1 0-1.800-.9-1.800-2s.8-2 1.800-2 1.800.9 1.800 2-.8 2-1.800 2zm6.600 0c-1 0-1.800-.9-1.800-2s.8-2 1.800-2 1.800.9 1.800 2-.8 2-1.800 2z'],
  yt:['YouTube','M22 8.200c-.2-.9-.9-1.600-1.800-1.800C18.600 6 12 6 12 6s-6.600 0-8.200.4C2.900 6.600 2.200 7.300 2 8.200 1.600 9.800 1.600 12 1.600 12s0 2.200.4 3.800c.2.900.9 1.600 1.800 1.800C5.400 18 12 18 12 18s6.600 0 8.200-.4c.9-.2 1.600-.9 1.800-1.800.4-1.600.4-3.800.4-3.800s0-2.200-.4-3.800zM10 15V9l5.200 3L10 15z'],
  tw:['X','M17.800 3h3l-6.600 7.600L22 21h-6.100l-4.800-6.200L5.600 21H2.600l7.100-8.100L2.300 3h6.200l4.300 5.700L17.800 3zm-1.100 16.200h1.700L7.600 4.700H5.800l10.900 14.500z'],
  vk:['VK','M12.800 17.500C6.900 17.500 3.500 13.500 3.400 6.800h3c.1 4.900 2.300 7 4 7.400V6.800h2.800v4.200c1.700-.2 3.500-2.100 4.100-4.300h2.800c-.5 2.600-2.400 4.500-3.800 5.300 1.400.7 3.600 2.300 4.400 5.200h-3.100c-.7-2.100-2.300-3.700-4.500-3.900v3.900h-.3z']};
const list=()=>Object.keys(IC).filter(k=>SITE[k]);
const Ic=({k,s=18})=>html`<svg class="soi" viewBox="0 0 24 24" width=${s} height=${s} fill="currentColor" fillRule="evenodd"><path d=${IC[k][1]}/></svg>`;
/* плашки: mode "row" — компактные иконки (шапка), "pills" — кнопки с подписью, "box" — блок на главной */
export const Socials=({mode='pills'})=>{
  const l=list();if(!l.length)return null;
  if(mode==='row')return html`<div class="hsoc">${l.map(k=>html`<a key=${k} class=${'sp '+k} href=${SITE[k]} target="_blank" rel="noreferrer" title=${IC[k][0]}><${Ic} k=${k} s=${16}/></a>`)}</div>`;
  const pills=html`<div class=${'spills '+mode}>${l.map(k=>html`<a key=${k} class=${'spl '+k} href=${SITE[k]} target="_blank" rel="noreferrer"><${Ic} k=${k} s=${20}/><span>${IC[k][0]}</span></a>`)}</div>`;
  return mode==='box'?html`<${Box} h=${t('socT')}>${pills}<//>`:pills};

/* ---------- плашка гранд-финала ---------- */
export const grandFinal=()=>{
  const c=MS.filter(m=>m.stage==='Grand Final'&&m.st!=='fin'&&m.a!=null&&m.b!=null&&(tour(m.tour)||{}).s!=='fin');
  return c.find(m=>m.st==='live')||c.sort(byTime)[0]||null};
export const GrandFinal=()=>{
  if(SITE.s_gf==='0')return null;
  const m=grandFinal();if(!m)return null;
  const A=team(m.a),B=team(m.b),o=tour(m.tour),live=m.st==='live';
  const side=(T,r)=>html`<div class=${'gf2-t'+(r?' r':'')}><${TeamLogo} x=${T} s=${64}/><b>${T.name}</b></div>`;
  return html`<a class="gf2" href=${'#/match/'+m.id} style=${{'--ca':A.col||'#b3261e','--cb':B.col||'#2a6df4'}}>
<div class="gf2-title">${t('Grand Final').toUpperCase()}</div>${o&&html`<div class="gf2-ev">${o.n}</div>`}
<div class="gf2-row">${side(A)}<div class="gf2-mid">${live?html`<${F}><div class="gf2-sc"><b>${m.s1}</b><i>:</i><b>${m.s2}</b></div><div class="gf2-live">● LIVE</div><//>`:html`<${F}><div class="gf2-tm">${m.tm||'VS'}</div>${m.d&&html`<div class="gf2-dt">${m.d}</div>`}<//>`}<div class="gf2-bo">BO${m.bo}</div></div>${side(B,1)}</div></a>`};

/* ---------- составы и сравнение игроков ---------- */
const rosterOf=id=>{const T=team(id);return T.tbd?[]:[...T.pl].sort((a,b)=>b.rt-a.rt).slice(0,7)};
export const Lineups=({m})=>{
  const A=team(m.a),B=team(m.b),la=rosterOf(m.a),lb=rosterOf(m.b);
  if(!la.length&&!lb.length)return null;
  const col=(T,l,r)=>html`<div class=${'lu-c'+(r?' r':'')}><a class="lu-h" href=${T.tbd?null:'#/team/'+T.id}><${TeamLogo} x=${T} s=${28}/><b>${T.name}</b></a>${l.map(p=>html`<a class="lu-p" key=${p.id} href=${'#/player/'+p.id}><${PlayerPic} p=${p}/><span class="lu-n"><b><${Flag} x=${p}/> ${p.nick}</b><small>${p.role||p.name||''}</small></span><${Rt} v=${p.rt}/></a>`)}${!l.length&&html`<${Empty}/>`}</div>`;
  const n=Math.max(la.length,lb.length),rows=[...Array(n)].map((_,i)=>[la[i],lb[i]]);
  const cmp=(a,b,k,fm)=>{const x=a?a[k]:null,y=b?b[k]:null;return [x==null?'–':fm(x),y==null?'–':fm(y),x!=null&&y!=null&&x>y?'a':x!=null&&y!=null&&x<y?'b':'']};
  const M=[['rt','Rating',f2],['kd','K/D',f2],['adr','ADR',f1],['kast','KAST',v=>v+'%']];
  return html`<${F}><${Box} h=${t('lineups')}><div class="lu">${col(A,la)}${col(B,lb,1)}</div><//>
<${Box} h=${t('plCmp')}><div class="pcmp"><div class="pc-hd"><span>${A.tag}</span>${M.map(r=>html`<em key=${r[0]}>${r[1]}</em>`)}<span class="r">${B.tag}</span></div>
${rows.map(([a,b],i)=>html`<div class="pc-r" key=${i}><span class="pn">${a?html`<a href=${'#/player/'+a.id}>${a.nick}</a>`:'—'}</span><div class="pc-m">${M.map(([k,l,fm])=>{const c=cmp(a,b,k,fm);return html`<div key=${k}><b class=${c[2]==='a'?'best':''}>${c[0]}</b><i>${l}</i><b class=${c[2]==='b'?'best':''}>${c[1]}</b></div>`})}</div><span class="pn r">${b?html`<a href=${'#/player/'+b.id}>${b.nick}</a>`:'—'}</span></div>`)}</div><//><//>`};

/* информация о матче */
export const MatchInfo=({m})=>{
  const R=tour(m.tour),rows=[[t('tournaments'),R&&html`<a href=${'#/tournament/'+R.id}>${R.n}</a>`],[t('stage'),(t(m.stage)||m.stage)+(m.grp?' · '+m.grp:'')+(m.rnd&&['Swiss','GSL','Group stage'].includes(m.stage)?' · '+t('round')+' '+m.rnd:'')],[t('fmtM'),'BO'+m.bo],[t('dates'),[m.d,m.tm].filter(Boolean).join(' · ')],[t('status'),m.st==='live'?'LIVE':m.st==='fin'?t('finished'):t('soonT')]].filter(r=>r[1]);
  return html`<${Box} h=${t('info')}><table class="tbl ib"><tbody>${rows.map(([a,b])=>html`<tr key=${a}><td>${a}</td><td><b>${b}</b></td></tr>`)}</tbody></table><//>`};


/* ---------- карточка игрока как на HLTV: фон за фото (цвет команды / свой цвет / без фона) ---------- */
export const playerBg=p=>{
  const m=p.bgm||SITE.pbg||'team';
  if(m==='none')return null;
  const c=m==='color'&&/^#[0-9a-f]{6}$/i.test(p.bgc||'')?p.bgc:(pteam(p).col||'#3f9b52');
  return /^#[0-9a-f]{3,8}$/i.test(c)?c:'#3f9b52'};
export const PlayerHero=({p,role})=>{
  const c=playerBg(p),T=pteam(p),ru=lang==='ru';
  const goStats=()=>{const e=document.querySelector('.stts');if(e)e.scrollIntoView({behavior:'smooth',block:'center'})};
  const sub=[p.name,p.age>0&&p.age+(ru?' лет':' years')].filter(Boolean).join(' · ');
  return html`<div class=${'hxp'+(c?' bg':'')+(c&&p.bgp==='none'?' np':'')+(c&&p.bgp==='dots'?' dt':'')} style=${c?{'--pc':c}:null}>
<div class="hxp-ic">${p.cc&&html`<span class="hxp-i fl"><${Flag} x=${p}/></span>`}${!T.tbd&&html`<a class="hxp-i lg" href=${'#/team/'+T.id} title=${T.name}><${TeamLogo} x=${T} s=${34}/></a>`}${role}</div>
<${PlayerPic} p=${p} cls="xl"/>
<div class="hxp-nm"><b>${p.nick}</b>${sub&&html`<small>${sub}</small>`}<button class="hxp-st" onClick=${goStats}>${ru?'Статистика игрока':'Player stats'}</button></div></div>`};

/* ---------- плашка «История команд и достижения» (без дат) ---------- */
export const PlayerHistory=({p})=>{
  const ru=lang==='ru';
  let rows=PH.filter(x=>x.player===p.id&&!x.hide);
  if(!rows.length){ /* если админ ничего не настраивал — собираем из текущей команды и поля «Прошлые команды» */
    const cur=p.team!=null?[{id:'c',team:p.team,name:'',cur:true}]:[];
    const old=(p.prev||'').split(/[,;]+/).map(x=>x.trim()).filter(Boolean).map((n,i)=>({id:'o'+i,team:null,name:n,cur:false}));
    rows=[...cur,...old].map(r=>{if(r.team==null&&r.name){const f=team_by_name(r.name);if(f)return {...r,team:f.id}}return r})}
  if(!rows.length)return null;
  const trs=r=>r.team==null?[]:TROPH.filter(y=>y.team===r.team&&(y.pl.length?y.pl.includes(p.id):r.cur));
  return html`<${Box} h=${ru?'История команд и достижения':'Team history & achievements'} cls="phs"><div class="phs-h"><span>${ru?'Команда':'Team'}</span><span>${ru?'Трофеи':'Trophies'}</span></div>
${rows.map(r=>{const T=r.team!=null?team(r.team):null,tr=trs(r),nm=T?T.name:r.name,logo=T?html`<${TeamLogo} x=${T} s=${28}/>`:r.logo?html`<img class="phl" src=${r.logo} alt=""/>`:html`<span class="phl ph">${(nm||'?').slice(0,2).toUpperCase()}</span>`;
  const left=T&&!T.tbd?html`<a class="phs-t" href=${'#/team/'+T.id}>${logo}<b>${nm}</b></a>`:html`<span class="phs-t">${logo}<b>${nm}</b></span>`;
  return html`<div class=${'phs-r'+(r.cur?' cur':'')} key=${r.id}>${left}<div class="phs-tr">${tr.map(y=>{const o=y.tour!=null?tour(y.tour):null,tip=[y.title,y.place,y.year].filter(Boolean).join(' · ');return o?html`<a key=${y.id} href=${'#/tournament/'+o.id} title=${tip}><${Hex} x=${{kind:'champion',img:y.img}} s=${30}/></a>`:html`<span key=${y.id} title=${tip}><${Hex} x=${{kind:'champion',img:y.img}} s=${30}/></span>`})}</div>${T&&!T.tbd&&html`<a class="phs-b" href=${'#/team/'+T.id}>${ru?'Команда':'Team'}</a>`}</div>`})}<//>`};
const team_by_name=n=>_TM.find(x=>(x.name||'').toLowerCase()===n.toLowerCase()||(x.tag||'').toLowerCase()===n.toLowerCase());

/* ---------- список команд турнира (как «Teams attending» на HLTV) ---------- */
export const TeamsAttending=({o,teams})=>{
  const ru=lang==='ru',[lu,sl]=useState(false);
  if(!teams.length)return html`<${Empty}/>`;
  const tt=new Map(TT.filter(x=>x.tour==o.id).map(x=>[x.team,x]));
  return html`<${Box} h=${ru?'Участники':'Teams attending'} right=${html`<button class="tal-b" onClick=${()=>sl(!lu)}>${lu?(ru?'Скрыть составы':'Hide lineups'):(ru?'Показать составы':'Show lineups')}</button>`}><div class="in"><div class="tal">${teams.map(x=>{const g=tt.get(x.id)||{},sub=g.note||x.region||'';
  return html`<a class="tal-c" key=${x.id} href=${'#/team/'+x.id}><span class="tal-r">#${x.rank}</span>${g.seed>0&&html`<span class="tal-s" title=${ru?'Посев':'Seed'}>#${g.seed}</span>`}<b class="tal-n">${x.name}</b>${lu?html`<span class="tal-l">${x.pl.slice(0,7).map(p=>html`<span key=${p.id}><${Flag} x=${p}/>${p.nick}</span>`)}</span>`:html`<span class="tal-g"><${TeamLogo} x=${x} s=${84}/></span>`}<span class="tal-f">${sub}${g.grp?(sub?' · ':'')+t('group')+' '+g.grp:''}</span></a>`})}</div></div><//>`};
