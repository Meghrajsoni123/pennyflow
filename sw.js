/**
 * PennyFlow PRO — Service Worker
 * Strategy: Cache-First for app shell, Network-First for CDN assets.
 * Bump CACHE_VERSION to force-refresh all clients on next deploy.
 */

const CACHE_VERSION  = 'pf-v1';
const APP_SHELL      = 'pf-shell-v1';
const CDN_CACHE      = 'pf-cdn-v1';

/* Files that make up the offline app shell (served from same origin) */
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* CDN resources we want to cache after first fetch */
const CDN_ORIGINS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ── Install: pre-cache the app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

/* ── Activate: delete old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== APP_SHELL && k !== CDN_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // take control of all pages now
  );
});

/* ── Fetch: routing logic ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // ── CDN resources: cache-first, fall back to network ──
  if (CDN_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(cdnCacheFirst(request));
    return;
  }

  // ── App shell & local assets: cache-first, fall back to network ──
  if (url.origin === self.location.origin) {
    event.respondWith(shellCacheFirst(request));
    return;
  }
});

/* Cache-first helper for app shell */
async function shellCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_SHELL);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not in cache — return fallback page if available
    return caches.match('./index.html');
  }
}

/* Cache-first helper for CDN resources (fonts, chart.js) */
async function cdnCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CDN_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return cached version if network fails
    return cached || Response.error();
  }
}

/* ── Background Sync placeholder (future: sync with server) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    // Future: POST cached transactions to a backend
    console.log('[SW] Background sync triggered');
  }
});

/* ── Push notification placeholder ── */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PennyFlow';
  const options = {
    body:  data.body  || 'You have a new notification.',
    icon:  './icons/icon-192.png',
    badge: './icons/icon-72.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
