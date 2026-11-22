import {html} from '../lib/html.js';
import {team} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {record,formOf,h2h,f2} from '../lib/calc.js';
import {Box,TeamLogo} from './common.js';

/* предматчевое сравнение + шанс по рейтингу */
export const Compare=({m})=>{
  const A=team(m.a),B=team(m.b);if(A.tbd||B.tbd)return null;
  const ra=record(A.id),rb=record(B.id),H=h2h(A.id,B.id),pa=(A.pts+50)/(A.pts+B.pts+100),
    art=T=>T.pl.length?T.pl.reduce((s,p)=>s+p.rt,0)/T.pl.length:0,
    rows=[[t('rankC'),'#'+A.rank,'#'+B.rank,A.rank<B.rank?'a':A.rank>B.rank?'b':''],[t('pts'),A.pts,B.pts,A.pts>B.pts?'a':A.pts<B.pts?'b':''],[t('win'),ra.n?ra.wr+'%':'–',rb.n?rb.wr+'%':'–',ra.wr>rb.wr?'a':ra.wr<rb.wr?'b':''],[t('avgRt'),f2(art(A)),f2(art(B)),art(A)>art(B)?'a':art(A)<art(B)?'b':''],['H2H',H.a,H.b,H.a>H.b?'a':H.a<H.b?'b':'']];
  const fm=id=>html`<span class="form">${formOf(id,5).map((f,i)=>html`<i key=${i} class=${'f-'+f}>${f==='w'?'W':f==='l'?'L':'D'}</i>`)}</span>`;
  return html`<${Box} h=${t('cmpT')}><div class="cmp"><div class="cmp-h"><span><${TeamLogo} x=${A} s=${26}/>${A.tag}</span><span>${B.tag}<${TeamLogo} x=${B} s=${26}/></span></div>
${rows.map(r=>html`<div class="cmp-r" key=${r[0]}><b class=${r[3]==='a'?'best':''}>${r[1]}</b><span>${r[0]}</span><b class=${r[3]==='b'?'best':''}>${r[2]}</b></div>`)}
<div class="cmp-r"><span class="l">${fm(A.id)}</span><span>${t('form')}</span><span class="r">${fm(B.id)}</span></div>
<div class="wch"><div class="wchb"><i style=${{width:Math.round(pa*100)+'%'}}></i></div><div class="wchl"><b>${Math.round(pa*100)}%</b><span>${t('chance')}</span><b>${100-Math.round(pa*100)}%</b></div></div></div><//>`};
