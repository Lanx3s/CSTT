/* Общие элементы форм (заявки команд, регистрация на турнир): поле, загрузка картинки с предпросмотром */
import {useState,useRef} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {uploadApp,removeApp,downloadUrl} from '../lib/auth.js';
import {checkImage,LIM} from '../lib/validate.js';

export const Field=({l,req,err,hint,cls='',children})=>html`<label class=${'ap-f '+cls+(err?' bad':'')}><span class="ap-l">${l}${req&&html`<i title="Обязательное поле">*</i>`}</span>${children}${err?html`<em class="ap-e" role="alert">${err}</em>`:hint?html`<small class="ap-h">${hint}</small>`:null}</label>`;

/* value — адрес уже загруженной картинки; onChange(url|null); onBusy(true/false) — идёт загрузка */
export const ImgPick=({value,onChange,onBusy,label,req,err,mb=LIM.photoMB,round,name='image',hint,compact})=>{
  const [pv,spv]=useState(null),[bz,sbz]=useState(false),[er,ser]=useState(''),ref=useRef();
  const pick=async e=>{
    const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
    ser('');const c=await checkImage(f,mb);if(!c.ok){ser(c.err);return}
    spv(c.url);sbz(true);onBusy&&onBusy(true);
    try{const old=value;const u=await uploadApp(f);onChange(u);if(old)removeApp(old)}
    catch(x){ser('Не удалось загрузить: '+(x.message||x));spv(null)}
    sbz(false);onBusy&&onBusy(false)};
  const del=()=>{if(value)removeApp(value);onChange(null);spv(null);ser('')};
  const src=value||pv,msg=er||err;
  return html`<div class=${'ap-img'+(compact?' cp':'')+(msg?' bad':'')}>
<span class="ap-l">${label}${req&&html`<i title="Обязательное поле">*</i>`}</span>
<div class=${'ap-box'+(round?' rd':'')+(src?' has':'')} onClick=${()=>!bz&&ref.current&&ref.current.click()} role="button" tabIndex="0" onKeyDown=${e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ref.current&&ref.current.click()}}}>
${src?html`<img src=${src} alt=""/>`:html`<span class="ap-ph"><b>+</b><small>PNG · JPEG · WebP<br/>до ${mb} МБ</small></span>`}
${bz&&html`<span class="ap-bz"><i></i>Загрузка…</span>`}</div>
<input ref=${ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange=${pick}/>
${src&&!bz&&html`<div class="ap-ia"><button type="button" class="ap-lk" onClick=${()=>ref.current.click()}>Заменить</button><button type="button" class="ap-lk d" onClick=${del}>Удалить</button>${value&&html`<a class="ap-lk" href=${value} target="_blank" rel="noopener noreferrer">Открыть</a><button type="button" class="ap-lk" onClick=${()=>downloadUrl(value,name)}>Скачать</button>`}</div>`}
${msg?html`<em class="ap-e" role="alert">${msg}</em>`:hint?html`<small class="ap-h">${hint}</small>`:null}</div>`};

/* ссылки «открыть / скачать» для админки */
export const ImgLinks=({url,name})=>url?html`<span class="ap-ia"><a class="ap-lk" href=${url} target="_blank" rel="noopener noreferrer">Открыть</a><button type="button" class="ap-lk" onClick=${()=>downloadUrl(url,name)}>Скачать</button></span>`:null;

/* понятное сообщение, если на сервере ещё не выполнен schema.sql */
export const srvErr=e=>{const m=(e&&e.message)||String(e||'');return /could not find the function|schema cache|does not exist|PGRST20/i.test(m)?'Приём заявок ещё не включён на сервере. Администратору: выполните обновлённый supabase/schema.sql в Supabase → SQL Editor.':m};
