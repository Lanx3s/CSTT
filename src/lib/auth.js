import {useState,useEffect} from 'react';
import {sb} from './supabase.js';

export const auth={user:null,profile:null,admin:false,ready:false};
const subs=new Set(),emit=()=>subs.forEach(f=>f({...auth}));

export const refreshAuth=async()=>{
  if(!sb){auth.ready=true;emit();return}
  const {data}=await sb.auth.getSession(),u=data.session?.user||null;
  auth.user=u;auth.profile=null;auth.admin=false;
  if(u){
    const [p,a]=await Promise.all([sb.from('profiles').select('*').eq('id',u.id).maybeSingle(),sb.from('admins').select('uid').eq('uid',u.id).maybeSingle()]);
    auth.profile=p.data;auth.admin=!!a.data}
  auth.ready=true;emit()};
if(sb)sb.auth.onAuthStateChange(()=>{setTimeout(refreshAuth,0)});
export const useAuth=()=>{const [s,ss]=useState({...auth});useEffect(()=>{subs.add(ss);ss({...auth});return()=>subs.delete(ss)},[]);return s};

export const uploadImage=async f=>{
  const {data}=await sb.auth.getUser(),uid=data.user?.id;if(!uid)throw new Error('Нужно войти');
  const x=(f.name.split('.').pop()||'png').toLowerCase().replace(/[^a-z0-9]/g,'')||'png',p=uid+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.'+x;
  const {error}=await sb.storage.from('images').upload(p,f);if(error)throw error;
  return sb.storage.from('images').getPublicUrl(p).data.publicUrl};
