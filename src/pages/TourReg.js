/* Регистрация команды на турнир: выбор команды из списка, две обязательные галочки, заявка -> админка (RPC submit_tour_reg) */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth} from '../lib/auth.js';
import {TEAMS,tour} from '../lib/data.js';
import {Box,Empty,TeamLogo,TourLogo} from '../components/common.js';
import {Field,srvErr} from '../components/Forms.js';
import {Status} from './TeamApply.js';

export const TourReg=({id})=>{
  const o=tour(id),au=useAuth(),[team,st]=useState(''),[r1,s1]=useState(false),[r2,s2]=useState(false),[bz,sb2]=useState(false),[err,se]=useState(''),[done,sd]=useState(false),[mine,sm]=useState([]),lock=useRef(false);
  const loadMine=()=>{if(!sb||!au.user||!o)return;sb.from('tour_regs').select('id,team,status,reason,created_at').eq('uid',au.user.id).eq('tour',o.id).order('id',{ascending:false}).then(r=>{if(!r.error)sm(r.data||[])})};
  useEffect(loadMine,[au.user&&au.user.id,done,o&&o.id]);
  if(!o)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const closed=o.s==='fin'||o.reg===0,teams=[...TEAMS].sort((a,b)=>a.name.localeCompare(b.name));
  const taken=new Set(mine.filter(x=>x.status!=='rejected').map(x=>x.team));
  const ready=team&&r1&&r2&&!taken.has(+team);
  const send=async()=>{
    if(lock.current)return;se('');
    if(!team)return se('Выберите команду из списка');
    if(taken.has(+team))return se('Эта команда уже подала заявку на этот турнир');
    if(!r1||!r2)return se('Поставьте обе галочки: регламент и правила проведения');
    lock.current=true;sb2(true);
    const r=await sb.rpc('submit_tour_reg',{p_tour:o.id,p_team:+team,p_rules:r1,p_terms:r2});
    sb2(false);if(r.error){lock.current=false;return se(srvErr(r.error)||'Не удалось отправить заявку')}
    sd(true)};
  const head=html`<div class="crumb"><a href="#/tournaments">Турниры</a><i>›</i><a href=${'#/tournament/'+o.id}>${o.n}</a><i>›</i><span>Регистрация</span></div>
<div class="ap-hd ap-th"><${TourLogo} o=${o} s=${56}/><div><h1>Регистрация на турнир</h1><p class="mu">${o.n}${o.d?' · '+o.d:''}</p></div></div>`;
  if(!sb)return html`<div class="ap">${head}<${Box}><div class="in"><p>Регистрация работает после подключения Supabase (см. README). Сейчас сайт показывает демо-данные.</p></div><//></div>`;
  if(!au.ready)return html`<div class="ap">${head}<${Box}><div class="in mu">Загрузка…</div><//></div>`;
  if(closed)return html`<div class="ap">${head}<${Box}><div class="in"><p>Регистрация на этот турнир закрыта.</p><a class="btn gh" href=${'#/tournament/'+o.id}>К турниру</a></div><//></div>`;
  if(!au.user)return html`<div class="ap">${head}<${Box}><div class="in ap-login"><p>Чтобы подать заявку, войдите в аккаунт или зарегистрируйтесь на сайте.</p><a class="btn" href="#/login">Войти / Регистрация</a></div><//></div>`;
  if(done)return html`<div class="ap">${head}<${Box} h="Заявка отправлена"><div class="in ap-ok"><i>✓</i><h2>Заявка отправлена</h2><p>Статус: <${Status} s="pending"/> Администратор рассмотрит заявку и добавит команду в участники турнира.</p><div class="ap-act"><a class="btn" href=${'#/tournament/'+o.id}>К турниру</a></div></div><//></div>`;
  const T=x=>TEAMS.find(t=>t.id===x);
  return html`<div class="ap">${head}
<${Box} h="Заявка команды"><div class="in ap-tr">
<${Field} l="Команда" req hint="Только команды, уже зарегистрированные на сайте. Нет вашей команды? Сначала подайте заявку на создание профиля.">
<select value=${team} onChange=${e=>st(e.target.value)}><option value="">— выберите команду —</option>${teams.map(x=>html`<option key=${x.id} value=${x.id} disabled=${taken.has(x.id)}>${x.name} [${x.tag}]${taken.has(x.id)?' — заявка уже подана':''}</option>`)}</select><//>
${team&&T(+team)&&html`<div class="ap-pick"><${TeamLogo} x=${T(+team)} s=${40}/><b>${T(+team).name}</b></div>`}
<div class="ap-fee"><b>Вступительный взнос</b><p>По вопросам вступительного взноса обращайтесь в Discord.</p></div>
<label class="ap-cb"><input type="checkbox" checked=${r1} onChange=${e=>s1(e.target.checked)}/> Я прочитал регламент турнира${o.rules?html` (<a href=${'#/tournament/'+o.id+'/rules'} target="_blank" rel="noopener">открыть</a>)`:''}</label>
<label class="ap-cb"><input type="checkbox" checked=${r2} onChange=${e=>s2(e.target.checked)}/> Я ознакомился с правилами проведения турнира</label>
${err&&html`<div class="ap-fail" role="alert">${err}</div>`}
<div class="ap-act"><button type="button" class="btn" disabled=${bz||!ready} onClick=${send}>${bz?'Отправка…':'Отправить заявку'}</button><a class="btn gh" href=${'#/tournament/'+o.id}>Отмена</a></div>
</div><//>
${mine.length>0&&html`<${Box} h="Мои заявки на этот турнир"><div class="ap-mine">${mine.map(x=>{const t=T(x.team);return html`<div class="ap-m" key=${x.id}>${t&&html`<${TeamLogo} x=${t} s=${30}/>`}<div><b>${t?t.name:'#'+x.team}</b><small class="mu">${(x.created_at||'').slice(0,10)}</small>${x.status==='rejected'&&x.reason&&html`<p class="ap-rs">Причина: ${x.reason}</p>`}</div><${Status} s=${x.status}/></div>`})}</div><//>`}</div>`};
