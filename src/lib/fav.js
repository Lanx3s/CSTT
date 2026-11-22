/* «Избранные команды» — хранится в браузере посетителя */
import {useState,useEffect} from 'react';
const KEY='cstt_fav',subs=new Set();
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}};
let cur=read();
const write=a=>{cur=a;try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}subs.forEach(f=>f(a))};
export const isFav=id=>cur.includes(+id);
export const toggleFav=id=>write(isFav(id)?cur.filter(x=>x!==+id):[...cur,+id]);
export const useFav=()=>{const [s,ss]=useState(cur);useEffect(()=>{subs.add(ss);ss(cur);return()=>subs.delete(ss)},[]);return s};
