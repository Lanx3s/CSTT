/* Генераторы сеток: возвращают строки для таблицы matches (все матчи «скоро», счёт 0:0) */
export const seedOrder=n=>{let o=[1];while(o.length<n){const s=o.length*2;o=o.flatMap(x=>[x,s+1-x])}return o};
/* круговая система (метод кругов) */
export const rrRounds=ids=>{const a=[...ids];if(a.length%2)a.push(null);const n=a.length,out=[];
  for(let r=0;r<n-1;r++){const p=[];for(let i=0;i<n/2;i++){const x=a[i],y=a[n-1-i];if(x!=null&&y!=null)p.push([x,y])}out.push(p);a.splice(1,0,a.pop())}return out};
const base=(tour,o)=>({tour,a:null,b:null,st:'up',s1:0,s2:0,bo:3,ord:1,rnd:1,grp:'',...o});
const NAMES={32:'Round of 32',16:'Round of 16',8:'Quarterfinal',4:'Semifinal',2:'Grand Final'};

export const genSingle=(tour,n,teams,bo,boF,third)=>{
  const so=seedOrder(n),rows=[];
  for(let size=n;size>=2;size/=2){for(let i=0;i<size/2;i++)rows.push(base(tour,{stage:NAMES[size],rnd:1,ord:i+1,bo:size===2?boF:bo,a:size===n?teams[so[2*i]-1]??null:null,b:size===n?teams[so[2*i+1]-1]??null:null}))}
  if(third)rows.push(base(tour,{stage:'Third place',bo}));return rows};

export const genDouble=(tour,n,teams,bo,boF)=>{
  const k=Math.log2(n),so=seedOrder(n),rows=[];
  for(let r=1;r<=k;r++)for(let i=0;i<n/2**r;i++)rows.push(base(tour,{stage:'Upper bracket',rnd:r,ord:i+1,bo,a:r===1?teams[so[2*i]-1]??null:null,b:r===1?teams[so[2*i+1]-1]??null:null}));
  const lb=[];for(let j=1;j<k;j++){const c=n/2**(j+1);lb.push(c,c)}
  lb.forEach((c,ri)=>{for(let i=0;i<c;i++)rows.push(base(tour,{stage:'Lower bracket',rnd:ri+1,ord:i+1,bo}))});
  rows.push(base(tour,{stage:'Grand Final',bo:boF}));return rows};

export const genSwiss=(tour,N,W,L,teams,bo=3,boD)=>{
  const rows=[];let dist={'0-0':N},r=0;
  while(Object.keys(dist).length&&r<12){r++;const nx={};let ord=0;
    Object.keys(dist).sort((a,b)=>(+b.split('-')[0]-+a.split('-')[0])||(+a.split('-')[1]-+b.split('-')[1])).forEach(k=>{
      const [w,l]=k.split('-').map(Number),m=Math.round(dist[k]/2);
      for(let i=0;i<m;i++)rows.push(base(tour,{stage:'Swiss',grp:k,rnd:r,ord:++ord,bo:(w===W-1||l===L-1)?(boD||bo):bo,a:r===1?teams[i]??null:null,b:r===1?teams[N/2+i]??null:null}));
      if(w+1<W)nx[(w+1)+'-'+l]=(nx[(w+1)+'-'+l]||0)+m;if(l+1<L)nx[w+'-'+(l+1)]=(nx[w+'-'+(l+1)]||0)+m});
    dist=nx}
  return rows};

/* teams — id по местам посева; grpOf(id) — группа из «Участников» (если задана) */
export const splitGroups=(teams,G,grpOf)=>{
  const names=[...Array(G)].map((_,i)=>String.fromCharCode(65+i)),out={};names.forEach(n=>out[n]=[]);
  const fixed=teams.some(id=>grpOf(id));
  teams.forEach((id,i)=>{let g=grpOf(id);if(!fixed){const row=Math.floor(i/G),c=i%G;g=names[row%2?G-1-c:c]}if(g&&out[g])out[g].push(id)});
  return out};
export const genGroups=(tour,teams,G,bo,grpOf)=>{const rows=[],gs=splitGroups(teams,G,grpOf);
  Object.entries(gs).forEach(([g,ids])=>rrRounds(ids).forEach((pairs,ri)=>pairs.forEach(([a,b],i)=>rows.push(base(tour,{stage:'Group stage',grp:g,rnd:ri+1,ord:i+1,bo,a,b})))));return rows};
export const genGsl=(tour,teams,G,bo,grpOf)=>{const rows=[],gs=splitGroups(teams,G,grpOf);
  Object.entries(gs).forEach(([g,ids])=>{const t=[0,1,2,3].map(i=>ids[i]??null),B=(rnd,ord,a,b)=>rows.push(base(tour,{stage:'GSL',grp:g,rnd,ord,bo,a,b}));
    B(1,1,t[0],t[3]);B(1,2,t[1],t[2]);B(2,1,null,null);B(2,2,null,null);B(3,1,null,null)});return rows};
