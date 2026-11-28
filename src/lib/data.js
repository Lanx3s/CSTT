/* Слой данных: строки Supabase -> структуры, которыми пользуются страницы.
   Все ссылки между сущностями — это настоящие id из базы. */
import {sb} from './supabase.js';
import {demoData} from './demo.js';
import {autoAdvance} from './adv.js';
import {lang} from './i18n.js';

export const DEMO=!sb;
const KEYS=['teams','players','tournaments','matches','news','trophies','pstats','site','titles','tteams','maps','phist','profiles'];
const OPTIONAL=['titles','tteams','maps','phist','profiles'];   // таблицы появились в v3 — сайт не падает, если схему ещё не обновили

export let TEAMS=[],PL=[],MS=[],TR=[],NEWS=[],TROPH=[],PS=[],TI=[],TT=[],PH=[],MAPS=[],SITE={},rk=[],topP=[];
export let MISSING=[];
let _T=new Map(),_P=new Map(),_R=new Map(),_M=new Map(),_N=new Map();

export const num=v=>+v||0;
export const TBD={id:null,name:'TBD',tag:'TBD',col:'#3a4658',pl:[],tbd:true};
export const team=id=>id==null?TBD:(_T.get(+id)||TBD);
export const player=id=>_P.get(+id);
export const FA={id:null,tag:'—',col:'#3a4658',pl:[],tbd:true,fa:true,get name(){return lang==='ru'?'Без команды':'Free agent'}};
export const pteam=p=>p&&p.team!=null?team(p.team):FA;
export const tour=id=>_R.get(+id);
export const match=id=>_M.get(+id);
export const news=id=>_N.get(+id);
const ref=v=>v==null||v===''?null:+v;

/* ---- парсеры текстовых полей ---- */
const lines=s=>(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
/* «Mirage 13:9 | a | 8:4 5:5»   название счёт [live] | кто выбрал (a/b/d) | половины */
export const parseMaps=s=>lines(s).map(l=>{
  const [h,pk,hv]=l.split('|').map(x=>x.trim());
  const x=(h||'').match(/^(.+?)(?:\s+(\d+)\s*[:\-]\s*(\d+))?(\s+live)?$/i);if(!x)return null;
  const has=x[2]!=null;
  return {m:x[1],a:has?+x[2]:null,b:has?+x[3]:null,live:!!x[4],pick:(pk||'').toLowerCase().slice(0,1),h:(hv||'').split(/[\s:,]+/).filter(Boolean).map(Number).filter(n=>!isNaN(n))}}).filter(Boolean);
export const mapsToText=a=>a.map(x=>{let s=x.m;if(x.a!=null&&x.a!==''&&x.b!=null&&x.b!=='')s+=' '+x.a+':'+x.b;if(x.live)s+=' live';if(x.pick||(x.h&&x.h.length))s+=' | '+(x.pick||'');if(x.h&&x.h.length)s+=' | '+x.h.join(' ');return s}).join('\n');
/* «a ban Nuke», «b pick Mirage», «d left Inferno» */
export const parseVeto=s=>lines(s).map(l=>{const x=l.match(/^(a|b|d)\s+(ban|pick|left)\s+(.+)$/i);return x?{t:x[1].toLowerCase(),k:x[2].toLowerCase(),m:x[3].trim()}:null}).filter(Boolean);
export const vetoToText=a=>a.filter(x=>x.m).map(x=>x.t+' '+x.k+' '+x.m).join('\n');
export const parsePool=s=>(s||'').split(/[,\n;]+/).map(x=>x.trim()).filter(Boolean);

/* серия по счёту на картах: победы, нужные для победы, итоговый статус */
export const seriesOf=(maps,bo)=>{let a=0,b=0;(maps||[]).forEach(x=>{if(x.a!=null&&x.b!=null&&!x.live){if(+x.a>+x.b)a++;else if(+x.b>+x.a)b++}});
  const need=Math.ceil((+bo||3)/2),played=(maps||[]).filter(x=>x.a!=null&&!x.live).length;
  return {a,b,need,played,done:a>=need||b>=need||(bo==2&&played>=2)}};

/* дата матча «17.11» + «19:00» -> Date (год не указан — берём текущий) */
export const when=m=>{
  const d=(m.d||'').trim();if(!d)return null;
  let y,mo,da,x;
  if(x=d.match(/^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?$/)){da=+x[1];mo=+x[2];y=x[3]?+x[3]:new Date().getFullYear();if(y<100)y+=2000}
  else if(x=d.match(/^(\d{4})-(\d{2})-(\d{2})$/)){y=+x[1];mo=+x[2];da=+x[3]}
  else return null;
  let hh=0,mm=0;const tx=(m.tm||'').match(/(\d{1,2}):(\d{2})/);if(tx){hh=+tx[1];mm=+tx[2]}
  const dt=new Date(y,mo-1,da,hh,mm);return isNaN(dt)?null:dt};

export const load=d=>{
  TEAMS=(d.teams||[]).map(x=>({id:x.id,name:x.name||'',tag:x.tag||(x.name||'').slice(0,3).toUpperCase(),cc:(x.cc||'').trim().toUpperCase(),col:x.col||'#445066',logo:x.logo,pts:num(x.pts),ch:num(x.ch),coach:x.coach||'',about:x.about||'',region:x.region||'',flag:x.flag,weeks:x.weeks==null||x.weeks===''?null:num(x.weeks),banner:x.banner,founded:x.founded||'',slogan:x.slogan||'',web:x.web||'',tw:x.tw||'',tg:x.tg||'',col2:x.col2||'',elo:num(x.elo),pl:[],subs:[]}));
  _T=new Map(TEAMS.map(x=>[x.id,x]));
  PL=(d.players||[]).map(p=>{const tm=_T.has(p.team)?p.team:null;const o={id:p.id,nick:p.nick||'',name:p.name||'',cc:(p.cc||'').trim().toUpperCase(),flag:p.flag,role:p.role||'',age:num(p.age),hs:num(p.hs),team:tm,photo:p.photo,prev:p.prev||'',banner:p.banner,about:p.about||'',since:p.since||'',tw:p.tw||'',tt:p.tt||'',ig:p.ig||'',rt:num(p.rt),kd:num(p.kd),adr:num(p.adr),kast:num(p.kast),maps:num(p.maps),kpr:num(p.kpr),dpr:num(p.dpr),imp:num(p.imp),prize:p.prize||'',bgm:p.bgm||'',bgb:p.bgb||'',bgc:p.bgc||'',bgp:p.bgp||'',elo:num(p.elo),sub:num(p.sub)?1:0};if(tm!=null)(o.sub?_T.get(tm).subs:_T.get(tm).pl).push(o);return o});
  _P=new Map(PL.map(x=>[x.id,x]));
  TEAMS.forEach(x=>x.pl.sort((a,b)=>b.rt-a.rt));
  TR=(d.tournaments||[]).map(o=>({id:o.id,bgs:o.bgs||'',n:o.n||'',d:o.d||'',pr:o.pr||'',tn:num(o.tn),st:o.st||'',s:o.s||'up',img:o.img,logo:o.logo,col:o.col||'',loc:o.loc||'',fmt:o.fmt||'',organizer:o.organizer||'',tier:o.tier||'',stream:o.stream||'',rules:o.rules||'',pool:parsePool(o.mappool),sw:num(o.sw)||3,sl:num(o.sl)||3,adv:num(o.adv)||2,prizes:lines(o.prizes).map(l=>l.split('|').map(x=>x.trim())),winner:_T.has(o.winner)?o.winner:null,mvp:o.mvp,trophy:o.trophy,ds:[o.ru||o.en||'',o.en||o.ru||'']}));
  _R=new Map(TR.map(x=>[x.id,x]));
  MS=(d.matches||[]).map(m=>({id:m.id,tour:m.tour,ord:num(m.ord),rnd:num(m.rnd),grp:m.grp||'',a:_T.has(m.a)?m.a:null,b:_T.has(m.b)?m.b:null,s1:num(m.s1),s2:num(m.s2),st:m.st||'up',bo:num(m.bo)||3,d:m.d||'',tm:m.tm||'',stage:m.stage||'',note:m.note||'',stream:m.stream||'',mvp:ref(m.mvp),maps:parseMaps(m.maps),veto:parseVeto(m.veto)})).map(m=>{const w=when(m);return {...m,ts:w?+w:0}});
  /* если админ внёс счёт только по картам — считаем счёт серии и статус сами */
  MS.forEach(m=>{const S=seriesOf(m.maps,m.bo);
    if(!S.played&&!m.maps.some(x=>x.live))return;
    if(m.s1===0&&m.s2===0&&(S.a||S.b)){m.s1=S.a;m.s2=S.b}
    if(m.st!=='fin'){if(S.done){m.st='fin'}else if(m.st==='up'&&(S.played||m.maps.some(x=>x.live)))m.st='live'}});
  MS.sort((x,y)=>y.id-x.id);
  _M=new Map(MS.map(x=>[x.id,x]));
  const sp=(a,b)=>[a||b||'',b||a||''];
  NEWS=(d.news||[]).map(n=>({id:n.id,bgs:n.bgs||'',c:n.c||'#b3261e',tag:n.tag||'CSTT',d:n.d||'',img:n.img,bg:n.bg,author:n.author||'',layout:n.layout||'hltv',gallery:(n.gallery||'').split('\n').map(x=>x.trim()).filter(Boolean),pin:num(n.pin),tour:ref(n.tour),team:ref(n.team),ti:sp(n.ru,n.en),sub:sp(n.sub_ru,n.sub_en),body:sp(n.body_ru,n.body_en)})).reverse();
  NEWS.sort((a,b)=>b.pin-a.pin);   // закреплённые вверху, внутри — новые первыми
  _N=new Map(NEWS.map(x=>[x.id,x]));
  TROPH=(d.trophies||[]).filter(x=>_T.has(x.team)).map(x=>({id:x.id,team:x.team,tour:x.tour,title:x.title||'',place:x.place||'',year:x.year||'',prize:x.prize||'',img:x.img,pl:(x.pl||'').split(/[\s,;]+/).filter(Boolean).map(Number)})).reverse();
  PS=(d.pstats||[]).map(x=>({m:x.match,p:x.player,k:num(x.k),d:num(x.d),a:num(x.a),adr:num(x.adr),kast:num(x.kast),hs:num(x.hs),rt:num(x.rt)}));
  TI=(d.titles||[]).map(x=>({id:x.id,player:ref(x.player),team:ref(x.team),title:x.title||'',sub:x.sub||'',kind:x.kind||'custom',col:x.col||'',icon:x.icon||'',img:x.img,year:x.year||'',tour:ref(x.tour),ord:num(x.ord)})).sort((a,b)=>a.ord-b.ord||b.id-a.id);
  TT=(d.tteams||[]).filter(x=>_T.has(x.team)).map(x=>({id:x.id,tour:x.tour,team:x.team,grp:x.grp||'',seed:num(x.seed),note:x.note||''}));
  PH=(d.phist||[]).map(x=>({id:x.id,player:ref(x.player),team:_T.has(x.team)?x.team:null,dates:x.dates||'',ord:num(x.ord),tro:(x.tro||'').split(/[\s,;]+/).filter(Boolean).map(Number),hide:x.hide==1||x.hide==='1'})).sort((a,b)=>a.ord-b.ord||a.id-b.id);
  MAPS=(d.maps||[]).map(x=>({id:x.id,name:x.name||'',img:x.img,col:x.col||'',active:x.active!==0&&x.active!=='0',cmp:x.cmp!==0&&x.cmp!=='0',ord:num(x.ord)}));
  {const DEF=['Dust2','Mirage','Inferno','Nuke','Ancient','Anubis','Cache','Train','Overpass','Vertigo'],nz=s=>(s||'').toLowerCase().replace(/^de[_ ]/,'').replace(/[^a-z0-9]/g,'');
   if(!MAPS.length)MAPS=DEF.map((n,i)=>({id:-1-i,name:n,img:null,col:'',active:true,cmp:true,ord:i+1}));
   else if(!MAPS.some(x=>nz(x.name)==='cache'))MAPS.push({id:-99,name:'Cache',img:null,col:'',active:true,cmp:true,ord:7})}
  /* Swiss: команды сами попадают в матчи следующего раунда по своему рекорду (W-L), пары по посеву: сильнейший — слабейший */
  const SWQ=new Map();
  {const BKR=/^\d+-\d+$/,rank=new Map(TEAMS.map(x=>[x.id,x.pts]));
   [...new Set(MS.filter(m=>m.stage==='Swiss').map(m=>m.tour))].forEach(o=>{
     const sm=MS.filter(m=>m.tour===o&&m.stage==='Swiss'),rounds=[...new Set(sm.map(m=>m.rnd||1))].sort((a,b)=>a-b),seed=new Map(TT.filter(x=>x.tour===o).map(x=>[x.team,x.seed||999]));
     const sd=id=>(seed.get(id)??999)*1e6-(rank.get(id)||0),rec=new Map();
     sm.forEach(m=>{[m.a,m.b].forEach(id=>{if(id!=null&&!rec.has(id))rec.set(id,[0,0])})});TT.filter(x=>x.tour===o).forEach(x=>{if(!rec.has(x.team))rec.set(x.team,[0,0])});
     rounds.forEach((r,ri)=>{const list=sm.filter(m=>(m.rnd||1)===r).sort((x,y)=>x.ord-y.ord||x.id-y.id);
       list.forEach(m=>{if(BKR.test(m.grp)){const [gw,gl]=m.grp.split('-').map(Number);[m.a,m.b].forEach(id=>{if(id!=null)rec.set(id,[gw,gl])})}});
       if(ri>0){const prev=sm.filter(m=>(m.rnd||1)===rounds[ri-1]),placed=new Set();list.forEach(m=>{if(m.a!=null)placed.add(m.a);if(m.b!=null)placed.add(m.b)});
         const pl2=new Set();sm.filter(m=>(m.rnd||1)<r&&m.a!=null&&m.b!=null).forEach(m=>pl2.add(Math.min(m.a,m.b)+'-'+Math.max(m.a,m.b)));const done=id=>!prev.some(m=>(m.a===id||m.b===id)&&m.st!=='fin');
         const keys=[...new Set(list.map(m=>m.grp).filter(k=>BKR.test(k)))];
         keys.forEach(k=>{const [w,l]=k.split('-').map(Number),slots=list.filter(m=>m.grp===k&&(m.a==null||m.b==null));if(!slots.length)return;
           const cand=[...rec.entries()].filter(([id,v])=>v[0]===w&&v[1]===l&&!placed.has(id)&&done(id)).map(x=>x[0]).sort((a,b)=>sd(a)-sd(b));
           slots.forEach(m=>{if(m.a==null&&m.b==null){if(cand.length>=2){const a=cand.shift();let j=cand.length-1;while(j>0&&pl2.has(Math.min(a,cand[j])+'-'+Math.max(a,cand[j])))j--;m.a=a;m.b=cand.splice(j,1)[0]}}
             else{const f=m.a==null?'a':'b';if(cand.length){m[f]=f==='a'?cand.shift():cand.pop()}}});
           cand.length=0})}
       list.forEach(m=>{if(m.st!=='fin'||m.s1===m.s2||m.a==null||m.b==null)return;const wn=m.s1>m.s2?m.a:m.b,ls=wn===m.a?m.b:m.a;const x=rec.get(wn)||[0,0],y=rec.get(ls)||[0,0];rec.set(wn,[x[0]+1,x[1]]);rec.set(ls,[y[0],y[1]+1])})});
     const to=TR.find(x=>x.id===o),Wn=(to&&to.sw)||3,q=[...rec.entries()].filter(([id,v])=>v[0]>=Wn).sort((a,b)=>a[1][1]-b[1][1]||sd(a[0])-sd(b[0])).map(x=>x[0]);if(q.length)SWQ.set(o,q)})}
  autoAdvance(MS,TT,TR,SWQ);
  SITE=(d.site&&d.site[0])||{};
  rk=[...TEAMS].sort((a,b)=>b.pts-a.pts);rk.forEach((x,i)=>x.rank=i+1);
  topP=[...PL].sort((a,b)=>b.rt-a.rt);
  applyTheme(SITE)};

export const mainT=()=>TR.find(o=>o.s==='live')||TR.find(o=>o.s==='up')||TR[0];

/* ---- оформление сайта из настроек (accent, тема, фон, ширина …) ---- */
export const THEMES=[['hltv','Тёмный графит (как HLTV)'],['graphite','Серый'],['black','Чёрный (OLED)'],['midnight','Глубокий синий'],['light','Светлый']];
export const applyTheme=S=>{
  if(typeof document==='undefined')return;
  const r=document.documentElement.style,set=(k,v)=>v?r.setProperty(k,v):r.removeProperty(k);
  const hx=v=>/^#[0-9a-fA-F]{3,8}$/.test(v||'')?v:'',nm=(v,a,z)=>{const n=parseFloat(v);return isFinite(n)&&n>=a&&n<=z?n:null};
  set('--r',hx(S.color)||'#d4141c');set('--r2',hx(S.color2));
  document.documentElement.dataset.theme=S.theme||'hltv';
  {const v=nm(S.radius,0,16);set('--rad',v!=null?v+'px':'')}
  {const v=nm(S.width,960,2200);set('--w',v!=null?v+'px':'')}
  set('--fs',S.density==='compact'?'12px':S.density==='large'?'14px':'');
  const F={tahoma:'Tahoma,Verdana,sans-serif',segoe:'"Segoe UI",Roboto,Arial,sans-serif',arial:'Arial,Helvetica,sans-serif',inter:'Inter,Arial,sans-serif',roboto:'Roboto,Arial,sans-serif',montserrat:'Montserrat,Arial,sans-serif',rubik:'Rubik,Arial,sans-serif',exo:'"Exo 2",Arial,sans-serif',plex:'"IBM Plex Sans",Arial,sans-serif',oswald:'Oswald,"Arial Narrow",sans-serif',mono:'"JetBrains Mono",Consolas,monospace'};
  const G={inter:'Inter:wght@400;600;800',roboto:'Roboto:wght@400;500;700',montserrat:'Montserrat:wght@400;600;800',rubik:'Rubik:wght@400;500;700',exo:'Exo+2:wght@400;600;800',plex:'IBM+Plex+Sans:wght@400;600;700',oswald:'Oswald:wght@400;500;700',mono:'JetBrains+Mono:wght@400;700'};
  const want=[...new Set([S.font,S.fonth].filter(k=>G[k]))].map(k=>'family='+G[k]).join('&');
  let fl=document.getElementById('site-fonts');
  if(want){const href='https://fonts.googleapis.com/css2?'+want+'&display=swap';if(!fl){fl=document.createElement('link');fl.id='site-fonts';fl.rel='stylesheet';document.head.appendChild(fl)}if(fl.href!==href)fl.href=href}else if(fl)fl.remove();
  set('--font',F[S.font]||'');set('--fonth',F[S.fonth]||'');
  {const v=nm(S.fsize,11,17);if(v!=null)set('--fs',v+'px')}
  set('--fw',['500','700','800'].includes(String(S.fweight))?String(S.fweight):'');
  set('--bgimg',S.bgimg?'url("'+S.bgimg+'")':'none');{const v=nm(S.bgdim,0,100);set('--bgdim',v!=null?String(v/100):'')}
  let st=document.getElementById('site-css');if(!st){st=document.createElement('style');st.id='site-css';document.head.appendChild(st)}
  st.textContent=S.css||''};

export const fetchAll=async()=>{
  if(!sb){const d=demoData();load(d);MISSING=[];return d}
  const r=await Promise.all(KEYS.map(k=>sb.from(k).select('*').order('id')));
  const o={};MISSING=[];
  r.forEach((x,i)=>{
    if(x.error){if(OPTIONAL.includes(KEYS[i])){MISSING.push(KEYS[i]);o[KEYS[i]]=[];return}throw new Error(KEYS[i]+': '+x.error.message)}
    o[KEYS[i]]=x.data});
  return o};
