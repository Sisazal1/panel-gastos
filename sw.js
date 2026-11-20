// Offline: la app abre sin conexión. Los datos se piden a la red primero
// y, si no hay red, se usa la última copia (cifrada) guardada.
const CACHE = 'gastos-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // red primero (datos y página), copia en caché como respaldo
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true})
      .then(r => r || caches.match('index.html')))
  );
});
