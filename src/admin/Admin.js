import {useState,useEffect} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {fetchAll,load,MISSING,applyTheme,parseMaps,seriesOf,MS,SITE} from '../lib/data.js';
import {useAuth,uploadImage} from '../lib/auth.js';
import {S,nm,ctx,STAGES} from './schema.js';
import {MapSel,MapsEd,VetoEd,PrizeEd,MdEd,PlSel,CcSel} from './editors.js';
import {genSingle,genDouble,genSwiss,genGroups,genGsl} from './gen.js';
import {Plate} from '../components/common.js';

const ORDER=['bracket','part','tournaments','matches','pstats','teams','players','titles','trophies','news','maps','site'];
const TITLE={bracket:'Сетки турниров',part:'Участники турниров'};
const WIDE=['plsel','area','md','mapsel','mapsed','vetoed','prized','h','img','imgs'];

/* ---------- универсальное поле ---------- */
const Fld=({f,row,set,D})=>{
  const [k,l,ty,o]=f,v=row[k]??'',ch=e=>set(k,e.target.value),[ub,sub]=useState(false);let i;
  if(ty==='h')return html`<h4 class="fh">${l}</h4>`;
  if(ty==='area')i=html`<textarea rows="4" value=${v} onChange=${ch}/>`;
  else if(ty==='md')i=html`<${MdEd} v=${v} set=${x=>set(k,x)} D=${D}/>`;
  else if(ty==='cc')i=html`<${CcSel} v=${v} set=${x=>set(k,x)}/>`;
  else if(ty==='plsel')i=html`<${PlSel} v=${v} set=${x=>set(k,x)} D=${D}/>`;
  else if(ty==='mapsel')i=html`<${MapSel} v=${v} set=${x=>set(k,x)} D=${D}/>`;
  else if(ty==='mapsed')i=html`<${MapsEd} key=${row.id} v=${v} set=${x=>set(k,x)} D=${D}/>`;
  else if(ty==='vetoed')i=html`<${VetoEd} key=${row.id} v=${v} set=${x=>set(k,x)} D=${D}/>`;
  else if(ty==='prized')i=html`<${PrizeEd} key=${row.id} v=${v} set=${x=>set(k,x)} D=${D}/>`;
  else if(ty==='sel'||ty==='ref')i=html`<select value=${v} onChange=${ch}><option value="">—</option>${(ty==='ref'?(o==='matches'?[...D[o]].reverse():D[o]).map(x=>[x.id,nm(o,x)]):o).map(([a,b])=>html`<option key=${a} value=${a}>${b}</option>`)}</select>`;
  else if(ty==='imgs'){const list=(v||'').split('\n').filter(Boolean);i=html`<div class="up gal">${list.map((u,j)=>html`<span class="gi" key=${u+j}><img src=${u}/><button type="button" class="b d" onClick=${()=>set(k,list.filter((_,z)=>z!==j).join('\n'))}>×</button></span>`)}<input type="file" accept="image/*" multiple disabled=${ub} onChange=${async e=>{const fs=[...e.target.files];if(!fs.length)return;sub(true);try{const urls=[];for(const fl of fs){if(fl.size>5e6||!fl.type.startsWith('image/')){alert('Пропущен '+fl.name+': нужна картинка до 5 МБ');continue}urls.push(await uploadImage(fl))}set(k,[...list,...urls].join('\n'))}catch(x){alert('Ошибка загрузки: '+x.message)}sub(false);e.target.value=''}}/>${ub&&' Загрузка…'}</div>`}
  else if(ty==='img')i=html`<div class="up">${v&&html`<img src=${v}/>`}<input type="file" accept="image/*" disabled=${ub} onChange=${async e=>{const fl=e.target.files[0];if(!fl)return;if(fl.size>5e6||!fl.type.startsWith('image/'))return alert('Нужна картинка до 5 МБ');sub(true);try{set(k,await uploadImage(fl))}catch(x){alert('Ошибка загрузки: '+x.message)}sub(false)}}/>${ub&&' Загрузка…'}${v&&html`<button type="button" class="b g" onClick=${()=>set(k,'')}>Убрать</button>`}</div>`;
  else i=html`<input type=${ty==='number'?'number':ty==='color'?'color':'text'} step="any" value=${ty==='color'?(v||'#d4141c'):v} onChange=${ch}/>`;
  return html`<label class=${WIDE.includes(ty)?'wide':''}>${l}${i}</label>`};

const clean=(s,row)=>{const o={};s.f.forEach(([k,,ty,opt])=>{if(ty==='h')return;let v=row[k];
  if(v===''||v===undefined)v=null;
  else if(ty==='number'||ty==='ref'||k==='bo')v=Number(v);
  else if(ty==='sel'&&Array.isArray(opt)&&opt.some(x=>typeof x[0]==='number'))v=Number(v);
  o[k]=v});return o};

/* ---------- CRUD ---------- */
export const Crud=({c,D,reload,note,init})=>{
  const s=S[c],rows=D[c],one=!!s.one,[row,sr]=useState(init||(one?(rows[0]||{id:1}):null)),[busy,sbz]=useState(false),[q,sq]=useState(''),set=(k,v)=>sr(r=>({...r,[k]:v}));
  useEffect(()=>{if(c!=='site'||!row)return;applyTheme(row);return()=>applyTheme(SITE)},[row]);
  const save=async()=>{sbz(true);let o=clean(s,row),dropped=[],r;
    if(c==='matches'&&o.maps){const S=seriesOf(parseMaps(o.maps),o.bo||3);if(S.played&&!(+o.s1||+o.s2)){o.s1=S.a;o.s2=S.b}if(S.played&&S.done&&o.st!=='fin')o.st='fin'}
    const run=()=>one?sb.from(c).upsert({...o,id:1}):row.id!=null?sb.from(c).update(o).eq('id',row.id):sb.from(c).insert(o);
    for(let i=0;i<30;i++){r=await run();
      const m=r.error&&String(r.error.message).match(/'([^']+)' column|column "?([\w]+)"?/i),col=m&&(m[1]||m[2]);
      if(col&&col in o&&col!=='id'){delete o[col];dropped.push(col);continue}break}
    sbz(false);
    if(r.error)return note('Ошибка: '+r.error.message+(/column|relation|schema/i.test(r.error.message)?' — выполните обновлённый supabase/schema.sql':''),1);
    await reload();note(dropped.length?'Сохранено, кроме полей: '+dropped.join(', ')+' — в базе нет этих колонок, выполните supabase/schema.sql (SQL Editor) и сохраните ещё раз':'Сохранено',!!dropped.length);if(!one)sr(null)};
  const del=async r=>{if(!confirm('Удалить? Это действие нельзя отменить.'))return;const {error}=await sb.from(c).delete().eq('id',r.id);if(error)return note('Ошибка: '+error.message,1);await reload();note('Удалено')};
  const val=(k,r)=>{const f=s.f.find(x=>x[0]===k),v=r[k];if(v==null||v==='')return '';if(f[2]==='ref'){const x=D[f[3]].find(y=>y.id==v);return x?nm(f[3],x):'?'}if(f[2]==='sel'){const x=f[3].find(y=>y[0]==v);return x?x[1]:String(v)}return String(v)};
  const show=(k,r)=>{const f=s.f.find(x=>x[0]===k);return f[2]==='img'&&r[k]?html`<img src=${r[k]}/>`:val(k,r).slice(0,50)};
  const resetLook=()=>{if(!confirm('Сбросить внешний вид (тему, цвета, ширину, шрифт, фон, свой CSS) к стандартным? Остальные настройки сайта сохранятся.'))return;sr(r=>({...r,theme:'',color:'',color2:'',radius:'',width:'',density:'',font:'',bgimg:'',bgdim:'',css:''}))};
  if(row)return html`<div><h1>${one?s.t:(row.id!=null?'Изменить':'Добавить')+': '+s.t}</h1>
${s.preview==='plate'&&html`<div class="pvbox"><span>Предпросмотр:</span><${Plate} x=${{...row,tour:row.tour?+row.tour:null}}/></div>`}
${c==='site'&&html`<div class="pvbox"><button type="button" class="b g" onClick=${resetLook}>Сбросить внешний вид</button><span class="hint">Если сайт «поехал» после изменения оформления — нажмите, затем «Сохранить»</span></div>`}
<div class="fm">${s.f.map((f,i)=>html`<${Fld} key=${f[0]+'_'+i} f=${f} row=${row} set=${set} D=${D}/>`)}</div>
<div class="sv"><button class="b" disabled=${busy} onClick=${save}>${busy?'Сохранение…':'Сохранить'}</button>${!one&&html`<button class="b g" onClick=${()=>sr(null)}>Отмена</button>`}</div></div>`;
  const list=[...rows].reverse().filter(r=>!q||s.f.some(f=>f[2]!=='img'&&f[2]!=='h'&&val(f[0],r).toLowerCase().includes(q.toLowerCase())));
  return html`<div><h1>${s.t}</h1><div class="tools"><button class="b" onClick=${()=>sr({})}>+ Добавить</button><input class="srch" placeholder="Поиск по таблице…" value=${q} onChange=${e=>sq(e.target.value)}/><span class="hint">Всего: ${rows.length}</span></div>
<table><thead><tr>${s.cols.map(k=>html`<th key=${k}>${s.f.find(x=>x[0]===k)[1].split('(')[0]}</th>`)}<th></th></tr></thead><tbody>${list.map(r=>html`<tr key=${r.id}>${s.cols.map(k=>html`<td key=${k}>${show(k,r)}</td>`)}<td class="act"><button class="b" onClick=${()=>sr({...r})}>Изменить</button><button class="b g" title="Создать копию" onClick=${()=>sr({...r,id:undefined})}>Копия</button><button class="b d" onClick=${()=>del(r)}>Удалить</button></td></tr>`)}</tbody></table>${!list.length&&html`<p class="hint">Ничего нет. Нажмите «Добавить».</p>`}</div>`};

/* ---------- карточка матча в редакторе сетки ---------- */
export const MCard=({m,D,reload,note,open})=>{
  const [r,sr]=useState(m),set=(k,v)=>sr(x=>({...x,[k]:v})),dirty=JSON.stringify(r)!==JSON.stringify(m);
  useEffect(()=>{sr(m)},[m]);
  const N=v=>v===''||v==null?null:Number(v);
  const save=async()=>{const {error}=await sb.from('matches').update({a:N(r.a),b:N(r.b),s1:N(r.s1)||0,s2:N(r.s2)||0,st:r.st,d:r.d,tm:r.tm,bo:N(r.bo)||3,ord:N(r.ord)||0,rnd:N(r.rnd)||0,grp:r.grp||null}).eq('id',m.id);if(error)return note('Ошибка: '+error.message,1);await reload();note('Сохранено')};
  const del=async()=>{if(!confirm('Удалить матч?'))return;const {error}=await sb.from('matches').delete().eq('id',m.id);if(error)return note('Ошибка: '+error.message,1);await reload();note('Удалено')};
  return html`<div class=${'mc '+(r.st==='live'?'lv':'')}>${['a','b'].map((k,i)=>html`<div class="mt" key=${k}><select value=${r[k]??''} onChange=${e=>set(k,e.target.value)}><option value="">TBD</option>${D.teams.map(x=>html`<option key=${x.id} value=${x.id}>${x.name}</option>`)}</select><input type="number" class="sc" value=${r['s'+(i+1)]??0} onChange=${e=>set('s'+(i+1),e.target.value)}/></div>`)}
<div class="mm"><select value=${r.st||'up'} onChange=${e=>set('st',e.target.value)}><option value="up">Скоро</option><option value="live">Live</option><option value="fin">Завершён</option></select><select value=${r.bo||3} onChange=${e=>set('bo',e.target.value)}>${[1,2,3,5].map(b=>html`<option key=${b} value=${b}>BO${b}</option>`)}</select><input placeholder="дата" value=${r.d||''} onChange=${e=>set('d',e.target.value)}/><input placeholder="время" value=${r.tm||''} onChange=${e=>set('tm',e.target.value)}/></div>
<div class="mm"><input type="number" title="Раунд" placeholder="раунд" value=${r.rnd??''} onChange=${e=>set('rnd',e.target.value)}/><input type="number" title="Порядок" placeholder="порядок" value=${r.ord??''} onChange=${e=>set('ord',e.target.value)}/><input title="Группа / рекорд Swiss" placeholder="группа" value=${r.grp||''} onChange=${e=>set('grp',e.target.value)}/></div>
<div class="ma">${dirty&&html`<button class="b" onClick=${save}>Сохранить</button>`}<button class="b g" onClick=${()=>open(m)}>Карты и статистика…</button><button class="b d" onClick=${del}>×</button></div></div>`};

/* ---------- редактор сеток ---------- */
const SINGLE=['Round of 32','Round of 16','Quarterfinal','Semifinal','Grand Final'];
export const BracketEd=({D,reload,note,open})=>{
  const [tid,st]=useState(D.tournaments.length?String(D.tournaments[D.tournaments.length-1].id):''),[g,sg]=useState({kind:'single',n:8,G:2,bo:3,boF:5,third:false,sw:16,boD:''});
  const o=D.tournaments.find(x=>x.id==tid),ms=D.matches.filter(m=>m.tour==tid),setg=(k,v)=>sg(x=>({...x,[k]:v}));
  const parts=D.tteams.filter(x=>x.tour==tid).sort((a,b)=>(a.seed||999)-(b.seed||999)),teams=parts.map(x=>x.team),grpOf=id=>(parts.find(x=>x.team===id)||{}).grp||'';
  const add=async(stage)=>{if(!tid)return note('Сначала создайте и выберите турнир',1);const last=ms.filter(m=>m.stage===stage);const {error}=await sb.from('matches').insert({tour:Number(tid),stage,st:'up',bo:3,s1:0,s2:0,rnd:last.length?Math.max(...last.map(m=>m.rnd||1)):1,ord:last.length+1});if(error)return note('Ошибка: '+error.message,1);await reload()};
  const setBo=async(stage,v)=>{if(!confirm('Поставить BO'+v+' всем матчам стадии «'+stage+'»?'))return;const {error}=await sb.from('matches').update({bo:Number(v)}).eq('tour',Number(tid)).eq('stage',stage);if(error)return note('Ошибка: '+error.message,1);await reload();note('BO обновлён')};
  const clearStage=async stage=>{if(!confirm('Удалить все матчи стадии «'+stage+'» этого турнира?'))return;const {error}=await sb.from('matches').delete().eq('tour',Number(tid)).eq('stage',stage);if(error)return note('Ошибка: '+error.message,1);await reload();note('Стадия удалена')};
  const gen=async()=>{
    if(!tid)return note('Выберите турнир',1);
    const n=+g.n,bo=+g.bo,boF=+g.boF;let rows=[];
    if(g.kind==='single')rows=genSingle(+tid,n,teams,bo,boF,g.third);
    else if(g.kind==='double')rows=genDouble(+tid,n,teams,bo,boF);
    else if(g.kind==='swiss')rows=genSwiss(+tid,+g.sw,o&&o.sw||3,o&&o.sl||3,teams,bo,g.boD?+g.boD:0);
    else if(g.kind==='groups')rows=genGroups(+tid,teams,+g.G,bo,grpOf);
    else rows=genGsl(+tid,teams,+g.G,bo,grpOf);
    if(!confirm('Будет создано матчей: '+rows.length+(teams.length?'':'. Участники турнира не заданы — команды останутся TBD (задайте их во вкладке «Участники турниров»)')+'. Продолжить?'))return;
    const {error}=await sb.from('matches').insert(rows);if(error)return note('Ошибка: '+error.message,1);await reload();note('Сетка создана: '+rows.length+' матчей')};
  const advance=async()=>{
    /* на сайте победители уже расставлены автоматически (MS) — здесь то же самое записываем в базу, чтобы это было и в админке */
    const ups=[];ms.forEach(m=>{const z=MS.find(x=>x.id===m.id);if(!z)return;const p={};if(m.a==null&&z.a!=null)p.a=z.a;if(m.b==null&&z.b!=null)p.b=z.b;if(Object.keys(p).length)ups.push([m.id,p])});
    if(!ups.length)return note('Нечего продвигать: нет завершённых матчей или всё уже заполнено');
    for(const [id,p] of ups){const {error}=await sb.from('matches').update(p).eq('id',id);if(error)return note('Ошибка: '+error.message,1)}
    await reload();note('Команды расставлены по сетке: '+ups.length)};
  const present=STAGES.filter(([k])=>ms.some(m=>m.stage===k));
  return html`<div><h1>Сетки турниров</h1><p class="hint">Выберите турнир → «Создать сетку» (Swiss, группы, GSL, single/double elimination) → заполняйте команды, счёт и статус. На сайте всё обновляется автоматически.</p>
<div class="tools"><select value=${tid} onChange=${e=>st(e.target.value)}>${D.tournaments.map(x=>html`<option key=${x.id} value=${x.id}>${x.n}</option>`)}</select><button class="b g" onClick=${advance}>Авто-продвижение победителей по сетке</button></div>
<div class="gen"><h4>Генератор сетки</h4><div class="grid">
<label>Формат<select value=${g.kind} onChange=${e=>setg('kind',e.target.value)}><option value="single">Single elimination (плей-офф)</option><option value="double">Double elimination</option><option value="swiss">Швейцарская система</option><option value="groups">Группы (круговая)</option><option value="gsl">Группы GSL</option></select></label>
${(g.kind==='single'||g.kind==='double')&&html`<label>Команд<select value=${g.n} onChange=${e=>setg('n',e.target.value)}>${(g.kind==='double'?[8,16]:[4,8,16,32]).map(x=>html`<option key=${x}>${x}</option>`)}</select></label>`}
${g.kind==='swiss'&&html`<label>Команд в Swiss<select value=${g.sw} onChange=${e=>setg('sw',e.target.value)}>${[8,16,24,32].map(x=>html`<option key=${x}>${x}</option>`)}</select></label>`}
${(g.kind==='groups'||g.kind==='gsl')&&html`<label>Групп<select value=${g.G} onChange=${e=>setg('G',e.target.value)}>${[1,2,3,4,6,8].map(x=>html`<option key=${x}>${x}</option>`)}</select></label>`}
<label>BO матчей<select value=${g.bo} onChange=${e=>setg('bo',e.target.value)}>${[1,2,3,5].map(x=>html`<option key=${x} value=${x}>BO${x}</option>`)}</select></label>
${g.kind==='swiss'&&html`<label>BO решающих (проход / вылет)<select value=${g.boD} onChange=${e=>setg('boD',e.target.value)}><option value="">Такой же, как «BO матчей»</option>${[1,3,5].map(x=>html`<option key=${x} value=${x}>BO${x}</option>`)}</select></label>`}
${(g.kind==='single'||g.kind==='double')&&html`<label>BO финала<select value=${g.boF} onChange=${e=>setg('boF',e.target.value)}>${[1,3,5].map(x=>html`<option key=${x} value=${x}>BO${x}</option>`)}</select></label>`}
${g.kind==='single'&&html`<label class="cb"><input type="checkbox" checked=${g.third} onChange=${e=>setg('third',e.target.checked)}/> Матч за 3 место</label>`}
<button class="b" onClick=${gen}>Создать сетку</button></div><p class="hint">Команды берутся из «Участников турнира» (по посеву; группы — из колонки «Группа»). Без участников матчи создаются с TBD.</p></div>
${present.length?present.map(([k,l])=>{const list=ms.filter(m=>m.stage===k),rs=[...new Set(list.map(m=>m.rnd||0))].sort((a,b)=>a-b);
  return html`<section class="stg" key=${k}><div class="stgh"><h3>${l}</h3><span class="hint">${list.length} матчей</span><button class="b g" onClick=${()=>add(k)}>+ матч</button><select title="Задать BO всем матчам стадии" value="" onChange=${e=>{if(e.target.value)setBo(k,e.target.value)}}><option value="">BO для всех…</option>${[1,2,3,5].map(x=>html`<option key=${x} value=${x}>BO${x}</option>`)}</select><button class="b d" onClick=${()=>clearStage(k)}>Удалить стадию</button></div>
  ${rs.map(r=>html`<div key=${r}>${rs.length>1&&html`<div class="rh">Раунд ${r||'—'}</div>`}<div class="mcs">${list.filter(m=>(m.rnd||0)===r).sort((a,b)=>(a.grp||'').localeCompare(b.grp||'')||(a.ord||0)-(b.ord||0)||a.id-b.id).map(m=>html`<${MCard} key=${m.id} m=${m} D=${D} reload=${reload} note=${note} open=${open}/>`)}</div></div>`)}</section>`}):html`<p class="hint">В этом турнире ещё нет матчей. Используйте генератор выше или добавьте стадию вручную:</p>`}
<div class="tools">${STAGES.map(([k,l])=>html`<button key=${k} class="b g" onClick=${()=>add(k)}>+ ${l}</button>`)}</div></div>`};

/* ---------- участники турнира: посев и группы ---------- */
export const PartEd=({D,reload,note})=>{
  const [tid,st]=useState(D.tournaments.length?String(D.tournaments[D.tournaments.length-1].id):''),[bz,sb2]=useState(false);
  const cur=D.tteams.filter(x=>x.tour==tid);
  const init=()=>{const m={};cur.forEach(x=>m[x.team]={on:true,grp:x.grp||'',seed:x.seed??'',id:x.id});return m};
  const [ed,se]=useState(init);useEffect(()=>{se(init())},[tid,D.tteams]);
  const set=(id,k,v)=>se(e=>({...e,[id]:{...(e[id]||{on:false,grp:'',seed:''}),[k]:v}}));
  const save=async()=>{sb2(true);try{
    for(const t of D.teams){const e=ed[t.id],ex=cur.find(x=>x.team===t.id);
      if(e&&e.on){const p={tour:Number(tid),team:t.id,grp:e.grp||null,seed:e.seed===''?null:Number(e.seed)};const r=ex?await sb.from('tteams').update(p).eq('id',ex.id):await sb.from('tteams').insert(p);if(r.error)throw r.error}
      else if(ex){const r=await sb.from('tteams').delete().eq('id',ex.id);if(r.error)throw r.error}}
    await reload();note('Участники сохранены')}catch(x){note('Ошибка: '+x.message+(/relation|tteams/.test(x.message)?' — выполните обновлённый supabase/schema.sql':''),1)}sb2(false)};
  const autoSeed=()=>{let n=0;se(e=>{const o={...e};D.teams.slice().sort((a,b)=>(b.pts||0)-(a.pts||0)).forEach(t=>{if(o[t.id]&&o[t.id].on)o[t.id]={...o[t.id],seed:++n}});return o})};
  return html`<div><h1>Участники турниров</h1><p class="hint">Отметьте команды турнира, задайте посев (1 — сильнейший) и группу (A, B…). Эти данные используются генератором сеток и страницей «Участники» на сайте.</p>
<div class="tools"><select value=${tid} onChange=${e=>st(e.target.value)}>${D.tournaments.map(x=>html`<option key=${x.id} value=${x.id}>${x.n}</option>`)}</select><button class="b g" onClick=${autoSeed}>Посев по рейтингу</button><button class="b" disabled=${bz} onClick=${save}>${bz?'Сохранение…':'Сохранить'}</button></div>
<table><thead><tr><th>В турнире</th><th>Команда</th><th>Посев</th><th>Группа</th></tr></thead><tbody>${D.teams.map(t=>{const e=ed[t.id]||{};return html`<tr key=${t.id}><td><input type="checkbox" checked=${!!e.on} onChange=${x=>set(t.id,'on',x.target.checked)}/></td><td>${t.logo&&html`<img src=${t.logo}/>`} ${t.name}</td><td><input type="number" class="sm" value=${e.seed??''} onChange=${x=>set(t.id,'seed',x.target.value)}/></td><td><input class="sm" value=${e.grp||''} onChange=${x=>set(t.id,'grp',x.target.value)}/></td></tr>`})}</tbody></table></div>`};

const Home=({D,go})=>html`<div><h1>Обзор</h1><div class="cnts">${ORDER.filter(k=>S[k]&&!S[k].one).map(k=>html`<button class="cnt" key=${k} onClick=${()=>go(k)}><b>${D[k].length}</b>${S[k].t}</button>`)}</div>
<p class="hint">Как начать: 1) Команды → 2) Игроки → 3) Карты (картинки) → 4) Турнир (мап-пул, цвет, баннер) → 5) Участники → 6) «Сетки турниров» → генератор → 7) Матчи: карты, вето и статистика → 8) Титулы и Новости. Внешний вид сайта — в «Настройках сайта» (изменения видны сразу).</p></div>`;

export const Admin=()=>{
  const au=useAuth(),[D,sD]=useState(null),[tab,st]=useState('home'),[init,si]=useState(null),[msg,sg]=useState(null),[err,se]=useState('');
  const reload=()=>fetchAll().then(d=>{ctx.D=d;load(d);sD(d);se('')}).catch(e=>se(e.message));
  const note=(m,bad)=>{sg([m,bad]);setTimeout(()=>sg(null),4000)};
  const go=(k,row)=>{si(row||null);st(k)};
  useEffect(()=>{if(au.admin)reload()},[au.admin]);
  const exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D,null,2)],{type:'application/json'}));a.download='cstt-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click()};
  const box=c=>html`<div class="adm"><div class="lg">${c}</div></div>`;
  if(!sb)return box(html`<p>Админка работает после подключения Supabase: впишите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env (см. README). Сейчас сайт показывает демо-данные.</p><a class="b g" href="#/">На сайт</a>`);
  if(!au.ready)return box('Загрузка…');
  if(!au.user)return box(html`<p>Войдите на сайте под аккаунтом администратора.</p><a class="b" href="#/login">Войти</a>`);
  if(!au.admin)return box(html`<p>У этого аккаунта нет прав администратора. Выдайте права командой из README (раздел «Права администратора»).</p><a class="b g" href="#/">На сайт</a>`);
  if(err)return box(html`<p>Ошибка загрузки данных: ${err}</p><button class="b" onClick=${reload}>Повторить</button>`);
  if(!D)return box('Загрузка…');
  ctx.D=D;
  const tabs=[['home','Обзор'],...ORDER.map(k=>[k,S[k]?S[k].t:TITLE[k]]),['bk','Резервная копия']];
  return html`<div class="adm"><div class="app"><div class="sb"><h2>CSTT Админ</h2>${tabs.map(([k,l])=>html`<button key=${k} class=${tab===k?'on':''} onClick=${()=>go(k)}>${l}</button>`)}<a href="#/">← На сайт</a></div>
<div class="mn">${msg&&html`<div class="msg" style=${msg[1]?{background:'#c62828'}:{}}>${msg[0]}</div>`}
${MISSING.length>0&&html`<div class="warn">В базе нет таблиц: ${MISSING.join(', ')}. Откройте Supabase → SQL Editor и выполните обновлённый файл supabase/schema.sql (его можно запускать повторно).</div>`}
${tab==='home'?html`<${Home} D=${D} go=${go}/>`:tab==='bracket'?html`<${BracketEd} D=${D} reload=${reload} note=${note} open=${m=>go('matches',{...m})}/>`:tab==='part'?html`<${PartEd} D=${D} reload=${reload} note=${note}/>`:tab==='bk'?html`<div><h1>Резервная копия</h1><p class="hint">Скачайте все данные одним JSON-файлом. Supabase также делает собственные копии базы (Database → Backups в панели Supabase).</p><button class="b" onClick=${exp}>Скачать копию</button></div>`:html`<${Crud} key=${tab+(init?init.id:'')} c=${tab} D=${D} reload=${reload} note=${note} init=${init}/>`}</div></div></div>`};
