/**
 * Portrait resolver (Overhaul P1) — the single seam every character portrait
 * flows through. It decides WHICH portrait to show, never WHETHER one loaded:
 * if the art manifest has a drawn portrait for this character + mood it returns a
 * <picture>; otherwise (no art yet, manifest not loaded, or offline) it returns
 * the injected legacy buildAvatar() SVG. So with zero art the game is visually
 * unchanged and 100% offline, and when packs land (P2) the same call sites light
 * up with real cartoon art — no engine change. Pure + synchronous (reads a
 * module-cached manifest); never consumes the seeded RNG, so determinism holds.
 */

let MANIFEST = { art: {}, voice: {} };

/** Replace the in-memory manifest (called once after the JSON loads). */
export function setArtManifest(m) {
  if (m && typeof m === 'object') {
    MANIFEST = { art: m.art || {}, voice: m.voice || {} };
  }
  return MANIFEST;
}

/** True when the manifest has a drawn portrait for this character id. Lets a caller
 *  choose art-or-emoji (e.g. advisors keep their characterful emoji until arted)
 *  instead of the default art-or-SVG fallback. Pure; reads the module-cached manifest. */
export function hasArt(id) {
  return !!(id != null && MANIFEST.art[String(id)]);
}

/** Fetch /art/manifest.json once (non-blocking; failure keeps the empty default
 *  so every portrait falls back to legacy SVG). `fetchFn` is injectable for tests. */
export async function loadArtManifest(fetchFn) {
  const injected = !!fetchFn;
  const f = fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!f) return MANIFEST;
  try {
    const res = await f('/art/manifest.json', { cache: 'no-cache' });
    if (res && res.ok) setArtManifest(await res.json());
  } catch {
    /* offline / missing → keep empty; legacy fallback everywhere */
  }
  // Warm the SW runtime cache with the drawn assets while online. The manifest is
  // precached (so the resolver emits <picture> even offline) — the art behind it must
  // therefore be cached too, or a later offline render would 404 (CSP forbids an inline
  // onerror fallback). Best-effort, real-runtime only (skipped when fetch is injected by
  // tests). NOTE (P5): when the full cast lands, move to per-path prefetch, not all-art.
  if (!injected && typeof fetch === 'function') prefetchArt();
  return MANIFEST;
}

/** Fire-and-forget fetch of every art file the manifest references (avif + webp),
 *  populating the service-worker /art/ runtime cache. Failures are swallowed. */
function prefetchArt() {
  try {
    const urls = new Set();
    for (const key of Object.keys(MANIFEST.art)) {
      const entry = MANIFEST.art[key] || {};
      for (const p of Object.values(entry.expr || {})) urls.add('/art/' + p);
      for (const p of Object.values(entry.webp || {})) urls.add('/art/' + p);
    }
    urls.forEach((u) => {
      fetch(u).catch(() => {});
    });
  } catch {
    /* ignore */
  }
}

/** A stable character key from a descriptor (a randAvatar 7-field object, an
 *  object with an explicit id, or a primitive). Deterministic — no rng. */
export function charKey(descriptor) {
  if (descriptor && typeof descriptor === 'object') {
    if (descriptor.id != null) return String(descriptor.id);
    return `p:${descriptor.side ?? ''}.${descriptor.hair ?? ''}.${descriptor.acc ?? ''}.${descriptor.suit ?? ''}.${descriptor.skin ?? ''}`;
  }
  return String(descriptor ?? 'unknown');
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Resolve a portrait to an HTML string.
 * @param {*} descriptor    the character (randAvatar object or {id})
 * @param {string} mood     expression key (happy|smug|neutral|worried|angry)
 * @param {{sweat?:boolean, alt?:string, fallback:Function}} opts
 *        fallback(descriptor, mood, sweat) -> legacy SVG string (required)
 * @returns {string} a <picture> when drawn art exists, else the legacy SVG.
 */
export function avatarHtml(descriptor, mood = 'neutral', opts = {}) {
  const entry = MANIFEST.art[charKey(descriptor)];
  const avif = entry && entry.expr && (entry.expr[mood] || entry.expr.neutral);
  if (avif) {
    const alt = ` alt="${escAttr(opts.alt || '')}"`;
    const webp = entry.webp && (entry.webp[mood] || entry.webp.neutral);
    const source = webp ? `<source srcset="/art/${escAttr(webp)}" type="image/webp">` : '';
    return `<picture class="portrait">${source}<img src="/art/${escAttr(avif)}" loading="lazy" decoding="async"${alt}></picture>`;
  }
  // No drawn art → guaranteed legacy-SVG fallback (offline-safe, never blocks).
  return typeof opts.fallback === 'function' ? opts.fallback(descriptor, mood, !!opts.sweat) : '';
}
