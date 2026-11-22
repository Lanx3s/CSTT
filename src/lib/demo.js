/* Демо-данные: показываются, пока Supabase не подключён. Всё генерируется кодом,
   даты считаются от сегодняшнего дня, поэтому сайт всегда выглядит «живым». */
const mulberry=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let rng=mulberry(20261121);
const ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),pick=a=>a[Math.floor(rng()*a.length)];
const p2=v=>String(v).padStart(2,'0');
const day=o=>{const d=new Date();d.setDate(d.getDate()+o);return p2(d.getDate())+'.'+p2(d.getMonth()+1)};
const rangeD=(a,b)=>{const e=new Date();e.setDate(e.getDate()+b);return day(a)+' – '+day(b)+'.'+e.getFullYear()};

const art=(c1,c2,s=1,w=800,h=450)=>{const r=mulberry(s*977);let sh='';
  for(let i=0;i<16;i++){const x=r()*w,y=r()*h,l=60+r()*260,k=r()*40-20;sh+=`<polygon points="${x},${y} ${x+l},${y+k} ${x+l+30},${y+k+70} ${x+30},${y+70}" fill="#fff" opacity="${(.025+r()*.07).toFixed(3)}"/>`}
  for(let i=0;i<3;i++)sh+=`<circle cx="${r()*w}" cy="${r()*h}" r="${40+r()*120}" fill="${c2}" opacity=".18"/>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${sh}</svg>`)};
const logo=(tag,col)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 4 90 18v30c0 25-17 41-40 48C27 89 10 73 10 48V18z" fill="${col}"/><path d="M50 4 90 18v30c0 25-17 41-40 48z" fill="#000" opacity=".16"/><text x="50" y="60" font-family="Arial" font-weight="900" font-size="${tag.length>3?24:30}" fill="#fff" text-anchor="middle">${tag}</text></svg>`);

const TD=[['Vortex','VTX','ru','#e0412f','Europe'],['Nordic Wolves','NWF','se','#3c7bd9','Europe'],['Iron Legion','ILG','de','#7d8794','Europe'],['Crimson Tide','CRT','us','#c2263f','Americas'],['Aurora','AUR','fi','#35b0a8','Europe'],['Ghost Protocol','GPR','pl','#8e5bd6','Europe'],['Black Mamba','BMB','br','#d9a521','Americas'],['Zenith','ZNT','ua','#3f93d8','Europe'],['Phoenix Rising','PHX','fr','#e5702a','Europe'],['Steel Hawks','SHK','dk','#5d6b80','Europe'],['Lunar Eclipse','LNE','kz','#4aa9c9','CIS'],['Titan Forge','TFG','tr','#b5382f','Europe'],['Neon Syndicate','NSY','gb','#c040c4','Europe'],['Dragon Clan','DRC','cn','#d4402f','Asia'],['Storm Riders','STR','au','#3a9d6a','Oceania'],['Apex Predators','APX','ca','#7a4be0','Americas']];
const NICK=[['s1mple_x','Mirage','Kron','Dexter','Volt'],['Fenrir','Skuld','Bjorn','Ulfr','Rune'],['Panzer','Kaiser','Blitz','Falk','Stahl'],['Maverick','Jinx','Cobra','Bishop','Rook'],['Kettu','Lumi','Tuli','Revontuli','Yo'],['Duch','Kosa','Bartek','Wilk','Cygan'],['Veneno','Furia','Capiva','Sombra','Raio'],['Dniprо','Hryts','Sirko','Bohdan','Zir'],['Corbeau','Lumiere','Faucon','Braise','Orage'],['Stalbjorn','Odin','Havn','Thrym','Kvist'],['Batyr','Sunkar','Aqsh','Nomad','Tulpar'],['Demir','Kaplan','Yildiz','Kurt','Bora'],['Static','Glitch','Pixel','Raze','Cipher'],['Longwei','Xiao','Tianqi','Jian','Feng'],['Dingo','Bruce','Kookab','Outback','Sheila'],['Moose','Maple','Grizz','Hoser','Ice']];
const ROLES=['IGL','AWPer','Entry','Support','Lurker'];
const POOL=['Ancient','Anubis','Cache','Dust2','Inferno','Mirage','Nuke','Overpass'];
const MAPCOL={Cache:['#8f9a4a','#2c3216'],Ancient:['#4f7d45','#16301a'],Anubis:['#c49a3a','#4a3410'],Dust2:['#c8a15e','#503a18'],Inferno:['#bf5b34','#451a0c'],Mirage:['#d1a864','#5a3d17'],Nuke:['#4e91c4','#14304a'],Overpass:['#4f8f6a','#143a2a'],Train:['#7c8493','#262c36'],Vertigo:['#4aa6d1','#12384c']};

export const demoData=()=>{
  rng=mulberry(20261121);
  const fl=col=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect width="30" height="7" fill="#fff"/><rect y="7" width="30" height="6" fill="${col}"/><rect y="13" width="30" height="7" fill="#222"/></svg>`);
  const teams=TD.map((x,i)=>({id:i+1,name:x[0],tag:x[1],cc:x[2],col:x[3],region:x[4],pts:1000-i*47+ri(-12,12),ch:ri(-3,4),coach:pick(['Kasper','Zonic','Karrigan','Dev1ce','Hunter','Thorin']),logo:i<8?logo(x[1],x[3]):null,flag:i<10?fl(x[3]):null,weeks:i<8?ri(1,40):null,banner:i%3===0?art(x[3],'#0c1117',i+3):null,founded:String(2014+(i%9)),slogan:i<4?['Играем до конца','Fear the Wolves','Iron will','Ride the Tide'][i]:'',about:i<3?'Одна из сильнейших команд сезона. Базируется в '+x[4]+', четыре года подряд — в топ-10 рейтинга CSTT.':'',web:i<3?'https://example.com':'',tw:i<3?'https://x.com/':'',tg:i<2?'https://t.me/':''}));
  teams.sort((a,b)=>b.pts-a.pts);const S={};teams.forEach((x,i)=>S[x.id]=95-i*2.4);
  const players=[];teams.forEach((tm,ti)=>{const ix=TD.findIndex(x=>x[0]===tm.name);NICK[ix].forEach((nick,j)=>{
    const base=1.22-ti*.028+ri(-9,9)/100;
    players.push({id:ix*5+j+1,nick,name:pick(['Алексей','Daniel','Marco','Ivan','Lukas','Tomas','Ahmet','Chen','Sam','Pavel'])+' '+pick(['K.','M.','S.','V.','L.']),team:tm.id,cc:j===4&&ti%3===0?pick(['dk','ee','lv','se']):tm.cc,age:ri(18,29),role:ROLES[j],rt:+base.toFixed(2),kd:+(base*1.04).toFixed(2),adr:+(base*72+ri(-5,5)).toFixed(1),kast:Math.round(66+(base-1)*40),hs:ri(34,58),maps:ri(120,420),kpr:+(base*.68).toFixed(2),dpr:+(.7-(base-1)*.3).toFixed(2),imp:+(base*1.02).toFixed(2),since:String(2019+ri(0,6)),about:j===0?'Капитан команды, известен агрессивным стилем и сильным мидгеймом.':'',tw:j===0?'https://x.com/':'',tt:j<2?'https://twitch.tv/':'',banner:null,photo:null})})});
  const PLb={};players.forEach(p=>(PLb[p.team]||(PLb[p.team]=[])).push(p));
  const T=i=>teams[i];                         // i — место в рейтинге (0 = сильнейшая)
  const matches=[],pstats=[];let mid=0,psid=0;

  /* ---------- симуляция серии ---------- */
  const vetoSeq=bo=>bo===1?['a ban','b ban','a ban','b ban','a ban','b ban']:bo===3?['a ban','b ban','a pick','b pick','a ban','b ban']:['a ban','b ban','a pick','b pick','a pick','b pick'];
  const mkVeto=bo=>{const pool=[...POOL],out=[],picks=[];vetoSeq(bo).forEach(s=>{const [t,k]=s.split(' '),m=pool.splice(ri(0,pool.length-1),1)[0];out.push({t,k,m});if(k==='pick')picks.push({m,t})});const left=pool[0];out.push({t:'d',k:'left',m:left});picks.push({m:left,t:'d'});return {out,picks}};
  const vt=v=>v.map(x=>`${x.t} ${x.k} ${x.m}`).join('\n');
  const mapScore=(winA,live)=>{let w=13,l=ri(3,11);if(rng()<.14){w=ri(16,19);l=w-ri(1,3)>=14?w-ri(1,3):14}
    if(live){const a=ri(3,11),b=ri(3,11);return {a,b}}
    return winA?{a:w,b:l}:{a:l,b:w}};
  const halves=(a,b)=>{if(a>13||b>13)return [];const lo=Math.max(0,12-b),hi=Math.min(12,a);if(lo>hi)return [];const a1=ri(lo,hi);return [a1,12-a1,a-a1,b-(12-a1)]};
  const series=(A,B,bo,st)=>{
    const need=Math.ceil(bo/2),pa=1/(1+Math.pow(10,(S[B]-S[A])/24)),vv=mkVeto(bo);let s1=0,s2=0,rounds=0;const lines=[];
    for(let i=0;i<vv.picks.length&&s1<need&&s2<need;i++){const pk=vv.picks[i],bonus=pk.t==='a'?.04:pk.t==='b'?-.04:0,live=st==='live'&&false;
      const winA=rng()<pa+bonus,sc=mapScore(winA,false),h=halves(sc.a,sc.b);
      lines.push({m:pk.m,a:sc.a,b:sc.b,pick:pk.t==='d'?'d':pk.t,h});if(sc.a>sc.b)s1++;else s2++;rounds+=sc.a+sc.b}
    return {s1,s2,lines,veto:vv.out,rounds,picks:vv.picks}};
  const mapsText=(l,liveLast)=>l.map((x,i)=>`${x.m} ${x.a}:${x.b}${liveLast&&i===l.length-1?' live':''} | ${x.pick}${x.h&&x.h.length?' | '+x.h.join(' '):''}`).join('\n');

  /* создаёт матч; возвращает {w,l} индексы (в рейтинге) */
  const play=(o)=>{
    const {tour,stage,grp='',rnd=0,ord=0,a,b,bo=3,st='fin',d,tm,note=''}=o,id=++mid;
    const row={id,tour,stage,grp,rnd,ord,a:a!=null?T(a).id:null,b:b!=null?T(b).id:null,st,bo,d,tm,s1:0,s2:0,maps:'',veto:'',note,stream:'',mvp:null};
    if(a==null||b==null){matches.push(row);return {w:null,l:null}}
    const A=T(a).id,B=T(b).id;
    if(st==='fin'){const r=series(A,B,bo,st);row.s1=r.s1;row.s2=r.s2;row.maps=mapsText(r.lines);row.veto=vt(r.veto);
      const winA=r.s1>r.s2,rounds=r.rounds;let best=null;
      [A,B].forEach(tid=>PLb[tid].forEach(p=>{const win=(tid===A)===winA,rt=Math.max(.5,Math.min(1.9,p.rt+(win?.12:-.1)+ri(-24,24)/100)),k=Math.round((.46+(rt-.9)*.5)*rounds),dd=Math.round(rounds*(.78-(rt-1)*.28)+ri(-3,3));
        pstats.push({id:++psid,match:id,player:p.id,k,d:dd,a:ri(2,9),adr:+(62+(rt-.8)*58+ri(-6,6)).toFixed(1),kast:Math.round(63+(rt-.8)*26),hs:ri(30,58),rt:+rt.toFixed(2)});if(win&&(!best||rt>best.rt))best={p:p.id,rt}}));
      row.mvp=best&&best.p;matches.push(row);return winA?{w:a,l:b}:{w:b,l:a}}
    if(st==='live'){const r=series(A,B,bo,'fin'),done=r.lines.slice(0,Math.max(0,Math.min(r.lines.length-1,bo>1?ri(0,1):0)));
      const cur={m:r.picks[done.length].m,a:ri(4,11),b:ri(4,11),pick:r.picks[done.length].t};
      row.s1=done.filter(x=>x.a>x.b).length;row.s2=done.filter(x=>x.b>x.a).length;row.maps=mapsText([...done,cur],true);row.veto=vt(r.veto);row.stream='https://twitch.tv/';matches.push(row);return {w:null,l:null}}
    /* upcoming: иногда уже известен вето */
    if(o.prep){const r=series(A,B,bo,'fin');row.veto=vt(r.veto);row.maps=r.picks.slice(0,bo).map(x=>`${x.m} | ${x.t}`).join('\n')}
    matches.push(row);return {w:null,l:null}};

  /* ---------- турнир 1: Major — Swiss + плей-офф (идёт) ---------- */
  const rec={};for(let i=0;i<16;i++)rec[i]=[0,0];
  for(let r=1;r<=5;r++){
    const bk={};Object.keys(rec).map(Number).forEach(i=>{const [w,l]=rec[i];if(w<3&&l<3)(bk[w+'-'+l]||(bk[w+'-'+l]=[])).push(i)});
    let ord=0;const res=[];
    Object.keys(bk).sort((x,y)=>(+y[0]-+x[0])||(+x[2]-+y[2])).forEach(k=>{const l=bk[k].sort((x,y)=>x-y);const n=l.length;
      for(let i=0;i<n/2;i++){const a=l[i],b=l[n-1-i],[w,lo]=k.split('-').map(Number),bo=(w===2||lo===2)?3:1,live=r===5&&ord===0,fin=r<5,
        o=play({tour:1,stage:'Swiss',grp:k,rnd:r,ord:++ord,a,b,bo,st:fin?'fin':live?'live':'up',d:day([-9,-8,-6,-4,0][r-1]),tm:r===5?(live?'18:00':p2(18+Math.min(ord,3))+':00'):'',prep:r===5&&!live&&ord<3});
        if(fin)res.push(o)}});
    res.forEach(o=>{rec[o.w][0]++;rec[o.l][1]++})}
  /* плей-офф Major: сетка из 8 команд, пока TBD */
  const q=Object.keys(rec).map(Number).filter(i=>rec[i][0]>=3).sort((a,b)=>a-b);
  [['Quarterfinal',4,3],['Semifinal',2,5],['Third place',1,6],['Grand Final',1,7]].forEach(([st,n,off])=>{for(let i=0;i<n;i++)play({tour:1,stage:st,rnd:1,ord:i+1,a:null,b:null,bo:st==='Grand Final'?5:3,st:'up',d:day(off),tm:p2(17+i*2)+':00'})});

  /* ---------- турнир 2: Open Series — группы + плей-офф (завершён) ---------- */
  const G2=[[0,3,4,7],[1,2,5,6]];const stand2={};
  ['A','B'].forEach((g,gi)=>{const ts=G2[gi],pairs=[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]],tally={};ts.forEach(x=>tally[x]=0);
    pairs.forEach((rr,ri2)=>rr.forEach(([x,y],k)=>{const o=play({tour:2,stage:'Group stage',grp:g,rnd:ri2+1,ord:k+1,a:ts[x],b:ts[y],bo:3,st:'fin',d:day(-34+ri2),tm:p2(14+k*2)+':00'});tally[o.w]++}));
    stand2[g]=ts.slice().sort((x,y)=>tally[y]-tally[x]||x-y)});
  const sf1=play({tour:2,stage:'Semifinal',rnd:1,ord:1,a:stand2.A[0],b:stand2.B[1],st:'fin',d:day(-28),tm:'16:00'}),sf2=play({tour:2,stage:'Semifinal',rnd:1,ord:2,a:stand2.B[0],b:stand2.A[1],st:'fin',d:day(-28),tm:'19:00'});
  play({tour:2,stage:'Third place',rnd:1,ord:1,a:sf1.l,b:sf2.l,st:'fin',d:day(-27),tm:'15:00'});
  const gf2=play({tour:2,stage:'Grand Final',rnd:1,ord:1,a:sf1.w,b:sf2.w,bo:5,st:'fin',d:day(-27),tm:'18:00'});

  /* ---------- турнир 3: Champions Cup — double elimination (завершён) ---------- */
  const D=(stage,rnd,ord,a,b,off,bo=3)=>play({tour:3,stage,rnd,ord,a,b,bo,st:'fin',d:day(off),tm:p2(14+ord*2)+':00'});
  const seeds=[1,2,3,4,5,6,7,8].map(x=>x-1);
  const u1=[[0,7],[3,4],[1,6],[2,5]].map(([a,b],i)=>D('Upper bracket',1,i+1,seeds[a],seeds[b],-62));
  const u2=[[0,1],[2,3]].map(([a,b],i)=>D('Upper bracket',2,i+1,u1[a].w,u1[b].w,-61));
  const u3=D('Upper bracket',3,1,u2[0].w,u2[1].w,-60);
  const l1=[[0,1],[2,3]].map(([a,b],i)=>D('Lower bracket',1,i+1,u1[a].l,u1[b].l,-61));
  const l2=[D('Lower bracket',2,1,l1[0].w,u2[1].l,-60),D('Lower bracket',2,2,l1[1].w,u2[0].l,-60)];
  const l3=D('Lower bracket',3,1,l2[0].w,l2[1].w,-59);
  const l4=D('Lower bracket',4,1,l3.w,u3.l,-59);
  const gf3=D('Grand Final',1,1,u3.w,l4.w,-58,5);

  /* ---------- турнир 4: GSL Challengers (идёт) ---------- */
  const gslT=[[8,9,10,11],[12,13,14,15]];
  ['A','B'].forEach((g,gi)=>{const t=gslT[gi],part=gi===0?'fin':'half',st1='fin';
    const o1=play({tour:4,stage:'GSL',grp:g,rnd:1,ord:1,a:t[0],b:t[3],st:'fin',d:day(-3),tm:'12:00'}),o2=play({tour:4,stage:'GSL',grp:g,rnd:1,ord:2,a:t[1],b:t[2],st:'fin',d:day(-3),tm:'14:00'});
    if(gi===0){const w=play({tour:4,stage:'GSL',grp:g,rnd:2,ord:1,a:o1.w,b:o2.w,st:'fin',d:day(-2),tm:'12:00'}),e=play({tour:4,stage:'GSL',grp:g,rnd:2,ord:2,a:o1.l,b:o2.l,st:'fin',d:day(-2),tm:'14:00'});play({tour:4,stage:'GSL',grp:g,rnd:3,ord:1,a:w.l,b:e.w,st:'fin',d:day(-1),tm:'15:00'})}
    else{const w=play({tour:4,stage:'GSL',grp:g,rnd:2,ord:1,a:o1.w,b:o2.w,st:'fin',d:day(0),tm:'12:00'});play({tour:4,stage:'GSL',grp:g,rnd:2,ord:2,a:o1.l,b:o2.l,st:'live',d:day(0),tm:'20:00'});play({tour:4,stage:'GSL',grp:g,rnd:3,ord:1,a:w.l,b:null,st:'up',d:day(1),tm:'15:00'})}});

  /* ---------- турнир 5: Winter Cup — группы (скоро) ---------- */
  const G5=[[0,2,4,6],[1,3,5,7]];
  ['A','B'].forEach((g,gi)=>{const ts=G5[gi];[[[0,1],[2,3]],[[0,2],[1,3]],[[0,3],[1,2]]].forEach((rr,r2)=>rr.forEach(([x,y],k)=>play({tour:5,stage:'Group stage',grp:g,rnd:r2+1,ord:k+1,a:ts[x],b:ts[y],bo:3,st:'up',d:day(10+r2*2),tm:p2(15+k*2)+':00'})))});

  const idOf=i=>T(i).id,pOf=(i)=>PLb[idOf(i)].slice().sort((a,b)=>b.rt-a.rt)[0].id;
  const tp=['$250,000','$100,000','$50,000','$25,000'];
  const tours=[
    {id:1,n:'CSTT Major 2026',d:rangeD(-9,8),pr:'$1,000,000',tn:16,s:'live',st:'Swiss',loc:'Москва, Россия',fmt:'Swiss (BO1/BO3) → плей-офф (BO3, финал BO5)',organizer:'CSTT',tier:'S-Tier',mappool:POOL.join(', '),stream:'https://twitch.tv/',sw:3,sl:3,adv:2,col:'#d4141c',ru:'Крупнейший турнир сезона: 16 команд, швейцарский этап и плей-офф на 8 команд.',en:'The biggest event of the season: 16 teams, a Swiss stage and an 8-team playoff.',img:art('#7a0d12','#0c1117',11,1400,500),logo:logo('MJR','#d4141c'),prizes:`1 место | ${tp[0]} |\n2 место | ${tp[1]} |\n3-4 места | ${tp[2]} |\n5-8 места | ${tp[3]} |`,rules:'## Регламент\n\n- Швейцарский этап: BO1, матчи на выход и вылет — BO3.\n- Плей-офф: BO3, финал BO5.\n- Выбор карт: бан-пик по стандартной схеме.\n\n> Пул карт и расписание могут быть изменены организатором.'},
    {id:2,n:'CSTT Open Series: Season 2',d:rangeD(-35,-27),pr:'$150,000',tn:8,s:'fin',st:'Finished',loc:'Online',fmt:'Группы + плей-офф (BO3)',organizer:'CSTT',tier:'A-Tier',mappool:POOL.join(', '),winner:idOf(gf2.w),mvp:pOf(gf2.w),sw:3,sl:3,adv:2,col:'#2f6fb8',ru:'Онлайн-серия: две группы по четыре команды и плей-офф.',en:'Online series: two groups of four teams and a playoff.',img:art('#12345e','#0c1117',22,1400,500),logo:logo('OPN','#2f6fb8'),prizes:`1 место | $75,000 | ${idOf(gf2.w)}\n2 место | $35,000 | ${idOf(gf2.l)}\n3 место | $20,000 |\n4 место | $10,000 |`},
    {id:3,n:'CSTT Champions Cup',d:rangeD(-63,-57),pr:'$300,000',tn:8,s:'fin',st:'Finished',loc:'Берлин, Германия',fmt:'Double elimination, финал BO5',organizer:'CSTT',tier:'S-Tier',mappool:POOL.join(', '),winner:idOf(gf3.w),mvp:pOf(gf3.w),sw:3,sl:3,adv:2,col:'#d9a521',ru:'Восемь сильнейших команд сезона в формате double elimination.',en:'Eight best teams of the season in a double-elimination format.',img:art('#6b4a08','#0c1117',33,1400,500),logo:logo('CUP','#d9a521'),prizes:`1 место | $150,000 | ${idOf(gf3.w)}\n2 место | $75,000 | ${idOf(gf3.l)}\n3 место | $40,000 |\n4 место | $20,000 |`},
    {id:4,n:'GSL Challengers Stage',d:rangeD(-3,4),pr:'$80,000',tn:8,s:'live',st:'GSL',loc:'Online',fmt:'GSL-группы (BO3)',organizer:'CSTT',tier:'B-Tier',mappool:POOL.join(', '),sw:3,sl:3,adv:2,col:'#35b0a8',ru:'Две группы по четыре команды в формате GSL: двое проходят из каждой.',en:'Two GSL groups of four: top two of each advance.',img:art('#0f4d49','#0c1117',44,1400,500),logo:logo('GSL','#35b0a8'),prizes:'1 место | $40,000 |\n2 место | $20,000 |'},
    {id:5,n:'CSTT Winter Cup',d:rangeD(10,18),pr:'$120,000',tn:8,s:'up',st:'Registration',loc:'Online',fmt:'Группы (круговая, BO3) + плей-офф',organizer:'CSTT',tier:'A-Tier',mappool:'Ancient, Anubis, Inferno, Mirage, Nuke, Overpass',sw:3,sl:3,adv:2,col:'#7a4be0',ru:'Зимний кубок: две группы по четыре команды, двое проходят дальше.',en:'Winter Cup: two groups of four, top two advance.',img:art('#33206b','#0c1117',55,1400,500),logo:logo('WNT','#7a4be0'),prizes:'1 место | $60,000 |\n2 место | $30,000 |\n3 место | $15,000 |'}];
  const tteams=[];let tt=0;
  const addTT=(tour,list,grpOf)=>list.forEach((i,k)=>tteams.push({id:++tt,tour,team:idOf(i),grp:grpOf?grpOf(i):'',seed:k+1,note:''}));
  addTT(1,[...Array(16).keys()]);addTT(2,[0,3,4,7,1,2,5,6],i=>G2[0].includes(i)?'A':'B');addTT(3,[...Array(8).keys()]);addTT(4,[8,9,10,11,12,13,14,15],i=>gslT[0].includes(i)?'A':'B');addTT(5,[0,1,2,3,4,5,6,7],i=>G5[0].includes(i)?'A':'B');

  const maps=[...POOL,'Train','Vertigo'].map((n,i)=>({id:i+1,name:n,img:art(MAPCOL[n][0],MAPCOL[n][1],100+i,640,360),col:MAPCOL[n][0],active:i<POOL.length?1:0}));
  const titles=[
    {id:1,player:pOf(gf3.w),team:null,title:'Champion',sub:'CSTT Champions Cup',kind:'champion',tour:3,year:'2026'},
    {id:2,player:pOf(gf3.w),team:null,title:'MVP',sub:'Лучший игрок турнира',kind:'mvp',tour:3,year:'2026'},
    {id:3,player:pOf(gf2.w),team:null,title:'Champion',sub:'Open Series S2',kind:'champion',tour:2,year:'2026'},
    {id:4,player:pOf(0),team:null,title:'Top 20 игроков',sub:'Рейтинг CSTT',kind:'top20',year:'2026'},
    {id:5,player:pOf(0),team:null,title:'EVP',sub:'Самый ценный игрок',kind:'evp',tour:1,year:'2026'},
    {id:6,player:pOf(1),team:null,title:'Финалист',sub:'Champions Cup',kind:'finalist',tour:3,year:'2026'},
    {id:7,player:null,team:idOf(gf3.w),title:'Чемпион Champions Cup',sub:'8 команд · $300,000',kind:'champion',tour:3,year:'2026'},
    {id:8,player:null,team:idOf(gf2.w),title:'Чемпион Open Series',sub:'Season 2',kind:'champion',tour:2,year:'2026'},
    {id:9,player:null,team:idOf(0),title:'№1 мирового рейтинга',sub:'6 недель подряд',kind:'major',year:'2026',icon:'crown'}];
  const trophies=[{id:1,team:idOf(gf3.w),tour:3,title:'CSTT Champions Cup',place:'1 место',year:'2026',prize:'$150,000'},{id:2,team:idOf(gf2.w),tour:2,title:'CSTT Open Series: Season 2',place:'1 место',year:'2026',prize:'$75,000'},{id:3,team:idOf(gf3.l),tour:3,title:'CSTT Champions Cup',place:'2 место',year:'2026',prize:'$75,000'}];

  /* ---------- новости ---------- */
  const liveM=matches.find(m=>m.st==='live'),upM=matches.find(m=>m.st==='up'&&m.tour===1&&m.veto),finM=matches.find(m=>m.st==='fin'&&m.tour===1);
  const news=[
    {id:1,d:day(0),tag:'MAJOR',c:'#d4141c',pin:1,tour:1,author:'Редакция CSTT',layout:'hltv',img:art('#7a0d12','#10151c',1),bg:art('#8a1016','#0a0e14',101,1600,700),ru:'Major 2026: восемь команд вышли в плей-офф',en:'Major 2026: eight teams reach the playoffs',sub_ru:'Швейцарский этап подходит к концу — остались решающие матчи за последние места в сетке.',sub_en:'The Swiss stage is almost over — the last playoff spots are being decided.',
      body_ru:`# Итоги швейцарского этапа\n\nПосле четырёх раундов определились первые участники плей-офф. **Vortex** уверенно прошёл этап без поражений, а *Nordic Wolves* закрепились в верхней части таблицы.\n\n[[tour:1]]\n\n## Что дальше\n\nВ пятом раунде играют команды с рекордом 2-2 — проигравший покидает турнир. Один из ключевых матчей:\n\n[[match:${liveM?liveM.id:1}]]\n\n> «Мы приехали за титулом и ничего другого не рассматриваем», — капитан Vortex.\n\n- Плей-офф стартует через три дня\n- Четвертьфиналы — BO3\n- Финал — BO5\n\n[[team:1]]`,
      body_en:`# Swiss stage recap\n\nAfter four rounds the first playoff teams are set. **Vortex** went through undefeated.\n\n[[tour:1]]\n\n## What's next\n\nRound five features teams at 2-2 — the loser is out.\n\n[[match:${liveM?liveM.id:1}]]`},
    {id:2,d:day(-1),tag:'MATCH',c:'#2f6fb8',tour:1,author:'Алексей Р.',layout:'full',img:art('#12345e','#10151c',2),bg:art('#1c4f8f','#070b12',102,1600,900),ru:'Разбор: как Vortex выигрывает на Mirage',en:'Breakdown: how Vortex wins on Mirage',sub_ru:'Схемы, раскидки и сильные стороны лидера рейтинга.',sub_en:'Setups, utility and strengths of the ranking leader.',body_ru:`## Контроль мидла\n\nVortex почти всегда берут мид в первые 20 секунд раунда. Это даёт им выбор: ротация на *B* или быстрый выход на *A*.\n\n### Три ключевых элемента\n\n1. Ранний флеш на коннектор\n2. Смоки на окно и джунгли\n3. Поддержка AWP со стороны CT\n\n![Схема мидла на Mirage](${art('#c8a15e','#503a18',7,900,450)})\n\nПодробнее смотрите в статистике карт на странице турнира.\n\n[[tour:1]]`,body_en:'## Mid control\n\nVortex take mid almost every round.'},
    {id:3,d:day(-2),tag:'TRANSFER',c:'#7a4be0',team:5,author:'Мария К.',layout:'cover',img:art('#33206b','#10151c',3),bg:art('#4a2e9c','#0a0e14',103,1600,700),ru:'Aurora подписала нового AWPer’а',en:'Aurora signs a new AWPer',sub_ru:'Игрок присоединяется к команде до конца сезона.',sub_en:'The player joins the team until the end of the season.',body_ru:'Aurora объявила о подписании нового снайпера. Игрок заменит покинувшего состав в начале осени.\n\n**Новичок** уже дебютирует на ближайшем турнире.\n\n[[team:5]]',body_en:'Aurora has announced a new AWPer.'},
    {id:4,d:day(-3),tag:'EVENT',c:'#35b0a8',tour:4,author:'Редакция CSTT',layout:'side',img:art('#0f4d49','#10151c',4),gallery:[art('#1a5c58','#10151c',41),art('#0f4d49','#1a1020',42),art('#35b0a8','#10151c',43)].join('\n'),ru:'GSL Challengers: стартовали групповые матчи',en:'GSL Challengers: group matches have started',sub_ru:'Две группы, восемь команд и билеты в основную сетку.',sub_en:'Two groups, eight teams and tickets to the main bracket.',body_ru:'# Формат GSL\n\nКаждая группа играет по схеме GSL: **два стартовых матча**, матч победителей, матч на вылет и решающий матч.\n\n[[tour:4]]',body_en:'Each group follows the GSL format.'},
    {id:5,d:day(-5),tag:'CSTT',c:'#e8b93c',author:'Редакция CSTT',layout:'cover',img:art('#6b4a08','#10151c',5),bg:art('#b8860b','#0a0e14',105,1600,700),ru:'Новый сезон CSTT: что изменилось в рейтинге',en:'New CSTT season: what changed in the ranking',sub_ru:'Обновлённая формула очков и новые бонусы за турниры S-tier.',sub_en:'New point formula and bonuses for S-tier events.',body_ru:'## Новые правила\n\nС этого сезона очки рейтинга считаются с учётом **силы соперников** и уровня турнира.\n\n- S-tier: x1.5\n- A-tier: x1.2\n- B-tier: x1.0',body_en:'Ranking points now account for opponent strength.'},
    {id:6,d:day(-9),tag:'INTERVIEW',c:'#e0412f',team:1,author:'Алексей Р.',layout:'plain',img:art('#6b1a10','#10151c',6),ru:'Интервью с капитаном Vortex',en:'Interview with the Vortex captain',sub_ru:'О подготовке к Major, мапах и давлении ожиданий.',sub_en:'About Major prep, maps and expectations.',body_ru:'**— Как вы готовились к Major?**\n\nМы провели три недели на буткемпе. Главный акцент — на мап-пул и анти-стратегии.\n\n**— Какая карта самая сложная?**\n\nСейчас — *Overpass*. Но мы работаем.\n\n[[team:1]]',body_en:'We spent three weeks on a bootcamp.'},
    {id:7,d:day(-12),tag:'RESULT',c:'#3a9d6a',tour:3,author:'Мария К.',layout:'cover',img:art('#0f4a2a','#10151c',7),bg:art('#1f7a46','#0a0e14',107,1600,700),ru:'Champions Cup: чемпион определён',en:'Champions Cup: the champion is decided',sub_ru:'Гранд-финал BO5 закончился на пятой карте.',sub_en:'The BO5 grand final went to the fifth map.',body_ru:`# Гранд-финал\n\nЧемпионом стал победитель верхней сетки.\n\n[[match:${matches.find(m=>m.tour===3&&m.stage==='Grand Final').id}]]\n\n[[tour:3]]`,body_en:'The grand final went to map five.'},
    {id:8,d:day(-15),tag:'CSTT',c:'#d4141c',author:'Редакция CSTT',layout:'plain',img:art('#7a0d12','#10151c',8),ru:'Открыта регистрация на CSTT Winter Cup',en:'Registration for CSTT Winter Cup is open',sub_ru:'Восемь слотов, призовой фонд $120,000.',sub_en:'Eight slots, $120,000 prize pool.',body_ru:'Заявки принимаются до начала турнира.\n\n[[tour:5]]',body_en:'Applications are open.'}];
  const site=[{id:1,nm:'CSTT',color:'#d4141c',theme:'hltv',ft:'© 2026 CSTT · Counter-Strike 2',email:'info@cstt.example',tg:'https://t.me/',ds:'https://discord.gg/',yt:'https://youtube.com/',about:'Независимый портал по Counter-Strike 2: турниры, матчи, команды и статистика.',hero:'news',s_br:'1'}];
  return {teams:teams.map(x=>({...x})),players,tournaments:tours,matches,news,trophies,pstats,site,titles,tteams,maps};
};
