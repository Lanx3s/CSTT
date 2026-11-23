/* Форум: темы и ответы зарегистрированных пользователей (таблицы forum_topics / forum_posts в Supabase) */
import {useState,useEffect,useCallback} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth} from '../lib/auth.js';
import {withProfiles,userHref} from '../lib/users.js';
import {lang,t} from '../lib/i18n.js';
import {Box,Empty} from '../components/common.js';

const CATS=[['general','Общее','General'],['events','Турниры и матчи','Events & matches'],['teams','Команды и игроки','Teams & players'],['lft','Поиск команды / игроков','Looking for team'],['site','Сайт и предложения','Site & suggestions'],['off','Оффтоп','Off-topic']];
const cn=k=>{const c=CATS.find(x=>x[0]===k)||CATS[0];return lang==='ru'?c[1]:c[2]};
const fmt=s=>{try{return new Date(s).toLocaleString(lang==='ru'?'ru-RU':'en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}};
const Ava=({x,s=36})=>x.avatar?html`<img class="fav2" style=${{width:s,height:s}} src=${x.avatar} alt=""/>`:html`<span class="fav2 ph" style=${{width:s,height:s,fontSize:s*.42}}>${(x.nick||'?')[0].toUpperCase()}</span>`;
const Err=({e})=>e?html`<div class="fmsg">${/relation|forum_|schema/i.test(e)?'Форум ещё не подключён: выполните обновлённый supabase/schema.sql в Supabase → SQL Editor.':e}</div>`:null;

const NeedLogin=()=>html`<div class="fneed">${lang==='ru'?'Чтобы писать на форуме, нужно ':'To post you need to '}<a href="#/login">${lang==='ru'?'войти или зарегистрироваться':'sign in or register'}</a></div>`;

const Topics=()=>{
  const au=useAuth(),ru=lang==='ru',[cat,sc]=useState(''),[list,sl]=useState(null),[err,se]=useState(''),[nw,sn]=useState(false),[f,sf]=useState({cat:'general',title:'',body:''}),[bz,sb2]=useState(false);
  const load=useCallback(async()=>{if(!sb){sl([]);return}const {data,error}=await sb.from('forum_topics').select('*').order('pin',{ascending:false}).order('last_at',{ascending:false}).limit(200);if(error){se(error.message);sl([]);return}se('');sl(await withProfiles(data||[]))},[]);
  useEffect(()=>{load()},[load]);
  const create=async()=>{
    const ti=f.title.trim(),bd=f.body.trim();
    if(ti.length<3)return se(ru?'Заголовок: минимум 3 символа':'Title: at least 3 characters');if(bd.length<3)return se(ru?'Напишите текст сообщения':'Write a message');
    sb2(true);const pr=au.profile||{};
    const {data,error}=await sb.from('forum_topics').insert({cat:f.cat,title:ti.slice(0,140),body:bd.slice(0,6000),uid:au.user.id,nick:pr.nick||'user',avatar:pr.avatar||null}).select().single();
    sb2(false);if(error)return se(error.message);location.hash='#/forum/'+data.id};
  const shown=(list||[]).filter(x=>!cat||x.cat===cat);
  return html`<div class="col forum"><div class="bx"><h3><span>${t('forum')}</span><a class="btn" href="#/users">${ru?'Пользователи':'Users'}</a>${au.user&&sb&&html`<button class="btn" onClick=${()=>sn(!nw)}>${nw?(ru?'Отмена':'Cancel'):(ru?'+ Новая тема':'+ New topic')}</button>`}</h3>
<div class="in"><div class="fcats"><button class=${!cat?'on':''} onClick=${()=>sc('')}>${ru?'Все':'All'}</button>${CATS.map(c=>html`<button key=${c[0]} class=${cat===c[0]?'on':''} onClick=${()=>sc(c[0])}>${cn(c[0])}</button>`)}</div>
${!sb&&html`<div class="fmsg">${ru?'Демо-режим: форум заработает после подключения Supabase.':'Demo mode: the forum works once Supabase is connected.'}</div>`}
${sb&&!au.user&&html`<${NeedLogin}/>`}
${nw&&au.user&&html`<div class="fform"><select value=${f.cat} onChange=${e=>sf({...f,cat:e.target.value})}>${CATS.map(c=>html`<option key=${c[0]} value=${c[0]}>${cn(c[0])}</option>`)}</select><input placeholder=${ru?'Заголовок темы':'Topic title'} maxLength="140" value=${f.title} onChange=${e=>sf({...f,title:e.target.value})}/><textarea rows="6" placeholder=${ru?'Текст сообщения':'Message'} maxLength="6000" value=${f.body} onChange=${e=>sf({...f,body:e.target.value})}/><button class="on" disabled=${bz} onClick=${create}>${bz?'…':(ru?'Создать тему':'Create topic')}</button></div>`}
<${Err} e=${err}/></div></div>
<div class="bx"><div class="ftb"><div class="fth"><span>${ru?'Тема':'Topic'}</span><span class="c">${ru?'Ответов':'Replies'}</span><span class="c d">${ru?'Последнее':'Last'}</span></div>
${list==null?html`<div class="in mu">…</div>`:shown.length?shown.map(x=>html`<a class=${'ftr'+(x.pin?' pin':'')} key=${x.id} href=${'#/forum/'+x.id}><span class="ft"><${Ava} x=${x} s=${34}/><span><b>${x.pin?'📌 ':''}${x.locked?'🔒 ':''}${x.title}</b><small>${cn(x.cat)} · ${x.nick} · ${fmt(x.created_at)}</small></span></span><span class="c">${x.replies||0}</span><span class="c d">${fmt(x.last_at||x.created_at)}</span></a>`):html`<${Empty} text=${ru?'Тем пока нет. Создайте первую!':'No topics yet'}/>`}</div></div></div>`};

const Post=({p,au,op,onDel})=>{const own=au.user&&au.user.id===p.uid,can=own||au.admin;
  return html`<div class=${'fpost'+(op?' op':'')}><div class="fp-a"><${Ava} x=${p} s=${48}/>${userHref(p)?html`<a class="fp-n" href=${userHref(p)}><b>${p.nick}</b></a>`:html`<b>${p.nick}</b>`}<small class="mu">ID ${p.pid||''}</small></div><div class="fp-b"><div class="fp-h"><span class="mu">${fmt(p.created_at)}</span>${can&&html`<button class="lnk" onClick=${onDel}>${lang==='ru'?'Удалить':'Delete'}</button>`}</div><div class="fp-t">${p.body}</div></div></div>`};

/* ветка ответов: у каждого сообщения свои ответы, их можно скрыть/показать (по умолчанию открыты) */
const Node=({n,kids,num,au,locked,onDel,onReply,depth})=>{
  const ru=lang==='ru',[open,so]=useState(true),[rp,sr]=useState(false),[txt,st2]=useState(''),[bz,sz]=useState(false);
  const own=au.user&&au.user.id===n.uid,can=own||au.admin,list=kids.get(n.id)||[];
  const cnt=function c(id){return (kids.get(id)||[]).reduce((a,x)=>a+1+c(x.id),0)}(n.id);
  const send=async()=>{const b=txt.trim();if(b.length<2)return;sz(true);const ok=await onReply(n.id,b);sz(false);if(ok){st2('');sr(false);so(true)}};
  return html`<div class=${'tn'+(depth?' tn-s':'')}><div class="tn-c"><div class="tn-h"><span class="tn-no">#${num.get(n.id)}</span><${Ava} x=${n} s=${22}/>${userHref(n)?html`<a class="fp-n" href=${userHref(n)}><b>${n.nick}</b></a>`:html`<b>${n.nick}</b>`}<span class="mu tn-d">${fmt(n.created_at)}</span></div>
<div class="fp-t tn-t">${n.body}</div>
<div class="tn-f">${au.user&&!locked&&html`<button class="lnk" onClick=${()=>sr(!rp)}>${rp?(ru?'Отмена':'Cancel'):(ru?'Ответить':'Reply')}</button>`}${cnt>0&&html`<button class="lnk tn-tg" onClick=${()=>so(!open)}>${open?'▾ '+(ru?'Скрыть ответы':'Hide replies'):'▸ '+(ru?'Показать ответы':'Show replies')} (${cnt})</button>`}${can&&html`<button class="lnk tn-del" onClick=${()=>onDel(n)}>${ru?'Удалить':'Delete'}</button>`}</div>
${rp&&html`<div class="tn-form"><textarea rows="3" maxLength="6000" autoFocus placeholder=${ru?'Ваш ответ':'Your reply'} value=${txt} onInput=${e=>st2(e.target.value)}/><button class="on" disabled=${bz||txt.trim().length<2} onClick=${send}>${bz?'…':(ru?'Отправить':'Send')}</button></div>`}</div>
${list.length>0&&open&&html`<div class="tn-k">${list.map(x=>html`<${Node} key=${x.id} n=${x} kids=${kids} num=${num} au=${au} locked=${locked} onDel=${onDel} onReply=${onReply} depth=${depth+1}/>`)}</div>`}</div>`};

const Topic=({id})=>{
  const au=useAuth(),ru=lang==='ru',[tp,st]=useState(null),[ps,sp]=useState([]),[err,se]=useState(''),[body,sbd]=useState(''),[bz,sz]=useState(false);
  const load=useCallback(async()=>{if(!sb)return;const a=await sb.from('forum_topics').select('*').eq('id',id).maybeSingle();if(a.error)return se(a.error.message);st(a.data?(await withProfiles([a.data]))[0]:false);
    const b=await sb.from('forum_posts').select('*').eq('topic',id).order('id');if(b.error)return se(b.error.message);sp(await withProfiles(b.data||[]))},[id]);
  useEffect(()=>{load()},[load]);
  if(!sb)return html`<div class="bx in">${ru?'Демо-режим':'Demo mode'}</div>`;
  if(tp===false)return html`<div class="bx"><${Empty} text="404"/></div>`;
  if(!tp)return html`<div class="bx in mu">${err?html`<${Err} e=${err}/>`:'…'}</div>`;
  const send=async(parent,b)=>{const pr=au.profile||{},row={topic:tp.id,body:b.slice(0,6000),uid:au.user.id,nick:pr.nick||'user',avatar:pr.avatar||null};if(parent)row.parent=parent;
    const {error}=await sb.from('forum_posts').insert(row);
    if(error){se(/parent/.test(error.message)?(ru?'Ответы на сообщения заработают после обновления supabase/schema.sql (колонка parent).':error.message):error.message);return false}
    se('');load();return true};
  const reply=async()=>{const b=body.trim();if(b.length<2)return;sz(true);const ok=await send(null,b);sz(false);if(ok)sbd('')};
  const kids=new Map(),num=new Map(),roots=[];ps.forEach((x,i)=>{num.set(x.id,i+1);if(x.parent&&ps.some(y=>y.id===x.parent)){(kids.get(x.parent)||kids.set(x.parent,[]).get(x.parent)).push(x)}else roots.push(x)});
  const delPost=async p=>{if(!confirm(ru?'Удалить сообщение?':'Delete message?'))return;const {error}=await sb.from('forum_posts').delete().eq('id',p.id);if(error)return se(error.message);load()};
  const delTopic=async()=>{if(!confirm(ru?'Удалить тему целиком?':'Delete the whole topic?'))return;const {error}=await sb.from('forum_topics').delete().eq('id',tp.id);if(error)return se(error.message);location.hash='#/forum'};
  const flag=async k=>{const {error}=await sb.from('forum_topics').update({[k]:tp[k]?0:1}).eq('id',tp.id);if(error)return se(error.message);load()};
  const own=au.user&&au.user.id===tp.uid;
  return html`<div class="col forum"><div class="crumb"><a href="#/forum">${t('forum')}</a><i>›</i><span>${cn(tp.cat)}</span></div>
<div class="bx"><h3><span>${tp.pin?'📌 ':''}${tp.locked?'🔒 ':''}${tp.title}</span>${au.admin&&html`<span class="fadm"><button class="lnk" onClick=${()=>flag('pin')}>${tp.pin?(ru?'Открепить':'Unpin'):(ru?'Закрепить':'Pin')}</button><button class="lnk" onClick=${()=>flag('locked')}>${tp.locked?(ru?'Открыть':'Unlock'):(ru?'Закрыть':'Lock')}</button></span>`}${(own||au.admin)&&html`<button class="lnk" onClick=${delTopic}>${ru?'Удалить тему':'Delete topic'}</button>`}</h3>
<${Post} p=${tp} au=${au} op=${1} onDel=${delTopic}/></div>
<div class="bx"><h3><span>${ru?'Ответы':'Replies'} · ${ps.length}</span></h3><div class="tn-root">${roots.map(x=>html`<${Node} key=${x.id} n=${x} kids=${kids} num=${num} au=${au} locked=${tp.locked} onDel=${delPost} onReply=${send} depth=${0}/>`)}${!roots.length&&html`<div class="in mu">${ru?'Ответов пока нет':'No replies yet'}</div>`}</div></div>
<div class="bx"><h3><span>${ru?'Ответить':'Reply'}</span></h3><div class="in">${tp.locked?html`<div class="fmsg">${ru?'Тема закрыта':'Topic is locked'}</div>`:au.user?html`<div class="fform"><textarea rows="5" maxLength="6000" placeholder=${ru?'Ваше сообщение':'Your message'} value=${body} onChange=${e=>sbd(e.target.value)}/><button class="on" disabled=${bz||body.trim().length<2} onClick=${reply}>${bz?'…':(ru?'Отправить':'Send')}</button></div>`:html`<${NeedLogin}/>`}<${Err} e=${err}/></div></div></div>`};

export const Forum=({id})=>id?html`<${Topic} key=${id} id=${id}/>`:html`<${Topics}/>`;

/* блок «Форум» на главной: последние темы */
export const ForumBox=()=>{
  const ru=lang==='ru',[l,sl]=useState(null);
  useEffect(()=>{if(!sb)return;sb.from('forum_topics').select('id,title,uid,nick,replies,last_at,created_at,pin').order('pin',{ascending:false}).order('last_at',{ascending:false}).limit(5).then(async r=>sl(r.error?[]:await withProfiles(r.data||[])))},[]);
  return html`<${Box} h=${t('forum')} href="#/forum" more=${ru?'Открыть':'Open'}>${(l||[]).map(x=>html`<a class="nmini" key=${x.id} href=${'#/forum/'+x.id}><span>${x.pin?'📌 ':''}${x.title}</span><small>${x.nick} · ${x.replies||0} ${ru?'отв.':'repl.'}</small></a>`)}${(!l||!l.length)&&html`<div class="fbox"><span class="mu">${sb?(ru?'Тем пока нет':'No topics yet'):(ru?'Обсуждайте матчи и турниры':'Discuss matches and events')}</span><a class="btn" href="#/forum">${ru?'Перейти на форум':'Go to forum'}</a></div>`}<//>`};
