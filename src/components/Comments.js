/* Комментарии под новостями и матчами — ветки ответов, как на форуме */
import {useState,useEffect,useCallback} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {useAuth} from '../lib/auth.js';
import {lang} from '../lib/i18n.js';
import {withProfiles} from '../lib/users.js';
import {Node,NeedLogin} from '../pages/Forum.js';

export const Comments=({kind,id})=>{
  const au=useAuth(),ru=lang==='ru',[ps,sp]=useState(null),[err,se]=useState(''),[body,sb2]=useState(''),[bz,sz]=useState(false);
  const load=useCallback(async()=>{if(!sb)return;const r=await sb.from('comments').select('*').eq('kind',kind).eq('ref',id).order('id');
    if(r.error){se(r.error.message);return sp([])}sp(await withProfiles(r.data||[]))},[kind,id]);
  useEffect(()=>{sp(null);load()},[load]);
  if(!sb)return null;
  const banned=au.profile&&au.profile.banned==1;
  const send=async(parent,b)=>{const pr=au.profile||{},row={kind,ref:Number(id),body:b.slice(0,3000),uid:au.user.id,nick:pr.nick||'user',avatar:pr.avatar||null};if(parent)row.parent=parent;
    const {error}=await sb.from('comments').insert(row);
    if(error){se(/relation|comments/i.test(error.message)?(ru?'Комментарии заработают после обновления supabase/schema.sql.':error.message):/row-level|policy/i.test(error.message)?(ru?'Вы не можете писать комментарии (аккаунт заблокирован).':error.message):error.message);return false}
    se('');load();return true};
  const post=async()=>{const b=body.trim();if(b.length<2)return;sz(true);const ok=await send(null,b);sz(false);if(ok)sb2('')};
  const del=async p=>{if(!confirm(ru?'Удалить комментарий?':'Delete comment?'))return;const {error}=await sb.from('comments').delete().eq('id',p.id);if(error)return se(error.message);load()};
  const list=ps||[],kids=new Map(),num=new Map(),roots=[];
  list.forEach((x,i)=>{num.set(x.id,i+1);if(x.parent&&list.some(y=>y.id===x.parent)){(kids.get(x.parent)||kids.set(x.parent,[]).get(x.parent)).push(x)}else roots.push(x)});
  return html`<div class="bx cmts"><h3><span>${ru?'Комментарии':'Comments'} · ${list.length}</span></h3>
<div class="in cm-new">${banned?html`<div class="fmsg">${ru?'Аккаунт заблокирован: писать нельзя.':'Your account is blocked.'}</div>`:au.user?html`<div class="fform"><textarea rows="3" maxLength="3000" placeholder=${ru?'Написать комментарий…':'Write a comment…'} value=${body} onInput=${e=>sb2(e.target.value)}/><button class="on" disabled=${bz||body.trim().length<2} onClick=${post}>${bz?'…':(ru?'Отправить':'Send')}</button></div>`:html`<${NeedLogin}/>`}${err&&html`<div class="fmsg">${err}</div>`}</div>
<div class="tn-root">${roots.map(x=>html`<${Node} key=${x.id} n=${x} kids=${kids} num=${num} au=${au} locked=${banned} onDel=${del} onReply=${send} depth=${0}/>`)}${ps&&!roots.length&&html`<div class="mu cm-e">${ru?'Комментариев пока нет — будьте первым.':'No comments yet.'}</div>`}</div></div>`};
