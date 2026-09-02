const CACHE = 'ayo-bangun-v1.0.0';
const ASSETS = [
  './','./index.html','./styles.css','./manifest.webmanifest',
  './js/app.js','./js/catalog.js','./js/store.js','./js/firebase.js',
  './assets/logo-ayo-bangun.jpeg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const clone=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,clone)); return r; }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
