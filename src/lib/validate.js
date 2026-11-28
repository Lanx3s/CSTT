/* Правила проверки заявок. Те же правила продублированы на сервере (supabase/schema.sql: cstt_bad, cstt_pii, submit_team_app) —
   браузерная проверка нужна только для удобства, окончательное решение принимает база. */

/* ---- запрещённые слова: сравнение без регистра, без пробелов/знаков, с заменой 0→o, 1→i, 3→e, 4→a, 5→s, 7→t, 8→b, @→a, $→s ---- */
const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','@':'a','$':'s'};
export const norm=t=>String(t==null?'':t).toLowerCase().replace(/[0134578@$]/g,c=>LEET[c]).replace(/[^a-zа-яё]/g,'');
const BAD=/(fuck|fuk|shit|bitch|cunt|nigg|fagg|retard|whore|slut|nazi|hitler|porn|rapist|pedoph|kkk|хуй|хуе|хуя|хуи|пизд|ебан|ебат|ебал|бляд|блят|мудак|мудил|гандон|пидор|пидар|пидр|залуп|шлюх|дроч|нацист|сучк|сука|ублюд|говн|чурк|хохл)/;
export const isBad=t=>BAD.test(norm(t));
/* личные данные: почта, @ник, ссылки, телефоны */
const PII=/(@[a-z0-9_.]+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|https?:\/\/|www\.|t\.me\/|discord\.gg|vk\.com|\+?[0-9][0-9 ().-]{8,}[0-9])/i;
export const hasPii=t=>PII.test(String(t||''));

export const ROLES=['IGL','AWPer','Entry','Support','Lurker','Rifler','Anchor'];
export const LIM={logoMB:5,photoMB:5,minPx:200,maxPx:6000,types:['image/png','image/jpeg','image/webp'],about:600,subs:3};

const RU=(ru,en)=>ru; /* сообщения на русском; сайт двуязычный, но форма заявок — для СНГ-комьюнити */

/* ---- поля: каждая функция возвращает текст ошибки или '' ---- */
export const V={
  name:v=>{v=String(v||'').trim();if(!/^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/.test(v)||v.length<2||v.length>32)return 'Название: 2–32 символа, только латиница, цифры и пробелы';if(isBad(v))return 'Название содержит недопустимые слова';return ''},
  tag:v=>{v=String(v||'').trim();if(!/^[A-Za-z0-9]{2,4}$/.test(v))return 'Сокращение — строго от 2 до 4 символов (латиница и цифры)';if(isBad(v))return 'Сокращение содержит недопустимые слова';return ''},
  cc:v=>{v=String(v||'').trim();return v===''||/^[A-Za-z]{2}$/.test(v)?'':'Код страны — две латинские буквы (RU, EU, UA…)'},
  coach:v=>{v=String(v||'').trim();if(!v)return '';if(v.length>60||!/^[A-Za-zА-Яа-яЁё'’.-]+ [«"“]?[A-Za-z0-9_]+[»"”]? [A-Za-zА-Яа-яЁё'’.-]+$/.test(v)||isBad(v))return 'Тренер: формат Имя «Ник» Фамилия';return ''},
  about:v=>{v=String(v||'').trim();if(!v)return '';if(v.length>LIM.about)return 'Описание — не больше '+LIM.about+' символов';if(isBad(v))return 'Описание содержит недопустимые слова';if(hasPii(v))return 'В описании нельзя указывать почту, телефоны, ссылки и личные контакты';return ''},
  color:v=>{v=String(v||'').trim();return !v||/^#[0-9A-Fa-f]{6}$/.test(v)?'':'Цвет: формат #RRGGBB'},
  elo:(v,req)=>{v=String(v==null?'':v).trim();if(!v)return req?'Укажите AVG ELO основного состава':'';if(!/^\d{3,4}$/.test(v)||+v<100||+v>6000)return 'ELO — число от 100 до 6000';return ''},
  nick:v=>{v=String(v||'').trim();if(!/^[A-Za-z0-9_]{2,20}$/.test(v))return 'Ник: 2–20 символов, только латиница, цифры и _';if(isBad(v))return 'Ник содержит недопустимые слова';return ''},
  role:v=>/^[A-Za-z ]{2,16}$/.test(String(v||'').trim())?'':'Выберите игровую роль',
  pname:v=>{v=String(v||'').trim();if(!v)return '';if(!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё '’.-]{0,38}$/.test(v)||isBad(v))return 'Имя и фамилия — только буквы (без цифр и контактов)';return ''},
  age:v=>{v=String(v==null?'':v).trim();if(!v)return '';return /^\d{1,2}$/.test(v)&&+v>=10&&+v<=60?'':'Возраст — от 10 до 60'},
};

/* ---- файл-картинка: формат, размер, габариты (без пережатия: файл уходит в хранилище как есть) ---- */
export const checkImage=(file,mb=5)=>new Promise(res=>{
  if(!file)return res({ok:false,err:'Файл не выбран'});
  if(!LIM.types.includes(file.type))return res({ok:false,err:'Формат: только PNG, JPEG или WebP'});
  if(file.size>mb*1048576)return res({ok:false,err:'Файл больше '+mb+' МБ'});
  const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const w=im.naturalWidth,h=im.naturalHeight;
    if(w<LIM.minPx||h<LIM.minPx){URL.revokeObjectURL(u);return res({ok:false,err:'Слишком маленькая картинка: минимум '+LIM.minPx+'×'+LIM.minPx+' px (у вас '+w+'×'+h+')'})}
    if(w>LIM.maxPx||h>LIM.maxPx){URL.revokeObjectURL(u);return res({ok:false,err:'Слишком большая картинка: максимум '+LIM.maxPx+' px'})}
    res({ok:true,url:u,w,h})};
  im.onerror=()=>{URL.revokeObjectURL(u);res({ok:false,err:'Не удалось прочитать картинку — файл повреждён'})};
  im.src=u});

/* ---- вся заявка ---- */
export const emptyPlayer=sub=>({nick:'',role:'',cc:'',name:'',age:'',elo:'',photo:null,sub:!!sub});
export const emptyApp=()=>({name:'',tag:'',cc:'',coach:'',logo:null,col:'',col2:'',elo:'',about:'',players:[0,1,2,3,4].map(()=>emptyPlayer(false))});
/* возвращает {поле: ошибка}; пустой объект — всё в порядке */
export const validateApp=a=>{
  const E={},set=(k,m)=>{if(m)E[k]=m};
  set('name',V.name(a.name));set('tag',V.tag(a.tag));set('cc',V.cc(a.cc));set('coach',V.coach(a.coach));set('about',V.about(a.about));
  set('col',V.color(a.col));set('col2',V.color(a.col2));
  const mains=a.players.filter(p=>!p.sub),all5=mains.length===5&&mains.every(p=>String(p.elo||'').trim());
  set('elo',V.elo(a.elo,!all5));
  if(!a.logo)E.logo='Загрузите логотип команды';
  const seen=new Set();
  a.players.forEach((p,i)=>{const k='p'+i+'.',m=(f,e)=>{if(e)E[k+f]=e};
    m('nick',V.nick(p.nick));m('role',V.role(p.role));m('cc',V.cc(p.cc));m('name',V.pname(p.name));m('age',V.age(p.age));m('elo',V.elo(p.elo,false));
    if(!p.photo)E[k+'photo']='Загрузите фотографию';
    const n=String(p.nick||'').trim().toLowerCase();if(n){if(seen.has(n))E[k+'nick']='Этот ник уже указан';seen.add(n)}});
  if(a.players.filter(p=>p.sub).length>LIM.subs)E.players='Запасных — не больше '+LIM.subs;
  return E};
/* данные для отправки в базу */
export const toPayload=(a,key)=>({key,name:a.name.trim(),tag:a.tag.trim().toUpperCase(),cc:(a.cc||'').trim().toUpperCase()||'EU',coach:(a.coach||'').trim(),logo:a.logo,col:a.col||'',col2:a.col2||'',elo:String(a.elo||'').trim(),about:(a.about||'').trim(),
  players:a.players.map(p=>({nick:p.nick.trim(),role:p.role.trim(),cc:(p.cc||'').trim().toUpperCase()||'EU',name:(p.name||'').trim(),age:String(p.age||'').trim(),elo:String(p.elo||'').trim(),photo:p.photo,sub:!!p.sub}))});
