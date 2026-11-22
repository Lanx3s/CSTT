/* Лёгкий разметчик текста новостей. Безопасен: HTML не вставляется, ссылки только http(s)/#/mailto.
   **жирный**  *курсив*  `код`  [текст](ссылка)  ![подпись](картинка)
   # / ## / ### заголовки   > цитата   - список   1. нумерованный   ---  линия
   [[match:12]] [[team:3]] [[player:5]] [[tour:2]] [[news:7]] [[yt:ID_ВИДЕО]]  — встроенные карточки */
import {html} from '../lib/html.js';
import {match,team,player,tour,news} from '../lib/data.js';
import {L} from '../lib/i18n.js';
import {Row,TeamLogo,PlayerCard,TourLogo,NewsRow,Flag} from './common.js';

const safe=u=>/^(https?:\/\/|#\/|mailto:|\/)/i.test(u)?u:'#';
const inline=(s,k='')=>{
  const out=[],re=/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;let last=0,m,i=0;
  while((m=re.exec(s))){
    if(m.index>last)out.push(s.slice(last,m.index));
    const x=m[0];
    if(x.startsWith('**'))out.push(html`<strong key=${k+i}>${x.slice(2,-2)}</strong>`);
    else if(x[0]==='*')out.push(html`<em key=${k+i}>${x.slice(1,-1)}</em>`);
    else if(x[0]==='`')out.push(html`<code key=${k+i}>${x.slice(1,-1)}</code>`);
    else{const q=x.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/),u=safe(q[2]);out.push(html`<a key=${k+i} href=${u} target=${u[0]==='#'?null:'_blank'} rel="noreferrer">${q[1]}</a>`)}
    last=m.index+x.length;i++}
  if(last<s.length)out.push(s.slice(last));return out};

const Embed=({k,id})=>{
  if(k==='match'){const m=match(id);return m?html`<div class="emb"><${Row} m=${m} ev=${1}/></div>`:null}
  if(k==='team'){const T=team(id);return T.tbd?null:html`<a class="emb embt" href=${'#/team/'+T.id}><${TeamLogo} x=${T} s=${44}/><span><b>${T.name}</b><small>${(T.cc||'').toUpperCase()} · #${T.rank}</small></span></a>`}
  if(k==='player'){const p=player(id);return p?html`<div class="emb"><${PlayerCard} p=${p}/></div>`:null}
  if(k==='tour'){const o=tour(id);return o?html`<a class="emb embt" href=${'#/tournament/'+o.id}><${TourLogo} o=${o} s=${44}/><span><b>${o.n}</b><small>${[o.pr,o.d].filter(Boolean).join(' · ')}</small></span></a>`:null}
  if(k==='news'){const n=news(id);return n?html`<div class="emb"><${NewsRow} n=${n}/></div>`:null}
  if(k==='yt')return html`<div class="emb yt"><iframe src=${'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)} allowFullscreen="" loading="lazy" title="video"/></div>`;
  return null};

export const Md=({text})=>{
  const blocks=(text||'').replace(/\r/g,'').split(/\n{2,}/).map(b=>b.trim()).filter(Boolean),out=[];
  blocks.forEach((b,bi)=>{
    const key='b'+bi;let x;
    if(x=b.match(/^\[\[(match|team|player|tour|news|yt):([^\]]+)\]\]$/))out.push(html`<${Embed} key=${key} k=${x[1]} id=${x[2].trim()}/>`);
    else if(x=b.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))out.push(html`<figure key=${key}><img src=${safe(x[2])} alt=${x[1]} loading="lazy"/>${x[1]&&html`<figcaption>${x[1]}</figcaption>`}</figure>`);
    else if(/^---+$/.test(b))out.push(html`<hr key=${key}/>`);
    else if(x=b.match(/^(#{1,3})\s+(.+)$/))out.push(x[1].length===1?html`<h2 key=${key}>${inline(x[2])}</h2>`:x[1].length===2?html`<h3 key=${key}>${inline(x[2])}</h3>`:html`<h4 key=${key}>${inline(x[2])}</h4>`);
    else if(b.split('\n').every(l=>/^>\s?/.test(l)))out.push(html`<blockquote key=${key}>${inline(b.split('\n').map(l=>l.replace(/^>\s?/,'')).join(' '))}</blockquote>`);
    else if(b.split('\n').every(l=>/^[-*]\s+/.test(l)))out.push(html`<ul key=${key}>${b.split('\n').map((l,i)=>html`<li key=${i}>${inline(l.replace(/^[-*]\s+/,''))}</li>`)}</ul>`);
    else if(b.split('\n').every(l=>/^\d+[.)]\s+/.test(l)))out.push(html`<ol key=${key}>${b.split('\n').map((l,i)=>html`<li key=${i}>${inline(l.replace(/^\d+[.)]\s+/,''))}</li>`)}</ol>`);
    else out.push(html`<p key=${key}>${b.split('\n').map((l,i)=>html`${i>0&&html`<br/>`}${inline(l,'l'+i)}`)}</p>`)});
  return html`<div class="md">${out}</div>`};
export const readTime=s=>Math.max(1,Math.round(((s||'').split(/\s+/).length)/180));
