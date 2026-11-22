/* Общие компоненты: логотипы, флаги, плашки, строки матчей, карты, титулы */
import {useState,useEffect} from 'react';
import {html,F} from '../lib/html.js';
import {team,MAPS,when,SITE,tour,FA} from '../lib/data.js';
import {winner,f2,rtc} from '../lib/calc.js';
import {useFav,toggleFav} from '../lib/fav.js';
import {t,L} from '../lib/i18n.js';

/* ---------- фон-картинка по умолчанию: мягкая геометрия цвета турнира / новости ---------- */
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
export const BG_STYLES=[['tri','Треугольники'],['stripes','Полосы'],['grid','Сетка'],['hex','Соты'],['rings','Круги'],['waves','Волны'],['dots','Точки'],['beams','Лучи'],['cross','Кресты'],['mesh','Свечение']];
export const artBg=(col,seed='',style='')=>{
  let h=hash(col+'|'+seed);const r=()=>{h=(h+0x6d2b79f5)>>>0;let z=Math.imul(h^h>>>15,1|h);z=z+Math.imul(z^z>>>7,61|z)^z;return((z^z>>>14)>>>0)/4294967296};
  const c=/^#[0-9a-fA-F]{3,8}$/.test(col||'')?col:'#d4141c',W=1200,H=320,n=v=>v.toFixed(0);
  const st=BG_STYLES.some(x=>x[0]===style)?style:(BG_STYLES.some(x=>x[0]===SITE.bgstyle)?SITE.bgstyle:'tri');
  let p='';
  if(st==='tri'){for(let i=0;i<11;i++){const x=r()*W,y=r()*H,s=70+r()*230;p+=`<polygon points="${n(x)},${n(y)} ${n(x+s)},${n(y+r()*s*.6)} ${n(x+r()*s*.8)},${n(y+s)}" fill="${c}" opacity="${(.05+r()*.13).toFixed(2)}"/>`}for(let i=0;i<3;i++){const x=r()*W;p+=`<line x1="${n(x)}" y1="0" x2="${n(x-180)}" y2="${H}" stroke="${c}" stroke-opacity=".18" stroke-width="2"/>`}}
  else if(st==='stripes'){for(let i=-2;i<20;i++){const x=i*70+r()*8;p+=`<polygon points="${n(x)},0 ${n(x+34)},0 ${n(x-90)},${H} ${n(x-124)},${H}" fill="${c}" opacity="${i%3?'.05':'.12'}"/>`}}
  else if(st==='grid'){for(let x=0;x<=W;x+=48)p+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${c}" stroke-opacity=".10"/>`;for(let y=0;y<=H;y+=48)p+=`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${c}" stroke-opacity=".10"/>`;for(let i=0;i<7;i++)p+=`<rect x="${n(Math.floor(r()*25)*48)}" y="${n(Math.floor(r()*6)*48)}" width="48" height="48" fill="${c}" opacity="${(.06+r()*.1).toFixed(2)}"/>`}
  else if(st==='hex'){const R=34,dx=R*1.732,dy=R*1.5;for(let row=0;row<9;row++)for(let k=0;k<20;k++){const cx=k*dx+(row%2?dx/2:0),cy=row*dy,pts=[0,1,2,3,4,5].map(i=>{const a=Math.PI/3*i+Math.PI/6;return n(cx+R*Math.cos(a))+','+n(cy+R*Math.sin(a))}).join(' ');p+=`<polygon points="${pts}" fill="${r()>.82?c:'none'}" fill-opacity=".12" stroke="${c}" stroke-opacity=".14"/>`}}
  else if(st==='rings'){const cx=W*.78,cy=H*.55;for(let i=1;i<=10;i++)p+=`<circle cx="${n(cx)}" cy="${n(cy)}" r="${i*46}" fill="none" stroke="${c}" stroke-opacity="${(.34-i*.03).toFixed(2)}" stroke-width="${i%3?1.5:3}"/>`;p+=`<circle cx="${n(cx)}" cy="${n(cy)}" r="40" fill="${c}" opacity=".18"/>`}
  else if(st==='waves'){for(let i=0;i<6;i++){const y=60+i*50,a=20+r()*24;p+=`<path d="M0 ${y} C 300 ${n(y-a)}, 600 ${n(y+a)}, ${W} ${n(y-a/2)} L ${W} ${H} L 0 ${H} Z" fill="${c}" opacity=".07"/>`}}
  else if(st==='dots'){for(let x=12;x<W;x+=26)for(let y=12;y<H;y+=26){const k=x/W;p+=`<circle cx="${x}" cy="${y}" r="${(1+k*5.5*(.5+r()*.5)).toFixed(1)}" fill="${c}" opacity="${(.05+k*.2).toFixed(2)}"/>`}}
  else if(st==='beams'){const ox=W*.85,oy=-40;for(let i=0;i<9;i++){const a=r()*W*.9,w=40+r()*120;p+=`<polygon points="${n(ox)},${oy} ${n(a)},${H} ${n(a+w)},${H}" fill="${c}" opacity="${(.04+r()*.1).toFixed(2)}"/>`}}
  else if(st==='cross'){for(let x=30;x<W;x+=60)for(let y=30;y<H;y+=60){const o=(.07+r()*.12).toFixed(2);p+=`<path d="M${x-6} ${y}H${x+6}M${x} ${y-6}V${y+6}" stroke="${c}" stroke-opacity="${o}" stroke-width="2"/>`}}
  else{for(let i=0;i<4;i++)p+=`<circle cx="${n(r()*W)}" cy="${n(r()*H)}" r="${n(120+r()*160)}" fill="url(#m${i})"/>`}
  const defs=st==='mesh'?[0,1,2,3].map(i=>`<radialGradient id="m${i}"><stop offset="0" stop-color="${c}" stop-opacity="${(.3-i*.04).toFixed(2)}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join(''):'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c}" stop-opacity=".5"/><stop offset=".65" stop-color="#0c0e12" stop-opacity="0"/></linearGradient>${defs}</defs><rect width="${W}" height="${H}" fill="#0b0d11"/><rect width="${W}" height="${H}" fill="url(#g)"/>${p}</svg>`;
  return 'url("data:image/svg+xml;utf8,'+encodeURIComponent(svg)+'")'};

/* ---------- флаги ---------- */
const ALIAS={en:'gb-eng',eng:'gb-eng',uk:'gb',sco:'gb-sct',wal:'gb-wls',world:'un',int:'un',intl:'un'};
/* код страны -> код для flagcdn (RU -> ru, EN -> gb-eng, EU -> eu); неизвестное -> null */
export const ccCode=v=>{const s=String(v||'').trim().toLowerCase().replace(/[_\s]+/g,'-');if(!s)return null;const a=s in ALIAS?ALIAS[s]:s;return a&&/^[a-z]{2}(-[a-z]{3})?$/.test(a)?a:null};
export const ccLabel=v=>String(v||'').trim().toUpperCase();
export const flagSrc=(x,w=40)=>{if(!x)return null;if(x.flag)return x.flag;const k=ccCode(x.cc);return k?'https://flagcdn.com/w'+w+'/'+k+'.png':null};
export const Flag=({x,cc,s})=>{
  const e=x||{cc},src=flagSrc(e),lb=ccLabel(e.cc);
  if(!src)return lb?html`<span class="flag txt">${lb}</span>`:null;
  return html`<img class=${'flag'+(s?' '+s:'')} src=${src} alt=${lb} title=${lb} loading="lazy" onError=${ev=>{ev.target.style.display='none'}}/>`};

export const FavBtn=({id,cls=''})=>{const f=useFav(),on=f.includes(+id);return html`<button type="button" class=${'fav '+cls+(on?' on':'')} title=${on?t('unfav'):t('fav')} onClick=${e=>{e.preventDefault();e.stopPropagation();toggleFav(id)}}>${on?'★':'☆'}</button>`};

/* ---------- логотип команды: всегда квадратный блок фиксированного размера ---------- */
export const TeamLogo=({x,s=24,cls=''})=>{
  const T=x||team(null),st={'--s':s+'px'};
  if(T.logo)return html`<img class=${'tlg '+cls} style=${st} src=${T.logo} alt="" loading="lazy"/>`;
  const n=(T.tag||'?').length,fs=Math.max(7,Math.round(s*(n<=2?.42:n===3?.34:.27)));
  return html`<span class=${'tlg bd '+cls} style=${{...st,background:T.col||'#445066',fontSize:fs+'px'}}>${T.tag||'?'}</span>`};

export const TeamLink=({id,s=22,tag,cls='',right})=>{
  const T=team(id),lg=html`<${TeamLogo} x=${T} s=${s}/>`,nm=html`<span class="tn">${tag?T.tag:T.name}</span>`;
  return T.tbd?html`<span class=${'tlk tbd '+cls}>${right?nm:lg}${right?lg:nm}</span>`:html`<a class=${'tlk '+cls} href=${'#/team/'+T.id}>${right?nm:lg}${right?lg:nm}</a>`};

/* ---------- контейнеры ---------- */
export const Box=({h,href,more,right,cls='',children})=>html`<section class=${'bx '+cls}>${(h||right)&&html`<h3><span>${h}</span>${right}${href&&html`<a href=${href}>${more||t('all')}</a>`}</h3>`}${children}</section>`;
export const Empty=({text,icon})=>html`<div class="empty"><i>${icon||'∅'}</i>${text||t('none')}</div>`;
export const Tabs=({tabs,cur,on,cls=''})=>html`<div class=${'tabs '+cls}>${tabs.map(([k,l,n])=>html`<button key=${k} class=${cur===k?'on':''} onClick=${()=>on(k)}>${l}${n!=null&&html`<em>${n}</em>`}</button>`)}</div>`;
export const Rt=({v,d=2})=>html`<b class=${rtc(v)}>${(+v||0).toFixed(d)}</b>`;
export const Stat=({v,l,cls=''})=>html`<div class=${'stt '+cls}><b>${v}</b><span>${l}</span></div>`;
export const Chip=({children,col,cls=''})=>html`<span class=${'chip '+cls} style=${col?{'--c':col}:{}}>${children}</span>`;
export const Status=({m})=>m.st==='live'?html`<span class="live">LIVE</span>`:m.st==='fin'?html`<span class="mu">${t('finished')}</span>`:html`<span class="mu">${m.tm||t('soonT')}</span>`;

/* ---------- иконки (SVG, одним цветом) ---------- */
const IC={
  trophy:'M6 3h12v4a6 6 0 0 1-5 5.9V16h3v2h-8v-2h3v-3.1A6 6 0 0 1 6 7V3zM3 4h2v3a3 3 0 0 1-2-2.8V4zm16 0h2v.2A3 3 0 0 1 19 7V4zM7 20h10v2H7z',
  star:'M12 2l3 6.6 7 .8-5.2 4.8 1.5 7.1L12 17.8 5.7 21.3l1.5-7.1L2 9.4l7-.8z',
  medal:'M7 2h4l1 5-3 1zM17 2h-4l-1 5 3 1zM12 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 3l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 17.400l-2.400 1.200.5-2.600-1.900-1.800 2.600-.4z',
  flame:'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 0-3-1-5 1-9.500z',
  bolt:'M13 2L4 14h6l-1 8 9-12h-6z',
  crown:'M3 8l4 4 5-7 5 7 4-4-2 11H5z',
  shield:'M12 2l8 3v6c0 5-3.500 9-8 11-4.500-2-8-6-8-11V5z',
  target:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  chart:'M3 20h18v2H3zm2-8h3v7H5zm5-5h3v12h-3zm5 3h3v9h-3z',
  skull:'M12 2a8 8 0 0 0-8 8c0 3 1.500 5 3 6v3h2v-2h2v2h2v-2h2v2h2v-3c1.500-1 3-3 3-6a8 8 0 0 0-8-8zM9 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  heart:'M12 21l-8.500-8.500a5 5 0 0 1 7-7L12 6.500l1.500-1a5 5 0 0 1 7 7z'};
export const ICONS=Object.keys(IC);
export const Ico=({n,s=18})=>IC[n]?html`<svg class="ico" viewBox="0 0 24 24" width=${s} height=${s} fill="currentColor" fillRule="evenodd"><path d=${IC[n]}/></svg>`:null;

/* ---------- титулы: «награды» с шестигранной эмблемой ---------- */
export const KINDS={champion:['Чемпион','trophy','#e8b93c'],mvp:['MVP','star','#b784f5'],finalist:['Финалист','medal','#b4bfcd'],bronze:['Бронза','medal','#cd8a55'],top20:['Top 20','chart','#4ca3ff'],evp:['EVP','flame','#ff7a3d'],captain:['Капитан','shield','#3fc9a2'],major:['Major','crown','#ff4d5a'],custom:['Титул','bolt','#8fa3bd']};
const kindOf=x=>{const k=KINDS[x.kind]||KINDS.custom;return {k,col:x.col||k[2],ic:x.icon&&IC[x.icon]?x.icon:k[1]}};
export const Hex=({x,s=46})=>{const {col,ic}=kindOf(x);return html`<span class="hex" style=${{'--c':col,'--s':s+'px'}}>${x.img?html`<img src=${x.img} alt=""/>`:html`<${Ico} n=${ic} s=${Math.round(s*.46)}/>`}</span>`};
export const Plate=({x})=>{
  const {k,col}=kindOf(x),tr=x.tour!=null?tour(x.tour):null;
  const inner=html`<${F}><${Hex} x=${x}/><span class="aw-t"><small class="aw-k">${k[0]}</small><b>${x.title||k[0]}</b><small>${[x.sub,tr&&tr.n].filter(Boolean).join(' · ')}</small></span>${x.year&&html`<span class="aw-y">${x.year}</span>`}<//>`;
  return tr?html`<a class="aw" style=${{'--c':col}} href=${'#/tournament/'+tr.id}>${inner}</a>`:html`<div class="aw" style=${{'--c':col}}>${inner}</div>`};
/* компактная лента достижений (как внизу профиля HLTV) */
export const AchStrip=({items,trophies})=>{
  const tr=(trophies||[]).map(y=>({k:'t'+y.id,img:y.img,title:y.title||'',sub:[y.place,y.year].filter(Boolean).join(' · '),kind:'champion',tour:y.tour}));
  const ti=(items||[]).map(y=>({k:'i'+y.id,...y}));
  const all=[...ti,...tr];if(!all.length)return null;
  return html`<div class="ach">${all.map(y=>{const {k,col}=kindOf(y),T=y.tour!=null?tour(y.tour):null,tip=[y.title||k[0],y.sub,T&&T.n].filter(Boolean).join(' — ');
    return T?html`<a key=${y.k} class="ach1" title=${tip} href=${'#/tournament/'+T.id}><${Hex} x=${y} s=${40}/><small>${(y.title||k[0])}</small></a>`:html`<div key=${y.k} class="ach1" title=${tip}><${Hex} x=${y} s=${40}/><small>${(y.title||k[0])}</small></div>`})}</div>`};

/* ---------- карты ---------- */
const MAPCOL={ancient:'#4f7d45',anubis:'#c49a3a',dust2:'#c8a15e',dust:'#c8a15e',inferno:'#bf5b34',mirage:'#d1a864',nuke:'#4e91c4',overpass:'#4f8f6a',train:'#7c8493',vertigo:'#4aa6d1',cache:'#8f9a4a',cobblestone:'#8a6a4d'};
const norm=s=>(s||'').toLowerCase().replace(/^de[_ ]/,'').replace(/[^a-z0-9]/g,'');
export const mapInfo=n=>{const k=norm(n),x=MAPS.find(m=>norm(m.name)===k);return {name:n,img:x&&x.img,col:(x&&x.col)||MAPCOL[k]||'#5b6b82',k}};
export const mapBg=(n,dim=.45)=>{const i=mapInfo(n);return i.img?{backgroundImage:`linear-gradient(rgba(8,12,18,${dim}),rgba(8,12,18,${Math.min(.9,dim+.35)})),url("${i.img}")`}:{backgroundImage:`linear-gradient(135deg,${i.col} 0%,#0c1117 115%)`}};

/* плитка карты (мап-пул, список карт) */
export const MapTile=({name,sub,dim,children,cls=''})=>html`<div class=${'mtile '+cls+(dim?' dim':'')} style=${mapBg(name,.25)}><span class="mt-n">${name}</span>${sub&&html`<small>${sub}</small>`}${children}</div>`;

/* ---------- строка матча (HLTV) ---------- */
export const Row=({m,ev})=>{
  const f=m.st==='fin',w=winner(m),R=ev&&tour(m.tour);
  return html`<a class=${'mrow '+m.st} href=${'#/match/'+m.id}>
<span class="mtime">${m.st==='live'?html`<span class="live">LIVE</span>`:m.st==='fin'?html`<span class="mu">${m.d}</span>`:html`<span>${m.tm||m.d||'—'}</span>`}${m.st==='up'&&m.tm&&m.d&&html`<small>${m.d}</small>`}</span>
<span class=${'mt1'+(f&&w===m.a?' w':f&&w!=null?' l':'')}><span class="tn">${team(m.a).name}</span><${TeamLogo} x=${team(m.a)} s=${20}/></span>
<span class="msc">${m.st==='up'?html`<i>vs</i>`:html`<${F}><b class=${f&&w===m.a?'w':''}>${m.s1}</b><i>:</i><b class=${f&&w===m.b?'w':''}>${m.s2}</b><//>`}</span>
<span class=${'mt2'+(f&&w===m.b?' w':f&&w!=null?' l':'')}><${TeamLogo} x=${team(m.b)} s=${20}/><span class="tn">${team(m.b).name}</span></span>
<span class="mbo">${R?html`<small>${R.n}</small>`:null}<em>BO${m.bo}</em></span></a>`};
export const Rows=({l,ev,empty})=>l.length?l.map(m=>html`<${Row} key=${m.id} m=${m} ev=${ev}/>`):html`<${Empty} text=${empty}/>`;

/* ---------- блок матча для сеток ---------- */
export const Bm=({m,tag})=>{
  const f=m.st==='fin',w=winner(m),sl=(id,sc,win)=>{const T=team(id);return html`<div class=${'bt'+(f&&win?' w':f&&w!=null?' l':'')}><${TeamLogo} x=${T} s=${18}/><span class="tn">${tag?T.tag:T.name}</span><b>${m.st==='up'?'':sc}</b></div>`};
  return html`<a class=${'bm '+m.st} href=${'#/match/'+m.id}>${sl(m.a,m.s1,w===m.a&&m.a!=null)}${sl(m.b,m.s2,w===m.b&&m.b!=null)}<small>${m.st==='live'?html`<span class="live">LIVE</span>`:[m.d,m.tm].filter(Boolean).join(' ')||'BO'+m.bo}<em>BO${m.bo}</em></small></a>`};

/* ---------- таймер до матча ---------- */
export const Countdown=({m})=>{
  const [n,sn]=useState(Date.now());
  useEffect(()=>{const i=setInterval(()=>sn(Date.now()),1000);return()=>clearInterval(i)},[]);
  const d=when(m);if(!d)return html`<span class="mu">${m.tm||''}</span>`;
  let s=Math.floor((d-n)/1000);if(s<=0)return html`<span class="mu">${t('startSoon')}</span>`;
  const dd=Math.floor(s/86400),hh=Math.floor(s%86400/3600),mm=Math.floor(s%3600/60),ss=s%60,p=v=>String(v).padStart(2,'0');
  return html`<span class="cd">${dd>0?html`<${F}><b>${dd}</b><i>${t('d')}</i><//>`:null}<b>${p(hh)}</b><i>${t('h')}</i><b>${p(mm)}</b><i>${t('m')}</i>${dd===0&&html`<${F}><b>${p(ss)}</b><i>${t('s')}</i><//>`}</span>`};

/* ---------- новости ---------- */
export const NewsThumb=({n,cls=''})=>n.img?html`<img class=${'nth '+cls} src=${n.img} alt="" loading="lazy"/>`:html`<span class=${'nth ph '+cls} style=${{backgroundImage:artBg(n.c,n.id,n.bgs),backgroundSize:'cover'}}>${n.tag}</span>`;
export const NewsRow=({n})=>html`<a class="nrow" href=${'#/news/'+n.id}><${NewsThumb} n=${n}/><span class="nbody"><b>${L(n.ti)}</b>${L(n.sub)&&html`<span class="nsub">${L(n.sub)}</span>`}<small><span class="ntag" style=${{background:n.c}}>${n.tag}</span>${n.pin>0&&html`<span class="pin">${t('pinned')}</span>`}${n.d}${n.author&&' · '+n.author}</small></span></a>`;
export const NewsMini=({n})=>html`<a class="nmini" href=${'#/news/'+n.id}><span class="ntag" style=${{background:n.c}}>${n.tag}</span><span>${L(n.ti)}</span><small>${n.d}</small></a>`;

/* ---------- игроки ---------- */
export const PlayerPic=({p,cls=''})=>p.photo?html`<img class=${'ppic '+cls} src=${p.photo} alt="" loading="lazy"/>`:html`<span class=${'ppic ph '+cls}>${(p.nick||'?').slice(0,2).toUpperCase()}</span>`;
export const PlayerCard=({p,nr})=>html`<a class="pcard" href=${'#/player/'+p.id}><${PlayerPic} p=${p}/><span class="pc-i"><b><${Flag} x=${p}/> ${p.nick}</b><small>${p.name||p.role||''}</small></span><${Rt} v=${p.rt}/></a>`;

/* таблица игроков */
export const PT=({list,team:hide,rank})=>html`<table class="tbl"><thead><tr>${rank&&html`<th class="num">#</th>`}<th>${t('players')}</th>${!hide&&html`<th>${t('team')}</th>`}<th class="num">${t('maps')}</th><th class="num">K/D</th><th class="num">ADR</th><th class="num">KAST</th><th class="num">HS%</th><th class="num">Rating</th></tr></thead><tbody>${list.map((p,i)=>html`<tr key=${p.id}>${rank&&html`<td class="num mu">${i+1}</td>`}<td><a class="plk" href=${'#/player/'+p.id}><${Flag} x=${p}/><b>${p.nick}</b></a></td>${!hide&&html`<td>${p.team==null?html`<span class="mu">${FA.name}</span>`:html`<${TeamLink} id=${p.team} s=${18}/>`}</td>`}<td class="num">${p.maps}</td><td class="num">${f2(p.kd)}</td><td class="num">${(+p.adr).toFixed(1)}</td><td class="num">${p.kast}%</td><td class="num">${p.hs}%</td><td class="num"><${Rt} v=${p.rt}/></td></tr>`)}</tbody></table>`;

/* ---------- баннер турнира (используется на главной и в списках) ---------- */
export const tourStyle=o=>({'--c':o.col||'var(--r)',...(!o.img?{backgroundImage:artBg(o.col,o.id,o.bgs),backgroundSize:'cover'}:{backgroundImage:`linear-gradient(90deg,rgba(8,9,11,.88),rgba(8,9,11,.2) 70%),url("${o.img}")`})});
export const TourLogo=({o,s=44})=>o.logo?html`<img class="tlg" style=${{'--s':s+'px'}} src=${o.logo} alt=""/>`:html`<span class="tlg bd" style=${{'--s':s+'px',background:o.col||'var(--r)',fontSize:Math.round(s*.34)+'px'}}>${(o.n||'?').split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase()}</span>`;
export const stLabel=s=>({up:t('soonT'),live:t('goingT'),fin:t('finished')})[s]||s;
