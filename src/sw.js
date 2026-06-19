/* ============================================================
   Velmora — Service Worker (vite-plugin-pwa, injectManifest mode)

   The precache list of hashed build assets is injected at build time,
   replacing `self.__WB_MANIFEST`. We keep the prototype's proven strategy:
     - precache the app shell (now including hashed JS/CSS) so the game
       launches and plays fully offline after the first load,
     - runtime-cache Google Fonts (cache-first), and
     - fall navigations back to the cached shell when offline.
   Cache names are unversioned; vite-plugin-pwa revisions assets by content
   hash, so stale entries are replaced automatically (no manual SHELL_VERSION).
   ============================================================ */

const SHELL_CACHE = 'velmora-shell';
const FONT_CACHE = 'velmora-fonts';

// Injected at build time: [{ url, revision }, ...] for every hashed asset.
const PRECACHE = (self.__WB_MANIFEST || []).map((e) => (typeof e === 'string' ? e : e.url));
const SHELL_ASSETS = Array.from(new Set(['./', './index.html', ...PRECACHE]));

/* ---- install: precache the shell ---- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        // {cache:'reload'} bypasses the HTTP cache so we store fresh copies.
        Promise.all(
          SHELL_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

/* ---- activate: drop stale Velmora caches, take control ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('velmora-') && k !== SHELL_CACHE && k !== FONT_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isFontRequest(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
}

/* ---- fetch: route by request type ---- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // 1) Google Fonts → cache-first runtime cache (works offline after first view).
  if (isFontRequest(url)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req, { ignoreVary: true }).then(
          (hit) =>
            hit ||
            fetch(req)
              .then((res) => {
                if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
                return res;
              })
              .catch(() => hit),
        ),
      ),
    );
    return;
  }

  // 2) Same-origin navigations → cached shell first, refresh in background.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html', { ignoreVary: true }).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            caches.open(SHELL_CACHE).then((c) => c.put('./index.html', res.clone()).catch(() => {}));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // 3) Other same-origin GETs (hashed assets, icons, manifest) → cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreVary: true }).then(
        (hit) =>
          hit ||
          fetch(req)
            .then((res) => {
              if (res && res.ok) caches.open(SHELL_CACHE).then((c) => c.put(req, res.clone()).catch(() => {}));
              return res;
            })
            .catch(() => hit),
      ),
    );
  }
});
