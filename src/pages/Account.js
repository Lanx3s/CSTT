/* Вход и регистрация */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth,refreshAuth} from '../lib/auth.js';
import {lang,t} from '../lib/i18n.js';
import {SITE} from '../lib/data.js';
import LOGO from '../assets/logo.png';
export {Profile} from './User.js';

const NICK_RE=/^[\p{L}\p{N}_.\-]{3,24}$/u,EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const Login=()=>{
  const au=useAuth(),ru=lang==='ru',[mode,sm]=useState('in'),[em,se]=useState(''),[pw,sp]=useState(''),[pw2,sp2]=useState(''),[nk,sn]=useState(''),[show,ss]=useState(false),[msg,sg]=useState(null),[bz,sz]=useState(false),[chk,sc]=useState({}),tm=useRef();
  /* проверка ника и почты на лету */
  useEffect(()=>{
    if(mode!=='up'||!sb)return;
    const n=nk.trim(),e=em.trim(),okN=NICK_RE.test(n),okE=EMAIL_RE.test(e);
    if(!okN&&!okE){sc({});return}
    clearTimeout(tm.current);
    tm.current=setTimeout(async()=>{
      const r=await sb.rpc('signup_check',{n:okN?n:'',e:okE?e:''});
      if(r.error||!r.data)return sc({});
      sc({nick:okN?(r.data.nick_taken?'bad':'ok'):null,email:okE?(r.data.email_taken?'bad':'ok'):null})},350);
    return()=>clearTimeout(tm.current)},[nk,em,mode]);
  if(au.user)return html`<div class="auth2"><div class="au-card in1"><h2>${ru?'Вы уже вошли':'You are signed in'}</h2><p class="mu">${au.profile&&au.profile.nick}</p><a class="btn" href="#/profile">${t('profile')}</a></div></div>`;
  const err=s=>sg({e:1,s}),T=ru?{
    nick:'Ник',nickH:'3–24 символа: буквы, цифры, _ . -',email:'Почта',pw:'Пароль',pw2:'Повторите пароль',pwH:'Минимум 6 символов',
    taken:'Этот ник уже занят',free:'Ник свободен',etaken:'Эта почта уже зарегистрирована',efree:'Почта свободна',
    h1:mode==='in'?'С возвращением':'Создайте аккаунт',s1:mode==='in'?'Войдите, чтобы писать на форуме и вести свой профиль.':'Один ник и одна почта — на один аккаунт.',
    p1:'Свой профиль и публичный ID',p2:'Сообщения на форуме',p3:'Поиск игроков сайта по нику или ID',show:'Показать',hide:'Скрыть'
  }:{nick:'Nickname',nickH:'3–24 chars: letters, digits, _ . -',email:'Email',pw:'Password',pw2:'Repeat password',pwH:'At least 6 characters',
    taken:'This nickname is taken',free:'Nickname is free',etaken:'This email is already registered',efree:'Email is free',
    h1:mode==='in'?'Welcome back':'Create an account',s1:mode==='in'?'Sign in to post on the forum and manage your profile.':'One nickname and one email per account.',
    p1:'Your profile and public ID',p2:'Forum posts',p3:'Find site users by nickname or ID',show:'Show',hide:'Hide'};
  const go=async()=>{
    sg(null);if(!sb)return err(ru?'Supabase не подключён (демо-режим)':'Supabase is not connected (demo mode)');
    const e=em.trim(),n=nk.trim();
    if(!EMAIL_RE.test(e))return err(ru?'Введите корректную почту':'Enter a valid email');
    if(pw.length<6)return err(ru?'Пароль: минимум 6 символов':'Password: at least 6 characters');
    if(mode==='up'){
      if(!NICK_RE.test(n))return err(ru?'Ник: 3–24 символа, только буквы, цифры, _ . -':'Nickname: 3–24 chars, letters, digits, _ . -');
      if(pw!==pw2)return err(ru?'Пароли не совпадают':'Passwords do not match')}
    sz(true);
    try{
      if(mode==='up'){
        const c=await sb.rpc('signup_check',{n,e});
        if(c.data&&c.data.nick_taken){sz(false);return err(T.taken)}
        if(c.data&&c.data.email_taken){sz(false);return err(T.etaken)}}
      const r=mode==='in'?await sb.auth.signInWithPassword({email:e,password:pw}):await sb.auth.signUp({email:e,password:pw,options:{data:{nick:n}}});
      sz(false);
      if(r.error){const m=r.error.message||'';
        if(/registered|already/i.test(m))return err(T.etaken);
        if(/nick_taken|Database error/i.test(m))return err(T.taken);
        if(/Invalid login/i.test(m))return err(ru?'Неверная почта или пароль':'Wrong email or password');
        if(/Email not confirmed/i.test(m))return err(ru?'Почта не подтверждена: перейдите по ссылке из письма':'Email not confirmed: use the link from the email');
        return err(m)}
      /* при включённом подтверждении почты Supabase на повторную почту отвечает «успехом» без identities */
      if(mode==='up'&&r.data.user&&Array.isArray(r.data.user.identities)&&!r.data.user.identities.length)return err(T.etaken);
      if(mode==='up'&&!r.data.session)return sg({ok:1,s:ru?'Готово! Подтвердите почту по ссылке из письма и войдите.':'Done! Confirm your email, then sign in.'});
      await refreshAuth();location.hash='#/profile'}
    catch(x){sz(false);err(x.message||String(x))}};
  const hint=(k,okT,badT)=>chk[k]==='ok'?html`<small class="ok">✓ ${okT}</small>`:chk[k]==='bad'?html`<small class="bad">✕ ${badT}</small>`:null;
  const key=e=>{if(e.key==='Enter')go()};
  return html`<div class="auth2"><div class="au-card">
<aside class="au-side"><div class="au-brand"><img src=${SITE.logo||LOGO} alt=""/><b>${SITE.nm||'CSTT'}</b></div><h2>${T.h1}</h2><p>${T.s1}</p>
<ul><li>${T.p1}</li><li>${T.p2}</li><li>${T.p3}</li></ul></aside>
<div class="au-form"><div class="au-tabs"><button class=${mode==='in'?'on':''} onClick=${()=>{sm('in');sg(null)}}>${t('signin')}</button><button class=${mode==='up'?'on':''} onClick=${()=>{sm('up');sg(null)}}>${t('register')}</button></div>
${mode==='up'&&html`<label class="au-f"><span>${T.nick}</span><input autoComplete="username" maxLength="24" value=${nk} onInput=${e=>sn(e.target.value)} onKeyDown=${key}/>${hint('nick',T.free,T.taken)||html`<small>${T.nickH}</small>`}</label>`}
<label class="au-f"><span>${T.email}</span><input type="email" autoComplete="email" value=${em} onInput=${e=>se(e.target.value)} onKeyDown=${key}/>${mode==='up'&&hint('email',T.efree,T.etaken)}</label>
<label class="au-f"><span>${T.pw}</span><div class="au-pw"><input type=${show?'text':'password'} autoComplete=${mode==='in'?'current-password':'new-password'} value=${pw} onInput=${e=>sp(e.target.value)} onKeyDown=${key}/><button type="button" class="lnk" onClick=${()=>ss(!show)}>${show?T.hide:T.show}</button></div>${mode==='up'&&html`<small>${T.pwH}</small>`}${mode==='in'&&html`<a class="lnk au-fg" href="#/reset">${ru?'Забыли пароль?':'Forgot password?'}</a>`}</label>
${mode==='up'&&html`<label class="au-f"><span>${T.pw2}</span><input type=${show?'text':'password'} autoComplete="new-password" value=${pw2} onInput=${e=>sp2(e.target.value)} onKeyDown=${key}/></label>`}
${msg&&html`<div class=${'au-msg '+(msg.e?'bad':'ok')}>${msg.s}</div>`}
<button class="au-go" disabled=${bz} onClick=${go}>${bz?'…':mode==='in'?t('signin'):t('register')}</button>
<p class="au-sw">${mode==='in'?(ru?'Нет аккаунта? ':'No account? '):(ru?'Уже есть аккаунт? ':'Have an account? ')}<button class="lnk" onClick=${()=>{sm(mode==='in'?'up':'in');sg(null)}}>${mode==='in'?t('register'):t('signin')}</button></p></div></div></div>`};
