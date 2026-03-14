const CACHE_NAME = 'my-daily-budget-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([
        '/',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        '/favicon.png',
      ]);
      const htmlResponse = await fetch('/');
      const html = await htmlResponse.text();
      const assetUrls = [];
      const scriptMatches = html.matchAll(/<script[^>]+src="([^"]+)"/g);
      for (const m of scriptMatches) assetUrls.push(m[1]);
      const linkMatches = html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g);
      for (const m of linkMatches) assetUrls.push(m[1]);
      if (assetUrls.length > 0) {
        await cache.addAll(assetUrls);
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;

  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/) || url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
  }
});
