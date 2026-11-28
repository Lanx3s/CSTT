/* Соцсети, плашка гранд-финала на главной, составы и сравнение игроков в матче */
import {html,F} from '../lib/html.js';
import {useState} from 'react';
import {MS,SITE,team,tour,pteam,PH,TROPH,TT} from '../lib/data.js';
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
const RBX={IGL:'crown',AWPer:'target',AWP:'target',Entry:'bolt',Support:'shield',Lurker:'skull'};
const STAT_ROWS=[['rt','Rating',f2,1],['kpr',lang==='ru'?'Убийств за раунд':'Kills per round',f2,1],['dpr',lang==='ru'?'Смертей за раунд':'Deaths per round',f2,-1],['kast','KAST',v=>f1(v)+'%',1],['imp',lang==='ru'?'Импакт':'Impact',f2,1],['kd','K/D',f2,1],['adr',lang==='ru'?'Средний урон за раунд':'Average damage per round',f1,1],['hs','HS%',v=>Math.round(v)+'%',1]];
const LuTeam=({T,sel,on})=>{
  const l=rosterOf(T.id),ru=lang==='ru';
  return html`<div class="lu2-t"><div class="lu2-h">${T.tbd?html`<span class="lu2-n"><${TeamLogo} x=${T} s=${24}/><b>${T.name}</b></span>`:html`<a class="lu2-n" href=${'#/team/'+T.id}><${TeamLogo} x=${T} s=${24}/><b>${T.name}</b></a>`}${!T.tbd&&html`<span class="lu2-rk">CSTT: #${T.rank}</span>`}</div>
<div class="lu2-pl">${l.slice(0,5).map(p=>html`<button type="button" key=${p.id} class=${'lu2-p'+(sel===p.id?' on':'')} onClick=${()=>on(p.id)}><span class="lu2-ph"><${PlayerPic} p=${p}/>${RBX[p.role]&&html`<i title=${p.role}><${Ico} n=${RBX[p.role]} s=${12}/></i>`}</span><span class="lu2-nk"><${Flag} x=${p}/>${p.nick}</span></button>`)}${!l.length&&html`<div class="lu2-e mu">${ru?'Состав не указан':'No lineup'}</div>`}</div></div>`};
export const Lineups=({m})=>{
  const A=team(m.a),B=team(m.b),la=rosterOf(m.a),lb=rosterOf(m.b),ru=lang==='ru';
  const [sa,ssa]=useState(null),[sb2,ssb]=useState(null);
  if(!la.length&&!lb.length)return null;
  const pa=la.find(x=>x.id===sa)||la[0],pb=lb.find(x=>x.id===sb2)||lb[0];
  const rows=STAT_ROWS.filter(([k])=>(pa&&pa[k])||(pb&&pb[k]));
  const big=(p,r)=>p?html`<div class=${'lu2-b'+(r?' r':'')}><a href=${'#/player/'+p.id} class="lu2-bp"><${PlayerPic} p=${p}/></a><a class="lu2-btn" href=${'#/player/'+p.id}>${ru?'Профиль игрока':'Player profile'}</a></div>`:html`<div class="lu2-b"></div>`;
  const val=(p,k,fm)=>p&&p[k]?fm(p[k]):'–';
  const best=(k,dir)=>{const x=pa?pa[k]:0,y=pb?pb[k]:0;return !x||!y||x===y?'':((x-y)*dir>0?'a':'b')};
  return html`<${Box} h=${t('lineups')}><div class="lu2"><${LuTeam} T=${A} sel=${pa&&pa.id} on=${ssa}/>
<div class="lu2-hl">${big(pa)}<div class="lu2-st"><h4>${ru?'Сравнение игроков':'Highlighted stats'}</h4><small>${ru?'за всё время на сайте':'all-time on site'}</small>
${rows.map(([k,l,fm,dir])=>{const c=best(k,dir);return html`<div class="lu2-r" key=${k}><b class=${c==='a'?'best':''}>${val(pa,k,fm)}</b><span>${l}</span><b class=${c==='b'?'best':''}>${val(pb,k,fm)}</b></div>`})}
<div class="lu2-who"><a href=${pa?'#/player/'+pa.id:null}>${pa?pa.nick:''}</a><span>vs</span><a href=${pb?'#/player/'+pb.id:null}>${pb?pb.nick:''}</a></div></div>${big(pb,1)}</div>
<${LuTeam} T=${B} sel=${pb&&pb.id} on=${ssb}/></div><//>`};

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
export const PBASE={'':['#262a33','#12151a'],graphite:['#262a33','#12151a'],slate:['#43404f','#28394c'],navy:['#24324a','#101a2c'],wine:['#3d2631','#1a1017'],forest:['#223a30','#0f1a16'],violet:['#382f52','#171226'],black:['#1b1d22','#08090b']};
export const PlayerHero=({p,role})=>{
  const c=playerBg(p),T=pteam(p),ru=lang==='ru';
  const sub=[p.name,p.age>0&&p.age+(ru?' лет':' years')].filter(Boolean).join(' · ');
  return html`<div class=${'hxp'+(c?' bg':'')+(c&&p.bgp==='none'?' np':'')+(c&&p.bgp==='dots'?' dt':'')} style=${c?{'--pc':c,'--b1':(PBASE[p.bgb]||PBASE['']) [0],'--b2':(PBASE[p.bgb]||PBASE[''])[1]}:null}>
<div class="hxp-ic">${p.cc&&html`<span class="hxp-i fl"><${Flag} x=${p}/></span>`}${!T.tbd&&html`<a class="hxp-i lg" href=${'#/team/'+T.id} title=${T.name}><${TeamLogo} x=${T} s=${34}/></a>`}${role}</div>
<${PlayerPic} p=${p} cls="xl"/>
<a class="hxp-stat" href=${'#/pcard/'+p.id} title=${ru?'Статистика игрока':'Player stats'}><i></i>${ru?'Статистика':'Stats'}</a>
<div class="hxp-nm"><b>${p.nick}</b>${sub&&html`<small>${sub}</small>`}</div></div>`};

/* ---------- плашка «История команд и достижения» (без дат) ---------- */
export const PlayerHistory=({p})=>{
  const ru=lang==='ru';
  let rows=PH.filter(x=>x.player===p.id&&x.team!=null&&!x.hide).map(x=>({id:x.id,team:x.team,dates:x.dates,tro:x.tro||[],cur:x.team===p.team}));
  if(p.team!=null&&!rows.some(r=>r.team===p.team))rows=[{id:'cur',team:p.team,dates:'',cur:true},...rows];
  if(!rows.length)return null;
  const trs=r=>r.tro&&r.tro.length?TROPH.filter(y=>r.tro.includes(y.id)):TROPH.filter(y=>y.team===r.team&&(y.pl.length?y.pl.includes(p.id):r.cur));
  return html`<${Box} h=${ru?'История команд':'Team history'} cls="phs"><div class="phs-h"><span>${ru?'Команда':'Team'}</span><span>${ru?'Период':'Period'}</span><span>${ru?'Трофеи':'Trophies'}</span><span></span></div>
${rows.map(r=>{const T=team(r.team),tr=trs(r);
  return html`<div class=${'phs-r'+(r.cur?' cur':'')} key=${r.id}><a class="phs-t" href=${'#/team/'+T.id}><${TeamLogo} x=${T} s=${28}/><b>${T.name}</b></a><span class="phs-d">${r.dates||'—'}</span><div class="phs-tr">${tr.map(y=>{const o=y.tour!=null?tour(y.tour):null,tip=[y.title,y.place,y.year].filter(Boolean).join(' · ');return o?html`<a key=${y.id} href=${'#/tournament/'+o.id} title=${tip}><${Hex} x=${{kind:'champion',img:y.img}} s=${30}/></a>`:html`<span key=${y.id} title=${tip}><${Hex} x=${{kind:'champion',img:y.img}} s=${30}/></span>`})}</div><a class="phs-b" href=${'#/team/'+T.id}>${ru?'Команда':'Team'}</a></div>`})}<//>`};

/* ---------- список команд турнира (как «Teams attending» на HLTV) ---------- */
export const TeamsAttending=({o,teams})=>{
  const ru=lang==='ru',[lu,sl]=useState(false),tbd=Math.max(0,Math.min(64,(o.tn||0)-teams.length));
  if(!teams.length&&!tbd)return html`<${Empty}/>`;
  const tt=new Map(TT.filter(x=>x.tour==o.id).map(x=>[x.team,x]));
  return html`<${Box} h=${ru?'Участники':'Teams attending'} right=${teams.length>0&&html`<button class="tal-b" onClick=${()=>sl(!lu)}>${lu?(ru?'Скрыть составы':'Hide lineups'):(ru?'Показать составы':'Show lineups')}</button>`}><div class="in"><div class="tal">${teams.map(x=>{const g=tt.get(x.id)||{},sub=[g.note||x.region,g.grp?t('group')+' '+g.grp:''].filter(Boolean).join(' · ');
  return html`<a class="tal-c" key=${x.id} href=${'#/team/'+x.id}><span class="tal-top"><em class="tal-r">#${x.rank}</em>${g.seed>0&&html`<em class="tal-s" title=${ru?'Посев':'Seed'}>#${g.seed}</em>`}</span><b class="tal-n">${x.name}</b>${lu?html`<span class="tal-l">${x.pl.slice(0,7).map(p=>html`<span key=${p.id}><${Flag} x=${p}/>${p.nick}</span>`)}${!x.pl.length&&html`<span class="mu">—</span>`}</span>`:html`<span class="tal-g"><${TeamLogo} x=${x} s=${76}/></span>`}<span class="tal-f">${sub||'\u00a0'}</span></a>`})}
${[...Array(tbd)].map((_,i)=>html`<div class="tal-c tbd" key=${'t'+i}><span class="tal-top"><em class="tal-r">TBD</em></span><b class="tal-n">TBD</b><span class="tal-g"><span class="tal-q">?</span></span><span class="tal-f">${ru?'Ожидается':'To be determined'}</span></div>`)}</div></div><//>`};
