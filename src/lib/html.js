import React from 'react';
import htm from 'htm';
/* htm -> React; атрибут class превращаем в className, чтобы React не ругался в консоли */
const h=(t,p,...c)=>{if(typeof t==='string'&&p&&p.class!==undefined){const {class:k,...r}=p;p={...r,className:k}}return React.createElement(t,p,...c)};
export const html=htm.bind(h);
export const F=React.Fragment;
