import {useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {html} from './lib/html.js';
import {fetchAll,load} from './lib/data.js';
import {lang} from './lib/i18n.js';
import {refreshAuth} from './lib/auth.js';
import {App} from './App.js';
import './styles/style.css';
import './styles/admin.css';

const Root=()=>{
  const [s,ss]=useState('load'),[e,se]=useState('');
  const go=()=>{ss('load');fetchAll().then(d=>{load(d);ss('ok')}).catch(x=>{se(x.message);ss('err')})};
  useEffect(go,[]);
  if(s==='ok'||location.hash.startsWith('#/admin'))return html`<${App}/>`;
  const ru=lang==='ru';
  return html`<div class="boot">${s==='load'?(ru?'Загрузка…':'Loading…'):html`<div><p>${(ru?'Не удалось загрузить данные: ':'Failed to load data: ')+e}</p><button onClick=${go}>${ru?'Повторить':'Retry'}</button></div>`}</div>`};
refreshAuth();
createRoot(document.getElementById('root')).render(html`<${Root}/>`);
