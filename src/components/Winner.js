/* Блок победителя турнира: чемпион по центру, золотые линии, итоги пути к титулу, MVP */
import {html} from '../lib/html.js';
import {MS,team,TT} from '../lib/data.js';
import {lang} from '../lib/i18n.js';
import {TeamLogo,PlayerPic,Flag} from './common.js';

/* итоги чемпиона из матчей турнира: победы, поражения, финал */
const summary=(o,w)=>{
  const mine=MS.filter(m=>m.tour===o.id&&m.st==='fin'&&m.s1!==m.s2&&(m.a===w.id||m.b===w.id)).sort((x,y)=>((x.ts||0)-(y.ts||0))||(x.id-y.id));
  const won=m=>(m.s1>m.s2?m.a:m.b)===w.id,W=mine.filter(won).length,L=mine.length-W;
  const fin=mine.filter(m=>m.stage==='Grand Final').pop()||mine[mine.length-1]||null;
  let f=null;if(fin){const sd=fin.a===w.id,op=sd?fin.b:fin.a;f={my:sd?fin.s1:fin.s2,op:sd?fin.s2:fin.s1,opp:op!=null?team(op):null,id:fin.id}}
  return {W,L,f}};

export const Winner=({o,win,mvp})=>{
  const ru=lang==='ru',S=win?summary(o,win):null;
  return html`<section class="wnr" aria-label=${ru?'Победитель турнира':'Tournament winner'}>
${o.trophy&&html`<img class="wnr-cup" src=${o.trophy} alt=""/>`}
<div class="wnr-hd"><i></i><span><b aria-hidden="true">★</b>${ru?'Чемпион турнира':'Tournament champion'}<b aria-hidden="true">★</b></span><i></i></div>
${win&&html`<a class="wnr-tm" href=${'#/team/'+win.id}><span class="wnr-lg"><${TeamLogo} x=${win} s=${84}/></span><h2>${win.name}</h2></a>`}
<div class="wnr-sub">${o.n}${o.d?' · '+o.d:''}</div>
${S&&(S.W>0||S.f)&&html`<div class="wnr-ch">
${S.W>0&&html`<span class="wnr-c"><b>${S.W}</b>${ru?(S.W%10===1&&S.W%100!==11?' победа':(S.W%10>=2&&S.W%10<=4&&(S.W%100<10||S.W%100>=20)?' победы':' побед')):(S.W===1?' win':' wins')}</span>`}
${S.W>0&&S.L===0&&html`<span class="wnr-c g">${ru?'Без поражений':'Undefeated'}</span>`}
${S.f&&html`<a class="wnr-c" href=${'#/match/'+S.f.id}>${ru?'Финал':'Final'} <b>${S.f.my}:${S.f.op}</b>${S.f.opp&&!S.f.opp.tbd&&html`<${TeamLogo} x=${S.f.opp} s=${18}/><em>${S.f.opp.name}</em>`}</a>`}
${o.loc&&html`<span class="wnr-c">${o.loc}</span>`}</div>`}
${mvp&&html`<a class="wnr-mvp" href=${'#/player/'+mvp.id}><span class="wnr-ph"><${PlayerPic} p=${mvp}/></span><span><small>${ru?'MVP турнира':'Tournament MVP'}</small><b><${Flag} x=${mvp}/>${mvp.nick}</b></span></a>`}
</section>`};
