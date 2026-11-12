/* Service worker. App shell = CACHE-FIRST from a versioned cache that is fully precached at install,
   so the app always opens instantly and offline (never the browser's offline page). A new version
   arrives because the page calls reg.update() on launch → new sw.js installs the new files →
   takes over → page reloads once. Bump SHELL with every release (same number as js/config.js). */
var SHELL = 'habits-shell-v5.17', ASSETS = 'habits-assets';
var FILES = ['./', 'index.html', 'css/app.css', 'js/config.js', 'js/store.js', 'js/sync.js', 'js/demo.js', 'js/stats.js', 'js/prayer.js', 'js/hifz.js', 'js/app.js', 'dashboard.html',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) {
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== SHELL && k !== ASSETS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // Google APIs go straight to network
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith(caches.open(SHELL).then(function (c) {
    var key = req.mode === 'navigate' ? (/dashboard\.html$/.test(url.pathname) ? 'dashboard.html' : 'index.html') : req;
    return c.match(key, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (r) { if (r.ok && req.mode !== 'navigate') c.put(req, r.clone()); return r; })
        .catch(function () { return c.match('index.html'); });
    });
  }));
});
