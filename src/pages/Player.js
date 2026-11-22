import {html} from '../lib/html.js';
import {player,team,pteam,TI,TROPH,tour,PL} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {playerForm,f2,f1,rtc} from '../lib/calc.js';
import {Box,Empty,Flag,TeamLogo,Rt,Plate,PlayerPic,AchStrip,Ico} from '../components/common.js';
import {Row2} from './Team.js';

const RB={IGL:'crown',AWPer:'target',AWP:'target',Entry:'bolt',Support:'shield',Lurker:'skull'};

export const Player=({id})=>{
  const p=player(id);if(!p)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const T=pteam(p),ti=TI.filter(x=>x.player===p.id),tr=TROPH.filter(y=>y.pl.length?y.pl.includes(p.id):(p.team!=null&&y.team===p.team));
  const mine=playerForm(p.id),form=mine.slice(0,12).reverse();
  const S=[[f2(p.rt),'Rating',rtc(p.rt)],[f2(p.kd),'K/D'],[f1(p.adr),'ADR'],[p.kast+'%','KAST'],[p.hs+'%','HS%'],p.kpr?[f2(p.kpr),'KPR']:null,p.dpr?[f2(p.dpr),'DPR']:null,p.imp?[f2(p.imp),'Impact']:null,[p.maps,t('maps')]].filter(Boolean);
  const soc=[['tw','X','x'],['tt','Twitch','tw'],['ig','IG','ig']].filter(([k])=>p[k]);
  const best=Math.max(...mine.map(x=>x.rt),0),avg=mine.length?mine.reduce((s,x)=>s+x.rt,0)/mine.length:0;
  const PC=[['rt','Rating',f2],['kd','K/D',f2],['adr','ADR',f1],['kast','KAST',v=>v+'%'],['hs','HS%',v=>v+'%'],['kpr','KPR',f2],['imp','Impact',f2]].filter(([k])=>p[k]).map(([k,l,fm])=>{const lower=PL.filter(x=>x[k]<p[k]).length,pc=PL.length>1?Math.round(lower/(PL.length-1)*100):50;return {l,v:fm(p[k]),pc}});
  return html`<div class="col tprof">
<section class="prof2 pp"><div class="pp-ph"><${PlayerPic} p=${p} cls="xl"/>${RB[p.role]&&html`<span class="rbd" title=${p.role}><${Ico} n=${RB[p.role]} s=${16}/></span>`}<span class="rn"><${Flag} x=${p}/><b>${p.nick}</b></span></div>
<div class="pp-i"><div class="pf-h"><div class="pf-t"><div class="pf-c"><${Flag} x=${p}/><span>${p.cc}</span></div><h1>${p.nick}</h1>${p.name&&html`<p class="slg">${p.name}</p>`}</div>
<div class="pf-a">${soc.length>0&&html`<div class="soc">${soc.map(([k,l,c])=>html`<a key=${k} class=${'sob '+c} href=${p[k]} target="_blank" rel="noreferrer">${l}</a>`)}</div>`}</div></div>
<div class="pf-rows"><${Row2} l=${t('team')}>${T.tbd?html`<span class="mu">${T.name}</span>`:html`<a class="tlk" href=${'#/team/'+T.id}><${TeamLogo} x=${T} s=${20}/><span class="tn">${T.name}</span></a>`}<//>
${p.prev&&html`<${Row2} l=${t('prevTeams')}>${p.prev}<//>`}${p.role&&html`<${Row2} l=${t('role')}>${p.role}<//>`}${p.age>0&&html`<${Row2} l=${t('ageL')}>${p.age}<//>`}${p.since&&html`<${Row2} l=${t('inTeamSince')}>${p.since}<//>`}
<${Row2} l=${t('avgRt')}><${Rt} v=${p.rt}/><//>${mine.length>0&&html`<${Row2} l=${t('bestMatch')}><${Rt} v=${best}/><//>`}</div>
<${AchStrip} items=${[]} trophies=${tr}/></div></section>
${ti.length>0&&html`<div class="plates">${ti.map(y=>html`<${Plate} key=${y.id} x=${y}/>`)}</div>`}
<div class="stts">${S.map(([v,l,c])=>html`<div class=${'stt '+(c||'')} key=${l}><b>${v}</b><span>${l}</span></div>`)}</div>
<div class="g2w"><div class="col">
${form.length>0&&html`<${Box} h=${t('formR')} right=${html`<span class="hint">${t('avgShort')} ${f2(avg)}</span>`}><div class="bars">${form.map(x=>html`<a key=${x.m+'-'+x.p} href=${'#/match/'+x.m} class=${x.rt>=1?'g':''} style=${{height:Math.max(8,Math.min(100,x.rt*50))+'%'}}><small>${x.rt.toFixed(2)}</small></a>`)}</div><//>`}
<${Box} h=${t('hist')}>${mine.length?html`<table class="tbl"><thead><tr><th></th><th>${t('team')}</th><th class="num">${t('score')}</th><th class="num">K-D</th><th class="num">ADR</th><th class="num">Rating</th></tr></thead><tbody>${mine.slice(0,15).map(x=>{const m=x.mt,o=m.a===p.team?m.b:m.a,R=tour(m.tour);return html`<tr key=${x.m}><td class="mu">${m.d}</td><td><a class="tlk" href=${'#/match/'+m.id}><${TeamLogo} x=${team(o)} s=${18}/><span class="tn">vs ${team(o).name}</span></a>${R&&html`<small class="mu"> ${R.n}</small>`}</td><td class="num">${m.s1}:${m.s2}</td><td class="num">${x.k}-${x.d}</td><td class="num">${f1(x.adr)}</td><td class="num"><${Rt} v=${x.rt}/></td></tr>`})}</tbody></table>`:html`<${Empty}/>`}<//></div>
<aside>${PC.length>0&&html`<${Box} h=${t('skills')}><div class="pcts">${PC.map(x=>html`<div class="pct" key=${x.l}><span>${x.l}</span><i><u style=${{width:x.pc+'%'}} class=${x.pc>=66?'hi':x.pc>=33?'md':'lo'}></u></i><b>${x.v}</b><em>топ ${Math.max(1,100-x.pc)}%</em></div>`)}</div><//>`}
${p.about&&html`<${Box} h=${t('about')}><div class="in desc">${p.about}</div><//>`}
${tr.length>0&&html`<${Box} h=${t('trophies')}><div class="tro one">${tr.map(y=>html`<div class="tr1" key=${y.id}>${y.img?html`<img src=${y.img} alt=""/>`:html`<span class="cup">★</span>`}<b>${y.title}</b><small>${[y.place,y.year].filter(Boolean).join(' · ')}</small></div>`)}</div><//>`}</aside></div></div>`};
