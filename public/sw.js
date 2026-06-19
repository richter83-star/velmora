/* ============================================================
   Velmora — Service Worker
   Strategy:
     - App shell (HTML, manifest, icons) is precached on install
       so the game launches and plays fully offline after first load.
     - Google Fonts are runtime-cached (cache-first) because their
       binary URLs aren't known ahead of time and are cross-origin.
     - Navigations fall back to the cached shell when offline.
   Bump SHELL_VERSION whenever index.html or the icons change; the
   activate step prunes every older Velmora cache automatically.
   ============================================================ */

const SHELL_VERSION = "v1.0.0";
const SHELL_CACHE = "velmora-shell-" + SHELL_VERSION;
const FONT_CACHE  = "velmora-fonts-" + SHELL_VERSION;

/* Everything needed to boot the game with no network. */
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/favicon-64.png"
];

/* ---- install: precache the shell ---- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) =>
        // {cache:"reload"} bypasses the HTTP cache so we store fresh copies.
        Promise.all(
          SHELL_ASSETS.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

/* ---- activate: drop stale Velmora caches, take control ---- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("velmora-") && k !== SHELL_CACHE && k !== FONT_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---- helpers ---- */
function isFontRequest(url) {
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}

/* ---- fetch: route by request type ---- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only deal with GETs; let the browser handle everything else.
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // 1) Google Fonts → cache-first runtime cache (works offline after first view).
  if (isFontRequest(url)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((hit) => {
          if (hit) return hit;
          return fetch(req)
            .then((res) => {
              // Store opaque/cross-origin font responses too.
              if (res && (res.ok || res.type === "opaque")) {
                cache.put(req, res.clone()).catch(() => {});
              }
              return res;
            })
            .catch(() => hit); // offline + never fetched → undefined; system fonts cover it.
        })
      )
    );
    return;
  }

  // 2) Same-origin navigations → cache-first on the shell, network refresh,
  //    offline fallback to the cached index.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => {
        const network = fetch(req)
          .then((res) => {
            caches.open(SHELL_CACHE).then((c) => c.put("./index.html", res.clone()).catch(() => {}));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 3) Other same-origin GETs (icons, manifest) → cache-first, fill on miss.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req)
          .then((res) => {
            if (res && res.ok) {
              caches.open(SHELL_CACHE).then((c) => c.put(req, res.clone()).catch(() => {}));
            }
            return res;
          })
          .catch(() => hit);
      })
    );
  }
  // Anything else (other cross-origin) falls through to the network by default.
});
