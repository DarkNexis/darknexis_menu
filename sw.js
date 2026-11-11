/* Кулинарная книга: офлайн-кэш */
const CACHE = 'ration-v45';
const PRECACHE = ['./', './index.html', './manifest.webmanifest',
  './styles.css', './recipes.js', './config.js', './app.js',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-64.png'];
/* код и данные (в том числе recipes.js) обновляем из сети при каждом открытии
   онлайн, офлайн отдаем из кэша - так правки рецептов с GitHub доходят до
   телефона без переустановки приложения и без изменений в sw.js */
const NET_FIRST = ['index.html', 'styles.css', 'recipes.js', 'config.js', 'app.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* сеть с таймаутом: не дождались ответа за 3.5 с - открываем из кэша.
   cache: 'no-cache' заставляет браузер сверять файл с сервером (If-Modified-Since),
   иначе HTTP-кэш может отдать старый recipes.js и правки с GitHub не дойдут */
function netFirst(request){
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), 3500);
    fetch(request, {cache: 'no-cache'}).then(resp => { clearTimeout(timer); resolve(resp); }).catch(() => { clearTimeout(timer); resolve(null); });
  }).then(resp => {
    if(resp && resp.ok){
      const cl = resp.clone();
      caches.open(CACHE).then(c => c.put(request, cl));
      return resp;
    }
    return caches.match(request, {ignoreSearch: true}).then(hit => hit || caches.match('./index.html'));
  });
}
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const path = new URL(e.request.url).pathname;
  const isNetFirst = e.request.mode === 'navigate' || NET_FIRST.some(f => path.endsWith('/' + f));
  if(isNetFirst){ e.respondWith(netFirst(e.request)); return; }
  // иконки и manifest: сначала кэш
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(resp => {
      const cl = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cl));
      return resp;
    }))
  );
});
