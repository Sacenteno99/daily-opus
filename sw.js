// Daily Opus service worker: network first (so updates arrive), cache as offline fallback.
const CACHE = "daily-opus-20261029131211";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "index.html", "manifest.webmanifest", "icon-192.png", "vendor/astronomy.browser.min.js"]).catch(() => {}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith("version.json")) return; // always live
  const isCard = url.pathname.includes("/cards/");
  if (isCard) { e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; }))); return; }
  e.respondWith(fetch(req).then(res => { if (res.ok && (url.origin === location.origin || /jsdelivr|gstatic|googleapis/.test(url.host))) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
});
