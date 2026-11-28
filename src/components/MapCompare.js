/* Блок «Статистика карт» на странице матча: радар + таблица, переключатель WINS / PICK / BAN без перезагрузки, плавная анимация */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {team} from '../lib/data.js';
import {lang} from '../lib/i18n.js';
import {compareMaps,mapKey} from '../lib/mapcmp.js';
import {Box,Empty,TeamLogo} from './common.js';


/* Заглушки вместо картинок карт: основной цвет карты + второй цвет для еле заметного узора (подобраны по атмосфере карты) */
const ART={dust2:['#b8925a','#e6c88f','diag'],mirage:['#b8693d','#f0c27e','dots'],inferno:['#9c3f2a','#f08a3c','zig'],nuke:['#44667c','#d3d84a','grid'],ancient:['#3b6a49','#9bd17b','rings'],anubis:['#b8962f','#2f8a90','zig'],cache:['#66763a','#b4c46e','dots'],train:['#565c66','#c25a47','diag'],overpass:['#4a7a68','#a7c4b4','grid'],vertigo:['#3f7fc0','#e3edf8','rings']};
const shade=(h,k)=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*k).toString(16).padStart(2,'0')).join('');
const FALL=n=>{let x=0;for(const c of String(n))x=(x*31+c.charCodeAt(0))%360;return 'hsl('+x+' 38% 42%)'};
export const mapArt=name=>{
  const k=mapKey(name),a=ART[k];
  if(!a)return {background:'linear-gradient(135deg,'+FALL(name)+',#222)'};
  const [b,c,t]=a,S=c+'30',pat={diag:'repeating-linear-gradient(135deg,'+S+' 0 2px,transparent 2px 11px)',dots:'radial-gradient('+S+' 1.6px,transparent 2.2px) 0 0/13px 13px',zig:'repeating-linear-gradient(60deg,'+S+' 0 2px,transparent 2px 12px),repeating-linear-gradient(-60deg,'+S+' 0 2px,transparent 2px 12px)',grid:'linear-gradient('+S+' 1px,transparent 1px) 0 0/14px 14px,linear-gradient(90deg,'+S+' 1px,transparent 1px) 0 0/14px 14px',rings:'repeating-radial-gradient(circle at 0 100%,'+S+' 0 1.5px,transparent 1.5px 12px)'}[t];
  return {background:pat+',linear-gradient(135deg,'+b+','+shade(b,.62)+')',borderColor:c+'66'}};

const MODES=[['win','WINS','Win %','maps'],['pick','PICK','Pick %','picks'],['ban','BAN','Ban %','bans']];
const FIELD={win:'played',pick:'picks',ban:'bans'};

/* плавный переход чисел (радар, проценты, полоски); при первом показе растёт от нуля */
const useTween=(target,ms=650)=>{
  const [v,sv]=useState(()=>target.map(()=>0)),ref=useRef(target.map(()=>0)),key=target.join(',');
  useEffect(()=>{
    const from=ref.current.slice(),to=target,reduce=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){ref.current=to;sv(to);return}
    let raf,t0;const step=t=>{if(!t0)t0=t;const k=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-k,3),cur=to.map((x,i)=>(from[i]||0)+(x-(from[i]||0))*e);ref.current=cur;sv(cur);if(k<1)raf=requestAnimationFrame(step)};
    raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf)},[key]);
  return v};

const Radar=({names,a,b,ca,cb})=>{
  const n=names.length,R=104,C=150,pt=(i,r)=>{const an=-Math.PI/2+i*2*Math.PI/n;return [C+Math.cos(an)*r,C+Math.sin(an)*r]};
  const poly=vals=>vals.map((v,i)=>pt(i,R*Math.max(0,Math.min(100,v))/100).map(x=>x.toFixed(1)).join(',')).join(' ');
  return html`<svg class="mc2-rd" viewBox="-26 0 352 300" role="img" aria-label="Radar">
${[25,50,75,100].map(p=>html`<polygon key=${p} class="rg" points=${names.map((_,i)=>pt(i,R*p/100).map(x=>x.toFixed(1)).join(',')).join(' ')}/>`)}
${names.map((_,i)=>html`<line key=${i} class="ax" x1=${C} y1=${C} x2=${pt(i,R)[0]} y2=${pt(i,R)[1]}/>`)}
<polygon class="pa" points=${poly(a)} style=${{'--c':ca}}/><polygon class="pb" points=${poly(b)} style=${{'--c':cb}}/>
${names.map((nm,i)=>{const [x,y]=pt(i,R+17),an=-Math.PI/2+i*2*Math.PI/n,c=Math.cos(an);return html`<text key=${i} x=${x} y=${y} text-anchor=${Math.abs(c)<.25?'middle':c>0?'start':'end'} dominant-baseline="middle">${nm}</text>`})}</svg>`};

export const MapCompare=({m})=>{
  const [mode,sm]=useState('win'),ru=lang==='ru';
  if(m.a==null||m.b==null)return null;
  const D=compareMaps(m),rows=D.rows,A=team(m.a),B=team(m.b);
  const cur=MODES.find(x=>x[0]===mode),f=cur[0],cnt=FIELD[f];
  const va=rows.map(r=>r.a[f]),vb=rows.map(r=>r.b[f]);
  const tw=useTween([...va,...vb].map(v=>v==null?0:v)),ta=tw.slice(0,rows.length),tb=tw.slice(rows.length);
  const ca='var(--r)',cb='#c9d1dc';
  const unit=x=>f==='win'?x+(ru?' карт':' maps'):f==='pick'?x+(ru?' пиков':' picks'):x+(ru?' банов':' bans');
  const note=f==='win'?(ru?'Процент побед на карте среди сыгранных на сайте':'Win rate over maps played on this site'):f==='pick'?(ru?'Как часто команда выбирает карту (из матчей с данными о вето)':'How often the team picks the map (matches with veto data)'):(ru?'Как часто команда банит карту (из матчей с данными о вето)':'How often the team bans the map (matches with veto data)');
  return html`<${Box} h=${ru?'Статистика карт':'Map stats'} cls="mc2b" right=${html`<span class="hint">${ru?'По матчам сайта · без этого матча':'Site matches · excl. this one'}</span>`}>
${rows.length===0?html`<${Empty} text=${ru?'Карты для сравнения не выбраны в админке':'No maps enabled for comparison'} icon="🗺"/>`:html`<div class="mc2">
<div class="mc2-l"><div class="mc2-tabs" role="tablist">${MODES.map(([k,l,l2])=>html`<button key=${k} role="tab" aria-selected=${mode===k} class=${mode===k?'on':''} onClick=${()=>sm(k)}>${l2}</button>`)}</div>
${rows.length>=3?html`<${Radar} names=${rows.map(r=>r.name)} a=${ta} b=${tb} ca=${ca} cb=${cb}/>`:null}
<div class="mc2-lg"><span><i style=${{background:ca}}></i>${A.name}</span><span><i style=${{background:cb}}></i>${B.name}</span></div><small class="mc2-nt">${note}</small></div>
<div class="mc2-r"><div class="mc2-h"><span><${TeamLogo} x=${A} s=${26}/><b>${A.name}</b></span><span></span><span><b>${B.name}</b><${TeamLogo} x=${B} s=${26}/></span></div>
${rows.map((r,i)=>{const x=r.a[f],y=r.b[f],lead=x!=null&&y!=null?(x>y?'a':y>x?'b':''):'';
  const side=(v,tv,c,cl)=>html`<div class=${'mc2-v '+cl+(lead&&lead!==(cl==='a'?'a':'b')?' lo':'')}><b>${v==null?'–':Math.round(tv)+'%'}</b><small>${unit(r[cl][cnt])}</small><i style=${{width:(v==null?0:tv)+'%'}}></i></div>`;
  return html`<div class="mc2-row" key=${r.key}>${side(x,ta[i],ca,'a')}<span class="mc2-mp" style=${mapArt(r.name)}><b>${r.name}</b></span>${side(y,tb[i],cb,'b')}</div>`})}</div></div>`}<//>`};
