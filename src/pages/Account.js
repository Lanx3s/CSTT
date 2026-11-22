import {useState} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth,refreshAuth,uploadImage} from '../lib/auth.js';
import {lang,t} from '../lib/i18n.js';
import {Box} from '../components/common.js';

export const Login=()=>{
  const au=useAuth(),ru=lang==='ru',[mode,sm]=useState('in'),[em,se]=useState(''),[pw,sp]=useState(''),[nk,sn]=useState(''),[msg,sg]=useState(''),[bz,sz]=useState(false);
  if(au.user)return html`<div class="bx in auth"><a class="btn" href="#/profile">${t('profile')}</a></div>`;
  const go=async()=>{
    sg('');if(!sb)return sg('Supabase не настроен');
    if(mode==='up'&&nk.trim().length<3)return sg(ru?'Ник: минимум 3 символа':'Nickname: at least 3 characters');
    if(pw.length<6)return sg(ru?'Пароль: минимум 6 символов':'Password: at least 6 characters');
    sz(true);
    const r=mode==='in'?await sb.auth.signInWithPassword({email:em,password:pw}):await sb.auth.signUp({email:em,password:pw,options:{data:{nick:nk.trim()}}});
    sz(false);
    if(r.error)return sg(r.error.message);
    if(mode==='up'&&!r.data.session)return sg(ru?'Готово! Подтвердите почту по ссылке из письма и войдите.':'Done! Confirm your email, then sign in.');
    await refreshAuth();location.hash='#/profile'};
  return html`<div class="auth"><${Box} h=${mode==='in'?t('signin'):t('register')}><div class="in"><div class="tabs"><button class=${mode==='in'?'on':''} onClick=${()=>sm('in')}>${t('signin')}</button><button class=${mode==='up'?'on':''} onClick=${()=>sm('up')}>${t('register')}</button></div>
<input type="email" placeholder="Email" value=${em} onChange=${e=>se(e.target.value)}/>${mode==='up'&&html`<input placeholder=${ru?'Ник на сайте':'Nickname'} value=${nk} onChange=${e=>sn(e.target.value)}/>`}<input type="password" placeholder=${ru?'Пароль':'Password'} value=${pw} onChange=${e=>sp(e.target.value)} onKeyDown=${e=>e.key==='Enter'&&go()}/>
<button class="on" disabled=${bz} onClick=${go}>${bz?'…':mode==='in'?t('signin'):t('register')}</button><p class="dn">${msg}</p></div><//></div>`};

export const Profile=()=>{
  const au=useAuth(),ru=lang==='ru',[nk,sn]=useState(null),[msg,sg]=useState(''),[bz,sz]=useState(false);
  if(!au.ready)return html`<div class="bx in">…</div>`;
  if(!au.user)return html`<div class="bx in"><a class="btn" href="#/login">${t('signin')}</a></div>`;
  const pr=au.profile||{},nick=nk??pr.nick??'';
  const save=async patch=>{sz(true);try{const {error}=await sb.from('profiles').upsert({id:au.user.id,nick:pr.nick||nick||'user',avatar:pr.avatar,...patch});if(error)throw error;await refreshAuth();sn(null);sg(ru?'Сохранено':'Saved')}catch(x){sg(x.message)}sz(false)};
  const av=async e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>3e6)return sg(ru?'Нужна картинка до 3 МБ':'Image up to 3 MB');sz(true);try{await save({avatar:await uploadImage(f)})}catch(x){sg(x.message);sz(false)}};
  return html`<${Box} h=${t('profile')}><div class="in prof">${pr.avatar?html`<img class="av" src=${pr.avatar} alt=""/>`:html`<span class="av">${(pr.nick||'?')[0].toUpperCase()}</span>`}
<div><p class="mu">${au.user.email}</p><label>${ru?'Ник':'Nickname'}<br/><input value=${nick} onChange=${e=>sn(e.target.value)}/></label> <button class="on" disabled=${bz||nick.trim().length<3} onClick=${()=>save({nick:nick.trim()})}>${ru?'Сохранить':'Save'}</button>
<p><label>${ru?'Сменить аватар':'Change avatar'}<br/><input type="file" accept="image/*" disabled=${bz} onChange=${av}/></label></p>
<p class="up">${msg}</p><p>${au.admin&&html`<a class="btn" href="#/admin">${t('adminPanel')}</a> `}<button onClick=${async()=>{await sb.auth.signOut();location.hash='#/'}}>${t('logout')}</button></p></div></div><//>`};
