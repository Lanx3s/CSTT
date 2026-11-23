/* Публичные профили: всегда берём актуальные ник/аватар из таблицы profiles (а не копию в форуме) */
import {sb} from './supabase.js';

export const withProfiles=async rows=>{
  if(!sb||!rows||!rows.length)return rows||[];
  const ids=[...new Set(rows.map(r=>r.uid).filter(Boolean))];
  if(!ids.length)return rows;
  const {data}=await sb.from('profiles').select('id,pid,nick,avatar').in('id',ids);
  if(!data)return rows;
  const m=new Map(data.map(x=>[x.id,x]));
  return rows.map(r=>{const p=m.get(r.uid);return p?{...r,nick:p.nick||r.nick,avatar:p.avatar||null,pid:p.pid}:r})};

export const userHref=x=>x&&(x.pid||x.nick)?'#/user/'+encodeURIComponent(x.pid||x.nick):null;

/* найти профиль по публичному ID (цифры) или по нику */
export const findUser=async key=>{
  if(!sb)return null;
  const k=decodeURIComponent(String(key||'')).trim();if(!k)return null;
  if(/^\d+$/.test(k)){const r=await sb.from('profiles').select('*').eq('pid',+k).maybeSingle();if(r.data)return r.data}
  const r=await sb.from('profiles').select('*').ilike('nick',k.replace(/[\\%_]/g,'\\$&')).maybeSingle();
  return r.data||null};

export const searchUsers=async q=>{
  if(!sb)return [];
  const s=String(q||'').trim().replace(/[,()%*]/g,' ').trim();
  let r;
  if(!s)r=await sb.from('profiles').select('id,pid,nick,avatar,cc,created_at').order('created_at',{ascending:false}).limit(24);
  else if(/^\d+$/.test(s))r=await sb.from('profiles').select('id,pid,nick,avatar,cc,created_at').or('pid.eq.'+s+',nick.ilike.%'+s+'%').limit(30);
  else r=await sb.from('profiles').select('id,pid,nick,avatar,cc,created_at').ilike('nick','%'+s.replace(/[\\_]/g,'\\$&')+'%').order('nick').limit(30);
  return r.data||[]};
