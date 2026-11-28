/* Сравнение команд по картам: всё считается из матчей, уже внесённых на сайт (счёт карт, кто выбрал, вето) */
import {MS,MAPS} from './data.js';

export const mapKey=n=>String(n||'').toLowerCase().replace(/^de[_ ]/,'').replace(/[^a-z0-9]/g,'');

/* общий список карт: порядок и включение задаются в админке («Карты для сравнения»). all=true — вернуть и выключенные */
export const cmpMaps=(list=MAPS,all=false)=>{
  const seen=new Set(),out=[];
  [...list].sort((a,b)=>((a.ord||999)-(b.ord||999))||(a.id-b.id)).forEach(m=>{const k=mapKey(m.name);if(!k||seen.has(k))return;seen.add(k);if(all||(m.cmp!==false&&m.active!==false))out.push(m)});
  return out};

/* статистика одной команды: по каждой карте — сыграно, выиграно, выборы (pick) и баны; + сколько матчей содержали данные о пиках/банах */
export const teamMapStats=(teamId,use=()=>true)=>{
  const by={},seen={pick:0,ban:0,matches:0},g=k=>by[k]||(by[k]={played:0,won:0,picks:0,bans:0});
  MS.filter(m=>m.st==='fin'&&(m.a===teamId||m.b===teamId)&&use(m)).forEach(m=>{
    const sd=m.a===teamId?'a':'b';seen.matches++;
    const picks=new Set(),bans=new Set();
    m.maps.forEach(x=>{
      if(x.a!=null&&x.b!=null&&!x.live){const r=g(mapKey(x.m)),my=sd==='a'?x.a:x.b,op=sd==='a'?x.b:x.a;r.played++;if(my>op)r.won++}
      if(x.pick===sd)picks.add(mapKey(x.m))});
    m.veto.forEach(v=>{if(v.t!==sd)return;if(v.k==='pick')picks.add(mapKey(v.m));else if(v.k==='ban')bans.add(mapKey(v.m))});
    const info=m.veto.length>0||m.maps.some(x=>x.pick==='a'||x.pick==='b'||x.pick==='d');
    if(info)seen.pick++;if(m.veto.length>0)seen.ban++;
    picks.forEach(k=>g(k).picks++);bans.forEach(k=>g(k).bans++)});
  return {by,seen}};

const pct=(n,d)=>d>0?Math.round(n/d*100):null;
/* строки сравнения для страницы матча */
export const compareMaps=m=>{
  const use=x=>x.id!==m.id&&(!(m.ts&&x.ts)||x.ts<m.ts),A=teamMapStats(m.a,use),B=teamMapStats(m.b,use);
  const cell=(S,k)=>{const r=S.by[k]||{played:0,won:0,picks:0,bans:0};
    return {win:pct(r.won,r.played),played:r.played,pick:pct(r.picks,S.seen.pick),picks:r.picks,ban:pct(r.bans,S.seen.ban),bans:r.bans}};
  return {rows:cmpMaps().map(x=>{const k=mapKey(x.name);return {name:x.name,key:k,a:cell(A,k),b:cell(B,k)}}),seenA:A.seen,seenB:B.seen}};
