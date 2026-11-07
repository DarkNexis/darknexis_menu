/* Кулинарная книга: офлайн-кэш */
const CACHE = 'ration-v43';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-64.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // страницы: сначала сеть (обновления видны сразу), офлайн - из кэша
  if(e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(resp => {
        const cl = resp.clone();
        caches.open(CACHE).then(c => c.put('./index.html', cl));
        return resp;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // остальное (иконки, manifest): сначала кэш
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(resp => {
      const cl = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, cl));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
