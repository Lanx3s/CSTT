/* Регистрация команды на сайте: форма заявки -> база (RPC submit_team_app) -> раздел «Заявки команд» в админке */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth} from '../lib/auth.js';
import {Box,Flag,TeamLogo} from '../components/common.js';
import {Field,ImgPick,srvErr} from '../components/Forms.js';
import {V,ROLES,LIM,emptyApp,emptyPlayer,validateApp,toPayload} from '../lib/validate.js';
import {COUNTRIES} from '../lib/countries.js';

const ST={pending:['На рассмотрении','pd'],approved:['Одобрена','ok'],rejected:['Отклонена','no']};
const newKey=()=>(self.crypto&&crypto.randomUUID?crypto.randomUUID():'k'+Date.now()+Math.random().toString(36).slice(2));

export const Status=({s})=>{const x=ST[s]||ST.pending;return html`<span class=${'ap-st '+x[1]}>${x[0]}</span>`};

/* код страны: две буквы, подсказки и флаг */
const Cc=({v,set,err,onBlur,l='Код страны',hint='Пусто — будет EU'})=>html`<${Field} l=${l} err=${err} hint=${hint}><span class="ap-cc"><input list="ap-cc" maxLength="2" placeholder="EU" value=${v} onInput=${e=>set(e.target.value.replace(/[^A-Za-z]/g,'').toUpperCase())} onBlur=${onBlur}/><${Flag} cc=${(v||'EU')}/></span><//>`;

export const TeamApply=()=>{
  const au=useAuth(),[a,sa]=useState(emptyApp),[sub,ss]=useState(false),[touched,st]=useState({}),[pend,sp]=useState(0),[bz,sb2]=useState(false),[done,sd]=useState(null),[err,se]=useState(''),[mine,sm]=useState([]),lock=useRef(false),key=useRef(newKey()),top=useRef();
  const E=validateApp(a),show=k=>(sub||touched[k])&&E[k]?E[k]:'';
  const tc=k=>()=>st(x=>({...x,[k]:1})),setF=(k,v)=>sa(x=>({...x,[k]:v})),setP=(i,k,v)=>sa(x=>({...x,players:x.players.map((p,j)=>j===i?{...p,[k]:v}:p)}));
  const busy=v=>sp(n=>Math.max(0,n+(v?1:-1)));
  const loadMine=()=>{if(!sb||!au.user)return;sb.from('team_apps').select('id,name,tag,status,reason,created_at,logo').eq('uid',au.user.id).order('id',{ascending:false}).then(r=>{if(!r.error)sm(r.data||[])})};
  useEffect(loadMine,[au.user&&au.user.id,done]);
  const mainsN=a.players.filter(p=>!p.sub).length,subs=a.players.map((p,i)=>[p,i]).filter(([p])=>p.sub);
  const avg=()=>{const v=a.players.filter(p=>!p.sub&&p.elo).map(p=>+p.elo);if(v.length)setF('elo',String(Math.round(v.reduce((s,x)=>s+x,0)/v.length)))};
  const addSub=()=>sa(x=>x.players.filter(p=>p.sub).length>=LIM.subs?x:{...x,players:[...x.players,emptyPlayer(true)]});
  const delSub=i=>sa(x=>({...x,players:x.players.filter((_,j)=>j!==i)}));
  const send=async()=>{
    if(lock.current)return;ss(true);se('');
    if(pend>0)return se('Подождите, пока загрузятся картинки');
    const e=validateApp(a);if(Object.keys(e).length){se('Исправьте отмеченные поля ('+Object.keys(e).length+')');setTimeout(()=>{const el=document.querySelector('.ap .bad');el&&el.scrollIntoView({behavior:'smooth',block:'center'})},30);return}
    if(!ok1)return se('Поставьте галочки подтверждения внизу формы');
    lock.current=true;sb2(true);
    const r=await sb.rpc('submit_team_app',{p:toPayload(a,key.current)});
    sb2(false);
    if(r.error){lock.current=false;return se(srvErr(r.error)||'Не удалось отправить заявку')}
    sd(r.data&&r.data.id||true);top.current&&top.current.scrollIntoView({behavior:'smooth'})};
  const [ok1,s1]=useState(false),[ok2,s2]=useState(false);
  const reset=()=>{sa(emptyApp());ss(false);st({});sd(null);se('');lock.current=false;s1(false);s2(false);key.current=newKey()};

  if(!sb)return html`<div class="ap"><${Box} h="Регистрация команды"><div class="in"><p>Подача заявок работает после подключения Supabase (см. README). Сейчас сайт показывает демо-данные.</p></div><//></div>`;
  if(!au.ready)return html`<div class="ap"><${Box}><div class="in mu">Загрузка…</div><//></div>`;
  if(!au.user)return html`<div class="ap"><${Box} h="Регистрация команды"><div class="in ap-login"><p>Чтобы подать заявку, войдите в аккаунт или зарегистрируйтесь на сайте.</p><a class="btn" href="#/login">Войти / Регистрация</a></div><//></div>`;
  if(done)return html`<div class="ap" ref=${top}><${Box} h="Заявка отправлена"><div class="in ap-ok"><i>✓</i><h2>Заявка ${typeof done==='number'?'№'+done+' ':''}отправлена</h2><p>Статус: <${Status} s="pending"/> Администратор проверит данные и логотип. Результат появится ниже в списке «Мои заявки».</p><div class="ap-act"><a class="btn" href="#/">На главную</a><button class="btn gh" onClick=${reset}>Подать ещё одну</button></div></div><//>
${mine.length>0&&html`<${Mine} list=${mine}/>`}</div>`;

  return html`<div class="ap" ref=${top}>
<div class="crumb"><a href="#/teams">Команды</a><i>›</i><span>Регистрация команды</span></div>
<div class="ap-hd"><h1>Регистрация команды</h1><p class="mu">Заполните анкету. Заявка попадёт к администраторам со статусом «На рассмотрении»; после одобрения профиль команды и игроков появится на сайте. Поля со звёздочкой обязательны.</p></div>
<datalist id="ap-cc">${COUNTRIES.map(([c,n])=>html`<option key=${c} value=${c}>${n}</option>`)}</datalist>
<${Box} h="Информация о команде"><div class="ap-g">
<${Field} l="Полное название" req err=${show('name')} hint="Латиница, цифры и пробелы"><input maxLength="32" value=${a.name} onInput=${e=>setF('name',e.target.value)} onBlur=${tc('name')} placeholder="Team Spirit"/><//>
<${Field} l="Сокращение" req err=${show('tag')} hint="Строго 2–4 символа"><input maxLength="4" value=${a.tag} onInput=${e=>setF('tag',e.target.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase())} onBlur=${tc('tag')} placeholder="TS"/><//>
<${Cc} v=${a.cc} set=${v=>setF('cc',v)} err=${show('cc')} onBlur=${tc('cc')}/>
<${Field} l="Тренер" err=${show('coach')} hint="Формат: Имя «Ник» Фамилия"><input maxLength="60" value=${a.coach} onInput=${e=>setF('coach',e.target.value)} onBlur=${tc('coach')} placeholder="Ivan «Coach» Petrov"/><//>
<${Field} l="AVG ELO основного состава" req=${!(mainsN===5&&a.players.every(p=>p.sub||p.elo))} err=${show('elo')} hint="Среднее FACEIT ELO пятёрки"><input inputMode="numeric" maxLength="4" value=${a.elo} onInput=${e=>setF('elo',e.target.value.replace(/\D/g,''))} onBlur=${tc('elo')} placeholder="2500"/><button type="button" class="ap-lk ap-calc" onClick=${avg}>Посчитать по ELO игроков</button><//>
<div class="ap-cols"><${Field} l="Основной цвет" err=${show('col')} hint="Необязательно"><span class="ap-col"><input type="color" value=${a.col||'#d4141c'} onInput=${e=>setF('col',e.target.value)}/><code>${a.col||'не задан'}</code>${a.col&&html`<button type="button" class="ap-lk d" onClick=${()=>setF('col','')}>сбросить</button>`}</span><//>
<${Field} l="Дополнительный цвет" err=${show('col2')} hint="Необязательно"><span class="ap-col"><input type="color" value=${a.col2||'#ffffff'} onInput=${e=>setF('col2',e.target.value)}/><code>${a.col2||'не задан'}</code>${a.col2&&html`<button type="button" class="ap-lk d" onClick=${()=>setF('col2','')}>сбросить</button>`}</span><//></div>
<div class="ap-logo"><${ImgPick} label="Логотип команды" req value=${a.logo} onChange=${v=>setF('logo',v)} onBusy=${busy} err=${show('logo')} name=${(a.tag||'team')+'-logo'} mb=${LIM.logoMB} hint=${'Квадратный, от '+LIM.minPx+'×'+LIM.minPx+' px. Загружается без потери качества. Без политики, религии, 18+ и оскорблений.'}/></div>
<${Field} l=${'Описание команды'} err=${show('about')} cls="wide" hint=${a.about.length+' / '+LIM.about+' · без контактов, ссылок и личных данных'}><textarea rows="4" maxLength=${LIM.about} value=${a.about} onInput=${e=>setF('about',e.target.value)} onBlur=${tc('about')}></textarea><//>
</div><//>
<${Box} h=${'Основной состав · '+mainsN+' из 5'}><div class="ap-pl">${a.players.map((p,i)=>!p.sub&&html`<${PRow} key=${i} i=${i} p=${p} setP=${setP} show=${show} tc=${tc} busy=${busy} n=${i+1}/>`)}</div><//>
<${Box} h=${'Запасные игроки · '+subs.length+' из '+LIM.subs} right=${subs.length<LIM.subs&&html`<button type="button" class="b g ap-add" onClick=${addSub}>+ Добавить запасного</button>`}>${subs.length?html`<div class="ap-pl">${subs.map(([p,i],n)=>html`<${PRow} key=${i} i=${i} p=${p} setP=${setP} show=${show} tc=${tc} busy=${busy} n=${'З'+(n+1)} del=${()=>delSub(i)}/>`)}</div>`:html`<div class="in mu">Необязательно. Можно добавить до ${LIM.subs} запасных — поля те же, что у основного состава.</div>`}<//>
<${Box} h="Подтверждение"><div class="in ap-ck">
<label><input type="checkbox" checked=${ok1} onChange=${e=>s1(e.target.checked)}/> Логотип и фотографии не содержат политического, религиозного, расистского, порнографического и иного запрещённого контента.</label>
<label><input type="checkbox" checked=${ok2} onChange=${e=>s2(e.target.checked)}/> В анкете нет личной информации игроков, кроме имени, фамилии и возраста. Я согласен(на) на проверку заявки администратором.</label>
${err&&html`<div class="ap-fail" role="alert">${err}</div>`}
<div class="ap-act"><button type="button" class="btn" disabled=${bz||pend>0} onClick=${send}>${bz?'Отправка…':pend>0?'Загрузка картинок…':'Отправить заявку'}</button><a class="btn gh" href="#/">Отмена</a></div></div><//>
${mine.length>0&&html`<${Mine} list=${mine}/>`}</div>`};

const PRow=({i,p,setP,show,tc,busy,n,del})=>{const k='p'+i+'.';
  return html`<div class="ap-p"><div class="ap-pn"><b>${n}</b>${del&&html`<button type="button" class="ap-lk d" onClick=${del}>Удалить</button>`}</div>
<${ImgPick} compact round label="Фото" req value=${p.photo} onChange=${v=>setP(i,'photo',v)} onBusy=${busy} err=${show(k+'photo')} name=${(p.nick||'player')+'-photo'}/>
<div class="ap-pf">
<${Field} l="Никнейм" req err=${show(k+'nick')} hint="Латиница, цифры, _"><input maxLength="20" value=${p.nick} onInput=${e=>setP(i,'nick',e.target.value.replace(/[^A-Za-z0-9_]/g,''))} onBlur=${tc(k+'nick')} placeholder="nickname"/><//>
<${Field} l="Игровая роль" req err=${show(k+'role')}><select value=${p.role} onChange=${e=>setP(i,'role',e.target.value)} onBlur=${tc(k+'role')}><option value="">—</option>${ROLES.map(r=>html`<option key=${r} value=${r}>${r}</option>`)}</select><//>
<${Cc} v=${p.cc} set=${v=>setP(i,'cc',v)} err=${show(k+'cc')} onBlur=${tc(k+'cc')} hint=""/>
<${Field} l="Имя и фамилия" err=${show(k+'name')}><input maxLength="39" value=${p.name} onInput=${e=>setP(i,'name',e.target.value)} onBlur=${tc(k+'name')} placeholder="Необязательно"/><//>
<${Field} l="Возраст" err=${show(k+'age')}><input inputMode="numeric" maxLength="2" value=${p.age} onInput=${e=>setP(i,'age',e.target.value.replace(/\D/g,''))} onBlur=${tc(k+'age')} placeholder="Необязательно"/><//>
<${Field} l="FACEIT ELO" err=${show(k+'elo')}><input inputMode="numeric" maxLength="4" value=${p.elo} onInput=${e=>setP(i,'elo',e.target.value.replace(/\D/g,''))} onBlur=${tc(k+'elo')} placeholder="Необязательно"/><//>
</div></div>`};

const Mine=({list})=>html`<${Box} h="Мои заявки"><div class="ap-mine">${list.map(x=>html`<div class="ap-m" key=${x.id}><${TeamLogo} x=${{logo:x.logo,tag:x.tag,col:'#445066'}} s=${34}/><div><b>${x.name}</b> <span class="mu">[${x.tag}]</span><small class="mu">№${x.id} · ${(x.created_at||'').slice(0,10)}</small>${x.status==='rejected'&&x.reason&&html`<p class="ap-rs">Причина: ${x.reason}</p>`}</div><${Status} s=${x.status}/></div>`)}</div><//>`;
