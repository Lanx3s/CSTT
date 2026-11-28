/* Восстановление пароля: почта -> код из письма -> новый пароль.
   Работает на Supabase Auth: resetPasswordForEmail отправляет письмо, verifyOtp(type:'recovery') проверяет код, updateUser задаёт пароль.
   В шаблоне письма «Reset Password» (Supabase -> Authentication -> Email Templates) должен стоять код {{ .Token }} — см. supabase/email-reset-template.html */
import {useState,useEffect,useRef} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {refreshAuth} from '../lib/auth.js';
import {SITE} from '../lib/data.js';
import LOGO from '../assets/logo.png';

const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_RE=/^\d{6,10}$/;
const WAIT=60;
/* понятные тексты ошибок Supabase */
const nice=e=>{const m=(e&&e.message)||String(e||'');
  if(/rate limit|too many|security purposes|after \d+ seconds/i.test(m))return 'Слишком часто. Подождите минуту и попробуйте снова.';
  if(/expired|invalid|otp|token/i.test(m))return 'Неверный или просроченный код. Проверьте цифры или запросите новый код.';
  if(/same password|different from the old/i.test(m))return 'Новый пароль должен отличаться от старого.';
  if(/weak|at least/i.test(m))return 'Слишком простой пароль: минимум 6 символов.';
  return m};

export const Reset=()=>{
  const [step,ss]=useState('email'),[em,se]=useState(''),[code,sc]=useState(''),[pw,sp]=useState(''),[pw2,sp2]=useState(''),[show,sh]=useState(false),[bz,sb2]=useState(false),[msg,sm]=useState(null),[left,sl]=useState(0),lock=useRef(false);
  useEffect(()=>{if(left<=0)return;const id=setTimeout(()=>sl(left-1),1000);return()=>clearTimeout(id)},[left]);
  const err=s=>sm({e:1,s}),ok=s=>sm({s});
  const run=async fn=>{if(lock.current)return;lock.current=true;sb2(true);sm(null);try{await fn()}catch(x){err(nice(x))}lock.current=false;sb2(false)};

  const send=()=>run(async()=>{
    const e=em.trim();if(!EMAIL_RE.test(e))return err('Введите корректную почту');
    const r=await sb.auth.resetPasswordForEmail(e);if(r.error)return err(nice(r.error));
    sc('');ss('code');sl(WAIT);ok('Если эта почта зарегистрирована, мы отправили на неё код. Проверьте также «Спам».')});
  const verify=()=>run(async()=>{
    const c=code.replace(/\s/g,'');if(!CODE_RE.test(c))return err('Введите код из письма (6–10 цифр)');
    const r=await sb.auth.verifyOtp({email:em.trim(),token:c,type:'recovery'});if(r.error)return err(nice(r.error));
    sp('');sp2('');ss('pw');sm(null)});
  const save=()=>run(async()=>{
    if(pw.length<6)return err('Пароль: минимум 6 символов');
    if(pw!==pw2)return err('Пароли не совпадают');
    const r=await sb.auth.updateUser({password:pw});if(r.error)return err(nice(r.error));
    await refreshAuth();ss('done');sm(null)});
  const key=f=>e=>{if(e.key==='Enter')f()};

  const head=html`<div class="au-brand"><img src=${SITE.logo||LOGO} alt=""/><b>${SITE.nm||'CSTT'}</b></div>`;
  if(!sb)return html`<div class="auth2"><div class="au-card in1"><h2>Восстановление пароля</h2><p class="mu">Работает после подключения Supabase (см. README). Сейчас сайт показывает демо-данные.</p><a class="btn gh" href="#/login">Назад ко входу</a></div></div>`;
  const out=msg&&html`<div class=${'au-msg '+(msg.e?'bad':'ok')} role=${msg.e?'alert':'status'}>${msg.s}</div>`;
  const steps=['email','code','pw'],idx=steps.indexOf(step);
  return html`<div class="auth2"><div class="au-card in1 rs">${head}
${step!=='done'&&html`<div class="rs-st">${steps.map((s,i)=>html`<i key=${s} class=${i<idx?'dn':i===idx?'on':''}>${i+1}</i>`)}</div>`}
${step==='email'&&html`<h2>Забыли пароль?</h2><p class="mu">Введите почту аккаунта — мы отправим на неё код для сброса пароля.</p>
<label class="au-f"><span>Почта</span><input type="email" autoComplete="email" autoFocus value=${em} onInput=${e=>se(e.target.value)} onKeyDown=${key(send)}/></label>${out}
<button class="au-go" disabled=${bz} onClick=${send}>${bz?'…':'Отправить код'}</button>`}
${step==='code'&&html`<h2>Введите код</h2><p class="mu">Мы отправили код на <b>${em.trim()}</b>.</p>
<label class="au-f"><span>Код из письма</span><input class="rs-code" inputMode="numeric" autoComplete="one-time-code" maxLength="10" autoFocus placeholder="••••••" value=${code} onInput=${e=>sc(e.target.value.replace(/\D/g,''))} onKeyDown=${key(verify)}/></label>${out}
<button class="au-go" disabled=${bz||!CODE_RE.test(code)} onClick=${verify}>${bz?'…':'Подтвердить код'}</button>
<div class="rs-ln"><button class="lnk" disabled=${left>0||bz} onClick=${send}>${left>0?'Отправить код ещё раз через '+left+' с':'Отправить код ещё раз'}</button><button class="lnk" onClick=${()=>{ss('email');sm(null)}}>Изменить почту</button></div>`}
${step==='pw'&&html`<h2>Новый пароль</h2><p class="mu">Код принят. Придумайте новый пароль для входа.</p>
<label class="au-f"><span>Новый пароль</span><div class="au-pw"><input type=${show?'text':'password'} autoComplete="new-password" autoFocus value=${pw} onInput=${e=>sp(e.target.value)} onKeyDown=${key(save)}/><button type="button" class="lnk" onClick=${()=>sh(!show)}>${show?'Скрыть':'Показать'}</button></div><small>Минимум 6 символов</small></label>
<label class="au-f"><span>Повторите пароль</span><input type=${show?'text':'password'} autoComplete="new-password" value=${pw2} onInput=${e=>sp2(e.target.value)} onKeyDown=${key(save)}/></label>${out}
<button class="au-go" disabled=${bz} onClick=${save}>${bz?'…':'Сохранить пароль'}</button>`}
${step==='done'&&html`<div class="rs-ok"><i>✓</i></div><h2>Пароль изменён</h2><p class="mu">Вы вошли в аккаунт с новым паролем.</p><a class="btn" href="#/profile">Перейти в профиль</a>`}
${step!=='done'&&html`<p class="au-sw"><a class="lnk" href="#/login">← Назад ко входу</a></p>`}</div></div>`};
