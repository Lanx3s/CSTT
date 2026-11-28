/* Отдельная страница статистики игрока: карточка + сохранение в PNG */
import {useState} from 'react';
import {html} from '../lib/html.js';
import {player,pteam} from '../lib/data.js';
import {Box,Empty} from '../components/common.js';
import {StatCard,cardPng} from '../components/StatCard.js';
import {playerStats} from '../lib/pstat.js';

export const PlayerStats=({id})=>{
  const p=player(id),[k,sk]=useState(0),[bz,sb]=useState(false),[msg,sm]=useState('');
  if(!p)return html`<div class="bx"><${Empty} text="404"/></div>`;
  const S=playerStats(p),save=async()=>{sb(true);sm('');try{const b=await cardPng(p,S);if(!b)throw new Error('png');const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='cstt-'+p.nick+'-stats.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}catch(e){sm('Не удалось сохранить картинку')}sb(false)};
  return html`<div class="col scp"><div class="crumb"><a href="#/players">Игроки</a><i>›</i><a href=${'#/player/'+p.id}>${p.nick}</a><i>›</i><span>Статистика</span></div>
<${StatCard} key=${k} p=${p} S=${S}/>
<div class="sc-act"><button class="btn" disabled=${bz} onClick=${save}>${bz?'Готовлю…':'Скачать PNG'}</button><button class="btn gh" onClick=${()=>sk(k+1)}>Повторить анимацию</button><a class="btn gh" href=${'#/player/'+p.id}>Профиль игрока</a></div>
${msg&&html`<div class="ap-fail">${msg}</div>`}
<p class="hint sc-nt">${S.src==='matches'?'Показатели считаются автоматически из результатов матчей и построчной статистики на сайте (общие, без разделения по сторонам).':'Построчной статистики матчей по игроку пока нет — показаны средние значения из профиля игрока.'} Оценки (POOR–GREAT) — ориентир по шкале сайта.</p></div>`};
