import {html} from '../lib/html.js';
import {rk} from '../lib/data.js';
import {t} from '../lib/i18n.js';
import {formOf,f2} from '../lib/calc.js';
import {TeamLogo,Box,Flag,Empty} from '../components/common.js';

export const Rank=()=>html`<${Box} h=${t('rank')}>${rk.length?html`<div class="rank">${rk.map(x=>html`<a class="rkr" key=${x.id} href=${'#/team/'+x.id}>
<span class=${'no n'+Math.min(x.rank,4)}>${x.rank}</span><${TeamLogo} x=${x} s=${46}/>
<span class="nm"><b>${x.name}</b><small><${Flag} x=${x}/> ${x.region||x.cc}</small></span>
<span class="pts"><b>${x.pts}</b><small>${t('points')}</small></span>
<span class=${'chg '+(x.ch>0?'up':x.ch<0?'dn':'mu')}>${x.ch>0?'▲ '+x.ch:x.ch<0?'▼ '+Math.abs(x.ch):'–'}</span>
<span class="form">${formOf(x.id,5).map((f,i)=>html`<i key=${i} class=${'f-'+f}>${f==='w'?'W':f==='l'?'L':'D'}</i>`)}</span>
<span class="nicks">${x.pl.map(p=>html`<span key=${p.id}><${Flag} x=${p}/>${p.nick}</span>`)}</span></a>`)}</div>`:html`<${Empty}/>`}<//>`;
