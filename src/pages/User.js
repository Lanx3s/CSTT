/* Профиль аккаунта (свой — с редактированием), публичные профили и поиск пользователей */
import {useState,useEffect} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth,refreshAuth,uploadImage} from '../lib/auth.js';
import {lang,t} from '../lib/i18n.js';
import {TEAMS,team} from '../lib/data.js';
import {COUNTRIES} from '../lib/countries.js';
import {findUser,searchUsers} from '../lib/users.js';
import {Box,Empty,Flag,TeamLogo} from '../components/common.js';

const ruL=()=>lang==='ru';
const dt=s=>{try{return new Date(s).toLocaleDateString(ruL()?'ru-RU':'en-GB',{day:'2-digit',month:'long',year:'numeric'})}catch(e){return ''}};
export const UAva=({u,s=96})=>u.avatar?html`<img class="ua" style=${{width:s,height:s}} src=${u.avatar} alt=""/>`:html`<span class="ua ph" style=${{width:s,height:s,fontSize:s*.42}}>${(u.nick||'?')[0].toUpperCase()}</span>`;

/* общая карточка профиля */
const Card=({u,own,au})=>{
  const ru=ruL(),[st,ss]=useState({t:0,p:0,l:[]}),ft=u.fav_team!=null?team(u.fav_team):null;
  useEffect(()=>{if(!sb)return;let ok=1;(async()=>{
    const a=await sb.from('forum_topics').select('id',{count:'exact',head:true}).eq('uid',u.id),b=await sb.from('forum_posts').select('id',{count:'exact',head:true}).eq('uid',u.id),c=await sb.from('forum_topics').select('id,title,created_at,replies').eq('uid',u.id).order('created_at',{ascending:false}).limit(6);
    if(ok)ss({t:a.count||0,p:b.count||0,l:c.data||[]})})();return()=>{ok=0}},[u.id]);
  return html`<div class="ucard"><div class="uc-top"><${UAva} u=${u} s=${112}/><div class="uc-i"><h1>${u.nick}${au&&au.admin&&own&&html`<span class="uadm">ADMIN</span>`}</h1>
<div class="uc-m"><span class="uid" title=${ru?'Публичный ID — по нему можно найти профиль':'Public ID'}>ID ${u.pid||'—'}</span>${u.cc&&html`<span class="ucc"><${Flag} cc=${u.cc}/> ${u.cc}</span>`}${u.created_at&&html`<span class="mu">${ru?'На сайте с ':'Joined '}${dt(u.created_at)}</span>`}</div>
${u.bio&&html`<p class="ubio">${u.bio}</p>`}
${ft&&!ft.tbd&&html`<a class="ufav" href=${'#/team/'+ft.id}><${TeamLogo} x=${ft} s=${22}/><span><small>${ru?'Любимая команда':'Favourite team'}</small><b>${ft.name}</b></span></a>`}</div></div>
<div class="ust"><div><b>${st.t}</b><span>${ru?'Тем':'Topics'}</span></div><div><b>${st.p}</b><span>${ru?'Ответов':'Replies'}</span></div><div><b>${u.pid||'—'}</b><span>ID</span></div></div>
${st.l.length>0&&html`<div class="usub"><h4>${ru?'Темы на форуме':'Forum topics'}</h4>${st.l.map(x=>html`<a class="nmini" key=${x.id} href=${'#/forum/'+x.id}><span>${x.title}</span><small>${x.replies||0} ${ru?'отв.':'repl.'}</small></a>`)}</div>`}</div>`};

/* редактирование своего профиля */
const Edit=({au})=>{
  const ru=ruL(),pr=au.profile||{},[f,sf]=useState({nick:pr.nick||'',bio:pr.bio||'',cc:pr.cc||'',fav:pr.fav_team==null?'':String(pr.fav_team)}),[msg,sg]=useState(null),[bz,sz]=useState(false),[pw,sp]=useState('');
  const ok=s=>sg({s}),bad=s=>sg({e:1,s});
  const save=async patch=>{
    sz(true);sg(null);
    try{const {error}=await sb.from('profiles').upsert({id:au.user.id,nick:pr.nick||'user',...patch});
      if(error){if(error.code==='23505'||/duplicate|unique/i.test(error.message))throw new Error(ru?'Этот ник уже занят':'This nickname is taken');
        if(/nick_len/.test(error.message))throw new Error(ru?'Ник: 3–24 символа':'Nickname: 3–24 chars');throw error}
      await refreshAuth();ok(ru?'Сохранено':'Saved')}
    catch(x){bad(x.message)}sz(false)};
  const saveAll=()=>{const n=f.nick.trim();
    if(!/^[\p{L}\p{N}_.\-]{3,24}$/u.test(n))return bad(ru?'Ник: 3–24 символа, буквы, цифры, _ . -':'Nickname: 3–24 chars, letters, digits, _ . -');
    save({nick:n,bio:f.bio.trim().slice(0,300)||null,cc:f.cc||null,fav_team:f.fav===''?null:+f.fav})};
  const av=async e=>{const x=e.target.files[0];e.target.value='';if(!x)return;if(!x.type.startsWith('image/')||x.size>3e6)return bad(ru?'Нужна картинка до 3 МБ':'Image up to 3 MB');sz(true);try{await uploadImage(x).then(u=>save({avatar:u}))}catch(x){bad(x.message);sz(false)}};
  const chPw=async()=>{if(pw.length<6)return bad(ru?'Пароль: минимум 6 символов':'Password: at least 6 characters');sz(true);const {error}=await sb.auth.updateUser({password:pw});sz(false);if(error)return bad(error.message);sp('');ok(ru?'Пароль изменён':'Password changed')};
  return html`<${Box} h=${ru?'Настройки профиля':'Profile settings'}><div class="in uedit">
<div class="ue-av"><${UAva} u=${pr} s=${84}/><div><label class="btn up-file">${ru?'Загрузить аватар':'Upload avatar'}<input type="file" accept="image/*" hidden disabled=${bz} onChange=${av}/></label>${pr.avatar&&html`<button class="lnk" disabled=${bz} onClick=${()=>save({avatar:null})}>${ru?'Убрать':'Remove'}</button>`}<small class="mu">${ru?'PNG/JPG до 3 МБ':'PNG/JPG up to 3 MB'}</small></div></div>
<label class="au-f"><span>${ru?'Ник':'Nickname'}</span><input maxLength="24" value=${f.nick} onInput=${e=>sf({...f,nick:e.target.value})}/><small>${ru?'Должен быть уникальным. Изменится и на форуме.':'Must be unique. Updates on the forum too.'}</small></label>
<label class="au-f"><span>${ru?'О себе':'About'}</span><textarea rows="3" maxLength="300" value=${f.bio} onInput=${e=>sf({...f,bio:e.target.value})}/></label>
<div class="ue-r"><label class="au-f"><span>${ru?'Страна':'Country'}</span><select value=${f.cc} onChange=${e=>sf({...f,cc:e.target.value})}><option value="">—</option>${COUNTRIES.map(c=>html`<option key=${c[0]} value=${c[0]}>${c[0]} · ${c[1]}</option>`)}</select></label>
<label class="au-f"><span>${ru?'Любимая команда':'Favourite team'}</span><select value=${f.fav} onChange=${e=>sf({...f,fav:e.target.value})}><option value="">—</option>${TEAMS.map(x=>html`<option key=${x.id} value=${x.id}>${x.name}</option>`)}</select></label></div>
<div class="ue-b"><button class="au-go sm" disabled=${bz} onClick=${saveAll}>${ru?'Сохранить':'Save'}</button></div>
<label class="au-f"><span>${ru?'Новый пароль':'New password'}</span><div class="au-pw"><input type="password" autocomplete="new-password" value=${pw} onInput=${e=>sp(e.target.value)}/><button type="button" class="btn" disabled=${bz||!pw} onClick=${chPw}>${ru?'Сменить':'Change'}</button></div></label>
${msg&&html`<div class=${'au-msg '+(msg.e?'bad':'ok')}>${msg.s}</div>`}
<p class="ue-o"><span class="mu">${au.user.email}</span>${au.admin&&html`<a class="btn" href="#/admin">${t('adminPanel')}</a>`}<button onClick=${async()=>{await sb.auth.signOut();location.hash='#/'}}>${t('logout')}</button></p></div><//>`};

const Finder=()=>{
  const ru=ruL(),[q,sq]=useState(''),[l,sl]=useState(null);
  useEffect(()=>{let ok=1;const h=setTimeout(async()=>{const r=await searchUsers(q);if(ok)sl(r)},q?250:0);return()=>{ok=0;clearTimeout(h)}},[q]);
  return html`<${Box} h=${ru?'Найти пользователя':'Find a user'}><div class="in"><input class="ufind" placeholder=${ru?'Ник или ID пользователя':'Nickname or user ID'} value=${q} onInput=${e=>sq(e.target.value)}/>
${!sb&&html`<div class="fmsg">${ru?'Демо-режим: поиск пользователей заработает после подключения Supabase.':'Demo mode: user search works once Supabase is connected.'}</div>`}
<div class="ulist">${(l||[]).map(u=>html`<a class="uli" key=${u.id} href=${'#/user/'+(u.pid||encodeURIComponent(u.nick))}><${UAva} u=${u} s=${40}/><span><b>${u.nick}</b><small>ID ${u.pid||'—'}</small></span></a>`)}</div>
${l&&!l.length&&sb&&html`<${Empty}/>`}${!q&&l&&l.length>0&&html`<p class="mu usm">${ru?'Последние зарегистрированные':'Recently registered'}</p>`}</div><//>`};

export const Users=()=>html`<div class="col ucol"><${Finder}/></div>`;

export const Profile=()=>{
  const au=useAuth(),ru=ruL();
  if(!au.ready)return html`<div class="bx in">…</div>`;
  if(!au.user)return html`<div class="auth2"><div class="au-card in1"><h2>${ru?'Нужно войти':'Sign in required'}</h2><a class="btn" href="#/login">${t('signin')}</a></div></div>`;
  const u={...(au.profile||{}),id:au.user.id};
  return html`<div class="col ucol"><${Card} u=${u} own=${1} au=${au}/><${Edit} au=${au} key=${au.user.id}/><${Finder}/></div>`};

export const User=({id})=>{
  const au=useAuth(),ru=ruL(),[u,su]=useState(null);
  useEffect(()=>{let ok=1;su(null);findUser(id).then(r=>{if(ok)su(r||false)});return()=>{ok=0}},[id]);
  if(!sb)return html`<div class="bx in">${ru?'Демо-режим: профили пользователей доступны после подключения Supabase.':'Demo mode.'}</div>`;
  if(u===null)return html`<div class="bx in mu">…</div>`;
  if(u===false)return html`<div class="col ucol"><div class="bx"><${Empty} text=${ru?'Пользователь не найден':'User not found'}/></div><${Finder}/></div>`;
  const own=au.user&&au.user.id===u.id;
  return html`<div class="col ucol"><${Card} u=${u} own=${own} au=${au}/>${own&&html`<a class="btn" href="#/profile">${ru?'Редактировать профиль':'Edit profile'}</a>`}<${Finder}/></div>`};
