/* История матчей игрока: сводка, фильтры (результат / турнир), карты, K-D, ADR, рейтинг, «показать ещё» */
import {useState} from 'react';
import {html} from '../lib/html.js';
import {tour} from '../lib/data.js';
import {lang} from '../lib/i18n.js';
import {f1,f2} from '../lib/calc.js';
import {Box,Empty,Tabs,TeamLink,Rt} from './common.js';

const STEP=15;
export const PlayerMatches=({mine,sideOf,title})=>{
  const ru=lang==='ru',[res,sr]=useState('all'),[ev,se]=useState('all'),[lim,sl]=useState(STEP);
  /* одна строка = один матч игрока; сторона определяется по командам игрока */
  const rows=mine.map((x,ix)=>{
    const m=x.mt,sd=sideOf(m),o=sd?(sd==='a'?m.b:m.a):null,my=sd==='a'?m.s1:m.s2,op=sd==='a'?m.s2:m.s1,fin=m.st==='fin';
    const r=sd&&fin?(my>op?'w':my<op?'l':'d'):'';
    const maps=(m.maps||[]).filter(z=>z.a!=null&&z.b!=null).map(z=>{const a=sd==='b'?z.b:z.a,b=sd==='b'?z.a:z.b;return {n:z.m,a,b,r:a>b?'w':a<b?'l':'d'}});
    return {key:x.m+'-'+ix,x,m,sd,o,my,op,r,fin,maps,R:tour(m.tour)}});
  const n=rows.length;
  if(!n)return html`<${Box} h=${title}><${Empty}/><//>`;
  const done=rows.filter(z=>z.r),W=done.filter(z=>z.r==='w').length,Lo=done.filter(z=>z.r==='l').length;
  const sk=rows.reduce((s,z)=>s+z.x.k,0),sd2=rows.reduce((s,z)=>s+z.x.d,0);
  const avgRt=rows.reduce((s,z)=>s+z.x.rt,0)/n,avgAdr=rows.reduce((s,z)=>s+z.x.adr,0)/n;
  const sum=[[n,ru?'Матчей':'Matches'],[W+' – '+Lo,ru?'Победы – поражения':'Wins – losses'],[done.length?Math.round(W/done.length*100)+'%':'—',ru?'Винрейт':'Win rate'],[sd2?f2(sk/sd2):'—','K/D'],[f1(avgAdr),'ADR'],[f2(avgRt),'Rating',avgRt>=1.1?'hi':avgRt>=1?'up':'dn']];
  /* список турниров, в которых играл игрок */
  const evs=[];rows.forEach(z=>{if(z.R&&!evs.some(e=>e.id===z.R.id))evs.push(z.R)});
  const list=rows.filter(z=>(res==='all'||z.r===res)&&(ev==='all'||(z.R&&String(z.R.id)===ev)));
  const shown=list.slice(0,lim),left=list.length-shown.length;
  const pick=(f,v)=>{f(v);sl(STEP)};
  const tabs=[['all',ru?'Все':'All',n],['w',ru?'Победы':'Wins',W],['l',ru?'Поражения':'Losses',Lo]];
  return html`<${Box} h=${title} cls="pm" right=${html`<span class="hint">${list.length}/${n}</span>`}>
<div class="pm-sum">${sum.map(([v,l,c])=>html`<div key=${l}><b class=${c?'rt '+c:''}>${v}</b><span>${l}</span></div>`)}</div>
<div class="pm-fl"><${Tabs} tabs=${tabs} cur=${res} on=${v=>pick(sr,v)}/>${evs.length>1&&html`<select class="pm-sel" value=${ev} onChange=${e=>pick(se,e.target.value)} aria-label=${ru?'Турнир':'Event'}><option value="all">${ru?'Все турниры':'All events'}</option>${evs.map(e=>html`<option key=${e.id} value=${String(e.id)}>${e.n}</option>`)}</select>`}</div>
${list.length?html`<div class="pm-w"><table class="tbl pm-t"><thead><tr><th>${ru?'Дата':'Date'}</th><th>${ru?'Соперник':'Opponent'}</th><th class="hm">${ru?'Карты':'Maps'}</th><th class="num">${ru?'Счёт':'Score'}</th><th class="num">K-D</th><th class="num hm">ADR</th><th class="num">Rating</th></tr></thead><tbody>${shown.map(z=>{const {m,x}=z,df=x.k-x.d;
  return html`<tr key=${z.key} class=${'p'+(z.r||(m.st==='live'?'x':'n'))}>
<td class="pm-d">${m.d||'—'}${m.tm&&html`<small>${m.tm}</small>`}</td>
<td class="pm-o">${z.sd?html`<${TeamLink} id=${z.o} s=${22}/>`:html`<span class="mu">—</span>`}${z.R&&html`<a class="pm-ev" href=${'#/tournament/'+z.R.id}>${z.R.n}</a>`}</td>
<td class="hm"><div class="pm-mp">${z.maps.length?z.maps.slice(0,5).map((q,i)=>html`<span key=${i} class=${q.r} title=${q.n+' '+q.a+':'+q.b}>${q.n}<b>${q.a}:${q.b}</b></span>`):html`<span class="mu">—</span>`}</div></td>
<td class="num"><a class=${'pm-sc '+(z.r||'')} href=${'#/match/'+m.id}>${m.st==='live'?html`<i class="live">LIVE</i>`:null}${z.sd?z.my+':'+z.op:m.s1+':'+m.s2}</a></td>
<td class="num">${x.k}-${x.d}<em class=${'df '+(df>0?'up':df<0?'dn':'')}>${df>0?'+'+df:df}</em></td>
<td class="num hm">${f1(x.adr)}</td><td class="num"><${Rt} v=${x.rt}/></td></tr>`})}</tbody></table></div>`:html`<${Empty}/>`}
${left>0&&html`<button type="button" class="pm-more" onClick=${()=>sl(lim+STEP)}>${ru?'Показать ещё':'Show more'} (${left})</button>`}<//>`};
