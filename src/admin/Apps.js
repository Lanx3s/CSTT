/* Админка: заявки команд, заявки на турниры, карты для сравнения */
import {useState,useEffect} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {uploadImage} from '../lib/auth.js';
import {validateApp,ROLES,toPayload} from '../lib/validate.js';
import {ImgLinks} from '../components/Forms.js';
import {Status} from '../pages/TeamApply.js';
import {cmpMaps,mapKey} from '../lib/mapcmp.js';

const FILTERS=[['pending','На рассмотрении'],['approved','Одобрены'],['rejected','Отклонены'],['all','Все']];
const fmt=d=>d?String(d).replace('T',' ').slice(0,16):'—';
const useRows=(table,reloadKey)=>{
  const [s,ss]=useState({rows:null,nick:{},err:''}),load=async()=>{
    const [a,p]=await Promise.all([sb.from(table).select('*').order('id',{ascending:false}),sb.from('profiles').select('id,nick')]);
    if(a.error)return ss({rows:[],nick:{},err:a.error.message+(/relation|does not exist|schema/i.test(a.error.message)?' — выполните обновлённый supabase/schema.sql':'')});
    const nick={};(p.data||[]).forEach(x=>nick[x.id]=x.nick);ss({rows:a.data,nick,err:''})};
  useEffect(()=>{load()},[reloadKey]);return [s,load]};

const Filter=({cur,on,rows})=>html`<div class="tabs ad-tabs">${FILTERS.map(([k,l])=>html`<button key=${k} class=${cur===k?'on':''} onClick=${()=>on(k)}>${l}<em>${k==='all'?rows.length:rows.filter(r=>r.status===k).length}</em></button>`)}</div>`;

/* ---------- заявки команд ---------- */
export const TeamApps=({D,reload,note})=>{
  const [s,load]=useRows('team_apps'),[f,sf]=useState('pending'),[q,sq]=useState(''),[open,so]=useState(null);
  if(s.rows===null)return html`<div><h1>Заявки команд</h1><p class="hint">Загрузка…</p></div>`;
  if(s.err)return html`<div><h1>Заявки команд</h1><div class="warn">${s.err}</div></div>`;
  const cur=open!=null?s.rows.find(r=>r.id===open):null;
  if(cur)return html`<${AppView} a=${cur} nick=${s.nick[cur.uid]} back=${()=>{so(null);load()}} reload=${reload} load=${load} note=${note} D=${D}/>`;
  const list=s.rows.filter(r=>(f==='all'||r.status===f)&&(!q||(r.name+' '+r.tag+' '+(s.nick[r.uid]||'')).toLowerCase().includes(q.toLowerCase())));
  return html`<div><h1>Заявки команд</h1><p class="hint">Заявки, поданные со страницы «Регистрация команды». Откройте заявку, проверьте логотип и фото, затем одобрите или отклоните с причиной. При одобрении команда и игроки создаются автоматически.</p>
<${Filter} cur=${f} on=${sf} rows=${s.rows}/><div class="tools"><input class="srch" placeholder="Поиск по названию, тегу, пользователю…" value=${q} onInput=${e=>sq(e.target.value)}/><button class="b g" onClick=${load}>Обновить</button></div>
<table><thead><tr><th>№</th><th>Дата</th><th>Команда</th><th>Подал</th><th>Статус</th><th></th></tr></thead><tbody>${list.map(r=>html`<tr key=${r.id}><td>${r.id}</td><td>${fmt(r.created_at)}</td><td>${r.logo&&html`<img src=${r.logo} alt=""/>`} <b>${r.name}</b> [${r.tag}] · ${r.cc}</td><td>${s.nick[r.uid]||'—'}</td><td><${Status} s=${r.status}/></td><td class="act"><button class="b" onClick=${()=>so(r.id)}>Открыть</button></td></tr>`)}</tbody></table>${!list.length&&html`<p class="hint">Заявок нет.</p>`}</div>`};

const AppView=({a,nick,back,reload,load,note,D})=>{
  const [ed,se]=useState(false),[x,sx]=useState(a),[busy,sb2]=useState(false),[rej,sr]=useState(false),[why,sw]=useState('');
  useEffect(()=>{sx(a)},[a]);
  const pend=a.status==='pending',cl=a.client_key,set=(k,v)=>sx(o=>({...o,[k]:v})),setP=(i,k,v)=>sx(o=>({...o,players:o.players.map((p,j)=>j===i?{...p,[k]:v}:p)}));
  const warn=validateApp({...x,elo:x.elo==null?'':String(x.elo),players:(x.players||[]).map(p=>({...p,age:p.age==null?'':String(p.age),elo:p.elo==null?'':String(p.elo)}))});
  const wc=Object.keys(warn).length;
  const up=async(k,file,pi)=>{if(!file)return;if(!file.type.startsWith('image/')||file.size>5e6)return note('Нужна картинка до 5 МБ',1);try{const u=await uploadImage(file);pi==null?set(k,u):setP(pi,k,u)}catch(e){note('Ошибка загрузки: '+e.message,1)}};
  const save=async()=>{sb2(true);const o={name:x.name,tag:String(x.tag||'').toUpperCase(),cc:String(x.cc||'EU').toUpperCase(),coach:x.coach||null,logo:x.logo,col:x.col||null,col2:x.col2||null,elo:x.elo===''||x.elo==null?null:+x.elo,about:x.about||null,players:x.players.map(p=>({...p,age:p.age===''||p.age==null?null:+p.age,elo:p.elo===''||p.elo==null?null:+p.elo,name:p.name||null}))};
    const r=await sb.from('team_apps').update(o).eq('id',a.id);sb2(false);if(r.error)return note('Ошибка: '+r.error.message,1);note('Изменения сохранены');se(false);load()};
  const approve=async()=>{if(wc&&!confirm('В заявке есть замечания к данным ('+wc+'). Всё равно одобрить?'))return;if(!confirm('Одобрить заявку и создать команду «'+a.name+'» с профилями игроков?'))return;
    sb2(true);const r=await sb.rpc('approve_team_app',{p_id:a.id});sb2(false);if(r.error)return note('Ошибка: '+r.error.message,1);await reload();note('Команда создана и добавлена на сайт (id '+r.data+')');load()};
  const reject=async()=>{if(why.trim().length<3)return note('Укажите причину отклонения',1);sb2(true);const r=await sb.rpc('reject_team_app',{p_id:a.id,p_reason:why});sb2(false);if(r.error)return note('Ошибка: '+r.error.message,1);note('Заявка отклонена');sr(false);load()};
  const P=x.players||[];
  const I=(k,l,ty='text',w)=>html`<label class=${w||''}>${l}<input type=${ty} value=${x[k]==null?'':x[k]} disabled=${!ed} onInput=${e=>set(k,e.target.value)}/></label>`;
  return html`<div class="ad-app"><div class="tools"><button class="b g" onClick=${back}>← К списку</button><h1>Заявка №${a.id}: ${a.name}</h1><${Status} s=${a.status}/></div>
<p class="hint">Подал: <b>${nick||a.uid}</b> · ${fmt(a.created_at)}${a.reviewed_at&&html` · обработана ${fmt(a.reviewed_at)}`}${a.team_id&&html` · <a href=${'#/team/'+a.team_id}>профиль команды →</a>`}</p>
${a.status==='rejected'&&a.reason&&html`<div class="warn">Причина отклонения: ${a.reason}</div>`}
${wc>0&&html`<div class="warn">Замечания к данным (${wc}): ${Object.entries(warn).slice(0,6).map(([k,m])=>k+' — '+m).join('; ')}${wc>6?'…':''}</div>`}
<div class="ad-top"><div class="ad-logo">${x.logo?html`<img src=${x.logo} alt="logo"/>`:html`<span class="mu">нет логотипа</span>`}<${ImgLinks} url=${x.logo} name=${a.tag+'-logo'}/>${ed&&html`<label class="b g">Заменить<input type="file" accept="image/*" hidden onChange=${e=>up('logo',e.target.files[0])}/></label>`}</div>
<div class="fm">${I('name','Название')}${I('tag','Сокращение')}${I('cc','Страна (код)')}${I('coach','Тренер')}${I('elo','AVG ELO','number')}${I('col','Основной цвет')}${I('col2','Доп. цвет')}<label class="wide">Описание<textarea rows="3" disabled=${!ed} value=${x.about||''} onInput=${e=>set('about',e.target.value)}></textarea></label></div></div>
<h3 class="ad-h">Игроки (${P.filter(p=>!p.sub).length} основа, ${P.filter(p=>p.sub).length} запас)</h3>
<table class="ad-pl"><thead><tr><th>Фото</th><th>Ник</th><th>Роль</th><th>Страна</th><th>Имя</th><th>Возраст</th><th>ELO</th><th>Состав</th></tr></thead><tbody>${P.map((p,i)=>html`<tr key=${i}><td class="ad-ph">${p.photo?html`<img src=${p.photo} alt=""/>`:'—'}<${ImgLinks} url=${p.photo} name=${p.nick+'-photo'}/>${ed&&html`<label class="b g">Заменить<input type="file" accept="image/*" hidden onChange=${e=>up('photo',e.target.files[0],i)}/></label>`}</td>
<td><input disabled=${!ed} value=${p.nick||''} onInput=${e=>setP(i,'nick',e.target.value)}/></td><td><select disabled=${!ed} value=${p.role||''} onChange=${e=>setP(i,'role',e.target.value)}>${[...new Set([p.role,...ROLES])].filter(Boolean).map(r=>html`<option key=${r}>${r}</option>`)}</select></td><td><input class="sm" disabled=${!ed} value=${p.cc||''} onInput=${e=>setP(i,'cc',e.target.value.toUpperCase())}/></td><td><input disabled=${!ed} value=${p.name||''} onInput=${e=>setP(i,'name',e.target.value)}/></td><td><input class="sm" type="number" disabled=${!ed} value=${p.age==null?'':p.age} onInput=${e=>setP(i,'age',e.target.value)}/></td><td><input class="sm" type="number" disabled=${!ed} value=${p.elo==null?'':p.elo} onInput=${e=>setP(i,'elo',e.target.value)}/></td><td>${p.sub?'Запасной':'Основа'}</td></tr>`)}</tbody></table>
${pend&&html`<div class="sv">${!ed?html`<button class="b g" onClick=${()=>se(true)}>Редактировать данные</button>`:html`<button class="b" disabled=${busy} onClick=${save}>Сохранить изменения</button><button class="b g" onClick=${()=>{sx(a);se(false)}}>Отмена</button>`}
${!ed&&html`<button class="b ad-ok" disabled=${busy} onClick=${approve}>Одобрить и создать команду</button><button class="b d" disabled=${busy} onClick=${()=>sr(!rej)}>Отклонить…</button>`}</div>
${rej&&html`<div class="ad-rej"><label>Причина отклонения (увидит заявитель)<textarea rows="2" value=${why} onInput=${e=>sw(e.target.value)} placeholder="Например: логотип содержит запрещённый контент"></textarea></label><button class="b d" disabled=${busy} onClick=${reject}>Отклонить заявку</button></div>`}`}</div>`};

/* ---------- заявки на турниры ---------- */
export const TourRegs=({D,reload,note})=>{
  const [s,load]=useRows('tour_regs'),[f,sf]=useState('pending'),[tr,st]=useState(''),[bz,sb2]=useState(0),[rej,sr]=useState(null),[why,sw]=useState('');
  if(s.rows===null)return html`<div><h1>Заявки на турниры</h1><p class="hint">Загрузка…</p></div>`;
  if(s.err)return html`<div><h1>Заявки на турниры</h1><div class="warn">${s.err}</div></div>`;
  const T=id=>D.teams.find(x=>x.id===id),O=id=>D.tournaments.find(x=>x.id===id);
  const list=s.rows.filter(r=>(f==='all'||r.status===f)&&(!tr||String(r.tour)===tr));
  const ok=async r=>{sb2(r.id);const e=await sb.rpc('review_tour_reg',{p_id:r.id,p_ok:true,p_reason:null});sb2(0);if(e.error)return note('Ошибка: '+e.error.message,1);await reload();note('Заявка одобрена, команда добавлена в участники турнира');load()};
  const no=async r=>{if(why.trim().length<3)return note('Укажите причину отклонения',1);sb2(r.id);const e=await sb.rpc('review_tour_reg',{p_id:r.id,p_ok:false,p_reason:why});sb2(0);if(e.error)return note('Ошибка: '+e.error.message,1);note('Заявка отклонена');sr(null);sw('');load()};
  const del=async r=>{if(!confirm('Удалить заявку из списка?'))return;const e=await sb.from('tour_regs').delete().eq('id',r.id);if(e.error)return note('Ошибка: '+e.error.message,1);load()};
  return html`<div><h1>Заявки на турниры</h1><p class="hint">Команды, подавшие заявку на участие со страницы турнира. После одобрения команда автоматически появляется в «Участниках турнира» (там же задаются посев и группа).</p>
<${Filter} cur=${f} on=${sf} rows=${s.rows}/><div class="tools"><select value=${tr} onChange=${e=>st(e.target.value)}><option value="">Все турниры</option>${D.tournaments.map(o=>html`<option key=${o.id} value=${o.id}>${o.n}</option>`)}</select><button class="b g" onClick=${load}>Обновить</button></div>
<table><thead><tr><th>№</th><th>Дата</th><th>Турнир</th><th>Команда</th><th>Подал</th><th>Статус</th><th></th></tr></thead><tbody>${list.map(r=>{const t=T(r.team),o=O(r.tour);return html`<tr key=${r.id}><td>${r.id}</td><td>${fmt(r.created_at)}</td><td>${o?o.n:'#'+r.tour}</td><td>${t&&t.logo&&html`<img src=${t.logo} alt=""/>`} <b>${t?t.name:'#'+r.team}</b></td><td>${s.nick[r.uid]||'—'}</td><td><${Status} s=${r.status}/>${r.reason&&html`<small class="hint"> ${r.reason}</small>`}</td>
<td class="act">${r.status==='pending'?(rej===r.id?html`<span class="ad-inl"><input placeholder="Причина" value=${why} onInput=${e=>sw(e.target.value)}/><button class="b d" disabled=${bz===r.id} onClick=${()=>no(r)}>Отклонить</button><button class="b g" onClick=${()=>sr(null)}>×</button></span>`:html`<button class="b ad-ok" disabled=${bz===r.id} onClick=${()=>ok(r)}>Одобрить</button><button class="b d" onClick=${()=>{sr(r.id);sw('')}}>Отклонить…</button>`):html`<button class="b g" onClick=${()=>del(r)}>Удалить</button>`}</td></tr>`})}</tbody></table>${!list.length&&html`<p class="hint">Заявок нет.</p>`}</div>`};

/* ---------- карты для сравнения команд (единый список) ---------- */
export const MapCmp=({D,reload,note})=>{
  const [bz,sbz]=useState(false),[nn,sn]=useState('');
  const rows=cmpMaps(D.maps.map(m=>({id:m.id,name:m.name,img:m.img,col:m.col,active:m.active!==0&&m.active!=='0',cmp:m.cmp!==0&&m.cmp!=='0',ord:+m.ord||0})),true);
  const noCol=D.maps.length&&D.maps.every(m=>!('cmp' in m)&&!('ord' in m));
  const run=async fn=>{sbz(true);try{await fn();await reload()}catch(e){note('Ошибка: '+e.message+(/column/i.test(e.message)?' — выполните обновлённый supabase/schema.sql':''),1)}sbz(false)};
  const upd=(id,p)=>run(async()=>{const r=await sb.from('maps').update(p).eq('id',id);if(r.error)throw r.error});
  const move=(i,d)=>{const j=i+d;if(j<0||j>=rows.length)return;const a=rows.slice();[a[i],a[j]]=[a[j],a[i]];run(async()=>{for(let k=0;k<a.length;k++){const r=await sb.from('maps').update({ord:k+1}).eq('id',a[k].id);if(r.error)throw r.error}})};
  const add=()=>{const n=nn.trim();if(!/^[A-Za-z0-9 _-]{2,24}$/.test(n))return note('Название карты: латиница, цифры, пробел (2–24)',1);if(rows.some(m=>mapKey(m.name)===mapKey(n)))return note('Такая карта уже есть',1);run(async()=>{const r=await sb.from('maps').insert({name:n,active:1,cmp:1,ord:rows.length+1});if(r.error)throw r.error;sn('');note('Карта добавлена')})};
  const del=m=>{if(!confirm('Удалить карту «'+m.name+'» из общего списка? Прошлые матчи не изменятся.'))return;run(async()=>{const r=await sb.from('maps').delete().eq('id',m.id);if(r.error)throw r.error})};
  const shown=rows.filter(m=>m.cmp&&m.active);
  return html`<div><h1>Карты для сравнения</h1><p class="hint">Единый список карт. Включённые карты («В сравнении») показываются в блоке «Map stats» на странице любого матча в том порядке, который задан здесь. Изменения применяются сразу ко всем матчам, настраивать каждый матч не нужно. Картинки карт — во вкладке «Карты (картинки)».</p>
${noCol&&html`<div class="warn">В базе нет колонок cmp/ord. Выполните обновлённый supabase/schema.sql (SQL Editor), затем обновите страницу.</div>`}
<table class="ad-maps"><thead><tr><th>Порядок</th><th>Карта</th><th>В мап-пуле</th><th>В сравнении</th><th></th></tr></thead><tbody>${rows.map((m,i)=>html`<tr key=${m.id} class=${m.cmp&&m.active?'':'off'}><td class="act"><button class="b g" disabled=${bz||i===0} onClick=${()=>move(i,-1)} title="Выше">↑</button><button class="b g" disabled=${bz||i===rows.length-1} onClick=${()=>move(i,1)} title="Ниже">↓</button> <span class="mu">${i+1}</span></td>
<td><input defaultValue=${m.name} onBlur=${e=>{const v=e.target.value.trim();if(v&&v!==m.name)upd(m.id,{name:v})}}/></td>
<td><label class="ad-sw"><input type="checkbox" checked=${m.active} disabled=${bz} onChange=${e=>upd(m.id,{active:e.target.checked?1:0})}/><i></i></label></td>
<td><label class="ad-sw"><input type="checkbox" checked=${m.cmp} disabled=${bz} onChange=${e=>upd(m.id,{cmp:e.target.checked?1:0})}/><i></i></label></td>
<td class="act"><button class="b d" disabled=${bz} onClick=${()=>del(m)}>Удалить</button></td></tr>`)}</tbody></table>
<div class="tools"><input placeholder="Новая карта (например Dust2)" value=${nn} onInput=${e=>sn(e.target.value)} onKeyDown=${e=>{if(e.key==='Enter')add()}}/><button class="b" disabled=${bz} onClick=${add}>+ Добавить в общий список</button></div>
<p class="hint">Сейчас на страницах матчей показываются (${shown.length}): ${shown.map(m=>m.name).join(' → ')||'—'}</p></div>`};
