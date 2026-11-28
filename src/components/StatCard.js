/* Статистическая карточка игрока в стиле CSTT: спидометр рейтинга, 6 показателей с полосами, анимация заполнения, сохранение в PNG */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {team,pteam,SITE} from '../lib/data.js';
import {Flag,TeamLogo,PlayerPic} from './common.js';
import {SCALE,LEVELS,LVC,level,frac} from '../lib/pstat.js';

/* Темы карточки. По умолчанию — дизайн CSTT (цвета берутся из переменных сайта). Новые темы добавляются сюда; выбор — SITE.card_theme или проп theme. */
export const CARD_THEMES={
  cstt:{'--sc-accent':'var(--r)','--sc-bg':'var(--p)','--sc-bg2':'var(--p2)','--sc-line':'var(--ln)','--sc-ink':'var(--tx)','--sc-mu':'var(--mu)'}};
export const themeOf=n=>CARD_THEMES[n]||CARD_THEMES[(SITE&&SITE.card_theme)||'cstt']||CARD_THEMES.cstt;

const ORDER=['kd','dpr','kast','hs','adr','kpr'];
const reduce=()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const useCount=(to,d,delay=0,ms=1400)=>{
  const [v,sv]=useState(reduce()?to:0);
  useEffect(()=>{if(to==null)return;if(reduce()){sv(to);return}let raf,t0,to1=setTimeout(()=>{const st=t=>{if(!t0)t0=t;const k=Math.min(1,(t-t0)/ms);sv(to*(1-Math.pow(1-k,3)));if(k<1)raf=requestAnimationFrame(st)};raf=requestAnimationFrame(st)},delay);return()=>{clearTimeout(to1);cancelAnimationFrame(raf)}},[to]);
  return v};
const fmt=(k,v)=>v==null?'—':v.toFixed(SCALE[k].d)+(SCALE[k].u||'');

const Gauge=({v})=>{
  const go=useGo(),f=frac('rt',v),n=useCount(v,2,150,1700),lv=level('rt',v);
  return html`<div class=${'sc-g'+(lv>=0?' l'+lv:'')}><svg viewBox="0 0 200 178" aria-hidden="true"><path class="tr" d="M46.26 153.74 A76 76 0 1 1 153.74 153.74" pathLength="1000"/><path class="vl" d="M46.26 153.74 A76 76 0 1 1 153.74 153.74" pathLength="1000" style=${{strokeDasharray:1000,strokeDashoffset:go?1000*(1-f):1000}}/></svg>
<div class="sc-gc">${lv>=0&&html`<em class=${'lv l'+lv}>${LEVELS[lv]}</em>`}<b>${v==null?'—':n.toFixed(2)}</b><span>RATING</span></div></div>`};
const useGo=()=>{const [g,sg]=useState(reduce());useEffect(()=>{if(g)return;const id=requestAnimationFrame(()=>requestAnimationFrame(()=>sg(true)));return()=>cancelAnimationFrame(id)},[]);return g};

const Tile=({k,v,i})=>{
  const go=useGo(),s=SCALE[k],lv=level(k,v),n=useCount(v,s.d,250+i*110,1200);
  return html`<div class=${'sc-t'+(lv>=0?' l'+lv:'')}><b>${v==null?'—':n.toFixed(s.d)+(s.u||'')}</b><span class="nm">${s.l}</span><div class="bar"><i style=${{width:go?Math.round(frac(k,v)*100)+'%':'0%',transitionDelay:(i*.09)+'s'}}></i>${lv>=0&&html`<u style=${{left:'calc('+(go?frac(k,v)*100:0)+'% - 1px)',transitionDelay:(i*.09)+'s'}}></u>`}</div>${lv>=0?html`<em class=${'lv l'+lv}>${LEVELS[lv]}</em>`:html`<em class="lv">N/A</em>`}</div>`};

export const StatCard=({p,S,theme,id})=>{
  const T=pteam(p),th=themeOf(theme),side=(l,v)=>html`<div class="sc-sd"><span>${l}</span><b>${v}</b></div>`;
  return html`<div class="sc" id=${id} style=${th}>
<div class="sc-hd"><div class="sc-ph"><${PlayerPic} p=${p}/></div><div class="sc-nm"><h2>${p.nick}</h2><div class="sc-tm"><${Flag} x=${p}/>${T&&!T.tbd?html`<${TeamLogo} x=${T} s=${20}/><span>${T.name}</span>`:html`<span>Free agent</span>`}${p.role&&html`<em>${p.role}</em>`}</div></div><div class="sc-br"><b>CSTT</b><span>PLAYER STATS</span></div></div>
<div class="sc-mn">${side('WIN RATE',S.winrate==null?'—':S.winrate+'%')}<${Gauge} v=${S.M.rt}/>${side('MAPS',S.maps||'—')}</div>
<div class="sc-gr">${ORDER.map((k,i)=>html`<${Tile} key=${k} k=${k} v=${S.M[k]} i=${i}/>`)}</div>
<div class="sc-ft">${S.src==='matches'?`${S.matches} matches · ${S.maps} maps · ${S.rounds} rounds`:'Profile averages'}</div></div>`};

/* ---------- сохранение карточки в PNG (рисуется на canvas тем же дизайном) ---------- */
const loadImg=src=>new Promise(r=>{if(!src)return r(null);const i=new Image();i.crossOrigin='anonymous';i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
export const cardPng=async(p,S,theme)=>{
  const cs=getComputedStyle(document.documentElement),c=n=>(cs.getPropertyValue(n)||'').trim(),R=c('--r')||'#d4141c',BG=c('--p')||'#0f1115',BG2=c('--p2')||'#171a20',LN=c('--ln')||'#2a2f38',TX=c('--tx')||'#fff',MU=c('--mu')||'#8b93a1',FF=getComputedStyle(document.body).fontFamily||'Arial,sans-serif';
  const W=1200,H=760,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),T=pteam(p);
  const [ph]=await Promise.all([loadImg(p.photo||p.img)]);
  g.fillStyle=BG;g.fillRect(0,0,W,H);const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,BG2);gr.addColorStop(1,BG);g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle=R;g.fillRect(0,0,8,H);g.strokeStyle=LN;g.lineWidth=2;g.strokeRect(1,1,W-2,H-2);
  const tx=(s,x,y,sz,wt,col,al='left')=>{g.font=wt+' '+sz+'px '+FF;g.fillStyle=col;g.textAlign=al;g.textBaseline='alphabetic';g.fillText(s,x,y)};
  /* шапка */
  g.save();g.beginPath();g.arc(100,100,56,0,Math.PI*2);g.clip();g.fillStyle=BG2;g.fillRect(44,44,112,112);if(ph){const r=Math.max(112/ph.width,112/ph.height);g.drawImage(ph,44+(112-ph.width*r)/2,44+(112-ph.height*r)*.12,ph.width*r,ph.height*r)}if(!ph)tx(String(p.nick||'?').slice(0,2).toUpperCase(),100,112,34,'800',MU,'center');g.restore();
  g.strokeStyle=R;g.lineWidth=3;g.beginPath();g.arc(100,100,57,0,Math.PI*2);g.stroke();
  tx(p.nick,176,98,54,'800',TX);tx([T&&!T.tbd?T.name:'Free agent',p.role].filter(Boolean).join('  ·  '),178,138,24,'500',MU);
  tx('CSTT',W-48,92,44,'800',TX,'right');tx('PLAYER STATS',W-48,124,18,'700',R,'right');
  /* спидометр */
  const cx=W/2,cy=318,rad=128,a0=.75*Math.PI,a1=2.25*Math.PI,f=frac('rt',S.M.rt),lv=level('rt',S.M.rt);
  g.lineCap='round';g.lineWidth=18;g.strokeStyle=LN;g.beginPath();g.arc(cx,cy,rad,a0,a1);g.stroke();
  if(S.M.rt!=null){g.strokeStyle=lv>=0?LVC[lv]:R;g.beginPath();g.arc(cx,cy,rad,a0,a0+(a1-a0)*f);g.stroke()}
  tx(S.M.rt==null?'—':S.M.rt.toFixed(2),cx,cy+26,92,'800',TX,'center');tx('RATING',cx,cy+62,22,'700',MU,'center');if(lv>=0)tx(LEVELS[lv],cx,cy-58,20,'800',LVC[lv],'center');
  const side=(x,l,v)=>{g.fillStyle=BG2;g.fillRect(x,250,230,120);g.fillStyle=R;g.fillRect(x,250,5,120);tx(l,x+28,290,18,'700',MU);tx(String(v),x+28,346,52,'800',TX)};
  side(70,'WIN RATE',S.winrate==null?'—':S.winrate+'%');side(W-300,'MAPS',S.maps||'—');
  /* 6 показателей */
  ORDER.forEach((k,i)=>{const x=70+(i%3)*368,y=440+Math.floor(i/3)*140,w=340,v=S.M[k],s=SCALE[k],l=level(k,v);
    const lc=l>=0?LVC[l]:LN;g.fillStyle=BG2;g.fillRect(x,y,w,118);g.fillStyle=lc;g.fillRect(x,y,5,118);
    tx(v==null?'—':v.toFixed(s.d)+(s.u||''),x+26,y+54,46,'800',TX);tx(s.l,x+26,y+84,18,'700',MU);
    if(l>=0)tx(LEVELS[l],x+w-20,y+84,16,'800',lc,'right');
    g.fillStyle=LN;g.fillRect(x+26,y+98,w-52,6);if(v!=null){g.fillStyle=lc;g.fillRect(x+26,y+98,(w-52)*frac(k,v),6)}});
  tx(S.src==='matches'?S.matches+' matches · '+S.maps+' maps · '+S.rounds+' rounds':'Profile averages',70,H-22,18,'500',MU);tx(new Date().toISOString().slice(0,10),W-48,H-22,18,'500',MU,'right');
  return new Promise(r=>cv.toBlob(b=>r(b),'image/png'))};
