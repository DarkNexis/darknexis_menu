/* Кулинарная книга - логика приложения (вынесена из index.html).
   Данные: recipes.js (COOKBOOK) и config.js (CONFIG). */
/* ============================================================
   Кулинарная книга · приложение (app.js)
   Данные приходят из двух файлов: recipes.js - книга рецептов
   (объект COOKBOOK, его можно править на GitHub), config.js -
   служебные словари (объект CONFIG). Здесь они собираются в
   общий объект DATA. Состояние хранится в localStorage браузера:
   рецепты можно добавлять и править прямо в приложении, а затем
   выгрузить файлом кнопкой "Скачать recipes.js".
   ============================================================ */
'use strict';

/* сборка общего словаря: рецепты + служебные данные */
const DATA = Object.assign({}, CONFIG, COOKBOOK);

/* ---------- утилиты ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const NBSP = '\u00a0';
const DOT = NBSP + '·' + NBSP;
const cleanDash = s => String(s == null ? '' : s).replace(/[\u2014\u2013]/g, '-');
const numOf = s => { const v = parseFloat(String(s == null ? '' : s).replace(',', '.')); return isNaN(v) ? 0 : v; };

/* защита от двойного срабатывания тапа (iOS и эмуляции) */
let lastTap = {key:'', t:0};
function tapGuard(key){
  const now = Date.now();
  if(lastTap.key === key && now - lastTap.t < 350) return false;
  lastTap = {key, t: now};
  return true;
}

/* ---------- иконки (инлайн SVG) ---------- */
function I(name, size){
  size = size || 16;
  const P = {
    clock: '<circle cx="8" cy="8" r="6.2"/><path d="M8 4.8V8l2.2 1.4"/>',
    users: '<circle cx="5.5" cy="6" r="2.2"/><path d="M2 13c.4-2.2 1.8-3.3 3.5-3.3S8.9 10.8 9.3 13"/><circle cx="11" cy="6.4" r="1.8"/><path d="M10 9.9c1.9 0 3.2 1 3.7 2.8"/>',
    flame: '<path d="M8 2c2.5 2.7 4 4.8 4 7a4 4 0 1 1-8 0c0-.9.3-1.9 1-2.8.2 1 .7 1.7 1.5 2C6.3 6.4 7 4.3 8 2z"/>',
    cart: '<path d="M2.2 3h1.7l1.3 7.4h7.2L14 5.2H4.6"/><circle cx="6" cy="13" r="1.2"/><circle cx="11.6" cy="13" r="1.2"/>',
    heart: '<path d="M8 13.4C5 11.2 2.6 9.2 2.6 6.7c0-1.7 1.3-3 2.9-3 1 0 1.9.5 2.5 1.3.6-.8 1.5-1.3 2.5-1.3 1.6 0 2.9 1.3 2.9 3 0 2.5-2.4 4.5-5.4 6.7z"/>',
    plus: '<path d="M8 3.2v9.6M3.2 8h9.6"/>',
    minus: '<path d="M3.5 8h9"/>',
    x: '<path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"/>',
    dice: '<rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2.6"/><circle cx="5.8" cy="5.8" r=".9" fill="currentColor" stroke="none"/><circle cx="10.2" cy="10.2" r=".9" fill="currentColor" stroke="none"/><circle cx="10.2" cy="5.8" r=".9" fill="currentColor" stroke="none"/><circle cx="5.8" cy="10.2" r=".9" fill="currentColor" stroke="none"/>',
    search: '<circle cx="7.2" cy="7.2" r="4.4"/><path d="M10.5 10.5L14 14"/>',
    chev: '<path d="M5.5 6.5L8 9l2.5-2.5"/>',
    box: '<path d="M2.5 5.2L8 2.6l5.5 2.6v5.6L8 13.4l-5.5-2.6z"/><path d="M2.5 5.2L8 7.8l5.5-2.6M8 7.8v5.6"/>',
    check: '<path d="M3.2 8.6l3.2 3.2 6.4-7.4"/>',
    copy: '<rect x="5.6" y="5.6" width="8" height="8" rx="1.8"/><path d="M10.4 3.2H4.4c-.7 0-1.2.5-1.2 1.2v6"/>',
    print: '<path d="M4.5 6V2.8h7V6M4.5 11.5H3V7h10v4.5h-1.5M4.5 9.5h7v3.7h-7z"/>',
    trash: '<path d="M3 4.6h10M6.4 4.6V3h3.2v1.6M4.4 4.6l.7 8.4h5.8l.7-8.4M6.7 7v3.6M9.3 7v3.6"/>',
    calendar: '<rect x="2.6" y="3.4" width="10.8" height="10" rx="2"/><path d="M2.6 6.6h10.8M5.6 2v2.6M10.4 2v2.6"/>',
    list: '<path d="M5.4 4.4h8M5.4 8h8M5.4 11.6h8"/><circle cx="3" cy="4.4" r=".9" fill="currentColor" stroke="none"/><circle cx="3" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="3" cy="11.6" r=".9" fill="currentColor" stroke="none"/>',
    book: '<path d="M3 3.6c1.8-.9 3.6-.9 5 .2 1.4-1.1 3.2-1.1 5-.2v9c-1.8-.9-3.6-.9-5 .2-1.4-1.1-3.2-1.1-5-.2z"/><path d="M8 3.8v9"/>',
    info: '<circle cx="8" cy="8" r="6.2"/><path d="M8 7.4v3.4"/><circle cx="8" cy="5.2" r=".8" fill="currentColor" stroke="none"/>',
    chef: '<path d="M5.6 6.2a2.4 2.4 0 0 1 .5-4.7c.8 0 1.5.3 1.9.9.4-.6 1.1-.9 1.9-.9a2.4 2.4 0 0 1 .5 4.7V9H5.6z"/><path d="M5.6 10.8h4.8M6 12.6h4"/>',
    mushroom: '<path d="M2.6 7.4C2.6 4.4 5 2.4 8 2.4s5.4 2 5.4 5c0 .8-.6 1.3-1.4 1.3H4c-.8 0-1.4-.5-1.4-1.3z"/><path d="M6 8.7v3.1c0 1 .8 1.8 2 1.8s2-.8 2-1.8V8.7"/>',
    banana: '<path d="M3 3.4c.3 4.4 3.4 7.8 8.6 8.4 1.2.1 2-.4 2.2-1.2-3.6.5-8-1.4-9-6.4-.8-.3-1.6-.5-1.8-.8z"/>',
    carrot: '<path d="M10.4 2.4l3.2 3.2-7.4 8c-.7.7-1.9.7-2.6 0l-1.2-1.2c-.7-.7-.7-1.9 0-2.6z"/><path d="M9 5.4l1.6 1.6M6.6 7.8l1.6 1.6"/>',
    milk: '<path d="M6 2.4h4v2l1.4 2v7.2c0 .6-.5 1-1 1H5.6c-.6 0-1-.4-1-1V6.4L6 4.4z"/><path d="M4.6 8.6h6.8"/>',
    chart: '<path d="M2.8 13.2h10.4M5 13V8.4M8 13V4.6M11 13V6.6"/>',
    settings: '<circle cx="8" cy="8" r="2.2"/><path d="M8 2.4v1.8M8 11.8v1.8M2.4 8h1.8M11.8 8h1.8M4.1 4.1l1.3 1.3M10.6 10.6l1.3 1.3M11.9 4.1l-1.3 1.3M5.4 10.6l-1.3 1.3"/>',
    pencil: '<path d="M9.9 3.2l2.9 2.9L6.2 12.7l-3.7.8.8-3.7z"/><path d="M8.6 4.5l2.9 2.9"/>',
    moon: '<path d="M12.8 9.9A5.3 5.3 0 0 1 6.1 3.2a5.3 5.3 0 1 0 6.7 6.7z"/>',
    sun: '<circle cx="8" cy="8" r="3"/><path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1"/>',
    code: '<path d="M5.6 5.4L3.2 8l2.4 2.6M10.4 5.4L12.8 8l-2.4 2.6"/>',
    download: '<path d="M8 2.6v7.2M4.9 7.1L8 10.2l3.1-3.1M3.2 12.7h9.6"/>'
  };
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(P[name]||P.info)+'</svg>';
}

/* ---------- константы данных ---------- */
const SEED = DATA;
const DAY_IDS = DATA.days.map(d => d[0]);
const DAY_NAMES = DATA.days.map(d => d[1]);
const SLOT_IDS = DATA.slots.map(s => s[0]);
const SLOT_NAMES = DATA.slots.map(s => s[1]);

/* ---------- состояние ---------- */
const LS_KEY = 'cookbook-artem-v3';
function defaultState(){
  return {
    fav:{}, cooked:{}, stock:{}, menu:{}, shopCustom:[], shopExtra:[], shopDone:{}, openDays:{}, shopHide:{}, skipStock:true, customStock:[], cookLog:[],
    settings:{availSort:false, name:'', theme:'light'},
    recipes:null, customBooks:[], deletedNums:[], targets:null, seedVersion:null
  };
}
function migrateState(d){
  d.settings = Object.assign({availSort:false, name:'', theme:'light'}, d.settings || {});
  if(d.settings.theme !== 'dark') d.settings.theme = 'light';
  if(!Array.isArray(d.customBooks)) d.customBooks = [];
  if(!Array.isArray(d.deletedNums)) d.deletedNums = [];
  if(!d.shopHide || typeof d.shopHide !== 'object' || Array.isArray(d.shopHide)) d.shopHide = {};
  if(typeof d.skipStock !== 'boolean') d.skipStock = true;
  if(!Array.isArray(d.customStock)) d.customStock = [];
  if(!Array.isArray(d.cookLog)) d.cookLog = [];
  if(!('recipes' in d) || d.recipes === undefined) d.recipes = null;
  if(!('targets' in d) || d.targets === undefined) d.targets = null;
  if(!('seedVersion' in d)) d.seedVersion = null;
  for(const day in d.menu){
    const ds = d.menu[day];
    if(ds && ds.slots) SLOT_IDS.forEach(sl => (ds.slots[sl]||[]).forEach(e => { if(e && !e.t) e.t = 'r'; }));
  }
  return d;
}
/* подтянуть обновления сборника: новые карточки добавляем, неизменённые -
   берём свежую версию, правленные пользователем не трогаем */
function mergeSeed(d){
  if(d.seedVersion === SEED.version) return d;
  if(!d.recipes){ d.seedVersion = SEED.version; return d; }
  const seedById = {};
  SEED.recipes.forEach(r => { seedById[r.num] = r; });
  const del = new Set(d.deletedNums || []);
  SEED.recipes.forEach(r => {
    if(del.has(r.num)) return;
    if(!d.recipes.some(x => x.num === r.num)) d.recipes.push(JSON.parse(JSON.stringify(r)));
  });
  d.recipes = d.recipes.map(r => {
    const s = seedById[r.num];
    if(!s || r.custom) return r;
    return JSON.parse(JSON.stringify(s));
  });
  d.seedVersion = SEED.version;
  return d;
}
let S = loadState();
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return defaultState();
    const o = JSON.parse(raw);
    const d = defaultState();
    for(const k in d) if(o[k] !== undefined) d[k] = o[k];
    migrateState(d);
    mergeSeed(d);
    return d;
  }catch(e){ return defaultState(); }
}
let saveTimer = null;
function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{
    try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){}
  }, 120);
}

/* ---------- индексы (пересобираются после правки рецептов) ---------- */
let RECIPES = [];
let REC_BY_NUM = {};
let BOOKS = [];
let BOOK = {};
let BOOK_SHORT = {};
function rebuildIndexes(){
  RECIPES = S.recipes ? S.recipes : SEED.recipes.slice();
  REC_BY_NUM = {};
  RECIPES.forEach(r => { REC_BY_NUM[r.num] = r; });
  BOOKS = SEED.books.slice();
  (S.customBooks || []).forEach(cb => { if(cb && cb.id && !BOOKS.some(b => b.id === cb.id)) BOOKS.push(cb); });
  BOOK = {};
  BOOKS.forEach(b => { BOOK[b.id] = b; });
  BOOK_SHORT = {zav:'Завтраки', osn:'Основные', paket:'Пакетная', garn:'Гарниры', myaso:'Мясо', des:'Десерты'};
  (S.customBooks || []).forEach(b => { BOOK_SHORT[b.id] = b.short || b.title; });
}
function targets(){
  const t = S.targets || SEED.targets;
  return {
    norm: Object.assign({label:'обычный день'}, t.norm),
    sun: Object.assign({label:'воскресенье'}, t.sun)
  };
}
function applyTheme(){
  if(S.settings.theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
}
function renderBrand(){
  const name = (S.settings.name || '').trim();
  $('#brandSub').innerHTML = esc(name || 'Мой рацион') + NBSP + '·' + NBSP + 'издание ' + esc(SEED.version || '');
  document.title = name ? ('Кулинарная книга ' + name) : 'Мой рацион';
}

/* ---------- фильтры (не сохраняются) ---------- */
const F = {book:'all', tags:new Set(), time:'any', q:'', fav:false, sort:'def'};

/* ---------- навигация ---------- */
function currentView(){
  const h = (location.hash || '#recipes').replace('#','');
  return ['recipes','menu','shop','stock'].includes(h) ? h : 'recipes';
}
const NAV_ITEMS = [
  {id:'recipes', icon:'book',  label:'Рецепты'},
  {id:'menu',    icon:'calendar', label:'Меню'},
  {id:'shop',    icon:'cart',  label:'Покупки'},
  {id:'stock',   icon:'box',   label:'Запасы'}
];
function navCounts(){
  let menuCnt = 0;
  for(const d of DAY_IDS){ const ds = S.menu[d]; if(ds && ds.slots) SLOT_IDS.forEach(s => menuCnt += (ds.slots[s]||[]).length); }
  return {menu: menuCnt, shop: shopPendingCount()};
}
function shopPendingCount(){
  const items = computeShop();
  return items.reduce((n,it)=> n + (S.shopDone[it.key] ? 0 : 1), 0);
}
function renderNav(){
  const c = navCounts();
  const view = currentView();
  $('#navDesktop').innerHTML = NAV_ITEMS.map(n =>
    '<button class="nav-pill'+(view===n.id?' active':'')+'" data-action="go" data-view="'+n.id+'">'+I(n.icon,15)+n.label+
    (n.id==='menu'&&c.menu ? '<span class="cnt">'+c.menu+'</span>' : '')+(n.id==='shop'&&c.shop ? '<span class="cnt">'+c.shop+'</span>' : '')+'</button>').join('');
  $('#bottomNav').innerHTML = NAV_ITEMS.map(n =>
    '<button class="bn-item'+(view===n.id?' active':'')+'" data-action="go" data-view="'+n.id+'">'+
    '<span class="bdot">'+I(n.icon,21)+(n.id==='shop'&&c.shop?'<span class="bcnt">'+c.shop+'</span>':'')+(n.id==='menu'&&c.menu?'<span class="bcnt">'+c.menu+'</span>':'')+'</span>'+n.label+'</button>').join('');
}
function go(view){ if(location.hash === '#'+view) renderAll(); else location.hash = '#'+view; }

/* ---------- КБЖУ ---------- */
function fmtN(x){ return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009'); }
function kbjuLine(k, perPortion){
  return '<span class="kbju-line"><b>' + fmtN(k.k) + NBSP + 'ккал</b>' + DOT + 'Б' + NBSP + fmtN(k.p) + DOT + 'Ж' + NBSP + fmtN(k.f) + DOT + 'У' + NBSP + fmtN(k.c) + (perPortion ? NBSP + '/ порция' : '') + '</span>';
}

/* ---------- наличие по запасам ---------- */
function availInfo(r){
  let mapped = 0; const out = [], low = [];
  const customSet = new Set(S.customStock || []);
  for(const ing of r.ingredients){
    const prod = DATA.ing2stock[ing.n] || (customSet.has(ing.n) ? ing.n : null);
    if(!prod) continue;
    const st = S.stock[prod];
    if(!st) continue;
    mapped++;
    if(st === 'out') out.push(ing.n);
    else if(st === 'low') low.push(ing.n);
  }
  return {mapped, out, low, missing: out.length + low.length};
}
function availHTML(r){
  const av = availInfo(r);
  if(!av.mapped) return '';
  let cls, txt;
  if(!av.missing){ cls = 'ok'; txt = 'всё в наличии'; }
  else if(av.out.length){ cls = 'bad'; txt = 'нет' + NBSP + av.missing + ' поз.'; }
  else { cls = 'part'; txt = 'мало' + NBSP + av.missing + ' поз.'; }
  return '<span class="avail '+cls+'"><span class="dot"></span>'+txt+'</span>';
}

/* ---------- РЕЦЕПТЫ ---------- */
function filtered(){
  let list = RECIPES.filter(r => {
    if(F.fav && !S.fav[r.num]) return false;
    if(F.book !== 'all' && r.book !== F.book) return false;
    if(F.time !== 'any' && r.timeTotal > +F.time) return false;
    if(F.tags.size){ for(const t of F.tags){ if(!r.tags.includes(t)) return false; } }
    if(F.q){
      const q = F.q.toLowerCase();
      const hay = (r.title + ' ' + r.intro + ' ' + r.tags.join(' ') + ' ' + r.ingredients.map(i => i.n + ' ' + i.a).join(' ')).toLowerCase();
      if(hay.indexOf(q) === -1) return false;
    }
    return true;
  });
  switch(F.sort){
    case 'time': list.sort((a,b) => (a.timeTotal||0) - (b.timeTotal||0)); break;
    case 'kcal': list.sort((a,b) => (a.kbju.k||0) - (b.kbju.k||0)); break;
    case 'cooked': list.sort((a,b) => (S.cooked[b.num]||0) - (S.cooked[a.num]||0)); break;
    case 'name': list.sort((a,b) => a.title.localeCompare(b.title, 'ru')); break;
  }
  if(S.settings.availSort) list = list.slice().sort((a,b) => availInfo(a).missing - availInfo(b).missing);
  return list;
}
function renderBookChips(){
  const counts = {all: RECIPES.length};
  BOOKS.forEach(b => { counts[b.id] = RECIPES.filter(r => r.book === b.id).length; });
  const favCnt = Object.keys(S.fav).filter(n => REC_BY_NUM[n]).length;
  let h = chip('all', 'Все книги', counts.all, null);
  h += '<button class="bchip favchip'+(F.fav?' active':'')+'" data-action="fav-filter">'+I('heart',13)+'Избранное<span class="n">'+favCnt+'</span></button>';
  BOOKS.forEach(b => { h += chip(b.id, BOOK_SHORT[b.id] || b.title, counts[b.id] || 0, b.color); });
  $('#bookChips').innerHTML = h;
  function chip(id, label, n, color){
    const dot = color ? '<span class="dot" style="background:'+color+'"></span>' : '';
    return '<button class="bchip'+(F.book===id?' active':'')+'" data-action="book" data-book="'+id+'">'+dot+label+'<span class="n">'+n+'</span></button>';
  }
}
function renderTagChips(){
  $('#tagChips').innerHTML = DATA.filterTags.map(t =>
    '<button class="tchip'+(F.tags.has(t)?' active':'')+'" data-action="tag" data-tag="'+esc(t)+'">'+esc(t)+'</button>').join('');
  if(F.tags.size) $('#tagChips').classList.add('open');
}
function cardHTML(r){
  const b = BOOK[r.book] || {color:'var(--terra)', bg:'var(--terra-soft)'};
  const fav = !!S.fav[r.num];
  const cooked = S.cooked[r.num] || 0;
  const tags = r.tags.slice(0,3).map(t => '<span class="minitag">'+esc(t)+'</span>').join('') + (r.tags.length>3 ? '<span class="minitag">+'+(r.tags.length-3)+'</span>' : '');
  return '<article class="card" style="--book-color:'+b.color+'" data-action="open" data-num="'+r.num+'">' +
    '<div class="card-in">' +
      '<div class="card-head">' +
        '<span class="bookchip" style="color:'+b.color+';background:'+b.bg+'"><span class="dot"></span>'+esc(BOOK_SHORT[r.book] || 'Книга')+'</span>' +
        '<span class="card-num">'+r.num+'</span><span class="spacer"></span>' +
        '<button class="favbtn'+(fav?' on':'')+'" data-action="fav" data-num="'+r.num+'" aria-label="В избранное">'+I('heart',16)+'</button>' +
      '</div>' +
      '<h3 class="card-title">'+esc(r.title)+'</h3>' +
      '<p class="card-intro">'+esc(r.intro)+'</p>' +
      '<div class="meta">' +
        '<span>'+I('clock',13)+r.timeTotal+NBSP+'мин</span>' +
        '<span>'+I('users',13)+esc(shortPortions(r.portionsText))+'</span>' +
        (cooked ? '<span class="cooked-badge">'+I('chef',12)+'готовил'+NBSP+cooked+'</span>' : '') +
      '</div>' +
      kbjuLine(r.kbju, true) +
      (tags ? '<div class="tagrow">'+tags+'</div>' : '') +
    '</div>' +
    '<div class="card-foot">' + availHTML(r) +
      '<span class="foot-actions">' +
        '<button class="fab" data-action="to-shop" data-num="'+r.num+'" aria-label="В список покупок">'+I('cart',15)+'</button>' +
      '</span>' +
    '</div>' +
  '</article>';
}
function shortPortions(p){
  let s = String(p).replace(/\s*\([^)]*\)/g, '').replace(' порции','').replace(' порций','').replace(' порция','').replace(' гарнира','').replace(' белка','').trim();
  return s.length > 16 ? s.replace(/[^0-9-].*$/, '').trim() : s;
}
function renderRecipes(){
  renderBookChips(); renderTagChips();
  $('#timeFilter').value = F.time;
  $('#sortSel').value = F.sort;
  $('#availSort').checked = !!S.settings.availSort;
  const list = filtered();
  $('#recipeGrid').innerHTML = list.map(cardHTML).join('');
  const emp = $('#recipesEmpty');
  emp.hidden = list.length > 0;
  if(F.fav && !RECIPES.some(r => S.fav[r.num])){
    emp.querySelector('.t').textContent = 'В избранном пока пусто';
    emp.querySelector('p').textContent = 'Нажми сердечко на любой карточке - избранное соберётся здесь и всегда будет под рукой.';
  } else {
    emp.querySelector('.t').textContent = 'Ничего не нашлось';
    emp.querySelector('p').textContent = 'Попробуй сбросить фильтры или поискать по другому слову - например, по ингредиенту из холодильника.';
  }
  $('#randomBtn').innerHTML = I('dice',15) + 'Что приготовить?';
}

/* ---------- модальные окна ---------- */
const MROOT = $('#modalRoot');
let modalStack = [];
function openModal(html, opts){
  opts = opts || {};
  const ov = document.createElement('div');
  ov.className = 'overlay' + (opts.center ? ' center' : '');
  ov.innerHTML = html;
  ov.addEventListener('mousedown', e => { if(e.target === ov) closeModal(); });
  MROOT.appendChild(ov);
  modalStack.push(ov);
  document.body.style.overflow = 'hidden';
  return ov;
}
function closeModal(){
  const ov = modalStack.pop();
  if(ov) ov.remove();
  if(!modalStack.length) document.body.style.overflow = '';
}
function closeAllModals(){ modalStack.forEach(o => o.remove()); modalStack = []; document.body.style.overflow = ''; }
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

function stockDot(prod){
  const st = S.stock[prod];
  if(!st) return '';
  const c = st === 'ok' ? 'var(--ok)' : st === 'low' ? 'var(--warn)' : 'var(--bad)';
  const t = st === 'ok' ? 'есть' : st === 'low' ? 'мало' : 'нет';
  return '<span class="sdot" style="background:'+c+'" title="'+t+'"></span>';
}
function modalFootHTML(num, fav, cooked){
  const inShop = (S.shopExtra || []).some(x => x.num === num);
  return '<button class="btn '+(fav?'btn-soft':'btn-ghost')+'" data-action="fav" data-num="'+num+'">'+I('heart',15)+(fav?'В избранном':'В избранное')+'</button>' +
    '<button class="btn btn-ghost" data-action="cooked" data-num="'+num+'">'+I('chef',15)+'Я готовил'+(cooked?NBSP+'×'+cooked:'')+'</button>' +
    (cooked ? '<button class="btn-linklike" data-action="cooked-reset" data-num="'+num+'" title="Обнулить счётчик">обнулить</button>' : '') +
    '<button class="btn '+(inShop?'btn-soft':'btn-ghost')+'" data-action="to-shop" data-num="'+num+'" title="'+(inShop?'Убрать карточку из списка покупок':'Добавить ингредиенты карточки в покупки')+'">'+I('cart',15)+(inShop?'В покупках':'В покупки')+'</button>' +
    '<button class="btn btn-ghost" data-action="edit-recipe" data-num="'+num+'">'+I('pencil',15)+'Править</button>' +
    '<button class="btn btn-primary" data-action="to-menu" data-num="'+num+'" style="margin-left:auto">'+I('calendar',15)+'В меню</button>';
}
function openRecipeModal(num){
  const r = REC_BY_NUM[num]; if(!r) return;
  const b = BOOK[r.book] || {color:'var(--terra)', bg:'var(--terra-soft)', title:'Книга'};
  const av = availInfo(r);
  const k = r.kbju;
  let altHTML = '';
  if(r.kbjuAlt) altHTML = '<div class="kbju-note">Вариант Б (тосты с корицей): ' + fmtN(r.kbjuAlt.k) + ' ккал, Б ' + r.kbjuAlt.p + ' / Ж ' + r.kbjuAlt.f + ' / У ' + r.kbjuAlt.c + '</div>';
  const steps = r.steps.map(s => '<li>' + esc(s) + '</li>').join('');
  const tags = r.tags.map(t => '<span class="minitag">'+esc(t)+'</span>').join('');
  const fav = !!S.fav[r.num];
  const cooked = S.cooked[r.num] || 0;
  MODAL_PORT = {num: r.num, p: r.portionsBase || 1};
  openModal(
    '<div class="panel" data-recipe="'+r.num+'">' +
      '<div class="panel-head">' +
        '<div class="htxt">' +
          '<div class="panel-kicker"><span class="bookchip" style="color:'+b.color+';background:'+b.bg+'"><span class="dot"></span>'+esc(b.title)+'</span><span class="card-num">'+r.num+'</span></div>' +
          '<div class="panel-title">'+esc(r.title)+'</div>' +
          '<div class="panel-sub"><span class="ms">'+I('clock',12)+esc(r.timeText)+'</span><span class="ms">'+I('users',12)+esc(r.portionsText)+'</span><span class="ms">'+I('chef',12)+esc(r.inventory)+'</span></div>' +
        '</div>' +
        '<button class="close-x" data-action="close">'+I('x',17)+'</button>' +
      '</div>' +
      '<div class="panel-body"><div class="rgrid">' +
        '<div class="rcol left">' +
          '<div class="sect-h">КБЖУ на порцию' + (r.kbju.note ? ' ' + DOT + ' ' + esc(r.kbju.note) : '') + '</div>' +
          '<div class="kbju-grid">' +
            '<div class="kbju-cell"><div class="v">'+fmtN(k.k)+'</div><div class="l">ККАЛ</div></div>' +
            '<div class="kbju-cell"><div class="v">'+fmtN(k.p)+'</div><div class="l">БЕЛКИ</div></div>' +
            '<div class="kbju-cell"><div class="v">'+fmtN(k.f)+'</div><div class="l">ЖИРЫ</div></div>' +
            '<div class="kbju-cell"><div class="v">'+fmtN(k.c)+'</div><div class="l">УГЛЕВ.</div></div>' +
          '</div>' + altHTML +
          '<div class="port-total" id="portTotal"></div>' +
          '<div class="port-ctl"><span class="port-l">Порций</span>' +
            '<button class="port-btn" data-action="port-dec" aria-label="Меньше">'+I('minus',13)+'</button>' +
            '<span class="port-val" id="portVal"></span>' +
            '<button class="port-btn" data-action="port-inc" aria-label="Больше">'+I('plus',13)+'</button>' +
            '<span class="port-base">базово: '+esc(r.portionsText)+'</span></div>' +
          '<div class="sect-h">Ингредиенты</div><div id="ingsWrap"></div><div id="pkgWrap"></div>' +
          (av.mapped ? '<div class="kbju-note" style="margin-top:9px">Точки рядом с продуктами - статус из раздела «Запасы»: зелёная есть, жёлтая мало, красная нет.</div>' : '') +
          '<div class="sect-h">Инвентарь</div><div class="inv-line">'+I('chef',15)+esc(r.inventory)+'</div>' +
          (tags ? '<div class="tagline">'+tags+'</div>' : '') +
        '</div>' +
        '<div class="rcol">' +
          '<p class="intro-p">'+esc(r.intro)+'</p>' +
          '<div class="sect-h">Как готовить</div>' +
          '<ol class="steps">'+steps+'</ol>' +
          (r.notes ? '<div class="sect-h">Заметки и советы</div><div class="notes-box">'+esc(r.notes)+'</div>' : '') +
        '</div>' +
      '</div></div>' +
      '<div class="panel-foot">' + modalFootHTML(r.num, fav, cooked) + '</div>' +
    '</div>'
  );
  renderModalScale(r);
}
let MODAL_PORT = null;
function pluralPort(n){ return (n % 10 === 1 && n % 100 !== 11) ? 'порцию' : ((n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 'порции' : 'порций'); }
function scaledAmt(a, scale){
  if(scale === 1) return a;
  const m = String(a).trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if(!m) return a;
  const unit = (m[2] || '').trim().toLowerCase().replace(/\.$/,'');
  let q = parseFloat(m[1].replace(',','.')) * scale;
  if(unit === 'г' || unit === 'мл') q = Math.round(q / 5) * 5;
  else if(unit === 'шт') q = Math.round(q * 2) / 2;
  else q = Math.round(q * 10) / 10;
  if(q <= 0) return a;
  const s = (q % 1 === 0) ? String(q) : String(q).replace('.', ',');
  const u = (m[2] || '').trim();
  return s + (u ? ' ' + u : '');
}
function renderModalScale(r){
  const panel = MROOT.querySelector('.panel[data-recipe="'+r.num+'"]');
  if(!panel) return;
  const p = (MODAL_PORT && MODAL_PORT.num === r.num) ? MODAL_PORT.p : (r.portionsBase || 1);
  const pv = panel.querySelector('#portVal'), pt = panel.querySelector('#portTotal');
  const iw = panel.querySelector('#ingsWrap'), pw = panel.querySelector('#pkgWrap');
  if(!pv) return;
  pv.textContent = p;
  const scale = p / (r.portionsBase || 1);
  pt.innerHTML = 'Итого на ' + p + NBSP + pluralPort(p) + ': <b>' + fmtN(r.kbju.k * p) + '</b>' + NBSP + 'ккал' + DOT + 'Б ' + fmtN(r.kbju.p * p) + DOT + 'Ж ' + fmtN(r.kbju.f * p) + DOT + 'У ' + fmtN(r.kbju.c * p);
  iw.innerHTML = r.ingredients.map(i => {
    const prod = DATA.ing2stock[i.n] || (((S.customStock||[]).indexOf(i.n) >= 0) ? i.n : '');
    return '<div class="ing-row">' + (prod ? stockDot(prod) : '') + '<span class="ing-name">' + esc(i.n) + '</span><span class="ing-amt">' + esc(scaledAmt(i.a, scale)) + '</span></div>';
  }).join('');
  pw.innerHTML = meatHintHTML(r, p);
}
function meatHintHTML(r, p){
  let meat = 0;
  for(const i of r.ingredients){
    if(!/грудк|филе|фарш|индейк|куриц|говядин|свинин|мясо|стейк|шницел|котлет/i.test(i.n)) continue;
    const am = parseAmount(i.a);
    if(am.q != null && am.unit === 'г') meat += am.q * (p / (r.portionsBase || 1));
  }
  if(meat < 300) return '';
  const packs = Math.ceil(meat / 500);
  let h = '<div class="pkg-hint"><b>Мясо/птица на ' + p + NBSP + pluralPort(p) + ': ~' + fmtN(meat) + NBSP + 'г</b> - это ' + packs + ' уп. по ~500 г (курица продается блоками 500-800 г, округляй вверх: лишнее уйдет в заморозку).</div>';
  if((r.inventory || '').toLowerCase().indexOf('сковорода') >= 0 && meat > 1100){
    h += '<div class="pkg-hint" style="border-left-color:var(--bad); background:var(--badbg)"><b>Сковорода 28 см:</b> за раз в ней умещается примерно 1-1.2 кг мяса. Жарь в два захода или перенеси готовку в духовку, иначе куски будут тушиться, а не жариться.</div>';
  }
  return h;
}
function refreshModalFav(num){
  const panel = MROOT.querySelector('.panel[data-recipe="'+num+'"]');
  if(!panel) return;
  const foot = panel.querySelector('.panel-foot');
  const fav = !!S.fav[num];
  const cooked = S.cooked[num] || 0;
  if(foot) foot.innerHTML = modalFootHTML(num, fav, cooked);
}

/* ---------- РЕДАКТОР РЕЦЕПТОВ ---------- */
let EDIT = null;
const NEW_BOOK_COLORS = [
  {color:'#4E7A6A', bg:'#EAF1EC'},
  {color:'#5B6B9E', bg:'#ECF0F8'},
  {color:'#A8763E', bg:'#F8EFE4'},
  {color:'#7A5C9E', bg:'#F1EDF8'},
  {color:'#3F7A8C', bg:'#E6F2F5'},
  {color:'#8A3A54', bg:'#F8E9EE'}
];
const NEW_TEMPLATE_JSON = JSON.stringify({
  num: 'Х-01', book: 'osn', title: '', intro: '', inventory: 'плита',
  portionsText: '1 порция', timeTotal: 20, tags: [],
  kbju: {k: 0, p: 0, f: 0, c: 0, note: ''},
  ingredients: [['Название ингредиента', '200 г']],
  steps: ['Краткое описание шага'],
  notes: ''
}, null, 2);
function blankRecipe(){
  return {num:'', book:'osn', title:'', intro:'', inventory:'плита', portionsText:'1 порция',
    portionsBase:1, timeTotal:20, timeText:'20 мин', tags:[], ingredients:[], steps:[''],
    notes:'', kbju:{k:0,p:0,f:0,c:0,note:''}, kbjuAlt:null, custom:true};
}
function suggestNum(bookId){
  const b = BOOK[bookId];
  const letter = (b && b.code) ? b.code : (bookId[0] || 'X').toUpperCase();
  let max = 0;
  RECIPES.forEach(r => {
    const m = (r.num || '').match(new RegExp('^' + letter + '-(\\d+)$'));
    if(m) max = Math.max(max, parseInt(m[1], 10));
  });
  return letter + '-' + String(max + 1).padStart(2, '0');
}
function fld(label, ctrl, mod){ return '<div class="ed-field'+(mod?' '+mod:'')+'"><label class="ed-l">'+label+'</label>'+ctrl+'</div>'; }
function kf(id, l, v){ return '<div><label class="ed-l">'+l+'</label><input class="inp" id="'+id+'" inputmode="decimal" value="'+esc(v==null?'':v)+'"></div>'; }
function ingsToText(list){ return (list || []).map(i => i.n + (i.a ? ' - ' + i.a : '')).join('\n'); }
function editorHTML(){
  const r = EDIT.r;
  const bookOpts = BOOKS.map(b => '<option value="'+b.id+'"'+(r.book===b.id?' selected':'')+'>'+esc(b.title)+'</option>').join('') +
    '<option value="__new__">+ новая книга...</option>';
  return '<div class="panel ed-panel" id="edPanel">' +
    '<div class="panel-head"><div class="htxt">' +
      '<div class="panel-title">'+(EDIT.isNew ? 'Новая карточка' : 'Редактирование '+esc(r.num))+'</div>' +
      '<div class="panel-sub">Форма или JSON. JSON-шаблон для нового блюда можно вставить прямо из чата - я его генерирую по запросу.</div>' +
    '</div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="edtabs">' +
      '<button class="edtab'+(EDIT.tab==='form'?' active':'')+'" data-action="ed-tab" data-t="form">Форма</button>' +
      '<button class="edtab'+(EDIT.tab==='json'?' active':'')+'" data-action="ed-tab" data-t="json">JSON</button>' +
      '<span class="spacer"></span>' +
      '<button class="btn btn-ghost" data-action="ed-template" style="padding:7px 13px">'+I('code',14)+'Шаблон нового блюда</button>' +
    '</div>' +
    '<div class="ed-err" id="edErr"></div>' +
    '<div class="panel-body" style="padding-top:2px">' +
      '<div id="edFormWrap" class="ed-grid"'+(EDIT.tab!=='form'?' style="display:none"':'')+'>' +
        fld('Номер (например З-09)', '<input class="inp" id="ed-num" value="'+esc(r.num)+'" autocomplete="off">') +
        fld('Книга', '<select class="inp" id="ed-book">'+bookOpts+'</select>') +
        '<div class="ed-newbook" id="edNewBook">' +
          '<div class="ed-field"><label class="ed-l">Id книги (латиница)</label><input class="inp" id="ed-nb-id" placeholder="salad"></div>' +
          '<div class="ed-field"><label class="ed-l">Название книги</label><input class="inp" id="ed-nb-title" placeholder="Салаты"></div>' +
        '</div>' +
        fld('Название', '<input class="inp" id="ed-title" value="'+esc(r.title)+'">', 'full') +
        fld('Описание (1-2 предложения)', '<textarea class="inp" id="ed-intro">'+esc(r.intro)+'</textarea>', 'full') +
        fld('Время, мин (итого)', '<input class="inp" id="ed-time" inputmode="numeric" value="'+esc(r.timeTotal||'')+'">') +
        fld('Порции (текстом)', '<input class="inp" id="ed-portions" value="'+esc(r.portionsText||'')+'">') +
        fld('Инвентарь', '<input class="inp" id="ed-inventory" value="'+esc(r.inventory||'')+'">') +
        fld('Теги через запятую', '<input class="inp" id="ed-tags" value="'+esc((r.tags||[]).join(', '))+'">') +
        '<div class="ed-field full"><label class="ed-l">КБЖУ на порцию</label><div class="k-row">' +
          kf('ed-k','Ккал',r.kbju.k)+kf('ed-p','Б',r.kbju.p)+kf('ed-f','Ж',r.kbju.f)+kf('ed-c','У',r.kbju.c)+'</div>' +
          '<input class="inp" id="ed-knote" style="margin-top:8px" placeholder="Примечание (например: без гарнира)" value="'+esc(r.kbju.note||'')+'"></div>' +
        fld('Ингредиенты - по одному в строке: Название - количество', '<textarea class="inp" id="ed-ings" style="min-height:110px">'+esc(ingsToText(r.ingredients))+'</textarea>', 'full') +
        '<div class="ed-field full"><label class="ed-l">Вставить продукт из запасов</label><div style="display:flex; gap:8px">' +
          '<select class="inp" id="ed-ing-pick" style="flex:1"></select>' +
          '<button class="btn btn-ghost" data-action="ed-insert-ing" type="button">Вставить</button>' +
        '</div><div class="ed-hint">В списке все продукты из «Запасов», включая твои добавленные. Выбрал - нажми «Вставить» - допиши количество через дефис.</div></div>' +
        fld('Шаги - по одному в строке', '<textarea class="inp" id="ed-steps" style="min-height:110px">'+esc((r.steps||[]).join('\n'))+'</textarea>', 'full') +
        fld('Заметки и советы', '<textarea class="inp" id="ed-notes">'+esc(r.notes||'')+'</textarea>', 'full') +
      '</div>' +
      '<div id="edJsonWrap" style="padding:14px 22px 6px"'+(EDIT.tab==='json'?'':' style="display:none"')+'>' +
        '<textarea class="inp ed-json" id="ed-json" spellcheck="false"></textarea>' +
        '<div class="ed-hint">Формат: ingredients списком пар ["Название", "количество"]. Кнопка «Применить JSON» сохранит карточку сразу, «Заполнить форму» - перенесёт в форму для проверки. «Собрать из формы» - упакует текущую форму в JSON (удобно скопировать и прислать мне).</div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px">' +
          '<button class="btn btn-primary" data-action="ed-apply-json">Применить JSON</button>' +
          '<button class="btn btn-ghost" data-action="ed-fill-form">Заполнить форму</button>' +
          '<button class="btn btn-ghost" data-action="ed-to-json">'+I('copy',14)+'Собрать из формы</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="panel-foot">' +
      (EDIT.isNew ? '' : '<button class="btn btn-danger" data-action="ed-del">'+I('trash',15)+'Удалить</button>') +
      (!EDIT.isNew && SEED.recipes.some(x => x.num === EDIT.origNum) ? '<button class="btn btn-ghost" data-action="ed-reset">К оригиналу</button>' : '') +
      '<span style="flex:1"></span>' +
      '<button class="btn btn-ghost" data-action="close">Отмена</button>' +
      '<button class="btn btn-primary" data-action="ed-save">'+I('check',15)+'Сохранить</button>' +
    '</div></div>';
}
function openEditor(num){
  const isNew = !num || !REC_BY_NUM[num];
  const base = isNew ? blankRecipe() : JSON.parse(JSON.stringify(REC_BY_NUM[num]));
  if(isNew) base.num = suggestNum('osn');
  EDIT = {isNew: isNew, origNum: isNew ? null : num, r: base, tab:'form', newBook:null};
  openModal(editorHTML());
  fillEditorJson();
  fillIngPicker();
  $('#ed-book').addEventListener('change', function(){
    const nb = $('#edNewBook');
    if(nb) nb.classList.toggle('show', this.value === '__new__');
  });
}
function fillEditorJson(){
  const ta = $('#ed-json');
  if(ta) ta.value = recipeToJson(EDIT.r);
}
function recipeToJson(r){
  const o = JSON.parse(JSON.stringify(r));
  o.ingredients = (r.ingredients || []).map(i => [i.n, i.a || '']);
  return JSON.stringify(o, null, 2);
}
function normalizeRecipe(o){
  if(!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('ожидался объект-карточка');
  const kb = o.kbju || {};
  const r = {
    num: String(o.num || '').trim().toUpperCase(),
    book: String(o.book || '').trim() || 'osn',
    title: cleanDash(String(o.title || '').trim()),
    intro: cleanDash(String(o.intro || '').trim()),
    inventory: cleanDash(String(o.inventory || '').trim()) || 'плита',
    portionsText: cleanDash(String(o.portionsText || '').trim()) || '1 порция',
    timeTotal: Math.max(0, Math.round(numOf(o.timeTotal))),
    tags: (o.tags || []).map(t => cleanDash(String(t).trim())).filter(Boolean),
    ingredients: (o.ingredients || []).map(i => Array.isArray(i)
      ? {n: cleanDash(String(i[0] || '').trim()), a: cleanDash(String(i[1] || '').trim())}
      : {n: cleanDash(String(i.n || '').trim()), a: cleanDash(String(i.a || '').trim())}
    ).filter(i => i.n),
    steps: (o.steps || []).map(s => cleanDash(String(s).trim())).filter(Boolean),
    notes: cleanDash(String(o.notes || '').trim()),
    kbju: {k: numOf(kb.k), p: numOf(kb.p), f: numOf(kb.f), c: numOf(kb.c), note: cleanDash(String(kb.note || '').trim())},
    kbjuAlt: o.kbjuAlt || null,
    custom: true
  };
  const m = r.portionsText.match(/\d+(?:[.,]\d+)?/);
  r.portionsBase = m ? parseFloat(m[0].replace(',', '.')) : 1;
  r.timeText = r.timeTotal ? r.timeTotal + ' мин' : '';
  return r;
}
function parseRecipeJson(){
  return normalizeRecipe(JSON.parse($('#ed-json').value));
}
function collectForm(){
  const g = id => { const el = $('#'+id); return el ? el.value : ''; };
  const errs = [];
  const r = {
    num: g('ed-num').trim().toUpperCase(),
    book: g('ed-book'),
    title: cleanDash(g('ed-title').trim()),
    intro: cleanDash(g('ed-intro').trim()),
    inventory: cleanDash(g('ed-inventory').trim()) || 'плита',
    portionsText: cleanDash(g('ed-portions').trim()) || '1 порция',
    timeTotal: Math.max(0, Math.round(numOf(g('ed-time')))),
    tags: g('ed-tags').split(',').map(s => cleanDash(s.trim())).filter(Boolean),
    ingredients: g('ed-ings').split('\n').map(line => {
      const parts = line.split(' - ');
      const n = cleanDash(parts[0].trim());
      const a = cleanDash(parts.slice(1).join(' - ').trim());
      return n ? {n: n, a: a || 'по вкусу'} : null;
    }).filter(Boolean),
    steps: g('ed-steps').split('\n').map(s => cleanDash(s.trim())).filter(Boolean),
    notes: cleanDash(g('ed-notes').trim()),
    kbju: {k: numOf(g('ed-k')), p: numOf(g('ed-p')), f: numOf(g('ed-f')), c: numOf(g('ed-c')), note: cleanDash(g('ed-knote').trim())},
    kbjuAlt: EDIT.r.kbjuAlt || null,
    custom: true
  };
  if(r.book === '__new__'){
    const id = g('ed-nb-id').trim().toLowerCase();
    const title = cleanDash(g('ed-nb-title').trim());
    if(!/^[a-z][a-z0-9]{1,11}$/.test(id)) errs.push('- Id новой книги: латиница, 2-12 знаков (например salad)');
    if(!title) errs.push('- Название новой книги обязательно');
    r.book = id || 'custom';
    EDIT.newBook = id && title ? {id: id, title: title, short: title.split(' ')[0].slice(0, 12)} : null;
  } else EDIT.newBook = null;
  const m = r.portionsText.match(/\d+(?:[.,]\d+)?/);
  r.portionsBase = m ? parseFloat(m[0].replace(',', '.')) : 1;
  r.timeText = r.timeTotal ? r.timeTotal + ' мин' : '';
  return {r: r, errs: errs};
}
function validateRecipe(r){
  const errs = [];
  if(!/^[A-ZА-ЯЁ]{1,3}-\d{1,3}$/.test(r.num)) errs.push('- Номер должен быть вида «Х-01» (буква, дефис, цифры)');
  if(!r.title) errs.push('- Название обязательно');
  if(!BOOK[r.book]) errs.push('- Книга не выбрана (или id новой книги заполнен неверно)');
  if(EDIT.origNum ? (r.num !== EDIT.origNum && REC_BY_NUM[r.num]) : REC_BY_NUM[r.num]) errs.push('- Номер ' + r.num + ' уже занят другой карточкой');
  ['k','p','f','c'].forEach(x => { if(isNaN(r.kbju[x]) || r.kbju[x] < 0) errs.push('- КБЖУ: проверь числа'); });
  if(!r.ingredients.length) errs.push('- Добавь хотя бы один ингредиент');
  if(!r.steps.length) errs.push('- Добавь хотя бы один шаг');
  return errs;
}
function showEdErr(errs){
  const box = $('#edErr');
  if(!box) return;
  box.textContent = 'Проверь:\n' + errs.join('\n');
  box.classList.add('show');
}
function renameRefs(oldNum, newNum){
  if(S.fav[oldNum]){ S.fav[newNum] = S.fav[oldNum]; delete S.fav[oldNum]; }
  if(S.cooked[oldNum]){ S.cooked[newNum] = S.cooked[oldNum]; delete S.cooked[oldNum]; }
  (S.shopExtra || []).forEach(x => { if(x.num === oldNum) x.num = newNum; });
  for(const d in S.menu){
    const ds = S.menu[d];
    if(ds && ds.slots) SLOT_IDS.forEach(sl => (ds.slots[sl] || []).forEach(e => { if(e.t !== 'c' && e.n === oldNum) e.n = newNum; }));
  }
}
function saveEditor(){
  if(!EDIT) return;
  let r, errs = [];
  if(EDIT.tab === 'json'){
    try{ r = parseRecipeJson(); }
    catch(e){ showEdErr(['- JSON не читается: ' + e.message]); return; }
  } else {
    const res = collectForm();
    r = res.r; errs = res.errs;
  }
  errs = errs.concat(validateRecipe(r));
  if(errs.length){ showEdErr(errs); return; }
  try{
    if(EDIT.newBook && !S.customBooks.some(b => b.id === EDIT.newBook.id)){
      const pal = NEW_BOOK_COLORS[S.customBooks.length % NEW_BOOK_COLORS.length];
      S.customBooks.push({id: EDIT.newBook.id, title: EDIT.newBook.title, short: EDIT.newBook.short, color: pal.color, bg: pal.bg});
    }
    if(!S.recipes) S.recipes = RECIPES.map(x => JSON.parse(JSON.stringify(x)));
    const i = S.recipes.findIndex(x => x.num === EDIT.origNum);
    if(EDIT.isNew || i < 0) S.recipes.push(r); else S.recipes[i] = r;
    if(EDIT.origNum && EDIT.origNum !== r.num) renameRefs(EDIT.origNum, r.num);
    rebuildIndexes(); save(); closeAllModals(); renderAll();
    toast(EDIT.isNew ? ('Карточка ' + r.num + ' добавлена') : ('Карточка ' + r.num + ' сохранена'));
  }catch(e){ showEdErr(['- Не получилось сохранить: ' + e.message]); }
}

/* ---------- ВЫБОР БЛЮДА (пикер) ---------- */
let PICK_CTX = null;
function openPicker(day, slot){
  PICK_CTX = {day, slot, tab:'book', added:{}};
  openModal('<div class="panel small" id="pickPanel" style="max-width:640px">' +
    '<div class="panel-head"><div class="htxt"><div class="panel-title">Добавить блюдо</div><div class="panel-sub" id="pickSub"></div></div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="edtabs" style="padding:12px 18px 0">' +
      '<button class="edtab active" data-action="pick-tab" data-t="book">Из книги</button>' +
      '<button class="edtab" data-action="pick-tab" data-t="custom">Своё блюдо</button>' +
    '</div>' +
    '<div class="panel-body" style="padding:12px 18px">' +
      '<div id="pickBookWrap"><input id="pickSearch" type="search" placeholder="Поиск блюда..." style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--line2);background:var(--panel);outline:none" autocomplete="off"><div id="pickList" style="margin-top:10px"></div></div>' +
      '<div id="pickCustomWrap" style="display:none">' +
        '<div class="ed-grid" style="padding:4px 0 2px">' +
          fld('Что съел или готовил (например: Шоколадка)', '<input class="inp" id="pk-name" placeholder="Название">', 'full') +
          '<div class="ed-field full"><label class="ed-l">КБЖУ на штуку/порцию - можно заполнить только калории</label><div class="k-row">' +
          kf('pk-k','Ккал','')+kf('pk-b','Б','')+kf('pk-f','Ж','')+kf('pk-c','У','')+'</div></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; padding:4px 0 8px"><button class="btn btn-primary" data-action="custom-add">Добавить в приём пищи</button></div>' +
      '</div>' +
    '</div>' +
    '<div class="panel-foot"><button class="btn btn-primary" data-action="close" style="margin-left:auto">Готово</button></div></div>');
  renderPicker('');
  const inp = $('#pickSearch');
  inp.addEventListener('input', () => renderPicker(inp.value));
  inp.focus();
}
function renderPicker(q){
  if(!PICK_CTX) return;
  $('#pickSub').textContent = DAY_NAMES[DAY_IDS.indexOf(PICK_CTX.day)] + ', ' + SLOT_NAMES[SLOT_IDS.indexOf(PICK_CTX.slot)].toLowerCase();
  q = (q||'').toLowerCase();
  const list = RECIPES.filter(r => !q || (r.title + ' ' + r.num + ' ' + r.tags.join(' ')).toLowerCase().includes(q));
  $('#pickList').innerHTML = list.map(r => {
    const b = BOOK[r.book] || {color:'var(--terra)', bg:'var(--terra-soft)'};
    const added = PICK_CTX.added[r.num];
    return '<div class="pick-row" data-action="pick" data-num="'+r.num+'" style="'+(added?'opacity:.5':'')+'">' +
      '<span class="pick-num" style="color:'+b.color+';background:'+b.bg+'">'+r.num+'</span>' +
      '<span class="pt"><span class="t1">'+esc(r.title)+'</span><span class="t2">'+esc(shortPortions(r.portionsText))+DOT+r.timeTotal+NBSP+'мин'+(added?DOT+'добавлено':'')+'</span></span>' +
      '<span class="pk">'+fmtN(r.kbju.k)+'</span></div>';
  }).join('') || '<div class="empty" style="padding:30px"><div class="t serif">Не нашлось</div></div>';
}

/* ---------- ВЫБОР СЛОТА (из карточки) ---------- */
function openSlotChooser(num, portP){
  openModal('<div class="panel small" style="max-width:430px">' +
    '<div class="panel-head"><div class="htxt"><div class="panel-title">Добавить в меню</div><div class="panel-sub">'+esc(REC_BY_NUM[num].title)+(portP ? DOT + portP + NBSP + pluralPort(portP) : '')+'</div></div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="panel-body" style="padding:16px 20px">' +
      '<div class="sect-h">День</div><div class="slots" style="grid-template-columns:repeat(4,1fr)">' +
        DAY_IDS.map((d,i) => '<button class="btn btn-ghost day-pick" data-action="pick-day" data-day="'+d+'" style="justify-content:center">'+DAY_NAMES[i]+'</button>').join('') +
      '</div>' +
      '<div class="sect-h">Приём пищи</div><div class="slots" style="grid-template-columns:1fr 1fr">' +
        SLOT_IDS.map((s,i) => '<button class="btn btn-ghost slot-pick" data-action="pick-slot" data-slot="'+s+'" style="justify-content:center">'+SLOT_NAMES[i]+'</button>').join('') +
      '</div>' +
    '</div>' +
    '<div class="panel-foot"><button class="btn btn-primary" data-action="pick-confirm" data-num="'+num+'" data-p="'+(portP||'')+'" style="margin-left:auto">Добавить</button><span id="pickChoice" class="kbju-line" style="color:var(--muted)"></span></div></div>', {center:true});
  window.__pickDay = null; window.__pickSlot = null;
  const ov = modalStack[modalStack.length-1];
  ov.addEventListener('click', e => {
    const d = e.target.closest('[data-action="pick-day"]');
    const s = e.target.closest('[data-action="pick-slot"]');
    if(d){ window.__pickDay = d.dataset.day; $$('.day-pick').forEach(x => x.classList.remove('btn-primary')); d.classList.add('btn-primary'); updatePickChoice(); }
    if(s){ window.__pickSlot = s.dataset.slot; $$('.slot-pick').forEach(x => x.classList.remove('btn-primary')); s.classList.add('btn-primary'); updatePickChoice(); }
    function updatePickChoice(){
      const el = $('#pickChoice');
      if(el) el.textContent = (window.__pickDay ? DAY_NAMES[DAY_IDS.indexOf(window.__pickDay)] : '') + (window.__pickSlot ? ', ' + SLOT_NAMES[SLOT_IDS.indexOf(window.__pickSlot)].toLowerCase() : '');
    }
  });
}

/* ---------- МЕНЮ ---------- */
function dayState(d){
  if(!S.menu[d]) S.menu[d] = {type: d === 'sun' ? 'sun' : 'norm', slots: {b:[],l:[],d:[],x:[]}};
  if(!S.menu[d].slots) S.menu[d].slots = {b:[],l:[],d:[],x:[]};
  return S.menu[d];
}
function dayTotals(d){
  const ds = S.menu[d]; const t = {k:0,p:0,f:0,c:0};
  if(ds && ds.slots){
    for(const sl of SLOT_IDS) for(const dish of (ds.slots[sl]||[])){
      if(dish.t === 'c'){
        const q = dish.qty || 1;
        t.k += (dish.kcal||0) * q; t.p += (dish.b||0) * q; t.f += (dish.f||0) * q; t.c += (dish.c||0) * q;
        continue;
      }
      const r = REC_BY_NUM[dish.n]; if(!r) continue;
      const p = dish.p || 1;
      t.k += r.kbju.k * p; t.p += r.kbju.p * p; t.f += r.kbju.f * p; t.c += r.kbju.c * p;
    }
  }
  return {k:Math.round(t.k), p:Math.round(t.p), f:Math.round(t.f), c:Math.round(t.c)};
}
function barCls(ratio){
  if(ratio <= 0) return 'var(--line2)';
  if(ratio >= 0.85 && ratio <= 1.15) return 'var(--ok)';
  if((ratio >= 0.6 && ratio < 0.85) || (ratio > 1.15 && ratio <= 1.35)) return 'var(--warn)';
  return 'var(--bad)';
}
function dishHTML(dish, i, d, sl){
  if(dish.t === 'c'){
    const kc = Math.round((dish.kcal||0) * (dish.qty||1));
    return '<div class="dish">' +
      '<div class="dish-top"><span class="num own">Своё</span><span class="nm" title="'+esc(dish.name)+'">'+esc(dish.name)+'</span>' +
      '<button class="x2btn" data-action="dish-x2" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'" title="Поставить то же блюдо на следующий день">х2</button>' +
      '<button class="del" data-action="dish-del" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('x',12)+'</button></div>' +
      '<div class="dish-bot"><span class="kc">'+fmtN(dish.kcal||0)+NBSP+'ккал/шт'+DOT+'своё блюдо</span>' +
      '<span class="stepper"><button data-action="dish-dec" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('minus',11)+'</button><span class="pv">'+(dish.qty||1)+'</span><button data-action="dish-inc" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('plus',11)+'</button></span>' +
      '<span class="kc"><b style="color:var(--ink2)">'+fmtN(kc)+'</b>'+NBSP+'ккал</span></div>' +
    '</div>';
  }
  const r = REC_BY_NUM[dish.n];
  if(!r){
    return '<div class="dish"><div class="dish-top"><span class="num gone">'+esc(dish.n)+'</span><span class="nm">рецепт удалён</span>' +
      '<button class="del" data-action="dish-del" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('x',12)+'</button></div></div>';
  }
  const kc = Math.round(r.kbju.k * (dish.p||1));
  return '<div class="dish">' +
    '<div class="dish-top"><span class="num">'+r.num+'</span>' + dishBuyBadge(r) + '<span class="nm" title="'+esc(r.title)+'">'+esc(r.title)+'</span>' +
    '<button class="x2btn" data-action="dish-x2" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'" title="Поставить то же блюдо на следующий день">х2</button>' +
    '<button class="x2btn" data-action="dish-swap" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'" title="Заменить другим блюдом из этой книги">'+I('dice',11)+'</button>' +
    '<button class="del" data-action="dish-del" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('x',12)+'</button></div>' +
    '<div class="dish-bot"><span class="kc">'+fmtN(r.kbju.k)+NBSP+'ккал/порция'+(r.kbju.note?DOT+esc(r.kbju.note):'')+'</span>' +
    '<span class="stepper"><button data-action="dish-dec" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('minus',11)+'</button><span class="pv">'+(dish.p||1)+'</span><button data-action="dish-inc" data-day="'+d+'" data-slot="'+sl+'" data-i="'+i+'">'+I('plus',11)+'</button></span>' +
    '<span class="kc"><b style="color:var(--ink2)">'+fmtN(kc)+'</b>'+NBSP+'ккал</span></div>' +
  '</div>';
}
function dishBuyBadge(r){
  const av = availInfo(r);
  if(!av.mapped || !av.missing) return '';
  const names = av.out.concat(av.low).join(', ');
  return '<span class="buybadge" title="Нет или мало в запасах: ' + esc(names) + '">докупи' + NBSP + av.missing + '</span>';
}
function renderMenu(){
  const TT = targets();
  const TODAY = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
  $('#menuSub').textContent = 'Сегодня ' + new Date().toLocaleDateString('ru-RU', {weekday:'long', day:'numeric', month:'long'}) + '. Собери приёмы пищи на неделю - калории и БЖУ посчитаются против целей. Цели правятся в настройках: обычный день ' + fmtN(TT.norm.k) + ' ккал (Б ' + fmtN(TT.norm.p) + ' / Ж ' + fmtN(TT.norm.f) + ' / У ' + fmtN(TT.norm.c) + '), воскресенье ' + fmtN(TT.sun.k) + ' ккал (Б ' + fmtN(TT.sun.p) + ' / Ж ' + fmtN(TT.sun.f) + ' / У ' + fmtN(TT.sun.c) + ').';
  let weekK = 0;
  const html = DAY_IDS.map((d, di) => {
    const ds = dayState(d);
    const t = dayTotals(d);
    weekK += t.k;
    const tg = TT[ds.type] || TT.norm;
    const open = !!S.openDays[d] || t.k > 0;
    const bars = [['К', t.k, tg.k, 'ккал'], ['Б', t.p, tg.p, 'г'], ['Ж', t.f, tg.f, 'г'], ['У', t.c, tg.c, 'г']].map(b => {
      const ratio = b[1] / b[2];
      const w = Math.min(100, ratio * 100);
      return '<div class="bar-row"><span class="bar-l">'+b[0]+'</span><span class="bar-t"><span class="bar-f" style="width:'+w+'%;background:'+barCls(ratio)+'"></span></span><span class="bar-v">'+fmtN(b[1])+' / '+fmtN(b[2])+'</span></div>';
    }).join('');
    const slots = SLOT_IDS.map((sl, si) => {
      const dishes = (ds.slots[sl]||[]).map((dish, i) => dishHTML(dish, i, d, sl)).join('');
      return '<div class="slot"><div class="slot-h"><span class="slot-name">'+SLOT_NAMES[si]+'</span><button class="slot-add" data-action="slot-add" data-day="'+d+'" data-slot="'+sl+'" aria-label="Добавить блюдо">'+I('plus',13)+'</button></div>' + dishes + '</div>';
    }).join('');
    return '<div class="day-card'+(open?' open':'')+'" data-day="'+d+'">' +
      '<div class="day-head" data-action="day-toggle" data-day="'+d+'">' +
        '<span class="day-name">'+DAY_NAMES[di]+'</span>' + (d === TODAY ? '<span class="today-badge">сегодня</span>' : '') +
        '<span class="day-type" data-day="'+d+'">' +
          '<button class="'+(ds.type==='norm'?'on':'')+'" data-action="day-type" data-day="'+d+'" data-t="norm">'+fmtN(TT.norm.k)+'</button>' +
          '<button class="'+(ds.type==='sun'?'on':'')+'" data-action="day-type" data-day="'+d+'" data-t="sun">вс'+NBSP+fmtN(TT.sun.k)+'</button>' +
        '</span>' +
        '<span class="day-sum"><span class="k">'+fmtN(t.k)+'<small> / '+fmtN(tg.k)+' ккал</small></span><span class="m">Б '+fmtN(t.p)+DOT+'Ж '+fmtN(t.f)+DOT+'У '+fmtN(t.c)+'</span></span>' +
        '<span class="chev">'+I('chev',16)+'</span>' +
      '</div>' +
      '<div class="day-body"><div class="bars">'+bars+'</div><div class="slots">'+slots+'</div></div>' +
    '</div>';
  }).join('');
  $('#menuList').innerHTML = html;
  $('#menuWeekSum').textContent = weekK ? ('Итого за неделю: ' + fmtN(weekK) + ' ккал') : '';
  $('#statBtn').innerHTML = I('chart',15) + 'Статистика';
  $('#copyMenuBtn').innerHTML = I('copy',15) + 'Скопировать меню';
  $('#collectMenuBtn').innerHTML = I('calendar',15) + 'Собрать меню';
  $('#printMenuBtn').innerHTML = I('print',15) + 'Печать';
  $('#clearMenuBtn').innerHTML = I('trash',15) + 'Очистить всё';
}

/* ---------- АВТОСБОРКА МЕНЮ ---------- */
function openCollectModal(){
  const empties = DAY_IDS.reduce((s,d) => s + SLOT_IDS.reduce((q,sl) => q + ((dayState(d).slots[sl]||[]).length ? 0 : 1), 0), 0);
  openModal('<div class="panel small">' +
    '<div class="panel-head"><div class="htxt"><div class="panel-title">Собрать меню на неделю</div><div class="panel-sub">Автоплан по книгам - сейчас пустых приёмов пищи: ' + empties + '</div></div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="panel-body" style="padding:14px 20px">' +
      '<div class="set-hint" style="margin:0 0 8px">Завтраки: смузи и ночная овсянка в будни, горячее в выходные. Обеды: пакетная готовка - блюдо держится два дня подряд. Ужины: основные блюда, в субботу стейки из книги М с гарниром. Перекусы: творожный блок и десерты.</div>' +
      '<div class="set-hint" style="margin:0">«Заполнить пустое» не трогает собранные приёмы пищи. «Пересобрать всё» строит неделю заново - типы дней сохраняются.</div>' +
    '</div>' +
    '<div class="panel-foot"><button class="btn btn-ghost" data-action="collect-fill">Заполнить пустое</button><button class="btn btn-primary" data-action="collect-rebuild" style="margin-left:auto">Пересобрать всё</button></div></div>', {center:true});
}
function menuPools(){
  return {
    bWeek: ['З-01','З-02','З-05','З-10','З-11','З-12'],
    bWknd: ['З-03','З-04','З-06','З-07','З-09','З-13'],
    l: ['П-01','П-02','П-03','П-04','П-05','П-06','П-07','П-08'],
    d: ['О-01','О-02','О-03','О-04','О-05','О-06','О-07','О-08','О-09','О-10','О-11','О-12','О-13','О-14','О-15'],
    meat: ['М-01','М-02','М-03','М-04','М-05'],
    garn: ['Г-02','Г-05','Г-06','Г-07','Г-08','Г-09','Г-10','Г-11'],
    x: ['З-08','Д-02','Д-03','Д-04','Д-05','Д-06','Д-07','Д-08','Д-09','Д-10','Д-11']
  };
}
function shuffled(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function pickFresh(pool, used){
  const fresh = shuffled(pool).filter(n => !used.has(n));
  return fresh.length ? fresh[0] : shuffled(pool)[0];
}
function autoMenu(mode){
  const P = menuPools();
  const used = {};
  SLOT_IDS.forEach(sl => { used[sl] = new Set(); });
  if(mode === 'fill'){
    DAY_IDS.forEach(d => SLOT_IDS.forEach(sl => (dayState(d).slots[sl]||[]).forEach(dh => { if(dh.n) used[sl].add(dh.n); })));
  }
  const lp = shuffled(P.l), dp = shuffled(P.d), eb = shuffled(P.bWknd), xp = shuffled(P.x), mp = shuffled(P.meat), gp = shuffled(P.garn);
  DAY_IDS.forEach((d, di) => {
    const ds = dayState(d);
    const place = (sl, pool, n) => {
      if(!REC_BY_NUM[n]) return;
      if(mode !== 'all' && (ds.slots[sl]||[]).length) return;
      if(mode === 'fill' && used[sl].has(n)) n = pickFresh(pool, used[sl]);
      used[sl].add(n);
      ds.slots[sl] = [{t:'r', n:n, p:1}];
    };
    place('b', P.bWeek, di < 5 ? pickFresh(P.bWeek, used.b) : eb[(di - 5) % eb.length]);
    place('l', P.l, lp[Math.floor(di / 2) % lp.length]);
    if(d === 'sat' && (mode === 'all' || !(ds.slots.d || []).length)){
      const m = pickFresh(P.meat, used.d); used.d.add(m);
      const g = pickFresh(P.garn, used.d); used.d.add(g);
      ds.slots.d = [{t:'r', n:m, p:1}, {t:'r', n:g, p:1}];
    } else {
      place('d', P.d, dp[di % dp.length]);
    }
    place('x', P.x, xp[di % xp.length]);
  });
  save(); renderMenu(); renderNav();
  toast(mode === 'all' ? 'Меню пересобрано: подравняй дни порциями «-» и «+»' : 'Пустые приёмы пищи заполнены');
}

/* ---------- ПОКУПКИ ---------- */
function parseAmount(a){
  const m = String(a).trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if(!m) return {q:null, unit:''};
  let unit = (m[2] || 'шт').trim().toLowerCase();
  if(unit === 'г' || unit === 'г.') unit = 'г';
  if(unit === 'мл') unit = 'мл';
  if(unit === 'шт.' || unit === 'шт') unit = 'шт';
  if(!unit) unit = 'шт';
  return {q: parseFloat(m[1].replace(',','.')), unit};
}
function aggregateRecipes(entries, isExtra){
  const items = new Map();
  for(const e of entries){
    const r = REC_BY_NUM[e.num]; if(!r) continue;
    const scale = (e.p == null) ? 1 : (e.p || 1) / (r.portionsBase || 1);
    for(const ing of r.ingredients){
      if(DATA.noBuy.includes(ing.n)) continue;
      const canon = DATA.ing2stock[ing.n] || ing.n;
      const cat = DATA.ingCat[ing.n] || 'Прочее';
      const am = parseAmount(ing.a);
      const key = canon + '|' + am.unit;
      let it = items.get(key);
      if(!it){ it = {name:canon, cat, unit:am.unit, qty:0, loose:false, srcs:new Set(), extra:false, manual:false, fromNums:new Set()}; items.set(key, it); }
      it.srcs.add(r.num);
      it.fromNums.add(e.num);
      if(am.q == null) it.loose = true;
      else it.qty += am.q * scale;
    }
  }
  void isExtra;
  return items;
}
let EXTRA_BY_KEY = {};
function computeShopRaw(){
  const menuEntries = [];
  for(const d of DAY_IDS){
    const ds = S.menu[d]; if(!ds || !ds.slots) continue;
    for(const sl of SLOT_IDS) for(const dish of (ds.slots[sl]||[])){
      if(dish.t !== 'r') continue;
      menuEntries.push({num: dish.n, p: dish.p});
    }
  }
  const extraEntries = S.shopExtra.map(e => ({num: e.num, p: e.p}));
  const menuMap = aggregateRecipes(menuEntries);
  const extraMap = aggregateRecipes(extraEntries);
  EXTRA_BY_KEY = {};
  const items = [];
  const seen = new Set();
  menuMap.forEach((it, key) => { it.key = key; items.push(it); seen.add(key); });
  extraMap.forEach((it, key) => {
    if(seen.has(key)){
      const t = items.find(x => x.key === key);
      it.srcs.forEach(s => t.srcs.add(s));
      return;
    }
    it.key = key; it.extra = true; items.push(it);
    EXTRA_BY_KEY[key] = Array.from(it.fromNums);
  });
  S.shopCustom.forEach(c => {
    items.push({name: c.name, cat: 'Мои позиции', unit: '', qty: null, loose: true, srcs: new Set(), manual: true, key: 'c:' + c.id});
  });
  // «по вкусу» вливается в весовую строку того же продукта, если она есть
  const byName = new Map();
  items.forEach(it => { if(!byName.has(it.name)) byName.set(it.name, []); byName.get(it.name).push(it); });
  const merged = [];
  byName.forEach(arr => {
    const quant = arr.filter(i => i.qty != null && i.qty > 0);
    const loose = arr.filter(i => !(i.qty != null && i.qty > 0));
    if(quant.length && loose.length){
      loose.forEach(l => {
        l.srcs.forEach(s => quant[0].srcs.add(s));
        if(l.extra) quant[0].extra = true;
        if(l.manual) quant[0].manual = true;
        if(l.extra && EXTRA_BY_KEY[l.key]) EXTRA_BY_KEY[quant[0].key] = EXTRA_BY_KEY[l.key];
      });
      merged.push(...quant);
    } else merged.push(...arr);
  });
  return merged;
}
function computeShop(){
  const visible = computeShopRaw().filter(it => !S.shopHide[it.key]);
  if(!S.skipStock) return visible;
  return visible.filter(it => it.manual || S.stock[it.name] !== 'ok');
}
function fmtQty(it){
  if(it.qty == null || it.qty === 0){
    return it.loose ? 'по вкусу' : '';
  }
  let q = it.qty;
  if(/^(г|мл)$/.test(it.unit)){
    q = q >= 20 ? Math.round(q / 5) * 5 : Math.round(q * 10) / 10;
  } else if(it.unit === 'шт'){
    q = Math.round(q * 2) / 2;
  } else {
    q = Math.round(q * 10) / 10;
  }
  if(q === 0) q = 0.5;
  let s = (q % 1 === 0 ? String(q) : String(q).replace('.', ','));
  return s + (it.unit ? NBSP + it.unit : '');
}
function renderShop(){
  const visible = computeShopRaw().filter(it => !S.shopHide[it.key]);
  const stockHidden = visible.filter(it => !it.manual && S.stock[it.name] === 'ok').length;
  const items = computeShop();
  const hasMenu = items.some(i => !i.manual) || stockHidden > 0;
  $('#shopSub').textContent = hasMenu
    ? 'Список собран из меню на неделю и добавленных вручную карточек. Чекбоксы и свои позиции сохраняются.'
    : 'Меню пока пустое: добавь блюда в планировщике или открой любую карточку и нажми «В покупки» - список соберётся автоматически.';
  const done = items.filter(i => S.shopDone[i.key]).length;
  $('#shopProgress').textContent = items.length ? ('Куплено ' + done + ' из ' + items.length) : '';
  $('#addManualBtn').innerHTML = I('plus',15) + 'Добавить';
  $('#copyShopBtn').innerHTML = I('copy',15) + 'Копировать';
  $('#printShopBtn').innerHTML = I('print',15) + 'Печать';
  $('#clearDoneBtn').innerHTML = I('check',15) + 'Убрать купленное';
  $('#stockFilterBtn').innerHTML = I('box',15) + (S.skipStock ? 'Запасы учтены' : 'Без учёта запасов');
  $('#stockFilterBtn').className = 'btn ' + (S.skipStock ? 'btn-soft' : 'btn-ghost');
  if(!items.length){
    $('#shopList').innerHTML = '<div class="empty"><div class="big">🛒</div><div class="t serif">Список пуст</div><p>Спланируй меню на неделю или добавь блюда в покупки прямо из карточек - ингредиенты соберутся и сложатся автоматически.</p></div>';
    renderShopNote(stockHidden);
    return;
  }
  const groups = new Map();
  for(const it of items){
    if(!groups.has(it.cat)) groups.set(it.cat, []);
    groups.get(it.cat).push(it);
  }
  let h = '';
  DATA.shopCats.forEach(cat => {
    const g = groups.get(cat); if(!g || !g.length) return;
    h += '<div class="shop-group"><div class="shop-ghead">'+esc(cat)+'<span class="gcount">'+g.length+'</span></div>';
    h += g.map(it => {
      const isDone = !!S.shopDone[it.key];
      const src = Array.from(it.srcs).slice(0,6).join(', ');
      return '<label class="sitem'+(isDone?' done':'')+'" style="cursor:default">' +
        '<input type="checkbox" data-action="shop-check" data-key="'+esc(it.key)+'"'+(isDone?' checked':'')+'>' +
        '<span class="nm"><span class="t1">'+esc(it.name)+'</span>' + (src ? '<span class="t2">'+esc(src)+(it.extra?DOT+'добавлено из карточки':'')+'</span>' : '') + '</span>' +
        '<span class="qty">'+fmtQty(it)+'</span>' +
        '<button class="del" data-action="shop-del" data-key="'+esc(it.key)+'" title="Убрать из списка">'+I('trash',13)+'</button>' +
      '</label>';
    }).join('');
    h += '</div>';
  });
  $('#shopList').innerHTML = h;
  renderShopNote(stockHidden);
}
function renderShopNote(stockHidden){
  let note = 'Похожие продукты из разных карточек сложились в одну строку. Ингредиенты «по вкусу» (специи, соль) не имеют веса - докупай по ситуации.';
  const extra = [];
  if(S.skipStock && stockHidden) extra.push('Пропущено позиций, которые уже есть в запасах: ' + stockHidden);
  const hiddenCnt = Object.keys(S.shopHide || {}).length;
  if(hiddenCnt) extra.push('Убрано вручную строк: ' + hiddenCnt + ' - <button class="btn-linklike" data-action="shop-unhide" style="padding:2px 6px">вернуть</button>');
  $('#shopNote').innerHTML = note + (extra.length ? '<br>' + extra.join('<br>') : '');
}

/* ---------- ЗАПАСЫ ---------- */
function renderStock(){
  const q = ($('#stockSearch').value || '').toLowerCase();
  $('#addStockBtn').innerHTML = I('plus',15) + 'Добавить';
  const allProds = DATA.stock.concat((S.customStock || []).map(n => ({name:n, cat:'Мои продукты', pack:'', freq:''})));
  const cats = new Map();
  allProds.forEach(p => {
    if(!cats.has(p.cat)) cats.set(p.cat, []);
    cats.get(p.cat).push(p);
  });
  let h = '';
  let shown = 0;
  cats.forEach((prods, cat) => {
    const rows = prods.filter(p => !q || (p.name + ' ' + p.cat).toLowerCase().includes(q));
    if(!rows.length) return;
    shown += rows.length;
    h += '<div class="stock-group"><div class="stock-ghead">'+esc(cat)+'</div>';
    h += rows.map(p => {
      const st = S.stock[p.name] || '';
      const sub = [p.pack, p.freq].filter(Boolean).join(DOT);
      const isCustom = p.cat === 'Мои продукты';
      return '<div class="stk-row"><span class="nm"><span class="t1">'+esc(p.name)+'</span>'+(sub?'<span class="t2">'+esc(sub)+'</span>':'')+'</span>' +
        '<span class="seg">' +
        '<button class="s-ok'+(st==='ok'?' on':'')+'" data-action="stock-set" data-name="'+esc(p.name)+'" data-v="ok">Есть</button>' +
        '<button class="s-low'+(st==='low'?' on':'')+'" data-action="stock-set" data-name="'+esc(p.name)+'" data-v="low">Мало</button>' +
        '<button class="s-out'+(st==='out'?' on':'')+'" data-action="stock-set" data-name="'+esc(p.name)+'" data-v="out">Нет</button>' +
        '</span>' + (isCustom ? '<button class="del" data-action="stock-del-custom" data-name="'+esc(p.name)+'" title="Убрать продукт">'+I('trash',13)+'</button>' : '') + '</div>';
    }).join('');
    h += '</div>';
  });
  if(!shown) h = '<div class="empty"><div class="big">📦</div><div class="t serif">Продукт не найден</div></div>';
  $('#stockList').innerHTML = h;
  const cnt = {ok:0, low:0, out:0};
  Object.values(S.stock).forEach(v => { if(cnt[v] !== undefined) cnt[v]++; });
  $('#stockStats').innerHTML =
    '<span style="color:var(--ok)"><span class="dot" style="background:var(--ok)"></span>есть '+cnt.ok+'</span>' +
    '<span style="color:var(--warn)"><span class="dot" style="background:var(--warn)"></span>мало '+cnt.low+'</span>' +
    '<span style="color:var(--bad)"><span class="dot" style="background:var(--bad)"></span>нет '+cnt.out+'</span>';
  $('#copyStockBtn').innerHTML = I('copy',15) + 'Скопировать отчёт';
  $('#dataBtn').innerHTML = I('settings',15) + 'Настройки';
}

/* ---------- ПАМЯТКИ ---------- */
const TIP_ICONS = {mushroom:'mushroom', banana:'banana', carrot:'carrot', flame:'flame', milk:'milk', chart:'chart'};
function openTips(){
  openModal('<div class="panel small" style="max-width:640px">' +
    '<div class="panel-head"><div class="htxt"><div class="panel-title">Памятки</div><div class="panel-sub">Практические заметки к продуктам и расчётам</div></div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="panel-body" style="padding:16px 20px">' +
    DATA.tips.map(t => '<div class="tip-card"><div class="tip-title"><span class="ic">'+I(TIP_ICONS[t.icon]||'info',16)+'</span>'+esc(t.title)+'</div>' + t.body.map(p => '<p>'+esc(p)+'</p>').join('') + '</div>').join('') +
    '</div></div>');
}

/* ---------- ВЫГРУЗКА СБОРНИКА В ФАЙЛ recipes.js ---------- */
const RECIPES_FILE_HEADER = [
"/* ============================================================================",
"   КУЛИНАРНАЯ КНИГА АРТЁМА - ФАЙЛ РЕЦЕПТОВ (recipes.js)",
"   ============================================================================",
"   Это единственный источник рецептов для приложения. Файл можно:",
"   1) править прямо на GitHub и коммитить - при следующем открытии приложения",
"      карточки обновятся на всех устройствах;",
"   2) отдавать целиком любой нейросети на аудит - это обычный текст, внутри",
"      один объект COOKBOOK с человекочитаемым JSON.",
"",
"   ВАЖНО: после любых правок подними поле \"version\" (например 4.3 -> 4.4).",
"   Приложение применяет обновления только когда версия файла отличается от",
"   той, что оно видело в прошлый раз. Не поменяешь версию - телефон решит,",
"   что ничего не изменилось, и оставит локальные карточки как были.",
"",
"   СТРУКТУРА ФАЙЛА",
"   generated - дата обновления файла (ГГГГ-ММ-ДД);",
"   version   - версия сборника;",
"   books     - книги-разделы: id (латиница, на неё ссылается recipe.book),",
"               code (буква в номерах карточек), title, sub (описание),",
"               color / bg (цвета оформления), count (сколько карточек);",
"   recipes   - массив рецептов. Поля карточки:",
"       num         - номер вида \"О-01\": буква книги, дефис, номер (уникален);",
"       book        - id книги из books;",
"       title       - название блюда;",
"       intro       - описание в 1-3 предложения (зачем блюдо в рационе);",
"       inventory   - нужная техника: плита / духовка / блендер / морозилка;",
"       portionsText / portionsBase - порции текстом и число (для пересчёта);",
"       timeText / timeTotal - время текстом и в минутах (фильтр \"до 15/30/60\");",
"       tags        - теги; набор тегов задаётся в config.js (filterTags);",
"       ingredients - список продуктов: n - название (лучше совпадает с",
"                     каталогом запасов в config.js - тогда работает учёт",
"                     \"что уже есть дома\"), a - количество текстом;",
"       steps       - шаги приготовления по порядку;",
"       notes       - заметки и советы (можно оставить пустым);",
"       kbju        - КБЖУ на порцию: k ккал, p белки, f жиры, c углеводы,",
"                     note - примечание (например \"без гарнира\");",
"       kbjuAlt     - необязательное альтернативное КБЖУ того же формата.",
"",
"   ПРАВИЛА ПРАВОК",
"   - num не должен дублироваться; новые блюда добавляй следующим номером;",
"   - удалить карточку = просто удалить её объект из массива recipes;",
"   - ingredient.n пиши так же, как продукт называется в config.js (stock),",
"     тогда приложение свяжет его с запасами и списком покупок.",
"",
"   ВЫГРУЗКА ИЗ ПРИЛОЖЕНИЯ",
"   В приложении есть кнопка \"Скачать recipes.js\" (в шапке и в Настройках):",
"   она выгружает текущий сборник со всеми твоими добавками и правками в",
"   точно таком же формате. Скачанный файл кладётся в репозиторий вместо",
"   этого файла. Не забудь поднять version - иначе другие устройства не",
"   увидят обновление.",
"   ============================================================================ */",
""
].join('\n');
/* человекочитаемый JSON: короткие объекты и массивы тегов - в строку,
   шаги и списки ингредиентов - по одному элементу на строку */
function fmtFileJson(v, ind){
  const pad = ' '.repeat(ind);
  if(v === null || typeof v !== 'object') return JSON.stringify(v);
  if(Array.isArray(v)){
    if(!v.length) return '[]';
    const scalar = v.every(x => x === null || typeof x !== 'object');
    if(scalar){
      const oneLine = '[' + v.map(x => JSON.stringify(x)).join(', ') + ']';
      if(oneLine.length <= 110 - ind) return oneLine;
      return '[\n' + v.map(x => pad + JSON.stringify(x)).join(',\n') + '\n' + ' '.repeat(ind - 1) + ']';
    }
    return '[\n' + v.map(x => pad + fmtFileJson(x, ind + 1)).join(',\n') + '\n' + ' '.repeat(ind - 1) + ']';
  }
  const keys = Object.keys(v);
  const allScalar = keys.length > 0 && keys.every(k => v[k] === null || typeof v[k] !== 'object');
  if(allScalar && keys.length <= 8){
    return '{ ' + keys.map(k => JSON.stringify(k) + ': ' + JSON.stringify(v[k])).join(', ') + ' }';
  }
  return '{\n' + keys.map(k => pad + JSON.stringify(k) + ': ' + fmtFileJson(v[k], ind + 1)).join(',\n') + '\n' + ' '.repeat(ind - 1) + '}';
}
/* текст файла из текущего состояния: книги + все карточки (правки и
   собственные блюда включены, служебный флаг custom снимается) */
function recipesFileText(){
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const data = {
    generated: now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()),
    version: 'exp-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '-' + pad(now.getHours()) + pad(now.getMinutes()),
    books: BOOKS.map(b => {
      const o = JSON.parse(JSON.stringify(b));
      o.count = RECIPES.filter(r => r.book === b.id).length;
      return o;
    }),
    recipes: RECIPES.map(r => { const o = JSON.parse(JSON.stringify(r)); delete o.custom; return o; })
  };
  return RECIPES_FILE_HEADER + 'const COOKBOOK = ' + fmtFileJson(data, 1) + ';\n';
}
function downloadRecipesFile(){
  const text = recipesFileText();
  try{
    const blob = new Blob([text], {type: 'text/javascript;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('recipes.js скачан: положи его в репозиторий вместо старого файла');
  }catch(e){
    copyText(text, 'Скачивание не сработало - текст файла скопирован');
  }
}

/* ---------- НАСТРОЙКИ ---------- */
function tgInp(pfx, key, val){
  return '<input class="inp" id="'+pfx+'-'+key+'" inputmode="numeric" style="text-align:center" value="'+val+'">';
}
function openSettings(){
  const tg = targets();
  openModal('<div class="panel small set-panel">' +
    '<div class="panel-head"><div class="htxt"><div class="panel-title">Настройки</div><div class="panel-sub">Имя, оформление, цели на день и данные приложения</div></div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="panel-body" style="padding:16px 0 4px">' +
      '<div class="set-sect"><div class="sect-h">Как к тебе обращаться</div>' +
        '<input class="inp" id="setName" placeholder="Имя - можно оставить пустым" value="'+esc(S.settings.name||'')+'" autocomplete="off">' +
        '<div class="set-hint">Показывается в шапке и в заголовке вкладки. Пусто - будет просто «Мой рацион», без обращений.</div></div>' +
      '<div class="set-sect"><div class="sect-h">Оформление</div>' +
        '<div class="seg2">' +
          '<button class="'+(S.settings.theme!=='dark'?'on':'')+'" data-action="set-theme" data-v="light">'+I('sun',14)+' Тёплая</button>' +
          '<button class="'+(S.settings.theme==='dark'?'on':'')+'" data-action="set-theme" data-v="dark">'+I('moon',14)+' Тёмная</button>' +
        '</div></div>' +
      '<div class="set-sect"><div class="sect-h">Цели на день: ккал / Б / Ж / У (г)</div>' +
        '<label class="ed-l">Обычный день</label><div class="k-row">' +
        tgInp('tgN','k',fmtN(tg.norm.k).replace(/\u2009/g,''))+tgInp('tgN','p',tg.norm.p)+tgInp('tgN','f',tg.norm.f)+tgInp('tgN','c',tg.norm.c)+'</div>' +
        '<label class="ed-l" style="margin-top:12px">Воскресенье</label><div class="k-row">' +
        tgInp('tgS','k',fmtN(tg.sun.k).replace(/\u2009/g,''))+tgInp('tgS','p',tg.sun.p)+tgInp('tgS','f',tg.sun.f)+tgInp('tgS','c',tg.sun.c)+'</div>' +
        '<button class="btn btn-primary" data-action="save-targets" style="margin-top:12px">Сохранить цели</button></div>' +
      '<div class="set-sect"><div class="sect-h">Данные: сборник, перенос и резервные копии</div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap">' +
          '<button class="btn btn-soft" data-action="export-recipes">'+I('download',15)+'Скачать recipes.js</button>' +
          '<button class="btn btn-ghost" data-action="data-export">'+I('copy',15)+'Экспорт</button>' +
          '<button class="btn btn-primary" data-action="data-import">Применить вставленное</button>' +
        '</div>' +
        '<div class="set-hint"><b>Скачать recipes.js</b> выгружает весь сборник - включая добавленные и правленные в приложении блюда - файлом в том же формате, что лежит на GitHub. Скачанный файл положи в репозиторий вместо старого (и подними версию внутри файла). «Экспорт» - весь текст данных для переноса на другое устройство. Сюда же вставляется <b>патч рецептов</b> - JSON вида {"recipes": [...]}, карточки с тем же номером обновятся, новые добавятся, а меню, запасы и избранное останутся как были.</div></div>' +
        '<textarea class="data-area" id="dataArea" placeholder="«Экспорт» положит сюда весь текст данных - сохрани его в заметки или пришли в чат. Для переноса вставь текст здесь и нажми «Применить вставленное»..."></textarea>' +
      '<div class="set-sect"><div class="sect-h">Сброс</div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap">' +
          '<button class="btn btn-ghost" data-action="recipes-reset">Рецепты к сборнику</button>' +
          '<button class="btn btn-danger" data-action="data-reset">'+I('trash',15)+'Сбросить всё</button>' +
        '</div>' +
        '<div class="set-hint">«Рецепты к сборнику» вернёт все карточки к версии из PDF-сборника и уберёт собственные блюда. «Сбросить всё» - ещё и избранное, меню, запасы и настройки. Данные живут в памяти этого браузера, на другом устройстве их переносят через «Экспорт».</div></div>' +
    '</div></div>');
}
function applyImportText(){
  const ta = $('#dataArea');
  if(!ta || !ta.value.trim()){ toast('Сначала вставь текст данных'); return; }
  try{
    const o = JSON.parse(ta.value);
    if(o && Array.isArray(o.recipes) && !('stock' in o) && !('menu' in o)){
      if(!S.recipes) S.recipes = RECIPES.map(x => JSON.parse(JSON.stringify(x)));
      if(Array.isArray(o.customBooks)) o.customBooks.forEach(nb => {
        if(nb && nb.id && !S.customBooks.some(b => b.id === nb.id)) S.customBooks.push(nb);
      });
      let added = 0, updated = 0;
      o.recipes.forEach(nr => {
        if(!nr || !nr.num || !nr.title) throw new Error('битая карточка в патче');
        const i = S.recipes.findIndex(x => x.num === nr.num);
        if(i >= 0){ S.recipes[i] = nr; updated++; } else { S.recipes.push(nr); added++; }
        if(S.deletedNums) S.deletedNums = S.deletedNums.filter(x => x !== nr.num);
      });
      rebuildIndexes(); save(); closeAllModals(); renderAll();
      toast('Патч применён: новых ' + added + DOT + 'обновлено ' + updated);
    } else if(o && ('stock' in o || 'menu' in o)){
      const d = Object.assign(defaultState(), o);
      migrateState(d); mergeSeed(d);
      S = d;
      rebuildIndexes(); save(); closeAllModals(); renderAll();
      toast('Данные восстановлены');
    } else throw new Error('не похоже на данные');
  }catch(err){ toast('Не похоже на данные книги - проверь текст'); }
}

/* ---------- копирование и тост ---------- */
let toastTimer = null;
let toastAction = null;
function hideToast(){
  const t = $('#toast');
  t.classList.remove('show');
  toastAction = null;
}
function toast(msg, btnLabel, fn){
  const t = $('#toast');
  t.innerHTML = '<span>'+esc(msg)+'</span>' + (btnLabel ? '<button class="toast-btn" id="toastBtn">'+esc(btnLabel)+'</button>' : '');
  toastAction = fn || null;
  const b = $('#toastBtn');
  if(b) b.onclick = () => { const a = toastAction; hideToast(); if(a) a(); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, btnLabel ? 5600 : 2200);
}
function copyText(text, msg){
  const done = () => toast(msg || 'Скопировано в буфер');
  function fallback(){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){ toast('Не удалось скопировать - выдели текст вручную'); }
    ta.remove();
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else fallback();
}

/* ---------- текстовые отчёты ---------- */
function stockReport(){
  const allProds = DATA.stock.concat((S.customStock || []).map(x => ({name:x})));
  const groups = {ok:[], low:[], out:[]};
  allProds.forEach(p => { const st = S.stock[p.name]; if(st && groups[st]) groups[st].push(p.name); });
  const d = new Date().toLocaleDateString('ru-RU');
  let n = 0;
  allProds.forEach(p => { if(!S.stock[p.name]) n++; });
  let out = 'Запасы (' + d + '):';
  out += '\nЕсть: ' + (groups.ok.length ? groups.ok.join(', ') : '-');
  out += '\nМало: ' + (groups.low.length ? groups.low.join(', ') : '-');
  out += '\nНет: ' + (groups.out.length ? groups.out.join(', ') : '-');
  if(n) out += '\nНе отмечено: ' + n + ' позиций';
  return out;
}
function shopReport(){
  const items = computeShop().filter(i => !S.shopDone[i.key]);
  if(!items.length) return 'Список покупок пуст';
  const groups = new Map();
  items.forEach(i => { if(!groups.has(i.cat)) groups.set(i.cat, []); groups.get(i.cat).push(i); });
  let out = 'Покупки:';
  DATA.shopCats.concat(['Мои позиции']).forEach(cat => {
    const g = groups.get(cat); if(!g || !g.length) return;
    out += '\n' + cat + ':';
    g.forEach(i => {
      let line = '- ' + i.name;
      const q = fmtQty(i);
      if(q && q !== 'по вкусу') line += ' - ' + q;
      const src = Array.from(i.srcs).join(', ');
      if(src) line += ' (' + src + ')';
      out += '\n' + line;
    });
  });
  return out;
}
function menuReport(){
  let out = 'Меню на неделю:';
  let any = false;
  const TT = targets();
  DAY_IDS.forEach((d, di) => {
    const ds = S.menu[d];
    const t = dayTotals(d);
    const tg = TT[(ds && ds.type) || 'norm'];
    let lines = [];
    if(ds && ds.slots){
      SLOT_IDS.forEach((sl, si) => {
        (ds.slots[sl]||[]).forEach(dish => {
          if(dish.t === 'c'){
            lines.push('  ' + SLOT_NAMES[si] + ': ' + dish.name + ' x' + (dish.qty||1) + ' (' + fmtN((dish.kcal||0)*(dish.qty||1)) + ' ккал)');
            return;
          }
          const r = REC_BY_NUM[dish.n]; if(!r) return;
          lines.push('  ' + SLOT_NAMES[si] + ': ' + r.num + ' ' + r.title + ' x' + (dish.p||1) + ' (' + fmtN(r.kbju.k * (dish.p||1)) + ' ккал)');
        });
      });
    }
    any = any || lines.length > 0;
    out += '\n\n' + DAY_NAMES[di] + ' (' + tg.label + ', цель ' + fmtN(tg.k) + ' ккал), итого ' + fmtN(t.k) + ':';
    out += lines.length ? '\n' + lines.join('\n') : '\n  -';
  });
  return any ? out : 'Меню пока пустое';
}

/* ---------- СТАТИСТИКА ГОТОВОК ---------- */
let CAL_M = null;
function todayISO(){
  const t = new Date();
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
}
const MON_SHORT = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const MON_FULL = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
function logByDate(){
  const map = {};
  (S.cookLog || []).forEach(e => { if(!map[e.d]) map[e.d] = []; map[e.d].push(e); });
  return map;
}
function openStats(){
  const now = new Date();
  if(!CAL_M) CAL_M = {y: now.getFullYear(), m: now.getMonth()};
  openModal('<div class="panel small" style="max-width:640px">' +
    '<div class="panel-head"><div class="htxt"><div class="panel-title">Статистика готовок</div><div class="panel-sub">Что и когда готовилось - по реальным датам. Журнал пополняет кнопка «Я готовил» в карточке любого блюда.</div></div><button class="close-x" data-action="close">'+I('x',17)+'</button></div>' +
    '<div class="panel-body" style="padding:16px 20px 20px" id="statBody"></div></div>');
  renderStats();
}
function renderStats(){
  const body = $('#statBody'); if(!body) return;
  const map = logByDate();
  const first = new Date(CAL_M.y, CAL_M.m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysIn = new Date(CAL_M.y, CAL_M.m + 1, 0).getDate();
  const todayIso = todayISO();
  let monthCnt = 0;
  let cells = '';
  ['пн','вт','ср','чт','пт','сб','вс'].forEach(d => cells += '<span class="cal-dow">'+d+'</span>');
  for(let i = 0; i < startDow; i++) cells += '<span class="cal-cell empty"></span>';
  for(let dd = 1; dd <= daysIn; dd++){
    const iso = CAL_M.y + '-' + String(CAL_M.m + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
    const recs = map[iso] || [];
    monthCnt += recs.length;
    const tip = recs.length ? recs.map(x => REC_BY_NUM[x.n] ? REC_BY_NUM[x.n].title : x.n).join('; ') : '';
    cells += '<span class="cal-cell'+(recs.length ? ' has' : '')+(iso === todayIso ? ' today' : '')+'" title="'+esc(tip)+'">'+dd +
      (recs.length ? '<span class="cal-dots">'+recs.slice(0,3).map(() => '<span></span>').join('')+'</span>' : '')+'</span>';
  }
  const log = (S.cookLog || []).slice().sort((a,b) => b.d.localeCompare(a.d)).slice(0, 10);
  const top = Object.keys(S.cooked).filter(n => REC_BY_NUM[n]).sort((a,b) => (S.cooked[b]||0) - (S.cooked[a]||0)).slice(0, 6);
  body.innerHTML =
    '<div class="cal-head">' +
      '<button class="cal-nav" data-action="cal-prev" aria-label="Предыдущий месяц" style="transform:rotate(90deg)">'+I('chev',15)+'</button>' +
      '<span class="cal-title">'+MON_FULL[CAL_M.m] + ' ' + CAL_M.y+'</span>' +
      '<button class="cal-nav" data-action="cal-next" aria-label="Следующий месяц" style="transform:rotate(-90deg)">'+I('chev',15)+'</button>' +
      '<span class="cal-sum">'+(monthCnt ? 'готовок: ' + monthCnt : 'готовок не было')+'</span>' +
    '</div>' +
    '<div class="cal-grid">'+cells+'</div>' +
    '<div class="sect-h" style="margin-top:16px">Последние приготовления</div>' +
    (log.length ? log.map(e => {
      const r = REC_BY_NUM[e.n];
      const dd = e.d.split('-');
      return '<div class="stat-row"><span class="dt">'+(+dd[2])+' '+MON_SHORT[(+dd[1])-1]+'</span><span class="tt">'+(r ? '<b>'+e.n+'</b> '+esc(r.title) : esc(e.n))+'</span></div>';
    }).join('') : '<div class="ed-hint">Пока пусто: нажми «Я готовил» в карточке блюда - день появится в календаре.</div>') +
    '<div class="sect-h" style="margin-top:16px">Топ блюд</div>' +
    (top.length ? top.map((n, i) => '<div class="stat-row"><span class="dt">'+(i+1)+'.</span><span class="tt"><b>'+n+'</b> '+esc(REC_BY_NUM[n].title)+'</span><span class="tc">'+(S.cooked[n]||0)+' раз</span></div>').join('') : '<div class="ed-hint">Счётчики ещё пустые.</div>');
}

/* ---------- события ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const a = el.dataset.action;
  switch(a){
    case 'go': e.stopPropagation(); go(el.dataset.view); break;
    case 'open-stats': openStats(); break;
    case 'cal-prev': { CAL_M.m--; if(CAL_M.m < 0){ CAL_M.m = 11; CAL_M.y--; } renderStats(); break; }
    case 'cal-next': { CAL_M.m++; if(CAL_M.m > 11){ CAL_M.m = 0; CAL_M.y++; } renderStats(); break; }
    case 'toggle-search': {
      const sb = $('#searchbar');
      sb.classList.toggle('open');
      if(sb.classList.contains('open')) $('#searchInput').focus();
      break;
    }
    case 'open-tips': openTips(); break;
    case 'open-settings': openSettings(); break;
    case 'close': closeModal(); break;
    case 'book': {
      F.book = el.dataset.book;
      e.stopPropagation();
      renderRecipes();
      break;
    }
    case 'fav-filter': {
      F.fav = !F.fav;
      renderRecipes();
      break;
    }
    case 'tag': {
      const t = el.dataset.tag;
      if(F.tags.has(t)) F.tags.delete(t); else F.tags.add(t);
      renderTagChips();
      renderRecipes();
      break;
    }
    case 'random': {
      const l = filtered();
      if(!l.length){ toast('Под текущие фильтры ничего не попало'); break; }
      const r = l[Math.floor(Math.random() * l.length)];
      openRecipeModal(r.num);
      break;
    }
    case 'open': openRecipeModal(el.dataset.num); break;
    case 'port-inc': case 'port-dec': {
      const panel = el.closest('.panel[data-recipe]');
      if(!panel) break;
      const num = panel.dataset.recipe;
      const r = REC_BY_NUM[num];
      if(!r) break;
      const base = r.portionsBase || 1;
      let p = ((MODAL_PORT && MODAL_PORT.num === num) ? MODAL_PORT.p : base) + (a === 'port-inc' ? 1 : -1);
      MODAL_PORT = {num: num, p: Math.max(1, Math.min(10, p))};
      renderModalScale(r);
      break;
    }
    case 'fav': {
      e.stopPropagation();
      const n = el.dataset.num;
      if(!tapGuard('fav:'+n)) break;
      if(S.fav[n]) delete S.fav[n]; else S.fav[n] = 1;
      save(); renderRecipes(); refreshModalFav(n);
      toast(S.fav[n] ? ('В избранном: ' + n) : 'Убрано из избранного');
      break;
    }
    case 'cooked': {
      const n = el.dataset.num;
      if(!tapGuard('cooked:'+n)) break;
      const before = S.cooked[n] || 0;
      S.cooked[n] = before + 1;
      (S.cookLog = S.cookLog || []).push({n: n, d: todayISO()});
      save(); renderRecipes(); refreshModalFav(n);
      toast('Записал: ' + n + ' приготовлен ' + S.cooked[n] + NBSP + 'раз(а). Приятного!', 'Отменить', () => {
        if(before === 0) delete S.cooked[n]; else S.cooked[n] = before;
        (S.cookLog = S.cookLog || []).pop();
        save(); renderRecipes(); refreshModalFav(n);
      });
      break;
    }
    case 'cooked-reset': {
      const n = el.dataset.num;
      if(confirm('Обнулить счётчик «готовил» для ' + n + '?')){
        delete S.cooked[n];
        S.cookLog = (S.cookLog || []).filter(x => x.n !== n);
        save(); renderRecipes(); refreshModalFav(n);
        toast('Счётчик обнулён');
      }
      break;
    }
    case 'to-shop': {
      e.stopPropagation();
      const n = el.dataset.num;
      if(!tapGuard('shop:'+n)) break;
      const idx = S.shopExtra.findIndex(x => x.num === n);
      if(idx < 0){
        const panel = el.closest('.panel[data-recipe]');
        const mp = panel && MODAL_PORT && MODAL_PORT.num === n ? MODAL_PORT.p : null;
        const base = (REC_BY_NUM[n] && REC_BY_NUM[n].portionsBase) || 1;
        S.shopExtra.push(mp && mp !== base ? {num: n, p: mp} : {num: n});
        toast('Ингредиенты ' + n + (mp && mp !== base ? ' на ' + mp + NBSP + pluralPort(mp) : '') + ' добавлены в список покупок');
      }
      else { S.shopExtra = S.shopExtra.filter(x => x.num !== n); toast('Карточка ' + n + ' убрана из покупок'); }
      save();
      refreshModalFav(n);
      renderNav();
      if(currentView() === 'shop') renderShop();
      break;
    }
    case 'to-menu': {
      const n = el.dataset.num;
      const panel = el.closest('.panel[data-recipe]');
      const mp = panel && MODAL_PORT && MODAL_PORT.num === n ? MODAL_PORT.p : null;
      closeAllModals();
      openSlotChooser(n, mp);
      break;
    }
    case 'add-recipe': closeAllModals(); openEditor(null); break;
    case 'edit-recipe': { closeAllModals(); openEditor(el.dataset.num); break; }
    case 'ed-tab': {
      if(!EDIT) break;
      EDIT.tab = el.dataset.t;
      $$('#edPanel .edtab').forEach(b => b.classList.toggle('active', b.dataset.t === EDIT.tab));
      $('#edFormWrap').style.display = EDIT.tab === 'form' ? '' : 'none';
      $('#edJsonWrap').style.display = EDIT.tab === 'json' ? '' : 'none';
      if(EDIT.tab === 'json') fillEditorJson();
      break;
    }
    case 'ed-template': { const ta = $('#ed-json'); if(ta) ta.value = NEW_TEMPLATE_JSON; break; }
    case 'ed-to-json': {
      if(!EDIT) break;
      try{ const res = collectForm(); EDIT.r = res.r; $('#ed-json').value = recipeToJson(res.r); toast('JSON собран из формы'); }
      catch(e){ showEdErr(['- Не получилось собрать: ' + e.message]); }
      break;
    }
    case 'ed-fill-form': {
      if(!EDIT) break;
      try{
        const r = parseRecipeJson();
        EDIT.r = r;
        fillFormFromRecipe(r);
        $$('#edPanel .edtab').forEach(b => b.classList.toggle('active', b.dataset.t === 'form'));
        $('#edFormWrap').style.display = '';
        $('#edJsonWrap').style.display = 'none';
        EDIT.tab = 'form';
        toast('Форма заполнена из JSON');
      }catch(e){ showEdErr(['- JSON не читается: ' + e.message]); }
      break;
    }
    case 'ed-apply-json': { saveEditor(); break; }
    case 'ed-save': { saveEditor(); break; }
    case 'ed-del': {
      if(!EDIT || !EDIT.origNum) break;
      const num = EDIT.origNum;
      if(!confirm('Удалить карточку ' + num + ' из книги? Из избранного, счётчика и меню она тоже уберётся.')) break;
      if(!S.recipes) S.recipes = RECIPES.map(x => JSON.parse(JSON.stringify(x)));
      S.recipes = S.recipes.filter(x => x.num !== num);
      if(SEED.recipes.some(x => x.num === num) && !S.deletedNums.includes(num)) S.deletedNums.push(num);
      delete S.fav[num]; delete S.cooked[num];
      S.shopExtra = S.shopExtra.filter(x => x.num !== num);
      for(const d in S.menu){
        const ds = S.menu[d];
        if(ds && ds.slots) SLOT_IDS.forEach(sl => { ds.slots[sl] = (ds.slots[sl]||[]).filter(e => e.t === 'c' || e.n !== num); });
      }
      rebuildIndexes(); save(); closeAllModals(); renderAll();
      toast('Карточка ' + num + ' удалена');
      break;
    }
    case 'ed-reset': {
      if(!EDIT || !EDIT.origNum) break;
      const seedRec = SEED.recipes.find(x => x.num === EDIT.origNum);
      if(!seedRec) break;
      if(!confirm('Вернуть ' + EDIT.origNum + ' к оригинальной версии из сборника?')) break;
      if(!S.recipes) S.recipes = RECIPES.map(x => JSON.parse(JSON.stringify(x)));
      const i = S.recipes.findIndex(x => x.num === EDIT.origNum);
      const clone = JSON.parse(JSON.stringify(seedRec));
      if(i >= 0) S.recipes[i] = clone; else S.recipes.push(clone);
      S.deletedNums = (S.deletedNums || []).filter(x => x !== EDIT.origNum);
      rebuildIndexes(); save(); closeAllModals(); renderAll();
      toast('Карточка ' + EDIT.origNum + ' возвращена к оригиналу');
      break;
    }
    case 'pick-day': case 'pick-slot': break;
    case 'pick-confirm': {
      const n = el.dataset.num;
      if(!window.__pickDay || !window.__pickSlot){ toast('Выбери день и приём пищи'); break; }
      const pp = el.dataset.p ? parseFloat(String(el.dataset.p).replace(',', '.')) || 1 : 1;
      dayState(window.__pickDay).slots[window.__pickSlot].push({t:'r', n: n, p: pp});
      save(); renderNav();
      closeAllModals();
      toast(n + (pp !== 1 ? ' (' + pp + NBSP + pluralPort(pp) + ')' : '') + ' добавлено в меню на ' + DAY_NAMES[DAY_IDS.indexOf(window.__pickDay)]);
      if(currentView() === 'menu') renderMenu();
      break;
    }
    case 'slot-add': {
      e.stopPropagation();
      openPicker(el.dataset.day, el.dataset.slot);
      break;
    }
    case 'pick-tab': {
      if(!PICK_CTX) break;
      PICK_CTX.tab = el.dataset.t;
      $$('#pickPanel .edtab').forEach(b => b.classList.toggle('active', b.dataset.t === PICK_CTX.tab));
      $('#pickBookWrap').style.display = PICK_CTX.tab === 'book' ? '' : 'none';
      $('#pickCustomWrap').style.display = PICK_CTX.tab === 'custom' ? '' : 'none';
      break;
    }
    case 'custom-add': {
      if(!PICK_CTX) break;
      const name = cleanDash($('#pk-name').value.trim());
      if(!name){ toast('Введи название'); break; }
      const dish = {t:'c', name: name, kcal: numOf($('#pk-k').value), b: numOf($('#pk-b').value), f: numOf($('#pk-f').value), c: numOf($('#pk-c').value), qty: 1};
      dayState(PICK_CTX.day).slots[PICK_CTX.slot].push(dish);
      save(); renderNav();
      toast('«' + dish.name + '» добавлено');
      $('#pk-name').value = ''; $('#pk-k').value = ''; $('#pk-b').value = ''; $('#pk-f').value = ''; $('#pk-c').value = '';
      if(currentView() === 'menu') renderMenu();
      break;
    }
    case 'pick': {
      if(!PICK_CTX) break;
      const n = el.dataset.num;
      dayState(PICK_CTX.day).slots[PICK_CTX.slot].push({t:'r', n: n, p:1});
      PICK_CTX.added[n] = true;
      save(); renderNav();
      toast(n + ' добавлено');
      renderPicker($('#pickSearch') ? $('#pickSearch').value : '');
      if(currentView() === 'menu') renderMenu();
      break;
    }
    case 'day-toggle': {
      const d = el.dataset.day;
      S.openDays[d] = !S.openDays[d];
      save();
      const card = document.querySelector('.day-card[data-day="'+d+'"]');
      if(card) card.classList.toggle('open', S.openDays[d]);
      break;
    }
    case 'day-type': {
      e.stopPropagation();
      const d = el.dataset.day;
      dayState(d).type = el.dataset.t;
      save(); renderMenu();
      break;
    }
    case 'dish-x2': {
      e.stopPropagation();
      const d = el.dataset.day, sl = el.dataset.slot, i = +el.dataset.i;
      const di = DAY_IDS.indexOf(d);
      if(di >= DAY_IDS.length - 1){ toast('Воскресенье - последний день недели'); break; }
      const arr = dayState(d).slots[sl];
      const dish = arr[i];
      if(!dish) break;
      dayState(DAY_IDS[di + 1]).slots[sl].push(JSON.parse(JSON.stringify(dish)));
      save(); renderMenu(); renderNav();
      toast('Скопировано на ' + DAY_NAMES[di + 1] + ' - готовь двойную порцию');
      break;
    }
    case 'dish-dec': case 'dish-inc': case 'dish-del': {
      e.stopPropagation();
      const d = el.dataset.day, sl = el.dataset.slot, i = +el.dataset.i;
      const arr = dayState(d).slots[sl];
      const dish = arr[i];
      if(!dish) break;
      if(a === 'dish-del') arr.splice(i, 1);
      else if(dish.t === 'c'){
        let q = (dish.qty || 1) + (a === 'dish-inc' ? 0.5 : -0.5);
        dish.qty = Math.max(0.5, Math.min(20, q));
      } else {
        let p = (dish.p || 1) + (a === 'dish-inc' ? 0.5 : -0.5);
        dish.p = Math.max(0.5, Math.min(8, Math.round(p * 2) / 2));
      }
      save(); renderMenu(); renderNav();
      break;
    }
    case 'copy-menu': copyText(menuReport(), 'Меню скопировано'); break;
    case 'collect-menu': openCollectModal(); break;
    case 'collect-fill': closeAllModals(); autoMenu('fill'); break;
    case 'collect-rebuild': {
      closeAllModals();
      if(!confirm('Пересобрать всё меню? Текущие блюда на неделе будут заменены.')) break;
      const types0 = {};
      DAY_IDS.forEach(d => { types0[d] = dayState(d).type; });
      S.menu = {};
      DAY_IDS.forEach(d => { dayState(d).type = types0[d] || (d === 'sun' ? 'sun' : 'norm'); });
      autoMenu('all');
      break;
    }
    case 'print-menu': window.print(); break;
    case 'dish-swap': {
      e.stopPropagation();
      const d = el.dataset.day, sl = el.dataset.slot, i = +el.dataset.i;
      const dish = dayState(d).slots[sl][i];
      if(!dish) break;
      if(dish.t === 'c'){ toast('Своё блюдо меняется руками: удали и добавь новое'); break; }
      const cur = REC_BY_NUM[dish.n];
      if(!cur) break;
      const cands = RECIPES.filter(r => r.book === cur.book && r.num !== dish.n);
      if(!cands.length){ toast('Из этой книги пока нечем заменить'); break; }
      const usedWeek = new Set();
      DAY_IDS.forEach(dd => (dayState(dd).slots[sl]||[]).forEach(x => { if(x.n) usedWeek.add(x.n); }));
      const fresh = cands.filter(r => !usedWeek.has(r.num));
      const pool = fresh.length ? fresh : cands;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      dish.n = pick.num;
      save(); renderMenu(); renderNav();
      toast('Заменил на: ' + pick.title);
      break;
    }
    case 'clear-menu': {
      if(confirm('Точно очистить всё меню на неделю?')){
        S.menu = {}; S.openDays = {}; save(); renderMenu(); renderNav();
        toast('Меню очищено');
      }
      break;
    }
    case 'add-manual': {
      const inp = $('#manualItem');
      const v = inp.value.trim();
      if(!v){ toast('Введи название позиции'); break; }
      S.shopCustom.push({id: Date.now() + '' + Math.floor(Math.random()*999), name: v});
      inp.value = '';
      save(); renderShop(); renderNav();
      break;
    }
    case 'copy-shop': copyText(shopReport(), 'Список покупок скопирован'); break;
    case 'print-shop': window.print(); break;
    case 'clear-done': {
      const items = computeShop();
      let n = 0;
      items.forEach(i => { if(S.shopDone[i.key]){ delete S.shopDone[i.key]; n++; } });
      save(); renderShop(); renderNav();
      toast(n ? 'Убрано из списка: ' + n : 'Купленных позиций нет');
      break;
    }
    case 'toggle-tags': {
      $('#tagChips').classList.toggle('open');
      break;
    }
    case 'shop-del': {
      const k = el.dataset.key;
      if(k.slice(0,2) === 'c:'){
        S.shopCustom = S.shopCustom.filter(c => 'c:' + c.id !== k);
        toast('Позиция убрана из списка');
      } else {
        S.shopHide[k] = true;
        toast('Строка убрана из списка');
      }
      save(); renderShop(); renderNav();
      break;
    }
    case 'toggle-stock-filter': {
      if(!tapGuard('stkfilter')) break;
      S.skipStock = !S.skipStock;
      save(); renderShop(); renderNav();
      toast(S.skipStock ? 'Запасы учтены: то, что есть дома, не попадает в список' : 'Показаны все позиции, включая те, что есть дома');
      break;
    }
    case 'shop-unhide': {
      S.shopHide = {};
      save(); renderShop(); renderNav();
      toast('Убранные строки вернулись в список');
      break;
    }
    case 'add-custom-stock': {
      const inp = $('#customStockName');
      const v = cleanDash((inp && inp.value || '').trim());
      if(!v){ toast('Впиши название продукта'); break; }
      if(!tapGuard('astock')) break;
      const dup = DATA.stock.some(p => p.name.toLowerCase() === v.toLowerCase()) || (S.customStock || []).some(x => x.toLowerCase() === v.toLowerCase());
      if(dup){ toast('Такой продукт уже есть в запасах'); break; }
      S.customStock.push(v);
      S.customStock.sort((a,b) => a.localeCompare(b, 'ru'));
      inp.value = '';
      save(); renderStock();
      toast('Добавлено в запасы: ' + v);
      break;
    }
    case 'stock-del-custom': {
      const n = el.dataset.name;
      S.customStock = S.customStock.filter(x => x !== n);
      delete S.stock[n];
      save(); renderStock();
      toast('Продукт убран из запасов');
      break;
    }
    case 'ed-insert-ing': {
      const sel = $('#ed-ing-pick'), ta = $('#ed-ings');
      if(!sel || !ta || !sel.value) break;
      const lines = ta.value.split('\n');
      while(lines.length && !lines[lines.length-1].trim()) lines.pop();
      lines.push(sel.value + ' - ');
      ta.value = lines.join('\n');
      ta.focus();
      if(ta.setSelectionRange){ const pp = ta.value.length; ta.setSelectionRange(pp, pp); }
      break;
    }
    case 'stock-set': {
      const name = el.dataset.name, v = el.dataset.v;
      if(!tapGuard('stock:'+name+':'+v)) break;
      if(S.stock[name] === v) delete S.stock[name]; else S.stock[name] = v;
      save(); renderStock(); break;
    }
    case 'copy-stock': copyText(stockReport(), 'Отчёт о запасах скопирован - вставь его в чат'); break;
    case 'set-theme': {
      S.settings.theme = el.dataset.v === 'dark' ? 'dark' : 'light';
      save(); applyTheme();
      closeAllModals(); openSettings();
      break;
    }
    case 'save-targets': {
      const g = pfx => ({k: numOf($('#'+pfx+'-k').value), p: numOf($('#'+pfx+'-p').value), f: numOf($('#'+pfx+'-f').value), c: numOf($('#'+pfx+'-c').value)});
      const norm = g('tgN'), sun = g('tgS');
      if(norm.k <= 0 || sun.k <= 0){ toast('Калории в целях должны быть больше нуля'); break; }
      S.targets = {norm: norm, sun: sun};
      save();
      if(currentView() === 'menu') renderMenu();
      toast('Цели сохранены');
      break;
    }
    case 'data-export': {
      const t = JSON.stringify(S);
      const ta = $('#dataArea');
      if(ta){ ta.value = t; ta.focus(); ta.select(); }
      copyText(t, 'Данные скопированы и показаны в поле');
      break;
    }
    case 'data-import': applyImportText(); break;
    case 'export-recipes': downloadRecipesFile(); break;
    case 'recipes-reset': {
      if(!S.recipes && !(S.customBooks || []).length){ toast('Рецепты уже оригинальные'); break; }
      if(confirm('Вернуть все карточки к версии из сборника? Собственные блюда и правки исчезнут (меню, запасы и избранное останутся).')){
        S.recipes = null; S.customBooks = []; S.deletedNums = [];
        rebuildIndexes(); save(); closeAllModals(); renderAll();
        toast('Рецепты возвращены к сборнику');
      }
      break;
    }
    case 'data-reset': {
      if(confirm('Сбросить всё: рецепты, избранное, меню, покупки, запасы и настройки?')){
        S = defaultState();
        save(); closeAllModals(); renderAll();
        toast('Сброшено');
      }
      break;
    }
  }
});
function fillIngPicker(){
  const sel = $('#ed-ing-pick'); if(!sel) return;
  const names = DATA.stock.map(p => p.name).concat(S.customStock || []).sort((a,b) => a.localeCompare(b, 'ru'));
  sel.innerHTML = '<option value="">- выбери продукт -</option>' + names.map(n => '<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');
}
function fillFormFromRecipe(r){
  const set = (id, v) => { const el = $('#'+id); if(el) el.value = v; };
  set('ed-num', r.num || '');
  const sel = $('#ed-book');
  if(sel){
    if(!Array.from(sel.options).some(o => o.value === r.book)) sel.add(new Option(r.book, r.book));
    sel.value = r.book;
  }
  const nb = $('#edNewBook');
  if(nb) nb.classList.remove('show');
  set('ed-title', r.title || ''); set('ed-intro', r.intro || '');
  set('ed-time', r.timeTotal || ''); set('ed-portions', r.portionsText || '');
  set('ed-inventory', r.inventory || ''); set('ed-tags', (r.tags || []).join(', '));
  set('ed-k', r.kbju.k); set('ed-p', r.kbju.p); set('ed-f', r.kbju.f); set('ed-c', r.kbju.c);
  set('ed-knote', r.kbju.note || '');
  set('ed-ings', ingsToText(r.ingredients));
  set('ed-steps', (r.steps || []).join('\n'));
  set('ed-notes', r.notes || '');
}
document.addEventListener('change', e => {
  const t = e.target;
  if(t.id === 'timeFilter'){ F.time = t.value; renderRecipes(); }
  else if(t.id === 'sortSel'){ F.sort = t.value; renderRecipes(); }
  else if(t.id === 'availSort'){ S.settings.availSort = t.checked; save(); renderRecipes(); }
  else if(t.id === 'setName'){ S.settings.name = cleanDash(t.value.trim()); save(); renderBrand(); }
  else if(t.dataset && t.dataset.action === 'shop-check'){
    const k = t.dataset.key;
    if(t.checked) S.shopDone[k] = true; else delete S.shopDone[k];
    save(); renderShop(); renderNav();
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if(t.id === 'searchInput'){
    F.q = t.value.trim();
    if(currentView() !== 'recipes') go('recipes'); else renderRecipes();
  }
  else if(t.id === 'stockSearch'){ renderStock(); }
});

/* ---------- рендер всех видов ---------- */
function renderAll(){
  rebuildIndexes();
  renderBrand();
  renderNav();
  const v = currentView();
  $$('.view').forEach(x => x.classList.remove('active'));
  const el = $('#view-' + v);
  if(el) el.classList.add('active');
  if(v === 'recipes') renderRecipes();
  if(v === 'menu') renderMenu();
  if(v === 'shop') renderShop();
  if(v === 'stock') renderStock();
}
window.addEventListener('hashchange', () => { closeAllModals(); renderAll(); window.scrollTo(0,0); });

/* статичные подписи кнопок */
$('#searchToggleBtn').innerHTML = I('search',17);
$('#tipsIco').innerHTML = I('info',15);
$('#setIco').innerHTML = I('settings',15);
$('#expIco').innerHTML = I('download',17);
$('#addRecipeBtn').innerHTML = I('plus',15) + 'Добавить блюдо';
$('#randomBtn').innerHTML = I('dice',15) + 'Что приготовить?';

applyTheme();
renderAll();

/* ---------- PWA: service worker (офлайн-режим) ---------- */
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
  window.addEventListener('load', function(){ navigator.serviceWorker.register('./sw.js'); });
}
