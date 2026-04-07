// IMPARABLE 2026 – Service Worker
// Versión del caché — cambia este número para forzar actualización
const CACHE_VERSION = 'imparable-v1';

const STATIC_ASSETS = [
  './imparable2026.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap'
];

// ── INSTALL: guarda archivos en caché ──────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Si falla algún recurso externo (fuentes), continúa igual
        return cache.add('./imparable2026.html');
      });
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpia cachés viejos ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: sirve desde caché, actualiza en background ──────────
self.addEventListener('fetch', (event) => {
  // Solo intercepta GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          // Guarda respuesta válida en caché
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // Si no hay red, usa caché

      // Sirve caché inmediatamente si existe, si no espera la red
      return cached || networkFetch;
    })
  );
});
