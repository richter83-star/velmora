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

/** Fetch /art/manifest.json once (non-blocking; failure keeps the empty default
 *  so every portrait falls back to legacy SVG). `fetchFn` is injectable for tests. */
export async function loadArtManifest(fetchFn) {
  const f = fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!f) return MANIFEST;
  try {
    const res = await f('/art/manifest.json', { cache: 'no-cache' });
    if (res && res.ok) setArtManifest(await res.json());
  } catch {
    /* offline / missing → keep empty; legacy fallback everywhere */
  }
  return MANIFEST;
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
