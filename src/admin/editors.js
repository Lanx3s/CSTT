/* Специальные редакторы полей админки */
import {COUNTRIES} from '../lib/countries.js';
import {ccCode} from '../components/common.js';
import {useState,useRef} from 'react';
import {html} from '../lib/html.js';
import {sb} from '../lib/supabase.js';
import {uploadImage} from '../lib/auth.js';
import {parseMaps,mapsToText,parseVeto,vetoToText,parsePool} from '../lib/data.js';
import {Md} from '../components/Md.js';
import {DEF_MAPS} from './schema.js';

export const mapNames=D=>[...new Set([...(D.maps||[]).map(m=>m.name),...DEF_MAPS])].filter(Boolean);

/* ---- выбор карт мап-пула ---- */
export const MapSel=({v,set,D})=>{
  const sel=parsePool(v),names=mapNames(D),tog=n=>set(sel.includes(n)?sel.filter(x=>x!==n).join(', '):[...sel,n].join(', '));
  return html`<div class="chips">${names.map(n=>html`<button type="button" key=${n} class=${'ch '+(sel.includes(n)?'on':'')} onClick=${()=>tog(n)}>${sel.includes(n)?(sel.indexOf(n)+1)+'. ':''}${n}</button>`)}<button type="button" class="ch" onClick=${()=>set('')}>Очистить</button></div>`};

/* ---- страна по коду (RU, EU …) с флагом ---- */
export const CcSel=({v,set})=>{
  const cur=(v||'').trim().toUpperCase(),known=COUNTRIES.some(c=>c[0]===cur),k=ccCode(cur);
  return html`<div class="ccsel">${k?html`<img class="ccimg" src=${'https://flagcdn.com/w40/'+k+'.png'} alt=""/>`:cur?html`<span class="ccbad" title="Неизвестный код — флага не будет">?</span>`:null}<select value=${cur} onChange=${e=>set(e.target.value)}><option value="">— не выбрана —</option>${!known&&cur&&html`<option value=${cur}>${cur}${k?'':' (неизвестный код)'}</option>`}${COUNTRIES.map(c=>html`<option key=${c[0]} value=${c[0]}>${c[0]} — ${c[1]}</option>`)}</select></div>`};

/* ---- выбор игроков (id через запятую) ---- */
export const PlSel=({v,set,D})=>{
  const [q,sq]=useState(''),sel=(v||'').split(/[\s,;]+/).filter(Boolean).map(Number),tm=id=>((D.teams||[]).find(x=>x.id===id)||{}).tag||'—',
    tog=id=>set((sel.includes(id)?sel.filter(x=>x!==id):[...sel,id]).join(', '));
  const list=(D.players||[]).filter(p=>sel.includes(p.id)||!q||(p.nick||'').toLowerCase().includes(q.toLowerCase()));
  return html`<div><input placeholder="Найти игрока…" value=${q} onChange=${e=>sq(e.target.value)}/><div class="chips">${list.map(p=>html`<button type="button" key=${p.id} class=${'ch '+(sel.includes(p.id)?'on':'')} onClick=${()=>tog(p.id)}>${p.nick} <small>${tm(p.team)}</small></button>`)}</div></div>`};

/* ---- карты матча: название, счёт, кто выбрал, половины, live ---- */
export const MapsEd=({v,set,D})=>{
  const [rows,sr]=useState(()=>parseMaps(v).map(x=>({m:x.m,a:x.a??'',b:x.b??'',pick:x.pick||'',live:x.live,h:(x.h||[]).join(' ')})));
  const names=mapNames(D),push=r=>{sr(r);set(mapsToText(r.map(x=>({m:x.m,a:x.a===''?null:x.a,b:x.b===''?null:x.b,live:x.live,pick:x.pick,h:x.h.split(/[\s:,]+/).filter(Boolean).map(Number)}))))};
  const up=(i,k,val)=>push(rows.map((x,j)=>j===i?{...x,[k]:val}:x));
  return html`<div class="rows">${rows.map((x,i)=>html`<div class="rw" key=${i}><b>${i+1}</b>
<select value=${x.m} onChange=${e=>up(i,'m',e.target.value)}><option value="">Карта…</option>${names.map(n=>html`<option key=${n}>${n}</option>`)}</select>
<input type="number" class="sm" placeholder="счёт 1" value=${x.a} onChange=${e=>up(i,'a',e.target.value)}/><span>:</span><input type="number" class="sm" placeholder="счёт 2" value=${x.b} onChange=${e=>up(i,'b',e.target.value)}/>
<select value=${x.pick} onChange=${e=>up(i,'pick',e.target.value)}><option value="">Выбор: —</option><option value="a">Выбрала команда 1</option><option value="b">Выбрала команда 2</option><option value="d">Решающая</option></select>
<input class="md" placeholder="половины: 8 4 5 5" title="1-я половина (к1 к2), 2-я половина (к1 к2)" value=${x.h} onChange=${e=>up(i,'h',e.target.value)}/>
<label class="lv"><input type="checkbox" checked=${x.live} onChange=${e=>up(i,'live',e.target.checked)}/> live</label>
<button type="button" class="b d" onClick=${()=>push(rows.filter((_,j)=>j!==i))}>×</button></div>`)}
<button type="button" class="b g" onClick=${()=>push([...rows,{m:'',a:'',b:'',pick:'',live:false,h:''}])}>+ карта</button></div>`};

/* ---- вето ---- */
export const VetoEd=({v,set,D})=>{
  const [rows,sr]=useState(()=>parseVeto(v)),names=mapNames(D),push=r=>{sr(r);set(vetoToText(r))};
  const up=(i,k,val)=>push(rows.map((x,j)=>j===i?{...x,[k]:val}:x));
  const tpl=bo=>push(({1:['a ban','b ban','a ban','b ban','a ban','b ban'],3:['a ban','b ban','a pick','b pick','a ban','b ban'],5:['a ban','b ban','a pick','b pick','a pick','b pick']}[bo]).map(s=>({t:s[0],k:s.slice(2),m:''})).concat([{t:'d',k:'left',m:''}]));
  return html`<div class="rows"><div class="tp">Шаблон: <button type="button" class="b g" onClick=${()=>tpl(1)}>BO1</button><button type="button" class="b g" onClick=${()=>tpl(3)}>BO3</button><button type="button" class="b g" onClick=${()=>tpl(5)}>BO5</button></div>
${rows.map((x,i)=>html`<div class="rw" key=${i}><b>${i+1}</b>
<select value=${x.t} onChange=${e=>up(i,'t',e.target.value)}><option value="a">Команда 1</option><option value="b">Команда 2</option><option value="d">Решающая</option></select>
<select value=${x.k} onChange=${e=>up(i,'k',e.target.value)}><option value="ban">убрала (бан)</option><option value="pick">выбрала (пик)</option><option value="left">осталась</option></select>
<select value=${x.m} onChange=${e=>up(i,'m',e.target.value)}><option value="">Карта…</option>${names.map(n=>html`<option key=${n}>${n}</option>`)}</select>
<button type="button" class="b d" onClick=${()=>push(rows.filter((_,j)=>j!==i))}>×</button></div>`)}
<button type="button" class="b g" onClick=${()=>push([...rows,{t:'a',k:'ban',m:''}])}>+ шаг</button></div>`};

/* ---- призовые ---- */
export const PrizeEd=({v,set,D})=>{
  const parse=()=>(v||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const [a,b,c]=l.split('|').map(x=>x.trim());return {p:a||'',s:b||'',t:c||''}});
  const [rows,sr]=useState(parse),push=r=>{sr(r);set(r.map(x=>[x.p,x.s,x.t].join(' | ')).join('\n'))},up=(i,k,val)=>push(rows.map((x,j)=>j===i?{...x,[k]:val}:x));
  return html`<div class="rows">${rows.map((x,i)=>html`<div class="rw" key=${i}><input class="sm2" placeholder="Место" value=${x.p} onChange=${e=>up(i,'p',e.target.value)}/><input class="sm2" placeholder="$25,000" value=${x.s} onChange=${e=>up(i,'s',e.target.value)}/>
<select value=${x.t} onChange=${e=>up(i,'t',e.target.value)}><option value="">Команда: —</option>${D.teams.map(t=>html`<option key=${t.id} value=${t.id}>${t.name}</option>`)}</select><button type="button" class="b d" onClick=${()=>push(rows.filter((_,j)=>j!==i))}>×</button></div>`)}
<button type="button" class="b g" onClick=${()=>push([...rows,{p:(rows.length+1)+' место',s:'',t:''}])}>+ строка</button></div>`};

/* ---- текст поста с панелью оформления и предпросмотром ---- */
export const MdEd=({v,set,D})=>{
  const ref=useRef(),[pv,sp]=useState(false),[et,se]=useState('match'),[ei,sei]=useState(''),[bz,sb2]=useState(false);
  const ins=(pre,post='',ph='')=>{const el=ref.current,s=el.selectionStart,e=el.selectionEnd,val=v||'',mid=val.slice(s,e)||ph,out=val.slice(0,s)+pre+mid+post+val.slice(e);set(out);setTimeout(()=>{el.focus();el.setSelectionRange(s+pre.length,s+pre.length+mid.length)},0)};
  const line=(pre)=>{const el=ref.current,s=el.selectionStart,val=v||'',ls=val.lastIndexOf('\n',s-1)+1;set(val.slice(0,ls)+pre+val.slice(ls))};
  const blk=txt=>{const el=ref.current,s=el.selectionEnd,val=v||'';set(val.slice(0,s)+'\n\n'+txt+'\n\n'+val.slice(s))};
  const img=async e=>{const f=e.target.files[0];if(!f)return;sb2(true);try{blk('!['+(f.name.replace(/\.[^.]+$/,''))+']('+await uploadImage(f)+')')}catch(x){alert('Ошибка загрузки: '+x.message)}sb2(false);e.target.value=''};
  const opts={match:D.matches.slice().reverse().map(m=>[m.id,((D.teams.find(t=>t.id==m.a)||{}).name||'TBD')+' — '+((D.teams.find(t=>t.id==m.b)||{}).name||'TBD')+' ('+(m.d||'')+')']),team:D.teams.map(t=>[t.id,t.name]),player:D.players.map(p=>[p.id,p.nick]),tour:D.tournaments.map(t=>[t.id,t.n]),news:D.news.map(n=>[n.id,n.ru||n.en])};
  return html`<div class="mded"><div class="tb">
<button type="button" onClick=${()=>ins('**','**','жирный')}><b>B</b></button><button type="button" onClick=${()=>ins('*','*','курсив')}><i>I</i></button>
<button type="button" onClick=${()=>line('## ')}>H2</button><button type="button" onClick=${()=>line('### ')}>H3</button><button type="button" onClick=${()=>line('> ')}>❝</button><button type="button" onClick=${()=>line('- ')}>• список</button>
<button type="button" onClick=${()=>ins('[',']('+'https://)','текст ссылки')}>🔗</button><label class="b g up2">${bz?'…':'🖼 картинка'}<input type="file" accept="image/*" hidden onChange=${img}/></label>
<button type="button" onClick=${()=>blk('---')}>—</button><span class="sp"/><button type="button" class=${pv?'on':''} onClick=${()=>sp(!pv)}>${pv?'Редактор':'Предпросмотр'}</button></div>
${pv?html`<div class="pvw"><${Md} text=${v}/></div>`:html`<textarea ref=${ref} rows="14" value=${v||''} onChange=${e=>set(e.target.value)} placeholder="Пустая строка — новый абзац. Можно вставлять карточки матчей, команд, игроков, турниров."/>`}
<div class="tb emb"><span>Вставить карточку:</span><select value=${et} onChange=${e=>{se(e.target.value);sei('')}}><option value="match">Матч</option><option value="team">Команда</option><option value="player">Игрок</option><option value="tour">Турнир</option><option value="news">Новость</option></select>
<select value=${ei} onChange=${e=>sei(e.target.value)}><option value="">Выберите…</option>${opts[et].map(([a,b])=>html`<option key=${a} value=${a}>${b}</option>`)}</select><button type="button" disabled=${!ei} onClick=${()=>{blk('[['+et+':'+ei+']]');sei('')}}>Вставить</button>
<button type="button" onClick=${()=>{const id=prompt('ID видео YouTube (например dQw4w9WgXcQ)');if(id)blk('[[yt:'+id.trim()+']]')}}>▶ YouTube</button></div></div>`};

/* ---- палитра цвета фона за фото игрока ---- */
export const PALETTE=['#3f9b52','#1f9d8f','#1c8fb5','#2f6fd0','#4a55d0','#8a4fd0','#c04fb0','#d04f7f','#d03f3f','#e0702f','#e0a82f','#c9c93a','#8fc83a','#5a6a82','#3d4658','#8a5a3a','#c8d0dc','#15181e'];
export const PalSel=({v,set})=>{
  const cur=/^#[0-9a-f]{6}$/i.test(v||'')?v.toLowerCase():'';
  return html`<div class="pal"><div class="pal-g">${PALETTE.map(c=>html`<button type="button" key=${c} class=${'pal-s'+(cur===c?' on':'')} style=${{background:c}} title=${c} onClick=${()=>set(c)}></button>`)}</div>
<div class="pal-r"><input type="color" value=${cur||'#3f9b52'} onChange=${e=>set(e.target.value)}/><input class="sm" placeholder="#3f9b52" value=${v||''} onChange=${e=>set(e.target.value.trim())}/><button type="button" class="b g" onClick=${()=>set('')}>Сбросить</button><span class="pal-p" style=${{background:cur?`radial-gradient(120% 90% at 50% 25%,${cur},#0d1117 78%)`:'#0d1117'}}></span></div></div>`};

/* ---- выбор трофеев игрока за конкретную команду ---- */
export const TroSel=({v,set,D,team})=>{
  const sel=(v||'').split(/[\s,;]+/).filter(Boolean).map(Number),tid=Number(team);
  if(!tid)return html`<div class="hint">Сначала выберите команду выше.</div>`;
  const list=(D.trophies||[]).filter(y=>Number(y.team)===tid||sel.includes(y.id)),tn=id=>((D.tournaments||[]).find(x=>x.id===id)||{}).n,
    tog=id=>set((sel.includes(id)?sel.filter(x=>x!==id):[...sel,id]).join(', '));
  return list.length?html`<div class="chips">${list.map(y=>html`<button type="button" key=${y.id} class=${'ch '+(sel.includes(y.id)?'on':'')} onClick=${()=>tog(y.id)}>${y.title||tn(y.tour)||'Трофей'} <small>${[y.place,y.year].filter(Boolean).join(' · ')}</small></button>`)}</div>`:html`<div class="hint">У этой команды пока нет трофеев — добавьте их во вкладке «Достижения команд».</div>`};
