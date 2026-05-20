/**
 * PennyFlow PRO — Service Worker v2
 * Strategy: Cache-First for app shell, Network-First for CDN assets.
 * Bump CACHE_VERSION to force-refresh all clients on next deploy.
 */

const CACHE_VERSION = 'pf-v2';
const APP_SHELL     = `pf-shell-${CACHE_VERSION}`;
const CDN_CACHE     = `pf-cdn-${CACHE_VERSION}`;

/* Files that make up the offline app shell (same origin) */
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* CDN origins to cache after first fetch */
const CDN_ORIGINS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ── Install: pre-cache the app shell ── */
self.addEventListener('install', event => {
  console.log('[SW] Installing…');
  event.waitUntil(
    caches.open(APP_SHELL)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => {
        console.log('[SW] App shell cached');
        return self.skipWaiting();
      })
      .catch(err => console.warn('[SW] Pre-cache failed:', err))
  );
});

/* ── Activate: delete stale caches ── */
self.addEventListener('activate', event => {
  console.log('[SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_SHELL && k !== CDN_CACHE)
          .map(k => {
            console.log('[SW] Deleting stale cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      console.log('[SW] Activated, claiming clients');
      return self.clients.claim();
    })
  );
});

/* ── Fetch: routing logic ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Only handle GET */
  if (request.method !== 'GET') return;

  /* Skip chrome-extension and non-http(s) */
  if (!url.protocol.startsWith('http')) return;

  /* CDN resources: cache-first */
  if (CDN_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(cdnCacheFirst(request));
    return;
  }

  /* Same-origin app shell: cache-first */
  if (url.origin === self.location.origin) {
    event.respondWith(shellCacheFirst(request));
    return;
  }
});

/* Cache-first for app shell files */
async function shellCacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(APP_SHELL);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /* Offline fallback: return main page */
    const fallback = await caches.match('./index.html');
    return fallback || new Response('Offline — please open the app when connected.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/* Cache-first for CDN assets (fonts, Chart.js) */
async function cdnCacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CDN_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    /* Return stale CDN cache if network fails */
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

/* ── Background Sync (placeholder for future server sync) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] Background sync triggered — future: POST to backend');
  }
});

/* ── Push Notifications (placeholder) ── */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title   = data.title || 'PennyFlow PRO';
  const options = {
    body:  data.body  || 'You have a new notification.',
    icon:  './icons/icon-192.png',
    badge: './icons/icon-72.png',
    tag:   'pennyflow-notification',
    renotify: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* ── Notification click: focus / open app ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        if (clientList.length > 0) return clientList[0].focus();
        return clients.openWindow('./index.html');
      })
  );
});
