/* Автопродвижение по сеткам (только на сайте, в базу не пишет — это делает кнопка «Авто-продвижение» в админке).
   Если победитель матча известен, он сам оказывается в следующем матче: single/double elimination, GSL, группы -> плей-офф, Swiss -> плей-офф. */
const SG=['Round of 32','Round of 16','Quarterfinal','Semifinal','Grand Final'];
const so=n=>{let o=[1];while(o.length<n){const s=o.length*2;o=o.flatMap(x=>[x,s+1-x])}return o};

export const autoAdvance=(MS,TT,TR,swissQ=new Map())=>{
  const W=m=>m&&m.st==='fin'&&m.s1!==m.s2&&m.a!=null&&m.b!=null?(m.s1>m.s2?m.a:m.b):null;
  const Ls=m=>{const w=W(m);return w==null?null:(w===m.a?m.b:m.a)};
  const fill=(t,f,v)=>{if(t&&v!=null&&t[f]==null)t[f]=v};
  const srt=(x,y)=>(x.ord||0)-(y.ord||0)||x.id-y.id;
  [...new Set(MS.map(m=>m.tour))].forEach(o=>{
    const all=MS.filter(m=>m.tour===o),by=s=>all.filter(m=>m.stage===s).sort(srt);
    const rounds=s=>{const l=all.filter(m=>m.stage===s),rs=[...new Set(l.map(m=>m.rnd||1))].sort((a,b)=>a-b);return rs.map(r=>l.filter(m=>(m.rnd||1)===r).sort(srt))};
    const dbl=all.some(m=>m.stage==='Upper bracket'||m.stage==='Lower bracket');
    /* ---- группы / GSL -> первый раунд плей-офф ---- */
    const first=dbl?(rounds('Upper bracket')[0]||[]):(SG.map(by).find(l=>l.length)||[]);
    const to=TR.find(x=>x.id===o),adv=(to&&to.adv)||2;
    const quals=[];
    const gs=all.filter(m=>m.stage==='Group stage');
    if(gs.length){[...new Set(gs.map(m=>m.grp||''))].sort().forEach(g=>{const l=gs.filter(m=>(m.grp||'')===g);if(!l.every(m=>m.st==='fin'))return;
      const R=new Map();const r=id=>R.get(id)||(R.set(id,{id,pts:0,d:0}),R.get(id));
      l.forEach(m=>{if(m.a==null||m.b==null)return;const A=r(m.a),B=r(m.b);A.d+=m.s1-m.s2;B.d+=m.s2-m.s1;if(m.s1>m.s2)A.pts+=3;else if(m.s2>m.s1)B.pts+=3;else{A.pts++;B.pts++}});
      quals.push([...R.values()].sort((x,y)=>y.pts-x.pts||y.d-x.d).slice(0,adv).map(x=>x.id))})}
    const gl=all.filter(m=>m.stage==='GSL');
    if(gl.length){[...new Set(gl.map(m=>m.grp||''))].sort().forEach(g=>{const l=gl.filter(m=>(m.grp||'')===g),r=n=>l.filter(m=>(m.rnd||1)===n).sort(srt);
      /* внутри группы: победители ОТКРЫТЫХ матчей -> матч победителей, проигравшие -> матч на вылет, проигравший победителей + победитель вылета -> решающий */
      const r1=r(1),r2=r(2),r3=r(3);
      if(r2[0]){fill(r2[0],'a',W(r1[0]));fill(r2[0],'b',W(r1[1]))}
      if(r2[1]){fill(r2[1],'a',Ls(r1[0]));fill(r2[1],'b',Ls(r1[1]))}
      if(r3[0]){fill(r3[0],'a',Ls(r2[0]));fill(r3[0],'b',W(r2[1]))}
      if(r2[0]&&r3[0]&&W(r2[0])!=null&&W(r3[0])!=null)quals.push([W(r2[0]),W(r3[0])])})}
    if(quals.length&&first.length&&adv===2&&(gs.length||gl.length)){
      const need=gs.length?[...new Set(gs.map(m=>m.grp||''))].length:[...new Set(gl.map(m=>m.grp||''))].length;
      if(quals.length===need&&first.length*2===need*2){
        if(need===1){fill(first[0],'a',quals[0][0]);fill(first[0],'b',quals[0][1])}
        else for(let p=0;p<need;p+=2){const g0=quals[p],g1=quals[p+1];if(!g1)break;fill(first[p],'a',g0[0]);fill(first[p],'b',g1[1]);fill(first[p+1],'a',g1[0]);fill(first[p+1],'b',g0[1])}}}
    /* ---- Swiss -> первый раунд плей-офф (по посеву: лучший рекорд — выше) ---- */
    const sq=swissQ.get(o);
    if(sq&&sq.length&&first.length&&sq.length===first.length*2){const s=so(sq.length);first.forEach((m,i)=>{fill(m,'a',sq[s[2*i]-1]);fill(m,'b',sq[s[2*i+1]-1])})}
    /* ---- single elimination ---- */
    if(!dbl){const st=SG.filter(s=>by(s).length);
      st.forEach((s,si)=>{const nx=st[si+1];if(!nx)return;const nl=by(nx);by(s).forEach((m,i)=>fill(nl[Math.floor(i/2)],i%2?'b':'a',W(m)))});
      const tp=by('Third place')[0];if(tp)by('Semifinal').forEach((m,i)=>fill(tp,i%2?'b':'a',Ls(m)))}
    /* ---- double elimination ---- */
    else{const up=rounds('Upper bracket'),lo=rounds('Lower bracket'),gf=by('Grand Final')[0];
      up.forEach((rd,r)=>{const nx=up[r+1];if(nx)rd.forEach((m,i)=>fill(nx[i>>1],i%2?'b':'a',W(m)))});
      lo.forEach((rd,li)=>{rd.forEach((m,i)=>{
        if(li===0){const u=up[0]||[];fill(m,'a',Ls(u[2*i]));fill(m,'b',Ls(u[2*i+1]))}
        else if(li%2===1){const pv=lo[li-1]||[],u=(up[(li+1)/2]||[]);fill(m,'a',W(pv[i]));fill(m,'b',Ls(u[i]))}
        else{const pv=lo[li-1]||[];fill(m,'a',W(pv[2*i]));fill(m,'b',W(pv[2*i+1]))}})});
      if(gf){const uf=up[up.length-1],lf=lo[lo.length-1];fill(gf,'a',W(uf&&uf[0]));fill(gf,'b',W(lf&&lf[0]))}}
  });
  /* победитель турнира — по гранд-финалу, если в админке не указан */
  TR.forEach(o=>{if(o.winner!=null)return;const g=MS.filter(m=>m.tour===o.id&&m.stage==='Grand Final').sort(srt).pop(),w=W(g);if(w!=null)o.winner=w})};
